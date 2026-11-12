import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ...['online.js', 'config.js', 'hunt-client.mjs', 'market-ui.mjs', 'market-client.mjs', 'chat-client.mjs']
    .map(name => ['/' + name, name])
]);

createServer(async (request, response) => {
  const file = files.get(request.url?.split('?')[0]);
  if (!file || request.method !== 'GET') {
    response.writeHead(404).end();
    return;
  }
  try {
    const content = await readFile(new URL(file, import.meta.url));
    response.writeHead(200, {
      'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store'
    }).end(content);
  } catch {
    response.writeHead(500).end();
  }
}).listen(8797, '127.0.0.1', () => console.log('http://127.0.0.1:8797/'));
