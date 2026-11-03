/* Curated habitats: distinct species pools and evolution-aware progression. */
window.IDLE_HUNT_AREAS=(()=>{
 const rows=[
 ['forest','Bosque e trilhas',1,'Primeiros encontros','fiber',['Caterpie','Weedle','Pidgey','Rattata','Spearow']],
 ['meadow','Pradaria dos parceiros',5,'Parceiros e iniciantes','fur',['Bulbasaur','Charmander','Squirtle','Eevee','Pikachu']],
 ['lake','Margens do lago',10,'Água doce e pesca','shell',['Magikarp','Poliwag','Psyduck','Goldeen','Horsea']],
 ['cave','Caverna rochosa',15,'Rochas e exploração','ore',['Zubat','Geodude','Sandshrew','Onix','Clefairy']],
 ['garden','Jardim florido',20,'Plantas e materiais','seed',['Oddish','Bellsprout','Paras','Exeggcute','Tangela']],
 ['ghost','Torre Pokémon',25,'Espíritos e pesquisa','essence',['Gastly','Drowzee','Cubone','Haunter','Kadabra']],
 ['quarry','Pedreira profunda',30,'Formas intermediárias','ore',['Graveler','Machoke','Rhyhorn','Diglett','Dugtrio']],
 ['beach','Costa das marés',35,'Espécies costeiras','shell',['Krabby','Kingler','Seel','Dewgong','Tentacruel']],
 ['ember','Trilha das brasas',40,'Fogo e velocidade','fireEssence',['Growlithe','Vulpix','Ponyta','Magmar','Rapidash']],
 ['frost','Gruta gelada',45,'Gelo e águas profundas','snow',['Shellder','Cloyster','Jynx','Lapras','Golduck']],
 ['dragon','Santuário dos dragões',55,'Linhagens de dragões','scale',['Dratini','Dragonair','Dragonite','Seadra','Gyarados']],
 ['haunted','Cripta das sombras',65,'Evoluções e espíritos','essence',['Gengar','Alakazam','Marowak','Hypno','Golbat']],
 ['volcano','Caldeira vulcânica',80,'Formas poderosas de Fogo','fireEssence',['Charizard','Arcanine','Ninetales','Flareon','Aerodactyl']],
 ['champions','Vale dos campeões',100,'Parceiros de elite','essence',['Venusaur','Blastoise','Raichu','Jolteon','Vaporeon']],
 ['ancient','Ruínas dos titãs',150,'Fósseis e resistência','ore',['Golem','Machamp','Kabutops','Omastar','Snorlax']],
 ['frontier','Fronteira sem fim',200,'Nível ajustável · sem limite','essence',['Nidoking','Nidoqueen','Rhydon','Exeggutor','Vileplume']]
 ];
 return Object.fromEntries(rows.map(([id,name,min,profile,loot,names],i)=>[id,{name,min,profile,loot,gold:1+i*.12,xp:1+i*.15,endless:id==='frontier',names:names.map((n,j)=>[n,j<3?'common':j===3?'uncommon':'rare'])}]));
})();
