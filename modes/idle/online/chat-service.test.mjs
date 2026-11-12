import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerChat } from './chat-service.mjs';

test('chat uses verified identity, isolates rooms and throttles across connections', async () => {
  let authenticateSocket;
  let connectSocket;
  const broadcasts = [];
  const io = {
    use(handler) { authenticateSocket = handler; },
    on(event, handler) { assert.equal(event, 'connection'); connectSocket = handler; },
    to(room) { return { emit: (event, payload) => broadcasts.push({ room, event, payload }) }; }
  };
  const dispose = registerChat(io, async token => token === 'valid'
    ? { id: 'player', username: 'Treinador', expiresAt: Date.now() + 60000 }
    : null);

  async function socket(token) {
    const handlers = new Map();
    const connection = {
      handshake: { auth: { token } }, data: {}, rooms: new Set(),
      on: (event, handler) => handlers.set(event, handler),
      async join(room) { this.rooms.add(room); }
    };
    await new Promise((resolve, reject) => authenticateSocket(connection, error => error ? reject(error) : resolve()));
    connectSocket(connection);
    return (event, value) => new Promise(resolve => handlers.get(event)(value, resolve));
  }

  try {
    await assert.rejects(socket('invalid'), /Sessão inválida/);
    const first = await socket('valid');
    const second = await socket('valid');
    assert.ok((await first('chat:send', { channel: 'geral', text: 'Oi' })).error);
    assert.deepEqual(await first('chat:join', 'geral'), { messages: [] });
    assert.ok((await first('chat:send', { channel: 'geral', text: 'a'.repeat(141) })).error);
    assert.deepEqual(await first('chat:send', { channel: 'geral', text: 'Olá', username: 'Outro' }), { ok: true });
    assert.equal(broadcasts[0].room, 'geral');
    assert.equal(broadcasts[0].payload.username, 'Treinador');
    assert.deepEqual(await second('chat:join', 'duvidas'), { messages: [] });
    assert.match((await second('chat:send', { channel: 'duvidas', text: 'Oi' })).error, /40 segundos/);
    assert.equal((await second('chat:join', 'geral')).messages[0].text, 'Olá');
  } finally {
    dispose();
  }
});
