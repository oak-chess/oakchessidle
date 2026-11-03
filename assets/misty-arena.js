// Adaptação visual do protótipo aprovado, sem regras de combate.
window.createMistyArena=function(){
let c,W=1280,H=800,time=0,paused=false,gridSoftness=0,angled=true,mode='scene',benchMode=false,sceneHeightOffset=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const config={rain:100,light:100,waves:true,decor:true,quality:'high',rainVolume:5,swimmers:true,lightning:!reducedMotion};
let audio=null,sound=false,unlocked=false,lastGrid=0;
const effects=document.createElement('canvas');effects.id='mistyAtmosphere';effects.width=2560;effects.height=800;effects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none;z-index:1';
document.getElementById('world').appendChild(effects);
const backEffects=document.createElement('canvas');backEffects.width=2560;backEffects.height=800;backEffects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none;display:none';
document.getElementById('world').insertBefore(backEffects,document.getElementById('arenaView'));
function point(x,y,z=0){
 if(mode==='field'){
  if(benchMode){x=(x+2)*60/64;y-=46.5}
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


const drops=Array.from({length:850},()=>({x:Math.random(),y:Math.random(),v:.55+Math.random(),z:.4+Math.random()*.8}));let nextLightning=8,lightningStart=-100,lightningSide=.5;
function ring(x,y,r,alpha){const p=point(x,y,3);c.beginPath();c.ellipse(p.x,p.y,r*p.s,r*.43*p.s,0,0,Math.PI*2);c.strokeStyle='rgba(175,242,249,'+alpha+')';c.lineWidth=p.s;c.stroke()}
function buoy(x,y){const bob=config.waves?Math.sin(time*2+x*.04)*2:0;ellipse(x,y,5+bob,17,8,'#07344f66');ellipse(x,y,9+bob,13,6,'#f28259','#ffbc90');ellipse(x,y,11+bob,7,3,'#f0e8d8');ellipse(x,y,11+bob,4,2,'#185977')}
function lamp(x,y){const p=point(x,y,66);line([x,y,4],[x,y,68],'#768e9b',4);box(x-8,y-8,72,16,16,9,['#ccebe3','#526d7d','#355466']);if(config.quality==='high'){const g=c.createRadialGradient(p.x,p.y,1,p.x,p.y,65*p.s);g.addColorStop(0,'#90eeec3d');g.addColorStop(1,'#90eeec00');c.fillStyle=g;c.fillRect(p.x-65*p.s,p.y-65*p.s,130*p.s,130*p.s)}}
function palm(x,y){ellipse(x,y,6,33,12,'#031c2e55');box(x-18,y-18,21,36,36,21,['#6d929a','#365d70','#29495e']);line([x,y,23],[x+5,y,108],'#8e8b63',8);for(let i=0;i<7;i++){const a=i*Math.PI*2/7,p=point(x+5,y,108),q=point(x+5+Math.cos(a)*60,y+Math.sin(a)*60,82);c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+q.x)/2,p.y-25*p.s,q.x,q.y);c.quadraticCurveTo((p.x+q.x)/2+10*p.s,(p.y+q.y)/2,p.x,p.y);c.fillStyle=i%2?'#398f8b':'#4aa594';c.fill()}}
function deck(){roundedBox(-375,-345,-9,750,690,95,30,['#7497a5','#34526b','#28455c']);c.save();clipFace(roundedPoints(-375,-345,-8,750,690,95));for(let x=-375;x<375;x+=30)for(let y=-345;y<345;y+=30){if(x>-315&&x<285&&y>-285&&y<255)continue;face([[x+1,y+1,-8],[x+29,y+1,-8],[x+29,y+29,-8],[x+1,y+29,-8]],((x+y)/30)%2?'#8babb6':'#7a9da9','#5d8190')}c.restore();
roundedBox(-315,-285,-7,630,570,68,12,['#c1dbdd','#527e93','#3c687f']);
face(roundedPoints(-300,-270,-9,600,540,56),'#0b7891');
const grad=c.createLinearGradient(0,H*.3,0,H*.8);grad.addColorStop(0,'#44c5ce44');grad.addColorStop(1,'#072b6d88');face(roundedPoints(-300,-270,-8,600,540,56),grad);
c.save();clipFace(roundedPoints(-300,-270,-7,600,540,56));
for(let x=-280;x<300;x+=25)for(let y=-250;y<260;y+=25){if(config.quality==='low'&&(x+y)%2)continue;const v=config.waves?Math.sin(time*1.2+x*.025+y*.03):0;line([x,y,-7],[x+13+v*3,y+v*2,-7],'rgba(156,249,239,'+(.08+Math.max(0,v)*.13)+')',1)}
if(config.waves)for(let i=0;i<15;i++){const age=(time*.6+i*.47)%2.3;ring(-275+(i*97)%550,-245+(i*137)%490,3+age*13,(1-age/2.3)*.2)}
c.restore();
// O tabuleiro elevado deixa água visível em todo o perímetro.
roundedBox(-286,-273,6,572,546,44,24,['#edb881','#52798d','#3b6077']);
roundedBox(-282,-269,8,564,538,40,20,['#37c3cc','#16758c','#18546e']);
c.save();clipFace(roundedPoints(-282,-269,10,564,538,40));
const radius=42,hexWidth=Math.sqrt(3)*radius,gridWidth=7.5*hexWidth;
for(let row=0;row<8;row++)for(let col=0;col<7;col++){
 const x=-gridWidth/2+hexWidth/2+(col+(row%2?.5:0))*hexWidth,y=-3.5*1.5*radius+row*1.5*radius;
 const pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*(radius-1),y+Math.sin(a)*(radius-1),10]});
 const waveTime=config.waves?time:0,shimmer=Math.sin(waveTime*.9+x*.016+y*.012)*.5+.5;
 face(pts.map(([px,py,pz])=>[px,py,pz-3]),'rgba(11,107,133,'+(1-gridSoftness*.88)+')');
 const top=point(x,y-radius,10),bottom=point(x,y+radius,10),water=c.createLinearGradient(top.x,top.y,bottom.x,bottom.y);
 water.addColorStop(0,row>=4?'#28b8c0':'#289ebc');water.addColorStop(.55,'hsl('+(row>=4?183:192)+',65%,'+(35+shimmer*7)+'%)');water.addColorStop(1,row>=4?'#167e9f':'#176a95');
 c.save();c.globalAlpha=1-gridSoftness*.88;face(pts,water);c.restore();
 face(pts,'rgba(0,0,0,0)','rgba(188,255,240,'+(.47-gridSoftness*.42)+')');
}
// Reflexos atravessam os hexágonos, como a luz no fundo de uma piscina.
const waterTime=config.waves?time:0;
c.save();clipFace(roundedPoints(-280,-267,11,560,534,39));
for(let j=0;j<17;j++){
 c.beginPath();
 for(let i=0;i<=35;i++){const x=-292+i*17,y=-275+j*35+Math.sin(x*.027+waterTime*1.1+j)*7+Math.sin(x*.054-waterTime*.6)*3,p=point(x,y,11);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)}
 c.strokeStyle='rgba(177,255,235,'+(.08+.07*(1+Math.sin(j+waterTime))*.5)+')';c.lineWidth=2.2*point(0,0,11).s;c.stroke();
}
if(config.quality==='high')for(let j=0;j<30;j++){
 const x=-250+(j*137)%510,y=-240+(j*89)%480,p=point(x+Math.sin(waterTime*.7+j)*8,y,11);
 c.strokeStyle='rgba(207,255,238,'+(.09+.12*(1+Math.sin(waterTime+j*2))*.5)+')';c.lineWidth=1.3*p.s;c.beginPath();c.ellipse(p.x,p.y,(12+Math.sin(waterTime+j)*4)*p.s,5*p.s,Math.sin(j)*.3,.2,Math.PI*1.7);c.stroke();
}
c.restore();
const p=point(0,0,11);c.save();c.translate(p.x,p.y);c.scale(1,Math.cos(38*Math.PI/180));
const ballRadius=59*p.s;c.beginPath();c.arc(0,0,ballRadius,0,Math.PI*2);c.fillStyle='#e9f1ec';c.fill();
c.beginPath();c.arc(0,0,ballRadius,Math.PI,Math.PI*2);c.closePath();c.fillStyle='#db635a';c.fill();
c.beginPath();c.arc(0,0,ballRadius,0,Math.PI*2);c.strokeStyle='#28434f';c.lineWidth=4*p.s;c.stroke();
c.beginPath();c.moveTo(-ballRadius,0);c.lineTo(ballRadius,0);c.lineWidth=7*p.s;c.stroke();
c.beginPath();c.arc(0,0,15*p.s,0,Math.PI*2);c.fillStyle='#edf5f1';c.fill();c.lineWidth=5*p.s;c.stroke();
c.beginPath();c.arc(0,0,7*p.s,0,Math.PI*2);c.strokeStyle='#9cb9bc';c.lineWidth=2*p.s;c.stroke();c.restore();
c.restore();
}
function cascadeBadge(x,y,z,size){const p=point(x,y,z),s=p.s*size;c.save();c.translate(p.x,p.y);c.beginPath();c.moveTo(0,-s);c.bezierCurveTo(s*.2,-s*.5,s*.8,-s*.1,s*.65,s*.4);c.bezierCurveTo(s*.45,s,-s*.6,s,-s*.65,s*.25);c.bezierCurveTo(-s*.7,-s*.2,-s*.2,-s*.55,0,-s);c.fillStyle='#60d8ef';c.fill();c.lineWidth=2*p.s;c.strokeStyle='#b5f8ff';c.stroke();c.beginPath();c.moveTo(-s*.25,-s*.15);c.quadraticCurveTo(-s*.45,s*.4,-s*.08,s*.5);c.strokeStyle='#efffffaa';c.stroke();c.restore()}
function starStatue(x,y){roundedBox(x-22,y-22,18,44,44,12,22,['#719bb1','#365a78','#29455f']);const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?13:31;return point(x+Math.cos(a)*r,y,57-Math.sin(a)*r)});poly(pts,'#c5a268','#f1d2a0');ellipse(x,y,57,9,9,'#c96c82','#ffe7cb');ellipse(x-2,y,60,3,3,'#ffd3d8')}
function mistyDetails(){
// Raias laterais, nas cores aquáticas com acentos laranja da Misty.
for(const x of [-269,269]){line([x,-210,1],[x,210,1],'#d5eff08c',1);for(let i=0;i<22;i++){const y=-210+i*20,bob=config.waves?Math.sin(time*2+i*.5)*1.2:0;ellipse(x,y,4+bob,5,3,i%4===0?'#f7af72':'#b3e5e6')}}
// Totem central da Insígnia da Cascata, fora dos hexágonos.
roundedBox(-49,-337,22,98,40,16,28,['#93b5c3','#355d77','#29465f']);box(-5,-321,92,10,10,70,['#aac8cf','#527a92','#3e617a']);cascadeBadge(0,-315,92,28);
starStatue(-345,200);starStatue(345,200);
// Pequenas quedas d'água despejam na piscina, atrás do campo.
for(const x of [-170,170]){box(x-21,-307,22,42,28,30,['#9dbac4','#4c7e95','#3d637e']);for(let i=0;i<7;i++){const off=i*4-12,v=config.waves?Math.sin(time*4+i)*2:0;line([x+off,-281,18],[x+off+v,-249,0],'#9deff58c',2)}if(config.waves)ring(x,-247,(time*16)%22,.3)}
}
function swimmingBench(){
// Plataforma corrida de arquibancada, com degrau frontal e nove vagas pintadas.
const start=-285,step=64,y=339;
roundedBox(-315,308,-5,630,94,18,20,['#223d58','#132b42','#102337']);
roundedBox(-307,312,8,614,69,12,16,['#b47b46','#744c30','#503728']);
roundedBox(-300,369,-2,600,26,8,12,['#e6bc7a','#a27343','#684a31']);
// Ripas compridas e faixa laranja dão a leitura de arquibancada esportiva.
for(let j=0;j<4;j++)roundedBox(-298,316+j*12,10,596,9,3,3,[j%2?'#e5b470':'#f4cd8a','#9c693c','#79502f']);
line([-300,306,9],[300,306,9],'#142e47',7);
line([-297,365,10],[297,365,10],'#fff0bd',4);
for(let i=0;i<9;i++){
 const x=start+i*step;
 // Divisórias pintadas, sem cavidades nem cadeiras individuais.
 if(i>0)line([x-5,316,12],[x-5,361,12],'#253f59',3);
 const p=point(x+27,y+11,13);c.save();c.translate(p.x,p.y);c.scale(1,Math.cos(38*Math.PI/180));c.fillStyle='#203b55';c.fillRect(-10*p.s,-8*p.s,20*p.s,17*p.s);c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#fff1c4';c.fillText(String(i+1),0,5*p.s);c.restore();
}
for(const x of [-311,311]){line([x,318,3],[x,318,32],'#bdd3d5',3);line([x,318,32],[x,382,21],'#bfd7d9',3);line([x,382,21],[x,382,-5],'#7d9eae',3)}
const label=point(0,409,-12);c.font='600 '+9*label.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#8fbac8';c.fillText('BANCO DO TIME  ·  9 VAGAS',label.x,label.y);
}
function decorations(){
// Arquibancadas e painéis recuam atrás do campo.
for(let j=0;j<3;j++){box(-310,-345-j*15,9+j*15,215,21,15,['#819fba','#3b5579','#293f64']);for(let i=0;i<6;i++)box(-299+i*34,-345-j*15,12+j*15,27,14,5,[j%2?'#f5af83':'#79c4d7','#526580','#3e526c'])}
box(110,-365,108,175,13,90,['#7395a7','#173a55','#25475d']);face([[120,-350,100],[275,-350,100],[275,-350,34],[120,-350,34]],'#12394e');const title=point(198,-349,70);c.save();c.translate(title.x,title.y);c.font='600 '+14*title.s+'px Segoe UI';c.fillStyle='#a3f2e6';c.textAlign='center';c.fillText('CERULEAN',0,0);c.font=9*title.s+'px Segoe UI';c.fillStyle='#80bbca';c.fillText('GINÁSIO AQUÁTICO',0,16*title.s);c.restore();
// Passarela, trampolim, luminárias e objetos com volume.
box(250,-165,16,85,36,12,['#e2ded0','#829da7','#547587']);box(313,-163,70,22,30,58,['#98ced3','#54879d','#326179']);box(276,-164,76,60,28,8,['#e1eee4','#7092a0','#506f84']);
palm(-354,-250);palm(347,-285);lamp(-347,100);lamp(348,-20);
for(let i=0;i<3;i++)buoy(-270,60+i*62);buoy(265,180);
for(let k=0;k<2;k++){const x=-130+k*230;line([x,294,1],[x,294,37],'#a8c4cb',5);line([x+30,294,1],[x+30,294,37],'#a8c4cb',5);line([x,294,37],[x+30,294,37],'#c3dee0',5);for(let z=-15;z<25;z+=13)line([x,287,z],[x+30,287,z],'#91b4c2',3)}
for(let i=0;i<4;i++)box(-270+i*150,325,8,68,8,6,['#a1d9d8','#4e899e','#39667f']);
mistyDetails();
}
function rain(){if(!config.rain)return;const n=Math.round((config.quality==='low'?240:800)*config.rain/100);c.save();c.lineWidth=1;for(let i=0;i<n;i++){const d=drops[i],x=((d.x*2560-time*110*d.z)%2660+2660)%2660-690,y=((d.y*H+time*650*d.v)%(H+80))-40;c.strokeStyle='rgba(179,226,246,'+(.14+d.z*.16)+')';c.beginPath();c.moveTo(x,y);c.lineTo(x-7*d.z,y+24*d.z);c.stroke()}
if(config.quality==='high')for(let i=0;i<Math.round(config.rain*.28);i++){const age=(time*2+i*.33)%1;ring(-290+(i*113)%575,-260+(i*79)%515,1+age*10,(1-age)*.4)}c.restore()}
// O mar é um plano abaixo da plataforma; suas ondas acompanham a perspectiva.
function ocean(){
const bg=c.createRadialGradient(W*.54,H*.42,20,W*.54,H*.45,Math.max(W,H)*.8);bg.addColorStop(0,'#238c9b');bg.addColorStop(.48,'#12566f');bg.addColorStop(1,'#06273f');c.fillStyle=bg;c.fillRect(-640,0,2560,H);
const motion=config.waves?time:0,rows=config.quality==='low'?24:42;
for(let j=0;j<rows;j++)for(let i=0;i<14;i++){
 const x=-1650+i*246+Math.sin(j*8.7)*95,y=-1100+j*71;
 const drift=Math.sin(motion*.75+j*.9+i*1.7),len=28+22*(1+Math.sin(i*7+j));
 const p=point(x+drift*12,y,-142),q=point(x+len+drift*12,y+Math.sin(i+j)*5,-142);
 c.strokeStyle='rgba(131,223,220,'+(.055+.065*(1+Math.sin(j+i*3+motion*.7))/2)+')';c.lineWidth=Math.max(1,p.s*1.5);c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo((p.x+q.x)/2,p.y-3*p.s,q.x,q.y);c.stroke();
}
// Sombra suave sob a base da plataforma.
const p=point(0,35,-143);c.save();c.translate(p.x,p.y);c.scale(1,.55);const shade=c.createRadialGradient(0,0,80*p.s,0,0,470*p.s);shade.addColorStop(0,'#031d3670');shade.addColorStop(1,'#031d3600');c.fillStyle=shade;c.fillRect(-480*p.s,-480*p.s,960*p.s,960*p.s);c.restore();
}
const swimmingPokemon=[
 {id:131,x:-510,y:-55,rx:65,ry:125,speed:.12,phase:0,size:110},
 {id:116,x:510,y:20,rx:56,ry:110,speed:.14,phase:2,size:86,submerge:.61},
 {id:129,x:-660,y:265,rx:80,ry:44,speed:.23,phase:1,size:88},
 {id:72,x:650,y:290,rx:90,ry:52,speed:.11,phase:4,size:80,submerge:.58},
 {id:86,x:380,y:-430,rx:125,ry:35,speed:.13,phase:3,size:95}
].map(p=>{const metadata={131:[48,56,[10,12,10,12]],116:[24,48,[8,12,8,12]],129:[32,40,[6,2,4,6,4,2,6]],72:[24,40,[8,10,8,10]],86:[32,40,[8,6,8,10,6,6,6]]};const [fw,fh,durations]=metadata[p.id],img=new Image();img.src='assets/pmd/sprite/'+String(p.id).padStart(4,'0')+'/Walk-Anim.png';return{...p,img,fw,fh,durations}});
function drawSwimmingPokemon(){
if(!config.swimmers)return;
c.save();c.imageSmoothingEnabled=false;
for(const fish of swimmingPokemon){
 if(!fish.img.complete||!fish.img.naturalWidth)continue;
 const a=time*fish.speed+fish.phase,x=fish.x+Math.sin(a)*fish.rx,y=fish.y+Math.cos(a)*fish.ry;
 const p=point(x,y,-132),size=fish.size*p.s,bob=Math.sin(time*2+fish.phase)*2*p.s,waterline=p.y+5*p.s;
 const vx=Math.cos(a)*fish.rx,vy=-Math.sin(a)*fish.ry,heading=Math.atan2(vy,vx);
 // Folhas PMD: baixo, baixo/esquerda, esquerda, cima/esquerda e assim por diante.
 const directionRow=(Math.round((heading-Math.PI/2)/(Math.PI/4))+8)%8;
 let tick=(time*60+fish.phase*9)%fish.durations.reduce((sum,n)=>sum+n,0),frame=0;
 while(frame<fish.durations.length-1&&tick>=fish.durations[frame])tick-=fish.durations[frame++];
 const next=point(x+vx*.1,y+vy*.1,-132),len=Math.hypot(next.x-p.x,next.y-p.y)||1,trailX=(next.x-p.x)/len,trailY=(next.y-p.y)/len;
 // Pequeno rastro atrás de cada nadador, sem partículas na área de combate.
 for(let j=0;j<3;j++){const age=(time*.65+j/3)%1;c.strokeStyle='rgba(194,255,239,'+((1-age)*.45)+')';c.lineWidth=1.3*p.s;c.beginPath();c.ellipse(p.x-trailX*(14+age*28)*p.s,p.y-trailY*(14+age*28)*p.s,(12+age*18)*p.s,(3+age*5)*p.s,0,0,Math.PI*2);c.stroke()}
 // A parte inferior fica submersa; a superfície recorta o sprite.
 const spriteScale=p.s*1.65,dw=fish.fw*spriteScale,dh=fish.fh*spriteScale;
 c.save();c.beginPath();c.rect(p.x-size,waterline-size*1.4,size*2,size*1.4);c.clip();c.translate(p.x,p.y+bob);c.rotate(Math.sin(time*2.4+fish.phase)*.035);c.drawImage(fish.img,frame*fish.fw,directionRow*fish.fh,fish.fw,fish.fh,-dw/2,-dh*(fish.submerge||.78),dw,dh);c.restore();
 c.strokeStyle='#b8f6e0a0';c.lineWidth=2*p.s;c.beginPath();c.ellipse(p.x,waterline,fish.size*.18*p.s,3*p.s,0,0,Math.PI);c.stroke();
}
c.restore();
}
function seaScenery(){
if(!config.decor)return;
const t=config.waves?time:0;
// Recifes em camadas, ilhotas e vegetação longe do campo de combate.
for(const [x,y,size,palms] of [[-660,-370,92,true],[640,-410,110,true],[-570,110,55,false],[600,175,70,false],[810,-50,46,false],[-900,-180,62,false]]){
 seaFoam(x,y,size,.2);
 const rim=Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9,r=size*(.85+.15*Math.sin(i*9+x));return[x+Math.cos(a)*r,y+Math.sin(a)*r*.72,-134]});
 face(rim,'#51c4bb66');
 const shore=rim.map(([a,b])=>[x+(a-x)*.77,y+(b-y)*.77,-125]);face(shore,palms?'#c4b98b':'#537f86');
 for(let i=0;i<3;i++){const rx=x+(i-1)*size*.3,ry=y+(i%2)*14;face([[rx-size*.28,ry+16,-124],[rx-size*.24,ry-18,-124],[rx,ry-10,-83-i*8],[rx+size*.32,ry+12,-124]],i%2?'#396275':'#648a91');face([[rx,ry-10,-83-i*8],[rx+size*.32,ry+12,-124],[rx+size*.04,ry+25,-124]],'#284d63')}
 if(palms){c.save();clipFace(shore);ellipse(x+12,y+12,-123,size*.48,size*.16,'#729e75');c.restore();line([x+15,y,-122],[x+23,y-3,-51],'#9c9465',6);for(let i=0;i<6;i++){const a=i*Math.PI/3;face([[x+23,y-3,-51],[x+23+Math.cos(a)*48,y-3+Math.sin(a)*35,-68],[x+23+Math.cos(a+.4)*27,y-3+Math.sin(a+.4)*20,-49]],i%2?'#3b9c88':'#65b798')}}
}
// Boias de sinalização com reflexos e movimento na água.
for(const [x,y] of [[-480,-185],[480,-120],[-650,330],[640,360]]){const bob=Math.sin(t*1.8+x)*3;ellipse(x,y,-137,16,5,'#082f4966');ellipse(x,y,-132+bob,10,4,'#d9e9ce');face([[x-7,y,-132+bob],[x-4,y,-112+bob],[x+4,y,-112+bob],[x+7,y,-132+bob]],'#eb9a66');line([x,y,-112+bob],[x,y,-91+bob],'#bedbd5',2);ellipse(x,y,-91+bob,3,3,'#f8d185')}
// Bancs de poissons visibles sous l'eau et sillages de surface.
if(config.quality==='high')for(let j=0;j<3;j++)for(let i=0;i<5;i++){const x=(j%2?-1:1)*(510+j*90)+Math.sin(t*.25+j)*45+i*14,y=-40+j*145+Math.cos(t*.3+j)*30+i*7;face([[x-6,y,-145],[x+4,y-3,-145],[x+9,y,-145],[x+4,y+3,-145]],'#9cd8c743')}
}
function seaFoam(x,y,width,seed){
const t=config.waves?time:0,p=point(x,y,-139);
for(let j=0;j<3;j++){const age=(t*.48+j/3+seed)%1;c.save();c.strokeStyle='rgba(182,250,241,'+((1-age)*.35)+')';c.lineWidth=1.4*p.s;c.beginPath();c.ellipse(p.x,p.y,(width*.65+age*48)*p.s,(8+age*16)*p.s,0,0,Math.PI*2);c.stroke();c.restore()}
for(let i=0;i<12;i++){const phase=t*2.5+i*2.3+seed;ellipse(x+Math.sin(i*17+seed)*width*.65,y+Math.cos(i*11)*12,-136+Math.sin(phase)*2,3+Math.sin(phase)*1.2,1.8,'#c2fff0aa')}
}
function waterfall(x,y,dx,dy,width,seed){
const top=-9,bottom=-137,t=time;
// Cortina translúcida que se abre levemente durante a queda.
face([[x-dx*width/2,y-dy*width/2,top],[x+dx*width/2,y+dy*width/2,top],[x+dx*width*.57,y+dy*width*.57,bottom],[x-dx*width*.57,y-dy*width*.57,bottom]],'#65d9df83');
const count=config.quality==='low'?6:12;
for(let i=0;i<count;i++){
 const offset=(i/(count-1)-.5)*width,phase=(t*.7+i*.139+seed)%1,z=top-phase*(top-bottom);
 line([x+dx*offset,y+dy*offset,top],[x+dx*offset,y+dy*offset,bottom],'#a9f4ee55',2);
 line([x+dx*offset,y+dy*offset,z],[x+dx*offset,y+dy*offset,Math.max(bottom,z-20-8*Math.sin(i))],'#edfff6bb',1.8);
}
line([x-dx*width/2,y-dy*width/2,top+1],[x+dx*width/2,y+dy*width/2,top+1],'#cdfaf1',3);
seaFoam(x,y,width,seed);
}
function islandBase(){
roundedBox(-366,-336,-36,732,672,91,100,['#507f8a','#234d62','#1b4259']);
// Cascatas laterais deixam a frente central livre para o banco e a loja.

}
function frontWaterfalls(){for(const side of [-1,1])waterfall(side*285,340,1,0,64,.3+(side+1)*.17)}

function stormFlash(){
if(!config.lightning||!config.rain){nextLightning=time+5+Math.random()*8;lightningStart=-100;return}
if(time>=nextLightning){lightningStart=time;lightningSide=.15+Math.random()*.7;nextLightning=time+8+Math.random()*13}
const age=time-lightningStart;
// Um clarão curto com dissipação gradual, sem sequência de piscadas.
if(age<0||age>.85)return;
const strength=Math.exp(-age*6)*Math.min(1,age/.035)*(config.rain/100);
c.save();c.fillStyle='rgba(209,231,255,'+(strength*.27)+')';c.fillRect(-640,0,2560,H);
const glow=c.createRadialGradient(W*lightningSide,0,0,W*lightningSide,H*.15,Math.max(W,H)*.9);glow.addColorStop(0,'rgba(245,250,255,'+(strength*.42)+')');glow.addColorStop(.4,'rgba(168,208,255,'+(strength*.12)+')');glow.addColorStop(1,'rgba(168,208,255,0)');c.fillStyle=glow;c.fillRect(-640,0,2560,H);c.restore();
}

function unlockAudio(){unlocked=true}
document.addEventListener('pointerdown',unlockAudio,{once:true});
document.addEventListener('keydown',unlockAudio,{once:true});
function ambientAudio(enabled,volume){
 if(enabled&&unlocked&&!audio){
  try{const ctx=new AudioContext(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),data=buffer.getChannelData(0);let low=0;
   for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.03)/1.03;data[i]=low*3+(Math.random()*2-1)*.3}
   const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;filter.type='lowpass';filter.frequency.value=5000;gain.gain.value=0;noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();audio={ctx,gain};
  }catch(e){unlocked=false}
 }
 sound=enabled&&!!audio;
 if(audio){audio.gain.gain.setTargetAtTime(sound?volume*.022:0,audio.ctx.currentTime,.25);if(sound&&audio.ctx.state==='suspended'&&unlocked)audio.ctx.resume().catch(()=>{})}
}

return{
 paint(g,layer,isAngled){
  c=g;angled=isAngled;
  if(layer!=='arena'){mode='scene';g.fillStyle='#125269';g.fillRect(-640,0,2560,800);ocean();seaScenery();islandBase();}
  if(layer!=='scene'){mode='field';deck();decorations();benchMode=true;swimmingBench();benchMode=false}
 },
 tick(dt,state){
  effects.style.display=state.active?'block':'none';
  backEffects.style.display=state.active?'block':'none';
  ambientAudio(state.active&&!state.paused&&!state.mute&&!document.hidden,state.sfx*.65);
  if(!state.active)return false;
  angled=state.angled;paused=state.paused;config.quality=state.quality;
  if(!paused)time+=dt;
  gridSoftness+=((state.combat?1:0)-gridSoftness)*(1-Math.exp(-dt*5));
  const grid=Math.round(gridSoftness*10),dirty=grid!==lastGrid;lastGrid=grid;
  c=backEffects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';sceneHeightOffset=10;
  if(!document.hidden){for(const side of [-1,1])for(let i=0;i<3;i++)waterfall(side*373,-185+i*145,0,1,72,i*.21+(side+1)*.13);frontWaterfalls();}
  sceneHeightOffset=0;
  c=effects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';
  if(!document.hidden){drawSwimmingPokemon();rain();if(!state.reduceFx)stormFlash();}
  return dirty;
 }
};
};