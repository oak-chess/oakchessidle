const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('modes/idle/drops-data.js','utf8'),context);
const drops=context.window.IDLE_DROPS;
for(const key of ['ore','essence','sand','powder','onixTail','strangeRock'])assert.equal(drops.canAutoSell(key),true,key);
for(const key of ['charge','claw','hull','diglettPart','shellLock','scale','moon','water','megaTicketFragments','mysticBallFragments','unknown'])assert.equal(drops.canAutoSell(key),false,key);
const source=fs.readFileSync('modes/idle/hunts.js','utf8');const start=source.indexOf(' const drops=window.IDLE_DROPS.roll('),end=source.indexOf(' const stone=',start);
assert.ok(start>=0&&end>start);const actualLootLoop=new Function('window','s','q','st','totals','u','prey','vip','lootTypes',source.slice(start,end));
const awards=[{key:'ore',count:2},{key:'essence',count:1},{key:'claw',count:1},{key:'scale',count:1}];
for(const enabled of [true,false]){
 const state={gold:10},hunt={autoSellLoot:enabled,loot:{ore:7}},session={coins:3,loot:0},totals={coins:0};
 actualLootLoop({IDLE_DROPS:{...drops,roll:()=>awards}},state,hunt,session,totals,{L:{names:['Test']},star:1},{loot:0},null,drops.items);
 assert.equal(state.gold,enabled?660:10);assert.equal(hunt.loot.ore,enabled?7:9);assert.equal(hunt.loot.claw,1);assert.equal(hunt.loot.scale,1);
 assert.equal(session.coins+session.loot-(session.autoSoldLoot||0),1153);
}
// Default and explicit opt-out survive authoritative profile refreshes.
const snap={ownerId:'p',gold:10,trainerLevel:1,trainerXp:0,inventory:[],profile:{formation:[],organization:[],route:'0:forest',wave:1,supplies:{},loot:{},preferences:{}}};
const c={window:{OAK_ONLINE_SNAPSHOT:snap},LINES:[],Event:class{},dispatchEvent(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('modes/idle/online/server-journey.js','utf8'),c);
assert.equal(c.window.IDLE_SERVER_JOURNEY.project().hunts.autoSellLoot,true);
snap.profile.preferences.autoSellLoot=false;assert.equal(c.window.IDLE_SERVER_JOURNEY.project(snap).hunts.autoSellLoot,false);
console.log('PASS common-loot whitelist, protected evolution materials and fragments, existing stock, opt-out, default and no double-counting.');
