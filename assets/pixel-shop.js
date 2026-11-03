/* Visual skin only: original shop handlers, economy and combat remain authoritative. */
(()=>{
 'use strict';
 document.body.classList.add('pixel-shop-hud');
 for(const id of ['buyxp','reroll','lock']){
  const el=document.getElementById(id);if(!el)continue;
  el.setAttribute('role','button');el.tabIndex=0;
  if(id==='buyxp')el.setAttribute('aria-label','Comprar 4 XP por 4 ouro');
  if(id==='reroll')el.setAttribute('aria-label','Rolar novas cartas por 2 ouro');
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)el.click()}});
 }
 const lock=document.getElementById('lock');
 if(lock){const sync=()=>{lock.setAttribute('aria-pressed',String(!!G.locked));lock.setAttribute('aria-label',G.locked?'Destravar loja':'Travar loja');lock.title=G.locked?'Ofertas preservadas na próxima batalha':'Preservar ofertas na próxima batalha'};sync();new MutationObserver(sync).observe(lock,{attributes:true,attributeFilter:['class']})}
})();
