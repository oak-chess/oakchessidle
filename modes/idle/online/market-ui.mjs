import { createMarketClient } from './market-client.mjs';

export function mountMarket(client, refreshJourney) {
  const api = createMarketClient(client);
  const panel = document.querySelector('#market');
  const list = document.querySelector('#market-list');
  const status = document.querySelector('#market-status');
  const form = document.querySelector('#market-form');
  const prev = document.querySelector('#market-prev');
  const next = document.querySelector('#market-next');
  const partner = form.elements.partner;
  let playerId;
  let generation = 0;
  let page = 0;
  let busy = false;

  async function draw() {
    const request = ++generation;
    prev.disabled = next.disabled = true;
    list.replaceChildren();
    if (!playerId) return;
    try {
      const offers = await api.list(page);
      if (request !== generation) return;
      prev.disabled = page === 0;
      next.disabled = offers.length < 15;
      if (!offers.length) list.append(document.createTextNode('Nenhum anúncio nesta página.'));
      for (const offer of offers) {
        const row = document.createElement('li');
        const own = offer.seller_id === playerId;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = own ? 'Cancelar anúncio' : 'Comprar';
        button.addEventListener('click', () => {
          if (!own && !window.confirm('Comprar por ' + offer.price.toLocaleString('pt-BR') + ' Coins?')) return;
          void change(() => own ? api.cancel(offer.id) : api.buy(offer.id));
        });
        row.append('Pokémon #' + offer.pokemon_id + ' · Nv. ' + offer.level
          + ' · ' + offer.price.toLocaleString('pt-BR') + ' Coins ', button);
        list.append(row);
      }
    } catch {
      if (request === generation) status.textContent = 'Não foi possível listar os anúncios.';
    }
  }

  async function change(operation) {
    if (!playerId || busy) return;
    const owner = playerId;
    busy = true;
    try {
      await operation();
      if (owner !== playerId) return;
      status.textContent = 'Mercado atualizado.';
      await refreshJourney(owner);
    } catch {
      if (owner === playerId) status.textContent = 'Não foi possível concluir. Confira o saldo e a disponibilidade.';
    } finally {
      busy = false;
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    void change(() => api.publish(partner.value, form.elements.price.valueAsNumber));
  });
  prev.addEventListener('click', () => { if (page > 0) { page--; void draw(); } });
  next.addEventListener('click', () => { page++; void draw(); });

  return (owner, inventory = []) => {
    if (playerId !== owner) {
      page = 0;
      status.textContent = '';
    }
    playerId = owner;
    panel.hidden = !owner;
    partner.replaceChildren(...inventory.filter(item => !item.is_listed).map(item =>
      new Option('Pokémon #' + item.pokemon_id + ' · Nv. ' + item.level, item.id)
    ));
    form.querySelector('button').disabled = !partner.options.length;
    void draw();
  };
}
