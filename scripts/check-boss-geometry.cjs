const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let stageReads=0,hudBottom=0;
const context={window:{},innerWidth:1280,innerHeight:800,document:{getElementById:()=>hudBottom?{getBoundingClientRect:()=>({height:80,bottom:hudBottom})}:null},getComputedStyle:()=>({getPropertyValue:()=> '1'})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../modes/idle/boss-fit.js'),'utf8'),context);
const fit=context.window.fitIdleBossElement,stage={getBoundingClientRect:()=>{stageReads++;return {top:0}}},args={stage,scale:1,top:88};
function unit(){const styles=new Map(),flags=new Set(['final']);return {side:1,y:600,el:{isConnected:true,classList:{contains:k=>flags.has(k)},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)},querySelector:()=>({offsetHeight:800}),styles,flags}}}
const boss=unit();fit(boss,args);assert.equal(boss.el.styles.get('--boss-fit'),'0.640');
stageReads=0;fit(boss,args);assert.equal(stageReads,0,'stable geometry stays cached');
hudBottom=250;boss.el._bossFitKey=null;fit(boss,args);assert.equal(boss.el.styles.get('--boss-fit'),'0.430','HUD reserves its real bottom plus margin');
hudBottom=700;boss.el._bossFitKey=null;fit(boss,args);assert.equal(boss.el.styles.get('--boss-fit'),'0.420','minimum giant size preserved');
hudBottom=0;const scaled=unit();fit(scaled,{...args,scale:.5});assert.equal(scaled.el.styles.get('--boss-fit'),'0.640','same fit at half stage scale');
boss.el.flags.delete('final');fit(boss,args);assert.equal(boss.el.styles.has('--boss-fit'),false,'ordinary foes keep normal size');
for(const mode of ['ally','detached']){const u=unit();if(mode==='ally')u.side=0;else u.el.isConnected=false;fit(u,args);assert.equal(u.el.styles.size,0)}
fit(null,args);
console.log('PASS boss geometry: HUD overlap, scale, size floor, cache, normal foes, allies and detached units.');
