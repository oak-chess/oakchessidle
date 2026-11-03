/* Approved trainer duel. Presentation only; combat owns all game state. */
(()=>{
'use strict';
const legacy=showVS,escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,ac=null,master=null,noiseBuffer=null,audioReady=false;
const voices=new Set(),settings={get sound(){return !CFG.mute&&CFG.sfx>0}};
const sourceSamples=new Map(),sourceIds={intro:'SE_MUGSHOT',red:'SE_M_SWIFT',blue:'SE_M_SWIFT',impact:'SE_M_VITAL_THROW',open:'SE_M_TELEPORT',ready:'SE_M_SWIFT'},typeSounds={fire:'SE_M_FLAMETHROWER',water:'SE_M_BUBBLE',ice:'SE_M_ICY_WIND',electric:'SE_M_THUNDERBOLT',psychic:'SE_M_PSYBEAM',ghost:'SE_M_PSYBEAM',normal:'SE_M_SWIFT'};
function warmSource(id){
 if(!ac)return;for(const instrument of Object.values(window.EMERALD_INSTRUMENTS?.sounds[id]||{})){
  if(!instrument.sample||sourceSamples.has(instrument.sample))continue;
  const encoded=window.EMERALD_INSTRUMENTS?.samples[instrument.sample];if(!encoded)continue;
  sourceSamples.set(instrument.sample,null);const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));ac.decodeAudioData(bytes.buffer).then(buffer=>sourceSamples.set(instrument.sample,buffer)).catch(()=>{});
 }
}
function sourceSound(id,pan=0){
 if(!audioReady||!settings.sound||ac.state!=='running')return false;
 const sequence=window.EMERALD_AUDIO?.[id],instruments=window.EMERALD_INSTRUMENTS?.sounds[id];if(!sequence?.length||!instruments)return false;
 warmSource(id);const selected=sequence.filter(note=>note[0]-(sequence[0]?.[0]||0)<=.36).slice(0,24);
 if(selected.some(note=>{const ins=instruments[note[5]];return ins?.sample&&!sourceSamples.get(ins.sample)}))return false;
 for(const [at,len,pitch,velocity,channel,program]of selected){
  const ins=instruments[program],buffer=ins?.sample?sourceSamples.get(ins.sample):null,delay=Math.max(0,at-sequence[0][0])*.8,duration=Math.min(.3,Math.max(.035,len*.8)),level=(velocity/127)*.32;
  if(!buffer){voice({type:ins?.wave==='noise'?'sine':ins?.wave||'square',noise:ins?.wave==='noise',from:440*2**((pitch-69)/12),to:440*2**((pitch-69)/12),duration,volume:level,delay,pan,filter:2800});continue}
  const node=ac.createBufferSource(),envelope=ac.createGain(),stereo=ac.createStereoPanner(),now=ac.currentTime+delay;node.buffer=buffer;node.playbackRate.value=ins.fixed?1:2**((pitch-(ins.root??60))/12);stereo.pan.value=pan;envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level,now+.008);envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);node.connect(envelope);envelope.connect(stereo);stereo.connect(master);voices.add(node);node.onended=()=>{voices.delete(node);node.disconnect();envelope.disconnect();stereo.disconnect()};node.start(now);node.stop(now+duration+.02);
 }
 return true;
}
function stopAudio(){for(const voice of voices){try{voice.stop()}catch{}}voices.clear()}
function audioInit(){try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=CFG.mute?0:Math.max(0,Math.min(1,CFG.sfx))*.38;const limit=ac.createDynamicsCompressor();limit.threshold.value=-16;limit.ratio.value=6;master.connect(limit);limit.connect(ac.destination);noiseBuffer=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1}ac.resume().catch(()=>{});audioReady=true}catch{audioReady=false}}
function voice({type='sine',from=220,to=110,duration=.25,volume=.3,pan=0,delay=0,noise=false,filter=1800}){
 if(!audioReady||!settings.sound||ac.state!=='running')return;
 const now=ac.currentTime+delay,source=noise?ac.createBufferSource():ac.createOscillator(),gain=ac.createGain(),tone=ac.createBiquadFilter(),stereo=ac.createStereoPanner();
 if(noise){source.buffer=noiseBuffer;source.loop=true}else{source.type=type;source.frequency.setValueAtTime(Math.max(20,from),now);source.frequency.exponentialRampToValueAtTime(Math.max(20,to),now+duration)}
 tone.type=noise?'bandpass':'lowpass';tone.frequency.setValueAtTime(filter,now);tone.frequency.exponentialRampToValueAtTime(Math.max(100,filter*.3),now+duration);tone.Q.value=.7;stereo.pan.value=pan;
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+Math.min(.015,duration/5));gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 source.connect(tone);tone.connect(gain);gain.connect(stereo);stereo.connect(master);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();tone.disconnect();gain.disconnect();stereo.disconnect()};source.start(now);source.stop(now+duration+.025);
}
function sound(name,type){
 const sourceId=name==='summon'?(typeSounds[type]||'SE_M_SWIFT'):sourceIds[name];if(sourceId&&sourceSound(sourceId,name==='red'?-.6:name==='blue'?.6:0))return;
 if(name==='intro')voice({from:65,to:110,duration:.6,volume:.4});
 if(name==='red'||name==='blue'){voice({noise:true,filter:2200,duration:.25,volume:.4,pan:name==='red'?-.7:.7});voice({type:'triangle',from:170,to:360,duration:.18,volume:.15})}
 if(name==='summon'){
  if(type==='fire')voice({noise:true,filter:750,duration:.7,volume:.6});
  else if(type==='water'||type==='ice')voice({noise:true,filter:2600,duration:.55,volume:.35});
  else for(let i=0;i<3;i++)voice({type:type==='electric'?'square':'sine',from:330*2**(i/5),to:480*2**(i/5),duration:.35,volume:.13,delay:i*.08});
 }
 if(name==='impact'){voice({from:150,to:35,duration:.55,volume:.8});voice({noise:true,filter:1700,duration:.36,volume:.65});for(let i=0;i<3;i++)voice({type:'triangle',from:392*2**(i/3),to:392*2**(i/3),duration:.6,volume:.12,delay:.08})}
 if(name==='text')voice({type:'triangle',from:760,to:600,duration:.035,volume:.065,filter:2300});
 if(name==='open'){voice({noise:true,filter:3200,duration:.8,volume:.4});voice({from:100,to:240,duration:.6,volume:.2})}
 if(name==='ready')for(const [i,n]of [392,494,587,784].entries())voice({type:'triangle',from:n,to:n,duration:.32,volume:.18,delay:i*.08});
}
function strongest(list,side){
 return list.map((unit,index)=>{
  const L=LINES[unit.line],star=unit.star||1,id=L.ids[star-1];let stats=baseStats(L,star,side===0),power=0;
  const live=side===1?B.units.find(u=>u.side===1&&u.line===unit.line&&u.star===star&&u.r===unit.r&&u.c===unit.c):null;
  if(live)power=live.maxHp+live.atk*live.as*10+live.spell*3+live.armor*5+live.mr*5;
  else{const seq=B.seq;try{const temp=mkCU({...unit,r:0,c:0,scale:unit.scale||1,hpx:unit.hpx||(unit.shiny?SHB:1),dx:unit.dx||(unit.shiny?SHB:1)},side);if(side===0){applyBoons([temp]);if(G.tower)TOWER.previewStats(temp,unit)}power=temp.maxHp+temp.atk*temp.as*10+temp.spell*3+temp.armor*5+temp.mr*5}catch{power=stats.hp+stats.atk*10+stats.sp*3}finally{B.seq=seq}}
  return{unit,L,star,id,power,index,types:typesOf(L,star),name:L.names[star-1]};
 }).sort((a,b)=>b.star-a.star||b.L.c-a.L.c||b.power-a.power||a.index-b.index)[0];
}
function portrait(el,slug){if(!el||!slug)return;el.src=trainerUrl(slug);el.onerror=()=>{el.onerror=null;el.src=trPortrait(slug)};trResolve(slug,url=>{if(el.isConnected)el.src=url})}
showVS=function(done){
 if(current)current.cancel();
 if(G.tower&&G.tower.floor%5!==4){SND.music('battle');done();return}
 if(G.round?.event==='rocket'&&window.ROCKET_CUTSCENE)return window.ROCKET_CUTSCENE.show(done,strongest);
 const overlay=document.getElementById('vs');let scene=null;
 try{
  const ally=strongest(boardUnits(),0),foe=strongest(G.enemy||[],1);if(!ally||!foe){legacy(done);return}
  const info=G.round||{},secret=info.kind==='secret'&&!G.mewHelp,trainer=!!G.oppSlug,wild=info.kind==='pve',rightName=secret?'???':G.oppName||foe.name;
  const towerBoss=!!G.tower&&G.tower.floor%5===4,bossIntro=towerBoss||isBoss(info.kind);
  const bossTitle=towerBoss?'CHEFE DO ANDAR':info.kind==='champ'?'DESAFIO DO CAMPEÃO':info.kind==='e4'?'DESAFIO DA ELITE 4':'LÍDER DE GINÁSIO À FRENTE!';
  const bossDetail=towerBoss?'Andar '+(G.tower.floor+1)+' · '+(info.name||'Torre dos Desafios'):G.foe?.city?'Ginásio de '+G.foe.city:G.foe?.cat||'Liga Pokémon';
  const color=t=>TYPES[t]?.c||'#aa91c9',leftColor=color(ally.types[0]),rightColor=color(foe.types[0]);
  const sprite=x=>x.unit.shiny?shinyUrl(sprFront(x.id)):sprFront(x.id),typeText=x=>x.types.map(t=>TYPES[t]?.n||t).join(' / ');
  const esc=escape,quote=G.oppQuote||G.foe?.q||(wild?'Um grupo de Pokémon selvagens apareceu!':G.tower?'A próxima prova da Torre começa agora.':'Mostre a força da sua equipe!');
  const fighter=(x,side)=>`<div class="fighter ${side}"><img class="partner" src="${esc(sprite(x))}" alt="${esc(x.name)}" style="${secret&&side==='foe'?'filter:brightness(0) drop-shadow(0 0 16px #c080ee)':''}"><img class="trainer" alt="${side==='player'?'Seu treinador':esc(rightName)}" ${side==='foe'&&!trainer?'hidden':''}><div class="nameplate"><small>${side==='player'?'SEU DESTAQUE':trainer?'DESTAQUE ADVERSÁRIO':G.tower?'DESAFIO DA TORRE':'ENCONTRO'}</small><b>${side==='player'?'VOCÊ':esc(rightName)}</b><span>${secret&&side==='foe'?'PODER DESCONHECIDO':esc(x.name)+' '+ '★'.repeat(x.star)+' · '+esc(typeText(x))}</span></div><div class="summon"></div></div>`;
  clearTimeout(VSTO);overlay.classList.add('oak-cutscene');overlay.style.removeProperty('opacity');overlay.style.setProperty('--ally',leftColor);overlay.style.setProperty('--foe',rightColor);
  overlay.innerHTML=`<div class="screen" ${!trainer?'data-wild="true"':''}><canvas class="world" width="240" height="150"></canvas><div class="shade"></div><div class="rays"></div><div class="cinema top"></div><div class="cinema bottom"></div><div class="chapter">${esc(info.lbl||G.oppName||'DUELO')}<strong>${G.tower?'TORRE DOS DESAFIOS':'JORNADA POR KANTO'}</strong></div><div class="edition"><b>OAKCHESS</b> / ${esc(typeText(ally))} × ${esc(secret?'???':typeText(foe))}</div><div class="cut left"></div><div class="cut right"></div><div class="diagonal"></div>${fighter(ally,'player')}${fighter(foe,'foe')}<div class="vs">VS</div><div class="quote"></div><div class="flash"></div></div>`;
  const nodes=new Map(),q=s=>{if(!nodes.has(s))nodes.set(s,overlay.querySelector(s));return nodes.get(s)},world=q('.world'),ctx=world.getContext('2d');
  let warning=null;if(bossIntro){overlay.classList.add('oak-boss-cutscene');warning=document.createElement('div');warning.className='boss-warning';warning.innerHTML=`<small>${esc(bossTitle)}</small><b>${esc(rightName)}</b><span>${esc(bossDetail)}</span>`;overlay.appendChild(warning);q('.chapter').textContent=bossTitle;q('.foe .nameplate small').textContent=towerBoss?'GUARDIÃO DO ANDAR':G.foe?.cat||'LÍDER DE GINÁSIO';if(G.foe?.b){const badge=document.createElement('img');badge.className='boss-badge';badge.src=BADGE(G.foe.b);badge.alt='Insígnia '+G.foe.bn;q('.foe').appendChild(badge)}}
  // Keep compact geometry even if an older stylesheet is still cached.
  q('.screen').style.cssText='position:absolute;left:0;top:50%;transform:translateY(-50%);width:100%;height:36%;min-height:0;border:0;border-top:2px solid #c6a969;border-bottom:2px solid #c6a969';
  overlay.style.background='transparent';
  const bg=ctx.createLinearGradient(0,140,240,10);bg.addColorStop(0,leftColor);bg.addColorStop(.5,'#281b35');bg.addColorStop(1,rightColor);ctx.fillStyle=bg;ctx.fillRect(0,0,240,150);
  ctx.fillStyle='#080b164d';ctx.fillRect(0,0,240,150);const rand=n=>{const f=Math.sin(n*72.938)*43758.5453;return f-Math.floor(f)};
  for(let i=0;i<75;i++){const x=rand(i+2)*240,y=rand(i+59)*150;ctx.fillStyle=x<120?leftColor:rightColor;ctx.globalAlpha=.2+rand(i+9)*.4;ctx.fillRect(x,y,1,1+i%3)}ctx.globalAlpha=1;
  for(const [i,c]of [leftColor,rightColor].entries()){ctx.strokeStyle=c+'66';for(let n=0;n<4;n++){ctx.beginPath();ctx.ellipse(i?190:50,80,24+n*12,20+n*8,i?-.6:.6,0,Math.PI*2);ctx.stroke()}}
  portrait(q('.player .trainer'),'red');if(trainer)portrait(q('.foe .trainer'),G.oppSlug);
  for(const [i,img]of [...overlay.querySelectorAll('.partner')].entries()){const data=i?foe:ally;img.onerror=()=>{img.onerror=null;img.src=data.unit.shiny?shinyUrl(sprStatic(data.id)):sprStatic(data.id)}}
  const warningDuration=bossIntro?.85:0,playbackRate=bossIntro?2.25:1.85;
  let elapsed=0,t=0,last=performance.now(),raf=0,ended=false,lastQuote='';const duration=9.25,reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const v=clamp(x);return v*v*v*(v*(v*6-15)+10)};
  const events=[{t:.4,n:'red'},{t:1.05,n:'blue'},{t:1.85,n:'summon',type:ally.types[0],id:ally.id},{t:2.3,n:'summon',type:foe.types[0],id:foe.id},{t:3.1,n:'impact'},{t:7.65,n:'open'},{t:8.6,n:'ready'},...Array.from({length:15},(_,i)=>({t:4.08+i*.09,n:'text'}))];
  const detach=()=>{cancelAnimationFrame(raf);clearTimeout(VSTO);stopAudio();overlay.onclick=null;document.removeEventListener('keydown',key);overlay.classList.remove('show','oak-cutscene','oak-boss-cutscene');overlay.style.removeProperty('opacity');current=null};
  const finish=()=>{if(ended)return;ended=true;const proceed=G.phase==='vs';detach();if(proceed){SND.music('battle');done()}};
  const key=e=>{if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();finish()}};
  scene={cancel(){if(ended)return;ended=true;detach()}};current=scene;
  function draw(){
   const opening=ease(t/.65),enter=ease((t-.4)/1.1),other=ease((t-1.05)/1.1),a=ease((t-1.85)/.9),b=ease((t-2.3)/.9),impact=ease((t-3.1)/.55),end=ease((t-7.65)/1.6),motion=reduced?0:1;
   overlay.style.opacity=String(bossIntro?1-end:opening*(1-end));q('.screen').style.opacity=bossIntro?opening:1;q('.screen').style.clipPath=reduced?'none':`inset(${(1-opening)*50}% 0)`;
   if(warning){warning.style.opacity=ease(elapsed/.18)*(1-ease((elapsed-.65)/.28));warning.style.transform=`translateY(-50%) translateX(${reduced?0:(1-ease(elapsed/.3))*-24}px)`}
   q('.player').style.cssText=`opacity:${enter};transform:translate3d(${((1-enter)*-85-end*55)*motion}px,0,0)`;q('.foe').style.cssText=`opacity:${other};transform:translate3d(${((1-other)*85+end*55)*motion}px,0,0)`;
   for(const [i,amount]of [a,b].entries()){const el=q(i?'.foe .partner':'.player .partner');el.style.opacity=amount;el.style.transform=`translate3d(0,${(1-amount)*10*motion}px,0) ${i?'scaleX(-1) ':''}scale(${1-(1-amount)*.16*motion})`;const circle=q(i?'.foe .summon':'.player .summon');circle.style.opacity=amount<1?Math.sin(amount*Math.PI)*.45:0}
   q('.cut.left').style.opacity=enter;q('.cut.right').style.opacity=other;q('.diagonal').style.opacity=other;
   q('.vs').style.opacity=impact;q('.vs').style.transform=`translate(-50%,-50%) scale(${1+(1-impact)*.24*motion})`;
   const visibleQuote=quote.slice(0,Math.floor(quote.length*clamp((t-4.05)/1.45)));if(visibleQuote!==lastQuote){q('.quote').textContent=visibleQuote;lastQuote=visibleQuote}q('.quote').style.opacity=ease((t-4)/.55);q('.edition').style.opacity=1-ease((t-3.7)/.4);
   q('.flash').style.opacity=!reduced&&t>3.1&&t<3.5?Math.sin((t-3.1)/.4*Math.PI)*.16:0;
   world.style.transform=`scale(${1+ease(t/7.65)*.035*motion})`;q('.rays').style.backgroundPosition=t*10*motion+'px '+t*5*motion+'px';
  }
  function frame(now){if(ended)return;if(G.phase!=='vs'){scene.cancel();return}const before=t;elapsed+=Math.max(0,now-last)/1000;t=Math.min(duration,Math.max(0,elapsed-warningDuration)*playbackRate);last=now;if(master)master.gain.value=CFG.mute?0:Math.max(0,Math.min(1,CFG.sfx))*.38;if(t-before<.6)for(const event of events)if(event.t>before&&event.t<=t){sound(event.n,event.type)}draw();if(t>=duration)finish();else raf=requestAnimationFrame(frame)}
  overlay.onclick=finish;document.addEventListener('keydown',key);overlay.classList.add('show');draw();SND.init();SND.music('battle');audioInit();for(const id of [...Object.values(sourceIds),typeSounds[ally.types[0]],typeSounds[foe.types[0]]])if(id)warmSource(id);sound('intro');raf=requestAnimationFrame(frame);VSTO=setTimeout(finish,(warningDuration+duration/playbackRate)*1000+250);
 }catch(error){if(scene)scene.cancel();else{overlay.classList.remove('oak-cutscene','oak-boss-cutscene','show');overlay.style.removeProperty('opacity')}console.warn('Versus cutscene fallback:',error);legacy(done)}
};
window.addEventListener('pagehide',()=>{if(current)current.cancel();stopAudio()});
document.addEventListener('pointerdown',()=>{if(!settings.sound)return;audioInit();for(const id of [...Object.values(sourceIds),...Object.values(typeSounds)])warmSource(id)},{once:true,passive:true});
})();
