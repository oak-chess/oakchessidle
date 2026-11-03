/* Tower sectors. Campaign storage and campaign round resolution are never used here. */
(()=>{
'use strict';
const KEY='oakchess_tower_sector1_v1',PREVIEW_KEY=KEY+'_preview',RECORDS=KEY+'_records';
const FLOORS=[
 {name:'Portão da Torre',tag:'COMBATE',theme:0,art:'elite.webp',rule:'Os guardiões de pedra protegem a entrada. Monte uma equipe de até três Pokémon.',team:[[74,1,.75],[27,1,.75]],reward:4},
 {name:'Jardim Suspenso',tag:'ARENA VIVA',theme:3,art:'event.png',rule:'Dois canteiros recuperam 4% dos PS máximos a cada 2s. A cura beneficia os dois lados.',team:[[43,1,.9],[10,2,.8],[69,1,.8]],reward:5},
 {name:'Caminhos da Torre',tag:'ESCOLHA',theme:0,art:'elite.webp',rule:'Escolha o caminho comum ou uma elite com mais vida e dano, que concede uma relíquia aprimorada.',team:[[66,1,1],[56,1,.9],[74,2,.85]],reward:5},
 {name:'Refúgio da Chansey',tag:'DESCANSO',theme:-1,art:'event.png',rule:'Sem combate. Escolha recuperar vida, receber um equipamento ou reforçar a próxima loja.',team:[],reward:0},
 {name:'Sentinela de Pedra',tag:'CHEFE',theme:0,art:'elite.webp',rule:'Quando Onix fica com metade dos PS, anuncia abalos em duas colunas. O aviso dura 2,5s; os abalos se repetem a cada 8s.',team:[[95,1,2.2],[74,2,.8],[27,2,.8]],reward:8},
 {name:'Galeria dos Ecos',tag:'RESSONÂNCIA',theme:'psychic',rule:'Dois focos recuperam 5% dos PS a cada 3s, para ambos os lados. Posicione sua linha de frente nos focos.',team:[[63,2,.95],[96,1,1.15],[39,2,.9]],reward:7},
 {name:'Salão das Visões',tag:'ARENA VIVA',theme:'psychic',rule:'A cada 7s, três hexágonos ocupados são marcados. Após 2s, uma onda causa 10% dos PS máximos aos ocupantes dos dois lados.',team:[[92,2,1],[96,2,.95],[41,2,.9]],reward:8},
 {name:'Provação da Mente',tag:'ESCOLHA',theme:'psychic',rule:'Guardas ou elite: a elite tem +30% PS e +15% dano, concede +4 ouro e aprimora a relíquia escolhida.',team:[[63,2,1.1],[96,2,1.05],[122,1,1.1],[48,2,.9]],reward:8},
 {name:'Refúgio dos Sonhos',tag:'DESCANSO',theme:'psychic',rule:'Escolha recuperar até 30 de vida, receber equipamento ou renovar a loja com +3 ouro.',team:[],reward:0},
 {name:'Oráculo da Torre',tag:'CHEFE',theme:'psychic',rule:'Alakazam marca três posições por 2s e causa 14% dos PS aos ocupantes. Abaixo de metade dos PS, marca cinco posições a cada 5s. O efeito atinge ambos os lados.',team:[[63,3,1.45],[96,2,1.05],[122,1,1.15]],reward:12},
 {name:'Trilha das Vinhas',tag:'RAÍZES',theme:3,rule:'A cada 8s, raízes marcam três posições ocupadas por 2s. Ao brotar, causam 7% dos PS e prendem por 1s. Atingem ambos os lados.',team:[[69,2,1.2],[114,1,1.25],[43,2,1.1]],variants:[[[69,2,1.2],[114,1,1.25],[43,2,1.1]],[[1,2,1.2],[69,3,1],[46,2,1.1]],[[114,1,1.3],[43,3,1.05],[13,3,1.1]]],reward:9},
 {name:'Clareira dos Esporos',tag:'ARENA VIVA',theme:3,rule:'Nuvens anunciam dois canteiros por 2s e permanecem por 4s. Ocupantes dos dois lados perdem 3% dos PS por segundo.',team:[[46,2,1.2],[48,2,1.2],[10,3,1.1]],variants:[[[46,2,1.2],[48,2,1.2],[10,3,1.1]],[[43,3,1.15],[46,2,1.2],[13,3,1.1]],[[48,2,1.25],[69,3,1.05],[41,3,1.05]]],reward:10},
 {name:'Colmeia Partida',tag:'ESCOLHA',theme:3,rule:'Enxame de Beedrill ou elite liderada por Scyther. A elite recebe +30% PS e +15% dano e concede relíquia aprimorada e +4 ouro.',team:[[13,3,1.2],[13,3,1.15],[10,3,1.15],[46,2,1.1]],variants:[[[13,3,1.2],[13,3,1.15],[10,3,1.15],[46,2,1.1]],[[13,3,1.2],[48,2,1.2],[46,2,1.2],[10,3,1.1]],[[13,3,1.25],[13,3,1.15],[48,2,1.15],[43,2,1.2]]],eliteTeam:[[123,1,1.45],[13,3,1.2],[48,2,1.2],[46,2,1.15]],reward:10},
 {name:'Árvore Ancestral',tag:'SANTUÁRIO',theme:3,rule:'Escolha recuperar até 30 de vida, aprimorar uma relíquia ou colher 10 de ouro.',team:[],reward:0},
 {name:'Guardião da Floresta',tag:'CHEFE',theme:3,rule:'Venusaur anuncia três sementes por 2s. Elas florescem por 4s: curam seus aliados em 3% dos PS/s e causam 4% dos PS/s à sua equipe. Abaixo de metade da vida, planta cinco sementes.',team:[[1,3,1.65],[114,1,1.25],[69,3,1.15]],variants:[[[1,3,1.65],[114,1,1.25],[69,3,1.15]],[[1,3,1.65],[43,3,1.15],[46,2,1.2]],[[1,3,1.65],[102,2,1.15],[48,2,1.15]]],reward:15}
];
const SECTORS=window.TOWER_SECTORS;
for(let si=3;si<SECTORS.length;si++){
 const s=SECTORS[si],scale=1.05+si*.18,star=si>=5?3:2,count=si>=8?5:4;
 for(let slot=0;slot<5;slot++){
  const variants=Array.from({length:3},(_,v)=>Array.from({length:count},(_,j)=>[s.pool[(slot*2+v*3+j)%s.pool.length],star,scale]));
  if(si===11&&slot<3){const pools=[[86,90,124,131,79,120],[81,125,100,172,137,133],[126,58,37,228,77,4]],pool=pools[slot];for(let v=0;v<3;v++)variants[v]=Array.from({length:count},(_,j)=>[pool[(j+v)%pool.length],3,scale])}
  if(slot===4)for(let v=0;v<3;v++)variants[v]=[[s.boss,3,scale*1.25],...variants[v].filter(p=>p[0]!==s.boss).slice(0,count-1)];
  const mode=si===11&&slot<3?['blizzard','discharge','eruption'][slot]:slot===4?s.bossMode:slot===0?{3:'water-pools',4:'conductors',5:'embers',6:'shadows',7:'freeze',8:'duel',9:'falling',10:'wind'}[si]:s.mode;
  FLOORS.push({name:s.names[slot],tag:slot===4?'CHEFE':slot===3?'EVENTO':slot===2?'ESCOLHA':'ARENA VIVA',theme:si===11&&slot<3?['articuno','zapdos','moltres'][slot]:s.theme,rule:s.rules[slot],team:slot===3?[]:variants[0],variants:slot===3?null:variants,eliteTeam:s.elite.map(id=>[id,star,scale]),reward:slot===3?0:slot===4?15+si:8+si,mode,sector:si,bossId:slot===4?s.portrait:null,icon:slot===4?s.portrait:slot===3?113:variants[0][0][0]});
 }
}
const sectorOf=i=>SECTORS[Math.floor(i/5)]?.roman||'I';
const sectorName=i=>SECTORS[Math.floor(i/5)]?.name||'Torre';
const isPath=i=>i%5===2;
const isRest=i=>i%5===3;
const upgradeLimit=t=>Math.min(6,Math.ceil((t.floor+1)/10));
const canUpgrade=t=>t.relics.filter(r=>r.power===2).length<upgradeLimit(t);
FLOORS.forEach((floor,i)=>{if(isPath(i))floor.rule='Escolha Guardas (normal), Elite (+30% PS, +15% dano; +4 ouro, 2 poções e aprimoramento se permitido) ou Tesouro (+15% PS, +25% dano; +8 ouro e 1 poção).'});
const availableRelics=t=>t.rewardKind==='upgrade'?(canUpgrade(t)?t.relics.filter(r=>r.power!==2).map(r=>r.id):[]):Object.keys(RELICS).filter(id=>!t.relics.some(r=>r.id===id));
const RELICS={
 shell:{name:'Concha Restauradora',item:'shell-bell',color:'#8ed9ee',text:'Regenera 1% dos PS máximos/s.',strong:'Regenera 1,5% dos PS máximos/s.'},
 feather:{name:'Pena do Impulso',item:'choice-scarf',art:'assets/tower-art/feather.svg',color:'#f1dc91',text:'+12% de velocidade de ataque.',strong:'+18% de velocidade de ataque.'},
 root:{name:'Raiz Persistente',item:'big-root',color:'#a8d493',text:'Após 3s parado: regenera 3% dos PS máximos/s.',strong:'Após 3s parado: regenera 4,5% dos PS máximos/s.'},
 reserve:{name:'Núcleo de Reserva',item:'assault-vest',color:'#a1b8e8',text:'+3 Armadura e D. Esp. por reserva. Máximo: 4.',strong:'+5 Armadura e D. Esp. por reserva. Máximo: 4.'},
 last:{name:'Medalhão do Último',item:'focus-sash',color:'#efb6d4',text:'Último aliado: escudo de 30% dos PS por 5s. Uma vez por luta.',strong:'Último aliado: escudo de 45% dos PS por 5s. Uma vez por luta.'},
 crystal:{name:'Cristal de Sintonia',item:'expert-belt',color:'#c9b6ee',text:'4 tipos em campo: +10% de dano.',strong:'4 tipos em campo: +15% de dano.'},
 heart:{name:'Coração da Torre',item:'leftovers',scene:'root',color:'#eaa8b7',text:'+12% de PS máximos.',strong:'+18% de PS máximos.'},
 blade:{name:'Lâmina do Guardião',item:'muscle-band',scene:'reserve',color:'#deb78d',text:'+12% de dano dos ataques básicos.',strong:'+18% de dano dos ataques básicos.'},
 lens:{name:'Lente do Oráculo',item:'wise-glasses',scene:'crystal',color:'#bba5ed',text:'+15% de poder das habilidades.',strong:'+22% de poder das habilidades.'},
 battery:{name:'Centelha Engarrafada',item:'leppa-berry',scene:'crystal',color:'#efda89',text:'+20 de mana no início da luta.',strong:'+30 de mana no início da luta.'},
 spring:{name:'Fonte Arcana',item:'mystic-water',scene:'shell',color:'#96d8eb',text:'Recupera 2 de mana por segundo.',strong:'Recupera 3 de mana por segundo.'},
 fang:{name:'Presa Rubra',item:'shell-bell',scene:'last',color:'#e59b9b',text:'Rouba vida em 8% do dano causado.',strong:'Rouba vida em 12% do dano causado.'},
 plate:{name:'Placa de Basalto',item:'hard-stone',scene:'reserve',color:'#c4b49c',text:'+12 de Armadura.',strong:'+18 de Armadura.'},
 veil:{name:'Véu de Ametista',item:'spell-tag',scene:'crystal',color:'#cba8ec',text:'+12 de Defesa Especial.',strong:'+18 de Defesa Especial.'},
 clover:{name:'Trevo do Desvio',item:'bright-powder',scene:'root',color:'#b7dc91',text:'+8% de esquiva.',strong:'+12% de esquiva.'},
 scope:{name:'Olho do Caçador',item:'scope-lens',scene:'feather',color:'#e7bc85',text:'+10% de chance de crítico.',strong:'+15% de chance de crítico.'},
 crown:{name:'Coroa do Impacto',item:'razor-claw',scene:'reserve',color:'#e8cd90',text:'+25% de dano crítico.',strong:'+40% de dano crítico.'},
 ward:{name:'Selo da Aurora',item:'light-clay',scene:'shell',color:'#a8d8db',text:'Começa com escudo de 12% dos PS por 6s.',strong:'Começa com escudo de 18% dos PS por 6s.'},
 vanguard:{name:'Juramento da Frente',item:'rocky-helmet',scene:'reserve',color:'#c7b693',text:'Nas duas filas da frente: +16 de Armadura.',strong:'Nas duas filas da frente: +24 de Armadura.'},
 rear:{name:'Runas da Retaguarda',item:'twisted-spoon',scene:'crystal',color:'#cab8ec',text:'Nas duas filas de trás: +18% de poder das habilidades.',strong:'Nas duas filas de trás: +27% de poder das habilidades.'},
 lone:{name:'Insígnia Solitária',item:'black-belt',scene:'last',color:'#ddafbb',text:'Sem aliado adjacente ao começar: +15% de dano.',strong:'Sem aliado adjacente ao começar: +22% de dano.'},
 chorus:{name:'Estandarte da União',item:'soothe-bell',scene:'root',color:'#afcf9c',text:'Com 2 aliados adjacentes ao começar: +12% de velocidade de ataque.',strong:'Com 2 aliados adjacentes ao começar: +18% de velocidade de ataque.'},
 tempo:{name:'Ampulheta Viva',item:'quick-claw',scene:'feather',color:'#e6d39b',text:'Após 10s de luta: +20% de velocidade de ataque.',strong:'Após 10s de luta: +30% de velocidade de ataque.'},
 rescue:{name:'Luz do Recomeço',item:'sitrus-berry',scene:'shell',color:'#d4d99c',text:'Abaixo de 35% dos PS: cura 15%. Uma vez por Pokémon por luta.',strong:'Abaixo de 35% dos PS: cura 22%. Uma vez por Pokémon por luta.'}
};
let overlay=null,returnFocus=null,saveFailed=false,mechanic=null,lastDraw=-1;
const marks=document.createElement('canvas');marks.width=1280;marks.height=800;marks.id='towerHexMarks';marks.hidden=true;
document.getElementById('arenaView').insertBefore(marks,document.getElementById('units'));
const hud=document.createElement('aside');hud.id='towerHud';hud.hidden=true;document.getElementById('stage').append(hud);
// Bind once: HUD contents are rebuilt as the game updates.
hud.addEventListener('pointerover',e=>{
 if(e.pointerType==='touch')return;
 const target=e.target.closest('button,summary,.tower-position-bonus,.tower-hud-emblem');
 if(!target||target.disabled||e.relatedTarget instanceof Node&&target.contains(e.relatedTarget))return;
 SND.hover();
});
hud.addEventListener('focusin',e=>{if(e.target.matches('button:not(:disabled),summary'))SND.hover()});
hud.addEventListener('click',e=>{
 const target=e.target.closest('button,summary');if(!target||target.disabled)return;
 SND.init();if(target.tagName==='SUMMARY'&&target.parentElement.open)SND.mback();else SND.click();
},true);
const art=id=>'assets/tower-art/illustrated/'+id+'.webp';
function warmTowerCards(){
 const loader=window.OAK_ASSETS;if(!loader)return;
 const urls=['guardas','elite','tesouro'].map(id=>'assets/tower-art/route-cards/'+id+'-v1.webp');
 for(const id of ['heal','item','shop','relic','upgrade','gold','supplies','cleanse','protect','offense','defense','disable','risk','cursed-chest'])urls.push('assets/tower-art/event-cards/'+id+'-v1.webp');
 loader.warm(urls);
}
const itemImage=id=>'assets/pokeapi/sprites/items/'+id+'.png';
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const current=()=>G.tower;
const active=()=>!!current();
const relicCapacity=t=>Math.min(6,3+Math.floor(Math.max(t.floor,...t.cleared.map(i=>i+1))/15));
function ensureLoadout(t=current()){
 if(!t)return;
 if(!Array.isArray(t.equippedRelics)){t.equippedRelics=[];t.needsRelicSetup=t.relics.length>0}
 t.equippedRelics=[...new Set(t.equippedRelics)].filter(id=>t.relics.some(r=>r.id===id)).slice(0,relicCapacity(t));
}
function equippedRelics(){const t=current();if(!t)return[];ensureLoadout(t);return t.relics.filter(r=>t.equippedRelics.includes(r.id))}
function equipNewRelic(id){const t=current();ensureLoadout(t);if(t.equippedRelics.length<relicCapacity(t)&&!t.equippedRelics.includes(id))t.equippedRelics.push(id)}
let storedRelicPage=0;
function relicInventory(){
 const t=current();ensureLoadout(t);const selected=new Set(t.equippedRelics);
 const entry=(r,on)=>{const d=RELICS[r.id],blocked=!on&&selected.size>=relicCapacity(t);return '<details data-relic-id="'+r.id+'" class="tower-map-relic '+(on?'equipped':'stored')+'"><summary><img src="'+(d.art||itemImage(d.item))+'" alt=""><b>'+esc(d.name)+(r.power===2?' ★':'')+'</b></summary><p>'+esc(r.power===2?d.strong:d.text)+'</p><button type="button" data-equip-relic="'+r.id+'" '+(blocked?'disabled title="Guarde uma relíquia equipada para liberar espaço"':'')+'>'+(on?'Guardar':'Equipar')+'</button></details>'};
 const equipped=t.relics.filter(r=>selected.has(r.id)),stored=t.relics.filter(r=>!selected.has(r.id));
 const pages=Math.max(1,Math.ceil(stored.length/6));storedRelicPage=Math.max(0,Math.min(storedRelicPage,pages-1));
 const visibleStored=stored.slice(storedRelicPage*6,storedRelicPage*6+6);
 const pager=pages>1?'<nav class="tower-relic-pages" aria-label="Páginas de relíquias guardadas"><button type="button" data-relic-page="-1" aria-label="Página anterior" '+(storedRelicPage===0?'disabled':'')+'>‹</button><span>'+(storedRelicPage+1)+' / '+pages+'</span><button type="button" data-relic-page="1" aria-label="Próxima página" '+(storedRelicPage===pages-1?'disabled':'')+'>›</button></nav>':'';
 return '<section class="tower-loadout-section" data-relic-zone="equipped"><h4>Equipadas <b>'+equipped.length+'/'+relicCapacity(t)+'</b></h4>'+equipped.map(r=>entry(r,true)).join('')+Array.from({length:relicCapacity(t)-equipped.length},()=>'<div class="tower-loadout-empty-slot">＋ Espaço livre</div>').join('')+'</section><section class="tower-loadout-section" data-relic-zone="stored"><h4>Guardadas <b>'+stored.length+'</b></h4>'+(visibleStored.map(r=>entry(r,false)).join('')||'<p class="tower-map-empty">Nenhuma guardada.</p>')+pager+'</section><p class="tower-loadout-hint">Somente as equipadas concedem bônus. Troque na preparação.'+(relicCapacity(t)<6?' Mais espaços após os andares 15, 30 e 45.':'')+'</p>';
}
function bindRelicInventory(root){
 root.querySelectorAll('[data-relic-page]').forEach(button=>button.onclick=()=>{
  if(button.disabled)return;storedRelicPage+=Number(button.dataset.relicPage);SND.click();
  const area=root.querySelector('[data-relic-inventory]'),scroll=area.scrollTop;area.innerHTML=relicInventory();area.scrollTop=scroll;bindRelicInventory(root);
  area.querySelector('[data-relic-zone="stored"] h4')?.setAttribute('tabindex','-1');
  area.querySelector('[data-relic-zone="stored"] h4')?.focus({preventScroll:true});
 });
 root.querySelectorAll('[data-relic-id] summary').forEach(handle=>{
  handle.onpointerdown=e=>{
   if(e.button!==0||G.phase!=='plan')return;
   const card=handle.closest('[data-relic-id]'),id=card.dataset.relicId,startX=e.clientX,startY=e.clientY,rect=card.getBoundingClientRect(),grabX=startX-rect.left,grabY=startY-rect.top;
   let ghost=null,zone=null,targetCard=null;
   const clearZone=()=>{if(zone)zone.classList.remove('relic-drop-target','relic-drop-full');if(targetCard)targetCard.classList.remove('relic-swap-target');zone=null;targetCard=null};
   const move=ev=>{
    if(!ghost&&Math.hypot(ev.clientX-startX,ev.clientY-startY)<7)return;
    if(!ghost){
     ghost=card.cloneNode(true);ghost.classList.add('tower-relic-drag-ghost');ghost.removeAttribute('open');
     ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.boxSizing='border-box';ghost.style.font=getComputedStyle(handle).font;document.body.appendChild(ghost);card.classList.add('relic-drag-source');
     handle.setPointerCapture(e.pointerId);
    }
    ev.preventDefault();ghost.style.left=(ev.clientX-grabX)+'px';ghost.style.top=(ev.clientY-grabY)+'px';
    clearZone();const hit=document.elementFromPoint(ev.clientX,ev.clientY);
    const candidate=hit?.closest('[data-relic-zone]');
    if(candidate&&root.contains(candidate)){
     zone=candidate;const hitCard=hit.closest('[data-relic-id]');
     if(hitCard&&hitCard!==card&&root.contains(hitCard))targetCard=hitCard;
     const on=current().equippedRelics.includes(id),swap=targetCard&&current().equippedRelics.includes(targetCard.dataset.relicId)!==on;
     const full=zone.dataset.relicZone==='equipped'&&!on&&!swap&&current().equippedRelics.length>=relicCapacity(current());
     if(swap)targetCard.classList.add('relic-swap-target');else zone.classList.add(full?'relic-drop-full':'relic-drop-target');
    }
   };
   const finish=ev=>{
    handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',cancel);
    if(!ghost)return;
    if(ev.type==='pointerup')move(ev);
    const target=zone?.dataset.relicZone,swapId=targetCard?.dataset.relicId;clearZone();ghost.remove();card.classList.remove('relic-drag-source');
    handle.addEventListener('click',event=>{event.preventDefault();event.stopPropagation()},{capture:true,once:true});
    if(ev.type==='pointerup'&&target&&G.phase==='plan'){
     const t=current();ensureLoadout(t);const on=t.equippedRelics.includes(id),otherOn=swapId&&t.equippedRelics.includes(swapId);
     if(swapId&&on!==otherOn){
      const remove=on?id:swapId,add=on?swapId:id;
      t.equippedRelics=t.equippedRelics.map(value=>value===remove?add:value);
      SND.click();save(true);renderHUD();paintMechanic();drawUnitRelics();
      const area=root.querySelector('[data-relic-inventory]'),scroll=area.scrollTop;area.innerHTML=relicInventory();area.scrollTop=scroll;bindRelicInventory(root);
     }else if((target==='equipped')!==on)card.querySelector('[data-equip-relic]').click();
    }
   };
   const cancel=ev=>finish(ev);
   handle.addEventListener('pointermove',move,{passive:false});handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',cancel);
  };
 });

 root.querySelectorAll('[data-relic-inventory] button,[data-relic-inventory] summary').forEach(control=>{control.onmouseenter=()=>{if(!control.disabled)SND.hover()}});
 root.querySelectorAll('[data-equip-relic]').forEach(button=>button.onclick=()=>{
  const t=current();if(!t||G.phase!=='plan'||button.disabled)return;ensureLoadout(t);const id=button.dataset.equipRelic;if(!t.relics.some(r=>r.id===id))return;
  if(t.equippedRelics.includes(id))t.equippedRelics=t.equippedRelics.filter(x=>x!==id);else if(t.equippedRelics.length<relicCapacity(t))t.equippedRelics.push(id);else return;
  SND.click();save(true);renderHUD();paintMechanic();drawUnitRelics();
  const area=root.querySelector('[data-relic-inventory]'),scroll=area.scrollTop;area.innerHTML=relicInventory();area.scrollTop=scroll;bindRelicInventory(root);
  const focus=area.querySelector('[data-equip-relic="'+id+'"]');if(focus){focus.closest('details').open=true;focus.focus({preventScroll:true})}
 });
}
function migrateRelicLoadout(){
 G.eventModal=true;save(true);
 const root=panel('Prepare suas relíquias','Sua coleção foi preservada. Escolha até '+relicCapacity(current())+' para equipar.','<div class="tower-loadout-migration" data-relic-inventory>'+relicInventory()+'</div>',[{label:'Confirmar e continuar',run:()=>{current().needsRelicSetup=false;save(true);close();plan(true)}}]);
 bindRelicInventory(root);
}
const storageKey=()=>current()?.preview?(current().startFloor>=5?PREVIEW_KEY+'_sector'+(Math.floor(current().startFloor/5)+1):PREVIEW_KEY):KEY;
const unlocked=()=>{try{return localStorage.getItem('oakchess_tower_hard_unlocked')==='1'}catch{return false}};
// Canonical lines only: Mew also has a separate story line that stays excluded.
const LEGEND_LINES=[LINES.findIndex(L=>L.ids[0]===150),MEWLINE,...BIRDLINES];
const legendaryUnlocked=()=>{try{return unlocked()||localStorage.getItem('oakchess_tower_legendaries_unlocked')==='1'}catch{return false}};
const CAMPAIGN_LEGEND_LINES=LEGEND_LINES.map(i=>i===MEWLINE?LINES.findIndex(L=>L.ids[0]===151):i);
const legendaryVisible=L=>active()?legendaryUnlocked()&&LEGEND_LINES.includes(L.i):unlocked()&&CAMPAIGN_LEGEND_LINES.includes(L.i);
const canShop=L=>G.lvl>=7&&legendaryVisible(L);
function seedCampaignLegendaryPool(){
 if(active()||!unlocked()||G.said?.campaignLegendaryPoolVersion===1)return;
 for(const i of CAMPAIGN_LEGEND_LINES){const owned=allPlus().filter(u=>u.line===i).reduce((n,u)=>n+3**(u.star-1),0),offered=G.shop.filter(u=>u?.line===i).length;G.pool[i]=Math.max(0,POOL[4]-owned-offered)}
 G.said=G.said||{};G.said.campaignLegendaryPoolVersion=1;
}
function seedLegendaryPool(){
 const t=current();if(!t||t.legendaryPoolVersion===1||!legendaryUnlocked())return;
 for(const i of LEGEND_LINES){const owned=allUnits().filter(u=>u.line===i).reduce((n,u)=>n+3**(u.star-1),0),offered=G.shop.filter(u=>u?.line===i).length;G.pool[i]=Math.max(0,POOL[4]-owned-offered)}
 t.legendaryPoolVersion=1;
}
function legendaryStats(L,stats){
 if(!(active()?LEGEND_LINES:CAMPAIGN_LEGEND_LINES).includes(L.i))return stats;
 const tuning={144:{hp:1.04,sp:.78,mana:95},145:{hp:.86,sp:.86,mana:90},146:{hp:.94,sp:.88,mana:105},150:{hp:.84,sp:.92,mana:110},151:{hp:1.02,sp:.76,mana:90}}[L.ids[0]];
 return {...stats,hp:stats.hp*tuning.hp,atk:stats.atk*.9,sp:stats.sp*tuning.sp,maxMana:tuning.mana,mana0:Math.min(stats.mana0,15)};
}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function valid(s){
 if(!s||s.version!==1||!s.tower||!s.game||!Array.isArray(s.units))return false;
 const t=s.tower,g=s.game;
 if(!Number.isInteger(t.floor)||!FLOORS[t.floor]||!Array.isArray(t.relics)||!Array.isArray(t.cleared)||!Array.isArray(t.offers))return false;
 if(!['starter','plan','path','rest','reward','map','ended'].includes(t.status)||t.relics.some(r=>!RELICS[r.id]))return false;
 if(t.equippedRelics!==undefined&&(!Array.isArray(t.equippedRelics)||t.equippedRelics.some(id=>typeof id!=='string')))return false;
 if(!Array.isArray(g.pool)||g.pool.length!==LINES.length||!Array.isArray(g.shop)||!Array.isArray(g.items)||g.items.some(k=>!ITEMBY[k]))return false;
 if(![g.hp,g.gold,g.lvl,g.xp].every(Number.isFinite)||g.lvl<2||g.lvl>9)return false;
 const occupied=new Set();
 return s.units.every(u=>{const pos=u.pos,key=JSON.stringify(pos);if(!LINES[u.line]||!Number.isInteger(u.star)||u.star<1||u.star>3||!Array.isArray(u.items)||u.items.some(k=>!ITEMBY[k])||!pos||occupied.has(key))return false;occupied.add(key);return pos.z==='n'?Number.isInteger(pos.i)&&pos.i>=0&&pos.i<9:pos.z==='b'&&Number.isInteger(pos.r)&&pos.r>=4&&pos.r<8&&Number.isInteger(pos.c)&&pos.c>=0&&pos.c<7});
}
function save(force=false){
 const t=current();if(!t||t.status==='ended'||DEMO.on)return false;
 if(!force&&['combat','vs'].includes(G.phase))return false;
 window.ACH?.towerProgress(t);
 const data={version:1,t:Date.now(),tower:JSON.parse(JSON.stringify(t)),game:{gold:G.gold,hp:G.hp,lvl:G.lvl,xp:G.xp,streak:G.streak,locked:G.locked,shop:G.shop,pool:G.pool,items:G.items,shPity:G.shPity||0},units:allUnits().filter(u=>u.pos).map(u=>({line:u.line,star:u.star,items:u.items.slice(),shiny:!!u.shiny,evoSkip:u.evoSkip??null,pos:{...u.pos}}))};
 try{localStorage.setItem(storageKey(),JSON.stringify(data));saveFailed=false;return true}catch{if(!saveFailed)toast('Não foi possível salvar a Torre neste navegador.');saveFailed=true;return false}
}
function clear(){try{localStorage.removeItem(storageKey())}catch{}}
function rng(){const t=current();let x=t.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;t.rng=x>>>0;return(t.rng>>>0)/4294967296}
function shuffleOwn(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function dealRelicOffers(){
 const t=current(),historyKey=KEY+(t.preview?'_preview':'')+'_relic_history';
 const stored=read(historyKey),history=Array.isArray(stored)?stored.filter(id=>RELICS[id]).slice(-72):[];
 t.seenRelics=Array.isArray(t.seenRelics)?t.seenRelics.filter(id=>RELICS[id]):[...t.relics.map(r=>r.id),...t.offers];
 const seen=new Set(t.seenRelics);
 const pool=shuffleOwn(availableRelics(t));
 // Unseen this climb first; then the least recently offered across climbs.
 pool.sort((a,b)=>Number(seen.has(a))-Number(seen.has(b))||history.lastIndexOf(a)-history.lastIndexOf(b));
 const offers=pool.slice(0,3);t.seenRelics=[...new Set([...t.seenRelics,...offers])];
 try{localStorage.setItem(historyKey,JSON.stringify([...history,...offers].slice(-72)))}catch{}
 return offers;
}
function close(){document.body.classList.remove('tower-entry-open');if(overlay){overlay.cardTitleObserver?.disconnect();overlay.remove()}overlay=null;if(returnFocus?.isConnected)returnFocus.focus()}
function fitCardTitles(root){
 const titles=[...root.querySelectorAll('.tower-event-title>b')];if(!titles.length)return;
 const fit=()=>{if(!root.isConnected)return;for(const title of titles){title.style.fontSize='18px';const width=title.clientWidth;if(!width)continue;let size=18;if(title.scrollWidth>width)size=Math.max(10,Math.floor(180*width/title.scrollWidth)/10);title.style.fontSize=size+'px';while(title.scrollWidth>width&&size>10){size=Math.max(10,size-.25);title.style.fontSize=size+'px'}title.title=title.textContent}};
 root.cardTitleObserver=new ResizeObserver(fit);titles.forEach(title=>root.cardTitleObserver.observe(title.parentElement));requestAnimationFrame(fit);
}
function panel(title,subtitle,html,actions=[]){
 close();returnFocus=document.activeElement;
 overlay=document.createElement('section');overlay.id='towerOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','towerDialogTitle');
 overlay.innerHTML='<div class="tower-dialog"><header><span class="tower-eyebrow">OAKCHESS · TORRE DOS DESAFIOS</span><h2 id="towerDialogTitle">'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></header>'+html+'<footer>'+actions.map((a,i)=>'<button type="button" data-tower-footer="'+i+'" '+(a.autoContinue?'data-auto-continue ':'')+'class="tower-button '+(a.secondary?'secondary':'')+'">'+esc(a.label)+'</button>').join('')+'</footer></div>';
 overlay.querySelector('.tower-dialog').classList.toggle('tower-menu-dialog',!!overlay.querySelector('.tower-menu-art'));overlay.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src='assets/tower-art/tower-seal.svg'},{once:true}));
 document.body.append(overlay);fitCardTitles(overlay);actions.forEach((a,i)=>overlay.querySelector('[data-tower-footer="'+i+'"]').onclick=a.run);
 if(window.AUTO_BATTLE?.enabled){const stopAuto=document.createElement('button');stopAuto.type='button';stopAuto.className='tower-button secondary';stopAuto.textContent='Desativar Auto';stopAuto.onclick=()=>{AUTO_BATTLE.stop();SND.click();stopAuto.textContent='Auto desativado';stopAuto.disabled=true};overlay.querySelector('footer').append(stopAuto)}
 overlay.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const els=[...overlay.querySelectorAll('button:not(:disabled),a[href],summary')];if(!els.length)return;const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
 overlay.querySelector('button')?.focus();
 overlay.querySelectorAll('button,summary').forEach(control=>{
  const hoverSound=()=>{if(control.disabled)return;SND.init();if(control.closest('.tower-pixel-entry'))SND.mnav();else SND.hover()};
  control.addEventListener('mouseenter',hoverSound);
  control.addEventListener('focus',hoverSound);
 });
 return overlay;
}
document.addEventListener('keydown',e=>{if(overlay&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['F5','F11','F12'].includes(e.key)){
 const target=e.target;if(!overlay.contains(target))overlay.querySelector('button')?.focus();
 if(e.key==='Tab'){const els=[...overlay.querySelectorAll('button:not(:disabled),a[href]')];if(els.length&&((e.shiftKey&&document.activeElement===els[0])||(!e.shiftKey&&document.activeElement===els.at(-1)))){e.preventDefault();els[e.shiftKey?els.length-1:0].focus()}}
 else if(!['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
 e.stopImmediatePropagation();if((e.key==='Enter'||e.key===' ')&&target?.tagName==='BUTTON'){e.preventDefault();if(!e.repeat)target.click()}
}},true);
function illustratedArt(id,alt=''){
 if(current()?.floor>=15&&(id==='path-elite'||id==='path-guard')){const s=SECTORS[Math.floor(current().floor/5)],id1=id==='path-elite'?s.elite[0]:s.pool[0];return '<img src="'+art(s.scene)+'" alt="'+esc(s.name)+'"><img class="tower-art-character left" src="'+sprFront(id1)+'" alt="Guardião"><img class="tower-art-character right" src="'+sprFront(s.pool[1])+'" alt="Guardião">'}
 if(current()?.floor>=10&&(id==='path-elite'||id==='path-guard'))return '<img src="'+art('starter-grass')+'" alt="Clareira da floresta"><img class="tower-art-character left" src="'+sprFront(id==='path-elite'?123:15)+'" alt="Guardião da colmeia"><img class="tower-art-character right" src="'+sprFront(49)+'" alt="Venomoth">';
 if(current()?.floor>=5&&(id==='path-elite'||id==='path-guard'))return '<img src="'+art('relic-crystal')+'" alt="Santuário de cristais psíquicos"><img class="tower-art-character left" src="'+sprFront(id==='path-elite'?65:64)+'" alt="Guardião psíquico"><img class="tower-art-character right" src="'+sprFront(97)+'" alt="Hypno">';
 if(id==='starter-fire')return '<img src="'+art('relic-feather')+'" alt="Varanda da torre ao pôr do sol"><img class="tower-art-character solo" src="'+sprFront(4)+'" alt="Charmander">';
 if(id==='path-elite')return '<img src="'+art('relic-reserve')+'" alt="Arsenal protegido da torre"><img class="tower-art-character left" src="'+sprFront(66)+'" alt="Machop"><img class="tower-art-character right" src="'+sprFront(75)+'" alt="Graveler">';
 return '<img src="'+art(id)+'" alt="'+esc(alt)+'">';
}
function artCard({id,title,text,tag='ESCOLHA',image,color='#d9bd76',extra=''}){
 const isRelic=tag.startsWith('RELÍQUIA'),key=isRelic?(tag.includes('APRIMORADA')?'upgrade':'relic'):id==='relic'?'upgrade':id;
 const particles=Array.from({length:5},(_,i)=>'<i style="--px:'+(15+i*17)+'%;--wait:'+(-i*.85)+'s"></i>').join('');
 return '<article class="tower-collectible tower-painted-companion"><button type="button" class="tower-painted-card tower-event-painted" data-art="'+key+'" data-choice="'+esc(id)+'" style="--card-glow:'+color+';--event-copy-size:'+(text.length>130?11:text.length>85?12:14)+'px" aria-label="'+esc(title+'. '+text)+'"><span class="tower-card-surface"><img src="assets/tower-art/event-cards/'+key+'-v1.webp" alt="" width="1024" height="1536"><span class="tower-event-title"><small>'+esc(tag)+'</small><b>'+esc(title)+'</b></span>'+(isRelic?'<span class="tower-event-relic-art" aria-hidden="true">'+image+'</span>':'')+'<span class="tower-card-particles" aria-hidden="true">'+particles+'</span><span class="tower-painted-foil" aria-hidden="true"></span><span class="tower-event-description">'+esc(text)+extra+'</span></span><span class="tower-painted-action">Escolher <i aria-hidden="true">▸</i></span></button></article>';
}
function menu(){
 const can=unlocked(),official=read(KEY),preview=read(PREVIEW_KEY),candidate=can?official:preview;
 const saved=valid(candidate)&&candidate.tower.status!=='ended'?candidate:null;
 const floor=saved?Math.max(1,Math.min(FLOORS.length,saved.tower.floor+1)):1,sectorIndex=Math.floor((floor-1)/5),sector=SECTORS[sectorIndex];
 const cleared=saved?new Set(saved.tower.cleared.filter(n=>Number.isInteger(n)&&n>=0&&n<FLOORS.length)).size:0;
 const bossFloor=Math.min(FLOORS.length,sectorIndex*5+5),bossId=sector.portrait||sector.boss,bossLine=LINES.find(L=>L.ids.includes(bossId)),bossName=bossLine?bossLine.names[bossLine.ids.indexOf(bossId)]:FLOORS[bossFloor-1].name;
 const primary=()=>launch(!can,saved),label=saved?(can?'Continuar':'Continuar prévia')+' · Andar '+floor:can?'Começar subida':'Jogar prévia';
 let selected=sectorIndex;
 const steps=SECTORS.map((s,i)=>'<button type="button" class="sector'+(i<sectorIndex?' done':i===sectorIndex?' active selected':'')+'" data-entry-sector="'+i+'" aria-pressed="'+(i===sectorIndex)+'" aria-label="Setor '+s.roman+' · '+esc(s.name)+' · Andares '+(i*5+1)+' a '+Math.min(FLOORS.length,i*5+5)+'">'+s.roman+'</button>').join('');
 const html='<div class="window">'+['tl','tr','bl','br'].map(c=>'<span class="corner '+c+'" aria-hidden="true"></span>').join('')+
 '<header class="head"><div><span class="eyebrow">Uma nova prova a cada andar</span><h2>Torre dos Desafios</h2></div><button type="button" class="unlocked" data-entry-unlock><span aria-hidden="true">'+(legendaryUnlocked()?'✦':'◇')+'</span> '+(legendaryUnlocked()?'Lendários liberados':'Modo prévia')+'</button></header>'+
 '<div class="hero"><img src="'+art('entrance')+'" alt="Mewtwo diante da Torre dos Desafios"><div class="hero-note"><div><b>O topo espera por você.</b><span>Monte sua equipe. Conquiste cada setor.</span></div><div class="seal">'+FLOORS.length+' ANDARES · '+SECTORS.length+' CHEFES</div></div></div>'+
 '<div class="content"><div class="save-row"><span class="save-label">'+(saved?can?'Subida em andamento':'Prévia em andamento':can?'Pronto para uma nova subida':'Conheça os desafios da Torre')+'</span><small>'+cleared+' '+(cleared===1?'andar concluído':'andares concluídos')+'</small></div>'+
 '<div class="progress-heading"><strong>ANDAR '+floor+'</strong><span>/ '+FLOORS.length+'</span></div><div class="progress-track" role="progressbar" aria-label="Andares concluídos" aria-valuenow="'+cleared+'" aria-valuemin="0" aria-valuemax="'+FLOORS.length+'"><i style="width:'+Math.min(100,cleared/FLOORS.length*100)+'%"></i></div>'+
 '<div class="encounter"><img src="'+sprFront(bossId)+'" alt="'+esc(bossName)+'"><div><small>'+(floor===bossFloor?'SEU PRÓXIMO DESAFIO':'PRÓXIMO CHEFE · ANDAR '+bossFloor)+'</small><b>'+esc(bossName)+' · '+esc(sector.name)+'</b></div><span class="boss-tag">CHEFE</span></div>'+
 '<div class="section-title"><b>Sua jornada</b><small>Setor '+sector.roman+' · Andares '+(sectorIndex*5+1)+'–'+bossFloor+'</small></div><div class="sectors" role="group" aria-label="Percurso pelos setores">'+steps+'</div><div class="sector-note"><span data-entry-description>Setor '+sector.roman+' · '+esc(sector.name)+'</span><span class="legend"><em>◆ Atual</em> · ◇ Explorar</span></div></div>'+
 '<div class="actions"><button type="button" class="continue" data-entry-continue>'+esc(label)+'</button><div class="secondary"><button type="button" data-entry-new>Nova subida</button><button type="button" data-entry-explore>Explorar setores</button><button type="button" data-entry-records>Recordes</button></div></div>'+
 '<footer class="footer"><button type="button" data-entry-back>← Voltar</button><small>'+(saved?'Progresso salvo neste navegador':can?'Salvamento automático':'Oficial após Mewtwo no Difícil')+'</small></footer></div>';
 const root=panel('Torre dos Desafios','',html);root.classList.add('tower-pixel-entry');document.body.classList.add('tower-entry-open');root.querySelector('.tower-dialog').classList.add('tower-entry-dialog');
 root.querySelector('[data-entry-continue]').onclick=primary;
 root.querySelector('[data-entry-new]').onclick=()=>saved?confirmNew(!can,saved):launch(!can);
 root.querySelector('[data-entry-records]').onclick=records;root.querySelector('[data-entry-back]').onclick=close;
 root.querySelector('[data-entry-unlock]').onclick=()=>panel(legendaryUnlocked()?'Lendários liberados':'Conheça a Torre',legendaryUnlocked()?'Uma recompensa pela sua jornada.':'A prévia tem salvamento próprio.','<p class="tower-note">'+(legendaryUnlocked()?'Mew, Mewtwo, Articuno, Zapdos e Moltres podem aparecer na loja a partir do nível 7.':'Explore os setores na prévia. Para liberar a Torre oficial, derrote Mewtwo na campanha no modo Difícil.')+'</p>',[{label:'Voltar à Torre',run:menu}]);
 root.querySelectorAll('[data-entry-sector]').forEach(button=>button.onclick=()=>{selected=+button.dataset.entrySector;root.querySelectorAll('[data-entry-sector]').forEach(other=>{const on=+other.dataset.entrySector===selected;other.classList.toggle('selected',on);other.setAttribute('aria-pressed',String(on))});root.querySelector('[data-entry-description]').textContent='Setor '+SECTORS[selected].roman+' · '+SECTORS[selected].name;root.querySelector('[data-entry-explore]').textContent='Explorar setor '+SECTORS[selected].roman});
 root.querySelector('[data-entry-explore]').onclick=()=>{const index=selected,key=index?PREVIEW_KEY+'_sector'+(index+1):PREVIEW_KEY,sectorSave=read(key);panel('Explorar setor '+SECTORS[index].roman,SECTORS[index].name,'<p class="tower-note">Andares '+(index*5+1)+'–'+Math.min(FLOORS.length,index*5+5)+'. A prévia tem seu próprio salvamento e não substitui sua subida oficial.</p>',[{label:valid(sectorSave)?'Continuar prévia':'Começar prévia',run:()=>launch(true,valid(sectorSave)?sectorSave:null,index*5)},{label:'Todos os setores',secondary:true,run:previewMenu},{label:'Voltar',secondary:true,run:menu}])};
 root.querySelector('[data-entry-continue]').focus();
}
function confirmNew(preview,s){if(!valid(s)){launch(preview);return}panel('Começar outra subida?','Somente a tentativa atual da torre será substituída. O progresso da campanha permanece salvo.','',[{label:'Começar nova subida',run:()=>launch(preview)},{label:'Continuar tentativa atual',secondary:true,run:()=>launch(preview,s)},{label:'Voltar',secondary:true,run:menu}])}
function previewMenu(){
 const root=panel('Explorar a torre','Cada setor tem uma prévia e salvamento próprios.',
 '<div class="tower-preview-grid">'+SECTORS.map((s,i)=>'<button type="button" class="tower-sector-choice" data-sector="'+i+'"><span><img src="'+art(s.scene)+'" alt=""><img class="tower-sector-portrait" src="'+sprFront(s.portrait)+'" alt=""></span><small>SETOR '+s.roman+' · '+(i*5+1)+'–'+(i*5+5)+'</small><b>'+esc(s.name)+'</b></button>').join('')+'</div>',[{label:'Voltar',secondary:true,run:menu}]);
 root.querySelectorAll('[data-sector]').forEach(b=>b.onclick=()=>{const i=+b.dataset.sector;launch(true,read(i?PREVIEW_KEY+'_sector'+(i+1):PREVIEW_KEY),i*5)});
}
function cleanWorld(){
 document.getElementById('towerWatcher')?.remove();
 close();clearTimeout(TITLE_TM);stopTitleDemo();DEMO.on=false;DEMO.mute=false;B.on=false;clearCombatUnits();
 for(const k in UB)delete UB[k];unitsL.innerHTML='';CAR.on=false;cancelAnimationFrame(CAR.raf);closeBag();closeEvent();
 for(const id of ['starter','vs','over','lobby','carousel','badgeov'])document.getElementById(id)?.classList.remove('show');
 clearInterval(LAB.tm);LAB.st='done';stage.classList.remove('tdemo');document.body.classList.remove('combat','on-title','game-paused','legendary-dialog');$('#pausedOverlay').classList.remove('show');setMenu(false);SND.init();
}
function launch(preview,saved=null,startFloor=0){
 if(!preview&&!unlocked())return;
 cleanWorld();newGame();G.runDiff='normal';G.lvl=Math.min(9,3+Math.ceil(startFloor/5)*1.5|0);G.gold=10+Math.floor(startFloor/5)*12;G.xp=0;G.hp=100;G.hintOn=false;G.casinoAt=[];
 const seed=(Math.random()*4294967295)>>>0||1;
 G.tower={version:1,preview:!!preview,id:Date.now().toString(36)+'-'+seed.toString(36),rng:seed,startFloor,floor:startFloor,status:'starter',relics:[],equippedRelics:[],cleared:[],offers:[],enemy:null,elite:false,losses:0,wins:0,startedAt:Date.now(),restItem:null,shopBonus:false};
 if(valid(saved)){
  G.tower=JSON.parse(JSON.stringify(saved.tower));G.tower.preview=!!preview;Object.assign(G,JSON.parse(JSON.stringify(saved.game)));G.bench=Array(9).fill(null);G.board=new Map();G.pending=[];
  for(const su of saved.units){const u=newUnit(su.line,su.star);u.items=su.items.slice();u.shiny=su.shiny;u.evoSkip=su.evoSkip;place(u,{...su.pos});attachEl(u,false)}
  allUnits().forEach(u=>{if(u.line===EEVEE&&u.star>=2&&u.evoSkip!==u.star&&!G.evoQueue.includes(u))G.evoQueue.push(u)});
 }
 seedLegendaryPool();
 document.body.classList.add('tower-active');hud.hidden=false;G.ri=current().floor;G.round=round(G.ri);G.phase='plan';G.eventModal=true;SND.music('plan');renderInv();renderHUD();
 if(current().status==='starter'){save(true);starter()}else plan(true);
}
function round(i){const n=Math.max(0,Math.min(FLOORS.length-1,i)),f=FLOORS[n];return{tower:true,boss:n%5===4,kind:'trainer',gym:0,lg:0,st:1+n,rn:n+1,n:FLOORS.length,lbl:'TORRE '+(n+1),kinds:Array(FLOORS.length).fill('trainer'),extra:false,name:f.name}}
function starter(){
 const t=current();
 const benchCandidates=LINES.filter(L=>L.c===1&&!L.boss&&![1,4,7,25,133].includes(L.ids[0]));
 if(!Array.isArray(t.starterBench)||t.starterBench.length!==2||new Set(t.starterBench).size!==2||t.starterBench.some(id=>!benchCandidates.some(L=>L.ids[0]===id))){t.starterBench=shuffleOwn(benchCandidates).slice(0,2).map(L=>L.ids[0]);save(true)}
 const benchNames=t.starterBench.map(id=>LINES.find(L=>L.ids[0]===id).names[0]).join(' e ');
 const companions=[
  {id:1,name:'Bulbasaur',role:'SUSTENTAÇÃO',text:'Drena vida com suas vinhas e resiste na linha de frente.',scene:'starter-grass'},
  {id:4,name:'Charmander',role:'OFENSIVO',text:'Queima os inimigos com fogo e pressiona a equipe adversária.',scene:'starter-fire'},
  {id:7,name:'Squirtle',role:'DEFENSOR',text:'Cria um escudo para proteger a si mesmo e os aliados.',scene:'starter-water'},
  {id:25,name:'Pikachu',role:'DANO EM CADEIA',text:'Seus raios saltam entre inimigos. Começa com duas estrelas.',scene:'relic-feather'},
  {id:133,name:'Eevee',role:'VERSÁTIL',text:'Ataca rapidamente e pode evoluir para Água, Fogo ou Elétrico.',scene:'relic-root'}
 ];
 const cards=companions.map(d=>{const L=LINES.find(l=>l.ids.includes(d.id)),star=d.id===25?2:1,types=typesOf(L,star);
  {const asset={1:'bulbasaur',4:'charmander',7:'squirtle',25:'pikachu',133:'eevee'}[d.id],extension='webp',effect={1:'leaf',4:'ember',7:'bubble',25:'spark',133:'mote'}[d.id],particles=Array.from({length:7},(_,i)=>'<i style="--p:'+i+';--px:'+(10+(i*29)%80)+'%;--wait:'+(-i*.73)+'s"></i>').join('');return '<article class="tower-collectible tower-painted-companion"><button type="button" class="tower-painted-card" data-element="'+effect+'" style="--card-glow:'+TYPES[types[0]].c+'" data-choice="'+d.id+'" aria-label="Escolher '+d.name+'. '+d.role+'. '+d.text+'"><span class="tower-card-surface"><img src="assets/tower-art/companion-cards/'+asset+'-v1.'+extension+'" alt="'+d.name+' · '+types.map(t=>esc(TYPES[t].n)).join(' · ')+'. '+esc(d.text)+'" width="1024" height="1536"><span class="tower-card-particles" aria-hidden="true">'+particles+'</span><span class="tower-painted-foil" aria-hidden="true"></span></span><span class="tower-painted-action">Escolher '+d.name+' <i aria-hidden="true">▸</i></span></button></article>'}
 }).join('');
 const root=panel('Escolha seu companheiro',G.lvl+' vagas · '+G.gold+' ouro · '+benchNames+' no banco','<div class="tower-card-grid tower-starter-grid">'+cards+'</div>');
 root.querySelector('.tower-dialog').classList.add('tower-starter-dialog');
 root.querySelectorAll('.tower-painted-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const box=card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-box.left)/box.width)),y=Math.max(0,Math.min(1,(e.clientY-box.top)/box.height));card.style.setProperty('--tilt-x',((.5-y)*5)+'deg');card.style.setProperty('--tilt-y',((x-.5)*6)+'deg')});
  const reset=()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')};card.addEventListener('pointerleave',reset);card.addEventListener('blur',reset);
 });
 root.querySelectorAll('button[data-choice]').forEach(b=>b.onclick=()=>{if(current()?.status!=='starter')return;const id=+b.dataset.choice;
  for(const [idx,mon] of [id,...current().starterBench].entries()){
   const L=LINES.find(l=>l.ids.includes(mon)),star=Math.max(mon===25?2:1,current().floor>=25?3:current().floor>=5?2:1),u=newUnit(L.i,star);G.pool[L.i]=Math.max(0,G.pool[L.i]-Math.pow(3,star-1));place(u,idx===0?{z:'b',r:6,c:3}:{z:'n',i:idx-1});attachEl(u,true);if(u.line===EEVEE&&u.star>=2&&!G.evoQueue.includes(u))G.evoQueue.push(u);
  }
  current().status='plan';close();plan();
 });
}
function spec(id,star,scale){const L=LINES.find(l=>l.ids[0]===id);return{line:L.i,star,scale,items:[]}}
// Late bosses scale separately from normal floors. Applied once, including saved opponents.
function strengthenHighBoss(team,t){
 if(t.floor<29||t.floor%5!==4)return team;
 const progress=Math.min(1,(t.floor-29)/30),bossId=SECTORS[Math.floor(t.floor/5)].boss;
 for(const sp of team){
  if(sp.highBossBalance===1)continue;
  const boss=LINES[sp.line]?.ids[0]===bossId;
  sp.hpx=(sp.hpx||1)*(boss?1.25+.45*progress:1.10+.15*progress);
  sp.dx=(sp.dx||1)*(boss?1.15+.25*progress:1.05+.10*progress);
  if(boss){const extra=['helmet','band','bell'].find(id=>ITEMBY[id]&&!(sp.items||[]).includes(id));if(extra)(sp.items||(sp.items=[])).push(extra)}
  sp.highBossBalance=1;
 }
 return team;
}
function enemy(){
 const t=current(),f=FLOORS[t.floor];if(t.enemy)return strengthenHighBoss(t.enemy,t);
 const team=t.elite&&f.eliteTeam?f.eliteTeam:f.variants?f.variants[Math.floor(rng()*f.variants.length)]:f.team;
 const list=team.map(([id,star,scale])=>{
  const sp=spec(id,star,scale);if(isPath(t.floor)){const route=routeFor(t);sp.hpx=route.hp;sp.dx=route.damage}if(t.floor===9&&id===63){sp.hpx=1.6;sp.dx=.85}if(t.floor>=15&&t.floor%5===4&&id===SECTORS[Math.floor(t.floor/5)].boss){sp.hpx=1.8;sp.dx=.85;sp.cap=.35}if(t.floor===14&&id===1){sp.hpx=1.7;sp.dx=.85;sp.cap=.35}if(t.floor===4&&id===95){sp.hpx=1.8;sp.dx=.75;sp.cap=.35}return sp;
 });
 if(t.eventRisk===t.floor)list.push(spec(98,3,1.5));
 if(t.floor>=25){const equipment=['band','helmet','bell','scarf'].filter(id=>ITEMBY[id]);for(const sp of list)if(equipment.length){sp.items.push(equipment[Math.floor(rng()*equipment.length)]);if(t.elite)sp.items.push(equipment[Math.floor(rng()*equipment.length)])}}
 if(rng()<(t.floor>=50?.20:t.floor>=30?.15:t.floor>=10?.10:.05)){const shiny=list[Math.floor(rng()*list.length)];shiny.shiny=true;shiny.hpx=(shiny.hpx||1)*SHB;shiny.dx=(shiny.dx||1)*SHB}
 t.enemy=placeEnemies(strengthenHighBoss(list,t));return t.enemy;
}
function plan(resuming=false){
 seedLegendaryPool();ensureLoadout();if(current()?.needsRelicSetup){migrateRelicLoadout();return}
 if(!active())return;const t=current(),f=FLOORS[t.floor];closeBag();mechanic=null;clearMarks();G.paused=false;G.over=false;G.ri=t.floor;G.round=round(t.floor);G.phase='plan';G.weather=null;G.eventModal=false;G.oppSlug=null;G.oppQuote=f.rule;G.oppName=t.floor===4?'Onix · Sentinela':f.name;G.foe=null;G.retry=false;
 document.body.classList.remove('combat');setArenaTheme(typeof f.theme==='string'?ARENA_THEMES.findIndex(a=>a.id===f.theme):f.theme);showNpc(null);setWeatherFx();showTowerWatcher();
 if(t.status==='ended'){end(false);return}
 if(t.status==='starter'){G.eventModal=true;starter();return}
 if(isPath(t.floor)&&!t.path){t.status='path';save(true);path();return}
 if(isRest(t.floor)&&!t.cleared.includes(t.floor)){t.status='rest';if(!t.restItem){const keys=Object.keys(ITEMBY).filter(k=>['band','helmet','bell','scarf'].includes(k));t.restItem=keys[Math.floor(rng()*keys.length)]||Object.keys(ITEMBY)[0]}save(true);rest();return}
 if(['reward','map'].includes(t.status)){G.eventModal=true;renderHUD();renderShop();renderInv();layoutAll();save(true);if(t.status==='reward')reward();else map();return}
 t.status='plan';G.enemy=enemy();spawnEnemies(G.enemy);
 showTowerWatcher();
 if(!resuming){if(t.shopBonus){rollShop(true);t.shopBonus=false;G.gold+=3;toast('Chansey reforçou a loja: novas ofertas e +3 de ouro.')}else if(!G.locked||!G.shop.some(Boolean))rollShop(true)}
 G.timerMax=G.timer=90;G.eventModal=false;SND.music('plan');renderShop();renderInv();renderHUD();layoutAll();paintMechanic();warmPlanAssets();warmTowerCards();save(true);
 banner('Torre · Andar '+(t.floor+1),f.name+(t.enemy?.some(u=>u.shiny)?' · Adversário shiny!':''),'#e9ce88');setTimeout(()=>{if(active()&&G.phase==='plan'&&!G.eventModal)processEvoQueue()},900);
}
const ROUTES={
 normal:{name:'Guardas',tag:'CAMINHO SEGURO',color:'#d9bd76',hp:1,damage:1,gold:0,potions:1,scene:'path-guard'},
 elite:{name:'Elite',tag:'APRIMORAMENTO',color:'#d0a7ed',hp:1.3,damage:1.15,gold:4,potions:2,scene:'path-elite'},
 treasure:{name:'Tesouro vigiado',tag:'OURO EXTRA',color:'#f2cd69',hp:1.15,damage:1.25,gold:8,potions:1,scene:'relic-reserve'}
};
function routeFor(t=current()){return isPath(t.floor)?ROUTES[t.path]||ROUTES.normal:ROUTES.normal}
function routeDescription(id,floor){
 const r=ROUTES[id],risk=id==='elite'?'+30% PS e +15% dano nos inimigos. ':id==='treasure'?'+15% PS e +25% dano nos inimigos. ':'Dificuldade normal. ';
 return risk+'Vitória: '+(FLOORS[floor].reward+r.gold)+' ouro · 2 XP · '+r.potions+' '+(r.potions===1?'poção':'poções')+'.'+(id==='elite'?' Aprimore uma relíquia possuída, se o limite permitir.':'');
}
function path(){
 G.eventModal=true;const t=current();
 const cards=Object.entries(ROUTES).map(([id,r])=>{
  const file={normal:'guardas',elite:'elite',treasure:'tesouro'}[id],risk=id==='elite'?'+30% PS · +15% dano':id==='treasure'?'+15% PS · +25% dano':'Dificuldade normal',particles=Array.from({length:5},(_,i)=>'<i style="--px:'+(18+i*16)+'%;--wait:'+(-i*.9)+'s"></i>').join('');
  return '<article class="tower-collectible tower-painted-companion"><button type="button" class="tower-painted-card tower-route-painted" data-choice="'+id+'" style="--card-glow:'+r.color+'" aria-label="'+esc(r.name+'. '+routeDescription(id,t.floor))+'"><span class="tower-card-surface"><img src="assets/tower-art/route-cards/'+file+'-v1.webp" alt="'+esc(r.name)+'" width="1024" height="1536"><span class="tower-card-particles" aria-hidden="true">'+particles+'</span><span class="tower-painted-foil" aria-hidden="true"></span><span class="tower-route-description"><strong>'+risk+'</strong><span><b>'+(FLOORS[t.floor].reward+r.gold)+' ouro</b> · 2 XP · '+r.potions+' '+(r.potions===1?'poção':'poções')+'</span><small>'+(id==='elite'?'Aprimore uma relíquia, se o limite permitir.':id==='treasure'?'Vença os guardiões e leve o ouro extra.':'Enfrente os guardas e siga sua subida.')+'</small></span></span><span class="tower-painted-action">Escolher '+esc(r.name)+' <i aria-hidden="true">▸</i></span></button></article>';
 }).join('');
 const root=panel('Escolha sua rota','Andar '+(t.floor+1)+' · A escolha vale até vencer este desafio.','<div class="tower-card-grid tower-route-grid">'+cards+'</div><p class="tower-note">Compare os riscos e escolha a recompensa que sua equipe precisa.</p>');
 root.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
  if(current()!==t||t.status!=='path'||!ROUTES[button.dataset.choice])return;
  t.path=button.dataset.choice;t.elite=t.path==='elite';t.routeHistory=t.routeHistory||{};t.routeHistory[t.floor]=t.path;
  if(t.floor===32&&t.elite)t.curse=true;
  t.enemy=null;t.status='plan';SND.click();save(true);close();plan();
 });
}
function rest(){
 G.eventModal=true;clearCombatUnits();G.enemy=[];const t=current(),it=ITEMBY[t.restItem],heal=Math.min(t.floor>=5?30:25,100-G.hp);
 if(t.floor===13){forestRest(heal);return}
 if(t.floor>=15){sectorEvent();return}
 const options=[{id:'heal',title:'Descansar',text:heal?'+'+heal+' de vida do treinador.':'Vida completa.',image:'<img src="'+art('rest-heal')+'" alt="Chansey no refúgio">',color:'#f0b9d0'},
 {id:'item',title:'Equipamento',text:'Receba '+it.n+'. '+it.d,image:'<img src="'+art('rest-supplies')+'" alt="Suprimentos do refúgio">',color:'#b0d5ec'},
 {id:'shop',title:'Reforçar loja',text:'Próxima loja renovada · +3 ouro.',image:illustratedArt('rest-shop','Loja da torre'),color:'#e9cf86'}];
 const root=panel(FLOORS[t.floor].name,'Escolha uma ajuda.','<div class="tower-card-grid">'+options.map(o=>artCard({...o,tag:'REFÚGIO'})).join('')+'</div>');
 if(!heal)root.querySelector('[data-choice="heal"]').disabled=true;
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(current()?.status!=='rest')return;const choice=b.dataset.choice;if(choice==='heal')G.hp=Math.min(100,G.hp+(t.floor>=5?30:25));else if(choice==='item')G.items.push(t.restItem);else t.shopBonus=true;t.restChoice=choice;t.cleared.push(t.floor);t.status='map';save(true);renderInv();renderHUD();map()});
}
function sectorEvent(){
 const t=current(),si=Math.floor(t.floor/5),s=SECTORS[si],next=t.floor+1;
 t.eventChoices=t.eventChoices||{};
 if(!t.eventChoices[t.floor]){const pool=t.relics.filter(r=>r.power!==2);t.eventChoices[t.floor]={relic:pool.length?pool[Math.floor(rng()*pool.length)].id:null,item:t.restItem};save(true)}
 const pinned=t.eventChoices[t.floor],r=RELICS[pinned.relic],item=ITEMBY[pinned.item];
 const heal={id:'heal',title:'Recuperar forças',text:'Recupere até '+(si===11?40:30)+' de vida.',scene:'rest-heal'};
 const upgrade={id:'upgrade',title:'Aprimorar relíquia',text:!canUpgrade(t)?'Limite atual: '+upgradeLimit(t)+' aprimoradas.':r?'Aprimore '+r.name+'.':'Nenhuma relíquia para aprimorar.',scene:r?'relic-'+(r.scene||pinned.relic):'relic-crystal',disabled:!r||!canUpgrade(t)};
 const equipment={id:'item',title:'Equipamento',text:'Receba '+item.n+'.',scene:'rest-supplies'};
 const protect={id:'protect',title:'Preparar proteção',text:'Perigos do próximo chefe causam 40% menos dano.',scene:'relic-shell'};
 const choices={
  castaway:[{id:'supplies',title:'Suprimentos',text:'Receba 6 ouro e recupere 10 de vida.',scene:'rest-supplies'},{id:'risk',title:'Baú sob guarda',text:'O chefe recebe um guarda extra. Vitória concede +12 ouro.',scene:'relic-reserve'},heal],
  maintenance:[{id:'disable',title:'Desligar placas',text:'O chefe marca duas posições a menos por descarga.',scene:'relic-crystal'},equipment,heal],
  forge:[upgrade,equipment,heal],
  haunted:[{id:'cleanse',title:'Quebrar maldição',text:t.curse?'Remova a perda de mana inicial.':'Sem maldição: receba um escudo inicial na próxima luta.',scene:'relic-shell'},heal,{id:'cursed-chest',title:'Baú assombrado',text:'Pague 10 de vida e receba 14 ouro.',scene:'relic-last',disabled:G.hp<=10}],
  thermal:[heal,protect,upgrade],
  master:[{id:'offense',title:'Treino ofensivo',text:'Equipe: +6% de dano até o fim da subida.',scene:'relic-feather'},{id:'defense',title:'Treino defensivo',text:'Equipe: +8 Armadura e Defesa Especial até o fim da subida.',scene:'relic-reserve'},heal],
  altar:[upgrade,equipment,heal],
  nest:[protect,{id:'offense',title:'Bênção dos ventos',text:'Equipe: +6% de dano até o fim da subida.',scene:'relic-feather'},heal],
  final:[heal,upgrade,equipment]
 }[s.event];
 const root=panel(FLOORS[t.floor].name,'Escolha uma ajuda para a subida.','<div class="tower-card-grid">'+choices.map(o=>artCard({...o,tag:'EVENTO · '+s.roman,color:s.color,image:'<img src="'+art(o.scene)+'" alt="'+esc(o.title)+'">'})).join('')+'</div>');
 for(const o of choices){const b=root.querySelector('[data-choice="'+o.id+'"]');b.disabled=!!o.disabled||(o.id==='heal'&&G.hp>=100);b.onclick=()=>{
  if(current()?.status!=='rest')return;
  switch(o.id){
   case'heal':G.hp=Math.min(100,G.hp+(si===11?40:30));break;
   case'upgrade':{const owned=t.relics.find(x=>x.id===pinned.relic&&x.power!==2);if(!owned||!canUpgrade(t))return;owned.power=2;break}
   case'item':G.items.push(pinned.item);break;
   case'protect':t.prepared={floor:next,type:'protect'};break;
   case'disable':t.prepared={floor:next,type:'disable'};break;
   case'supplies':G.gold+=6;G.hp=Math.min(100,G.hp+10);break;
   case'risk':t.eventRisk=next;t.enemy=null;break;
   case'cleanse':if(t.curse)t.curse=false;else t.prepared={floor:next,type:'shield'};break;
   case'cursed-chest':if(G.hp<=10)return;G.hp-=10;G.gold+=14;break;
   case'offense':t.trainingAttack=(t.trainingAttack||0)+.06;break;
   case'defense':t.trainingDefense=(t.trainingDefense||0)+8;break;
  }
  t.cleared.push(t.floor);t.status=o.id==='relic'?'reward':'map';save(true);renderInv();renderHUD();if(o.id==='relic')reward();else map();
 }}
}
function forestRest(heal){
 const t=current(),upgradable=canUpgrade(t)?t.relics.filter(r=>r.power!==2):[];
 if(!t.forestRelic&&upgradable.length){t.forestRelic=upgradable[Math.floor(rng()*upgradable.length)].id;save(true)}
 const chosen=RELICS[t.forestRelic];
 const options=[{id:'heal',title:'Seiva Vital',text:heal?'Recupere '+heal+' de vida.':'Vida completa.',image:'<img src="'+art('rest-heal')+'" alt="Refúgio da floresta">',color:'#b8d99c'},
 {id:'relic',title:'Bênção Ancestral',text:chosen?'Aprimore '+chosen.name+'.':'Nenhuma relíquia para aprimorar.',image:'<img src="'+art('relic-root')+'" alt="Raízes da árvore ancestral">',color:'#b7d891'},
 {id:'gold',title:'Tesouro das Raízes',text:'Receba 10 de ouro.',image:'<img src="'+art('relic-feather')+'" alt="Tesouro dourado">',color:'#e7d08b'}];
 const root=panel('Árvore Ancestral','Escolha uma bênção.','<div class="tower-card-grid">'+options.map(o=>artCard({...o,tag:'SANTUÁRIO'})).join('')+'</div>');
 root.querySelector('[data-choice="heal"]').disabled=!heal;root.querySelector('[data-choice="relic"]').disabled=!upgradable.some(r=>r.id===t.forestRelic);
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(current()?.status!=='rest')return;const choice=b.dataset.choice;if(choice==='heal')G.hp=Math.min(100,G.hp+30);else if(choice==='gold')G.gold+=10;else{const r=t.relics.find(r=>r.id===t.forestRelic&&r.power!==2);if(!r||!canUpgrade(t))return;r.power=2}t.restChoice=choice;t.cleared.push(t.floor);t.status='map';save(true);renderHUD();map()});
}
function relicCard(id,power=1){const d=RELICS[id];return artCard({id,title:d.name,tag:power===2?'RELÍQUIA APRIMORADA':'RELÍQUIA DA TORRE',text:power===2?d.strong:d.text,color:d.color,image:d.scene?'<span class="tower-relic-illustration relic-'+id+'"><img src="'+art('relic-'+d.scene)+'" alt=""><img class="tower-relic-object" src="'+itemImage(d.item)+'" alt="'+esc(d.name)+'"></span>':'<img src="'+art('relic-'+id)+'" alt="'+esc(d.name)+'">'})}
function reward(){
 const t=current();G.eventModal=true;if(!t.offers.length){t.offers=dealRelicOffers();save(true)}
 if(!t.offers.length){panel(t.rewardKind==='upgrade'?'Suprimentos da elite':'Suprimentos','Sem relíquia disponível nesta recompensa.','<p class="tower-note">Receba 10 de ouro para preparar a próxima luta.</p>',[{label:'Receber 10 ouro',run:()=>{if(current()?.status!=='reward')return;G.gold+=10;t.status='map';save(true);renderHUD();map()}}]);return}
 const power=t.rewardKind==='upgrade'?2:1;
 const root=panel(power===2?'Escolha um aprimoramento':'Escolha uma relíquia',power===2?'Limite atual: '+upgradeLimit(t)+' relíquias aprimoradas.':'Uma nova relíquia por setor · Válida nesta subida.','<div class="tower-card-grid">'+t.offers.map(id=>relicCard(id,power)).join('')+'</div>');
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(current()?.status!=='reward'||!t.offers.includes(b.dataset.choice))return;const owned=t.relics.find(r=>r.id===b.dataset.choice);if(owned)owned.power=Math.max(owned.power,power);else{t.relics.push({id:b.dataset.choice,power});equipNewRelic(b.dataset.choice)}t.offers=[];t.status='map';save(true);SND.loot();map()});
}
function map(inspect=false){
 const t=current();if(!t)return;G.eventModal=true;
 if(!inspect&&t.floor%5===4&&t.floor<FLOORS.length-1&&t.cleared.includes(t.floor)){sectorGate();return}
 const floorIcons=[74,43,66,113,95,63,92,122,113,65,114,47,123,113,3];
 const nodes=FLOORS.map((f,i)=>{
  const heading=i%5===0?'<li class="tower-map-sector"><h3>SETOR '+sectorOf(i)+' <span>'+esc(sectorName(i))+'</span></h3></li>':'';
  const done=t.cleared.includes(i),current=i===t.floor;
  const routeId=t.routeHistory?.[i]||(current?t.path:null),route=isPath(i)&&ROUTES[routeId];
  return heading+'<li data-floor="'+i+'" class="'+(done?'done ':'')+(current?'current':'')+'" '+(current?'aria-current="step"':'')+'><span>'+(done?'✓':i+1)+'</span><img class="tower-floor-mon" src="'+sprFront(floorIcons[i]||f.icon||113)+'" alt=""><div><small>'+f.tag+' · '+(done?'CONCLUÍDO':current?'ATUAL':i>t.floor?'ADIANTE':'NÃO JOGADO')+'</small><b>'+esc(f.name)+'</b><details><summary>Ver regra</summary><p>'+esc(f.rule)+'</p></details>'+(route?'<span class="tower-route-record">Rota: '+esc(route.name)+'</span>':'')+'</div></li>';
 }).join('');
 const list=relicInventory();
 const next=t.floor+1,actions=inspect?[{label:'Voltar à arena',run:()=>{close();G.eventModal=false;paintMechanic()}}]:[{label:'Subir para o andar '+(next+1),autoContinue:true,run:()=>{if(current()?.status!=='map')return;t.floor=next;if(isRest(next))t.restItem=null;t.enemy=null;t.elite=false;t.path=null;t.status='plan';save(true);close();plan()}}];
 actions.push({label:'Salvar e sair',secondary:true,run:exit});
 const root=panel('Mapa da Torre','Andar '+(t.floor+1)+' / 60 · Vida '+Math.ceil(G.hp)+'/100 · Ouro '+G.gold+(t.preview?' · PRÉVIA':''),'<div class="tower-map-layout"><section class="tower-map-route" aria-label="Andares da torre"><h3 class="tower-map-heading">Desafios <small>Role para explorar</small></h3><ol class="tower-map" tabindex="0" aria-label="Todos os 60 andares">'+nodes+'</ol></section><aside class="tower-map-inventory" aria-label="Suas relíquias"><h3 class="tower-map-heading">Relíquias <small>'+t.relics.length+'</small></h3><div class="tower-map-relics" data-relic-inventory tabindex="0">'+(list||'<p class="tower-map-empty">Nenhuma relíquia nesta subida.</p>')+'</div></aside></div>',actions);
 bindRelicInventory(root);root.querySelector('.tower-dialog').classList.add('tower-map-dialog');const scroller=root.querySelector('.tower-map'),currentNode=scroller.querySelector('[data-floor="'+t.floor+'"]');if(currentNode)scroller.scrollTop=Math.max(0,currentNode.offsetTop-38);
}
function sectorGate(){
 const t=current();if(!t)return;G.eventModal=true;const next=t.floor+1,forest=next===10;
 panel(sectorName(next),'Setor '+sectorOf(t.floor)+' conquistado · Andares '+(next+1)+'–'+(next+5),
 '<div class="tower-sector-gate"><div class="tower-sector-scene">'+illustratedArt('path-elite')+'</div><b>O Oráculo aguarda.</b><p>Sua equipe, ouro e relíquias seguem com você.</p><small>Ao subir: +20 de vida · +4 XP</small></div>',
 [{label:'Subir ao andar '+(next+1),autoContinue:true,run:()=>{if(current()?.floor!==next-1||current()?.status!=='map')return;G.hp=Math.min(100,G.hp+20);addXp(4);t.floor=next;t.enemy=null;t.path=null;t.elite=false;t.status='plan';save(true);close();plan()}},{label:'Salvar e sair',secondary:true,run:exit}]);
 const sector=SECTORS[Math.floor(next/5)],scene=overlay.querySelector('.tower-sector-scene');scene.innerHTML='<img src="'+art(sector.scene)+'" alt="'+sector.name+'"><img class="tower-sector-oracle" src="'+sprFront(sector.portrait)+'" alt="Guardião do setor">';
 overlay.querySelector('.tower-sector-gate>b').textContent=forest?'A floresta despertou.':sector.name+' aguarda.';
 if([15,30,45].includes(next))overlay.querySelector('.tower-sector-gate>small').textContent+=' · Novo espaço de relíquia: '+relicCapacity(t)+' equipadas';
}
function applyRelics(allies,typeOverride=null){
 const t=current();const types=typeOverride||new Set(allies.flatMap(u=>u.types));
 for(const u of allies){u.dmgAmp+=t.trainingAttack||0;u.armor+=t.trainingDefense||0;u.mr+=t.trainingDefense||0;if(t.curse)u.mana=Math.max(0,u.mana-15);if(t.prepared?.floor===t.floor&&t.prepared.type==='shield'){u.shield+=u.maxHp*.15;u.shieldT=Math.max(u.shieldT,8)}}
 const positions=(typeOverride?boardUnits():allies).map(u=>({r:u.r??u.pos?.r,c:u.c??u.pos?.c}));
 for(const r of equippedRelics()){const strong=r.power===2;for(const u of allies){
  const row=u.r??u.pos?.r,col=u.c??u.pos?.c;
  const neighbors=Number.isInteger(row)&&Number.isInteger(col)?positions.filter(p=>{const a=hexXY(row,col),b=hexXY(p.r,p.c),d=Math.hypot(a.x-b.x,a.y-b.y);return d>1&&d<85}).length:0;
  if(r.id==='shell')u.regen+=(strong?.015:.01);
  if(r.id==='feather')u.as*=strong?1.18:1.12;
  if(r.id==='reserve'){const n=Math.min(4,G.bench.filter(Boolean).length)*(strong?5:3);u.armor+=n;u.mr+=n}
  if(r.id==='crystal'&&types.size>=4)u.dmgAmp+=strong?.15:.1;
  if(r.id==='heart'){const ratio=u.hp/u.maxHp;u.maxHp*=strong?1.18:1.12;u.hp=u.maxHp*ratio}
  if(r.id==='blade')u.atk*=strong?1.18:1.12;
  if(r.id==='lens')u.spell*=strong?1.22:1.15;
  if(r.id==='battery')u.mana=Math.min(manaCapacity(u),u.mana+(strong?30:20));
  if(r.id==='spring')u.manaRegen+=strong?3:2;
  if(r.id==='fang')u.ls+=strong?.12:.08;
  if(r.id==='plate')u.armor+=strong?18:12;
  if(r.id==='veil')u.mr+=strong?18:12;
  if(r.id==='clover')u.dodge+=strong?.12:.08;
  if(r.id==='scope')u.crit+=strong?.15:.10;
  if(r.id==='crown')u.critDmg+=strong?.40:.25;
  if(r.id==='ward'){u.shield+=u.maxHp*(strong?.18:.12);u.shieldT=Math.max(u.shieldT,6)}
  if(r.id==='vanguard'&&row>=4&&row<=5)u.armor+=strong?24:16;
  if(r.id==='rear'&&row>=6)u.spell*=strong?1.27:1.18;
  if(r.id==='lone'&&neighbors===0)u.dmgAmp+=strong?.22:.15;
  if(r.id==='chorus'&&neighbors>=2)u.as*=strong?1.18:1.12;
 }}
 if(!typeOverride)for(const u of allies)u.towerStartingRelics=activeRelicIds(u,allies);
}
function activeRelicIds(u,allies){
 const row=u.r??u.pos?.r,col=u.c??u.pos?.c;
 const near=allies.filter(v=>v!==u&&Math.hypot(hexXY(v.r??v.pos.r,v.c??v.pos.c).x-hexXY(row,col).x,hexXY(v.r??v.pos.r,v.c??v.pos.c).y-hexXY(row,col).y)<85).length;
 const types=new Set(allies.flatMap(v=>v.types||typesOf(LINES[v.line],v.star)));
 return equippedRelics().filter(r=>{
  if(['root','last','rescue','tempo'].includes(r.id))return false;
  if(r.id==='vanguard')return row>=4&&row<=5;
  if(r.id==='rear')return row>=6;
  if(r.id==='lone')return near===0;
  if(r.id==='chorus')return near>=2;
  if(r.id==='reserve')return G.bench.some(Boolean);
  if(r.id==='crystal')return types.size>=4;
  return true;
 }).map(r=>r.id);
}
function drawUnitRelics(){
 const combat=G.phase==='combat',units=combat?B.units.filter(u=>u.side===0&&u.alive):boardUnits();
 for(const u of units){const host=u.el?.querySelector('.in');if(!host)continue;
  const activeIds=new Set(combat?(u.towerStartingRelics||[]):activeRelicIds(u,units));
  if(combat){if(u.towerRootActive)activeIds.add('root');if(mechanic?.tempoUsed)activeIds.add('tempo');if(u.towerLastActive&&u.shield>0&&u.shieldT>0)activeIds.add('last')}
  if(combat&&activeIds.has('ward')&&(u.shield<=0||u.shieldT<=0))activeIds.delete('ward');
  const usedIds=new Set(combat?[...((u.towerStartingRelics||[]).includes('ward')&&!activeIds.has('ward')?['ward']:[]),...(u.towerRescued?['rescue']:[]),...(u.towerLastActive&&!activeIds.has('last')?['last']:[])]:[]);
  const relics=equippedRelics().slice().sort((a,b)=>Number(activeIds.has(b.id))-Number(activeIds.has(a.id)));
  const signature=relics.map(r=>r.id+(activeIds.has(r.id)?'+':usedIds.has(r.id)?'used':'-')).join(',');
  let badges=host.querySelector('.tower-unit-buffs');if(!relics.length){badges?.remove();continue}
  if(badges?.dataset.signature===signature)continue;
  if(!badges){badges=document.createElement('span');badges.className='tower-unit-buffs';host.append(badges)}
  badges.dataset.signature=signature;
  badges.title=relics.map(r=>(activeIds.has(r.id)?'✓ Aplicado: ':usedIds.has(r.id)?'● Já ativou: ':'○ Aguardando condição: ')+RELICS[r.id].name+': '+(r.power===2?RELICS[r.id].strong:RELICS[r.id].text)).join('\n');
  badges.setAttribute('aria-label',badges.title);
  badges.innerHTML=relics.slice(0,3).map(r=>'<img class="'+(activeIds.has(r.id)?'active':usedIds.has(r.id)?'used':'waiting')+'" src="'+(RELICS[r.id].art||itemImage(RELICS[r.id].item))+'" alt="'+esc(RELICS[r.id].name)+'">').join('')+(relics.length>3?'<b>+'+(relics.length-3)+'</b>':'');
 }
}
function relicActivation(u,id,text){
 const d=RELICS[id];FX.ring(u.x,cyOf(u),d.color,8,48,.6,3);FX.glow(u.x,cyOf(u),38,d.color,.45,.4);FX.text(u.x,u.y-60,text,d.color,12);
}
function begin(){
 const t=current();if(!t)return;ensureLoadout(t);if(t.needsRelicSetup){migrateRelicLoadout();return}close();clearCombatUnits();B.on=false;G.phase='combat';G.eventModal=false;document.body.classList.add('combat');
 spawnEnemies(G.enemy);
 for(const u of boardUnits()){
  u.el.style.display='none';const cu=mkCU({line:u.line,star:u.star,items:u.items.slice(),scale:1,r:u.pos.r,c:u.pos.c,shiny:!!u.shiny,hpx:u.shiny?SHB:1,dx:u.shiny?SHB:1},0);B.units.push(cu);addCUEl(cu);FX.poof(cu.x,cyOf(cu));
 }
 const mine=B.units.filter(u=>u.side===0),foes=B.units.filter(u=>u.side===1);applyTraits(mine,foes);applyTraits(foes,mine);applyRelics(mine);
 Object.assign(B,{t:0,on:true,over:false,done:false,sudden:0,fields:[],ev:[],zero:0,hold:false,winner:null,mew:null});
 mechanic={healedAt:0,quakeAt:null,quakeDue:0,columns:[],phase2:false,lastShield:false,roots:new Map(),pulseDue:5,pulseAt:null,pulseCells:[]};lastDraw=-1;
 SND.music('battle');SND.round();renderHUD();paintMechanic();
}
function finish(){
 if(!active()||G.phase!=='combat')return;
 const win=B.winner===0,t=current();B.on=false;clearCombatUnits();mechanic=null;clearMarks();for(const u of boardUnits())u.el.style.display='';document.body.classList.remove('combat');G.phase='result';G.lastResult=win;
 if(!win){
  window.AUTO_BATTLE?.stop();
  t.defeatsByFloor=t.defeatsByFloor||{};
  const previous=Math.max(0,Math.min(2,Number(t.defeatsByFloor[t.floor])||0)),recoveryGold=previous===0?3:previous===1?2:0;
  t.defeatsByFloor[t.floor]=Math.min(2,previous+1);G.gold+=recoveryGold;
  t.losses++;const loss=t.floor%5===4?20:Math.min(18,8+Math.floor(t.floor/5)*2);G.hp=Math.max(0,G.hp-loss);G.phase='plan';t.status='plan';renderHUD();save(true);
  if(G.hp<=0){end(false);return}
  G.eventModal=true;panel('Reorganize e tente outra vez','−'+loss+' de vida'+(recoveryGold?' · +'+recoveryGold+' ouro para reorganizar a equipe.':' · Limite de ajuda deste andar atingido.'),'<p class="tower-note">Ajuda por andar: 3 ouro na primeira derrota, 2 na segunda. A loja não é renovada; a recompensa da vitória continua inteira.</p>',[{label:'Reorganizar a equipe',autoContinue:true,run:()=>{close();plan(true)}},{label:'Salvar e sair',secondary:true,run:exit}]);return;
 }
 if(t.cleared.includes(t.floor))return;
 t.wins++;t.cleared.push(t.floor);if(!t.preview){window.ACH?.towerProgress(t);window.TRAINER_PROFILE?.towerWin();}const shinyBonus=t.enemy?.some(u=>u.shiny)?2:0;const gain=FLOORS[t.floor].reward+routeFor(t).gold+shinyBonus+(t.eventRisk===t.floor?12:0);G.gold+=gain;addXp(2);G.phase='plan';
 const potions=t.floor%5===4?3:routeFor(t).potions;
 gainVials(potions);
 if(t.floor===FLOORS.length-1){end(true);return}if(t.floor%5===4){t.status='map';save(true);renderHUD();sectorGate();return}
 const rewardKind=t.floor%5===1?'new':isPath(t.floor)&&t.elite?'upgrade':null;
 t.rewardKind=rewardKind;t.offers=[];t.status=rewardKind?'reward':'map';if(rewardKind)t.offers=dealRelicOffers();save(true);renderHUD();SND.loot();toast('Andar superado! +'+gain+' ouro · +2 XP · +'+potions+' '+(potions===1?'poção':'poções')+'.');if(rewardKind)reward();else map();
}
function drawHex(ctx,r,col,color,stroke){const p=hexXY(r,col),rad=39;ctx.beginPath();for(let i=0;i<6;i++){const a=(i*60-30)*Math.PI/180,x=p.x+Math.cos(a)*rad,y=p.y+Math.sin(a)*rad;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
function clearMarks(){marks.getContext('2d').clearRect(0,0,1280,800);marks.hidden=true;document.getElementById('towerMirrors')?.remove()}
function positionRelicHints(){
 if(!active()||G.phase!=='plan')return[];
 return equippedRelics().filter(r=>r.id==='vanguard'||r.id==='rear').map(r=>({id:r.id,rows:r.id==='vanguard'?[4,5]:[6,7],color:r.id==='vanguard'?'#e3c38e':'#c5a0f0',text:r.id==='vanguard'?'Frente: +'+(r.power===2?24:16)+' Armadura':'Retaguarda: +'+(r.power===2?27:18)+'% habilidades'}));
}
function paintPositionRelics(ctx){
 if(G.phase!=='plan')return;
 const still=CFG.reduceFx||G.paused||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const time=performance.now()/1000,pulse=still?1:.9+.1*Math.sin(time*2.8),units=boardUnits();
 const mark=(r,c,color)=>{const p=hexXY(r,c);if(window.HEX_ATTACKS?.bonusHex)HEX_ATTACKS.bonusHex(ctx,p,color,pulse,still?null:time);else drawHex(ctx,r,c,color+'33',color)};
 for(const hint of positionRelicHints())for(const r of hint.rows)for(let c=0;c<7;c++)mark(r,c,hint.id==='vanguard'?'#ffd679':'#c6adff');
 for(const u of units){const ids=activeRelicIds(u,units);if(ids.includes('lone'))mark(u.pos.r,u.pos.c,'#ffc595');else if(ids.includes('chorus'))mark(u.pos.r,u.pos.c,'#afe994')}
}
function unleashTowerSkill(type,cells,source=null){
 const reduced=!!CFG.reduceFx;
 mechanic.strike={type,cells:cells.map(p=>p.slice()),at:B.t};
 if(source){FX.ring(source.x,cyOf(source),type==='rock'?'#e4bc83':'#e2acff',10,55,.45,3);FX.glow(source.x,cyOf(source),45,type==='rock'?'#d1a374':'#b478ed',.35,.55)}
 for(const [r,c] of cells){const p=hexXY(r,c);
  if(type==='rock'){
   FX.ring(p.x,p.y,'#d1ae79',5,37,.45,2);
   FX.burst(p.x,p.y,reduced?2:5,{sp:[45,110],ang:[-2.9,-.25],life:[.4,.75],s:[5,11],s2:2,pc:['#b89a73','#776450','#d5bd92'],sh:'rock',vr:7,ay:380,add:false});
   if(!reduced)FX.glow(p.x,p.y+7,29,'#ae916c',.4,.35);
  }else{
   FX.impact('psychic',p.x,p.y-12,reduced?.65:1.15);
   FX.ring(p.x,p.y,'#d8a4ff',5,39,.55,3);
   FX.ring(p.x,p.y-18,'#f4dbff',3,27,.35,2);
   FX.glow(p.x,p.y-20,reduced?25:42,'#bb72ef',.4,.5);
   if(source&&!reduced)FX.beam(source.x,cyOf(source),p.x,p.y-12,'psychic',5,{life:.22});
  }
 }
}
function paintMechanic(){
 if(!active()){clearMarks();return}const t=current(),ctx=marks.getContext('2d');ctx.clearRect(0,0,1280,800);marks.hidden=false;
 if(G.phase==='plan')paintPositionRelics(ctx);
 if(t.floor===1)for(const [r,c] of [[3,2],[4,4]]){drawHex(ctx,r,c,'#6da55f45','#c7efaa');const p=hexXY(r,c);ctx.fillStyle='#e2ffc8';ctx.font='bold 17px Trebuchet MS';ctx.textAlign='center';ctx.fillText('+',p.x,p.y+6)}
 if(t.floor===5)for(const [r,c] of [[3,4],[4,2]]){drawHex(ctx,r,c,'#ae8cda45','#d5b9f6');const p=hexXY(r,c);ctx.fillStyle='#f2dcff';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('+',p.x,p.y+6)}
 if(mechanic?.pulseAt!=null){for(const [r,c] of mechanic.pulseCells)drawHex(ctx,r,c,'rgba(192,110,240,'+(.2+.1*Math.sin(B.t*10))+')','#edc5ff');const p=hexXY(...mechanic.pulseCells[0]);ctx.fillStyle='#f6ddff';ctx.font='bold 13px Trebuchet MS';ctx.textAlign='center';ctx.fillText('ONDA · '+Math.max(0,mechanic.pulseAt-B.t).toFixed(1)+'s',p.x,p.y-38)}
 if(t.floor===4&&mechanic?.quakeAt!=null){const left=Math.max(0,mechanic.quakeAt-B.t),alpha=.18+.12*(1+Math.sin(B.t*9))/2;for(let r=0;r<8;r++)for(const col of mechanic.columns)drawHex(ctx,r,col,'rgba(235,159,63,'+alpha+')','#f4cf83');const p=hexXY(0,mechanic.columns[0]);ctx.fillStyle='#fff1ca';ctx.font='bold 13px Trebuchet MS';ctx.textAlign='center';ctx.fillText('ABALO · '+left.toFixed(1)+'s',p.x,p.y-40)}
 const strike=mechanic?.strike;if(strike){const age=B.t-strike.at;if(age<.9){ctx.save();ctx.globalAlpha=Math.max(0,1-age/.9);for(const [r,c] of strike.cells){const p=hexXY(r,c);if(strike.type==='rock'){
  ctx.strokeStyle='#34291e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-28,p.y-12);ctx.lineTo(p.x-9,p.y-4);ctx.lineTo(p.x-16,p.y+6);ctx.lineTo(p.x+3,p.y+1);ctx.lineTo(p.x+11,p.y+16);ctx.lineTo(p.x+29,p.y+19);ctx.moveTo(p.x+3,p.y+1);ctx.lineTo(p.x+16,p.y-17);ctx.stroke();
 }else{ctx.strokeStyle='#e8bdff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,12+age*32,7+age*20,0,0,Math.PI*2);ctx.stroke()}}ctx.restore()}else mechanic.strike=null}
 const garden=mechanic?.garden;if(garden){const warning=B.t<garden.at,color=garden.kind==='spores'?'#d3afea':'#c7e9a0';for(const [r,c] of garden.cells){drawHex(ctx,r,c,warning?'#adba6440':garden.kind==='spores'?'#a46cba50':'#78a34a55',color);const p=hexXY(r,c);if(!warning){ctx.save();ctx.strokeStyle=garden.kind==='spores'?'#c79cda':'#6caa55';ctx.lineWidth=3;for(let i=0;i<4;i++){const x=p.x-21+i*14,y=p.y+10-Math.sin(B.t*3+i)*4;if(garden.kind==='spores'){ctx.fillStyle='#ceb2e477';ctx.fillRect(x,y-10-i*3,5,5)}else{ctx.beginPath();ctx.moveTo(x,p.y+13);ctx.lineTo(x+5,y-14);ctx.lineTo(x-2,y-22);ctx.stroke();ctx.fillStyle='#b5d779';ctx.fillRect(x+1,y-18,7,4)}}ctx.restore()}}const p=hexXY(...garden.cells[0]);ctx.fillStyle=color;ctx.font='bold 12px Trebuchet MS';ctx.textAlign='center';ctx.fillText((garden.kind==='roots'?'RAÍZES':garden.kind==='spores'?'ESPOROS':'SEMENTES')+(warning?' · '+Math.max(0,garden.at-B.t).toFixed(1)+'s':''),p.x,p.y-37)}
 const f=FLOORS[t.floor],color=SECTORS[Math.floor(t.floor/5)]?.color||'#d9c18a';
 if(['water-pools','conductors','duel'].includes(f.mode))for(const [r,c] of [[3,2],[4,4]]){drawHex(ctx,r,c,'#9dc8dd38',color);const p=hexXY(r,c);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 16px monospace';ctx.fillText(f.mode==='conductors'?'ϟ':f.mode==='duel'?'⚔':'≈',p.x,p.y+6)}
 const h=mechanic?.hazard;if(h){const warning=B.t<h.at;for(const [r,c] of h.cells){drawHex(ctx,r,c,warning?'#d7b26935':h.type==='fire'?'#e47c474f':'#b89acf36',color);if(!warning&&h.duration){const p=hexXY(r,c);ctx.fillStyle='#f5bd76';for(let i=0;i<3;i++)ctx.fillRect(p.x-14+i*12,p.y-8-Math.sin(B.t*6+i)*7,5,9)}}const p=hexXY(...h.cells[0]);ctx.fillStyle=color;ctx.font='bold 12px Trebuchet MS';ctx.textAlign='center';ctx.fillText((TYPES[h.type]?.n||'IMPACTO').toUpperCase()+(warning?' · '+Math.max(0,h.at-B.t).toFixed(1)+'s':''),p.x,p.y-37)}
 if(mechanic?.fragmentCells)for(const [r,c] of mechanic.fragmentCells)drawHex(ctx,r,c,'#d3b58b33','#e8c99b');
}
function tickForest(){
 const t=current(),m=mechanic;if(![10,11,14].includes(t.floor))return;
 const boss=t.floor===14?B.units.find(u=>u.side===1&&u.id===3&&u.alive):null;
 if(t.floor===14&&!boss){m.garden=null;return}
 if(boss&&!m.phase2&&boss.hp<=boss.maxHp*.5){m.phase2=true;FX.text(boss.x,boss.y-65,'A FLORESTA DESPERTA','#c7e9a0',14);SND.cry(3,.8)}
 if(m.gardenDue==null)m.gardenDue=5;
 if(!m.garden&&B.t>=m.gardenDue){
  const occupied=[...new Set(B.units.filter(u=>u.alive).map(u=>u.r+','+u.c))];
  const kind=t.floor===10?'roots':t.floor===11?'spores':'seeds';
  let cells=shuffleOwn(occupied).slice(0,kind==='spores'?2:m.phase2?5:3).map(s=>s.split(',').map(Number));
  if(kind==='spores'){const centers=cells;cells=[];for(let r=0;r<8;r++)for(let c=0;c<7;c++){const p=hexXY(r,c);if(centers.some(([rr,cc])=>{const q=hexXY(rr,cc);return Math.hypot(p.x-q.x,p.y-q.y)<80}))cells.push([r,c])}}
  if(cells.length)m.garden={kind,cells,at:B.t+2,until:B.t+6,lastTick:B.t+1,launched:false};
 }
 const field=m.garden;if(!field||B.t<field.at)return;
 const inside=u=>field.cells.some(([r,c])=>u.r===r&&u.c===c);
 if(!field.launched){
  field.launched=true;field.lastTick=B.t-1;
  for(const [r,c] of field.cells){const p=hexXY(r,c);FX.impact(field.kind==='spores'?'poison':'grass',p.x,p.y-8,CFG.reduceFx?.5:.85);FX.ring(p.x,p.y,field.kind==='spores'?'#ceb0e7':'#b7dc80',6,33,.5,2)}
  if(field.kind==='roots'){
   for(const u of B.units)if(u.alive&&inside(u)){const src=B.units.find(v=>v.alive&&v.side!==u.side);if(src)hurt(src,u,u.maxHp*.07,'magic',{dot:true});u.stun=Math.max(u.stun,1);FX.text(u.x,u.y-50,'Preso!','#c7e9a0',11)}
   field.until=B.t+.8;
  }
 }
 if(field.kind!=='roots'&&B.t-field.lastTick>=1&&B.t<field.until){
  field.lastTick=B.t;
  for(const u of B.units)if(u.alive&&inside(u)){
   if(field.kind==='seeds'&&u.side===1){healUnit(u,u.maxHp*.03,false);FX.healFx(u.x,cyOf(u))}
   else{const src=B.units.find(v=>v.alive&&v.side!==u.side);if(src)hurt(src,u,u.maxHp*(field.kind==='spores'?.03:.04),'magic',{dot:true});FX.impact(field.kind==='spores'?'poison':'grass',u.x,cyOf(u),.5)}
  }
 }
 if(B.t>=field.until){m.garden=null;m.gardenDue=field.kind==='roots'?field.at+8:B.t+(m.phase2?4:6)}
}
function showTowerWatcher(){
 const floor=current()?.floor,slot=floor-55,id=[144,145,146][slot];let watcher=document.getElementById('towerWatcher');
 if(!id||['articuno','moltres','zapdos'].includes(ARENA_T?.id)){watcher?.remove();return}
 if(!watcher){watcher=document.createElement('aside');watcher.id='towerWatcher';watcher.setAttribute('aria-label','Ave lendária observando a batalha');document.getElementById('arenaView').append(watcher)}
 watcher.innerHTML='<img src="'+sprFront(id)+'" alt="'+['Articuno','Zapdos','Moltres'][slot]+'"><small>VIGÍLIA LENDÁRIA</small>';
}
function shiftTowerUnit(u){
 if(!u.alive)return;const directions=u.side===0?[-1,1]:[1,-1];
 for(const dr of directions){const r=u.r+dr;if(r<0||r>7||B.occ.has(r*10+u.c))continue;
  B.occ.delete(u.r*10+u.c);u.r=r;const p=hexXY(r,u.c);u.x=u.ox=u.tx=p.x;u.y=u.oy=u.ty=p.y;u.moving=false;u.moveT=0;u._dashPoints=null;u.target=null;B.occ.set(r*10+u.c,u);FX.poof(u.x,cyOf(u));break;
 }
}
function swapTowerGhost(boss){
 const ally=B.units.find(u=>u.side===boss.side&&u.alive&&u!==boss&&!u.moving);if(!ally||boss.moving)return;
 const a={r:boss.r,c:boss.c},b={r:ally.r,c:ally.c};
 for(const [u,pos] of [[boss,b],[ally,a]]){u.r=pos.r;u.c=pos.c;const p=hexXY(u.r,u.c);u.x=u.ox=u.tx=p.x;u.y=u.oy=u.ty=p.y;u.moving=false;u.moveT=0;u.target=null;B.occ.set(u.r*10+u.c,u);FX.impact('ghost',u.x,cyOf(u),1)}
}
function towerTerrain(mode){
 const m=mechanic;if(B.t-(m.terrainAt??-2)<1)return;m.terrainAt=B.t;m.terrainBuffs=m.terrainBuffs||new Map();
 const wet=Math.floor(B.t/8)%2===1;
 if(mode==='fossil'&&m.wet!==wet){m.wet=wet;FX.text(640,190,wet?'MARÉ NAS RUÍNAS':'TERRENO SECO',wet?'#9dd9f1':'#ddc394',13)}
 for(const u of B.units){if(!u.alive)continue;const old=m.terrainBuffs.get(u.key)||{spell:1,damage:0,armor:0};let spell=1,damage=0,armor=0;
  const onPad=(u.r===3&&u.c===2)||(u.r===4&&u.c===4);
  if(mode==='water-pools'&&onPad&&u.types.includes('water'))spell=1.2;
  if(mode==='conductors'&&onPad){u.mana=Math.min(manaCapacity(u),u.mana+4);FX.glow(u.x,cyOf(u),20,'#f1dc8e',.3,.3)}
  if(mode==='duel'&&onPad&&!B.units.some(v=>v!==u&&v.alive&&v.side===u.side&&Math.hypot(v.x-u.x,v.y-u.y)<85))damage=.15;
  if(mode==='fossil'){if(wet&&u.types.includes('water'))spell=1.2;if(!wet&&u.types.includes('rock'))armor=12}
  u.spell=u.spell/old.spell*spell;u.dmgAmp+=damage-old.damage;u.armor+=armor-old.armor;m.terrainBuffs.set(u.key,{spell,damage,armor});
 }
}
function tickSectorHazards(){
 const t=current(),f=FLOORS[t.floor],m=mechanic;if(t.floor<15)return;
 const s=SECTORS[f.sector],boss=f.bossId?B.units.find(u=>u.side===1&&u.id===f.bossId&&u.alive):null;
 if(f.bossId&&!boss){m.hazard=null;m.fragmentCells=null;return}
 if(m.mirrorUntil&&B.t>=m.mirrorUntil){document.getElementById('towerMirrors')?.remove();m.mirrorUntil=0}
 if(m.fragmentCells&&B.t>=m.fragmentDue){
  for(const [r,c] of m.fragmentCells){const p=hexXY(r,c);FX.impact('rock',p.x,p.y,.6)}
  for(const u of B.units)if(u.alive&&u.side===0&&m.fragmentCells.some(([r,c])=>u.r===r&&u.c===c)){const src=B.units.find(v=>v.alive&&v.side!==u.side);if(src)hurt(src,u,u.maxHp*.06*(u.side===0&&t.prepared?.floor===t.floor&&t.prepared.type==='protect'?.6:1),'phys',{dot:true})}
  m.fragmentCells=null;
 }
 let mode=f.mode;if(['water-pools','conductors','duel','fossil'].includes(mode)){towerTerrain(mode);return}
 const phase=boss?(boss.hp/boss.maxHp<.33?3:boss.hp/boss.maxHp<.5?2:1):1;
 if(boss&&phase>1&&!m.sectorAwakened){m.sectorAwakened=true;FX.text(boss.x,boss.y-65,'PODER DESPERTO',s.color,14);SND.cry(boss.id,.8)}
 if(m.hazardDue==null)m.hazardDue=4;
 const occupied=()=>[...new Set(B.units.filter(u=>u.alive).map(u=>u.r+','+u.c))];
 if(!m.hazard&&B.t>=m.hazardDue){
  let count=phase>1?5:3,type=s.type,pattern='targets',ratio=f.bossId?.14:.09,duration=0;
  if(['current','wave','wind','blizzard'].includes(mode))pattern='row';
  if(['eruption','orbs','dive'].includes(mode))pattern='column';
  if(mode==='flame')pattern='cone';
  if(mode==='punch'||mode==='combo')pattern='ranks';
  if(mode==='circuit'){pattern='plates';count=phase>1?7:5}
  if(mode==='discharge'){count=4;type='electric'}
  if(['freeze','blizzard','crystals'].includes(mode))type='ice';
  if(['embers','eruption','flame'].includes(mode)){type='fire';duration=3}
  if(['shadows','shadow','mirror'].includes(mode))type='ghost';
  if(['falling','dive'].includes(mode))type='rock';
  if(mode==='meteor'){pattern=phase>1?'meteor-combo':m.attackCycle%2?'column':'targets';type='dragon'}
  if(mode==='sovereign'){const hp=boss.hp/boss.maxHp;const stage=hp<.33?3:hp<.66?2:1;type=stage===3?['fire','ice','electric'][(m.attackCycle||0)%3]:'psychic';pattern=stage===3?((m.attackCycle||0)%2?'column':'row'):'targets';count=stage===1?3:5;m.sovereignPhase=stage}
  if(t.prepared?.floor===t.floor&&t.prepared.type==='disable')count=Math.max(1,count-2);
  const cells=[],add=(r,c)=>{if(r>=0&&r<8&&c>=0&&c<7&&!cells.some(p=>p[0]===r&&p[1]===c))cells.push([r,c])};
  const targets=shuffleOwn(occupied());
  if(pattern==='row'){const rows=shuffleOwn([1,2,3,4,5,6]);for(const r of rows.slice(0,phase>1?2:1))for(let c=0;c<7;c++)add(r,c)}
  else if(pattern==='column'||pattern==='meteor-combo'){const c=Math.floor(rng()*7);for(let r=0;r<8;r++)add(r,c);if(pattern==='meteor-combo')for(const key of targets.slice(0,3))add(...key.split(',').map(Number))}
  else if(pattern==='cone'){const origin=boss||{r:1,c:3};for(let r=origin.r+1;r<8;r++)for(let c=0;c<7;c++)if(Math.abs(c-origin.c)<=Math.min(2,Math.floor((r-origin.r)/2)))add(r,c);if(phase>1)for(let r=0;r<8;r++)add(r,(origin.c+2)%7)}
  else if(pattern==='ranks'){const seq=(m.attackCycle||0)%3,rows=seq===0?[3,4]:seq===1?[0,7]:[2,3,4,5];for(const r of rows)for(let c=0;c<7;c++)add(r,c)}
  else if(pattern==='plates'){const parity=(m.attackCycle||0)%2;const choices=[];for(let r=0;r<8;r++)for(let c=0;c<7;c++)if((r+c)%2===parity)choices.push([r,c]);for(const p of shuffleOwn(choices).slice(0,count))add(...p)}
  else for(const key of targets.slice(0,count))add(...key.split(',').map(Number));
  if(cells.length)m.hazard={mode,type,cells,at:B.t+2,until:0,ratio,duration,launched:false,lastTick:0};
 }
 const h=m.hazard;if(!h||B.t<h.at)return;
 const inside=u=>h.cells.some(([r,c])=>u.r===r&&u.c===c);
 const damage=(u,ratio)=>{const source=B.units.find(v=>v.alive&&v.side!==u.side);if(source)hurt(source,u,u.maxHp*ratio*(u.side===0&&t.prepared?.floor===t.floor&&t.prepared.type==='protect'?.6:1),h.type==='rock'||h.type==='fighting'?'phys':'magic',{dot:true})};
 if(!h.launched){
  h.launched=true;h.until=B.t+(h.duration||.8);h.lastTick=B.t;
  for(const [r,c] of h.cells){const p=hexXY(r,c);FX.impact(h.type,p.x,p.y-10,CFG.reduceFx?.45:.85);FX.ring(p.x,p.y,s.color||'#dabbe8',5,34,.45,2)}
  if(boss){FX.glow(boss.x,cyOf(boss),40,s.color,.4,.6);if(h.mode==='shadow')swapTowerGhost(boss)}
  const hits=B.units.filter(u=>u.alive&&inside(u)&&(!boss||u.side===0));
  if(h.mode==='mirror'&&!CFG.reduceFx){document.getElementById('towerMirrors')?.remove();const echoes=document.createElement('div');echoes.id='towerMirrors';echoes.setAttribute('aria-hidden','true');for(const u of hits){const img=document.createElement('img');img.src=sprFront(u.id);img.style.left=(u.x+12)+'px';img.style.top=(cyOf(u)-45)+'px';echoes.append(img)}document.getElementById('arenaView').append(echoes);m.mirrorUntil=B.t+.9}
  for(const u of hits){damage(u,h.ratio);if(['current','wave','wind'].includes(h.mode)||h.mode==='sovereign'&&m.sovereignPhase>=2)shiftTowerUnit(u);if(['freeze','blizzard','crystals'].includes(h.mode)){u.stun=Math.max(u.stun,.8);u.frozen=true}if(h.mode==='mirror')u.target=null}
  if(h.mode==='dive'){const extra=[];for(const [r,c] of h.cells)for(const dc of [-1,1])if(c+dc>=0&&c+dc<7)extra.push([r,c+dc]);m.fragmentCells=extra;m.fragmentDue=B.t+2}
  if(h.mode==='crystals'&&!h.second){h.second=true;h.launched=false;h.at=B.t+2;h.mode='crystal-burst';h.ratio=.1;return}
  if(!CFG.reduceFx)FX.shake(2);
 }
 if(h.duration&&B.t-h.lastTick>=1&&B.t<h.until){h.lastTick=B.t;for(const u of B.units)if(u.alive&&inside(u)&&(!boss||u.side===0)){damage(u,.025);FX.impact('fire',u.x,cyOf(u),.4)}}
 if(B.t>=h.until){m.attackCycle=(m.attackCycle||0)+1;m.hazard=null;m.hazardDue=B.t+(h.mode==='combo'&&m.attackCycle%3?1:phase>1?4:6)*(f.bossId&&t.floor>=29?1-(.10+.15*Math.min(1,(t.floor-29)/30)):1)}
}
function tick(dt){
 if(active()&&G.phase==='plan'&&!G.over){const step=Math.floor(performance.now()/50);if(step!==lastDraw){lastDraw=step;paintMechanic();drawUnitRelics()}return}
 if(!active()||!mechanic||G.phase!=='combat'||!B.on||B.over||G.paused||dt<=0)return;
 const t=current(),m=mechanic;
 tickForest();
 tickSectorHazards();
 const tempo=equippedRelics().find(r=>r.id==='tempo');if(tempo&&!m.tempoUsed&&B.t>=10){m.tempoUsed=true;for(const u of B.units)if(u.side===0&&u.alive){u.as*=tempo.power===2?1.30:1.20;relicActivation(u,'tempo','Ritmo acelerado!')}}
 const rescue=equippedRelics().find(r=>r.id==='rescue');if(rescue)for(const u of B.units)if(u.side===0&&u.alive&&!u.towerRescued&&u.hp/u.maxHp<.35){u.towerRescued=true;healUnit(u,u.maxHp*(rescue.power===2?.22:.15),false);FX.healFx(u.x,cyOf(u));relicActivation(u,'rescue','Cura de emergência!')}
 if(t.floor===1&&B.t-m.healedAt>=2){m.healedAt=B.t;for(const u of B.units)if(u.alive&&((u.r===3&&u.c===2)||(u.r===4&&u.c===4))){healUnit(u,u.maxHp*.04,false);FX.healFx(u.x,cyOf(u))}}
 if(t.floor===5&&B.t-m.healedAt>=3){m.healedAt=B.t;for(const u of B.units)if(u.alive&&((u.r===3&&u.c===4)||(u.r===4&&u.c===2))){healUnit(u,u.maxHp*.05,false);FX.healFx(u.x,cyOf(u))}}
 if(t.floor===6||t.floor===9){
  const boss=t.floor===9?B.units.find(u=>u.side===1&&u.id===65&&u.alive):null;
  if(boss&&!m.phase2&&boss.hp<=boss.maxHp*.5){m.phase2=true;FX.text(boss.x,boss.y-65,'VISÃO ABSOLUTA','#e6b8ff',14);SND.cry(65,.8)}
  if(t.floor===9&&!boss){m.pulseAt=null;m.pulseCells=[]}
  else if(m.pulseAt==null&&B.t>=m.pulseDue){
   const cells=[...new Set(B.units.filter(u=>u.alive).map(u=>u.r+','+u.c))];
   m.pulseCells=shuffleOwn(cells).slice(0,m.phase2?5:3).map(key=>key.split(',').map(Number));
   if(m.pulseCells.length)m.pulseAt=B.t+2;
  }
  if(m.pulseAt!=null&&B.t>=m.pulseAt){
   unleashTowerSkill('psychic',m.pulseCells,boss);
   for(const u of B.units)if(u.alive&&m.pulseCells.some(([r,c])=>u.r===r&&u.c===c)){
    const source=B.units.find(v=>v.alive&&v.side!==u.side);if(source)hurt(source,u,u.maxHp*(t.floor===9?.14:.1),'magic',{dot:true});
    FX.impact('psychic',u.x,cyOf(u),1);
   }
   FX.shake(CFG.reduceFx?1:3);m.pulseAt=null;m.pulseCells=[];m.pulseDue=B.t+(m.phase2?5:7);
  }
 }
 const root=equippedRelics().find(r=>r.id==='root');if(root)for(const u of B.units.filter(x=>x.side===0&&x.alive)){
  const key=u.r+','+u.c,old=m.roots.get(u.key);if(!old||old.key!==key||u.moving){m.roots.set(u.key,{key,at:B.t});u.towerRootActive=false}else if(B.t-old.at>=3){if(!u.towerRootActive){u.towerRootActive=true;relicActivation(u,'root','Raiz persistente!')}healUnit(u,u.maxHp*(root.power===2?.045:.03)*dt,true)}
 }
 const last=equippedRelics().find(r=>r.id==='last');if(last&&!m.lastShield){const survivors=B.units.filter(u=>u.side===0&&u.alive);if(survivors.length===1){m.lastShield=true;const u=survivors[0];u.shield+=u.maxHp*(last.power===2?.45:.3);u.shieldT=Math.max(u.shieldT,5);FX.shieldFx(u.x,cyOf(u));u.towerLastActive=true;relicActivation(u,'last','Último guardião!')}}
 if(t.floor===4){
  const boss=B.units.find(u=>u.side===1&&u.id===95&&u.alive);
  if(boss&&!m.phase2&&boss.hp/boss.maxHp<=.5){m.phase2=true;m.quakeDue=B.t;FX.text(boss.x,boss.y-70,'A PEDRA DESPERTA','#f4cf83',15);SND.cry(95,.8)}
  if(boss&&m.phase2&&m.quakeAt==null&&B.t>=m.quakeDue){const cols=shuffleOwn([0,1,2,3,4,5,6]);m.columns=cols.slice(0,2);m.quakeAt=B.t+2.5}
  if(boss&&m.quakeAt!=null&&B.t>=m.quakeAt){unleashTowerSkill('rock',Array.from({length:8},(_,r)=>m.columns.map(c=>[r,c])).flat(),boss);for(const u of B.units)if(u.side===0&&u.alive&&m.columns.includes(u.c)){hurt(boss,u,u.maxHp*.14,'phys',{dot:true});FX.impact('rock',u.x,cyOf(u),1)}FX.shake(CFG.reduceFx?2:5);m.quakeAt=null;m.quakeDue=B.t+8}
  if(!boss)m.quakeAt=null;
 }
 const drawStep=Math.floor(B.t*20);if(drawStep!==lastDraw){lastDraw=drawStep;paintMechanic();drawUnitRelics()}
}
function decorate(){
 const t=current();hud.hidden=!t;if(!t){clearMarks();document.body.classList.remove('tower-active');document.querySelectorAll('.tower-unit-buffs').forEach(el=>el.remove());return}
 const f=FLOORS[t.floor];document.body.classList.add('tower-active');
 $('#rtitle').textContent='TORRE · '+(t.floor+1)+'/60';$('#rl1').textContent=sectorName(t.floor);$('#rl2').textContent=f.name;$('#rl3').textContent=f.tag;
 $('#rchips').innerHTML=FLOORS.map((floor,i)=>i>=Math.floor(t.floor/5)*5&&i<Math.floor(t.floor/5)*5+5?'<i title="'+esc(floor.name)+'" class="'+(t.cleared.includes(i)?'done':i===t.floor?'cur':'')+'">'+(t.cleared.includes(i)?'✓':i+1)+'</i>':'').join('');
 const lc=$('#lcount');if(lc){lc.hidden=false;lc.innerHTML=t.floor%5===4?'<b>Chefe do setor</b>':'Chefe em <b>'+(4-t.floor%5)+'</b>'}
 const lb=$('#lb');if(lb)lb.innerHTML='<div class="tower-lb"><small>TORRE DOS DESAFIOS</small><b>'+f.name+'</b><span>'+f.tag+'</span></div>';
 const rule='<details class="tower-rule"><summary title="Ver regra do andar">Regra</summary><p>'+f.rule+'</p></details>',busy=G.phase!=='plan'||G.eventModal;
 const ruleOpen=hud.querySelector('details')?.open,accent=SECTORS[Math.floor(t.floor/5)]?.color||'#d1b57c';hud.style.setProperty('--tower-hud-accent',accent);
 const emblem='<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M3 2h4v4h6V2h4v10h-2v10H5V12H3z" fill="currentColor"/><path d="M8 12h4v4H8zM8 19h4v5H8z" fill="#241d29"/></svg>';
 const progress=Array.from({length:5},(_,i)=>{const n=Math.floor(t.floor/5)*5+i;return '<i class="'+(t.cleared.includes(n)?'done':n===t.floor?'current':'')+'" title="Andar '+(n+1)+'"></i>'}).join('');
 hud.innerHTML='<div class="tower-hud-heading"><span class="tower-hud-emblem">'+emblem+'</span><span class="tower-hud-title"><small>'+(t.preview?'PRÉVIA · ':'')+'SETOR '+sectorOf(t.floor)+'</small><b title="'+esc(sectorName(t.floor))+'">'+esc(sectorName(t.floor))+'</b></span><span class="tower-hud-floor"><b>'+(t.floor+1)+'</b><small>/60</small></span></div><div class="tower-hud-progress" aria-label="Progresso no setor">'+progress+'</div><div class="tower-hud-actions"><button type="button" data-map title="Mapa e '+t.relics.length+' relíquias" '+(busy?'disabled':'')+'>Mapa <em>'+equippedRelics().length+'/'+relicCapacity(t)+'</em></button><button type="button" data-exit>Salvar e sair</button>'+rule+'</div>';
 if(ruleOpen)hud.querySelector('details').open=true;hud.querySelector('[data-map]').onclick=()=>{if(G.phase==='plan'&&!G.eventModal)map(true)};hud.querySelector('[data-exit]').onclick=exit;
 const hints=[...positionRelicHints(),...(G.phase==='plan'?equippedRelics().filter(r=>r.id==='lone'||r.id==='chorus').map(r=>({id:r.id,color:r.id==='lone'?'#ffd9b6':'#bdeba1',text:r.id==='lone'?'Isolado: +'+(r.power===2?22:15)+'% dano':'2 aliados próximos: +'+(r.power===2?18:12)+'% velocidade'})):[])];if(hints.length){const guide=document.createElement('div');guide.className='tower-position-guide';guide.setAttribute('aria-label','Bônus de posicionamento das relíquias');guide.innerHTML=hints.map(h=>'<span class="tower-position-bonus" style="--bonus-color:'+h.color+'"><i aria-hidden="true">'+(h.id==='vanguard'?'◇':'✦')+'</i><b>'+h.text+'</b></span>').join('');hud.append(guide)}
 const frameFx=document.createElement('span');frameFx.className='tower-hud-frame-fx';frameFx.setAttribute('aria-hidden','true');frameFx.innerHTML='<i></i><i></i><i></i><i></i>';hud.append(frameFx);
}
function end(won){
 document.getElementById('towerWatcher')?.remove();
 const t=current();if(!t)return;B.on=false;mechanic=null;clearMarks();G.over=true;G.eventModal=true;G.phase='over';t.status='ended';
 window.ACH?.towerProgress(t);
 const score=Math.max(0,t.cleared.length*100+Math.ceil(G.hp)*2+t.relics.length*15-t.losses*20);
 if(!t.preview){const list=read(RECORDS)||[];if(!list.some(r=>r.id===t.id)){list.push({id:t.id,won,score,total:FLOORS.length,floors:t.cleared.length,hp:Math.ceil(G.hp),losses:t.losses,relics:t.relics.map(r=>r.id),at:Date.now()});try{localStorage.setItem(RECORDS,JSON.stringify(list.sort((a,b)=>b.score-a.score).slice(0,20)))}catch{}}}
 clear();renderHUD();SND[won?'win':'lose']();
 const result=panel(won?'Torre conquistada!':'Fim da subida',won?(t.startFloor?'Mewtwo derrotado · Prévia do cume concluída.':'Mewtwo derrotado · Os 60 andares foram conquistados.'):'A torre espera sua próxima tentativa.',
 '<section class="tower-finish-card"><div class="tower-finish-art"><img src="'+art('entrance')+'" alt="Mewtwo e a Torre dos Desafios"><span>'+(won?'★ TORRE CONQUISTADA':'SETOR '+sectorOf(t.floor))+'</span></div><div class="tower-finish-score"><b>'+score+'</b><small>PONTOS'+(t.preview?' · PRÉVIA':'')+'</small></div><div class="tower-finish-stats"><span><b>'+t.cleared.length+'/60</b><small>Andares</small></span><span><b>'+t.relics.length+'</b><small>Relíquias</small></span><span><b>'+t.losses+'</b><small>'+(t.losses===1?'Derrota':'Derrotas')+'</small></span></div><p class="tower-finish-note">'+(t.preview?'Prévia sem recordes.':'Pontuação registrada.')+' · Campanha preservada.</p></section>',
 [{label:'Nova subida',run:()=>launch(t.preview,null,t.startFloor||0)},{label:'Voltar',secondary:true,run:()=>{location.href='index.html'}}]);
 result.querySelector('.tower-dialog').classList.add('tower-finish-dialog');
}
function exit(){if(!active())return;if(!['combat','vs'].includes(G.phase)&&!save(true)&&current().status!=='ended'){toast('Não foi possível salvar. Tente novamente antes de sair.');return}location.href='index.html'}
function restart(){const t=current();if(!t)return;const modalBefore=G.eventModal,pausedBefore=G.paused;G.eventModal=true;if(G.phase==='combat'&&!G.paused)togglePause(true);panel('Recomeçar a torre?','A equipe e as relíquias desta tentativa serão substituídas. Sua campanha permanece salva.','',[{label:'Recomeçar subida',run:()=>launch(t.preview,null,t.startFloor||0)},{label:'Voltar à tentativa',secondary:true,run:()=>{close();G.eventModal=modalBefore;if(G.phase==='combat'&&!pausedBefore)togglePause(false);if(['path','rest','reward','map','starter'].includes(t.status))plan(true)}}])}
function records(){if(window.OAK_OPEN_SCORES){window.OAK_OPEN_SCORES('tower');return}const rows=read(RECORDS)||[];panel('Recordes da Torre','Doze setores · tentativas oficiais neste navegador',rows.length?'<ol class="tower-records">'+rows.map(r=>'<li><b>'+r.score+' pontos</b><span>'+r.floors+'/'+(r.total||5)+' andares · '+(r.won?'Setor concluído':'Fim da subida')+'</span><small>'+new Date(r.at).toLocaleDateString('pt-BR')+'</small></li>').join('')+'</ol>':'<p class="tower-note">Nenhuma tentativa oficial registrada. A prévia não entra na classificação.</p>',[{label:'Voltar',run:menu}])}
function previewStats(u,original=null){if(!active()||!u)return;if(original?.pos?.z==='b'){u.r=original.pos.r;u.c=original.pos.c}else if(original){u.r=-1;u.c=-1}applyRelics([u],new Set(boardUnits().flatMap(x=>typesOf(LINES[x.line],x.star))))}
window.TOWER={get isPreview(){return !!current()?.preview},get active(){return active()},canShop,legendaryVisible,legendaryStats,seedCampaignLegendaryPool,round,plan,begin,finish,tick,save,clear,restart,menu,records,previewStats};
const oldHUD=renderHUD;renderHUD=function(){const result=oldHUD.apply(this,arguments);decorate();return result};
const oldSync=syncModePreview;syncModePreview=function(){const result=oldSync.apply(this,arguments),can=unlocked(),saved=read(can?KEY:PREVIEW_KEY),hasSave=valid(saved);const hint=document.getElementById('towerPreviewHint');if(hint)hint.textContent=hasSave?'Andar '+Math.min(FLOORS.length,saved.tower.floor+1)+' de 60 · Continuar'+(can?'':' prévia'):'60 andares · 12 setores · 12 chefes';const state=document.getElementById('towerPreviewState');if(state)state.textContent=can?'I–XII':'PRÉVIA';const card=document.getElementById('towerPreview');if(card){card.setAttribute('aria-label','Torre dos Desafios · '+(can?'Primeiro setor':'Prévia disponível; oficial após Mewtwo no Difícil'));card.title=can?'Entrar na Torre':'Jogue a prévia. Modo oficial após Mewtwo no Difícil.'}const notice=document.getElementById('towerNotice');if(notice&&TM.view==='tower')notice.textContent='Doze setores disponíveis: sessenta andares, relíquias e salvamento próprio.';return result};
document.getElementById('towerPreview').addEventListener('click',()=>{if(LAB.st==='title')menu()});
document.addEventListener('click',e=>{if(e.target.closest('[data-act="scoresTower"],[data-score-mode="tower"]')){e.stopImmediatePropagation();document.getElementById('scores')?.classList.remove('show');records()}},true);
// Explicit local preview link; does not bypass the official unlock or write official records.
syncModePreview();document.querySelector('#towerPreview .mode-art img').src=art('entrance');
if(new URLSearchParams(location.search).get('towerPreview')==='1')menu();
})();
