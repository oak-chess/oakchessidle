-- After 005. Grant/revoke a badge only through trusted administration.
begin;
create table public.player_verifications (
 player_id uuid primary key references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.player_verifications enable row level security;
revoke all on public.player_verifications from public, anon, authenticated;
create function public.get_chat_verification()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.player_verifications where player_id=auth.uid());
$$;
-- Preserve the existing contacts RPC; the new RPC adds trusted badge status.
create function public.get_verified_player_contacts()
returns table(id uuid, username text, verified boolean)
language sql stable security definer set search_path='' as $$
 select p.id,p.username,v.player_id is not null
 from public.player_contacts c join public.profiles p on p.id=c.contact_id
 left join public.player_verifications v on v.player_id=p.id
 where c.owner_id=auth.uid() order by lower(p.username),p.id;
$$;
revoke all on function public.get_chat_verification(),public.get_verified_player_contacts() from public,anon,authenticated;
grant execute on function public.get_chat_verification(),public.get_verified_player_contacts() to authenticated;
commit;
