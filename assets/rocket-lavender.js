/* Chapter data and choices. Combat, economy and saves use the Rocket host. */
window.ROCKET_LAVENDER={
 rooms:{
  patrol:{name:'Patrulha na torre',icon:'R',text:'Expulse os recrutas dos corredores. Recompensa: 6 ouro e 2 XP.'},
  cells:{name:'Pokémon encurralados',icon:'◇',text:'Vença os guardas e conduza um Pokémon para segurança. Recompensa: 5 ouro e 2 XP.'},
  officer:{name:'Guarda da escadaria',icon:'★',text:'Vença a equipe que bloqueia o próximo andar. Recompensa: 9 ouro, 2 XP e um equipamento.'},
  boss:{name:'Último bloqueio Rocket',icon:'R',text:'Derrote os Rockets do último andar e resgate o Sr. Fuji.'},
  memorial:{name:'Memorial silencioso',icon:'✧',text:'Preste homenagem aos Pokémon: recupere 5 de vida ou receba 4 XP.'},
  mist:{name:'Névoa espectral',icon:'⌕',text:'Use o Silph Scope para revelar uma passagem segura ou procure suprimentos na névoa.'},
  medium:{name:'Médium da torre',icon:'◇',text:'Ajude uma médium a se orientar: reduza a presença Rocket ou receba um reforço para a próxima batalha.'},
  spirit:{name:'Espírito de Marowak',icon:'✦',text:'O Silph Scope revelou Marowak. Vença o encontro para apaziguar seu espírito e abrir a escadaria.'}
 },
 routes(shuffle){
  const out=[];
  for(let floor=0;floor<10;floor++){
   const choices=shuffle(['memorial','mist','medium','training','research','blackmarket','intercept']);
   out.push(['patrol','cells'],[choices[0],choices[1]],['officer','cells'],['shelter',choices[2]],['shop']);
  }
  out[39]=['spirit'];out[48]=['shop'];out[49]=['boss'];return out;
 },
 room(c){
  const t=c.state();
  if(t.room==='spirit'&&t.marowakPacified){c.panel('Marowak encontrou paz','O espírito reconhece que Cubone está a salvo e deixa a escadaria livre.','<p>Marowak segue em paz; este encontro não concede uma captura nem registro de compra.</p>',[{label:'Subir a escadaria',run:c.complete}]);return true}
  if(!['memorial','mist','medium'].includes(t.room))return false;
  const done=fn=>()=>{if(t.roomDone)return;t.roomDone=true;fn();c.complete()};
  if(t.room==='memorial')c.panel('Memorial silencioso','Entre as flores e as lápides, sua equipe encontra um momento de paz.','<p>Uma homenagem basta. Escolha o cuidado que sua equipe precisa.</p>',[
   {label:'Descansar · +5 vida',run:done(()=>{G.hp=Math.min(100,G.hp+5)})},
   {label:'Refletir · +4 XP',secondary:true,run:done(()=>addXp(4))}
  ]);
  if(t.room==='mist')c.panel('O Silph Scope revela a passagem','As sombras ganham forma. Você consegue distinguir os espíritos dos guardas escondidos.','<p>O Silph Scope é permanente: usá-lo não consome ouro nem um item da mochila.</p>',[
   {label:'Revelar rota · −1 alerta',run:done(()=>{c.alertBy(-1);t.revealedThrough=Math.min(49,t.step+3)})},
   {label:'Buscar suprimentos · +5 ouro, +1 alerta',secondary:true,run:done(()=>{G.gold+=5;c.alertBy(1)})}
  ]);
  if(t.room==='medium')c.panel('Uma voz entre os ecos','“Não são os espíritos que ameaçam esta torre. Os homens de preto levaram o Sr. Fuji para o alto.”','<p>A médium mostra um refúgio e oferece uma bênção para proteger sua equipe.</p>',[
   {label:'Encontrar refúgio · −2 alerta',run:done(()=>c.alertBy(-2))},
   {label:'Aceitar proteção · próxima batalha',secondary:true,run:done(()=>{G.joyBuff=1})}
  ]);
  return true;
 }
};
