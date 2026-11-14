const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const snap={ownerId:'player',gold:20,trainerLevel:1,trainerXp:0,profile:{route:'0:forest',formation:['field'],organization:[],supplies:{},loot:{}},
 inventory:[{id:'field',pokemon_id:1,level:1,combat_data:{}},{id:'resident',pokemon_id:1,level:7,combat_data:{xp:30,items:['lens'],ivs:{hp:31}}},
 {id:'listed',pokemon_id:1,level:1,is_listed:true,combat_data:{}},{id:'depot',pokemon_id:1,level:1,combat_data:{inDepot:true}}],
 farm:{version:1,onlineCore:true,metFisher:true,metFarmer:true,questClaimed:true,activeHouseId:'house',
 houses:[{id:'house',name:'Sítio das Amoras',tier:0}],deeds:[],residents:[{key:'resident',houseId:'house',trained:30,trainingCarry:.5}]}};
const c={window:{OAK_ONLINE_SNAPSHOT:snap},LINES:[{names:['Bulbasaur'],ids:[1]}],Event:class{},dispatchEvent(){}};
vm.createContext(c);vm.runInContext(fs.readFileSync('modes/idle/online/server-journey.js','utf8'),c);
const view=c.window.IDLE_SERVER_JOURNEY.project();assert.equal(view.village.roster.length,2);
assert.equal(view.village.roster.find(m=>m.key==='resident').place,'farm');assert.equal(view.village.roster.find(m=>m.key==='listed').place,'busy');
assert.equal(view.collection.find(m=>m.id==='resident').items[0],'lens');assert.equal(view.village.roster[0].trainingCarry,.5);
snap.farm.onlineProperties=true;snap.farm.fragments=15;snap.farm.construction={wood:8,stone:4,parts:0};
snap.farm.history=[{action:'Sorteio'}];snap.farm.lastRoll=[{id:'deed',tier:1}];
snap.farm.rolling={startedAt:Date.now()-4000,results:snap.farm.lastRoll,elapsed:0};
const upgraded=c.window.IDLE_SERVER_JOURNEY.project(snap).village;
assert.equal(upgraded.fragments,15);assert.equal(upgraded.construction.wood,8);assert.equal(upgraded.lastRoll.length,1);assert.equal(upgraded.history.length,1);
view.world={};view.hunts.supplies={};c.window.IDLE_SERVER_JOURNEY.apply(view,snap);assert.equal(view.village.roster.find(m=>m.key==='resident').level,7);
vm.runInContext(fs.readFileSync('modes/idle/village/service.js','utf8'),c);
let preparations=0;c.window.IDLE_SERVER_JOURNEY.prepareWorldEdit=async()=>{preparations++;};
let calls=0;c.window.IDLE_SERVER_JOURNEY.mutate=async(state,type,payload)=>{calls++;assert.equal(type,'farm');assert.equal(payload.operation,'return');state.village.roster[0].place='pc';return {receipt:{results:[{id:'deed'}]}};};
(async()=>{
 const service=c.window.createIdleVillageService({state:view});service.reward(99999);service.victory();service.boss('x');assert.equal(calls,0);
 assert.equal(view.village.roster[0].trained,30);const reply=await service.action('request','return',{key:'resident'});assert.equal(reply.ok,true);assert.equal(reply.results[0].id,'deed');assert.equal(calls,1);
 assert.equal(preparations,1,'Resident changes stop the reserved hunt before the farm RPC');
 assert(service.snapshot().rolling.elapsed>=4,'Animation progress survives canonical snapshot refreshes');
 assert.equal((await service.action('request','cast',{})).ok,false,'Fishing stays blocked before migration');
 view.village.onlineFishing=true;view.village.fishing={online:true,ownedRods:[0],catches:[]};
 c.window.IDLE_SERVER_JOURNEY.mutate=async(state,type,payload)=>{assert.equal(type,'fishing');assert.equal(payload.operation,'cast');return {cast:{id:'server-cast',shoal:[129]}};};
 const cast=await service.action('request','cast',{spot:0});assert.equal(cast.ok,true);assert.equal(cast.cast.id,'server-cast');
 assert.equal(service.snapshot().fishing.ownedRods[0],0);
 c.window.IDLE_SERVER_JOURNEY.mutate=async()=>{throw Error('Operação indisponível');};
 assert.equal((await service.action('request','dispose')).ok,false);
 delete view.village;assert.equal((await service.action('request','starter')).ok,false);
 console.log('PASS farm client: canonical projection, reserved roster, equipment preservation, no local XP or rewards, server mutations and missing-migration gate.');
})().catch(e=>{console.error(e);process.exitCode=1;});
