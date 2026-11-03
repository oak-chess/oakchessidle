const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const env={window:{OAK_IDLE_MODE:true,IDLE_PANEL_OPEN:false},document:{getElementById:()=>null}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../modes/idle/render-budget.js'),'utf8'),env);
let draws=0;const paint=t=>env.window.IDLE_RENDER_FX(t,()=>draws++);
for(let t=0;t<100;t++)paint(t);assert.equal(draws,100,'normal drawing unchanged');
env.window.IDLE_PANEL_OPEN=true;draws=0;for(let t=100;t<1100;t++)paint(t);assert.equal(draws,10,'panel painting limited');
env.window.IDLE_PANEL_OPEN=false;paint(1100);assert.equal(draws,11,'closing paints immediately');env.window.IDLE_PANEL_OPEN=true;paint(1101);assert.equal(draws,12,'new panel cycle starts fresh');
env.window.OAK_IDLE_MODE=false;for(let i=0;i<20;i++)paint(1102+i);assert.equal(draws,32,'other modes not limited');
console.log('PASS extracted presentation scheduler: cadence, reopen, immediate resume, mode isolation.');
