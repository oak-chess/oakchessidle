import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const status = document.querySelector('#status');
const form = document.querySelector('#account-form');
const trainerForm = document.querySelector('#trainer-form');
const ready = document.querySelector('#ready');
let registering = true;
let busy = false;
let generation = 0;

if (!window.supabase) {
  status.textContent = 'Não foi possível carregar o login. Atualize a página.';
} else {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  document.querySelector('#submit').disabled = false;
  function mode(register) {
    registering = register;
    form.elements.username.required = register;
    form.elements.confirmation.required = register;
    document.querySelector('#confirm-label').hidden = !register;
    document.querySelector('#login-tab').hidden = !register;
    document.querySelector('#register-tab').hidden = register;
    document.querySelector('#name-label').hidden = !register;
    form.elements.password.autocomplete = register ? 'new-password' : 'current-password';
    document.querySelector('#login-tab').setAttribute('aria-pressed', String(!register));
    document.querySelector('#register-tab').setAttribute('aria-pressed', String(register));
    document.querySelector('#submit').textContent = register ? 'CRIAR CONTA' : 'ENTRAR';
    document.querySelector('#form-title').textContent = register ? 'Comece sua jornada' : 'Bem-vindo de volta';
    status.textContent = register ? 'O nome será confirmado ao criar sua jornada.' : 'Entre com seu e-mail e senha.';
  }
  async function load(session) {
    const request = ++generation;
    form.hidden = Boolean(session);
    document.querySelector('.account-switch').hidden = Boolean(session);
    ready.hidden = trainerForm.hidden = true;
    if (!session) { mode(registering); return; }
    status.textContent = 'Carregando seu treinador…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try { response = await client.from('profiles').select('username').abortSignal(controller.signal).maybeSingle(); }
    catch { response = { error: true }; }
    finally { clearTimeout(timeout); }
    const { data, error } = response;
    if (request !== generation) return;
    if (error) { status.textContent = 'Não foi possível carregar sua conta. Atualize para tentar novamente.'; return; }
    if (!data) {
      trainerForm.hidden = false;
      trainerForm.elements.username.value = session.user.user_metadata?.trainer_name || '';
      status.textContent = 'Confirme seu nome de treinador para iniciar.';
      return;
    }
    ready.hidden = false;
    document.querySelector('#trainer-name').textContent = '@' + data.username;
    status.textContent = 'Conta conectada.';
  }
  async function action(callback) {
    if (busy) return;
    busy = true;
    const buttons = [...document.querySelectorAll('.account button')];
    buttons.forEach(button => button.disabled = true);
    try { await callback(); }
    catch { status.textContent = 'Não foi possível concluir. Tente novamente.'; }
    finally { busy = false; buttons.forEach(button => button.disabled = false); }
  }
  document.querySelector('#login-tab').onclick = () => mode(false);
  document.querySelector('#register-tab').onclick = () => mode(true);
  form.onsubmit = event => {
    event.preventDefault();
    void action(async () => {
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      if (registering && password !== form.elements.confirmation.value) {
        status.textContent = 'As senhas não coincidem. Confira a confirmação.';
        form.elements.confirmation.focus();
        return;
      }
      const credentials = { email, password };
      const { data, error } = registering
        ? await client.auth.signUp({ ...credentials, options: {
          emailRedirectTo: new URL('/', location.href).href,
          data: { trainer_name: form.elements.username.value.trim() }
        } })
        : await client.auth.signInWithPassword(credentials);
      form.elements.password.value = '';
      form.elements.confirmation.value = '';
      if (error) status.textContent = 'Confira os dados de acesso e tente novamente.';
      else if (registering && !data.session) {
        status.textContent = 'Confira seu e-mail para confirmar a conta. Depois, volte aqui e entre.';
      }
    });
  };
  trainerForm.onsubmit = event => {
    event.preventDefault();
    void action(async () => {
      const { error } = await client.rpc('initialize_journey', {
        requested_username: trainerForm.elements.username.value.trim()
      });
      if (error) {
        status.textContent = error.code === '23505' ? 'Esse nome já está em uso. Escolha outro.' : 'Não foi possível criar o treinador.';
        return;
      }
      const { data } = await client.auth.getSession();
      await load(data.session);
    });
  };
  document.querySelector('#signout').onclick = () => void action(async () => {
    const { error } = await client.auth.signOut();
    if (error) status.textContent = 'Não foi possível sair. Tente novamente.';
  });
  client.auth.onAuthStateChange((_event, session) => setTimeout(() => void load(session), 0));
}


const helpDialog = document.querySelector('#home-help');
const helpTitle = document.querySelector('#help-title');
const helpContent = document.querySelector('#help-content');
const helpPages = {
  rocket: ['Invasões Rocket', [['Central de interceptação', 'Prepare sua equipe para enfrentar as invasões da Equipe Rocket. No jogo, o painel mostra o próximo grupo, as condições de entrada e as recompensas.']]],
  safari: ['Safari', [['Explore e capture', 'Visite a reserva, descubra o cenário sorteado e encontre Pokémon. As regras de entrada, duração e captura aparecem no painel Safari dentro do jogo.']]],
  hunts: ['Caçadas', [['Sua equipe em ação', 'Escolha uma área, organize seus Pokémon e configure a recuperação da equipe. As batalhas automáticas permitem ganhar experiência e recursos para evoluir.']]],
  tower: ['Torre de Batalha', [['Uma nova escalada', 'Enfrente andares com sua própria equipe. Seus sobreviventes seguem em frente, enfrentando regras e chefes ao longo da subida.']]],
  wiki: ['Wiki · Primeiros passos', [
    ['Sua jornada', 'Crie sua conta, confirme o e-mail e escolha um nome único de treinador. Esse nome identifica você no PokéChat.'],
    ['Caçadas e equipe', 'Monte sua equipe e escolha uma área de caçada. Dentro do jogo, a Wiki detalha os sistemas, regras de combate, capturas e cálculos.'],
    ['Modos', 'Invasões Rocket, Safari e Torre de Batalha oferecem atividades diferentes. Consulte os requisitos de entrada no painel de cada modo.']
  ]],
  support: ['Suporte · Acesso à conta', [
    ['Não recebeu a confirmação?', 'Confira a caixa de spam e se o e-mail foi digitado corretamente. Após confirmar o cadastro, volte à página e escolha Entrar.'],
    ['Problemas de conexão', 'Confira sua conexão e tente novamente. O chat pode precisar de alguns instantes para se conectar.'],
    ['Relatar um problema', 'Anote seu nome de treinador, o horário, o que aconteceu e inclua uma captura de tela ao falar com a administração. Nunca envie sua senha. Este painel é uma central de orientações; ainda não há envio de chamados por aqui.']
  ]]
};
document.querySelectorAll('[data-help]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.help;
    const [title, sections] = helpPages[key];
    const looks = {
      wiki: ['town-map', 'GUIA DO TREINADOR'], support: ['exp-share', 'CENTRAL DE AJUDA'],
      rocket: ['black-glasses', 'OPERAÇÃO ROCKET'], safari: ['net-ball', 'RESERVA POKÉMON'],
      hunts: ['poke-ball', 'EXPLORAÇÃO E CAPTURAS'], tower: ['kings-rock', 'DESAFIO DA TORRE']
    };
    const [icon, kicker] = looks[key];
    helpDialog.dataset.theme = key;
    document.querySelector('#help-icon').src = 'assets/pokeapi/sprites/items/' + icon + '.png';
    document.querySelector('#help-kicker').textContent = kicker;
    helpTitle.textContent = title;
    helpContent.replaceChildren();
    for (const [heading, body] of sections) {
      const section = document.createElement('section');
      const h = document.createElement('h3'); h.textContent = heading;
      const p = document.createElement('p'); p.textContent = body;
      section.append(h, p); helpContent.append(section);
    }
    helpDialog.showModal();
  });
});
document.querySelector('#dismiss-help').addEventListener('click', () => helpDialog.close());
document.querySelector('#close-help').addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('click', event => { if(event.target === helpDialog) {
  const r = helpDialog.getBoundingClientRect();
  if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) helpDialog.close();
}});

