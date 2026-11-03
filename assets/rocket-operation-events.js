/* Persistent one-room decisions. The host owns navigation, combat and inventory. */
(()=>{
'use strict';
const definitions={
 laboratory:{name:'Laboratório Rocket',icon:'⚗',text:'Liberte um Pokémon experimental com duas estrelas ou recupere dois equipamentos.'},
 employee:{name:'Funcionário disfarçado',icon:'◇',text:'Escolte um funcionário por duas vitórias para receber um cartão e acesso facilitado à segurança.'},
 convoy:{name:'Comboio de transporte',icon:'▣',text:'Vença uma escolta reforçada. Ganhe 10 ouro, 3 XP e escolha um entre três Pokémon presos.'},
 research:{name:'Arquivo de pesquisas',icon:'⌕',text:'Escolha uma linha da equipe: as próximas três lojas terão uma cópia garantida enquanto houver estoque.'},
 training:{name:'Sala de treinamento',icon:'★',text:'Escolha 6 XP ou uma cópia básica de uma linha da sua equipe.'},
 trap:{name:'Armadilha de segurança',icon:'!',text:'Pague 4 ouro para desativar ou enfrente os guardas, aumentando o alerta em 1.'},
 blackmarket:{name:'Mercado clandestino',icon:'₽',text:'Compre uma cópia básica de um aliado por seu custo normal mais 3 ouro.'},
 locked:{name:'Depósito trancado',icon:'▣',text:'Use um cartão de acesso ou arrombe com +2 alerta. Escolha um equipamento especial.'},
 intercept:{name:'Comunicação interceptada',icon:'⌘',text:'Revele os próximos três caminhos e receba uma oportunidade de evitar uma patrulha sem recompensa.'}
};
function routes(shuffle){
 const deck=shuffle(Object.keys(definitions)),out=[];
 for(let sector=0;sector<10;sector++){
  const main=deck[sector%deck.length],other=deck[(sector+3)%deck.length],extra=deck[(sector+6)%deck.length];
  out.push(['patrol','cells'],[main,other],['cells','officer'],['shelter',extra],['shop']);
 }
 out[48]=['shop'];out[49]=['boss'];return out;
}
function create(c){
 const {state,save,panel,complete,rescue,plan,close,random,shuffled,esc,sprite}=c;
 const cards=()=>state().keycards||0;
 const data=()=>{const t=state();return t.eventData||(t.eventData={})};
 const baseLine=line=>LINES[line]?.from??line;
 function teamLines(){return [...new Set(allUnits().map(u=>baseLine(u.line)))].filter(i=>LINES[i]&&!LINES[i].boss&&LINES[i].ids[0]<=151&&LINES[i].ids[0]!==151)}
 function stock(){return Object.keys(ITEMBY).filter(k=>['scope','vest','leftovers','sash','specs','helmet','bell','scarf','band'].includes(k))}
 function itemOptions(){const d=data();if(!d.items)d.items=shuffled(stock()).slice(0,3);save(true);return d.items}
 function scene(title,text,html='',actions=[]){
  const root=panel(title,text,html,actions);root.classList.add('rop-special-event');
  const art={laboratory:trainerUrl('scientist'),employee:trainerUrl('scientist'),research:'assets/mode-art/rocket-terminal.svg',training:sprite(66),trap:trainerUrl('rocketgrunt'),blackmarket:trainerUrl('gentleman'),locked:itemUrl('choice-band'),intercept:'assets/mode-art/rocket-terminal.svg',terminal:'assets/mode-art/rocket-terminal.svg'}[state().room];
  if(art&&!root.querySelector('.rop-event-options,.rop-item-options')){const visual=document.createElement('div');visual.className='rop-event-visual';visual.innerHTML='<i></i><img src="'+art+'" alt=""><span>R</span>';root.querySelector('.rop-body').prepend(visual)}
  return root;
 }
 function done(){const d=data();if(d.claimed)return;d.claimed=true;complete()}
 function receive(line,purchased=false,cost=0){
  const d=data();if(d.claimed||!LINES[line])return;
  if(purchased&&(G.gold<cost||G.pool[line]<=0)){toast(G.gold<cost?'Ouro insuficiente.':'Essa linha está sem estoque.');return}
  const slot=freeBenchSlot(),merging=allUnits().filter(u=>u.line===line&&u.star===1).length>=2;
  if(slot<0&&!merging){d.pendingLine=line;save(true);scene('Abra uma vaga no banco','A escolha continua reservada. Organize sua equipe e retorne ao evento.','',[{label:'Organizar banco',run:()=>{close();G.eventModal=false;renderHUD()}},{label:'Voltar às opções',secondary:true,run:()=>{delete d.pendingLine;room()}}]);return}
  if(purchased)G.gold-=cost;
  G.pool[line]=Math.max(0,G.pool[line]-1);const u=newUnit(line,1);u.dexPurchased=purchased;
  if(purchased){window.PDEX?.purchased(u);window.ACH?.purchase(u)}
  if(slot>=0){place(u,{z:'n',i:slot});attachEl(u,true)}else G.pending.push(u);
  d.claimed=true;mergeCheck();renderInv();layoutAll();complete();
 }
 function chooseLine(title,text,onPick,purchased=false){
  const d=data();if(!d.lines)d.lines=teamLines();save(true);
  const lines=d.lines.filter(i=>LINES[i]);
  const root=scene(title,text,'<div class="rop-event-options">'+lines.map(i=>{const l=LINES[i],price=l.c+3,disabled=purchased&&(G.gold<price||G.pool[i]<=0);return '<button type="button" data-line="'+i+'" '+(disabled?'disabled':'')+'><img src="'+sprite(l.ids[0])+'" alt=""><b>'+esc(l.names[0])+'</b><small>'+(purchased?(G.pool[i]<=0?'Sem estoque':price+' ouro · cópia básica'):'Cópia básica · ★')+'</small></button>'}).join('')+'</div>'+(!lines.length?'<p>Sua equipe está vazia. Você ainda pode escolher outra recompensa ou seguir.</p>':''),[{label:purchased?'Seguir sem comprar':'Voltar às opções',secondary:true,run:purchased?done:()=>{delete d.lines;room()}}]);
  root.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>{if(b.disabled||!root.isConnected)return;onPick(+b.dataset.line)});
 }
 function equipment(title,count=1){
  const d=data(),offers=itemOptions();const root=scene(title,'Escolha um equipamento. '+(count===2?'Você receberá duas cópias do escolhido.':'O item irá para a mochila.'),'<div class="rop-item-options">'+offers.map(k=>'<button type="button" data-gear="'+k+'"><img src="'+itemUrl(ITEMBY[k].s)+'" alt=""><b>'+esc(ITEMBY[k].n)+'</b><small>'+esc(ITEMBY[k].d)+'</small></button>').join('')+'</div>');
  root.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>{if(d.claimed||!root.isConnected||!offers.includes(b.dataset.gear))return;for(let i=0;i<count;i++)G.items.push(b.dataset.gear);renderInv();done()});
 }
 function freePokemon(star=1){
  const t=state(),d=data();if(!d.specimen){const pool=LINES.filter(l=>!l.boss&&l.ids[0]<=151&&l.c<=3&&l.ids[0]!==151);const l=shuffled(pool)[0];d.specimen={id:l.ids[0],star,shiny:random()<.03}}
  t.pendingRescue={...d.specimen};t.status='rescue';save(true);rescue();
 }
 function startGuards(){const t=state();data().fighting=true;t.status='plan';t.enemy=null;save(true);plan()}
 function room(){
  const t=state(),d=data();if(d.claimed)return true;
  if(d.fighting){plan();return true}
  // Subchoices persist independently of the modal and cannot be rerolled with F5.
  if(d.view==='items'){equipment(ROOMS_TITLE(t.room),t.room==='laboratory'?2:1);return true}
  if(d.view==='copy'){chooseLine('Reforço para sua equipe','A cópia gratuita não registra uma compra na Pokédex.',i=>receive(i));return true}
  if(d.view==='focus'){chooseFocus();return true}
  if(d.view==='convoy'){convoyChoice();return true}
  if(t.room==='laboratory'){
   scene('Laboratório Rocket','Experimentos foram interrompidos. Você pode ajudar o Pokémon ou recolher os equipamentos.','<p>O Pokémon experimental entra como resgate com duas estrelas. Equipamentos: duas cópias de um item escolhido.</p>',[{label:'Libertar Pokémon experimental · ★★',run:()=>freePokemon(2)},{label:'Recuperar equipamentos',secondary:true,run:()=>{d.view='items';save(true);room()}}]);
  }else if(t.room==='employee'){
   if(t.escort){scene('Funcionário em segurança','Você já está escoltando um funcionário. Ele revela uma passagem protegida.','<p>Reduza o alerta em 1 e continue a escolta atual.</p>',[{label:'Usar passagem · −1 alerta',run:()=>{c.alertBy(-1);done()}}]);return true}
   scene('Funcionário disfarçado','“Sou da manutenção. Você pode me ajudar a sair?”','<div class="rop-facts"><div><small>OBJETIVO DA ESCOLTA</small><b>Vencer 2 batalhas</b><span>Derrotas não apagam suas vitórias.</span></div><div><small>AO CONCLUIR</small><b>1 cartão de acesso</b><span>Terminais passam a reduzir 3 de alerta.</span></div></div><p class="rop-scene-note">Ao aceitar, você também descobre onde estão as próximas lojas.</p>',[{label:'Escoltar funcionário',run:()=>{t.escort={left:2};t.shopIntel=true;done()}},{label:'Pedir rota segura',detail:'Reduza o alerta em 1 e avance sem iniciar uma escolta.',secondary:true,run:()=>{c.alertBy(-1);done()}}]);
  }else if(t.room==='research'){
   if(!teamLines().length){scene('Arquivo de pesquisas','Não há Pokémon na sua equipe para pesquisar.','',[{label:'Recuperar verba · +4 ouro',run:()=>{G.gold+=4;done()}}]);return true}
   scene('Arquivo de pesquisas','Direcione a busca de cópias para uma linha da sua equipe.','<p>Uma cópia básica garantida nas ofertas de cada uma das próximas três visitas à loja, incluindo renovações enquanto houver estoque. Uma pesquisa nova substitui a anterior. Não concede cópias nem registros gratuitamente.</p>',[{label:'Escolher linha da equipe',run:()=>{d.view='focus';save(true);chooseFocus()}},{label:'Seguir sem pesquisar',secondary:true,run:done}]);
  }else if(t.room==='training'){
   scene('Sala de treinamento','Escolha como desenvolver a equipe.','<p>Receba 6 XP para aumentar a capacidade da arena ou uma cópia básica de um aliado para ajudar na evolução. A cópia gratuita conta como vista, sem comprovante de compra.</p>',[{label:'Treinar equipe · +6 XP',run:()=>{addXp(6);done()}},{label:'Receber cópia de um aliado',secondary:true,run:()=>{d.view='copy';save(true);room()}}]);
  }else if(t.room==='trap'){
   const root=scene('Armadilha de segurança','As portas travaram e uma patrulha se aproxima.','<p>Pague 4 ouro para desligar o sistema ou enfrente os guardas com +1 alerta. Vitória contra os guardas: 6 ouro e 2 XP. Derrota causa dano normal e exige revanche.</p>',[{label:'Desativar sistema · 4 ouro',run:()=>{if(G.gold<4)return;G.gold-=4;done()}},{label:'Enfrentar os guardas · +1 alerta',secondary:true,run:()=>{c.alertBy(1);startGuards()}}]);root.querySelector('[data-rop-action="0"]').disabled=G.gold<4;
  }else if(t.room==='blackmarket'){
   chooseLine('Mercado clandestino','Escolha uma cópia básica de um aliado. Preço: custo normal +3 ouro. Esta compra registra na Pokédex.',i=>receive(i,true,LINES[i].c+3),true);
  }else if(t.room==='locked'){
   if(d.unlocked){d.view='items';save(true);equipment('Depósito aberto');return true}
   const root=scene('Depósito trancado','A fechadura exige um cartão de acesso.','<p>Cartões disponíveis: <b>'+cards()+'</b>. Usar cartão consome uma unidade. Arrombar aumenta o alerta em 2. Ambas as opções liberam a escolha de um equipamento especial.</p>',[{label:'Usar cartão de acesso',run:()=>{if(cards()<1)return;t.keycards--;d.unlocked=true;d.view='items';save(true);room()}},{label:'Arrombar · +2 alerta',secondary:true,run:()=>{c.alertBy(2);d.unlocked=true;d.view='items';save(true);room()}}]);root.querySelector('[data-rop-action="0"]').disabled=cards()<1;
  }else if(t.room==='intercept'){
   const upcoming=t.routes.slice(t.step+1,t.step+4);scene('Comunicação interceptada','“Reforços a caminho. Mantenham os corredores vigiados!”','<p>Próximos caminhos:</p><ol class="rop-intel">'+upcoming.map((r,i)=>'<li><b>Etapa '+(t.step+i+2)+'</b> · '+r.map(c.roomName).map(esc).join(' / ')+'</li>').join('')+'</ol><p>Você poderá evitar uma patrulha comum à sua escolha, sem ouro nem XP. Não permite evitar oficiais, celas, comboios ou Giovanni. Só é possível guardar uma oportunidade.</p>',[{label:'Guardar informações',run:()=>{t.revealedThrough=Math.max(t.revealedThrough||0,t.step+3);t.bypass=1;done()}}]);
  }else if(t.room==='terminal'){
   const reduction=t.employeeAccess?3:2;scene('Terminal de segurança','Acesse as câmeras, copie um cartão ou localize suprimentos.','<p>Cartões abrem depósitos trancados sem aumentar o alerta.'+(t.employeeAccess?' O funcionário liberou acesso ampliado: −3 alerta.':'')+'</p>',[{label:'Desativar câmeras · −'+reduction+' alerta',run:()=>{c.alertBy(-reduction);done()}},{label:'Copiar cartão de acesso · +1',secondary:true,run:()=>{t.keycards=cards()+1;done()}},{label:'Localizar equipamento',secondary:true,run:()=>{d.view='items';save(true);equipment('Suprimentos localizados')}}]);
  }else return false;
  return true;
 }
 function ROOMS_TITLE(id){return id==='laboratory'?'Equipamentos do laboratório':'Equipamento especial'}
 function chooseFocus(){
  const d=data();if(!d.lines)d.lines=teamLines();save(true);const root=scene('Escolha a linha pesquisada','As próximas três lojas terão uma cópia básica garantida, enquanto houver estoque.','<div class="rop-event-options">'+d.lines.map(i=>'<button type="button" data-focus="'+i+'"><img src="'+sprite(LINES[i].ids[0])+'" alt=""><b>'+esc(LINES[i].names[0])+'</b></button>').join('')+'</div>',[{label:'Voltar',secondary:true,run:()=>{d.view=null;room()}}]);
  root.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{if(!root.isConnected||d.claimed)return;state().research={line:+b.dataset.focus,left:3};done()});
 }
 function convoyChoice(){
  const t=state(),d=data();if(!d.prisoners){d.prisoners=shuffled(LINES.filter(l=>!l.boss&&l.ids[0]<=151&&l.ids[0]!==151&&l.c<=3)).slice(0,3).map(l=>({id:l.ids[0],star:1,shiny:random()<.03}));save(true)}
  const root=scene('Comboio libertado','Escolha qual Pokémon acompanhará o resgate. Os demais serão encaminhados para fora da base.','<div class="rop-event-options">'+d.prisoners.map((p,i)=>'<button type="button" data-prisoner="'+i+'"><img src="'+sprite(p.id,p.shiny)+'" alt=""><b>'+esc(LINES.find(l=>l.ids[0]===p.id).names[0])+(p.shiny?' ✦':'')+'</b><small>★</small></button>').join('')+'</div>');
  window.PDEX?.observe(d.prisoners.map(p=>({line:LINES.find(l=>!l.boss&&l.ids[0]===p.id).i,star:1,shiny:p.shiny})),'rocket:comboio');
  root.querySelectorAll('[data-prisoner]').forEach(b=>b.onclick=()=>{if(!root.isConnected||d.claimed)return;const index=+b.dataset.prisoner;if(!d.othersProtected){d.prisoners.forEach((p,i)=>{if(i!==index){t.rescued.push({...p,help:false,step:t.step});t.protected++}});d.othersProtected=true}t.pendingRescue={...d.prisoners[index]};t.status='rescue';save(true);rescue()});
 }
 function won(){
  const t=state();if(t.escort){t.escort.left--;if(t.escort.left<=0){t.escort=null;t.keycards=cards()+1;t.employeeAccess=true;toast('Escolta concluída! +1 cartão; terminais com acesso ampliado.')}}
  if(t.room==='convoy'){const d=data();d.fighting=false;d.view='convoy';t.status='room';save(true);convoyChoice();return true}return false;
 }
 function shopOpen(){const t=state();t.storeFocus=null;if(t.research?.left>0){t.storeFocus=t.research.line;t.research.left--}save(true)}
 function biasShop(){
  const t=state(),line=t.storeFocus;if(!Number.isInteger(line)||!LINES[line]||G.pool[line]<=0||G.shop.some(x=>x?.line===line))return;
  const old=G.shop[0];if(old)G.pool[old.line]++;G.pool[line]--;G.shop[0]={line,shiny:false};renderShop();
 }
 return{room,won,shopOpen,biasShop};
}
window.ROCKET_EVENTS={definitions,routes,create};
})();
