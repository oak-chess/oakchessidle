/* Keep energy, legacy cursor and remaining individual cooldowns between ordinary
 * hunt encounters. Version 1 saves remain readable; species and availability are untouched. */
window.IDLE_COMBAT_CONTINUITY=(()=>{
 const moveKey=move=>move?.id!=null?'id:'+move.id:'move:'+(move?.emerald||move?.n||'');
 const limit=(unit,capacity)=>Math.max(0,Number.isFinite(capacity)?capacity:(Number(unit.maxMana)||0)*2);
 const energy=(value,max)=>Math.max(0,Math.min(max,Number.isFinite(value)?value:0));
 function capture(member,unit,capacity,time=0){
  if(!member||member.id==null||!unit?.moves?.length)return false;
  const cursor=Number.isFinite(unit.mi)?Math.max(0,Math.floor(unit.mi)):0;
  const recargas={},uso={};for(const m of unit.moves){const k=moveKey(m);recargas[k]=Math.max(0,Math.min(60,(unit.moveReadyAt?.[k]||0)-time));if(Number.isFinite(unit.moveLastUsed?.[k]))uso[k]=Math.min(3600,Math.max(0,time-unit.moveLastUsed[k]))}
  member.combatCarry={version:2,owner:member.id,next:moveKey(unit.moves[cursor%unit.moves.length]),mana:unit.alive===false?0:energy(unit.mana,limit(unit,capacity)),cooldowns:recargas,lastUseAge:uso};return true;
 }
 function restore(member,unit,capacity){
  const saved=member?.combatCarry;
  if(!unit?.moves?.length||![1,2].includes(saved?.version)||saved.owner!==member.id)return false;
  const index=unit.moves.findIndex(move=>moveKey(move)===saved.next);
  unit.mi=index<0?0:index;unit.mana=energy(saved.mana,limit(unit,capacity));unit.moveReadyAt={};unit.moveLastUsed={};
  for(const m of unit.moves){const k=moveKey(m),cd=saved.cooldowns?.[k],age=saved.lastUseAge?.[k];if(Number.isFinite(cd))unit.moveReadyAt[k]=Math.max(0,Math.min(60,cd));if(Number.isFinite(age))unit.moveLastUsed[k]=-Math.max(0,Math.min(3600,age))}return true;
 }
 return {capture,restore,moveKey};
})();
