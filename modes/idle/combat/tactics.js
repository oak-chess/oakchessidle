/* Pure decisions: no DOM, randomness, save access or side-specific advantages. */
window.IDLE_TACTICS=(()=>{
 'use strict';
 const chart=window.IDLE_TYPE_CHART,types=Object.keys(chart),unknown=new Set();
 const config={advantage:1.5,resistance:.75,cooldowns:{simple:6,area:10,control:12,support:16},tie:.05,retargetGain:.15,retargetHold:1};
 const key=m=>m?.id!=null?'id:'+m.id:'move:'+(m?.emerald||m?.n||'');
 const support=m=>['heal','buff','barrier'].includes(m.k);
 const number=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
 function effectiveness(type,defenders){
  if(!chart[type]){unknown.add(String(type));return 1}
  let result=1;for(const t of new Set(defenders||[])){const v=chart[type][t];if(v==null){unknown.add(String(t));continue}if(v===0)return 0;result*=v===200?config.advantage:v===50?config.resistance:1}return result;
 }
 function factor(src,target,kind,o={}){
  const indirect=o.indirect||o.dot||o.mechanic||kind==='true',mult=indirect||o.basic?1:effectiveness(o.type,target.types);
  if(target.id===292&&!indirect&&(o.basic||mult<=1))return 0;
  return mult;
 }
 function mitigate(src,t,raw,kind,o={},sudden=0){
  const mult=factor(src,t,kind,o);if(mult===0)return 0;
  let d=Math.max(0,number(raw))*mult;if(d===0)return 0;
  if(o.basic&&t.basicGuard)d*=1-t.basicGuard;if(o.spell&&t.spellGuard)d*=1-t.spellGuard;
  if(src?.antiHeal&&o.basic&&t.shield>0)d*=1.5;
  if(!o.dot&&!t.passiveUsed){if(t.L?.passive?.id==='granitehide')d*=.75;if(t.L?.passive?.id==='sturdy')d*=.70}
  if(t.L?.passive?.id==='friendguard')d*=.92;
  if(kind!=='true'){const shred=src&&((o.basic&&src.basicShred)||(o.spell&&src.spellShred))?Math.max(t.shred||0,.18):t.shred||0;const ar=number(kind==='phys'?t.armor:t.mr)*(1-shred);d*=100/(100+Math.max(0,ar))}
  d=Math.max(1,d*(1-number(t.dr))*(1+number(sudden)));
  if(src?.bossCap&&!o.dot)d=Math.min(d,t.maxHp*src.bossCap);return d;
 }
 function cooldown(m,u){const base=support(m)?config.cooldowns.support:m.k==='debuff'||m.st?config.cooldowns.control:['blast','burst','beam','multi','chain','storm','field','barrage','meteor'].includes(m.k)?config.cooldowns.area:config.cooldowns.simple;if(!u)return base;
  const rate=Math.max(0,number(u.as))*(1+number(u.buffAS))*Math.max(0,number(u.manaAtk,10))+Math.max(0,number(u.manaRegen));
  return Math.max(base,Math.min(45,rate>0?number(u.maxMana)/rate*1.5:base));}
 const remaining=(u,m,time)=>Math.max(0,number(u.moveReadyAt?.[key(m)])-time);
 function power(u,m,t,env){return number(u.spell)*(1+number(u.ap))*(1+number(u.dmgAmp)+number(env.passiveAmp?.(u,t)))*number(m.p)}
 function allies(u,env){return env.units.filter(a=>a.alive&&a.side===u.side)}
 function recipients(u,m,env){const list=allies(u,env);if(m.k==='heal'){const a=m.targetId===7?u:list.slice().sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];return a?list.filter(b=>b===a||(m.targetId!==7&&env.distance(a,b)<=1)).map(b=>[b,b===a?1.4:.5]):[]}
  const radius=m.k==='buff'?2:u.L?.passive?.id==='barrierweaver'?2:1;return list.filter(a=>a===u||(m.targetId!==7&&env.distance(u,a)<=radius)).map(a=>[a,1]);}
 function expected(u,t,m,env){const raw=power(u,m,t,env),kind=m.damageClass||(u.spec?'spec':'phys');return mitigate(u,t,raw*(1+number(u.crit)*.5*.3),kind,{spell:true,type:m.t},env.sudden)}
 function statusValue(t,m,damage){if(!m.st)return 0;const active={burn:t.burn?.t,poison:t.pois?.t,slow:t.slow,stun:t.stun,freeze:t.stun};if(number(active[m.st])>=Math.min(1,number(m.d,1)))return 0;return Math.min(t.hp*.08,Math.max(1,damage*.2))*number(m.statusChance,1)}
 function victims(u,t,m,env){
  const foes=env.units.filter(a=>a.alive&&a.side!==u.side),r=m.r||(m.k==='meteor'?1:m.p>=1.8?2:1);
  switch(m.k){
   case'burst':return foes.filter(e=>env.distance(u,e)<=r).map(e=>[e,1]);
   case'blast':case'meteor':return foes.filter(e=>env.distance(t,e)<=r).map(e=>[e,1]);
   case'field':return foes.filter(e=>env.distance(t,e)<=1).map(e=>[e,4.8]);
   case'beam':return foes.filter(e=>env.inBeam?env.inBeam(u,t,e):e===t).map(e=>[e,1]);
   case'chain':{const out=[[t,1]];while(out.length<4){const last=out.at(-1)[0],next=foes.filter(e=>!out.some(([a])=>a===e)).sort((a,b)=>env.distance(last,a)-env.distance(last,b))[0];if(!next||env.distance(last,next)>3)break;out.push([next,Math.pow(.75,out.length)])}return out}
   // The executor chooses these secondary victims randomly: use expected contributions, not clairvoyance.
   case'multi':return foes.map(e=>[e,e===t?1:Math.min(1,2/Math.max(1,foes.length-1))]);
   case'storm':return foes.map(e=>[e,5/foes.length]);
   case'barrage':return [[t,number(env.recipe?.(m)?.n,5)]];
   default:return [[t,1]];
  }
 }
 function score(u,t,m,env){
  if(support(m)){let value=0;for(const [a,mult]of recipients(u,m,env)){const p=power(u,m,a,env),lost=Math.max(0,a.maxHp-a.hp),threat=env.units.some(e=>e.alive&&e.side!==u.side&&env.distance(e,a)<=e.range+1);
    if(m.k==='heal'){const urgent=a.hp/a.maxHp<.35;value+=Math.min(lost,p*mult*(1+number(a.healBoost))*(a.healBlockT>0?.7:1))*(urgent?1.8:lost/a.maxHp>=.25?1.15:.35)}
    if(m.k==='barrier'&&threat)value+=Math.max(0,Math.min(a.maxHp*.25,p*(u.L?.passive?.id==='barrierweaver'?1.35:1.1))-number(a.shield))*.75;
    if(m.k==='buff'&&!(a.buffT>1))value+=number(a.atk)*number(a.as,1)*3*.2;
   }return value;}
  if(!t?.alive)return 0;if(m.k==='splash')return 0;
  if(m.k==='transform')return t.moves?.some(x=>x.k!=='transform')?Math.max(1,u.spell*.15):0;
  if(m.emerald==='SKETCH')return t.moves?.some(x=>x.emerald!=='SKETCH')?Math.max(1,u.spell*.15):0;
  if(m.k==='teleport')return u.hp/u.maxHp<.35&&env.units.some(e=>e.alive&&e.side!==u.side&&env.distance(u,e)<=1)?u.maxHp*.06:0;
  if(m.k==='debuff')return effectiveness(m.t,t.types)===0?0:statusValue(t,m,Math.max(u.spell*.4,t.maxHp*.05));
  let value=0;for(const [e,mult]of victims(u,t,m,env)){const d=expected(u,e,m,env)*mult,cap=Math.max(0,e.hp)+Math.max(0,number(e.shield));value+=Math.min(cap,d);if(d>0)value+=statusValue(e,m,d)}
  if(m.k==='drain')value+=Math.min(u.maxHp-u.hp,expected(u,t,m,env)*.6*(1+number(u.healBoost))*(u.healBlockT>0?.7:1))*1.15;
  return value;
 }
 function choose(u,env){
  if(!u.alive||u.stun>0||u.moving||u.lock>0||u.mana<u.maxMana)return null;
  const foes=env.units.filter(e=>e.alive&&e.side!==u.side&&env.distance(u,e)<=u.range),current=foes.includes(u.target)?u.target:foes[0];
  const candidates=[];for(let i=0;i<(u.moves||[]).length;i++){const m=u.moves[i];if(remaining(u,m,env.time)>0)continue;
   const targets=support(m)?[current||null]:foes;
   for(const t of targets){const value=score(u,t,m,env);if(value>0)candidates.push({index:i,move:m,target:t,score:value,last:number(u.moveLastUsed?.[key(m)],-1e9)})}
  }
  // Avoid constant retargeting: an available current-target action wins unless the gain is meaningful.
  const onCurrent=candidates.filter(c=>c.target===current||support(c.move)),bestCurrent=Math.max(0,...onCurrent.map(c=>c.score));
  const eligible=candidates.filter(c=>c.target===current||support(c.move)||env.time-number(u.tacticalTargetAt,-1e9)>=config.retargetHold&&c.score>bestCurrent*(1+config.retargetGain));
  const best=Math.max(0,...eligible.map(c=>c.score)),near=eligible.filter(c=>c.score>=best*(1-config.tie));near.sort((a,b)=>Number(b.index===u._idleSkill)-Number(a.index===u._idleSkill)||a.last-b.last||a.index-b.index||String(a.target?.key||a.target?.id).localeCompare(String(b.target?.key||b.target?.id)));
  const chosen=near[0]||null;u.tacticalDecision=chosen?{move:key(chosen.move),target:chosen.target?.key||chosen.target?.id,score:chosen.score,time:env.time}:null;return chosen;
 }
 function commit(u,m,time){u.moveReadyAt=u.moveReadyAt||{};u.moveLastUsed=u.moveLastUsed||{};u.moveReadyAt[key(m)]=time+cooldown(m,u);u.moveLastUsed[key(m)]=time;u.lastMoveKey=key(m)}
 function matchup(defenders){return types.map(type=>({type,factor:effectiveness(type,defenders)})).filter(x=>x.factor!==1)}
 return {config,key,support,types,effectiveness,factor,mitigate,cooldown,remaining,power,expected,score,choose,commit,matchup,unknown};
})();
