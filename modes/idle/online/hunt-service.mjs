const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function getActiveHunt(pool, playerId) {
  if (typeof playerId !== 'string' || !UUID.test(playerId)) {
    throw new TypeError('Invalid player ID');
  }
  const { rows: [encounter] } = await pool.query(
    `SELECT id, hunt_key, created_at
       FROM oakchess_server.hunt_encounters
      WHERE owner_id = $1 AND finished_at IS NULL`,
    [playerId]
  );
  return encounter ?? null;
}

// buildSnapshot validates hunt access and loads the player's formation using
// this transaction. The HTTP handler must derive playerId from its session.
export async function startHunt(pool, buildSnapshot, playerId, requestId, huntKey) {
  if (![playerId, requestId].every(id => typeof id === 'string' && UUID.test(id))
      || typeof huntKey !== 'string' || huntKey.length < 1 || huntKey.length > 100) {
    throw new TypeError('Invalid hunt request');
  }

  return inTransaction(pool, async connection => {
    const journey = await connection.query(
      'SELECT owner_id FROM public.journeys WHERE owner_id = $1 FOR UPDATE',
      [playerId]
    );
    if (!journey.rows.length) return null;

    const { rows: [existing] } = await connection.query(
      `SELECT id, hunt_key, created_at, finished_at, result
         FROM oakchess_server.hunt_encounters
        WHERE owner_id = $1 AND (request_id = $2 OR finished_at IS NULL)
        ORDER BY (request_id = $2) DESC
        LIMIT 1`,
      [playerId, requestId]
    );
    if (existing) return existing;

    const snapshot = await buildSnapshot(connection, playerId, huntKey);
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new Error('Invalid battle snapshot');
    }
    const { rows: [encounter] } = await connection.query(
      `INSERT INTO oakchess_server.hunt_encounters
         (owner_id, request_id, hunt_key, battle_snapshot)
       VALUES ($1, $2, $3, $4)
       RETURNING id, hunt_key, created_at, finished_at, result`,
      [playerId, requestId, huntKey, JSON.stringify(snapshot)]
    );
    return encounter;
  });
}

// Call from the trusted server with the player ID from a verified session.
// resolveBattle is server code and receives only the stored encounter state.
export async function finishHunt(pool, resolveBattle, playerId, encounterId) {
  if (typeof playerId !== 'string' || !UUID.test(playerId)
      || typeof encounterId !== 'string' || !UUID.test(encounterId)) {
    throw new TypeError('Invalid player or encounter ID');
  }

  return inTransaction(pool, async connection => {
    // Match startHunt's lock order before settlement updates the balance.
    const journey = await connection.query(
      'SELECT owner_id FROM public.journeys WHERE owner_id = $1 FOR UPDATE',
      [playerId]
    );
    if (!journey.rows.length) return null;

    const { rows: [encounter] } = await connection.query(
      `SELECT hunt_key, battle_snapshot, finished_at, result
         FROM oakchess_server.hunt_encounters
        WHERE owner_id = $1 AND id = $2
          FOR UPDATE`,
      [playerId, encounterId]
    );

    if (!encounter) return null;

    let result = encounter.result;
    if (encounter.finished_at === null) {
      const { won, coins } = await resolveBattle(encounter.hunt_key, encounter.battle_snapshot);
      if (typeof won !== 'boolean' || !Number.isSafeInteger(coins)
          || coins < 0 || (!won && coins !== 0)) {
        throw new Error('Invalid reward returned by the combat engine');
      }

      const settlement = await connection.query(
        'SELECT oakchess_server.settle_hunt_encounter($1, $2, $3, $4) AS result',
        [playerId, encounterId, won, coins]
      );
      result = settlement.rows[0].result;
    }

    return result;
  });
}

async function inTransaction(pool, operation) {
  const connection = await pool.connect();
  let discardConnection;
  try {
    await connection.query('BEGIN');
    const result = await operation(connection);
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await connection.query('ROLLBACK');
    } catch (rollbackError) {
      discardConnection = rollbackError;
      throw new AggregateError([error, rollbackError], 'Encounter transaction and rollback failed');
    }
    throw error;
  } finally {
    connection.release(discardConnection);
  }
}
