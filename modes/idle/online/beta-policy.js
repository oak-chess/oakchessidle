/* Reduced online beta: presentation gates complement the server allowlist.
 * Never delete or convert resources when a feature is unavailable. */
(()=>{
 if(!window.OAK_ONLINE_SNAPSHOT)return;
 const text='Em breve · indisponível neste beta online. Seus recursos foram preservados.';
 const notify=()=>{dispatchEvent(new CustomEvent('idle-server-error',{detail:text}));return {ok:false,reason:text};};
 const wrap=(name,methods)=>{const original=window[name];if(typeof original!=='function')return;window[name]=function(...args){const model=original(...args);for(const method of methods)if(typeof model[method]==='function')model[method]=notify;return model;};};
 const preyOnline=window.OAK_ONLINE_SNAPSHOT.profile?.prey?.online===true;
 for(const name of ['createIdleGachaUI','createIdleMegaUI','createIdleMegaPortal','createIdleSafariUI','createIdleBattleTowerUI','createIdleRocketOperations','createIdleForgeUI',...(!preyOnline?['createIdlePreyUI']:[]),'createIdleEvents'])wrap(name,['open']);
 wrap('createIdleLegendaryAccess',['reveal','enter']);
 // Keep the welcome VIP active. Paid plans and boosts await server-side wallets.
 for(const key of ['convert','buy','activate','pause','purchase','buyPlan','bundle','utility','equip'])if(window.IDLE_VIP?.[key])window.IDLE_VIP[key]=notify;
 window.IDLE_BETA_POLICY={blocked:new Set(['rocket','safari','tower',...(!preyOnline?['prey']:[])]),notify,text};
 document.addEventListener('click',event=>{
  const target=event.target.closest('button,[role=button]');if(!target)return;
  const selector='#idleHoopaLaunch,#idleMegaLaunch,#idleTutorialLegacy';
  if(target.matches(selector)||target.closest('#idle-world nav')&&['activities','nursery','lab','events','challenges','quests'].includes(target.dataset.tab)){
   event.preventDefault();event.stopImmediatePropagation();notify();
  }
 },true);
})();
