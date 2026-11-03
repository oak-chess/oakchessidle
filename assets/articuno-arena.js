/* Generated from approved prototypes by scripts/build-legendary-arenas.cjs. */
window.createArticunoArena=function(){

const root=globalThis,realDocument=root.document,window=Object.create(root),uiRoot=realDocument.createElement('div'),controls=new Map();
const images=[];const Image=function(...args){const im=new root.Image(...args);images.push(im);im.addEventListener('load',()=>sceneKey='');im.addEventListener('error',()=>sceneKey='');return im};
uiRoot.innerHTML='<section class="controls"><h2>Ambiente</h2></section>';
const canvas=realDocument.createElement('canvas');canvas.width=1280;canvas.height=800;
const $=id=>{if(id==='scene')return canvas;if(!controls.has(id)){const el=realDocument.createElement('button');el.id=id;controls.set(id,el)}return controls.get(id)};
const document={createElement:realDocument.createElement.bind(realDocument),getElementById:$,querySelector:q=>uiRoot.querySelector(q),body:uiRoot,get hidden(){return realDocument.hidden},addEventListener:(name,fn,options)=>realDocument.addEventListener(name,fn,options)};
let c=canvas.getContext('2d'),W=1280,H=800,dpr=1,time=0,paused=false,zoom=1,pan=0,battle=false,gridSoftness=0,sceneKey='',mode='scene',benchMode=false,sceneHeightOffset=10,active=false,wasActive=false;
let reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches,showScenicBird=false,scenicPerched=false;
const systemReduced=reducedMotion,defaults={energy:80,volume:50,light:100,decor:true,elements:true,clouds:true,quality:'high'},config={...defaults};
const scenery=realDocument.createElement('canvas');scenery.width=1280;scenery.height=800;
let audio=null,sound=false;
function syncAudio(){}
function ensureAudio(state){
 const allowed=state.active&&!state.paused&&!state.mute&&!realDocument.hidden&&state.sfx>0;
 if(allowed&&root.__legendaryAudioUnlocked&&!audio){try{
  const ctx=new AudioContext(),gain=ctx.createGain(),rainBus=ctx.createGain(),windGain=ctx.createGain(),filter=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);let low=0;
  for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.035)/1.035;data[i]=low*3}
  const src=ctx.createBufferSource();src.buffer=buffer;src.loop=true;filter.type='lowpass';filter.frequency.value=theme.kind==='articuno'?1900:theme.kind==='zapdos'?850:320;
  gain.gain.value=0;rainBus.gain.value=.08;windGain.gain.value=theme.kind==='moltres'?.055:.08;src.connect(filter);filter.connect(windGain);windGain.connect(gain);rainBus.connect(gain);gain.connect(ctx.destination);src.start();audio={ctx,gain,rainBus};
 }catch{}}
 sound=allowed&&!!audio;config.volume=Math.round(state.sfx*70);
 if(audio){audio.gain.gain.setTargetAtTime(sound?state.sfx:0,audio.ctx.currentTime,.08);if(sound&&audio.ctx.state==='suspended'&&root.__legendaryAudioUnlocked)audio.ctx.resume().catch(()=>{})}
}
const weatherFX=realDocument.createElement('canvas'),floorFX=realDocument.createElement('canvas');
weatherFX.width=2560;weatherFX.height=800;weatherFX.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none;z-index:1';
floorFX.width=1280;floorFX.height=800;floorFX.style.cssText='position:absolute;inset:0;width:1280px;height:800px;pointer-events:none;display:none';
realDocument.getElementById('world').appendChild(weatherFX);realDocument.getElementById('arenaView').insertBefore(floorFX,realDocument.getElementById('units'));

let angled=true;
function point(x,y,z=0){
 if(mode==='field'){
  if(benchMode){x=(x+4)*10/11;y-=46.5}
  if(!angled)return{x:640+x,y:332.5+y-(z-10),s:1};
  // Projeta a altura no espaço e desfaz apenas a transformação do canvas-pai.
  const a=38*Math.PI/180,wy=(y-67.5)*1.02,wz=(z-10)*1.02,k=2200/(2200-wy*Math.sin(a)-wz*Math.cos(a));
  const q=(6+wy*Math.cos(a)-wz)*k,flatY=2200*(q-6)/(1.02*(2200*Math.cos(a)+q*Math.sin(a))),flatK=2200/(2200-flatY*1.02*Math.sin(a));
  return{x:640+x*k/flatK,y:400+flatY,s:k/flatK};
 }
 if(!angled)return{x:640+x,y:332.5+y-(z-sceneHeightOffset),s:1};
 const a=38*Math.PI/180,wy=(y-67.5)*1.02,wz=(z-sceneHeightOffset)*1.02,k=2200/(2200-wy*Math.sin(a)-wz*Math.cos(a));
 return{x:640+x*1.02*k,y:400+(6+wy*Math.cos(a)-wz)*k,s:1.02*k};
}

function poly(points,fill,stroke){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}
function face(points,fill,stroke){poly(points.map(p=>point(...p)),fill,stroke)}
function roundedPoints(x,y,z,w,h,r){const pts=[];for(const [cx,cy,start]of [[x+r,y+r,180],[x+w-r,y+r,270],[x+w-r,y+h-r,0],[x+r,y+h-r,90]])for(let i=0;i<=10;i++){const a=(start+i*9)*Math.PI/180;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,z])}return pts}
function clipFace(pts){c.beginPath();pts.map(p=>point(...p)).forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip()}
function roundedBox(x,y,z,w,h,r,d,col){const top=roundedPoints(x,y,z,w,h,r);face(top.map(([a,b,t])=>[a,b,t-d]),col[1]);for(let i=0;i<top.length;i++){const a=top[i],b=top[(i+1)%top.length];face([a,b,[b[0],b[1],z-d],[a[0],a[1],z-d]],a[1]>y+h*.5?col[1]:col[2])}face(top,col[0],col[3])}
function box(x,y,z,w,h,d,col){face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],col[0],col[3]);face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z-d],[x,y+h,z-d]],col[1]);face([[x+w,y,z],[x+w,y+h,z],[x+w,y+h,z-d],[x+w,y,z-d]],col[2])}
function line(a,b,color,width=1){const p=point(...a),q=point(...b);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.strokeStyle=color;c.lineWidth=width*p.s;c.stroke()}
function ellipse(x,y,z,rx,ry,color,stroke){const p=point(x,y,z);c.beginPath();c.ellipse(p.x,p.y,rx*p.s,ry*p.s,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=p.s;c.stroke()}}

function random(seed){const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n)}
const colors=['#8ad8f1','#f1d477','#f29461'];
function crystal(x,y,z,r){for(let i=0;i<3;i++){const px=x+(i-1)*r*.65,h=r*(i===1?2.8:1.8);face([[px-r*.3,y,z],[px,y,z+h],[px+r*.3,y,z],[px,y+r*.3,z-2]],i%2?'#8cd2eb':'#d3f2fa');face([[px,y,z+h],[px+r*.3,y,z],[px,y+r*.3,z-2]],'#508faa')}}
function flame(x,y,z,r,t=0){const p=point(x,y,z),s=p.s*r;c.save();c.translate(p.x,p.y);c.beginPath();c.moveTo(-s*.55,0);c.bezierCurveTo(-s,-s*.7,-s*.1,-s*1.15,-s*.05,-s*2);c.bezierCurveTo(s*.55,-s*1.2,s*.08,-s*.7,s*.6,-s*.9);c.bezierCurveTo(s*.9,-s*.2,s*.45,s*.2,-s*.55,0);c.fillStyle='#e67d47';c.fill();c.beginPath();c.moveTo(-s*.24,0);c.quadraticCurveTo(-s*.38,-s*.5,Math.sin(t)*s*.1,-s*1.15);c.quadraticCurveTo(s*.5,-s*.5,s*.2,0);c.fillStyle='#ffe09a';c.fill();c.restore()}
function bolt(x,y,z,r){face([[x-r*.05,y,z+r],[x-r*.5,y,z],[x-r*.02,y,z+r*.04],[x-r*.2,y,z-r],[x+r*.55,y,z+r*.25],[x+r*.08,y,z+r*.16]],'#ffe795','#fff2bd')}
function floatingIsland(x,y,size,seed){const top=Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9,r=size*(.8+random(i+seed)*.2);return[x+Math.cos(a)*r,y+Math.sin(a)*r*.65,-35]});for(let i=0;i<9;i++)face([top[i],top[(i+1)%9],[x-size*.08,y,-35-size*1.3]],i%2?'#3b4b63':'#53627a');face(top,'#8896a1','#bdc8c766');}

// prototypes/articuno-arena/theme.js
window.BIRD_THEME={kind:'articuno',sky:['#132a48','#345e7e','#9bc5d3'],rocks:['#507997','#75a6bc','#98c9d6'],edge:'#99bfcd',side:'#527f9b',dark:'#244a66',trim:'#cce8e9',floor:['#86bbc9','#a1d3db'],accent:'#d3f5ff',soundText:'Vento frio da gruta glacial.'};

// prototypes/legendary-birds-arena/world.js
const theme=window.BIRD_THEME;
function rockyPeak(x,y,z,r,h){const pts=Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;return[x+Math.cos(a)*r,y+Math.sin(a)*r*.65,z]});for(let i=0;i<7;i++)face([pts[i],pts[(i+1)%7],[x-r*.12,y,z+h]],theme.rocks[i%theme.rocks.length]);}
function background(){
const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,theme.sky[0]);bg.addColorStop(.5,theme.sky[1]);bg.addColorStop(1,theme.sky[2]);c.fillStyle=bg;c.fillRect(0,0,W,H);
if(theme.kind==='articuno'){
// Gruta glacial, lago congelado e grandes formações de gelo.
for(let i=0;i<12;i++){const x=-1100+i*200;rockyPeak(x,-500,-40,130,160+random(i+2)*150);if(config.decor)crystal(x,-450,-25,25+random(i+5)*30)}
if(config.decor)for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(490+random(i+side+28)*200),y=-250+i*190;face([[x-90,y-45,-39],[x+70,y-60,-39],[x+110,y+40,-39],[x-60,y+65,-39]],'#39758a','#92cde077');crystal(x,y,-32,25+i*3);line([x-70,y-15,-37],[x+30,y+20,-37],'#bbf1f0aa',2)}
}else if(theme.kind==='zapdos'){
// Usina isolada na tempestade: torres, cabos e transformadores.
if(config.decor)for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*(530+i%2*150),y=-370+i*230;for(const dx of [-26,26]){line([x+dx,y,-35],[x+dx*.45,y,140],'#72818d',5);line([x+dx,y,-35],[x-dx*.4,y,94],'#51616c',2)}for(let j=0;j<5;j++)line([x-24+j*2,y,j*30],[x+24-j*2,y,j*30],'#8c9590',3);line([x-58,y,135],[x+58,y,135],'#a4a997',6);for(const dx of [-40,40]){line([x+dx,y,135],[x+dx,y,151],'#d9bb68',4);line([x+dx,y,151],[x+dx,y+220,113],'#253444',1.5)}roundedBox(x-35,y-30,-20,70,60,7,20,['#6a7778','#384c58','#283d4e'])}
for(let i=0;i<9;i++){const x=-1000+i*250;rockyPeak(x,-560,-50,160,90+random(i)*90)}
}else{
// Cratera vulcânica com rios de lava e paredões de basalto.
for(let i=0;i<15;i++)rockyPeak(-1300+i*185,-520,-45,140,110+random(i+8)*180);
if(config.decor)for(const side of [-1,1])for(let i=0;i<5;i++){
const x=side*(490+random(i+side+10)*190),y=-330+i*200;
face([[x-60,y-60,-41],[x+30,y-45,-41],[x+90,y+45,-41],[x-10,y+75,-41]],'#c44d27','#ef9e4877');face([[x-18,y-48,-40],[x+9,y-39,-40],[x+50,y+45,-40],[x+3,y+50,-40]],'#ffbf53');rockyPeak(x-side*65,y,-38,42,45);flame(x,y,-30,16+i*2);
}
}
}
function arena(){
roundedBox(-375,-345,-9,750,690,95,33,[theme.edge,theme.side,theme.dark]);
c.save();clipFace(roundedPoints(-375,-345,-8,750,690,95));for(let i=0;i<90;i++){const x=-365+random(i+13)*730,y=-335+random(i+87)*670;line([x-15,y,-7],[x+20,y+12,-7],theme.kind==='moltres'?'#ef8b414d':theme.kind==='articuno'?'#d3faff77':'#b5a05166',1.5)}c.restore();
roundedBox(-290,-277,5,580,554,44,23,[theme.trim,theme.side,theme.dark]);roundedBox(-282,-269,8,564,538,40,20,[theme.floor[0],theme.side,theme.dark]);
c.save();clipFace(roundedPoints(-282,-269,10,564,538,40));const radius=42,hw=Math.sqrt(3)*radius,gw=7.5*hw;
for(let row=0;row<8;row++)for(let col=0;col<7;col++){const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*1.5*radius+row*1.5*radius,pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,10]});c.save();c.globalAlpha=1-gridSoftness*.88;face(pts,theme.floor[(row+col)%2]);c.restore();face(pts,'#0000','rgba(210,220,213,'+(.38-gridSoftness*.34)+')');}
if(theme.kind==='zapdos')for(const side of [-1,1]){line([side*255,-230,11],[side*255,230,11],'#dfc76c66',2);for(let i=0;i<8;i++)line([side*245,-220+i*62,11],[side*265,-200+i*62,11],'#e0c45e77',3)}
if(theme.kind==='moltres')for(let i=0;i<16;i++){const x=-250+random(i)*500,y=-240+random(i+11)*480;line([x-12,y-9,11],[x,y,11],'#ec7c3b55',1);line([x,y,11],[x+21,y+7,11],'#e86d3355',1)}
const circle=(r,start=0,end=Math.PI*2)=>Array.from({length:49},(_,i)=>{const a=start+(end-start)*i/48;return[Math.cos(a)*r,Math.sin(a)*r,12]});face(circle(59),'#ede8de','#303e4e');face([[0,0,12],...circle(58,Math.PI,Math.PI*2)],'#bc665b');face([[-58,-3,13],[58,-3,13],[58,3,13],[-58,3,13]],'#303e4e');face(circle(59),'#0000','#303e4e');face(circle(16),'#303e4e');face(circle(11),'#eee7de');c.restore();
}
function decor(){if(!config.decor)return;
for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*341,y=-245+i*160;
if(theme.kind==='articuno'){roundedBox(x-17,y-20,17,34,40,6,23,['#9ed7e3','#4d94ab','#326d8b']);crystal(x,y,19,14+i%2*5)}
else if(theme.kind==='zapdos'){roundedBox(x-18,y-20,16,36,40,4,23,['#8d9697','#4e646b','#344e5c']);for(let j=0;j<3;j++)roundedBox(x-15,y-14+j*10,23,30,6,2,9,['#e0c570','#87744d','#5a5b4b']);line([x,y,23],[x,y,49],'#cad1c6',3);bolt(x,y,58,12)}
else{rockyPeak(x,y,0,24,24);flame(x,y,23,15);for(let j=0;j<3;j++)line([x-10+j*9,y+22,1],[x-4+j*9,y+39,1],'#f8a84c88',2)}
}
roundedBox(-95,-338,13,190,49,15,30,[theme.trim,theme.side,theme.dark]);
if(theme.kind==='articuno'){for(let i=0;i<5;i++)crystal((i-2)*30,-315,15,16+i%2*7)}
else if(theme.kind==='zapdos'){for(const x of [-50,50]){line([x,-315,14],[x,-315,90],'#bbc2b4',5);bolt(x,-315,101,19)}line([-50,-315,73],[50,-315,73],'#e9cc77',2)}
else{for(const x of [-55,0,55])flame(x,-315,17,x===0?30:20)}
}
function bench(){
roundedBox(-315,308,-5,630,94,18,23,[theme.dark,theme.dark,'#182635']);
for(let i=0;i<9;i++){const x=-298+i*66;
if(theme.kind==='articuno'){roundedBox(x,317,11,61,46,8,13,['#bdebf2','#62a6bf','#3b7697']);face([[x+5,322,12],[x+53,322,12],[x+45,345,12],[x+12,353,12]],'#e2faff77');line([x+15,321,13],[x+30,338,13],'#fffafa99',1);line([x+30,338,13],[x+49,347,13],'#fffafa99',1)}
else if(theme.kind==='zapdos'){roundedBox(x,317,11,61,46,4,13,['#87989c','#4a656e','#304c5a']);for(let j=0;j<5;j++)line([x+8+j*10,321,13],[x+13+j*10,329,13],j%2?'#e8c65b':'#2b3e43',4);line([x+6,353,13],[x+55,353,13],'#f1d86c',2)}
else{roundedBox(x,317,11,61,46,6,13,['#625b62','#383845','#242b3b']);line([x+6,325,13],[x+25,338,13],'#f38d4388',2);line([x+25,338,13],[x+51,333,13],'#ffbd5d88',1);line([x+25,338,13],[x+31,355,13],'#e96e3288',1)}
const p=point(x+30,344,14);c.save();c.translate(p.x,p.y);c.scale(1,.65);c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle=theme.kind==='articuno'?'#285877':theme.accent;c.fillText(i+1,0,4*p.s);c.restore();}
const p=point(0,409,-12);c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle=theme.accent;c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);
}
function cachedScene(){const key=[W,H,dpr,zoom,pan,config.decor,config.quality,Math.round(gridSoftness*10)].join('|');if(key!==sceneKey){const main=c;c=scenery.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);background();arena();decor();bench();c=main;sceneKey=key}c.drawImage(scenery,0,0,W,H)}
function atmosphere(){const t=reducedMotion?0:time,power=config.energy/100;
if(config.clouds)for(let i=0;i<5;i++){const x=((random(i+3)*W+t*(theme.kind==='moltres'?6:15))%(W+300))-150,y=H*(.15+random(i+29)*.8),r=W*.13,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,theme.kind==='moltres'?'#211c2960':theme.kind==='zapdos'?'#172a4160':'#c5e5ed25');g.addColorStop(1,'#b0c9dd00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
if(!config.elements)return;
const n=Math.round((config.quality==='high'?110:40)*power);
for(let i=0;i<n;i++){const age=(t*(theme.kind==='articuno'?.045:.08)+i*.137)%1,x=-900+random(i+17)*1800+Math.sin(t*.5+i)*25,y=-400+random(i+44)*900,z=theme.kind==='moltres'?-30+age*170:150-age*190,p=point(x,y,z);c.globalAlpha=.25+Math.sin(age*Math.PI)*.45;c.strokeStyle=theme.accent;c.fillStyle=theme.accent;
if(theme.kind==='articuno'){c.lineWidth=p.s;c.beginPath();c.moveTo(p.x-2*p.s,p.y);c.lineTo(p.x+2*p.s,p.y);c.moveTo(p.x,p.y-2*p.s);c.lineTo(p.x,p.y+2*p.s);c.stroke()}
else if(theme.kind==='zapdos'){c.lineWidth=p.s;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-3*p.s,p.y+10*p.s);c.stroke()}
else{c.beginPath();c.ellipse(p.x,p.y,1.4*p.s,2.5*p.s,.3,0,Math.PI*2);c.fill()}c.globalAlpha=1;}
if(config.decor&&theme.kind==='moltres')for(const x of [-55,0,55])flame(x,-315,17,x===0?30:20,t*4);
if(theme.kind==='zapdos'&&!reducedMotion&&Math.sin(t*.55)>.97){for(const side of [-1,1]){const x=side*50,bend=Math.sin(t*21)*15;line([x,-315,121],[x+bend,-315,85],'#fff2b7',2);line([x+bend,-315,85],[x-bend*.5,-315,49],'#ead17e',1.4)}}
}

// prototypes/legendary-birds-arena/emblem-transition.js
/* Draw the battle seal progressively without rebuilding the scenery each frame. */
(()=>{
 let painter=null,progress=0,lastTime=null;
 const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const k=clamp(n);return k*k*(3-2*k)};
 function arc(radius,start,end,amount,color,width){
  if(amount<=0)return;const steps=Math.max(2,Math.ceil(80*amount));c.beginPath();
  for(let i=0;i<=steps;i++){const a=start+(end-start)*amount*i/steps,p=point(Math.cos(a)*radius,Math.sin(a)*radius,18);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y)}
  c.strokeStyle=color;c.lineWidth=width*point(0,0,18).s;c.lineCap='round';c.stroke();
 }
 function half(radius,start,end,color,alpha){if(alpha<=0)return;c.save();c.globalAlpha=alpha;const pts=Array.from({length:49},(_,i)=>{const a=start+(end-start)*i/48;return[Math.cos(a)*radius,Math.sin(a)*radius,17]});face(pts,color);c.restore()}
 function ball(p){
  const r=76,outer=smooth(p/.57),upper=smooth((p-.3)/.3),lower=smooth((p-.44)/.3),divider=smooth((p-.55)/.26),button=smooth((p-.73)/.27);
  half(r,Math.PI,Math.PI*2,'#c7594e',upper*.73);half(r,0,Math.PI,'#e4e8e0',lower*.68);
  arc(r,-Math.PI/2,Math.PI*1.5,outer,'#0e1c2bc9',5);
  arc(r,-Math.PI/2,Math.PI*1.5,outer,theme.kind==='articuno'?'#d4f3f5b0':'#e2cda8b0',1.2);
  if(divider>0){const a=point(-r*divider,0,19),b=point(r*divider,0,19);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle='#172330';c.lineWidth=5*a.s;c.lineCap='round';c.stroke()}
  if(button>0){
   const inner=Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return[Math.cos(a)*17,Math.sin(a)*17,20]});c.save();c.globalAlpha=button;face(inner,'#15212b');c.restore();
   arc(17,-Math.PI/2,Math.PI*1.5,button,'#d9e5df',1.5);
   const dot=Array.from({length:33},(_,i)=>{const a=i/32*Math.PI*2;return[Math.cos(a)*10,Math.sin(a)*10,21]});c.save();c.globalAlpha=smooth((p-.88)/.12)*.88;face(dot,'#e3ece5');c.restore();
  }
  if(p>.02&&p<.57&&!reducedMotion){const angle=-Math.PI/2+Math.PI*2*outer,q=point(Math.cos(angle)*r,Math.sin(angle)*r,20),radius=7*q.s,g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,radius);g.addColorStop(0,theme.kind==='articuno'?'#e8fbffb0':'#ffe1a4a0');g.addColorStop(1,'#ffe2b000');c.save();c.fillStyle=g;c.fillRect(q.x-radius,q.y-radius,radius*2,radius*2);c.restore()}
 }
 window.ARENA_EMBLEM_TRANSITION={setPainter(fn){painter=fn},draw(){
  if(!painter)return;const dt=lastTime==null?0:Math.max(0,Math.min(.1,time-lastTime));lastTime=time;
  const target=battle?1:0;progress=reducedMotion?target:clamp(progress+(target?1:-1)*dt/(target?1.8:1.35));
  c.save();clipFace(roundedPoints(-282,-269,12,564,538,33));
  const emblemAlpha=1-smooth((progress-.03)/.64);if(emblemAlpha>.001){c.save();c.globalAlpha=emblemAlpha;painter();c.restore()}
  if(progress>.001)ball(progress);c.restore();
 }};
})();

// prototypes/articuno-arena/illustrated.js
/* Illustrated environment experiment; board geometry and atmosphere remain shared. */
(()=>{
 const originalBackground=background,originalDecor=decor,originalAtmosphere=atmosphere;
 const art=new Image();let ready=false,illustrated=true;
 const cluster=new Image();let clusterReady=false;
 const frost=new Image();let frostReady=false;
 // Dense clusters with a large anchor, smaller companions, and uneven gaps.
 const clusters=[
  [-451,214,216,-1,-24],[-506,139,104,1,-22],[-361,243,91,-1,16],[-566,254,132,1,-24],
  [464,-245,172,1,-24],[537,-205,106,-1,-22],[371,-214,86,1,16],
  [-263,-372,138,1,-24],[-351,-332,94,-1,15],[-167,-359,76,-1,-12],
  [362,180,96,-1,16],[468,221,139,1,-24],[540,175,85,-1,-24],
  [-370,-80,104,1,16],[-445,-28,126,-1,-24],
  [201,-366,118,-1,-24],[282,-338,78,1,15],[-373,364,116,1,-24]
 ];
 const frostBeds=[
  [-346,-105,99,1,17],[-401,-139,125,-1,-20],[-504,-53,91,1,-22],
  [345,190,93,-1,17],[412,255,107,1,-20],[551,65,168,1,-22],[456,98,98,-1,-22],
  [-577,-290,141,-1,-22],[-388,-310,88,1,17],[-236,-333,82,-1,17],
  [317,-305,85,-1,17],[332,63,75,1,17],[-337,154,71,-1,17],[-490,310,124,1,-22]
 ];
 cluster.onload=()=>{clusterReady=true;sceneKey=''};
 cluster.src='assets/legendary-art/articuno/snow-garden-v1.webp';
 frost.onload=()=>{frostReady=true;sceneKey=''};frost.src='assets/legendary-art/articuno/frost-garden-v1.webp';
 const row=document.createElement('div');row.className='row';
 row.innerHTML='<span>Cenário ilustrado</span><button type="button" aria-pressed="true">Ativado</button>';
 const button=row.querySelector('button');document.querySelector('.controls h2').after(row);
 const status=document.createElement('p');status.className='art-status';status.textContent='Carregando a gruta ilustrada…';row.after(status);
 const setStatus=()=>{status.textContent=!ready?'Carregando a gruta ilustrada…':illustrated?'Rochas e neve pintadas · ambiente em camadas.':'Versão geométrica original para comparação.'};
 button.onclick=()=>{illustrated=!illustrated;button.textContent=illustrated?'Ativado':'Desativado';button.setAttribute('aria-pressed',String(illustrated));sceneKey='';setStatus()};
 art.onload=async()=>{try{await art.decode()}catch{}ready=true;sceneKey='';setStatus();requestAnimationFrame(()=>document.body.classList.remove('scene-loading'))};
 art.onerror=()=>{sceneKey='';status.textContent='Não foi possível carregar a ilustração. Exibindo o cenário original.';requestAnimationFrame(()=>document.body.classList.remove('scene-loading'))};
 art.src='assets/legendary-art/articuno/glacial-cave-v1.webp';
 background=function(){
  if(!ready||!illustrated||!config.decor){originalBackground();return}
  c.fillStyle='#173c55';c.fillRect(0,0,W,H);
  // A quiet camera layer: scenery moves more slowly than the playing field.
  const scale=Math.min(W/art.naturalWidth,H/art.naturalHeight);
  const width=art.naturalWidth*scale,height=art.naturalHeight*scale;
  const x=(W-width)/2+Math.max(-W*.045,Math.min(W*.045,pan*Math.min(W/1280,H/800)*.22));
  c.drawImage(art,x,(H-height)/2,width,height);
  const shade=c.createRadialGradient(W*.5,H*.45,H*.12,W*.5,H*.5,W*.7);shade.addColorStop(0,'#102d4200');shade.addColorStop(1,'#06182d66');c.fillStyle=shade;c.fillRect(0,0,W,H);
 };
 decor=function(){if(!ready||!illustrated){originalDecor();return}if(!config.decor)return;
  // Carry the painted ice texture onto the wide rim instead of a flat plastic slab.
  c.save();c.beginPath();
  for(const pts of [roundedPoints(-375,-345,-8,750,690,95),roundedPoints(-290,-277,11,580,554,44)])pts.map(p=>point(...p)).forEach((p,i)=>{if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);if(i===pts.length-1)c.closePath()});
  c.clip('evenodd');
  const rimScale=Math.min(W/art.naturalWidth,H/art.naturalHeight),rimW=art.naturalWidth*rimScale,rimH=art.naturalHeight*rimScale;
  c.globalAlpha=.62;c.drawImage(art,(W-rimW)/2+Math.max(-W*.045,Math.min(W*.045,pan*Math.min(W/1280,H/800)*.22)),(H-rimH)/2,rimW,rimH);c.restore();
  const elements=[...(clusterReady?clusters.map(e=>({e,img:cluster})):[]),...(frostReady?frostBeds.map(e=>({e,img:frost})):[])].sort((a,b)=>a.e[1]-b.e[1]);
  for(const {e:[x,y,width,flip,z=-24],img} of elements){const p=point(x,y,z),w=width*p.s,h=w*img.naturalHeight/img.naturalWidth;c.save();c.translate(p.x,p.y);c.scale(flip,1);c.drawImage(img,-w/2,-h*.88,w,h);c.restore()}
 };
 atmosphere=function(){
  originalAtmosphere();if(!ready||!illustrated||!config.decor)return;
  const t=reducedMotion?0:time,power=config.energy/100;
  if(config.clouds){
   // Long, translucent ground mist drifts between the painted rocks and board.
   for(const side of [-1,1])for(let i=0;i<3;i++){
    const p=point(side*(420+Math.sin(t*.16+i)*24),-200+i*210+Math.sin(t*.12+i)*28,-15);
    c.save();c.translate(p.x,p.y);c.scale(1,.2);const r=(90+i*16)*p.s,g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(190,235,248,'+(.09+.05*power)+')');g.addColorStop(1,'#bcefff00');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();
   }
  }
  if(!config.elements)return;
  for(let i=0;i<(config.quality==='low'?12:28);i++){
   const side=i%2?1:-1,phase=(t*.19+i*.143)%1;
   const p=point(side*(410+random(i+93)*140)-phase*20,-330+random(i+72)*680,18+phase*48);
   const alpha=Math.sin(phase*Math.PI)*(.16+power*.3),s=p.s*(1+random(i+3));
   c.save();c.globalAlpha=alpha;c.fillStyle='#e5fbff';c.beginPath();c.ellipse(p.x+Math.sin(t*.7+i)*9,p.y,s,s*.6,0,0,Math.PI*2);c.fill();c.restore();
  }
  // Brief glints on the ice, staggered rather than flashing together.
  for(let i=0;i<8;i++){
   const phase=(t*.23+i*.317)%1,alpha=reducedMotion?.22:Math.pow(Math.max(0,Math.sin(phase*Math.PI)),14)*.65;
   if(alpha<.02)continue;const p=point((i%2?1:-1)*(392+random(i+39)*74),-285+random(i+54)*550,12),r=(2+alpha*4)*p.s;
   c.save();c.globalAlpha=alpha;c.strokeStyle='#d6f7ff';c.lineWidth=p.s;c.beginPath();c.moveTo(p.x-r,p.y);c.lineTo(p.x+r,p.y);c.moveTo(p.x,p.y-r*1.6);c.lineTo(p.x,p.y+r*1.6);c.stroke();c.restore();
  }
 };
})();

// prototypes/articuno-arena/assets/articuno-animation.js
window.ARTICUNO_ANIMATION={"Walk":{"fw":88,"fh":88,"dur":[8,10,8,10],"bounds":{"fw":88,"fh":88,"mnx":4,"mny":1,"mxx":84,"mxy":60,"rb":[55,54,54,57,60,57,54,54],"rt":[6,4,1,2,5,2,1,4],"fb":[[43,46,43,55],[44,47,44,54],[46,50,46,54],[56,54,56,57],[59,60,59,58],[56,54,56,57],[46,50,46,54],[44,47,44,54]]}},"Idle":{"fw":88,"fh":88,"dur":[8,10,8,16],"bounds":{"fw":88,"fh":88,"mnx":4,"mny":1,"mxx":84,"mxy":60,"rb":[55,54,54,57,60,57,54,54],"rt":[6,4,1,2,5,2,1,4],"fb":[[43,46,43,55],[44,47,44,54],[46,50,46,54],[56,54,56,57],[59,60,59,58],[56,54,56,57],[46,50,46,54],[44,47,44,54]]}}};

// prototypes/articuno-arena/assets/ice-pokemon-animation.js
window.ICE_POKEMON_ANIMATION={"0087":{"Walk":{"fw":40,"fh":48,"dur":[8,6,6,6,10,8,8],"bounds":{"fw":40,"fh":48,"mnx":0,"mny":0,"mxx":39,"mxy":35,"rb":[33,35,29,30,33,30,29,35],"rt":[6,8,5,0,0,0,5,8],"fb":[[30,30,32,33,33,33,31],[31,32,34,35,35,34,32],[29,29,29,29,29,29,29],[30,28,27,26,25,28,29],[33,29,28,27,26,31,32],[30,28,27,26,25,28,29],[29,29,29,29,29,29,29],[31,32,34,35,35,34,32]]}},"Idle":{"fw":48,"fh":40,"dur":[30,12,8,12,8,12],"bounds":{"fw":48,"fh":40,"mnx":3,"mny":0,"mxx":44,"mxy":27,"rb":[25,26,25,27,27,27,25,26],"rt":[2,3,1,1,0,1,1,3],"fb":[[25,25,25,25,25,25],[26,26,26,26,26,26],[25,25,25,25,25,25],[24,27,24,27,24,27],[26,27,26,27,26,27],[24,27,24,27,24,27],[25,25,25,25,25,25],[26,26,26,26,26,26]]}}},"0091":{"Walk":{"fw":32,"fh":48,"dur":[8,8,8,10,8,8],"bounds":{"fw":32,"fh":48,"mnx":1,"mny":2,"mxx":29,"mxy":31,"rb":[30,31,30,29,30,29,30,31],"rt":[4,2,2,3,2,3,2,2],"fb":[[30,29,28,28,29,30],[31,30,29,29,30,31],[30,30,29,28,28,29],[29,29,28,27,28,29],[30,29,28,28,29,30],[29,29,28,27,28,29],[30,30,29,28,28,29],[31,30,29,29,30,31]]}},"Idle":{"fw":32,"fh":48,"dur":[12,12,12,14,12,12],"bounds":{"fw":32,"fh":48,"mnx":1,"mny":2,"mxx":29,"mxy":31,"rb":[30,31,30,29,30,29,30,31],"rt":[4,3,2,3,2,3,2,3],"fb":[[30,29,28,28,29,30],[31,30,29,29,30,31],[30,30,28,27,28,29],[29,29,27,27,28,29],[30,29,28,28,29,30],[29,29,27,27,28,29],[30,30,28,27,28,29],[31,30,29,29,30,31]]}}},"0124":{"Walk":{"fw":32,"fh":40,"dur":[8,12,8,12],"bounds":{"fw":32,"fh":40,"mnx":1,"mny":2,"mxx":28,"mxy":28,"rb":[27,27,27,27,28,27,27,27],"rt":[2,2,2,2,2,2,2,2],"fb":[[25,27,25,27],[25,27,25,26],[26,27,26,27],[26,27,26,27],[27,28,27,28],[26,27,26,27],[26,26,26,27],[25,26,25,27]]}},"Idle":{"fw":32,"fh":40,"dur":[30,14,30,14],"bounds":{"fw":32,"fh":40,"mnx":1,"mny":2,"mxx":28,"mxy":28,"rb":[27,27,27,27,28,27,27,27],"rt":[2,2,2,2,2,2,2,2],"fb":[[27,25,27,25],[27,25,26,25],[27,26,27,26],[27,26,27,26],[28,27,28,27],[27,26,27,26],[26,26,27,26],[26,25,27,25]]}}},"0131":{"Walk":{"fw":48,"fh":56,"dur":[10,12,10,12],"bounds":{"fw":48,"fh":56,"mnx":2,"mny":1,"mxx":44,"mxy":42,"rb":[38,40,40,42,40,42,40,40],"rt":[3,1,1,1,1,1,1,1],"fb":[[37,38,37,37],[40,38,40,38],[40,38,40,40],[42,40,42,42],[40,40,40,40],[42,40,42,42],[40,38,40,40],[40,38,40,38]]}},"Idle":{"fw":48,"fh":56,"dur":[40,12,16,12],"bounds":{"fw":48,"fh":56,"mnx":2,"mny":2,"mxx":44,"mxy":42,"rb":[37,40,40,42,40,42,40,40],"rt":[4,2,2,2,2,2,2,2],"fb":[[37,37,37,37],[40,38,40,38],[40,40,40,40],[42,42,42,42],[40,40,40,40],[42,42,42,42],[40,40,40,40],[40,38,40,38]]}}}};

// prototypes/articuno-arena/blizzard.js
/* Layered snow squalls and scenic Ice Pokémon. Uses only the prototype clock. */
(()=>{
 const previous=atmosphere;
 const inhabitants=[
  {id:'0087',name:'Dewgong',x:-457,y:72,size:1.65,phase:0,row:1},
  {id:'0091',name:'Cloyster',x:450,y:-50,size:1.65,phase:2,row:7},
  {id:'0124',name:'Jynx',x:-454,y:-273,size:1.55,phase:4,row:1},
  {id:'0131',name:'Lapras',x:481,y:260,size:1.8,phase:1,row:7},
  {id:'0087',name:'Dewgong',x:-546,y:282,size:1.15,phase:3,row:2},
  {id:'0091',name:'Cloyster',x:568,y:-287,size:1.2,phase:5,row:6}
 ];
 const images={};let fauna=true;
 for(const mon of inhabitants)for(const name of ['Idle','Walk']){
  const key=mon.id+name;if(images[key])continue;const image=new Image();image.src='assets/pmd/sprite/'+mon.id+'/'+name+'-Anim.png';images[key]=image;
 }
 const row=document.createElement('label');row.className='row';row.innerHTML='Pokémon de gelo <input type="checkbox" checked>';
 document.querySelector('.controls h2').after(row);row.querySelector('input').onchange=e=>fauna=e.target.checked;
 const note=document.createElement('p');note.textContent='Habitantes: Dewgong, Cloyster, Jynx e Lapras. Ajuste a nevasca para ver rajadas mais fortes.';row.after(note);
 defaults.energy=85;config.energy=85;$('energy').value=85;
 const flakes=Array.from({length:3},(_,layer)=>{
  const cv=document.createElement('canvas');cv.width=cv.height=32;const ctx=cv.getContext('2d'),r=layer===2?12:8;
  const glow=ctx.createRadialGradient(16,16,0,16,16,r);glow.addColorStop(0,'#f4fdffff');glow.addColorStop(.22,'#e8f9ffe6');glow.addColorStop(1,'#c5eaff00');ctx.fillStyle=glow;ctx.fillRect(0,0,32,32);return cv;
 });
 const mod=(n,m)=>((n%m)+m)%m;
 function drawPokemon(){if(!fauna||!config.decor)return;
  const t=reducedMotion?0:time;
  for(const mon of [...inhabitants].sort((a,b)=>a.y-b.y)){
   const mobile=mon.id==='0087'||mon.id==='0124',walk=mobile&&!reducedMotion&&Math.sin(t*.16+mon.phase)>.55;
   const name=walk?'Walk':'Idle',data=window.ICE_POKEMON_ANIMATION?.[mon.id],a=data?.[name]||data?.Idle,image=images[mon.id+(data?.[name]?name:'Idle')];
   if(!a||!image?.complete||!image.naturalWidth)continue;
   const drift=mobile?Math.sin(t*.19+mon.phase)*22:0,x=mon.x+drift,y=mon.y+Math.sin(t*.13+mon.phase)*8;
   const p=point(x,y,-19),scale=p.s*mon.size,rows=Math.max(1,Math.round(image.naturalHeight/a.fh)),direction=walk?(Math.cos(t*.19+mon.phase)>0?2:6):mon.row,r=Math.min(rows-1,direction);
   let tick=reducedMotion?0:(t*32+mon.phase*11)%a.dur.reduce((sum,n)=>sum+n,0),frame=0;
   while(frame<a.dur.length-1&&tick>=a.dur[frame])tick-=a.dur[frame++];
   c.save();c.globalAlpha=.19;c.fillStyle='#08253d';c.beginPath();c.ellipse(p.x,p.y,23*p.s,7*p.s,0,0,Math.PI*2);c.fill();c.restore();
   const bottom=a.bounds?.fb?.[r]?.[frame]??a.fh-1;
   c.save();c.imageSmoothingEnabled=false;c.drawImage(image,frame*a.fw,r*a.fh,a.fw,a.fh,p.x-a.fw*scale/2,p.y-(bottom+1)*scale,a.fw*scale,a.fh*scale);c.restore();
  }
 }
 function snowstorm(){const power=Math.max(0,Math.min(1,config.energy/100));if(!power||!config.elements)return;
  const t=reducedMotion?0:time,low=config.quality==='low';
  const gust=.65+.2*Math.sin(t*.73)+.15*Math.sin(t*1.31+2),wind=(.75+power*.8)*gust;
  c.save();
  // Wind-driven layers: fine distant snow, streaks, and soft near-camera flakes.
  for(let layer=0;layer<3;layer++){
   const count=Math.round((reducedMotion?12:low?[65,55,20][layer]:[210,170,65][layer])*power),speed=[55,125,240][layer]*(.5+power);
   for(let i=0;i<count;i++){
    const seed=i+layer*913,x=mod(random(seed+2)*(W+180)-t*speed*wind+Math.sin(t*.5+seed)*14,W+180)-90,y=mod(random(seed+82)*(H+100)+t*speed*.37,H+100)-50;
    const size=[1.2,2,5][layer]*(.65+random(seed+12)*.8);
    c.globalAlpha=([.26,.43,.3][layer]+gust*.11)*(.45+power*.55);
    if(layer===1&&!reducedMotion){c.strokeStyle='#dcf4ff';c.lineWidth=Math.max(.65,size*.45);c.beginPath();c.moveTo(x,y);c.lineTo(x-7*wind,y+3);c.stroke()}
    else c.drawImage(flakes[layer],x-size*2,y-size*2,size*4,size*4);
   }
  }
  if(config.clouds){
   // Broad snow curtains cross the edges; the center remains readable.
   for(let i=0;i<(low?2:4);i++){
    const cycle=mod(t*(.035+power*.025)+i*.29,1),x=W*(1.4-cycle*1.8),y=H*(.16+i*.22),r=W*.28;
    c.save();c.translate(x,y);c.rotate(-.24);c.scale(1,.26);const haze=c.createRadialGradient(0,0,0,0,0,r);haze.addColorStop(0,'rgba(215,242,255,'+(.06+power*.075)*gust+')');haze.addColorStop(1,'#e0f8ff00');c.globalAlpha=1;c.fillStyle=haze;c.fillRect(-r,-r,r*2,r*2);c.restore();
   }
   const veil=c.createRadialGradient(W*.5,H*.5,H*.22,W*.5,H*.5,W*.72);veil.addColorStop(0,'#daefff00');veil.addColorStop(1,'rgba(202,229,247,'+(.06+power*.17)+')');c.globalAlpha=1;c.fillStyle=veil;c.fillRect(-640,0,2560,H);
  }
  c.restore();
 }
 atmosphere=function(){previous();drawPokemon();snowstorm()};
})();

// prototypes/articuno-arena/frozen-life.js
/* Dense illustrated borders and repeating organic frost growth. Prototype only. */
(()=>{
 const previousDecor=decor,previousAtmosphere=atmosphere;
 const shore=new Image(),landmark=new Image();let shoreReady=false,landmarkReady=false,density=100,iceOn=true;
 shore.onload=()=>{shoreReady=true;sceneKey=''};shore.src='assets/legendary-art/articuno/icy-shore-v1.webp';
 landmark.onload=()=>{landmarkReady=true;sceneKey=''};landmark.src='assets/legendary-art/articuno/frozen-waterfall-v1.webp';
 const panel=document.createElement('div');panel.innerHTML='<label class="row">Gelo se formando <input id="iceGrowth" type="checkbox" checked></label><label class="row">Decoração extra <input id="iceDensity" type="range" min="20" max="100" step="10" value="100"></label>';
 document.querySelector('.controls h2').after(panel);
 panel.querySelector('#iceGrowth').onchange=e=>iceOn=e.target.checked;
 panel.querySelector('#iceDensity').oninput=e=>{density=Number(e.target.value);sceneKey=''};
 $('reset').addEventListener('click',()=>{density=100;iceOn=true;panel.querySelector('#iceGrowth').checked=true;panel.querySelector('#iceDensity').value=100;sceneKey=''});
 // Shores connect the clusters; only the two main landmarks repeat at a distance.
 const objects=[
  {kind:'landmark',x:-562,y:-203,z:-24,w:325,flip:1},
  {kind:'landmark',x:607,y:322,z:-24,w:236,flip:-1},
  {kind:'shore',x:409,y:28,z:-18,w:190,flip:-1},
  {kind:'shore',x:-389,y:340,z:-19,w:181,flip:1},
  {kind:'shore',x:238,y:-360,z:-12,w:163,flip:-1},
  {kind:'shore',x:-451,y:-134,z:-20,w:152,flip:1},
  {kind:'shore',x:-389,y:72,z:-17,w:120,flip:-1},
  {kind:'shore',x:-473,y:272,z:-20,w:161,flip:1},
  {kind:'shore',x:464,y:-177,z:-21,w:153,flip:-1},
  {kind:'shore',x:403,y:143,z:-17,w:127,flip:1},
  {kind:'shore',x:489,y:300,z:-20,w:157,flip:-1},
  {kind:'shore',x:-284,y:-337,z:15,w:115,flip:1},
  {kind:'shore',x:308,y:-312,z:15,w:94,flip:-1},
  {kind:'shore',x:-305,y:302,z:15,w:89,flip:-1}
 ];
 objects.sort((a,b)=>a.y-b.y);
 function snowGround(){
  // Broad linked snowbanks give the decorations common ground instead of floating bases.
  const banks=[[-464,-204,183,118],[-408,-34,100,175],[-447,220,155,143],[460,-225,148,122],[414,32,98,172],[466,234,157,144],[-247,-345,164,61],[234,-344,145,60],[-372,331,108,58]];
  c.save();c.beginPath();c.rect(0,0,W,H);
  const inner=roundedPoints(-291,-278,13,582,556,44).map(p=>point(...p));inner.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip('evenodd');
  banks.forEach(([x,y,rx,ry],index)=>{
   const pts=Array.from({length:26},(_,i)=>{const a=i/26*Math.PI*2,k=.87+random(index*53+i)*.2;return point(x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k,-20)});
   const center=point(x,y,-20),edge=point(x,y-ry,-20),g=c.createLinearGradient(edge.x,edge.y,center.x,center.y+ry*center.s*.6);g.addColorStop(0,'#c7e6eecc');g.addColorStop(.55,'#91c2d3cc');g.addColorStop(1,'#447b98aa');
   c.beginPath();const last=pts[pts.length-1];c.moveTo((last.x+pts[0].x)/2,(last.y+pts[0].y)/2);pts.forEach((p,i)=>{const n=pts[(i+1)%pts.length];c.quadraticCurveTo(p.x,p.y,(p.x+n.x)/2,(p.y+n.y)/2)});c.closePath();c.fillStyle=g;c.fill();
   c.save();c.clip();for(let j=0;j<26;j++){const q=point(x+(random(j+index*31)-.5)*rx*2,y+(random(j+index*29+30)-.5)*ry*2,-19);c.fillStyle=j%2?'#ecfbff30':'#274f6b15';c.beginPath();c.ellipse(q.x,q.y,(9+random(j)*20)*q.s,2*q.s,-.15,0,Math.PI*2);c.fill()}c.restore();
  });c.restore();
 }
 decor=function(){if(config.decor)snowGround();previousDecor();if(!config.decor)return;
  objects.forEach((o,i)=>{if(random(i+292)*100>density)return;const img=o.kind==='shore'?shore:landmark;if(o.kind==='shore'?!shoreReady:!landmarkReady)return;
   const p=point(o.x,o.y,o.z),w=o.w*p.s,h=w*img.naturalHeight/img.naturalWidth;c.save();c.translate(p.x,p.y);c.scale(o.flip,1);c.drawImage(img,-w/2,-h*.87,w,h);c.restore();
  });
 };
 // Paint fern-like, branching ice veins once; reveal them as frost spreads.
 function frostTexture(seed){
  const cv=document.createElement('canvas');cv.width=cv.height=192;const g=cv.getContext('2d');g.translate(96,96);
  const halo=g.createRadialGradient(0,0,0,0,0,82);halo.addColorStop(0,'#d7faff38');halo.addColorStop(.7,'#a9eaff14');halo.addColorStop(1,'#a9eaff00');g.fillStyle=halo;g.fillRect(-96,-96,192,192);
  g.lineCap='round';g.lineJoin='round';
  for(let arm=0;arm<9;arm++){
   const angle=arm*Math.PI*2/9+random(seed+arm)*.18,length=45+random(seed+arm+30)*37;
   g.save();g.rotate(angle);g.strokeStyle='#c6f3ff';g.lineWidth=.9;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(12,3,length*.65,-5,length,2);g.stroke();
   for(let j=1;j<8;j++){
    const x=length*j/9,span=(1-j/10)*(9+random(seed+j+arm)*10);
    for(const sign of [-1,1]){g.globalAlpha=.4+random(seed+j*7+arm)*.5;g.strokeStyle=j%2?'#e1fbff':'#8cdaef';g.beginPath();g.moveTo(x-5,0);g.quadraticCurveTo(x+span*.25,sign*span*.35,x+span*.65,sign*span);g.stroke();g.lineWidth=.55;g.beginPath();g.moveTo(x+span*.25,sign*span*.48);g.lineTo(x+span*.65+3,sign*span*.47);g.stroke();g.lineWidth=.9}
   }g.restore();
  }return cv;
 }
 const patches=[{x:-340,y:-80,z:18,size:43,seed:2},{x:349,y:173,z:18,size:46,seed:7},{x:-450,y:245,z:-17,size:68,seed:13},{x:430,y:14,z:-17,size:73,seed:19},{x:224,y:-338,z:18,size:57,seed:23}];
 for(const p of patches)p.texture=frostTexture(p.seed*29+17);
 function growth(){if(!iceOn||!config.elements||!config.decor)return;
  const t=reducedMotion?0:time,low=config.quality==='low';
  patches.forEach((patch,i)=>{if(low&&i%2)return;if(random(i+292)*100>density)return;
   const phase=(t+i*2.31)%24;
   const progress=reducedMotion?1:phase<11?phase/11:phase<19?1:Math.max(0,(24-phase)/5);
   if(progress<.02)return;const p=point(patch.x,patch.y,patch.z),radius=patch.size*p.s;
   c.save();c.translate(p.x,p.y);c.scale(1,.53);c.beginPath();c.arc(0,0,radius*progress,0,Math.PI*2);c.clip();c.globalAlpha=.28+progress*.6;
   c.drawImage(patch.texture,-radius,-radius,radius*2,radius*2);c.restore();
   if(!reducedMotion&&phase<11){
    for(let j=0;j<4;j++){const a=j*1.57+i*.7+t*.12,x=p.x+Math.cos(a)*radius*progress,y=p.y+Math.sin(a)*radius*.53*progress;
     c.save();c.globalAlpha=.25+Math.sin(t*2+j)*.15;c.fillStyle='#dcfbff';c.beginPath();c.ellipse(x,y,1.4*p.s,1.4*p.s,0,0,Math.PI*2);c.fill();c.restore()}
   }
  });
  if(!shoreReady)return;
  // Gradual bottom-up growth of illustrated ice shelves, offset across the rim.
  for(let i=0;i<2;i++){
   const p=point(i?350:-349,i?170:-92,18),cycle=reducedMotion?12:(t+i*3.7)%28;
   const grow=reducedMotion?1:cycle<12?cycle/12:cycle<23?1:(28-cycle)/5;
   if(grow<=0)continue;const w=77*p.s,h=w*shore.naturalHeight/shore.naturalWidth,base=p.y+h*.12;
   c.save();c.beginPath();c.rect(p.x-w/2,base-h*grow,w,h*grow);c.clip();c.globalAlpha=.35+.65*grow;c.drawImage(shore,p.x-w/2,base-h,w,h);c.restore();
  }
 }
 atmosphere=function(){previousAtmosphere();growth()};
})();

// prototypes/legendary-birds-arena/elemental-platform.js
/* Articuno/Moltres floors retain the shared board coordinates and bench slots. */
(()=>{
 if(!['articuno','moltres'].includes(theme.kind))return;
 const ice=theme.kind==='articuno',originalArena=arena,originalBench=bench,before=atmosphere,image=new Image();let ready=false;
 const P=ice?{top:'#b3dae5',edge:'#d2eff2',side:'#497d98',dark:'#224e6d',ink:'#d2f7ff',rail:'#91d6e9',seat:'#80b8ce',number:'#e8fbff'}:{top:'#4b3538',edge:'#b47743',side:'#33252e',dark:'#1e202b',ink:'#f1b46d',rail:'#bf652c',seat:'#634136',number:'#ffe0a0'};
 document.body.classList.add('platform-loading');
 image.onload=()=>{ready=true;sceneKey='';requestAnimationFrame(()=>document.body.classList.remove('platform-loading'))};
 image.onerror=()=>{sceneKey='';document.body.classList.remove('platform-loading')};image.src='assets/legendary-art/articuno/'+theme.kind+'-floor-v1.webp';
 function triangle(src,dst,crop){
  const [s0,s1,s2]=src,[p0,p1,p2]=dst,ux=s1.x-s0.x,uy=s1.y-s0.y,vx=s2.x-s0.x,vy=s2.y-s0.y,det=ux*vy-vx*uy;
  if(Math.abs(det)<1e-8)return;
  const a=((p1.x-p0.x)*vy-(p2.x-p0.x)*uy)/det,b=((p1.y-p0.y)*vy-(p2.y-p0.y)*uy)/det,cc=((p2.x-p0.x)*ux-(p1.x-p0.x)*vx)/det,d=((p2.y-p0.y)*ux-(p1.y-p0.y)*vx)/det;
  c.save();c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);c.closePath();c.clip();c.transform(a,b,cc,d,p0.x-a*s0.x-cc*s0.y,p0.y-b*s0.x-d*s0.y);
  c.drawImage(image,crop[0]*image.naturalWidth,crop[1]*image.naturalHeight,crop[2]*image.naturalWidth,crop[3]*image.naturalHeight,0,0,1,1);c.restore();
 }
 function surface(x,y,z,w,h,r,crop=[0,0,1,1],steps=4){c.save();clipFace(roundedPoints(x,y,z,w,h,r));
  for(let row=0;row<steps;row++)for(let col=0;col<steps;col++){
   const u=col/steps,v=row/steps,u1=(col+1)/steps,v1=(row+1)/steps,uv=[{x:u,y:v},{x:u1,y:v},{x:u1,y:v1},{x:u,y:v1}],pts=uv.map(p=>point(x+p.x*w,y+p.y*h,z));
   triangle([uv[0],uv[1],uv[2]],[pts[0],pts[1],pts[2]],crop);triangle([uv[0],uv[2],uv[3]],[pts[0],pts[2],pts[3]],crop);
  }c.restore();
 }
 function circle(r,z=14){return Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return[Math.cos(a)*r,Math.sin(a)*r,z]})}
 function emblem(){
  face(circle(79),ice?'#163d622e':'#20141f55',ice?'#d6f6ff70':'#e5a15d75');face(circle(72),'#0000',ice?'#9cdcef40':'#c3783b40');
  if(ice){
   // Sweeping feather fans and a central snow crystal evoke Articuno.
   for(const side of [-1,1])for(let feather=0;feather<3;feather++){
    const pts=[],base=feather*9;
    for(let i=0;i<=16;i++){const k=i/16;pts.push([side*(11+58*k),-3-base-28*Math.sin(k*Math.PI*.7)+feather*7*k,15])}
    for(let i=16;i>=0;i--){const k=i/16;pts.push([side*(11+58*k),5-base-13*Math.sin(k*Math.PI)+feather*7*k,15])}
    face(pts,'#a9e5f25c','#e7fbff50');
   }
   for(let arm=0;arm<6;arm++){
    const a=arm*Math.PI/3,cos=Math.cos(a),sin=Math.sin(a);line([0,0,16],[cos*39,sin*39,16],'#e9fbffad',2);
    for(const sign of [-1,1]){const angle=a+sign*Math.PI/3;line([cos*26,sin*26,16],[cos*26-Math.cos(angle)*10,sin*26-Math.sin(angle)*10,16],'#d7f5ffad',1.6)}
   }
   face(circle(8,17),'#d9f8ffc0','#efffff');
  }else{
   // Rising flame-feathers and a central ember mark the Moltres sanctuary.
   const wing=[[-10,6],[-71,-32],[-52,-4],[-69,2],[-47,12],[-59,24],[-22,39],[-4,20]];
   for(const side of [-1,1])face(wing.map(([x,y])=>[x*side,y,15]),'#d482365e','#e9af5d7a');
   const flame=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,x=Math.sin(a)*(15+Math.cos(a)*8),y=7-Math.cos(a)*41;flame.push([x+Math.sin(a*2)*7,y,16])}
   face(flame,'#e9a24f99','#ffce818a');face([[0,-17,17],[-10,14,17],[0,30,17],[11,10,17]],'#ffd68b99');
  }
 }
 window.ARENA_EMBLEM_TRANSITION?.setPainter(emblem);
 arena=function(){if(!ready){originalArena();return}
  roundedBox(-365,-335,-12,730,670,77,18,[P.top,P.side,P.dark]);surface(-365,-335,-11,730,670,77,[.09,.08,.82,.84]);
  roundedBox(-295,-282,4,590,564,42,20,[P.edge,P.side,P.dark]);
  roundedBox(-287,-274,7,574,548,36,13,[ice?'#4b8faf':'#38252a',P.dark,P.side]);
  surface(-282,-269,10,564,538,33);
  c.save();clipFace(roundedPoints(-282,-269,11,564,538,33));
  const hw=Math.sqrt(3)*42,gw=7.5*hw;
  for(let row=0;row<8;row++)for(let col=0;col<7;col++){
   const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*63+row*63,pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,11]});
   c.globalAlpha=1-gridSoftness*.9;
   face(pts,(row+col)%2?(ice?'#c1f4ff24':'#f5a45c1c'):'#0b1a272b');
   c.strokeStyle=ice?'#154360cc':'#160f1dd9';c.lineWidth=4;c.stroke();
   c.strokeStyle=ice?'#d4f8fff0':'#ffd18ce6';c.lineWidth=1.8;c.stroke();
  }c.globalAlpha=1;if(!window.ARENA_EMBLEM_TRANSITION)emblem();c.restore();
  // Low elemental studs sit outside the usable hexagons.
  for(const side of [-1,1]){
   line([side*287,-219,13],[side*287,222,13],P.rail,1.4);
   for(const y of [-214,-69,93,221]){
    if(ice){face([[side*287-7,y,16],[side*287,y-10,20],[side*287+7,y,16],[side*287,y+10,16]],'#ace6f0','#e6fcffb0')}
    else{roundedBox(side*287-6,y-9,15,12,18,4,4,['#8c5737','#35222c','#57352e']);line([side*287-2,y-4,19],[side*287-2,y+5,19],'#f1aa58',1)}
   }
  }
 };
 bench=function(){if(!ready){originalBench();return}
  for(let i=0;i<9;i++){
   const x=-298+i*66,z=11;
   roundedBox(x,317,z,61,46,ice?9:7,11,[P.seat,P.side,P.dark]);
   surface(x+2,319,z+1,57,41,ice?7:5,[.17+(i%3)*.07,.2+Math.floor(i/3)*.07,.32,.32],1);
   line([x+9,359,z+2],[x+51,359,z+2],ice?'#c5f5ffc0':'#e79d53b0',1.7);
   const p=point(x+30,342,z+3);c.save();c.translate(p.x,p.y);c.scale(1,.65);c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle=P.dark;c.fillText(i+1,0,5*p.s);c.fillStyle=P.number;c.fillText(i+1,0,4*p.s);c.restore();
  }
  const p=point(0,384,-3);c.save();c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle=P.number;c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);c.restore();
 };
 atmosphere=function(){before();if(!config.decor||!config.elements)return;const t=reducedMotion?0:time;
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const p=point(side*287,[-214,-69,93,221][i],20),pulse=reducedMotion?.18:.1+.15*(.5+.5*Math.sin(t*(ice?.6:1.1)+i*1.4+side)),r=(ice?12:15)*p.s,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,ice?'rgba(175,235,250,'+pulse+')':'rgba(255,151,60,'+pulse+')');g.addColorStop(1,ice?'#b0eaff00':'#fca05000');c.save();c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);c.restore();
  }
 };
})();

// prototypes/articuno-arena/articuno.js
/* Scenic Articuno: the prototype's phase and clock drive flight and landing. */
(()=>{
 const previousAtmosphere=atmosphere,previousDecor=decor;
 const sheets={},perch=new Image();let perchReady=false,enabled=true;
 perch.onload=()=>{perchReady=true;sceneKey=''};perch.src='assets/legendary-art/articuno/glacial-perch-v1.webp';
 for(const name of ['Walk','Idle']){const image=new Image();image.src='assets/pmd/sprite/0144/'+name+'-Anim.png';sheets[name]=image}
 const row=document.createElement('label');row.className='row';row.innerHTML='Articuno no cenário <input type="checkbox" checked>';
 document.querySelector('.controls h2').after(row);row.querySelector('input').onchange=e=>enabled=e.target.checked;
 const flight=t=>({x:Math.cos(t*.19)*440,y:30+Math.sin(t*.19)*180,z:75+Math.sin(t*.37)*18});
 const landing={x:0,y:-307,z:43},normalSize=1.65,flyingSize=4.8;let state='flight',started=0,origin=flight(0),lastBattle=false,lastTime=0,current=origin,lastPos=origin,size=flyingSize,originSize=flyingSize,heading=0;
 const mix=(a,b,k)=>({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,z:a.z+(b.z-a.z)*k});
 const ease=k=>k*k*(3-2*k);
 decor=function(){previousDecor();if(!config.decor||!perchReady)return;
  const p=point(0,-314,16),w=186*p.s,h=w*perch.naturalHeight/perch.naturalWidth;c.drawImage(perch,p.x-w/2,p.y-h*.8,w,h);
 };
 atmosphere=function(){previousAtmosphere();if(!enabled||!showScenicBird)return;
  const t=time;if(t<lastTime){state='flight';lastBattle=false;started=t}lastTime=t;
  if(scenicPerched!==lastBattle){origin={...current};originSize=size;started=t;state=scenicPerched?'landing':'takeoff';lastBattle=scenicPerched}
  const elapsed=t-started;
  if(state==='landing'){const k=reducedMotion?1:Math.min(1,elapsed/3.2);current=mix(origin,landing,ease(k));size=originSize+(normalSize-originSize)*ease(k);current.z+=Math.sin(k*Math.PI)*48;if(k>=1)state='perched'}
  else if(state==='perched'){current={...landing};size=normalSize}
  else if(state==='takeoff'){const k=reducedMotion?1:Math.min(1,elapsed/2.5);current=mix(origin,flight(t),ease(k));size=originSize+(flyingSize-originSize)*ease(k);if(k>=1)state='flight'}
  else{current=reducedMotion?{x:390,y:-220,z:100}:flight(t);size=flyingSize}
  const landed=state==='perched',name=landed?'Idle':'Walk',image=sheets[name],a=window.ARTICUNO_ANIMATION?.[name];if(!a||!image.complete||!image.naturalWidth)return;
  const dx=current.x-lastPos.x,dy=current.y-lastPos.y;lastPos={...current};
  if(Math.abs(dx)+Math.abs(dy)>.01)heading=((2-Math.round(Math.atan2(dy,dx)*4/Math.PI))%8+8)%8;
  const direction=landed||reducedMotion?0:heading;
  const rows=Math.max(1,Math.round(image.naturalHeight/a.fh)),r=Math.min(rows-1,direction);
  const total=a.dur.reduce((s,n)=>s+n,0);let tick=reducedMotion?0:(t*40)%total,frame=0;
  while(frame<a.dur.length-1&&tick>=a.dur[frame])tick-=a.dur[frame++];
  const p=point(current.x,current.y,current.z),shadow=point(current.x,current.y,landed?25:-15),scale=p.s*size;
  c.save();c.globalAlpha=landed?.22:.1;c.fillStyle='#06243d';c.beginPath();c.ellipse(shadow.x,shadow.y,(29+Math.max(0,size-normalSize)*16)*shadow.s,(9+Math.max(0,size-normalSize)*3)*shadow.s,0,0,Math.PI*2);c.fill();c.restore();
  if(config.elements&&!reducedMotion&&!landed){
   for(let i=0;i<10;i++){const lag=(i+1)*.1,q=point(current.x-dx*70*lag,current.y-dy*70*lag,current.z-lag*9);c.fillStyle='rgba(170,237,255,'+(.2*(1-i/10))+')';c.fillRect(q.x-i*2,q.y+Math.sin(t*3+i)*6,2*p.s,2*p.s)}
  }
  const bounds=a.bounds,bottom=bounds?.fb?.[r]?.[frame]??a.fh-1; p.y=Math.max(20+(bottom+1)*scale,Math.min(780-(a.fh-bottom-1)*scale,p.y));p.x=Math.max(24+a.fw*scale/2,Math.min(1256-a.fw*scale/2,p.x));
  c.save();c.imageSmoothingEnabled=false;c.drawImage(image,frame*a.fw,r*a.fh,a.fw,a.fh,p.x-a.fw*scale/2,p.y-(bottom+1)*scale,a.fw*scale,a.fh*scale);c.restore();
  if(state==='perched'&&config.elements&&!reducedMotion&&elapsed<4.1){const k=Math.min(1,(elapsed-3.2)/.9);if(k>=0){c.save();c.globalAlpha=(1-k)*.4;c.strokeStyle='#d5f7ff';c.lineWidth=p.s;c.beginPath();c.ellipse(p.x,p.y,(14+k*58)*p.s,(5+k*18)*p.s,0,0,Math.PI*2);c.stroke();c.restore()}}
 };
})();


let lastGrid=-1,lastViewportWidth=0;
const backdrop=new Image();backdrop.src='assets/legendary-art/'+theme.kind+'/'+({articuno:'glacial-cave-v1.webp',moltres:'caldera-v1.webp',zapdos:'power-station-v1.webp'}[theme.kind]);
return {
 paint(g,layer,isAngled){c=g;angled=isAngled;sceneHeightOffset=10;
  if(images.some(im=>im.src&&!im.complete)){if(layer!=='arena'){g.fillStyle=theme.sky[0];g.fillRect(-640,0,2560,800)}sceneKey='painted';return}
  if(layer!=='arena'){mode='scene';c.fillStyle=theme.sky[0];c.fillRect(-640,0,2560,800);const visibleWidth=Math.min(2560,Math.max(1280,realDocument.getElementById('stage').offsetWidth));if(backdrop.complete&&backdrop.naturalWidth)c.drawImage(backdrop,(1280-visibleWidth)/2,0,visibleWidth,800);else background()}
  if(layer!=='scene'){mode='field';arena();decor();benchMode=true;bench();benchMode=false}
  sceneKey='painted';
 },
 tick(dt,state){active=!!state.active;ensureAudio(state);weatherFX.style.display=active?'block':'none';floorFX.style.display=active?'block':'none';
  if(!active){if(wasActive){time=0;gridSoftness=0;sceneKey=''}wasActive=false;return false}
  const viewportWidth=realDocument.getElementById('stage').offsetWidth;if(viewportWidth!==lastViewportWidth){lastViewportWidth=viewportWidth;sceneKey=''}wasActive=true;angled=state.angled;paused=state.paused;reducedMotion=systemReduced;config.quality=state.reduceFx?'low':state.quality;battle=state.combat;showScenicBird=state.preparation||!!state.preview||!!state.birdObserver||!!state.towerObserver||!!state.birdArrival;scenicPerched=!!state.birdPerched||state.combat;
  if(!paused&&!realDocument.hidden)time+=dt;
  gridSoftness+=((battle?1:0)-gridSoftness)*(1-Math.exp(-(paused?0:dt)*5));const grid=Math.round(gridSoftness*10),dirty=sceneKey===''||grid!==lastGrid;lastGrid=grid;
  c=floorFX.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,1280,800);mode='field';window.ARENA_EMBLEM_TRANSITION?.draw();
  c=weatherFX.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';sceneHeightOffset=10;
  if(!realDocument.hidden&&!images.some(im=>im.src&&!im.complete)){window.BIRD_LAVA?.groundGlow();window.BIRD_LAVA?.decorationGlow();atmosphere()}
  return dirty;
 }
};

};
