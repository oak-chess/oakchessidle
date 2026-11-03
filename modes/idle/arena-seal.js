/* Same staging/easing as legendary-birds-arena/emblem-transition.js,
 * projected by the native arenaView instead of the birds' custom point() camera. */
(()=>{
 'use strict';
 const nativeEmblem=aEmblemT,canvas=document.createElement('canvas');canvas.id='idleBattleSeal';canvas.width=2560;canvas.height=1600;
 canvas.style.cssText='position:absolute;left:0;top:0;width:1280px;height:800px;pointer-events:none';
 document.getElementById('arenaView').insertBefore(canvas,document.getElementById('units'));
 const c=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let progress=0,last=null,previous=null,forcedUntil=0;
 const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{const k=clamp(n);return k*k*(3-2*k)};
 const themes=['electric','garden','poison','psychic','fire','ground','lorelei','bruno','agatha','lance','blue','route-cave','route-sewer','route-mansion',...(window.IDLE_JOHTO_ARENAS||[]).concat(window.IDLE_HOENN_ARENAS||[],window.IDLE_LEGENDARY_ARENAS||[],window.IDLE_MEGA_ARENAS||[],window.IDLE_SINNOH_ARENAS||[],window.IDLE_UNOVA_ARENAS||[]).map(t=>t.id)];
 const supports=id=>themes.includes(id);
 const study=()=>{if(!supports(ARENA_T?.id)||approvedArena())return null;return (window.IDLE_JOHTO_ARENAS||[]).concat(window.IDLE_HOENN_ARENAS||[],window.IDLE_LEGENDARY_ARENAS||[],window.IDLE_MEGA_ARENAS||[],window.IDLE_SINNOH_ARENAS||[],window.IDLE_UNOVA_ARENAS||[]).find(t=>t.id===ARENA_T.id)||{id:ARENA_T.id,accent:({electric:'#ead57e',garden:'#c5daab',poison:'#bbcf9a',psychic:'#d0b3ef',fire:'#f3b477',ground:'#e2c69b',lorelei:'#d4f3f5',bruno:'#d5bd99',agatha:'#ccb0e1',lance:'#b3c9e7',blue:'#f1d18e','route-cave':'#adc8dc','route-sewer':'#c1d39c','route-mansion':'#c7b4d5'})[ARENA_T.id]}};
 aEmblemT=function(g,T){if(!supports(T.id))nativeEmblem(g,T)};
 function arc(r,start,end,amount,color,width){if(amount<=0)return;c.beginPath();c.arc(0,0,r,start,start+(end-start)*amount);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke()}
 function half(r,start,end,color,alpha){if(alpha<=0)return;c.save();c.globalAlpha*=alpha;c.beginPath();c.arc(0,0,r,start,end);c.closePath();c.fillStyle=color;c.fill();c.restore()}
 function ball(p,accent){
  const r=76,outer=smooth(p/.57),upper=smooth((p-.3)/.3),lower=smooth((p-.44)/.3),divider=smooth((p-.55)/.26),button=smooth((p-.73)/.27);
  half(r,Math.PI,Math.PI*2,'#c7594e',upper*.73);half(r,0,Math.PI,'#e4e8e0',lower*.68);
  arc(r,-Math.PI/2,Math.PI*1.5,outer,'#0e1c2bc9',5);arc(r,-Math.PI/2,Math.PI*1.5,outer,accent+'b0',1.2);
  if(divider>0){c.beginPath();c.moveTo(-r*divider,0);c.lineTo(r*divider,0);c.strokeStyle='#172330';c.lineWidth=5;c.stroke()}
  if(button>0){c.save();c.globalAlpha*=button;c.fillStyle='#15212b';c.beginPath();c.arc(0,0,17,0,Math.PI*2);c.fill();c.restore();arc(17,-Math.PI/2,Math.PI*1.5,button,'#d9e5df',1.5);c.save();c.globalAlpha*=smooth((p-.88)/.12)*.88;c.fillStyle='#e3ece5';c.beginPath();c.arc(0,0,10,0,Math.PI*2);c.fill();c.restore()}
  if(p>.02&&p<.57&&!reduced){const a=-Math.PI/2+Math.PI*2*outer,x=Math.cos(a)*r,y=Math.sin(a)*r,glow=c.createRadialGradient(x,y,0,x,y,7);glow.addColorStop(0,accent+'b0');glow.addColorStop(1,accent+'00');c.fillStyle=glow;c.fillRect(x-7,y-7,14,14)}
 }
 window.IDLE_ARENA_SEAL={themes,get progress(){return progress},get active(){return !!study()}};
 function frame(now){
  const dt=last===null?0:Math.max(0,Math.min(.1,(now-last)/1000));last=now;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);
  const current=study();canvas.hidden=!current;
  if(current){
   if(previous!==current.id){previous=current.id;progress=0;forcedUntil=0;repaintArena()}
   const target=G.phase==='combat'||now<forcedUntil?1:0;
   if(!document.hidden&&(!G.paused||now<forcedUntil))progress=reduced?target:clamp(progress+(target?1:-1)*dt/(target?1.8:1.35));
   c.setTransform(2,0,0,2,0,0);
   const emblemAlpha=1-smooth((progress-.03)/.64);
   if(emblemAlpha>.001){c.save();c.globalAlpha=emblemAlpha;nativeEmblem(c,ARENA_T);c.restore()}
   if(progress>.001){c.save();c.translate(W/2,BY+HH/2+3.5*RH);ball(progress,current.accent);c.restore()}
  }else{previous=null;progress=0;forcedUntil=0}
  requestAnimationFrame(frame);
 }
 repaintArena();requestAnimationFrame(frame);
})();
