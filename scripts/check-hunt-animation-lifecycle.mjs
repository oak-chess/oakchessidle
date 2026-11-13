import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Returning from another tab must release every renderer, without running the
// offline combat simulator or cancelling the online encounter's next timer.
const source=fs.readFileSync('modes/idle/idle.js','utf8');
const start=source.indexOf('function handleIdleVisibility(){');
const end=source.indexOf("document.addEventListener('visibilitychange',handleIdleVisibility)",start);
assert(start>=0&&end>start);
const calls=[];
const context={ONLINE:true,ready:true,window:{IDLE_BACKGROUND_BUSY:true},document:{hidden:true},
 backgroundStamp:123,backgroundDebt:50,backgroundTimer:42,lastT:0,
 clearInterval:()=>calls.push('clearInterval'),save:()=>calls.push('save'),
 captureFx:{clear:()=>calls.push('captureClear')},trainerUI:{clear:()=>calls.push('trainerClear')},
 performance:{now:()=>777}};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
context.handleIdleVisibility();
assert.equal(context.window.IDLE_BACKGROUND_BUSY,false);
assert.equal(context.backgroundStamp,0);assert.equal(context.backgroundDebt,0);
context.document.hidden=false;context.window.IDLE_BACKGROUND_BUSY=true;
context.handleIdleVisibility();
assert.equal(context.window.IDLE_BACKGROUND_BUSY,false);assert.equal(context.lastT,777);

// Settlement stays exactly once; the arena remains until recall and confirmed
// capture presentations finish, including the final animation in the queue.
const order=[];
const replay={elapsedMs:0,frames:[{t:0,u:[[1,2,1000,1,0],[3,4,0,0,0]]}],
 snapshot:{allies:[{}],enemies:[{pokemon_id:19}]}};
const bridge={snapshot:{},syncPreferences:async()=>{},syncOrganization:async()=>{},
 request:async body=>{
  if(body.action==='begin')return {id:'encounter',route:'0:trail',remainingMs:0,replay};
  if(body.action==='finish'){order.push('settle');return {state:{}};}
  if(body.action==='capture'){order.push('captureRequest');return {state:{},capture:{caught:true}};}
  throw Error('Unexpected request');
 }};
const runtime={window:{IDLE_SERVER_JOURNEY:bridge},document:{hidden:false},performance:{now:()=>1},crypto:{randomUUID:()=> 'request'},setTimeout};
vm.createContext(runtime);vm.runInContext(fs.readFileSync('modes/idle/online/native-hunts.js','utf8'),runtime);
await runtime.window.createServerHunts({state:{area:0,hunts:{kind:'trail'}},challenge:()=>null,running:()=>true,
 show(){},frame(){},apply(){order.push('apply');},
 async finish(){order.push('finish');await Promise.resolve();order.push('recallFinished');},
 async capture(enemy,request){await request('poke');order.push('captureAnimation');await Promise.resolve();order.push('captureFinished');},
 complete(){order.push('rebuild');}}).run();
assert.deepEqual(order,['settle','finish','recallFinished','captureRequest','apply','captureAnimation','captureFinished','rebuild']);
console.log('PASS online tab return unblocks FX/trainer/capture; recall and capture finish before arena rebuild');
