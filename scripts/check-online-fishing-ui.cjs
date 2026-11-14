const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/os_ap/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd(),id='20000000-0000-4000-8000-000000000001';
(async()=>{
 const {replayCast}=await import('../modes/idle/fishing/cast-rules.mjs');
 const snapshot={gold:20,fishing:{online:true,ownedRods:[0],fishingLevel:1,fishingXP:0,lastXP:0,catches:[],
 totalCaught:0,attempts:0,missed:0,completedOrders:[],activeCast:null,catalog:{129:{cost:1,star:1}}}};
 let trace,started;
 const server=http.createServer(async(req,res)=>{
  if(req.url==='/act'){
   let raw='';for await(const part of req)raw+=part;
   const d=JSON.parse(raw);let receipt={};
   if(d.action==='cast'){
    started=Date.now();snapshot.fishing.attempts++;
    snapshot.fishing.activeCast={id,shoal:[129],technique:d.data.technique,settings:d.data,started};
    receipt.cast=snapshot.fishing.activeCast;
   }
   if(d.action==='finish'){
    trace=d.data;const result=replayCast({species:129,technique:snapshot.fishing.activeCast.technique},trace.trace,trace.duration,Date.now()-started+200);
    assert.equal(result.won,true);
    const capture={uid:'catch-one',id:129,name:'Magikarp',level:10,potency:1,ivs:[20,20,20,20,20,20],shiny:false,favorite:false,locked:false,time:'12:00'};
    snapshot.fishing.catches=[capture];snapshot.fishing.activeCast=null;snapshot.fishing.totalCaught++;snapshot.fishing.lastXP=50;snapshot.fishing.fishingXP=50;
    receipt={won:true,captures:[capture]};
   }
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({...receipt,ok:true,state:snapshot}));return;
  }
  if(req.url==='/host'){
   res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<style>body{margin:0}iframe{width:100vw;height:100vh;border:0}</style><iframe src="/modes/idle/fishing/index.html?widget=1"></iframe><script>
   addEventListener('message',async e=>{const frame=document.querySelector('iframe');if(e.source!==frame.contentWindow||e.data.type!=='rural-live-action')return;
   const result=await(await fetch('/act',{method:'POST',body:JSON.stringify(e.data)})).json();
   frame.contentWindow.postMessage({type:'rural-live-result',request:e.data.request,...result},location.origin);});</script>`);return;
  }
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1100,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/host');
  const frame=page.frames().find(f=>f.url().includes('fishing/index.html'));
  await frame.waitForFunction(()=>window.IDLE_FISHING_UI?.snapshot().ownedRods.length===1);
  const technique=frame.getByRole('button',{name:/Precisão/});await technique.click();
  await frame.locator('#action').click();
  await frame.waitForFunction(()=>IDLE_FISHING_UI.snapshot().phase==='bite');await frame.locator('#action').click();
  await frame.evaluate(()=>new Promise(resolve=>{let last=0;const timer=setInterval(()=>{
   const s=IDLE_FISHING_UI.snapshot();if(['caught','lost'].includes(s.phase)){clearInterval(timer);resolve();return;}
   if(s.phase==='reel'&&s.precisionPosition>=45&&s.precisionPosition<=58&&performance.now()-last>160){document.getElementById('action').click();last=performance.now();}
  },20);}));
  await frame.waitForFunction(()=>IDLE_FISHING_UI.snapshot().totalCaught===1);
  assert.ok(trace.trace.some(e=>e.input==='hook'));assert.ok(trace.trace.some(e=>e.input==='tap'));assert.equal(trace.won,undefined);
  assert.equal(await frame.locator('#reset').isVisible(),false);
  assert.deepEqual(errors,[]);
  fs.mkdirSync('output/farm-online',{recursive:true});await page.screenshot({path:'output/farm-online/fishing.png'});
  // Reopening restores the same selected species; it never issues a second cast.
  snapshot.fishing.activeCast={id,shoal:[129],technique:'precision',settings:{spot:0,rod:0,depth:'bank',bait:'basic'},started:Date.now()};
  await page.reload();const restored=page.frames().find(f=>f.url().includes('fishing/index.html'));
  await restored.waitForFunction(()=>IDLE_FISHING_UI?.snapshot().phase==='cast');
  assert.equal(await restored.evaluate(()=>IDLE_FISHING_UI.snapshot().fish),129);
  assert.equal(snapshot.fishing.attempts,1);
  console.log('PASS fishing UI: shared controls, validated trace, confirmed catch, no demo reset, reload restores same encounter.');
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
