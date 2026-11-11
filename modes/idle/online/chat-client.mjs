export function mountChat(client, serverUrl, connect) {
  const panel = document.querySelector('#chat');
  const status = document.querySelector('#chat-status');
  const select = document.querySelector('#chat-channel');
  const messages = document.querySelector('#chat-messages');
  const form = document.querySelector('#chat-form');
  const send = form.querySelector('button');
  const input = form.elements.message;
  let generation = 0;

  const socket = connect(serverUrl, {
    autoConnect: false,
    auth: async callback => {
      const { data } = await client.auth.getSession();
      callback({ token: data?.session?.access_token });
    }
  });
  const append = message => {
    const row = document.createElement('li');
    row.textContent = message.username + ' · ' + message.text;
    messages.append(row);
    if (messages.children.length > 30) messages.firstElementChild.remove();
  };

  function join() {
    const request = ++generation;
    send.disabled = true;
    messages.replaceChildren();
    if (!socket.connected) return;
    socket.timeout(8000).emit('chat:join', select.value, (error, result) => {
      if (request !== generation || !socket.connected) return;
      status.textContent = error ? 'Canal indisponível.' : result.error || '';
      if (!error && !result.error) {
        messages.replaceChildren();
        result.messages.forEach(append);
        send.disabled = false;
      }
    });
  }
  select.addEventListener('change', join);
  socket.on('connect', join);
  socket.on('connect_error', error => {
    status.textContent = error.message === 'Sessão inválida.'
      ? 'Sessão inválida. Entre novamente.'
      : 'Conectando ao chat…';
  });
  socket.on('disconnect', () => {
    send.disabled = true;
    status.textContent = 'Chat desconectado.';
  });
  socket.on('chat:message', message => {
    if (message.channel === select.value && !send.disabled) append(message);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (send.disabled || !socket.connected) return;
    const text = input.value;
    const request = generation;
    socket.timeout(8000).emit('chat:send', { channel: select.value, text }, (error, result) => {
      if (request !== generation || !socket.connected) return;
      status.textContent = error ? 'Envio indisponível.' : result.error || '';
      if (!error && result.ok && input.value === text) input.value = '';
    });
  });
  return session => {
    panel.hidden = !session;
    socket.disconnect();
    join();
    input.value = '';
    if (session) {
      status.textContent = 'Conectando ao chat…';
      socket.connect();
    }
  };
}
