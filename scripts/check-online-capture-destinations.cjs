const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const snapshot={ownerId:'player',gold:20,trainerLevel:10,trainerXp:0,profile:{route:'0:forest',formation:['field'],organization:[{id:'field',pos:{z:'b',r:5,c:1}},{id:'bank',pos:{z:'n',i:0}}],preferences:{bankLocked:true,duplicates:'pc'},supplies:{poke:10},wave:1,loot:{}},inventory:[{id:'field',pokemon_id:1,level:1},{id:'bank',pokemon_id:1,level:2},{id:'depot',pokemon_id:1,level:3,combat_data:{inDepot:true}},{id:'pc',pokemon_id:1,level:4}]};
const context={window:{OAK_ONLINE_SNAPSHOT:snapshot},LINES:[{ids:[1,2,3],names:['Bulbasaur','Ivysaur','Venusaur']}],Event:class{},dispatchEvent(){}};
vm.createContext(context);vm.runInContext(fs.readFileSync('modes/idle/online/server-journey.js','utf8'),context);
const bridge=context.window.IDLE_SERVER_JOURNEY,state=bridge.project();
assert.equal(state.team[1].id,'bank');assert.equal(state.team[1].pos.i,0);
assert.equal(state.capture.bankLocked,true);assert.equal(state.capture.duplicates,'pc');
assert.equal(state.captureDepot[0].id,'depot');assert.equal(state.collection[0].id,'pc');
const captured=structuredClone(snapshot);captured.inventory.push({id:'new',pokemon_id:1,level:5});captured.profile.organization.push({id:'new',pos:{z:'n',i:1}});
bridge.apply(state,captured);assert.equal(state.team.length,3);assert.equal(state.team[1].id,'bank');assert.equal(state.team[2].pos.i,1);
bridge.apply(state,captured);assert.equal(state.team.length,3);assert.equal(state.collection.length,1);assert.equal(state.captureDepot.length,1);
console.log('PASS bank and newly captured slots survive repeated authoritative snapshots; PC/depot remain distinct; capture preferences restore.');

(async()=>{
 const {createAuthoritativeHuntHandler}=await import('../modes/idle/online/authoritative-hunt-handler.mjs');
 const player='00000000-0000-4000-8000-000000000001',hunt='00000000-0000-4000-8000-000000000002';
 for(const economy of [false,true]){
  let captureArgs;
  const handle=createAuthoritativeHuntHandler({supabaseUrl:'https://test.local',serviceKey:'server',publishableKey:'public',origins:['https://game.local'],fetcher:async(url,options)=>{
   if(url.endsWith('/auth/v1/user'))return Response.json({id:player});
   if(url.endsWith('/hunt_get'))return Response.json({route:'0:forest',plan:{enemies:[{pokemon_id:1,maxHp:100,combat_data:{shiny:false}}]}});
   assert.ok(url.endsWith('/hunt_capture_destination'));captureArgs=JSON.parse(options.body);return Response.json({capture:{caught:true,destination:economy?'depot':'bench'}});
  }});
  const response=await handle(new Request('https://test.local',{method:'POST',headers:{Origin:'https://game.local',Authorization:'Bearer session','Content-Type':'application/json'},body:JSON.stringify({action:'capture',huntId:hunt,index:0,ball:'poke',economy})}));
  assert.equal(response.status,200);assert.equal(captureArgs.p_economy,economy);assert.equal(captureArgs.p_player,player);
 }
 console.log('PASS authenticated capture handler forwards both economy modes to server routing.');
})().catch(error=>{console.error(error);process.exitCode=1;});
