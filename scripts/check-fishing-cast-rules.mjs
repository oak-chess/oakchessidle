import assert from 'node:assert/strict';
import {createCastState,advanceCast,castInput,replayCast} from '../modes/idle/fishing/cast-rules.mjs';

// These traces use the same public controls as the UI; they grant no account data.
for(const technique of ['float','precision']) {
 for(const species of [129,79,131]) {
  const config={species,technique}, s=createCastState(config), trace=[];
  let duration=0;
  while(!['caught','lost'].includes(s.phase) && duration<60000) {
   let input;
   if(s.phase==='bite') input='hook';
   else if(s.phase==='reel' && technique==='float') {
    if(!s.holding && s.tension<40) input='hold';
    else if(s.holding && s.tension>65) input='release';
   } else if(s.phase==='reel' && technique==='precision' &&
      s.precisionPosition>=42 && s.precisionPosition<=62) input='tap';
   if(input) { trace.push({at:duration,input}); castInput(s,input); }
   advanceCast(s,20); duration+=20;
  }
  assert.equal(s.won,true,`${technique}/${species} should be playable`);
  assert.deepEqual(replayCast(config,trace,duration,duration+1500),s);
  assert.throws(()=>replayCast(config,trace,duration,duration-1));
 }
}
const config={species:129,technique:'float'};
assert.equal(replayCast(config,[],10000,10000).won,false,'waiting cannot grant a capture');
assert.equal(replayCast(config,[{at:0,input:'hook'},{at:20,input:'hold'}],10000,10000).won,false,
 'hooking before the bite cannot win');
for(const trace of [
 [{at:20,input:'hold'},{at:0,input:'release'}],
 [{at:20,input:'hold'},{at:20,input:'release'}],
 [{at:1,input:'hook'}], [{at:-20,input:'hook'}], [{at:200,input:'hook'}],
 [{at:0,input:'win'}], [{at:0,input:'hook',won:true}],
 Array.from({length:513},(_,i)=>({at:i*20,input:'tap'}))
]) assert.throws(()=>replayCast(config,trace,100,100));
for(const duration of [NaN,Infinity,-20,1,120020])
 assert.throws(()=>replayCast(config,[],duration,200000));
assert.throws(()=>createCastState({species:150,technique:'float'}));
assert.throws(()=>createCastState({species:129,technique:'automatic-win'}));
const whole=createCastState(config), chunks=createCastState(config);
advanceCast(whole,6000); for(let i=0;i<300;i++) advanceCast(chunks,20);
assert.deepEqual(whole,chunks,'render batches must not change simulation');
console.log('Fishing replay checks passed: both techniques, all ranks, forged time and invalid traces.');
