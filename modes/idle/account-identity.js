/* Presentation identity comes exclusively from the authenticated Supabase profile.
   This bridge does not upload or trust local progress, balances or inventories. */
(()=>{
  'use strict';
  let name='Conectando…',owner=null,generation=0,started=false;
  let onlineCount=null,accountClient=null,accountConfig=null;
  let arenaStatus=null,arenaOffer=null;
  const arenaRequests=new Map();
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
      accountConfig=config;
      const client=accountClient=lib.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
      let presencePending=false,presenceOwner=null;
      async function refreshPresence(){
        if(!owner||presencePending)return;
        const player=owner;
        presencePending=true;
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
        let count=null;
        try{
          const {data,error}=await client.rpc('refresh_player_presence').abortSignal(controller.signal);
          if(!error&&data!==null&&Number.isSafeInteger(Number(data))&&Number(data)>=0)count=Number(data);
        }catch{}finally{clearTimeout(timer);presencePending=false}
        if(owner===player)onlineCount=count;
      }
      setInterval(()=>void refreshPresence(),60000);
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden)void refreshPresence();
        void arena('status').then(()=>notify()).catch(()=>{});
      });
      async function load(session){
        const request=++generation;owner=null;
        arenaStatus=null;arenaOffer=null;arenaRequests.clear();
        if(!session){onlineCount=null;name='Entre na sua conta';notify();location.replace('/');return}
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
        if(profile.id!==presenceOwner)onlineCount=null;
        presenceOwner=owner=profile.id;name=profile.username;notify();
        void refreshPresence();
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
  async function arena(action,params={}){
    if(!owner||!accountClient)throw Error('Aguarde a conexão com sua conta.');
    const functions={status:'arena_status',defense:'arena_save_defense',search:'arena_find_opponent',history:'arena_history',play:'arena-battle'};
    if(!functions[action])throw Error('Ação inválida.');
    const now=Date.now(),player=owner;
    if(action==='status'&&arenaStatus?.owner===player&&arenaStatus.until>now)return arenaStatus.data;
    if(action==='search'&&arenaOffer?.owner===player&&arenaOffer.until>now)return arenaOffer.data;
    if(arenaRequests.has(action))return arenaRequests.get(action);
    const pending=execute();arenaRequests.set(action,pending);
    try{return await pending}finally{if(arenaRequests.get(action)===pending)arenaRequests.delete(action)}
    async function execute(){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),action==='play'?30000:12000);
    try{
      if(action==='play'){
        const {data:{session}}=await accountClient.auth.getSession();
        if(!session||session.user.id!==player)throw Error('Entre novamente na sua conta.');
        const response=await fetch(accountConfig.SUPABASE_URL+'/functions/v1/arena-battle',{
          method:'POST',headers:{Authorization:'Bearer '+session.access_token,apikey:accountConfig.SUPABASE_ANON_KEY,
          'Content-Type':'application/json'},body:JSON.stringify({offerId:params.offerId}),signal:controller.signal});
        const result=await response.json();
        if(!response.ok)throw Error(result.error||'Não foi possível iniciar a batalha.');
        if(owner!==player)throw Error('A conta mudou. Abra a Arena novamente.');
        arenaStatus=null;arenaOffer=null;
        return result;
      }
      const {data,error}=await accountClient.rpc(functions[action],params).abortSignal(controller.signal);
      if(error)throw Error(error.code==='P0001'?error.message:
        ['PGRST202','42883'].includes(error.code)?'A Arena ainda precisa ser ativada no Supabase. As funções de busca e defesa não estão disponíveis.':
        'Não foi possível conectar à Arena. Clique novamente para tentar.');
      if(owner!==player)throw Error('A conta mudou. Abra a Arena novamente.');
      if(action==='status'||action==='defense'){
        arenaStatus={owner:player,data,until:Date.now()+30000};
        if(action==='defense')arenaOffer=null;
      }
      if(action==='search')arenaOffer={owner:player,data,until:data.opponent
        ?Math.min(Date.parse(data.expiresAt)||Date.now(),Date.now()+120000):Date.now()+30000};
      return data;
    }finally{clearTimeout(timer)}
    }
  }
  Object.defineProperty(window,'IDLE_ACCOUNT_IDENTITY',{value:Object.freeze({bind,start,arena,get arenaEligibility(){const a=arenaStatus?.data;return a?{eligible:a.trainerLevel>=200&&a.available?.length>=6,level:a.trainerLevel,count:a.available?.length||0}:null},get arenaPoints(){return arenaStatus?.data?.points??null},get name(){return name},get authenticated(){return !!owner},get onlineCount(){return owner?onlineCount:null}})});
  if(location.protocol==='http:'||location.protocol==='https:')void start();
})();
