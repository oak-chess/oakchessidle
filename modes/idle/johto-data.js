/* Johto is appended: saved Kanto area/line indices keep their original meaning. */
(()=>{'use strict';const D=window.IDLE_WORLD_DATA;
 D.regions.forEach(r=>r.continent='Kanto');
 const rows=[
 ['Violet','Falkner','Voador','falkner','Zephyr','#a3c4dc',90,95,['Pidgey','Hoothoot','Pidgeotto'],[['forest','Rotas de Violet',['Sentret','Hoothoot','Ledyba','Spinarak','Sunkern']],['cave','Caverna Escura',['Geodude','Zubat','Dunsparce','Wooper','Mareep']],['meadow','Clareira dos iniciantes de Johto',['Chikorita','Cyndaquil','Totodile','Togepi','Hoppip']]]],
 ['Azalea','Bugsy','Inseto','bugsy','Colmeia','#a8bd73',102,107,['Metapod','Kakuna','Scyther'],[['forest','Bosque de Azalea',['Ledian','Ariados','Pineco','Aipom','Yanma']],['garden','Santuário de Ilex',['Natu','Skiploom','Sunflora','Heracross','Shuckle']],['lake','Poços de Slowpoke',['Marill','Azumarill','Poliwag','Slowpoke','Goldeen']]]],
 ['Goldenrod','Whitney','Normal','whitney','Planície','#db9fbc',114,119,['Clefairy','Miltank'],[['meadow','Rotas de Goldenrod',['Furret','Noctowl','Snubbull','Miltank','Stantler']],['garden','Parque Nacional',['Sudowoodo','Smeargle','Ditto','Eevee','Porygon']],['forest','Jardim dos pequenos parceiros',['Cleffa','Igglybuff','Pichu','Smoochum','Magby']]]],
 ['Ecruteak','Morty','Fantasma','morty','Névoa','#b29aca',126,131,['Gastly','Haunter','Gengar'],[['ghost','Torre Queimada',['Misdreavus','Gastly','Haunter','Murkrow','Houndour']],['ancient','Ruínas de Alph',['Unown','Natu','Xatu','Girafarig','Wobbuffet']],['garden','Bosque da amizade',['Bayleef','Quilava','Croconaw','Espeon','Umbreon']]]],
 ['Cianwood','Chuck','Lutador','chuck','Tempestade','#c39a80',138,143,['Primeape','Poliwrath'],[['lake','Ilhas de Cianwood',['Chinchou','Lanturn','Qwilfish','Corsola','Mantine']],['beach','Costa das ilhas',['Remoraid','Octillery','Tentacool','Krabby','Shuckle']],['meadow','Caminho dos lutadores',['Tyrogue','Hitmonlee','Hitmonchan','Hitmontop','Heracross']]]],
 ['Olivine','Jasmine','Aço','jasmine','Mineral','#c6c9bd',150,155,['Magnemite','Magnemite','Steelix'],[['quarry','Minas de Olivine',['Forretress','Steelix','Scizor','Skarmory','Gligar']],['meadow','Rotas do farol',['Granbull','Teddiursa','Ursaring','Phanpy','Donphan']],['lake','Águas do farol',['Quagsire','Politoed','Slowking','Seadra','Kingdra']]]],
 ['Mahogany','Pryce','Gelo','pryce','Geleira','#9fd6e1',162,167,['Seel','Dewgong','Piloswine'],[['frost','Caminho de Gelo',['Swinub','Piloswine','Sneasel','Delibird','Jynx']],['lake','Lago da Fúria',['Magikarp','Gyarados','Seel','Dewgong','Lapras']],['volcano','Encostas vulcânicas',['Slugma','Magcargo','Houndoom','Magmar','Electabuzz']]]],
 ['Blackthorn','Clair','Dragão','clair','Ascensão','#9cace0',174,180,['Dragonair','Dragonair','Kingdra'],[['dragon','Caverna dos Dragões',['Dratini','Dragonair','Kingdra','Crobat','Ampharos']],['ancient','Monte Silver',['Larvitar','Pupitar','Tyranitar','Porygon2','Blissey']],['garden','Santuário de Johto',['Meganium','Typhlosion','Feraligatr','Bellossom','Jumpluff']]]]
 ];
 const colors={Voador:'flying',Inseto:'bug',Normal:'normal',Fantasma:'ghost',Lutador:'fighting','Aço':'steel',Gelo:'ice','Dragão':'dragon'};
 for(const [i,row]of rows.entries()){
  const [city,leader,type,trainer,badge,color,level,gymLevel,foes,habitats]=row;
  const region={name:'Rotas de '+city,continent:'Johto',theme:[-1,3,0,5,1,2,4,7][i],leader,badge,need:12+i*2,level:gymLevel,foes,types:[colors[type]],mechanic:'Ginásio de '+type+'. Prepare a equipe, confira os tipos e distribua os parceiros pelo tabuleiro.',habitat:[]};
  const pools=Object.fromEntries(habitats.map(([kind,name,species],j)=>[kind,{name,min:level+j*2,loot:({forest:'fiber',garden:'seed',meadow:'fur',cave:'ore',ancient:'essence',ghost:'essence',lake:'shell',beach:'shell',quarry:'ore',frost:'snow',volcano:'fireEssence',dragon:'scale'})[kind],species}]));
  for(const pool of Object.values(pools))pool.species.forEach((name,j)=>region.habitat.push([name,j<3?'common':j===3?'uncommon':'rare']));
  D.regions.push(region);D.gyms.push({city,type,trainer,color,continent:'Johto'});
  window.IDLE_REGION_HUNTS.push({level,habitats:pools,boss:foes});
 }
 Object.assign(D.stones,{sun:'Pedra Solar',kingsRock:'Pedra do Rei',upgrade:'Upgrade'});
 Object.assign(window.IDLE_EVOLUTIONS,{
 153:{level:16},154:{level:32},156:{level:14},157:{level:36},159:{level:18},160:{level:30},
 35:{friendship:90},39:{friendship:90},178:{level:25},182:{item:'sun'},192:{item:'sun'},186:{trade:true,item:'kingsRock'},196:{friendship:90,day:true},197:{friendship:90,night:true},199:{trade:true,item:'kingsRock'},233:{trade:true,item:'upgrade'},124:{level:30},126:{level:30},247:{level:30},248:{level:55}
 });
 // Overrides for shared final species only apply to their baby branches in systems.js.
D.quests.push({id:'johto-arrival',title:'Uma nova jornada',detail:'Conquiste a primeira insígnia de Johto.',metric:'johtoBadges',need:1,reward:{gold:500,materials:5},npc:'Prof. Elm'}, {id:'johto-league',title:'Campeão de Johto',detail:'Conquiste as oito insígnias de Johto.',metric:'johtoBadges',need:8,reward:{gold:2000,materials:45},npc:'Liga de Johto'});
})();
