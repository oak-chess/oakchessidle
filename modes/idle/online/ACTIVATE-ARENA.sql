-- 011-monthly-rankings.sql
begin;

-- Requires schema.sql and 002-hunt-encounters.sql.
alter table public.journeys add column diamonds bigint not null default 0
  check (diamonds between 0 and 9007199254740991);

create table oakchess_server.ranking_seasons (
  id date primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  closed_at timestamptz,
  check (ends_at > starts_at)
);
create table oakchess_server.ranking_results (
  mode text not null check (mode in ('arena','tower','rocket','invasion')),
  event_id uuid not null,
  player_id uuid not null references public.journeys(owner_id),
  season_id date not null references oakchess_server.ranking_seasons(id),
  won boolean not null,
  score integer not null check (score between 0 and 100000000),
  elapsed_ms bigint not null check (elapsed_ms between 0 and 604800000),
  settled_at timestamptz not null,
  primary key (mode,event_id,player_id)
);
create table oakchess_server.ranking_standings (
  season_id date not null references oakchess_server.ranking_seasons(id),
  mode text not null,
  player_id uuid not null references public.journeys(owner_id),
  points bigint not null default 0 check (points >= 0),
  wins integer not null default 0,
  losses integer not null default 0,
  best_time_ms bigint not null default 0,
  reached_at timestamptz not null,
  primary key (season_id,mode,player_id)
);
create index ranking_order on oakchess_server.ranking_standings
  (season_id,mode,points desc,wins desc,reached_at,player_id);
create table oakchess_server.ranking_awards (
  season_id date not null,
  mode text not null,
  player_id uuid not null references public.journeys(owner_id),
  position integer not null check (position between 1 and 100),
  diamonds integer not null check (diamonds in (25,50,100)),
  delivered_at timestamptz not null default now(),
  primary key (season_id,mode,player_id)
);
revoke all on oakchess_server.ranking_seasons,oakchess_server.ranking_results,
  oakchess_server.ranking_standings,oakchess_server.ranking_awards from public,anon,authenticated;

-- Shared ordering for the live table, frozen history and reward delivery.
create view oakchess_server.ranked_players as
select s.*, row_number() over (
  partition by season_id,mode
  order by points desc,
    case when mode in ('tower','rocket') then best_time_ms else 0 end,
    wins desc,reached_at,player_id
) as position
from oakchess_server.ranking_standings s;
revoke all on oakchess_server.ranked_players from public,anon,authenticated;

-- Called inside the trusted combat settlement transaction. Never exposed as a
-- browser RPC. score is a verified floor/operation score, never client input.
create function oakchess_server.record_ranking_result(
  p_mode text,p_event uuid,p_player uuid,p_won boolean,
  p_score integer default 0,p_elapsed_ms bigint default 0
) returns void language plpgsql security definer set search_path='' as $$
declare
  at_time timestamptz;
  month_id date;
  old_row oakchess_server.ranking_standings%rowtype;
  new_points bigint;
  new_time bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(781423910);
  at_time := pg_catalog.clock_timestamp();
  month_id := date_trunc('month',at_time at time zone 'America/Sao_Paulo')::date;
  insert into oakchess_server.ranking_seasons(id,starts_at,ends_at)
  values(month_id,month_id::timestamp at time zone 'America/Sao_Paulo',
    (month_id + interval '1 month')::timestamp at time zone 'America/Sao_Paulo')
  on conflict do nothing;

  insert into oakchess_server.ranking_results
    (mode,event_id,player_id,season_id,won,score,elapsed_ms,settled_at)
  values(p_mode,p_event,p_player,month_id,p_won,p_score,p_elapsed_ms,at_time)
  on conflict do nothing;
  if not found then return; end if;

  insert into oakchess_server.ranking_standings(season_id,mode,player_id,reached_at)
  values(month_id,p_mode,p_player,at_time) on conflict do nothing;
  select * into strict old_row from oakchess_server.ranking_standings
    where season_id=month_id and mode=p_mode and player_id=p_player for update;

  if p_mode='arena' then
    new_points := greatest(0,old_row.points + case when p_won then 30 else -15 end);
    new_time := 0;
  elsif p_mode in ('tower','rocket') then
    new_points := greatest(old_row.points,p_score);
    new_time := case
      when p_score>old_row.points then p_elapsed_ms
      when p_score=old_row.points and (old_row.best_time_ms=0 or p_elapsed_ms<old_row.best_time_ms)
        then p_elapsed_ms
      else old_row.best_time_ms end;
  else
    new_points := old_row.points + case when p_won then p_score else 0 end;
    new_time := 0;
  end if;
  update oakchess_server.ranking_standings set
    points=new_points,wins=wins+case when p_won then 1 else 0 end,
    losses=losses+case when p_won then 0 else 1 end,best_time_ms=new_time,
    reached_at=case when new_points<>old_row.points or new_time<>old_row.best_time_ms
      then at_time else old_row.reached_at end
  where season_id=month_id and mode=p_mode and player_id=p_player;
end;
$$;
revoke all on function oakchess_server.record_ranking_result(text,uuid,uuid,boolean,integer,bigint)
  from public,anon,authenticated;

create function oakchess_server.close_ranking_seasons()
returns void language plpgsql security definer set search_path='' as $$
declare season oakchess_server.ranking_seasons%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(781423910);
  for season in select * from oakchess_server.ranking_seasons
    where closed_at is null and ends_at<=pg_catalog.clock_timestamp()
    order by id for update
  loop
    -- Award ledger and account credits commit together. A retry cannot pay twice.
    with new_awards as (
      insert into oakchess_server.ranking_awards(season_id,mode,player_id,position,diamonds)
      select season_id,mode,player_id,position,
        case when position=1 then 100 when position<=10 then 50 else 25 end
      from oakchess_server.ranked_players
      where season_id=season.id and position<=100
      on conflict do nothing returning player_id,diamonds
    ), totals as (
      select player_id,sum(diamonds) amount from new_awards group by player_id
    )
    update public.journeys j set diamonds=j.diamonds+t.amount
    from totals t where j.owner_id=t.player_id;
    update oakchess_server.ranking_seasons set closed_at=pg_catalog.clock_timestamp()
      where id=season.id;
  end loop;
end;
$$;
revoke all on function oakchess_server.close_ranking_seasons() from public,anon,authenticated;

-- Only this service-role endpoint can export the public, non-sensitive snapshot.
-- UUIDs, email addresses, inventories and balances never enter the shared cache.
create function public.export_monthly_rankings()
returns jsonb language plpgsql security definer set search_path='' as $$
declare month_id date; payload jsonb;
begin
  perform oakchess_server.close_ranking_seasons();
  month_id := date_trunc('month',pg_catalog.clock_timestamp() at time zone 'America/Sao_Paulo')::date;
  insert into oakchess_server.ranking_seasons(id,starts_at,ends_at)
  values(month_id,month_id::timestamp at time zone 'America/Sao_Paulo',
    (month_id+interval '1 month')::timestamp at time zone 'America/Sao_Paulo')
  on conflict do nothing;
  select jsonb_build_object('schema',1,'generatedAt',pg_catalog.clock_timestamp(),
    'season',month_id,'endsAt',(month_id+interval '1 month')::timestamp at time zone 'America/Sao_Paulo',
    'rows',coalesce((
      select jsonb_agg(jsonb_build_object(
        'mode',r.mode,'position',r.position,'username',p.username,
        'points',r.points,'wins',r.wins,'losses',r.losses,
        'prize',case when r.position=1 then 100 when r.position<=10 then 50 when r.position<=100 then 25 else 0 end)
        order by r.mode,r.position)
      from oakchess_server.ranked_players r join public.profiles p on p.id=r.player_id
      where r.season_id=month_id
    ),'[]'::jsonb),
    'history',coalesce((
      select jsonb_agg(jsonb_build_object('season',h.id,'closedAt',h.closed_at,
        'winners',coalesce((
          select jsonb_agg(jsonb_build_object('mode',a.mode,'username',p.username,
            'position',a.position,'diamonds',a.diamonds) order by a.mode,a.position)
          from oakchess_server.ranking_awards a join public.profiles p on p.id=a.player_id
          where a.season_id=h.id
        ),'[]'::jsonb)) order by h.id desc)
      from (select id,closed_at from oakchess_server.ranking_seasons
        where closed_at is not null order by id desc limit 12) h
    ),'[]'::jsonb)) into payload;
  return payload;
end;
$$;
revoke all on function public.export_monthly_rankings() from public,anon,authenticated;
grant execute on function public.export_monthly_rankings() to service_role;

commit;

-- 012-arena-matchmaking.sql
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
