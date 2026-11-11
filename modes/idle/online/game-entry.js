import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// No engine, game state or local-save code runs before server-side auth validation.
const status = document.querySelector('#entry-status');
const retry = document.querySelector('#entry-retry');
retry.onclick = () => location.reload();
const home = () => location.replace('/');
try {
 if (!window.supabase) throw new Error('Biblioteca de acesso indisponível.');
 const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 const { data: { session }, error: sessionError } = await client.auth.getSession();
 if (sessionError || !session) home();
 else {
  // getSession alone is not proof: validate the access token with Supabase Auth.
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user || user.id !== session.user.id) home();
  else {
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), 15000);
   try {
    const [{data:profile,error:profileError},{data:journey,error:journeyError}] = await Promise.all([
     client.from('profiles').select('id,username').eq('id',user.id).abortSignal(controller.signal).maybeSingle(),
     client.from('journeys').select('owner_id').eq('owner_id',user.id).abortSignal(controller.signal).maybeSingle()
    ]);
    if(profileError || journeyError) throw new Error('Não foi possível verificar sua jornada.');
    if(!profile?.username || !journey) home();
    else {
     const response = await fetch('/game-shell.txt', { cache:'no-store', signal:controller.signal });
     if(!response.ok) throw new Error('Não foi possível carregar o jogo.');
     const html = await response.text();
     if(!/^<!doctype html>/i.test(html.trimStart())) throw new Error('Arquivo do jogo indisponível.');
     // The payload is served as plain text, so navigating to it cannot launch the game.
     document.open(); document.write(html.replace('<base href="./">','<base href="/">')); document.close();
    }
   } finally {clearTimeout(timer);}
  }
 }
} catch {
 status.textContent = 'Não foi possível confirmar seu acesso. Verifique a conexão e tente novamente.';
 retry.hidden = false;
}
