/* Move the panel independently of item dragging and its opening animation. */
(()=>{
 const overlay=document.getElementById('bagov'),panel=overlay?.querySelector('.bagp');
 if(!panel)return;
 const grip=document.createElement('button');
 grip.type='button';grip.className='bag-move';grip.setAttribute('aria-label','Mover mochila. Use as setas para reposicionar.');
 grip.title='Arraste para mover a mochila';grip.innerHTML='<span aria-hidden="true">••••••</span>';
 panel.append(grip);
 let x=0,y=0,drag=null;
 const positionKey='oakchess.bag-position.v1';
 try{
  const saved=JSON.parse(localStorage.getItem(positionKey));
  if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)){
   x=saved.x;y=saved.y;panel.style.translate=`${x}px ${y}px`;
  }
 }catch(e){}
 function savePosition(){
  try{localStorage.setItem(positionKey,JSON.stringify({x,y}))}catch(e){}
 }
 function move(dx,dy){
  const bounds=overlay.getBoundingClientRect(),r=panel.getBoundingClientRect();
  const sx=bounds.width/overlay.clientWidth||1,sy=bounds.height/overlay.clientHeight||1;
  // Reserve space for tabs, close control and the illustrated frame.
  const clamp=(v,lo,hi)=>lo>hi?(lo+hi)/2:Math.max(lo,Math.min(hi,v));
  x+=clamp(dx,bounds.left+8-r.left,bounds.right-8-r.right)/sx;
  y+=clamp(dy,bounds.top+24-r.top,bounds.bottom-8-r.bottom)/sy;
  panel.style.translate=`${x}px ${y}px`;
 }
 function stop(){if(drag)savePosition();drag=null;grip.classList.remove('moving')}
 grip.addEventListener('pointerdown',e=>{
  if(e.button!==0||!e.isPrimary)return;
  e.preventDefault();e.stopPropagation();
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  grip.setPointerCapture(e.pointerId);grip.classList.add('moving');
 });
 grip.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  move(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;
 });
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>grip.addEventListener(type,stop));
 grip.addEventListener('keydown',e=>{
  const d={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[e.key];
  if(d){e.preventDefault();e.stopPropagation();move(...d);savePosition()}
 });
 window.addEventListener('pagehide',()=>{if(drag)savePosition()});
 const observer=new ResizeObserver(()=>{if(overlay.classList.contains('show'))move(0,0)});
 observer.observe(overlay);observer.observe(panel);
 new MutationObserver(()=>{if(!overlay.classList.contains('show'))stop();else requestAnimationFrame(()=>move(0,0))}).observe(overlay,{attributes:true,attributeFilter:['class']});
})();
