(function(){
'use strict';
const KEY='oakchess_battle_reports_v1',MAX=80,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),number=v=>Math.max(0,Math.round(Number(v)||0)),fmt=v=>number(v).toLocaleString('pt-BR');
let records=[];try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(a))records=a.filter(r=>r&&typeof r.id==='string'&&Array.isArray(r.units)).slice(-MAX)}catch(e){}
let selected=records.at(-1)?.id,metric='damage',side=0,returnFocus=null,pausedHere=false,pending=null,visibleFor=0,quietFor=0,noticeShown=false,stamp=performance.now(),storageError=false;
const metrics={damage:{name:'Dano causado',color:'#e9bf6e'},healing:{name:'Cura realizada',color:'#88d6a3'},taken:{name:'Dano recebido',color:'#e69a8c'},shield:{name:'Escudos absorvidos',color:'#96c9f1'}};
const panel=document.createElement('section');panel.id='battleReports';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Relatórios de batalha');panel.innerHTML='<div class="br-window"><header><div><small>CADERNO DE BATALHAS</small><h2>RELATÓRIO DE BATALHA</h2></div><button data-close aria-label="Fechar relatório">×</button></header><div class="br-layout"><nav class="br-history" aria-label="Batalhas recentes"></nav><article class="br-detail"></article></div><footer></footer></div>';document.body.append(panel);
const notice=document.createElement('aside');notice.id='battleReportNotice';notice.innerHTML='<button data-details aria-label="Abrir relatório desta batalha"><i class="br-notice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M8 3h8v6c0 4-2 6-4 6s-4-2-4-6V3Z" stroke="currentColor" stroke-width="2"/><path d="M8 5H4v3c0 3 2 4 5 4m7-7h4v3c0 3-2 4-5 4M12 15v4m-4 2h8" stroke="currentColor" stroke-width="2"/></svg></i><div class="br-notice-copy"><small></small><b></b><span></span><em>Ver relatório <i aria-hidden="true">→</i></em></div></button><button data-dismiss aria-label="Dispensar resumo">×</button><div class="br-notice-time" aria-hidden="true"><i></i></div>';document.body.append(notice);
function save(){try{localStorage.setItem(KEY,JSON.stringify(records.slice(-MAX)));storageError=false}catch(e){storageError=true}}
function sum(units,key){return units.reduce((v,u)=>v+number(u[key]),0)}
function top(units,key){return units.reduce((best,u)=>!best||number(u[key])>number(best[key])?u:best,null)}
function current(){return records.find(r=>r.id===selected)||records.at(-1)}
function capture(win){
 if(DEMO.on||ARENA_PREVIEW)return;
 const round=G.round||{},record={id:'battle-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),ts:Date.now(),win:!!win,title:typeof stageTxt==='function'&&round.st!=null?stageTxt(round):'Batalha',foe:round.kind==='secret'?'Mewtwo':G.oppName||'Adversário',duration:Math.round((B.t||0)*10)/10,difficulty:G.runDiff||CFG.diff,units:B.units.map(u=>({id:u.id,name:u.name,star:u.star,side:u.side,alive:!!u.alive,damage:number(u._reportDamage),healing:number(u._healingDone),receivedHeal:number(u._healed),taken:number(u._reportTaken),shield:number(u._shieldAbsorbed),kills:number(u._kills)}))};
 records.push(record);records=records.slice(-MAX);selected=record.id;window.BREPORT.lastId=record.id;pending=record;visibleFor=0;quietFor=0;noticeShown=false;notice.classList.remove('show');save();
}
function history(){panel.querySelector('.br-history').innerHTML=records.length?records.slice().reverse().map(r=>'<button data-record="'+esc(r.id)+'" class="'+(r.id===current()?.id?'selected':'')+'"><small>'+new Date(r.ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</small><b>'+esc(r.foe)+'</b><span class="'+(r.win?'win':'loss')+'">'+(r.win?'VITÓRIA':'DERROTA')+' · '+r.duration+'s</span></button>').join(''):'<p>As próximas batalhas serão registradas aqui.</p>'}
function render(){
 history();const record=current(),detail=panel.querySelector('.br-detail');panel.querySelector('footer').textContent=storageError?'Não foi possível salvar estes relatórios no navegador.':'Últimas '+MAX+' batalhas · Escudos são contabilizados em quem absorveu o golpe, não em quem criou o escudo.';
 if(!record){detail.innerHTML='<div class="br-empty"><h3>Sua próxima batalha começa este caderno</h3><p>Após lutar, consulte dano, cura, resistência e escudos das duas equipes.</p></div>';return}
 selected=record.id;const units=record.units.filter(u=>u.side===side),own=record.units.filter(u=>u.side===0),foes=record.units.filter(u=>u.side===1),sorted=units.slice().sort((a,b)=>b[metric]-a[metric]),max=Math.max(1,...units.map(u=>number(u[metric]))),leader=top(own,'damage'),total=sum(own,'damage'),alive=own.filter(u=>u.alive).length;
 const highlights=Object.entries(metrics).map(([key,m])=>{const u=top(own,key),has=u&&u[key]>0;return '<div class="br-highlight" style="--metric:'+m.color+'"><small>'+m.name+'</small><b>'+esc(has?u.name:'Sem registro')+'</b><span>'+fmt(has?u[key]:0)+'</span></div>'}).join('');
 detail.innerHTML='<div class="br-heading"><div><small>'+esc(record.title)+'</small><h3>vs '+esc(record.foe)+'</h3><p>'+record.duration+' segundos · '+(record.difficulty==='hard'?'Difícil':record.difficulty==='easy'?'Fácil':'Normal')+'</p></div><b class="'+(record.win?'win':'loss')+'">'+(record.win?'VITÓRIA':'DERROTA')+'</b></div><div class="br-highlights">'+highlights+'</div><div class="br-reading"><b>Como terminou</b><p>Sua equipe: '+alive+'/'+own.length+' de pé. Adversário: '+foes.filter(u=>u.alive).length+'/'+foes.length+'.'+(leader&&total?' '+esc(leader.name)+' respondeu por '+Math.round(leader.damage/total*100)+'% do dano da sua equipe.':'')+'</p><small>O dano considera PS e escudos efetivamente atingidos, sem contar o excesso após o nocaute. A cura considera apenas PS recuperados.</small></div><div class="br-side"><button data-side="0" aria-pressed="'+(side===0)+'">Sua equipe</button><button data-side="1" aria-pressed="'+(side===1)+'">Adversário</button></div><div class="br-metrics">'+Object.entries(metrics).map(([key,m])=>'<button data-metric="'+key+'" aria-pressed="'+(metric===key)+'">'+m.name+'</button>').join('')+'</div><div class="br-ranking">'+sorted.map(u=>'<div class="br-unit '+(u.alive?'':'fainted')+'"><img src="'+esc(sprStatic(u.id))+'" alt=""><div><b>'+esc(u.name)+' <small>'+'★'.repeat(Math.max(1,Math.min(3,u.star||1)))+'</small></b><div class="br-bar" style="--metric:'+metrics[metric].color+'"><i style="width:'+number(u[metric])/max*100+'%"></i></div><small>'+(u.alive?'Sobreviveu':'Nocauteado')+' · '+u.kills+' nocaute(s)</small></div><strong>'+fmt(u[metric])+'</strong></div>').join('')+'</div><div class="br-totals"><span>Dano: <b>'+fmt(sum(units,'damage'))+'</b></span><span>Cura realizada: <b>'+fmt(sum(units,'healing'))+'</b></span><span>Cura recebida: <b>'+fmt(sum(units,'receivedHeal'))+'</b></span><span>Escudos absorvidos: <b>'+fmt(sum(units,'shield'))+'</b></span></div>';
 detail.querySelectorAll('img').forEach(img=>img.onerror=()=>img.style.visibility='hidden');
}
function open(id){
 if(G.eventModal){toast('Conclua o evento para abrir o relatório.');return}
 if(id&&!records.some(r=>r.id===id)){toast('Este relatório não está entre as últimas '+MAX+' batalhas salvas.');return}
 if(id&&records.some(r=>r.id===id))selected=id;
 if(panel.classList.contains('show')){render();return}
 returnFocus=document.activeElement;pausedHere=!G.paused&&!DEMO.on&&['plan','combat'].includes(G.phase);if(pausedHere)togglePause(true);
 notice.classList.remove('show');pending=null;panel.classList.add('show');render();panel.querySelector('[data-close]').focus();
}
function close(){panel.classList.remove('show');if(pausedHere&&G.paused)togglePause(false);pausedHere=false;if(returnFocus?.isConnected)returnFocus.focus()}
panel.addEventListener('click',e=>{if(e.target===panel||e.target.closest('[data-close]')){close();return}const b=e.target.closest('button');if(!b)return;if(b.dataset.record){selected=b.dataset.record;render()}if(b.dataset.side){side=+b.dataset.side;render()}if(b.dataset.metric){metric=b.dataset.metric;render()}});
panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const buttons=[...panel.querySelectorAll('button')].filter(b=>b.getClientRects().length),first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
notice.querySelector('[data-details]').onclick=()=>open(pending?.id);notice.querySelector('[data-dismiss]').onclick=()=>{pending=null;notice.classList.remove('show')};
function positionReportNotice(){
 const bar=document.getElementById('sysbar'),rect=bar?.getBoundingClientRect();
 notice.style.top=(rect?Math.max(12,rect.bottom+12):64)+'px';
 notice.style.right=(rect?Math.max(12,window.innerWidth-rect.right):14)+'px';
 notice.style.bottom='auto';
}
window.addEventListener('resize',positionReportNotice);document.addEventListener('fullscreenchange',positionReportNotice);
setInterval(()=>{
 const now=performance.now(),elapsed=Math.min(.5,(now-stamp)/1000);stamp=now;
 const blocked=document.hidden||G.paused||G.eventModal||DEMO.on||G.phase!=='plan'||document.querySelector('#eventov,#menu.show,#hist.show,#scores.show,#achievements.show,#achievementNotice.show,#pokedex.show,#battleReports.show,#over.show,#badgeov.show,#vs.show');
 if(!pending){notice.classList.remove('show');quietFor=0;return}
 if(blocked){quietFor=0;notice.classList.remove('show');if(noticeShown)pending=null;return}
 if(!noticeShown){
  quietFor+=elapsed;if(quietFor<2.4)return;
  const team=pending.units.filter(u=>u.side===0),best=top(team,'damage');
  notice.dataset.result=pending.win?'win':'loss';notice.querySelector('small').textContent=pending.win?'Vitória':'Derrota';notice.querySelector('b').textContent=pending.foe;
  notice.querySelector('span').textContent=best&&best.damage?best.name+' · '+fmt(best.damage)+' dano':'Relatório pronto';
  positionReportNotice();noticeShown=true;visibleFor=0;notice.style.setProperty('--remaining',1);notice.classList.add('show');window.POKEBALL_NOTICES?.revealSide(notice);return;
 }
 if(!notice.matches(':hover')&&!notice.contains(document.activeElement))visibleFor+=elapsed;
 notice.style.setProperty('--remaining',Math.max(0,1-visibleFor/7));if(visibleFor>=7){pending=null;notice.classList.remove('show')}
},200);window.BREPORT={open,lastId:null};
if(window.CR){const priorCapture=CR.capture,priorAfter=CR.after;CR.capture=function(win){capture(win);return priorCapture.apply(this,arguments)};CR.after=function(hp,gold){const result=priorAfter.apply(this,arguments),r=records.find(x=>x.id===BREPORT.lastId);if(r){r.hpChange=Math.round(G.hp-hp);r.goldChange=Math.round(G.gold-gold);save()}return result}}
const oldTab=document.getElementById('crTab');if(oldTab)oldTab.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('crPanel')?.classList.remove('show');open(BREPORT.lastId)},true);
const historyHead=document.querySelector('#hist .hhead');if(historyHead){const button=document.createElement('button');button.type='button';button.textContent='Relatórios de batalha';button.onclick=()=>open();historyHead.insertBefore(button,historyHead.lastElementChild)}
const menu=document.querySelector('#tmain .r2');if(menu){const button=document.createElement('div');button.className='ti';button.dataset.act='battleReports';button.setAttribute('role','menuitem');button.tabIndex=-1;button.innerHTML='<i class="tar">▶</i><span class="tl">RELATÓRIOS</span>';button.onclick=e=>{e.stopPropagation();document.getElementById('tpress')?.classList.remove('tools-open');open()};menu.append(button)}
if(typeof T_DESC!=='undefined')T_DESC.battleReports='Compare dano, cura, resistência e escudos das suas últimas batalhas.';
})();
