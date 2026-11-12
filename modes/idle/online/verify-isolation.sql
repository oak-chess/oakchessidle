-- Run in the test project's SQL Editor after creating two test journeys.
-- Uses the two oldest journeys and rolls back the session role and claims.
begin;

select set_config('oakchess.test_players', coalesce((
  select jsonb_agg(owner_id order by owner_id)::text
  from (
    select j.owner_id
    from public.journeys j
    join public.profiles p on p.id = j.owner_id
    order by p.created_at, j.owner_id
    limit 2
  ) players
), '[]'), true);

set local role authenticated;

do $$
declare
  players jsonb := current_setting('oakchess.test_players')::jsonb;
  player uuid;
begin
  if jsonb_array_length(players) <> 2 then
    raise exception 'Create two test journeys before running this check';
  end if;

  for player in select value::uuid from jsonb_array_elements_text(players)
  loop
    perform set_config('request.jwt.claim.sub', player::text, true);
    perform set_config('request.jwt.claims', jsonb_build_object('sub', player, 'role', 'authenticated')::text, true);

    if (select count(*) from public.profiles) <> 1
       or not exists (select 1 from public.profiles where id = player)
       or (select count(*) from public.journeys) <> 1
       or not exists (select 1 from public.journeys where owner_id = player)
       or not exists (select 1 from public.inventory where owner_id = player)
       or exists (select 1 from public.inventory where owner_id <> player) then
      raise exception 'Player data isolation check failed';
    end if;
  end loop;

  if exists (
    select 1
    from (values ('public.profiles'), ('public.journeys'), ('public.inventory')) as tables(name)
    where has_table_privilege('authenticated', name, 'INSERT,UPDATE,DELETE')
       or has_any_column_privilege('authenticated', name, 'INSERT,UPDATE')
  ) then
    raise exception 'Players have direct write permissions';
  end if;
end;
$$;

rollback;
select 'Player data isolation checks passed' as result;
