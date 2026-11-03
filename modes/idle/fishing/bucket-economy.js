/* Same sale formula as modes/idle/shop.js; no hidden rarity multiplier. */
(function(root){
 const total=c=>c.ivs.reduce((a,b)=>a+b,0);
 const protectedCapture=c=>!!(c.favorite||c.locked);
 const value=(c,entry={cost:1,star:1})=>Math.max(1,Math.floor((5*(entry.cost||1)+c.level+3*((entry.star||1)-1))*(c.potency||1)+total(c)/31));
 const compare=(a,b)=>b.potency-a.potency||total(b)-total(a)||b.level-a.level||String(a.uid).localeCompare(String(b.uid));
 function duplicates(captures){const groups=new Map();for(const c of captures){if(!groups.has(c.id))groups.set(c.id,[]);groups.get(c.id).push(c)}return [...groups.values()].flatMap(group=>group.slice().sort(compare).slice(1).filter(c=>!protectedCapture(c)))}
 function sell(state,ids,catalog){const wanted=new Set(ids),list=state.catches.filter(c=>wanted.has(c.uid)&&!protectedCapture(c));if(!list.length)return {count:0,gold:0};const gold=list.reduce((sum,c)=>sum+value(c,catalog[c.id]),0),sold=new Set(list.map(c=>c.uid));state.catches=state.catches.filter(c=>!sold.has(c.uid));state.gold+=gold;return {count:list.length,gold}}
 const api={total,value,protectedCapture,duplicates,compare,sell};if(typeof module!=='undefined')module.exports=api;else root.FISHING_BUCKET_ECONOMY=api;
})(typeof window==='undefined'?globalThis:window);
