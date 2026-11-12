begin;

create table public.market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.journeys(owner_id) on delete cascade,
  inventory_id uuid not null unique references public.inventory(id) on delete cascade,
  pokemon_id integer not null,
  level integer not null,
  stars smallint not null,
  price integer not null check (price > 0),
  created_at timestamptz not null default now()
);
create index market_listings_page on public.market_listings (created_at desc, id desc);
alter table public.market_listings enable row level security;
revoke all on public.market_listings from public, anon, authenticated;
grant select on public.market_listings to authenticated;
create policy market_read on public.market_listings for select to authenticated using (true);

create function public.list_pokemon(p_inventory_id uuid, p_price integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  partner public.inventory%rowtype;
  listing uuid;
begin
  if player is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_price is null or p_price <= 0 then raise exception 'Invalid price' using errcode = '22023'; end if;
  perform 1 from public.journeys where owner_id = player for update;
  if exists (select 1 from oakchess_server.hunt_encounters where owner_id = player and finished_at is null) then
    raise exception 'Finish the active hunt before listing a Pokémon';
  end if;
  select * into partner from public.inventory
  where id = p_inventory_id and owner_id = player and not is_listed for update;
  if not found then raise exception 'Pokémon unavailable' using errcode = 'P0002'; end if;
  insert into public.market_listings (seller_id, inventory_id, pokemon_id, level, stars, price)
  values (player, partner.id, partner.pokemon_id, partner.level, partner.stars, p_price)
  returning id into listing;
  update public.inventory set is_listed = true where id = partner.id;
  return listing;
end;
$$;

create function public.cancel_pokemon_listing(p_listing_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  partner_id uuid;
begin
  if player is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform 1 from public.journeys where owner_id = player for update;
  delete from public.market_listings where id = p_listing_id and seller_id = player
  returning inventory_id into partner_id;
  if not found then raise exception 'Listing unavailable' using errcode = 'P0002'; end if;
  update public.inventory set is_listed = false where id = partner_id and owner_id = player;
end;
$$;

create function public.buy_pokemon(listing_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  buyer uuid := auth.uid();
  offer public.market_listings%rowtype;
begin
  if buyer is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into offer from public.market_listings where id = listing_id;
  if not found then raise exception 'Listing unavailable' using errcode = 'P0002'; end if;
  if offer.seller_id = buyer then raise exception 'Cannot buy your own listing'; end if;

  -- Acquire both wallet locks in one consistent order before touching the offer.
  perform 1 from public.journeys where owner_id in (buyer, offer.seller_id)
  order by owner_id for update;
  select * into offer from public.market_listings where id = listing_id for update;
  if not found then raise exception 'Listing unavailable' using errcode = 'P0002'; end if;

  update public.journeys set gold = gold - offer.price where owner_id = buyer and gold >= offer.price;
  if not found then raise exception 'Insufficient Coins'; end if;
  update public.journeys set gold = gold + offer.price where owner_id = offer.seller_id;
  update public.inventory set owner_id = buyer, is_listed = false
  where id = offer.inventory_id and owner_id = offer.seller_id and is_listed;
  if not found then raise exception 'Pokémon unavailable'; end if;
  delete from public.market_listings where id = offer.id;
  return offer.inventory_id;
end;
$$;

revoke all on function public.list_pokemon(uuid, integer), public.cancel_pokemon_listing(uuid), public.buy_pokemon(uuid)
  from public, anon, authenticated;
grant execute on function public.list_pokemon(uuid, integer), public.cancel_pokemon_listing(uuid), public.buy_pokemon(uuid)
  to authenticated;

commit;
