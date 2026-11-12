import { createRankingCache } from './cache.mjs';

const modes = { arena: 'Arena', tower: 'Torre de Batalha',
  rocket: 'Operações Rocket', invasion: 'Invasões Rocket' };
const cache = createRankingCache();
const number = new Intl.NumberFormat('pt-BR');
let root, table, mine, status, clock, tabs, opener, timeout, ticker;
let lastUpdate, nextUpdate, nextRefreshAt = 0;
let selected = 'arena', view = 'current', snapshot, loading = false;
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
function button(text, action, className = '') {
  const node = element('button', className, text);
  node.type = 'button';
  node.onclick = () => { if(typeof SND!=='undefined'){SND.init();SND.click();} action(); };
  node.addEventListener('pointerenter', () => typeof SND!=='undefined'&&SND.hover());
  return node;
}
function diamond(value) {
  const node = element('span', 'mr-diamonds');
  const icon = element('img', '');
  icon.src = 'modes/idle/assets/menu-icons/diamond.svg'; icon.alt = 'Diamantes';
  node.append(icon, document.createTextNode(number.format(value)));
  return node;
}
function portrait(row) {
  if (row.portrait && window.IDLE_TRAINER_PORTRAITS) {
    const node = window.IDLE_TRAINER_PORTRAITS.render({ portrait: row.portrait });
    node.classList.add('mr-portrait');
    return node;
  }
  const node = element('img', 'mr-portrait mr-portrait-default');
  node.src = 'assets/pokeapi/sprites/items/poke-ball.png'; node.alt = '';
  return node;
}
function row(entry, own = false) {
  const node = element('div', 'mr-row' + (own ? ' mr-own' : ''));
  node.setAttribute('role', 'row');
  const cell = (value, className = '') => {
    const node = element('div', 'mr-cell ' + className);
    node.setAttribute('role', 'cell');
    if (value instanceof Node) node.append(value);
    else node.textContent = value;
    return node;
  };
  const place = cell(entry.position + 'º', 'mr-place medal-' + entry.position);
  const who = cell('', 'mr-who');
  who.append(portrait(entry), element('strong', '', entry.username));
  if (own) who.append(element('small', '', 'Você'));
  node.append(place, who, cell(number.format(entry.points)), cell(number.format(entry.wins)),
    cell(number.format(entry.losses)), cell(diamond(entry.prize)));
  return node;
}
function updateClock() {
  if (clock && snapshot) {
    const seconds = Math.max(0, Math.floor((Date.parse(snapshot.endsAt) - Date.now()) / 1000));
    clock.textContent = seconds === 0 ? 'Fechamento em processamento'
      : 'Fecha em ' + Math.floor(seconds / 86400) + 'd ' + Math.floor(seconds % 86400 / 3600) + 'h';
    clock.title = new Date(snapshot.endsAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' · Brasília';
    lastUpdate.textContent = 'Última atualização: ' + new Date(snapshot.generatedAt)
      .toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' · Brasília';
    lastUpdate.title = new Date(snapshot.generatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }
  if (nextUpdate) {
    const seconds = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
    nextUpdate.textContent = document.hidden ? 'Atualização pausada'
      : loading ? 'Atualizando…'
      : 'Atualiza em ' + String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }
}

function render() {
  tabs.querySelectorAll('button').forEach(node => node.setAttribute('aria-selected', String(node.dataset.mode === selected)));
  const oldScroll = table.scrollTop;
  table.replaceChildren(); mine.replaceChildren();
  if (!snapshot) return;
  const username = window.IDLE_ACCOUNT_IDENTITY?.name;
  if (view === 'current') {
    const entries = snapshot.rows.filter(entry => entry.mode === selected);
    for (const entry of entries.slice(0, 100)) table.append(row(entry));
    if (!entries.length) table.append(element('p', 'mr-empty', 'Ainda não há resultados validados neste mês.'));
    const self = entries.find(entry => entry.username === username);
    mine.append(element('b', 'mr-own-label', 'Sua posição'));
    if (self) mine.append(row(self, true));
    else mine.append(element('span', 'mr-empty-self', 'Participe deste modo para entrar na classificação mensal.'));
  } else {
    for (const season of snapshot.history) {
      const entries = season.winners.filter(entry => entry.mode === selected
        && (view !== 'awards' || entry.username === username));
      if (!entries.length) continue;
      table.append(element('h3', 'mr-month', new Date(season.season + 'T12:00:00Z')
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })));
      for (const entry of entries) {
        const item = element('div', 'mr-history-row');
        item.append(element('b', '', entry.position + 'º'), element('span', '', entry.username),
          diamond(entry.diamonds), element('small', '', 'Entregue'));
        table.append(item);
      }
    }
    if (!table.children.length) table.append(element('p', 'mr-empty',
      view === 'awards' ? 'Nenhuma premiação recebida neste histórico.' : 'O histórico aparece após o primeiro fechamento.'));
    mine.append(button('Voltar à classificação', () => { view = 'current'; render(); }));
  }
  root.dataset.view = view;
  root.querySelector('.mr-history').setAttribute('aria-pressed', String(view === 'history'));
  root.querySelector('.mr-awards').setAttribute('aria-pressed', String(view === 'awards'));
  table.scrollTop = oldScroll;
  updateClock();
  const stale = Date.now() > Date.parse(snapshot.generatedAt) + 180000;
  status.textContent = stale ? 'Classificação anterior · aguardando atualização.'
    : '';
}
function schedule() {
  clearTimeout(timeout);
  if (!root || document.hidden) return;
  const wait = cache.wait();
  nextRefreshAt = Date.now() + wait;
  timeout = setTimeout(refresh, wait);
  updateClock();
}
async function refresh() {
  if (!root || document.hidden || loading) return;
  loading = true;
  updateClock();
  try {
    const next = await cache.load();
    if (!root) return;
    snapshot = next; render();
  } catch {
    if (root) status.textContent =
      'Ranking em preparação ou temporariamente indisponível. Nova tentativa automática.';
  } finally {
    loading = false;
    schedule();
  }
}
function close() {
  clearTimeout(timeout); clearInterval(ticker);
  root?.remove(); root = null;
  document.removeEventListener('keydown', keyboard);
  opener?.focus?.();
}
function keyboard(event) {
  if (event.key === 'Escape') { event.preventDefault(); close(); }
  if (event.key !== 'Tab' || !root) return;
  const nodes = [...root.querySelectorAll('button:not([disabled]), [tabindex="0"]')];
  const first = nodes[0], last = nodes.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
function open() {
  if (root) return;
  opener = document.activeElement;
  root = element('div', 'mr-overlay');
  const panel = element('section', 'mr-panel');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Rankings do mês');
  const heading = element('header', 'mr-header');
  heading.append(element('h1', 'mr-sr', 'Rankings do mês'));
  const exit = button('×', close, 'mr-close'); exit.setAttribute('aria-label', 'Fechar ranking');
  heading.append(exit);
  tabs = element('nav', 'mr-tabs'); tabs.setAttribute('role', 'tablist');
  for (const [key, name] of Object.entries(modes)) {
    const tab = button(name, () => { selected = key; view = 'current'; table.scrollTop = 0; render(); });
    tab.dataset.mode = key; tab.setAttribute('role', 'tab'); tabs.append(tab);
  }
  const prizes = element('div', 'mr-prizes');
  prizes.append(element('b', 'mr-prize-label', 'PRÊMIOS'));
  for (const [place, value] of [['1º', 100], ['2º–10º', 50], ['11º–100º', 25]]) {
    const tier = element('span', 'mr-tier');
    tier.append(element('b', '', place + ' • '), diamond(value)); prizes.append(tier);
  }
  clock = element('b', 'mr-clock', 'Prêmio mensal'); prizes.append(clock);
  const board = element('div', 'mr-board'); board.setAttribute('role', 'table');
  board.setAttribute('aria-label', 'Classificação mensal');
  const header = element('div', 'mr-columns'); header.setAttribute('role', 'row');
  for (const label of ['Pos.', 'Treinador', 'Pontos', 'Vitórias', 'Derrotas', 'Prêmio']) {
    const cell = element('b', '', label); cell.setAttribute('role', 'columnheader'); header.append(cell);
  }
  table = element('div', 'mr-rows'); table.setAttribute('role', 'rowgroup'); table.tabIndex = 0;
  board.append(header, table);
  mine = element('div', 'mr-pinned');
  const footer = element('footer', 'mr-footer');
  footer.append(button('Histórico mensal', () => { view = 'history'; table.scrollTop = 0; render(); }, 'mr-history'),
    button('Prêmios recebidos', () => { view = 'awards'; table.scrollTop = 0; render(); }, 'mr-awards'),
    element('small', '', 'Fechamento: dia 1, 00h · Brasília'));
  status = element('small', 'mr-status', 'Carregando classificação…'); status.setAttribute('role', 'status');
  const sync = element('div', 'mr-sync');
  lastUpdate = element('small', '', 'Última atualização: aguardando dados');
  nextUpdate = element('small', '', 'Atualizando…');
  sync.append(lastUpdate, nextUpdate, status);
  panel.append(heading, tabs, prizes, board, mine, footer, sync);
  root.append(panel); document.body.append(root);
  document.addEventListener('keydown', keyboard); exit.focus();
  snapshot = cache.peek();
  if (snapshot) render();
  void refresh(); ticker = setInterval(updateClock, 1000);
}
document.addEventListener('visibilitychange', () => {
  clearTimeout(timeout);
  if (root && !document.hidden) void refresh();
});
window.IDLE_MONTHLY_RANKINGS = Object.freeze({ open, close });
