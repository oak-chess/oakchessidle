/* Illustrated environments approved in the isolated native arena studies.
 * Changes scenery only. Grid, units, camera, combat and theme selection stay native. */
(()=>{
 'use strict';
 const definitions={electric:['electric','#343f3c'],garden:['erika','#354c39'],poison:['koga','#293b35'],psychic:['sabrina','#302b42'],fire:['blaine','#342721'],ground:['giovanni','#514936'],lorelei:['lorelei','#314454'],bruno:['bruno','#504333'],agatha:['agatha','#302f3b'],lance:['lance','#303d48'],blue:['blue','#564f49'],'route-cave':['route-cave','#343d42'],'route-sewer':['route-sewer','#34413a'],'route-mansion':['route-mansion','#3f373d']};
 const cache=new Map();
 function trim(current){for(const [key,value]of cache){if(cache.size<=4)break;if(key!==current&&!value.pending)cache.delete(key)}}
 function resource(id){
  if(cache.has(id)){const entry=cache.get(id);cache.delete(id);cache.set(id,entry);return entry}
  const image=new Image(),entry={image,pending:true,loaded:false};cache.set(id,entry);
  image.onload=()=>{entry.pending=false;entry.loaded=true;trim(typeof ARENA_T==='undefined'?id:ARENA_T?.id);if(typeof ARENA_T!=='undefined'&&ARENA_T?.id===id)repaintArena()};
  image.onerror=()=>{entry.pending=false;entry.loaded=false;trim(id)};
  image.src='modes/idle/arena-art/'+definitions[id][0]+'.webp';trim(id);return entry;
 }
 window.OAK_ARENA_ART={
  themes:Object.keys(definitions),
  paint(g,A,theme){
   const definition=definitions[theme.id];if(!definition)return false;
   const entry=resource(theme.id);if(!entry.loaded)return false;
   const width=2560,height=width*entry.image.naturalHeight/entry.image.naturalWidth;
   g.save();g.fillStyle=definition[1];g.fillRect(-640,0,2560,800);g.imageSmoothingEnabled=true;
   g.drawImage(entry.image,A.CX-width/2,-140,width,height);g.restore();return true;
  }
 };
 // Match the Surge prototype's warm field surround, leaving all grid geometry intact.
 if(window.OAK_IDLE_MODE)window.IDLE_ARENA_ART=window.OAK_ARENA_ART;
 const surge=ARENA_THEMES.find(t=>t.id==='electric');
 if(surge){surge.tex='earth';surge.wall={...surge.wall,tex:'brick',a:'#8a8a70',b:'#5e6a5a',trim:'#a4ae93'};for(const side of ['p','e'])surge.tile[side]={...surge.tile[side],a:['#a69979','#a09374'],b:['#93866b','#8c8067'],side:'#5b5e4b',line:'rgba(55,63,47,.38)'}}
 if(typeof repaintArena==='function')repaintArena();
})();
