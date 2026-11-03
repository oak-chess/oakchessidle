/* Panel positions use unscaled stage coordinates, so dragging follows game zoom. */
(()=>{
 'use strict';
 const stage=document.getElementById('stage');if(!stage)return;
 const setups=[['towerHud','.tower-hud-heading'],['liveBattleStats','header']];
 for(const [id,handleSelector] of setups){
  const panel=document.getElementById(id);if(!panel)continue;
  const key='oakchess_panel_position_v1_'+id;let position=null,drag=null;
  try{const p=JSON.parse(localStorage.getItem(key)||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))position=p}catch{}
  const limits=()=>({x:Math.max(0,stage.clientWidth-panel.offsetWidth-8),y:Math.max(0,stage.clientHeight-panel.offsetHeight-(panel.querySelector('.tower-position-guide')?.offsetHeight||0)-16)});
  function apply(x,y){const max=limits();x=Math.max(8,Math.min(max.x,x));y=Math.max(8,Math.min(max.y,y));panel.style.left=x+'px';panel.style.top=y+'px';panel.style.right='auto';panel.style.bottom='auto';panel.style.transform='none';return{x,y}}
  function restore(){if(!position||panel.hidden||drag)return;apply(position.x*stage.clientWidth,position.y*stage.clientHeight)}
  function save(){position={x:parseFloat(panel.style.left)/stage.clientWidth,y:parseFloat(panel.style.top)/stage.clientHeight};try{localStorage.setItem(key,JSON.stringify(position))}catch{}}
  function decorateHandle(){const handle=panel.querySelector(handleSelector);if(!handle||handle.dataset.movable)return;handle.dataset.movable='1';handle.tabIndex=0;handle.title='Arraste para mover · Setas para ajustar · Duplo clique para restaurar';handle.setAttribute('aria-label','Mover painel. Use as setas para ajustar a posição.');handle.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight');}
  panel.classList.add('movable-game-panel');
  panel.addEventListener('pointerdown',e=>{
   if(e.button!==0||!e.target.closest(handleSelector)||e.target.closest('button,a,input,summary'))return;
   const bounds=stage.getBoundingClientRect(),rect=panel.getBoundingClientRect(),sx=bounds.width/stage.clientWidth,sy=bounds.height/stage.clientHeight;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:(rect.left-bounds.left)/sx,top:(rect.top-bounds.top)/sy,sx,sy,moved:false};panel.setPointerCapture(e.pointerId);
  });
  panel.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<4)return;drag.moved=true;panel.classList.add('panel-dragging');apply(drag.left+dx/drag.sx,drag.top+dy/drag.sy);e.preventDefault()});
  const finish=e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;panel.classList.remove('panel-dragging');if(panel.hasPointerCapture(e.pointerId))panel.releasePointerCapture(e.pointerId);if(moved)save()};
  panel.addEventListener('pointerup',finish);panel.addEventListener('pointercancel',finish);panel.addEventListener('lostpointercapture',finish);
  panel.addEventListener('dblclick',e=>{if(!e.target.closest(handleSelector)||e.target.closest('button,a,input,summary'))return;position=null;try{localStorage.removeItem(key)}catch{}for(const prop of ['left','top','right','bottom','transform'])panel.style.removeProperty(prop);e.preventDefault()});
  panel.addEventListener('keydown',e=>{
   if(!e.target.matches(handleSelector)||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
   const bounds=stage.getBoundingClientRect(),rect=panel.getBoundingClientRect(),step=e.shiftKey?20:5;
   apply((rect.left-bounds.left)*stage.clientWidth/bounds.width+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),(rect.top-bounds.top)*stage.clientHeight/bounds.height+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0));save();e.preventDefault();e.stopPropagation();
  });
  new MutationObserver(()=>{decorateHandle();restore()}).observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  new ResizeObserver(restore).observe(panel);window.addEventListener('resize',restore);decorateHandle();restore();
 }
})();
