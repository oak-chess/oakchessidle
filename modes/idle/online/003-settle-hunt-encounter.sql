begin;

-- Called by the trusted combat server after it computes the outcome.
-- The browser must never receive execution privileges on this function.
create function oakchess_server.settle_hunt_encounter(
  p_owner_id uuid,
  p_encounter_id uuid,
  p_won boolean,
  p_coins bigint
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  encounter oakchess_server.hunt_encounters%rowtype;
  settlement jsonb;
begin
  select * into encounter
  from oakchess_server.hunt_encounters
  where id = p_encounter_id and owner_id = p_owner_id
  for update;

  if not found then
    raise exception 'Encounter not found' using errcode = 'P0002';
  end if;
  if encounter.finished_at is not null then
    return encounter.result;
  end if;
  if p_won is null or p_coins is null or p_coins < 0
     or (not p_won and p_coins <> 0) then
    raise exception 'Invalid encounter reward' using errcode = '22023';
  end if;

  settlement := pg_catalog.jsonb_build_object('won', p_won, 'coins', p_coins);

  if p_coins > 0 then
    update public.journeys
    set gold = gold + p_coins
    where owner_id = p_owner_id;
  end if;

  update oakchess_server.hunt_encounters
  set finished_at = pg_catalog.clock_timestamp(), result = settlement
  where id = p_encounter_id and owner_id = p_owner_id;

  return settlement;
end;
$$;

revoke all on function oakchess_server.settle_hunt_encounter(uuid, uuid, boolean, bigint)
  from public, anon, authenticated;

commit;
