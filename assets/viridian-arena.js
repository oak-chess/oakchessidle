// Floresta aprovada: renderização isolada das regras de combate.
window.createViridianArena=function(){
let c,W=1280,H=800,time=0,paused=false,gridSoftness=0,angled=true,mode='scene',benchMode=false;
const config={leaves:100,decor:true,sunrays:true,life:true,quality:'high'};
let audio=null,sound=false,unlocked=false,lastGrid=0;
const effects=document.createElement('canvas');effects.id='viridianAtmosphere';effects.width=2560;effects.height=800;effects.style.cssText='position:absolute;left:-640px;top:0;width:2560px;height:800px;pointer-events:none';
const world=document.getElementById('world');world.insertBefore(effects,document.getElementById('arenaView'));
function point(x,y,z=0){
 if(mode==='field'){
  if(benchMode){x=(x+4)*10/11;y-=46.5}
  if(!angled)return{x:640+x,y:332.5+y-(z-10),s:1};
  const a=38*Math.PI/180,wy=(y-67.5)*1.02,wz=(z-10)*1.02,k=2200/(2200-wy*Math.sin(a)-wz*Math.cos(a));
  const q=(6+wy*Math.cos(a)-wz)*k,flatY=2200*(q-6)/(1.02*(2200*Math.cos(a)+q*Math.sin(a))),flatK=2200/(2200-flatY*1.02*Math.sin(a));
  return{x:640+x*k/flatK,y:400+flatY,s:k/flatK};
 }
 if(!angled)return{x:640+x,y:332.5+y-z,s:1};
 const a=angled?38*Math.PI/180:0,wy=(y-67.5)*1.02,wz=z*1.02,depth=wy*Math.sin(a)+wz*Math.cos(a),k=angled?2200/(2200-depth):1;
 return{x:640+x*(angled?1.02:1)*k,y:400+(angled?6:0)+(wy*Math.cos(a)-wz)*k,s:(angled?1.02:1)*k};
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
function foliage(x,y,z,r,color){const p=point(x,y,z);const g=c.createRadialGradient(p.x-r*p.s*.3,p.y-r*p.s*.3,r*p.s*.1,p.x,p.y,r*p.s);g.addColorStop(0,color);g.addColorStop(1,'#173b25');c.fillStyle=g;c.beginPath();c.ellipse(p.x,p.y,r*p.s,r*.65*p.s,0,0,Math.PI*2);c.fill()}
function tree(x,y,size,seed){
ellipse(x,y,-30,size*.9,size*.35,'#09281f60');
const trunk=size*.2,h=size*1.7;
face([[x-trunk,y,-29],[x-trunk*.65,y,h*.72],[x+trunk*.4,y,h],[x+trunk,y,-29]],'#59452c');
face([[x+trunk*.1,y,-29],[x+trunk*.4,y,h],[x+trunk,y,-29]],'#302f20');
for(let j=0;j<4;j++){const a=j*Math.PI/2+seed;face([[x-trunk*.5,y,-25],[x+Math.cos(a)*size*.7,y+Math.sin(a)*size*.5,-30],[x+Math.cos(a)*size*.25,y+Math.sin(a)*size*.2,8]],'#514a2c')}
line([x-trunk*.3,y,0],[x-trunk*.1,y,h*.6],'#a3824555',2);
for(let i=0;i<8;i++){const a=i*2.4,r=size*(.46+random(seed+i)*.28);foliage(x+Math.cos(a)*size*.53,y+Math.sin(a)*size*.37,h*(.72+random(i+seed)*.3),r,['#497e3b','#689b49','#3c7339'][i%3])}
}
function fern(x,y,z,size){
for(let j=0;j<5;j++){const a=j*Math.PI*.38,dx=Math.cos(a)*size,dy=Math.sin(a)*size*.35;line([x,y,z],[x+dx,y+dy,z+size*.55],'#729955',1.3);for(let k=1;k<5;k++){const t=k/5,px=x+dx*t,py=y+dy*t,pz=z+size*.55*t;face([[px,py,pz],[px-dy*.35+dx*.1,py+dx*.13,pz+3],[px+dx*.23,py+dy*.23,pz+size*.1]],k%2?'#559750':'#82aa58')}}
}
function mushroom(x,y,z,size){line([x,y,z],[x,y,z+size],'#d5c396',size*.3);ellipse(x,y,z+size,size*.8,size*.35,'#b86046');ellipse(x-size*.22,y,z+size*1.1,size*.16,size*.08,'#f4dcc0')}
const forestLakes=[{x:-680,y:105,rx:135,ry:98},{x:675,y:-115,rx:150,ry:105},{x:570,y:460,rx:110,ry:65}];
function lakeOutline(lake,mult,z){return Array.from({length:48},(_,i)=>{const a=i*Math.PI/24,wobble=1+Math.sin(a*3+lake.x)*.07+Math.cos(a*5)*.035;return[lake.x+Math.cos(a)*lake.rx*mult*wobble,lake.y+Math.sin(a)*lake.ry*mult*wobble,z]})}
function lake(lake){
 face(lakeOutline(lake,1.15,-32),'#29472f');face(lakeOutline(lake,1.06,-31),'#9c9b64');
 const top=point(lake.x,lake.y-lake.ry,-30),bottom=point(lake.x,lake.y+lake.ry,-30),water=c.createLinearGradient(top.x,top.y,bottom.x,bottom.y);water.addColorStop(0,'#214f4c');water.addColorStop(.5,'#3e8d86');water.addColorStop(1,'#76aca0');face(lakeOutline(lake,1,-30),water,'#a3c8a16b');
 for(let i=0;i<7;i++){const a=i*2.4,x=lake.x+Math.cos(a)*lake.rx*.7,y=lake.y+Math.sin(a)*lake.ry*.65;ellipse(x,y,-29,7,4,'#527e3e');line([x,y,-28],[x+5,y+2,-28],'#a1ae6b',1)}
 for(let i=0;i<9;i++){const a=i*.72,x=lake.x+Math.cos(a)*lake.rx*1.04,y=lake.y+Math.sin(a)*lake.ry*1.04;for(let j=0;j<3;j++)line([x+j*2,y,-29],[x+j*3-3,y, -15-j*3],'#637d43',1.5)}
}
function flowers(x,y,seed,z=-30){
 for(let i=0;i<7;i++){const px=x+(random(seed+i)-.5)*38,py=y+(random(seed+i+19)-.5)*25,h=5+random(seed+i+9)*6;
 line([px,py,z],[px,py,z+h],'#668d45',1.2);
 const p=point(px,py,z+h),r=p.s*2.1;c.fillStyle=['#edcf77','#d7afc8','#e7e7b5','#aebfdf'][Math.floor(seed)%4];
 for(let j=0;j<5;j++){const a=j*Math.PI*2/5;c.beginPath();c.ellipse(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.65,r,r*.72,a,0,Math.PI*2);c.fill()}
 c.fillStyle='#d7a64c';c.beginPath();c.arc(p.x,p.y,p.s*1.2,0,Math.PI*2);c.fill();
 }
}
function forestGround(){
const bg=c.createRadialGradient(W*.5,H*.4,0,W*.5,H*.5,Math.max(W,H)*.75);bg.addColorStop(0,'#6c8050');bg.addColorStop(.45,'#304c32');bg.addColorStop(1,'#0d251e');c.fillStyle=bg;c.fillRect(0,0,W,H);
for(let i=0;i<180;i++){const x=-1300+random(i+1)*2600,y=-850+random(i+300)*1700;ellipse(x,y,-34,12+random(i+5)*30,4+random(i+8)*8,i%2?'#88a45724':'#143b2533')}
if(!config.decor)return;
for(const pond of forestLakes)lake(pond);
const trees=[];for(let i=0;i<23;i++)trees.push({x:-1200+i*110,y:-450-random(i+8)*190,size:65+random(i+17)*45,seed:i+1});
for(const side of [-1,1])for(let i=0;i<4;i++)trees.push({x:side*(490+random(i+side+30)*140),y:-170+i*170,size:65+random(i+81)*28,seed:i+side*12});
for(const side of [-1,1])for(let i=0;i<7;i++)trees.push({x:side*(800+random(i+side+61)*180),y:-250+i*135,size:60+random(i+101)*35,seed:i+side*23});
trees.sort((a,b)=>a.y-b.y);for(const t of trees)tree(t.x,t.y,t.size,t.seed);
for(let i=0;i<32;i++){const side=i%2?-1:1,x=side*(415+random(i+97)*420),y=-300+random(i+67)*850;if(forestLakes.some(l=>Math.pow((x-l.x)/(l.rx*1.2),2)+Math.pow((y-l.y)/(l.ry*1.2),2)<1))continue;flowers(x,y,i+4)}
for(let i=0;i<35;i++){const side=i%2?-1:1,x=side*(405+random(i+11)*400),y=-350+random(i+26)*900;fern(x,y,-27,15+random(i+32)*15);if(i%3===0)mushroom(x+15,y+12,-29,7+random(i)*6)}
}
function arena(){
roundedBox(-375,-345,-9,750,690,95,28,['#655b3b','#3e442b','#2a3825']);
c.save();clipFace(roundedPoints(-375,-345,-8,750,690,95));
for(let i=0;i<140;i++){const x=-370+random(i+5)*740,y=-340+random(i+51)*680;ellipse(x,y,-7,9+random(i+7)*14,4+random(i)*5,i%3?'#688b3f88':'#92a64f88')}
c.restore();
// Raízes e musgo nas bordas preservam os cantos arredondados.
if(config.decor)for(const side of [-1,1]){
for(let i=0;i<5;i++){const y=-240+i*108;line([side*368,y,-3],[side*326,y+38,0],'#493f27',8);line([side*326,y+38,0],[side*310,y+60,0],'#75613a',4);fern(side*343,y+15,1,18)}
}
roundedBox(-286,-273,6,572,546,44,21,['#7d7047','#4d4d31','#3e422a']);roundedBox(-282,-269,8,564,538,40,20,['#ac9364','#716243','#515338']);
c.save();clipFace(roundedPoints(-282,-269,10,564,538,40));
const radius=42,hw=Math.sqrt(3)*radius,gw=7.5*hw;
for(let row=0;row<8;row++)for(let col=0;col<7;col++){
const x=-gw/2+hw/2+(col+(row%2?.5:0))*hw,y=-3.5*1.5*radius+row*1.5*radius,pts=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return[x+Math.cos(a)*41,y+Math.sin(a)*41,10]});
c.save();c.globalAlpha=1-gridSoftness*.87;face(pts,row>=4?((row+col)%2?'#b5a16d':'#c1ac77'):((row+col)%2?'#9e9e67':'#939264'));c.restore();face(pts,'#0000','rgba(58,68,35,'+(.58-gridSoftness*.52)+')');
}
for(let i=0;i<170;i++){const x=-275+random(i+41)*550,y=-260+random(i+91)*520;ellipse(x,y,11,1+random(i+16)*2,.7,i%2?'#e1c28d38':'#5d583b38')}
// Poké Bola pintada na terra, projetada no mesmo plano dos hexágonos.
const circle=(radius,start,end)=>Array.from({length:49},(_,i)=>{const a=start+(end-start)*i/48;return[Math.cos(a)*radius,Math.sin(a)*radius,12]});
face(circle(59,0,Math.PI*2),'#ece5c9','#354b35');
face([[0,0,12],...circle(58,Math.PI,Math.PI*2)],'#c76750');
face([[-58,-3,13],[58,-3,13],[58,3,13],[-58,3,13]],'#354b35');
face(circle(59,0,Math.PI*2),'#0000','#354b35');
face(circle(16,0,Math.PI*2),'#354b35');face(circle(11,0,Math.PI*2),'#eee7ce');face(circle(6,0,Math.PI*2),'#c8cfb1','#80916c');
c.restore();
}
function forestDecor(){
if(!config.decor)return;
// Canteiros nas bordas, fora das casas de combate.
for(const side of [-1,1])for(let i=0;i<6;i++){
 const x=side*(333+(i%2)*9),y=-245+i*101;
 ellipse(x,y,-2,26,10,'#213e2455');
 for(let j=0;j<3;j++)foliage(x+(j-1)*11,y+(j%2)*5,7+j%2*4,17+(i+j)%3*3,['#56853e','#709c49','#426f36'][j]);
 fern(x-side*9,y-11,0,24);flowers(x+side*6,y+14,i+(side+1)*6,1);
 mushroom(x-side*18,y+22,0,8+i%3);if(i%2===0)mushroom(x-side*8,y+27,0,5);
 // Pedras baixas cobertas de musgo entre as plantas.
 if(i%2){const sx=x+side*12,sy=y-27;face([[sx-14,sy,0],[sx-10,sy-10,7],[sx+9,sy-8,10],[sx+16,sy+5,1],[sx-3,sy+12,0]],'#727c57','#a3aa7255');face([[sx-10,sy-10,8],[sx+9,sy-8,11],[sx+6,sy+2,10],[sx-6,sy+3,9]],'#6d9146')}
}
// Portal da trilha com trepadeiras atrás do campo.
for(const x of [-100,100]){roundedBox(x-10,-332,81,20,23,5,88,['#81623b','#57452b','#3d3925']);line([x-4,-308,1],[x-3,-308,73],'#bd986044',2)}
roundedBox(-120,-333,93,240,27,9,17,['#9a7946','#654c2e','#4a4027']);
for(let i=0;i<11;i++){const x=-115+i*23;foliage(x,-320,99+(i%2)*5,15,i%2?'#739c43':'#56853b');if(i%3===0){line([x,-304,90],[x+7,-304,55],'#6d9144',2);for(let j=0;j<3;j++)face([[x+4,-305,80-j*9],[x+14,-305,85-j*9],[x+11,-305,75-j*9]],'#82a453')}}
const sign=point(0,-303,66);c.save();c.translate(sign.x,sign.y);c.fillStyle='#493c27';c.fillRect(-53*sign.s,-12*sign.s,106*sign.s,24*sign.s);c.fillStyle='#e3d7a3';c.font='700 '+10*sign.s+'px Segoe UI';c.textAlign='center';c.fillText('VIRIDIAN',0,4*sign.s);c.restore();
// Troncos caídos e flores nos cantos arredondados do fundo.
for(const side of [-1,1]){
 const x=side*235;
 roundedBox(x-36,-331,12,72,30,12,18,['#8d6d3d','#55452a','#403c25']);
 for(let j=0;j<3;j++)line([x-27,-320+j*6,13],[x+27,-317+j*5,13],'#bea36b55',1);
 foliage(x-8,-320,18,18,'#688e3e');fern(x+side*41,-306,0,26);flowers(x-side*20,-289,side+11,1);
}
// Touceiras ao lado do banco, fora dos hexágonos.
for(const side of [-1,1])for(let i=0;i<3;i++){fern(side*(299+i*15),287+i*6,0,17+i*3);flowers(side*337,293+i*13,30+i+side,0)}
}
function bench(){
// Nove troncos planos numerados sobre travessas de madeira escura.
roundedBox(-315,308,-5,630,94,18,22,['#4d422e','#302e22','#252b20']);
for(const y of [320,363])roundedBox(-309,y,0,618,9,4,10,['#6b4d30','#443622','#332e20']);
for(let i=0;i<9;i++){
 const x=-298+i*66;roundedBox(x,317,11,61,46,11,13,['#b68d50','#694d2f','#57422a']);
 const p=point(x+30,339,12);c.save();c.translate(p.x,p.y);c.scale(1,.65);
 for(let r=6;r<=22;r+=5){c.beginPath();c.ellipse(0,0,r*p.s,(r*.8)*p.s,.08*i,0,Math.PI*2);c.strokeStyle='#77573466';c.lineWidth=p.s;c.stroke()}
 c.font='700 '+12*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#392e21';c.fillText(i+1,0,5*p.s);c.restore();
}
if(config.decor){fern(-313,338,0,18);fern(314,350,0,20);mushroom(-305,375,-2,8);mushroom(309,315,-2,7)}
const p=point(0,409,-12);c.font='600 '+9*p.s+'px Segoe UI';c.textAlign='center';c.fillStyle='#c6cea0';c.fillText('BANCO DO TIME · 9 VAGAS',p.x,p.y);
}

function atmosphere(){
if(config.decor)for(const pond of forestLakes){c.save();clipFace(lakeOutline(pond,.96,-29));for(let i=0;i<4;i++){const age=(time*.24+i*.25)%1,p=point(pond.x+Math.sin(i*9)*pond.rx*.4,pond.y+Math.cos(i*5)*pond.ry*.4,-28);c.strokeStyle='rgba(200,236,210,'+((1-age)*.25)+')';c.lineWidth=p.s;c.beginPath();c.ellipse(p.x,p.y,(6+age*28)*p.s,(2+age*10)*p.s,0,0,Math.PI*2);c.stroke()}c.restore()}
if(config.sunrays){c.save();c.globalCompositeOperation='screen';for(let i=0;i<4;i++){const x=W*(.28+i*.17),sway=Math.sin(time*.16+i)*12,g=c.createLinearGradient(x,0,x+W*.12,H*.75);g.addColorStop(0,'rgba(239,224,151,'+(.07+Math.sin(time*.25+i)*.015)+')');g.addColorStop(1,'#e1df9600');c.fillStyle=g;c.beginPath();c.moveTo(x+sway,0);c.lineTo(x+W*.025+sway,0);c.lineTo(x+W*.21,H*.85);c.lineTo(x+W*.10,H*.85);c.fill()}c.restore()}
const n=Math.round((config.quality==='high'?42:18)*config.leaves/100);
for(let i=0;i<n;i++){const t=time*(9+i%5),x=((random(i+12)*W+t)%(W+100))-50,y=((random(i+48)*H+time*(6+i%3))%(H+90))-45;const s=2+random(i+17)*3;c.save();c.translate(x+Math.sin(time*.8+i)*12,y);c.rotate(time*.6+i);c.scale(1,.35+.5*Math.abs(Math.sin(time+i)));c.fillStyle=['#9eae51','#b3a656','#668f40'][i%3];c.beginPath();c.moveTo(-s,0);c.quadraticCurveTo(0,-s,s,0);c.quadraticCurveTo(0,s,-s,0);c.fill();c.restore()}
}

// Pequenas animações do entorno; o tabuleiro permanece livre.
const forestAnimals=[
 {id:'0010',x:-450,y:120,rx:36,ry:65,rate:.18,durations:[10,10,10]},
 {id:'0016',x:450,y:30,rx:45,ry:70,rate:.14,durations:[6,4,4,4,4]}
].map((a,i)=>{const img=new Image();img.src='assets/pmd/sprite/'+a.id+'/Walk-Anim.png';return{...a,img,phase:i*2}});
const movingCanopy=document.createElement('canvas');movingCanopy.width=180;movingCanopy.height=110;
{
 const brush=movingCanopy.getContext('2d');
 for(let i=0;i<23;i++){const x=30+random(i+6)*120,y=25+random(i+51)*55,r=15+random(i+8)*16,g=brush.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,i%2?'#7fa84e':'#5c9846');g.addColorStop(1,'#254f2d');brush.fillStyle=g;brush.beginPath();brush.ellipse(x,y,r,r*.7,0,0,Math.PI*2);brush.fill()}
}
let nextBirdsong=3,visualElapsed=0,audioElapsed=0,lastAudioMode='';
function birdsong(){
 if(time<nextBirdsong)return;nextBirdsong=time+7+random(Math.floor(time))*8;
 if(!audio||!sound||paused||document.hidden||!config.life)return;
 const now=audio.ctx.currentTime;
 for(let i=0;i<3;i++){const osc=audio.ctx.createOscillator(),gain=audio.ctx.createGain(),start=now+i*.19;osc.type='sine';osc.frequency.setValueAtTime(2400+i*180,start);osc.frequency.exponentialRampToValueAtTime(3800-i*150,start+.06);osc.frequency.exponentialRampToValueAtTime(2700,start+.12);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.18,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.14);osc.connect(gain);gain.connect(audio.gain);osc.start(start);osc.stop(start+.16)}
}
function forestLife(){
 if(!config.life)return;
 if(config.decor)for(const side of [-1,1])for(let i=0;i<3;i++){
  const x=side*(490+random(i+side+30)*140),y=-170+i*170,size=65+random(i+81)*28,p=point(x,y,size*1.5),s=p.s*size/80;
  c.save();c.translate(p.x+Math.sin(time*.65+i)*3*p.s,p.y);c.rotate(Math.sin(time*.5+i)*.018);c.drawImage(movingCanopy,-90*s,-55*s,180*s,110*s);c.restore();
 }
 c.save();c.imageSmoothingEnabled=false;
 for(const animal of forestAnimals){
  if(!animal.img.complete||!animal.img.naturalWidth)continue;
  const a=time*animal.rate+animal.phase,x=animal.x+Math.sin(a)*animal.rx,y=animal.y+Math.cos(a)*animal.ry,
   row=(Math.round((Math.atan2(-Math.sin(a)*animal.ry,Math.cos(a)*animal.rx)-Math.PI/2)/(Math.PI/4))+8)%8,p=point(x,y,-28);
  let tick=(time*60)%animal.durations.reduce((sum,v)=>sum+v,0),frame=0;
  while(frame<animal.durations.length-1&&tick>=animal.durations[frame])tick-=animal.durations[frame++];
  ellipse(x,y,-30,13,4,'#0b201e55');const s=p.s*1.5;c.drawImage(animal.img,frame*32,row*32,32,32,p.x-16*s,p.y-27*s,32*s,32*s);
 }
 c.restore();
 // Borboletas seguem curvas independentes nas margens da clareira.
 for(let i=0;i<(config.quality==='high'?9:4);i++){
  const side=i%2?-1:1,a=time*(.25+i*.015)+i,x=side*(390+i%3*70)+Math.sin(a)*36,y=-220+(i*113)%620+Math.cos(a*.8)*38,p=point(x,y,14+Math.sin(a*2)*14),wing=(.2+.8*Math.abs(Math.sin(time*8+i)))*5*p.s;
  c.save();c.translate(p.x,p.y);c.rotate(Math.sin(a)*.5);c.fillStyle=['#e3b65f','#a4bed6','#d5a9bc'][i%3];for(const sign of [-1,1]){c.beginPath();c.ellipse(sign*wing*.55,0,wing,3.6*p.s,sign*.5,0,Math.PI*2);c.fill()}c.fillStyle='#36452a';c.fillRect(-.6*p.s,-3*p.s,1.2*p.s,6*p.s);c.restore();
 }
 birdsong();
}
function unlockAudio(){unlocked=true}
document.addEventListener('pointerdown',unlockAudio,{once:true});
document.addEventListener('keydown',unlockAudio,{once:true});
function ambientAudio(enabled,volume){
 if(enabled&&unlocked&&!audio){
  try{const ctx=new AudioContext(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),data=buffer.getChannelData(0);let low=0;
   for(let i=0;i<data.length;i++){low=(low+(Math.random()*2-1)*.03)/1.03;data[i]=low*3}
   const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;filter.type='lowpass';filter.frequency.value=1100;gain.gain.value=0;noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();audio={ctx,gain};
  }catch(e){unlocked=false}
 }
 sound=enabled&&!!audio;
 if(audio){audio.gain.gain.setTargetAtTime(sound?volume*.022:0,audio.ctx.currentTime,.25);if(sound&&audio.ctx.state==='suspended'&&unlocked)audio.ctx.resume().catch(()=>{})}
}
return{
 paint(g,layer,isAngled){
  c=g;angled=isAngled;
  if(layer!=='arena'){
   mode='scene';g.fillStyle='#153322';g.fillRect(-640,0,2560,800);forestGround();
  }
  if(layer!=='scene'){
   mode='field';arena();forestDecor();benchMode=true;bench();benchMode=false;
  }
 },
 tick(dt,state){
  const active=state.active,display=active?'block':'none';if(effects.style.display!==display)effects.style.display=display;
  audioElapsed+=dt;const audioMode=[active,state.paused,state.mute,document.hidden,state.sfx].join(':');if(audioMode!==lastAudioMode||audioElapsed>=.5){lastAudioMode=audioMode;audioElapsed=0;ambientAudio(active&&!state.paused&&!state.mute&&!document.hidden,state.sfx)}
  if(!active)return false;
  angled=state.angled;paused=state.paused;config.quality=state.quality;
  if(!paused)time+=dt;
  gridSoftness+=((state.combat?1:0)-gridSoftness)*(1-Math.exp(-dt*5));
  const grid=Math.round(gridSoftness*10),dirty=grid!==lastGrid;lastGrid=grid;
  visualElapsed+=dt;if(visualElapsed<(window.IDLE_PANEL_OPEN ? .1 : 1/30))return dirty;visualElapsed=0;
  c=effects.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,2560,800);c.setTransform(1,0,0,1,640,0);mode='scene';
  if(!document.hidden){forestLife();atmosphere()}
  return dirty;
 }
};
};
