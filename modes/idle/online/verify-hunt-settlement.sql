-- Run on oakchessidle-test after migrations 002 and 003.
-- Uses existing test accounts and rolls back all encounter and balance changes.
begin;

do $$
declare
  player uuid;
  other_player uuid;
  initial_gold bigint;
  encounter_id uuid;
  first_result jsonb;
  repeated_result jsonb;
begin
  if has_schema_privilege('authenticated', 'oakchess_server', 'USAGE')
     or has_schema_privilege('anon', 'oakchess_server', 'USAGE')
     or has_function_privilege('authenticated', 'oakchess_server.settle_hunt_encounter(uuid,uuid,boolean,bigint)', 'EXECUTE')
     or has_function_privilege('anon', 'oakchess_server.settle_hunt_encounter(uuid,uuid,boolean,bigint)', 'EXECUTE') then
    raise exception 'Settlement is accessible to client roles';
  end if;

  select owner_id, gold into player, initial_gold
  from public.journeys j
  where not exists (
    select 1 from oakchess_server.hunt_encounters e
    where e.owner_id = j.owner_id and e.finished_at is null
  )
  order by owner_id limit 1 for update;

  select owner_id into other_player from public.journeys
  where owner_id <> player order by owner_id limit 1;
  if other_player is null then
    raise exception 'Two test accounts are required, with at least one free of active encounters';
  end if;

  insert into oakchess_server.hunt_encounters (owner_id, request_id, hunt_key, battle_snapshot)
  values (player, gen_random_uuid(), 'settlement-test', '{}')
  returning id into encounter_id;

  begin
    perform oakchess_server.settle_hunt_encounter(other_player, encounter_id, true, 7);
    raise exception 'Encounter settled for the wrong owner';
  exception when no_data_found then
    null;
  end;

  first_result := oakchess_server.settle_hunt_encounter(player, encounter_id, true, 7);
  repeated_result := oakchess_server.settle_hunt_encounter(player, encounter_id, true, 100);
  if first_result is distinct from '{"won":true,"coins":7}'::jsonb
     or repeated_result is distinct from first_result
     or (select gold from public.journeys where owner_id = player) is distinct from initial_gold + 7 then
    raise exception 'Settlement failed or credited more than once';
  end if;
end;
$$;

rollback;
select 'Hunt settlement checks passed' as result;
