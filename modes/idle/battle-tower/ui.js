/* All portraits, numbers and actions are native, never baked into concept art. */
window.createIdleBattleTowerUI=function(ctx){let root,selected=1,signature='',opener,firstFloor=1,lastFloor=40;const model=ctx.model;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const button=(text,fn,cls)=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;b.addEventListener('mouseenter',()=>{if(!b.disabled)SND.hover()});return b};
 let lastRefresh=0;
 function portrait(id,name,shiny=false,form=0){
  const canvas=el('canvas');
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label',name||'Pokémon');
  if(!id)return canvas;
  function paint(image,x,y,width,height){
   if(!canvas.isConnected)return;
   canvas.width=width;canvas.height=height;
   canvas.getContext('2d').drawImage(image,x,y,width,height,0,0,width,height);
  }
  window.IDLE_PMD_PORTRAITS.url(id,shiny,form).then(sprite=>{
   if(!canvas.isConnected)return;
   if(sprite){paint(sprite.img,sprite.x,sprite.y,sprite.w,sprite.h);return}
   const fallback=new Image();
   fallback.onload=()=>paint(fallback,0,0,fallback.naturalWidth,fallback.naturalHeight);
   fallback.src='assets/pokeapi/sprites/pokemon/'+(shiny?'shiny/':'')+id+'.png';
  });
  return canvas;
 }
  function close(){if(root)root.hidden=true;window.IDLE_BATTLE_TOWER_RELEASE_PREVIEWS?.()}
 function refresh(){if(!root||root.hidden)return;const now=performance.now();if(now-lastRefresh<250)return;lastRefresh=now;const next=model.describe(),key=JSON.stringify([model.data.best,next.floor,model.data.active,ctx.state.team.map(m=>[m.id,m.star,m.level,m.condition,m.items])]);if(key!==signature){signature=key;draw()}}
 function draw(){const previousRoute=root.querySelector(".bt-route");const scroll=previousRoute?.scrollTop||0;const focused=previousRoute?.contains(document.activeElement)?document.activeElement.dataset.floor:null;root.replaceChildren();const x=button('×',()=>{SND.mback();close();opener?.focus?.()},'bt-close');x.setAttribute('aria-label','Fechar Torre de Batalha');const title=el('h2','Torre de Batalha','bt-sr');title.id='bt-title';root.append(title,x);const layout=el('div',undefined,'bt-layout'),nav=el('nav',undefined,'bt-route'),next=model.describe();
 nav.setAttribute('aria-label','Andares da Torre');
 if(firstFloor>1)nav.append(button('Mostrar andares anteriores',()=>{firstFloor=Math.max(1,firstFloor-5);draw()},'bt-more'));
 for(let n=firstFloor;n<=lastFloor;n++){
 const f=model.describe(n);
 if((n-1)%5===0)nav.append(el('h3','SETOR '+f.sector+' · '+f.sectorName.toUpperCase()));
 const b=button('',()=>{selected=n;SND.mnav();draw()},'bt-floor');
 b.dataset.floor=String(n);b.dataset.selected=String(n===selected);
 b.dataset.state=n<next.floor?'done':n===next.floor?'next':'locked';
 b.dataset.guardian=String(f.guardian);b.setAttribute('aria-pressed',String(n===selected));
 b.setAttribute('aria-label','Andar '+n+' · '+f.title);
 b.append(el('small',String(n).padStart(2,'0')),portrait(f.ids[0],f.names[0]),el('b',f.title),el('i',n<next.floor?'✓':f.guardian?'◆':n===next.floor?'›':'·'));
 nav.append(b);
 }
 const more=button('Mostrar mais andares',()=>{const firstNew=lastFloor+1;lastFloor+=5;draw();root.querySelector('[data-floor="'+firstNew+'"]').focus()},'bt-more');
 nav.append(more);
 const f=model.describe(selected),main=el('div',undefined,'bt-main'),head=el('div',undefined,'bt-heading');head.append(el('b','ANDAR '+String(f.floor).padStart(2,'0')),el('h3',f.title));main.append(head);const preview=el('div',undefined,'bt-preview'),canvas=el('canvas');canvas.width=800;canvas.height=440;preview.append(canvas);queueMicrotask(()=>window.IDLE_BATTLE_TOWER_PREVIEW(canvas,f.type));const rule=el('div',undefined,'bt-rule');rule.append(el('strong',f.guardian?'REGRA DO GUARDIÃO':'REGRA DO ANDAR'),el('span',f.rule));preview.append(rule);const foes=el('div',undefined,'bt-preview-foes');for(const [i,name]of f.names.slice(0,6).entries()){const img=portrait(f.ids[i],name);img.title=name;const row=el('div',undefined,'bt-foe');row.append(img);foes.append(row)}preview.append(foes);main.append(preview);
 const info=el('div',undefined,'bt-info');info.append(el('span','Adversários · Nv. '+f.level),el('span','Recorde · '+model.data.best+' andares'),el('span',f.floor>model.data.best?'Prêmio · '+f.coins+' Coins'+(f.materials?' + '+f.materials+' materiais':''):'Recompensa já recebida'));main.append(info);
 const footer=el('div',undefined,'bt-footer'),team=el('section',undefined,'bt-team');team.append(el('h3','SUA EQUIPE'));const roster=el('div',undefined,'bt-roster');for(const m of ctx.state.team.filter(m=>m.pos?.z==='b')){const L=ctx.lines.find(l=>l.names[0]===m.name);if(!L)continue;const card=el('div',undefined,'bt-member');card.title=L.names[m.star-1]+' · '+Math.round((m.condition??1)*100)+'% PS';card.dataset.fainted=String((m.condition??1)<=0);const appearance=window.IDLE_PMD_PORTRAITS.identity(m,ctx.lines);const img=portrait(appearance.id,appearance.name,appearance.shiny,appearance.form);card.append(img,el('small','Nv. '+m.level));if(m.items?.length)card.append(el('i','◆'));const hp=el('span',undefined,'bt-hp'),fill=el('i');fill.style.width=Math.max(0,Math.min(100,(m.condition??1)*100))+'%';hp.append(fill);card.append(hp);roster.append(card)}team.append(roster);const actions=el('div',undefined,'bt-actions'),start=button(model.data.active?'CONTINUAR\nANDAR '+next.floor:'INICIAR\nSUBIDA',()=>{const r=model.start();if(!r.ok){SND.err();ctx.notify(r.reason||'Não foi possível iniciar.');draw()}else{SND.msel();close()}},'bt-start');start.disabled=selected!==next.floor||!!model.blocked();start.title=selected!==next.floor?'Selecione o próximo andar.':model.blocked()||'Subida automática até o último Pokémon cair';actions.append(start,button('‹ Voltar aos modos',()=>{SND.mback();close();ctx.back()},'bt-back'));footer.append(team,actions);main.append(footer);const help=el('p',model.blocked()||'Sem cartas ou consumíveis. Equipamentos preservados. A subida continua com os sobreviventes.','bt-help');main.append(help);layout.append(nav,main);root.append(layout);nav.scrollTop=scroll;if(focused)nav.querySelector('[data-floor="'+focused+'"]')?.focus({preventScroll:true})
 }
 function open(){SND.init();SND.mon();opener=document.activeElement;ctx.closePanels();root.hidden=false;selected=model.describe().floor;firstFloor=Math.max(1,Math.floor((selected-1)/5)*5-14);lastFloor=firstFloor+39;root.replaceChildren();signature='';lastRefresh=0;refresh();const route=root.querySelector('.bt-route'),floor=route.querySelector('[data-selected=true]');if(floor)route.scrollTop=floor.offsetTop-32;root.querySelector('.bt-close').focus()}
 function mount(stage){root=el('section',undefined,'idle-window bt-window');root.id='idle-battle-tower';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','bt-title');root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();SND.mback();close();opener?.focus?.()}if(e.key==='Tab'){const buttons=[...root.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});stage.append(root)}
 return {open,close,mount,refresh};
};
