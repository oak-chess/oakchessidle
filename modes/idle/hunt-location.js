/* Persist the selected destination as one unit instead of rebuilding it from a default activity. */
window.IDLE_HUNT_LOCATION=(()=>{
 const habitats=area=>window.IDLE_REGION_HUNTS?.[area]?.habitats;
 const valid=(area,kind)=>Number.isInteger(area)&&area>=0&&!!habitats(area)?.[kind];
 const activity=kind=>({forest:'route',lake:'fish',cave:'cave',ghost:'ghost'}[kind]||'hunt:'+kind);
 function select(state,area,kind=Object.keys(habitats(area)||{})[0]){
  if(!state.hunts||!valid(area,kind))return false;
  const q=state.hunts;q.waveByArea=q.waveByArea||{};
  if(typeof q.routeKey==='string'&&Number.isInteger(q.wave)&&q.wave>=1&&q.wave<=10)q.waveByArea[q.routeKey]=q.wave;
  q.selectedLocation={area,kind};return true;
 }
 function remember(state){const q=state.hunts;if(!q||!valid(state.area,q.kind)||q.routeKey!==state.area+':'+q.kind)return;select(state,state.area,q.kind)}
 function restore(state){
  const q=state.hunts;if(!q)return false;
  const saved=q.selectedLocation;let area=state.area,kind;
  if(saved&&valid(saved.area,saved.kind)){area=saved.area;kind=saved.kind}
  else if(typeof q.routeKey==='string'){const split=q.routeKey.split(':');if(Number(split[0])===area&&valid(area,split[1]))kind=split[1]}
  if(!kind&&valid(area,q.kind))kind=q.kind;
  if(!kind)return false;
  const key=area+':'+kind,wave=q.routeKey===key?q.wave:q.waveByArea?.[key];
  state.area=area;state.world=state.world||{};state.world.activity=activity(kind);q.kind=kind;q.routeKey=key;q.wave=Math.max(1,Math.min(10,Math.floor(Number(wave)||1)));q.waveByArea=q.waveByArea||{};q.waveByArea[key]=q.wave;q.selectedLocation={area,kind};return true;
 }
 return {select,remember,restore};
})();
