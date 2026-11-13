begin;
create or replace function public.hunt_abandon()
returns jsonb language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();
begin
 if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 perform 1 from public.journeys where owner_id=player for update;
 if not found then raise exception 'Jornada não encontrada.'; end if;
 delete from oakchess_server.online_hunts where owner_id=player and finished_at is null;
 return oakchess_server.hunt_view(player);
end $$;
revoke all on function public.hunt_abandon() from public,anon,authenticated;
grant execute on function public.hunt_abandon() to authenticated;
notify pgrst,'reload schema';
commit;
