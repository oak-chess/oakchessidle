/* Visual bridge only. Native cast, projectile arrival and damage remain authoritative. */
(()=>{'use strict';const base=window.EMERALD_MOVES,data=window.IDLE_PDA_CATALOG;if(!base||!data)return;
const byId=new Map(data.moves.map(m=>[m.canonicalMove.id,m])),byKey=new Map(data.moves.map(m=>[m.canonicalMove.key,m])),images=new Map(),casts=new Map(),effects=[];let serial=0;
const original=Object.fromEntries(['start','hit','beam','projectile','warmMoves','update','draw','clear'].map(k=>[k,base[k].bind(base)]));
const stats={nativeProjectiles:0,impacts:0,activations:0};
function spec(mv){return byId.get(mv?.id)||byKey.get(typeof mv==='string'?mv:mv?.emerald)||null}
function resource(key){if(!images.has(key)){const image=new Image(),r={image,loaded:false};r.promise=new Promise(resolve=>{image.onload=()=>{r.loaded=true;resolve(true)};image.onerror=()=>resolve(false)});image.src='modes/idle/pda-effects/'+key+'.png';images.set(key,r)}return images.get(key)}
function keys(m){return [...new Set((m.variants?.flat()||m.sequence).map(e=>e.kind+'-'+e.id))]}
function ready(mv){const m=spec(mv);return m?Promise.all(keys(m).map(k=>resource(k).promise)).then(a=>a.every(Boolean)):Promise.resolve(false)}
function owns(mv){const m=spec(mv);return !!m&&keys(m).every(k=>resource(k).loaded)}
function mapped(c,e){let id=e.id;if(c.shinyOnix){if(e.kind==='missile'&&id===11)id=0;if(e.kind==='effect'&&id===44)id=176}return e.kind+'-'+id}
function stamp(g,key,age,x,y,scale=1,pattern=0,loop=false){const m=data.resources[key],r=resource(key);if(!m||!r.loaded||age<0)return;let phase=Math.floor(age*12);if(loop)phase%=m.phases;if(phase>=m.phases)return;pattern=Math.max(0,Math.min(m.px*m.py*m.pz-1,pattern));g.imageSmoothingEnabled=false;g.drawImage(r.image,phase*m.w,pattern*m.h,m.w,m.h,Math.round(x-m.w*scale/2),Math.round(y-m.h*scale/2),m.w*scale,m.h*scale)}
function random(c){c.seed=(Math.imul(c.seed,1664525)+1013904223)>>>0;return c.seed/4294967296}
function allowed(c,e){if(e.chance==null)return true;const key=e.chanceGroup||JSON.stringify(e.offset);if(!c.chances.has(key))c.chances.set(key,random(c)<e.chance);return c.chances.get(key)}
function offset(c,p,o){if(c.move.batchV2)return{x:p.x+(o?.x||0)*32,y:p.y+(o?.y||0)*32};const x=(o?.x||0)*32,y=(o?.y||0)*32,dir=c.direction;return dir===1?{x:p.x-y,y:p.y+x}:dir===2?{x:p.x-x,y:p.y-y}:dir===3?{x:p.x+y,y:p.y-x}:{x:p.x+x,y:p.y+y}}
function point(c,e,from=false,target){const anchor=from?e.fromAnchor||'source':e.anchor;return offset(c,anchor==='source'?c.source:target||c.target,from?e.fromOffset:e.offset)}
function emit(c,e,at,from,to,duration){if(!allowed(c,e))return;if(effects.length>=512)effects.shift();effects.push({key:mapped(c,e),kind:e.kind,age:-Math.max(0,at),from,to,duration:Math.max(.08,duration||.2),scale:c.move.areaPreview?.8:1.25})}
function state(mv){return casts.get(mv?._pdaCastId)}
function activate(mv,u,t){if(!owns(mv))return false;const move=spec(mv),source={x:u.x,y:u.y-22},target=t?{x:t.x,y:t.y-22}:{...source},dx=target.x-source.x,dy=target.y-source.y;
const c={move,gameKind:mv.k,source,target,age:0,seed:++serial,chances:new Map(),hits:new Set(),flightStarted:false,direction:Math.abs(dx)>=Math.abs(dy)?dx>=0?0:2:dy>=0?1:3,shinyOnix:!!u._idleShiny&&u.name==='Onix'};
c.sequence=move.variants?.[[1,2,3,0][c.direction]]||move.sequence;c.life=Math.max(6,...c.sequence.map(e=>(e.at||0)+2));
if(c.shinyOnix&&!['missile-0','effect-176'].every(k=>resource(k).loaded))return false;
mv._pdaCastId=serial;casts.set(serial,c);if(casts.size>48)casts.delete(casts.keys().next().value);stats.activations++;
return true}
function castVisuals(c){if(c.started)return;c.started=true;const area=c.move.areaPreview;
for(const e of c.sequence){if(c.move.batchV2?e.anchor!=='source':(!area&&e.phase!=='cast'))continue;const from=point(c,e,true),to=point(c,e);emit(c,e,e.at||0,from,to,Math.hypot(to.x-from.x,to.y-from.y)/32*.056)}}
function followups(c,duration){if(c.flightStarted||['barrage','multi'].includes(c.gameKind))return;c.flightStarted=true;const first=c.sequence.find(e=>e.kind==='missile'&&!e.returning),firstAt=first?.at||0;
for(const e of c.sequence){if(e.kind!=='missile'||e===first||c.move.areaPreview||(c.move.batchV2&&e.anchor==='source'))continue;const from=point(c,e,true),to=point(c,e);emit(c,e,Math.max(0,(e.at||0)-firstAt),from,to,duration)}}
base.warmMoves=async moves=>{await Promise.all([original.warmMoves(moves),...moves.map(ready)]);return true};
base.start=(mv,x,y)=>{const c=state(mv);if(!c)return original.start(mv,x,y);castVisuals(c);if(!c.move.areaPreview&&!['bolt','blast','drain','multi','barrage','storm','trap'].includes(mv.k)){
 const first=c.sequence.find(e=>e.kind==='missile'&&!e.returning);if(first){emit(c,first,0,c.source,c.target,.22);followups(c,.22)}}return true};
base.projectile=(g,p)=>{const c=state(p.o?.move);if(!c)return original.projectile(g,p);if(c.move.areaPreview)return true;
const first=c.sequence.find(e=>e.kind==='missile'&&!e.returning);if(!first)return true;
const dx=(p.lx??c.target.x)-p.x,dy=(p.ly??c.target.y)-p.y,px=Math.abs(dx)<Math.abs(dy)*.4?1:dx>=0?2:0,py=Math.abs(dy)<Math.abs(dx)*.4?1:dy>=0?2:0;
stamp(g,mapped(c,first),p.age||0,p.x+(p.ox||0),p.y+(p.oy||0),1.1,py*3+px,true);followups(c,(p.D0||32)/(p.sp||520));stats.nativeProjectiles++;return true};
base.hit=(mv,x,y,scale,source)=>{const c=state(mv);if(!c)return original.hit(mv,x,y,scale,source);if(c.move.areaPreview)return true;
const hitKey=Math.round(x)+':'+Math.round(y)+':'+Math.floor(c.age*60);if(c.hits.has(hitKey))return true;c.hits.add(hitKey);stats.impacts++;
const target={x,y};let events=c.sequence.filter(e=>e.kind==='effect'&&e.phase!=='cast'&&(!c.move.batchV2||e.anchor!=='source'));if(['barrage','multi'].includes(c.gameKind)){const at=Math.min(...events.map(e=>e.at||0));events=events.filter(e=>(e.at||0)===at)}const first=(events.length?Math.min(...events.map(e=>e.at||0)):0);
for(const e of events){const to=point(c,e,false,target);emit(c,e,Math.max(0,(e.at||0)-first),to,to)}return true};
base.beam=(mv,x,y,x2,y2,width)=>{const c=state(mv);if(!c)return original.beam(mv,x,y,x2,y2,width);return true};
base.update=dt=>{original.update(dt);const step=Number.isFinite(dt)?Math.max(0,dt):0;for(const [key,c]of casts){c.age+=step;if(c.age>c.life)casts.delete(key)}for(let i=effects.length-1;i>=0;i--){const e=effects[i],m=data.resources[e.key];e.age+=step;const life=e.kind==='missile'?e.duration:(m?.phases||1)/12;if(e.age>life)effects.splice(i,1)}};
base.draw=g=>{original.draw(g);if(!effects.length)return;g.save();g.globalCompositeOperation='source-over';for(const e of effects){if(e.age<0)continue;if(e.kind==='effect')stamp(g,e.key,e.age,e.to.x,e.to.y,e.scale);else{const q=Math.min(1,e.age/e.duration),dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,px=Math.abs(dx)<Math.abs(dy)*.4?1:dx>=0?2:0,py=Math.abs(dy)<Math.abs(dx)*.4?1:dy>=0?2:0;stamp(g,e.key,e.age,e.from.x+dx*q,e.from.y+dy*q,e.scale,py*3+px,true)}}g.restore()};
base.clear=()=>{original.clear();casts.clear();effects.length=0};const active=Object.getOwnPropertyDescriptor(base,'active').get;Object.defineProperty(base,'active',{configurable:true,get(){return effects.length>0||active.call(base)}});
window.IDLE_PDA_EFFECTS={owns,ready,activate,projectileOwned:p=>!!state(p.o?.move),get diagnostics(){return{...stats,casts:casts.size,effects:effects.length,approved:byId.size}}};
// Small reviewed pack only; never loads the complete downloaded client.
// Resources load on demand through warmMoves/owns, rather than all at boot.
})();
