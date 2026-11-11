export function mountChat(client, serverUrl, connect) {
  const panel = document.querySelector('#chat');
  const status = document.querySelector('#chat-status');
  const select = document.querySelector('#chat-channel');
  const messages = document.querySelector('#chat-messages');
  const form = document.querySelector('#chat-form');
  const send = form.querySelector('button');
  send.textContent = '➤'; send.setAttribute('aria-label', 'Enviar mensagem');
  form.elements.message.placeholder = 'Mensagem';
  const input = form.elements.message;
  let generation = 0;
  let nextSendAt = 0;
  const cooldownTimer = setInterval(() => { const left=Math.max(0,Math.ceil((nextSendAt-Date.now())/1000));send.textContent=left?left+'s':'➤'; },1000);
  window.addEventListener('pagehide',()=>clearInterval(cooldownTimer),{once:true});
  let ownId;
  let ownName;
  let connectedAt = Date.now();
  const retry = document.createElement('button');
  retry.type = 'button'; retry.textContent = 'Reconectar'; retry.hidden = true;
  status.after(retry);
  retry.onclick = () => { status.textContent = 'Reconectando…'; socket.connect(); };
  const waiting = setInterval(() => {
    if (!socket.connected && !panel.hidden && Date.now() - connectedAt > 15000) {
      status.textContent = 'O servidor pode estar iniciando. Aguarde ou tente reconectar.';
      retry.hidden = false;
    }
  }, 5000);
  window.addEventListener('pagehide', () => { clearInterval(waiting); socket.disconnect(); }, { once: true });

  const socket = connect(serverUrl, {
    autoConnect: false,
    auth: async callback => {
      const { data } = await client.auth.getSession();
      callback({ token: data?.session?.access_token });
    }
  });
  const append = message => {
    const row = document.createElement('li');
    const nearBottom = messages.scrollHeight - messages.clientHeight - messages.scrollTop < 45;
    const mine = message.userId ? message.userId === ownId : message.username === ownName;
    row.dataset.mine = String(mine);
    const name = document.createElement('b'); name.textContent = message.username;
    const body = document.createElement('span'); body.textContent = message.text;
    const time = document.createElement('time');
    time.textContent = new Date(message.timestamp).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
    if(mine){const tick=document.createElement('span');tick.textContent=' ✓';tick.title='Mensagem aceita pelo servidor';time.append(tick);}row.append(name, body, time);
    messages.append(row);
    if (messages.children.length > 30) messages.firstElementChild.remove();
    if (nearBottom) messages.scrollTop = messages.scrollHeight;
    if (!mine && (document.hidden || panel.dataset.view === 'contacts')) {
      window.parent.postMessage({type:'oak-pokechat-unread',channel:message.channel}, location.origin);
    }
  };

  function join() {
    window.parent.postMessage({type:'oak-pokechat-read'}, location.origin);
    const request = ++generation;
    send.disabled = true;
    messages.replaceChildren();
    if (!socket.connected) return;
    socket.timeout(8000).emit('chat:join', select.value, (error, result) => {
      if (request !== generation || !socket.connected) return;
      status.textContent = error ? 'Canal indisponível. Tente reconectar.' : result?.error || 'Online · até 140 caracteres · intervalo de 40 segundos';
      retry.hidden = !error && !result?.error;
      if (!error && result && !result.error) {
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
    if (send.disabled || !socket.connected || Date.now()<nextSendAt) return;
    const text = input.value;
    const request = generation;
    socket.timeout(8000).emit('chat:send', { channel: select.value, text }, (error, result) => {
      if (request !== generation || !socket.connected) return;
      status.textContent = error ? 'Envio indisponível. Sua mensagem foi preservada.' : result?.error || 'Mensagem enviada';
      if (!error && result?.ok) {nextSendAt=Date.now()+40000;if(input.value===text)input.value='';}
    });
  });
  return session => {
    ownId = session?.user.id;
    ownName = document.querySelector('#status').textContent.replace(/^@/, '');
    connectedAt = Date.now();
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
