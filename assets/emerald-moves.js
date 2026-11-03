/* Adaptation layer, not a GBA emulator. Combat remains authoritative for hits. */
(()=>{
 'use strict';
 const catalog=window.EMERALD_CATALOG;if(!catalog)return;
 const sharedImages=new Map(),sharedFrames=new Map(),sharedMetrics=new Map();
 function createRenderer(isolated=false){
 const images=sharedImages,frames=sharedFrames,active=[],resources=new Map();
 for(const [name,template] of Object.entries(catalog.templates)){
  if(!resources.has(template.tag))resources.set(template.tag,[]);
  resources.get(template.tag).push(name);
 }
 const travelRE=/ToTarget|Projectile|Missile|Beam|Shot|Throw|Spit|Linear|Moving|Flying|WaveFrom|AirWave|ShadowBall|RazorLeaf|DragonBreath/i;
 const hitRE=/HitSplat|Impact|Slash|Claw|Fang|Teeth|Explosion|Punch|Kick|Plume|Burst|Shock|Bolt/i;
 const orbitRE=/Orbit|Circling|Spiral|Dance|Ring|Rotat|Whirl/i;
 const number=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
 const quality=()=>typeof CFG==='undefined'?'normal':CFG.fxLevel;
 const reduced=()=>typeof CFG!=='undefined'&&CFG.reduceFx;
 const nine=window.CREATE_NINE_MOVE_EFFECTS?.(drawSprite,reduced),psychic=window.CREATE_PSYCHIC_EFFECTS?.(reduced);
 const maxEffects=()=>quality()==='low'?40:quality()==='high'?140:90;
 for(const t of Object.values(catalog.templates))if(!images.has(t.sheet))images.set(t.sheet,{image:null,ready:false,pending:null,failedAt:0});
 function loadSheet(sheet){const entry=images.get(sheet);if(!entry)return Promise.resolve();if(entry.ready)return Promise.resolve();if(entry.pending)return entry.pending;if(Date.now()-entry.failedAt<30000)return Promise.resolve();
  const url='assets/move-fx/sheets/'+sheet+'.png';
  const load=window.OAK_ASSETS?window.OAK_ASSETS.image(url,true):new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url});
  entry.pending=load.then(image=>{entry.image=image;entry.ready=!!image;if(!image)entry.failedAt=Date.now();entry.pending=null});return entry.pending;
 }
 function warmMoves(moves){const sheets=new Set();for(const mv of moves){const move=resolve(mv),key=typeof mv==='string'?mv:mv?.emerald||window.EMERALD_ALIASES?.[mv?.n]||mv?.n;
  const names=[...(move?.events||[]).map(e=>e.sprite),...(move?.resources||[]),...Object.values(window.OAK_NINE_MOVES?.[key]||{}).filter(value=>typeof value==='string'&&catalog.templates[value])];
  for(const name of names){const template=catalog.templates[name];if(template)sheets.add(template.sheet)}
 }return Promise.all([...sheets].map(loadSheet))}
 function resolve(move){
  if(!move)return null;const name=typeof move==='string'?move:move.n;
  const key=typeof move==='object'&&move.emerald||(name==='Redemoinho'&&move.t==='water'?'WHIRLPOOL':window.EMERALD_ALIASES?.[name])||name;
  const extra=!catalog.moves[key]&&window.DEX_MOVE_CATALOG?.find(m=>m.key===key&&m.expansionSequence);
  const base=catalog.moves[key]||(extra?{...extra.expansionSequence,id:extra.id,resources:[],sounds:[]}:null);if(!base)return null;
  const variant=typeof move==='object'?move._variant:0;
  if(base.variants?.length&&Number.isFinite(variant)){
   const attack=base.variants.find(v=>/Unleash|SkullBashAttack|SkyAttackUnleash/.test(v.label));
   const selected=attack||base.variants[variant%base.variants.length];
   return {...base,...selected,resources:base.resources,id:base.id};
  }
  return base;
 }
 function available(name){const t=catalog.templates[name];if(!t)return false;const entry=images.get(t.sheet);if(!entry?.ready)loadSheet(t.sheet);return !!entry?.ready}
 function candidates(move){return [...new Set([...move.events.map(e=>e.sprite),...move.resources])].filter(available)}
 function choose(move,kind){
  const all=candidates(move),match=re=>all.find(n=>re.test(n+' '+catalog.templates[n].callback));
  return (kind==='projectile'?match(travelRE):kind==='hit'?match(hitRE):match(orbitRE))||all[0];
 }
 function animation(template,variant=0){return template.animations[variant%Math.max(1,template.animations.length)]||{frames:[[0,8,0,0]],loop:true}}
 function spriteFrame(name,offset){
  const template=catalog.templates[name],cacheKey=name+':'+offset;let canvas=frames.get(cacheKey);
  if(!canvas){
   canvas=document.createElement('canvas');canvas.width=template.w;canvas.height=template.h;
   const ctx=canvas.getContext('2d'),source=images.get(template.sheet).image,tilesAcross=source.naturalWidth/8;
   // Emerald frame offsets count 8x8 tiles, not rows in a sprite sheet.
   for(let y0=0;y0<template.h;y0+=8)for(let x0=0;x0<template.w;x0+=8){
    const tile=offset+(y0/8)*(template.w/8)+x0/8,sx=(tile%tilesAcross)*8,sy=Math.floor(tile/tilesAcross)*8;
    if(sy+8<=source.naturalHeight)ctx.drawImage(source,sx,sy,8,8,x0,y0,8,8);
   }
   frames.set(cacheKey,canvas);
  }
  return canvas;
 }
 function visualMetrics(name){
  if(sharedMetrics.has(name))return sharedMetrics.get(name);
  const saved=window.EMERALD_VISIBLE_BOUNDS?.[name];if(saved){sharedMetrics.set(name,saved);return saved;}
  const template=catalog.templates[name],offsets=new Set([0,...template.animations.flatMap(a=>a.frames.map(f=>f[0]))]);
  let left=template.w,top=template.h,right=-1,bottom=-1;
  // One union for the entire template: no size pumping between animation frames.
  try{for(const offset of offsets){const canvas=spriteFrame(name,offset),pixels=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,template.w,template.h).data;
   for(let y=0;y<template.h;y++)for(let x=0;x<template.w;x++)if(pixels[(y*template.w+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
  }
  }catch{const safe={correction:1,cx:template.w/2,cy:template.h/2};sharedMetrics.set(name,safe);return safe}
  const span=right<0?Math.max(template.w,template.h):Math.max(right-left+1,bottom-top+1),particle=/Sparkle|Spark|Powder|Spore|Dust|Snow|Smoke|Particle/i.test(name+' '+template.callback);
  const correction=Math.min(particle?1.5:4,Math.max(1,Math.max(template.w,template.h)/Math.max(1,span)));
  const result={correction,cx:right<0?template.w/2:(left+right+1)/2,cy:bottom<0?template.h/2:(top+bottom+1)/2};sharedMetrics.set(name,result);return result;
 }
 function drawSprite(g,name,x,y,scale,time,angle=0,variant=0,alpha=1){
  const template=catalog.templates[name];if(!template||!available(name))return false;
  const sequence=animation(template,variant),total=sequence.frames.reduce((n,f)=>n+Math.max(1,f[1]),0);
  let tick=Math.floor(time*60);tick=sequence.loop?tick%total:Math.min(tick,total-1);
  let frame=sequence.frames[0];for(const f of sequence.frames){frame=f;if(tick<Math.max(1,f[1]))break;tick-=Math.max(1,f[1])}
  const canvas=spriteFrame(name,frame[0]),visible=visualMetrics(name);
  scale*=visible.correction;
  g.save();g.globalAlpha=alpha;g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=false;
  const affine=template.affines?.[variant%Math.max(1,template.affines.length)];
  let sx=256,sy=256,rotation=0;
  if(affine?.frames.length){
   const total=affine.frames.reduce((n,f)=>n+f[3],0);let tick=Math.floor(time*60);if(affine.loop&&total)tick%=total;
   for(const f of affine.frames){if(!f[3]){sx=f[0]||256;sy=f[1]||256;rotation=f[2];continue}const steps=Math.min(tick,f[3]);sx+=f[0]*steps;sy+=f[1]*steps;rotation+=f[2]*steps;tick-=steps;if(tick<=0)break}
  }
  const factor=v=>Math.max(.55,Math.min(1.8,256/Math.max(32,Math.abs(v))));
  g.translate(Math.round(x),Math.round(y));g.rotate(angle+(reduced()?0:rotation*Math.PI/128));g.scale((frame[2]?-scale:scale)*factor(sx),(frame[3]?-scale:scale)*factor(sy));
  g.drawImage(canvas,-visible.cx,-visible.cy);g.restore();return true;
 }
 function enqueue(o){if(active.length>=maxEffects())return false;active.push({t:0,delay:0,life:.45,scale:1,variant:0,mode:'still',...o});return true}
 function duration(name,variant=0){const a=animation(catalog.templates[name],variant);return Math.max(.22,Math.min(.85,a.frames.reduce((n,f)=>n+f[1],0)/60))}
 function motion(name){
  const callback=catalog.templates[name]?.callback||'';
  if(/Spiral.*Inward|SpiralInward/.test(callback))return 'spiralIn';
  if(/Spiral/.test(callback))return 'spiralOut';
  if(/Bounce|Hop/.test(callback))return 'bounce';
  if(orbitRE.test(callback))return 'orbit';
  if(/Powder|Spore|Snow|Mist|Smoke/i.test(callback))return 'rise';
  return 'still';
 }
 function emit(move,name,x,y,scale,mode='still',delay=0,variant=0,extra={}){
  if(!name)return false;
  return enqueue({name,x,y,scale:Math.min(2.2,Math.max(.7,scale)),life:duration(name,variant),delay,variant,mode,...extra});
 }
 function taskEffect(move,x,y,scale,type){
  // Moves such as Psychic have background/affine tasks, with no sprite of their own.
  if(!move.tasks.length)return false;
  const palette=typeof PAL!=='undefined'&&(PAL[type]||PAL.psychic);
  const color=palette?palette[1]:'#c79aff';
  const family=move.tasks.join(' '),mode=/Heal|Recover|Growth|ScaleMon/.test(family)?'rise':/Elliptical|Rotate|Roll/.test(family)?'orbit':'pulse';
  return enqueue({name:null,x,y,scale,life:reduced()?.32:.55,color,mode});
 }
 function hit(mv,x,y,scale=1){
  const mental=psychic?.hit(mv,x,y,scale);if(mental!=null)return mental;
  const specific=nine?.hit(mv,x,y,scale);if(specific!=null)return specific;
  const resolved=resolve(mv);
  if(resolved?.id===149){
   const name='gPsywaveRingSpriteTemplate';
   if(available(name)){
    const count=quality()==='low'?3:5;
    for(let i=0;i<count;i++)enqueue({name,x,y,scale:Math.max(.8,scale),life:.8,delay:i*.09,variant:0,mode:'psywave'});
    return true;
   }
  }
  if((api.sequence||(!isolated?window.EMERALD_SEQUENCES:null))?.impact?.(mv,x,y,scale))return true;
  const move=resolve(mv);if(!move)return false;const names=candidates(move);if(!names.length)return taskEffect(move,x,y,scale,mv.t);
  const primary=choose(move,'hit');
  // Preserve successive splats and directional cuts from the source script.
  const events=move.events.filter(e=>available(e.sprite)&&hitRE.test(e.sprite+' '+catalog.templates[e.sprite].callback));
  const count=quality()==='low'?2:reduced()?3:5;
  if(events.length){const first=events[0].t;events.slice(0,count).forEach((e,i)=>emit(move,e.sprite,x+Math.max(-24,Math.min(24,number(e.args[0]))),y+Math.max(-20,Math.min(20,number(e.args[1]))),scale,motion(e.sprite),Math.min(.22,Math.max(0,e.t-first)),i));return true}
  const ok=emit(move,primary,x,y,scale,motion(primary));
  if(!reduced()&&names.length>1)emit(move,names[names.length-1],x,y,scale*.8,'rise',.06);
  return ok;
 }
 function start(mv,x,y){
  const mental=psychic?.start(mv,x,y);if(mental!=null)return mental;
  const specific=nine?.start(mv,x,y);if(specific!=null)return specific;
  // Psywave's rings are travelling sprites in Emerald; OakChess resolves this move as a burst.
  // Emit its expanding rings at the actual impact phase instead of dropping them at preparation.
  if(resolve(mv)?.id===149)return false;
  if((api.sequence||(!isolated?window.EMERALD_SEQUENCES:null))?.start?.(mv,x,y))return true;
  const move=resolve(mv);if(!move)return false;
  if(!['buff','barrier','heal'].includes(mv.k))return false;
  const events=move.events.filter(e=>available(e.sprite)&&!travelRE.test(e.sprite+' '+catalog.templates[e.sprite].callback));
  if(!events.length)return taskEffect(move,x,y,1,mv.t);
  const count=quality()==='low'?3:reduced()?4:9,first=events[0].t;
  events.slice(0,count).forEach((e,i)=>{
   const mode=motion(e.sprite);
   emit(move,e.sprite,x,y,1,mode,Math.min(.4,e.t-first),i,{angle:i*2.399,radius:12+(i%3)*7});
  });return true;
 }
 function beam(mv,x1,y1,x2,y2,width=18){
  const mental=psychic?.beam(mv,x1,y1,x2,y2,width);if(mental!=null)return mental;
  const specific=nine?.beam(mv,x1,y1,x2,y2,width);if(specific!=null)return specific;
  const move=resolve(mv);if(!move)return false;const name=choose(move,'projectile');if(!name)return false;
  if(move.id===53){
   const flame=available('gFlamethrowerFlameSpriteTemplate')?'gFlamethrowerFlameSpriteTemplate':name;
   return enqueue({name:flame,x:x1,y:y1,x2,y2,life:.78,mode:'flamethrower',width,angle:Math.atan2(y2-y1,x2-x1)});
  }
  const beamColors={58:['#358edb','#72d7ff','#edffff'],63:['#c44630','#ffb342','#fff7b1'],76:['#3e9c38','#b4eb50','#ffffcb'],62:['#6385c9','#a3e9e2','#f5ffff'],60:['#773aa8','#df89e8','#ffe4ff'],324:['#3ba27a','#b6e65b','#efffc3'],225:['#5945b8','#ad7df0','#f7d9ff']};
  if(beamColors[move.id])return enqueue({name,x:x1,y:y1,x2,y2,life:.65,mode:'energyJet',width:Math.max(14,width),colors:beamColors[move.id],angle:Math.atan2(y2-y1,x2-x1)});
  const distance=Math.hypot(x2-x1,y2-y1),count=quality()==='low'?7:reduced()?12:22;
  const events=move.events.filter(e=>available(e.sprite)&&travelRE.test(e.sprite+' '+catalog.templates[e.sprite].callback));
  for(let i=0;i<count;i++){
   const event=events[i%Math.max(1,events.length)],sprite=event?.sprite||name;
   enqueue({name:sprite,x:x1,y:y1,x2,y2,life:.38,mode:'beam',position:i/Math.max(1,count-1),scale:Math.max(.8,Math.min(1.8,width/20)),variant:i,angle:Math.atan2(y2-y1,x2-x1),wave:reduced()?0:Math.min(8,width/3),distance});
  }return true;
 }
 function projectile(g,p){
  const mental=psychic?.projectile(g,p);if(mental!=null)return mental;
  const specific=nine?.projectile(g,p);if(specific!=null)return specific;
  const mv=p.o?.move,move=resolve(mv);if(!move)return false;
  const name=choose(move,'projectile');if(!name)return false;
  const t=catalog.templates[name],angle=/Needle|Stinger|Leaf|AirWave|Arrow/i.test(t.callback+' '+name)?(p.dir||0):0;
  const sizes={52:20,55:30,56:46,85:34,88:34,94:38,129:26,188:36,247:42,324:32};
  const diameter=sizes[move.id]||(/Needle|Stinger/i.test(t.callback+' '+name)?20:/Ball|Orb|Bomb|Sphere/i.test(t.callback+' '+name)?36:28);
  const scale=Math.max(.7,Math.min(3,(diameter*(p.size||1))/Math.max(t.w,t.h)));
  const age=p.age||0,callback=t.callback||'';
  // Secondary sprite motion stays local to the authoritative projectile position.
  const wave=!reduced()&&/SinWave|Bounce/.test(callback)?Math.sin(age*18)*4:0;
  const x=p.x+(p.ox||0)-Math.sin(p.dir||0)*wave,y=p.y+(p.oy||0)+Math.cos(p.dir||0)*wave;
  if(!reduced()&&/Spiral|Circling|Orbit/.test(callback))for(let i=0;i<2;i++){
   const a=age*12+i*Math.PI;drawSprite(g,name,x+Math.cos(a)*9,y+Math.sin(a)*6,scale*.45,age,angle,i,.45);
  }
  return drawSprite(g,name,x,y,scale,age,angle,Math.floor(age*2));
 }
 const api={resolve,start,hit,beam,projectile,
  specialKind(mv){return psychic?.kind(mv)||nine?.kind(mv)},
  preview(mv,x,y,x2,y2){return psychic?.preview(mv,x,y,x2,y2)||nine?.preview(mv,x,y,x2,y2)||false},
  pose(mv,node){nine?.pose(mv,node)},
  warmMoves,
  ready(move){return warmMoves(move?[move]:Object.keys(catalog.moves))},
  emitTemplate(name,x,y,scale,delay,variant,extra={}){if(!available(name))return false;return emit(null,name,x,y,scale,motion(name),delay,variant,extra)},
  availableTemplate:available,
  drawResource(g,tag,x,y,scale,time,variant=0,alpha=1){
   const names=(resources.get(tag)||[]).filter(available);
   if(!names.length)return false;
   const name=names[variant%names.length];
   return drawSprite(g,name,x,y,scale,time%Math.max(.2,duration(name,variant)),0,variant,alpha);
  },
  // Public playback entry point for future moves and regions. This is a visual adaptation.
  play(name,source,target,options={}){
   const move=resolve(name);if(!move)return false;
   const mv={n:name,k:options.kind||'bolt',t:options.type||'normal'};
   if(mv.k==='beam')return beam(mv,source.x,source.y,target.x,target.y,options.width);
   if(['buff','heal','barrier'].includes(mv.k))return start(mv,source.x,source.y);
   return hit(mv,target.x,target.y,options.scale||1);
  },
  update(dt){psychic?.update(dt);nine?.update(dt);for(let i=active.length-1;i>=0;i--){const e=active[i];e.t+=dt;if(e.t>=e.life+e.delay)active.splice(i,1)}},
  draw(g){psychic?.draw(g);nine?.draw(g);for(const e of active){
   const time=e.t-e.delay;if(time<0)continue;const k=Math.min(1,time/e.life),fade=Math.min(1,(1-k)*5);
   let x=e.x,y=e.y,rotation=0;
   if(e.mode==='travel'){const wave=Math.sin(k*Math.PI*4)*(e.wave||0);x+=(e.x2-e.x)*k-Math.sin(e.angle)*wave;y+=(e.y2-e.y)*k+Math.cos(e.angle)*wave;}
   if(e.mode==='beam'){const p=e.position,wave=Math.sin(p*Math.PI*6-k*Math.PI*4)*(e.wave||0);x+=(e.x2-e.x)*p-Math.sin(e.angle)*wave;y+=(e.y2-e.y)*p+Math.cos(e.angle)*wave;}
   if(e.mode==='rise')y-=k*22;
   if(e.mode==='bounce')y-=Math.abs(Math.sin(k*Math.PI*2))*16*(1-k);
   if(e.mode==='spiralIn'||e.mode==='spiralOut'){const angle=(e.angle||0)+k*Math.PI*3,radius=24*(e.mode==='spiralIn'?1-k:k);x+=Math.cos(angle)*radius;y+=Math.sin(angle)*radius*.6;rotation=angle*.25;}
   if(e.mode==='orbit'){const angle=(e.angle||0)+k*Math.PI*2;x+=Math.cos(angle)*(e.radius||18);y+=Math.sin(angle)*(e.radius||18)*.55;rotation=angle*.3;}
   if(e.mode==='flamethrower'||e.mode==='energyJet'){
    const fire=e.mode==='flamethrower',length=Math.hypot(e.x2-e.x,e.y2-e.y),reach=length*Math.min(1,time/.12);
    const opacity=Math.max(0,Math.min(1,time/.045,(e.life-time)/.14));
    const half=Math.max(fire?13:7,Math.min(fire?29:20,e.width*(fire?.75:.48)));
    const colors=fire?['#a82a12','#ed4812','#ff9826','#ffdf64','#fff5ba']:e.colors;
    g.save();g.translate(e.x,e.y);g.rotate(e.angle);g.globalCompositeOperation='source-over';g.globalAlpha=opacity;
    // Filled, overlapping contours form a single body. No repeated projectile
    // sprites along the beam: stepped edges and moving tongues supply texture.
    colors.forEach((color,layer)=>{
     const ratio=1-layer/(colors.length+.1),upper=[],lower=[],step=quality()==='low'?12:6;
     for(let at=0;at<reach;at+=step){
      const p=at/Math.max(1,reach),ripple=Math.sin(p*25-time*23+layer)*Math.sin(p*Math.PI)*half*(fire?.18:.10);
      const envelope=fire?(3+half*Math.sin(p*Math.PI*.73)):(3+half*Math.sin(Math.min(1,p*5)*Math.PI/2));
      const flicker=fire?Math.sin(at*.34-time*31+layer)*(.8+p*2.5):Math.sin(at*.18-time*20)*1.3;
      const radius=Math.max(1,envelope*ratio+flicker*ratio);
      upper.push([at,Math.round((ripple-radius)/2)*2]);lower.push([at,Math.round((ripple+radius)/2)*2]);
     }
     if(!upper.length)return;
     g.fillStyle=color;g.beginPath();g.moveTo(0,0);for(const pt of upper)g.lineTo(pt[0],pt[1]);
     g.lineTo(reach+(fire?(1-layer/colors.length)*12:0),Math.sin(time*26+layer)*half*.15);
     for(let i=lower.length-1;i>=0;i--)g.lineTo(lower[i][0],lower[i][1]);g.closePath();g.fill();
    });
    if(fire){
     // A few broad tongues break away from the head, rather than a bead chain.
     for(let i=0;i<(reduced()?2:4);i++){
      const p=(time*2+i*.27)%1,at=reach-24+p*32,y=Math.sin(time*17+i*2.4)*half*.85;
      g.fillStyle=i%2?'#ffc443':'#f36b19';g.beginPath();g.moveTo(at-12,y-4);g.lineTo(at+9,y-9-p*7);g.lineTo(at+3,y+4);g.lineTo(at-14,y+5);g.closePath();g.fill();
     }
    }else if(!reduced()){
     g.fillStyle=colors[colors.length-1];for(let i=0;i<3;i++){const at=(time*1.8+i/3)%1*reach,y=Math.sin(i*2.3+time*15)*half*1.1;g.fillRect(Math.round(at),Math.round(y),4,2)}
    }
    g.restore();
   }else if(e.mode==='psywave'){
    const expansion=(.8+k*5.5)*e.scale;
    drawSprite(g,e.name,x,y,expansion,time,Math.PI/2,0,fade*.95);
   }else if(e.name)drawSprite(g,e.name,x,y,e.scale,time,rotation,e.variant,fade);
   else{
    g.save();g.globalCompositeOperation='source-over';g.globalAlpha=fade*(reduced()?.45:.7);g.strokeStyle=e.color;g.lineWidth=2;g.setLineDash([5,3]);
    const radius=(12+k*25)*e.scale;g.beginPath();g.ellipse(x,y,radius,radius*.65,0,0,Math.PI*2);g.stroke();g.restore();
   }
  }},
  clear(){active.length=0;psychic?.clear();nine?.clear()},get active(){return active.length>0||!!psychic?.active||!!nine?.active}
 };
 return api;
 }
 window.CREATE_EMERALD_RENDERER=()=>createRenderer(true);
 window.EMERALD_MOVES=createRenderer();
})();
