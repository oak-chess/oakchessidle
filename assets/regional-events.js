(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let continuation=null,current=null,busy=false,mergePending=false;
if(!SAVE_KEYS.includes('regionEvents'))SAVE_KEYS.push('regionEvents');
function data(){if(!G.regionEvents||typeof G.regionEvents!=='object')G.regionEvents={};return G.regionEvents}
function eventFor(info){if(!info||info.extra||G.retry)return null;if(info.gym===0&&info.rn===2)return 'forest';if(info.gym===0&&info.kind==='boss')return 'quarry';if(info.gym===1&&info.kind==='boss')return 'sea';return null}
function persist(){
 if(DEMO.on||G.over||!G.round)return;
 try{if(SAVE_TM){clearTimeout(SAVE_TM);SAVE_TM=null}const snap=snapshot();snap.G.evDone=false;localStorage.setItem(SAVE_KEY,JSON.stringify(snap))}catch(e){toast('Não foi possível salvar o evento neste navegador.')}
}
function create(id){
 const seed=(G.npcSeed||0)>>>0,candidates=LINES.filter(L=>[10,16,43].includes(L.ids[0])&&G.pool[L.i]>0),line=candidates.length?candidates[seed%candidates.length].i:null;
 const item=['band','helmet','bell','scarf'][seed%4];
 return{step:'choice',ri:G.ri,pokemonLine:line,itemKey:item};
}
const sceneFor=id=>{if(id==='forest'){const species=LINES[current?.record.pokemonLine]?.ids[0];return [10,16,43].includes(species)?'assets/regional-art/forest-'+species+'.png':'assets/route-art/event.png'}if(id==='quarry'&&['helix','dome'].includes(current?.record.choice))return 'assets/regional-art/quarry-'+(current.record.choice==='helix'?138:140)+'.png';return id==='quarry'?'assets/boon-art/scenes/caverna.webp':'assets/boon-art/scenes/lago.webp'};
function button(id,choice,title,note,disabled=false){
 const species=choice==='helix'?138:choice==='dome'?140:choice==='rescue'&&current?LINES[current.record.pokemonLine]?.ids[0]:null;
 const scene=id==='quarry'&&['helix','dome'].includes(choice)?'assets/regional-art/quarry-'+species+'.png':sceneFor(id);
 return '<button class="regional-card" '+(disabled?'disabled ':'')+'onclick="REGION.choose(\''+id+'\',\''+choice+'\')"><img class="regional-card-art" src="'+scene+'" alt="" draggable="false"><span class="regional-card-shade"></span>'+(species?'<span class="regional-species"><img src="'+esc(sprStatic(species))+'" alt="">'+esc(choice==='rescue'?LINES[current.record.pokemonLine].names[0]:choice==='helix'?'Omanyte':'Kabuto')+' ★</span>':'')+'<span class="regional-card-copy"><strong>'+esc(title)+'</strong><span>'+esc(note)+'</span><small>'+(disabled?'INDISPONÍVEL':'')+'</small></span></button>';
}
function panel(title,description,content){
 eventScreen(title,'<p></p>','regional');clearInterval(EVTEXT.tm);EVTEXT.typing=false;EVTEXT.after=null;
 const root=document.querySelector('#eventov');root.classList.add('regional-cards-screen');root.innerHTML='<section class="regional-dialog" role="dialog" aria-modal="true" aria-labelledby="regional-title"><header><h2 id="regional-title">'+title+'</h2><div class="regional-intro">'+description+'</div></header>'+content+'</section>';
 EVTEXT.items=[...root.querySelectorAll('button:not(:disabled)')];EVTEXT.mi=0;EVTEXT.onSel=null;EVTEXT.items.forEach((b,i)=>{b.onmouseenter=()=>{EVTEXT.mi=i;evSync();SND.hover()};b.onfocus=()=>{EVTEXT.mi=i;evSync()};b.addEventListener('click',()=>SND.click())});evSync();EVTEXT.items[0]?.focus();G._evDone=false;persist();
}
function choices(id,record){
 const bench=freeBenchSlot(),room=bench>=0,L=LINES[record.pokemonLine];let title,body,options='';
 if(id==='forest'){
  title='Guardião da floresta';body='<p>Um '+esc(L?L.names[0]:'Pokémon')+' precisa de ajuda.</p>';
  options+=button(id,'rescue','Resgatar · 2 ouro',!room?'Banco cheio':!L?'Nenhum Pokémon disponível':G.gold<2?'Ouro insuficiente':L.names[0]+' ★ no banco',!room||!L||G.gold<2);
  options+=button(id,'help','Libertar','Grátis · +4 PS de treinador');
 }else if(id==='quarry'){
  title='Escavação na pedreira';body='<p>Escolha um fóssil para restaurar.</p><p class="regional-note">A restauração custa 4 de ouro e exige uma vaga no banco.</p>';
  for(const [choice,species,label]of [['helix',138,'Fóssil Hélice'],['dome',140,'Fóssil Domo']]){const target=LINES.find(l=>l.ids[0]===species),available=target&&G.pool[target.i]>0;options+=button(id,choice,label+' · 4 ouro',!room?'Banco cheio':!available?'Espécie indisponível':G.gold<4?'Ouro insuficiente':target.names[0]+' ★ no banco',!room||!available||G.gold<4)}
  options+=button(id,'fragments','Recolher fragmentos','+2 ouro');
 }else{
  title='Tesouro na costa';const item=ITEMBY[record.itemKey];body='<p>Um baú chegou à costa de Cerulean.</p><p class="regional-note">Você pode escolher o ouro encontrado ou pagar pela recuperação do item.</p>';
  options+=button(id,'gold','Guardar moedas','+4 ouro');
  options+=button(id,'item','Recuperar '+item.n+' · 2 ouro',G.gold<2?'Ouro insuficiente':item.d,G.gold<2);
 }
 panel(title,body,'<div class="regional-card-row">'+options+'</div><footer><button class="regional-continue" onclick="REGION.choose(\''+id+'\',\'skip\')">Seguir viagem</button></footer>');
}
function result(id,record){
 const message=record.message||'Você seguiu viagem.';
 panel('Encontro concluído','','<div class="regional-result regional-result-compact"><img class="regional-result-image" src="'+sceneFor(id)+'" alt="" draggable="false"><div><p>'+esc(message)+'</p><button class="regional-continue" onclick="REGION.finish()">Continuar a jornada</button></div></div>');
}
function offer(info,next,surpriseId){
 if(DEMO.on||ARENA_PREVIEW||G.over)return false;
 const id=surpriseId||eventFor(info);if(!id)return false;
 const records=data();if(records[id]?.step==='done')return false;
 const record=records[id]||(records[id]=create(id));
 continuation=next;current={id,record};busy=false;
 if(record.step==='result'&&['rescue','helix','dome'].includes(record.choice))mergePending=true;
 if(record.step==='result')result(id,record);else choices(id,record);return true;
}
function grant(line,cost){
 const slot=freeBenchSlot();if(slot<0||!LINES[line]||G.pool[line]<=0||G.gold<cost)return null;
 G.gold-=cost;G.pool[line]--;const unit=newUnit(line,1);place(unit,{z:'n',i:slot});attachEl(unit,true);mergePending=true;layoutAll();return unit;
}
function choose(id,choice){
 if(busy||!current||id!==current.id||current.record.step!=='choice'||current.record.ri!==G.ri)return;
 const record=current.record;busy=true;let message='Você seguiu viagem sem custo.';
 if(id==='forest'&&choice==='rescue'){
  const unit=grant(record.pokemonLine,2);if(!unit){busy=false;toast('Verifique seu ouro e as vagas do banco.');choices(id,record);return}message=LINES[unit.line].names[0]+' foi resgatado e entrou no banco. Você gastou 2 de ouro.';
 }else if(id==='forest'&&choice==='help'){
  const healed=Math.min(4,Math.max(0,100-G.hp));G.hp+=healed;message='Você libertou o Pokémon e o devolveu à floresta. '+(healed?'Recuperou '+healed+' PS de treinador.':'Sua vida já estava completa.');
 }else if(id==='quarry'&&['helix','dome'].includes(choice)){
  const L=LINES.find(l=>l.ids[0]===(choice==='helix'?138:140)),unit=L&&grant(L.i,4);if(!unit){busy=false;toast('Verifique seu ouro, o banco e a disponibilidade do fóssil.');choices(id,record);return}message=L.names[0]+' foi restaurado e entrou no banco. Você gastou 4 de ouro.';
 }else if(id==='quarry'&&choice==='fragments'){G.gold+=2;message='Os fragmentos minerais renderam 2 de ouro.'}
 else if(id==='sea'&&choice==='gold'){G.gold+=4;message='Você guardou 4 de ouro encontrados no baú.'}
 else if(id==='sea'&&choice==='item'){
  if(G.gold<2){busy=false;choices(id,record);return}G.gold-=2;G.items.push(record.itemKey);message=ITEMBY[record.itemKey].n+' foi recuperado e guardado na mochila. Você gastou 2 de ouro.';
 }else if(choice!=='skip'){busy=false;return}
 record.step='result';record.choice=choice;record.message=message;renderHUD();renderInv();renderShop();result(id,record);
}
function finish(){
 if(!current||current.record.step!=='result')return;
 const next=continuation;current.record.step='done';continuation=null;current=null;busy=false;closeEvent();G._evDone=false;persist();if(next)next();if(!G.eventModal)saveNow();
}
function pending(info){const id=eventFor(info);return !!id&&data()[id]?.step!=='done'}
window.REGION={offer,choose,finish,pending,offerSurprise:(id,next)=>offer(G.round,next,id)};
setInterval(()=>{if(mergePending&&!G.eventModal&&!G.paused&&G.phase==='plan'&&!G.over){mergePending=false;mergeCheck();layoutAll();saveSoon()}},350);
})();
