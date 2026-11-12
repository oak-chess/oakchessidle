import assert from 'node:assert/strict';
import {createArenaSimulation} from './arena-engine.mjs';
const team=(ids,level=200)=>ids.map((pokemon_id,i)=>({id:'00000000-0000-0000-0000-'+String(pokemon_id*10+i).padStart(12,'0'),pokemon_id,level}));
const a=team([3,6,9,18,65,94]),b=team([130,149,143,103,68,26]);
const first=createArenaSimulation(42).run(a,b);
assert.deepEqual(createArenaSimulation(42).run(a,b),first,'server seed must reproduce the battle');
assert(first.frames.length>1&&first.elapsedMs<=81000);
assert(first.frames.every(f=>f.u.length===12&&f.u.every(u=>u.every(Number.isFinite))));
assert.throws(()=>createArenaSimulation().run(a.slice(1),b),/formation/);
const species=[...new Set(createArenaSimulation().species())];
for(let offset=0;offset<species.length;offset+=6){
 const ids=Array.from({length:6},(_,i)=>species[(offset+i)%species.length]);
 const result=createArenaSimulation(offset+1).run(team(ids),b);
 assert([-1,0,1].includes(result.winner),'bounded result for '+ids);
 assert(result.frames.every(f=>f.u.every(u=>u.every(Number.isFinite))),'finite stats for '+ids);
}
console.log('PASS authoritative combat: deterministic replay, six members, finite results across '+species.length+' species');
