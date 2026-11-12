begin;

-- Canonical attributes are written by trusted game services only, never by clients.
alter table public.inventory add column combat_data jsonb not null default '{}'::jsonb
  check(jsonb_typeof(combat_data)='object');
create table oakchess_server.arena_matches (
 id uuid primary key default gen_random_uuid(),
 player_id uuid not null references public.journeys(owner_id),
 opponent_id uuid not null references public.journeys(owner_id),
 offer_id uuid not null unique,
 seed integer not null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 finished_at timestamptz,
 result jsonb,
 check(player_id<>opponent_id),
 check((finished_at is null)=(result is null))
);
create index arena_matches_owner on oakchess_server.arena_matches(player_id,created_at desc);
alter table oakchess_server.arena_matches enable row level security;
revoke all on oakchess_server.arena_matches from public,anon,authenticated;

create or replace function oakchess_server.arena_saved_roster(p_player uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when count(*)=6 then jsonb_agg(jsonb_build_object(
 'id',i.id,'pokemon_id',i.pokemon_id,'level',i.level,'stars',i.stars,'combat_data',i.combat_data)
 order by members.position) else '[]'::jsonb end
 from oakchess_server.arena_defenses d
 cross join lateral unnest(d.inventory_ids) with ordinality members(id,position)
 join public.inventory i on i.id=members.id and i.owner_id=p_player and not i.is_listed
 where d.player_id=p_player;
$$;

-- Service-role only. The Edge Function obtains p_player from a verified JWT.
create function public.arena_prepare_match(p_player uuid,p_offer uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare offer oakchess_server.arena_offers%rowtype; m oakchess_server.arena_matches%rowtype;
 mine jsonb; enemy jsonb; ids uuid[]; online_level integer;
begin
 select trainer_level into online_level from public.journeys where owner_id=p_player for update;
 if not found or online_level<200 then raise exception 'A Arena requer treinador no nível 200.'; end if;
 select * into m from oakchess_server.arena_matches where player_id=p_player and offer_id=p_offer;
 if found then return to_jsonb(m); end if;
 if exists(select 1 from oakchess_server.arena_matches where player_id=p_player and created_at>now()-interval '30 seconds')
 then raise exception 'Aguarde 30 segundos entre desafios.'; end if;
 select * into offer from oakchess_server.arena_offers where player_id=p_player and id=p_offer and expires_at>now() for update;
 if not found then raise exception 'A busca expirou. Busque um adversário novamente.'; end if;
 if not exists(select 1 from public.journeys where owner_id=offer.opponent_id and trainer_level>=200)
 then raise exception 'O adversário não está elegível.'; end if;
 select array_agg(member) into ids from oakchess_server.arena_defenses d
 cross join lateral unnest(d.inventory_ids) member where d.player_id in (p_player,offer.opponent_id);
 perform 1 from public.inventory where id=any(ids) order by id for update;
 mine:=oakchess_server.arena_saved_roster(p_player);enemy:=oakchess_server.arena_saved_roster(offer.opponent_id);
 if jsonb_array_length(mine)<>6 or jsonb_array_length(enemy)<>6 then raise exception 'As equipes precisam de seis Pokémon disponíveis.'; end if;
 -- Freeze the displayed defense: do not silently fight a changed team.
 if enemy<>offer.defender_roster or mine<>offer.attacker_roster then raise exception 'Uma equipe mudou. Busque novamente.'; end if;
 insert into oakchess_server.arena_matches(player_id,opponent_id,offer_id,seed,snapshot)
 values(p_player,offer.opponent_id,p_offer,(floor(random()*2147483647))::integer,
 jsonb_build_object('allies',mine,'enemies',enemy)) returning * into m;
 return to_jsonb(m);
end;$$;

create function public.arena_settle_match(p_player uuid,p_match uuid,p_result jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m oakchess_server.arena_matches%rowtype; outcome integer; duration bigint; previous_points bigint; current_points bigint; month_id date;
begin
 -- Same global lock order as monthly close before touching the journey.
 perform pg_catalog.pg_advisory_xact_lock(781423910);
 perform 1 from public.journeys where owner_id=p_player for update;
 select * into m from oakchess_server.arena_matches where id=p_match and player_id=p_player for update;
 if not found then raise exception 'Partida não encontrada.'; end if;
 if m.finished_at is not null then return m.result; end if;
 if p_result is null or jsonb_typeof(p_result)<>'object' or octet_length(p_result::text)>1500000
 then raise exception 'Resultado inválido.'; end if;
 outcome:=(p_result->>'winner')::integer;duration:=(p_result->>'elapsedMs')::bigint;
 if outcome is null or outcome not in (-1,0,1) or duration is null or duration not between 1 and 82000
 or jsonb_typeof(p_result->'frames') is distinct from 'array' or coalesce(length(p_result->>'rulesVersion'),0)<>16
 then raise exception 'Resultado inválido.'; end if;
 month_id:=date_trunc('month',now() at time zone 'America/Sao_Paulo')::date;
 select coalesce((select points from oakchess_server.ranking_standings where season_id=month_id and mode='arena' and player_id=p_player),0) into previous_points;
 -- A timeout does not award a win. The game presents it explicitly as a draw.
 if outcome<>-1 then perform oakchess_server.record_ranking_result('arena',m.id,p_player,outcome=0,0,duration); end if;
 select coalesce((select points from oakchess_server.ranking_standings where season_id=month_id and mode='arena' and player_id=p_player),0) into current_points;
 p_result:=p_result||jsonb_build_object('matchId',m.id,'opponentId',m.opponent_id,
 'snapshot',m.snapshot,'settledAt',clock_timestamp(),'delta',current_points-previous_points);
 update oakchess_server.arena_matches set finished_at=clock_timestamp(),result=p_result where id=m.id;
 return p_result;
end;$$;

create function public.arena_history()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'opponent',h.username,'at',h.finished_at,
 'winner',h.result->'winner','delta',h.result->'delta') order by h.finished_at desc)
 from(select m.*,p.username from oakchess_server.arena_matches m join public.profiles p on p.id=m.opponent_id
 where m.player_id=auth.uid() and m.finished_at is not null order by m.finished_at desc limit 20)h),'[]'::jsonb);
end;$$;
revoke all on function public.arena_prepare_match(uuid,uuid),public.arena_settle_match(uuid,uuid,jsonb),public.arena_history() from public,anon,authenticated;
grant execute on function public.arena_prepare_match(uuid,uuid),public.arena_settle_match(uuid,uuid,jsonb) to service_role;
grant execute on function public.arena_history() to authenticated;
notify pgrst,'reload schema';
commit;
