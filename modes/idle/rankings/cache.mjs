/* Shared across open/close and all four tabs. Read-only ranking data only.
   No progress, balances, credentials or inventory are stored by this cache. */
export function createRankingCache({
  url = '/api/monthly-rankings',
  fetcher = fetch,
  now = Date.now,
  storage = globalThis.sessionStorage
} = {}) {
  const key = 'oakchess-monthly-rankings:v1:' + url;
  let cached = null;
  let pending = null;
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (valid(saved?.data) && Number.isFinite(saved.expiresAt)) cached = saved;
  } catch {}

  function valid(data) {
    return data?.schema === 1 && Array.isArray(data.rows) && Array.isArray(data.history)
      && Number.isFinite(Date.parse(data.endsAt));
  }
  function fresh() { return cached && cached.expiresAt > now(); }
  async function load() {
    if (fresh()) return cached.data;
    if (pending) return pending;
    pending = (async () => {
      const headers = cached?.etag ? { 'If-None-Match': cached.etag } : {};
      const response = await fetcher(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!response.ok && response.status !== 304) throw Error('Ranking temporariamente indisponível.');
      const data = response.status === 304 ? cached?.data : await response.json();
      if (!valid(data)) throw Error('Não foi possível ler a classificação.');
      const expiry = Number(response.headers.get('X-Ranking-Expires'));
      const generatedExpiry = Date.parse(data.generatedAt) + 120000;
      // A public snapshot is an estimate while its next refresh is running.
      // Wait at least 15 seconds on stale snapshots to avoid busy polling.
      const requestedExpiry = Number.isFinite(expiry) && expiry > 0 ? expiry : generatedExpiry;
      cached = { data, etag: response.headers.get('ETag') || cached?.etag,
        expiresAt: Math.min(now() + 120000, Math.max(now() + 15000, requestedExpiry)) };
      try { storage?.setItem(key, JSON.stringify(cached)); } catch {}
      return data;
    })().finally(() => { pending = null; });
    return pending;
  }
  return { load, peek: () => cached?.data || null,
    wait: () => Math.max(15000, (cached?.expiresAt || now()) - now()) };
}
