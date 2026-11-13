/* Reuse the native combat engine; Arena keeps its strict six-member validator. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let source=read('modes/idle/online/arena-engine.mjs')
 .replace('createArenaSimulation','createHuntSimulation')
 .replace('const window={OAK_IDLE_MODE:true}', 'const window={OAK_IDLE_MODE:true,IDLE_SHINY:{rate:.000122}}')
 .replace('team.length===6&&team.every','team.length>=1&&team.length<=6&&team.every')
 .replace('r:side===0?5+Math.floor(index/3):2-Math.floor(index/3),c:[1,3,5][index%3]', 'r:side===0?(m.pos?.r??5+Math.floor(index/3)):2-Math.floor(index/3),c:side===0?(m.pos?.c??[1,3,5][index%3]):[1,3,5][index%3]')
 .replace('u.el=empty;u._idleLevel=m.level;', 'u.hp=u.maxHp*Math.max(0,Math.min(1,data.condition??1));u.alive=u.hp>0;u.el=empty;u._idleLevel=m.level;')
 .replace('rulesVersion:ARENA_RULES_VERSION,frames}', 'rulesVersion:ARENA_RULES_VERSION,frames,units:B.units.map(u=>({maxHp:u.maxHp}))}')
 .replace('return {run,species:()=>LINES.flatMap(l=>l.ids)};', `return {run,species:()=>LINES.flatMap(l=>l.ids),
 metadata:()=>LINES.flatMap(l=>l.ids.map((id,i)=>({id,name:l.names[i],family:l.names[0],star:i+1,cost:l.c,types:Array.isArray(l.t[0])?l.t[i]:l.t}))),
 drops:id=>{const l=LINES.find(l=>l.ids.includes(id)),star=l.ids.indexOf(id)+1;return {loot:window.IDLE_DROPS.roll(l,star,0,0),stone:window.IDLE_DROPS.rollStone(l,star)}},
 rating:row=>{const l=LINES.find(l=>l.ids.includes(row.pokemon_id));return window.IDLE_INDIVIDUALS.potentialScore({...row.combat_data,name:l.names[0],star:l.ids.indexOf(row.pokemon_id)+1})},
 nature:data=>window.IDLE_INDIVIDUALS.nature(data),
 genes:(id,seed,shiny=true)=>{const l=LINES.find(l=>l.ids.includes(id));if(!l)throw Error('Unsupported species');return window.IDLE_INDIVIDUALS.roll(l,seed,shiny)}};`);
if(!source.includes('team.length>=1')||!source.includes('metadata:'))throw Error('Engine source boundary changed');
// Presentation telemetry only: wrappers never change damage, RNG or timing.
source=source.replace('function run(allies,enemies){', `
let visualEvents=[];
const visualIndex=u=>u?B.units.indexOf(u):-1;
const nativeAttack=attack,nativeCast=cast,nativeHurt=hurt,nativeHeal=healUnit;
attack=function(u,t){visualEvents.push({k:'attack',a:visualIndex(u),b:visualIndex(t)});return nativeAttack(u,t)};
cast=function(u,decision){const before=u.mi,result=nativeCast(u,decision);if(u.mi!==before)visualEvents.push({k:'cast',a:visualIndex(u),b:visualIndex(u.target),m:u.lastMoveIndex??0});return result};
hurt=function(src,t,d,kind,o={}){const before=t.hp,shield=t.shield,result=nativeHurt(src,t,d,kind,o);const amount=Math.max(0,before-t.hp)+Math.max(0,shield-t.shield);if(amount>0)visualEvents.push({k:'hit',a:visualIndex(src),b:visualIndex(t),n:Math.round(amount),type:o.type||src?.types?.[0]||'normal',crit:!!o.crit,dot:!!o.dot,kind});return result};
healUnit=function(u,...args){const before=u.hp,result=nativeHeal(u,...args),amount=Math.max(0,u.hp-before);if(amount>0)visualEvents.push({k:'heal',b:visualIndex(u),n:Math.round(amount)});return result};
function run(allies,enemies){visualEvents=[];`);
const oldFrame='u.alive?1:0,u.mi])});';
if(!source.includes(oldFrame))throw Error('Replay frame boundary changed');
source=source.replace(oldFrame,`u.alive?1:0,u.mi,u.fa??(u.side===0?-Math.PI/2:Math.PI/2),u.moving?1:0,visualIndex(u.target),u.r,u.c,Math.round(u.mana),Math.round(u.shield),u.stun||0,u.slow||0,u.frozen?1:0,u.burn?1:0,u.pois?1:0]),e:visualEvents.splice(0)});`);
source=source.replace('},{get:(obj,key)=>obj[key]||no});', `},{get:(obj,key)=>key==='text'?((x,y,text,color,size)=>visualEvents.push({k:'text',x,y,text,color,size})):obj[key]||no});`);
source=source.replace('Object.assign(window.PLAYABLE_MOVES,window.IDLE_UNOVA_MOVES||{});',read('modes/idle/drops-data.js')+'\nObject.assign(window.PLAYABLE_MOVES,window.IDLE_UNOVA_MOVES||{});');
fs.writeFileSync(path.join(root,'modes/idle/online/hunt-engine.mjs'),source);
// Evaluate only data definitions; no game, save or browser session runs here.
const context={window:{DEX_EXPANSION:[],PMD_ANIM_DATA:{},PMD_BOUNDS_DATA:{},PLAYABLE_MOVES:{},IDLE_UNOVA_PMD:{},IDLE_UNOVA_BOUNDS:{},IDLE_UNOVA_MOVES:{}},Math};vm.createContext(context);
(async()=>{const {createHuntSimulation}=await import(require('node:url').pathToFileURL(path.join(root,'modes/idle/online/hunt-engine.mjs')));const species=createHuntSimulation().metadata();context.window.DEX_EXPANSION=species;
for(const file of ['world-data.js','region-hunts.js','evolution-data.js','johto-data.js','hoenn-species.js','hoenn-data.js','sinnoh/evolutions.js','sinnoh/data.js','unova/species.js','unova/evolutions.js','unova/destinations.js','unova/runtime.js','hunt-progression.js','capture-rates.js','items-data.js','drops-data.js'])
 vm.runInContext(read('modes/idle/'+file),context,{filename:file});
const data={routes:context.window.IDLE_REGION_HUNTS,balls:context.window.IDLE_ITEMS.balls,
 healing:context.window.IDLE_ITEMS.healing,reviving:context.window.IDLE_ITEMS.reviving,
 captureRates:context.window.IDLE_CAPTURE_RATES,loot:context.window.IDLE_DROPS.items,species,regions:context.window.IDLE_WORLD_DATA.regions,stones:context.window.IDLE_WORLD_DATA.stones,evolutions:context.window.IDLE_EVOLUTIONS,branches:context.window.IDLE_SINNOH_BRANCHES};
fs.writeFileSync(path.join(root,'modes/idle/online/hunt-catalog.mjs'),'// Generated from game data.\nexport const HUNT_CATALOG='+JSON.stringify(data)+';\n');
console.log('Built shared hunt combat and '+data.routes.length+' regional catalogs');

})().catch(error=>{console.error(error);process.exitCode=1});
