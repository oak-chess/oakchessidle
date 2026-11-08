/* Approved stadium artwork follows the original game's camera. No camera override. */
(()=>{
 'use strict';
 const image=new Image();let requested=false,loaded=false;
 const base=ARENA_THEMES.find(t=>t.id==='garden')||ARENA_THEMES[0];
 const T={...base,id:'idle-pvp-stadium',name:'Estádio da Liga',tile:JSON.parse(JSON.stringify(base.tile)),ring:['#123a4666','#8ce9ed88'],emb:'orb',floor:['#263f55','#29485b'],glow:'rgba(49,220,255,.08)',vig:'rgba(0,20,35,.08)'};
 ARENA_THEMES.push(T);const entry={id:T.id,name:T.name,accent:'#6ce8ff',theme:ARENA_THEMES.length-1};window.IDLE_PVP_ARENAS=[entry];
 image.onload=()=>{loaded=true;if(ARENA_TID===entry.theme)repaintArena()};
 function load(){if(!requested){requested=true;image.src='modes/idle/arena-pvp/stadium-v3.webp'}}
 function scenery(g){load();g.save();g.fillStyle='#304a5d';g.fillRect(-640,-256,2560,H+512);if(loaded){const width=H*image.naturalWidth/image.naturalHeight;g.imageSmoothingEnabled=true;g.drawImage(image,W/2-width/2,0,width,H)}g.restore()}
 // Only native hexagons are drawn over the baked floor. The frame is already in the scenery.
 function field(g){const fade=LEGACY_HEX_SOFTNESS;g.save();g.shadowBlur=0;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=hexXY(r,c);hexPath(g,p.x,p.y,S_-1,perspectiveScale(r));g.fillStyle=r<4?'rgba(56,22,65,'+(.15*(1-fade*.92))+')':'rgba(0,46,67,'+(.17*(1-fade*.92))+')';g.fill();g.strokeStyle=r<4?'rgba(244,117,208,'+(.9*(1-fade*.94))+')':'rgba(108,234,255,'+(.9*(1-fade*.94))+')';g.lineWidth=1.55;g.stroke()}g.restore();aEmblemT(g,T)}
 const nativeEmblem=aEmblemT;aEmblemT=function(g,t){if(t.id===T.id)return arBall(g,W/2,BY+HH/2+3.5*RH,57);return nativeEmblem(g,t)};
 const originalPaint=paintArena;paintArena=function(g,part='all'){if(ARENA_TID!==entry.theme)return originalPaint(g,part);if(part!=='arena')scenery(g);if(part!=='scene')field(g)};
 const originalTheme=setArenaTheme;setArenaTheme=function(id){const active=id===entry.theme;if(document.body.classList.contains('idle-arena-stadium')!==active)document.body.classList.toggle('idle-arena-stadium',active);return originalTheme(id)};
 // Reuse the reserve slots and hitboxes; only add their approved cyan trim.
 const originalGrid=drawGrid;drawGrid=function(...args){const result=originalGrid.apply(this,args);if(ARENA_TID===entry.theme){gx.save();gx.setTransform(CS,0,0,CS,640*CS,0);gx.strokeStyle='#78e7f4';gx.lineWidth=1.2;for(let i=0;i<9;i++){const p=benchXY(i);arRR(gx,p.x-SLOT/2,p.y-SLOT/2,SLOT,SLOT,9);gx.stroke()}gx.restore()}return result};
 window.IDLE_ARENA_STADIUM={theme:entry.theme,get loaded(){return loaded},get requested(){return requested}};
})();
