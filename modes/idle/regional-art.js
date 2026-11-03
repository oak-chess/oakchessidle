/* Lazy regional environments; native scene remains available on loading failure. */
(()=>{
 'use strict';
 const cache=new Map(),entries=[...IDLE_JOHTO_ARENAS,...IDLE_HOENN_ARENAS,...IDLE_LEGENDARY_ARENAS];
 function resource(id){if(cache.has(id)){const e=cache.get(id);cache.delete(id);cache.set(id,e);return e}const image=new Image(),e={image,loaded:false};cache.set(id,e);image.onload=()=>{e.loaded=true;if(ARENA_T?.id===id)repaintArena()};image.src='modes/idle/arena-art/'+id+'.webp';while(cache.size>4)cache.delete(cache.keys().next().value);return e}
 for(const entry of entries){const T=ARENA_THEMES[entry.theme],fallback=T.scene;T.scene=function(g,A){const art=resource(T.id);if(!art.loaded)return fallback.call(this,g,A);const width=2560,height=width*art.image.naturalHeight/art.image.naturalWidth;g.save();g.fillStyle=T.wall.a;g.fillRect(-640,0,2560,800);g.imageSmoothingEnabled=true;g.drawImage(art.image,A.CX-width/2,-140,width,height);g.restore()}}
 window.IDLE_REGIONAL_ART={themes:entries.map(e=>e.id),loaded(id){return cache.get(id)?.loaded===true}};
})();
