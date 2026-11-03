/* Isolated network regression; never opens a player's browser profile. */
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/os_ap/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),measure=process.argv.includes('--measure'),interior='/modes/idle/assets/center/interior-pixel-v2.png';
const fixture=Function('return ('+fs.readFileSync(path.join(__dirname,'check-idle-legendary-choice-browser.cjs'),'utf8').match(/const fixture=([\s\S]*?);\n/)[1]+')')();
fixture.area=0;fixture.world.location='field';fixture.huntRunning=false;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const f=path.resolve(root,decodeURIComponent(new URL(req.url,'http://local').pathname).slice(1)||'index.html');if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const failure of (measure?[false]:[false,true])){
 const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[],requests=[];let first=true;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).pathname===interior)requests.push(r.url())});
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();if(url.pathname===interior){await new Promise(r=>setTimeout(r,500));if(failure&&first){first=false;return route.fulfill({status:503,body:'Unavailable'})}}return route.continue()});
 await page.addInitScript(state=>{localStorage.setItem('oakchessidle:official-start-v1','1');localStorage.setItem('oakchessidle:journey-native-v2',JSON.stringify({...state,last:Date.now()}));let factory;Object.defineProperty(window,'createIdleCenterScene',{get(){const saved=factory;return ctx=>window.labCenter=saved(ctx)},set(fn){factory=fn}});window.labImages=[];const Native=Image;window.Image=class extends Native{constructor(...args){super(...args);labImages.push(this)}}},fixture);
 await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.OAK_GAME_INITIALIZED&&window.labCenter);await page.locator('#startupLoader').waitFor({state:'detached',timeout:30000});await page.waitForTimeout(800);
 const startupRequests=requests.length;if(!measure)assert.equal(startupRequests,0,'interior not downloaded during field startup');
 await page.evaluate(()=>labCenter.open());await page.waitForFunction(()=>labCenter.isOpen());
 if(failure){await page.waitForTimeout(800);await page.evaluate(()=>{labCenter.close();labCenter.open()})}
 else if(!measure){await page.evaluate(()=>labCenter.close());await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>labCenter.isOpen()),false,'late image load must not reopen center');await page.evaluate(()=>labCenter.open())}
 await page.waitForFunction(url=>labImages.some(i=>i.src&&new URL(i.src,document.baseURI).pathname===url&&i.complete&&i.naturalWidth>0),interior);
 const loaded=requests.length;await page.evaluate(()=>{labCenter.close();labCenter.open()});await page.waitForTimeout(250);assert.equal(requests.length,loaded,'loaded interior reused after reopen');
 if(!measure)assert.equal(loaded,failure?2:1,'one first request, plus one retry only after failure');assert.deepEqual(errors,[]);
 const report={measure,failure,startupRequests,totalRequests:loaded,sourceBytes:fs.statSync(path.join(root,interior)).size};fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output/center-demand-'+(measure?'before':failure?'retry':'after')+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
