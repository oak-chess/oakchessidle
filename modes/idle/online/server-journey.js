/* Client projection only. No local save is uploaded and no reward is accepted from this file. */
window.IDLE_SERVER_JOURNEY=(()=>{
 let canonical=window.OAK_ONLINE_SNAPSHOT,client,config;
 const clone=value=>JSON.parse(JSON.stringify(value));
 async function connection(){
  config??=await import(new URL('modes/idle/online/config.js',document.baseURI).href);
  client??=window.OAK_ONLINE_CLIENT??=window.supabase.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
  return client;
 }
 // Serialize account responses as well as writes: an older response must never
 // replace a newer balance or inventory while another request is in flight.
 let accountQueue=Promise.resolve();
 function ordered(work){const task=accountQueue.then(work);accountQueue=task.catch(()=>{});return task;}
 function rpc(name,args={}){return ordered(()=>rawRpc(name,args));}
 async function rawRpc(name,args={}){
  const sdk=await connection();const {data,error}=await sdk.rpc(name,args).abortSignal(AbortSignal.timeout(15000));
  if(error)throw Error(error.code==='P0001'?error.message:'Não foi possível carregar sua jornada online.');
  return data;
 }
 function request(body){return ordered(()=>rawRequest(body));}
 async function rawRequest(body,endpoint='hunt-battle'){
  const sdk=await connection(),{data:{session}}=await sdk.auth.getSession();
  if(!session||session.user.id!==canonical?.ownerId)throw Error('Sua sessão mudou. Entre novamente.');
  const response=await fetch(config.SUPABASE_URL+'/functions/v1/'+endpoint,{method:'POST',
   headers:{Authorization:'Bearer '+session.access_token,apikey:config.SUPABASE_ANON_KEY,'Content-Type':'application/json'},
   body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
  const data=await response.json();if(!response.ok)throw Error(data.error||'A caçada não pôde ser confirmada pelo servidor.');
  if(data.state)canonical=data.state;
  return data;
 }
 function member(row){
  const line=LINES.find(l=>l.ids.includes(row.pokemon_id));if(!line)throw Error('Espécie online indisponível: '+row.pokemon_id);
  const data=clone(row.combat_data||{});
  return {...data,id:row.id,name:line.names[0],star:line.ids.indexOf(row.pokemon_id)+1,level:row.level,xp:data.xp||0,
   items:Array.isArray(data.items)?data.items:[],condition:data.condition??1,candy:0,
   locked:row.is_listed===true||!!data.locked,isListed:row.is_listed===true,captureDetails:{speciesId:row.pokemon_id,level:data.originLevel,
   ball:data.ball,chance:data.captureChance,wave:data.originWave,...data.captureDetails}};
 }
 function project(snapshot=canonical){
  if(!snapshot?.profile||!Array.isArray(snapshot.inventory))throw Error('Jornada online incompleta.');
  canonical=snapshot;
  const formation=snapshot.profile.formation||[],members=snapshot.inventory.map(member),route=snapshot.profile.route.split(':');
  const saved=snapshot.profile.organization||[],slots=new Map(saved.map(slot=>[slot.id,slot.pos]));
  const field=formation.map(id=>members.find(m=>m.id===id)).filter(Boolean);
  const team=[...field,...members.filter(m=>!formation.includes(m.id)&&slots.get(m.id)?.z==='n')];
  team.forEach((m,i)=>{const savedPos=slots.get(m.id);m.pos=clone(formation.includes(m.id)?savedPos?.z==='b'?savedPos:{z:'b',r:5+Math.floor(i/3),c:[1,3,5][i%3]}:savedPos);});
  const supplies=clone(snapshot.profile.supplies),preferences=snapshot.profile.preferences||{};
  const farm=snapshot.farm,assigned=new Map((farm?.residents||[]).map(r=>[r.key,r]));
  const village=farm?{construction:{wood:0,stone:0,parts:0},history:[],lastRoll:[],rolling:null,fragments:0,
   ...clone(farm),gold:snapshot.gold,tier:farm.houses.find(h=>h.id===farm.activeHouseId)?.tier??null,
   roster:members.filter(m=>!team.includes(m)&&!m.inDepot).map(m=>({key:m.id,species:LINES.find(l=>l.names[0]===m.name).ids[m.star-1],
   name:LINES.find(l=>l.names[0]===m.name).names[m.star-1],level:m.level,xp:m.xp,
   ivs:['hp','atk','def','spa','spd','spe'].map(k=>m.ivs?.[k]||0),potency:m.potency||1,shiny:!!m.shiny,
   favorite:!!m.favorite,locked:!!m.locked,place:assigned.has(m.id)?'farm':m.isListed?'busy':'pc',...clone(assigned.get(m.id)||{})}))}:undefined;
  return {gold:snapshot.gold,trainerLevel:snapshot.trainerLevel,trainerXp:snapshot.trainerXp,
   levelSchema:2,schemaVersion:5,area:Number(route[0]),last:Date.now(),wins:0,pending:0,tutorial:clone(preferences.tutorial||{}),items:clone(snapshot.profile.gear||[]),shopHistory:clone(snapshot.profile.shop_history||[]),
   world:{badges:clone(snapshot.profile.badges||[]),regionWins:clone(snapshot.profile.region_wins||{}),stones:clone(snapshot.profile.stones||{})},
   village,team,collection:members.filter(m=>!team.includes(m)&&!m.inDepot),captureDepot:members.filter(m=>!team.includes(m)&&m.inDepot),ballStock:Object.fromEntries(Object.entries(supplies).filter(([k])=>k!=='poke')),
   capture:{ball:preferences.captureBall||'poke',enabled:preferences.captureEnabled??true,bankLocked:preferences.bankLocked??false,duplicates:preferences.duplicates||'keep'},captureShiny:{ball:preferences.shinyBall||'ultra'},
   balls:supplies.poke||0,hunts:{kind:route[1],wave:snapshot.profile.wave,routeKey:snapshot.profile.route,autoAdvance:preferences.autoAdvance??true,autoSellLoot:preferences.autoSellLoot??true,
   loot:clone(snapshot.profile.loot),supplies:{...supplies,heal:true,revive:true,threshold:50,healItem:'potions',reviveItem:'revives',...preferences,itemReserves:clone(preferences.itemReserves||{})}},
   vip:{version:1,credits:0,vipUntil:Date.parse(snapshot.profile.vip_until),vipSince:Date.parse(snapshot.profile.created_at)},
   welcomeGift:{version:1,at:Date.parse(snapshot.profile.created_at)},huntRunning:!!snapshot.activeHunt};
 }
 function apply(state,snapshot=canonical){
  const view=project(snapshot);
  state.wins=snapshot.profile.total_wins||0;Object.assign(state.world,view.world);
  state.gold=view.gold;state.trainerLevel=view.trainerLevel;state.trainerXp=view.trainerXp;
  state.team=view.team;state.collection=view.collection;state.captureDepot=view.captureDepot;state.balls=view.balls;state.ballStock=view.ballStock;
  state.vip=view.vip;state.village=view.village;state.hunts.supplies={...state.hunts.supplies,...view.hunts.supplies};
  state.hunts.autoAdvance=view.hunts.autoAdvance;state.hunts.autoSellLoot=view.hunts.autoSellLoot;
  state.hunts.loot=view.hunts.loot;state.hunts.wave=view.hunts.wave;
  state.world.stones=clone(canonical.profile.stones||{});state.items=clone(canonical.profile.gear||[]);
  state.shopHistory=clone(canonical.profile.shop_history||[]);state.encounter=null;state.encounterGenes=null;
  dispatchEvent(new Event('idle-server-progress'));
 }
 async function formation(ids){canonical=await rpc('hunt_set_formation',{p_ids:ids});return canonical;}
 let preferenceTask=null;
 function selectedPreferences(state){const s=state.hunts.supplies;return {heal:s.heal,revive:s.revive,threshold:Math.round(s.threshold),healItem:s.healItem,reviveItem:s.reviveItem,afterDefeat:s.afterDefeat,autoAdvance:state.hunts.autoAdvance,
 autoSellLoot:state.hunts.autoSellLoot??true,bankLocked:!!state.capture.bankLocked,duplicates:state.capture.duplicates||'keep',captureEnabled:state.capture.enabled,captureBall:state.capture.ball,shinyBall:state.captureShiny.ball,
 ...(Object.keys(s.itemReserves||{}).length?{itemReserves:s.itemReserves}:{}),
 tutorial:state.tutorial?Object.fromEntries(['index','tip','visited','introduced','complete','contentVersion','version','mode','skipped'].filter(key=>state.tutorial[key]!==undefined).map(key=>[key,clone(state.tutorial[key])])):{}};}
 async function syncPreferences(state){
  if(preferenceTask)await preferenceTask;
  const desired=selectedPreferences(state),stored=canonical.profile.preferences||{};
  if(Object.entries(desired).every(([key,value])=>key==='itemReserves'?Object.keys(stored[key]||{}).length===Object.keys(value).length&&Object.entries(value).every(([id,count])=>stored[key]?.[id]===count):JSON.stringify(stored[key])===JSON.stringify(value)))return;
  const id=crypto.randomUUID();
  preferenceTask=rpc('journey_shop',{p_request:id,p_action:'preferences',p_payload:desired}).then(result=>{canonical=result.state;}).finally(()=>{preferenceTask=null;});
  await preferenceTask;
 }
 let organizationTask=null,organizationEditor=null;
 async function syncOrganization(state){
  if(organizationTask)await organizationTask;
  organizationTask=(async()=>{
   const slots=state.team.filter(m=>['b','n'].includes(m.pos?.z)).map(m=>({id:m.id,pos:clone(m.pos)})).sort((a,b)=>a.id.localeCompare(b.id));
   const stored=(canonical.profile.organization||[]).slice().sort((a,b)=>a.id.localeCompare(b.id));
   if(JSON.stringify(slots)===JSON.stringify(stored))return;
   // A prepared replay also reserves its original team. Stop it before editing,
   // outside the account queue: the replay may itself be awaiting that queue.
   if(canonical.activeHunt&&organizationEditor)return organizationEditor(slots);
   return ordered(async()=>{
   // Read slots after earlier account operations have applied their new captures.
   if(canonical.activeHunt){
    const field=state.team.filter(m=>m.pos?.z==='b').map(m=>m.id).sort();
    if(JSON.stringify(field)!==JSON.stringify([...(canonical.profile.formation||[])].sort()))throw Error('Conclua o encontro ou use o PC para reorganizar sua equipe.');
   }
   canonical=await rawRpc('journey_organization',{p_request:crypto.randomUUID(),p_slots:slots});
   // PC deposits/withdrawals update organization without reapplying the entire
   // battle view. Refresh the derived farm roster from that confirmed response.
   state.village=project(canonical).village;
   dispatchEvent(new Event('idle-server-progress'));
   });
  })().finally(()=>{organizationTask=null;});
  await organizationTask;
 }
 let preferenceTimer;
 function queuePreferences(state){clearTimeout(preferenceTimer);preferenceTimer=setTimeout(()=>{void (async()=>{await syncPreferences(state);await syncOrganization(state);})().catch(error=>dispatchEvent(new CustomEvent('idle-server-error',{detail:error.message})))},500);}
 // Keep a request ID on transport failure, so retrying cannot charge twice.
 const operations=new Map();let mutationBusy=false;
 async function mutate(state,action,payload={}){
  if(mutationBusy)throw Error('Aguarde a confirmação da operação anterior.');
  const key=JSON.stringify([action,payload]),id=operations.get(key)||crypto.randomUUID();operations.set(key,id);mutationBusy=true;
  try{let result;
   if(action==='fishing'){
    if(payload.operation==='cast'||payload.operation==='finish')result=await ordered(()=>rawRequest(payload.operation==='cast'?{action:'cast',requestId:id,settings:payload.data}:{action:'finish',castId:payload.data.id,trace:payload.data.trace,duration:payload.data.duration},'fishing-battle'));
    else result=await rpc('journey_fishing',{p_request:id,p_action:payload.operation,p_payload:payload.data});
   }else result=action==='farm'?await rpc('journey_farm',{p_request:id,p_action:payload.operation,p_payload:payload.data}):action==='evolve'?await request({action,requestId:id,...payload}):action==='storage'?await rpc('journey_storage',{p_request:id,p_inventory:payload.inventoryId,p_depot:payload.depot}):action==='equipment'?await rpc('journey_equipment',{p_request:id,p_action:payload.operation,p_payload:payload.data}):await rpc('journey_shop',{p_request:id,p_action:action,p_payload:payload});
   if(result.state){canonical=result.state;apply(state);}operations.delete(key);return result;
  }finally{mutationBusy=false;}
 }
 async function abandon(){canonical=await rpc('hunt_abandon');return canonical;}
 async function organize(state,slots){return ordered(async()=>{canonical=await rawRpc('journey_organization',{p_request:crypto.randomUUID(),p_slots:clone(slots)});apply(state);return canonical;});}
 return {project,apply,request,formation,mutate,abandon,organize,syncPreferences,syncOrganization,queuePreferences,
 setOrganizationEditor:fn=>{organizationEditor=fn;},async prepareWorldEdit(){if(!organizationEditor)throw Error('Aguarde o carregamento da jornada.');return organizationEditor(null);},
 get snapshot(){return canonical},get enabled(){return !!canonical}};
})();
