/* Settings presentation only. Preferences, audio and persistence belong to the engine. */
'use strict';
window.syncIdleSettingsView=function({config:CFG,query:$,switches:SWT,paintRange,syncMusRow}){
  document.body.classList.toggle('countdown-disabled',!CFG.timer);
  const timerBar=document.getElementById('tbar');
  if(timerBar){if(!CFG.timer)timerBar.style.setProperty('display','none','important');else timerBar.style.removeProperty('display')}
  [['vmusvol','pmus','musvol'],['vsfx','psfx','sfx'],['vcry','pcry','cry']].forEach(([id,pid,k])=>{const el=$('#'+id);el.value=CFG[k];paintRange(el);$('#'+pid).textContent=Math.round(CFG[k]*100)+'%'});
  $('#vmus').checked=CFG.music;syncMusRow();$('#vtim').checked=CFG.timer;$('#vpmd').checked=!!CFG.pmd;
  SWT.forEach(([id,k,dt])=>{$('#'+id).checked=dt?CFG[k]!==false:!!CFG[k]});
  document.querySelectorAll('#menu .seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===String(CFG[sg.dataset.key]))));
  document.body.classList.toggle('reduce-fx',!!CFG.reduceFx);document.body.classList.toggle('hide-mana',CFG.manabar===false);
  $('#menu').classList.toggle('muted',!!CFG.mute);
};
