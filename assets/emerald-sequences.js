/* Source sprite sequences are partitioned into preparation and real impact phases. */
(()=>{
 'use strict';
 function create(renderer){
 const templates=window.EMERALD_CATALOG?.templates||{};
 const travel=/ToTarget|Projectile|Missile|Beam|Shot|Throw|Spit|Linear|Moving|Flying|AirWave|ShadowBall|RazorLeaf|DragonBreath/i;
 const hit=/HitSplat|Impact|Slash|Claw|Fang|Teeth|Explosion|Punch|Kick|Plume|Burst|Shock|Bolt/i;
 function phase(event){const callback=(templates[event.sprite]?.callback||'')+' '+event.sprite;
  if(travel.test(callback))return 'travel';
  const selector=(event.args||[]).find(value=>/^ANIM_(?:TARGET|ATTACKER)$/.test(value));
  if(selector==='ANIM_TARGET'||hit.test(callback))return 'impact';
  if(selector==='ANIM_ATTACKER'||/Charge|Gather|Warm|Focus|Prepare|Meditat|SwordsDance/i.test(callback))return 'start';
  return 'impact';
 }
 function drawPhase(mv,x,y,scale,stage){
  const move=renderer?.resolve(mv);if(!move)return false;
  const support=['heal','buff','barrier'].includes(mv.k);
  const events=move.events.filter(e=>renderer.availableTemplate(e.sprite)&&(phase(e)===stage||(stage==='start'&&support&&phase(e)!=='travel')));
  if(!events.length)return false;
  const first=events[0].t,last=events[events.length-1].t,span=Math.max(.001,last-first),windowLength=stage==='start'?.4:.5;
  const maximum=CFG.fxLevel==='low'?8:CFG.reduceFx?16:48;
  // Distribute any reduced selection over the entire source sequence, including its finale.
  const chosen=events.length<=maximum?events:Array.from({length:maximum},(_,i)=>events[Math.round(i*(events.length-1)/(maximum-1))]);
  let drawn=false;
  chosen.forEach((e,i)=>{
   const args=e.args.map(v=>Number(v)),number=(n,limit)=>Number.isFinite(n)?Math.max(-limit,Math.min(limit,n)):0;
   const dx=number(args[0],26),dy=number(args[1],20),duration=(e.t-first)*Math.min(1,windowLength/span);
   const specific=/HitSplat|Slash|Teeth/.test(templates[e.sprite].callback||'')?args[args.length-1]:i;
   const variant=Number.isInteger(specific)&&specific>=0&&specific<8?specific:i;
   drawn=renderer.emitTemplate(e.sprite,x+dx,y+dy,scale,duration,variant,{angle:i*2.399,radius:12+(i%3)*6})||drawn;
  });
  return drawn;
 }
 return {
  start(mv,x,y){return drawPhase(mv,x,y,1,'start')},
  impact(mv,x,y,scale){return drawPhase(mv,x,y,scale,'impact')},
  phase
 };
 }
 window.CREATE_EMERALD_SEQUENCES=create;
 window.EMERALD_SEQUENCES=create(window.EMERALD_MOVES);
})();
