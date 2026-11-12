export const SNAPSHOT_SECONDS = 120;
const publicHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff'
};

export async function refreshSnapshot(env, fetcher = fetch) {
  if (!env.RANKINGS_BUCKET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Configure ranking storage and server credentials');
  }
  const response = await fetcher(env.SUPABASE_URL + '/rest/v1/rpc/export_monthly_rankings', {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    },
    body: '{}',
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Ranking export failed: ' + response.status);
  const snapshot = await response.json();
  if (snapshot.schema !== 1 || !Array.isArray(snapshot.rows) || !Array.isArray(snapshot.history)) {
    throw new Error('Invalid ranking snapshot');
  }
  const body = JSON.stringify(snapshot);
  // Atomic object replacement keeps the previous complete snapshot on failure.
  await env.RANKINGS_BUCKET.put('monthly.json', body, {
    httpMetadata: { contentType: publicHeaders['Content-Type'] }
  });
  return snapshot;
}

export async function serveSnapshot(request, env, edgeCache = globalThis.caches?.default) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  if (!env.RANKINGS_BUCKET) {
    return Response.json({ error: 'Ranking em preparação.' }, {
      status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '120' }
    });
  }
  const cacheUrl = new URL(request.url);
  cacheUrl.search = '';
  const cacheKey = new Request(cacheUrl, { method: 'GET' });
  const cached = await edgeCache?.match(cacheKey);
  if (cached) {
    if (request.headers.get('If-None-Match') === cached.headers.get('ETag')) {
      return new Response(null, { status: 304, headers: cached.headers });
    }
    return request.method === 'HEAD' ? new Response(null, { headers: cached.headers }) : cached;
  }
  const object = await env.RANKINGS_BUCKET.get('monthly.json');
  if (!object) return Response.json({ error: 'Primeira classificação em preparação.' }, {
    status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '120' }
  });
  // Browsers and the shared cache expire with the source snapshot, not with
  // the time somebody opens the panel. Old data never acquires a fresh 2 min TTL.
  const expiry = object.uploaded.getTime() + SNAPSHOT_SECONDS * 1000;
  const maxAge = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
  const headers = {
    ...publicHeaders,
    'Cache-Control': 'public, max-age=' + maxAge + ', must-revalidate',
    ETag: object.httpEtag,
    'Access-Control-Expose-Headers': 'ETag, X-Ranking-Expires',
    'X-Ranking-Expires': String(expiry)
  };
  if (env.GAME_ORIGIN) headers['Access-Control-Allow-Origin'] = new URL(env.GAME_ORIGIN).origin;
  if (request.headers.get('If-None-Match') === object.httpEtag) {
    return new Response(null, { status: 304, headers });
  }
  const response = new Response(request.method === 'HEAD' ? null : object.body, { headers });
  if (edgeCache && maxAge > 0 && request.method === 'GET') {
    try { await edgeCache.put(cacheKey, response.clone()); } catch {}
  }
  return response;
}

export default {
  fetch: serveSnapshot,
  scheduled(_event, env, ctx) {
    ctx.waitUntil(refreshSnapshot(env));
  }
};
