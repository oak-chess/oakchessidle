// Uses official usernames, never phone numbers or locally editable nicknames.
export function openNewConversation(client, container, contacts, actions) {
 const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const view=make('section',undefined,'chat-new-conversation'),header=make('header',undefined,'online-thread-header');
 const back=make('button','‹');back.type='button';back.setAttribute('aria-label','Voltar às conversas');
 const title=make('strong','Nova conversa');header.append(back,title);
 const search=make('input');search.type='search';search.placeholder='Pesquisar nome ou @treinador';search.setAttribute('aria-label','Pesquisar contato para conversar');
 const options=make('div',undefined,'chat-new-options'),list=make('div',undefined,'online-conversation-list');
 const status=make('p',undefined,'online-contact-status');status.setAttribute('role','status');
 const form=make('form',undefined,'chat-new-form');form.hidden=true;
 view.append(header,search,options,form,status,list);container.append(view);
 let disposed=false,busy=false,mode='list';const selected=new Set();
 function finish(){disposed=true;view.remove();}
 back.onclick=()=>{finish();actions.back();};
 function option(label,group,action){const button=make('button',undefined,'chat-new-option');button.type='button';const icon=make('span',undefined,'chat-new-option-icon');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',group?'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9v-2c0-3 3-5 7-5s7 2 7 5v2H2Zm15-9a3 3 0 1 0 0-6v6Zm1 3c3 0 5 2 5 4v2h-5v-6Z':'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9v-2c0-3 3-5 7-5s7 2 7 5v2H2Zm18-13V4h-2v3h-3v2h3v3h2V9h3V7h-3Z');svg.append(path);icon.append(svg);button.append(icon,make('span',label));button.onclick=action;return button;}
 function draw(){list.replaceChildren();const query=search.value.replace(/^@/,'').trim().toLocaleLowerCase();
  for(const contact of contacts.filter(c=>c.username.toLocaleLowerCase().includes(query))){
   const row=make('button',undefined,'online-conversation-row');row.type='button';const avatar=make('span',contact.username.charAt(0).toUpperCase(),'online-avatar'),copy=make('span',undefined,'online-row-copy');copy.append(make('strong','@'+contact.username),make('small',mode==='group'?'Selecionar participante':'Iniciar conversa'));row.append(avatar,copy);
   if(mode==='group'){row.setAttribute('aria-pressed',String(selected.has(contact.id)));row.append(make('span',selected.has(contact.id)?'✓':'','chat-member-check'));}
   row.onclick=()=>{if(mode==='group'){selected.has(contact.id)?selected.delete(contact.id):selected.size<19&&selected.add(contact.id);draw();}else{finish();actions.open(contact);}};list.append(row);
  }
  if(!list.children.length)list.append(make('p',contacts.length?'Nenhum contato com esse nome.':'Adicione um treinador para iniciar uma conversa.','online-contact-status'));
 }
 function configure(next){mode=next;form.replaceChildren();form.hidden=false;status.textContent='';title.textContent=next==='group'?'Novo grupo':'Novo contato';
  const input=make('input');input.required=true;input.maxLength=next==='group'?48:24;input.placeholder=next==='group'?'Nome do grupo':'Nome oficial do treinador';input.setAttribute('aria-label',input.placeholder);if(next==='contact')input.pattern='@?[A-Za-z0-9_]{3,24}';
  const send=make('button',next==='group'?'Criar grupo':'Adicionar');form.append(input,send);input.focus();draw();
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;if(next==='group'&&!selected.size){status.textContent='Escolha pelo menos um contato.';return;}busy=true;send.disabled=true;
   try{const {data,error}=next==='group'?await client.rpc('create_chat_group',{group_name:input.value.trim(),member_ids:[...selected]}):await client.rpc('add_player_contact',{requested_username:input.value.trim().replace(/^@/,'')});if(disposed)return;
    if(error){status.textContent=error.code==='PGRST202'?'Este recurso aguarda a atualização do banco.':next==='group'?'Não foi possível criar. Escolha contatos que também adicionaram você.':'Treinador indisponível. Confira o nome oficial.';return;}
    finish();await actions.created(next==='group'?{id:data,name:input.value.trim(),member_count:selected.size+1}:null);
   }finally{busy=false;if(!disposed)send.disabled=false;}
  };
 }
 options.append(option('Novo grupo',true,()=>configure('group')),option('Novo contato',false,()=>configure('contact')));
 search.oninput=draw;draw();return finish;
}
