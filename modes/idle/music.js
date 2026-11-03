/* Soundtrack selection for the official Jornada Idle, using the native audio mixer. */
window.createIdleMusic=function(ctx){
 const habitat={forest:'forest',deepwood:'forest',hive:'forest',meadow:'meadow',cliffs:'meadow',dunes:'meadow',garden:'garden',safari:'garden',cave:'cave',quarry:'cave',ironmine:'cave',ancient:'cave',lake:'water',beach:'water',abyss:'water',marsh:'ghost',ghost:'ghost',haunted:'ghost',psychic:'ghost',frost:'ice',glacier:'ice',dragon:'dragon',summit:'dragon',ember:'volcano',volcano:'volcano',inferno:'volcano',power:'trainer',dojo:'trainer',champions:'gym',frontier:'gym'};
 const hoennLegends={Regirock:'regis',Regice:'regis',Registeel:'regis',Latias:'wild',Latios:'wild',Groudon:'ancient',Kyogre:'ancient',Rayquaza:'ancient',Jirachi:'wild',Deoxys:'wild'};
 const inHoenn=challenge=>(window.IDLE_WORLD_DATA?.regions?.[challenge?.area??ctx.state.area]?.continent)==='Hoenn';
 const hoenn=track=>'idle-hoenn-'+track;
 let lastKey=null;
 function key(){if(!ctx.combat()&&document.querySelector('#idle-events.is-mystery-home:not([hidden])'))return 'idle-hoenn-ruins';const challenge=ctx.challenge();if(challenge){
  if(challenge.kind==='rocket')return ctx.combat()?'rocket-battle':'rocket-hideout';
  if(challenge.kind==='legendary'){
   const name=challenge.label||challenge.names?.[0],track=hoennLegends[name];
   if(name==='Mew')return hoenn('mew');
   if(track)return hoenn(!ctx.combat()&&track==='regis'?'ruins':!ctx.combat()&&track==='ancient'?'cave':track);
   return 'idle-'+(['Mewtwo','Lugia','Ho-Oh'].includes(name)?'mewtwo':'birds');
  }
  if(inHoenn(challenge)){if(['boss','rematch'].includes(challenge.kind))return hoenn(ctx.combat()?'gym':'gym-lobby');if(['league','tower'].includes(challenge.kind))return hoenn(ctx.combat()?'frontier':'tower');return hoenn('trainer')}
  return 'idle-'+(['boss','rematch','league','tower'].includes(challenge.kind)?'gym':'trainer');
 }
 const regional=inHoenn();
 if(document.querySelector('#idle-shop:not([hidden])'))return regional?hoenn('shop'):'idle-shop';
 if(ctx.center())return regional?hoenn('center'):'idle-center';
 const station=ctx.state.pokefone?.station;if(station&&station!=='auto'&&Object.hasOwn(window.IDLE_MUSIC_LOOPS||{},station))return station;
 const track=habitat[ctx.state.hunts?.kind]||'meadow';
 return regional?hoenn(track==='ice'?'cave':track):'idle-'+track}
 function sync(force=false){const selected=key();if(force||selected!==lastKey){lastKey=selected;SND.music(ctx.combat()?'battle':'plan')}}
 function mount(){window.IDLE_MUSIC={key};sync(true);setInterval(()=>{if(!document.hidden)sync()},500);document.addEventListener('pointerdown',()=>{SND.init();sync(true)},{once:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync(true)})}
 return {mount,sync};
};
