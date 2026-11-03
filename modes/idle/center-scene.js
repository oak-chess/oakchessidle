/* Center arena: native hex geometry and perspective, isolated to Jornada Idle. */
window.createIdleCenterScene=function(ctx){
 const s=ctx.state;let root,layer,team,last='',focus,staffFrame=0,lastStaffTick=0,dialogue,dialogueText,dialogueActions,healingTimer=0,dialogueFocus;
 const staff=[];let evolutionEffect=null,evolutionTimer=0;
 function clearEvolution(){clearTimeout(evolutionTimer);evolutionTimer=0;evolutionEffect?.remove();evolutionEffect=null}
 function celebrateEvolution(event){
  if(!root||root.hidden)open();clearEvolution();refresh();
  const fx=el('section',undefined,'ic-evolution-effect');evolutionEffect=fx;fx.setAttribute('role','status');fx.setAttribute('aria-live','polite');fx.dataset.memberId=event.member.id;
  const reduced=!!CFG.reduceFx||matchMedia('(prefers-reduced-motion: reduce)').matches;fx.dataset.reduced=String(reduced);
  const copy=el('div',undefined,'ic-evolution-copy'),caption=el('small','EVOLUÇÃO NO CENTRO POKÉMON'),title=el('h2',event.fromName+' está evoluindo!'),sprites=el('div',undefined,'ic-evolution-sprites');
  const sprite=(id,label,cls)=>{const img=el('img',undefined,cls);img.src=window.IDLE_SHINY.sprite(ctx.sprite(id),event.member.shiny===true);img.alt=label;return img};
  sprites.append(sprite(event.fromId,event.fromName,'ic-evolution-before'),sprite(event.toId,event.toName,'ic-evolution-after'));
  const particles=el('div',undefined,'ic-evolution-particles');particles.setAttribute('aria-hidden','true');for(let i=0;i<16;i++){const spark=el('i');spark.style.setProperty('--angle',i*22.5+'deg');particles.append(spark)}sprites.append(particles);
  copy.append(caption,title,sprites,el('p','Nível, IVs, potência e identidade preservados.'));fx.append(copy);stage.append(fx);SND.evolve();
  const reveal=()=>{if(evolutionEffect!==fx)return;fx.dataset.revealed='true';title.textContent=event.fromName+' evoluiu para '+event.toName+'!';SND.cry(event.toId,1);SND.star();evolutionTimer=setTimeout(clearEvolution,reduced?1800:2400)};
  // Start the transformation only once both forms can actually be drawn.
  Promise.all([...sprites.querySelectorAll('img')].map(img=>img.decode().catch(()=>{}))).then(()=>{if(evolutionEffect!==fx)return;fx.dataset.transforming='true';evolutionTimer=setTimeout(reveal,reduced?150:3200)});
 }

 const interior=new Image();interior.src='modes/idle/assets/center/interior-pixel-v2.png';interior.onload=()=>{if(root&&!root.hidden)repaintArena()};
 function staffSprite(id,label,shiny=false){
  const cv=document.createElement('canvas');cv.width=80;cv.height=88;cv.className='ic-staff-pokemon';cv.setAttribute('role','img');cv.setAttribute('aria-label',label);const item={cv,data:null};staff.push(item);
  const fallback=()=>cv.replaceWith(Object.assign(new Image(),{src:'assets/pokeapi/sprites/pokemon/'+(shiny?'shiny/':'')+id+'.png',alt:label,className:'ic-staff-fallback'}));TRAINER_PARTNER_SPRITES.load(id,shiny).then(data=>{if(!data?.Idle){fallback();return}item.data=data}).catch(fallback);return cv;
 }
 function animateStaff(now){if(!root||root.hidden){staffFrame=0;return}staffFrame=requestAnimationFrame(animateStaff);if(now-lastStaffTick<100)return;lastStaffTick=now;
  for(let i=staff.length-1;i>=0;i--)if(!staff[i].cv.isConnected)staff.splice(i,1);
  for(const item of staff){const g=item.cv.getContext('2d');g.clearRect(0,0,80,88);if(item.data)TRAINER_PARTNER_SPRITES.draw(g,item.data,now,{x:40,y:78,height:53,row:0})}
 }
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
 const btn=(text,fn,cls)=>{const e=el('button',text,cls);e.type='button';e.onclick=fn;return e};
 const nativePaint=paintArena;
 paintArena=function(g,part='all'){if(root&&!root.hidden)return paintCenter(g,part);return nativePaint(g,part)};
 function centerLayout(){
  if(!root)return {scale:1,x:0,y:0};
  if(root.classList.contains('rv-native-layer')){root.style.removeProperty('transform');return {scale:1,x:0,y:0}}
  const width=Math.max(W,document.getElementById('stage').clientWidth),scale=width/W,x=(W-width)/2,y=(H-H*scale)*.35;
  root.style.transformOrigin='0 0';root.style.setProperty('transform','translate('+x+'px,'+y+'px) scale('+scale+')','important');
  return {scale,x,y};
 }
 function paintCenter(g,part){
  g.save();g.imageSmoothingEnabled=false;
  if(part!=='arena'){g.fillStyle='#25323a';g.fillRect(-640,-300,2560,1400)}
  if(part!=='scene'){
   const layout=centerLayout();if(interior.complete&&interior.naturalWidth)g.drawImage(interior,layout.x,layout.y,W*layout.scale,H*layout.scale);
   else {g.fillStyle='#e2dfcc';g.fillRect(0,0,W,H)}
  }
  g.restore();
 }
 function dismissDialogue(){clearTimeout(healingTimer);healingTimer=0;if(!dialogue)return;dialogue.hidden=true;layer.classList.remove('ic-healing');dialogueFocus?.focus()}
 function talkToNurse(){
  if(healingTimer)return;ctx.closePanels();dialogueFocus=document.activeElement;dialogue.hidden=false;dialogueActions.replaceChildren();
  dialogueText.textContent='Olá! Bem-vindo ao Centro Pokémon. Posso recuperar seus Pokémon gratuitamente?'+(ctx.isRunning()?' A caçada será encerrada ao confirmar.':'');
  const confirm=btn('Sim, cuidar da equipe · Grátis',()=>{
   confirm.disabled=true;const result=ctx.recover();dialogueActions.replaceChildren();
   if(!result.ok){dialogueText.textContent=result.message;const done=btn('Entendi',dismissDialogue);dialogueActions.append(done);done.focus();return}
   dialogueText.textContent='Só um instante! Estamos cuidando dos seus Pokémon…';layer.classList.add('ic-healing');
   healingTimer=setTimeout(()=>{healingTimer=0;layer.classList.remove('ic-healing');dialogueText.textContent=result.message;const done=btn('Obrigado!',dismissDialogue);dialogueActions.append(done);done.focus();refresh()},1100);
  });dialogueActions.append(confirm,btn('Agora não',dismissDialogue));confirm.focus();
 }
 function close(){clearEvolution();if(!root||root.hidden)return;dismissDialogue();ctx.closePanels();root.hidden=true;layer.hidden=true;document.body.classList.remove('idle-center-view');cancelAnimationFrame(staffFrame);staffFrame=0;repaintArena();const action=document.getElementById('in-auto-label');if(action)action.textContent=ctx.isRunning()?'PAUSAR':'EXPLORAR';if(!ctx.isRunning()){s.world.location='field';ctx.save()}focus?.focus()}
 function open(){if(root&&!root.hidden){close();return}focus=document.activeElement;ctx.closePanels();if(!ctx.isRunning()){s.world.location='center';ctx.save()}root.hidden=false;layer.hidden=false;document.body.classList.add('idle-center-view');last='';repaintArena();refresh();if(!staffFrame)staffFrame=requestAnimationFrame(animateStaff)}
 function refresh(){if(!root||root.hidden)return;centerLayout();const action=document.getElementById('in-auto-label');if(action)action.textContent='VOLTAR À CAÇADA';team.replaceChildren();last='';}

 function mount(stage){
  layer=el('div',undefined,'ic-arena-services');root=layer;root.id='idle-center-scene';root.hidden=true;root.setAttribute('aria-label','Estações da arena do Centro Pokémon');document.getElementById('arenaView').append(layer);const A=arGeo();
  const services=[
   ['nurse','Enfermaria','nurse',talkToNurse,590,177,'Descansar e recuperar a equipe'],
   ['pc','PC Pokémon','scientist',ctx.pc,239,248,'Organizar os Pokémon guardados'],
   ['shop','Suprimentos','mart_employee',ctx.shop,1085,172,'Atendente da loja · comprar suprimentos e vender itens'],
   ['evolution','Evolução',242,ctx.evolution,245,400,'Blissey · apoio à evolução'],
   ['tasks','Tarefas','bill',ctx.tasks,1130,392,'Responsável pelas tarefas · consultar atividades da reserva'],
   ['mega','Professor Carvalho','oak',ctx.mega,240,540,'Professor Carvalho · pesquisa Mega, fragmentos e Mega Pedras'],['nursery','Incubadora','daycare_lady',ctx.nursery,1168,279,'Cuidadora do Day Care · incubação e cuidados com os ovos'],['gacha','Gachapon','worker',ctx.gacha,1170,510,'Técnico do gachapon · ovos de Kanto, Johto e Hoenn']
  ];
  for(const [id,label,sprite,fn,x,y,description]of services){
   const b=btn('',fn,'ic-station ic-station-'+id);b.title=description;b.setAttribute('aria-label',label+' · '+description);
   if(typeof sprite==='number')b.append(staffSprite(sprite,description));
   else if(sprite){const person=el('span',undefined,'ic-overworld ic-overworld-'+sprite);person.setAttribute('aria-hidden','true');const src=({nurse:'modes/idle/assets/center/nurse-emerald.png',mart_employee:'modes/idle/assets/center/mart-employee-emerald.png',daycare_lady:'modes/idle/assets/center/daycare-lady-emerald.png'})[sprite]||'assets/trainer-profile/sprites/'+sprite+'_normal.png';person.style.backgroundImage='url("'+src+'")';b.append(person)}
   else b.classList.add('ic-equipment-hotspot');
   b.append(el('b',label));b.style.left=x+'px';b.style.top=y+'px';layer.append(b);
  }
  const nurseryHelper=btn('',ctx.nursery,'ic-center-assistant');nurseryHelper.title='Happiny · ajudante da incubadora';nurseryHelper.setAttribute('aria-label',nurseryHelper.title);nurseryHelper.style.left='1220px';nurseryHelper.style.top='280px';nurseryHelper.append(staffSprite(440,'Happiny'));layer.append(nurseryHelper);
  const assistant=btn('',talkToNurse,'ic-center-assistant');assistant.title='Chansey · auxiliar da enfermaria';assistant.setAttribute('aria-label',assistant.title);assistant.style.left='687px';assistant.style.top='163px';assistant.append(staffSprite(113,'Chansey'));layer.append(assistant);
  team=el('div',undefined,'ic-floor-team');layer.append(team);window.addEventListener('resize',()=>requestAnimationFrame(()=>{if(root&&!root.hidden){centerLayout();repaintArena()}}));
  dialogue=el('aside',undefined,'ic-dialogue');dialogue.hidden=true;dialogue.setAttribute('role','dialog');dialogue.setAttribute('aria-label','Conversa com a enfermeira');const portrait=el('span',undefined,'ic-dialogue-portrait');portrait.setAttribute('aria-hidden','true');const copy=el('div',undefined,'ic-dialogue-copy');dialogueText=el('p');dialogueText.setAttribute('aria-live','polite');dialogueActions=el('div',undefined,'ic-dialogue-actions');copy.append(el('b','Enfermeira'),dialogueText,dialogueActions);dialogue.append(portrait,copy);stage.append(dialogue);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden&&!document.querySelector('.idle-window:not([hidden])')){e.preventDefault();e.stopImmediatePropagation();if(!dialogue.hidden)dismissDialogue();else close()}},true);
 }
 return {mount,open,close,refresh,celebrateEvolution,openRecovery(){if(!root||root.hidden)open();talkToNurse()},isOpen:()=>!!root&&!root.hidden};
};
