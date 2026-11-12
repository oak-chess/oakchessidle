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
alter table oakchess_server.ranking_seasons enable row level security;
alter table oakchess_server.ranking_results enable row level security;
alter table oakchess_server.ranking_standings enable row level security;
alter table oakchess_server.ranking_awards enable row level security;
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
