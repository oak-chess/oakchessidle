(function(){
 const bar=document.getElementById('sysbar');if(!bar)return;
 const pause=document.getElementById('pauseBtn'),fullscreen=document.getElementById('fsBtn'),gear=document.getElementById('gear'),view=document.getElementById('viewBtn');
 const toggle=document.createElement('button');toggle.id='gameMenuToggle';toggle.type='button';toggle.title='Configurações';toggle.setAttribute('aria-label','Abrir configurações');toggle.setAttribute('aria-haspopup','dialog');toggle.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path fill-rule="evenodd" d="M9 1h6v3h3v2h3v3h2v6h-2v3h-3v3h-3v2H9v-2H6v-3H3v-3H1V9h2V6h3V4h3V1Zm1 7H8v2H6v4h2v2h2v2h4v-2h2v-2h2v-4h-2V8h-2V6h-4v2Z"/></svg>';
 const menu=document.createElement('div');menu.id='gameMenuItems';menu.hidden=true;
 bar.classList.add('game-tools');bar.replaceChildren(pause,fullscreen,toggle,menu);document.getElementById('pokedexLaunch')?.remove();if(gear){menu.append(gear);toggle.onclick=()=>gear.click()}
 const group=document.querySelector('#menu [data-pane="visual"] .mgroup');
 if(view)view.remove();
})();

(function(){
 const bar=document.getElementById('sysbar'),menuButton=document.getElementById('gameMenuToggle');if(!bar)return;
 const icon=muted=>'<svg viewBox="0 0 24 24" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 9h4V7h2V5h3v14H9v-2H7v-2H3z"/>'+(muted?'<path d="M16 8h2v2h2V8h2v2h-2v4h2v2h-2v-2h-2v2h-2v-2h2v-4h-2z"/>':'<path d="M15 8h2v2h2v4h-2v2h-2v-2h2v-4h-2zM19 4h2v3h2v10h-2v3h-2v-3h2V7h-2z"/>')+'</svg>';
 const button=document.createElement('button');button.id='quickVolumeButton';button.type='button';button.setAttribute('aria-label','Ajustar volume');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','quickVolumePanel');
 const panel=document.createElement('section');panel.id='quickVolumePanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Volume do jogo');panel.innerHTML='<label for="quickMusic"><span>Música</span><input id="quickMusic" type="range" min="0" max="1" step="0.01"><output></output></label><label for="quickSfx"><span>Efeitos</span><input id="quickSfx" type="range" min="0" max="1" step="0.01"><output></output></label><label for="quickCry"><span>Pokémon</span><input id="quickCry" type="range" min="0" max="1" step="0.01"><output></output></label><label for="quickNotice"><span>Avisos</span><input id="quickNotice" type="range" min="0" max="1" step="0.01"><output></output></label><button type="button" class="quick-volume-mute"></button>';
 bar.insertBefore(button,menuButton);bar.append(panel);
 const music=panel.querySelector('#quickMusic'),effects=panel.querySelector('#quickSfx'),cry=panel.querySelector('#quickCry'),notices=panel.querySelector('#quickNotice'),mute=panel.querySelector('.quick-volume-mute');
 function sync(){button.innerHTML=icon(CFG.mute);button.setAttribute('aria-label',CFG.mute?'Som silenciado. Ajustar volume':'Ajustar volume');music.value=CFG.music?CFG.musvol:0;effects.value=CFG.sfx;cry.value=CFG.cry;notices.value=CFG.noticeVol;for(const input of [music,effects,cry,notices]){input.style.setProperty('--volume',Math.round(input.value*100)+'%');input.nextElementSibling.textContent=Math.round(input.value*100)+'%';input.setAttribute('aria-valuetext',Math.round(input.value*100)+' por cento')}mute.textContent=CFG.mute?'Ativar som':'Silenciar tudo';mute.setAttribute('aria-pressed',String(CFG.mute));panel.classList.toggle('all-muted',!!CFG.mute)}
 function close(focus=false){panel.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus()}
 button.onclick=e=>{e.stopPropagation();if(!panel.hidden){close();return}if(bar.classList.contains('menu-open'))menuButton.click();sync();panel.hidden=false;button.setAttribute('aria-expanded','true');SND.click()};
 music.oninput=()=>{CFG.musvol=Number(music.value);CFG.music=CFG.musvol>0;saveCfg();syncMenuUI();sync()};effects.oninput=()=>{CFG.sfx=Number(effects.value);saveCfg();syncMenuUI();sync()};effects.onchange=()=>SND.click();cry.oninput=()=>{CFG.cry=Number(cry.value);saveCfg();syncMenuUI();sync()};cry.onchange=()=>SND.cry(25);notices.oninput=()=>{CFG.noticeVol=Number(notices.value);saveCfg();syncMenuUI();sync()};notices.onchange=()=>{if(typeof playNoticeTone==='function')playNoticeTone()};
 mute.onclick=()=>{CFG.mute=!CFG.mute;saveCfg();syncMenuUI();sync();if(!CFG.mute)SND.click()};
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!button.contains(e.target))close()});menuButton.addEventListener('click',()=>close());
 panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close(true)}if(e.key==='Tab'){const first=music,last=mute;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 button.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();if(panel.hidden)button.click();music.focus()}};
 new MutationObserver(()=>{if(!panel.hidden)sync();else button.innerHTML=icon(CFG.mute)}).observe(document.getElementById('menu'),{attributes:true,attributeFilter:['class']});sync();
})();
