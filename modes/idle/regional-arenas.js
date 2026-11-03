/* New Johto court identities, registered exclusively in the isolated prototype. */
(()=>{
 const rows=[
  ['johto-falkner','Pavilhão dos Ventos','garden','wood','star',['#b79561','#a58453'],['#d8c29a','#c7ae7b'],'#605344','#8dc8dd',8],
  ['johto-bugsy','Santuário da Copa','garden','garden','flower',['#4f7050','#416043'],['#8fa76c','#7a9258'],'#354c35','#b2d37c',9],
  ['johto-whitney','Salão de Goldenrod','blue','marble','star',['#b97d85','#a46b76'],['#e0b9b1','#d5a19e'],'#82515e','#f1cbd0',10],
  ['johto-morty','Dojo das Lanternas','agatha','wood','ghost',['#554968','#473e5c'],['#82708d','#73617e'],'#362b47','#d3a6d9',11],
  ['johto-chuck','Dojo das Cascatas','bruno','rock','fist',['#397b7c','#306a70'],['#84b5aa','#6da298'],'#315b5d','#b9e0c9',12],
  ['johto-jasmine','Pavilhão de Aço','electric','metal','star',['#55788d','#47667b'],['#9fbac5','#87a5b4'],'#344e65','#d4d8b7',13],
  ['johto-pryce','Pista de Mahogany','lorelei','ice','snow',['#80bbd3','#6aa6c1'],['#d4ecf0','#bddfe8'],'#587f9a','#e4fbff',14],
  ['johto-clair','Santuário de Blackthorn','lance','rock','dragon',['#4f4676','#40385f'],['#8f7d9b','#796588'],'#362e4f','#d49a6a',15]
 ];
 window.IDLE_JOHTO_ARENAS=rows.map(([id,name,base,tex,emb,enemy,player,wall,accent,area])=>{
  const parent=ARENA_THEMES.find(t=>t.id===base),theme={...parent,id,name,tex,emb,tile:JSON.parse(JSON.stringify(parent.tile)),wall:{...parent.wall,a:wall,b:wall,tex:tex==='wood'?'wood':tex==='metal'?'plate':'brick',trim:accent+'88',moss:id==='johto-bugsy'?'rgba(88,118,45,.2)':null},floor:[player[1],enemy[1]],disc:wall,gate:[accent,wall],pillar:[accent,wall,wall],ring:['rgba(235,235,220,.13)','rgba(15,22,26,.38)'],banner:[wall,accent,wall,'#e2d3ba'],lampCol:accent+'66',lampBody:wall,glow:accent+'16',vig:'rgba(12,17,22,.26)'};
  for(const [side,palette]of [['e',enemy],['p',player]])theme.tile[side]={...theme.tile[side],a:palette,b:[palette[1],palette[0]],side:wall,line:'rgba(25,30,34,.38)',hi:'rgba(255,255,235,.16)',lo:'rgba(15,20,25,.16)'};
  ARENA_THEMES.push(theme);return {id,name,area,theme:ARENA_THEMES.length-1,accent};
 });
})();

/* Eight new Hoenn arena identities, only for the isolated native prototype. */
(()=>{
 const rows=[
  ['hoenn-roxanne','Academia Geológica','rock','rock','rock',['#a67c48','#90683c'],['#d2b783','#bda16a'],'#65513b','#81b7ad',16],
  ['hoenn-brawly','Pavilhão das Marés','bruno','wood','fist',['#b57855','#9b6147'],['#dbb587','#c59b6e'],'#825444','#79cfcd',17],
  ['hoenn-wattson','Oficina Dínamo','electric','metal','bolt',['#5e6876','#4e5866'],['#a8aa88','#929774'],'#4a4d45','#e6c653',18],
  ['hoenn-flannery','Santuário Termal','fire','rock','flame',['#a65340','#8e4438'],['#d29673','#bd7d5b'],'#713b32','#efb06f',19],
  ['hoenn-norman','Dojo do Equilíbrio','blue','wood','star',['#4c6d56','#3d5946'],['#bdc2a2','#a7b18b'],'#344d3e','#e6d9ad',20],
  ['hoenn-winona','Copa dos Ventos','garden','wood','star',['#4f8e86','#3f7a75'],['#b4d5be','#9bc4aa'],'#386f66','#b7e7e6',21],
  ['hoenn-tate-liza','Observatório Gêmeo','psychic','psy','eye',['#3f4d7b','#323e67'],['#8798bd','#6c7fa8'],'#293652','#ddc58a',22],
  ['hoenn-juan','Santuário da Caldeira','water','marble','water',['#449fba','#368ca9'],['#c7e6df','#add8d2'],'#4b8592','#ebf0d8',23]
 ];
 window.IDLE_HOENN_ARENAS=rows.map(([id,name,base,tex,emb,enemy,player,wall,accent,area])=>{
  const parent=ARENA_THEMES.find(t=>t.id===base),theme={...parent,id,name,tex,emb,tile:JSON.parse(JSON.stringify(parent.tile)),wall:{...parent.wall,a:wall,b:wall,tex:tex==='wood'?'wood':tex==='metal'?'plate':'brick',trim:accent+'88',moss:null},floor:[player[1],enemy[1]],disc:wall,gate:[accent,wall],pillar:[accent,wall,wall],ring:['rgba(235,235,220,.13)','rgba(15,22,26,.38)'],banner:[wall,accent,wall,'#e2d3ba'],lampCol:accent+'66',lampBody:wall,glow:accent+'16',vig:'rgba(12,17,22,.26)'};
  for(const [side,palette]of [['e',enemy],['p',player]])theme.tile[side]={...theme.tile[side],a:palette,b:[palette[1],palette[0]],side:wall,line:'rgba(25,30,34,.38)',hi:'rgba(255,255,235,.16)',lo:'rgba(15,20,25,.16)'};
  ARENA_THEMES.push(theme);return {id,name,area,theme:ARENA_THEMES.length-1,accent};
 });
})();

/* Isolated legendary habitat studies. No live game or save changes. */
(()=>{
const rows=[["legend-raikou","Raikou","Terraço da Tempestade","electric","#a58a37","#e1cf85",40],["legend-entei","Entei","Caldeira Ancestral","fire","#884736","#d9975b",40],["legend-suicune","Suicune","Lago das Águas Puras","water","#387d8b","#a8ded4",40],["legend-lugia","Lugia","Santuário das Ilhas Redemoinho","water","#3e607b","#c0dae0",45],["legend-ho-oh","Ho-Oh","Cume da Torre Sagrada","fire","#986237","#ead298",45],["legend-celebi","Celebi","Santuário da Floresta do Tempo","garden","#47765b","#bbd5a1",30],["legend-regirock","Regirock","Ruínas do Deserto","rock","#956f48","#d4b984",40],["legend-regice","Regice","Câmara Glacial","articuno","#5d8fa9","#d7edf0",40],["legend-registeel","Registeel","Câmara de Ferro Antiga","electric","#5d6872","#b7c8b9",40],["legend-latias","Latias","Jardim da Ilha do Sul","garden","#97766b","#e4c8bb",40],["legend-latios","Latios","Terraço da Ilha do Sul","water","#49788f","#b8d5e1",40],["legend-kyogre","Kyogre","Caverna da Origem Marinha","water","#285a80","#7faac1",70],["legend-groudon","Groudon","Caverna da Origem Terrestre","fire","#8e3e2c","#cf8852",70],["legend-rayquaza","Rayquaza","Pilar Celeste","garden","#517a72","#b9cbb0",70],["legend-jirachi","Jirachi","Vale dos Desejos","psychic","#665b86","#d7c9ac",30],["legend-deoxys","Deoxys","Ilha do Nascimento","psychic","#526c6e","#bdc8b3",30],["legend-mew","Mew","Clareira da Ilha Distante","garden","#5e8a64","#ced5a5",30]];
window.IDLE_LEGENDARY_ARENAS=rows.map(([id,pokemon,name,base,wall,accent,level])=>{
 level=300;
 const parent=ARENA_THEMES.find(t=>t.id===base),theme={...parent,id,name,tile:JSON.parse(JSON.stringify(parent.tile)),wall:{...parent.wall,a:wall,b:wall,trim:accent+'88',moss:null},floor:[wall,wall],disc:wall,gate:[accent,wall],pillar:[accent,wall,wall],ring:['rgba(235,235,220,.13)','rgba(15,22,26,.38)'],banner:[wall,accent,wall,'#e2d3ba'],lampCol:accent+'66',lampBody:wall,glow:accent+'16',vig:'rgba(12,17,22,.26)'};
 for(const side of ['e','p'])theme.tile[side]={...theme.tile[side],a:side==='e'?[wall,wall]:[accent,wall],b:side==='e'?[wall,wall]:[wall,accent],side:wall,line:'rgba(25,30,34,.38)',hi:'rgba(255,255,235,.16)',lo:'rgba(15,20,25,.16)'};
 ARENA_THEMES.push(theme);return {id,name,pokemon,foes:[pokemon],area:2,theme:ARENA_THEMES.length-1,accent,level};
});
})();

(()=>{const regions=IDLE_WORLD_DATA.regions;for(const entry of [...IDLE_JOHTO_ARENAS,...IDLE_HOENN_ARENAS]){if(!regions[entry.area])throw Error("Missing region "+entry.area);regions[entry.area].theme=entry.theme;regions[entry.area].gymTheme=entry.theme;}window.IDLE_ARENA_CATALOG={gyms:[...IDLE_JOHTO_ARENAS,...IDLE_HOENN_ARENAS],legendaries:IDLE_LEGENDARY_ARENAS,legendTheme(name){return IDLE_LEGENDARY_ARENAS.find(e=>e.pokemon===name)?.theme}};})();
