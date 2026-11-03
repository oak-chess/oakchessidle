/* Shared experience curve: trainer and partners have separate accumulated progress. */
window.IDLE_XP={
 rates:new WeakMap(),
 bind(node,member,trainer=false){const update=()=>{node.textContent=this.pace(member,trainer?member.trainerLevel:member.level,trainer?member.trainerXp:member.xp).text};update();node._xpUpdate=update;node.classList.add('idle-xp-pace')},
 record(member,amount){if(this.suspendRates||!(amount>0))return;const now=Date.now(),r=this.rates.get(member)||{start:now,total:0};r.total+=amount;this.rates.set(member,r)},
 pace(member,level=member.level,xp=member.xp){const r=this.rates.get(member);if(!r)return {rate:0,text:"Aguardando XP nesta sessão"};const elapsed=(Date.now()-r.start)/1000;if(elapsed<10)return {rate:0,text:"Calculando ritmo de XP…"};const rate=r.total/elapsed*3600,seconds=Math.ceil(Math.max(0,this.need(level)-(xp||0))/rate*3600),duration=seconds<60?seconds+" s":seconds<3600?Math.ceil(seconds/60)+" min":Math.floor(seconds/3600)+" h "+Math.floor(seconds%3600/60)+" min";return {rate,text:Math.round(rate).toLocaleString("pt-BR")+" XP/h · Próximo nível: ~"+duration}},
 need(level){const n=Math.max(1,Math.floor(level));return 50*(n*n-3*n+4)},
 add(member,amount){const previousLevel=member.level;this.record(member,Math.max(0,Math.round(amount)));member.xp=Math.max(0,Number(member.xp)||0)+Math.max(0,Math.round(amount));while(member.xp>=this.need(member.level)){member.xp-=this.need(member.level);member.level++}if(member.level>previousLevel)member.condition=1;member.xpSchema=2;member.lastXpGain=Math.max(0,Math.round(amount));member.earnedXp=(member.earnedXp||0)+member.lastXpGain},
 trainer(state,amount){this.record(state,Math.max(0,Math.round(amount)));const m={level:state.trainerLevel,xp:state.trainerXp};this.add(m,amount);state.trainerLevel=m.level;state.trainerXp=m.xp},
 migrate(state){if(state.levelSchema===2)return;for(const m of [...state.team,...(state.collection||[])]){m.xp=Math.floor(Math.min(.999,Math.max(0,(m.xp||0)/(m.level*12)))*this.need(m.level));m.xpSchema=2;m.legacyEvolution=m.star>1}state.trainerXp=Math.floor(Math.min(.999,Math.max(0,state.trainerXp/(state.trainerLevel*20)))*this.need(state.trainerLevel));state.levelSchema=2}
};

setInterval(()=>document.querySelectorAll(".idle-xp-pace").forEach(node=>node._xpUpdate?.()),1000);
