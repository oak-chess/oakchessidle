/* Focused party, training and inventory UI for the idle mode. */
window.createIdleParty=function(ctx){
const {state:s,lines,sprite,itemInfo,itemSprite}=ctx;
let phone,party,bag,current,bagTab='gear',filter='all',query='',dose='1',selectedItem=null,notice='',compareId=null,releaseId=null,comparisonOpen=false,sort='level',partyView='overview',partyGroup='field',recipientPanel=null;
const all=()=>[...s.team,...s.collection];
const inDepot=m=>s.captureDepot?.includes(m);
const line=m=>lines.find(l=>l.names[0]===m.name);
const passive=m=>window.IDLE_HOENN_RULES?.passive(line(m).ids[m.star-1],line(m).passive)||line(m).passive;
const name=m=>(m.shiny?'✦ ':'')+(ctx.mega?.()?.selected(m)?.label||line(m).names[m.star-1]);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const button=(label,action,disabled=false,cls='')=>{const e=el('button',label,'ip-button '+cls);if(label==='←'){e.classList.add('idle-back-button');e.textContent='Anterior';e.setAttribute('aria-label','Página anterior de Pokémon')}e.type='button';e.disabled=disabled;e.onclick=action;return e};
function image(src,alt,cls){const img=el('img',undefined,cls);img.src=src;img.alt=alt;img.onerror=()=>{img.onerror=null;img.src='assets/pokeapi/sprites/items/rare-candy.png'};return img}
function where(m){return inDepot(m)?'No Depósito':ctx.busy(m)?'Em atividade':!s.team.includes(m)?'No PC':m.pos?.z==='b'?'Em campo':'Na reserva'}
function chosen(){return all().find(m=>m.id===current)||s.captureDepot?.find(m=>m.id===current)||s.team[0]||s.collection[0]}
function commit(rebuild=true){if(rebuild)ctx.pause();ctx.setItems(s.items);ctx.save();ctx.refresh(rebuild);render();renderBag()}
function protectionTools(m,compact=false,sheet=false){
 const tools=el('div',undefined,'idle-protection-tools'+(compact?' is-compact':'')+(sheet?' ip-sheet-protection':''));
 for(const [key,icon,on,off] of [['favorite','★','Favoritado','Favoritar'],['locked','🔒','Protegido','Proteger']]){
  const active=!!m[key],b=button(compact?(!active?(key==='favorite'?'☆':'🔓'):icon):icon+' '+(active?on:off),()=>{
   m[key]=!m[key];releaseId=null;commit(false);
   if(sheet)party.querySelector('.ip-sheet-protection [data-kind='+key+']')?.focus({preventScroll:true})
  });
  b.dataset.kind=key;b.setAttribute('aria-pressed',String(active));
  b.setAttribute('aria-label',(active?(key==='favorite'?'Remover favorito':'Desproteger Pokémon'):off)+' · '+name(m));
  b.title=key==='favorite'?'Favoritos aparecem no filtro e ficam protegidos contra venda.':'O cadeado impede a venda e a conversão em doces.';
  if(sheet){
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
   path.setAttribute('d',key==='favorite'?'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.2-.9Z':active?'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z':'M7 11V8a5 5 0 0 1 9-3M5 11h14v10H5z');
   svg.append(path);b.replaceChildren(svg,el('span',active?on:off));
  }
  tools.append(b)
 }
 return tools
}
function close(){recipientPanel?.remove();recipientPanel=null;if(party)party.hidden=true;if(bag)bag.hidden=true}
function prepare(){ctx.capture();ctx.closePanels();all().forEach(ctx.normalize)}
function open(id,tab='summary'){if(tab==='evolution')return ctx.evolutionOpen(id||current);prepare();if(id)current=id;else if(!current)current=s.team[0]?.id;partyView=id?'detail':'overview';party.hidden=false;notice='';delete party.querySelector('#ip-party-detail').dataset.scrollKey;render();goToSheetSection(tab)}
function openBag(tab='home',item=null){prepare();bagTab=['gear','supplies','evolution','materials'].includes(tab)?tab:'gear';selectedItem=item;bag.hidden=false;notice='';phone.show(tab==='home'?'home':'inventory');renderBag()}
function heading(root,title,description){const head=el('header');const words=el('div');words.append(el('small','JORNADA IDLE'),el('h2',title),el('p',description));head.append(words,button('✕',close,false,'ip-close'));root.append(head)}
function mount(stage){
 party=el('section',undefined,'idle-window ip-window');party.id='idle-party';party.hidden=true;heading(party,'Seus Pokémon','Escolha um parceiro para abrir a ficha.');party.setAttribute('role','dialog');party.setAttribute('aria-label','Pokémon');const main=el('main');main.id='ip-party-detail';party.append(main);const footer=el('footer',undefined,'ip-footer');footer.append(button('PC do Centro',ctx.pcOpen,false,'ip-primary'),button('Formações',()=>ctx.worldOpen('forms')),button('Pokédex',()=>ctx.worldOpen('dex')));party.append(footer);stage.append(party);
 party.addEventListener('click',event=>{if(party.dataset.view==='detail'&&event.target.closest('button:not(:disabled),summary')&&typeof SND!=='undefined')SND.click()},true);
 bag=el('section',undefined,'idle-window ip-window');bag.id='idle-inventory';bag.hidden=true;heading(bag,'Pokéfone','Seu companheiro de jornada');const status=el('div',undefined,'ip-phone-status');status.append(el('span','OAK • POKÉFONE'),el('i',undefined,'ip-phone-camera'),el('span','▂▄▆  ▰'));bag.prepend(status);bag.setAttribute('role','dialog');bag.setAttribute('aria-label','Pokéfone');const tabs=el('nav',undefined,'ip-tabs');for(const [key,label,icon]of [['badges','Estojo de Insígnias','badges'],['dex','Pokédex','dex'],['nav','PokéNav','nav'],['settings','Ajustes','settings']]){const b=button(label,()=>{phone.show(key)});b.dataset.phoneDock=key;b.setAttribute('aria-label',label);b.prepend(image('modes/idle/assets/phone/'+key+'.svg','','ip-app-icon'));tabs.append(b)}bag.append(tabs);const content=el('div');content.id='ip-bag-content';bag.append(content);const home=el('div',undefined,'ip-phone-home');home.setAttribute('aria-hidden','true');bag.append(home);stage.append(bag);phone=window.createIdlePhone({...ctx.phone,state:s,lines,sprite,refresh:renderBag});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
function renderOverview(){const main=party.querySelector('#ip-party-detail');main.replaceChildren();party.querySelector('header h2').textContent='Seus Pokémon';party.querySelector('header p').textContent=s.team.filter(m=>m.pos?.z==='b').length+'/'+ctx.capacity()+' em campo · '+s.team.filter(m=>m.pos?.z==='n').length+' no banco · '+s.collection.length+' no PC';const tools=el('div',undefined,'ip-selection-tools'),groups=el('nav');for(const [key,label]of [['field','Em campo'],['reserve','Banco'],['favorites','Favoritos']]){const count=s.team.filter(m=>key==='favorites'?m.favorite:key==='field'?m.pos?.z==='b':m.pos?.z==='n').length;const b=button(label,()=>{partyGroup=key;renderOverview()});b.append(el('span',String(count),'ip-group-count'));b.dataset.group=key;b.setAttribute('aria-pressed',String(partyGroup===key));groups.append(b)}const search=el('input');search.type='search';search.placeholder='Buscar Pokémon';search.setAttribute('aria-label','Buscar na equipe');search.value=query;search.oninput=()=>{query=search.value;renderList()};tools.append(groups,search);main.append(tools,el('div',undefined,'ip-selection-grid'));renderList()}
function renderList(){if(!party||party.hidden)return;const list=party.querySelector('.ip-selection-grid');if(!list)return;list.replaceChildren();const members=s.team.filter(m=>(partyGroup==='field'?m.pos?.z==='b':partyGroup==='reserve'?m.pos?.z==='n':m.favorite)&&(name(m)+' '+m.name).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.level-a.level||name(a).localeCompare(name(b),'pt-BR'));
 for(const [index,m]of members.entries()){const b=button('',()=>{current=m.id;notice='';partyView='detail';render()});b.className='ip-selection-card';b.dataset.memberId=m.id;window.IDLE_INDIVIDUALS.decorate(b,m);const portrait=IDLE_PMD_PORTRAITS.member(m,lines),words=el('div',undefined,'ip-selection-copy'),header=el('div',undefined,'ip-selection-name');portrait.className='ip-selection-sprite';header.append(el('b',name(m)),el('span','Nv. '+m.level));const types=el('div',undefined,'ip-team-types');for(const t of ctx.typeBadges(m)){const badge=el('span');badge.style.setProperty('--type-color',t.color);badge.append(image(t.icon,'',''),document.createTextNode(t.name));types.append(badge)}const genetics=el('div',undefined,'ip-team-genetics'),power=el('span',window.IDLE_INDIVIDUALS.quality(m)),iv=el('span','IV '+window.IDLE_INDIVIDUALS.total(m)+'/186');power.dataset.quality=String(m.potency);const ratio=window.IDLE_INDIVIDUALS.total(m)/186;iv.dataset.quality=String(ratio>=.95?5:ratio>=.85?4:ratio>=.7?3:ratio>=.5?2:1);genetics.append(power,iv);words.append(header,types,genetics);const hp=ctx.liveHealth?.(m.id)??(m.condition??1),health=el('div',undefined,'ip-selection-health'),track=el('div'),fill=el('i');fill.style.width=Math.round(hp*100)+'%';track.append(fill);health.append(el('small','PS '+Math.round(hp*100)+'%'),track);words.append(health);b.append(portrait,words,el('span',(m.favorite?'★':String(index+1)),'ip-selection-number'));b.dataset.health=hp<=0?'fainted':hp<.25?'low':'normal';b.title='Abrir ficha de '+name(m);const wrapper=el('div',undefined,'ip-selection-entry');wrapper.append(b,protectionTools(m,true));list.append(wrapper)}if(!members.length)list.append(el('p',partyGroup==='reserve'?'O banco está vazio. Retire parceiros do PC para montar sua reserva.':'Nenhum Pokémon nesta seleção.','ip-empty'));
}
function statGrid(m,level=m.level){const stats=ctx.stats(m,level);const grid=el('div',undefined,'ip-stats');for(const [key,label]of [['hp','PS máx.'],['atk','Ataque'],['spell','Poder'],['armor','Defesa'],['mr','Resistência'],['speed','Vel. ataque']]){const cell=el('div');cell.append(el('small',label),el('b',key==='speed'?stats[key].toFixed(2):Math.round(stats[key])));if(['armor','mr'].includes(key))cell.title=(key==='armor'?'Redução física: ':'Redução especial: ')+window.IDLE_INDIVIDUALS.defenseText(stats[key])+' · Antes de tipos, escudos e outros efeitos.';grid.append(cell)}return grid}
const sheetNumber=(value,digits=0)=>Number(value||0).toLocaleString('pt-BR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
const sheetRatio=value=>Math.max(0,Math.min(1,Number(value)||0));
function sheetCard(title,subtitle,cls=''){const card=el('section',undefined,'ip-analysis-card '+cls),head=el('div',undefined,'ip-analysis-heading');head.append(el('h4',title));if(subtitle)head.append(el('small',subtitle));card.append(head);return card}
function ivBars(m,compact=false){
 const I=window.IDLE_INDIVIDUALS,nature=I.nature(m),chart=el('div',undefined,'ip-analysis-bars'+(compact?' is-compact':''));
 for(const key of I.keys){const value=m.ivs[key],row=el('div',undefined,'ip-analysis-iv-row'),label=el('span',I.labels[key]),track=el('div',undefined,'ip-analysis-iv-track'),fill=el('i'),number=el('b',value+' / 31');
  row.dataset.stat=key;row.dataset.value=String(value);fill.style.width=(value/31*100)+'%';track.setAttribute('role','meter');track.setAttribute('aria-label','IV de '+I.labels[key]);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','31');track.setAttribute('aria-valuenow',String(value));track.append(fill);row.append(label,track,number);
  if(!compact){const effect=el('small',nature.up===key?'+10% Nature':nature.down===key?'−10% Nature':'Nature neutra','ip-analysis-nature-effect');effect.dataset.direction=nature.up===key?'up':nature.down===key?'down':'equal';row.append(effect)}chart.append(row);
 }return chart;
}
function ivRadar(m){
 const I=window.IDLE_INDIVIDUALS,NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 300 268');svg.setAttribute('role','img');svg.setAttribute('class','ip-analysis-radar');
 const label='Distribuição dos IVs: '+I.keys.map(k=>I.labels[k]+' '+m.ivs[k]+' de 31').join('; ');svg.setAttribute('aria-label',label);
 const make=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));svg.append(e);return e},point=(index,ratio)=>{const angle=index*Math.PI/3-Math.PI/2;return [150+Math.cos(angle)*88*ratio,134+Math.sin(angle)*88*ratio]},points=ratio=>I.keys.map((_,i)=>point(i,ratio).join(',')).join(' ');
 for(const tick of [8,16,24,31])make('polygon',{points:points(tick/31),class:'ip-radar-ring'});
 I.keys.forEach((key,i)=>{const [x,y]=point(i,1);make('line',{x1:150,y1:134,x2:x,y2:y,class:'ip-radar-axis'});const [lx,ly]=point(i,1.32),text=make('text',{x:lx,y:ly,'text-anchor':lx<140?'end':lx>160?'start':'middle','dominant-baseline':'middle',class:'ip-radar-label'});text.textContent=({hp:'PS',atk:'Ataque',def:'Defesa',spa:'Poder',spd:'Resist.',spe:'Veloc.'})[key]});
 make('polygon',{points:I.keys.map((key,i)=>point(i,m.ivs[key]/31).join(',')).join(' '),class:'ip-radar-value'});
 I.keys.forEach((key,i)=>{const [cx,cy]=point(i,m.ivs[key]/31);make('circle',{cx,cy,r:3,class:'ip-radar-point'})});
 for(const tick of [8,16,24,31]){const [x,y]=point(0,tick/31),text=make('text',{x:x+5,y:y-3,class:'ip-radar-tick'});text.textContent=String(tick)}return svg;
}
function sheetTraits(m){
 const I=window.IDLE_INDIVIDUALS,nature=I.nature(m),talent=I.talent(m),grid=el('div',undefined,'ip-analysis-traits');
 for(const [label,value,help,kind]of [['Nature',nature.id,nature.up?'+10% '+I.labels[nature.up]+' · −10% '+I.labels[nature.down]:'Sem aumento ou redução de atributos','nature'],['Talento',talent.name,talent.description,'talent']]){const card=el('div');card.dataset.trait=kind;card.append(el('small',label),el('b',value),el('span',help));if(kind==='power')I.decorate(card,m);grid.append(card)}return grid;
}
function renderSheetSummary(body,m){
 const L=line(m),stats=ctx.stats(m,m.level),hp=sheetRatio(ctx.liveHealth?.(m.id)??m.condition??1),need=window.IDLE_XP.need(m.level),xp=Math.max(0,Number(m.xp)||0),layout=el('div',undefined,'ip-analysis-overview');
 const attributes=sheetCard('Condição e atributos','Valores individuais · nível '+m.level,'ip-analysis-attributes'),gauges=el('div',undefined,'ip-analysis-gauges');
 for(const [label,value,maximum,kind]of [['PS',hp,1,'hp'],['XP',xp,need,'xp']]){const box=el('div'),head=el('div'),track=el('div',undefined,'ip-analysis-gauge'),fill=el('i');head.append(el('span',label),el('b',kind==='hp'?sheetNumber(hp*100)+'%':sheetNumber(xp)+' / '+sheetNumber(need)+' XP'));box.dataset.gauge=kind;if(kind==='hp')box.dataset.health=hp===0?'fainted':hp<.25?'low':hp<.5?'medium':'normal';fill.style.width=(sheetRatio(value/maximum)*100)+'%';track.append(fill);box.append(head,track);gauges.append(box)}const pace=el('p','','ip-xp-pace');window.IDLE_XP.bind(pace,m);attributes.append(gauges,pace);
 const tiles=el('div',undefined,'ip-analysis-stat-grid');for(const [key,label,unit]of [['hp','PS máximo',''],['atk','Ataque',''],['spell','Poder',''],['armor','Defesa',''],['mr','Resistência',''],['speed','Vel. de ataque','/s']]){const tile=el('div');tile.dataset.stat=key;tile.append(el('small',label),el('strong',sheetNumber(stats[key],key==='speed'?2:0)),el('span',unit));if(['armor','mr'].includes(key))tile.title=(key==='armor'?'Redução física: ':'Redução especial: ')+window.IDLE_INDIVIDUALS.defenseText(stats[key])+' · Antes de tipos, escudos e outros efeitos.';tiles.append(tile)}attributes.append(tiles,el('p','Sem equipamentos, passivas ou bônus de combate.','ip-analysis-caption'));
 const potential=sheetPotentialRating(m);potential.append(ivBars(m,true));layout.append(attributes,potential);body.append(layout,sheetTraits(m));
}
function renderSheetCombat(body,m){
 const L=line(m),stats=ctx.stats(m,m.level);
 const combat=el('div',undefined,'ip-sheet-combat');
 const moveset=ctx.moves(m),skills=sheetCard('Golpes e passiva',null,'ip-analysis-skills'),moves=el('div',undefined,'ip-sheet-moves');
 const heading=el('div',undefined,'ip-sheet-move ip-sheet-move-heading');
 for(const label of ['Golpe','Tipo','Categoria','Dano estimado'])heading.append(el('b',label));
 moves.append(heading);
 for(const move of moveset){
  const row=el('div',undefined,'ip-sheet-move'),type=TYPES[move.t],kind=move.damageClass||(isSpec(L)?'spec':'phys');
  const support=['splash','teleport','transform','debuff','heal','barrier','buff'].includes(move.k)||move.emerald==='SKETCH';
  const badge=el('span',undefined,'ip-sheet-type');
  if(type){badge.style.setProperty('--type-accent',type.c);badge.append(image(SPR+'types/generation-ix/scarlet-violet/small/'+TID[move.t]+'.png','',''),el('span',type.n))}
  const description=move.emerald==='SKETCH'?'Copia um golpe do adversário durante a batalha.':moveText(L,m.star,move,stats.spell);
  row.append(el('b',move.n||move.name||'Golpe'),badge,el('small',support?'Suporte':kind==='spec'?'Especial':kind==='true'?'Dano direto':'Físico'),el('p',description));
  moves.append(row)
 }
 const ability=passive(m),effect=el('div',undefined,'ip-analysis-passive');
 effect.append(el('small','Passiva'),el('b',ability?.n||'Passiva da espécie'),el('p',ability?.d||'Consulte o efeito durante o combate.'));
 skills.append(moves,effect,el('p','Estimativa com o Poder atual, antes das defesas, tipos e demais bônus.','ip-analysis-caption'));
 combat.append(skills);
 if(window.IDLE_TYPE_VIEW){
  const damage=sheetCard('Dano recebido'),types=ctx.mega?.().selected(m)?.types||typesOf(L,m.star);
  const icons=Object.fromEntries(Object.keys(TYPES).map(t=>[t,SPR+'types/generation-ix/scarlet-violet/small/'+TID[t]+'.png']));
  damage.append(IDLE_TYPE_VIEW.create(types,TYPES,icons));combat.append(damage)
 }
 body.append(combat)
}
function sheetPotentialRating(m){
 const score=window.IDLE_INDIVIDUALS.potentialScore(m);
 const card=sheetCard('Potencial e IVs',null,'ip-potential-rating');
 const headline=el('div',undefined,'ip-potential-score');
 headline.append(el('strong',sheetNumber(score,2)+' / 10'),el('strong',window.IDLE_INDIVIDUALS.total(m)+' / 186 IVs'));headline.title='Nota de nascimento calibrada na espécie, com poder simulado no nível 100';card.append(headline);
 return card
}
function sheetPowerTiers(m){
 const I=window.IDLE_INDIVIDUALS,current=I.power(m).tier;
 const card=sheetCard('Potência deste Pokémon',null,'ip-potential-rating');
 const grid=el('div',undefined,'ip-potential-tiers');
 for(const tier of I.powers){
  const tile=el('div',undefined,'ip-potential-tier');
  tile.dataset.potency=tier.tier;
  tile.classList.toggle('is-current',tier.tier===current);
  const label=el('strong','P'+tier.tier+(tier.tier===current?' (atual)':''),'ip-power-badge');label.dataset.potency=tier.tier;
  const power=window.IDLE_TRAINER_CARD.strength({...m,potency:tier.tier});
  tile.append(label,el('small','Chance · '+tier.chance.toLocaleString('pt-BR',{maximumFractionDigits:3})+'%'),el('small','Bônus · +'+tier.bonus+'%'),el('small','Poder projetado'),el('span',sheetNumber(power),'ip-potential-strength'));
  grid.append(tile)
 }
 card.append(grid,el('p','A prévia usa o mesmo índice de poder da Arena e mantém nível, genes e equipamentos. As chances são do sorteio padrão.','ip-analysis-caption'));
 return card
}
function renderSheetPotential(body,m){
 const I=window.IDLE_INDIVIDUALS,layout=el('div',undefined,'ip-analysis-profile'),chart=sheetCard('Mapa dos IVs','Seis atributos · todos na escala de 0 a 31','ip-analysis-chart'),total=el('div',undefined,'ip-analysis-iv-total');total.append(el('strong',I.total(m)),el('span','/ 186 IVs'),el('b',sheetNumber(I.total(m)/186*100,1)+'%'));chart.append(total,ivRadar(m));
 const detail=sheetCard('Distribuição por atributo','A barra mede apenas o IV. A Nature aparece separada.','ip-analysis-distribution');detail.append(ivBars(m),el('p','0 é o menor IV; 31 é o máximo. O total não substitui a distribuição entre os atributos.','ip-analysis-caption'));layout.append(chart,detail);const analysis=el('details',undefined,'ip-analysis-card');analysis.append(el('summary','Análise detalhada dos IVs'),layout);body.append(analysis);
 const modifiers=sheetCard('Efeito nos atributos','Combinação de IV, Nature, potência e talento','ip-analysis-modifiers'),values=I.modifiers(m),grid=el('div');for(const key of I.keys){const bonus=Math.round((values[key]-1)*1000)/10,cell=el('div');cell.dataset.direction=bonus>0?'up':bonus<0?'down':'equal';cell.append(el('small',I.labels[key]),el('b',(bonus>0?'+':'')+sheetNumber(bonus,1)+'%'));grid.append(cell)}modifiers.append(grid);body.prepend(modifiers);

}
function movePartner(m,destination){if(ctx.busy(m))return;ctx.pause();const owned=s.team.includes(m);
 if(destination==='field'){
  if(s.team.filter(x=>x.pos?.z==='b').length>=ctx.capacity())return flash('Todos os espaços em campo estão ocupados.');
  if(!owned&&s.team.length>=ctx.capacity()+9)return flash('Equipe cheia. Guarde um parceiro no PC.');
  const used=new Set(s.team.filter(x=>x.pos?.z==='b').map(x=>x.pos.r+','+x.pos.c));let pos;for(const r of [5,6,7,4])for(const c of [1,3,5,0,2,4,6])if(!pos&&!used.has(r+','+c))pos={z:'b',r,c};if(!pos)return;
  if(!owned){s.collection=s.collection.filter(x=>x!==m);s.team.push(m)}m.pos=pos;
 }else if(destination==='reserve'){
  const used=new Set(s.team.filter(x=>x!==m&&x.pos?.z==='n').map(x=>x.pos.i));let slot=-1;for(let i=0;i<9;i++)if(!used.has(i)){slot=i;break}if(slot<0)return flash('As nove posições de reserva estão ocupadas.');if(!owned){if(s.team.length>=ctx.capacity()+9)return flash('Equipe cheia.');s.collection=s.collection.filter(x=>x!==m);s.team.push(m)}m.pos={z:'n',i:slot};
 }else{
  if(!owned)return;if(s.team.length<=1)return flash('Mantenha pelo menos um parceiro na equipe.');s.team=s.team.filter(x=>x!==m);delete m.pos;s.collection.push(m);
 }
 ctx.resetSelection();notice=name(m)+' · '+where(m);commit();
}
function flash(text){notice=text;render();renderBag();ctx.notify(text)}
function render(){if(!party||party.hidden)return;all().forEach(ctx.normalize);const m=chosen();if(!m)return;if(inDepot(m))ctx.normalize(m);current=m.id;party.dataset.view=partyView;if(partyView==='overview'){party.querySelector('header .ip-detail-back')?.remove();party.querySelector('header .ip-close').textContent='✕';renderOverview();return}const main=party.querySelector('#ip-party-detail');const previousBody=main.querySelector('.ip-detail-body'),scrollKey=String(m.id),sameMember=main.dataset.scrollKey===scrollKey,managementOpen=!sameMember||previousBody?.querySelector('.ip-sheet-management')?.open,previousScroll=sameMember?(previousBody?.scrollTop||0):0;main.dataset.scrollKey=scrollKey;main.replaceChildren();party.querySelector('header h2').textContent='Ficha do Pokémon';party.querySelector('header p').textContent='';if(!sameMember&&!matchMedia('(prefers-reduced-motion: reduce)').matches)party.animate([{opacity:.6,scale:'.985'},{opacity:1,scale:'1'}],{duration:210,easing:'ease-out'});const back=button('‹ Equipe',()=>{partyView='overview';render()},false,'ip-detail-back');
 const header=party.querySelector(':scope > header');header.querySelector('.ip-detail-back')?.remove();header.prepend(back);header.querySelector('.ip-close').textContent='Fechar';
 const identity=el('div',undefined,'ip-sheet-identity'),hero=el('div',undefined,'ip-hero'),words=el('div',undefined,'ip-sheet-name'),meta=el('div',undefined,'ip-sheet-meta');
 const portrait=IDLE_PMD_PORTRAITS.member(m,lines);portrait.className='ip-portrait';
 meta.append(el('b','Nível '+m.level),el('span',where(m)));const identityData=IDLE_PMD_PORTRAITS.identity(m,lines);words.append(el('small','Pokédex #'+String(identityData.id).padStart(3,'0'),'ip-sheet-dex-number'),el('h3',name(m)),meta);
 const types=el('div',undefined,'ip-sheet-types');
 const badges=ctx.typeBadges(m);
 for(const type of badges){const badge=el('span',undefined,'ip-sheet-type');badge.style.setProperty('--type-accent',type.color);badge.append(image(type.icon,'',''),el('span',type.name));types.append(badge)}
 hero.style.setProperty('--portrait-glow',badges[0]?.color||'#5ba5a6');
 const display=el('div',undefined,'ip-sheet-display');display.append(portrait);hero.append(display,words,types);identity.append(hero,protectionTools(m,false,true));
 if(!inDepot(m)&&ctx.mega?.().defs.some(d=>d.id===ctx.mega().species(m)))identity.append(button(ctx.mega().selected(m)?'Mega permanente':'Mega Evolução',()=>ctx.openMega(m.id)));
 main.append(identity);
 const body=el('div',undefined,'ip-detail-body');body.id='ip-sheet-panel';body.setAttribute('role','region');body.setAttribute('aria-label','Dados do Pokémon');body.tabIndex=0;main.append(body);
 if(notice){const status=el('p',notice,'ip-notice');status.setAttribute('role','status');body.append(status)}
 renderSheetSummary(body,m);body.append(sheetPowerTiers(m));renderSheetCombat(body,m);
 const potential=el('section',undefined,'ip-sheet-section');potential.dataset.sheetSection='profile';renderSheetPotential(potential,m);body.append(potential);
 {
  const cert=m.birthCertificate,card=el(cert?'details':'section',undefined,'ip-analysis-card ip-sheet-certificate');if(cert){card.append(el('summary','Certificado de nascimento'+(cert.lineage?' · '+cert.lineage:'')),el('p','Berçário · nasceu no nível 1 em '+new Date(cert.hatched).toLocaleString('pt-BR')));for(const parent of cert.parents||[])card.append(el('p',parent.name+(parent.shiny?' ✦':'')+' · P'+parent.potency+' · IV '+window.IDLE_INDIVIDUALS.total(parent)+'/186'));}else card.append(el('b','Certificado de nascimento'),el('small','Disponível para Pokémon nascidos no Berçário.'));
  if(!inDepot(m)){
  const management=el('details',undefined,'ip-sheet-management');management.open=managementOpen||releaseId===m.id;const managementHeading=el('summary','Organizar parceiro');managementHeading.append(el('small','Amizade '+(m.friendship||0)+'/100','ip-secondary-info'));management.append(managementHeading);
  const actions=el('div',undefined,'ip-actions');actions.append(button('Colocar em campo',()=>movePartner(m,'field'),ctx.busy(m)||m.pos?.z==='b'),button('Mover para reserva',()=>movePartner(m,'reserve'),ctx.busy(m)||m.pos?.z==='n'),button('Depositar no PC',()=>ctx.pcDeposit(m),ctx.busy(m)||!s.team.includes(m)));const others=all().filter(x=>x.id!==m.id&&(x.origin||x.name)===(m.origin||m.name));if(others.length)management.append(button('Comparar '+others.length+' repetido(s)',()=>{comparisonOpen=true;render();goToSheetSection('profile','.ip-analysis-comparison')}));
  const family=m.origin||m.name,recipient=all().find(x=>x.id!==m.id&&(x.origin||x.name)===family);if(recipient&&!s.team.includes(m))card.append(button(releaseId===m.id?'Confirmar conversão em 2 doces':'Converter repetido em 2 doces',()=>{if(m.favorite||m.locked||ctx.busy(m))return flash('Remova o favorito ou cadeado e conclua a atividade antes de converter.');if(releaseId!==m.id){releaseId=m.id;notice='Esta captura será removida. Equipamentos voltam à mochila e '+name(recipient)+' recebe dois doces. Confirme para continuar.';render();return}s.items.push(...(m.items||[]));recipient.candy=(recipient.candy||0)+2;s.collection=s.collection.filter(x=>x.id!==m.id);current=recipient.id;releaseId=null;notice='Conversão concluída. Dois doces adicionados ao parceiro.';commit()},m.favorite||m.locked||ctx.busy(m)));
  actions.append(button('Mais detalhes e ordens',()=>ctx.worldOpen('partners',m.id)));management.append(actions);body.append(management,card);
  }
 }
 {
 const I=window.IDLE_INDIVIDUALS;
 const candidates=all().filter(p=>p.id!==m.id&&(p.origin||p.name)===(m.origin||m.name));if(candidates.length){const comparison=el('details',undefined,'ip-analysis-comparison');comparison.open=comparisonOpen||!sameMember;comparison.append(el('summary','Comparar capturas da mesma família · '+candidates.length));const populate=()=>{
 if(comparison.childElementCount>1)return;
 const layout=el('div',undefined,'ip-sheet-comparison-layout'),controls=el('div'),picker=el('select');
 const other=candidates.find(p=>p.id===compareId)||candidates[0];compareId=other.id;
 picker.setAttribute('aria-label','Escolher Pokémon para comparar');
 for(const candidate of candidates){
  const option=el('option',name(candidate)+' · '+I.quality(candidate)+' · IV '+I.total(candidate)+'/186 · #'+String(candidate.id).replace('idle-',''));
  option.value=candidate.id;option.selected=candidate.id===compareId;picker.append(option)
 }
 picker.addEventListener('change',()=>{compareId=picker.value;layout.remove();populate();comparison.querySelector('select')?.focus()});
 const label=el('label','Escolher Pokémon');label.append(picker);controls.append(label);
 layout.append(controls);
 const level=m.level,a=ctx.stats(m,level),b=ctx.stats({...other,name:m.name,star:m.star,form:m.form||0},level),table=el('table',undefined,'ip-individual-comparison');const head=el('tr');for(const label of ['Atributo','Selecionado','Outro','Diferença'])head.append(el('th',label));table.append(head);for(const [key,label]of [['hp','PS'],['atk','Ataque'],['spell','Poder'],['armor','Defesa'],['mr','Resistência'],['speed','Vel. ataque']]){const row=el('tr'),decimals=key==='speed'?2:0,left=Number(a[key].toFixed(decimals)),right=Number(b[key].toFixed(decimals)),delta=Number((left-right).toFixed(decimals)),diff=el('td',(delta>0?'+':'')+delta);diff.dataset.direction=delta>0?'up':delta<0?'down':'equal';row.append(el('td',label),el('td',left),el('td',right),diff);table.append(row)}controls.append(el('p','Mesmo nível e forma, antes dos bônus de combate.','ip-help'));layout.append(table);comparison.append(layout)};comparison.ontoggle=()=>{comparisonOpen=comparison.open;if(comparison.open)populate()};if(comparison.open)populate();potential.append(comparison)}
 potential.append(el('p','IVs, Nature, potência e talento são preservados ao evoluir ou guardar no PC. Talentos são adaptações próprias do OakChess; a passiva da espécie continua separada.','ip-help'));
 }
 const lower=el('div',undefined,'ip-analysis-lower');
 const rule=ctx.evolveRule(m),training=sheetCard('XP e evolução',undefined,'ip-sheet-training');training.dataset.sheetSection='training';
 const need=window.IDLE_XP.need(m.level),remaining=Math.max(0,need-(m.xp||0));
 training.append(el('p','Faltam '+sheetNumber(remaining)+' XP para o nível '+(m.level+1)+'.'));
 const after=ctx.stats(m,m.level+1),projection=el('div',undefined,'ip-sheet-projection');
 for(const [key,label] of [['hp','PS'],['atk','Ataque'],['armor','Defesa'],['spell','Poder'],['mr','Resist.'],['speed','Veloc.']]){const stat=el('div');stat.append(el('small',label),el('b',sheetNumber(after[key],key==='speed'?2:0)));projection.append(stat)}
 const xp=el('progress');xp.max=need;xp.value=Math.max(0,m.xp||0);xp.setAttribute('aria-label','XP até o próximo nível');
 const xpRow=el('div',undefined,'ip-sheet-xp-row');xpRow.append(el('b','XP'),xp,el('b',sheetNumber(xp.value)+' / '+sheetNumber(need)));training.insertBefore(xpRow,training.lastChild);
 training.append(el('b','Atributos no nível '+(m.level+1)),projection);
 const family=el('div',undefined,'ip-sheet-evolution-line'),species=line(m);
 for(const [index,id] of species.ids.entries()){
  if(index)family.append(el('span','›'));
  const portrait=IDLE_PMD_PORTRAITS.create(id,m.shiny,0);
  portrait.setAttribute('aria-label',species.names[index]);family.append(portrait);
 }
 const requirements=el('div',undefined,'ip-sheet-requirements');requirements.append(el('b',rule.text||'Forma final'));if(!inDepot(m)&&!rule.final)requirements.append(button('Ver requisitos',()=>ctx.evolutionOpen(m.id)));training.append(family,requirements);
 const gear=sheetCard('Equipamentos',(m.items?.length||0)+'/3 espaços','ip-sheet-gear');gear.dataset.sheetSection='gear';
 const slots=el('div',undefined,'ip-sheet-slots');
 for(let i=0;i<3;i++){
  const key=m.items?.[i],slot=el('div',undefined,'ip-equipment-slot');
  if(key){
   const info=itemInfo(key),text=el('div');text.append(el('b',info.n),el('p',info.d));
   slot.append(image(itemSprite(info.s),'',''),text,button('Retirar',()=>{if(ctx.busy(m))return;m.items.splice(i,1);s.items.push(key);notice=info.n+' devolvido ao Pokéfone.';commit()},ctx.busy(m)));
  }else slot.append(el('b','Vaga '+(i+1)));
  slots.append(slot)
 }
 gear.append(slots);if(!inDepot(m))gear.append(button('Escolher equipamento',()=>openBag('gear'),ctx.busy(m)));
 lower.append(training,gear);body.insertBefore(lower,body.querySelector('.ip-sheet-management'));
 body.append(renderSheetOrigin(m),renderEvolutionCalculator(m,sameMember?previousBody?.querySelector('.ip-sheet-calculator'):null));
 body.scrollTop=previousScroll;
}
function renderSheetOrigin(m){
 const L=line(m),logged=m.captureToken?s.captureLog?.find(e=>e.memberToken===m.captureToken):s.captureLog?.find(e=>m.caughtAt&&e.memberCaughtAt===m.caughtAt&&L.names.includes(e.name));
 const d={...logged,...m.captureDetails},source=m.originSource||m.captureSource||logged?.source||(String(m.id).startsWith('fishing-')?'fishing':null);
 const hatch=m.birthCertificate?.hatched||m.hatchedAt,area=window.IDLE_WORLD_DATA?.regions?.[d.area],hunt=window.IDLE_REGION_HUNTS?.[d.area]?.habitats?.[d.hunt],ball=d.ball==='mystic'?'Mystic Ball':d.ball==='safari'?'Safari Ball':window.IDLE_ITEMS.balls[d.ball]?.name;
 const card=sheetCard('Registro de origem'),grid=el('dl',undefined,'ip-sheet-origin');
 const acquired=m.caughtAt||hatch,stamp=acquired?new Date(acquired):null;
 const sourceName={hunt:d.offline?'Caçada offline':'Caçada',safari:'Safari',fishing:'Pesca da Vila',egg:'Incubadora',gacha:'Gachapon',mystic:'Captura mística'}[source];
 const row=(label,value)=>{const cell=el('div');cell.append(el('dt',label),el('dd',value??'Não registrado'));grid.append(cell)};
 row('Origem',sourceName);row(hatch?'Data e hora da eclosão':d.localTime&&!stamp?'Hora da captura':'Data e hora da captura',stamp&&!Number.isNaN(+stamp)?stamp.toLocaleString('pt-BR'):d.localTime);
 if(d.speciesId){const index=L.ids.indexOf(d.speciesId);row('Espécie na captura',(index<0?'':L.names[index]+' · ')+'#'+String(d.speciesId).padStart(3,'0'))}
 row('Nível de origem',d.level||(source==='egg'||source==='gacha'?1:null));
 const place=[hunt?.name||area?.name,area?.continent].filter(Boolean).join(' · ');
 if(source==='hunt'||place&&source!=='safari')row('Local',place||null);
 if(source==='hunt'&&d.wave)row('Onda',d.wave);
 if(ball||source==='hunt'||source==='safari'||source==='mystic')row('Bola usada',ball);
 if(typeof d.chance==='number')row('Chance no lançamento',sheetNumber(d.chance*100,2)+'%');
 if(m.gachaRegion)row('Região do ovo',m.gachaRegion);
 row('Variante',m.shiny?'Shiny':'Normal');row('Gênero',window.IDLE_LIFE?.gender(m));
 card.append(grid);return card
}
function renderEvolutionCalculator(m,previousCard){
 const card=el('details',undefined,'ip-analysis-card ip-sheet-calculator');
 card.append(el('summary','Calculadora de evolução e Shiny'));card.open=!!previousCard?.open;
 card.addEventListener('toggle',()=>{
  if(!card.open||card.childElementCount>1)return;
  const I=window.IDLE_INDIVIDUALS,L=line(m),tools=el('div',undefined,'ip-sheet-calc-tools'),view=el('div');
  const level=el('input');level.type='number';level.min='1';level.step='1';level.value=m.level;
  const label=el('label','Nível simulado ');label.append(level);
  const selector=el('select');selector.setAttribute('aria-label','Estágio da evolução');
  const stages=[],seen=new Set();
  function addStage(family,star,form=0,megaKey=null,caption=family.names[star-1]){
   const id=family.ids[star-1],key=megaKey||id;if(!id||seen.has(key))return false;
   seen.add(key);stages.push({id,name:family.names[0],star,form,label:caption,megaKey});return true
  }
  for(let star=1;star<=m.star;star++)addStage(L,star,star===m.star?m.form||0:0);
  const current=stages.length-1,forecast={...m,megaKey:null};
  for(let step=0;step<8;step++){
   const rule=ctx.evolveRule(forecast);
   if(rule.final)break;
   if(rule.branchName)forecast.name=rule.branchName;
   forecast.star=rule.nextStar;forecast.form=0;
   const family=line(forecast);if(!family||!addStage(family,forecast.star))break;
  }
  const mega=ctx.mega?.().selected(m);if(mega)addStage(L,m.star,mega.form||1,mega.key,mega.label);
  for(const [i,stage] of stages.entries()){const option=el('option',stage.label);option.value=i;selector.append(option)}
  selector.value=previousCard?.querySelector('select')?.value??String(mega?stages.length-1:current);
  level.value=previousCard?.querySelector('input')?.value??m.level;
  const config=el('details',undefined,'ip-sheet-birth-options'),fields=el('div',undefined,'ip-sheet-birth-fields');
  config.append(el('summary','Simular outros IVs e potência'),fields);
  const ivInputs=Object.fromEntries(I.keys.map(key=>{
   const input=el('input');input.type='number';input.min=0;input.max=31;input.step=1;input.value=m.ivs[key];
   const field=el('label',I.labels[key]);field.append(input);fields.append(field);input.addEventListener('change',draw);return [key,input]
  }));
  const power=el('select');
  for(const tier of I.powers){const option=el('option','P'+tier.tier);option.value=tier.tier;power.append(option)}
  power.value=m.potency;power.addEventListener('change',draw);
  const potency=el('label','Potência');potency.append(power);fields.append(potency);
  tools.append(label,selector);card.append(tools,config,view);
  function draw(){
   const index=Number(selector.value),stage=stages[index],n=Math.max(1,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(level.value)||m.level)));
   const ivs=Object.fromEntries(I.keys.map(key=>[key,Math.max(0,Math.min(31,Math.floor(Number(ivInputs[key].value)||0)))]));
   const potency=Number(power.value),simulated=potency!==m.potency||I.keys.some(key=>ivs[key]!==m.ivs[key]),birth={...m,ivs,potency};
   const variants=[false,true].map(shiny=>({...birth,name:stage.name,star:stage.star,form:stage.form,megaKey:stage.megaKey,shiny}));
   const [normal,shiny]=variants.map(v=>ctx.stats(v,n)),previous=stages[stage.megaKey?current:index-1],before=previous?ctx.stats({...birth,name:previous.name,star:previous.star,form:previous.form,megaKey:previous.megaKey},n):null;
   const photos=el('div',undefined,'ip-sheet-calc-photos'),table=el('table',undefined,'ip-individual-comparison'),head=el('thead'),headers=el('tr'),data=el('tbody');
   for(const [i,v] of variants.entries()){
    const photo=el('figure'),portrait=IDLE_PMD_PORTRAITS.create(stage.id,v.shiny,stage.form);
    portrait.setAttribute('aria-label',stage.label+' '+(v.shiny?'Shiny':'Normal'));
    photo.append(portrait,el('figcaption',(i?'Shiny':'Normal')+' · '+stage.label));photos.append(photo)
   }
   for(const text of ['Atributo','Normal','Shiny','Diferença Shiny','Ganho do estágio anterior']){const th=el('th',text);th.scope='col';headers.append(th)}head.append(headers);
   const signed=(x,places)=>((x>0?'+':'')+sheetNumber(x,places));
   for(const [key,text,places] of [['hp','PS',0],['atk','Ataque',0],['armor','Defesa',0],['spell','Poder',0],['mr','Resistência',0],['speed','Vel. de ataque',2]]){
    const row=el('tr'),a=Number(normal[key].toFixed(places)),b=Number(shiny[key].toFixed(places));
    row.append(el('th',text),el('td',sheetNumber(a,places)),el('td',sheetNumber(b,places)),el('td',signed(b-a,places)),el('td',before?signed(a-Number(before[key].toFixed(places)),places):'—'));row.firstChild.scope='row';data.append(row)
   }
   const previousStages=stage.megaKey?stages.slice(0,current+1):stages.slice(0,index+1);
   const scores=variants.map(variant=>{
    let score=0,lastName=null,prior=0;
    for(const form of previousStages){
     const floor=form.name===m.name&&form.star>=m.star&&variant.shiny===m.shiny&&!simulated?m.evolutionRatingFloor:0;
     prior=score;
     score=I.potentialScore({...variant,name:form.name,star:form.star,megaKey:null,evolutionRatingFloor:Math.max(floor||0,lastName&&lastName!==form.name?score+.1:0)});
     lastName=form.name
    }
    if(stage.megaKey){prior=score;score=Math.min(10,score+.1)}
    return {score,prior}
   });
   const [normalNote,shinyNote]=scores.map(entry=>entry.score),row=el('tr');
   row.append(el('th','Nota de potencial'),el('td',sheetNumber(normalNote,2)+' / 10'),el('td',sheetNumber(shinyNote,2)+' / 10'),el('td',signed(shinyNote-normalNote,2)),el('td',before?signed(normalNote-scores[0].prior,2):'—'));row.firstChild.scope='row';data.append(row);
   const sum=a=>Math.round(a.hp+a.atk+a.spell+a.armor+a.mr),normalPower=sum(normal),shinyPower=sum(shiny),powerRow=el('tr');
   powerRow.append(el('th','Poder da Arena'),el('td',sheetNumber(normalPower)),el('td',sheetNumber(shinyPower)),el('td',signed(shinyPower-normalPower,0)),el('td',before?signed(normalPower-sum(before),0):'—'));powerRow.firstChild.scope='row';data.append(powerRow);table.append(head,data);
   const scroll=el('div',undefined,'ip-sheet-calc-table');scroll.append(table);
   view.replaceChildren(photos,scroll,el('p','A projeção segue a rota configurada e começa com os IVs, Nature, talento e potência deste Pokémon. A nota de nascimento usa o poder no nível 100 e sobe pelo menos 0,1 por evolução, até 10. Os atributos mostrados usam o nível simulado, antes de equipamentos e bônus de combate.','ip-analysis-caption'));
  }
  selector.addEventListener('change',draw);level.addEventListener('change',draw);draw()
 });
 return card
}
function goToSheetSection(key,selector){
 const body=party.querySelector('.ip-detail-body');
 const section=[...(body?.querySelectorAll('[data-sheet-section]')||[])].find(node=>node.dataset.sheetSection===key);
 const target=selector?section?.querySelector(selector):section;
 if(!target)return;
 body.scrollTo({top:body.scrollTop+target.getBoundingClientRect().top-body.getBoundingClientRect().top-12,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
function openRecipientPicker(){recipientPanel?.remove();all().forEach(ctx.normalize);let group='field',search='',page=0,onlyAvailable=true;recipientPanel=el('section',undefined,'ip-recipient-picker');recipientPanel.setAttribute('role','dialog');recipientPanel.setAttribute('aria-label','Escolher Pokémon para equipar');const head=el('header'),text=el('div');text.append(el('small','DESTINO DO EQUIPAMENTO'),el('h3','Quem vai usar?'));head.append(text,button('✕',()=>{recipientPanel.remove();recipientPanel=null}));recipientPanel.append(head);const tools=el('div',undefined,'ip-recipient-tools'),nav=el('nav');for(const [key,label]of [['field','Campo'],['reserve','Banco'],['pc','PC']]){const b=button(label,()=>{group=key;page=0;draw()});b.dataset.recipientGroup=key;nav.append(b)}const input=el('input');input.type='search';input.placeholder='Buscar Pokémon';input.setAttribute('aria-label','Buscar Pokémon para equipar');input.oninput=()=>{search=input.value;page=0;draw()};tools.append(nav,input);const available=el('label',undefined,'ip-recipient-available'),check=el('input');check.type='checkbox';check.checked=true;check.onchange=()=>{onlyAvailable=check.checked;page=0;draw()};available.append(check,document.createTextNode('Somente parceiros com vaga e disponíveis'));recipientPanel.append(tools,available);const grid=el('div',undefined,'ip-recipient-grid'),footer=el('footer');recipientPanel.append(grid,footer);bag.append(recipientPanel);
 function draw(){for(const b of nav.children)b.setAttribute('aria-pressed',String(b.dataset.recipientGroup===group));const members=(group==='pc'?s.collection:s.team.filter(m=>m.pos?.z===(group==='field'?'b':'n'))).filter(m=>name(m).toLowerCase().includes(search.toLowerCase())&&(!onlyAvailable||((m.items?.length||0)<3&&!ctx.busy(m)))).sort((a,b)=>b.level-a.level);const pages=Math.max(1,Math.ceil(members.length/9));page=Math.min(page,pages-1);grid.replaceChildren();for(const m of members.slice(page*9,page*9+9)){const blocked=ctx.busy(m)||(m.items?.length||0)>=3,b=button('',()=>{if(blocked)return;current=m.id;recipientPanel.remove();recipientPanel=null;renderBag()},blocked);b.className='ip-recipient-option';b.setAttribute('aria-pressed',String(current===m.id));const words=el('div');words.append(el('b',name(m)),el('small','Nv. '+m.level+' · '+(m.items?.length||0)+'/3 itens'),el('small',ctx.busy(m)?'Em atividade':(m.items?.length||0)>=3?'Sem espaço':'Disponível'));b.append(image(IDLE_PMD_THUMBNAIL.member(m,lines,window.IDLE_SHINY.sprite(sprite(line(m).ids[m.star-1]),m.shiny)),'',''),words);grid.append(b)}if(!members.length)grid.append(el('p','Nenhum parceiro nesta seleção. Troque o grupo ou desative o filtro de disponibilidade.','ip-empty'));footer.replaceChildren(button('←',()=>{page--;draw()},page===0),el('span',(page+1)+' / '+pages+' · '+members.length+' Pokémon'),button('→',()=>{page++;draw()},page>=pages-1))}draw();input.focus()
}
function renderBag(){if(!bag||bag.hidden)return;let wallet=bag.querySelector('.idle-wallet');if(!wallet){wallet=el('span',undefined,'idle-wallet');bag.querySelector('header>div').append(wallet)}wallet.textContent=Math.floor(s.gold).toLocaleString('pt-BR')+' ouro';for(const b of bag.querySelectorAll('[data-phone-dock]')){b.setAttribute('aria-pressed',String(b.dataset.phoneDock===phone.current()));if(b.dataset.phoneDock==='notices')b.title=phone.unread()+' avisos não lidos'}const body=bag.querySelector('#ip-bag-content');if(body.dataset.tab!==bagTab)body.scrollTop=0;body.dataset.tab=bagTab;if(phone.render(body))return;body.replaceChildren();phone.categories(body,bagTab,key=>{bagTab=key;notice='';renderBag()});if(notice)body.append(el('p',notice,'ip-notice'));
 if(bagTab==='gear'){
  const counts=new Map();for(const key of s.items)counts.set(key,(counts.get(key)||0)+1);if(selectedItem&&!counts.has(selectedItem))selectedItem=null;if(!selectedItem)selectedItem=counts.keys().next().value;
  const layout=el('div',undefined,'ip-inventory-layout'),grid=el('div',undefined,'ip-item-grid'),detail=el('div',undefined,'ip-item-detail');layout.append(grid,detail);body.append(el('p',s.items.length+' disponíveis · '+all().reduce((n,m)=>n+(m.items||[]).length,0)+' equipados','ip-help'),layout);
  for(const [key,count]of counts){const info=itemInfo(key),b=button('',()=>{selectedItem=key;renderBag()});b.setAttribute('aria-pressed',String(selectedItem===key));b.append(image(itemSprite(info.s),'',''),el('b',info.n),el('small','×'+count));grid.append(b)}
  if(!counts.size){grid.append(el('p','Nenhum equipamento disponível. Derrote lendários nos eventos para receber equipamentos.','ip-empty'));detail.append(button('Ver parceiros equipados',()=>open(current,'gear')));return}
  const info=itemInfo(selectedItem);detail.append(image(itemSprite(info.s),'','ip-item-large'),el('h3',info.n),el('p',info.d));const target=chosen(),recipient=button('',openRecipientPicker);recipient.className='ip-recipient-selected';if(target){const words=el('div');words.append(el('b',name(target)),el('small','Nv. '+target.level+' · '+where(target)),el('small',(target.items?.length||0)+'/3 itens · '+(ctx.busy(target)?'Em atividade':(target.items?.length||0)>=3?'Sem espaço':'Pode receber')));recipient.append(image(IDLE_PMD_THUMBNAIL.member(target,lines,window.IDLE_SHINY.sprite(sprite(line(target).ids[target.star-1]),target.shiny)),'',''),words,el('span','Trocar →'))}else recipient.textContent='Escolher Pokémon';const slots=el('div',undefined,'ip-recipient-slots');for(let i=0;i<3;i++){const key=target?.items?.[i],slot=el('span');if(key){const item=itemInfo(key);slot.append(image(itemSprite(item.s),item.n,''));slot.title=item.n}else{slot.textContent='+';slot.title='Espaço disponível'}slots.append(slot)}detail.append(el('label','Pokémon que receberá o item'),recipient,slots,button('Equipar neste parceiro',()=>{const m=chosen(),key=selectedItem,index=s.items.indexOf(key);if(!m||index<0||ctx.busy(m)||(m.items||[]).length>=3)return;s.items.splice(index,1);m.items=m.items||[];m.items.push(key);notice=info.n+' equipado em '+name(m)+'.';commit()},!target||ctx.busy(target)||(target.items||[]).length>=3,'ip-primary'),button('Ver equipamentos do parceiro',()=>open(current,'gear')));
 }else if(bagTab==='supplies'){
  for(const [title,items]of [['Poké Bolas',window.IDLE_ITEMS.balls],['Cura e recuperação',{...window.IDLE_ITEMS.healing,...window.IDLE_ITEMS.reviving}]]){const owned=Object.entries(items).filter(([key])=>window.IDLE_ITEMS.stock(s,key)>0);if(!owned.length)continue;const section=el('section',undefined,'ip-resource-card');section.append(el('h3',title));for(const [key,item]of owned){const row=el('div',undefined,'ip-resource-row');row.title=item.description||item.name;row.append(image('assets/pokeapi/sprites/items/'+item.sprite+'.png','','idle-item-icon'),el('b',item.name),el('span','×'+window.IDLE_ITEMS.stock(s,key)));section.append(row)}body.append(section)}
  const sweets=all().filter(m=>m.candy>0);if(sweets.length)body.append(el('h3','Doces por espécie'));for(const m of sweets){const row=el('div',undefined,'ip-resource-row');row.append(image(IDLE_PMD_THUMBNAIL.member(m,lines,window.IDLE_SHINY.sprite(sprite(line(m).ids[m.star-1]),m.shiny)),'',''),el('b','Doces de '+m.name),el('span','×'+m.candy),button('Treinar',()=>open(m.id,'training')));body.append(row)}if(!body.querySelector('.ip-resource-row'))body.append(el('p','Nenhum suprimento guardado.','ip-empty'));const actions=el('div',undefined,'ip-phone-actions');actions.append(button('Automação',()=>ctx.automation('capture')),button('Loja',ctx.shopOpen));body.append(actions);
 }else if(bagTab==='evolution'){
 const top=el('div',undefined,'ip-stock-toolbar');top.append(el('p','Pedras e materiais de evolução','ip-help'),button('Consultar evolução',()=>ctx.evolutionOpen(current)));body.append(top);
 const grid=el('div',undefined,'ip-stock-grid');body.append(grid);
 for(const [key,label]of Object.entries(window.IDLE_WORLD_DATA.stones)){const count=s.world.stones[key]||0;if(!count)continue;const card=el('article',undefined,'ip-stock-card');card.dataset.empty=String(!count);card.append(image(window.IDLE_DROPS.stoneIcon(key),label,'idle-item-icon'),el('b',label),el('strong','×'+count));grid.append(card)}
 if(!grid.children.length)grid.append(el('p','Nenhuma pedra de evolução guardada.','ip-empty'));body.append(el('p','Consulte a receita do Pokémon antes de usar.','ip-help'));
 }else{
 const stock=Object.entries(ctx.hunts.lootTypes).filter(([key])=>(s.hunts.loot[key]||0)>0),total=stock.reduce((n,[key,info])=>n+s.hunts.loot[key]*info.price,0),top=el('div',undefined,'ip-stock-toolbar');const summary=el('div',undefined,'ip-material-summary');for(const [label,value]of [['Tipos de loot',stock.length],['Unidades',stock.reduce((n,[key])=>n+s.hunts.loot[key],0)],['Valor de venda',total+' ouro']]){const metric=el('div');metric.append(el('small',label),el('strong',value));summary.append(metric)}top.append(summary,button('Vender todo o loot · '+total+' ouro',()=>{let value=0;for(const [key,info]of stock){value+=(s.hunts.loot[key]||0)*info.price;s.hunts.loot[key]=0}s.gold+=value;notice='Materiais vendidos por '+value+' ouro.';commit(false)},!total));body.append(top);
 const grid=el('div',undefined,'ip-stock-grid ip-loot-grid');body.append(grid);if(!stock.length)grid.append(el('p','Nenhum material em estoque.','ip-help'));
 for(const [key,info]of stock){const count=s.hunts.loot[key],card=el('article',undefined,'ip-stock-card');const identity=el('div',undefined,'ip-loot-identity'),copy=el('div'),quantity=el('span','×'+count,'ip-loot-count');copy.append(el('b',info.name),el('small',info.price+' ouro por unidade'));identity.append(image(window.IDLE_DROPS.icon(info),'','idle-item-icon'),copy,quantity);const footer=el('div',undefined,'ip-loot-footer'),value=el('div');value.append(el('small','Valor do lote'),el('strong',count*info.price+' ouro'));footer.append(value,button('Vender lote',()=>{const n=s.hunts.loot[key]||0;if(!n)return;s.gold+=n*info.price;s.hunts.loot[key]=0;notice=info.name+' vendido.';commit(false)}));card.append(identity,footer);grid.append(card)}
 const resourceHeading=el('div',undefined,'ip-resource-heading');resourceHeading.append(el('h3','Recursos da jornada'),el('small','Exploração, escrituras e Mega Pedras'));const resources=el('div',undefined,'ip-stock-resources');body.append(resourceHeading,resources);
for(const key of IDLE_RESOURCES.keys){const count=IDLE_RESOURCES.count(s,key);if(!count)continue;const card=el('section',undefined,'ip-stock-resource');card.append(image(IDLE_RESOURCES.image(key),IDLE_RESOURCES.names[key],'idle-item-icon'),el('b',IDLE_RESOURCES.names[key]),el('strong',count),button(key==='mysticTickets'?'Escolher encontro':'Forja do Carvalho',()=>key==='mysticTickets'?window.IDLE_MYSTIC_ENCOUNTERS?.():window.IDLE_OPEN_FORGE?.(key==='mysticBallFragments'||key==='mysticBalls'?'ball':'ticket')));resources.append(card)}
if(ctx.mega&&ctx.mega().data.tokens>0){const mega=ctx.mega(),card=el('section',undefined,'ip-stock-resource');card.append(image(IDLE_RESOURCES.image('tokens'),'Bronze Boss Token','idle-item-icon'),el('b','Bronze Boss Tokens'),el('strong',mega.data.tokens),el('small','Entrada no Portal Hoopa · '+mega.defs.reduce((sum,d)=>sum+(mega.data.fragments[d.key]||0),0)+' fragmentos de Mega Pedras guardados.'),button('Portal Hoopa',()=>window.IDLE_OPEN_EVENTS?.()));resources.append(card)}
 for(const [label,count,help,action,icon]of [['Safari Tickets',s.safari?.tickets||0,'60 minutos por ticket. Entrada pelo menu Modos.',()=>window.IDLE_OPEN_SAFARI?.(),'safari-ticket'],['Materiais de exploração',s.world.materials,'Usados em tarefas, fósseis e aptidões.',()=>ctx.worldOpen('activities'),'exploration-materials'],['Fragmentos Mega',s.world.mega?.universalFragments||0,'Universais: completam a receita de 100 com os fragmentos específicos.',()=>window.IDLE_OPEN_MEGA_CRAFT?.(),'mega-fragment'],['Fragmentos de Escritura',s.village?.fragments||0,'10 fragmentos = 1 sorteio de casa com Dona Rosa.',()=>window.IDLE_VILLAGE?.deeds(),'deed-fragment'],['Fragmentos de fóssil',s.world.fossils,'Restauração: 3 fragmentos + 5 materiais.',()=>ctx.worldOpen('lab'),'fossil-fragments']]){if(!(count>0))continue;const card=el('section',undefined,'ip-stock-resource');card.append(image(icon==='safari-ticket'?IDLE_RESOURCES.image('safari'):icon==='mega-fragment'?IDLE_RESOURCES.image('universalFragments'):'modes/idle/assets/menu-icons/'+icon+'.svg','','idle-item-icon'),el('b',label),el('strong',count),el('small',help),button(label==='Safari Tickets'?'Safari':label==='Fragmentos de fóssil'?'Laboratório':label==='Fragmentos de Escritura'?'Dona Rosa':label==='Fragmentos Mega'?'Carvalho':'Tarefas',action));resources.append(card)}
 }
}
window.addEventListener('idle-nursery-member',event=>{if(all().some(m=>m.id===event.detail)){ctx.closePanels();open(event.detail)}});
return {mount,open,openBag,close,refresh(){render();renderBag()}};
};
