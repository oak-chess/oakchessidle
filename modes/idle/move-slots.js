/* Complete only short evolution families; preserve the original three-stage progression. */
window.IDLE_MOVE_SLOTS=(()=>{
 let species=new Map(),children=new Map(),lengths=new Map();
 function configure(lines,catalog){
  const roster=new Set(lines.flatMap(L=>L.ids));species=new Map((catalog||[]).filter(s=>roster.has(s.id)).map(s=>[s.id,s]));children=new Map();lengths=new Map();
  for(const s of species.values())if(species.has(s.from)){if(!children.has(s.from))children.set(s.from,[]);children.get(s.from).push(s.id)}
  function depth(id,seen=new Set()){if(seen.has(id))return 0;return 1+Math.max(0,...(children.get(id)||[]).map(child=>depth(child,new Set([...seen,id]))))}
  for(const s of species.values()){let root=s,seen=new Set();while(species.has(root.from)&&!seen.has(root.id)){seen.add(root.id);root=species.get(root.from)}lengths.set(s.id,depth(root.id))}
 }
 function count(L,star,all=false){
  const id=L.ids[Math.max(0,Math.min(L.ids.length-1,star-1))];
  if(all||window.ARENA_SPECIAL_CRYSTALS?.category(id))return 4;
  const familyLength=lengths.get(id)||new Set(L.ids).size,final=species.has(id)?!(children.get(id)||[]).length:!L.ids.slice(star).some(next=>next!==id);
  const evolutionStage=stage(L,star);
  return familyLength<=2&&final?4:evolutionStage>=3?4:evolutionStage>=2?3:2;
 }
 function stage(L,star){
  let id=L.ids[Math.max(0,Math.min(L.ids.length-1,star-1))],depth=1;const seen=new Set();
  while(species.has(id)&&species.has(species.get(id).from)&&!seen.has(id)){seen.add(id);id=species.get(id).from;depth++}
  return Math.max(star,Math.min(3,depth));
 }
 return {configure,count,stage};
})();
if(typeof LINES!=='undefined')window.IDLE_MOVE_SLOTS.configure(LINES,window.DEX_EXPANSION);
