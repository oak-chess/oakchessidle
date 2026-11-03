/* Shared data for the standalone idle expansion. No writes to main-game saves. */
window.IDLE_WORLD_DATA={
 regions:[
  {name:'Floresta de Viridian',theme:-1,leader:'Brock',mechanic:'Armadura extra e impacto na linha de frente. Evite agrupar seus parceiros.',badge:'Rocha',need:6,foes:['Geodude','Onix'],types:['bug','grass'],habitat:[['Caterpie','common'],['Weedle','common'],['Pidgey','common'],['Oddish','uncommon'],['Abra','rare']]},
  {name:'Rotas de Cerulean',theme:1,leader:'Misty',mechanic:'Ondas atingem a retaguarda e os vizinhos. Distribua a formação.',badge:'Cascata',need:8,foes:['Staryu','Psyduck','Staryu'],types:['water'],habitat:[['Psyduck','common'],['Poliwag','common'],['Squirtle','uncommon'],['Staryu','uncommon'],['Dratini','rare']]},
  {name:'Rotas de Vermilion',theme:2,leader:'Lt. Surge',mechanic:'Descargas atingem uma coluna. Evite alinhar os parceiros.',badge:'Trovão',need:8,foes:['Voltorb','Magnemite','Pikachu'],types:['electric'],habitat:[['Spearow','common'],['Meowth','common'],['Voltorb','common'],['Magnemite','uncommon'],['Pikachu','rare']]},
  {name:'Jardins de Celadon',theme:3,leader:'Erika',mechanic:'Regeneração constante. Concentre dano para concluir os nocautes.',badge:'Arco-íris',need:10,foes:['Tangela','Oddish','Bellsprout'],types:['grass'],habitat:[['Oddish','common'],['Bellsprout','common'],['Paras','common'],['Exeggcute','uncommon'],['Eevee','rare']]},
  {name:'Trilhas de Fuchsia',theme:4,leader:'Koga',mechanic:'Nuvens venenosas atingem parceiros próximos uns dos outros.',badge:'Alma',need:10,foes:['Koffing','Grimer','Venonat'],types:['poison'],habitat:[['Venonat','common'],['Zubat','common'],['Grimer','common'],['Koffing','uncommon'],['Scyther','rare']]},
  {name:'Arredores de Saffron',theme:5,leader:'Sabrina',mechanic:'Pulsos drenam energia de parceiros agrupados.',badge:'Pântano',need:12,foes:['Abra','Drowzee','Mr. Mime'],types:['psychic'],habitat:[['Drowzee','common'],['Meowth','common'],['Abra','uncommon'],['Gastly','uncommon'],['Mr. Mime','rare']]},
  {name:'Costa de Cinnabar',theme:6,leader:'Blaine',mechanic:'Explosões deixam queimaduras em uma região da formação.',badge:'Vulcão',need:12,foes:['Growlithe','Ponyta','Magmar'],types:['fire'],habitat:[['Ponyta','common'],['Growlithe','common'],['Vulpix','uncommon'],['Magmar','uncommon'],['Lapras','rare']]},
  {name:'Última rota de Viridian',theme:7,leader:'Giovanni',mechanic:'Armadura extra e impactos na frente. Prepare dano e sustentação.',badge:'Terra',need:14,foes:['Rhyhorn','Nidoran♂','Diglett'],types:['ground'],habitat:[['Sandshrew','common'],['Diglett','common'],['Rhyhorn','uncommon'],['Nidoran♂','uncommon'],['Dratini','rare']]}
 ],
 quests:[
  {id:'first-path',title:'Primeiros passos',detail:'Vença 5 encontros.',metric:'wins',need:5,reward:{gold:40,balls:10},npc:'Prof. Carvalho'},
  {id:'field-study',title:'Pesquisa de campo',detail:'Descubra 8 espécies.',metric:'seen',need:8,reward:{gold:40,materials:3,field:'rod'},npc:'Pescador de Viridian'},
{id:'first-badge',title:'O desafio de Pewter',detail:'Conquiste uma insígnia.',metric:'badges',need:1,reward:{gold:80,field:'bike',materials:5},npc:'Brock'},
  {id:'evolve',title:'Crescer juntos',detail:'Evolua um parceiro.',metric:'evolutions',need:1,reward:{materials:5,stone:1},npc:'Enfermeira Joy'},
  {id:'rescue',title:'Um pedido de ajuda',detail:'Conclua um resgate Rocket.',metric:'rescues',need:1,reward:{field:'scope',gold:70},npc:'Sr. Fuji'},
  {id:'friends',title:'Uma amizade duradoura',detail:'Alcance 60 de amizade com um parceiro.',metric:'friendship',need:60,reward:{gold:60,materials:5},npc:'Moradora de Pallet'},
  {id:'reserve',title:'Uma equipe, muitos talentos',detail:'Conclua 3 tarefas da reserva.',metric:'tasks',need:3,reward:{gold:80,materials:5},npc:'Centro de conservação'},
  {id:'grass-team',title:'Estratégia em campo',detail:'Vença 3 encontros usando um parceiro de Planta.',metric:'grassWins',need:3,reward:{gold:45,materials:3},npc:'Treinadora de Viridian'},
  {id:'league',title:'Rumo à Liga',detail:'Conquiste as 8 insígnias.',metric:'badges',need:8,reward:{gold:300,materials:10},npc:'Liga Pokémon'}
 ],
 tasks:{research:{name:'Pesquisa de rastros',seconds:180,reward:'3 materiais e 2 doces'},training:{name:'Treino da reserva',seconds:180,reward:'24 XP e amizade'},materials:{name:'Coleta na caverna',seconds:240,reward:'5 materiais e chance de fóssil'},conservation:{name:'Centro de conservação',seconds:300,reward:'4 materiais e 2 doces'}},
 objective:{balanced:{name:'Equilibrado',gold:1,xp:1,materials:1},xp:{name:'Treinamento',gold:.7,xp:1.6,materials:.7},capture:{name:'Busca de espécies',gold:.8,xp:.8,materials:1},materials:{name:'Coleta de materiais',gold:.8,xp:.8,materials:2}},
 weather:['Céu aberto','Chuva','Névoa','Sol forte'],
 stones:{oval:'Pedra Oval',electirizer:'Electirizer',fire:'Pedra do Fogo',water:'Pedra da Água',thunder:'Pedra do Trovão',leaf:'Pedra da Folha',moon:'Pedra da Lua',ice:'Pedra do Gelo',shiny:'Pedra Brilhante',dusk:'Pedra do Crepúsculo',metal:'Revestimento Metálico',dragon:'Escama de Dragão',prism:'Escama Prisma',tooth:'Dente do Mar Profundo',scale:'Escama do Mar Profundo',protector:'Protetor',reaper:'Tecido Reaper'}
};
// Presentation metadata; challenge teams remain the teams configured above.
window.IDLE_WORLD_DATA.gyms=[
 {city:'Pewter',type:'Pedra',trainer:'brock',color:'#b6a183'},
 {city:'Cerulean',type:'Água',trainer:'misty',color:'#73b9d7'},
 {city:'Vermilion',type:'Elétrico',trainer:'ltsurge',color:'#e4c46e'},
 {city:'Celadon',type:'Planta',trainer:'erika',color:'#91b47c'},
 {city:'Fuchsia',type:'Veneno',trainer:'koga',color:'#b284cf'},
 {city:'Saffron',type:'Psíquico',trainer:'sabrina',color:'#d78fbd'},
 {city:'Cinnabar',type:'Fogo',trainer:'blaine',color:'#d98d73'},
 {city:'Viridian',type:'Terra',trainer:'giovanni',color:'#c0a079'}
];
