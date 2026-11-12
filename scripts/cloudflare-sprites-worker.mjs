const upstream = 'https://oak-chess.github.io/oakchessidle';
const spritePath = /^\/assets\/pmd\/sprite\/(?:\d{4}\/)+[A-Za-z0-9_-]+\.(?:png|xml)$/;

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/monthly-rankings') {
      if (!env.RANKINGS_SERVICE) return Response.json(
        { error: 'Ranking em preparação.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
      return env.RANKINGS_SERVICE.fetch(request);
    }
    if (!spritePath.test(pathname)) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    try {
      return await fetch(upstream + pathname, { method: request.method, redirect: 'follow' });
    } catch {
      return fetch('https://raw.githubusercontent.com/oak-chess/oakchessidle/main' + pathname, {
        method: request.method
      });
    }
  }
};
