import assert from 'node:assert/strict';
import {createFishingHandler,fishingCaptures} from '../modes/idle/online/fishing-handler.mjs';
import {createCastState,advanceCast,castInput} from '../modes/idle/fishing/cast-rules.mjs';
const user='10000000-0000-4000-8000-000000000001',id='20000000-0000-4000-8000-000000000001';
const cast={id,shoal:[129],technique:'precision',seed:'a721b6e5-1af1-436d-9841-0c0f067ab3a4',
 payload:{spot:0,rod:0,depth:'bank',bait:'basic',technique:'precision'},started_at:new Date().toISOString(),wallElapsed:120000};
let calls=[];
const handler=createFishingHandler({supabaseUrl:'https://database.test',serviceKey:'server-only',publishableKey:'public',origins:['https://game.test'],
 fetcher:async(url,options)=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:user});
  const args=JSON.parse(options.body);calls.push({url,args});assert.equal(options.headers.apikey,'server-only');
  if(url.endsWith('/fishing_get')||url.endsWith('/fishing_prepare'))return Response.json(cast);
  if(url.endsWith('/fishing_settle'))return Response.json({receipt:{won:args.p_won},state:{}});
  throw Error('Unexpected request');
 }});
const send=(body,origin='https://game.test')=>handler(new Request('https://edge.test',{method:'POST',headers:{Origin:origin,Authorization:'Bearer session'},body:JSON.stringify(body)}));
assert.equal((await send({action:'finish',castId:id,won:true})).status,400);
assert.equal(calls.length,0);
assert.equal((await send({action:'cast',requestId:id,settings:cast.payload},'https://evil.test')).status,403);
const prepared=await(await send({action:'cast',requestId:id,settings:cast.payload})).json();
assert.equal(prepared.cast.seed,undefined,'private gene seed must never reach browser');
assert.equal(prepared.cast.id,id);
const sim=createCastState({species:129,technique:'precision'}),trace=[];
while(!['caught','lost'].includes(sim.phase)){
 const input=sim.phase==='bite'?'hook':sim.phase==='reel'&&sim.precisionPosition>=42&&sim.precisionPosition<=62?'tap':null;
 if(input){trace.push({at:sim.time,input});castInput(sim,input);}advanceCast(sim,20);
}
calls=[];
const valid={action:'finish',castId:id,trace,duration:sim.time};
assert.equal((await send(valid)).status,200);
assert.equal(calls.at(-1).args.p_player,user);
assert.equal(calls.at(-1).args.p_won,true);
const generated=calls.at(-1).args.p_captures;
assert.equal(generated[0].species,129);assert.ok(generated[0].genes.ivs.hp>=0);
assert.deepEqual(fishingCaptures(cast),generated,'retry must generate same individual');
calls=[];cast.wallElapsed=0;
assert.equal((await send(valid)).status,400);assert.equal(calls.length,1,'too-fast completion cannot settle');
cast.wallElapsed=120000;calls=[];
assert.equal((await send({...valid,duration:20,trace:[]})).status,409);assert.equal(calls.length,1);
assert.equal((await send({...valid,trace:Array.from({length:513},()=>({at:0,input:'tap'}))})).status,400);
assert.equal((await send({...valid,p_player:'attacker'})).status,400);
console.log('PASS fishing handler: authenticated owner, private RNG, validated replay, server time and deterministic genes.');
