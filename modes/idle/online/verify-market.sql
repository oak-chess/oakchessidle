-- Run after 004-market.sql on the test project. All changes roll back.
begin;

do $$
declare
  seller uuid;
  buyer uuid;
  partner uuid;
  offer uuid;
  seller_gold bigint;
  buyer_gold bigint;
begin
  select j.owner_id, i.id, j.gold into seller, partner, seller_gold
  from public.journeys j join public.inventory i on i.owner_id = j.owner_id
  where not i.is_listed and j.gold < 9007199254740991
    and not exists (select 1 from oakchess_server.hunt_encounters e
                    where e.owner_id = j.owner_id and e.finished_at is null)
  order by j.owner_id, i.id limit 1;
  select owner_id, gold into buyer, buyer_gold from public.journeys
  where owner_id <> seller and gold >= 1 order by owner_id limit 1;
  if buyer is null then
    raise exception 'Two eligible test accounts are required';
  end if;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub', seller::text, true);
  offer := public.list_pokemon(partner, 1);
  if not exists (select 1 from public.inventory where id = partner and is_listed) then
    raise exception 'Listing did not lock the Pokémon';
  end if;
  perform public.cancel_pokemon_listing(offer);
  if exists (select 1 from public.market_listings where id = offer)
     or not exists (select 1 from public.inventory where id = partner and not is_listed) then
    raise exception 'Cancellation did not unlock the Pokémon';
  end if;
  offer := public.list_pokemon(partner, 1);

  perform set_config('request.jwt.claim.sub', buyer::text, true);
  if public.buy_pokemon(offer) is distinct from partner then
    raise exception 'Purchase did not return the transferred Pokémon';
  end if;
  begin
    perform public.buy_pokemon(offer);
    raise exception 'The same listing was bought twice';
  exception when no_data_found then
    null;
  end;
  if (select gold from public.journeys where owner_id = buyer) is distinct from buyer_gold - 1
     or not exists (select 1 from public.inventory where id = partner and not is_listed)
     or exists (select 1 from public.market_listings where id = offer) then
    raise exception 'Buyer balance, ownership or listing is incorrect';
  end if;

  perform set_config('request.jwt.claim.sub', seller::text, true);
  if (select gold from public.journeys where owner_id = seller) is distinct from seller_gold + 1
     or exists (select 1 from public.inventory where id = partner) then
    raise exception 'Seller balance or ownership is incorrect';
  end if;
end;
$$;

rollback;
select 'Market transaction checks passed' as result;
