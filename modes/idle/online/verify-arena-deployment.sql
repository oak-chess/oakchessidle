-- Read-only verification after 011, 012 and 013. No player progress is changed.
begin;
do $$
begin
  if has_function_privilege('authenticated', 'public.arena_prepare_match(uuid,uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.arena_settle_match(uuid,uuid,jsonb)', 'EXECUTE')
     or has_function_privilege('anon', 'public.arena_history()', 'EXECUTE') then
    raise exception 'Arena privileges invalid';
  end if;
  if not has_function_privilege('service_role', 'public.arena_prepare_match(uuid,uuid)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.arena_settle_match(uuid,uuid,jsonb)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.arena_history()', 'EXECUTE') then
    raise exception 'Arena service permissions missing';
  end if;
end $$;
select 'Arena privileges passed' as result;
rollback;
