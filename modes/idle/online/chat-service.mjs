const channels = new Set(['geral', 'comercio', 'duvidas']);
const cooldownMs = 3000;

export function registerChat(io, authenticate) {
  const history = new Map([...channels].map(channel => [channel, []]));
  const lastMessage = new Map();
  const cleanup = setInterval(() => {
    const cutoff = Date.now() - cooldownMs;
    for (const [id, timestamp] of lastMessage) {
      if (timestamp <= cutoff) lastMessage.delete(id);
    }
  }, cooldownMs);
  cleanup.unref();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const player = typeof token === 'string' && token.length <= 8192
        ? await authenticate(token)
        : null;
      if (!player?.id || !player.username || !Number.isFinite(player.expiresAt)
          || player.expiresAt <= Date.now()) return next(new Error('Sessão inválida.'));
      socket.data.player = player;
      next();
    } catch {
      next(new Error('Não foi possível conectar ao chat.'));
    }
  });

  io.on('connection', socket => {
    const player = socket.data.player;
    const checkSession = () => {
      if (player.expiresAt > Date.now()) return true;
      socket.disconnect(true);
      return false;
    };
    socket.on('chat:join', async (channel, ack) => {
      if (typeof ack !== 'function' || !checkSession()) return;
      if (!channels.has(channel)) return ack({ error: 'Canal inválido.' });
      try {
        await socket.join(channel);
        ack({ messages: history.get(channel) });
      } catch {
        ack({ error: 'Não foi possível abrir o canal.' });
      }
    });
    socket.on('chat:send', (payload, ack) => {
      if (typeof ack !== 'function' || !checkSession()) return;
      const channel = payload?.channel;
      if (!channels.has(channel) || !socket.rooms.has(channel)) return ack({ error: 'Abra o canal primeiro.' });
      const raw = payload?.text;
      if (typeof raw !== 'string' || raw.length > 280) return ack({ error: 'Use até 140 caracteres.' });
      const message = raw.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
      if (!message || [...message].length > 140) return ack({ error: 'Use de 1 a 140 caracteres.' });
      const timestamp = Date.now();
      if (timestamp - (lastMessage.get(player.id) ?? 0) < cooldownMs) {
        return ack({ error: 'Aguarde 3 segundos entre mensagens.' });
      }
      lastMessage.set(player.id, timestamp);
      const entry = { username: player.username, text: message, timestamp };
      const messages = history.get(channel);
      messages.push(entry);
      if (messages.length > 30) messages.shift();
      io.to(channel).emit('chat:message', { channel, ...entry });
      ack({ ok: true });
    });
  });
  return () => clearInterval(cleanup);
}
