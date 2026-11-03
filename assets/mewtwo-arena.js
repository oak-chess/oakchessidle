// Adaptação visual do protótipo aprovado, sem regras de combate.
window.createMewtwoArena=function(){
let c,W=1280,H=800,time=0,paused=false,gridSoftness=0,angled=true,mode='scene',benchMode=false,sceneHeightOffset=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const config={energy:65,volume:25,light:85,decor:true,aura:true,levitation:true,quality:'high'};
let audio=null,sound=false,unlocked=false,lastGrid=0;
const effects=document.createElement('canvas');effects.id='mewtwoAtmosphere';effects.width=2560;effects.height=800;effects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none;z-index:1';
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


function random(seed){const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n)}
// Interpretação artística de um buraco negro, vista por trás da arena.
function cosmicBackground(){
const cx=W*.76,cy=H*.27,r=Math.min(H*.2,W*.125);
const bg=c.createRadialGradient(cx,cy,r*.5,W*.6,H*.4,Math.max(W,H));bg.addColorStop(0,'#34203f');bg.addColorStop(.35,'#17142d');bg.addColorStop(1,'#030815');c.fillStyle=bg;c.fillRect(-640,0,2560,H);
// Nebulosas difusas e estrelas com arcos junto à região de lente gravitacional.
for(let i=0;i<7;i++){const x=random(i+8)*W,y=random(i+31)*H,rr=W*(.14+random(i+44)*.12),g=c.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,i%2?'#76519c16':'#3757a51c');g.addColorStop(1,'#40356a00');c.fillStyle=g;c.fillRect(x-rr,y-rr,rr*2,rr*2)}
for(let i=0;i<(config.quality==='high'?840:340);i++){
 const x=-640+random(i+7)*2560,y=random(i+411)*H,dx=x-cx,dy=y-cy,dist=Math.hypot(dx,dy),size=.4+random(i+73)*1.1;
 if(dist<r*1.05)continue;
 c.strokeStyle='rgba(206,207,244,'+(.15+random(i+91)*.55)+')';c.fillStyle=c.strokeStyle;
 if(dist<r*2.3){const a=Math.atan2(dy,dx);c.beginPath();c.arc(cx,cy,dist,a-.012,a+.012);c.lineWidth=size;c.stroke()}else c.fillRect(x,y,size,size);

}
const halo=c.createRadialGradient(cx,cy,r*.88,cx,cy,r*2.1);halo.addColorStop(0,'#f6ce9540');halo.addColorStop(.23,'#c07ca72a');halo.addColorStop(.55,'#7764b917');halo.addColorStop(1,'#7161ab00');c.fillStyle=halo;c.fillRect(cx-r*2.1,cy-r*2.1,r*4.2,r*4.2);
c.save();c.translate(cx,cy);c.rotate(-.13);
// Disco de acreção: faixas amplas e filamentos quentes com brilho desigual.
for(let i=20;i>=0;i--){const spread=i/20;c.beginPath();c.ellipse(0,0,r*(2.8+spread*.5),r*(.32+spread*.18),0,0,Math.PI*2);c.strokeStyle='rgba(201,139,164,'+(.012+(1-spread)*.016)+')';c.lineWidth=(5+spread*8);c.stroke()}
for(let i=0;i<38;i++){const f=i/38;c.beginPath();c.ellipse(0,0,r*(1.17+f*1.8),r*(.12+f*.3),0,0,Math.PI*2);c.strokeStyle='hsla('+(27-f*27)+','+(70-f*20)+'%,'+(83-f*35)+'%,'+(.3-f*.22)+')';c.lineWidth=Math.max(.7,r*.008);c.stroke()}
c.restore();
// Sombra central e anel luminoso curvado acima do disco.
c.fillStyle='#02030a';c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
for(let i=12;i>=0;i--){c.beginPath();c.arc(cx,cy,r*(1.01+i*.009),0,Math.PI*2);c.strokeStyle='rgba(245,204,158,'+(.025+(12-i)*.002)+')';c.lineWidth=2+i*.35;c.stroke()}
c.beginPath();c.arc(cx,cy,r*1.025,Math.PI*.96,Math.PI*2.05);c.strokeStyle='#f9e3b9b0';c.lineWidth=Math.max(1,r*.012);c.stroke();
// A frente do disco passa sobre a parte inferior da sombra.
c.save();c.translate(cx,cy);c.rotate(-.13);
for(let i=0;i<22;i++){const f=i/22;c.beginPath();c.ellipse(0,r*.09,r*(1.02+f*1.8),r*(.13+f*.23),0,.04,Math.PI-.04);c.strokeStyle='rgba(250,209,158,'+(.23-f*.19)+')';c.lineWidth=1.1;c.stroke()}
c.restore();
planets();richHorizon(cx,cy,r);
}

function planets(){
function planet(x,y,r,colors,ringed){
 if(ringed){c.save();c.translate(x,y);c.rotate(-.35);for(let i=0;i<17;i++){c.strokeStyle='rgba(185,170,211,'+(.18+i%3*.05)+')';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,r*(1.5+i*.025),r*(.35+i*.012),0,Math.PI,Math.PI*2);c.stroke()}c.restore()}
 c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
 const g=c.createRadialGradient(x-r*.4,y-r*.4,r*.05,x+r*.5,y+r*.3,r*1.45);g.addColorStop(0,colors[0]);g.addColorStop(.55,colors[1]);g.addColorStop(1,'#070d21');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
 for(let i=0;i<24;i++){const yy=y-r+i*r/12;c.beginPath();for(let j=0;j<=30;j++){const xx=x-r+j*r/15,py=yy+Math.sin(j*.3+i*2)*r*.045;j?c.lineTo(xx,py):c.moveTo(xx,py)}c.strokeStyle=i%3?'#ebe3db19':'#18214235';c.lineWidth=r*(.025+random(i+52)*.035);c.stroke()}
 for(let i=0;i<19;i++){const a=random(i+92)*Math.PI*2,rr=Math.sqrt(random(i+33))*r*.85;c.fillStyle='#b6c5e323';c.beginPath();c.ellipse(x+Math.cos(a)*rr,y+Math.sin(a)*rr,r*.07,r*.027,.3,0,Math.PI*2);c.fill()}
 const shadow=c.createLinearGradient(x-r,y-r,x+r,y+r);shadow.addColorStop(0,'#050b1a00');shadow.addColorStop(.45,'#050b1a10');shadow.addColorStop(1,'#030716e8');c.fillStyle=shadow;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
 c.beginPath();c.arc(x,y,r+.7,Math.PI*.8,Math.PI*1.9);c.strokeStyle='#a7bae86b';c.lineWidth=2;c.stroke();
 if(ringed){c.save();c.translate(x,y);c.rotate(-.35);for(let i=0;i<17;i++){c.strokeStyle='rgba(209,181,200,'+(.24+i%3*.06)+')';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,r*(1.5+i*.025),r*(.35+i*.012),0,0,Math.PI);c.stroke()}c.restore()}
}
planet(W*.215,H*.235,H*.082,['#b9c7e3','#5e739e'],true);
planet(W*.22,H*.67,H*.047,['#dba789','#835a78'],false);
}
function richHorizon(cx,cy,r){
c.save();c.translate(cx,cy);c.rotate(-.13);
// Brilho difuso atrás da lente e faixas densas no disco.
const fog=c.createRadialGradient(0,0,r*.7,0,0,r*2.8);fog.addColorStop(0,'#f7bf7d1a');fog.addColorStop(.45,'#db8b8625');fog.addColorStop(1,'#8754a300');c.fillStyle=fog;c.fillRect(-r*3,-r*3,r*6,r*6);
for(let i=48;i>=0;i--){const f=i/48;c.beginPath();c.ellipse(0,r*.04,r*(1.18+f*2.2),r*(.17+f*.32),0,0,Math.PI*2);c.strokeStyle='hsla('+(36-f*37)+',85%,'+(88-f*48)+'%,'+(.38-f*.29)+')';c.lineWidth=r*.025;c.stroke()}
// Halo distorcido ao redor da sombra.
for(let i=24;i>=0;i--){const f=i/24;c.beginPath();c.ellipse(0,-r*.03,r*(1.02+f*.27),r*(1.02+f*.16),0,Math.PI*.94,Math.PI*2.07);c.strokeStyle='hsla('+(38-f*18)+',90%,'+(94-f*32)+'%,'+(.4-f*.32)+')';c.lineWidth=r*.018;c.stroke()}
c.fillStyle='#01030a';c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();
c.beginPath();c.arc(0,0,r*1.01,0,Math.PI*2);c.strokeStyle='#ffe5b8aa';c.lineWidth=r*.009;c.stroke();
// Faixas turbulentas do disco passam diante da sombra central.
for(let i=0;i<60;i++){const f=i/60,ry=r*(.10+f*.25),rx=r*(1.03+f*2.2);c.beginPath();for(let j=0;j<=100;j++){const a=j*Math.PI/100,warp=Math.sin(a*9+i*.7)*r*.006,px=Math.cos(a)*rx,py=Math.sin(a)*ry+r*.075+warp;j?c.lineTo(px,py):c.moveTo(px,py)}c.strokeStyle='hsla('+(42-f*33)+',85%,'+(94-f*50)+'%,'+(.65-f*.52)+')';c.lineWidth=r*.016;c.stroke()}
for(let i=0;i<140;i++){const a=random(i+84)*Math.PI,f=random(i+101),rx=r*(1.15+f*1.8),ry=r*(.13+f*.28);c.beginPath();c.ellipse(0,r*.075,rx,ry,0,a,a+.025+random(i+70)*.04);c.strokeStyle=i%3?'#ffe8b975':'#eea97866';c.lineWidth=.7+random(i)*1.5;c.stroke()}
c.restore();
}

function stone(x,y,z,r,h,seed=0){
const base=[],top=[];for(let i=0;i<7;i++){const a=i*Math.PI*2/7,rr=r*(.82+random(i+seed)*.2);base.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.7,z]);top.push([x-r*.12+Math.cos(a)*rr*.6,y+Math.sin(a)*rr*.45,z+h*(.8+random(i+seed+9)*.2)])}
const faces=[];for(let i=0;i<7;i++)faces.push({pts:[base[i],base[(i+1)%7],top[(i+1)%7],top[i]],i});faces.sort((a,b)=>a.pts[0][1]-b.pts[0][1]);
for(const f of faces)face(f.pts,['#393448','#51465d','#62546d','#302d40','#443a52','#50435c','#352f45'][f.i]);face(top,'#70617c','#a395ad44');
line(top[1],[(x+top[4][0])/2,(y+top[4][1])/2,z+h*.85],'#29283d99',1);
}
function crystal(x,y,z,r){for(let i=0;i<3;i++){const px=x+(i-1)*r*.65,h=r*(i===1?3:1.9);face([[px-r*.3,y,z],[px,y-r*.1,z+h],[px+r*.3,y,z],[px,y+r*.3,z-2]],i%2?'#9670bc':'#c6a1df');face([[px,y-r*.1,z+h],[px+r*.3,y,z],[px,y+r*.3,z-2]],'#684f88')}}
function pool(x,y,rx,ry){const pts=mult=>Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,w=1+.08*Math.sin(a*5);return[x+Math.cos(a)*rx*mult*w,y+Math.sin(a)*ry*mult*w,-47]});face(pts(1.13),'#272d3d');face(pts(1),'#183f50','#6e79915a');for(let i=0;i<8;i++)line([x-rx*.7,y-ry*.6+i*ry*.17,-46],[x+rx*.6,y-ry*.65+i*ry*.17,-46],'#93a7c020',1)}
function cave(){cosmicBackground()}
function arena(){
roundedBox(-375,-345,-9,750,690,95,35,['#4e465d','#292c40','#22283b']);
c.save();clipFace(roundedPoints(-375,-345,-8,750,690,95));for(let i=0;i<95;i++){const x=-370+random(i+8)*740,y=-340+random(i+41)*680;face([[x-17,y,-7],[x-4,y-10,-7],[x+23,y+4,-7],[x+7,y+12,-7]],i%2?'#9682a124':'#101b3228')}
for(const side of [-1,1])for(let i=0;i<6;i++){const y=-250+i*100;line([side*344,y,-6],[side*329,y+32,-6],'#a680cf66',2);line([side*329,y+32,-6],[side*345,y+47,-6],'#7951a977',1)}c.restore();
roundedBox(-286,-273,6,572,546,44,25,['#9b8bac','#4c425c','#353449']);roundedBox(-282,-269,8,564,538,40,20,['#72637e','#443e56','#33334a']);
c.save();clipFace(roundedPoints(-282,-269,10,564,538,40));
const radius=42,hw=Math.sqrt(3)*radius,gw=7.5*hw;
for(let row=0;row<8;row++)for(let col=0;col<7;col++){
const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*1.5*radius+row*1.5*radius,pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,10]});
c.save();c.globalAlpha=1-gridSoftness*.88;face(pts,row>=4?((row+col)%2?'#8b7a9b':'#9584a5'):((row+col)%2?'#706785':'#7b6e8d'));c.restore();face(pts,'#0000','rgba(215,194,238,'+(.4-gridSoftness*.36)+')');
}
for(let i=0;i<28;i++){const x=-260+random(i+28)*520,y=-250+random(i+61)*500;line([x-12,y-7,11],[x,y,11],'#332e4677',1);line([x,y,11],[x+18,y+5,11],'#332e4677',1)}
const circle=(r,start=0,end=Math.PI*2)=>Array.from({length:49},(_,i)=>{const a=start+(end-start)*i/48;return[Math.cos(a)*r,Math.sin(a)*r,12]});
face(circle(59),'#e8dfee','#37344e');face([[0,0,12],...circle(58,Math.PI,Math.PI*2)],'#ae677e');face([[-58,-3,13],[58,-3,13],[58,3,13],[-58,3,13]],'#37344e');face(circle(59),'#0000','#37344e');face(circle(16),'#37344e');face(circle(11),'#e5dcee');face(circle(6),'#b3a3c7');c.restore();
if(config.decor){
for(const side of [-1,1])for(let i=0;i<3;i++){stone(side*338,-205+i*177,0,23,20+i*4,i);if(i===1)crystal(side*342,-90,2,13)}
// Patamar fraturado ao fundo, origem visual do campo psíquico.
roundedBox(-100,-340,9,200,54,17,25,['#867598','#49405c','#34334a']);
for(const x of [-70,70])crystal(x,-317,12,14);
}
}
function psychicDecor(){
if(!config.decor)return;
// Pilares partidos e suportes de contenção acompanham apenas o perímetro.
for(const side of [-1,1])for(let i=0;i<4;i++){
const x=side*341,y=-245+i*159;
roundedBox(x-16,y-17,8,32,34,7,15,['#697089','#343e58','#28314b']);
stone(x,y,9,16,25+i%2*13,i+5);crystal(x+side*4,y+2,32,9+i%2*3);
line([x-side*15,y+22,1],[x-side*10,y+54,1],'#b799dd88',2);
for(let j=0;j<3;j++)line([x-side*(9+j*4),y+39,2],[x-side*(9+j*4),y+45,2],'#dbbdf4aa',1);
}
for(const side of [-1,1]){
const x=side*170;
roundedBox(x-25,-337,22,50,35,8,26,['#8d83a5','#504966','#353951']);
line([x,-312,22],[x-side*8,-312,70],'#b9aaca',4);line([x-side*8,-312,70],[x-side*22,-312,79],'#c9b0e7',3);
// Arco incompleto, como uma estrutura rompida pela força psíquica.
for(let i=0;i<10;i++){const a=Math.PI*.15+i*Math.PI*.07,b=a+Math.PI*.065;line([x+Math.cos(a)*28,-311,74+Math.sin(a)*28],[x+Math.cos(b)*28,-311,74+Math.sin(b)*28],'#a399b9',3)}
}
for(const side of [-1,1]){crystal(side*315,285,1,12);roundedBox(side<0?-359:328,286,4,31,17,4,10,['#8b83a4','#454762','#323b55'])}
}
function bench(){
roundedBox(-317,307,-8,634,94,20,23,['#303650','#121d33','#10192d']);
roundedBox(-309,311,-1,618,77,14,9,['#54506b','#303449','#202a40']);
// Trilho de energia une as nove plataformas, sem formar assentos.
line([-299,378,1],[299,378,1],'#b69bdd',3);line([-288,382,0],[288,382,0],'#675c98',2);
for(let i=0;i<9;i++){
const x=-298+i*66,cx=x+30;
const shape=(inset,z)=>[[x+9+inset,316+inset,z],[x+51-inset,316+inset,z],[x+60-inset,325+inset,z],[x+60-inset,355-inset,z],[x+51-inset,365-inset,z],[x+9+inset,365-inset,z],[x+inset,355-inset,z],[x+inset,325+inset,z]];
const top=shape(0,10),bottom=shape(0,0);
for(let j=0;j<8;j++)face([top[j],top[(j+1)%8],bottom[(j+1)%8],bottom[j]],j<3?'#66748d':'#3e4a63');
face(top,'#c2c4d2','#ece6f34d');face(shape(4,11),'#39384f','#a193bc');face(shape(8,12),'#66507f','#c4a2e6');
const disc=Array.from({length:33},(_,j)=>{const a=j*Math.PI/16;return[cx+Math.cos(a)*17,340+Math.sin(a)*14,13]});face(disc,'#9e7cba66','#d2b3edaa');
// Suportes simétricos e guias de luz delimitam a superfície plana.
for(const side of [-1,1]){const px=cx+side*25;roundedBox(px-2,325,16,4,28,2,8,['#e5dfed','#78829a','#536078']);line([px,329,17],[px,349,17],'#e5bfff',1.7)}
for(const yy of [321,358])line([cx-13,yy,13],[cx+13,yy,13],'#c0a0e5',1.4);
// Números na frente deixam o núcleo livre para o Pokémon.
const p=point(cx,372,5);c.save();c.translate(p.x,p.y);c.fillStyle='#1c263c';c.fillRect(-10*p.s,-6*p.s,20*p.s,13*p.s);c.font='700 '+10*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#e4ccff';c.fillText(String(i+1).padStart(2,'0'),0,4*p.s);c.restore();
}
for(const side of [-1,1]){const x=side*309;roundedBox(x-6,313,29,12,64,5,32,['#d1cadf','#617089','#414c68']);line([x,324,30],[x,362,30],'#d9b5ff',2.5)}
const p=point(0,409,-12);c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#c1b4d5';c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);
}

const glowSprite=document.createElement('canvas');glowSprite.width=glowSprite.height=128;
{const brush=glowSprite.getContext('2d'),g=brush.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#e5c9ff80');g.addColorStop(.25,'#ad77df35');g.addColorStop(1,'#9f69de00');brush.fillStyle=g;brush.fillRect(0,0,128,128)}
function psychicField(){
const strength=config.energy/100,t=reducedMotion?0:time;
if(config.aura){
// Pulso lento nos núcleos, mantendo a geometria do banco em cache.
for(let i=0;i<9;i++){const p=point(-240+i*60,292.5,14),s=p.s;c.save();c.globalAlpha=(.12+Math.sin(t*.8+i*.35)*.035)*strength;c.drawImage(glowSprite,p.x-22*s,p.y-12*s,44*s,24*s);c.restore()}
for(const side of [-1,1]){const p=point(side*335,-75,22),s=p.s*(1+Math.sin(t*.7)*.05);c.drawImage(glowSprite,p.x-135*s,p.y-100*s,270*s,200*s)}
// Ondas lentas de pressão, sem clarões intermitentes.
const p=point(0,-317,24);for(let j=0;j<3;j++){const age=(t*.12+j/3)%1;c.strokeStyle='rgba(192,148,239,'+((1-age)*strength*.35)+')';c.lineWidth=p.s*1.5;c.beginPath();c.ellipse(p.x,p.y,(25+age*100)*p.s,(9+age*31)*p.s,0,0,Math.PI*2);c.stroke()}
}
if(config.levitation)for(let i=0;i<(config.quality==='high'?12:6);i++){
const side=i%2?-1:1,x=side*(407+random(i+17)*150)+Math.sin(t*.22+i)*8,y=-285+(i*113)%690,z=12+random(i+31)*40+Math.sin(t*.8+i)*9,r=7+random(i+29)*11;
ellipse(x,y,-44,r*1.2,r*.35,'#080e2044');stone(x,y,z,r,r*1.1,i+2);
if(config.aura){const p=point(x,y,z);c.save();c.globalAlpha=.22*strength;c.drawImage(glowSprite,p.x-r*3*p.s,p.y-r*2*p.s,r*6*p.s,r*4*p.s);c.restore()}
}
const count=Math.round((config.quality==='high'?48:18)*strength);
for(let i=0;i<count;i++){const side=i%2?-1:1,phase=(t*.07+i*.137)%1,x=side*(320+random(i+8)*430)+Math.sin(t*.4+i)*13,y=-350+random(i+15)*780,z=-20+phase*115,p=point(x,y,z);c.fillStyle='rgba(212,174,247,'+(Math.sin(phase*Math.PI)*.5)+')';c.beginPath();c.arc(p.x,p.y,(.8+random(i)*1.3)*p.s,0,Math.PI*2);c.fill()}
}

function integratedCosmos(){
 const logicalWidth=W,viewportWidth=document.getElementById('stage').clientWidth||1280;
 W=viewportWidth;c.save();c.translate(-(viewportWidth-logicalWidth)/2,0);cosmicBackground();c.restore();W=logicalWidth;
}
document.addEventListener('pointerdown',()=>unlocked=true,{once:true});
document.addEventListener('keydown',()=>unlocked=true,{once:true});
function ambientAudio(enabled,volume){
 if(enabled&&unlocked&&!audio){try{const ctx=new AudioContext(),gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);for(const frequency of [55,82.6,110.3]){const osc=ctx.createOscillator(),level=ctx.createGain();osc.type='sine';osc.frequency.value=frequency;level.gain.value=.22;osc.connect(level);level.connect(gain);osc.start()}audio={ctx,gain}}catch(e){unlocked=false}}
 sound=enabled&&!!audio;if(audio){audio.gain.gain.setTargetAtTime(sound?volume*.03:0,audio.ctx.currentTime,.25);if(sound&&audio.ctx.state==='suspended'&&unlocked)audio.ctx.resume().catch(()=>{})}
}
return{
 paint(g,layer,isAngled){
  c=g;angled=isAngled;
  if(layer!=='arena'){mode='scene';g.fillStyle='#100e20';g.fillRect(-640,0,2560,800);integratedCosmos();}
  if(layer!=='scene'){mode='field';arena();psychicDecor();benchMode=true;bench();benchMode=false}
 },
 tick(dt,state){
  effects.style.display=state.active?'block':'none';
  backEffects.style.display=state.active?'block':'none';
  ambientAudio(state.active&&!state.paused&&!state.mute&&!document.hidden,state.sfx*1);
  if(!state.active)return false;
  angled=state.angled;paused=state.paused;config.quality=state.quality;
  if(!paused)time+=dt;
  gridSoftness+=((state.combat?1:0)-gridSoftness)*(1-Math.exp(-dt*5));
  const grid=Math.round(gridSoftness*10),dirty=grid!==lastGrid;lastGrid=grid;
  c=backEffects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';sceneHeightOffset=10;
  if(!document.hidden){}
  sceneHeightOffset=0;
  c=effects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';
  if(!document.hidden){psychicField();c.fillStyle='rgba(5,8,20,'+((100-config.light)/170)+')';c.fillRect(-640,0,2560,H);}
  return dirty;
 }
};
};