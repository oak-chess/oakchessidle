export function mountContacts(client, container) {
  const section = document.createElement('section');
  const title = document.createElement('h3');
  title.textContent = 'Contatos';
  const form = document.createElement('form');
  const input = document.createElement('input');
  input.placeholder = 'Nome exato do treinador';
  input.setAttribute('aria-label', 'Nome do treinador para adicionar');
  input.pattern = '[A-Za-z0-9_]{3,24}';
  input.maxLength = 24;
  input.required = true;
  const button = document.createElement('button');
  button.textContent = 'Adicionar';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const list = document.createElement('ul');
  form.append(input, button);
  section.append(title, form, status, list);
  container.append(section);
  let generation = 0;
  let owner;
  let busy = false;

  async function refresh() {
    const request = ++generation;
    const { data, error } = await client.rpc('get_player_contacts');
    if (request !== generation || !owner) return;
    list.replaceChildren();
    if (error) {
      status.textContent = 'Os contatos ainda estão sendo preparados.';
      return;
    }
    for (const contact of data) {
      const row = document.createElement('li');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remover';
      remove.onclick = async () => {
        if (busy) return;
        busy = true;
        remove.disabled = true;
        try {
          const { error } = await client.rpc('remove_player_contact', { target_id: contact.id });
          if (request !== generation) return;
          if (error) status.textContent = 'Não foi possível remover o contato.';
          else await refresh();
        } finally { busy = false; remove.disabled = false; }
      };
      row.append('@' + contact.username + ' ', remove);
      list.append(row);
    }
    if (!data.length) list.textContent = 'Adicione um treinador pelo nome para salvar seu contato.';
  }
  form.onsubmit = async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    button.disabled = true;
    const player = owner;
    try {
      const { error } = await client.rpc('add_player_contact', { requested_username: input.value.trim() });
      if (owner !== player) return;
      status.textContent = error ? 'Treinador indisponível. Confira o nome.' : 'Contato adicionado.';
      if (!error) { input.value = ''; await refresh(); }
    } finally { busy = false; button.disabled = false; }
  };
  return session => {
    owner = session?.user.id;
    generation++;
    section.hidden = !owner;
    input.value = '';
    list.replaceChildren();
    status.textContent = '';
    if (owner) void refresh();
  };
}
