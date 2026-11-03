/* Idle integration of the campaign trainer renderer and exact recall effect. */
window.createIdleTrainer=function(ctx){
 let stage,actor,hand,launch,front,canvas,raf=0,capturePoseUntil=0,current='red';const jobs=[],seen=new WeakSet(),assets=new Map();
 const ball=new Image();ball.src='assets/pokeapi/sprites/items/poke-ball.png';
 const clamp=n=>Math.max(0,Math.min(1,n));
 const image=name=>{if(!assets.has(name)){const im=new Image();im.src='assets/trainer-profile/sprites/'+name+'.png';assets.set(name,im)}return assets.get(name)};
 const rocketImages={};for(const name of ['jessie','james']){const im=new Image();im.src='assets/rocket-duo/'+name+'-color.png';rocketImages[name]=im}
 const rocketActive=()=>ctx.challenge?.()?.kind==='rocket'||jobs.some(j=>j.u.side===1);
 function rocketOwner(u){const far=hexXY(0,COLS-1),near=hexXY(ROWS-1,0),x=1280-345+46,y=far.y+(590-near.y);return {x,y:y+(u.L.ids[0]===23?-52:28)}}
 function drawRocket(now){if(!rocketActive())return;for(const name of ['jessie','james']){const im=rocketImages[name];if(!im.complete||!im.naturalWidth)continue;const u={L:{ids:[name==='jessie'?23:109]}},o=rocketOwner(u),recalling=jobs.some(j=>j.u.side===1&&(j.u.L.ids[0]===23)===(name==='jessie')),still=CFG.reduceFx||G.paused,frame=still?2:(Math.floor(now/(recalling?350:900)+(name==='james'?.5:0))%2?5:2),cell=im.naturalWidth;front.save();front.imageSmoothingEnabled=false;front.fillStyle='#10131a66';front.beginPath();front.ellipse(o.x,o.y+2,17,5,0,0,Math.PI*2);front.fill();front.drawImage(im,0,frame*cell,cell,cell,o.x-48,o.y-96,96,96);front.restore()}}
 function owner(){return document.body.classList.contains('idle-center-view')?{x:945,y:660}:{x:345,y:590}}
 function refresh(){if(!actor)return;const p=window.TRAINER_PROFILE_API?.state||{};current=ctx.state.idleProfile?.trainer||p.trainer||'red';const members=[...ctx.state.team,...ctx.state.collection],partner=members.find(m=>m.id===ctx.state.idleProfile?.partner)||ctx.state.team[0],L=partner?LINES.find(l=>l.names[0]===partner.name):null;dispatchEvent(new CustomEvent('idle-trainer-duo-change',{detail:{trainer:current,partner:L?.ids[partner.star-1]||0,partnerShiny:!!partner?.shiny}}));image(current+'_normal');if(['red','leaf'].includes(current))image(current+'_item');const o=owner();actor.style.left=o.x+'px';actor.style.top=o.y+'px';actor.title=(ctx.state.idleProfile?.name||p.name||'Treinador')+' · Nv. '+ctx.state.trainerLevel+' · Abrir perfil';actor.setAttribute('aria-label',actor.title);const icon=launch.firstElementChild;icon.onerror=()=>{icon.onerror=null;icon.src='assets/showdown/trainers/red.png'};icon.src='assets/showdown/trainers/'+(current==='leaf'?'green':current)+'.png';}
 function open(){ctx.closePanels();window.TRAINER_PROFILE?.open()}
 function point(element){if(!element)return null;const r=element.getBoundingClientRect(),base=stage.getBoundingClientRect(),scale=base.width/stage.offsetWidth;return{x:(r.left+r.width/2-base.left)/scale,y:(r.top+r.height/2-base.top)/scale}}
 function unitPoint(u){if(!u||!Number.isFinite(u.x)||!Number.isFinite(u.y))return null;const marker=document.createElement('i');marker.style.cssText='position:absolute;left:'+u.x+'px;top:'+(u.y-34)+'px;width:1px;height:1px;pointer-events:none';document.getElementById('arenaView').append(marker);const p=point(marker);marker.remove();return p}
 function throwBall(){capturePoseUntil=performance.now()+1850;window.TRAINER_DUO?.react('recall')}
 function begin(u){if(document.hidden||window.IDLE_BACKGROUND_BUSY)return false;
  if((u.side!==0&&!(u.side===1&&ctx.challenge?.()?.kind==='rocket'))||seen.has(u)||!actor||!u.el)return false;
  const node=u.el.querySelector('canvas.pmdc')||u.el.querySelector('.spr img');if(!node)return false;
  try{
   const width=node.width||node.naturalWidth,height=node.height||node.naturalHeight;if(!width||!height)return false;
   let sx=0,sy=0,sw=width,sh=height;const st=u.el._pmd;
   if(st&&node===st.cv){const a=st.d[st.name]||st.d.Idle,b=a.b,row=Math.min(a.rows-1,st.frow||0),bottom=b.rb[row]??b.mxy,top=b.rt[row]??b.mny;sx=Math.max(0,Math.floor(st.d.ax-a.fw/2+b.mnx));sy=Math.max(0,Math.floor(st.d.ch-bottom-1+top));sw=Math.min(width-sx,b.mxx-b.mnx+1);sh=Math.min(height-sy,bottom-top+1)}
   if(sw<=0||sh<=0)return false;
   const snapshot=document.createElement('canvas');snapshot.width=sw;snapshot.height=sh;const g=snapshot.getContext('2d');g.drawImage(node,sx,sy,sw,sh,0,0,sw,sh);g.globalCompositeOperation='source-in';g.fillStyle='#ff7f94';g.fillRect(0,0,sw,sh);
   const rect=node.getBoundingClientRect(),px=rect.width/width,py=rect.height/height,screenX=rect.left+(sx+sw/2)*px,screenY=rect.top+(sy+sh/2)*py;
   const project=(x,y)=>toWorld({clientX:x,clientY:y}),center=project(screenX,screenY),left=project(screenX-sw*px/2,screenY),right=project(screenX+sw*px/2,screenY),top=project(screenX,screenY-sh*py/2),bottom=project(screenX,screenY+sh*py/2),o=u.side===1?rocketOwner(u):owner();
   let resolve;const promise=new Promise(done=>resolve=done);jobs.push({u,node,image:snapshot,w:Math.hypot(right.x-left.x,right.y-left.y),h:Math.hypot(bottom.x-top.x,bottom.y-top.y),center,hand:{x:o.x+(u.side===1?-16:26),y:o.y-(u.side===1?40:68)},age:0,start:performance.now(),promise,resolve});seen.add(u);u.el.style.display='none';window.TRAINER_DUO?.react('recall');return true;
  }catch(error){console.warn('Recolhimento idle:',error);return false}
 }
 function drawJob(job){
  const {u,node,image,w,h,center,hand}=job,t=job.age,reduced=CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
   if(t<=.35){front.imageSmoothingEnabled=false;front.drawImage(image,center.x-w/2,center.y-h/2,w,h)}
   if(t>.25&&t<1.85){
    if(ball.complete&&ball.naturalWidth){front.imageSmoothingEnabled=false;front.drawImage(ball,hand.x-11,hand.y-11,22,22)}
   }
   if(t>.35&&t<1.6){
    const pull=clamp((t-.72)/.85),ease=1-Math.pow(1-pull,3),x=center.x+(hand.x-center.x)*ease,y=center.y+(hand.y-center.y)*ease;
    front.save();front.globalAlpha=Math.min(1,(t-.35)*8)*(1-pull*.6);front.lineCap='round';front.strokeStyle='rgba(246,87,115,.28)';front.lineWidth=10;front.beginPath();front.moveTo(hand.x,hand.y);front.lineTo(x,y);front.stroke();front.strokeStyle='#f76c86';front.lineWidth=3;front.stroke();front.strokeStyle='#ffd4d6';front.lineWidth=1;front.stroke();front.restore();

    const scale=Math.max(.035,Math.pow(1-pull,1.6));front.save();front.globalAlpha=1-pull*.25;front.imageSmoothingEnabled=false;front.drawImage(image,x-w*scale/2,y-h*scale/2,w*scale,h*scale);front.restore();
   }

   if(t>=1.6){const flash=clamp((t-1.6)/.45);if(flash<1){front.save();front.globalAlpha=(1-flash)*.85;front.strokeStyle='#ffd2c5';front.lineWidth=2;front.beginPath();front.ellipse(hand.x,hand.y,5+flash*19,5+flash*19,0,0,Math.PI*2);front.stroke();if(!reduced){front.fillStyle='#fff0d6';front.fillRect(hand.x-3,hand.y-7,6,14);front.fillRect(hand.x-7,hand.y-3,14,6)}front.restore()}}

 }
 function drawTrainer(now){
  const o=owner(),throwing=now<capturePoseUntil;
  if(throwing){
   const age=(now-(capturePoseUntil-1850))/1000,hasPose=['red','leaf'].includes(current),action=age<1.15&&hasPose,frame=age<.16?3:age<.4?4:age<.85?5:4,im=image(current+(action?'_item':'_normal')),fw=current==='biker'?32:16;
   if(window.TRAINER_DUO){front.save();front.beginPath();front.rect(o.x-145,o.y-150,112,190);front.clip();TRAINER_DUO.draw(front,o.x,o.y,now,1,'arena');front.restore()}
   front.save();front.translate(o.x,o.y);front.fillStyle='#232b2073';front.fillRect(-22,0,44,5);const quiet=CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches;if(!quiet)front.rotate(Math.sin(Math.min(1,age/1.15)*Math.PI)*.065);front.scale(-1,1);front.imageSmoothingEnabled=false;if(im.complete&&im.naturalWidth)front.drawImage(im,(action?frame:2)*fw,0,fw,32,-fw*3.75/2,-120,fw*3.75,120);front.restore();return;
  }
  if(window.TRAINER_DUO){TRAINER_DUO.draw(front,o.x,o.y,now,1,'arena');return}
  const active=jobs.some(j=>j.age>.2&&j.age<1.8),gesture=active&&['red','leaf'].includes(current),im=image(current+(gesture?'_item':'_normal')),fw=current==='biker'?32:16;if(!im.complete||!im.naturalWidth)return;front.save();front.translate(o.x,o.y);front.scale(-1,1);front.imageSmoothingEnabled=false;front.drawImage(im,(gesture?5:2)*fw,0,fw,32,-fw*3.75/2,-120,fw*3.75,120);front.restore();
 }
 let lastPaint=0,wasHidden=false;
 function loop(now){raf=requestAnimationFrame(loop);if(document.hidden)return;for(let i=jobs.length-1;i>=0;i--){const j=jobs[i];j.age=(now-j.start)/1000;if(j.age>=2.5){jobs.splice(i,1);j.resolve()}}const hidden=document.body.classList.contains('idle-center-view')||document.body.classList.contains('rv-native-open');if(hidden){if(!wasHidden)front.clearRect(0,0,1280,800);wasHidden=true;return}wasHidden=false;if(now-lastPaint<(window.IDLE_PANEL_OPEN?100:1000/30))return;lastPaint=now;front.clearRect(0,0,1280,800);drawTrainer(now);drawRocket(now);for(const job of jobs)drawJob(job)}
 function clear(){for(const j of jobs)j.resolve();jobs.length=0;front?.clearRect(0,0,1280,800)}
 function mount(target){stage=target;actor=document.createElement('button');actor.id='idle-arena-trainer';actor.type='button';hand=document.createElement('i');hand.className='idle-trainer-hand';hand.setAttribute('aria-hidden','true');actor.append(hand);actor.onclick=open;const arena=document.getElementById('arenaView');arena.append(actor);canvas=document.createElement('canvas');canvas.id='idleTrainerCanvas';canvas.width=1280;canvas.height=800;canvas.setAttribute('aria-hidden','true');arena.append(canvas);front=canvas.getContext('2d');
  launch=document.createElement('button');launch.id='idleTrainerLaunch';launch.type='button';launch.title='Meu treinador';launch.setAttribute('aria-label','Abrir perfil do treinador');const icon=document.createElement('img');icon.alt='';icon.onerror=()=>{icon.onerror=null;icon.src='assets/showdown/trainers/red.png'};icon.className='idle-trainer-launch-sprite';launch.append(icon);launch.onclick=open;const dex=document.getElementById('collectionPokedex')||document.getElementById('pokedexLaunch');if(dex)dex.after(launch);
  window.IDLE_TRAINER={recall:begin};window.TRAINER_RECALL={begin,tick(){},clear};addEventListener('trainer-profile-change',refresh);addEventListener('idle-profile-change',refresh);addEventListener('pagehide',()=>{cancelAnimationFrame(raf);clear()},{once:true});refresh();raf=requestAnimationFrame(loop);
 }
 return {mount,refresh,clear,unitPoint,throwBall,hand:()=>hand,recallDefeated:units=>{for(const u of units)if(!u.alive&&(u.side===0||ctx.challenge?.()?.kind==='rocket'))begin(u)},pending:()=>jobs.length?Promise.all(jobs.map(j=>j.promise)):null};
};
