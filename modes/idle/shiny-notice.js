/* Presentation only: never changes encounters, capture results or shiny odds. */
(()=>{
 let box,timer,queue=[],current=null;
 let audio,output,pendingSound=false;
 function prepareAudio(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;if(!audio){audio=new Audio();output=audio.createGain();output.gain.value=.85;const limiter=audio.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=6;limiter.ratio.value=16;limiter.attack.value=.003;limiter.release.value=.12;output.connect(limiter);limiter.connect(audio.destination)}return audio}
 function playShinySound(){
  // Shiny is an explicit exception to all in-game mute and volume controls.
  try{const ctx=prepareAudio();if(!ctx)return;if(ctx.state!=='running'){pendingSound=true;ctx.resume().then(()=>{if(pendingSound&&ctx.state==='running'){pendingSound=false;playShinySound()}}).catch(()=>{});return}pendingSound=false;
   const start=ctx.currentTime+.015;[784,988,1175,1568,1976,1568].forEach((frequency,i)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain(),at=start+i*.115;oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.32,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.43);oscillator.connect(gain);gain.connect(output);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};oscillator.start(at);oscillator.stop(at+.46)})
  }catch{pendingSound=false}
 }
 for(const type of ['pointerdown','keydown'])document.addEventListener(type,()=>{if(pendingSound)playShinySound();else try{prepareAudio()?.resume().catch(()=>{})}catch{}},{passive:true});
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 function dismiss(){clearTimeout(timer);box?.remove();box=null;current=null;showNext()}
 function showNext(){
  if(current||document.hidden||!queue.length)return;const stage=document.getElementById('stage');if(!stage)return;
  const event=current=queue.shift(),caught=event.kind==='caught';box=el('aside','idle-shiny-notice');box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.dataset.kind=event.kind;
  const portrait=el('div','isn-portrait'),img=el('img');img.src=event.sprite;img.alt=event.name+' shiny';portrait.append(img);for(let i=0;i<6;i++){const spark=el('i','isn-spark','✦');spark.style.setProperty('--i',i);spark.setAttribute('aria-hidden','true');portrait.append(spark)}
  const copy=el('div','isn-copy');copy.append(el('small','isn-heading',caught?'SHINY CAPTURADO!':'SHINY ENCONTRADO!'),el('b','isn-name',event.name));
  if(caught){const tags=el('div','isn-tags');if(event.potency)tags.append(el('span','','P'+event.potency));if(Number.isFinite(event.ivTotal))tags.append(el('span','','IV '+event.ivTotal+'/186'));copy.append(tags);copy.append(el('small','isn-detail',event.destination==='bench'?'Guardado no banco':'Guardado no PC'))}
  else copy.append(el('small','isn-detail','Variante rara na caçada'));
  const close=el('button','isn-close','×');close.type='button';close.setAttribute('aria-label','Fechar aviso shiny');close.onclick=dismiss;box.append(portrait,copy,close);stage.append(box);
  timer=setTimeout(dismiss,caught?8500:6500);
 }
 window.addEventListener('idle-shiny-notice',({detail})=>{if(!detail?.name||!detail.sprite)return;playShinySound();const event={...detail};if(event.kind==='caught'){queue=queue.filter(e=>!(e.name===event.name&&e.kind==='encounter'));if(current?.kind==='encounter'&&current.name===event.name){clearTimeout(timer);box?.remove();box=null;current=null}}queue.push(event);showNext()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(current){clearTimeout(timer);queue.unshift(current);box?.remove();box=null;current=null}}else showNext()});
})();
