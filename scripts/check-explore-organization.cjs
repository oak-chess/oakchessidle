const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('modes/idle/idle.js','utf8'),line=source.split(/\r?\n/).find(s=>s.startsWith('async function toggle()'));
assert(line);const calls=[];let preferences,organization;
const c={ONLINE:true,running:false,launchStep:'',toggle:null,refreshHuntControl:()=>calls.push('control'),$id:()=>null,SND:{init(){}},
 state:{world:{}},G:{},sessionStorage:{removeItem:()=>calls.push('unpause')},
 IDLE_SERVER_JOURNEY:{syncPreferences:()=>new Promise(r=>{preferences=r;calls.push('preferences');}),syncOrganization:()=>new Promise(r=>{organization=r;calls.push('organization');})},
 capturePositions:()=>calls.push('capturePositions'),closeWindows:()=>calls.push('close'),
 captureSystem:{start(){}},hunts:{start(){}},safeFight:()=>calls.push('fight'),message(){},render(){},save(){},
 showIdleError:e=>{throw e;}};
vm.createContext(c);vm.runInContext(line,c);
(async()=>{
 const start=c.toggle();assert.equal(c.running,false);assert.equal(calls.includes('fight'),false);
 await c.toggle();assert.equal(calls.filter(x=>x==='preferences').length,1,'double click cannot start two battles');
 preferences();await new Promise(r=>setImmediate(r));assert.equal(c.running,false);assert.equal(calls.includes('fight'),false);
 organization();await start;assert.equal(c.running,true);assert.equal(calls.filter(x=>x==='fight').length,1);
 assert(calls.indexOf('organization')<calls.indexOf('fight'));
 console.log('PASS Explore waits for confirmed organization and rejects duplicate start clicks.');
})().catch(e=>{console.error(e);process.exitCode=1});
