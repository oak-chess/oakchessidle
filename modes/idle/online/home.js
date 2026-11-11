import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const status = document.querySelector('#status');
const form = document.querySelector('#account-form');
const trainerForm = document.querySelector('#trainer-form');
const ready = document.querySelector('#ready');
let registering = false;
let busy = false;
let generation = 0;

if (!window.supabase) {
  status.textContent = 'Não foi possível carregar o login. Atualize a página.';
} else {
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  function mode(register) {
    registering = register;
    form.elements.username.required = register;
    document.querySelector('#name-label').hidden = !register;
    form.elements.password.autocomplete = register ? 'new-password' : 'current-password';
    document.querySelector('#login-tab').setAttribute('aria-pressed', String(!register));
    document.querySelector('#register-tab').setAttribute('aria-pressed', String(register));
    document.querySelector('#submit').textContent = register ? 'Criar minha conta' : 'Entrar';
    document.querySelector('#form-title').textContent = register ? 'Seu nome na jornada' : 'Bem-vindo de volta';
    status.textContent = register ? 'O nome será confirmado ao criar sua jornada.' : 'Entre com seu e-mail e senha.';
  }
  async function load(session) {
    const request = ++generation;
    form.hidden = Boolean(session);
    ready.hidden = trainerForm.hidden = true;
    if (!session) { mode(registering); return; }
    status.textContent = 'Carregando seu treinador…';
    const { data, error } = await client.from('profiles').select('username').maybeSingle();
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
    const buttons = [...document.querySelectorAll('button')];
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
      const credentials = { email, password };
      const { data, error } = registering
        ? await client.auth.signUp({ ...credentials, options: {
          emailRedirectTo: new URL('/', location.href).href,
          data: { trainer_name: form.elements.username.value.trim() }
        } })
        : await client.auth.signInWithPassword(credentials);
      form.elements.password.value = '';
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
