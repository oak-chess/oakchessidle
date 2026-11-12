import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createChatAuthenticator } from './chat-auth.mjs';
import { registerChat } from './chat-service.mjs';

const { GAME_ORIGIN, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PORT = '8000' } = process.env;
const origin = new URL(GAME_ORIGIN).origin;
const server = createServer((request, response) => {
  response.writeHead(request.url === '/health' ? 200 : 404).end();
});
const io = new Server(server, {
  cors: { origin },
  allowRequest: (request, callback) => callback(null, request.headers.origin === origin),
  maxHttpBufferSize: 8192
});
registerChat(io, createChatAuthenticator(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));
server.listen(Number(PORT), '0.0.0.0');
