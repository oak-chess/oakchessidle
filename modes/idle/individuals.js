/* Individual potential adapted to the native OakChess combat attributes. */
window.IDLE_INDIVIDUALS=(()=>{
 const powers=[{tier:1,bonus:0,chance:74.495},{tier:2,bonus:5,chance:20},{tier:3,bonus:10,chance:5},{tier:4,bonus:25,chance:.5},{tier:5,bonus:100,chance:.005}];
 const power=m=>powers[Math.max(0,Math.min(4,(Number(m.potency)||1)-1))]||powers[0];
 const decorate=(node,m)=>{node.dataset.potency=power(m).tier;node.dataset.shiny=String(m.shiny===true);return node};
 const powerLabel=m=>'P'+power(m).tier+' · +'+power(m).bonus+'%';
 const shinyMultiplier=3,shinyMinTotal=111;
 const keys=['hp','atk','def','spa','spd','spe'],labels={hp:'PS',atk:'Ataque',def:'Defesa',spa:'Poder',spd:'Resistência',spe:'Velocidade'};
 const natureNames=[['Hardy','Firme'],['Lonely','Solitária'],['Brave','Brava'],['Adamant','Determinada'],['Naughty','Travessa'],['Bold','Ousada'],['Docile','Dócil'],['Relaxed','Relaxada'],['Impish','Esperta'],['Lax','Relaxada'],['Timid','Tímida'],['Hasty','Apressada'],['Serious','Séria'],['Jolly','Alegre'],['Naive','Ingênua'],['Modest','Modesta'],['Mild','Mansa'],['Quiet','Quieta'],['Bashful','Tímida'],['Rash','Imprudente'],['Calm','Calma'],['Gentle','Gentil'],['Sassy','Atrevida'],['Careful','Cuidadosa'],['Quirky','Peculiar']];
 // Rows: raised Attack, Defense, Speed, Sp. Attack, Sp. Defense; columns lowered in same order.
 const order=['atk','def','spe','spa','spd'];const natures=natureNames.map(([id,name],i)=>({id,name,up:order[Math.floor(i/5)]===order[i%5]?null:order[Math.floor(i/5)],down:order[Math.floor(i/5)]===order[i%5]?null:order[i%5]}));
 const talents={vigour:{name:'Vigor',description:'+6% de PS máximo.',key:'hp',factor:1.06},focus:{name:'Concentração',description:'+6% de poder de habilidade.',key:'spa',factor:1.06},force:{name:'Ímpeto',description:'+6% de ataque físico.',key:'atk',factor:1.06},guard:{name:'Resiliência',description:'+8% de defesa e resistência.',key:'def',factor:1.08},agile:{name:'Agilidade',description:'+6% de velocidade de ataque.',key:'spe',factor:1.06}};
 const hash=text=>{let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0};
 function rng(seed){let n=hash(seed);return()=>{n=(n+0x6D2B79F5)|0;let t=Math.imul(n^(n>>>15),1|n);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
 function pool(L){const role=L?.role||L?.r||'',types=Array.isArray(L?.t?.[0])?L.t[0]:L?.t||[];if(['tank','bruiser'].includes(role))return ['vigour','guard','force'];if(role==='mage'||types.some(t=>['psychic','ghost','fairy'].includes(t)))return ['focus','agile','vigour'];return ['force','agile','guard']}
 function roll(L,seed=Date.now()+':'+Math.random(),allowShiny=true,forceShiny=false,shinyFactor=1){const r=rng(seed),rollIVs=()=>Object.fromEntries(keys.map(k=>[k,Math.floor(r()*32)]));let ivs=rollIVs();const nature=natures[Math.floor(r()*natures.length)].id,available=pool(L),talent=available[Math.floor(r()*available.length)],q=r()*100;let cumulative=0,potency=5;for(const p of powers){cumulative+=p.chance;if(q<cumulative){potency=p.tier;break}}const shiny=allowShiny&&(r()<Math.min(1,window.IDLE_SHINY.rate*Math.max(1,Math.min(2,shinyFactor)))||forceShiny);if(shiny){while(total({ivs})<shinyMinTotal)ivs=rollIVs()}return {individualVersion:3,geneSeed:String(seed),ivs,nature,talent,potency,shiny,quality:1+powers[potency-1].bonus/100}}
 function normalize(m,L){m.shiny=m.shiny===true;if(!Number.isInteger(m.potency)||m.potency<1||m.potency>5){const old=Number.isFinite(m.quality)?m.quality:1;m.legacyQuality=old;m.potency=old>1.05?3:old>1?2:1}m.quality=1+power(m).bonus/100;if(!m.ivs||!m.nature||!m.talent){const genes=roll(L,m.geneSeed||m.id||[m.name,m.caughtAt||0,m.level].join(':'),false);m.ivs=m.ivs||genes.ivs;m.nature=m.nature||genes.nature;m.talent=m.talent||genes.talent;m.geneSeed=m.geneSeed||genes.geneSeed;if(!Number.isFinite(m.quality))m.quality=genes.quality}for(const k of keys)m.ivs[k]=Math.max(0,Math.min(31,Math.floor(Number(m.ivs[k])||0)));if(!natures.some(n=>n.id===m.nature))m.nature='Hardy';if(!talents[m.talent])m.talent='vigour';m.individualVersion=3;return m}
 const nature=m=>natures.find(n=>n.id===m.nature)||natures[0],talent=m=>talents[m.talent]||talents.vigour,total=m=>keys.reduce((n,k)=>n+(m.ivs?.[k]||0),0);
 function modifiers(m){const n=nature(m),t=talent(m);return Object.fromEntries(keys.map(k=>{const iv=.94+.12*(m.ivs[k]/31),temper=n.up===k?1.1:n.down===k?.9:1,extra=t.key===k||t.key==='def'&&k==='spd'?t.factor:1;return [k,(1+power(m).bonus/100)*(m.shiny?shinyMultiplier:1)*iv*temper*extra]}))}
 function apply(u,m){normalize(m,u.L);u.shiny=m.shiny===true;const f=modifiers(m),ratio=u.maxHp?u.hp/u.maxHp:1;u.maxHp*=f.hp;u.hp=u.maxHp*ratio;u.atk*=f.atk;u.armor*=f.def;u.spell*=f.spa;u.mr*=f.spd;u.as*=f.spe;u._idleTalent=m.talent}
 function defensiveScales(speciesId,level){
  const [def,spd]=window.IDLE_SPECIES_DEFENSE?.[speciesId-1]||[100,100];
  const progress=Math.max(0,level-1)/(Math.max(1,level)+49);
  return {armor:1+Math.min(1.5,def/100)*progress,mr:1+Math.min(1.5,spd/100)*progress}
 }
 function stats(base,m,level){const f=modifiers(m),scale=1+(level-1)*.12,defense=defensiveScales(base.speciesId,level);return {hp:base.shedinja?1:base.hp*scale*f.hp,atk:base.atk*scale*f.atk,spell:base.sp*scale*f.spa,armor:base.armor*defense.armor*f.def,mr:base.mr*defense.mr*f.spd,speed:base.as*f.spe}}
 const reduction=value=>{const defense=Math.max(0,Number(value)||0);return 100*defense/(100+defense)};
 const defenseText=value=>reduction(value).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
 // Match the Arena index without equipment and compare births at the same level.
 function rawPotential(m,L,star){
  const base=baseStats(L,star,true);
  const powerAt100=variant=>{const a=stats(base,variant,100);return a.hp+a.atk+a.spell+a.armor+a.mr};
  const withIVs=(iv,potency,shiny)=>({...m,ivs:Object.fromEntries(keys.map(k=>[k,iv])),potency,shiny});
  const low=powerAt100(withIVs(0,1,false)),high=powerAt100(withIVs(31,5,true));
  return high>low?10*Math.max(0,Math.min(1,(powerAt100(m)-low)/(high-low))):0;
 }
 function potentialScore(m){
  const L=typeof LINES==='undefined'?null:LINES.find(l=>l.names[0]===m.name);if(!L)return 0;
  let score=0,last=null;
  for(let star=1;star<=m.star;star++){
   const id=L.ids[star-1];if(!id||id===last)continue;
   score=Math.max(rawPotential(m,L,star),last===null?0:score+.1);last=id
  }
  const mega=window.IDLE_MEGA_DEFS?.some(d=>d.key===m.megaKey&&d.id===last);
  return Math.min(10,Math.max(score,Number(m.evolutionRatingFloor)||0)+(mega ? .1 : 0));
 }

 function quality(m){return 'P'+power(m).tier}
 return {shinyMultiplier,shinyMinTotal,reduction,defenseText,powers,power,powerLabel,decorate,keys,labels,natures,talents,roll,normalize,nature,talent,total,potentialScore,modifiers,apply,defensiveScales,stats,quality};
})();
