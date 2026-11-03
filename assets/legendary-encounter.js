/* Legendary territories: one elemental guard battle, then the chosen bird. */
const LEGENDARY_TERRITORIES={
 articuno:{guards:[87,91,124,131],arrival:[
  'O vento se cala por um instante. Articuno interrompe seu voo ao perceber passos sobre o gelo.',
  'A ave desce até o poleiro. Sua plumagem espalha cristais de neve enquanto ela observa o seu time.',
  'Dewgong, Cloyster, Jynx e Lapras se aproximam. Os guardiões do santuário vão testar sua resistência ao frio.'
 ],challenge:['Os guardiões recuam, e o silêncio retorna à gruta. Articuno abre as asas lentamente.', 'Um grito límpido atravessa o gelo. A ave reconhece sua determinação: agora, ela própria aceitará o desafio.'],win:'Articuno recolhe as asas. Entre os cristais de neve, seu olhar já não demonstra desconfiança.',lose:'O vento gelado acalma. Articuno mantém o poleiro, permitindo que você recue e cuide de sua equipe.'},
 moltres:{guards:[38,59,78,126],arrival:[
  'Uma sombra incandescente cruza a cratera. Moltres muda de direção ao notar sua chegada.',
  'A ave pousa sobre a rocha vulcânica. Brasas caem de suas asas e desaparecem antes de tocar o chão.',
  'Ninetales, Arcanine, Rapidash e Magmar cercam o campo. Sob o olhar de Moltres, os guardiões defendem a cratera.'
 ],challenge:['Os guardiões abrem passagem. No alto da rocha, Moltres ergue a cabeça e solta um grito poderoso.', 'As chamas de suas asas se intensificam. Sua equipe atravessou a primeira prova; agora enfrentará o fogo da própria ave.'],win:'Moltres pousa entre as brasas. As chamas se acalmam, e a ave inclina a cabeça em reconhecimento.',lose:'Moltres retorna à rocha. As chamas abrem um caminho seguro para que você recue com sua equipe.'},
 zapdos:{guards:[26,82,101,125],arrival:[
  'Uma descarga ilumina a usina. Zapdos interrompe seu voo e vira a cabeça na sua direção.',
  'A ave pousa no alto da subestação. Pequenos arcos saltam entre suas penas e os condutores de metal.',
  'Raichu, Magneton, Electrode e Electabuzz ocupam o campo. Os guardiões da usina avançam sob o olhar atento de Zapdos.'
 ],challenge:['Os guardiões se afastam. Por um instante, até o ruído dos transformadores parece desaparecer.', 'Zapdos responde com um grito e um clarão. A ave deixa o poleiro: a próxima descarga será o seu verdadeiro desafio.'],win:'As descargas diminuem. Zapdos recolhe as asas e observa seu time com um respeito recém-conquistado.',lose:'Um último trovão ecoa pela usina. Zapdos volta ao poleiro, enquanto os guardiões permitem sua retirada.'}
};
function legendaryGuardTeam(b){
 return placeEnemies(LEGENDARY_TERRITORIES[b.k].guards.map(id=>{
  const L=LINES.find(l=>l.ids.includes(id));
  if(!L)throw new Error('Guardião lendário sem cadastro: '+id);
  return {line:L.i,star:L.ids.indexOf(id)+1,items:[],scale:1.15};
 }));
}
function legendaryStory(b,texts,done){
 document.body.classList.add('legendary-dialog');
 storyScene(texts.map(t=>({n:'Santuário de '+b.n,img:()=>sprFront(b.id),th:b.th,t:'<p>'+t+'</p>'})),()=>{
  document.body.classList.remove('legendary-dialog');done();
 });
}
function legendaryArrival(info){
 const b=BIRDS[G.bird];G.eventModal=true;G.birdArrival='flight';
 const valid=()=>G.round===info&&!G.over&&G.phase==='plan';
 // Let the bird notice the player before it approaches the perch.
 setTimeout(()=>{if(!valid())return;SND.cry(b.id,.8);G.birdArrival='landing';
  setTimeout(()=>{if(!valid())return;G.birdArrival='perched';
   legendaryStory(b,LEGENDARY_TERRITORIES[b.k].arrival,()=>{
    G.birdArrival=null;setupEnemy(info);G.eventModal=false;renderHUD();saveNow();
   });
  },3400);
 },2400);
}
function legendaryPreparation(info){
 G._evDone=true;
 if(G.birdStage==='boss-intro'){
  const b=BIRDS[G.bird];G.birdStage='boss';G.birdArrival='perched';G.eventModal=true;
  legendaryStory(b,LEGENDARY_TERRITORIES[b.k].challenge,()=>{
   G.birdArrival=null;G.eventModal=false;renderHUD();saveNow();
  });
 }else{G.eventModal=false;saveNow()}
}
function resolveLegendaryGuards(win,surv,db){
 const b=BIRDS[G.bird];
 if(win){
  G.gold+=2;G.birdStage='boss-intro';toast('Os guardiões de '+b.n+' abriram passagem. +2 de ouro');
  renderHUD();setTimeout(()=>{if(!G.over){G._birdContinue=true;startPlan()}},650);
 }else{
  const damage=db+surv;G.hp-=damage;if(G.fenix){G.hp+=damage;G.fenix=false;toast('A Chama Renascida protegeu a sua vida!')}else toast('Os guardiões defenderam o santuário. Você perdeu '+damage+' de vida.');
  renderHUD();if(checkEnd())return;G.eventModal=true;G.birdArrival='perched';
  legendaryStory(b,['Os guardiões mantêm suas posições. '+b.n+' continua observando do poleiro.','Sua equipe recua para recuperar o fôlego. Reorganize seus Pokémon e tente atravessar a defesa do santuário.'],()=>{
   G.birdArrival=null;G._birdContinue=true;startPlan();
  });
 }
}
// Keep the actual scene visible behind the narration; the bird remains on its perch.
const legendaryDialogStyle=document.createElement('style');legendaryDialogStyle.textContent=`
body.legendary-dialog #eventov{background:transparent!important;backdrop-filter:none!important}
body.legendary-dialog #eventov:before,body.legendary-dialog #eventov:after,body.legendary-dialog #eventov .event-art{display:none!important}
`;document.head.append(legendaryDialogStyle);
// Victory and retreat stay as narration, rather than giving the birds human speech.
birdWin=function(done){const b=BIRDS[G.bird];G.birdArrival='perched';legendaryStory(b,[LEGENDARY_TERRITORIES[b.k].win],()=>{G.birdArrival=null;showBirdReward(done)})};
birdLose=function(done){const b=BIRDS[G.bird];G.birdArrival='perched';legendaryStory(b,[LEGENDARY_TERRITORIES[b.k].lose],()=>{G.birdArrival=null;done()})};

for(const b of BIRDS){b.pick='<p>'+b.n+' permite sua aproximação. Você pode recolher um presente do santuário ou convidar a ave para acompanhar sua jornada.</p>'}
