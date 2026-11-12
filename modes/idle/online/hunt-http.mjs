import { finishHunt, getActiveHunt, startHunt } from './hunt-service.mjs';
import { buildFirstHuntSnapshot, HuntUnavailableError } from './hunt-snapshot.mjs';

// Mount behind an HTTP server with a request-body size limit.
// verifyAccessToken must verify the token with the configured Supabase project.
export function createHuntHandler({
  pool, verifyAccessToken, buildSnapshot = buildFirstHuntSnapshot, resolveBattle, onError = console.error
}) {
  const reply = (status, body) => Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });

  return async request => {
    const path = new URL(request.url).pathname;
    const active = path === '/api/hunts/active';
    if (!active && path !== '/api/hunts/start' && path !== '/api/hunts/finish') {
      return reply(404, { error: 'Rota indisponível.' });
    }
    const method = active ? 'GET' : 'POST';
    if (request.method !== method) return reply(405, { error: 'Use ' + method + '.' });
    const token = /^Bearer ([^\s]+)$/i.exec(request.headers.get('Authorization') ?? '')?.[1];
    if (!token) return reply(401, { error: 'Entre na sua conta.' });

    try {
      const playerId = await verifyAccessToken(token);
      if (!playerId) return reply(401, { error: 'Sessão inválida ou expirada.' });
      if (active) return reply(200, { encounter: await getActiveHunt(pool, playerId) });

      let body;
      try {
        body = await request.json();
      } catch {
        return reply(400, { error: 'Dados da caçada inválidos.' });
      }
      const starting = path === '/api/hunts/start';
      const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
      const id = starting ? body?.requestId : body?.encounterId;
      if (typeof id !== 'string' || !uuid.test(id)
          || (starting && (typeof body?.huntKey !== 'string' || !body.huntKey.length || body.huntKey.length > 100))) {
        return reply(400, { error: 'Dados da caçada inválidos.' });
      }

      const result = starting
        ? await startHunt(pool, buildSnapshot, playerId, id, body.huntKey)
        : await finishHunt(pool, resolveBattle, playerId, id);
      return result === null
        ? reply(404, { error: 'Jornada ou encontro indisponível.' })
        : reply(200, result);
    } catch (error) {
      if (error instanceof HuntUnavailableError) return reply(409, { error: error.message });
      onError(error);
      return reply(500, { error: 'Não foi possível processar a caçada.' });
    }
  };
}
