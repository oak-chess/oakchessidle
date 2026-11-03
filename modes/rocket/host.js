/* Local TFT host. The parent receives lifecycle messages, never mutable combat state. */
(()=>{'use strict';const chapter=new URLSearchParams(location.search).get('chapter')==='lavender'?'lavender':'celadon';let last=performance.now(),leaving=false;
 const send=type=>{if(parent!==window)parent.postMessage({channel:'oak-idle-rocket-v1',type,chapter},location.protocol==='file:'?'*':location.origin)};
 function accrue(){const now=performance.now(),dt=Math.max(0,Math.min(2500,now-last));last=now;const t=typeof G!=='undefined'&&G.rocketOperation;if(t&&t.status!=='ended'&&!document.hidden&&!G.paused)t.activeMs=Math.max(0,Number(t.activeMs)||0)+dt}
 function leave(){if(leaving)return;leaving=true;accrue();try{for(const a of document.querySelectorAll('audio'))a.pause();CFG.music=false;SND.set();B.on=false;send('exit')}catch(error){leaving=false;reportErr(error)}}
 function requestExit(){if(typeof G!=='undefined'&&G.rocketOperation){if(['combat','vs'].includes(G.phase)){send('busy');return}ROCKET_OPERATION.exit();if(!leaving)send('not-saved');return}leave()}
 window.IDLE_ROCKET_HOST={accrue,leave,requestExit};
 window.addEventListener('message',e=>{if(e.source!==parent||(e.origin!==location.origin&&!(location.protocol==='file:'&&e.origin==='null'))||e.data?.channel!=='oak-idle-rocket-v1')return;if(e.data.type==='request-exit')requestExit()});
 document.addEventListener('visibilitychange',()=>{accrue();last=performance.now()});window.addEventListener('pagehide',()=>{accrue();window.ROCKET_OPERATION?.save()});
 function boot(){try{if(!window.OAK_GAME_INITIALIZED||!window.ROCKET_OPERATION)throw Error('O módulo Rocket não terminou de carregar.');clearTimeout(TITLE_TM);stopTitleDemo();LAB.st='done';DEMO.on=false;DEMO.mute=false;B.on=false;clearCombatUnits();document.getElementById('starter')?.classList.remove('show');document.body.classList.remove('on-title');if(chapter==='lavender'&&!JSON.parse(localStorage.getItem('oakchess_rocket_operation_v1_progress')||'{}').silphScope){leave();return}ROCKET_OPERATION.menu(chapter);setInterval(accrue,1000);send('ready')}catch(error){reportErr(error);send('failed')}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
