/* Use the game's own handheld-style UI sounds and saved audio preferences. */
(()=>{
 let armed=false,lastHover=null,lastAt=0;const selector='.stream-home button,.stream-credits-overlay button,.stream-credits-overlay a';
 function enabled(){return !CFG.mute&&Number(CFG.sfx)>0&&!document.hidden}
 function unlock(){armed=true;if(enabled())SND.init()}
 document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',e=>{if(!['Shift','Control','Alt','Meta','Tab'].includes(e.key))unlock()},{capture:true});
 function hover(button){if(!armed||!enabled()||!button||button.disabled)return;const now=performance.now();if(lastHover===button&&now-lastAt<180)return;if(now-lastAt<65)return;lastHover=button;lastAt=now;SND.mnav()}
 document.addEventListener('pointerover',e=>{const button=e.target.closest(selector);if(button&&!button.contains(e.relatedTarget))hover(button)});
 document.addEventListener('focusin',e=>hover(e.target.closest(selector)));
 document.addEventListener('click',e=>{const button=e.target.closest(selector);if(!button||button.disabled||!enabled())return;SND.init();const label=button.getAttribute('aria-label')||button.textContent;if(button.matches('.stream-credits-close,.stream-credits-bottom button'))return;else if(button.matches('.stream-game'))SND.mnav();else if(button.matches('.stream-credits-entry')||button.matches('.stream-nav-home')||/Treinador/i.test(label))SND.msel();else if(button.matches('.stream-credits-overlay a'))SND.click();
 },true);
 const credits=document.querySelector('.stream-credits-overlay');if(credits)new MutationObserver(()=>{if(credits.hidden&&armed&&enabled())SND.mback()}).observe(credits,{attributes:true,attributeFilter:['hidden']});
})();
