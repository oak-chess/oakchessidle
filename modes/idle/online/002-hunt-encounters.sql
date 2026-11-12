begin;

create schema oakchess_server;
revoke all on schema oakchess_server from public, anon, authenticated;

-- A trusted battle worker will use this table through a server-side database
-- connection. Keep it out of the schemas exposed by the Supabase Data API.
create table oakchess_server.hunt_encounters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.journeys(owner_id) on delete cascade,
  request_id uuid not null,
  hunt_key text not null check (length(hunt_key) between 1 and 100),
  battle_snapshot jsonb not null check (jsonb_typeof(battle_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  result jsonb,
  unique (owner_id, request_id),
  check (
    (finished_at is null and result is null)
    or (
      finished_at is not null and finished_at >= created_at
      and result is not null and jsonb_typeof(result) = 'object'
    )
  )
);

-- Concurrent starts cannot create two unfinished encounters for one player.
create unique index hunt_encounters_one_open_per_player
  on oakchess_server.hunt_encounters (owner_id)
  where finished_at is null;

alter table oakchess_server.hunt_encounters enable row level security;
revoke all on oakchess_server.hunt_encounters from public, anon, authenticated;

commit;
