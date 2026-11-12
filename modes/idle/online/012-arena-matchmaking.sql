begin;

create table oakchess_server.arena_defenses (
  player_id uuid primary key references public.journeys(owner_id) on delete cascade,
  inventory_ids uuid[] not null check (cardinality(inventory_ids)=6),
  portrait text not null default 'art-red' check (portrait ~ '^[a-z0-9-]{1,64}$'),
  updated_at timestamptz not null default now()
);
create table oakchess_server.arena_offers (
  player_id uuid primary key references public.journeys(owner_id) on delete cascade,
  id uuid not null unique default gen_random_uuid(),
  opponent_id uuid not null references public.journeys(owner_id),
  attacker_roster jsonb not null,
  defender_roster jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (player_id<>opponent_id)
);
alter table oakchess_server.arena_defenses enable row level security;
alter table oakchess_server.arena_offers enable row level security;
revoke all on oakchess_server.arena_defenses,oakchess_server.arena_offers from public,anon,authenticated;

create function oakchess_server.arena_saved_roster(p_player uuid)
returns jsonb language sql stable security definer set search_path='' as $$
  select case when count(*)=6 then jsonb_agg(
    jsonb_build_object('id',i.id,'pokemon_id',i.pokemon_id,'level',i.level,'stars',i.stars)
    order by members.position) else '[]'::jsonb end
  from oakchess_server.arena_defenses d
  cross join lateral unnest(d.inventory_ids) with ordinality members(id,position)
  join public.inventory i on i.id=members.id and i.owner_id=d.player_id and not i.is_listed
  where d.player_id=p_player;
$$;
revoke all on function oakchess_server.arena_saved_roster(uuid) from public,anon,authenticated;

create function public.arena_status()
returns jsonb language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); result jsonb; month_id date;
begin
  if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
  month_id:=date_trunc('month',now() at time zone 'America/Sao_Paulo')::date;
  select jsonb_build_object('trainerLevel',j.trainer_level,'minimumLevel',200,
    'points',coalesce(r.points,0),'wins',coalesce(r.wins,0),
    'losses',coalesce(r.losses,0),'defense',oakchess_server.arena_saved_roster(player),
    'available',coalesce((
      select jsonb_agg(jsonb_build_object('id',i.id,'pokemon_id',i.pokemon_id,
        'level',i.level,'stars',i.stars) order by i.pokemon_id,i.id)
      from public.inventory i where i.owner_id=player and not i.is_listed
    ),'[]'::jsonb))
    into result from public.journeys j
    left join oakchess_server.ranking_standings r
      on r.player_id=j.owner_id and r.mode='arena' and r.season_id=month_id
    where j.owner_id=player;
  if result is null then raise exception 'Conclua seu cadastro.'; end if;
  return result;
end;
$$;

create function public.arena_save_defense(p_inventory_ids uuid[],p_portrait text default 'art-red')
returns jsonb language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); eligible integer;
begin
  if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
  if cardinality(p_inventory_ids)<>6 or p_inventory_ids is null
    or (select count(distinct id) from unnest(p_inventory_ids) id)<>6 then
    raise exception 'Escolha seis Pokémon diferentes.'; end if;
  if p_portrait is null or p_portrait !~ '^[a-z0-9-]{1,64}$' then
    raise exception 'Retrato inválido.'; end if;
  perform 1 from public.journeys where owner_id=player for update;
  if not found then raise exception 'Conclua seu cadastro.'; end if;
  if (select trainer_level from public.journeys where owner_id=player)<200 then
    raise exception 'A Arena requer treinador no nível 200.';
  end if;
  -- Lock inventory entries to serialize against marketplace listing/transfers.
  perform 1 from public.inventory where id=any(p_inventory_ids) order by id for update;
  select count(*) into eligible from public.inventory
    where id=any(p_inventory_ids) and owner_id=player and not is_listed;
  if eligible<>6 then raise exception 'Um dos Pokémon saiu do inventário ou está anunciado no mercado.'; end if;
  insert into oakchess_server.arena_defenses(player_id,inventory_ids,portrait)
    values(player,p_inventory_ids,p_portrait)
    on conflict(player_id) do update set inventory_ids=excluded.inventory_ids,
      portrait=excluded.portrait,updated_at=now();
  delete from oakchess_server.arena_offers where player_id=player;
  return public.arena_status();
end;
$$;

create function public.arena_find_opponent()
returns jsonb language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); mine jsonb; enemy record; offer oakchess_server.arena_offers%rowtype;
  month_id date; my_points bigint;
begin
  if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
  perform 1 from public.journeys where owner_id=player for update;
  if not found then raise exception 'Conclua seu cadastro.'; end if;
  if (select trainer_level from public.journeys where owner_id=player)<200 then
    raise exception 'A Arena requer treinador no nível 200.';
  end if;
  mine:=oakchess_server.arena_saved_roster(player);
  if jsonb_array_length(mine)<>6 then raise exception 'Salve seis Pokémon disponíveis na equipe de defesa.'; end if;
  month_id:=date_trunc('month',now() at time zone 'America/Sao_Paulo')::date;
  select coalesce((select r.points from oakchess_server.ranking_standings r
    where r.player_id=player and r.mode='arena' and r.season_id=month_id),0) into my_points;

  select * into offer from oakchess_server.arena_offers where player_id=player and expires_at>now();
  if found then
    select p.id,p.username,d.portrait,coalesce(r.points,0) points into enemy
    from public.profiles p join oakchess_server.arena_defenses d on d.player_id=p.id
    left join oakchess_server.ranking_standings r on r.player_id=p.id and r.mode='arena' and r.season_id=month_id
    join public.journeys j on j.owner_id=p.id and j.trainer_level>=200
    where p.id=offer.opponent_id;
    if found and jsonb_array_length(oakchess_server.arena_saved_roster(enemy.id))=6 then
      return jsonb_build_object('opponent',jsonb_build_object('username',enemy.username,
        'portrait',enemy.portrait,'points',enemy.points,'roster',offer.defender_roster),
        'offerId',offer.id,'expiresAt',offer.expires_at);
    end if;
  end if;
  select p.id,p.username,d.portrait,coalesce(r.points,0) points,
    oakchess_server.arena_saved_roster(p.id) roster into enemy
  from oakchess_server.arena_defenses d join public.profiles p on p.id=d.player_id
  join public.journeys j on j.owner_id=p.id and j.trainer_level>=200
  left join oakchess_server.ranking_standings r on r.player_id=p.id and r.mode='arena' and r.season_id=month_id
  where p.id<>player and abs(coalesce(r.points,0)-my_points)<=300
    and jsonb_array_length(oakchess_server.arena_saved_roster(p.id))=6
  order by abs(coalesce(r.points,0)-my_points),d.updated_at,p.id limit 1;
  if not found then return jsonb_build_object('opponent',null); end if;
  insert into oakchess_server.arena_offers(player_id,opponent_id,attacker_roster,defender_roster,expires_at)
    values(player,enemy.id,mine,enemy.roster,now()+interval '2 minutes')
    on conflict(player_id) do update set id=gen_random_uuid(),opponent_id=excluded.opponent_id,
      attacker_roster=excluded.attacker_roster,defender_roster=excluded.defender_roster,
      created_at=now(),expires_at=excluded.expires_at returning * into offer;
  return jsonb_build_object('opponent',jsonb_build_object('username',enemy.username,
    'portrait',enemy.portrait,'points',enemy.points,'roster',enemy.roster),
    'offerId',offer.id,'expiresAt',offer.expires_at);
end;
$$;
revoke all on function public.arena_status(),public.arena_save_defense(uuid[],text),public.arena_find_opponent()
  from public,anon,authenticated;
grant execute on function public.arena_status(),public.arena_save_defense(uuid[],text),public.arena_find_opponent()
  to authenticated;

commit;
