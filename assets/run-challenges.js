(function(){
'use strict';
const defs={
 flawless:{name:'Defesa impecável',rule:'Na primeira batalha contra Brock, vença sem nenhum Pokémon aliado ser nocauteado.',goal:1,reward:5,short:'Vencer Brock sem perdas'},
 focused:{name:'Equipe focada',rule:'Vença 3 batalhas com no máximo 3 tipos diferentes na arena, até a primeira batalha contra Misty. Cada vitória válida conta; outras batalhas não apagam o progresso.',goal:3,reward:5,short:'Vitórias com até 3 tipos'},
 savings:{name:'Reserva para a jornada',rule:'Tenha 25 de ouro ao mesmo tempo, antes de terminar sua primeira batalha contra Misty. Você pode gastar o ouro normalmente depois de cumprir o objetivo.',goal:25,reward:6,short:'Acumular 25 de ouro'}
};
let nextStep=null,choosing=false,writing=false;
if(!SAVE_KEYS.includes('runChallenge'))SAVE_KEYS.push('runChallenge');
const tracker=document.createElement('button');tracker.id='runChallengeTracker';tracker.type='button';tracker.hidden=true;document.getElementById('stage').append(tracker);
function real(){return !DEMO.on&&!ARENA_PREVIEW}
function persist(){if(writing||!real()||!G.round||G.over||G.phase!=='plan')return;writing=true;try{const s=snapshot();if(choosing)s.G.evDone=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(e){toast('Não foi possível salvar o desafio.')}writing=false}
function state(){return G.runChallenge}
function update(){const s=state(),d=defs[s?.id];tracker.hidden=!real()||!d||G.over||(s.status==='complete'&&s.claimed)||(s.status==='failed'&&s.outcomeSeen);if(!d)return;const status=s.status==='failed'?'Não concluído':s.status==='complete'?(s.claimed?'Concluído · +'+d.reward+' ouro':'Concluído · recompensa pendente'):Math.min(d.goal,s.progress||0)+'/'+d.goal;tracker.innerHTML='<span>DESAFIO</span><b>'+d.name+'</b><small>'+status+'</small>';tracker.dataset.status=s.status;tracker.title=d.rule+' Recompensa: '+d.reward+' de ouro.'}
function offer(info,proceed){
 if(!real()||G.over)return false;
 observeGold();settle();
 if(state()){update();return false}
 // Partidas já em andamento seguem sem uma escolha retroativa.
 if(G.ri!==0){G.runChallenge={id:null,status:'skipped',progress:0};persist();return false}
 nextStep=proceed;choosing=true;
 eventScreen('Desafio opcional','<p>Escolha seu desafio.</p>','challenge');
 clearInterval(EVTEXT.tm);EVTEXT.typing=false;EVTEXT.after=null;
 const descriptions={flawless:['Vença Brock sem nenhum aliado ser nocauteado.','Na primeira batalha contra Brock.'],focused:['Vença 3 batalhas com até 3 tipos diferentes na arena.','Até a primeira batalha contra Misty.'],savings:['Acumule 25 de ouro ao mesmo tempo.','Até o fim da primeira batalha contra Misty.']};
 const cards=Object.entries(defs).map(([id,d],index)=>`<article class="rc-collectible" data-kind="${id}"><button type="button" class="rc-flip" data-challenge="${id}" aria-label="Escolher desafio: ${d.name}"><span class="rc-front"><span class="rc-card-heading"><small>CARTA DE DESAFIO</small><b>${d.name}</b></span><img class="rc-art" src="assets/challenge-art/${id}.png" alt="" draggable="false"><span class="rc-card-copy"><strong>OBJETIVO</strong><span>${descriptions[id][0]}</span><small>${descriptions[id][1]}</small></span><span class="rc-prize"><small>RECOMPENSA</small><b>+${d.reward} ouro</b></span><span class="rc-edition">OAKCHESS · JORNADA <b>00${index+1}/003 ◆</b></span><span class="rc-shine"></span></span><span class="rc-back" aria-hidden="true"></span></button></article>`).join('');
 const root=document.getElementById('eventov');root.classList.add('run-challenge-choice');root.innerHTML='<section class="rc-dialog" role="dialog" aria-modal="true" aria-labelledby="rc-title"><header><h2 id="rc-title">Escolha seu desafio</h2></header><div class="rc-cards">'+cards+'</div><footer><button class="rc-skip" data-challenge="skip">Continuar sem desafio</button></footer></section>';

 const buttons=[...root.querySelectorAll('[data-challenge]')];buttons.forEach((button,index)=>{button.type='button';button.onclick=()=>select(button.dataset.challenge);button.onmouseenter=()=>{EVTEXT.mi=index;evSync();SND.hover()};button.onfocus=()=>{EVTEXT.mi=index;evSync()};button.addEventListener('click',()=>SND.click())});EVTEXT.items=buttons;EVTEXT.mi=0;EVTEXT.onSel=null;evSync();buttons[0].focus();
 G._evDone=false;persist();return true;
}
function select(id){if(!choosing||state()||(!defs[id]&&id!=='skip'))return;G.runChallenge={id:id==='skip'?null:id,status:id==='skip'?'skipped':'active',progress:0,claimed:false};choosing=false;const proceed=nextStep;nextStep=null;closeEvent();G._evDone=false;persist();update();if(proceed)proceed()}
function complete(){const s=state();if(s?.status!=='active')return;s.status='complete';s.completedAt=G.ri;update()}
function observeGold(){const s=state();if(!real()||s?.id!=='savings'||s.status!=='active')return;const best=Math.max(s.progress||0,Math.floor(G.gold||0));if(best!==s.progress){s.progress=Math.min(25,best);if(best>=25)complete();update()}}
function battleEnd(win){
 if(!real())return;observeGold();const s=state(),r=G.round||{};if(!s||s.status!=='active')return;
 const team=B.units.filter(u=>u.side===0);
 if(s.id==='flawless'&&r.kind==='boss'&&r.gym===0){if(win&&team.length&&team.every(u=>u.alive)){s.progress=1;complete()}else s.status='failed'}
 if(s.id==='focused'&&win&&team.length){const types=new Set();for(const u of team)for(const t of u.types||typesOf(u.L,u.star))types.add(t);if(types.size<=3){s.progress=(s.progress||0)+1;if(s.progress>=3)complete()}}
 if(r.kind==='boss'&&r.gym===1&&s.status==='active')s.status='failed';
 update();
}
let outcomeOpen=false,outcomeQuiet=0;
function flyReward(from,count){
 const target=document.getElementById('goldtop');if(!target)return;
 const a=from,b=target.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-fx');
 for(let i=0;i<count;i++){const coin=document.createElement('i');coin.className='challenge-flying-coin';coin.style.left=a.x+'px';coin.style.top=a.y+'px';document.body.append(coin);
 const animation=coin.animate(reduced?[{opacity:1},{opacity:0}]:[{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate('+((x-a.x)*.45-10+i*5)+'px,'+((y-a.y)*.35-70)+'px) scale(1.1)',opacity:1,offset:.45},{transform:'translate('+(x-a.x)+'px,'+(y-a.y)+'px) scale(.45)',opacity:.2}],{duration:reduced?180:700,delay:reduced?0:i*70,easing:'cubic-bezier(.3,.6,.5,1)',fill:'forwards'});
 animation.onfinish=()=>{coin.remove();if(i===count-1){SND.coin();target.classList.remove('up');void target.offsetWidth;target.classList.add('up')}};
 }
}
function settle(){
 const s=state(),d=defs[s?.id];if(!real()||!d||G.over||outcomeOpen||G.phase!=='plan'||G.eventModal||G.paused||document.hidden||document.querySelector('#eventov,#menu.show,#hist.show,#pokedex.show,#battleReports.show,#badgeov.show,#achievementNotice.show')){outcomeQuiet=0;return}
 if(!['complete','failed'].includes(s.status)||s.outcomeSeen||(s.status==='complete'&&s.claimed)||(s.status==='failed'&&s.outcomeSeen)){outcomeQuiet=0;return}
 outcomeQuiet+=.35;if(outcomeQuiet<1.75)return;outcomeQuiet=0;outcomeOpen=true;
 const won=s.status==='complete',overlay=document.createElement('section'),previousFocus=document.activeElement;overlay.id='challengeOutcome';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','challengeOutcomeTitle');
 overlay.innerHTML='<div class="challenge-outcome-card '+(won?'won':'missed')+'"><div class="challenge-outcome-symbol" aria-hidden="true">'+(won?'★':'◇')+'</div><small>DESAFIO DA JORNADA</small><h2 id="challengeOutcomeTitle">'+(won?'Desafio concluído!':'Desafio não cumprido')+'</h2><h3>'+d.name+'</h3><p>'+(won?'Objetivo alcançado. Sua recompensa está pronta.':s.id==='flawless'?'Era preciso vencer a primeira batalha contra Brock sem perder aliados.':'O prazo terminou na primeira batalha contra Misty.')+'</p>'+(won?'<div class="challenge-outcome-prize"><i></i><b>+'+d.reward+' ouro</b></div>':'<span class="challenge-outcome-note">Sua jornada continua normalmente.</span>')+'<button>'+(won?'Receber recompensa':'Continuar a jornada')+'</button></div>';
 document.body.append(overlay);togglePause(true);const button=overlay.querySelector('button');button.focus();button.onmouseenter=()=>SND.hover();let done=false;
 function confirm(){if(done)return;done=true;SND.click();const r=overlay.querySelector('.challenge-outcome-prize')?.getBoundingClientRect();s.outcomeSeen=true;
 if(won&&!s.claimed){s.claimed=true;G.gold+=d.reward;renderHUD();renderShop()}
 persist();update();overlay.remove();outcomeOpen=false;if(G.paused)togglePause(false);if(previousFocus?.isConnected)previousFocus.focus();if(won&&r)flyReward({x:r.left+r.width/2,y:r.top+r.height/2},d.reward);
 }
 button.onclick=confirm;overlay.onkeydown=e=>{e.stopPropagation();if(['Enter',' ','Escape'].includes(e.key)){e.preventDefault();confirm()}if(e.key==='Tab'){e.preventDefault();button.focus()}};
}tracker.onclick=()=>{const s=state(),d=defs[s?.id];if(d)toast(d.rule+' Recompensa: '+d.reward+' de ouro.')};
function decorate(root){const s=state(),d=defs[s?.id];if(!d)return;const box=document.createElement('div');box.className='run-challenge-result';box.innerHTML='<small>DESAFIO DA RUN</small><b>'+d.name+'</b><span>'+(s.status==='complete'?'Concluído'+(s.claimed?' · +'+d.reward+' ouro recebidos':' · Jornada encerrada antes do resgate'):'Não concluído')+'</span>';root.append(box)}
window.RUN_CHALLENGE={offer,select,observeGold,battleEnd,decorate};setInterval(()=>{if(real()){observeGold();if(G.phase==='plan'&&!G.eventModal)settle();update()}else tracker.hidden=true},350);
})();
