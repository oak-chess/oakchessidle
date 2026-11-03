/* Title-only scenery selection. Never creates a campaign, Tower or Rocket run. */
(()=>{
 const preview=window.HOME_ARENA_PREVIEW={mode:'campaign',step:0,chapter:'celadon',index:-1};
 const originalTick=titleArenaTick;
 function towerScenes(){return(window.TOWER_SECTORS||[]).map(sector=>({theme:ARENA_THEMES.findIndex(t=>t.id===sector.theme),name:'Torre · '+sector.name})).filter(s=>s.theme>=0)}
 function rocketScenes(){
  const scenes=['Entrada e depósito','Setor de contenção','Laboratório Rocket','Central de comando','Quartel de Giovanni'].map((name,i)=>({name:'Rocket · '+name,step:i*10,chapter:'celadon'}));
  let unlocked=false;try{unlocked=!!JSON.parse(localStorage.getItem('oakchess_rocket_operation_v1_progress')||'{}').silphScope}catch{}
  if(unlocked)scenes.push({name:'Ecos de Lavender · Torre Pokémon',step:0,chapter:'lavender'});
  return scenes;
 }
 titleArenaTick=function(){
  if(LAB.st!=='title'||ARENA_PREVIEW)return originalTick();
  if(preview.mode==='campaign'||preview.mode==='idle')return originalTick();
  const scenes=preview.mode==='tower'?towerScenes():rocketScenes();if(!scenes.length)return originalTick();
  preview.index=(preview.index+1)%scenes.length;const scene=scenes[preview.index];
  preview.step=scene.step||0;preview.chapter=scene.chapter||'celadon';
  titleArena(scene.theme??7);repaintArena();
  const caption=document.getElementById('tlt');if(caption){caption.textContent=scene.name;const detail=document.createElement('small');detail.textContent=preview.mode==='tower'?'Prévia da Torre dos Desafios':preview.chapter==='lavender'?'Torre Pokémon':'Base escondida · Segurança em alerta';caption.append(detail)}
 };
 window.HOME_ARENA_SELECT=function(mode){
  if(!['campaign','idle','tower','rocket'].includes(mode)||preview.mode===mode)return;
  preview.mode=mode;preview.index=-1;preview.step=0;preview.chapter='celadon';TITLE_Q=[];
  if(LAB.st==='title'){SND.init();SND.music('title');titleArenaTick();repaintArena()}
 };
})();
