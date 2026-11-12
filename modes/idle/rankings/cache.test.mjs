import test from 'node:test';
import assert from 'node:assert/strict';
import { createRankingCache } from './cache.mjs';
import { serveSnapshot, refreshSnapshot } from './worker.mjs';

const sample = () => ({
  schema: 1, generatedAt: '2026-11-12T12:00:00Z', season: '2026-11-01',
  endsAt: '2026-12-01T03:00:00Z', rows: [], history: []
});
const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
};
test('reopening, changing mode and concurrent reads share one valid snapshot', async () => {
  let requests = 0, now = Date.parse(sample().generatedAt);
  const storage = memory();
  const fetcher = async () => {
    requests++;
    return Response.json(sample(), { headers: { 'X-Ranking-Expires': String(now + 120000), ETag: '"one"' } });
  };
  const cache = createRankingCache({ fetcher, now: () => now, storage });
  await Promise.all([cache.load(), cache.load(), cache.load()]);
  assert.equal(requests, 1);
  now += 60000;
  await cache.load();
  await createRankingCache({ fetcher, now: () => now, storage }).load();
  assert.equal(requests, 1);
  now += 61000;
  await cache.load();
  assert.equal(requests, 2);
});
test('a 304 retains data without extending freshness beyond source expiry', async () => {
  let now = Date.parse(sample().generatedAt), calls = 0;
  const cache = createRankingCache({ storage: memory(), now: () => now, fetcher: async (_url, init) => {
    calls++;
    if (calls === 1) return Response.json(sample(), {
      headers: { ETag: '"one"', 'X-Ranking-Expires': String(now + 120000) }
    });
    assert.equal(init.headers['If-None-Match'], '"one"');
    return new Response(null, { status: 304, headers: { 'X-Ranking-Expires': String(now + 20000) } });
  } });
  const initial = await cache.load();
  now += 121000;
  assert.deepEqual(await cache.load(), initial);
  assert.equal(cache.wait(), 20000);
});
test('an export failure preserves the old shared snapshot', async () => {
  let puts = 0;
  await assert.rejects(refreshSnapshot({
    RANKINGS_BUCKET: { put: () => puts++ }, SUPABASE_URL: 'https://example.test',
    SUPABASE_SERVICE_ROLE_KEY: 'server-only'
  }, async () => new Response('', { status: 500 })));
  assert.equal(puts, 0);
});
test('browser reads access storage only, with method guard and ETag', async () => {
  const uploaded = new Date();
  const env = { RANKINGS_BUCKET: { get: async () => ({
    uploaded, httpEtag: '"one"', body: JSON.stringify(sample())
  }) } };
  assert.equal((await serveSnapshot(new Request('https://test/', { method: 'POST' }), env)).status, 405);
  const response = await serveSnapshot(new Request('https://test/'), env);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('Cache-Control').includes('max-age='));
  assert.equal((await serveSnapshot(new Request('https://test/', {
    headers: { 'If-None-Match': '"one"' }
  }), env)).status, 304);
});
test('missing deployment configuration returns a recoverable preparation state', async () => {
  const response = await serveSnapshot(new Request('https://test/'), {});
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('shared edge cache avoids repeated storage reads for different spectators', async () => {
  let reads = 0, stored;
  const edge = { match: async () => stored?.clone(), put: async (_key, value) => { stored = value; } };
  const env = { RANKINGS_BUCKET: { get: async () => {
    reads++;
    return { uploaded: new Date(), httpEtag: '"one"', body: JSON.stringify(sample()) };
  } } };
  await serveSnapshot(new Request('https://test/api/monthly-rankings'), env, edge);
  await serveSnapshot(new Request('https://test/api/monthly-rankings?reopen=1'), env, edge);
  assert.equal(reads, 1);
});
