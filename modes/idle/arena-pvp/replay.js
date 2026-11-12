/* Presentation only: positions, health and outcome were computed and saved by the server. */
window.IDLE_ARENA_REPLAY=(()=>{
 let active;
 const E=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n};
 function play(result){
  active?.();
  return new Promise(resolve=>{
   const frames=result.frames,roster=[...result.snapshot.allies,...result.snapshot.enemies];
   if(!Array.isArray(frames)||!frames.length||roster.length!==12){resolve();return}
   const root=E('section','arena-online-replay'),scene=E('div','aor-scene');
   root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Batalha da Arena');root.tabIndex=-1;
   const header=E('header','aor-header','ARENA · DUELO DE TREINADORES'),clock=E('span','aor-clock','0:00');header.append(clock);
   const finishButton=E('button','aor-skip','Ver resultado');finishButton.type='button';
   const footer=E('footer','aor-footer','Resultado validado pelo servidor');
   const nodes=roster.map((m,i)=>{
    const slot=E('div','aor-unit');slot.dataset.side=i<6?'ally':'enemy';
    const img=IDLE_TRAINER_CARD.portrait(m.pokemon_id,m.combat_data?.shiny===true,m.combat_data?.form||0);
    const hp=E('i','aor-health'),fill=E('i','');hp.append(fill);
    slot.append(hp,img,E('small','','Nv. '+m.level));scene.append(slot);
    return {slot,fill,cast:0,hp:1000};
   });
   let raf,finished=false,start=performance.now(),index=0;
   function cleanup(){cancelAnimationFrame(raf);document.removeEventListener('keydown',key,true);root.remove();if(active===cleanup)active=null;SND.music('plan');resolve()}
   function showResult(){
    if(finished)return;finished=true;cancelAnimationFrame(raf);
    const won=result.winner===0,draw=result.winner===-1;
    header.textContent=draw?'EMPATE':won?'VITÓRIA!':'DERROTA';
    footer.textContent=draw?'Tempo esgotado · nenhum ponto alterado':(result.delta>=0?'+':'')+result.delta+' pontos · partida registrada';
    finishButton.textContent='Voltar à Arena';finishButton.onclick=cleanup;
    won?SND.win():SND.lose();finishButton.focus();
   }
   const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(finished)cleanup();else showResult()}if(e.key==='Tab'){e.preventDefault();finishButton.focus()}};
   function tick(now){
    const elapsed=now-start;
    while(index+1<frames.length&&frames[index+1].t<=elapsed)index++;
    const frame=frames[index];clock.textContent=Math.floor(frame.t/60000)+':'+String(Math.floor(frame.t/1000)%60).padStart(2,'0');
    frame.u.forEach((u,i)=>{
     const n=nodes[i];n.slot.style.left=(u[0]/1280*100)+'%';n.slot.style.top=(u[1]/800*100)+'%';
     n.fill.style.width=(u[2]/10)+'%';n.slot.classList.toggle('aor-fainted',!u[3]);
     if(u[4]!==n.cast){n.cast=u[4];n.slot.classList.remove('aor-cast');void n.slot.offsetWidth;n.slot.classList.add('aor-cast');SND.cast('normal')}
     n.hp=u[2];
    });
    if(index===frames.length-1)showResult();else raf=requestAnimationFrame(tick);
   }
   finishButton.onclick=showResult;root.append(header,scene,footer,finishButton);
   document.body.append(root);if(root.showPopover){root.popover='manual';root.showPopover()}
   active=cleanup;document.addEventListener('keydown',key,true);root.focus();SND.music('battle');raf=requestAnimationFrame(tick);
  });
 }
 return {play,cancel:()=>active?.()};
})();
