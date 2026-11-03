/* Four presentation layers. No gameplay timing, facing or PMD frame is changed. */
(()=>{
 'use strict';
 const bodies=new Map(),queue=[],voices=new Set(),textures={},samples=new Map(),palettes=[];let backdrop=null,lastBackground=-99,context=null,gain=null;
 const parent=document.getElementById('arenaView'),canvas=document.createElement('canvas');
 canvas.width=W*2;canvas.height=H*2;canvas.id='moveBackdrop';canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:absolute;left:0;top:0;width:1280px;height:800px;pointer-events:none';
 parent.insertBefore(canvas,document.getElementById('arenaFields')||document.getElementById('units'));
 const g=canvas.getContext('2d');
 for(const name of window.EMERALD_BACKGROUNDS||['psychic','ghost','cosmic','aurora','ice']){const img=new Image();img.src='assets/move-fx/backgrounds/'+name+'.png';textures[name]=img}
 function sample(name,reverse=false){
  const key=name+(reverse?':reverse':'');if(samples.has(key))return samples.get(key);
  const base64=window.EMERALD_INSTRUMENTS?.samples[name];if(!base64||!context)return null;
  samples.set(key,null);const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  context.decodeAudioData(bytes.buffer).then(buffer=>{if(reverse)for(let i=0;i<buffer.numberOfChannels;i++)buffer.getChannelData(i).reverse();samples.set(key,buffer)}).catch(()=>{});
  return null;
 }
 function initAudio(){
  if(!context){try{context=new (window.AudioContext||window.webkitAudioContext)();gain=context.createGain();gain.connect(context.destination)}catch{return}}
  if(context.state==='suspended')context.resume().catch(()=>{});
 }
 document.addEventListener('pointerdown',initAudio,{passive:true});document.addEventListener('keydown',initAudio,{passive:true});
 function notes(move,quiet){
  if(CFG.mute||!CFG.sfx)return true;
  const source=(move.sounds||[]).find(s=>window.EMERALD_AUDIO?.[s.id]);
  if(!source||context?.state!=='running')return false;
  const sequence=window.EMERALD_AUDIO[source.id],first=sequence[0]?.[0]||0;
  // One short source sequence per activation. Repeated loop commands stay in the catalog.
  for(const [at,duration,pitch,velocity,channel,program] of sequence){
   if(at-first>.65||queue.length>=160)break;
   const instrument=window.EMERALD_INSTRUMENTS?.sounds[source.id]?.[program];if(instrument?.sample)sample(instrument.sample,instrument.reverse);
   queue.push({at:B.t+(at-first),duration:Math.min(.32,Math.max(.025,duration)),pitch,velocity,channel,instrument,quiet,units:B.units});
  }
  return true;
 }
 function voice(note){
  if(!context||voices.size>=14)return;
  const instrument=note.instrument,buffer=instrument?.sample?sample(instrument.sample,instrument.reverse):null;
  let oscillator;
  if(buffer){oscillator=context.createBufferSource();oscillator.buffer=buffer;oscillator.playbackRate.value=instrument.fixed?1:Math.pow(2,(note.pitch-instrument.root)/12)}
  else if(instrument?.wave==='noise'){
   oscillator=context.createBufferSource();const noise=context.createBuffer(1,Math.floor(context.sampleRate*.4),context.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.5;oscillator.buffer=noise;
  }else{oscillator=context.createOscillator();oscillator.type=instrument?.wave|| (note.channel%3===0?'triangle':'square');oscillator.frequency.value=Math.min(6500,440*Math.pow(2,(note.pitch-69)/12))}
  const envelope=context.createGain(),now=context.currentTime,duration=note.duration/Math.max(.5,CFG.speed);
  envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime((note.velocity/127)*(note.quiet?.022:.045),now+.006);
  envelope.gain.exponentialRampToValueAtTime(.0001,now+Math.max(.012,duration));
  oscillator.connect(envelope);envelope.connect(gain);voices.add(oscillator);
  oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();envelope.disconnect()};
  oscillator.start(now);oscillator.stop(now+duration+.01);
 }
 function wrapperFor(u){
  if(!u?.spr)return null;
  let wrapper=u.spr.parentElement;
  if(!wrapper.classList.contains('move-accent')){
   wrapper=document.createElement('div');wrapper.className='move-accent';wrapper.style.transformOrigin='50% 100%';
   u.spr.parentNode.insertBefore(wrapper,u.spr);wrapper.appendChild(u.spr);
  }
  return wrapper;
 }
 function accent(u,mv,move,target){
  if(mv.passive&&B.t<(u.castingUntil||0))return;
  if(!u.spr||u.moving)return;
  const wrapper=wrapperFor(u);
  const task=move.tasks.join(' '),family=/Lunge|Slide|TranslateMon/.test(task)?'recoil':/Rotate|Elliptical/.test(task)?'turn':/Scale|Grow|Shrink|Dip|Bow/.test(task)?'squash':/Shake/.test(task)?'charge':'glow';
  bodies.set(u,{wrapper,start:B.t,life:mv.passive?.24:.46,color:(PAL[mv.t]||PAL.normal)[1],family,air:airborneAttacker(u),direction:target&&target.x<u.x?-1:1});
 }
 function cast(u,target,mv){
  const move=window.EMERALD_MOVES?.resolve(mv);if(!move)return false;
  accent(u,mv,move,target);
  const transitions=[...(move.paletteEvents||[]),...(move.taskEvents||[]).filter(e=>/Blend|Flash|Invert/.test(e.name))];
  transitions.slice(0,CFG.reduceFx?2:5).forEach((e,i)=>{
   const text=(e.args||[]).join(','),rgb=text.match(/RGB\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
   const color=rgb?'rgb('+rgb.slice(1).map(n=>Math.round(Number(n)*255/31)).join(',')+')':(PAL[mv.t]||PAL.normal)[1];
   const unit=/TARGET|DEF_PARTNER/.test(text)?target:u,wrapper=wrapperFor(unit);
   if(wrapper)palettes.push({unit,wrapper,color,start:B.t+Math.min(.5,e.t||i*.08),life:mv.passive?.2:.45,units:B.units});
  });
  const played=notes(move,!!mv.passive);
  // Keep backgrounds brief, local to the board, and behind every unit and preview.
  if(!mv.passive&&(mv.p>=1.4||['beam','meteor'].includes(mv.k))&&B.t-lastBackground>.8){
   const raw=(move.backgrounds||[]).join(' '),key=raw.replace(/^BG_/,'').toLowerCase();
   const name=Object.keys(textures).find(n=>key===n||key.startsWith(n+'_'))||(/DARK/.test(raw)?'dark':mv.t==='ice'?'ice':mv.t==='dragon'?'aurora':mv.t==='psychic'?'psychic':mv.t==='ghost'?'ghost':mv.t==='water'?'water':mv.t==='electric'?'thunder':mv.t==='ground'?'fissure':null);
   if(name){backdrop={name,start:B.t,life:.6};lastBackground=B.t}
  }
  return played;
 }
 function resetBody(a){a.wrapper.style.transform='';a.wrapper.style.filter=''}
 function clear(){for(const a of bodies.values())resetBody(a);for(const a of palettes)a.wrapper.style.filter='';palettes.length=0;bodies.clear();queue.length=0;backdrop=null;lastBackground=-99;
  for(const oscillator of voices){try{oscillator.stop()}catch{}}voices.clear();
  g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,W,H);
 }
 window.MOVE_PRESENTATION={cast,clear,
  update(){
   if(gain)gain.gain.value=CFG.mute||G.paused||!B.on||B.over?0:CFG.sfx;
   for(let i=queue.length-1;i>=0;i--){const note=queue[i];if(note.units!==B.units||B.over){queue.splice(i,1);continue}if(!G.paused&&B.t>=note.at){queue.splice(i,1);if(!CFG.mute&&CFG.sfx)voice(note)}}
   for(const [u,a] of bodies){const time=B.t-a.start;if(time>=a.life||!u.alive||!u.el?.isConnected||u.moving||B.over){resetBody(a);bodies.delete(u);continue;}
    const k=time/a.life,pulse=Math.sin(k*Math.PI),amount=CFG.reduceFx?.35:1;
    // Never translate the body vertically or modify the PMD canvas/facing.
    const x=1+(a.family==='squash'?.035:.014)*pulse*amount,y=1-(a.family==='squash'?.025:.008)*pulse*amount;
    const rotation=a.air&&a.family==='turn'?Math.sin(k*Math.PI*2)*2*amount:0;
    const horizontal=a.family==='recoil'?Math.sin(k*Math.PI*2)*4*a.direction*amount:0;
    a.wrapper.style.transform='translateX('+horizontal+'px) scale('+x+','+y+') rotate('+rotation+'deg)';
    a.wrapper.style.filter='brightness('+(1+pulse*.15*amount)+') drop-shadow(0 0 '+(pulse*5*amount)+'px '+a.color+')';
   }
   const tinted=new Set();
   for(let i=palettes.length-1;i>=0;i--){const p=palettes[i],age=B.t-p.start;
    if(age>=p.life||p.units!==B.units||!p.unit.alive||B.over){if(!bodies.has(p.unit)&&!tinted.has(p.unit))p.wrapper.style.filter='';palettes.splice(i,1);continue}
    if(age<0||tinted.has(p.unit))continue;tinted.add(p.unit);
    const amount=Math.sin(age/p.life*Math.PI)*(CFG.reduceFx?.4:1),base=bodies.has(p.unit)?p.wrapper.style.filter:'';
    p.wrapper.style.filter=base+' saturate('+(1+amount*.3)+') drop-shadow(0 0 '+(amount*7)+'px '+p.color+')';
   }
  },
  draw(){g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,W,H);if(!backdrop||!B.on||B.over)return;
   const age=B.t-backdrop.start;if(age>=backdrop.life){backdrop=null;return;}
   const image=textures[backdrop.name];if(!image.complete||!image.naturalWidth)return;
   const alpha=Math.sin(age/backdrop.life*Math.PI)*(CFG.reduceFx?.055:.14),p0=hexXY(0,0),p1=hexXY(ROWS-1,COLS-1);
   g.save();g.imageSmoothingEnabled=false;g.globalAlpha=alpha;
   const x=p0.x-HW/2,y=p0.y-S_,width=p1.x-x+HW/2,height=p1.y-y+S_;
   g.beginPath();for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(r,c);for(let i=0;i<6;i++){const angle=(60*i-30)*Math.PI/180;const xx=p.x+S_*Math.cos(angle),yy=p.y+S_*Math.sin(angle);if(!i)g.moveTo(xx,yy);else g.lineTo(xx,yy)}g.closePath()}g.clip();
   g.drawImage(image,x,y,width,height);g.restore();
  }
 };
})();
