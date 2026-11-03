(function(){
if(!ARENA_PREVIEW)return;
document.body.classList.add('arena-preview');
const style=document.createElement('style');style.textContent=`
body.arena-preview #ttl{background:transparent!important;pointer-events:none!important}
body.arena-preview #ttl>*{display:none!important}
#arenaPreviewPanel{position:fixed;left:18px;bottom:18px;z-index:100000;background:#152337ed;color:#edf6ff;border:2px solid #8aaac4;border-radius:8px;padding:15px 18px;font:13px Segoe UI;max-width:340px;box-shadow:0 5px 22px #0008}
#arenaPreviewPanel strong{display:block;color:#ffe39a;margin-bottom:6px}
#arenaPreviewPanel p{font-size:12px;color:#c1d1df;line-height:1.5;margin:7px 0 12px}
#arenaPreviewPanel nav{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
#arenaPreviewPanel a,#arenaPreviewPanel button{display:inline-block;background:#2c435c;color:#f6edff;padding:8px 11px;border:1px solid #8aaac4;border-radius:3px;text-decoration:none;font:inherit;cursor:pointer}
#arenaPreviewPanel a[aria-current]{background:#735b29;border-color:#ffe39a}
#arenaPreviewPanel footer{display:flex;gap:8px;flex-wrap:wrap}
`;document.head.append(style);
const names={articuno:'Articuno',moltres:'Moltres',zapdos:'Zapdos',mewtwo:'Mewtwo'};
const panel=document.createElement('section');panel.id='arenaPreviewPanel';
panel.innerHTML='<strong>Arena do '+names[ARENA_PREVIEW_ID]+' · dentro do jogo</strong><p>A simulação usa Pokémon no campo e no banco, sem alterar sua campanha.</p><nav>'+['articuno','moltres','zapdos'].map(id=>'<a href="?arenaPreview='+id+'"'+(id===ARENA_PREVIEW_ID?' aria-current="page"':'')+'>'+names[id]+'</a>').join('')+'</nav><footer><button type="button" id="previewPhase">Ver transição para luta</button><a href="index.html">Voltar ao jogo</a></footer>';
document.body.append(panel);

const phaseButton=panel.querySelector('button'),benchUnits=[];
function populateField(){
 clearCombatUnits();
 for(const side of [0,1])for(const sp of demoTeam(side)){
  const u=mkCU(sp,side);B.units.push(u);addCUEl(u);
 }
 const allies=B.units.filter(u=>u.side===0),foes=B.units.filter(u=>u.side===1);
 applyTraits(allies,foes);applyTraits(foes,allies);
 B.t=0;B.over=false;B.done=false;B.sudden=0;B.ev=[];B.zero=0;B.hold=false;B.mew=null;B.winner=0;DEMO.on=true;
 B.on=ARENA_PREVIEW_COMBAT;
}
function populateBench(){
 if(benchUnits.length)return;
 for(const [i,name] of ['Squirtle','Charmander','Bulbasaur','Abra','Lapras','Snorlax','Eevee','Pidgey','Geodude'].entries()){
  const line=LINES.findIndex(x=>x.names[0]===name);if(line<0)continue;
  const u={uid:'preview'+i,line,star:1,items:[],pos:{z:'n',i},shiny:false};
  attachEl(u,false);u.el.style.pointerEvents='none';benchUnits.push(u);
 }
}
window.ARENA_PREVIEW_ROUND=populateField;
phaseButton.textContent='Iniciar combate de demonstração';
phaseButton.onclick=function(){
 ARENA_PREVIEW_COMBAT=!ARENA_PREVIEW_COMBAT;
 this.textContent=ARENA_PREVIEW_COMBAT?'Voltar à preparação':'Iniciar combate de demonstração';
 populateField();
};
const previewStyle=document.createElement('style');previewStyle.textContent='body.arena-preview.legendary-preparation #world .unit.e{visibility:visible}';document.head.append(previewStyle);
populateField();populateBench();

})();
