(function(root){
 const rates=[.25,.40,.75,1,1],slots=[1,1,1,1,2],weights=[74.495,20,5,.5,.005],price=5000,maxHouses=4;
 const sellPrices=[400,700,1200,2000,3000],salvage=[{wood:3,stone:2,parts:0},{wood:5,stone:3,parts:0},{wood:7,stone:5,parts:1},{wood:10,stone:7,parts:3},{wood:15,stone:10,parts:5}];
 const upgrades=[{wood:12,stone:8,parts:1},{wood:24,stone:16,parts:3},{wood:40,stone:28,parts:5}],decorations={flowers:{name:'Jardim de flores',cost:{wood:8,stone:4,parts:0}},stones:{name:'Caminho de pedra',cost:{wood:2,stone:8,parts:0}}};
 function init(s){s.houses??=[];s.deeds??=[];s.propertySerial??=0;s.huntXpTotal??=0;s.huntReceipts??=[];s.construction??={wood:0,stone:0,parts:0};if(s.houseRules!==2){
  const names=['Sítio das Amoras','Chácara do Lago','Refúgio dos Ipês','Estância Aurora','Vale das Estrelas','Refúgio Celestial'],seen=new Set();
  for(const h of [...s.houses,...s.deeds,...(s.rolling?.results||[]),...(s.lastRoll||[]),...(s.history||[])]){if(!h||seen.has(h))continue;seen.add(h);const old=h.tier;if(!Number.isInteger(old)||old<0||old>5)continue;
   // Existing Epic houses become Mythical; existing Mythical and Legendary qualities are retained.
   h.tier=[0,1,2,3,4,3][old];if(!h.name&&h.created)h.name=names[old]+' #'+h.created;
   if(s.houses.includes(h)||s.deeds.includes(h)||s.rolling?.results?.includes(h)){for(let i=0;i<Math.min(3,h.trainingLevel||0);i++)for(const k of ['wood','stone','parts'])s.construction[k]+=upgrades[i][k];h.trainingLevel=0}
  }
  for(const h of s.houses){const members=(s.roster||[]).filter(p=>p.place==='farm'&&p.houseId===h.id);for(const p of members.slice(slots[h.tier])){p.place='pc';delete p.houseId}}
  s.tier=s.houses.find(h=>h.id===s.activeHouseId)?.tier??null;s.houseRules=2;
 }}
 const effectiveRate=h=>rates[h.tier];
 function dispose(s,id,mode){init(s);const i=s.deeds.findIndex(d=>d.id===id);if(i<0||s.deeds[i].locked||!['sell','recycle'].includes(mode))return false;const d=s.deeds[i];s.deeds.splice(i,1);if(mode==='sell')s.gold+=sellPrices[d.tier];else for(const key of ['wood','stone','parts'])s.construction[key]+=salvage[d.tier][key];return true}
 const affordable=(s,cost)=>Object.keys(cost).every(k=>Number.isFinite(s.construction[k])&&s.construction[k]>=cost[k]);
 function spend(s,cost){if(!affordable(s,cost))return false;for(const key of Object.keys(cost))s.construction[key]-=cost[key];return true}
 function upgrade(){return false}
 function decorate(s,id,key){init(s);if(!Object.hasOwn(decorations,key))return false;const h=s.houses.find(h=>h.id===id),recipe=decorations[key];if(!h||(h.decorOwned||[]).includes(key)||!spend(s,recipe.cost))return false;h.decorOwned??=[];h.decorEnabled??=[];h.decorOwned.push(key);h.decorEnabled.push(key);return true}
 function deed(s,tier,name){return {id:'property-'+(++s.propertySerial),tier,name:name||'',created:s.propertySerial}}
 function install(s,id){init(s);if(s.houses.length>=maxHouses)return null;const i=s.deeds.findIndex(d=>d.id===id);if(i<0)return null;const house=s.deeds.splice(i,1)[0];s.houses.push(house);s.activeHouseId=house.id;s.tier=house.tier;return house}
 function start(s){init(s);if(s.houses.length||s.questClaimed)return null;const d=deed(s,0);s.deeds.push(d);const house=install(s,d.id);s.questClaimed=true;return house}
 function pick(random){const n=Math.min(99999,Math.max(0,Math.floor(random()*100000)));let edge=0;for(let i=0;i<weights.length;i++){edge+=Math.round(weights[i]*1000);if(n<edge)return i}return weights.length-1}
 function buy(s,count,random=Math.random,currency='gold'){init(s);const cost=currency==='fragments'?count*10:count*price;if(!['gold','fragments'].includes(currency)||s.rolling||![1,5,10].includes(count)||(currency==='fragments'?(s.fragments||0):s.gold)<cost)return false;const results=Array.from({length:count},()=>deed(s,pick(random)));if(currency==='fragments')s.fragments-=cost;else s.gold-=cost;s.rolling={results,currency,cost,elapsed:0,lastFrame:-1};return true}
 function settle(s){const batch=s.rolling;if(!batch)return [];s.rolling=null;for(const d of batch.results)if(!s.deeds.some(x=>x.id===d.id)&&!s.houses.some(x=>x.id===d.id))s.deeds.push(d);return batch.results}
 function assign(s,key,houseId){const p=s.roster.find(p=>p.key===key),h=s.houses.find(h=>h.id===houseId);if(!p||!h||p.place!=='pc'||s.roster.filter(p=>p.houseId===houseId&&p.place==='farm').length>=slots[h.tier])return false;p.place='farm';p.houseId=houseId;return true}
 function pack(s,id){const i=s.houses.findIndex(h=>h.id===id);if(i<0)return false;for(const p of s.roster.filter(p=>p.houseId===id)){p.place='pc';delete p.houseId}const h=s.houses.splice(i,1)[0];s.deeds.push(h);s.activeHouseId=s.houses[0]?.id||null;s.tier=s.houses[0]?.tier??null;return true}
 const need=level=>50*(level*level-3*level+4);
 function reward(s,receipt,amount){init(s);if(typeof receipt!=='string'||!Number.isFinite(amount)||amount<=0||s.huntReceipts.includes(receipt))return 0;s.huntReceipts.push(receipt);s.huntXpTotal+=amount;let awarded=0;for(const house of s.houses){const members=s.roster.filter(p=>p.place==='farm'&&p.houseId===house.id);if(!members.length)continue;const portion=amount*effectiveRate(house);house.receivedXp=(house.receivedXp||0)+portion*members.length;for(const p of members){const carry=(p.trainingCarry||0)+portion,gain=Math.floor(carry+1e-9);p.trainingCarry=Math.max(0,carry-gain);p.xp=(p.xp||0)+gain;p.trained=(p.trained||0)+gain;awarded+=gain;while(p.xp>=need(p.level)){p.xp-=need(p.level);p.level++}}}return awarded}

 const weekKey=now=>Math.floor((now-(Date.UTC(1970,0,5)+3*3600000))/604800000);
 function economy(s,now=Date.now()){init(s);s.fragments??=0;s.fragmentLog??=[];s.fragmentBosses??=[];const week=weekKey(now);if(!s.weekly||s.weekly.week!==week)s.weekly={week,wins:0,claimed:false};return s.weekly}
 function addFragments(s,count,source,now=Date.now()){economy(s,now);s.fragments+=count;s.fragmentLog.unshift({count,source,time:now});s.fragmentLog=s.fragmentLog.slice(0,30)}
 function victory(s,random=Math.random,now=Date.now()){const q=economy(s,now);q.wins=Math.min(100,q.wins+1);const drop=random()<.005;if(drop)addFragments(s,1,'Caçada',now);return drop?1:0}
 function boss(s,key,now=Date.now()){economy(s,now);if(typeof key!=='string'||s.fragmentBosses.includes(key))return 0;s.fragmentBosses.push(key);addFragments(s,2,'Chefe de caçada',now);return 2}
 function claimWeekly(s,now=Date.now()){const q=economy(s,now);if(q.claimed||q.wins<100)return false;q.claimed=true;addFragments(s,5,'Missão semanal de Dona Rosa',now);return true}
 function fuse(s,ids){init(s);if(s.rolling||!Array.isArray(ids)||ids.length!==5||new Set(ids).size!==5)return null;const chosen=ids.map(id=>s.deeds.find(d=>d.id===id));if(chosen.some(d=>!d||d.locked)||![0,1].includes(chosen[0].tier)||chosen.some(d=>d.tier!==chosen[0].tier))return null;const result=deed(s,chosen[0].tier+1);s.deeds=s.deeds.filter(d=>!ids.includes(d.id));s.deeds.push(result);s.history??=[];s.history.unshift({...result,action:'Fusão de cinco '+(chosen[0].tier===0?'Comuns':'Incomuns'),time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),consumed:ids.slice()});s.history=s.history.slice(0,30);return result}
 const api={economy,weekKey,victory,boss,claimWeekly,fuse,sellPrices,salvage,upgrades,decorations,effectiveRate,dispose,affordable,upgrade,decorate,rates,slots,weights,price,maxHouses,init,install,start,buy,settle,assign,pack,reward,need};if(typeof module!=='undefined')module.exports=api;else root.RURAL_PROPERTIES=api;
})(typeof window==='undefined'?globalThis:window);
