/* Bounded memory/timer experiment with an isolated, populated save. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/os_ap/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const fixture=Function('return ('+fs.readFileSync(path.join(__dirname,'check-idle-legendary-choice-browser.cjs'),'utf8').match(/const fixture=([\s\S]*?);\n/)[1]+')')();
fixture.world.location='field';fixture.huntRunning=false;
fixture.collection=Array.from({length:300},(_,i)=>{const m={...fixture.team[0],id:'lifecycle-'+i,name:['Bulbasaur','Charmander','Squirtle','Gastly'][i%4],star:1,level:10,shiny:i%10===0};delete m.pos;return m});
fixture.captureLog=Array.from({length:200},(_,i)=>({name:['Bulbasaur','Squirtle'][i%2],time:Date.now()-i*60000,result:'Novo parceiro',status:'caught',shiny:i%10===0,potency:1+i%5,ivTotal:100,attempted:true,ball:'poke',offline:false}));
fixture.world.log=Array.from({length:80},(_,i)=>({time:Date.now()-i*60000,text:'Registro de laboratório '+i}));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,decodeURIComponent(new URL(req.url,'http://local').pathname).slice(1)||'index.html');if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url())});await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 await page.addInitScript(state=>{
  localStorage.setItem('oakchessidle:official-start-v1','1');localStorage.setItem('oakchessidle:journey-native-v2',JSON.stringify({...state,last:Date.now()}));
  for(const name of ['Phone','PC','VillageService']){let factory;Object.defineProperty(window,'createIdle'+name,{get(){const saved=factory;return ctx=>{window['lab'+name+'Ctx']=ctx;return window['lab'+name]=saved(ctx)}},set(fn){factory=fn}})}
  const intervals=new Set(),frames=new Set(),si=setInterval,ci=clearInterval,raf=requestAnimationFrame,caf=cancelAnimationFrame;
  window.setInterval=(...args)=>{const id=si(...args);intervals.add(id);return id};window.clearInterval=id=>{intervals.delete(id);ci(id)};
  window.requestAnimationFrame=fn=>{const id=raf(t=>{frames.delete(id);fn(t)});frames.add(id);return id};window.cancelAnimationFrame=id=>{frames.delete(id);caf(id)};
  window.labTimers=()=>({intervals:intervals.size,frames:frames.size});
 },fixture);
 await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.OAK_GAME_INITIALIZED&&window.labPhone&&window.labPC);await page.locator('#startupLoader').waitFor({state:'detached',timeout:30000});
 await page.evaluate(async()=>{const s=labVillageServiceCtx.state,m=IDLE_ACTIVITY.for(s);for(let i=0;i<1000;i++)m.event('lab','Arquivo de laboratório '+i,{name:'Bulbasaur',time:Date.now()-i*1000});const all=await m.rows({type:'lab',size:Infinity});if(all.rows.length!==1000)throw Error('Incomplete archive fixture')});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 async function cycle(){
  await page.evaluate(()=>labPC.open());await page.locator('#idle-pc:not([hidden])').waitFor();assert.equal(await page.locator('#idle-pc .ipc-cell').count(),12);await page.evaluate(()=>labPC.close());
  await page.locator('.is-navigation>button[data-menu=bag]').click({force:true});if(await page.locator('.pf-lock-screen').count()){await page.locator('.pf-lock-screen').press('ArrowUp');await page.locator('.pf-lock-screen').waitFor({state:'detached'})}
  for(const app of ['activities','weather','radio','home']){await page.evaluate(app=>labPhone.show(app),app);await page.waitForFunction(app=>document.getElementById('ip-bag-content')?.dataset.phonePage===app,app);await page.waitForTimeout(120)}
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await page.waitForTimeout(300);
 }
 await cycle();await cycle();const samples=[];
 async function sample(){await cdp.send('HeapProfiler.collectGarbage');const counters=await cdp.send('Memory.getDOMCounters'),metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));return {...await page.evaluate(()=>({...labTimers(),visiblePanels:[...document.querySelectorAll('.idle-window')].filter(p=>!p.hidden).map(p=>p.id)})),...counters,heapMiB:metrics.JSHeapUsedSize/1048576}}
 samples.push(await sample());for(let i=0;i<24;i++){await cycle();samples.push(await sample());console.log('panel cycle '+(i+1)+' '+JSON.stringify(samples.at(-1)))}
 const first=samples[0],last=samples.at(-1);assert.equal(last.intervals,first.intervals,'no accumulated interval timers');assert(last.frames<=first.frames+2,'no accumulated animation loops');assert(last.nodes<=first.nodes+150,'DOM remains bounded after warmup');assert(last.heapMiB<=first.heapMiB+8,'no large retained-heap growth in bounded experiment');
 const archive=await page.evaluate(async()=>{const s=labVillageServiceCtx.state,m=IDLE_ACTIVITY.for(s);const page=await m.rows({type:'lab',size:20}),all=await m.rows({type:'lab',size:Infinity});return {page:page.rows.length,total:all.rows.length,captureLog:s.captureLog.length,stored:s.collection.length}});assert.deepEqual(archive,{page:20,total:1000,captureLog:200,stored:300});
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output/panel-lifecycle.json'),JSON.stringify({fixture:{stored:300,captureLog:200,journeyLog:80,archiveRows:1000},samples,archive,scope:'Two warmup cycles then 24 measured cycles; post-GC JS heap, DOM counters and top-document timers only.'},null,2));console.log('PASS bounded panel lifecycle and archive pagination.');
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
