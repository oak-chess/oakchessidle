begin;

create table public.player_presence (
  player_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen timestamptz not null
);
create index player_presence_last_seen_idx on public.player_presence(last_seen);
alter table public.player_presence enable row level security;
revoke all on public.player_presence from public, anon, authenticated;

-- Use the authenticated account and the database clock for every heartbeat.
create function public.refresh_player_presence()
returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  observed_at timestamptz := statement_timestamp();
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.player_presence as presence (player_id, last_seen)
  values (player, observed_at)
  on conflict (player_id) do update set last_seen = excluded.last_seen
  where presence.last_seen <= excluded.last_seen - interval '45 seconds';

  return (select count(*) from public.player_presence
          where last_seen > observed_at - interval '3 minutes');
end;
$$;
revoke all on function public.refresh_player_presence() from public, anon, authenticated;
grant execute on function public.refresh_player_presence() to authenticated;

commit;
