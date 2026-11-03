/* Read-only combat HUD, using the same effective counters as battle reports. */
(()=>{
 'use strict';
 const host=document.getElementById('stage');if(!host)return;
 const panel=document.createElement('aside');panel.id='liveBattleStats';panel.hidden=true;panel.setAttribute('aria-label','Estatísticas da batalha ao vivo');
 panel.innerHTML='<header><div><small>AO VIVO</small><b>Batalha</b></div><button type="button" data-collapse aria-label="Recolher estatísticas" aria-expanded="true">−</button></header><div class="lbs-content"><nav aria-label="Estatística"><button data-metric="damage" class="on">Dano</button><button data-metric="healing">Cura</button><button data-metric="shield">Escudo</button><button data-metric="life">Vida</button></nav><div class="lbs-versus"><div><b>Sua equipe</b><span data-total="0">0</span></div><i>VS</i><div><b>Adversário</b><span data-total="1">0</span></div></div><div class="lbs-teams"><div data-team="0"></div><div data-team="1"></div></div><footer>Dano efetivo · vida e escudo ao vivo</footer></div>';
 host.append(panel);
 let metric='damage',last=0,roster='',collapsed=false;
 try{collapsed=localStorage.getItem('oakchess_live_stats_collapsed')==='1'}catch{}
 const rows=new Map(),format=n=>Math.max(0,Math.round(Number(n)||0)).toLocaleString('pt-BR');
 function syncCollapsed(){panel.classList.toggle('collapsed',collapsed);const b=panel.querySelector('[data-collapse]');b.textContent=collapsed?'+':'−';b.setAttribute('aria-expanded',String(!collapsed));b.setAttribute('aria-label',collapsed?'Expandir estatísticas':'Recolher estatísticas')}
 syncCollapsed();
 panel.addEventListener('click',e=>{
  if(e.target.closest('[data-collapse]')){collapsed=!collapsed;syncCollapsed();try{localStorage.setItem('oakchess_live_stats_collapsed',collapsed?'1':'0')}catch{}return}
  const button=e.target.closest('[data-metric]');if(button){metric=button.dataset.metric;panel.querySelectorAll('[data-metric]').forEach(b=>b.classList.toggle('on',b===button));panel.dataset.metric=metric;last=0}
 });
 function value(u){return metric==='healing'?u._healingDone||0:metric==='shield'?u._shieldAbsorbed||0:metric==='life'?Math.max(0,u.hp):u._reportDamage||0}
 function build(){
  rows.clear();panel.querySelectorAll('[data-team]').forEach(el=>el.replaceChildren());
  for(const u of B.units){
   const row=document.createElement('div');row.className='lbs-unit';
   row.innerHTML='<div class="lbs-portrait"><img alt="" draggable="false"></div><div class="lbs-unit-info"><div class="lbs-label"><b></b><span></span></div><div class="lbs-value-track"><i></i></div><div class="lbs-health"><i class="lbs-health-fill"></i><i class="lbs-shield-fill"></i></div><small class="lbs-vitals"></small></div>';
   const img=row.querySelector('img');img.src=sprStatic(u.id);img.onerror=()=>{img.onerror=null;img.src=sprFront(u.id)};
   row.querySelector('.lbs-label b').textContent=u.name;row.title=u.name;
   panel.querySelector('[data-team="'+u.side+'"]').append(row);
   rows.set(u.key,{row,value:row.querySelector('.lbs-label span'),bar:row.querySelector('.lbs-value-track i'),hp:row.querySelector('.lbs-health-fill'),shield:row.querySelector('.lbs-shield-fill'),vitals:row.querySelector('.lbs-vitals'),lastHp:u.hp,lastHeal:u._healed||0});
  }
 }
 window.LIVE_BATTLE_STATS={update(now){
  const show=!!B.on&&!DEMO.on&&G.phase==='combat'&&!G.over;
  panel.hidden=!show;if(!show)return;
  if(now-last<100)return;last=now;
  const signature=B.units.map(u=>u.key).join('|');if(signature!==roster){roster=signature;build()}
  if(collapsed)return;
  const count=Math.max(1,...[0,1].map(side=>B.units.filter(u=>u.side===side).length)),room=Math.max(1,host.clientHeight-panel.offsetTop-162),rowHeight=Math.min(56,Math.floor(room/count));panel.style.setProperty('--lbs-count',count);panel.style.setProperty('--lbs-row-height',rowHeight+'px');panel.classList.toggle('dense',rowHeight<50);
  const maximum=Math.max(1,...B.units.map(value));
  for(const side of [0,1]){
   const team=B.units.filter(u=>u.side===side);
   const total=team.reduce((sum,u)=>sum+value(u),0);panel.querySelector('[data-total="'+side+'"]').textContent=format(total);
   team.forEach(u=>{
    const r=rows.get(u.key);if(!r)return;
    const amount=value(u),hp=Math.max(0,u.hp),shield=u.alive?Math.max(0,u.shield||0):0,pct=Math.max(0,Math.min(100,hp/u.maxHp*100));
    r.value.textContent=format(amount);r.bar.style.width=(amount/maximum*100)+'%';
    r.hp.style.width=pct+'%';r.hp.style.background=pct<30?'#e47f73':pct<60?'#e4c771':'#7cce9e';
    r.shield.style.width=(shield?Math.min(55,shield/(u.maxHp+shield)*100):0)+'%';r.shield.style.right=(100-pct)+'%';
    r.vitals.textContent=format(hp)+(shield?' +'+format(shield)+' esc.':'')+' / '+format(u.maxHp);
    r.row.classList.toggle('fainted',!u.alive);r.row.classList.toggle('healing',(u._healed||0)>r.lastHeal);r.row.classList.toggle('damaged',hp<r.lastHp);
    r.row.title=u.name+' · Vida '+format(hp)+'/'+format(u.maxHp)+' · Escudo atual '+format(shield)+' · Dano '+format(u._reportDamage)+' · Cura '+format(u._healingDone)+' · Escudo absorvido '+format(u._shieldAbsorbed);
    r.lastHp=hp;r.lastHeal=u._healed||0;
   });
  }
  panel.querySelector('footer').textContent=G.paused?'Batalha pausada':B.over?'Batalha encerrada':metric==='shield'?'Escudo absorvido · azul = escudo atual':metric==='healing'?'Cura realizada · barras mostram a vida atual':'Dano efetivo · vida e escudo ao vivo';
 }};
})();
