import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('modes/idle/online/hunt-engine.mjs','utf8').replace('return {run,species:','return {lines:LINES,base:baseStats,run,species:');
const {createHuntSimulation}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const engine=createHuntSimulation(),ctx={window:{},LINES:engine.lines,baseStats:engine.base};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('modes/idle/mega/model.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('modes/idle/individuals.js','utf8'),ctx);
const I=ctx.window.IDLE_INDIVIDUALS;
const member={name:'Charmander',star:3,level:100,ivs:Object.fromEntries(I.keys.map(k=>[k,31])),potency:4,nature:'Hardy',talent:'vigour'};
for(const shiny of [false,true]){
 const normal=I.potentialScore({...member,shiny}),mega=I.potentialScore({...member,shiny,megaKey:'charizard-x'});
 assert(mega>=normal+.09999,'Mega preserves the minimum evolution gain');
 if(shiny)assert(mega>normal+.10001,'Shiny Mega stat gains exceed the evolution floor');
 assert.equal(I.potentialScore({...member,shiny,megaKey:'invalid'}),normal);
 assert.equal(I.potentialScore({...member,shiny,megaKey:'charizard-x',level:999}),mega);
 assert.equal(I.potentialScore({...member,shiny,megaKey:'charizard-x',evolutionRatingFloor:10}),10);
 console.log((shiny?'Shiny':'Normal')+': base '+normal.toFixed(4)+' / Mega X '+mega.toFixed(4));
}
for(const def of ctx.window.IDLE_MEGA_DEFS){
 const line=engine.lines.find(l=>l.ids.includes(def.id));if(!line)continue;
 const m={...member,name:line.names[0],star:line.ids.indexOf(def.id)+1,megaKey:def.key};
 assert(I.potentialScore(m)>=Math.min(10,I.potentialScore({...m,megaKey:null})+.1));
}
console.log('PASS Mega stat contribution, minimum evolution gain, level independence, invalid forms and score cap.');
