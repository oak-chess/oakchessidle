/* Approved arena interactions. Visual displacement never changes combat occupancy. */
(()=>{
 'use strict';
 const combat=B,pmd=PMD,parent=document.getElementById('arenaView'),units=document.getElementById('units');
 if(!parent||!units)return;
 const jobs=[],pending=new Map(),handled=new WeakMap();let serial=0;
 const flameImage=new Image();flameImage.src='assets/move-fx/emerald/fire.png';
 const alias={wildfire:'fire',charged:'electric',frost:'ice',spores:'poison'};
 const tornadoMoves=new Set(['WHIRLWIND','TWISTER','HURRICANE']);
 const tornadoIds=new Set([18,239,542]);
 function moveKind(mv){
  if(mv.emerald==='SURF'||mv.id===57)return 'surf';
  if(mv.emerald==='EARTHQUAKE'||mv.id===89)return 'earthquake';
  if(tornadoMoves.has(mv.emerald)||tornadoIds.has(mv.id))return 'wind';
  return ['fire','electric','ice','rock','poison'].includes(mv.t)?mv.t:null;
 }
 const supported=new Set(['fire','electric','rock','poison','wind','ice','surf','earthquake']);
 function slideDestination(u,event){
  let dx=u.x-(event.owner?.x??hexXY(event.r,event.c).x),dy=u.y-(event.owner?.y??hexXY(event.r,event.c).y);if(Math.hypot(dx,dy)<1){dx=0;dy=-1}const size=Math.hypot(dx,dy);return{x:u.x+dx/size*HW*.9,y:u.y+dy/size*HW*.9};
 }
 function environment(event,job){
  const clone=u=>{const shadow={...u,_real:u,_baseX:u.x,_baseY:u.y};return shadow};
  const targets=event.targets.filter(u=>u.alive&&u.el?.isConnected).map(clone);
  const pos=hexXY(event.r,event.c),center={...pos,r:event.r,c:event.c,el:document.createElement('div')};
  const attacker=event.owner?clone(event.owner):{...center,el:document.createElement('div')};
  const updateCUEl=u=>{if(!u?._real)return;job.offsets.set(u._real,{x:u.x-u._baseX,y:u.y-u._baseY});};
  return {attacker,targets,center,updateCUEl,
   B:{units:targets},clock:{now:()=>job.elapsed*1000},
   queue:frame=>{job.next=frame;return 1},unqueue:()=>{job.next=null},
   PMD:Object.assign(Object.create(pmd),{playNames(root,names){if(event.reactions&&root?.isConnected&&!root.classList.contains('st-frozen'))pmd.playNames(root,names)}}),
   layer(z){const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=800;canvas.setAttribute('aria-hidden','true');canvas.style.cssText=`position:absolute;left:0;top:0;width:1280px;height:800px;pointer-events:none;image-rendering:pixelated;z-index:${z}`;if(z===1)parent.insertBefore(canvas,units);else parent.append(canvas);job.layers.push(canvas);return canvas.getContext('2d')}
  };
 }
 function trackAnimation(job,element,frames,options){const animation=element.animate(frames,options);animation.playbackRate=Number(CFG.speed)||1;job.animations.push(animation);return animation}
 function destroy(job){
  try{job.renderer?.stop()}catch(e){console.warn('Arena interaction cleanup:',e)}
  job.animations.forEach(a=>a.cancel());job.layers.forEach(c=>c.remove());job.targets.forEach(u=>{if(u.el?.isConnected)updateCUEl(u)});job.offsets.clear();
  const index=jobs.indexOf(job);if(index>=0)jobs.splice(index,1);
 }
 function clear(){for(const j of [...jobs])destroy(j);pending.clear()}
 function start(input){
  const kind=alias[input.kind]||input.kind;if(!supported.has(kind)||!combat.on||combat.over)return false;
  const event={radius:1,targets:[],life:4,reactions:true,...input,kind};
  if(!Number.isFinite(event.r)||!Number.isFinite(event.c))return false;
  event.radius=Math.max(0,Math.min(3,event.radius));event.targets=[...new Set(event.targets)].filter(u=>u.alive&&u.side!==event.owner?.side);
  const priority=({earthquake:5,surf:4,ice:4,wind:4,fire:3,electric:3,rock:2,poison:2})[kind];
  if(jobs.some(j=>j.priority>priority&&j.targets.some(u=>event.targets.includes(u))))return false;
  // New interactions replace older body reactions on the same units.
  for(const j of [...jobs])if(j.targets.some(u=>event.targets.includes(u)))destroy(j);
  const limit=CFG.fxLevel==='low'?2:4;while(jobs.length>=limit)destroy(jobs[0]);
  const nativeDuration=kind==='earthquake'?5.4:kind==='surf'?5:6;
  const duration=Math.max(1.5,Math.min(nativeDuration,Number(event.life)||4));
  const job={id:++serial,priority,kind,owner:event.owner,r:event.r,c:event.c,start:combat.t,elapsed:0,duration,nativeDuration,layers:[],animations:[],offsets:new Map(),targets:event.targets,next:null,renderer:null};
  try{job.renderer=({earthquake,surf,ice,elements}[kind]||elements)(event,job);jobs.push(job);return true}catch(e){console.warn('Arena interaction fallback:',e);destroy(job);return false}
 }
 function field(f){
  const kind=alias[f.kind]||f.kind;if(!supported.has(kind))return false;
  const targets=combat.units.filter(u=>u.alive&&u.side!==f.owner?.side&&hdist(f.r,f.c,u.r,u.c)<=f.radius);
  // A field takes precedence over a pending effect from the hit that created it.
  for(const [key,e] of pending)if(e.owner===f.owner&&(alias[e.kind]||e.kind)===kind)pending.delete(key);
  const ok=start({kind,r:f.r,c:f.c,radius:f.radius,life:f.life+.6,owner:f.owner,targets});
  if(ok){handled.set(f,jobs.at(-1));f._arenaReactSeen=new Set(targets)}return ok;
 }
 function touch(f,u){if(!jobs.includes(handled.get(f))||f._arenaReactSeen?.has(u))return;f._arenaReactSeen?.add(u);start({kind:f.kind,owner:f.owner,r:u.r,c:u.c,radius:0,targets:[u],life:Math.min(3,f.life-f.age)})}
 function hit(owner,target,mv){
  if(!owner||!target||!target.alive||!mv)return;
  const kind=moveKind(mv);
  if(!supported.has(kind))return;
  if(jobs.some(j=>j.owner===owner&&j.kind===kind&&combat.t-j.start<.8))return;
  const key=owner.key+':'+(mv.emerald||mv.id||mv.n)+':'+(mv._variant||owner.mi||0);
  let event=pending.get(key);
  if(!event){const area=['blast','burst','field','meteor','storm'].includes(mv.k),center=mv.k==='burst'?owner:target;event={kind,r:center.r,c:center.c,radius:area?(mv.r||(mv.k==='meteor'?1:mv.p>=1.8?2:1)):0,owner,targets:[],life:kind==='earthquake'?4.5:kind==='surf'?4:3.8};pending.set(key,event)}
  if(!event.targets.includes(target))event.targets.push(target);
 }
 function tick(){
  if(!combat.on||combat.over){if(jobs.length||pending.size)clear();return}
  if(document.hidden)return;
  const paused=G.paused||combat.hold;
  if(!paused){for(const event of pending.values())start(event);pending.clear()}
  for(const job of [...jobs]){
   if(job.targets.length&&job.targets.every(u=>!u.alive||!u.el?.isConnected)){destroy(job);continue}
   const age=combat.t-job.start;if(age>=job.duration){destroy(job);continue}
   job.elapsed=age*job.nativeDuration/job.duration;
   for(const a of job.animations){if(paused&&a.playState==='running')a.pause();else if(!paused&&a.playState==='paused')a.play()}
   try{job.renderer.draw(job.elapsed*1000)}catch(e){console.warn('Arena interaction frame:',e);destroy(job);continue}
   const settle=Math.min(1,Math.max(0,(job.duration-age)/.45));
   for(const [u,offset] of job.offsets){if(!u.alive||!u.el?.isConnected)continue;u.el.style.transform=`translate(${u.x+offset.x*settle}px,${u.y+offset.y*settle}px)`}
  }
 }
 function elements(event,job){
const env=environment(event,job),{attacker,targets,clock,queue,unqueue,updateCUEl,PMD,B}=env;let raf=0;let bases=[];const current=event.kind,mode=current;const floor=env.layer(1),fx=env.layer(2500);
 function stop(reset=true){unqueue();floor.clearRect(0,0,1280,800);fx.clearRect(0,0,1280,800);bases.forEach(p=>{p.u.el.classList.remove('arena-react-electrocuted','arena-react-whirlwind');if(p.fa!==undefined)p.u.fa=p.fa;p.fire?.remove();p.electric?.remove();if(p.spinSprite)p.spinSprite.style.rotate=p.spinRotate;if(p.turnCanvas){p.turnCanvas.remove();p.turnOriginal.style.display=p.turnDisplay}if(p.shockSprite){p.shockSprite.style.translate=p.shockTranslate;p.shockSprite.style.filter=p.shockFilter}});if(reset){bases.forEach(p=>{p.u.x=p.x;p.u.y=p.y;p.u.el.style.translate=p.translate;p.u.el._pmdOne=null;updateCUEl(p.u)});bases=[]}}
 function path(g,points){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath()}
 function bolt(g,x,y,x2,y2,seed,t){g.beginPath();g.moveTo(x,y);for(let i=1;i<=7;i++){const f=i/7,j=i===7?0:Math.sin(seed+i*17+Math.floor(t*15))*7;g.lineTo(x+(x2-x)*f+j,y+(y2-y)*f-j*.6)}g.stroke()}
 function run(){stop();const mode=current,start=clock.now(),origin=hexXY(event.r,event.c),reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
  bases=targets.map((u,i)=>({u,x:u.x,y:u.y,translate:u.el.style.translate,reacted:false,i,fa:u.fa}));
  const tiles=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=hdist(event.r,event.c,r,c);if(d<=event.radius)tiles.push({...hexXY(r,c),r,c,d,seed:r*37+c*19})}
  const debris=Array.from({length:54},(_,i)=>{const a=i*2.39996,dist=15+(i%8)*12;return{x:origin.x+Math.cos(a)*dist,y:origin.y+Math.sin(a)*dist*.55,a,s:3+i%6,v:24+(i%7)*10,delay:(i%6)*.055}});
  
  function frame(now){const t=(now-start)/1000,fade=Math.max(0,Math.min(1,(6-t)/1.6));floor.clearRect(0,0,1280,800);fx.clearRect(0,0,1280,800);
   tiles.forEach(p=>{const age=t-.35-p.d*.13;if(age<0)return;const onset=Math.min(1,age*5),a=onset*fade;
    floor.save();hexPath(floor,p.x,p.y,S_-2,perspectiveScale(p.r));floor.clip();
    if(mode==='fire'){
     const burn=Math.min(1,Math.max(0,(age-.7)/1.4));
     floor.globalAlpha=a*burn*.62;floor.fillStyle='#514530';
     path(floor,Array.from({length:11},(_,j)=>{const angle=j*Math.PI*2/11,radius=18+Math.sin(p.seed*4+j*7)*9;return[p.x+Math.cos(angle)*radius,p.y+Math.sin(angle)*radius*.65]}));floor.fill();
     if(age<3.5){const heat=floor.createRadialGradient(p.x,p.y,1,p.x,p.y,29);heat.addColorStop(0,'rgba(241,134,40,.35)');heat.addColorStop(1,'rgba(241,134,40,0)');floor.globalAlpha=a*Math.max(0,1-age/3.5);floor.fillStyle=heat;floor.fillRect(p.x-30,p.y-30,60,60)}
    }else if(mode==='electric'){
     if(age<3.6){
      const charge=a*Math.min(1,(3.6-age)/.7),angle=p.seed*.7+Math.floor(t*8)*.8;
      floor.globalAlpha=charge*.32;const glow=floor.createRadialGradient(p.x,p.y,2,p.x,p.y,38);glow.addColorStop(0,'#f5d96b');glow.addColorStop(1,'rgba(220,180,60,0)');floor.fillStyle=glow;floor.fillRect(p.x-40,p.y-40,80,80);
      for(let j=0;j<2;j++){const x2=p.x+Math.cos(angle+j*2.2)*32,y2=p.y+Math.sin(angle+j*2.2)*25;
       floor.globalAlpha=charge*.65;floor.lineWidth=5;floor.strokeStyle='#b18b37';bolt(floor,p.x-8,p.y+6,x2,y2,p.seed+j,t);
       floor.globalAlpha=charge;floor.lineWidth=2;floor.strokeStyle='#fff2a6';bolt(floor,p.x-8,p.y+6,x2,y2,p.seed+j,t);
      }
     }
    }else if(mode==='rock'){
     floor.globalAlpha=a*.23;floor.fillStyle='#75654b';for(let j=0;j<7;j++){const angle=p.seed+j*2.4;floor.fillRect(p.x+Math.cos(angle)*(8+j*3),p.y+Math.sin(angle)*(6+j*2),2+j%3,2)}
    }else if(mode==='poison'){
     const spread=Math.min(1,age*.8+.25),points=Array.from({length:12},(_,j)=>{const theta=j*Math.PI/6,r=(24+Math.sin(p.seed+j*2.4)*9)*spread;return[p.x+Math.cos(theta)*r,p.y+Math.sin(theta)*r*.64]});
     const puddle=()=>{floor.beginPath();const first=points[0],last=points.at(-1);floor.moveTo((first[0]+last[0])/2,(first[1]+last[1])/2);points.forEach((v,j)=>{const next=points[(j+1)%points.length];floor.quadraticCurveTo(...v,(v[0]+next[0])/2,(v[1]+next[1])/2)});floor.closePath()};
     floor.save();floor.translate(0,2);puddle();floor.globalAlpha=a*.8;floor.fillStyle='#3c3047';floor.fill();floor.restore();
     const liquid=floor.createRadialGradient(p.x-10,p.y-9,1,p.x,p.y,34);liquid.addColorStop(0,'#9e83ae');liquid.addColorStop(.48,'#71507f');liquid.addColorStop(1,'#42314f');puddle();floor.globalAlpha=a*.92;floor.fillStyle=liquid;floor.fill();
     floor.globalAlpha=a*.45;floor.strokeStyle='#b9a1bc';floor.lineWidth=1.2;floor.beginPath();floor.ellipse(p.x-7,p.y-5,10*spread,3*spread,-.2,Math.PI*1.05,Math.PI*1.9);floor.stroke();
     for(let j=0;j<3;j++){const bubble=(age*.65+p.seed*.07+j*.33)%1,bx=p.x+Math.sin(p.seed+j*3)*15*spread,by=p.y+Math.cos(p.seed+j*5)*9*spread,radius=1+bubble*4;floor.globalAlpha=a*Math.min(1,(1-bubble)*3);floor.fillStyle='#846591';floor.beginPath();floor.ellipse(bx,by,radius,radius*.75,0,0,Math.PI*2);floor.fill();floor.strokeStyle='#c6b1c8';floor.lineWidth=1;floor.beginPath();floor.ellipse(bx-1,by-1,radius*.65,radius*.45,-.3,Math.PI,Math.PI*1.85);floor.stroke()}
    }
    floor.restore();
    if(mode==='fire'&&age<3.3&&flameImage.complete&&flameImage.naturalWidth){
     const ignition=Math.min(1,age*8),out=Math.min(1,(3.3-age)/.7),count=p.d===2?1:2;
     fx.imageSmoothingEnabled=false;
     for(let j=0;j<count;j++){
      const phase=p.seed*.17+j*.43,x=p.x+Math.sin(p.seed+j*4)*15,y=p.y+Math.cos(p.seed*2+j)*9;
      const frames=Math.max(1,Math.floor(flameImage.naturalHeight/32)),frame=Math.floor((age*13+phase*8))%frames;
      const width=(34+(p.seed+j*13)%19)*ignition,height=(48+(p.seed+j*7)%29)*( .94+Math.sin(t*9+phase)*.06)*ignition;
      fx.globalAlpha=out*.94;fx.drawImage(flameImage,0,frame*32,32,32,Math.round(x-width/2),Math.round(y-height+7),width,height);
     }fx.globalAlpha=1;
    }
   });
   debris.forEach((p,i)=>{const age=t-.35-p.delay;if(age<0)return;
    if(mode==='rock'){
     const air=Math.max(0,Math.sin(Math.min(1,age/.65)*Math.PI)*p.v*.55)+Math.max(0,Math.sin(Math.max(0,Math.min(1,(age-.65)/.45))*Math.PI)*p.v*.16),drift=p.v*(1-Math.exp(-age*2)),x=p.x+Math.cos(p.a)*drift,y=p.y+Math.sin(p.a)*drift*.65;
     const size=p.s*(i%6===0?1.65:1.15);
     floor.globalAlpha=fade*.32;floor.fillStyle='#39362d';floor.beginPath();floor.ellipse(x+2,y+4,size*.95,3+size*.25,0,0,Math.PI*2);floor.fill();
     fx.save();fx.translate(x,y-air);fx.rotate(age<1.1?Math.sin(p.a)*age*3:Math.sin(p.a)*3.3);fx.globalAlpha=fade;
     const verts=[[-size,-size*.15],[-size*.45,-size*.9],[size*.43,-size*.76],[size,-size*.12],[size*.6,size*.62],[-size*.5,size*.7]],center=[-size*.12,-size*.02];
     path(fx,verts);fx.fillStyle='#68665a';fx.fill();
     path(fx,[verts[0],verts[1],verts[2],center]);fx.fillStyle=i%2?'#b1ad97':'#a09f91';fx.fill();
     path(fx,[verts[2],verts[3],verts[4],center]);fx.fillStyle='#77776b';fx.fill();
     path(fx,[verts[4],verts[5],verts[0],center]);fx.fillStyle='#4d5148';fx.fill();
     path(fx,verts);fx.strokeStyle='#41463c';fx.lineWidth=.8;fx.stroke();
     fx.strokeStyle='#d0c9ac';fx.lineWidth=.8;fx.beginPath();fx.moveTo(...verts[0]);fx.lineTo(...verts[1]);fx.lineTo(...verts[2]);fx.stroke();fx.restore();
     if(age<1.2){floor.globalAlpha=(1-age/1.2)*.2;floor.fillStyle='#c6b28b';floor.fillRect(x-7,y-3,16+age*12,6)}
    }else if(mode==='fire'&&age<2.8){fx.globalAlpha=Math.max(0,1-age/2.8)*.8;fx.fillStyle=i%3?'#dc944b':'#ffe2a1';fx.fillRect(p.x+Math.sin(age*3+i)*9,p.y-age*(15+i%6*5),2,2)}
    else if(mode==='electric'&&age<1.7&&i%3===0){const flicker=Math.sin(t*35+i)>.2;if(flicker){fx.globalAlpha=(1-age/1.7)*.8;fx.strokeStyle='#f5df91';fx.lineWidth=1.5;bolt(fx,p.x,p.y,p.x+Math.cos(p.a)*12,p.y-12,p.a,t)}}
    else if(mode==='wind'&&age<2.3){const flow=age*115,x=p.x+flow*.8,y=p.y-flow*.32-Math.sin(age*4+i)*7;fx.globalAlpha=Math.max(0,1-age/2.3)*.65;if(i%3){fx.fillStyle=i%2?'#89965d':'#b5a575';path(fx,[[x-5,y],[x,y-3],[x+6,y+1],[x,y+3]]);fx.fill()}else{fx.strokeStyle='#c8c3a2';fx.lineWidth=1;fx.beginPath();fx.moveTo(x,y);fx.lineTo(x-27,y+9);fx.stroke()}}
   });floor.globalAlpha=1;fx.globalAlpha=1;
   if(mode==='wind'&&t>.35&&t<4.8){
    // Independent funnels travel through the field, narrow at the floor and broad above.
    for(let v=0;v<Math.min(5,Math.max(2,event.radius*2+1));v++){
     const age=t-.35-v*.16;if(age<0)continue;
     const strength=Math.min(1,age*4)*Math.min(1,(4.8-t)/.8),phase=v*2.399;
     const anchor=v<2?bases[v]:null,x=anchor?anchor.x+Math.sin(age*1.6+v)*12:origin.x+Math.cos(phase)*75+Math.sin(age*1.6+v)*30+age*12,y=anchor?anchor.y+Math.cos(age*1.4+v)*5:origin.y+Math.sin(phase)*46-age*6;
     floor.globalAlpha=strength*.25;floor.fillStyle='#4a4938';floor.beginPath();floor.ellipse(x,y+3,23,10,0,0,Math.PI*2);floor.fill();floor.globalAlpha=1;
     const height=86+(v%3)*12;
     for(let j=0;j<11;j++){
      const h=j/10,radius=7+h*30,cy=y-h*height,wobble=Math.sin(age*6-h*5+v)*h*7;
      fx.globalAlpha=strength*(.3+h*.25);fx.fillStyle='#aab4a1';fx.beginPath();fx.ellipse(x+wobble,cy,radius,radius*.28,0,0,Math.PI*2);fx.fill();
      fx.globalAlpha=strength*.95;fx.strokeStyle=j%2?'#f0f1d8':'#d2ddc7';fx.lineWidth=j%3?2.5:3.5;
      const spin=age*9+j*.8+v;fx.beginPath();fx.ellipse(x+wobble,cy,radius,radius*.28,0,spin,spin+Math.PI*1.25);fx.stroke();
     }
     for(let j=0;j<12;j++){
      const h=((age*.55+j/12)%1),a=age*8+j*2.4+v,radius=8+h*23;
      const px=x+Math.cos(a)*radius,py=y-h*height+Math.sin(a)*radius*.25;
      fx.globalAlpha=strength*(1-h*.6);fx.fillStyle=j%3?'#8e9e61':'#d3bc86';
      fx.save();fx.translate(px,py);fx.rotate(a);fx.fillRect(-3,-1,6,2);fx.restore();
     }
    }fx.globalAlpha=1;
   }
   bases.forEach(p=>{const age=t-.48-p.i*.13;if(age<0)return;if(!p.reacted){p.reacted=true;if(!['fire','electric','wind'].includes(mode))PMD.playNames(p.u.el,['Hurt'])}
    let dx=0,dy=0;if(mode==='electric'&&age<3.5&&!reduced){const power=Math.min(1,(3.5-age)/.7),pulse=Math.floor(age*20),direction=pulse%2?1:-1;dx=direction*7*power;dy=(pulse%3-1)*2.5*power}
    if(mode==='rock'&&age<.6&&!reduced){dx=Math.sin(age*19)*5*(1-age/.6);dy=-Math.sin(age/.6*Math.PI)*5}
    if(mode==='wind'){
     const windAge=t-.35-p.i*.16,strength=Math.max(0,Math.min(1,windAge*3,(4.8-t)/.7));
     const centerX=p.x+Math.sin(windAge*1.6+p.i)*12,centerY=p.y+Math.cos(windAge*1.4+p.i)*5;
     dx=(centerX-p.x)+(reduced?0:Math.cos(windAge*7)*10*strength);
     dy=(centerY-p.y)-strength*(reduced?2:8)+(reduced?0:Math.sin(windAge*7)*3*strength);
     if(!p.spinSprite){p.spinSprite=p.u.el.querySelector('canvas.pmdc')||p.u.el.querySelector('.spr>img');if(p.spinSprite)p.spinRotate=p.spinSprite.style.rotate}
     p.u.el.classList.toggle('arena-react-whirlwind',strength>0);
     p.u.moving=false;p.u.el._pmdOne=null;
     p.u.fa=strength>0&&!reduced?(p.fa||0)+windAge*Math.PI*2*1.2:p.fa;
     const st=p.u.el._pmd;
     if(strength>0&&st){
      if(!p.turnCanvas){p.turnOriginal=st.cv;p.turnDisplay=st.cv.style.display;p.turnCanvas=document.createElement('canvas');p.turnCanvas.className='pmdc arena-react-turn-canvas';p.turnOriginal.after(p.turnCanvas)}
      p.turnCanvas.width=st.d.cw;p.turnCanvas.height=st.d.ch;p.turnCanvas.style.cssText=st.cv.style.cssText;p.turnCanvas.style.display='block';p.turnCanvas.style.rotate='none';st.cv.style.display='none';
      const anim=st.d.Idle.rows>=8?st.d.Idle:st.d.Walk;
      const row=matchMedia('(prefers-reduced-motion:reduce)').matches?0:Math.floor(Math.max(0,windAge)*8)%Math.min(8,anim.rows);
      const frame=0,rb=anim.b.fb?.[row]?.[frame]??anim.b.rb[row]??anim.fh;
      const cg=p.turnCanvas.getContext('2d');cg.imageSmoothingEnabled=false;
      cg.drawImage(anim.img,0,row*anim.fh,anim.fw,anim.fh,Math.round(st.d.ax-anim.fw/2),st.d.ch-rb-1,anim.fw,anim.fh);
     }else if(p.turnCanvas){p.turnCanvas.remove();p.turnCanvas=null;p.turnOriginal.style.display=p.turnDisplay}
     if(p.spinSprite)p.spinSprite.style.rotate=p.spinRotate;
    }
    p.u.x=p.x+dx;p.u.y=p.y+dy;updateCUEl(p.u);
    if(mode==='fire'&&age<5&&flameImage.naturalWidth){
     const intensity=Math.min(1,age*6)*Math.min(1,(5-age)/.9),frames=Math.max(1,Math.floor(flameImage.naturalHeight/32));
     if(!p.fire){
      p.fire=document.createElement('div');p.fire.style.cssText='position:absolute;left:50%;bottom:-3px;transform:translateX(-50%);width:72px;height:72px;pointer-events:none;z-index:100';
      for(let j=0;j<2;j++){const flame=document.createElement('div');flame.style.cssText=`position:absolute;left:${j*24}px;bottom:${j?7:0}px;width:48px;height:48px;background-image:url("${flameImage.src}");background-size:48px auto;background-repeat:no-repeat;image-rendering:pixelated`;p.fire.append(flame)}
      p.u.el.querySelector('.in').append(p.fire);
     }
     p.fire.style.opacity=String(intensity*.95);
     Array.from(p.fire.children).forEach((flame,j)=>flame.style.backgroundPosition=`0px ${-(Math.floor(age*13+p.i*3+j*3 )%frames)*48}px`);
     // Flames remain attached to the occupied Pokémon, extending up its sides and body.
     fx.imageSmoothingEnabled=false;
     for(let j=0;j<3;j++){
      const frame=Math.floor(age*13+p.i*3+j*2)%frames,width=j===1?23:29,height=j===1?42:54;
      const x=p.u.x+(j-1)*13,y=p.u.y-4-(j===1?11:0);
      fx.globalAlpha=intensity*(j===1?.5:.85);
      fx.drawImage(flameImage,0,frame*32,32,32,Math.round(x-width/2),Math.round(y-height),width,height);
     }
     for(let j=0;j<9;j++){
      const rise=(age*30+j*9)%72,x=p.u.x+Math.sin(j*4+p.i+age*2)*19,y=p.u.y-17-rise;
      fx.globalAlpha=intensity*(1-rise/72);fx.fillStyle=j%3?'#f2a34e':'#ffe6a1';fx.fillRect(Math.round(x),Math.round(y),2,3);
     }fx.globalAlpha=1;
    }else if(mode==='fire'&&p.fire){p.fire.remove();p.fire=null}
    if(mode==='electric'&&age<3.5){
     p.u.el.classList.add('arena-react-electrocuted');
     if(!p.shockSprite){p.shockSprite=p.u.el.querySelector('.spr');if(p.shockSprite){p.shockTranslate=p.shockSprite.style.translate;p.shockFilter=p.shockSprite.style.filter}}
     if(p.shockSprite){
      const tick=Math.floor(age*18),power=Math.min(1,(3.5-age)/.7),flash=Math.floor(age*5)%2===0;
      p.shockSprite.style.translate=reduced?'0px 0px':`${(tick%2?8:-8)*power}px ${(tick%3-1)*3*power}px`;
      p.shockSprite.style.filter=reduced?'drop-shadow(0 0 4px #ffe585)':flash?'brightness(1.65) sepia(.8) saturate(2) drop-shadow(0 0 5px #ffdc55)':'brightness(.8) sepia(.5) saturate(1.5) drop-shadow(0 0 3px #fff2ac)';
     }
     if(!p.electric){const c=document.createElement('canvas');c.width=96;c.height=112;c.style.cssText='position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);width:96px;height:112px;z-index:101;pointer-events:none';p.u.el.querySelector('.in').append(c);p.electric=c}
     const eg=p.electric.getContext('2d'),strength=Math.min(1,age*8)*Math.min(1,(3.5-age)/.7);eg.clearRect(0,0,96,112);
     // Local arcs wrap around the sprite instead of remaining on the floor.
     for(let j=0;j<5;j++){
      const theta=j*Math.PI*2/5+Math.floor(age*12)*.27,x=48+Math.cos(theta)*25,y=63+Math.sin(theta)*27,x2=48+Math.cos(theta+1.1)*29,y2=63+Math.sin(theta+1.1)*30;
      eg.globalAlpha=strength*.45;eg.strokeStyle='#edbc42';eg.lineWidth=5;bolt(eg,x,y,x2,y2,j+p.i*7,age);
      eg.globalAlpha=strength;eg.strokeStyle='#fff3a1';eg.lineWidth=2;bolt(eg,x,y,x2,y2,j+p.i*7,age);
     }
     eg.globalAlpha=strength*.85;eg.fillStyle='#ffffd5';for(let j=0;j<4;j++){const x=48+Math.sin(j*7+Math.floor(age*17))*31,y=62+Math.cos(j*3+Math.floor(age*13))*33;eg.fillRect(x-3,y,7,2);eg.fillRect(x,y-3,2,7)}eg.globalAlpha=1;
    }else if(mode==='electric'){p.u.el.classList.remove('arena-react-electrocuted','arena-react-whirlwind');if(p.electric){p.electric.remove();p.electric=null}if(p.shockSprite){p.shockSprite.style.translate=p.shockTranslate;p.shockSprite.style.filter=p.shockFilter}}
   });
   if(t<6)raf=queue(frame);else{stop(false);}
  }raf=queue(frame);
 }
run();return {draw:now=>{if(job.next)job.next(now)},stop:()=>stop()};
}
function earthquake(event,job){
const env=environment(event,job),{attacker,targets,clock,queue,unqueue,updateCUEl,PMD,B}=env;let raf=0;const ctx=env.layer(1),moved=new Map();const cv=ctx.canvas,target=targets[0];
 function stop(){unqueue();ctx.clearRect(0,0,1280,800);moved.forEach(v=>{v.u.x=v.x;v.u.y=v.y;updateCUEl(v.u);v.u.el.style.translate=v.translate});moved.clear()}
 function play(){
  stop();drawGrid();const start=clock.now(),reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
  const snapshot=document.createElement('canvas');snapshot.width=1280;snapshot.height=800;const sg=snapshot.getContext('2d');
  // Both original layers use a 640px horizontal apron; arena has a 256px top apron.
  sg.drawImage(document.getElementById('scene'),640*CS,0,1280*CS,800*CS,0,0,1280,800);
  sg.drawImage(document.getElementById('arenabase'),640*CS,256*CS,1280*CS,800*CS,0,0,1280,800);
  const tiles=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=hdist(event.r,event.c,r,c);if(d>event.radius)continue;const p=hexXY(r,c),radius=S_-2,k=perspectiveScale(r),seed=r*17+c*29;
   let rng=seed+431;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
   const verts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[Math.cos(a)*radius*k,Math.sin(a)*radius*k]});
   const center=[(random()-.5)*radius*.5,(random()-.5)*radius*.5],offset=seed%2;
   const branches=Array.from({length:3},(_,i)=>{const v=verts[(i*2+offset)%6],path=[center];for(let j=1;j<4;j++){const f=j/4;path.push([center[0]+(v[0]-center[0])*f+(random()-.5)*radius*.2,center[1]+(v[1]-center[1])*f+(random()-.5)*radius*.2])}path.push(v);return path});
   const fragments=branches.map((branch,i)=>{const next=(i+1)%3,index=(i*2+offset)%6,points=[...branch,verts[(index+1)%6],...branches[next].slice().reverse()];const cx=points.reduce((s,v)=>s+v[0],0)/points.length,cy=points.reduce((s,v)=>s+v[1],0)/points.length,length=Math.hypot(cx-center[0],cy-center[1])||1;return{points,x:(cx-center[0])/length,y:(cy-center[1])/length,tilt:(random()-.5)*.06,depth:3+random()*3}});
   tiles.push({r,c,...p,radius,k,d,fragments,phase:seed*.7,angle:(seed%9-4)*.004,delay:d*.13});
  }
  let reaction=-1;
  const unitEls=B.units.filter(u=>u.el&&u.alive).map(u=>({el:u.el,u,baseX:u.x,baseY:u.y}));
  function frame(now){const t=(now-start)/1000;ctx.clearRect(0,0,1280,800);const end=Math.max(0,Math.min(1,(5.4-t)/1.4));
   // Cover the original static tile faces with a dark seam bed before moving their textures.
   tiles.forEach(p=>{const age=t-p.delay;if(age<0)return;const onset=Math.min(1,age*8);ctx.globalAlpha=onset*end;hexPath(ctx,p.x,p.y,p.radius+1,p.k);ctx.fillStyle='#211f19';ctx.fill()});ctx.globalAlpha=1;
   tiles.forEach(p=>{
    const age=t-p.delay;if(age<0)return;const envelope=Math.max(0,1-age/3.6),amp=reduced?0:envelope*(p.d===0?18:13),dx=Math.sin(age*27+p.phase)*amp*.85,dy=Math.sin(age*34+p.phase)*amp*1.1,lift=Math.sin(Math.min(1,age/.45)*Math.PI)*amp,rot=Math.sin(age*22+p.phase)*p.angle*4*envelope;
    const gap=Math.min(1,age*4)*end*(p.d===0?5:3);
    ctx.save();ctx.translate(p.x+dx,p.y+dy-lift);ctx.rotate(rot);ctx.globalAlpha=end;
    // Seams are empty space between textured fragments, not strokes on the surface.
    p.fragments.forEach(f=>{
     ctx.save();ctx.translate(f.x*gap,f.y*gap);ctx.rotate(reduced?0:f.tilt*envelope);
     const path=()=>{ctx.beginPath();f.points.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath()};
     ctx.save();ctx.translate(0,f.depth);path();ctx.fillStyle='#62553e';ctx.fill();ctx.restore();
     ctx.save();path();ctx.clip();ctx.drawImage(snapshot,-p.x,-p.y);ctx.restore();
     // Exposed bevel stays subtle and irregular; no repeated central zigzag.
     ctx.beginPath();const boundary=f.points.slice(0,5);boundary.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.strokeStyle='#bca77b';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
    });
    ctx.restore();
    // Small grit only at seams, no clouds or glowing shock rings.
    if(age<1.3){ctx.globalAlpha=(1-age/1.3)*.6;ctx.fillStyle='#796b4f';for(let j=0;j<3;j++){const a=p.phase+j*2.1,x=p.x+Math.cos(a)*p.radius*.7,y=p.y+Math.sin(a)*p.radius*.6-age*12;ctx.fillRect(Math.round(x),Math.round(y),2,2)}ctx.globalAlpha=1}
   });
   unitEls.forEach(({el,u,baseX,baseY})=>{
    const p=tiles.find(p=>p.r===u.r&&p.c===u.c);if(!p)return;
    if(!moved.has(el))moved.set(el,{u,x:baseX,y:baseY,translate:el.style.translate});
    const age=t-p.delay;if(age<0)return;
    const env=Math.max(0,1-age/3.6),amp=reduced?0:env*(p.d===0?18:13);
    const dx=Math.sin(age*27+p.phase)*amp*.85,dy=Math.sin(age*34+p.phase)*amp*1.1,lift=Math.sin(Math.min(1,age/.45)*Math.PI)*amp;
    // Use the same world coordinates as the moving tile, not a decorative CSS offset.
    u.x=baseX+dx;u.y=baseY+dy-lift;updateCUEl(u);
    if(u===target){
     if(reaction<0){reaction=0;PMD.playNames(el,['Hurt'])}
    }
   });
   if(t<5.4)raf=queue(frame);else{stop();}
  }
  raf=queue(frame);
 }
play();return {draw:now=>{if(job.next)job.next(now)},stop:()=>stop()};
}
function surf(event,job){
const env=environment(event,job),{attacker,targets,clock,queue,unqueue,updateCUEl,PMD,B}=env;let raf=0;const g=env.layer(1),f=env.layer(2500);let base=null;const target=targets[0]||env.center;
 function stop(reset=true){unqueue();g.clearRect(0,0,1280,800);f.clearRect(0,0,1280,800);if(target&&base&&reset){target.x=base.x;target.y=base.y;updateCUEl(target);target.el._pmdOne=null}if(reset)base=null}
 function run(){
  stop();base={x:target.x,y:target.y};const origin={x:attacker.x,y:attacker.y},vx=base.x-origin.x,vy=base.y-origin.y,length=Math.hypot(vx,vy),dx=vx/length,dy=vy/length,nx=-dy,ny=dx;
  const reduce=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches,start=clock.now();let hit=false;
  const project=(s,w,lift=0)=>[origin.x+dx*s+nx*w,origin.y+dy*s+ny*w-lift];
  const tiles=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(r,c),px=p.x-origin.x,py=p.y-origin.y,s=px*dx+py*dy,w=px*nx+py*ny;if(s>-40&&s<length+170&&Math.abs(w)<100&&hdist(event.r,event.c,r,c)<=event.radius)tiles.push({...p,r,c,s,w})}
  function frame(now){
   const t=(now-start)/1000,travel=(t-.35)*220,front=travel<=length+45?travel:length+45+95*(1-Math.exp(-(travel-length-45)/95)),fade=Math.max(0,Math.min(1,(5-t)/1.5));g.clearRect(0,0,1280,800);f.clearRect(0,0,1280,800);
   // Water spreads over the actual floor, leaving shallow pools that drain away.
   tiles.forEach(p=>{const age=(front-p.s)/220;if(age<0)return;const wet=Math.min(1,age*6)*Math.max(0,1-age/4)*fade;
    g.save();hexPath(g,p.x,p.y,S_-2,perspectiveScale(p.r));g.clip();g.fillStyle=`rgba(37,105,120,${wet*.48})`;g.fillRect(p.x-70,p.y-70,140,140);
    for(let j=0;j<4;j++){const s=p.s+Math.sin(t*2+j+p.r)*7,w=p.w+(j-1.5)*13;const a=project(s,w);g.strokeStyle=`rgba(176,220,210,${wet*.32})`;g.lineWidth=1;g.beginPath();g.moveTo(a[0]-nx*9,a[1]-ny*9);g.lineTo(a[0]+nx*9,a[1]+ny*9);g.stroke()}g.restore();
   });
   // A coherent moving ridge rather than a stream of small projectiles.
   if(front>0&&front<length+140){
    const edgeFade=Math.min(1,front/45,Math.max(0,(length+140-front)/80)),height=(reduce?18:36)*edgeFade,width=78;
    const back=[],lip=[];for(let w=-width;w<=width;w+=6){const taper=Math.sqrt(Math.max(0,1-w*w/(width*width))),bend=Math.sin(w*.06+t*5)*4;lip.push(project(front+bend,w,height*taper));back.push(project(front-52*taper,w,1))}
    f.beginPath();back.forEach((p,i)=>i?f.lineTo(...p):f.moveTo(...p));lip.slice().reverse().forEach(p=>f.lineTo(...p));f.closePath();const grad=f.createLinearGradient(0,origin.y-60,0,origin.y+20);grad.addColorStop(0,'#82c5c6');grad.addColorStop(1,'#276d84');f.globalAlpha=.82*edgeFade;f.fillStyle=grad;f.fill();
    f.strokeStyle='#d9ece0';f.lineWidth=3;f.beginPath();lip.forEach((p,i)=>i?f.lineTo(...p):f.moveTo(...p));f.stroke();f.globalAlpha=1;
    // Short foam curls break along the crest and collapse onto the surface.
    for(let j=0;j<15;j++){const w=-70+j*10,taper=Math.max(0,1-Math.abs(w)/80),a=project(front+Math.sin(j*2+t*8)*5,w,height*taper+Math.sin(t*9+j)*3);f.fillStyle=j%3?'#bde0d7':'#f0f0d8';f.globalAlpha=edgeFade*.85;f.fillRect(Math.round(a[0]/2)*2,Math.round(a[1]/2)*2,4+j%3*2,2)}f.globalAlpha=1;
   }
   const hitAge=t-(.35+length/220);
   if(hitAge>=0){
    if(!hit){hit=true;PMD.playNames(target.el,['Hurt'])}
    // Follow the travelling water front, then settle at its final displacement.
    const carried=95*(1-Math.exp(-Math.max(0,front-length)/80));
    const buoyancy=reduce?0:Math.sin(Math.min(1,hitAge/.85)*Math.PI)*13;
    target.x=base.x+dx*carried;target.y=base.y+dy*carried-buoyancy;updateCUEl(target);
    if(hitAge<1.2)for(let i=0;i<18;i++){const a=i*2.399,age=hitAge,dist=12+age*(35+i%5*8);f.globalAlpha=Math.max(0,1-age/1.1)*.8;f.fillStyle=i%2?'#a6d6d2':'#e1efe4';f.fillRect(target.x+Math.cos(a)*dist,target.y+Math.sin(a)*dist*.5-Math.sin(age*Math.PI)*25,3,5)}f.globalAlpha=1;
   }
   targets.slice(1).forEach(u=>{const px=u._baseX-origin.x,py=u._baseY-origin.y,s=px*dx+py*dy,age=t-(.35+s/220);if(age<0)return;if(!u._surfHit){u._surfHit=true;PMD.playNames(u.el,['Hurt'])}const carried=95*(1-Math.exp(-Math.max(0,front-s)/80)),lift=reduce?0:Math.sin(Math.min(1,age/.85)*Math.PI)*13;u.x=u._baseX+dx*carried;u.y=u._baseY+dy*carried-lift;updateCUEl(u)});
   if(t<5)raf=queue(frame);else{stop(false);}
  }
  raf=queue(frame);
 }
run();return {draw:now=>{if(job.next)job.next(now)},stop:()=>stop()};
}
function ice(event,job){
const env=environment(event,job),{attacker,targets,clock,queue,unqueue,updateCUEl,PMD,B}=env;let raf=0;const g=env.layer(1);let bases=[];
 function stop(reset=true){unqueue();g.clearRect(0,0,1280,800);if(reset){bases.forEach(p=>{p.u.x=p.x;p.u.y=p.y;updateCUEl(p.u);p.u.el._pmdOne=null});bases=[]}}
 function run(){
  stop();const start=clock.now(),origin=hexXY(event.r,event.c),reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
  const tiles=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=hdist(event.r,event.c,r,c);if(d<=event.radius){const p=hexXY(r,c);tiles.push({...p,r,c,d,seed:r*31+c*13})}}
  bases=targets.map((u,i)=>{const away=slideDestination(u,event),length=Math.hypot(away.x-u.x,away.y-u.y);return{u,x:u.x,y:u.y,dx:(away.x-u.x)/length,dy:(away.y-u.y)/length,distance:length*(i?1.05:1.35),delay:.6+hdist(event.r,event.c,u.r,u.c)*.16,reacted:false}});
  
  function frame(now){const t=(now-start)/1000;g.clearRect(0,0,1280,800);
   tiles.forEach(p=>{const age=t-.4-p.d*.16;if(age<0)return;const freeze=Math.min(1,age*3),melt=Math.max(0,Math.min(1,(6-t)/1.6)),opacity=freeze*melt;
    const radius=S_-2,scale=perspectiveScale(p.r);
    g.save();g.globalAlpha=opacity*.85;hexPath(g,p.x,p.y+3,radius,scale);g.fillStyle='#527f91';g.fill();g.restore();
    g.save();hexPath(g,p.x,p.y,radius,scale);g.clip();
    const gradient=g.createLinearGradient(p.x-35,p.y-30,p.x+30,p.y+30);gradient.addColorStop(0,`rgba(235,250,248,${opacity*.92})`);gradient.addColorStop(.28,`rgba(161,216,230,${opacity*.86})`);gradient.addColorStop(.56,`rgba(85,153,187,${opacity*.82})`);gradient.addColorStop(.8,`rgba(196,235,238,${opacity*.9})`);gradient.addColorStop(1,`rgba(119,185,207,${opacity*.87})`);g.fillStyle=gradient;g.fillRect(p.x-70,p.y-70,140,140);
    // Broad trapped facets and translucent slanted reflections give the ice volume.
    g.globalAlpha=opacity*.42;g.fillStyle='#f1ffff';g.beginPath();g.moveTo(p.x-45,p.y+8);g.lineTo(p.x+8,p.y-38);g.lineTo(p.x+22,p.y-38);g.lineTo(p.x-32,p.y+14);g.closePath();g.fill();
    g.globalAlpha=opacity*.2;g.fillStyle='#2e769c';g.beginPath();g.moveTo(p.x-12,p.y+38);g.lineTo(p.x+9,p.y-7);g.lineTo(p.x+42,p.y+10);g.closePath();g.fill();
    g.globalAlpha=opacity*.32;g.strokeStyle='#fbffff';g.lineWidth=2;g.beginPath();g.moveTo(p.x-19,p.y+17);g.lineTo(p.x+17,p.y-15);g.stroke();
    // Thin frost branches follow the floor, with distinct patterns in each cell.
    g.globalAlpha=opacity*.65;g.strokeStyle='#e4f1ec';g.lineWidth=1;
    for(let j=0;j<3;j++){const a=p.seed+j*2.1,reach=(10+j*5)*freeze,ox=p.x+Math.sin(p.seed)*13,oy=p.y+Math.cos(p.seed)*11;g.beginPath();g.moveTo(ox,oy);g.lineTo(ox+Math.cos(a)*reach,oy+Math.sin(a)*reach*.65);g.stroke()}
    g.globalAlpha=opacity*.38;g.fillStyle='#edf8ed';g.fillRect(p.x-23,p.y-12,27,2);g.fillRect(p.x+2,p.y+8,19,1);
    if(t>3.5){g.globalAlpha=opacity*.55;g.strokeStyle='#548696';g.beginPath();g.moveTo(p.x-18,p.y+13);g.lineTo(p.x-4,p.y+3);g.lineTo(p.x+3,p.y+6);g.lineTo(p.x+18,p.y-11);g.stroke()}
    g.restore();
    // Beveled frozen rim and small angular ice chips along the edge.
    g.save();g.globalAlpha=opacity*.9;hexPath(g,p.x,p.y,radius-1,scale);g.strokeStyle='#d8f7f7';g.lineWidth=2;g.stroke();
    for(let j=0;j<2;j++){const a=(p.seed+j*2.7),x=p.x+Math.cos(a)*radius*scale*.8,y=p.y+Math.sin(a)*radius*scale*.8;g.beginPath();g.moveTo(x-3,y+2);g.lineTo(x-1,y-7);g.lineTo(x+4,y-3);g.lineTo(x+5,y+2);g.closePath();g.fillStyle=j?'#b3e5ee':'#e6fcfa';g.fill()}g.restore();
   });
   bases.forEach(p=>{const age=t-p.delay;if(age<0)return;if(!p.reacted){p.reacted=true;PMD.playNames(p.u.el,['Hurt'])}
    // Initial loss of grip, inertial glide and gradual friction, without snapping back.
    const progress=Math.min(1,Math.max(0,age/1.8)),ease=1-Math.pow(1-progress,2.4),distance=p.distance*ease;
    p.u.x=p.x+p.dx*distance;p.u.y=p.y+p.dy*distance;updateCUEl(p.u);
    if(progress<1){const footY=p.u.y+7;g.globalAlpha=(1-progress)*.6;g.strokeStyle='#e9f7ee';g.lineWidth=2;g.beginPath();g.moveTo(p.u.x-p.dx*17,footY-p.dy*17);g.lineTo(p.u.x-p.dx*35,footY-p.dy*35);g.stroke();g.globalAlpha=1}
    if(!reduced&&age<.35){const inner=p.u.el.querySelector('.in');if(inner&&!p.tilted){p.tilted=true;trackAnimation(job,inner,[{rotate:'0deg'},{rotate:(p.dx>0?'-9deg':'9deg')},{rotate:'0deg'}],{duration:700,easing:'ease-out'})}}
   });
   if(t<6)raf=queue(frame);else{stop(false);}
  }
  raf=queue(frame);
 }
run();return {draw:now=>{if(job.next)job.next(now)},stop:()=>stop()};
}
 window.ARENA_INTERACTIONS={field,touch,hit,tick,clear,handles:f=>jobs.includes(handled.get(f))};
})();
