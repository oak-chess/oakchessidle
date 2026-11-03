/* Generated from approved prototypes by scripts/build-legendary-arenas.cjs. */
window.createZapdosArena=function(){

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

// prototypes/zapdos-arena/theme.js
window.BIRD_THEME={kind:'zapdos',sky:['#111e32','#33495e','#6c7c85'],rocks:['#364957','#495d64','#637574'],edge:'#7c8988',side:'#455e67',dark:'#233c4b',trim:'#d4bc67',floor:['#778a88','#8b9b93'],accent:'#f4d779',soundText:'Vento forte na usina da tempestade.'};

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

// prototypes/zapdos-arena/assets/pokemon-animation.js
window.VOLT_ANIMATION={"0025":{"Walk":{"fw":32,"fh":40,"dur":[8,10,8,10],"bounds":{"fw":32,"fh":40,"mnx":2,"mny":0,"mxx":29,"mxy":27,"rb":[25,26,25,27,27,27,25,26],"rt":[0,0,2,2,2,2,2,0],"fb":[[24,25,24,25],[26,26,26,26],[25,25,25,25],[25,25,25,27],[25,27,25,27],[25,25,25,27],[25,25,25,25],[26,26,26,26]]}},"Idle":{"fw":40,"fh":56,"dur":[40,2,3,3,3,2],"bounds":{"fw":40,"fh":56,"mnx":0,"mny":3,"mxx":39,"mxy":34,"rb":[32,34,33,33,33,33,33,34],"rt":[3,5,6,6,4,6,6,5],"fb":[[32,26,25,24,25,26],[34,29,28,27,28,29],[33,27,26,25,26,27],[33,29,28,27,28,29],[33,30,29,28,29,30],[33,29,28,27,28,29],[33,27,26,25,26,27],[34,29,28,27,28,29]]}}},"0081":{"Walk":{"fw":24,"fh":32,"dur":[8,6,6,8,6,6],"bounds":{"fw":24,"fh":32,"mnx":1,"mny":1,"mxx":21,"mxy":20,"rb":[17,18,20,18,17,18,20,18],"rt":[1,1,1,1,1,1,1,1],"fb":[[17,17,16,15,16,17],[18,18,17,16,17,18],[20,20,19,18,17,18],[17,18,17,15,15,16],[16,17,16,14,15,16],[17,18,17,15,15,16],[20,20,19,18,17,18],[18,18,17,16,17,18]]}},"Idle":{"fw":24,"fh":32,"dur":[10,14,10,14],"bounds":{"fw":24,"fh":32,"mnx":1,"mny":2,"mxx":21,"mxy":20,"rb":[18,19,20,18,17,18,20,19],"rt":[2,2,2,2,2,2,2,2],"fb":[[17,17,17,18],[18,18,18,19],[20,20,20,19],[17,18,17,17],[16,17,16,17],[17,18,17,17],[20,20,20,19],[18,18,18,19]]}}},"0100":{"Walk":{"fw":32,"fh":40,"dur":[6,6,10,4,4,4,6,8],"bounds":{"fw":32,"fh":40,"mnx":4,"mny":3,"mxx":27,"mxy":28,"rb":[27,28,24,28,28,28,24,28],"rt":[5,6,6,4,3,4,6,6],"fb":[[24,22,21,20,23,26,25,27],[24,22,21,21,24,27,26,28],[24,24,24,22,21,24,23,24],[24,27,28,24,20,21,19,20],[24,26,28,21,20,20,18,20],[24,27,28,24,20,21,19,20],[24,24,24,22,21,24,23,24],[24,22,21,21,24,27,26,28]]}},"Idle":{"fw":24,"fh":32,"dur":[22,6,2,6,6],"bounds":{"fw":24,"fh":32,"mnx":4,"mny":2,"mxx":19,"mxy":20,"rb":[20,20,20,20,20,20,20,20],"rt":[2,2,2,2,2,2,2,2],"fb":[[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19],[20,17,19,20,19]]}}},"0125":{"Walk":{"fw":40,"fh":56,"dur":[8,10,8,10],"bounds":{"fw":40,"fh":56,"mnx":3,"mny":3,"mxx":36,"mxy":35,"rb":[34,35,34,34,35,34,34,35],"rt":[6,3,3,5,7,5,3,4],"fb":[[32,34,32,34],[35,33,35,33],[34,34,34,34],[33,34,33,34],[34,35,34,35],[33,34,33,34],[34,34,34,34],[35,35,35,34]]}},"Idle":{"fw":40,"fh":56,"dur":[28,18,28,18],"bounds":{"fw":40,"fh":56,"mnx":3,"mny":3,"mxx":36,"mxy":35,"rb":[34,35,34,34,35,34,34,35],"rt":[6,3,3,5,7,5,3,4],"fb":[[32,34,32,34],[35,33,35,33],[34,34,34,34],[33,34,33,34],[34,35,34,35],[33,34,33,34],[34,34,34,34],[35,35,35,34]]}}},"0145":{"Walk":{"fw":56,"fh":96,"dur":[6,6,6,6],"bounds":{"fw":56,"fh":96,"mnx":4,"mny":3,"mxx":52,"mxy":51,"rb":[49,49,51,49,50,49,51,49],"rt":[3,3,6,8,8,8,6,3],"fb":[[49,49,49,48],[48,49,48,46],[49,50,49,51],[49,49,49,48],[50,49,50,47],[49,49,49,48],[49,50,49,51],[48,49,48,46]]}},"Idle":{"fw":56,"fh":96,"dur":[8,10,8,10],"bounds":{"fw":56,"fh":96,"mnx":4,"mny":3,"mxx":52,"mxy":51,"rb":[49,49,51,49,50,49,51,49],"rt":[3,3,6,8,8,8,6,3],"fb":[[49,49,49,48],[48,49,48,46],[49,50,49,51],[49,49,49,48],[50,49,50,47],[49,49,49,48],[49,50,49,51],[48,49,48,46]]}}}};

// prototypes/zapdos-arena/station.js
/* Painted power-station environment with layered weather and local electric arcs. */
(()=>{
 const fallback=background,assets={};let ready=false,fauna=true,arcs=true;
 function load(key,file){return new Promise(resolve=>{const im=new Image();assets[key]=im;im.onload=async()=>{try{await im.decode()}catch{}sceneKey='';resolve(true)};im.onerror=()=>resolve(false);im.src='assets/legendary-art/zapdos/'+file})}
 Promise.all([load('ground','power-station-v1.webp'),load('coil','transformer-v1.webp'),load('cabinet','switchgear-v1.webp'),load('perch','substation-perch-v1.webp'),load('pylon','broken-pylon-v1.webp'),load('cables','cable-reel-v1.webp'),load('cooling','cooling-manifold-v1.webp')]).then(results=>{ready=results[0];sceneKey='';requestAnimationFrame(()=>document.body.classList.remove('scene-loading'))});
 function ground(){const im=assets.ground,s=Math.min(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;c.drawImage(im,(W-w)/2+Math.max(-W*.045,Math.min(W*.045,pan*Math.min(W/1280,H/800)*.22)),(H-h)/2,w,h)}
 background=function(){if(!ready){fallback();return}c.fillStyle='#243342';c.fillRect(0,0,W,H);ground()};
 const groups=[
  // Upper-left: damaged transmission equipment, not another landing platform.
  ['pylon',-495,-177,235,1,-23],['coil',-354,-176,91,-1,16],['cables',-451,-75,136,1,-21],
  // Upper-right: compact transformer yard with a maintenance cabinet.
  ['coil',445,-227,158,1,-22],['cabinet',529,-188,115,-1,-22],['cables',368,-202,84,-1,16],
  // Lower-left: storage and maintenance, with varied low silhouettes.
  ['cabinet',-450,219,171,1,-22],['cables',-531,276,143,-1,-22],['coil',-340,144,87,-1,16],
  // Lower-right: pipes and valves, separated from the electrical yard.
  ['cooling',462,207,219,-1,-22],['cables',554,278,103,1,-22],['cabinet',340,156,87,1,16],
  // Small rim details and rear services; keep the central perch unique.
  ['cabinet',-232,-340,126,-1,15],['cables',-139,-329,83,1,16],
  ['cooling',221,-339,135,1,15],['coil',318,-308,73,-1,16],
  ['cables',-338,284,74,1,15],['coil',334,280,72,-1,15],
  ['pylon',-665,143,158,-1,-23],['cooling',644,-145,153,1,-23]
 ].sort((a,b)=>a[2]-b[2]);
 decor=function(){if(!ready||!config.decor)return;
  // Grounded cables connect selected assemblies without hiding the playable cells.
  for(const side of [-1,1]){
   const a=point(side*349,-203,14),b=point(side*361,-34,14),d=point(side*347,185,14);c.save();c.lineCap='round';c.lineWidth=5*a.s;c.strokeStyle='#1c232b';c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(b.x+side*9,b.y,b.x-side*8,b.y,d.x,d.y);c.stroke();c.lineWidth=a.s;c.strokeStyle='#8b827555';c.stroke();c.restore();
  }
  for(const [kind,x,y,width,flip,z]of groups){const im=assets[kind];if(!im?.complete||!im.naturalWidth)continue;const p=point(x,y,z),w=width*p.s,h=w*im.naturalHeight/im.naturalWidth;c.save();c.translate(p.x,p.y);c.scale(flip,1);c.drawImage(im,-w/2,-h*.87,w,h);c.restore()}
 };
 defaults.energy=80;config.energy=80;$('energy').value=80;
 const controls=document.createElement('div');controls.innerHTML='<label class="row">Pokémon elétricos <input data-station="fauna" type="checkbox" checked></label><label class="row">Arcos elétricos <input data-station="arcs" type="checkbox" checked></label>';
 document.querySelector('.controls h2').after(controls);controls.querySelector('[data-station="fauna"]').onchange=e=>fauna=e.target.checked;controls.querySelector('[data-station="arcs"]').onchange=e=>arcs=e.target.checked;
 $('reset').addEventListener('click',()=>{fauna=arcs=true;controls.querySelectorAll('input').forEach(el=>el.checked=true)});
 const inhabitants=[{id:'0025',x:-443,y:72,size:1.65,phase:1,row:1},{id:'0081',x:468,y:-140,size:1.6,phase:3,row:7,hover:true},{id:'0100',x:-490,y:281,size:1.55,phase:5,row:2},{id:'0125',x:489,y:258,size:1.7,phase:7,row:7}];
 const sheets={};for(const mon of inhabitants)for(const name of ['Walk','Idle']){const im=new Image();im.src='assets/pmd/sprite/'+mon.id+'/'+name+'-Anim.png';sheets[mon.id+name]=im}
 function drawFauna(){if(!fauna||!config.decor)return;const t=reducedMotion?0:time;
  for(const mon of inhabitants){const walk=!reducedMotion&&!mon.hover&&mon.id!=='0125'&&Math.sin(t*.17+mon.phase)>.5,name=walk?'Walk':'Idle',data=window.VOLT_ANIMATION?.[mon.id],a=data?.[name]||data?.Idle,im=sheets[mon.id+(data?.[name]?name:'Idle')];if(!a||!im?.complete||!im.naturalWidth)continue;
   const x=mon.x+Math.sin(t*.18+mon.phase)*17,y=mon.y+Math.sin(t*.12+mon.phase)*6,base=point(x,y,-18),p=point(x,y,mon.hover?-3+Math.sin(t*1.4)*4:-18),r=Math.min(Math.round(im.naturalHeight/a.fh)-1,walk?(Math.cos(t*.18+mon.phase)>0?2:6):mon.row);let tick=reducedMotion?0:(t*32+mon.phase*9)%a.dur.reduce((s,n)=>s+n,0),frame=0;while(frame<a.dur.length-1&&tick>=a.dur[frame])tick-=a.dur[frame++];
   c.save();c.globalAlpha=.17;c.fillStyle='#0a1523';c.beginPath();c.ellipse(base.x,base.y,20*base.s,6*base.s,0,0,Math.PI*2);c.fill();c.restore();
   const scale=p.s*mon.size,bottom=a.bounds?.fb?.[r]?.[frame]??a.fh-1;c.save();c.imageSmoothingEnabled=false;c.drawImage(im,frame*a.fw,r*a.fh,a.fw,a.fh,p.x-a.fw*scale/2,p.y-(bottom+1)*scale,a.fw*scale,a.fh*scale);c.restore();
  }
 }
 const mod=(n,m)=>(n%m+m)%m;
 function electricArc(start,end,t,alpha,seed){
  const a=point(...start),b=point(...end);c.save();c.globalAlpha=alpha;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(a.x,a.y);
  for(let i=1;i<8;i++){const k=i/8,jitter=(random(seed+i+Math.floor(t*16)*11)-.5)*14*a.s;c.lineTo(a.x+(b.x-a.x)*k+jitter,a.y+(b.y-a.y)*k+jitter*.3)}c.lineTo(b.x,b.y);
  c.strokeStyle='#6baff0';c.lineWidth=3*a.s;c.stroke();c.strokeStyle='#edfaff';c.lineWidth=a.s;c.stroke();c.restore();
 }
 function weather(){const t=reducedMotion?0:time,power=config.energy/100,low=config.quality==='low';
  if(config.elements&&power>0){
   const wind=.85+.26*Math.sin(t*.63)+.12*Math.sin(t*1.17+2);
   c.save();c.strokeStyle='#c0deed';
   for(let layer=0;layer<3;layer++){
    const count=Math.round((reducedMotion?8:low?[45,42,18][layer]:[115,125,65][layer])*power);
    for(let i=0;i<count;i++){
     const seed=i+layer*541,speed=[240,430,650][layer]*(.8+random(seed+19)*.45),x=mod(random(seed+77)*(W+160)-t*speed*.32*wind,W+160)-80,y=mod(random(seed+42)*(H+100)+t*speed,H+100)-50;
     const length=reducedMotion?3:[9,17,29][layer]*(.75+random(seed+14)*.5);
     c.globalAlpha=[.12,.23,.3][layer]*(.65+random(seed+55)*.5);c.lineWidth=[.65,.85,1.15][layer];c.beginPath();c.moveTo(x,y);c.lineTo(x-length*.34*wind,y+length);c.stroke();
    }
   }c.restore();
   // Rain rings remain on the ground around the board.
   if(!reducedMotion)for(let i=0;i<(low?15:46);i++){
    const age=(t*(.8+random(i+21)*.35)+i*.137)%1,p=point((i%2?1:-1)*(390+random(i+37)*220),-340+random(i+56)*745,-20);c.save();c.globalAlpha=(1-age)*.3*power;c.strokeStyle='#d3eaf1';c.lineWidth=.85*p.s;c.beginPath();c.ellipse(p.x,p.y,(2+age*13)*p.s,(1+age*4)*p.s,0,0,Math.PI*2);c.stroke();
    if(age<.2){const k=age/.2;for(const side of [-1,1]){c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+side*3*p.s,p.y-7*Math.sin(k*Math.PI)*p.s,p.x+side*6*k*p.s,p.y-2*p.s);c.stroke()}}c.restore();
   }
   if(config.clouds&&!reducedMotion){
    for(let i=0;i<(low?1:3);i++){const phase=mod(t*.045+i*.37,1),x=W*(1.3-phase*1.6),y=H*(.25+i*.25),r=W*.23;c.save();c.translate(x,y);c.rotate(-.3);c.scale(1,.4);const mist=c.createRadialGradient(0,0,0,0,0,r);mist.addColorStop(0,'rgba(178,208,224,'+(.035*power)+')');mist.addColorStop(1,'#afcedc00');c.fillStyle=mist;c.fillRect(-r,-r,r*2,r*2);c.restore()}
   }
  }
  if(config.decor){for(let i=0;i<groups.length;i++){const [kind,x,y,,,z]=groups[i];if(kind!=='cabinet')continue;const p=point(x,y,z+23),r=13*p.s,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(245,204,96,'+(.12+(Math.sin(t*.8+i)+1)*.025)+')');g.addColorStop(1,'#f4c44b00');c.save();c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);c.restore()}}
  if(config.elements&&config.decor&&arcs&&power>.1){
   if(reducedMotion){for(const side of [-1,1]){const p=point(side*340,30,39);c.save();c.globalAlpha=.25;c.fillStyle='#a6d9f9';c.beginPath();c.arc(p.x,p.y,2*p.s,0,Math.PI*2);c.fill();c.restore()}}
   else{
    const burst=mod(t,7.8);if(burst>3.25&&burst<3.5)electricArc([-353,-173,50],[-340,143,48],t,.75*power,31);
    if(burst>5.1&&burst<5.34)electricArc([443,-239,48],[425,77,54],t,.72*power,79);
   }
  }
  if(config.clouds){for(let i=0;i<(low?3:6);i++){const phase=reducedMotion?.5:mod(t*.017+i*.19,1),p=point((i%2?1:-1)*(430+random(i+3)*150),-370+phase*850,45),r=(83+random(i)*47)*p.s,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'#13213120');g.addColorStop(1,'#13213100');c.save();c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);c.restore()}}
 }
 atmosphere=function(){if(!ready)return;drawFauna();weather()};
})();

// prototypes/zapdos-arena/station-platform.js
/* Textured stone surfaces follow the same projected coordinates as the hex grid. */
(()=>{
 const originalArena=arena,originalBench=bench,beforeAtmosphere=atmosphere,rock=new Image(),metal=new Image();let ready=false,metalReady=false;
 rock.onload=()=>{ready=true;sceneKey=''};rock.src='assets/legendary-art/zapdos/power-station-v1.webp';
 metal.onload=()=>{metalReady=true;sceneKey=''};metal.src='assets/legendary-art/zapdos/zapdos-floor-v1.webp';
 function triangle(src,dst,crop,image=rock){
  const [s0,s1,s2]=src,[p0,p1,p2]=dst,ux=s1.x-s0.x,uy=s1.y-s0.y,vx=s2.x-s0.x,vy=s2.y-s0.y,det=ux*vy-vx*uy;
  if(Math.abs(det)<1e-8)return;
  const a=((p1.x-p0.x)*vy-(p2.x-p0.x)*uy)/det,b=((p1.y-p0.y)*vy-(p2.y-p0.y)*uy)/det,
   cc=((p2.x-p0.x)*ux-(p1.x-p0.x)*vx)/det,d=((p2.y-p0.y)*ux-(p1.y-p0.y)*vx)/det;
  c.save();c.beginPath();c.moveTo(p0.x,p0.y);c.lineTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);c.closePath();c.clip();
  c.transform(a,b,cc,d,p0.x-a*s0.x-cc*s0.y,p0.y-b*s0.x-d*s0.y);
  c.drawImage(image,crop[0]*image.naturalWidth,crop[1]*image.naturalHeight,crop[2]*image.naturalWidth,crop[3]*image.naturalHeight,0,0,1,1);c.restore();
 }
 function surface(x,y,z,w,h,r,crop,steps=4,image=rock){
  c.save();clipFace(roundedPoints(x,y,z,w,h,r));
  for(let row=0;row<steps;row++)for(let col=0;col<steps;col++){
   const u=col/steps,v=row/steps,u1=(col+1)/steps,v1=(row+1)/steps;
   const uv=[{x:u,y:v},{x:u1,y:v},{x:u1,y:v1},{x:u,y:v1}],pts=uv.map(p=>point(x+p.x*w,y+p.y*h,z));
   triangle([uv[0],uv[1],uv[2]],[pts[0],pts[1],pts[2]],crop,image);triangle([uv[0],uv[2],uv[3]],[pts[0],pts[2],pts[3]],crop,image);
  }c.restore();
 }
 function emblem(){
  const ring=(r)=>Array.from({length:49},(_,i)=>{const a=i*Math.PI*2/48;return[Math.cos(a)*r,Math.sin(a)*r,13]});
  face(ring(79),'#081b2838','#c7a65375');face(ring(72),'#0c1c271a','#d9c17b32');
  const wing=[[-9,-5],[-67,-49],[-49,-8],[-76,-26],[-51,17],[-64,17],[-23,40],[-6,13]];
  for(const side of [1,-1])face(wing.map(([x,y])=>[x*side,y,14]),'#d9b64d78','#f6d68c80');
  face([[7,-43,15],[-15,-2,15],[-1,-2,15],[-7,43,15],[20,-12,15],[6,-10,15]],'#f2ce67b3','#ffe5a9aa');
 }
 window.ARENA_EMBLEM_TRANSITION?.setPainter(emblem);
 arena=function(){if(!ready){originalArena();return}
  // A golden-edged electrical platform, grounded in the old power-station courtyard.
  roundedBox(-365,-335,-12,730,670,77,15,['#414c54','#252f39','#303c46']);
  surface(-365,-335,-11,730,670,77,[.25,.24,.5,.52]);
  roundedBox(-295,-282,4,590,564,41,19,['#b49851','#29343e','#665239']);
  roundedBox(-288,-275,7,576,550,37,15,['#202c3a','#1b2531','#33404c']);
  roundedBox(-282,-269,9,564,538,34,12,['#44515f','#24303a','#35424a']);
  surface(-282,-269,10,564,538,34,metalReady?[0,0,1,1]:[.32,.27,.36,.44],4,metalReady?metal:rock);
  c.save();clipFace(roundedPoints(-282,-269,11,564,538,34));
  const radius=42,hw=Math.sqrt(3)*radius,gw=7.5*hw;
  for(let row=0;row<8;row++)for(let col=0;col<7;col++){
   const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*1.5*radius+row*1.5*radius,pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,11]});
   c.globalAlpha=1-gridSoftness*.9;
   face(pts,(row+col)%2?'#d9b9621c':'#06162525');
   c.strokeStyle='#08131fd9';c.lineWidth=4;c.stroke();
   c.strokeStyle=row>=4?'#f4d789e6':'#d3eaf5de';c.lineWidth=1.8;c.stroke();
  }c.globalAlpha=1;
  if(!window.ARENA_EMBLEM_TRANSITION)emblem();c.restore();
  for(const side of [-1,1]){
   line([side*287,-222,13],[side*287,221,13],'#a57e3b',2);
   for(const y of [-199,-58,94,219]){roundedBox(side*287-6,y-10,16,12,20,3,5,['#c0a557','#54442e','#746139']);line([side*287-2,y-5,17],[side*287-2,y+5,17],'#c9e7edaa',1)}
  }
  for(const x of [-260,260])for(const y of [-251,251])roundedBox(x-11,y-9,15,22,18,4,5,['#d1b46a','#63512f','#8b7244']);
 };
 bench=function(){if(!ready){originalBench();return}
  // Nine metal docking pads with brass edges and inset numbers.
  for(let i=0;i<9;i++){
   const x=-298+i*66,z=11;
   roundedBox(x,317,z,61,46,7,10,['#a28a4d','#26313e','#67583c']);
   roundedBox(x+3,320,z+1,55,39,5,3,['#354451','#26313d','#495361']);
   surface(x+3,320,z+1.5,55,39,5,metalReady?[.18+(i%3)*.05,.2+Math.floor(i/3)*.05,.32,.32]:[.32+(i%3)*.06,.33+Math.floor(i/3)*.06,.075,.075],1,metalReady?metal:rock);
   // A restrained warm edge and distinct small chips instead of repeated orange Y marks.
   line([x+8,359,z+2],[x+52,359,z+2],'#dec36f',2);
   for(const dx of [8,52]){const p=point(x+dx,325,z+2);c.save();c.fillStyle='#cbb77f';c.beginPath();c.arc(p.x,p.y,1.4*p.s,0,Math.PI*2);c.fill();c.restore()}
   const p=point(x+30,342,z+2);c.save();c.translate(p.x,p.y);c.scale(1,.65);c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#1e1b23';c.fillText(i+1,0,5*p.s);c.fillStyle='#ead0aa';c.fillText(i+1,0,4*p.s);c.restore();
  }
  const p=point(0,383,-3);c.save();c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#e6bf91';c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);c.restore();
 };
 atmosphere=function(){beforeAtmosphere();if(!config.decor||!config.elements)return;const t=reducedMotion?0:time;
  for(const side of [-1,1])for(const [i,y]of [-199,-58,94,219].entries()){
   const p=point(side*287,y,19),alpha=reducedMotion?.2:.12+.13*(.5+.5*Math.sin(t*1.35+i*.9+side)),r=12*p.s,g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(161,216,239,'+alpha+')');g.addColorStop(1,'#9dd8ef00');c.save();c.fillStyle=g;c.fillRect(p.x-r,p.y-r,r*2,r*2);c.restore();
  }
 };
})();

// prototypes/zapdos-arena/thunderstorm.js
/* Irregular distant lightning, wet-ground reflections and delayed thunder. */
(()=>{
 const before=atmosphere,voices=new Set();let enabled=true,nextStrike=2.8,event=null,seed=1,lastTime=0,noiseBuffer=null,crackBuffer=null,rainSource=null;
 const row=document.createElement('label');row.className='row';row.innerHTML='Relâmpagos e trovões <input type="checkbox" checked>';document.querySelector('.controls h2').after(row);
 row.querySelector('input').onchange=e=>{enabled=e.target.checked;if(!enabled)event=null};
 function silence(){for(const voice of voices)voice.volume.gain.setTargetAtTime(0,voice.ctx.currentTime,.025)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)silence()});
 $('reset').addEventListener('click',()=>{enabled=true;row.querySelector('input').checked=true;event=null;nextStrike=time+4;silence()});
 function stormSound(strength,crack=false){
  if(!sound||!audio||paused||document.hidden||audio.ctx.state!=='running')return;
  const ctx=audio.ctx;
  if(!noiseBuffer){noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*3.8,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);let low=0,peak=0;for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.085)/1.085;const swell=.65+.2*Math.sin(i/ctx.sampleRate*8)+.15*Math.sin(i/ctx.sampleRate*19);data[i]=low*swell;peak=Math.max(peak,Math.abs(data[i]))}for(let i=0;i<data.length;i++)data[i]=data[i]/Math.max(.01,peak)*.85}
  if(!crackBuffer){crackBuffer=ctx.createBuffer(1,ctx.sampleRate*.32,ctx.sampleRate);const data=crackBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/ctx.sampleRate*11)}
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),envelope=ctx.createGain(),volume=ctx.createGain(),now=ctx.currentTime;
  const duration=crack?.32:3.8;src.buffer=crack?crackBuffer:noiseBuffer;src.playbackRate.value=crack?1:.85+strength*.15;filter.type='lowpass';filter.frequency.value=crack?2600:650+strength*420;filter.Q.value=.35;
  envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(crack?.48+strength*.22:.65+strength*.3,now+(crack?.004:.065));envelope.gain.exponentialRampToValueAtTime(.001,now+duration);
  volume.gain.value=Math.sqrt(config.volume/100)*.8;src.connect(filter);filter.connect(envelope);envelope.connect(volume);volume.connect(audio.gain);
  const voice={src,ctx,volume};voices.add(voice);src.onended=()=>{voices.delete(voice);src.disconnect();filter.disconnect();envelope.disconnect();volume.disconnect()};src.start();src.stop(now+duration+.1);
 }
 function rainAudio(){
  if(!audio||!sound||audio.ctx.state!=='running')return;
  if(!rainSource){const ctx=audio.ctx,buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.5;const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=buffer;src.loop=true;filter.type='bandpass';filter.frequency.value=2700;filter.Q.value=.45;gain.gain.value=0;src.connect(filter);filter.connect(gain);gain.connect(audio.rainBus);src.start();rainSource={gain,ctx}}
  rainSource.gain.gain.setTargetAtTime(config.elements&&!paused&&!document.hidden?config.energy/100*1.15:0,rainSource.ctx.currentTime,.2);
 }
 function makeStrike(t,power){
  const side=seed%2?1:-1,target=point(side*(side<0?490:443),side<0?-182:-220,72),origin={x:target.x+side*(76+random(seed+41)*120),y:-28};
  const nodes=[origin];for(let i=1;i<=12;i++){const k=i/12;nodes.push({x:origin.x+(target.x-origin.x)*k+(random(seed*71+i)-.5)*37*(1-k*.7),y:origin.y+(target.y-origin.y)*k})}
  const result={start:t,delay:.8+random(seed+21)*1.5,strength:.65+random(seed+10)*.35,side,nodes,heard:false,seed};
  seed++;nextStrike=t+(7+random(seed+52)*9)/(Math.max(.3,power)*.6+.4);return result;
 }
 function lightning(e,age,power){
  if(reducedMotion||age>1.1)return;
  // Stronger cloud illumination with a soft decay, rather than an abrupt white blink.
  const attack=Math.exp(-age*7),after=age>.23?.18*Math.exp(-(age-.23)*5):0,intensity=(attack+after)*e.strength*power;
  if(intensity<.012)return;
  const end=e.nodes.at(-1),radius=W*.6,g=c.createRadialGradient(end.x,end.y,0,end.x,end.y,radius);g.addColorStop(0,'rgba(187,222,247,'+(intensity*.29)+')');g.addColorStop(.55,'rgba(163,200,228,'+(intensity*.13)+')');g.addColorStop(1,'#a9d0ee00');c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(end.x-radius,end.y-radius,radius*2,radius*2);const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'rgba(190,221,242,'+(intensity*.1)+')');sky.addColorStop(1,'#afcde600');c.fillStyle=sky;c.fillRect(0,0,W,H);c.restore();
  if(age<.24){
   c.save();c.globalAlpha=Math.max(0,1-age/.24)*power*.95;c.lineJoin='round';c.lineCap='round';c.beginPath();e.nodes.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle='#739cbe';c.lineWidth=5;c.stroke();c.strokeStyle='#e8f4ff';c.lineWidth=1.8;c.stroke();
   const split=e.nodes[5],branch=e.nodes[8];c.globalAlpha*=.5;c.beginPath();c.moveTo(split.x,split.y);c.lineTo(split.x-e.side*29,split.y+9);c.lineTo(branch.x-e.side*65,branch.y+9);c.stroke();c.restore();
  }
  // Broken reflections follow puddle-like streaks rather than an opaque glow disk.
  for(let i=0;i<6;i++){
   const p=point(e.side*(399+random(i+e.seed)*138),-175+i*62,-20);c.save();c.globalAlpha=intensity*.26;c.strokeStyle='#d4eaf5';c.lineWidth=(2+random(i)*2)*p.s;c.beginPath();c.moveTo(p.x-13*p.s,p.y);c.quadraticCurveTo(p.x,p.y+2*p.s,p.x+(10+random(i+5)*19)*p.s,p.y-p.s);c.stroke();c.restore();
  }
 }
 atmosphere=function(){before();const t=time,power=config.energy/100;
  rainAudio();
  for(const voice of voices)voice.volume.gain.setTargetAtTime(sound&&enabled&&config.elements&&power>.05&&!paused&&!document.hidden?Math.sqrt(config.volume/100)*.8:0,voice.ctx.currentTime,.04);
  if(t<lastTime){event=null;nextStrike=t+4}lastTime=t;
  if(!enabled||!config.elements||power<=.05)return;
  if(t>=nextStrike){event=makeStrike(t,power);stormSound(event.strength*power,true)}
  if(!event)return;const age=t-event.start;lightning(event,age,power);
  if(!event.heard&&age>=event.delay){event.heard=true;stormSound(event.strength*power)}
  if(age>4.5)event=null;
 };
})();

// prototypes/zapdos-arena/zapdos.js
/* Scenic Zapdos: the prototype's phase and clock drive flight and landing. */
(()=>{
 const previousAtmosphere=atmosphere,previousDecor=decor;
 const sheets={},perch=new Image();let perchReady=false,enabled=true;
 perch.onload=()=>{perchReady=true;sceneKey=''};perch.src='assets/legendary-art/zapdos/substation-perch-v1.webp';
 for(const name of ['Walk','Idle']){const image=new Image();image.src='assets/pmd/sprite/0145/'+name+'-Anim.png';sheets[name]=image}
 const row=document.createElement('label');row.className='row';row.innerHTML='Zapdos no cenário <input type="checkbox" checked>';
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
  const landed=state==='perched',name=landed?'Idle':'Walk',image=sheets[name],a=window.VOLT_ANIMATION?.['0145']?.[name];if(!a||!image.complete||!image.naturalWidth)return;
  const dx=current.x-lastPos.x,dy=current.y-lastPos.y;lastPos={...current};
  if(Math.abs(dx)+Math.abs(dy)>.01)heading=((2-Math.round(Math.atan2(dy,dx)*4/Math.PI))%8+8)%8;
  const direction=landed||reducedMotion?0:heading;
  const rows=Math.max(1,Math.round(image.naturalHeight/a.fh)),r=Math.min(rows-1,direction);
  const total=a.dur.reduce((s,n)=>s+n,0);let tick=reducedMotion?0:(t*40)%total,frame=0;
  while(frame<a.dur.length-1&&tick>=a.dur[frame])tick-=a.dur[frame++];
  const p=point(current.x,current.y,current.z),shadow=point(current.x,current.y,landed?25:-15),scale=p.s*size;
  c.save();c.translate(shadow.x,shadow.y);c.scale(1,.3);const shadowRadius=(29+Math.max(0,size-normalSize)*16)*shadow.s,shade=c.createRadialGradient(0,0,0,0,0,shadowRadius);shade.addColorStop(0,landed?'#110d182e':'#110d181a');shade.addColorStop(1,'#110d1800');c.fillStyle=shade;c.fillRect(-shadowRadius,-shadowRadius,shadowRadius*2,shadowRadius*2);c.restore();
  if(config.elements&&!reducedMotion&&!landed){
   for(let i=0;i<10;i++){const lag=(i+1)*.1,q=point(current.x-dx*70*lag,current.y-dy*70*lag,current.z-lag*9);c.fillStyle='rgba(181,226,255,'+(.2*(1-i/10))+')';c.fillRect(q.x-i*2,q.y+Math.sin(t*3+i)*6,2*p.s,2*p.s)}
  }
  const bounds=a.bounds,bottom=bounds?.fb?.[r]?.[frame]??a.fh-1; p.y=Math.max(20+(bottom+1)*scale,Math.min(780-(a.fh-bottom-1)*scale,p.y));p.x=Math.max(24+a.fw*scale/2,Math.min(1256-a.fw*scale/2,p.x));
  c.save();c.imageSmoothingEnabled=false;c.drawImage(image,frame*a.fw,r*a.fh,a.fw,a.fh,p.x-a.fw*scale/2,p.y-(bottom+1)*scale,a.fw*scale,a.fh*scale);c.restore();
  if(state==='perched'&&config.elements&&!reducedMotion&&elapsed<4.1){const k=Math.min(1,(elapsed-3.2)/.9);if(k>=0){c.save();c.globalAlpha=(1-k)*.4;c.strokeStyle='#e2f6ff';c.lineWidth=p.s;c.beginPath();c.ellipse(p.x,p.y,(14+k*58)*p.s,(5+k*18)*p.s,0,0,Math.PI*2);c.stroke();c.restore()}}
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
