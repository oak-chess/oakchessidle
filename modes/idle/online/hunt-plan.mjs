import {createHuntSimulation} from './hunt-engine.mjs';
import {HUNT_CATALOG as catalog} from './hunt-catalog.mjs';

export function evolutionFloor(row,target){
 const engine=createHuntSimulation();
 const data={...engine.genes(row.pokemon_id,row.id,false),...row.combat_data};
 if(row.pokemon_id===236){
  const nature=engine.nature(data),stat=key=>Math.floor((Math.floor((70+(data.ivs[key]||0))*row.level/100)+5)*(nature.up===key?1.1:nature.down===key?.9:1));
  const atk=stat('atk'),def=stat('def'),expected=atk>def?106:atk<def?107:237;
  if(target!==expected)throw Error('A evolução de Tyrogue depende dos atributos de nascimento.');
 }
 if(row.pokemon_id===265){let hash=2166136261;for(const c of String(data.geneSeed||row.id)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)}
  if(target!==[266,268][(hash>>>0)%2])throw Error('O ramo de Wurmple é determinado no nascimento.');}
 return Math.min(10,engine.rating({...row,combat_data:data})+.1);
}

export function huntRoute(key){
 if(typeof key!=='string'||!/^\d{1,2}:[a-z]+$/.test(key))throw Error('Caçada inválida.');
 const [area,kind]=key.split(':');
 if(kind==='gym'){
  const gym=catalog.regions[Number(area)];if(!gym)throw Error('Ginásio indisponível.');
  return {area:Number(area),kind,key,isGym:true,min:gym.level,species:gym.foes,name:gym.leader};
 }
 const entry=catalog.routes[Number(area)]?.habitats[kind];
 if(!entry)throw Error('Caçada ainda não disponível no servidor.');
 return {...entry,area:Number(area),kind,key};
}
// The seed, canonical roster and VIP status come from the database, never the browser.
export function buildHuntPlan(encounter){
 const route=huntRoute(encounter.route),snapshot=encounter.snapshot;
 const engine=createHuntSimulation(encounter.seed),metadata=engine.metadata();
 let random=encounter.seed>>>0;
 const rng=()=>{random=(Math.imul(1664525,random)+1013904223)>>>0;return random/4294967296};
 const species=route.species.map(name=>metadata.find(s=>s.name===name)).filter(Boolean);
 if(species.length!==route.species.length)throw Error('Catálogo de espécies incompleto.');
 const level=route.min+(route.isGym?0:(snapshot.wave-1)*(route.area===0?1:5));
 const count=route.isGym?species.length:Math.min(species.length,6,3+(route.min>=30?1:0)+(route.min>=60?1:0)+Math.floor((snapshot.wave-1)/3));
 const pool=species.slice(),enemies=[];
 while(enemies.length<count){
  const position=route.isGym?0:Math.floor(rng()*pool.length),s=pool.splice(position,1)[0];
  enemies.push({id:encounter.id+':'+enemies.length,pokemon_id:s.id,level,
   combat_data:engine.genes(s.id,encounter.seed+':enemy:'+enemies.length,!route.isGym)});
 }
 const supplies={...snapshot.supplies},preferences={heal:true,revive:true,threshold:50,healItem:'potions',reviveItem:'revives',...snapshot.preferences};
 const heal=catalog.healing[preferences.healItem],revive=catalog.reviving[preferences.reviveItem];
 const reserves=preferences.itemReserves||{};
 const available=key=>(supplies[key]||0)>(reserves[key]||0);
 const allies=snapshot.allies.map(m=>{
  const data={...engine.genes(m.pokemon_id,m.id,false),...m.combat_data};
  let condition=Math.max(0,Math.min(1,data.condition??1));
  if(condition===0&&preferences.revive&&available(preferences.reviveItem)){supplies[preferences.reviveItem]--;condition=revive.ratio;}
  if(condition>0&&preferences.heal&&condition<preferences.threshold/100){
   while(condition<1&&available(preferences.healItem)){supplies[preferences.healItem]--;condition=Math.min(1,condition+heal.ratio);}
  }
  return {...m,pos:snapshot.organization?.find(slot=>slot.id===m.id)?.pos,combat_data:{...data,condition}};
 });
 if(allies.every(m=>m.combat_data.condition===0))throw Error('Recupere sua equipe no Centro Pokémon ou habilite Revives com estoque disponível.');
 const result=engine.run(allies,enemies),last=result.frames.at(-1);
 const gains=allies.map(()=>0),rewards={trainerXp:0,pokemonXp:0,coins:0,loot:{},stones:{},defeated:0};
 const xpFactor=(1+route.area*.2)*(route.rewardFactor||1),goldFactor=(1+route.area*.18)*(route.rewardFactor||1);
 const vip=snapshot.vip?1.5:1;
 enemies.forEach((enemy,i)=>{
  if(last.u[allies.length+i][3])return;
  const meta=metadata.find(s=>s.id===enemy.pokemon_id);
  const xp=Math.round(Math.max(1,Math.round((10*meta.cost+4*level)*xpFactor))*vip);
  rewards.trainerXp+=xp;rewards.pokemonXp+=xp;rewards.defeated++;
  const death=result.frames.find(frame=>!frame.u[allies.length+i][3]);
  allies.forEach((_,index)=>{if(death.u[index][3])gains[index]+=xp;});
  rewards.coins+=Math.round((2+meta.cost+route.area)*goldFactor*Math.max(1,Math.sqrt(level/route.min)));
  const drops=engine.drops(enemy.pokemon_id);
  for(const drop of drops.loot)rewards.loot[drop.key]=(rewards.loot[drop.key]||0)+drop.count;
  if(drops.stone)rewards.stones[drops.stone.key]=(rewards.stones[drops.stone.key]||0)+1;
 });
 allies.forEach((m,i)=>m.maxHp=result.units[i].maxHp);
 enemies.forEach((m,i)=>m.maxHp=Math.max(1,Math.floor(result.units[allies.length+i].maxHp)));
 return {...result,snapshot:{allies,enemies},enemies,rewards,supplies,
  allies:allies.map((m,i)=>({...m,condition:last.u[i][3]?Math.max(.01,last.u[i][2]/1000):0,
   xpGain:gains[i]}))};
}

export function captureChance(enemy,ball,known=false){
 const item=catalog.balls[ball];
 if(!item||item.locked)throw Error('Esta bola não pode ser usada na caçada.');
 const meta=createHuntSimulation().metadata().find(s=>s.id===enemy.pokemon_id);
 const rate=catalog.captureRates[enemy.pokemon_id];
 if(rate===undefined)throw Error('Taxa de captura indisponível.');
 let bonus=item.bonus;
 if(ball==='net'&&meta.types.some(t=>['water','bug'].includes(t))||ball==='repeat'&&known)bonus=3;
 // The native formula uses a defeated target with 1 remaining HP. A large M tends to rate*bonus.
 // Persist the exact maximum HP from the server simulation before enabling captures.
 const M=enemy.maxHp;
 if(!Number.isFinite(M)||M<1)throw Error('Dados de captura incompletos.');
 const a=Math.floor(Math.floor(rate*bonus)*(3*M-2)/(3*M));
 const root=a>0?Math.floor(Math.sqrt(Math.floor(Math.sqrt(Math.floor(16711680/a))))):0;
 const chance=a>254?1:a<1?0:Math.min(1,(Math.floor(1048560/root)/65536)**4);
 return enemy.combat_data.shiny?Math.min(.25,chance*.25):chance;
}
