/* Opt-in Unova environments: individual artwork, solid courts and fading grid. */
(()=>{'use strict';
const root=new URL('./art/',document.currentScript.src),cache=new Map(),registry=new Map();
const gyms=[
 ['striaton','Estufa de Striaton','garden','wood','#70513d','#be9b70','#a8dca1'],
 ['lenora','Museu de Nacrene','rock','wood','#5a4537','#b6a183','#dbbe87'],
 ['burgh','Ateliê de Castelia','garden','wood','#66532e','#c2ac69','#d4de8e'],
 ['elesa','Passarela de Nimbasa','electric','metal','#30314c','#72759a','#f3d566'],
 ['clay','Mina de Driftveil','rock','rock','#5d4438','#ad8a5e','#edba73'],
 ['skyla','Hangar de Mistralton','blue','metal','#416077','#a4bec8','#b7e9ef'],
 ['brycen','Pavilhão de Icirrus','articuno','rock','#436d8c','#b8dbe4','#d9cbfa'],
 ['drayden','Salão Dracônico de Opelucid','psychic','rock','#4d405b','#9b8b9b','#c6a4df']
];
const legends=[
 ['victini','Victini','Jardim da Liberdade','garden','#6c6340','#c4ba7a','#ffdc92'],
 ['cobalion','Cobalion','Câmara do Aço Nobre','electric','#354f62','#7d9eac','#a5e4ec'],
 ['terrakion','Terrakion','Terraço da Estrada da Vitória','rock','#6b4937','#b79468','#f0bf7d'],
 ['virizion','Virizion','Clareira de Pinwheel','garden','#3c6144','#a5bd83','#bdeba5'],
 ['tornadus','Tornadus','Planalto dos Vendavais','blue','#405957','#91ada3','#b2ead0'],
 ['thundurus','Thundurus','Planície dos Trovões','electric','#313851','#7a8daa','#c2c5ff'],
 ['landorus','Landorus','Santuário da Abundância','garden','#67523b','#bda475','#edc789'],
 ['reshiram','Reshiram','Santuário da Verdade','fire','#887b67','#e0d4b7','#e4f4ff'],
 ['zekrom','Zekrom','Santuário dos Ideais','electric','#29364b','#667f94','#7cdbfa'],
 ['kyurem','Kyurem','Abismo Gigante','articuno','#4d687f','#bfd8e1','#b6dafa'],
 ['keldeo','Keldeo','Campina dos Espadachins','garden','#3d6560','#9fc5a9','#8edee9'],
 ['meloetta','Meloetta','Palco da Canção Relíquia','psychic','#5b3b49','#b78c8a','#edc597'],
 ['genesect','Genesect','Laboratório P2','electric','#3e3448','#87768c','#f287a9']
];
function register(key,name,base,tex,dark,light,accent){
 const parent=ARENA_THEMES.find(t=>t.id===base);if(!parent)throw Error('Unknown arena base '+base);
 const T={...parent,id:'unova-'+key,name,tex,tile:JSON.parse(JSON.stringify(parent.tile)),wall:{...parent.wall,a:light,b:dark,tex:'rock',trim:accent+'80',moss:null},floor:[dark,dark],disc:dark,glow:accent+'16',vig:'rgba(8,9,20,.22)'};
 for(const side of ['e','p'])T.tile[side]={...T.tile[side],a:side==='e'?[dark,light]:[light,dark],b:[dark,light],side:dark,line:'rgba(14,17,25,.42)',hi:'rgba(255,245,235,.07)',lo:'rgba(0,0,0,.10)'};
 T.scene=function(g,A){let art=cache.get(key);if(!art){const image=new Image();art={image,loaded:false};cache.set(key,art);image.onload=()=>{art.loaded=true;if(ARENA_T?.id===T.id)repaintArena()};image.src=new URL(key+'.webp',root).href}g.save();g.globalAlpha=1;g.fillStyle=dark;g.fillRect(-640,0,2560,800);if(art.loaded){const width=2560,height=width*art.image.naturalHeight/art.image.naturalWidth;g.imageSmoothingEnabled=true;g.drawImage(art.image,A.CX-width/2,-140,width,height)}g.restore()};
 ARENA_THEMES.push(T);const entry={key,id:T.id,name,accent,theme:ARENA_THEMES.length-1};registry.set(T.id,entry);return entry;
}
const gymEntries=gyms.map((row,i)=>{const e={...register(...row),area:32+i};IDLE_WORLD_DATA.regions[e.area].theme=e.theme;IDLE_WORLD_DATA.regions[e.area].gymTheme=e.theme;return e});
const eventEntries=legends.map(([key,pokemon,name,base,dark,light,accent])=>({...register(key,name,base,'rock',dark,light,accent),pokemon}));
window.IDLE_UNOVA_ARENAS=[...gymEntries,...eventEntries];IDLE_ARENA_CATALOG.gyms.push(...gymEntries);const oldLegend=IDLE_ARENA_CATALOG.legendTheme;IDLE_ARENA_CATALOG.legendTheme=name=>eventEntries.find(e=>e.pokemon===name)?.theme??oldLegend(name);
const oldPaint=paintThemed;paintThemed=function(g,layer,T){if(!registry.has(T.id))return oldPaint(g,layer,T);const A=arGeo();if(layer!=='arena')T.scene(g,A);if(layer==='scene')return;g.save();g.globalAlpha=1;aWallT(g,A,T);g.save();g.globalAlpha*=1-LEGACY_HEX_SOFTNESS*.88;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)aHexT(g,r,c,r>=4,T);g.restore();aEmblemT(g,T);arWell(g,A);g.restore()};
window.IDLE_UNOVA_ART={loaded:key=>cache.get(key)?.loaded===true};
})();
