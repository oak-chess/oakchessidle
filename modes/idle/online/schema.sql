begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);
create unique index profiles_username_unique on public.profiles (lower(username));

create table public.journeys (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  gold bigint not null default 20 check (gold between 0 and 9007199254740991),
  trainer_level integer not null default 1 check (trainer_level >= 1),
  trainer_xp bigint not null default 0 check (trainer_xp >= 0)
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.journeys(owner_id) on delete cascade,
  pokemon_id integer not null check (pokemon_id > 0),
  level integer not null default 1 check (level >= 1),
  stars smallint not null default 1 check (stars between 1 and 3),
  is_listed boolean not null default false
);
create index inventory_owner on public.inventory (owner_id);

alter table public.profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.inventory enable row level security;

revoke all on public.profiles, public.journeys, public.inventory from public, anon, authenticated;
grant select on public.profiles, public.journeys, public.inventory to authenticated;
create policy own_profile on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy own_journey on public.journeys for select to authenticated using ((select auth.uid()) = owner_id);
create policy own_inventory on public.inventory for select to authenticated using ((select auth.uid()) = owner_id);

-- Account creation can be retried safely, including from another tab.
create function public.initialize_journey(requested_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  player uuid := auth.uid();
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  -- Serialize initialization for this account before checking its existing profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(player::text, 0));
  if exists (select 1 from public.journeys where owner_id = player) then
    return;
  end if;

  insert into public.profiles (id, username) values (player, trim(requested_username));
  insert into public.journeys (owner_id) values (player);
  insert into public.inventory (owner_id, pokemon_id) values (player, 1);
end;
$$;
revoke all on function public.initialize_journey(text) from public, anon, authenticated;
grant execute on function public.initialize_journey(text) to authenticated;

commit;
