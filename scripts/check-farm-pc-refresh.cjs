const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const snapshot={ownerId:'player',gold:20,trainerLevel:1,trainerXp:0,profile:{route:'0:forest',formation:['field'],
 organization:[{id:'field',pos:{z:'b',r:5,c:1}},{id:'rat',pos:{z:'n',i:0}}],supplies:{},loot:{}},
 inventory:[{id:'field',pokemon_id:1,level:1,combat_data:{}},{id:'rat',pokemon_id:19,level:3,combat_data:{ivs:{hp:20}}}],
 farm:{onlineCore:true,houses:[],deeds:[],residents:[],activeHouseId:null}};
let writes=0,events=[];
const c={window:{OAK_ONLINE_SNAPSHOT:snapshot,OAK_ONLINE_CLIENT:{rpc(name,args){
 assert.equal(name,'journey_organization');writes++;snapshot.profile.organization=args.p_slots;
 return {abortSignal:async()=>({data:structuredClone(snapshot),error:null})};
 }}},LINES:[{names:['Bulbasaur'],ids:[1]},{names:['Rattata'],ids:[19]}],
 document:{baseURI:pathToFileURL(process.cwd()+'/').href},URL,AbortSignal,crypto,Event:class{constructor(type){this.type=type}},dispatchEvent:e=>events.push(e.type)};
vm.createContext(c);vm.runInContext(fs.readFileSync('modes/idle/online/server-journey.js','utf8'),c,{importModuleDynamically:specifier=>import(specifier)});
(async()=>{
 const bridge=c.window.IDLE_SERVER_JOURNEY,state=bridge.project();
 assert.equal(state.village.roster.length,0,'bank Pokémon are not PC candidates');
 const rat=state.team.find(m=>m.id==='rat');state.team=state.team.filter(m=>m.id!=='rat');delete rat.pos;state.collection.push(rat);
 assert.equal(state.village.roster.length,0,'derived list is stale before confirmation');
 await bridge.syncOrganization(state);
 assert.equal(state.village.roster.length,1);assert.equal(state.village.roster[0].key,'rat');assert.equal(state.village.roster[0].place,'pc');
 assert.equal(events.filter(e=>e==='idle-server-progress').length,1);
 state.collection=state.collection.filter(m=>m.id!=='rat');rat.pos={z:'n',i:0};state.team.push(rat);
 await bridge.syncOrganization(state);assert.equal(state.village.roster.length,0);
 await bridge.syncOrganization(state);assert.equal(writes,2,'unchanged lists do not write again');
 console.log('PASS farm PC refresh: deposit appears after server confirmation, withdrawal removes it, no redundant write.');
})().catch(e=>{console.error(e);process.exitCode=1});
