/* Real, local progression. No prototype saves or simulation presets. */
(()=>{
 function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}}
 const legacy=window.ACH?.snapshot?.();if(!read('oakchess_trainer_profile_v1',null)&&legacy){const seed={};const aliases={brock:'apprentice',champion:'champion',researcher:'researcher',evolve3:'ruby',legend:'aurora'};for(const kind of ['title','frame','trail']){const id=legacy.equipped[kind];if(id)seed[kind]=aliases[id]||'ach_'+id}if(Object.keys(seed).length)try{localStorage.setItem('oakchess_trainer_profile_v1',JSON.stringify(seed))}catch{}}
 window.TRAINER_PROFILE_DATA={snapshot(){const ach=window.ACH?.snapshot?.()||{progress:{},counters:{}},p=ach.progress,dex=window.PDEX?.snapshot?.()||{seen:0,owned:[]};return {badges:p.badges||0,tower:p.tower_floor60||0,dex:dex.registered||0,campaign:p.champion||0,owned:dex.owned,shinyOwned:dex.shinyOwned||[],achievements:p,purchases:ach.counters.purchases||0,crafts:ach.counters.crafts||0,goldPeak:p.profile_gold200||p.gold100||0,wins:ach.counters.wins||0,campaignWins:ach.counters.campaignWins||0}}};
})();
