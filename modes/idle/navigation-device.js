/* Skin existing controls without replacing handlers, keyboard access or live state. */
(()=>{
 let latest='',queued=false,assetReady=false;
 function mount(){const nav=document.querySelector('.is-navigation'),action=nav?.querySelector('#combatbtn');if(!assetReady||!nav||!action)return false;if(nav.classList.contains('is-device-dock'))return true;nav.classList.add('is-device-dock');
  function sync(){queued=false;const village=nav.querySelector('#rv-village-launch');if(village){village.setAttribute('aria-label','Vila · pesca e fazenda');const pressed=String(document.body.classList.contains('rv-native-open'));if(village.getAttribute('aria-pressed')!==pressed)village.setAttribute('aria-pressed',pressed)}
   const buttons=[...nav.querySelectorAll(':scope>button')],active=buttons.filter(b=>b.getAttribute('aria-pressed')==='true'),chosen=document.body.classList.contains('rv-native-open')?village:active.find(b=>(b.dataset.menu||b.id)===latest)||active[0];
   for(const b of buttons){const value=String(b===chosen);if(b.dataset.deviceActive!==value)b.dataset.deviceActive=value}
   const text=action.textContent.trim(),state=/pausar/i.test(text)?'pause':/voltar/i.test(text)?'return':'explore';action.dataset.deviceState=state;action.dataset.deviceLabel=state==='pause'?'PAUSAR':state==='return'?'VOLTAR':'EXPLORAR';
  }
  const queue=()=>{if(!queued){queued=true;requestAnimationFrame(sync)}};
  nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b!==action)latest=b.dataset.menu||b.id;queue()});
  new MutationObserver(queue).observe(nav,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']});
  new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class']});const stage=nav.closest('#stage'),fit=()=>stage?.style.setProperty('--device-dock-height',nav.offsetHeight+'px');new ResizeObserver(fit).observe(nav);fit();sync();return true;
 }
 const timer=setInterval(()=>{if(mount())clearInterval(timer)},100),art=new Image();art.onload=()=>{assetReady=true;if(mount())clearInterval(timer)};art.onerror=()=>{clearInterval(timer);console.warn('Arte da navegação indisponível; controles originais preservados.')};art.src=new URL('modes/idle/assets/navigation/device-neutral.png',document.baseURI).href;
})();
