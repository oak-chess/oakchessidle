(function(){
'use strict';
const KEY='oakchess_pokedex_v1',esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let state={v:1,entries:{},traits:{}},saveTimer,storageError=false;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.v===1&&saved.entries&&typeof saved.entries==='object'&&!Array.isArray(saved.entries))state={v:1,entries:saved.entries,traits:saved.traits&&typeof saved.traits==='object'?saved.traits:{},combos:Array.isArray(saved.combos)?saved.combos.filter(x=>typeof x==='string').slice(-60):[]}}catch(e){}
const catalog=new Map();LINES.forEach(L=>L.ids.forEach((id,index)=>{if(!catalog.has(id))catalog.set(id,{id,line:L.i,star:index+1,name:L.names[index]})}));
for(const extra of window.DEX_EXPANSION||[]){if(catalog.has(extra.id))Object.assign(catalog.get(extra.id),{resource:extra});else catalog.set(extra.id,{id:extra.id,name:extra.name,preview:true,resource:extra})}
const entryTypes=e=>e.preview?e.resource.types:typesOf(LINES[e.line],e.star);
const entries=[...catalog.values()].sort((a,b)=>a.id-b.id),roleNames={tank:'Tanque',bruiser:'Lutador',melee:'Combatente',skirm:'Escaramuçador',range:'Atirador',mage:'Mago',support:'Suporte'};
let selected=entries[0]?.id,tab='pokemon',filter='all',search='',type='',region='all',detailOpen=false,selectedTrait=null,traitPokemon=false,returnFocus=null,pausedHere=false,savePending=false;
function flush(){if(!savePending)return;clearTimeout(saveTimer);savePending=false;try{localStorage.setItem(KEY,JSON.stringify(state));storageError=false}catch(e){storageError=true}if(panel.classList.contains('show'))status()}
function persist(){savePending=true;clearTimeout(saveTimer);saveTimer=setTimeout(flush,180)}
function real(){return !DEMO.on&&!window.TOWER?.isPreview&&!(typeof ARENA_PREVIEW!=='undefined'&&ARENA_PREVIEW)}
function remember(unit,owned=false,evolved=false,source='batalha'){
 if(!unit||!LINES[unit.line])return false;
 const L=LINES[unit.line],star=Math.max(1,Math.min(3,Number(unit.star)||1)),id=L.ids[star-1];
 if(!catalog.has(id))return false;
 let record=state.entries[id],changed=false;
 if(!record){record=state.entries[id]={seen:Date.now(),star,owned:0,evolved:false,skills:{},source};changed=true}
 if(star>(record.star||1)){record.star=star;changed=true}
 if(owned&&!record.registered){record.registered=Date.now();record.owned=record.registered;changed=true}if(unit.shiny&&!record.shinySeen){record.shinySeen=Date.now();changed=true}if(owned&&unit.shiny&&!record.shinyRegistered){record.shinyRegistered=Date.now();changed=true}
 if(evolved&&!record.evolved){record.evolved=true;changed=true}
 if(!record.skills||typeof record.skills!=='object')record.skills={};
 if(changed)persist();return changed;
}
function observe(list,source){if(!real()||!Array.isArray(list))return;let changed=false;for(const unit of list)changed=remember(unit,false,false,source)||changed;if(changed)refreshOpen()}
function owned(unit,evolved=false){if(!real())return;if(remember(unit,!!unit.dexPurchased,evolved,'equipe'))refreshOpen()}
function purchased(unit){if(!real())return;unit.dexPurchased=true;remember(unit,true,false,'loja:compra');persist();refreshOpen()}
function battleStart(){
 if(!real())return;
 const team=boardUnits();for(const unit of allPlus())remember(unit,!!unit.dexPurchased,false,'equipe');
 const counts=typeCounts(team),active=[];
 for(const [t,n]of Object.entries(counts)){const rule=TRAITS[t];if(!rule)continue;const tier=rule.tiers.filter(v=>n>=v).pop();if(tier){active.push(t);if(tier>(Number(state.traits[t])||0)){state.traits[t]=tier;persist()}}}
 // Combinações ativas ficam registradas como conjuntos, sem multiplicar o armazenamento.
 const combo=active.sort().join('+');if(combo){state.combos=Array.isArray(state.combos)?state.combos:[];if(!state.combos.includes(combo)){state.combos.push(combo);state.combos=state.combos.slice(-60);persist()}}
 refreshOpen();
}
function cast(unit,move){if(!real()||!unit||!move)return;remember(unit,false,false,'batalha');const id=unit.id||LINES[unit.line]?.ids[(unit.star||1)-1],r=state.entries[id];if(r&&!r.skills[move.n]){r.skills[move.n]=true;persist()}}
const dexRegions=[['kanto','Kanto',1,151],['johto','Johto',152,251],['hoenn','Hoenn',252,386],['sinnoh','Sinnoh',387,493],['unova','Unova',494,649],['kalos','Kalos',650,721],['alola','Alola',722,809],['galar','Galar',810,905],['paldea','Paldea',906,1025]];
const panel=document.createElement('section');panel.id='pokedex';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','dexTitle');
panel.innerHTML='<div class="dex-window"><header><div class="dex-device-brand"><div class="dex-device-lights" aria-hidden="true"><i class="dex-lens"></i><i class="dex-led red"></i><i class="dex-led yellow"></i><i class="dex-led green"></i></div><div><small>REGISTRO DE DESCOBERTAS</small><h2 id="dexTitle">POKÉDEX</h2></div></div><button data-close aria-label="Fechar Pokédex">×</button></header><div class="dex-summary"></div><nav class="dex-tabs"><button data-tab="pokemon">Pokémon</button><button data-tab="shiny">✦ Shiny</button><button data-tab="traits">Sinergias</button></nav><div class="dex-tools"><input type="search" aria-label="Buscar Pokémon" placeholder="Nome ou número…"><select aria-label="Filtrar descobertas"><option value="all">Todos</option><option value="playable">Disponíveis no jogo</option><option value="preview">Em breve na Torre</option><option value="seen">Encontrados</option><option value="owned">Registrados na loja</option><option value="evolved">Evoluções alcançadas</option><option value="unknown">Não descobertos</option></select><select aria-label="Filtrar tipo"><option value="">Todos os tipos</option>'+Object.entries(TYPES).map(([t,v])=>'<option value="'+t+'">'+esc(v.n)+'</option>').join('')+'</select></div><div class="dex-content"><div class="dex-list" role="list" aria-label="Pokémon da Pokédex"></div><article class="dex-detail"></article></div><footer role="status"></footer></div>';
document.body.append(panel);
const regionSelect=document.createElement('select');regionSelect.setAttribute('aria-label','Filtrar região');regionSelect.innerHTML='<option value="all">Todas as regiões</option>'+dexRegions.map(([key,name,from,to])=>{const count=entries.filter(e=>e.id>=from&&e.id<=to).length;return '<option value="'+key+'" '+(!count?'disabled':'')+'>'+name+(!count?' · em breve':'')+'</option>'}).join('');panel.querySelector('.dex-tools').append(regionSelect);
const navigation=document.createElement('div');navigation.className='dex-navigation';navigation.innerHTML='<button data-back type="button">← Voltar aos Pokémon</button>';panel.querySelector('.dex-content').before(navigation);
function syncView(){panel.classList.toggle('dex-detail-open',detailOpen);panel.classList.toggle('dex-traits-view',tab==='traits');navigation.querySelector('button').textContent=tab==='traits'?(traitPokemon?'← Voltar à sinergia':'← Voltar às sinergias'):'← Voltar aos Pokémon';}

function status(){panel.querySelector('footer').textContent=storageError?'Não foi possível salvar no navegador. As descobertas desta sessão continuam disponíveis.':'Apagado: não visto · Cinza: visto · Colorido: registrado por compra na loja'}
function summary(){const records=Object.values(state.entries),shiny=tab==='shiny',seen=shiny?records.filter(r=>r.shinySeen).length:records.length,obtained=records.filter(r=>shiny?r.shinyRegistered:r.registered).length,evolved=records.filter(r=>r.evolved&&r.registered).length;panel.querySelector('.dex-summary').innerHTML='<span><b>'+seen+'/'+entries.length+'</b> '+(shiny?'Shinies vistos':'Encontrados')+'</span><span><b>'+obtained+'</b> Registrados</span><span><b>'+evolved+'</b> Evoluções registradas</span><span><b>'+Object.keys(state.traits).length+'/'+Object.keys(TRAITS).length+'</b> Sinergias</span>'}
function available(e){if(tab==='shiny'&&e.preview)return false;const group=dexRegions.find(r=>r[0]===region);if(group&&(e.id<group[2]||e.id>group[3]))return false;const stored=state.entries[e.id],r=tab==='shiny'?(stored?.shinySeen?{...stored,registered:stored.shinyRegistered}:null):stored;if(search&&!e.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))&&!String(e.id).includes(search))return false;if(type&&!entryTypes(e).includes(type))return false;return filter==='all'||filter==='preview'&&e.preview||filter==='playable'&&!e.preview||filter==='seen'&&!!r||filter==='owned'&&!!r?.registered||filter==='evolved'&&!!r?.evolved&&!!r?.registered||filter==='unknown'&&!r&&!e.preview}
function sprite(id,known=true){const r=state.entries[id],registered=tab==='shiny'?r?.shinyRegistered:r?.registered;return '<img class="'+(!known?'dex-silhouette':!registered?'dex-seen-only':'')+'" src="'+esc(tab==='shiny'?shinyUrl(sprStatic(id)):sprStatic(id))+'" alt="" loading="lazy">'}
function traitDescription(t){const rule=TRAITS[t];if(!rule)return '';const tier=Number(state.traits[t])||rule.tiers[0],index=Math.max(0,rule.tiers.indexOf(tier)),value=rule.v[index]??rule.v[0];return rule.d.replace(/\{v\}/g,fmtV(t,value))}
function drawList(){const list=entries.filter(available);if(!list.some(e=>e.id===selected))selected=list[0]?.id;panel.querySelector('.dex-list').innerHTML=list.length?list.map(e=>{const stored=state.entries[e.id],r=tab==='shiny'?(stored?.shinySeen?{...stored,registered:stored.shinyRegistered}:null):stored;return '<button role="listitem" data-id="'+e.id+'" aria-pressed="'+(selected===e.id)+'" class="'+(selected===e.id?'selected ':'')+(!r?'unknown':'')+'">'+sprite(e.id,!!r)+'<span><small>#'+String(e.id).padStart(3,'0')+'</small><b>'+esc(r||e.preview?e.name:'???')+'</b></span><i>'+(e.preview?'◇':!r?'?':r.registered?'●':'◉')+'</i></button>'}).join(''):'<p class="dex-empty">Nenhuma descoberta neste filtro.</p>';drawDetail()}
function drawDetail(){
 const e=catalog.get(selected),box=panel.querySelector('.dex-detail');if(!e){box.innerHTML='<div class="dex-empty">Encontre Pokémon na sua próxima aventura.</div>';return}
 const stored=state.entries[e.id],r=tab==='shiny'?(stored?.shinySeen?{...stored,registered:stored.shinyRegistered}:null):stored;if(e.preview){drawExpansionDetail(e,box);return}if(!r){box.innerHTML='<div class="dex-unknown-art">'+sprite(e.id,false)+'</div><h3>Registro desconhecido</h3><p>Encontre este Pokémon na loja, em uma batalha ou em um evento para revelar sua ficha.</p>';return}
 const L=LINES[e.line],star=Math.max(e.star,Math.min(3,r.star||1)),stats=baseStats(L,star),types=typesOf(L,star),moves=movesFor(L,star),passive=window.PASSIVE_MOVES?.describe({L,id:e.id,star})||L.passive;
 box.innerHTML='<div class="dex-hero">'+sprite(e.id)+'<div><small>#'+String(e.id).padStart(3,'0')+' · '+esc(roleNames[L.role]||'')+'</small><h3>'+esc(e.name)+'</h3><div class="dex-types">'+types.map(t=>'<span style="--type:'+TYPES[t].c+'">'+esc(TYPES[t].n)+'</span>').join('')+'</div><p>'+esc(r.registered?'Registrado pela loja'+(tab==='shiny'?' · Shiny':''):'Visto · compre na loja para registrar')+(r.evolved?' · Evolução alcançada':'')+'</p></div></div><h4>FORMAS DA LINHA</h4><div class="dex-forms">'+L.ids.map((id,i)=>'<button data-id="'+id+'" title="'+esc(state.entries[id]?L.names[i]:'Forma desconhecida')+'">'+sprite(id,!!state.entries[id])+'<span>'+esc(state.entries[id]?L.names[i]:'???')+'</span><small>'+'★'.repeat(i+1)+'</small></button>').join('')+'</div><div class="dex-stats"><span><b>'+Math.round(stats.hp)+'</b> PS</span><span><b>'+Math.round(stats.atk)+'</b> Ataque</span><span><b>'+Math.round(stats.sp)+'</b> Poder</span><span><b>'+L.c+'</b> Custo</span></div><small class="dex-note">Valores base, sem itens ou bônus. Forma de '+star+' estrela(s).</small><h4>PASSIVA</h4><div class="dex-ability"><b>'+esc(passive?.n||'—')+'</b><p>'+esc(passive?.d||'')+'</p></div><h4>GOLPES DESCOBERTOS</h4>'+moves.map(m=>'<div class="dex-ability"><b>'+esc(m.n)+'</b><small>'+esc(TYPES[m.t]?.n||'')+' · '+(r.skills?.[m.n]?'Uso registrado':'Disponível nesta forma')+'</small><p>'+esc(moveText(L,star,m))+'</p></div>').join('')+'<h4>SINERGIAS</h4>'+types.map(t=>'<div class="dex-ability"><b>'+esc(TYPES[t].n)+'</b><p>'+esc(traitDescription(t))+'</p><small>'+(state.traits[t]?'Você já ativou: '+state.traits[t]+' espécies':'Ainda não ativada pela sua equipe')+'</small></div>').join('');
}
function drawExpansionDetail(e,box){
 const data=e.resource,chain=entries.filter(other=>other.resource?.chain===data.chain);
 box.innerHTML='<div class="dex-hero"><div class="dex-pmd-preview" data-animation></div><div><small>#'+String(e.id).padStart(4,'0')+' · Em breve na Torre</small><h3>'+esc(e.name)+'</h3><div class="dex-types">'+data.types.map(t=>'<span style="--type:'+(TYPES[t]?.c||'#888')+'">'+esc(TYPES[t]?.n||t)+'</span>').join('')+'</div><p>Consulta do catálogo · não conta como captura</p></div></div><label class="dex-note">Forma <select data-form>'+data.forms.map((f,i)=>'<option value="'+i+'">'+esc(f.name)+'</option>').join('')+'</select></label><p class="dex-note" data-animation-status></p><h4>LINHA EVOLUTIVA</h4><div class="dex-forms">'+chain.map(other=>'<button data-id="'+other.id+'">'+sprite(other.id)+'<span>'+esc(other.name)+'</span></button>').join('')+'</div><p class="dex-note">Condições específicas de evolução em preparação.</p><h4>ANIMAÇÕES DISPONÍVEIS</h4><p class="dex-note" data-animations></p><h4>GOLPES</h4><p>Associações e prévias em preparação. Esta espécie ainda não faz parte do elenco jogável.</p><p class="dex-note">Sprites: PMDCollab/SpriteCollab · CC BY-NC 4.0. Dados: PokéAPI.</p>';
 const learnset=window.DEX_LEARNSETS?.[e.id],moveCatalog=new Map((window.DEX_MOVE_CATALOG||[]).map(m=>[m.id,m]));
 const pendingText=[...box.querySelectorAll('p')].find(p=>p.textContent.startsWith('Associações e prévias em preparação.'));
 if(pendingText){
  const section=document.createElement('div');section.className='dex-species-moves';pendingText.replaceWith(section);let movePage=0;
  const moves=learnset?.moves.filter(row=>moveCatalog.has(row[0]))||[],methods={1:'Nível',2:'Ovo',3:'Tutor',4:'Máquina',5:'Evento',6:'Evento',10:'Forma',11:'Forma'};
  function drawMoves(){const pages=Math.max(1,Math.ceil(moves.length/8));movePage=Math.max(0,Math.min(movePage,pages-1));
   section.innerHTML='<p class="dex-note">Fonte: PokéAPI · '+esc(learnset?.game||'Sem registro')+'. Lista da espécie padrão; formas alternativas podem ter golpes diferentes. Dados de consulta, sem atribuição ao combate do OakChess.</p>'+moves.slice(movePage*8,movePage*8+8).map(([id,method,level])=>{const move=moveCatalog.get(id);return '<button type="button" class="dex-learnset-move" data-learnset-move="'+id+'"><b>'+esc(move.name)+'</b><small>'+esc(methods[method]||'Método '+method)+(method===1?' '+level:'')+' · '+(move.status==='adapted'?'▶ Efeito adaptado':'Efeito pendente')+'</small></button>'}).join('')+'<div class="dex-learnset-pages"><button type="button" data-learnset-page="-1" '+(movePage===0?'disabled':'')+'>‹</button><span>'+(movePage+1)+' / '+pages+'</span><button type="button" data-learnset-page="1" '+(movePage===pages-1?'disabled':'')+'>›</button></div>';
   section.querySelectorAll('[data-learnset-page]').forEach(b=>b.onclick=()=>{movePage+=+b.dataset.learnsetPage;drawMoves()});section.querySelectorAll('[data-learnset-move]').forEach(b=>b.onclick=()=>window.DEX_MOVE_LIBRARY?.open(+b.dataset.learnsetMove,e.id));
  }drawMoves();
 }
 const show=()=>{const form=data.forms[+box.querySelector('[data-form]').value];box.querySelector('[data-animations]').textContent=form.animations.join(' · ');window.DEX_PMD_PREVIEW?.show(box.querySelector('[data-animation]'),form,box.querySelector('[data-animation-status]'))};box.querySelector('[data-form]').onchange=show;show();
}
function addMovePreviews(box,e,star,moves){
 let node=[...box.querySelectorAll('h4')].find(h=>h.textContent==='GOLPES DESCOBERTOS')?.nextElementSibling,index=0;
 while(node&&node.tagName!=='H4'){
  const move=moves[index++];if(!move)break;
  node.classList.add('dex-preview-card');node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-label','Ver animação de '+move.n);
  const hint=document.createElement('small');hint.className='dex-preview-hint';hint.textContent='▶ Ver animação';node.append(hint);
  node.onclick=()=>window.DEX_MOVE_PREVIEW?.open({line:e.line,star,id:e.id,name:e.name,move});
  node.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();event.currentTarget.click()}};
  node=node.nextElementSibling;
 }
}
const originalDrawDetail=drawDetail;
drawDetail=function(){originalDrawDetail();const e=catalog.get(selected),r=e&&state.entries[e.id];if(!e||e.preview||!r)return;const star=Math.max(e.star,Math.min(3,r.star||1)),L=LINES[e.line];addMovePreviews(panel.querySelector('.dex-detail'),e,star,movesFor(L,star))};
function drawTraitDetail(t){
 const rule=TRAITS[t],members=entries.filter(e=>!e.preview&&entryTypes(e).includes(t)),known=members.filter(e=>state.entries[e.id]).length;
 panel.querySelector('.dex-detail').innerHTML='<div class="dex-trait-heading"><div class="dex-trait-emblem" style="--trait-color:'+TYPES[t].c+'">'+tyIcon(t)+'</div><div><small>SINERGIA DE TIPO</small><h3>'+esc(TYPES[t].n)+'</h3><span>'+known+'/'+members.length+' Pokémon encontrados</span></div></div><div class="dex-ability"><p>'+esc(traitDescription(t))+'</p><small>Patamares: '+rule.tiers.join(' / ')+' espécies · '+(state.traits[t]?'Maior ativado: '+state.traits[t]:'Ainda não ativada')+'</small></div><h4>POKÉMON DESTA SINERGIA</h4><div class="dex-trait-members">'+members.map(e=>'<button data-id="'+e.id+'" class="'+(!state.entries[e.id]?'unknown':'')+'">'+sprite(e.id,!!state.entries[e.id])+'<small>#'+String(e.id).padStart(3,'0')+'</small><b>'+esc(state.entries[e.id]?e.name:'???')+'</b></button>').join('')+'</div>';
}
function drawTraits(){
 panel.querySelector('.dex-list').innerHTML=Object.entries(TRAITS).map(([t,rule])=>'<button data-trait="'+t+'" class="dex-trait-tile '+(state.traits[t]?'activated':'')+'" style="--trait-color:'+TYPES[t].c+'"><div class="dex-trait-emblem">'+tyIcon(t)+'</div><b>'+esc(TYPES[t].n)+'</b><small>'+rule.tiers.join(' / ')+' espécies</small><i>'+(state.traits[t]?'●':'○')+'</i></button>').join('');
 if(detailOpen&&selectedTrait){if(traitPokemon)drawDetail();else drawTraitDetail(selectedTrait)}else panel.querySelector('.dex-detail').innerHTML='';
}function render(){syncView();summary();panel.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));panel.querySelector('.dex-tools').hidden=!['pokemon','shiny'].includes(tab);if(['pokemon','shiny'].includes(tab))drawList();else drawTraits();status();panel.querySelectorAll('img').forEach(img=>img.onerror=()=>{if(!img.dataset.remoteFallback){img.dataset.remoteFallback='1';const match=img.getAttribute('src').match(/pokemon\/(\d+)\.png/);if(match){img.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+match[1]+'.png';return}}img.style.visibility='hidden'})}
function refreshOpen(){if(panel.classList.contains('show'))render()}
function open(){
 if(G.eventModal){toast('Conclua o evento para abrir a Pokédex.');return}
 if(panel.classList.contains('show'))return;
 returnFocus=document.activeElement;pausedHere=!G.paused&&['plan','combat'].includes(G.phase)&&!DEMO.on;if(pausedHere)togglePause(true);
 detailOpen=false;panel.classList.add('show');render();panel.querySelector('[data-close]').focus();
}
function close(){window.DEX_MOVE_PREVIEW?.close();panel.classList.remove('show');flush();if(pausedHere&&G.paused)togglePause(false);pausedHere=false;if(returnFocus?.isConnected)returnFocus.focus()}
panel.addEventListener('click',e=>{
 if(e.target===panel||e.target.closest('[data-close]')){close();return}const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-back')){if(tab==='traits'&&traitPokemon){traitPokemon=false;drawTraitDetail(selectedTrait)}else detailOpen=false;syncView();if(!detailOpen)panel.querySelector(tab==='traits'?'.dex-list [data-trait="'+selectedTrait+'"]':'.dex-list [data-id="'+selected+'"]')?.focus();else b.focus();return}
 if(b.dataset.id){selected=+b.dataset.id;detailOpen=true;if(tab==='traits')traitPokemon=true;drawDetail();syncView();panel.querySelector('.dex-detail').scrollTop=0;panel.querySelector('[data-back]').focus();SND.click()}
 if(b.dataset.tab){tab=b.dataset.tab;detailOpen=false;traitPokemon=false;render()}
 if(b.dataset.trait){selectedTrait=b.dataset.trait;traitPokemon=false;detailOpen=true;drawTraitDetail(selectedTrait);syncView();panel.querySelector('.dex-detail').scrollTop=0;panel.querySelector('[data-back]').focus();SND.click()}
});panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();if(detailOpen)panel.querySelector('[data-back]').click();else close()}if(e.key==='Tab'){const focus=[...panel.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&el.getClientRects().length),first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
panel.querySelector('input').oninput=e=>{search=e.target.value;detailOpen=false;syncView();drawList()};const selects=panel.querySelectorAll('select');selects[0].onchange=e=>{filter=e.target.value;detailOpen=false;syncView();drawList()};selects[1].onchange=e=>{type=e.target.value;detailOpen=false;syncView();drawList()};
regionSelect.onchange=()=>{region=regionSelect.value;detailOpen=false;syncView();drawList()};
const menu=document.querySelector('#tmain .r2');if(menu){const item=document.createElement('div');item.className='ti';item.dataset.act='pokedex';item.setAttribute('role','menuitem');item.tabIndex=-1;item.innerHTML='<i class="tar">▶</i><span class="tl">POKÉDEX</span>';item.onclick=e=>{e.stopPropagation();document.getElementById('tpress')?.classList.remove('tools-open');open()};menu.append(item)}
const pauseCard=document.querySelector('#pausedOverlay .pause-card'),resume=document.getElementById('resumeBtn');if(pauseCard&&resume){const button=document.createElement('button');button.className='dex-pause-button';button.textContent='Pokédex de descobertas';button.onclick=open;resume.before(button)}
const launch=document.createElement('button');launch.id='pokedexLaunch';launch.type='button';launch.innerHTML='<img src="assets/ui-sprites/pokedex-device.svg" alt="" draggable="false">';launch.title='Pokédex de descobertas';launch.setAttribute('aria-label','Abrir Pokédex');launch.onclick=open;document.getElementById('pauseBtn')?.parentElement.append(launch);
// Migra apenas as composições comprovadas pelo histórico, sem supor evolução.
try{const history=JSON.parse(localStorage.getItem('ptft_runs_v2')||'[]');if(Array.isArray(history))for(const run of history)for(const u of run.last?.us||[]){const known=entries.find(e=>e.id===+u.id);if(known)remember({line:known.line,star:Math.max(1,Math.min(3,+u.star||known.star))},false,false,'histórico')}}catch(e){}
window.PDEX={snapshot:()=>({seen:Object.keys(state.entries).length,registered:Object.values(state.entries).filter(r=>r.registered).length,owned:Object.entries(state.entries).filter(([id,r])=>r.registered).map(([id])=>+id),shinyOwned:Object.entries(state.entries).filter(([id,r])=>r.shinyRegistered).map(([id])=>+id)}),open,observe,owned,purchased,battleStart,cast};
if(typeof T_DESC!=='undefined')T_DESC.pokedex='Consulte Pokémon descobertos, evoluções, golpes e sinergias usadas.';
if(real()){observe(G.shop||[],'loja');observe((B.units||[]).filter(u=>u.side===1),'batalha');for(const u of allPlus())owned(u)}
window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});flush();
})();
