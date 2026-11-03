/* Persistent field visuals derive directly from the gameplay fields and their ages. */
(()=>{
 'use strict';
 const parent=document.getElementById('arenaView'),units=document.getElementById('units');
 if(!parent||!units)return;
 const canvas=document.createElement('canvas');canvas.id='arenaFields';canvas.width=W*2;canvas.height=H*2;
 canvas.style.cssText='position:absolute;left:0;top:0;width:1280px;height:800px;pointer-events:none;image-rendering:pixelated';
 canvas.setAttribute('aria-hidden','true');parent.insertBefore(canvas,units);
 const g=canvas.getContext('2d');
 const styles={
  fire:{color:'#ee7037',tag:'ANIM_TAG_SMALL_EMBER',motion:'flame'},
  wildfire:{color:'#ff9a36',tag:'ANIM_TAG_FIRE',motion:'flame'},
  water:{color:'#43afd0',tag:'ANIM_TAG_WATER_ORB',motion:'water'},
  electric:{color:'#f2d45f',tag:'ANIM_TAG_SPARK',motion:'spark'},
  charged:{color:'#66d4ce',tag:'ANIM_TAG_SPARK',second:'ANIM_TAG_WATER_ORB',motion:'spark'},
  ice:{color:'#a5e9ed',tag:'ANIM_TAG_ICE_CRYSTALS',motion:'ice'},
  frost:{color:'#b7efff',tag:'ANIM_TAG_ICE_CRYSTALS',second:'ANIM_TAG_WATER_ORB',motion:'ice'},
  grass:{color:'#78b85a',tag:'ANIM_TAG_VINE',motion:'roots'},
  bloom:{color:'#93cc65',tag:'ANIM_TAG_FLOWER',second:'ANIM_TAG_VINE',motion:'roots'},
  poison:{color:'#ad77ca',tag:'ANIM_TAG_POISON_BUBBLE',motion:'bubble'},
  spores:{color:'#b6c76c',tag:'ANIM_TAG_POISON_BUBBLE',second:'ANIM_TAG_VINE',motion:'bubble'},
  steam:{color:'#bfdbde',tag:'ANIM_TAG_GRAY_SMOKE',motion:'steam'},
  ground:{color:'#be9c6b',tag:'ANIM_TAG_ROCKS',motion:'dust'},
  rock:{color:'#b8a98a',tag:'ANIM_TAG_ROCKS',motion:'dust'}
 };
 const cells=new WeakMap();
 function affected(f){
  if(cells.has(f))return cells.get(f);
  const result=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(hdist(f.r,f.c,r,c)<=f.radius)result.push({r,c,...hexXY(r,c)});
  cells.set(f,result);return result;
 }
 function pixel(x,y,size,color,alpha){g.globalAlpha=alpha;g.fillStyle=color;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,size,size)}
 function footprint(cell,f,s,fade){
  const phase=f.age,offset=(cell.r*17+cell.c*11)%9;
  g.save();hexPath(g,cell.x,cell.y,S_,.93);g.clip();
  g.globalAlpha=fade*.15;g.fillStyle=s.color;g.fillRect(cell.x-HW/2,cell.y-S_,HW,HH);
  // Pixel dashes show the exact affected cells without a continuous glowing disc.
  g.globalAlpha=fade*.46;g.lineWidth=2;g.strokeStyle=s.color;g.setLineDash([6,6]);hexPath(g,cell.x,cell.y,S_,.88);g.stroke();g.setLineDash([]);
  for(let i=0;i<5;i++){
   const x=cell.x-26+((i*17+offset*3)%52),y=cell.y-24+((i*23+offset*5)%48);
   if(s.motion==='water'||s.motion==='ice'){
    g.globalAlpha=fade*.45;g.strokeStyle=s.color;g.lineWidth=2;g.beginPath();g.moveTo(x-7,y);g.lineTo(x+7,y);g.stroke();
   }else if(s.motion==='roots'){
    g.globalAlpha=fade*.65;g.strokeStyle=s.color;g.lineWidth=2;g.beginPath();g.moveTo(x-8,y+8);g.lineTo(x-8,y);g.lineTo(x,y);g.lineTo(x,y-7);g.lineTo(x+6,y-7);g.stroke();
   }else pixel(x,y,2+(i%2)*2,s.color,fade*(.22+.12*Math.sin(phase*4+i)));
  }
  g.restore();
 }
 function sprites(cell,f,s,fade){
  const low=CFG.fxLevel==='low',reduced=CFG.reduceFx,count=low?1:reduced?2:3;
  for(let i=0;i<count;i++){
   const seed=cell.r*31+cell.c*13+i*19,t=f.age+seed*.07;
   let x=cell.x+(i-(count-1)/2)*18,y=cell.y+4+((seed%3)-1)*10,scale=.6;
   const cycle=(t*.8)%1;
   switch(s.motion){
    case'flame':y-=cycle*18;scale=.68;break;
    case'bubble':y-=cycle*14;scale=.8;break;
    case'steam':y-=cycle*20;scale=.72;break;
    case'water':scale=.48;y+=Math.sin(t*3)*2;break;
    case'spark':scale=.65;break;
    case'ice':scale=.8;break;
    case'roots':scale=.65;break;
    case'dust':scale=.55;break;
   }
   const alpha=fade*(s.motion==='steam'?.38:s.motion==='water'?.5:.8);
   const tag=s.second&&i===count-1?s.second:s.tag;
   const drawn=window.EMERALD_MOVES?.drawResource(g,tag,x,y,scale,t,i,alpha);
   if(!drawn)pixel(x,y-4,4,s.color,alpha);
  }
 }
 function clear(){g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,W,H)}
 window.ARENA_FIELDS={
  attach(f){return !!styles[f.kind]},clear,
  draw(){
   clear();if(!B.on||B.over)return;
   g.imageSmoothingEnabled=false;g.globalCompositeOperation='source-over';
   for(const f of B.fields){
    if(f.age>=f.life||window.ARENA_INTERACTIONS?.handles(f))continue;const s=styles[f.kind];if(!s)continue;
    const fade=Math.min(1,f.age/.12,Math.max(0,(f.life-f.age)/.25));
    for(const cell of affected(f)){footprint(cell,f,s,fade);sprites(cell,f,s,fade)}
   }
   window.HEX_ATTACKS?.draw(g);
   g.globalAlpha=1;
  }
 };
})();
