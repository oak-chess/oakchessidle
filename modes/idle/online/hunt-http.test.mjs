import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHuntHandler } from './hunt-http.mjs';

const player = '00000000-0000-4000-8000-000000000001';
const encounter = '00000000-0000-4000-8000-000000000002';

test('recovers only the active encounter metadata for the verified account', async () => {
  const active = { id: encounter, hunt_key: 'viridian-trails', created_at: '2026-11-11T00:00:00Z' };
  const handle = createHuntHandler({
    pool: { async query(sql, params) {
      assert.match(sql, /WHERE owner_id = \$1 AND finished_at IS NULL/);
      assert.doesNotMatch(sql, /battle_snapshot/);
      assert.deepEqual(params, [player]);
      return { rows: [active] };
    } },
    verifyAccessToken: async () => player
  });
  const response = await handle(new Request('https://test.invalid/api/hunts/active', {
    headers: { Authorization: 'Bearer valid' }
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { encounter: active });
});

test('rejects unauthenticated and malformed requests before querying the database', async () => {
  const handle = createHuntHandler({
    pool: { connect: () => assert.fail('Unexpected database access') },
    verifyAccessToken: async token => token === 'valid' ? player : null
  });
  const request = (token, body) => new Request('https://test.invalid/api/hunts/finish', {
    method: 'POST',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    body
  });

  assert.equal((await handle(request(null, '{}'))).status, 401);
  assert.equal((await handle(request('expired', '{}'))).status, 401);
  assert.equal((await handle(request('valid', '{'))).status, 400);
  assert.equal((await handle(request('valid', '{}'))).status, 400);
});

test('settles using the session owner and server result, ignoring browser reward fields', async () => {
  const queries = [];
  const connection = {
    async query(sql, params) {
      queries.push([sql, params]);
      if (sql.includes('FROM public.journeys')) return { rows: [{ owner_id: player }] };
      if (sql.includes('FROM oakchess_server.hunt_encounters')) {
        return { rows: [{ hunt_key: 'viridian-trails', battle_snapshot: { wave: 1 }, finished_at: null }] };
      }
      if (sql.includes('settle_hunt_encounter')) return { rows: [{ result: { won: true, coins: 7 } }] };
    },
    release() { queries.push(['RELEASE']); }
  };
  const handle = createHuntHandler({
    pool: { connect: async () => connection },
    verifyAccessToken: async () => player,
    resolveBattle: async (hunt, snapshot) => {
      assert.equal(hunt, 'viridian-trails');
      assert.deepEqual(snapshot, { wave: 1 });
      return { won: true, coins: 7 };
    }
  });

  const response = await handle(new Request('https://test.invalid/api/hunts/finish', {
    method: 'POST',
    headers: { Authorization: 'Bearer valid' },
    body: JSON.stringify({ encounterId: encounter, ownerId: encounter, won: false, coins: 999 })
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { won: true, coins: 7 });
  assert.deepEqual(queries[3][1], [player, encounter, true, 7]);
  assert.deepEqual(queries.slice(-2), [['COMMIT', undefined], ['RELEASE']]);
});
