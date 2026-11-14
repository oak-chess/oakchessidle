const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const makeMember=(id,z='b')=>({id,pos:z==='b'?{z,r:5,c:id==='rat'?3:1}:{z,i:0}});
const state={area:0,hunts:{kind:'trail'},team:[makeMember('starter'),makeMember('rat')]};
let running=false,previewed=0,begins=0,abandoned=0,shows=[],editor,resets=0;
let saved=structuredClone(state.team);
const bridge={snapshot:{activeHunt:null},async syncPreferences(){},async syncOrganization(s){saved=structuredClone(s.team);},
 setOrganizationEditor(fn){editor=fn;},async abandon(){abandoned++;bridge.snapshot.activeHunt=null;return {team:structuredClone(saved)};},
 async organize(s,slots){saved=slots.map(p=>({id:p.id,pos:p.pos}));return {team:structuredClone(saved)};},
 async request(body){if(body.action==='begin'){
  begins++;bridge.snapshot.activeHunt='hunt-'+begins;const allies=saved.filter(m=>m.pos.z==='b');
  return {id:bridge.snapshot.activeHunt,route:'0:trail',remainingMs:0,replay:{elapsedMs:0,frames:[{t:0,u:allies.map(()=>[0,0,1000,1,0])}],snapshot:{allies,enemies:[]}}};
 }if(body.action==='finish'){bridge.snapshot.activeHunt=null;return {state:{}};}throw Error('Unexpected request');}};
const c={window:{IDLE_SERVER_JOURNEY:bridge},document:{hidden:false},performance:{now:()=>1},crypto, setTimeout};
vm.createContext(c);vm.runInContext(fs.readFileSync('modes/idle/online/native-hunts.js','utf8'),c);
const api=c.window.createServerHunts({state,challenge:()=>null,running:()=>running,pauseEditing(){running=false;},
 preview(){previewed++;},show(replay){shows.push(replay.snapshot.allies.map(m=>m.id));},frame(){},apply(){},
 reset(snapshot){resets++;state.team=snapshot.team;},async finish(){},async capture(){},complete(){}});
const waitFor=async check=>{for(let i=0;i<200;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}throw Error('Timed out');};
(async()=>{
 const first=api.run();await waitFor(()=>previewed===1);
 state.team.find(m=>m.id==='rat').pos={z:'n',i:0};running=true;
 await first;
 assert.equal(begins,2);assert.equal(abandoned,1);assert.deepEqual(shows,[['starter']],'old field member must never appear in the new battle');
 assert.equal(saved.find(m=>m.id==='rat').pos.z,'n');
 running=false;const second=api.run();await waitFor(()=>previewed===2);
 await editor(null);await second;
 assert.equal(resets,1,'training/PC edit clears prepared and combat representations');
 assert.equal(api.busy,false);assert.equal(bridge.snapshot.activeHunt,null);
 const confirmed=structuredClone(state.team);state.team.find(m=>m.id==='rat').pos={z:'b',r:6,c:3};
 bridge.organize=async()=>{throw Error('Servidor recusou a mudança');};
 await assert.rejects(()=>editor(state.team.map(m=>({id:m.id,pos:m.pos}))),/recusou/);
 assert.deepEqual(state.team,confirmed,'failed organization restores the confirmed team after cancellation');
 assert.equal(api.busy,false,'failure must release the edit lock');
 console.log('PASS hunt organization lifecycle: changed preparation is rebuilt before battle, bench is excluded, farm edit cancels reservation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
