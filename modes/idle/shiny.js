/* Shiny rules for the idle prototype; these are OakChess balance choices. */
window.IDLE_SHINY={rate:1/25000,captureFactor:.25,captureCap:.25,
 progress(state){
  const old=state.shinyProgress||{};
  const count=value=>Math.max(0,Math.floor(Number(value)||0));
  return state.shinyProgress={version:1,dry:count(old.dry),total:count(old.total),random:count(old.random),guaranteed:count(old.guaranteed)};
 },
 register(state,genes,L,speciesId=L.ids[0],source='hunt'){
  if(genes.shinyEncounterCounted)return genes;
  const progress=this.progress(state);
  genes.shinyEncounterCounted=true;
  progress.total++;
  if(genes.shiny){genes.shinyOrigin='random';progress.dry=0;progress.random++;}
  else progress.dry++;
  window.IDLE_ACTIVITY?.encounter(state,genes,L,speciesId,source);
  return genes;
 },
 progressText(state){
  const factor=window.IDLE_VIP?.factor(state,'shiny')||1;
  const percent=(this.rate*factor*100).toLocaleString('pt-BR',{maximumFractionDigits:4});
  return 'Chance shiny por Pokémon selvagem: '+percent+'%. Cada sorteio é independente, sem garantia.';
 },
 sprite(src,shiny){if(!shiny)return src;if(/\/pokemon\/(?:shiny\/)?\d+\.png$/.test(src))return src.replace(/\/pokemon\/(?:shiny\/)?(\d+)\.png$/,'/pokemon/other/showdown/shiny/$1.gif');return /\/shiny\//.test(src)?src:src.replace(/(\d+)\.(gif|png)$/,'shiny/$1.$2')},
 chance(state,L,maxHp,shiny,config=state.capture,speciesId=L.ids[0],offline=false){const simulated={...state,capture:{...state.capture,ball:config.ball}},base=window.IDLE_ITEMS.chance(simulated,L,maxHp,speciesId);if(base===null)return base;const result=!shiny?base:config.ball==='master'?1:Math.min(this.captureCap,base*this.captureFactor);return Math.min(1,result*(offline?1:window.IDLE_VIP?.factor(state,'capture')||1))}
};
