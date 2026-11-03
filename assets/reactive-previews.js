/* Small visual cues for actual defensive procs; no extra rolls or combat effects. */
(()=>{
 'use strict';
 const recent=new WeakMap();
 function pulse(unit,type){
  if(!unit||!B.on||B.over)return;
  const last=recent.get(unit);if(last&&last.units===B.units&&B.t-last.time<.3&&last.type===type)return;
  recent.set(unit,{time:B.t,type,units:B.units});window.HEX_ATTACKS?.reaction(unit,type);
 }
 const shield=FX.shieldFx;
 FX.shieldFx=function(x,y){
  shield.apply(FX,arguments);
  const unit=B.units.filter(u=>u.alive&&Math.hypot(u.x-x,cyOf(u)-y)<12).sort((a,b)=>Math.hypot(a.x-x,cyOf(a)-y)-Math.hypot(b.x-x,cyOf(b)-y))[0];
  if(unit)pulse(unit,'steel');
 };
 window.REACTIVE_PREVIEWS={pulse,
  retaliate(defender,attacker,type){window.HEX_ATTACKS?.retaliation(defender,attacker,type)},
  teleport(unit,from,style){
   const type=style==='shadow'?'ghost':'psychic';
   window.HEX_ATTACKS?.reaction({r:from.r,c:from.c},type,.4);
   window.HEX_ATTACKS?.reaction({r:unit.r,c:unit.c},type,.55);
  }
 };
})();
