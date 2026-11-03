const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../modes/idle/pokefone.js'),'utf8'),lock=source.indexOf('function lockScreen()'),start=source.indexOf('const tick=()=>',lock),end=source.indexOf(';tick();const timer=',start);assert.ok(lock>=0&&start>lock&&end>start);
let writes=0,weatherReads=0,hour='09:41',day='terça-feira, 3 de novembro',climate='Chuva';
const node=()=>{let text='';return {get textContent(){return text},set textContent(value){writes++;text=value}}};
const clock=node(),date=node(),weather={firstChild:node(),lastChild:node(),dataset:new Proxy({},{set(o,k,v){writes++;o[k]=v;return true}})};
class LabDate{toLocaleTimeString(){return hour}toLocaleDateString(){return day}}
const env={clock,date,weather,ctx:{weather(){weatherReads++;return climate}},Date:LabDate};vm.createContext(env);vm.runInContext(source.slice(start,end)+';globalThis.tick=tick',env);
env.tick();assert.equal(clock.textContent,'09:41');assert.equal(weather.lastChild.textContent,'Chuva');assert.equal(weather.firstChild.textContent,'🌧');writes=0;weatherReads=0;
for(let i=0;i<60;i++)env.tick();assert.equal(writes,0,'stable lock screen must not rewrite clock/date/weather');assert.equal(weatherReads,60,'weather sampled once per tick');
hour='09:42';env.tick();assert.equal(writes,1);assert.equal(clock.textContent,'09:42');writes=0;
day='quarta-feira, 4 de novembro';climate='Sol';env.tick();assert.equal(date.textContent,day);assert.equal(weather.lastChild.textContent,'Sol');assert.equal(weather.firstChild.textContent,'☀');assert.equal(weather.dataset.weather,'Sol');assert.equal(writes,4);
writes=0;env.tick();assert.equal(writes,0);
console.log('PASS phone lock clock: stable text/attributes, minute/day rollover, climate and icon refresh.');
