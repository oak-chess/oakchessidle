/* Attack telegraphs use the combat clock and the same range predicates as damage. */
(()=>{
 'use strict';
 const marks=[];
 const halos=new Map();
 const neonStrength=()=>{const n=Number(CFG.hexNeon);return Number.isFinite(n)?Math.max(0,Math.min(2,n)):.5};
 function neon(g,cell,size,color,alpha,soft){
  const strength=neonStrength();if(!strength)return;
  const key=color+':'+size+':'+soft+':'+strength;let bitmap=halos.get(key);
  const extent=72;
  if(!bitmap){
   bitmap=document.createElement('canvas');bitmap.width=bitmap.height=extent*4;
   const ctx=bitmap.getContext('2d');ctx.setTransform(2,0,0,2,0,0);
   ctx.strokeStyle=color;ctx.shadowColor=color;ctx.lineJoin='round';
   ctx.globalAlpha=.55;ctx.shadowBlur=(soft?12:23)*strength;ctx.lineWidth=7;hexPath(ctx,extent,extent,size,.9);ctx.stroke();
   ctx.globalAlpha=.85;ctx.shadowBlur=(soft?5:11)*strength;ctx.lineWidth=3;ctx.stroke();
   if(halos.size>96)halos.clear();halos.set(key,bitmap);
  }
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,alpha*strength);
  g.drawImage(bitmap,cell.x-extent,cell.y-extent,extent*2,extent*2);g.restore();
 }
 function previewNeon(canvas){
  const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.fillStyle='#102739';g.fillRect(0,0,canvas.width,canvas.height);
  ['#ffd84a','#63cfff','#ff8560'].forEach((c,i)=>{const cell={x:68+i*112,y:54},size=36;
   g.fillStyle=c;g.globalAlpha=.2;hexPath(g,cell.x,cell.y,size,.91);g.fill();g.globalAlpha=1;
   neon(g,cell,size,c,.9,!!CFG.reduceFx||CFG.fxLevel==='low');
   g.strokeStyle=c;g.lineWidth=3;hexPath(g,cell.x,cell.y,size,.9);g.stroke();
   g.strokeStyle='#f2fcff';g.lineWidth=1;g.globalAlpha=Math.min(1,.72*neonStrength());g.stroke();g.globalAlpha=1;
  });
 }
 const color=m=>(PAL[m.t]||PAL.normal)[1];
 const all=()=>{const cells=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)cells.push({r,c,...hexXY(r,c)});return cells};
 const tile=p=>p.r!=null?{r:p.r,c:p.c}:hexAt(p.x,p.y+(p.L?0:22));
 function region(center,radius){if(!center)return [];return all().filter(p=>hdist(center.r,center.c,p.r,p.c)<=radius)}
 function line(x1,y1,x2,y2,width){
  const length=Math.hypot(x2-x1,y2-y1)||1;
  return all().filter(p=>distSeg(p.x,p.y-22,x1,y1,x2,y2)<=width).map(p=>({...p,progress:Math.max(0,Math.min(1,((p.x-x1)*(x2-x1)+(p.y-22-y1)*(y2-y1))/(length*length)))}));
 }
 function add(o){if(marks.length>=100)marks.shift();const m={start:B.t,life:.6,charge:.2,cells:[],...o};marks.push(m);return m}
 function prepare(u,t,mv,rc){
  if(!t)return null;
  const radius=mv.r||(mv.k==='meteor'?1:mv.p>=1.8?2:1),base={u,t,mv,color:color(mv),radius};
  if(mv.k==='beam')return add({...base,mode:'beam',charge:.25,life:.7,tracking:true});
  if(['blast','meteor','field'].includes(mv.k))return add({...base,mode:'area',charge:mv.k==='meteor'?.75:mv.k==='field'?.25:.3,life:mv.k==='meteor'?1.8:mv.k==='field'?.6:1.4,center:tile(t),tracking:mv.k==='blast'});
  if(mv.k==='burst'||mv.k==='buff'||mv.k==='barrier')return add({...base,mode:'area',charge:.2,life:.55,tracking:true,centerOwner:true,radius:mv.k==='buff'?2:mv.k==='barrier'?(u.L.passive.id==='barrierweaver'?2:1):radius});
  if(mv.k==='rush')return add({...base,mode:'rush',charge:({dive:.34,dig:.38,roll:.3,spin:.3,flyby:.2,claw:.24,head:.24}[rc.rush]||.22),life:.65});
  if(mv.k==='heal'){
   const ally=B.units.filter(a=>a.alive&&a.side===u.side).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
   return add({...base,t:ally||u,mode:'area',charge:.3,life:.6,tracking:true,radius:1});
  }
  if(['storm','multi','chain'].includes(mv.k))return null; // Mark only the targets actually selected.
  return add({...base,mode:'target',charge:.2,life:.55,tracking:true});
 }
 function beam(mark,x1,y1,x2,y2){
  if(!mark)return;mark.tracking=false;mark.cells=line(x1,y1,x2,y2,HW*.55);mark.fired=B.t;mark.life=B.t-mark.start+.42;
 }
 function projectile(p){
  if(!p.o?.move)return;
  const seed=p.o.preview;if(seed)seed.life=Math.min(seed.life,B.t-seed.start+.04);
  const mv=p.o.move,area=['blast','meteor'].includes(mv.k);
  const falling=!!p.o.falling||mv.k==='meteor';
  p.hexMark=add({mode:'projectile',p,mv,color:color(mv),radius:mv.r||(mv.k==='meteor'?1:mv.p>=1.8?2:1),area,small:!!mv.passive,falling,charge:falling?p.D0/p.sp:0,life:8});
 }
 function arrive(p){const m=p.hexMark;if(!m)return;m.mode='impact';m.center=tile(p.tgt);m.cells=region(m.center,m.area?m.radius:0);m.fired=B.t;m.life=B.t-m.start+.32;delete m.p}
 function signature(g,cell,m,age,fill,fade,reduced){
  const type=m.mv?.t;if(!type)return;
  const center=m.centerOwner?tile(m.u):m.center||tile(m.t||m.p?.tgt||cell),distance=center?hdist(center.r,center.c,cell.r,cell.c):0;
  const phase=reduced?fill:(age*2-distance*.22)%1,x=cell.x,y=cell.y;
  g.save();g.setLineDash([]);hexPath(g,x,y,S_,m.small?.61:.78);g.clip();
  g.strokeStyle=m.color;g.fillStyle=m.color;g.lineWidth=2;g.globalAlpha=fade*.6;
  if(type==='ground'||type==='rock'){
   // Staggered cracks spread outwards across the selected area.
   g.globalAlpha*=Math.max(.2,1-Math.abs(phase-.5));
   g.beginPath();g.moveTo(x-25,y+12);g.lineTo(x-12,y+5);g.lineTo(x-17,y-2);g.lineTo(x+2,y-8);g.lineTo(x+8,y+1);g.lineTo(x+25,y-13);g.stroke();
  }else if(type==='grass'||type==='bug'){
   g.beginPath();g.moveTo(x-26,y+16);g.lineTo(x-16,y+16);g.lineTo(x-16,y+3);g.lineTo(x,y+3);g.lineTo(x,y-11);g.lineTo(x+16,y-11);g.lineTo(x+16,y-22);g.stroke();
   g.fillRect(x-18,y+5,5,3);g.fillRect(x+2,y-10,5,3);
  }else if(type==='water'||type==='flying'){
   for(let j=0;j<3;j++){const yy=y-20+j*15+(reduced?0:Math.sin(age*5+j)*3);g.beginPath();g.moveTo(x-30,yy);g.lineTo(x-14,yy);g.lineTo(x-8,yy-4);g.lineTo(x+8,yy-4);g.lineTo(x+14,yy);g.lineTo(x+30,yy);g.stroke()}
  }else if(type==='ice'){
   for(let j=0;j<3;j++){const xx=x-17+j*17,yy=y-22+((phase+j*.31)%1)*42;g.beginPath();g.moveTo(xx,yy-6);g.lineTo(xx+4,yy);g.lineTo(xx,yy+6);g.lineTo(xx-4,yy);g.closePath();g.stroke()}
  }else if(['psychic','ghost','fairy','dragon','dark'].includes(type)){
   const radius=9+phase*19;g.beginPath();g.rect(x-radius,y-radius*.6,radius*2,radius*1.2);g.stroke();
  }else if(type==='fire'||type==='poison'){
   for(let j=0;j<3;j++){const yy=y+18-((phase+j*.3)%1)*35;g.fillRect(x-20+j*17,yy,4,7);g.fillRect(x-18+j*17,yy-4,2,4)}
  }else{
   g.beginPath();g.moveTo(x-12,y);g.lineTo(x+12,y);g.moveTo(x,y-12);g.lineTo(x,y+12);g.stroke();
  }
  g.restore();
 }
 function particles(g,cell,m,age,fill,fade,lit,count,reduced){
  const type=m.mv?.t,seed=cell.r*37+cell.c*19;
  g.save();g.setLineDash([]);g.lineWidth=2;
  for(let j=0;j<count;j++){
   const cycle=(age*(reduced?.55:1.1)+j/count+seed*.013)%1;
   const angle=(j*2.399+seed*.7)+(reduced?0:age*.45);
   const radius=lit?8+cycle*27:34-cycle*24;
   const x=Math.round((cell.x+Math.cos(angle)*radius)/2)*2;
   const y=Math.round((cell.y+Math.sin(angle)*radius*.68-cycle*(lit?12:3))/2)*2;
   const alpha=fade*Math.sin(cycle*Math.PI)*(.55+fill*.35),size=j%3===0?4:2;
   g.globalAlpha=alpha;g.fillStyle=j%3===0?'#fff5cf':m.color;g.strokeStyle=m.color;
   if(type==='water'||type==='poison'){
    g.strokeRect(x-3,y-3,6,6);g.fillRect(x-1,y-3,2,2);
   }else if(type==='ice'){
    g.fillRect(x-1,y-4,2,8);g.fillRect(x-4,y-1,8,2);
   }else if(type==='electric'){
    g.beginPath();g.moveTo(x+3,y-5);g.lineTo(x-2,y);g.lineTo(x+2,y);g.lineTo(x-3,y+5);g.stroke();
   }else if(type==='grass'||type==='bug'){
    g.fillRect(x,y-3,4,6);g.fillRect(x-2,y,2,4);
   }else{
    g.fillRect(x,y,size,size);if(j%3===0){g.globalAlpha=alpha*.4;g.fillRect(x-2,y+size,2,size+2)}
   }
  }
  g.restore();
 }
 function draw(g){
  if(CFG.movePreview===false)return;
  if(!B.on||B.over){marks.length=0;return;}
  const reduced=!!CFG.reduceFx,low=CFG.fxLevel==='low';let particleBudget=low?72:reduced?140:CFG.fxLevel==='high'?420:280;
  for(let i=marks.length-1;i>=0;i--){const m=marks[i],age=B.t-m.start;if(age>=m.life){marks.splice(i,1);continue;}
   let cells=m.cells,head=null;
   if(m.mode==='beam'&&m.tracking){const x=m.u.x,y=cyOf(m.u),dx=m.t.x-x,dy=cyOf(m.t)-y,length=Math.hypot(dx,dy)||1;cells=line(x,y,x+dx/length*HW*8,y+dy/length*HW*8,HW*.55)}
   if(m.mode==='area')cells=region(m.tracking?tile(m.centerOwner?m.u:m.t):m.center,m.radius);
   if(m.mode==='target')cells=region(tile(m.t),0);
   if(m.mode==='rush')cells=line(m.u.x,cyOf(m.u),m.t.x,cyOf(m.t),HW*.38);
   if(m.mode==='link')cells=line(m.u.x,cyOf(m.u),m.t.x,cyOf(m.t),HW*.38);
   if(m.mode==='projectile'){
    const p=m.p;cells=line(p.x+(p.ox||0),p.y+(p.oy||0),p.lx,p.ly,HW*.38);head=hexAt(p.x+(p.ox||0),p.y+(p.oy||0)+22);
    if(m.area){const area=region(tile(p.tgt),m.radius);cells=[...cells.filter(c=>!area.some(a=>a.r===c.r&&a.c===c.c)),...area]}
    if(m.falling){cells=region(tile(p.tgt),m.area?m.radius:0);head=null;}
   }
   const loaded=m.fired!=null||age>=m.charge,fill=Math.min(1,age/Math.max(.05,m.charge)),fade=Math.min(1,(m.life-age)/.16);
   g.save();g.fillStyle=m.color;g.strokeStyle=m.color;g.lineWidth=2;
   for(const cell of cells){
    const size=S_*(m.small?.72:1);
    const isHead=(head&&head.r===cell.r&&head.c===cell.c)||(m.mode==='path'&&Math.abs(fill-(cell.progress||0))<.2);
    const sweep=m.fired!=null&&m.mode==='beam'?Math.max(0,1-Math.abs((B.t-m.fired)/.22-(cell.progress||0))*3):0;
    const lit=loaded||(m.mode==='path'&&fill>=(cell.progress||0));
    const pulse=reduced?1:.91+.09*Math.sin(age*6+cell.r+cell.c);
    // Broad dark edge keeps the elemental outline readable on bright arenas.
    g.setLineDash([]);g.globalAlpha=fade*.65;g.strokeStyle='#091625';g.lineWidth=m.small?4:7;hexPath(g,cell.x,cell.y,size,.92);g.stroke();
    neon(g,cell,size,m.color,fade*pulse*(isHead?1:lit?.9:.58+fill*.22),low||reduced);
    g.fillStyle=m.color;g.globalAlpha=fade*pulse*(isHead?.48:lit?.28+sweep*.17:.14+fill*.14);hexPath(g,cell.x,cell.y,size,.91);g.fill();
    g.strokeStyle=m.color;g.lineWidth=low||m.small?3:4;g.globalAlpha=fade*.96;g.setLineDash(loaded?[]:[8,4]);g.lineDashOffset=reduced?0:-age*22;hexPath(g,cell.x,cell.y,size,.9);g.stroke();
    g.save();g.globalCompositeOperation='lighter';g.setLineDash([]);g.lineWidth=1.8;g.strokeStyle=m.color;g.globalAlpha=Math.min(1,neonStrength()*fade*(isHead?1:lit?.9:.6+fill*.3));hexPath(g,cell.x,cell.y,size,.9);g.stroke();g.strokeStyle='#f2fcff';g.lineWidth=1;g.globalAlpha=Math.min(1,neonStrength()*fade*(isHead?.95:lit?.72:.38+fill*.25));g.stroke();g.restore();
    if(!loaded){g.save();hexPath(g,cell.x,cell.y,size,.86);g.clip();g.fillStyle=m.color;g.globalAlpha=fade*.24;g.fillRect(cell.x-HW/2,cell.y+size-size*2*fill,HW,size*2*fill);g.globalAlpha=fade*.8;g.fillStyle='#fff4cf';g.fillRect(cell.x-HW/2,cell.y+size-size*2*fill,HW,2);g.restore()}
    if(!low)signature(g,cell,m,age,fill,fade,reduced);
    const count=Math.min(particleBudget,m.small?2:low?2:reduced?3:isHead?8:5);
    if(count>0){particles(g,cell,m,age,fill,fade,lit,count,reduced);particleBudget-=count}
   }
   g.restore();
  }
 }
 function bonusHex(g,cell,tint,alpha=1,riseTime=null){
  const soft=!!CFG.reduceFx||CFG.fxLevel==='low';
  g.save();g.setLineDash([]);
  // Light only: do not cover the floor texture with a dark rim or flat tint.
  g.globalCompositeOperation='lighter';
  neon(g,cell,S_,tint,alpha*1.2,soft);
  g.globalAlpha=alpha*.95;g.strokeStyle=tint;g.lineWidth=3;hexPath(g,cell.x,cell.y,S_,.9);g.stroke();
  g.strokeStyle='#ffffff';g.lineWidth=1.4;g.globalAlpha=alpha*Math.min(1,.9*neonStrength());g.stroke();g.restore();
  if(riseTime==null||soft||neonStrength()<=0)return;
  g.save();g.setLineDash([]);g.globalCompositeOperation='lighter';
  const power=Math.min(1.6,Math.sqrt(neonStrength())*1.8),offset=(cell.x*.003+cell.y*.002)%1;
  neon(g,cell,S_,tint,alpha*1.5,false);
  // Continuous, overlapping tongues rooted in the hex edges, not rising copies.
  for(let i=0;i<12;i++){
   const edge=i/2,a=(Math.floor(edge)*60-30)*Math.PI/180,b=a+Math.PI/3,k=edge%1;
   const x=cell.x+S_*.89*(Math.cos(a)*(1-k)+Math.cos(b)*k),y=cell.y+S_*.89*(Math.sin(a)*(1-k)+Math.sin(b)*k);
   const beat=riseTime*4.4+i*1.7+offset*6.28,height=24+13*Math.sin(beat)**2+8*Math.sin(beat*.63)**2,width=6+3*Math.sin(beat+1)**2,sway=5*Math.sin(beat*.8);
   const plume=g.createLinearGradient(x,y+4,x,y-height);plume.addColorStop(0,tint+'ee');plume.addColorStop(.35,tint+'bb');plume.addColorStop(.72,tint+'66');plume.addColorStop(1,tint+'00');
   g.globalAlpha=alpha*Math.min(.85,power*.66);g.fillStyle=plume;g.shadowColor=tint;g.shadowBlur=8*power;
   g.beginPath();g.moveTo(x-width,y+3);g.bezierCurveTo(x-width*1.2,y-height*.3,x+sway-width*.4,y-height*.55,x+sway,y-height);g.bezierCurveTo(x+sway+width*.6,y-height*.5,x+width,y-height*.2,x+width,y+3);g.closePath();g.fill();
   g.globalAlpha=alpha*.45*Math.min(1,power);g.fillStyle='#fff0ff';g.shadowBlur=3;g.beginPath();g.moveTo(x-2,y);g.quadraticCurveTo(x+sway*.5,y-height*.25,x+sway*.65,y-height*.55);g.quadraticCurveTo(x+3,y-height*.2,x+2,y);g.fill();
  }
  for(let i=0;i<4;i++){const p=(riseTime*.65+i*.25+offset)%1,a=i*Math.PI/2+offset*6.28,x=cell.x+Math.cos(a)*29,y=cell.y+Math.sin(a)*20-p*42;g.globalAlpha=alpha*Math.sin(p*Math.PI)*.85*Math.min(1,power);g.fillStyle='#f9e9ff';g.shadowBlur=6;g.fillRect(x,y,2.5,4)}
  g.restore();
 }
 window.HEX_ATTACKS={prepare,beam,projectile,arrive,draw,previewNeon,bonusHex,
  reaction(t,type='steel',life=.45){if(!t||!B.on||B.over)return;return add({mode:'target',t,mv:{t:type},small:true,color:color({t:type}),charge:0,life})},
  retaliation(u,t,type){if(!u||!t||!B.on||B.over)return;add({mode:'link',u,t,mv:{t:type},small:true,color:color({t:type}),charge:0,life:.3})},
  target(t,mv,delay=.15,small=false){return add({mode:'target',t,mv,small,color:color(mv),charge:delay,life:delay+.3})},
  activate(mark,t){if(!mark)return;mark.mode='impact';mark.cells=region(tile(t),0);mark.fired=B.t;mark.life=B.t-mark.start+.25},
  lock(mark,r,c){if(mark){mark.center={r,c};mark.tracking=false}},
  link(u,t,mv,delay){add({mode:'link',u,t,color:color(mv),charge:delay,life:delay+.32})},
  path(u,path,type,duration){add({mode:'path',mv:{t:type},color:color({t:type}),cells:[{r:u.r,c:u.c},...path].map((p,i)=>Array.isArray(p)?{r:p[0],c:p[1],...hexXY(p[0],p[1]),progress:i/path.length}:{...p,...hexXY(p.r,p.c),progress:0}),charge:duration,life:duration+.25})},
  clear(){marks.length=0}
 };
})();
