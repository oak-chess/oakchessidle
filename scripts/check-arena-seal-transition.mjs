import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('assets/viridian-arena.js','utf8');
const body='tick(dt,state){'+source.match(/ tick\(dt,state\)\{([\s\S]*?)\r?\n \}\r?\n\};/)[1]+'\n }';
const draw={setTransform(){},clearRect(){}};
const ctx={effects:{style:{},getContext:()=>draw},audioElapsed:0,lastAudioMode:'',ambientAudio(){},
 document:{hidden:false},window:{IDLE_PANEL_OPEN:false},angled:true,paused:false,config:{},time:0,
 gridSoftness:0,sealProgress:0,reducedMotion:false,lastGrid:0,visualElapsed:0,
 forestLife(){},atmosphere(){},c:null,mode:''};
vm.createContext(ctx);vm.runInContext('var subject={'+body+'};',ctx);
const state={active:true,combat:true,paused:false,quality:'high'};
ctx.subject.tick(.1,state);assert(ctx.sealProgress>0&&ctx.sealProgress<1);
const p=ctx.sealProgress;ctx.subject.tick(.1,{...state,paused:true});assert.equal(ctx.sealProgress,p);
for(let i=0;i<20;i++)ctx.subject.tick(.1,state);assert.equal(ctx.sealProgress,1);
for(let i=0;i<15;i++)ctx.subject.tick(.1,{...state,combat:false});assert.equal(ctx.sealProgress,0);
ctx.reducedMotion=true;ctx.subject.tick(.1,state);assert.equal(ctx.sealProgress,1);
for(let i=0;i<100;i++)ctx.subject.tick(.1,state);
assert.equal(ctx.subject.tick(.1,state),false,'settled seal must not force canvas repaints');
console.log('PASS arena seal enters, pauses, reverses, respects reduced motion and stops repainting');
