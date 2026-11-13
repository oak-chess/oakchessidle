import assert from 'node:assert/strict';
import {createHuntSimulation as current} from '../modes/idle/online/hunt-engine.mjs';
import {execFileSync} from 'node:child_process';
// Pin the pre-animation engine so future runs still check combat parity.
const baseline=execFileSync('git',['show','6cacdcd95ea503f4954b879780bbdea5b8a91361:modes/idle/online/hunt-engine.mjs'],{encoding:'utf8',maxBuffer:4*1024*1024});
const {createHuntSimulation:previous}=await import('data:text/javascript;base64,'+Buffer.from(baseline).toString('base64'));
const roster=ids=>ids.map((pokemon_id,i)=>({id:'visual-parity-'+i,pokemon_id,level:30,combat_data:{condition:1}}));
let count=0;
for(const seed of [1,421,98765]){
 const a=roster([1,4,7]),b=roster([13,16,19]);const old=previous(seed).run(a,b),next=current(seed).run(a,b);
 assert.equal(next.winner,old.winner);assert.equal(next.elapsedMs,old.elapsedMs);
 assert.deepEqual(next.frames.map(f=>({t:f.t,u:f.u.map(p=>p.slice(0,5))})),old.frames);
 const events=next.frames.flatMap(f=>f.e);assert(events.some(e=>e.k==='attack'));assert(events.some(e=>e.k==='hit'));assert(events.some(e=>e.k==='cast'));
 assert(next.frames.every(f=>f.u.every(p=>p.every(Number.isFinite))));count+=events.length;
}
console.log('PASS identical combat outcomes/positions/HP for three seeds; '+count+' visual events');
