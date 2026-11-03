/* Periodic boss adaptations. Not literal cartridge abilities. Original nine unchanged. */
window.IDLE_MEGA_EXPANSION_MECHANIC=function(key,boss,allies,target){
 const d=window.IDLE_MEGA_DEFS.find(d=>d.key===key),s=d?.bossSkill;if(!s)return false;
 const fromBoss=()=>allies.filter(u=>hdist(boss.r,boss.c,u.r,u.c)<=(s.radius||1));
 const nearTarget=()=>allies.filter(u=>hdist(target.r,target.c,u.r,u.c)<=(s.radius||1));
 const nearest=(count,furthest=false)=>allies.slice().sort((a,b)=>(hdist(boss.r,boss.c,a.r,a.c)-hdist(boss.r,boss.c,b.r,b.c))*(furthest?-1:1)).slice(0,count);
 const physical=['pincers','burst','ironring','sweep','crosscut','quake','focus','kick','dive','sand'].includes(s.kind);
 let affected=[target];
 if(['roots','sunfire','undertow'].includes(s.kind))affected=nearTarget();
 if(['ironring','song','quake'].includes(s.kind))affected=fromBoss();
 if(['sand','snow'].includes(s.kind))affected=allies;
 if(s.kind==='leaves')affected=nearest(s.count,true);
 if(s.kind==='chain')affected=nearest(s.count);
 if(s.kind==='sweep')affected=allies.filter(u=>u.r===target.r);
 if(['armor','barrier','crystal'].includes(s.kind))affected=s.mana?[target]:[];
 if(s.kind==='sunfire')setArenaField('fire',target.r,target.c,1,3,boss);
 for(const u of affected){
  if(s.shieldBreak)u.shield=Math.max(0,(u.shield||0)-u.maxHp*s.shieldBreak);
  for(let i=0;i<(s.hits||1)&&u.alive;i++)if(s.damage)hurt(boss,u,u.maxHp*s.damage,physical?'phys':'spec',{spell:true,mechanic:true});
  if(!u.alive)continue;
  if(s.mana)u.mana=Math.max(0,u.mana-s.mana);
  if(s.slow)applyStatus(u,'slow',s.slow,boss);
  if(s.stun)applyStatus(u,'stun',s.stun,boss);
  if(s.burn)applyStatus(u,'burn',s.burn,boss,.02);
  FX.ring(u.x,u.y,d.color,12,48,.55,2);
 }
 if(s.shield)boss.shield=Math.min((boss.shield||0)+boss.maxHp*s.shield,boss.maxHp*s.cap);
 if(s.heal)boss.hp=Math.min(boss.maxHp,boss.hp+boss.maxHp*s.heal);
 FX.ring(boss.x,boss.y,d.color,15,s.radius?50+s.radius*30:65,.65,3);
 FX.text(boss.x,boss.y-58,d.label+'!',d.color,11);return true;
};
