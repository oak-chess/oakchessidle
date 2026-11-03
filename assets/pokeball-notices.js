/* Approved notification reveal, using the existing priority queue and content. */
(()=>{
'use strict';
let active=null;
function equippedTheme(){const snapshot=window.ACH?.snapshot?.();const id=snapshot?.equipped?.trail;return snapshot?.defs?.find(d=>d.id===id&&d.kind==='trail'&&(snapshot.progress[id]||0)>=d.target)?.color||null}
function applyTheme(target,color=equippedTheme()){if(!/^#[0-9a-f]{6}$/i.test(color||'')){delete target.dataset.pnTrail;target.style.removeProperty('--pn-trail');target.style.removeProperty('--pn-trail-rgb');return}target.dataset.pnTrail='';target.style.setProperty('--pn-trail',color);target.style.setProperty('--pn-trail-rgb',[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)).join(','))}

const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
function clear(){if(!active)return;cancelAnimationFrame(active.raf);active.resize.disconnect();active=null}
function show(root,notice,preview=false){
 if(!preview)clear();const el=document.createElement('div');el.className='game-notice pokeball-notice';el.dataset.level=notice.priority;applyTheme(el,notice.trailColor===undefined?equippedTheme():notice.trailColor);
 el.innerHTML='<div class="pn-aura" aria-hidden="true"></div><div class="pn-copy"></div><div class="pn-glow" aria-hidden="true"></div><div class="pn-beam" aria-hidden="true"></div><div class="pn-ball" aria-hidden="true"><img class="pn-lid" alt=""><img class="pn-base" alt=""></div>';
 const copy=el.querySelector('.pn-copy'),aura=el.querySelector('.pn-aura'),ball=el.querySelector('.pn-ball'),lid=el.querySelector('.pn-lid'),base=el.querySelector('.pn-base'),glow=el.querySelector('.pn-glow'),beam=el.querySelector('.pn-beam');
 copy.innerHTML=notice.text;lid.src=base.src=ITI('poke-ball');root.setAttribute('role','status');root.setAttribute('aria-live','polite');root.appendChild(el);
 const particles=[];for(let i=0;i<10;i++){const node=document.createElement('div');node.className='pn-particle';node.setAttribute('aria-hidden','true');el.appendChild(node);particles.push(node)}
 const reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const start=performance.now(),hold=Math.max(1200,Number(notice.duration)||2600)/1000,total=.95+hold+.5;
 const state={el,copy,notice,raf:0,width:0,height:0,top:0,opened:false,resize:null};
 const measure=()=>{state.width=el.offsetWidth;state.height=el.offsetHeight;state.top=preview?60:root.offsetTop};
 state.resize=new ResizeObserver(measure);state.resize.observe(el);measure();if(preview)root._pnPreviewState=state;else active=state;
 function draw(now){
  if((!preview&&active!==state)||!el.isConnected)return;
  const time=(now-start)/1000,flight=clamp(time/.44),expand=ease((time-.54)/.4),out=ease((time-(.95+hold))/.5),visible=1-out,open=ease((time-.43)/.16)*(1-out),width=state.width,y=state.height/2;
  const x=width/2-(width/2-24)*expand*(1-out),dropY=-state.top-40+(y+state.top+40)*flight*flight;
  ball.style.left=(reduced||time>=.44?x:width/2)+'px';ball.style.top=(reduced||time>=.44?y:dropY)+'px';ball.style.opacity=time<.44?clamp(time/.08):visible;
  ball.style.transform=`rotate(${reduced||time>=.44?0:(1-flight)*-180}deg)`;lid.style.transform=`translateY(${-open*8}px) rotate(${reduced?0:-open*18}deg)`;base.style.transform=`translateY(${open*3}px)`;
  aura.style.opacity=expand*visible;aura.style.transform=`scaleX(${reduced?1:Math.max(.01,expand*(1-out))})`;
  const reveal=ease((time-.58)/.43);copy.style.opacity=reveal*visible;copy.style.clipPath=reduced?'none':`inset(0 ${(1-reveal)*100}% 0 0)`;copy.style.transform=`translateX(${reduced?0:(1-reveal)*-8}px)`;
  const light=ease((time-.44)/.1)*(1-ease((time-.66)/.4))*visible,spread=ease((time-.5)/.3);
  glow.style.left=x+'px';glow.style.top=y+'px';glow.style.opacity=light*(reduced?.25:.92);glow.style.transform=`scale(${reduced?1:.35+ease((time-.44)/.1)*.8+spread*.3})`;
  beam.style.top=y+'px';beam.style.opacity=reduced?0:light*.78;beam.style.transform=`translate(-50%,-50%) scaleX(${spread})`;
  const released=clamp((time-.47)/.5);for(let i=0;i<particles.length;i++){const angle=i*2.399,dist=10+released*40;particles[i].style.left=width/2+'px';particles[i].style.top=y+'px';particles[i].style.opacity=!reduced&&time>.47&&time<.97?(1-released)*.7:0;particles[i].style.transform=`translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px)`}
  if(!state.opened&&time>=.48){state.opened=true;if(!preview&&typeof playNoticeTone==='function')playNoticeTone()}
  if(time<total)state.raf=requestAnimationFrame(draw);
 }
 draw(start);return total*1000;
}
function update(notice){if(!active)return false;active.notice=notice;active.el.dataset.level=notice.priority;active.copy.innerHTML=notice.text;applyTheme(active.el);return true}
const sideStates=new Map();
function stopSide(target){const state=sideStates.get(target);if(!state)return;cancelAnimationFrame(state.raf);state.observer.disconnect();state.resize.disconnect();sideStates.delete(target)}
function revealSide(target,options={}){
 if(!target?.classList.contains('show'))return;stopSide(target);target.querySelectorAll('[data-pn-decoration]').forEach(n=>n.remove());
 let content=target.querySelector('.pn-side-content');if(!content){content=document.createElement('div');content.className='pn-side-content';while(target.firstChild)content.appendChild(target.firstChild);target.appendChild(content)}
 target.classList.add('pokeball-side');applyTheme(target,Object.prototype.hasOwnProperty.call(options,'color')?options.color:equippedTheme());
 const decoration=document.createElement('div');decoration.className='pn-side-decoration';decoration.dataset.pnDecoration='';decoration.setAttribute('aria-hidden','true');decoration.innerHTML='<div class="pn-side-aura"></div><div class="pn-side-glow"></div><div class="pn-side-beam"></div><div class="pn-side-ball"><img class="pn-side-lid" alt=""><img class="pn-side-base" alt=""></div>';target.appendChild(decoration);
 const ball=decoration.querySelector('.pn-side-ball'),lid=decoration.querySelector('.pn-side-lid'),base=decoration.querySelector('.pn-side-base'),aura=decoration.querySelector('.pn-side-aura'),glow=decoration.querySelector('.pn-side-glow'),beam=decoration.querySelector('.pn-side-beam');lid.src=base.src=ITI('poke-ball');
 const reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now(),state={raf:0,observer:null,resize:null,width:0,height:0};
 const measure=()=>{state.width=target.offsetWidth;state.height=target.offsetHeight};state.resize=new ResizeObserver(measure);state.resize.observe(target);state.observer=new MutationObserver(()=>{if(!target.classList.contains('show')||!target.isConnected)stopSide(target)});state.observer.observe(target,{attributes:true,attributeFilter:['class']});measure();sideStates.set(target,state);
 function draw(now){if(sideStates.get(target)!==state||!target.classList.contains('show')||!target.isConnected){stopSide(target);return}const t=(now-start)/1000,flight=ease(t/.44),expand=ease((t-.54)/.4),opened=ease((t-.43)/.16),reveal=ease((t-.58)/.43),width=state.width,y=state.height/2;
  const x=reduced||t>=.44?width/2-(width/2-24)*expand:width+65-(width/2+65)*flight;
  ball.style.left=x+'px';ball.style.top=(reduced?y:y-Math.sin(clamp(t/.44)*Math.PI)*12)+'px';ball.style.opacity=clamp(t/.08);ball.style.transform=`rotate(${reduced||t>=.44?0:(1-flight)*180}deg)`;lid.style.transform=`translateY(${-opened*8}px) rotate(${reduced?0:-opened*18}deg)`;base.style.transform=`translateY(${opened*3}px)`;
  content.style.opacity=reveal;content.style.clipPath=reduced?'none':`inset(0 0 0 ${(1-reveal)*100}%)`;aura.style.opacity=expand;aura.style.transform=`scaleX(${reduced?1:Math.max(.01,expand)})`;
  const light=ease((t-.44)/.1)*(1-ease((t-.66)/.4));glow.style.left=x+'px';glow.style.top=y+'px';glow.style.opacity=light*(reduced?.25:.92);glow.style.transform=`scale(${reduced?1:.35+opened*.9})`;beam.style.top=y+'px';beam.style.opacity=reduced?0:light*.78;beam.style.transform=`translate(-50%,-50%) scaleX(${ease((t-.5)/.3)})`;
  if(t<1.1)state.raf=requestAnimationFrame(draw);else{content.style.opacity=1;content.style.clipPath='none'}
 }
 draw(start);
}
window.POKEBALL_NOTICES={show,clear,update,revealSide,preview(host,color){const wrapper=document.createElement('div');wrapper.className='pn-tablet-side-preview';wrapper.style.cssText='position:relative;width:100%;height:240px;display:grid;place-items:center;overflow:visible;isolation:isolate';const notice=document.createElement('div');notice.className='show pokeball-tablet-sample';notice.style.cssText='position:relative;width:540px;max-width:100%;min-height:58px;color:#edf4fb;font:700 14px/19px "Trebuchet MS","Segoe UI",sans-serif';const copy=document.createElement('div');copy.className='pn-side-content';copy.style.cssText='padding:14px 24px 14px 48px;text-align:center;text-shadow:0 1px 3px #060e1f';copy.textContent='Sua equipe está pronta para a próxima batalha.';notice.append(copy);wrapper.append(notice);host.replaceChildren(wrapper);revealSide(notice,{color});return ()=>{stopSide(notice);wrapper.remove()}}};

function refreshThemes(){queueMicrotask(()=>{if(active&&!active.el.closest('.pn-tablet-preview'))applyTheme(active.el);for(const target of sideStates.keys())applyTheme(target)})}
addEventListener('trainer-profile-change',refreshThemes);addEventListener('trainer-cosmetics-change',refreshThemes);
window.addEventListener('pagehide',()=>{clear();for(const target of sideStates.keys())stopSide(target)});
})();
