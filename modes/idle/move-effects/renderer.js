/* Visual-only Idle adapter. Combat owns movement, arrival and damage. */
(()=>{
 'use strict';
 const base=window.EMERALD_MOVES,specs=window.IDLE_APPROVED_EFFECTS;
 if(!base||!specs)return;
 const images=new Map(),effects=[];
 const key=mv=>typeof mv==='string'?mv:mv?.emerald||window.EMERALD_ALIASES?.[mv?.n]||mv?.n;
 function resource(mv){
  const k=key(mv),spec=specs[k];if(!spec)return null;
  if(!images.has(k)){
   const image=new Image(),entry={image,loaded:false};
   entry.promise=new Promise(resolve=>{image.onload=()=>{entry.loaded=true;resolve(true)};image.onerror=()=>resolve(false)});
   image.src='modes/idle/move-effects/'+spec.id+'.png';images.set(k,entry);
  }
  return {key:k,...spec,...images.get(k)};
 }
 function frame(g,r,x,y,time,size=1,loop=false){
  if(!r.loaded)return false;
  const index=loop?Math.floor(time*r.fps)%r.phases:Math.min(r.phases-1,Math.floor(time*r.fps));
  g.save();g.imageSmoothingEnabled=false;
  g.drawImage(r.image,index*r.w,0,r.w,r.h,Math.round(x-r.w*size/2),Math.round(y-r.h*size*.7),r.w*size,r.h*size);
  g.restore();return true;
 }
 function emit(r,x,y,extra={}){
  if(effects.length>=80)effects.shift();
  effects.push({r,x,y,t:0,life:r.phases/r.fps,...extra});return true;
 }
 const original={};for(const n of ['start','hit','beam','projectile','update','draw','clear','warmMoves'])original[n]=base[n].bind(base);
 base.warmMoves=moves=>Promise.all([original.warmMoves(moves),...moves.map(resource).filter(Boolean).map(r=>r.promise)]);
 base.start=(mv,x,y)=>{
  const r=resource(mv);if(!r?.loaded)return original.start(mv,x,y);
  return r.mode==='self'||(r.mode==='area'&&mv.k==='burst'&&r.key!=='SURF')?emit(r,x,y):true;
 };
 base.hit=(mv,x,y,scale=1,source)=>{
  const r=resource(mv);if(!r?.loaded)return original.hit(mv,x,y,scale);
  if(r.mode==='self'||mv.k==='beam'||mv.k==='chain'||(r.mode==='area'&&mv.k==='burst'))return true;
  if(r.key==='VINE_WHIP'&&source)return emit(r,source.x,source.y,{x2:x,y2:y,beam:true});
  return emit(r,x,y,{scale:Math.max(.65,Math.min(1.35,scale))});
 };
 base.beam=(mv,x,y,x2,y2,width)=>{
  const r=resource(mv);if(!r?.loaded)return original.beam(mv,x,y,x2,y2,width);
  if(r.key==='VINE_WHIP')return emit(r,x,y,{x2,y2,beam:true});
  if(r.mode==='beam'||r.key==='SURF')return emit(r,x,y,{x2,y2,travel:true,life:Math.max(.55,r.phases/r.fps)});
  return emit(r,x2,y2);
 };
 base.projectile=(g,p)=>{
  const r=resource(p.o?.move);if(!r?.loaded)return original.projectile(g,p);
  // Impact/area sheets belong at arrival, never on the projectile as well.
  if(r.mode!=='projectile')return true;
  // Follow the real projectile, never start a second independent flight.
  const size=Math.min(48,30*(p.size||1))/Math.max(r.w,r.h);
  return frame(g,r,p.x+(p.ox||0),p.y+(p.oy||0),p.age||0,size,true);
 };
 base.update=dt=>{
  original.update(dt);const step=Number.isFinite(dt)?Math.max(0,dt):0;
  for(let i=effects.length-1;i>=0;i--){effects[i].t+=step;if(effects[i].t>=effects[i].life)effects.splice(i,1)}
 };
 base.draw=g=>{
  original.draw(g);
  for(const e of effects){
   const r=e.r;
   if(e.travel){
    const q=Math.min(1,e.t/e.life);frame(g,r,e.x+(e.x2-e.x)*q,e.y+(e.y2-e.y)*q,e.t,1);
   }else if(e.beam){
    const dx=e.x2-e.x,dy=e.y2-e.y,length=Math.hypot(dx,dy);if(!length)continue;
    if(r.key==='VINE_WHIP'){
     // One horizontal whip, rotated toward the target; no repeated upright vines.
     g.save();g.translate(e.x,e.y);g.rotate(Math.atan2(dy,dx));g.translate(length/2,0);g.rotate(-Math.PI/2);g.imageSmoothingEnabled=false;
     const index=Math.min(r.phases-1,Math.floor(e.t*r.fps));
     g.drawImage(r.image,index*r.w,0,r.w,r.h,-18,-length/2,36,length);g.restore();
    }else{
     const count=Math.max(1,Math.min(12,Math.ceil(length/38)));
     for(let i=0;i<count;i++){const q=(i+.5)/count;frame(g,r,e.x+dx*q,e.y+dy*q,e.t,.8)}
    }
   }else frame(g,r,e.x,e.y,e.t,(e.scale||1)*(r.key==='THUNDERBOLT'?1.65:1));
  }
 };
 base.clear=()=>{original.clear();effects.length=0};
 const active=Object.getOwnPropertyDescriptor(base,'active').get;
 Object.defineProperty(base,'active',{get(){return effects.length>0||active.call(base)},configurable:true});
 window.IDLE_MOVE_EFFECTS={keys:Object.keys(specs),owns:mv=>!!resource(mv)?.loaded,ready:mv=>resource(mv)?.promise||Promise.resolve(false)};
 // Start loading before the first cast; missing sheets still use the old fallback.
 Object.keys(specs).forEach(resource);
})();
