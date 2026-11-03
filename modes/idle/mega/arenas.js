/* Dedicated Mega habitats. Artwork and opaque courts are exclusive to Mega challenges. */
(()=>{
 'use strict';
 const root=new URL('./assets/',document.currentScript.src),cache=new Map();
 const rows=[
  ['charizard-x','Caldeira das Chamas Azuis','fire','rock','#192d37','#446373','#6ce0ff'],
  ['gengar','Ruínas do Véu Sombrio','psychic','rock','#30243e','#71557d','#c896ff'],
  ['mawile','Santuário do Ferro Florido','blue','metal','#40313b','#94717b','#ffa4cb'],
  ['alakazam','Biblioteca do Horizonte Psíquico','psychic','marble','#443049','#b19367','#edc3ff'],
  ['houndoom','Fortaleza das Brasas Negras','fire','rock','#35262c','#79514a','#ff8967'],
  ['gardevoir','Jardim do Véu Lunar','garden','marble','#29434a','#819f9d','#b2f7e0'],
  ['blastoise','Fortaleza das Marés','blue','rock','#183e59','#6597ad','#6acfff'],
  ['lucario','Santuário da Aura','psychic','marble','#344761','#a48c6c','#73bdff'],
  ['swampert','Manguezal do Abalo Profundo','garden','rock','#284a47','#7a9475','#86d7ad']
 ].concat(window.IDLE_MEGA_EXTRA_ARENAS||[]);
 const registry=new Map();
 window.IDLE_MEGA_ARENAS=rows.map(([key,name,base,tex,dark,light,accent])=>{
  const parent=ARENA_THEMES.find(t=>t.id===base),T={...parent,id:'mega-'+key,name,tex,tile:JSON.parse(JSON.stringify(parent.tile)),wall:{...parent.wall,a:light,b:dark,tex:'rock',trim:accent+'80',moss:null},floor:[dark,dark],disc:dark,glow:accent+'16',vig:'rgba(9,9,19,.25)'};
  for(const side of ['e','p'])T.tile[side]={...T.tile[side],a:side==='e'?[dark,light]:[light,dark],b:[dark,light],side:dark,line:'rgba(10,14,22,.48)',hi:'rgba(255,239,255,.08)',lo:'rgba(0,0,0,.10)'};
  T.scene=function(g,A){let art=cache.get(key);if(!art){const image=new Image();art={image,loaded:false};cache.set(key,art);image.onload=()=>{art.loaded=true;if(ARENA_T?.id===T.id)repaintArena()};image.src=new URL('arena-'+key+'.webp',root).href}
   g.save();g.globalAlpha=1;g.fillStyle=dark;g.fillRect(-640,0,2560,800);if(art.loaded){const width=2560,height=width*art.image.naturalHeight/art.image.naturalWidth;g.imageSmoothingEnabled=true;g.drawImage(art.image,A.CX-width/2,-140,width,height)}g.restore();
  };
  ARENA_THEMES.push(T);const entry={key,id:T.id,name,accent,theme:ARENA_THEMES.length-1};registry.set(T.id,entry);return entry;
 });
 const nativePaint=paintThemed;
 paintThemed=function(g,layer,T){if(!registry.has(T.id))return nativePaint(g,layer,T);const A=arGeo();if(layer!=='arena')T.scene(g,A);if(layer==='scene')return;
  // Keep the deck solid: scenery must never show through the fighting surface.
  g.save();g.globalAlpha=1;aWallT(g,A,T);
  // Fade only the grid, using the same transition as the other themed arenas.
  // The opaque deck, emblem and bench must remain solid throughout combat.
  g.save();g.globalAlpha*=1-LEGACY_HEX_SOFTNESS*.88;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)aHexT(g,r,c,r>=4,T);
  g.restore();aEmblemT(g,T);arWell(g,A);g.restore();
 };
 window.IDLE_MEGA_ARENA_ART={loaded:key=>cache.get(key)?.loaded===true};
})();
