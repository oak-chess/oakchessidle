const upstream = 'https://oak-chess.github.io/oakchessidle';
const spritePath = /^\/assets\/pmd\/sprite\/(?:\d{4}\/)+[A-Za-z0-9_-]+\.(?:png|xml)$/;

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (!spritePath.test(pathname)) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    try {
      return await fetch(upstream + pathname, { method: request.method, redirect: 'error' });
    } catch {
      return new Response('Sprite indisponível', { status: 502 });
    }
  }
};
