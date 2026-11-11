import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { Server } from 'socket.io';
import { io as connect } from 'socket.io-client';
import { registerChat } from './chat-service.mjs';

test('two Socket.IO clients exchange a message and retrieve channel history', { timeout: 5000 }, async () => {
  const server = createServer();
  const io = new Server(server);
  const dispose = registerChat(io, async token => ({
    id: token, username: token, expiresAt: Date.now() + 60000
  }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = 'http://127.0.0.1:' + server.address().port;
  const first = connect(address, { auth: { token: 'Ana' }, reconnection: false });
  const second = connect(address, { auth: { token: 'Beto' }, reconnection: false });
  try {
    await Promise.all([once(first, 'connect'), once(second, 'connect')]);
    assert.deepEqual(await first.timeout(1000).emitWithAck('chat:join', 'geral'), { messages: [] });
    assert.deepEqual(await second.timeout(1000).emitWithAck('chat:join', 'geral'), { messages: [] });
    const received = once(second, 'chat:message');
    assert.deepEqual(await first.timeout(1000).emitWithAck('chat:send', { channel: 'geral', text: 'Olá!' }), { ok: true });
    const [message] = await received;
    assert.equal(message.username, 'Ana');
    assert.equal(message.text, 'Olá!');
    assert.equal(message.channel, 'geral');
    assert.deepEqual(await second.timeout(1000).emitWithAck('chat:join', 'duvidas'), { messages: [] });
    const { messages } = await second.timeout(1000).emitWithAck('chat:join', 'geral');
    assert.equal(messages[0].text, 'Olá!');
  } finally {
    first.close();
    second.close();
    dispose();
    await io.close();
  }
});
