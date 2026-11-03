/* Jessie & James: occasional, persistent encounters using the native battle host. */
(()=>{
 let host;
 const images={};
 for(const name of ['jessie','james']){const im=new Image();im.onload=()=>{images[name]=im};im.src='assets/rocket-duo/'+name+'-color.png'}
 const art=()=>'<div class="rocket-duo-retro"><small>ENCONTRO ESPECIAL · EQUIPE ROCKET</small><div>'+['jessie','james'].map(name=>'<figure><span><img src="assets/rocket-duo/'+name+'-color.png" alt="'+(name==='jessie'?'Jessie':'James')+'"></span><figcaption>'+name[0].toUpperCase()+name.slice(1)+'</figcaption></figure>').join('')+'</div></div>';
 const duoLayout=(x,y)=>[{name:'jessie',x:x+46,y:y-52},{name:'james',x:x+46,y:y+28}];
 const trainerFor=u=>LINES[u.line]?.ids[0]===23?'jessie':'james';
 const active=()=>!!host&&host.state()?.room==='duo';
 function intro(){
  const t=host.state();host.setupBoard(false);
  host.panel(t.duoLoot?'A dupla espera a revanche':t.chapter==='lavender'?'Jessie e James bloqueiam a torre!':'Uma emboscada da dupla Rocket!',
   t.duoLoot?'Jessie: “Veio buscar o que é seu? Vai ter que vencer a gente!”':'Jessie: “Prepare-se para encrenca!” James: “Encrenca em dobro!”',
   art()+'<p>'+ (t.chapter==='lavender'?'A dupla ocupa a escadaria e impede a passagem para o alto da torre.':'Jessie e James surgem entre os caixotes e mandam sua equipe para a arena.')+'</p><p>Vença para avançar. Em caso de derrota, além do dano normal, a dupla pode roubar ouro ou um item da mochila. Uma vitória na revanche devolve o que foi roubado.</p>',
   [{label:t.duoLoot?'Preparar revanche':'Preparar equipe',run:()=>{t.status='plan';host.save(true);host.plan()}},{label:'Salvar e sair',secondary:true,run:host.exit}]);
 }
 function defeat(damage){
  const t=host.state();
  if(!t.duoTheftSteps)t.duoTheftSteps=[];
  if(!t.duoTheftSteps.includes(t.step)){
   t.duoTheftSteps.push(t.step);
   const options=[];if(G.gold>0)options.push('gold');if(G.items.length)options.push('item');
   const chosen=options.length?options[Math.floor(host.random()*options.length)]:null;
   if(chosen==='gold'){const amount=Math.min(G.gold,Math.max(1,Math.floor(G.gold*.2)));G.gold-=amount;t.duoLoot={kind:'gold',amount,step:t.step}}
   if(chosen==='item'){const index=Math.floor(host.random()*G.items.length),item=G.items.splice(index,1)[0];t.duoLoot={kind:'item',item,step:t.step}}
  }
  t.status='intro';host.save(true);renderInv();renderHUD();
  const loot=t.duoLoot,description=loot?(loot.kind==='gold'?loot.amount+' de ouro':ITEMBY[loot.item].n):null;
  host.panel('A dupla Rocket levou a melhor','−'+damage+' de vida · Alerta '+t.alert+'/4',art()+'<p>'+(description?'Sorteio do roubo: <b>'+host.esc(description)+'</b>. James: “Agora isso fica com a gente!”':'Jessie: “Sem ouro e sem itens soltos? Dessa vez, vamos deixar passar!”')+'</p><p>Os equipamentos dos Pokémon ficam intactos. O roubo acontece no máximo uma vez por encontro. Vença a revanche para recuperar os recursos.</p>',[{label:'Preparar revanche',run:()=>host.plan()},{label:'Salvar e sair',secondary:true,run:host.exit}]);
 }
 function won(){
  const t=host.state(),loot=t.duoLoot;
  if(loot){if(loot.kind==='gold')G.gold+=loot.amount;else G.items.push(loot.item);t.duoLoot=null}
  // Save the victory dialogue before advancing: reloading cannot grant rewards twice.
  t.duoWonStep=t.step;t.status='room';host.save(true);renderInv();renderHUD();victory(!!loot);
 }
 function victory(recovered=false){host.panel('A Equipe Rocket decolou de novo!','Jessie e James recuam e deixam o caminho livre.',art()+'<p>'+(recovered?'Você recuperou tudo o que a dupla roubou nesta revanche.':'A dupla foi derrotada. As recompensas da batalha já foram recebidas.')+'</p>',[{label:'Continuar operação',run:host.complete},{label:'Salvar e sair',secondary:true,run:host.exit}])}
 window.ROCKET_DUO={
  definition:{name:'Jessie e James',icon:'R',text:'Enfrente a dupla Rocket. Vitória: 6 ouro e 2 XP. Derrota: dano normal e sorteio de roubo; revanche recupera o saque.'},
  create(c){host=c;return{intro,defeat,won,room(){if(active()&&host.state().duoWonStep===host.state().step){victory();return true}return false},routes(){const t=host.state();if(t.duoRoutesVersion)return;const slots=t.chapter==='lavender'?[18,43]:[13,33];for(const step of slots)if(step>t.step||step===t.step&&t.status==='map'&&!t.choices){const existing=t.routes[step]||[];t.routes[step]=['duo',...existing.filter(id=>id!=='duo').slice(0,1)]}t.duoRoutesVersion=1}}},
  recallOrigin(x,y,u){if(!active())return null;const trainer=duoLayout(x,y).find(p=>p.name===trainerFor(u));return{x:trainer.x-16,y:trainer.y-40}},
  drawOpponent(ctx,x,y,recall=null){
   if(!active()||!images.jessie||!images.james)return false;
   ctx.save();ctx.imageSmoothingEnabled=false;
   const laneX=x+46,now=performance.now(),still=G.paused||matchMedia('(prefers-reduced-motion:reduce)').matches;
   // Side-facing pair, arranged along the outside walkway instead of across the field.
   for(const trainer of duoLayout(x,y)){
    const name=trainer.name,footY=trainer.y,recalling=recall&&trainerFor(recall)===name,frame=still?2:(Math.floor(now/(recalling?350:900)+(name==='james'?.5:0))%2?5:2),cell=images[name].naturalWidth;
    ctx.fillStyle='#10131a66';ctx.beginPath();ctx.ellipse(laneX,footY+2,17,5,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(images[name],0,frame*cell,cell,cell,laneX-48,footY-96,96,96);
   }
   ctx.font='10px Arial';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#18201d';ctx.strokeText('Jessie e James',laneX,y+48);ctx.fillStyle='#f3deb0';ctx.fillText('Jessie e James',laneX,y+48);ctx.restore();return true;
  },art
 };
})();
