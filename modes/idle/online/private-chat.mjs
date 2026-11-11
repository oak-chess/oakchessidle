import { appendVerification } from './verification.mjs';
// Poll only the visible, selected conversation; never load other players' threads.
export function openPrivateChat(client, container, contact, owner, back) {
 const view=document.createElement('section'); view.className='chat-private';
 const header=document.createElement('header');header.className='online-thread-header';
 const close=document.createElement('button');close.type='button';close.textContent='‹';close.setAttribute('aria-label','Voltar às conversas');
 const avatar=document.createElement('span');avatar.className='online-avatar';avatar.textContent=contact.username.charAt(0).toUpperCase();
 const identity=document.createElement('div'),name=document.createElement('strong'),kind=document.createElement('small');name.textContent=(contact.isGroup?'':'@')+contact.username;if(contact.verified===true)appendVerification(name,'verified');kind.textContent=contact.isGroup?contact.member_count+' participantes':'Treinador · conversa privada';identity.append(name,kind);header.append(close,avatar,identity);
 const status=document.createElement('small');status.setAttribute('role','status');
 const list=document.createElement('ul');list.setAttribute('aria-label','Mensagens privadas');
 const form=document.createElement('form'),input=document.createElement('input'),send=document.createElement('button');
 input.maxLength=140;input.required=true;input.placeholder='Mensagem privada';input.setAttribute('aria-label','Mensagem privada');
 send.textContent='➤';send.setAttribute('aria-label','Enviar mensagem');form.append(input,send);view.append(header,status,list,form);container.append(view);
 let disposed=false,busy=false,last='',nextSendAt=0,ready=false;
 function updateSend(){const left=Math.max(0,Math.ceil((nextSendAt-Date.now())/1000));send.disabled=!ready||busy||left>0;send.textContent=left?String(left)+'s':'➤';send.title=left?'Aguarde '+left+' segundos':'Enviar mensagem';}
 const cooldownTimer=setInterval(updateSend,1000);
 async function refresh(){
  if(disposed||document.hidden||!view.isConnected)return;
  const {data,error}=await client.rpc(contact.isGroup?'read_group_thread':'read_private_thread',{target_id:contact.id,mark_read:document.hasFocus()&&!document.hidden});
  if(disposed)return;
  if(error){ready=false;status.textContent='Conversas privadas aguardando atualização do banco.';send.disabled=true;return;}
  ready=true;updateSend();status.textContent=contact.isGroup?'Grupo · atualização a cada 8 s':'Privado · os dois jogadores devem se adicionar · atualização a cada 8 s';
  const rows=[...(data||[])].reverse(),key=JSON.stringify(rows);
  if(key===last)return;last=key;
  const bottom=list.scrollHeight-list.clientHeight-list.scrollTop<40;
  list.replaceChildren();
  for(const message of rows){const li=document.createElement('li'),body=document.createElement('span'),time=document.createElement('time');li.dataset.mine=String(message.sender_id===owner);if(contact.isGroup&&message.sender_id!==owner){const author=document.createElement('b');author.textContent=message.username;li.append(author);}body.textContent=message.body;time.textContent=new Date(message.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});li.append(body,time);if(message.sender_id===owner){const receipt=document.createElement('span');receipt.className='chat-receipt';receipt.dataset.seen=String(message.seen===true);receipt.textContent=message.delivered===true?'✓✓':'✓';receipt.title=message.seen===true?'Mensagem lida':message.delivered===true?'Mensagem entregue':'Mensagem enviada';receipt.setAttribute('aria-label',receipt.title);time.append(' ',receipt);}list.append(li);}
  if(bottom)list.scrollTop=list.scrollHeight;
 }
 const interval=setInterval(()=>void refresh(),8000);
 const dispose=()=>{disposed=true;clearInterval(interval);clearInterval(cooldownTimer);view.remove();};
 close.onclick=()=>{dispose();back();};
 form.onsubmit=async event=>{event.preventDefault();if(busy||Date.now()<nextSendAt)return;busy=true;send.disabled=true;const text=input.value;try{const {error}=await client.rpc(contact.isGroup?'send_group_message':'send_private_message',{target_id:contact.id,message_text:text});if(disposed)return;if(error){status.textContent=error.code==='PGRST202'?'Conversas privadas aguardando atualização do banco.':error.message;return;}nextSendAt=Date.now()+40000;if(input.value===text)input.value='';await refresh();}finally{busy=false;if(!disposed)updateSend();}};
 void refresh();return dispose;
}
