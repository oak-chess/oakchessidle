const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
global.window=global;global.IDLE_TRAINER_PORTRAITS={entries:Array.from({length:143},(_,i)=>({id:'art-npc'+i,name:'NPC '+i}))};global.IDLE_CHALLENGES={catalogue:()=>[]};
vm.runInThisContext(fs.readFileSync('modes/idle/arena-pvp/local-model.js','utf8'));
const state={gold:0,team:[{id:'mine',level:10,condition:1,pos:{z:'b'}}],world:{}},ctx={state,lines:[],save(){},busy:()=>false,inCombat:()=>false,launch:spec=>state.world.challenge=spec};
let m=IDLE_ARENA_LOCAL.create(ctx);assert.equal(m.rank(),144);assert(m.eligibility('art-npc0'));assert(m.eligibility('art-npc137'));assert.equal(m.eligibility('art-npc138'),null);assert(!m.start('art-npc0').ok);assert.equal(m.data.active,undefined);
assert(m.start('art-npc142').ok);const match=state.world.challenge;assert.match(m.resolve(match,true),/30 pontos/);assert.equal(m.data.points.player,30);assert(m.rank()>130);assert.equal(m.data.history[0].delta,30);assert.equal(m.resolve(match,true),null);assert.equal(m.data.wins,1);
assert(m.start(m.data.order[m.rank()-2]).ok);m.resolve(state.world.challenge,false);assert.equal(m.data.points.player,15);assert.equal(m.data.history[0].delta,-15);
m.data.points.player=0;assert(m.start('art-npc142').ok);m.resolve(state.world.challenge,false);assert.equal(m.data.points.player,0);
for(const id of m.data.order)m.data.points[id]=0;m.data.points.player=1; // reload sorts points and preserves the save
m=IDLE_ARENA_LOCAL.create(ctx);assert.equal(m.rank(),1);assert.equal(m.eligibility('art-npc0'),null);assert(m.eligibility('art-npc20'));
// At rank 10, rank 5 is eligible; at rank 11, all of the Top 5 is locked.
for(let i=0;i<143;i++)m.data.points['art-npc'+i]=(143-i)*10;m.data.points.player=1345;m=IDLE_ARENA_LOCAL.create(ctx);assert.equal(m.rank(),10);assert.equal(m.eligibility('art-npc4'),null);assert(m.eligibility('art-npc3'));
m.data.points.player=1335;m=IDLE_ARENA_LOCAL.create(ctx);assert.equal(m.rank(),11);for(let i=0;i<5;i++)assert.match(m.eligibility('art-npc'+i),/Top 10/);
m.data.wins=20;assert(m.claim(10).ok);assert(m.claim(20).ok);assert(!m.claim(10).ok);assert(!m.claim(30).ok);assert.equal(state.gold,20000);m=IDLE_ARENA_LOCAL.create(ctx);assert(!m.claim(20).ok);
// An old positional save migrates without losing the player's existing place.
const legacy={gold:0,team:[],world:{arenaLocal:{version:1,order:['art-npc0','player',...IDLE_TRAINER_PORTRAITS.entries.slice(1).map(a=>a.id)],wins:10,claimed:1,history:[],baseline:5}}};const migrated=IDLE_ARENA_LOCAL.create({...ctx,state:legacy});assert.equal(migrated.rank(),2);assert.equal(migrated.data.wins,10);assert(!migrated.claim(10).ok);
console.log('PASS Arena: nearby opponents, Top 5 restriction, +30/-15 points, floor zero, stable sorting, migration, results once, separate rewards and reload.');
