/* Pokédex-only animation viewer. No combat units, mana, damage or arena FX are used. */
(()=>{
 'use strict';
 let renderer=null,overlay=null,actor=null,raf=0,session=0,last=0,time=0,events=[],projectiles=[],info=null,focus=null;
 const style=document.createElement('style');style.textContent=`
 #pokedex .dex-preview-card{cursor:pointer;position:relative;transition:border-color .15s,background .15s}
 #pokedex .dex-preview-card:hover,#pokedex .dex-preview-card:focus-visible{outline:2px solid #ffd976;background:#28505a}
 #pokedex .dex-preview-hint{color:#ffd976;font-weight:bold;margin-top:8px}
 .dex-move-overlay{position:absolute;inset:0;z-index:25;background:#07151deF;display:flex;align-items:center;justify-content:center;padding:22px}
 .dex-move-dialog{width:min(720px,100%);max-height:100%;overflow:auto;background:#152e39;border:3px solid #b5d4d5;box-shadow:0 0 0 4px #091d29;color:#edf8f6}
 .dex-move-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px;border-bottom:2px solid #517e87}
 .dex-move-heading h3{margin:5px 0;font-size:21px;color:#ffdf86}.dex-move-heading small{color:#b2d4d4}
 .dex-move-dialog button{background:#254955;color:#fff2c6;border:2px solid #8aafaf;padding:10px 16px;cursor:pointer;font:inherit}
 .dex-move-viewport{position:relative;aspect-ratio:640/300;overflow:hidden;background:radial-gradient(ellipse at 32% 75%,#254f55,#0b202b 70%)}
 .dex-move-scene{position:absolute;left:0;top:0;width:640px;height:300px;transform-origin:top left;background:repeating-linear-gradient(0deg,transparent 0 3px,#7ed8c305 3px 4px)}
 .dex-move-scene canvas.dex-move-canvas{position:absolute;inset:0;width:640px;height:300px;pointer-events:none;z-index:15}
 .dex-move-scene .unit{position:absolute;z-index:10}.dex-move-scene .brow,.dex-move-scene .its{display:none!important}
 .dex-move-scene .unit .in{pointer-events:none}.dex-move-scene .unit .spr img{image-rendering:pixelated}
 .dex-move-target{position:absolute;left:440px;top:202px;width:34px;height:36px;border:3px solid #6c9b9f;background:#1b3b49;box-shadow:inset 0 0 0 5px #112735;image-rendering:pixelated}
 .dex-move-target:after{content:'ALVO';position:absolute;top:42px;left:-5px;color:#8bb1b5;font-size:11px;letter-spacing:1px}
 .dex-move-controls{padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:2px solid #517e87}
 .dex-move-status{font-size:13px;color:#bfd9d7;flex:1;min-width:180px}.dex-move-caption{margin:0;padding:0 16px 16px;color:#99b9be;font-size:12px}
 `;document.head.appendChild(style);
 function close(){session++;cancelAnimationFrame(raf);raf=0;events=[];projectiles=[];renderer?.clear();if(actor){PMD.live.delete(actor);actor._pmdPreviewUnit=null;actor.remove();actor=null}overlay?._resize?.disconnect();overlay?.remove();overlay=null;if(focus?.isConnected)focus.focus()}
 function later(at,fn){events.push({at,fn})}
 function shot(target,delay=0,size=1){later(delay,()=>{projectiles.push({x:170,y:213,lx:target.x,ly:target.y,dir:0,age:0,size,type:info.move.t,o:{...recipe(info.move).proj,move:info.move},tgt:target,sp:560,ox:0,oy:0})})}
 function hit(x=455,y=213){const ok=renderer.hit(info.move,x,y,.9);if(!ok)status('Este golpe ainda não tem um efeito visual disponível na prévia.');return ok}
 function status(text){if(overlay)overlay.querySelector('.dex-move-status').textContent=text}
 async function replay(){
  const token=++session;cancelAnimationFrame(raf);renderer.clear();time=0;last=0;events=[];projectiles=[];
  status('Carregando animação…');
  await renderer.ready(info.move);if(!overlay||token!==session)return;
  const root=actor,mv=info.move,rc=recipe(mv),pose=rc.pose||PMD.SP[mv.k]||['Charge','Shoot'];
  const data=await PMD.get(info.id).catch(()=>null);if(!overlay||token!==session)return;
  if(data)await Promise.all(pose.filter(name=>data._res(name)).map(name=>PMD.ensure(data,name)));
  if(!overlay||token!==session)return;
  root._pmdPreviewUnit._pmdSp=performance.now();PMD.playNames(root,pose);
  status('Preparação → execução → efeito');
  const prepared=renderer.start(mv,170,213);renderer.pose(mv,root.querySelector('.spr'));
  const target={x:455,y:213};
  if(['heal','buff','barrier'].includes(mv.k)){later(.2,()=>{status(prepared?'Efeito de '+mv.n+' no Pokémon':'Efeito visual indisponível. Tente Repetir após carregar os arquivos.')})}
  else if(mv.k==='beam'){later(.25,()=>{renderer.beam(mv,170,213,455,213,rc.bw||20);hit()})}
  else if(mv.k==='burst'){if(renderer.specialKind(mv)==='wave')later(.05,()=>renderer.beam(mv,170,213,455,213,85));later(renderer.specialKind(mv)==='wave'?.85:.2,()=>hit())}
  else if(mv.k==='debuff'){later(.2,()=>hit())}
  else if(['splash','teleport','transform'].includes(mv.k)){later(.2,()=>status(mv.k==='splash'?'Splash não causa dano.':mv.k==='teleport'?'Teleporte reposiciona o Pokémon durante o combate.':'Transformação copia os golpes do alvo durante o combate.'))}
  else if(mv.k==='field'){for(let i=0;i<5;i++)later(.25+i*.45,()=>hit(430+(i%2)*24,213))}
  else if(mv.k==='rush'){later(.25,()=>hit());}
  else if(mv.k==='chain'){later(.2,()=>{renderer.beam(mv,170,213,455,213,12);hit()})}
  else if(mv.k==='storm'){for(let i=0;i<5;i++)later(.3+i*.2,()=>projectiles.push({x:455,y:30,lx:455,ly:213,dir:Math.PI/2,age:0,size:1,type:mv.t,o:{...rc.proj,move:mv},tgt:target,sp:620,ox:0,oy:0}))}
  else if(mv.k==='meteor'){later(.75,()=>projectiles.push({x:455,y:10,lx:455,ly:213,dir:Math.PI/2,age:0,size:2,type:mv.t,o:{...rc.proj,move:mv},tgt:target,sp:500,ox:0,oy:0}))}
  else if(mv.k==='multi'||mv.k==='barrage'){for(let i=0;i<(mv.k==='multi'?3:rc.n||5);i++)shot(target,.2+i*.12,.8)}
  else shot(target,.25,1.2);
  const canvas=overlay.querySelector('.dex-move-canvas'),g=canvas.getContext('2d');
  function frame(now){
   if(!overlay||token!==session)return;
   const dt=last&&!document.hidden?Math.min(.05,(now-last)/1000):0;last=now;time+=dt;
   const due=events.filter(e=>e.at<=time);events=events.filter(e=>e.at>time);for(const e of due)e.fn();
   renderer.update(dt);g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,640,300);
   for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i],dx=p.lx-p.x,dy=p.ly-p.y,d=Math.hypot(dx,dy);p.age+=dt;p.dir=Math.atan2(dy,dx);
    if(d<=p.sp*dt+5){projectiles.splice(i,1);hit(p.lx,p.ly);continue}p.x+=dx/d*p.sp*dt;p.y+=dy/d*p.sp*dt;renderer.projectile(g,p);
   }
   renderer.draw(g);
   if(time<4||events.length||projectiles.length||renderer.active)raf=requestAnimationFrame(frame);else status('Animação concluída. Clique em Repetir para observar novamente.');
  }
  raf=requestAnimationFrame(frame);
 }
 window.DEX_MOVE_PREVIEW={close,async open(selection){
  close();selection={...selection,star:Math.max(1,LINES[selection.line].ids.indexOf(selection.id)+1)};info={...selection,move:{...selection.move,_variant:0}};focus=document.activeElement;
  renderer=renderer||window.CREATE_EMERALD_RENDERER();renderer.sequence=window.CREATE_EMERALD_SEQUENCES(renderer);
  const dex=document.getElementById('pokedex');if(!dex?.classList.contains('show'))return;
  overlay=document.createElement('section');overlay.className='dex-move-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Prévia do golpe');
  overlay.innerHTML='<div class="dex-move-dialog"><div class="dex-move-heading"><div><small>VISOR DE ANIMAÇÕES · POKÉDEX</small><h3></h3></div><button data-preview-close aria-label="Fechar prévia">×</button></div><div class="dex-move-viewport"><div class="dex-move-scene"><div class="dex-move-target"></div><canvas class="dex-move-canvas" width="1280" height="600"></canvas></div></div><div class="dex-move-controls"><span class="dex-move-status" role="status"></span><button data-repeat>▶ Repetir</button></div><p class="dex-move-caption">Demonstração visual independente. Não gasta mana nem altera sua partida.</p></div>';
  overlay.querySelector('h3').textContent=selection.name+' · '+selection.move.n;dex.append(overlay);
  const scene=overlay.querySelector('.dex-move-scene'),viewport=overlay.querySelector('.dex-move-viewport');
  const resize=new ResizeObserver(()=>{scene.style.transform='scale('+viewport.clientWidth/640+')'});resize.observe(viewport);overlay._resize=resize;
  actor=buildEl('dex-move-preview',1);actor.classList.add('dex-preview-unit');actor.style.transform='translate(170px,235px)';actor._pmdPreviewUnit={line:selection.line,star:selection.star,id:selection.id,L:LINES[selection.line],types:typesOf(LINES[selection.line],selection.star),alive:true,fa:0,view:'f'};
  actor.classList.toggle('grounded-combat',!airborneAttacker(actor._pmdPreviewUnit));scene.append(actor);setSprite(actor,selection.line,selection.star,1,'f');
  overlay.querySelector('.dex-move-target').hidden=['barrier','buff','heal'].includes(selection.move.k);
  overlay.addEventListener('click',e=>{e.stopPropagation();if(e.target===overlay||e.target.closest('[data-preview-close]')){resize.disconnect();close()}else if(e.target.closest('[data-repeat]'))replay()});
  overlay.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();resize.disconnect();close()}if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}});
  overlay.querySelector('[data-preview-close]').focus();replay();
 }};
})();
