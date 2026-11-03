const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const timers=new Map(),oscillators=[],listeners={};let serial=0;
const param=()=>({setValueAtTime(){},exponentialRampToValueAtTime(){}});
class AudioContext{
 constructor(){this.currentTime=0;this.destination={};this.state='running'}
 resume(){return Promise.resolve()}
 createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){},stop(){this.stopped=true}};oscillators.push(o);return o}
 createGain(){return {gain:param(),connect(){},disconnect(){}}}
}
const env={window:{AudioContext},CFG:{mute:false,sfx:.7},document:{hidden:false,addEventListener:(n,f)=>listeners[n]=f},setInterval:f=>{timers.set(++serial,f);return serial},clearInterval:id=>timers.delete(id),setTimeout:()=>++serial,clearTimeout(){}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../modes/idle/mystery-portal-audio.js'),'utf8'),env);
const audio=env.window.IDLE_PORTAL_AUDIO;
assert.equal(timers.size,0,'no polling on startup');
audio.play('tick');assert.equal(timers.size,1,'one watcher while sounds play');
audio.play('tick');assert.equal(timers.size,1,'watcher is shared');
for(const o of oscillators)o.onended();assert.equal(timers.size,0,'watcher released when all notes finish');
audio.play('charge');env.CFG.mute=true;for(const f of [...timers.values()])f();assert.equal(audio.diagnostics.active,0);assert.equal(timers.size,0,'mute stops notes and watcher');
env.CFG.mute=false;audio.play('reveal');assert.equal(timers.size,1);env.document.hidden=true;listeners.visibilitychange();assert.equal(audio.diagnostics.active,0);assert.equal(timers.size,0,'hidden tab stops notes and watcher');
env.document.hidden=false;audio.play('open');assert.equal(timers.size,1);audio.stop();assert.equal(timers.size,0);assert.equal(audio.duck,1);assert.equal(audio.diagnostics.active,0);
console.log('PASS portal audio: no idle polling, one active watcher, natural completion, mute, visibility and explicit close.');
