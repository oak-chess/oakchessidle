const PAGE_SIZE = 15;

export function createMarketClient(supabase) {
  async function read(request) {
    const { data, error } = await request;
    if (error) throw error;
    return data;
  }

  return {
    async list(page = 0) {
      if (!Number.isSafeInteger(page) || page < 0 || page > 100000) {
        throw new RangeError('Página inválida.');
      }
      const start = page * PAGE_SIZE;
      return read(supabase.from('market_listings')
        .select('id,seller_id,pokemon_id,level,stars,price,created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(start, start + PAGE_SIZE - 1));
    },
    async publish(inventoryId, price) {
      if (!Number.isInteger(price) || price < 1 || price > 2147483647) {
        throw new RangeError('Preço inválido.');
      }
      return read(supabase.rpc('list_pokemon', { p_inventory_id: inventoryId, p_price: price }));
    },
    cancel(listingId) {
      return read(supabase.rpc('cancel_pokemon_listing', { p_listing_id: listingId }));
    },
    buy(listingId) {
      return read(supabase.rpc('buy_pokemon', { listing_id: listingId }));
    }
  };
}
