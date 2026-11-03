/* Illustrated, asymmetric habitat landmarks. Idle production renderer. */
(()=>{
 'use strict';
 const registry=new Map(),recent=[];
 for(const study of window.IDLE_LEGENDARY_ARENAS||[]){
  const T=ARENA_THEMES[study.theme],entry={...study,background:null,decoration:null};registry.set(T.id,entry);
  T.tex='habitat-floor';T.emb=T.id+'-quiet-seal';EMB[T.emb]=()=>{};
  // No inherited gym plates, flags, hazardous metal tiles or type-shaped objects.
  for(const side of ['e','p']){T.tile[side].hi='rgba(255,255,240,.06)';T.tile[side].lo='rgba(0,10,15,.06)';T.tile[side].line='rgba(19,29,31,.42)'}
  if(T.wall.tex==='plate')T.wall.tex='rock';

 }
 const nativePaint=paintThemed;
 const ready=image=>!!image?.complete&&image.naturalWidth>0;
 function clusterBounds(image,layout){
  const width=image.naturalWidth,height=image.naturalHeight,result=[];
  const valid=layout?.width===width&&layout?.height===height&&layout.clusters?.length===2;
  const bounds=valid?layout.clusters:[{side:-1,x:0,y:0,w:Math.floor(width/2),h:height},{side:1,x:Math.floor(width/2),y:0,w:width-Math.floor(width/2),h:height}];
  for(const box of bounds){const {side,w,h}=box,x0=box.x,y0=box.y,x1=x0+w-1,y1=y0+h-1;
   if(w>0&&h>0){const surface=document.createElement('canvas');surface.width=w;surface.height=h;const paint=surface.getContext('2d');paint.drawImage(image,x0,y0,w,h,0,0,w,h);
    // Soften only edges cut by the source canvas, to blend into the habitat.
    paint.globalCompositeOperation='destination-in';
    if(x0<2||x1>width-3){const fade=paint.createLinearGradient(0,0,w,0);fade.addColorStop(0,x0<2?'#0000':'#000');fade.addColorStop(.18,'#000');fade.addColorStop(.82,'#000');fade.addColorStop(1,x1>width-3?'#0000':'#000');paint.fillStyle=fade;paint.fillRect(0,0,w,h)}
    if(y0<2||y1>height-3){const fade=paint.createLinearGradient(0,0,0,h);fade.addColorStop(0,y0<2?'#0000':'#000');fade.addColorStop(.1,'#000');fade.addColorStop(.9,'#000');fade.addColorStop(1,y1>height-3?'#0000':'#000');paint.fillStyle=fade;paint.fillRect(0,0,w,h)}
    result.push({side,x:x0,y:y0,w,h,surface});
   }
  }return result;
 }
 paintThemed=function(g,layer,T){
  const entry=registry.get(T.id);if(!entry)return nativePaint(g,layer,T);
  if(!entry.decoration&&!entry.failed){const image=new Image();entry.decoration=image;recent.push(T.id);while(recent.length>4){const old=registry.get(recent.shift());old.decoration=null;old.clusters=null;}image.onload=()=>{if(entry.decoration!==image)return;entry.clusters=clusterBounds(image,window.LEGEND_DECORATION_LAYOUTS?.[T.id]);if(ARENA_T?.id===T.id)repaintArena()};image.onerror=()=>{entry.failed=true};image.src='modes/idle/arena-art/'+T.id+'-decoration.webp';}
  const A=arGeo();if(layer!=='arena')T.scene(g,A);if(layer==='scene')return;
  // Solid native deck and rim must remain opaque, independently of hex softness.
  g.save();g.globalAlpha=1;aWallT(g,A,T);
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
   aHexT(g,r,c,r>=4,T);
  }
  g.restore();aEmblemT(g,T);arWell(g,A);
  if(ready(entry.decoration)){
   // Single coherent composition, never mirrored or repeated down the sides.
   const size=Math.max(A.WR-A.WL,A.WB-A.WT)+500,x=A.CX-size/2,y=A.WT-105;
   g.save();
   // Guarantee the combat area and bench stay unobstructed even at narrow sizes.
   g.beginPath();g.rect(x-2,y-2,size+4,size+4);g.rect(A.FL-9,A.FT-9,A.FR-A.FL+18,A.FB-A.FT+18);g.clip('evenodd');
   g.beginPath();g.rect(x-2,y-2,size+4,size+4);g.rect(BX-18,BENCH_Y-12,BW+36,SLOT+30);g.clip('evenodd');
   g.imageSmoothingEnabled=true;
   for(const cluster of entry.clusters||[]){
    const scale=Math.min(170/cluster.w,320/cluster.h),w=cluster.w*scale,h=cluster.h*scale;
    const dx=cluster.side<0?A.FL-22-w:A.FR+22,dy=A.WT+(cluster.y+cluster.h*.5)/entry.decoration.naturalHeight*(A.WB-A.WT)-h*.5;
    g.drawImage(cluster.surface,dx,dy,w,h);
   }
   g.restore();
  }
 };
 window.IDLE_LEGEND_DECORATIONS={version:3,ids:[...registry.keys()],get current(){return registry.get(ARENA_T?.id)},get ready(){const current=registry.get(ARENA_T?.id);return ready(current?.decoration)&&current.clusters?.length===2}};
 repaintArena();
})();
