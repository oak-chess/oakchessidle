/* Shared defensive matchup presentation for the sheet and the arena tooltip. */
window.IDLE_TYPE_VIEW={create(defenders,labels,icons,compact=false){
 const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e},root=node('section',undefined,'idle-element-groups');
 root.setAttribute('aria-label','Relações elementais de dano recebido');root.classList.toggle('is-compact',compact);root.append(node('small','DANO RECEBIDO','idle-element-caption'));
 const rows=window.IDLE_TACTICS.types.map(type=>({type,factor:window.IDLE_TACTICS.effectiveness(type,defenders)}));
 for(const [key,title,description,test]of [
  ['resist','Vantagem','Recebe menos dano',x=>x>0&&x<1],
  ['weak','Desvantagem','Recebe mais dano',x=>x>1],
  ['neutral','Neutro','Dano normal',x=>x===1],
  ['immune','Imune','Não recebe dano do tipo',x=>x===0]
 ]){const entries=rows.filter(x=>test(x.factor)),group=node(key==='neutral'&&!compact?'details':'div',undefined,'idle-element-group');group.dataset.relation=key;const heading=node(key==='neutral'&&!compact?'summary':'div',undefined,'idle-element-heading');heading.append(node('b',title),node('small',description));group.append(heading);const chips=node('div',undefined,'idle-element-chips');
  if(compact&&key==='neutral'){chips.append(node('small',entries.length+' tipos · ×1','idle-element-empty'));group.title=entries.map(x=>labels?.[x.type]?.n||x.type).join(', ');group.append(chips);root.append(group);continue}
  for(const {type,factor}of entries){const label=labels?.[type]?.n||type,chip=node('span',undefined,'idle-element-chip');chip.title=label+' · dano recebido ×'+factor.toLocaleString('pt-BR',{maximumFractionDigits:4});chip.setAttribute('aria-label',chip.title);if(icons?.[type]){const img=node('img');img.src=icons[type];img.alt='';chip.append(img)}const text=node('span',label);text.className='idle-element-type-name';chip.append(text,node('b','×'+factor.toLocaleString('pt-BR',{maximumFractionDigits:4})));chips.append(chip)}
  if(!entries.length)chips.append(node('small','Nenhum tipo','idle-element-empty'));group.append(chips);root.append(group);
 }return root;
}};
