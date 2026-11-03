/* Home shortcut reuses the equipped trainer, partner, arena and frame renderer. */
(()=>{
 const hero=document.querySelector('.stream-hero');if(!hero)return;
 const button=document.createElement('button');button.className='stream-trainer-card';button.type='button';
 button.setAttribute('aria-label','Abrir meu treinador e parceiro');
 const canvas=document.createElement('canvas');canvas.width=240;canvas.height=260;canvas.setAttribute('aria-hidden','true');
 const label=document.createElement('span');label.textContent='Meu treinador';button.append(canvas,label);hero.append(button);
 button.onclick=()=>window.TRAINER_PROFILE?.open();
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const style=document.createElement('style');style.textContent=`
 .stream-trainer-card{position:absolute;right:68px;bottom:54px;z-index:8;width:140px;padding:0;border:0;border-radius:5px;background:#102538bb;color:#e6d8b1;cursor:pointer;box-shadow:0 5px 18px #0005;transition:transform .18s}
 .stream-trainer-card canvas{display:block;width:140px;height:auto;image-rendering:pixelated;border-radius:4px}
 .stream-trainer-card span{display:block;padding:5px 3px;font:600 10px Arial;text-align:center}
 .stream-trainer-card:hover{transform:translateY(-3px)}
 .stream-trainer-card:focus-visible{outline:2px solid #f1d183;outline-offset:4px}
 @media(max-width:700px){.stream-trainer-card{right:30px;bottom:40px;width:108px}.stream-trainer-card canvas{width:108px}.stream-trainer-card span{font-size:9px}}
 @media(prefers-reduced-motion:reduce){.stream-trainer-card{transition:none}}
 `;document.head.append(style);
 let last=0;function frame(now){requestAnimationFrame(frame);if(document.hidden||now-last<100||LAB.st!=='title'||TM.view!=='main'||document.querySelector('.tp-overlay:not([hidden]),#rocketOperationOverlay'))return;last=now;window.TRAINER_DUO?.renderCard(ctx,now)}requestAnimationFrame(frame);
})();
