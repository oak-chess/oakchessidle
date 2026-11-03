/* One active cast at a time; spare mana is kept for a later cast. */
(()=>{
 const timings={bolt:.75,blast:.9,burst:.75,beam:.95,drain:.8,rush:.75,multi:1.05,chain:.95,storm:1.5,heal:.8,field:.85,barrage:1.3,meteor:1.55,buff:.8,barrier:.8};
 function tacticalTooltip(u,m,live){const total=window.IDLE_TACTICS.cooldown(m,u),left=live?window.IDLE_TACTICS.remaining(u,m,B.t):0,shared=live?Math.max(0,(u.skillReadyAt||0)-B.t,(u.castingUntil||0)-B.t,(u.basicAnimationUntil||0)-B.t):0;let text='Recarga individual: '+total.toFixed(1).replace('.',',')+'s',state='idle';if(live){if(u.lastMoveKey===IDLE_TACTICS.key(m)&&B.t<(u.castingUntil||0)){text='Em uso';state='casting'}else if(left>0){text='Recarga: '+left.toFixed(1).replace('.',',')+'s';state='cooldown'}else if(shared>0||u.skillToken?.pending>0){text='Aguarda o lançamento anterior';state='cooldown'}else if(u.mana<u.maxMana){text='Faltam '+Math.ceil(u.maxMana-u.mana)+' de energia';state='mana'}else{text='Disponível · escolha automática';state='ready'}}return '<div class="skill-live-clock '+state+'"><span>'+text+'</span><i><b style="width:'+Math.round((1-Math.min(1,left/total))*100)+'%"></b></i></div>'}
 window.SKILL_RHYTHM={
  duration(move){return (timings[move.k]||.85)+.4},
  tooltip(u,move,index,live){
   const tactical=window.OAK_IDLE_MODE&&window.IDLE_TACTICS;if(tactical)return tacticalTooltip(u,move,live);
   const total=this.duration(move),format=n=>n.toFixed(1).replace('.',',')+'s';
   let label='Intervalo mínimo: '+format(total),progress=1,state='idle';
   if(live&&u.alive){
    const remaining=Math.max(0,(u.skillReadyAt||0)-B.t,(u.basicAnimationUntil||0)-B.t);
    const casting=Math.max(0,(u.castingUntil||0)-B.t),pending=u.skillToken?.pending>0;
    const count=u.moves?.length||1,next=(u.mi||0)%count,last=((u.mi||0)-1+count)%count;
    const isNext=index===next;
    if(casting>0&&u.mi>0&&index===last){label='Em uso · '+format(casting);state='casting';progress=1-casting/(timings[move.k]||.85)}
    else if(remaining>0){label=(isNext?'Próximo · ':'Intervalo compartilhado · ')+format(remaining);state='cooldown';progress=1-Math.min(1,remaining/total)}
    else if(pending){label='Aguardando o golpe chegar';state='cooldown';progress=.9}
    else if(isNext&&u.mana<u.maxMana){label='Próximo · falta '+Math.ceil(u.maxMana-u.mana)+' de mana';state='mana';progress=Math.max(0,u.mana/u.maxMana)}
    else if(isNext){label=u.stun>0?'Próximo · impedido de agir':u.moving?'Próximo · em deslocamento':'Pronto para usar';state='ready'}
    else label='Na sequência · intervalo '+format(total);
   }
   return '<div class="skill-live-clock '+state+'"><span>'+label+'</span><i><b style="width:'+Math.round(Math.max(0,Math.min(1,progress))*100)+'%"></b></i></div>';
  },
  ready(u){return B.t>=(u.skillReadyAt||0)&&B.t>=(u.castingUntil||0)&&B.t>=(u.basicAnimationUntil||0)&&!(u.skillToken?.pending>0)},
  begin(u,mv){
   const life=timings[mv.k]||.85;if(window.OAK_IDLE_MODE)window.IDLE_TACTICS?.commit(u,mv,B.t);
   u.mana=Math.max(0,u.mana-u.maxMana);u.castingUntil=B.t+life;u.skillReadyAt=u.castingUntil+.4;
   u.lock=Math.max(u.lock||0,life);u.skillToken={owner:u,pending:0,units:B.units};
   return u.skillToken;
  },
  launch(token){if(token)token.pending++},
  arrive(token){if(!token)return;token.pending=Math.max(0,token.pending-1);if(token.units===B.units)token.owner.skillReadyAt=Math.max(token.owner.skillReadyAt||0,B.t+.3)},
  status(u){
   const charges=Math.min(2,Math.floor(u.mana/u.maxMana)),remaining=Math.max(0,(u.skillReadyAt||0)-B.t);
   return {charges,remaining,casting:B.t<(u.castingUntil||0),waiting:charges>0&&!this.ready(u)};
  }
 };
 const style=document.createElement('style');style.textContent='.unit .mnb{position:relative}.unit .mnb::after{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px solid #ecfaffbb}.unit.skill-wait .mnb i{background:linear-gradient(#e8c87b,#b88d3d)}.unit.skill-casting .mnb{box-shadow:0 0 4px #91dfff}.skill-live-clock{margin-top:7px;color:#aac9d9;font:10px/14px "Trebuchet MS",sans-serif;font-variant-numeric:tabular-nums}.skill-live-clock>i{display:block;height:3px;background:#0b1d30;margin-top:4px;overflow:hidden}.skill-live-clock>i>b{display:block;height:100%;background:#7896ae}.skill-live-clock.cooldown{color:#f4d27e}.skill-live-clock.cooldown>i>b{background:#e8ba54}.skill-live-clock.casting{color:#8fe0ff}.skill-live-clock.casting>i>b,.skill-live-clock.mana>i>b{background:#65bbf1}.skill-live-clock.ready{color:#a7e7b8}.skill-live-clock.ready>i>b{background:#7ac992}';document.head.appendChild(style);
})();
