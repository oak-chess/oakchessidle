begin;
create table public.player_contacts (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, contact_id),
  check (owner_id <> contact_id)
);
alter table public.player_contacts enable row level security;
revoke all on public.player_contacts from public, anon, authenticated;

create function public.add_player_contact(requested_username text)
returns void language plpgsql security definer set search_path = '' as $$
declare player uuid := auth.uid(); target uuid;
begin
  if player is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if requested_username is null or requested_username !~ '^[A-Za-z0-9_]{3,24}$' then
    raise exception 'Invalid trainer name' using errcode = '22023';
  end if;
  select id into target from public.profiles where lower(username) = lower(requested_username);
  if target is null or target = player then raise exception 'Trainer unavailable'; end if;
  insert into public.player_contacts(owner_id,contact_id) values(player,target)
  on conflict do nothing;
end;
$$;
create function public.get_player_contacts()
returns table(id uuid, username text)
language sql stable security definer set search_path = '' as $$
  select p.id,p.username from public.player_contacts c
  join public.profiles p on p.id=c.contact_id
  where c.owner_id=auth.uid() order by lower(p.username),p.id;
$$;
create function public.remove_player_contact(target_id uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.player_contacts where owner_id=auth.uid() and contact_id=target_id;
$$;
revoke all on function public.add_player_contact(text),public.get_player_contacts(),public.remove_player_contact(uuid)
from public,anon,authenticated;
grant execute on function public.add_player_contact(text),public.get_player_contacts(),public.remove_player_contact(uuid)
to authenticated;
commit;
