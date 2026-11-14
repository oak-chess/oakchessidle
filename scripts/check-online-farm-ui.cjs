const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/os_ap/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const snapshot={version:1,onlineCore:true,houseRules:2,gold:20,metFisher:true,metFarmer:true,questClaimed:true,
 activeHouseId:'house',tier:0,houses:[{id:'house',tier:0,name:'Sítio das Amoras',created:1}],deeds:[],
 construction:{wood:0,stone:0,parts:0},history:[],lastRoll:[],rolling:null,fragments:0,roster:[
 {key:'one',species:1,name:'Bulbasaur',level:7,xp:100,ivs:[31,20,20,20,20,20],potency:2,place:'pc',trained:0},
 {key:'two',species:4,name:'Charmander',level:8,xp:80,ivs:[20,20,20,20,20,20],potency:1,place:'pc',trained:0}]};
const server=http.createServer((req,res)=>{
 if(req.url?.startsWith('/host')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<style>html,body{margin:0;width:100%;height:100%;background:#0c2632}iframe{border:0;width:100%;height:100%}</style><iframe src="/modes/idle/village/index.html?native=1"></iframe><script>
 const snapshot=${JSON.stringify(snapshot)};if(location.search.includes('properties')){snapshot.onlineProperties=true;snapshot.fragments=10}addEventListener('message',e=>{const frame=document.querySelector('iframe');if(e.source!==frame.contentWindow)return;
 const send=()=>frame.contentWindow.postMessage({type:'rural-live-state',state:snapshot},location.origin);
 if(e.data.type==='rural-ui-ready'){send();frame.contentWindow.postMessage({type:'rural-native',action:'farm'},location.origin)}
 if(e.data.type==='rural-live-action'){const d=e.data;let receipt={};if(d.action==='assign'){const m=snapshot.roster.find(x=>x.key===d.data.key);m.place='farm';m.houseId='house'}if(d.action==='return'){const m=snapshot.roster.find(x=>x.key===d.data.key);m.place='pc';delete m.houseId}
 if(d.action==='buyDeeds'){const deed={id:'draw-one',tier:1,name:'Chácara do Lago',created:2};snapshot.fragments-=10;snapshot.deeds.push(deed);snapshot.lastRoll=[deed];snapshot.rolling={results:[deed],startedAt:Date.now(),elapsed:0,lastFrame:-1};receipt.results=[deed]}
 if(d.action==='settleDeeds'){receipt.results=snapshot.rolling?.results||[];snapshot.rolling=null}
 if(d.action==='deedLock'){const deed=snapshot.deeds.find(x=>x.id===d.data.id);deed.locked=!deed.locked}
 if(d.action==='install'){const deed=snapshot.deeds.find(x=>x.id===d.data.id);snapshot.deeds=snapshot.deeds.filter(x=>x.id!==deed.id);snapshot.houses.push(deed);snapshot.activeHouseId=deed.id;snapshot.tier=deed.tier}
 frame.contentWindow.postMessage({type:'rural-live-result',request:d.request,ok:true,...receipt,state:snapshot},location.origin)}
 });</script>`);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true});
 try{const page=await browser.newPage({viewport:{width:1000,height:730}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/host');const frame=page.frames().find(f=>f.url().includes('village/index.html'));
 await frame.getByRole('heading',{name:'Minha fazenda',exact:true}).waitFor();
 // The panel may already be open when a PC transfer is confirmed.
 await page.evaluate(()=>{window.savedRoster=structuredClone(snapshot.roster);snapshot.roster=[];document.querySelector('iframe').contentWindow.postMessage({type:'rural-live-state',state:snapshot},location.origin);});
 await frame.waitForFunction(()=>document.querySelector('.farm-pc-available')?.textContent==='0 disponíveis');
 await page.evaluate(()=>{snapshot.roster=window.savedRoster;document.querySelector('iframe').contentWindow.postMessage({type:'rural-live-state',state:snapshot},location.origin);});
 await frame.waitForFunction(()=>document.querySelector('.farm-pc-available')?.textContent==='2 disponíveis');
 assert.equal(await frame.getByRole('button',{name:'Treinar',exact:true}).count(),2);
 await frame.getByRole('button',{name:'Treinar',exact:true}).first().click();
 await frame.waitForFunction(()=>IDLE_VILLAGE_UI.snapshot().roster.some(m=>m.place==='farm'));
 assert.equal(await frame.locator('.training-slot[data-partner]').count(),1);
 await frame.getByRole('button',{name:'Voltar ao PC',exact:true}).click();
 await frame.waitForFunction(()=>IDLE_VILLAGE_UI.snapshot().roster.every(m=>m.place==='pc'));
 assert.equal(await frame.locator('.training-slot[data-partner]').count(),0);
 assert.equal(await frame.getByRole('button',{name:'Melhorias · em breve',exact:true}).isDisabled(),true);
 assert.equal(await frame.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 fs.mkdirSync('output/farm-online',{recursive:true});await page.screenshot({path:'output/farm-online/first-house.png'});
 console.log('PASS farm UI: real panels, assign/return refresh, unavailable services, no horizontal overflow or JavaScript errors.');
 await page.goto('http://127.0.0.1:'+server.address().port+'/host?properties');
 const properties=page.frames().find(f=>f.url().includes('village/index.html'));
 await properties.getByRole('heading',{name:'Minha fazenda',exact:true}).waitFor();
 assert.equal(await properties.getByRole('button',{name:'Melhorias',exact:true}).isEnabled(),true);
 await properties.getByRole('button',{name:'Outras propriedades ↗',exact:true}).click();
 await properties.locator('[data-roll="1"]').click();
 await properties.waitForFunction(()=>IDLE_VILLAGE_UI.snapshot().rolling===null&&IDLE_VILLAGE_UI.snapshot().deeds.length===1);
 assert.equal(await properties.locator('#roll-status').textContent(),'1 escrituras guardadas.');
 assert.equal(await properties.locator('.house-weekly').count(),0);
 await properties.getByRole('button',{name:'Escrituras guardadas · 1',exact:true}).click();
 await properties.getByRole('button',{name:'Proteger Chácara do Lago',exact:true}).click({timeout:5000});
 assert.equal(await properties.getByRole('button',{name:'Desproteger Chácara do Lago',exact:true}).getAttribute('aria-pressed'),'true');
 await properties.getByRole('button',{name:'Instalar casa',exact:true}).click();
 await properties.waitForFunction(()=>IDLE_VILLAGE_UI.snapshot().houses.length===2);
 assert.equal(await properties.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);await page.screenshot({path:'output/farm-online/properties.png'});
 console.log('PASS property UI: fragment-only draw, animation settlement, Rocket source, protected deed and installation using existing panels.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
