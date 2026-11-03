/* Animated details follow the coordinates of the painted panorama. No gameplay state. */
window.createVillageAmbience=function({image,width=2560,height=760,night=false}){
 let canvas,g,water,foliage=[],last=-1,frames=0;
 const sw=2172,sh=724;
 const lake=[[.11,.30],[.12,.285],[.145,.29],[.15,.33],[.21,.365],[.27,.38],[.32,.43],[.35,.48],[.40,.57],[.415,.66],[.44,.75],[.46,.82],[.49,.92],[.50,1],[.23,1],[.21,.94],[.17,.91],[.12,.88],[.10,.81],[.075,.77],[.065,.70],[.04,.66],[.02,.59],[0,.57],[0,.53],[.045,.52],[.06,.49],[.095,.47],[.10,.42],[.085,.39],[.10,.36]];
 const leaves=Array.from({length:32},(_,i)=>({x:((i*137)%1000)/1000,y:.08+((i*73)%720)/1000,phase:i*1.91,speed:.026+(i%5)*.0035}));
 function path(points,context){context.beginPath();points.forEach(([x,y],i)=>i?context.lineTo(x*sw,y*sh):context.moveTo(x*sw,y*sh));context.closePath()}
 function prepare(){
  if(water||!image.complete||!image.naturalWidth)return;
  water=document.createElement('canvas');water.width=sw;water.height=sh;const w=water.getContext('2d');path(lake,w);w.clip();w.drawImage(image,0,0,sw,sh);
  w.globalCompositeOperation='destination-out';path([[.292,.515],[.365,.47],[.402,.515],[.355,.61],[.30,.635]],w);w.fill();
  for(const [x,y,rx,ry]of [[.285,.5,.024,.023],[.31,.855,.041,.045],[.13,.8,.052,.04],[.385,.94,.027,.029]]){w.beginPath();w.ellipse(x*sw,y*sh,rx*sw,ry*sh,0,0,Math.PI*2);w.fill()}
  for(const [x,y,rx,ry]of [[.365,.085,.068,.09],[.31,.18,.035,.06],[.43,.20,.027,.06],[.76,.30,.047,.08],[.92,.10,.06,.10],[.96,.30,.035,.09],[.25,.90,.05,.07],[.55,.65,.035,.06],[.79,.89,.045,.06]]){
   const patch=document.createElement('canvas'),pw=Math.ceil(rx*sw*2),ph=Math.ceil(ry*sh*2);patch.width=pw;patch.height=ph;const c=patch.getContext('2d');c.drawImage(image,(x-rx)*image.naturalWidth,(y-ry)*image.naturalHeight,rx*2*image.naturalWidth,ry*2*image.naturalHeight,0,0,pw,ph);c.globalCompositeOperation='destination-in';c.save();c.scale(pw,ph);const mask=c.createRadialGradient(.5,.5,.08,.5,.5,.5);mask.addColorStop(0,'#000');mask.addColorStop(.65,'#000c');mask.addColorStop(1,'#0000');c.fillStyle=mask;c.fillRect(0,0,1,1);c.restore();foliage.push({patch,x:(x-rx)*sw,y:(y-ry)*sh})
  }
 }
 function mount(root){canvas=document.createElement('canvas');canvas.id='rv-village-ambience';canvas.width=sw;canvas.height=sh;canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',left:'-640px',top:'0',width:width+'px',height:height+'px',pointerEvents:'none',zIndex:'0'});g=canvas.getContext('2d');root.prepend(canvas)}
 function draw(time,reduced=false){
  if(!g)return;if(reduced){g.clearRect(0,0,sw,sh);canvas.dataset.active='false';return}if(time-last<1/30)return;last=time;prepare();g.clearRect(0,0,sw,sh);if(!water)return;canvas.dataset.active='true';canvas.dataset.frames=String(++frames);
  const breeze=.8+Math.sin(time*.48)*.2;
  g.save();g.globalAlpha=.94;for(let y=Math.floor(sh*.28);y<sh;y+=5){const offset=(Math.sin(y*.065-time*1.25)*1.9+Math.sin(y*.025+time*.65)*.9)*breeze;g.drawImage(water,0,y,sw,Math.min(5,sh-y),offset,y,sw,Math.min(5,sh-y))}g.restore();
  g.save();path(lake,g);g.clip();for(let i=0;i<26;i++){const p=(time*.18+i*.417)%1,x=sw*(.025+(i*.037)% .38),y=sh*(.40+(i*.061)% .58);g.strokeStyle=i%4===0?'#ffebac':'#c3f5ed';g.globalAlpha=Math.sin(p*Math.PI)*.24;g.lineWidth=.8;g.beginPath();g.ellipse(x+Math.sin(time*.6+i)*3,y,4+p*12,1+p*1.3,0,.05,Math.PI*.88);g.stroke()}
  for(const [i,x,y]of [[0,.21,.68],[1,.28,.77],[2,.16,.52]]){const p=(time*.14+i*.34)%1;g.strokeStyle='#d3fff3';g.globalAlpha=Math.sin(p*Math.PI)*.17;g.lineWidth=.75;for(let ring=0;ring<2;ring++){g.beginPath();g.ellipse(x*sw,y*sh,7+p*25+ring*8,2+p*5+ring*1.5,0,0,Math.PI*2);g.stroke()}}g.restore();
  foliage.forEach(({patch,x,y},i)=>{g.save();g.globalAlpha=.86;g.translate(x+patch.width/2,y+patch.height);g.rotate(Math.sin(time*1.25+i*.7)*.017*breeze);g.drawImage(patch,-patch.width/2+Math.sin(time*1.15+i)*3.5*breeze,-patch.height+Math.sin(time*.91+i)*1.3);g.restore()});
  for(const leaf of leaves){const x=((leaf.x+time*leaf.speed)%1.12-.06)*sw,y=(leaf.y+Math.sin(time*1.4+leaf.phase)*.047)*sh;g.save();g.translate(x,y);g.rotate(Math.sin(time*2.2+leaf.phase)*1.1+time*.65);g.scale(1,.35+Math.abs(Math.sin(time*1.8+leaf.phase))*.65);g.globalAlpha=.83;g.fillStyle=night?(leaf.phase%3>1?'#d58c38':'#b0602c'):(leaf.phase%3>1?'#d5bb4e':'#789342');g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(0,-5.3,6,0);g.quadraticCurveTo(0,4.2,-5,0);g.fill();g.strokeStyle=night?'#efba79':'#e0e29c';g.lineWidth=.6;g.beginPath();g.moveTo(-4,0);g.lineTo(4,0);g.stroke();g.restore()}
  if(night){
   g.save();path(lake,g);g.clip();for(let i=0;i<3;i++){const x=(.12+Math.sin(time*.09+i*2)*.035+i*.065)*sw,y=(.45+i*.12)*sh;g.save();g.translate(x,y);g.scale(1,.13);const fog=g.createRadialGradient(0,0,0,0,0,150);fog.addColorStop(0,'#bac0ef24');fog.addColorStop(1,'#a8bfef00');g.fillStyle=fog;g.fillRect(-150,-150,300,300);g.restore()}g.restore();
   g.save();g.globalCompositeOperation='screen';[[.302,.525],[.36,.49],[.591,.387],[.659,.425],[.536,.532],[.575,.665],[.68,.795],[.825,.705]].forEach(([x,y],i)=>{const pulse=.58+Math.sin(time*3.1+i*1.7)*.20+Math.sin(time*5.7+i*3)*.11,r=22+pulse*16,glow=g.createRadialGradient(x*sw,y*sh,0,x*sw,y*sh,r);glow.addColorStop(0,'rgba(255,150,48,'+(pulse*.37)+')');glow.addColorStop(1,'#ff7c2100');g.fillStyle=glow;g.fillRect(x*sw-r,y*sh-r,r*2,r*2)});
   for(let i=0;i<14;i++){const x=(.30+(i*.047)% .52)*sw+Math.sin(time*.37+i)*13,y=(.33+(i*.071)% .48)*sh+Math.cos(time*.52+i)*9,alpha=Math.max(0,Math.sin(time*1.3+i*2.3))*.7;g.globalAlpha=alpha;g.fillStyle=i%3?'#ffc76b':'#b69eff';g.beginPath();g.arc(x,y,1.5,0,Math.PI*2);g.fill()}g.restore();
  }
 }
 return {mount,draw};
};
