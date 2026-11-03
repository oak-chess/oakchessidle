// Adaptação visual do protótipo aprovado, sem regras de combate.
window.createBrockArena=function(){
let c,W=1280,H=800,time=0,paused=false,gridSoftness=0,angled=true,mode='scene',benchMode=false,sceneHeightOffset=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const config={dust:50,volume:15,light:100,decor:true,crystals:false,quality:'high'};
let audio=null,sound=false,unlocked=false,lastGrid=0;
const effects=document.createElement('canvas');effects.id='brockAtmosphere';effects.width=2560;effects.height=800;effects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none;z-index:1';
document.getElementById('world').appendChild(effects);
const backEffects=document.createElement('canvas');backEffects.width=2560;backEffects.height=800;backEffects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none';
document.getElementById('world').insertBefore(backEffects,document.getElementById('arenaView'));
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


function rock(x,y,z,size,height,tone=0){
// Três contornos assimétricos criam ombros e um topo largo, sem ápice de pirâmide.
const n=9,seed=x*.31+y*.19+tone*7,rand=i=>{const v=Math.sin(seed+i*91.17)*43758.54;return v-Math.floor(v)},h=Math.min(height,size*1.35);
const base=[],shoulder=[],cap=[];
for(let i=0;i<n;i++){
 const a=i*Math.PI*2/n+(rand(i)-.5)*.13,r=size*(.8+rand(i+12)*.22);
 base.push([x+Math.cos(a)*r,y+Math.sin(a)*r*.72,z]);
 shoulder.push([x+Math.cos(a)*r*(.83+rand(i+24)*.15),y+Math.sin(a)*r*.68,z+h*(.4+rand(i+30)*.17)]);
 cap.push([x-size*.12+Math.cos(a)*r*(.47+rand(i+44)*.19),y-size*.07+Math.sin(a)*r*.43,z+h*(.83+rand(i+53)*.15)]);
}
ellipse(x+size*.12,y+size*.12,z-1,size*1.12,size*.42,'#171d1a50');
const faces=[];
for(let i=0;i<n;i++){const j=(i+1)%n;faces.push({pts:[base[i],base[j],shoulder[j],shoulder[i]],index:i,upper:false});faces.push({pts:[shoulder[i],shoulder[j],cap[j],cap[i]],index:i,upper:true})}
faces.sort((a,b)=>a.pts.reduce((s,p)=>s+p[1],0)-b.pts.reduce((s,p)=>s+p[1],0));
const blend=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
for(const f of faces){
 const shade=30+Math.round((Math.cos(f.index*Math.PI*2/n+2.3)+1)*9)+(f.upper?9:0)+tone%3;
 face(f.pts,'hsl(43,9%,'+shade+'%)','#242c2528');
 c.save();clipFace(f.pts);
 if(config.quality==='high')for(let k=0;k<10;k++){const p=blend(blend(f.pts[0],f.pts[1],rand(k+65)),blend(f.pts[3],f.pts[2],rand(k+65)),rand(k+90));ellipse(...p,.6+rand(k+120)*1.3,.45,k%2?'#ddd8bd25':'#202a2530')}
 // Rachaduras ramificadas e veios curtos em cada face.
 const a=blend(f.pts[0],f.pts[3],.33),b=blend(f.pts[1],f.pts[2],.48),mid=blend(a,b,.5);mid[2]-=h*.035;
 line(a,mid,'#26302955',1);line(mid,b,'#26302955',1);line(mid,blend(f.pts[2],f.pts[3],.55),'#26302940',.8);
 const edge=blend(f.pts[3],f.pts[2],.7);line(f.pts[3],edge,'#e1dbc03d',1);c.restore();
}
face(cap,'#969584','#dad2b13b');
line(cap[1],blend(cap[3],cap[6],.5),'#424d4166',1.2);
// Lascas na base ajudam a assentar os blocos no solo.
for(let i=0;i<3;i++){const px=x+(rand(i+151)-.5)*size*1.9,py=y+size*.48+rand(i+160)*size*.2;face([[px-5,py,z],[px+7,py+2,z],[px+3,py-4,z+5],[px-3,py-5,z+3]],'#797c6a','#b7b09133')}
}
function crystal(x,y,z,size){
const glow=.6+Math.sin(time*1.3+x)*.15;
for(let i=0;i<3;i++){const px=x+(i-1)*size*.65,py=y+(i%2)*8,h=size*(i===1?2.7:1.7);face([[px-size*.35,py,z],[px,py-size*.2,z+h],[px+size*.35,py,z],[px,py+size*.25,z-size*.1]],i%2?'#cfb670':'#e8d6a0');face([[px,py-size*.2,z+h],[px+size*.35,py,z],[px,py+size*.25,z-size*.1]],'#9a845a')}
if(config.quality==='high'){const p=point(x,y,z+size),g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,size*3*p.s);g.addColorStop(0,'rgba(250,207,109,'+(glow*.2)+')');g.addColorStop(1,'#f9d27900');c.fillStyle=g;c.fillRect(p.x-size*3*p.s,p.y-size*3*p.s,size*6*p.s,size*6*p.s)}
}
function quarry(){
const bg=c.createRadialGradient(W*.5,H*.38,0,W*.5,H*.5,Math.max(W,H)*.8);bg.addColorStop(0,'#80704b');bg.addColorStop(.5,'#494334');bg.addColorStop(1,'#201f1b');c.fillStyle=bg;c.fillRect(-640,0,2560,H);
// Grãos fixos no solo, sem cintilação aleatória entre quadros.
for(let i=0;i<(config.quality==='high'?190:75);i++){const x=-1300+(i*173)%2600,y=-850+(i*239)%1700;ellipse(x,y,-48,2+i%4,1,'#d3bb7933')}
if(!config.decor)return;
for(let i=0;i<17;i++){const x=-1050+i*131,y=-510-Math.sin(i*2)*70;rock(x,y,-50,82+i%3*23,90+i%4*45,i%7)}
for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(485+(i%2)*95),y=-280+i*180;rock(x,y,-45,46+i%3*18,45+i%3*20,i%7);if(config.crystals&&i%2===0)crystal(x-side*40,y+18,-38,15)}
// Trilhos de mina, lanternas e pequenos agrupamentos de pedras.
for(let i=0;i<12;i++){const x=650+i*23,y=-280+i*35;line([x-32,y,-41],[x+32,y-20,-41],'#65533b',5)}
line([618,-290,-38],[885,125,-38],'#a29a7b',3);line([669,-309,-38],[936,106,-38],'#a29a7b',3);
for(const x of [-455,455]){line([x,200,-30],[x,200,48],'#393d37',5);roundedBox(x-12,190,64,24,20,4,23,['#e1b965','#b78b42','#6e5635']);const p=point(x,200,54),g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,50*p.s);g.addColorStop(0,'#ffd27c55');g.addColorStop(1,'#ffd27c00');c.fillStyle=g;c.fillRect(p.x-50*p.s,p.y-50*p.s,100*p.s,100*p.s)}
}
function arena(){
roundedBox(-375,-345,-9,750,690,95,30,['#625f53','#393d39','#303732']);
c.save();clipFace(roundedPoints(-375,-345,-8,750,690,95));
// Rocha contínua escavada: veios e cascalho substituem os azulejos regulares.
for(let i=0;i<90;i++){const x=-365+(i*137)%730,y=-335+(i*211)%670,r=9+i%17;face([[x-r,y,-8],[x-r*.4,y-r*.5,-8],[x+r,y-r*.2,-8],[x+r*.6,y+r*.6,-8]],i%2?'#a28b6140':'#373b3338');line([x-r,y,-7],[x+r*.6,y+r*.6,-7],'#d8bf8640',1)}c.restore();
// Fundação mineral, sem a borda contínua de piscina.
roundedBox(-315,-285,-2,630,570,65,14,['#79745a','#575442','#414638']);
for(const side of [-1,1])for(let i=0;i<9;i++){const y=-255+i*61;roundedBox(side<0?-319:287,y,3+(i%3),32,55,7,16,['#8c886d','#555744','#404537']);line([side*303,y+12,5],[side*294,y+24,5],'#c2b78666',1)}
roundedBox(-286,-273,6,572,546,44,24,['#8d8058','#6e6046','#514b39']);
roundedBox(-282,-269,8,564,538,40,20,['#97805b','#625742','#494437']);
c.save();clipFace(roundedPoints(-282,-269,10,564,538,40));
const radius=42,hw=Math.sqrt(3)*radius,gw=7.5*hw;
for(let row=0;row<8;row++)for(let col=0;col<7;col++){
const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*1.5*radius+row*1.5*radius;
const pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,10]});
c.save();c.globalAlpha=1-gridSoftness*.85;face(pts,row>=4?((row+col)%2?'#b69d72':'#a68e68'):((row+col)%2?'#92866c':'#9e9073'));c.restore();face(pts,'#0000','rgba(51,49,39,'+(.62-gridSoftness*.55)+')');
// Fissuras e pequenas lascas preservam a leitura mineral durante o combate.
if((row+col)%3===0){line([x-13,y-7,11],[x-5,y+1,11],'#655d444d',1);line([x-5,y+1,11],[x-8,y+9,11],'#655d444d',1)}
}
// Placas irregulares, terra e fraturas na base rochosa.
for(let i=0;i<38;i++){
 const x=-265+(i*113)%530,y=-250+(i*173)%500,r=12+i%22;
 const patch=Array.from({length:7},(_,j)=>{const a=j*Math.PI*2/7;return[x+Math.cos(a)*r*(.8+.2*Math.sin(j+i)),y+Math.sin(a)*r*.6,11]});
 face(patch,i%3?'#524a3928':'#d3bb8230');
 if(i%3===0){line([x-r,y-8,12],[x-3,y+2,12],'#413d32a0',1.5);line([x-3,y+2,12],[x+r,y+9,12],'#413d3280',1);line([x-3,y+2,12],[x+1,y+18,12],'#413d3270',1);line([x-r,y-10,12],[x-3,y,12],'#d2bf8c66',1)}
}
for(let i=0;i<(config.quality==='high'?240:80);i++){const x=-270+(i*89)%540,y=-258+(i*131)%516;ellipse(x,y,12,1+i%3,.6,i%2?'#e1c59040':'#393b324d')}
const seal=Array.from({length:8},(_,i)=>{const a=Math.PI/8+i*Math.PI/4;return[Math.cos(a)*61,Math.sin(a)*61,12]});face(seal,'#6f7258','#d3c494');face([[-36,-18,13],[-7,-42,13],[31,-28,13],[41,9,13],[8,38,13],[-31,24,13]],'#a6a17d','#d6cba5');face([[-7,-42,13],[31,-28,13],[7,1,13],[-36,-18,13]],'#beb78c');face([[7,1,13],[31,-28,13],[41,9,13],[8,38,13]],'#86876b');c.restore();
}
function boulderBadge(x,y,z,r){const pts=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return[x+Math.cos(a)*r,y,z+Math.sin(a)*r]});face(pts,'#969984','#e2dcb0');face([[x-r*.6,y-1,z],[x-r*.25,y-1,z+r*.5],[x+r*.4,y-1,z+r*.55],[x+r*.63,y-1,z-r*.15],[x+r*.1,y-1,z-r*.5]],'#666f63','#b8b99b')}
function gymDecor(){if(!config.decor)return;
for(const x of [-343,343]){roundedBox(x-25,171,22,50,48,10,30,['#848777','#50594e','#363f39']);boulderBadge(x,195,64,25)}
for(const side of [-1,1])for(let i=0;i<3;i++){rock(side*340,-230+i*100,0,24,26+i*6,i);if(config.crystals&&i===1)crystal(side*340,-115,3,12)}
roundedBox(-100,-337,42,200,29,9,42,['#8d917b','#4d5a4c','#394639']);boulderBadge(0,-306,63,29);
for(const x of [-210,210]){line([x,-310,0],[x,-310,85],'#515749',5);face([[x,-310,85],[x+35,-310,83],[x+35,-310,28],[x+17,-310,38],[x,-310,28]],'#b1955d','#d6bd83');boulderBadge(x+17,-309,62,9)}
}
function bench(){
roundedBox(-315,308,-5,630,94,18,24,['#41413a','#292d29','#202622']);
// Nove lajes de basalto apoiadas em trilhos de ferro envelhecido.
for(const y of [320,363])roundedBox(-308,y,3,616,8,2,8,['#71604a','#403c33','#30322b']);
for(let i=0;i<9;i++){
 const x=-298+i*66;
 roundedBox(x,317,12,61,46,6,12,[i%2?'#77786b':'#858577','#4a4f44','#373e35']);
 line([x+5,322,13],[x+24,328,13],'#c5c0a355',1);line([x+24,328,13],[x+20,340,13],'#2b342c99',1);line([x+24,328,13],[x+43,333,13],'#2b342c88',1);
 for(const dx of [4,55]){roundedBox(x+dx,318,14,3,40,1,3,['#80694e','#4c4437','#373a30']);ellipse(x+dx+1.5,323,15,1.3,1,'#c1b28a')}
 // Insígnia gravada na pedra acima do número.
 face([[x+24,324,14],[x+31,321,14],[x+38,326,14],[x+35,334,14],[x+26,334,14]],'#b3b098','#444b3c');
 const p=point(x+30,353,15);c.save();c.translate(p.x,p.y);c.scale(1,Math.cos(38*Math.PI/180));c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#ece0b8';c.fillText(i+1,0,3*p.s);c.restore();
}
// Degrau frontal fraturado, sem acabamento de arquibancada.
for(let i=0;i<6;i++)roundedBox(-300+i*100,374,-2,97,20,4,12,['#76796a','#4b5144','#343e33']);
const p=point(0,409,-12);c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#d7c99d';c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);
}

// Nuvens de terra rente ao piso, em vez de pontos luminosos no ar.
const dustClouds=Array.from({length:23},(_,i)=>({
 seed:i*2.399,x:-670+(i*179)%1340,y:-320+(i*137)%730,
 width:95+(i*31)%90,speed:13+(i%4)*5
}));
function dust(){
 if(!config.dust)return;
 const amount=config.dust/100,detail=config.quality==='high';
 c.save();
 for(const cloud of dustClouds){
  const age=(time*.085+cloud.seed)%1,fade=.3+.7*Math.sin(age*Math.PI),
   x=cloud.x+(age-.5)*340,y=cloud.y+Math.sin(time*.4+cloud.seed)*20;
  // Somente as nuvens do campo sobem ao nível do tabuleiro.
  const onBoard=Math.abs(x)<275&&Math.abs(y)<260,z=onBoard?14:-33;
  const p=point(x,y,z),radius=cloud.width*p.s;
  c.save();c.translate(p.x,p.y-6*p.s);c.scale(1,.38);
  // Vários lóbulos sobrepostos dão volume irregular à poeira arrastada.
  for(let j=0;j<(detail?5:3);j++){
   const cx=(j-2)*radius*.37,cy=Math.sin(j*2+cloud.seed)*radius*.2,
    r=radius*(.62+.11*Math.sin(j+cloud.seed));
   const fog=c.createRadialGradient(cx,cy,0,cx,cy,r);
   fog.addColorStop(0,'rgba(211,175,117,'+(amount*fade*.36)+')');
   fog.addColorStop(.45,'rgba(190,150,91,'+(amount*fade*.22)+')');
   fog.addColorStop(1,'rgba(156,125,82,0)');
   c.fillStyle=fog;c.fillRect(cx-r,cy-r,r*2,r*2);
  }
  c.restore();
 }
 // Grãos pequenos junto ao solo, sem brilho ou aparência de neve.
 const grains=Math.round((detail?220:80)*amount);
 for(let i=0;i<grains;i++){
  const x=-710+((i*113+time*(35+i%13))%1420),y=-350+(i*179)%760,
   onBoard=Math.abs(x)<275&&Math.abs(y)<260,z=(onBoard?15:-33)+Math.abs(Math.sin(time*2+i))*14,
   p=point(x,y,z),length=(2+i%4)*p.s;
  c.strokeStyle=i%3?'#d9b77b99':'#66513988';c.lineWidth=Math.max(.9,p.s);
  c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+length,p.y-.4*p.s);c.stroke();
 }
 c.restore();
}

function unlockAudio(){unlocked=true}
document.addEventListener('pointerdown',unlockAudio,{once:true});
document.addEventListener('keydown',unlockAudio,{once:true});
function ambientAudio(enabled,volume){
 if(enabled&&unlocked&&!audio){
  try{const ctx=new AudioContext(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),data=buffer.getChannelData(0);let low=0;
   for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.03)/1.03;data[i]=low*3}
   const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;filter.type='lowpass';filter.frequency.value=420;gain.gain.value=0;noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();audio={ctx,gain};
  }catch(e){unlocked=false}
 }
 sound=enabled&&!!audio;
 if(audio){audio.gain.gain.setTargetAtTime(sound?volume*.022:0,audio.ctx.currentTime,.25);if(sound&&audio.ctx.state==='suspended'&&unlocked)audio.ctx.resume().catch(()=>{})}
}

return{
 paint(g,layer,isAngled){
  c=g;angled=isAngled;
  if(layer!=='arena'){mode='scene';g.fillStyle='#28271e';g.fillRect(-640,0,2560,800);quarry();}
  if(layer!=='scene'){mode='field';arena();gymDecor();benchMode=true;bench();benchMode=false}
 },
 tick(dt,state){
  effects.style.display=state.active?'block':'none';
  backEffects.style.display=state.active?'block':'none';
  ambientAudio(state.active&&!state.paused&&!state.mute&&!document.hidden,state.sfx*1.6);
  if(!state.active)return false;
  angled=state.angled;paused=state.paused;config.quality=state.quality;
  if(!paused)time+=dt;
  gridSoftness+=((state.combat?1:0)-gridSoftness)*(1-Math.exp(-dt*5));
  const grid=Math.round(gridSoftness*10),dirty=grid!==lastGrid;lastGrid=grid;
  c=backEffects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';sceneHeightOffset=10;
  if(!document.hidden){}
  sceneHeightOffset=0;
  c=effects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';
  if(!document.hidden){dust();}
  return dirty;
 }
};
};