/* Presentation only: preserves the host's buttons, selectors and saved state. */
(()=>{
 const mounted=new WeakMap(),motion=matchMedia('(prefers-reduced-motion:reduce)');
 let audio=null,lastType=-1;
 function unlock(){try{audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}}
 function blip(){if(!audio||audio.state!=='running'||CFG.mute||!CFG.sfx||document.hidden)return;const now=audio.currentTime;if(now-lastType<.07)return;lastType=now;const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(480,now);o.frequency.exponentialRampToValueAtTime(380,now+.024);g.gain.setValueAtTime(.012*Math.min(1,CFG.sfx),now);g.gain.exponentialRampToValueAtTime(.0001,now+.025);o.connect(g);g.connect(audio.destination);o.onended=()=>{o.disconnect();g.disconnect()};o.start(now);o.stop(now+.03)}
 addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});
 function mount(root,info){
  const dialog=root.querySelector('.rop-dialog'),body=root.querySelector('.rop-body'),footer=root.querySelector('footer'),header=root.querySelector('header');
  if(!dialog||!body||!footer)return;
  root.classList.add('rop-game-dialogue');
  if(info.state){
   const t=info.state,context=root.querySelector('.rop-context');
   const strip=document.createElement('section');strip.className='rop-mission-strip';strip.setAttribute('aria-label','Estado da operação');
   const mark=document.createElement('strong');mark.className='rop-mission-mark';mark.textContent='R';
   const identity=document.createElement('div');identity.className='rop-mission-identity';
   const eyebrow=document.createElement('small');eyebrow.textContent='OPERAÇÃO ROCKET / '+(info.chapter==='lavender'?'LAVENDER':'CELADON');
   const chapter=document.createElement('b');chapter.textContent=info.chapter==='lavender'?'Ecos de Lavender':'Base escondida';identity.append(eyebrow,chapter);
   const stats=document.createElement('dl');
   for(const [label,value] of [['Etapa',(t.step+1)+'/'+(t.total||50)],['Vida',String(Math.round(G.hp))],['Ouro',String(G.gold)]]){
    const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;group.append(dt,dd);stats.append(group);
   }
   const alert=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent='Alerta';dd.className='rop-mission-alert';dd.setAttribute('aria-label',t.alert+' de 4 · '+['Oculto','Suspeita','Procurado','Alarme','Bloqueio'][t.alert]);
   for(let i=0;i<4;i++){const dot=document.createElement('i');dot.classList.toggle('active',i<t.alert);dot.setAttribute('aria-hidden','true');dd.append(dot)}alert.append(dt,dd);stats.append(alert);
   strip.append(mark,identity,stats);dialog.prepend(strip);context?.remove();
   root.classList.add('rop-has-mission-strip');
  }
  const row=document.createElement('div');row.className='rop-conversation';
  const bubble=document.createElement('section');bubble.className='rop-message';bubble.setAttribute('aria-label','Diálogo do encontro');
  const name=document.createElement('div');name.className='rop-speaker';
  const t=info.state,room=t?.room;
  const names={duo:'JESSIE E JAMES',spirit:'SILPH SCOPE',medium:'MÉDIUM',memorial:'MÉDIUM',employee:'FUNCIONÁRIO',shop:'CONTRABANDISTA',blackmarket:'NEGOCIANTE',laboratory:'CIENTISTA',training:'INSTRUTOR',terminal:'SISTEMA ROCKET',intercept:'RÁDIO ROCKET'};
  name.textContent=t?.status==='intro'?(room==='duo'?'JESSIE E JAMES':G.oppName||'EQUIPE ROCKET'):names[room]||'COMUNICADOR';
  if(t?.status==='ended')name.textContent=t.result==='won'?(info.chapter==='lavender'?'SR. FUJI':'CONTATO DA RESISTÊNCIA'):'COMUNICADOR';
  const advance=document.createElement('button');advance.type='button';advance.className='rop-message-advance';advance.setAttribute('aria-label','Revelar ou avançar diálogo');
  const text=document.createElement('span'),arrow=document.createElement('i');arrow.textContent='▼';arrow.setAttribute('aria-hidden','true');advance.append(text,arrow);
  const bottom=document.createElement('div');bottom.className='rop-message-bottom';const counter=document.createElement('span'),hint=document.createElement('span');hint.textContent='Espaço · avançar';bottom.append(counter,hint);bubble.append(name,advance,bottom);row.append(bubble,footer);dialog.append(row);
  const pages=[],known=new Set();let index=0,timer=null,full='',shown='';
  function add(value){value=value?.trim();if(!value||known.has(value))return;known.add(value);const words=value.split(/\s+/);let part='';for(const word of words){if(part.length+word.length>210){pages.push(part);part=''}part+=(part?' ':'')+word}if(part)pages.push(part)}
  add(header.querySelector('p')?.textContent);
  function collect(){body.querySelectorAll(':scope>p,:scope>.rop-opponent>div>p,:scope>.rop-opponent>p').forEach(p=>{add(p.textContent);p.classList.add('rop-spoken-copy')});counter.textContent=(index+1)+' / '+Math.max(1,pages.length)}
  collect();if(!pages.length)add(info.title);
  function stop(){clearInterval(timer);timer=null}
  function reveal(){stop();shown=full;text.textContent=full;advance.classList.remove('typing')}
  function write(){stop();full=pages[index]||info.title;shown='';text.textContent='';counter.textContent=(index+1)+' / '+pages.length;if(motion.matches){reveal();return}advance.classList.add('typing');timer=setInterval(()=>{if(!root.isConnected){stop();return}if(document.hidden||window.TEAM_VIEW?.isOpen)return;shown=full.slice(0,shown.length+1);text.textContent=shown;if(shown.length%3===0&&/\S/.test(shown.slice(-1)))blip();if(shown.length===full.length){stop();advance.classList.remove('typing')}},24)}
  function next(){SND.msel();if(timer){reveal();return}if(index<pages.length-1){index++;write()}else{const first=footer.querySelector('button:not(:disabled)')||body.querySelector('button:not(:disabled)');first?.focus()}}
  advance.onclick=next;
  const actor=document.createElement('div');actor.className='rop-dialogue-actor';actor.setAttribute('aria-hidden','true');
  const actors={shelter:113,training:66,memorial:'medium',medium:'medium',mist:92,terminal:'scientist',research:'scientist',intercept:'scientist',employee:'scientist',blackmarket:'gentleman',laboratory:'scientist',locked:'rocketgrunt',depot:'rocketgrunt'};
  if(root.dataset.screen==='event'&&!body.querySelector('.rop-opponent,.rop-rescue,.rocket-duo-retro,.rop-event-visual,.rop-result-emblem')){
   const selected=actors[room]||(t?.status==='ended'&&t.result==='won'?(info.chapter==='lavender'?'mrfuji':'oak'):'rocketgrunt');
   if(selected==='mrfuji'){actor.innerHTML='<span class="rop-fuji" role="img"></span>'}else{const img=document.createElement('img');img.alt='';img.src=typeof selected==='number'?sprStatic(selected):trainerUrl(selected);actor.append(img)}
   body.prepend(actor);
  }
  function select(button,sound){if(!button||button.disabled)return;const previous=root.querySelector('.rop-menu-selected');if(previous===button)return;previous?.classList.remove('rop-menu-selected');button.classList.add('rop-menu-selected');if(sound)SND.msel()}
  root.addEventListener('pointerover',e=>{const b=e.target.closest('[data-rop-action],[data-route],[data-starter],[data-item],[data-gear],[data-line]');if(b)select(b,true)});
  root.addEventListener('focusin',e=>{if(e.target.matches('button')&&e.target!==advance)select(e.target,true)});
  const observer=new MutationObserver(()=>{collect();if(body.querySelector('.rop-event-visual'))actor.remove()});observer.observe(body,{childList:true,subtree:true,characterData:true});
  write();mounted.set(root,{next,stop,observer,advance,select});
 }
 window.ROCKET_DIALOGUE={mount,unmount(root){const m=mounted.get(root);if(!m)return;m.stop();m.observer.disconnect();mounted.delete(root)},key(root,e){
  const m=mounted.get(root);if(!m||e.target.matches('input,select,textarea')||e.repeat)return false;
  if(e.key===' '){e.preventDefault();m.next();return true}
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
   const buttons=[...root.querySelectorAll('button:not(:disabled)')].filter(b=>b!==m.advance&&b.getClientRects().length);if(!buttons.length)return false;
   const i=buttons.indexOf(document.activeElement),step=['ArrowUp','ArrowLeft'].includes(e.key)?-1:1;
   e.preventDefault();buttons[(i+step+buttons.length)%buttons.length].focus();return true;
  }return false;
 }};
})();
