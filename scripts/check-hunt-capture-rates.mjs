import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {captureChance} from '../modes/idle/online/hunt-plan.mjs';
import {HUNT_CATALOG as catalog} from '../modes/idle/online/hunt-catalog.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync('modes/idle/items-data.js','utf8'),context);
context.window.IDLE_CAPTURE_RATES=catalog.captureRates;
let count=0;
for(const species of catalog.species){
 for(const ball of ['poke','great','ultra','net','repeat'])for(const known of [false,true]){
  const conditional=ball==='net'&&species.types.some(t=>['water','bug'].includes(t))||ball==='repeat'&&known;
  const expected=ball==='great'?.0073:ball==='ultra'?.0146:conditional?.011:.0037;
  for(const maxHp of [1,50,500000]){
   const enemy={pokemon_id:species.id,maxHp,combat_data:{}};
   assert.equal(captureChance(enemy,ball,known),expected,species.name+' '+ball);
   assert.equal(captureChance({...enemy,combat_data:{shiny:true}},ball,known),expected*.25);
  }
  const L={ids:[species.id],names:[species.name],t:species.types};
  const state={capture:{ball},team:[],collection:[],fieldNotes:{captured:known?{[species.name]:1}:{}}};
  assert.equal(context.window.IDLE_ITEMS.chance(state,L,5000,species.id),expected,'UI/server parity');count++;
 }
}
assert.throws(()=>captureChance({pokemon_id:1,combat_data:{}},'master'));
assert.throws(()=>captureChance({pokemon_id:1,combat_data:{}},'mystic'));
console.log('PASS '+count+' species/ball/ownership cases; fixed rates, evolution and HP independence, UI parity, shiny modifier, locked balls.');
