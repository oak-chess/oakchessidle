import assert from 'node:assert/strict';
import {createArenaHandler} from './arena-handler.mjs';
const player='00000000-0000-0000-0000-000000000001',offer='00000000-0000-0000-0000-000000000002';
let calls=[],deny=false;
const handler=createArenaHandler({supabaseUrl:'https://example.test',serviceKey:'server-secret',publishableKey:'public',origins:['https://game.test'],fetcher:async(url,options)=>{
 calls.push({url,options});
 if(url.endsWith('/user'))return Response.json(deny?{error:'invalid'}:{id:player},{status:deny?401:200});
 if(url.endsWith('arena_prepare_match'))return Response.json({id:offer,seed:1,snapshot:{
  allies:Array.from({length:6},(_,i)=>({id:'a'+i,pokemon_id:1,level:200})),
  enemies:Array.from({length:6},(_,i)=>({id:'b'+i,pokemon_id:4,level:200}))}});
 if(url.endsWith('arena_settle_match'))return Response.json(JSON.parse(options.body).p_result);
 throw Error('Unexpected request');
}});
const req=body=>new Request('https://edge.test',{method:'POST',headers:{Origin:'https://game.test',Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify(body)});
assert.equal((await handler(req({offerId:offer,winner:0}))).status,400);
assert.equal(calls.length,0);
assert.equal((await handler(new Request('https://edge.test',{method:'POST'}))).status,401);
deny=true;assert.equal((await handler(req({offerId:offer}))).status,401);assert.equal(calls.length,1);
calls=[];deny=false;
const response=await handler(req({offerId:offer}));assert.equal(response.status,200);
const result=await response.json();assert([-1,0,1].includes(result.winner));assert(result.frames.length>0);
assert.equal(calls.length,3);assert.equal(JSON.parse(calls[1].options.body).p_player,player);
assert(!JSON.stringify(result).includes('server-secret'));
assert.equal(response.headers.get('Cache-Control'),'no-store');
assert.equal((await handler(new Request('https://edge.test',{method:'OPTIONS',headers:{Origin:'https://evil.test'}}))).status,403);
console.log('PASS Arena HTTP: verified identity, rejects forged results, server simulation and private settlement');
