/* Reveal the existing arena during event choices; never rebuild the board. */
(()=>{
 const trigger=document.createElement('button');trigger.type='button';trigger.className='team-view-trigger';trigger.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10s3-4 8-4 8 4 8 4-3 4-8 4-8-4-8-4Z"/><circle cx="10" cy="10" r="2.5"/></svg><span>Ver tabuleiro</span><kbd>V</kbd>';trigger.setAttribute('aria-label','Ver tabuleiro e banco');trigger.setAttribute('aria-keyshortcuts','V');trigger.hidden=true;trigger.dataset.teamViewControl='';document.body.append(trigger);
 const back=document.createElement('button');back.type='button';back.className='team-view-return';back.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 5-5 5 5 5M3 10h10a4 4 0 0 0 0-8"/></svg><span>Voltar à escolha</span><kbd>V</kbd>';back.setAttribute('aria-keyshortcuts','V');back.hidden=true;back.dataset.teamViewControl='';document.body.append(back);
 let host=null,focus=null,opened=false,wasPaused=false,units=[],originalTheme=null,previewTheme=null;
 function eventHost(){const rocket=document.getElementById('rocketOperationOverlay');if(rocket&&G.rocketOperation&&G.phase!=='starter'&&!G.over&&G.rocketOperation.status!=='starter')return rocket;const carousel=document.querySelector('#carousel.show');if(carousel)return carousel;const event=document.getElementById('eventov');if(event)return event;if(G.phase!=='starter'&&G.eventModal&&!G.over)return document.getElementById('towerOverlay');return null}

 function nextBattleTheme(){if(host?.id!=='carousel'||G.tower)return null;let info=null;for(let i=G.ri+1;i<SCHED.length;i++){const r=getRound(i);if(r&&r.kind!=='carousel'){info=r;break}}if(!info)return null;
 if(info.event==='bird'&&birdChosen())return BIRD_THEME0+G.bird;
 if(info.kind==='boss'&&info.gym<8)return info.gym;
 if(info.kind==='e4')return E4_THEME0+info.lg;
 if(info.kind==='champ')return E4_THEME0+4;
 if(info.kind==='secret')return E4_THEME0+5;
 if(info.kind==='boss'||(info.st<2&&info.rn<2))return -1;
 const route=info.event==='rocket'?1:((G.npcSeed||0)+info.st*3+info.rn)%3;return ROUTE_THEME0+route}
 function close(){if(!opened)return;opened=false;if(originalTheme!==null&&previewTheme!==null&&ARENA_TID===previewTheme&&host?.isConnected&&eventHost()===host)setArenaTheme(originalTheme);originalTheme=previewTheme=null;host?.classList.remove('team-view-event-hidden');units.forEach(el=>el.classList.remove('team-view-real-unit'));units=[];document.body.classList.remove('team-view-real');back.hidden=true;G.paused=wasPaused;hideTip();sync();if(focus?.isConnected)focus.focus();SND.mback()}
 function show(){if(opened)return;host=eventHost();if(!host)return;focus=document.activeElement;wasPaused=G.paused;G.paused=true;opened=true;hideTip();originalTheme=ARENA_TID;previewTheme=nextBattleTheme();if(previewTheme!==null&&previewTheme!==ARENA_TID)setArenaTheme(previewTheme);host.classList.add('team-view-event-hidden');document.body.classList.add('team-view-real');units=allUnits().map(u=>u.el).filter(Boolean);units.forEach(el=>el.classList.add('team-view-real-unit'));trigger.hidden=true;back.hidden=false;back.focus();SND.init();SND.msel()}
 function sync(){const shortcut=gameKey('view'),label=shortcut===' '?'Espaço':shortcut.toUpperCase();for(const control of [trigger,back]){const badge=control.querySelector('kbd');if(badge.textContent!==label)badge.textContent=label;control.setAttribute('aria-keyshortcuts',shortcut===' '?'Space':label)}const active=eventHost();if(opened){if(!host?.isConnected||active!==host)close();return}if(trigger.parentElement!==document.body)document.body.append(trigger);trigger.hidden=!active}
 trigger.onclick=show;back.onclick=close;
 // Both states share a viewport-relative position. A drag must not trigger a click.
 const positionKey='oakchess_board_peek_position_v1';let position=null,dragging=null,suppressUntil=0;
 try{const saved=JSON.parse(localStorage.getItem(positionKey)||'null');if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))position=saved}catch{}
 function moveControls(x,y){const width=Math.max(trigger.offsetWidth,back.offsetWidth,190),height=Math.max(trigger.offsetHeight,back.offsetHeight,40);x=Math.max(8,Math.min(Math.max(8,innerWidth-width-8),x));y=Math.max(8,Math.min(Math.max(8,innerHeight-height-8),y));for(const button of [trigger,back]){button.style.left=x+'px';button.style.top=y+'px';button.style.transform='none'}return{x,y}}
 function restorePosition(){if(!position||dragging)return;moveControls(position.x*innerWidth,position.y*innerHeight)}
 for(const button of [trigger,back]){
  button.title='Arraste para mover · Botão direito para centralizar';
  button.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;const r=button.getBoundingClientRect();dragging={id:e.pointerId,button,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};button.setPointerCapture(e.pointerId)});
  button.addEventListener('pointermove',e=>{const d=dragging;if(!d||d.button!==button||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<6)return;d.moved=true;button.classList.add('team-view-dragging');moveControls(d.left+dx,d.top+dy);e.preventDefault()});
  const finish=e=>{const d=dragging;if(!d||d.button!==button||d.id!==e.pointerId)return;dragging=null;button.classList.remove('team-view-dragging');if(d.moved){suppressUntil=performance.now()+450;position={x:parseFloat(button.style.left)/innerWidth,y:parseFloat(button.style.top)/innerHeight};try{localStorage.setItem(positionKey,JSON.stringify(position))}catch{}}if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId)};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,finish);
  button.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
  button.addEventListener('contextmenu',e=>{e.preventDefault();position=null;try{localStorage.removeItem(positionKey)}catch{}for(const control of [trigger,back])for(const prop of ['left','top','transform'])control.style.removeProperty(prop)});
  new ResizeObserver(restorePosition).observe(button);
 }
 window.addEventListener('resize',restorePosition);restorePosition();
 // Preserve hover inspection while preventing moves or event choices during this lookup.
 for(const name of ['pointerdown','click','contextmenu','touchstart'])window.addEventListener(name,e=>{if(!opened||e.target.closest('[data-team-view-control]'))return;if(e.target.closest('#combatbtn')&&G.rocketOperation&&['intro','plan'].includes(G.rocketOperation.status)){close();window.ROCKET_OPERATION?.plan();return}e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false});
 window.addEventListener('keydown',e=>{if(e.key.toLowerCase()===gameKey('view').toLowerCase()&&!document.querySelector('#menu.show')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,textarea,select,[contenteditable=true]')&&(opened||eventHost())){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){if(opened)close();else show()}return}if(!opened||e.ctrlKey||e.metaKey||['F5','F11','F12'].includes(e.key))return;e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape'||((e.key==='Enter'||e.key===' ')&&!e.repeat))close();else if(e.key==='Tab')back.focus()},true);
 setInterval(sync,180);sync();window.TEAM_VIEW={open:show,close,get isOpen(){return opened}};
})();
