/* Presentation only: resize giant foes when their layout changes, never on a timer. */
'use strict';
window.createIdleBossFit=function({root,units,fit,stage,hud}){
 const tracked=new Map(),dirty=new Set();let frame=0,stopped=false;
 const flags=e=>[e.classList.contains('final'),e.classList.contains('pmd'),e.dataset.idleForm||''].join(':');
 function flush(){frame=0;if(stopped||document.hidden)return;const pending=[...dirty];dirty.clear();for(const unit of pending)if(unit.el?.isConnected&&tracked.get(unit.el)?.unit===unit)fit(unit)}
 function request(unit){if(stopped)return;if(unit){unit.el._bossFitKey=null;dirty.add(unit)}if(!frame&&dirty.size&&!document.hidden)frame=requestAnimationFrame(flush)}
 function all(){for(const {unit}of tracked.values())if(unit.el.classList.contains('final')||unit.el.style.getPropertyValue('--boss-fit'))request(unit)}
 const sizes=new ResizeObserver(entries=>{for(const entry of entries){const record=[...tracked.values()].find(r=>r.inner===entry.target);if(record)request(record.unit)}});
 const classes=new MutationObserver(entries=>{for(const entry of entries){const record=tracked.get(entry.target);if(!record)continue;const next=flags(entry.target);if(next!==record.flags){record.flags=next;request(record.unit)}}});
 function sync(){if(stopped)return;const current=new Map(units().filter(u=>u.side===1&&u.el?.isConnected).map(u=>[u.el,u]));for(const [element,record]of tracked)if(current.get(element)!==record.unit){sizes.unobserve(record.inner);dirty.delete(record.unit);tracked.delete(element)}
  // Reconnect attribute observation only when the roster changes, not on every animation.
  classes.disconnect();for(const [element,unit]of current){let record=tracked.get(element);if(!record){const inner=element.querySelector('.in');if(!inner)continue;record={unit,inner,flags:flags(element)};tracked.set(element,record);sizes.observe(inner);if(element.classList.contains('final'))request(unit)}else if(record.flags!==flags(element)){record.flags=flags(element);request(unit)}classes.observe(element,{attributes:true,attributeFilter:['class','data-idle-form']})}
 }
 const roster=new MutationObserver(sync);roster.observe(root,{childList:true});
 const bounds=new ResizeObserver(all);if(stage)bounds.observe(stage);if(hud)bounds.observe(hud);
 function loaded(event){const element=event.target.closest?.('.unit'),record=tracked.get(element);if(record)request(record.unit)}
 function visible(){if(!document.hidden){sync();all()}}
 root.addEventListener('load',loaded,true);window.addEventListener('resize',all);document.addEventListener('fullscreenchange',all);document.addEventListener('visibilitychange',visible);sync();
 return {refresh:sync,destroy(){stopped=true;if(frame)cancelAnimationFrame(frame);roster.disconnect();classes.disconnect();sizes.disconnect();bounds.disconnect();root.removeEventListener('load',loaded,true);window.removeEventListener('resize',all);document.removeEventListener('fullscreenchange',all);document.removeEventListener('visibilitychange',visible);dirty.clear();tracked.clear()}};
};

/* Geometry only. The engine supplies stage scale and reserved HUD height. */
window.fitIdleBossElement=function(u,{stage,scale:SC,top:BOSS_TOP}){
  const e=u&&u.el;if(!e||u.side!==1||!e.isConnected)return;
  const cl=e.classList,fin=cl.contains('final');if(!fin){e.style.removeProperty('--boss-fit');return}/* Regular gym teams retain their normal sprite size; only giant bosses need fitting. */
  const inn=e.querySelector('.in');if(!inn||inn.offsetHeight<30)return;
  // Fit once per viewport and sprite source, using layout size rather than animated bounds.
  const key=[innerWidth,innerHeight,SC,cl.contains('pmd')?1:0].join(':');
  if(e._bossFitKey===key)return;
  const stageRect=stage.getBoundingClientRect();
  let top=stageRect.top+BOSS_TOP*SC;
  const rb=document.getElementById('roundbox');if(rb){const q=rb.getBoundingClientRect();if(q.height)top=Math.max(top,q.bottom+6)}
  const style=getComputedStyle(e),depth=parseFloat(style.getPropertyValue('--unit-depth'))||1,fix=parseFloat(style.getPropertyValue('--unit-fix'))||1;
  if(e._bossFitAnchor==null)e._bossFitAnchor=u.y;
  const bottom=stageRect.top+e._bossFitAnchor*SC,height=inn.offsetHeight*SC*depth*fix;
  const f=Math.max(fin?.42:.55,Math.min(1,(bottom-top)/height));
  e.style.setProperty('--boss-fit',f.toFixed(3));e._bossFitKey=key;
};
