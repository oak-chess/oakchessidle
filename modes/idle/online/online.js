import { SUPABASE_URL, SUPABASE_ANON_KEY, HUNT_API_URL, CHAT_SERVER_URL, MARKET_ENABLED } from './config.js';

const status = document.querySelector('#status');
const authForm = document.querySelector('#auth');
const setup = document.querySelector('#setup');
const profile = document.querySelector('#profile');
const logout = document.querySelector('#logout');
const hunt = document.querySelector('#hunt');
const huntStart = document.querySelector('#hunt-start');
const huntFinish = document.querySelector('#hunt-finish');
const huntStatus = document.querySelector('#hunt-status');

if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  start(window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
} else {
  status.textContent = 'Ambiente online ainda sem configuração.';
}

function start(client) {
  let generation = 0;
  let activePlayer;
  let requestId;
  let encounterId;
  let busy = false;
  let chatSession;
  let chatMount;
  let marketMount;
  const huntClient = HUNT_API_URL
    ? import('./hunt-client.mjs').then(({ createHuntClient }) => createHuntClient(client.auth, HUNT_API_URL))
    : null;

  async function syncMarket(request, owner, inventory) {
    if (!MARKET_ENABLED) return;
    try {
      marketMount ??= import('./market-ui.mjs').then(({ mountMarket }) =>
        mountMarket(client, async player => {
          const { data } = await client.auth.getSession();
          if (data.session?.user.id === player) await load(data.session);
        })
      );
      const update = await marketMount;
      if (request === generation) update(owner, inventory);
    } catch {
      marketMount = undefined;
    }
  }

  async function syncChat(session) {
    const token = session?.access_token;
    if (!CHAT_SERVER_URL || token === chatSession) return;
    chatSession = token;
    try {
      chatMount ??= Promise.all([
        import('./chat-client.mjs'),
        import('https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/+esm')
      ]).then(([{ mountChat }, { io }]) => mountChat(client, CHAT_SERVER_URL, io));
      const updateChat = await chatMount;
      if (chatSession === token) updateChat(session);
    } catch {
      chatMount = undefined;
      if (chatSession === token) {
        document.querySelector('#chat').hidden = !session;
        document.querySelector('#chat-status').textContent = 'Não foi possível carregar o chat.';
      }
    }
  }

  function renderHunt() {
    huntStart.disabled = busy;
    huntStart.hidden = Boolean(encounterId);
    huntFinish.disabled = busy;
    huntFinish.hidden = !encounterId;
  }

  async function load(session) {
    const request = ++generation;
    profile.textContent = '';
    setup.hidden = true;
    authForm.hidden = Boolean(session);
    logout.hidden = !session;
    hunt.hidden = true;
    document.querySelector('#market').hidden = true;
    if (activePlayer !== session?.user.id) {
      activePlayer = session?.user.id;
      requestId = encounterId = undefined;
      huntStatus.textContent = '';
      renderHunt();
    }
    if (!session) {
      void syncMarket(request);
      void syncChat(null);
      status.textContent = 'Entre com sua conta.';
      return;
    }

    status.textContent = 'Carregando jornada…';
    const result = await Promise.all([
      client.from('profiles').select('username').maybeSingle(),
      client.from('journeys').select('gold,trainer_level').maybeSingle(),
      client.from('inventory').select('id,pokemon_id,level,is_listed').order('id')
    ]);
    if (request !== generation) return;
    if (result.some(response => response.error)) {
      status.textContent = 'Não foi possível carregar a jornada. Atualize a página para tentar novamente.';
      return;
    }

    const [account, journey, inventory] = result.map(response => response.data);
    void syncMarket(request, journey ? session.user.id : undefined, inventory);
    void syncChat(journey ? session : null);
    setup.hidden = Boolean(journey);
    status.textContent = journey ? 'Jornada carregada.' : 'Escolha seu nome de treinador.';
    if (journey) {
      hunt.hidden = !huntClient;
      if (huntClient && !busy && !encounterId) {
        try {
          const { encounter } = await (await huntClient).active();
          if (request === generation && !busy && encounter) {
            encounterId = encounter.id;
            huntStatus.textContent = 'Encontro recuperado.';
            renderHunt();
          }
        } catch (error) {
          if (request === generation && !busy) huntStatus.textContent = error.message;
        }
      }
      if (request !== generation) return;
      profile.textContent = [
        account.username,
        'Nível ' + journey.trainer_level,
        journey.gold.toLocaleString('pt-BR') + ' Coins',
        ...inventory.map(item => 'Pokémon #' + item.pokemon_id + ' · Nv. ' + item.level)
      ].join(' · ');
    }
  }

  async function runHuntAction(action) {
    if (!huntClient || !activePlayer || busy) return;
    const player = activePlayer;
    busy = true;
    renderHunt();
    try {
      const result = await action(await huntClient);
      if (activePlayer !== player) return;
      if (result.id && !result.finished_at) {
        encounterId = result.id;
        huntStatus.textContent = 'Encontro pronto.';
        return;
      }
      const outcome = result.result ?? result;
      requestId = encounterId = undefined;
      huntStatus.textContent = outcome.won ? 'Vitória · +' + outcome.coins + ' Coins' : 'Derrota';
      const { data } = await client.auth.getSession();
      if (activePlayer === player && data.session?.user.id === player) await load(data.session);
    } catch (error) {
      if (activePlayer === player) huntStatus.textContent = error.message;
    } finally {
      busy = false;
      renderHunt();
    }
  }

  huntStart.addEventListener('click', () => runHuntAction(api =>
    api.start('viridian-trails', requestId ??= crypto.randomUUID())
  ));
  huntFinish.addEventListener('click', () => runHuntAction(api => api.finish(encounterId)));

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(authForm);
    const credentials = { email: form.get('email'), password: form.get('password') };
    const registering = event.submitter?.value === 'register';
    const { data, error } = registering
      ? await client.auth.signUp(credentials)
      : await client.auth.signInWithPassword(credentials);
    authForm.reset();
    if (error) status.textContent = 'Não foi possível concluir. Confira os dados e tente novamente.';
    else if (registering && !data.session) status.textContent = 'Confira seu e-mail para confirmar a conta.';
  });

  setup.addEventListener('submit', async event => {
    event.preventDefault();
    const request = generation;
    const username = new FormData(setup).get('username');
    const { error } = await client.rpc('initialize_journey', { requested_username: username });
    if (generation !== request) return;
    if (error) {
      status.textContent = error.code === '23505' ? 'Este nome já está em uso.' : 'Não foi possível criar a jornada.';
      return;
    }
    const { data } = await client.auth.getSession();
    if (generation === request) await load(data.session);
  });

  logout.addEventListener('click', async () => {
    const { error } = await client.auth.signOut();
    if (error) status.textContent = 'Não foi possível sair. Tente novamente.';
  });
  // Run database requests outside the Supabase authentication callback.
  client.auth.onAuthStateChange((_event, session) => setTimeout(() => load(session), 0));
}
