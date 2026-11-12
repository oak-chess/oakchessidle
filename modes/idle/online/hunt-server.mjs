import { createServer } from 'node:http';
import { createHuntHandler } from './hunt-http.mjs';
import { createAccessTokenVerifier } from './verify-access-token.mjs';

export function createHuntServer({ pool, resolveBattle, supabaseUrl, publishableKey, gameOrigin }) {
  if (typeof resolveBattle !== 'function') throw new TypeError('Configure the server combat engine');
  const allowedOrigin = new URL(gameOrigin).origin;
  const handle = createHuntHandler({
    pool,
    resolveBattle,
    verifyAccessToken: createAccessTokenVerifier(supabaseUrl, publishableKey)
  });

  return createServer(async (incoming, outgoing) => {
    outgoing.setHeader('Cache-Control', 'no-store');
    outgoing.setHeader('Vary', 'Origin');
    const origin = incoming.headers.origin;
    if (origin && origin !== allowedOrigin) {
      outgoing.writeHead(403).end();
      return;
    }
    if (origin) outgoing.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    if (incoming.method === 'OPTIONS') {
      outgoing.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      outgoing.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      outgoing.writeHead(204).end();
      return;
    }

    try {
      const path = new URL(incoming.url, 'http://localhost').pathname;
      const chunks = [];
      let length = 0;
      if (incoming.method === 'POST') {
        for await (const chunk of incoming.iterator({ destroyOnReturn: false })) {
          length += chunk.length;
          if (length > 4096) {
            outgoing.setHeader('Connection', 'close');
            outgoing.writeHead(413).end();
            return;
          }
          chunks.push(chunk);
        }
      }
      const response = await handle(new Request('http://localhost' + path, {
        method: incoming.method,
        headers: incoming.headers,
        body: incoming.method === 'POST' ? Buffer.concat(chunks) : undefined
      }));
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(await response.text());
    } catch {
      if (!outgoing.headersSent) outgoing.writeHead(500);
      outgoing.end();
    }
  });
}
