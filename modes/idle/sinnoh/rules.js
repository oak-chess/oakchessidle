/* Branches stay separate so existing saved species/line indices remain valid. */
window.IDLE_SINNOH_RULES={
 branch(m,id,choice,gender){const ids=window.IDLE_SINNOH_BRANCHES[id]||[];if(!ids.length)return null;let target;if(id===133){target=choice==='leaf'?470:choice==='ice'?471:null;if(!target)return null}else if(id===281){if(m.evolutionChoice!=='Gallade')return null;target=475}else if(id===361){if(m.evolutionChoice!=='Froslass')return null;target=478}else if(id===412)target=gender==='Fêmea'?413:414;else target=ids[0];return target===122?'Mr. Mime':window.DEX_EXPANSION.find(s=>s.id===target)?.name||null}
};
