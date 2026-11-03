(function(){
'use strict';
if(!SAVE_KEYS.includes('alternativeRoutes'))SAVE_KEYS.push('alternativeRoutes');
let continuation=null,current=null,busy=false;
const defs={elite:{name:'Confronto de elite',tag:'RISCO E RECOMPENSA',text:'Adversário: +20% de vida e +15% de ataque e habilidades.',reward:'Vitória: +4 ouro extra.',color:'#ebae77'},shop:{name:'Parada no Poké Mart',tag:'SUPRIMENTOS',text:'Um equipamento por 2 ouro.',reward:'Uma compra por visita.',color:'#9edceb'},event:{name:'Encontro em Kanto',tag:'EXPLORAÇÃO',text:'Uma pausa antes da batalha.',reward:'Até +6 PS ou +3 ouro.',color:'#bbdda0'}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function real(){return !DEMO.on&&!ARENA_PREVIEW&&!G.over}
function records(){return G.alternativeRoutes||(G.alternativeRoutes={})}
function eligible(info){return info&&!info.extra&&!G.retry&&info.gym>=1&&info.gym<8&&info.rn===1&&info.kind==='trainer'}
function persist(){if(!real())return;try{if(SAVE_TM){clearTimeout(SAVE_TM);SAVE_TM=null}const s=snapshot();s.G.evDone=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(e){toast('Não foi possível salvar a rota neste navegador.')}}
function panel(title,subtitle,body){
 eventScreen(title,'<p></p>','routes');clearInterval(EVTEXT.tm);EVTEXT.typing=false;EVTEXT.after=null;
 const root=document.getElementById('eventov');root.classList.add('route-choice');root.innerHTML='<section class="route-dialog" role="dialog" aria-modal="true" aria-labelledby="route-title"><header><h2 id="route-title">'+title+'</h2><p>'+subtitle+'</p></header>'+body+'</section>';
 const buttons=[...root.querySelectorAll('button:not(:disabled)')];EVTEXT.items=buttons;EVTEXT.mi=0;EVTEXT.onSel=null;
 buttons.forEach((b,i)=>{b.onmouseenter=()=>{EVTEXT.mi=i;evSync();SND.hover()};b.onfocus=()=>{EVTEXT.mi=i;evSync()};b.addEventListener('click',()=>SND.click())});evSync();buttons[0]?.focus();G._evDone=false;persist();return root;
}
function choice(){
 const cards=Object.entries(defs).map(([id,d])=>'<button class="route-card" data-route="'+id+'" style="--route-accent:'+d.color+'"><img src="assets/route-art/'+id+(id==='elite'?'.webp':'.png')+'" alt="" draggable="false"><span class="route-shade"></span><span class="route-label">'+d.tag+'</span><span class="route-copy"><strong>'+d.name+'</strong><span>'+d.text+'</span><b>'+d.reward+'</b></span></button>').join('');
 const root=panel('Escolha seu caminho','Antes da próxima batalha.','<div class="route-cards">'+cards+'</div><footer><button class="route-secondary" data-route="normal">Seguir viagem</button></footer>');
 root.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>choose(b.dataset.route));
}
function visit(){
 const r=current.record;if(r.choice==='shop'){
 const offers=r.items.map(k=>{const it=ITEMBY[k];return '<button class="route-card route-shop-card" data-item="'+k+'" style="--route-accent:#e6cf91" '+(G.gold<2?'disabled':'')+'><img src="assets/route-art/shop.png" alt="" draggable="false"><span class="route-shade"></span><span class="route-shop-item"><img src="assets/pokeapi/sprites/items/'+it.s+'.png" alt="'+esc(it.n)+'" draggable="false"></span><span class="route-copy"><strong>'+esc(it.n)+'</strong><span>'+esc(it.d)+'</span><b><img src="assets/pokeapi/sprites/items/amulet-coin.png" alt=""> 2 ouro</b>'+(G.gold<2?'<small>OURO INSUFICIENTE</small>':'')+'</span></button>'}).join('');
 const root=panel('Poké Mart de viagem','Ouro: '+G.gold+' · Escolha um equipamento.','<div class="route-cards route-shop-cards">'+offers+'</div><footer><button class="route-secondary" data-leave>Sair da loja</button></footer>');
 root.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>act(b.dataset.item));root.querySelector('[data-leave]').onclick=()=>act('leave');
 }else if(r.choice==='event'){
 const recovered=Math.min(6,Math.max(0,100-G.hp));
 const root=panel('Uma pausa na jornada','O que sua equipe vai fazer?','<div class="route-cards route-rest-cards"><button class="route-card route-rest-card" data-action="rest" style="--route-accent:#b8dfa3"><img src="assets/route-art/event.png" alt="Pikachu e Eevee descansando na floresta" draggable="false"><span class="route-shade"></span><span class="route-action-symbol" aria-hidden="true">♡</span><span class="route-copy"><strong>Descansar</strong><span>Vida atual: '+G.hp+'/100</span><b>'+(recovered?'Recupera '+recovered+' PS':'Vida completa')+'</b></span></button><button class="route-card route-explore-card" data-action="explore" style="--route-accent:#f0d18a"><img src="assets/route-art/event.png" alt="Trilha na Floresta de Viridian" draggable="false"><span class="route-shade"></span><span class="route-action-symbol" aria-hidden="true">◇</span><span class="route-copy"><strong>Explorar a trilha</strong><span>Procure moedas pelo caminho.</span><b>+3 ouro</b></span></button></div>');
 root.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(b.dataset.action));
 }
}
function result(){const message=current?.record.message;finish();if(message)toast(message)}
function offer(info,next,surprise){
 if(!real()||(!surprise&&!eligible(info)))return false;const all=records(),key=String(G.ri),r=all[key]||(all[key]={step:'choice',ri:G.ri,items:['band','helmet','bell','scarf'].filter((_,i)=>i!==((G.npcSeed||0)+info.gym)%4)});
 if(r.step==='done')return false;current={key,record:r};continuation=next;busy=false;if(surprise&&r.step==='choice'){choose(surprise);return true}if(r.step==='visit')visit();else if(r.step==='result')result();else choice();return true;
}
function choose(id){if(busy||!current||current.record.step!=='choice'||(!defs[id]&&id!=='normal'))return;busy=true;const r=current.record;r.choice=id;if(id==='shop'||id==='event'){r.step='visit';busy=false;visit()}else{r.step='result';r.message=id==='elite'?'O próximo adversário terá +20% de vida e +15% de ataque e poder de habilidade. Se vencer, você recebe 4 de ouro extra.':'Você segue para a batalha sem modificar o adversário.';result()}}
function act(action){
 if(busy||!current||current.record.step!=='visit')return;const r=current.record;busy=true;
 if(r.choice==='shop'){
 if(action==='leave')r.message='Você deixou o Poké Mart e seguiu viagem.';
 else if(r.items.includes(action)&&G.gold>=2){G.gold-=2;G.items.push(action);r.item=action;r.message=ITEMBY[action].n+' foi para sua mochila. Você gastou 2 de ouro.'}
 else{busy=false;visit();return}
 }else if(r.choice==='event'){
 if(action==='rest'){const n=Math.min(6,Math.max(0,100-G.hp));G.hp+=n;r.message=n?'A equipe descansou. Você recuperou '+n+' PS de treinador.':'Sua vida já estava completa. A equipe está pronta para seguir.'}
 else if(action==='explore'){G.gold+=3;r.message='A exploração da trilha rendeu 3 de ouro.'}else{busy=false;return}
 }else{busy=false;return}
 r.action=action;r.step='result';renderHUD();renderInv();renderShop();result();
}
function finish(){if(!current||current.record.step!=='result')return;current.record.step='done';const next=continuation;current=null;continuation=null;busy=false;closeEvent();G._evDone=false;persist();if(next)next();if(!G.eventModal)saveNow();}
function combat(foes){if(!real())return;const r=records()[String(G.ri)];if(r?.choice!=='elite'||r.step!=='done'||r.resolved)return;for(const u of foes){u.maxHp*=1.2;u.hp=u.maxHp;u.atk*=1.15;u.spell*=1.15}toast('Confronto de elite: vença para receber +4 de ouro extra.');}
function battleEnd(win){if(!real())return;const r=records()[String(G.ri)];if(r?.choice!=='elite'||r.step!=='done'||r.resolved)return;r.resolved=true;r.won=win;if(win){G.gold+=4;toast('Confronto de elite vencido! +4 de ouro extra.')}}
window.ROUTES={offer,combat,battleEnd,offerSurprise:(id,next)=>offer(G.round,next,id)};
})();
