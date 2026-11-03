/* Prey owns only its preferences and charges. Combat receives immutable per-foe tags. */
window.createIdlePrey=function(ctx){
 'use strict';
 const s=ctx.state,random=ctx.random||Math.random,now=ctx.now||Date.now;
 const bonuses={damage:{label:'Dano',values:[10,15,20]},defense:{label:'Defesa',values:[10,15,20]},xp:{label:'Experiência',values:[10,15,20,25]},loot:{label:'Loot',values:[10,15,20]}};
 const d=s.prey&&s.prey.version===1?s.prey:{version:1,slots:[],options:[],selected:null,lastFreeDay:null,introduced:false,serial:0};s.prey=d;
 d.serial=Math.max(0,Math.floor(Number(d.serial)||0));let encounter=0,saveQueued=false;const rewarded=new WeakSet();
 const count=()=>new Set(s.world?.badges||[]).size;
 const unlocked=()=>count()>=1,slotCount=()=>count()>=16?3:count()>=8?2:unlocked()?1:0;
 const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now()));
 function catalog(){return ctx.catalog().filter((x,i,a)=>x&&x.name&&a.findIndex(y=>y.name===x.name)===i)}
 function valid(entry){return entry&&catalog().some(x=>x.name===entry.name)&&bonuses[entry.kind]&&bonuses[entry.kind].values.includes(entry.percent)&&Number.isInteger(entry.remaining)&&entry.remaining>0&&entry.remaining<=100&&typeof entry.id==='string'}
 d.slots=Array.from({length:3},(_,i)=>({active:valid(d.slots?.[i]?.active)?d.slots[i].active:null,pending:valid(d.slots?.[i]?.pending)?d.slots[i].pending:null}));
 d.options=Array.isArray(d.options)?d.options.filter(valid).slice(0,3):[];
 const pick=a=>a[Math.min(a.length-1,Math.max(0,Math.floor(random()*a.length)))];
 function options(){const pool=catalog().slice(),chosen=[];while(pool.length&&chosen.length<3){const index=pool.indexOf(pick(pool)),species=pool.splice(index,1)[0],kind=pick(Object.keys(bonuses));chosen.push({id:'prey-'+(++d.serial),name:species.name,kind,percent:pick(bonuses[kind].values),remaining:100})}return chosen}
 function ensure(){if(unlocked()&&!d.options.length&&!d.optionsExhausted){d.options=options();return true}return false}
 const changed=()=>{ctx.save();ctx.changed?.()};
 function saveSoon(){if(saveQueued)return;saveQueued=true;queueMicrotask(()=>{saveQueued=false;changed()})}
 function select(id){if(!unlocked())return {ok:false,message:'Conquiste a primeira insígnia para liberar o Prey.'};ensure();const option=d.options.find(x=>x.id===id);if(!option)return {ok:false,message:'Escolha uma opção disponível.'};d.selected=id;changed();return {ok:true}}
 function activation(slot,confirm=false){const option=d.options.find(x=>x.id===d.selected);if(!unlocked()||!Number.isInteger(slot)||slot<0||slot>=slotCount()||!option)return {ok:false,message:'Selecione uma espécie e uma vaga liberada.'};
  if(d.slots.some((x,i)=>i!==slot&&[x.active,x.pending].some(e=>e?.name===option.name)))return {ok:false,message:'Esta espécie já está em outra vaga.'};
  const target=d.slots[slot];if((target.active||target.pending)&&!confirm)return {ok:false,confirm:true,message:'Substituir este Prey no próximo encontro? O progresso anterior não será devolvido.'};
  target.pending={...option};d.options=d.options.filter(x=>x.id!==option.id);d.optionsExhausted=!d.options.length;d.selected=null;changed();return {ok:true,message:'Prey preparado para o próximo encontro.'};
 }
 function renew(){if(!unlocked())return {ok:false,message:'Conquiste a primeira insígnia.'};const free=d.lastFreeDay!==day(),price=free?0:Math.min(50000,Math.max(100,Math.floor(Number(s.trainerLevel)||1)*100));if(s.gold<price)return {ok:false,message:'Coins insuficientes.'};const next=options();if(!next.length)return {ok:false,message:'Nenhuma espécie disponível nas caçadas desbloqueadas.'};s.gold-=price;if(free)d.lastFreeDay=day();d.options=next;d.optionsExhausted=false;d.selected=null;changed();return {ok:true,message:free?'Opções renovadas gratuitamente.':'Opções renovadas por '+price.toLocaleString('pt-BR')+' Coins.'}}
 function begin(){encounter++;if(!unlocked())return;for(let i=0;i<slotCount();i++){const slot=d.slots[i];if(slot.pending){slot.active=slot.pending;slot.pending=null}}}
 function tag(units){if(!unlocked())return;for(let i=0;i<slotCount();i++){const active=d.slots[i].active;if(!active?.remaining)continue;let available=active.remaining;for(const u of units){if(available<=0)break;const name=u.L?.names?.[(u.star||1)-1];if(u.side!==1||name!==active.name||u.L?.boss)continue;u._idlePreyBonus={name,kind:active.kind,percent:active.percent,id:active.id,slot:i,encounter};available--}}}
 function defeat(u){const tag=u?._idlePreyBonus,neutral={xp:1,loot:0};if(!tag||tag.encounter!==encounter||rewarded.has(u)||u.alive||u.side!==1)return neutral;const active=d.slots[tag.slot]?.active;if(!active||active.id!==tag.id||active.remaining<=0)return neutral;rewarded.add(u);active.remaining--;if(!active.remaining){d.slots[tag.slot].active=null;ctx.notify?.('Prey concluído: '+active.name+' · 100 derrotas.')}saveSoon();return {xp:tag.kind==='xp'?1+tag.percent/100:1,loot:tag.kind==='loot'?tag.percent/100:0}}
 function snapshot(){const initialized=ensure();if(initialized)ctx.save();return {unlocked:unlocked(),slots:slotCount(),data:d,bonuses,catalog:catalog(),free:d.lastFreeDay!==day(),price:d.lastFreeDay!==day()?0:Math.min(50000,Math.max(100,Math.floor(Number(s.trainerLevel)||1)*100))}}
 return {snapshot,select,activate:activation,renew,begin,tag,defeat,introduce(){d.introduced=true;changed()},summary(){return d.slots.flatMap((x,i)=>[x.active&&{...x.active,slot:i,pending:false},x.pending&&{...x.pending,slot:i,pending:true}].filter(Boolean))}};
};
