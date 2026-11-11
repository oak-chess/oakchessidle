/* Settings presentation only. Preferences, audio and persistence belong to the engine. */
'use strict';
window.syncIdleSettingsView=function({config:CFG,query:$,switches:SWT,paintRange,syncMusRow}){
  document.body.classList.toggle('countdown-disabled',!CFG.timer);
  const timerBar=document.getElementById('tbar');
  if(timerBar){if(!CFG.timer)timerBar.style.setProperty('display','none','important');else timerBar.style.removeProperty('display')}
  [['vmusvol','pmus','musvol'],['vsfx','psfx','sfx'],['vcry','pcry','cry']].forEach(([id,pid,k])=>{const el=$('#'+id),label=$('#'+pid);if(el){el.value=CFG[k];paintRange(el)}if(label)label.textContent=Math.round(CFG[k]*100)+'%'});
  const music=$('#vmus');if(music){music.checked=CFG.music;syncMusRow()}
  const timer=$('#vtim');if(timer)timer.checked=CFG.timer;
  const sprites=$('#vpmd');if(sprites)sprites.checked=!!CFG.pmd;
  // Online Idle removes campaign/data controls. Synchronize only mounted inputs.
  SWT.forEach(([id,k,dt])=>{const input=$('#'+id);if(input)input.checked=dt?CFG[k]!==false:!!CFG[k]});
  document.querySelectorAll('#menu .seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===String(CFG[sg.dataset.key]))));
  document.body.classList.toggle('reduce-fx',!!CFG.reduceFx);document.body.classList.toggle('hide-mana',CFG.manabar===false);
  $('#menu')?.classList.toggle('muted',!!CFG.mute);
};
