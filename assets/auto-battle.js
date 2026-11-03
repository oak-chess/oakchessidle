/* Automatic starts never choose cards, events or paths for the player. */
(()=>{
 'use strict';
 const stage=document.getElementById('stage');if(!stage)return;
 const toggle=document.createElement('button');toggle.id='autoBattleToggle';toggle.type='button';toggle.hidden=true;
 toggle.title='Iniciar e continuar batalhas automaticamente. Clique novamente para desativar.';stage.append(toggle);
 let enabled=false,pending=null,elapsed=0,lastLabel='',run=null,holdTimer=null,suppressClick=false;
 document.body.classList.add('unified-combat-control');
 const clear=()=>{pending=null;elapsed=0};
 function render(label=''){const key=enabled+'|'+label;if(key===lastLabel)return;lastLabel=key;toggle.classList.toggle('on',enabled);toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'Desativar batalha automática':'Combater. Segure para ativar a batalha automática.');toggle.title=enabled?'Auto ligado · Clique para desativar':'Clique para combater · Segure para ativar o Auto';toggle.innerHTML='<span aria-hidden="true">'+(enabled?'↻':'▶')+'</span><b>'+(enabled?'AUTO':'LUTAR')+'</b>'+(label?'<small>'+label+'</small>':'')}
 function cancelHold(){clearTimeout(holdTimer);holdTimer=null;toggle.classList.remove('holding')}
 function startHold(){cancelHold();suppressClick=false;if(enabled||toggle.hidden||G.over||G.paused||G.eventModal)return;SND.init();toggle.classList.add('holding');holdTimer=setTimeout(()=>{cancelHold();if(toggle.hidden||G.over||G.paused||G.eventModal)return;suppressClick=true;enabled=true;clear();SND.click();render()},650)}
 toggle.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;startHold()});
 toggle.addEventListener('pointerup',cancelHold);
 toggle.addEventListener('pointerleave',cancelHold);
 toggle.addEventListener('pointercancel',()=>{cancelHold();suppressClick=true});
 toggle.addEventListener('contextmenu',e=>{e.preventDefault();cancelHold()});
 toggle.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();startHold()}else if((e.key===' '||e.key==='Enter')&&e.repeat)e.preventDefault()});
 toggle.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();cancelHold();toggle.click()}});
 toggle.addEventListener('blur',()=>{cancelHold();suppressClick=true});
 window.addEventListener('blur',cancelHold);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelHold()});
 toggle.addEventListener('click',e=>{e.stopPropagation();cancelHold();if(suppressClick){suppressClick=false;return}SND.init();SND.click();clear();if(enabled)enabled=false;else if(G.phase==='plan'&&!G.eventModal&&!G.paused)startCombat();render()});
 toggle.addEventListener('mouseenter',()=>SND.hover());
 window.AUTO_BATTLE={get enabled(){return enabled},stop(){cancelHold();enabled=false;clear();render()},update(dt){
  const capacity=document.getElementById('boardcnt');if(capacity){const count=boardCount()+'/'+G.lvl;if(capacity.dataset.count!==count)capacity.dataset.count=count}
  const playing=!G.over&&!DEMO.on&&!['starter','over'].includes(G.phase)&&!document.body.classList.contains('on-title');toggle.hidden=!playing||G.phase==='carousel'||document.body.classList.contains('car-on');
  const identity=G.tower?.id||G;if(run!==identity){cancelHold();if(run!==null)enabled=false;run=identity;clear()}
  if(!playing){cancelHold();enabled=false;clear();render();return}
  if(!enabled){clear();render();return}
  if(G.paused||document.hidden||BAG.open||document.querySelector('#menu.show')||window.TUT_ON||document.body.classList.contains('dragging')){clear();render('Aguardando');return}
  let action=null;
  const overlay=document.getElementById('towerOverlay');
  if(overlay){action=overlay.querySelector('[data-auto-continue]:not(:disabled)');if(!action){clear();render('Sua escolha');return}}
  else if(G.phase==='plan'&&!G.eventModal&&boardUnits().length+G.bench.filter(Boolean).length>0&&!G.evoQueue?.length){action='fight'}
  if(!action){clear();render(G.phase==='combat'?'Em combate':'Aguardando');return}
  if(pending!==action){pending=action;elapsed=0}
  elapsed+=Math.max(0,dt);render('Em '+Math.max(1,Math.ceil(3-elapsed))+'s');
  if(elapsed>=3){clear();if(action==='fight')startCombat();else if(action.isConnected)action.click()}
 }};
 render();
})();
