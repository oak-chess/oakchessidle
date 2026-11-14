const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const state={team:[{id:'starter',name:'Bulbasaur',pos:{z:'b',r:5,c:1}},{id:'rat',name:'Rattata',pos:{z:'b',r:5,c:3}}],collection:[],world:{},items:[]};
let saved=structuredClone(state),writes=0,prepared=0,fail=false,notifications=[];
const restore=()=>Object.assign(state,structuredClone(saved));
const context={window:{IDLE_SERVER_JOURNEY:{enabled:true,async organize(s,slots){
 assert(prepared>0);if(fail)throw Error('Falha de confirmação');writes++;
 const all=[...saved.team,...saved.collection];saved.team=slots.map(slot=>({...all.find(p=>p.id===slot.id),pos:slot.pos}));
 saved.collection=all.filter(p=>!slots.some(slot=>slot.id===p.id)).map(p=>{const copy={...p};delete copy.pos;return copy;});restore();
}}}};vm.createContext(context);vm.runInContext(fs.readFileSync('modes/idle/pc.js','utf8'),context);
const pc=context.window.createIdlePC({state,lines:[],busy:()=>false,pause(){},async prepareTransfer(){prepared++;restore();},
 notify:t=>notifications.push(t),resetSelection(){},setItems(){},rebuild(){},capacity:()=>6});
(async()=>{
 await pc.deposit(state.team.find(p=>p.id==='rat'));assert.equal(saved.collection[0].id,'rat');assert.equal(state.team.length,1);
 restore();assert.equal(state.collection[0].id,'rat','reload retains PC deposit');
 await pc.withdraw(state.collection[0]);assert.equal(saved.team.find(p=>p.id==='rat').pos.z,'n');
 restore();assert.equal(state.team.find(p=>p.id==='rat').pos.z,'n','reload retains bench withdrawal');
 fail=true;await pc.deposit(state.team.find(p=>p.id==='rat'));
 assert.equal(saved.team.find(p=>p.id==='rat').pos.z,'n');assert.equal(state.collection.length,0);
 assert.equal(notifications.at(-1),'Falha de confirmação');assert.equal(writes,2);
 fail=false;await pc.deposit(state.team.find(p=>p.id==='rat'));await pc.swap(state.collection[0],'starter');
 restore();assert.equal(state.team[0].id,'rat');assert.equal(state.team[0].pos.z,'b');assert.equal(state.collection[0].id,'starter');
 console.log('PASS online PC transfers: confirmed deposit, bench withdrawal, reload, swap and failed-write rollback.');
})().catch(e=>{console.error(e);process.exitCode=1});
