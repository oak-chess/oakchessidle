/* Presentation identity comes exclusively from the authenticated Supabase profile.
   This bridge does not upload or trust local progress, balances or inventories. */
(()=>{
  'use strict';
  let name='Conectando…',owner=null,generation=0,started=false;
  const bindings=new Set();
  function notify(){
    for(const {refresh} of bindings)refresh?.();
    dispatchEvent(new Event('idle-profile-change'));
    dispatchEvent(new CustomEvent('idle-account-identity-change',{detail:{name,authenticated:!!owner}}));
  }
  function bind(state,refresh){
    state.idleProfile=state.idleProfile||{trainer:'red',partner:null};
    const profile=state.idleProfile;
    // Local saves may contain an old nickname; it must never become account identity.
    Object.defineProperty(profile,'name',{enumerable:true,configurable:false,get:()=>name,set:()=>{}});
    const binding={refresh};bindings.add(binding);
    return ()=>bindings.delete(binding);
  }
  async function sdk(){
    if(window.supabase)return window.supabase;
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=new URL('assets/vendor/supabase.js',document.baseURI).href;
      script.onload=resolve;script.onerror=()=>reject(Error('Account library unavailable'));document.head.append(script);
    });
    return window.supabase;
  }
  async function start(){
    if(started)return;started=true;
    try{
      const [config,lib]=await Promise.all([import(new URL('modes/idle/online/config.js',document.baseURI).href),sdk()]);
      const client=lib.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
      async function load(session){
        const request=++generation;owner=null;
        if(!session){name='Entre na sua conta';notify();return}
        name='Conectando…';notify();
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
        let response;
        try{response=await client.from('profiles').select('id,username').eq('id',session.user.id).abortSignal(controller.signal).maybeSingle()}
        catch{response={error:true}}
        finally{clearTimeout(timer)}
        if(request!==generation)return;
        if(response.error){name='Conta indisponível';notify();return}
        const profile=response.data;
        if(!profile||!profile.username){name='Conclua seu cadastro';notify();return}
        owner=profile.id;name=profile.username;notify();
      }
      // Run profile queries outside the auth callback lock.
      let token;
      client.auth.onAuthStateChange((_event,session)=>{
        if(token===session?.access_token&&token!==undefined)return;
        token=session?.access_token||null;
        setTimeout(()=>void load(session),0);
      });
    }catch{owner=null;name='Conta indisponível';notify()}
  }
  Object.defineProperty(window,'IDLE_ACCOUNT_IDENTITY',{value:Object.freeze({bind,start,get name(){return name},get authenticated(){return !!owner}})});
  if(location.protocol==='http:'||location.protocol==='https:')void start();
})();
