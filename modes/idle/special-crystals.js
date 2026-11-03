/* Category markers for the Idle arena units; evolution stars stay unchanged. */
(()=>{
 const legendary=new Set([144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646]);
 const mythical=new Set([151,251,385,386,489,490,491,492,493,494,647,648,649]);
 const category=id=>mythical.has(id)?'mythical':legendary.has(id)?'legendary':null;
 const css=document.createElement('style');css.textContent=`
 .unit .stars.special-crystal-marker{display:flex;align-items:center;justify-content:center;min-width:11px;height:13px;font-size:0;letter-spacing:0;overflow:visible}
 .special-crystal{position:relative;display:inline-block;width:10px;height:13px;filter:drop-shadow(0 1px 1px #080914) drop-shadow(0 0 3px var(--gem-glow));animation:categoryGemGlow 3.8s ease-in-out infinite}
 .special-crystal.legendary{--gem-light:#ffb0b8;--gem-mid:#ef3b58;--gem-dark:#840f35;--gem-glow:#ed345666}
 .special-crystal.mythical{--gem-light:#e5b9ff;--gem-mid:#b765ef;--gem-dark:#5b238c;--gem-glow:#bd77ff66}
 .special-crystal-body{position:absolute;inset:0;overflow:hidden;clip-path:polygon(50% 0,100% 35%,82% 76%,50% 100%,18% 76%,0 35%);background:conic-gradient(from 0deg at 50% 36%,var(--gem-light) 0 65deg,var(--gem-dark) 65deg 150deg,var(--gem-mid) 150deg 245deg,var(--gem-light) 245deg 300deg,var(--gem-mid) 300deg)}
 .special-crystal-body::after{content:'';position:absolute;inset:-45% -95%;background:linear-gradient(110deg,transparent 40%,#fff0 44%,#fff9 49%,#fff3 53%,transparent 58%);animation:categoryGemSheen 3.8s ease-in-out infinite;animation-delay:var(--gem-delay,0s)}
 .unit.shiny .special-crystal-marker::after{font-size:8px}
 @keyframes categoryGemSheen{0%,45%{transform:translateX(-65%)}75%,100%{transform:translateX(65%)}}
 @keyframes categoryGemGlow{0%,100%{filter:drop-shadow(0 1px 1px #080914) drop-shadow(0 0 2px var(--gem-glow))}55%{filter:drop-shadow(0 1px 1px #080914) drop-shadow(0 0 5px var(--gem-glow))}}
 @media(prefers-reduced-motion:reduce){.special-crystal,.special-crystal-body::after{animation:none}.special-crystal-body::after{opacity:.35}}
 `;document.head.append(css);
 function apply(u){
  const stars=u.el?.querySelector('.stars'),L=u.L||LINES[u.line];if(!stars||!L)return;
  const id=L.ids[Math.max(0,Math.min(L.ids.length-1,(u.star||1)-1))],kind=category(id);
  if(!kind){stars.classList.remove('special-crystal-marker');stars.removeAttribute('aria-label');stars.removeAttribute('role');stars.removeAttribute('title');return;}
  const label=kind==='mythical'?'Pokémon mítico':'Pokémon lendário';stars.classList.add('special-crystal-marker');stars.setAttribute('role','img');stars.setAttribute('aria-label',label);stars.title=label;
  stars.replaceChildren();const gem=document.createElement('span');gem.className='special-crystal '+kind;gem.setAttribute('aria-hidden','true');gem.style.setProperty('--gem-delay',-(id%7)*.31+'s');const body=document.createElement('span');body.className='special-crystal-body';gem.append(body);stars.append(gem);
 }
 const originalRefresh=refreshUnit,originalCombat=addCUEl;
 refreshUnit=function(u){const result=originalRefresh.apply(this,arguments);apply(u);return result};
 addCUEl=function(u){const result=originalCombat.apply(this,arguments);apply(u);return result};
 window.ARENA_SPECIAL_CRYSTALS={category,apply};
})();
