/* PMD order matches the combat engine: S, SE, E, NE, N, NW, W, SW. */
(function(root){
 const polygon=[[.70,.50],[.88,.51],[.95,.68],[.92,.83],[.77,.87],[.68,.67]],vectors=[[0,1],[Math.SQRT1_2,Math.SQRT1_2],[1,0],[Math.SQRT1_2,-Math.SQRT1_2],[0,-1],[-Math.SQRT1_2,-Math.SQRT1_2],[-1,0],[-Math.SQRT1_2,Math.SQRT1_2]];
 const rowFor=(dx,dy)=>((2-Math.round(Math.atan2(dy,dx)/(Math.PI/4)))%8+8)%8;
 const inside=p=>polygon.every((a,i)=>{const b=polygon[(i+1)%polygon.length];return (b[0]-a[0])*(p.y-a[1])-(b[1]-a[1])*(p.x-a[0])>=-1e-8});
 function create(key,x,y){let seed=2166136261;for(const c of key)seed=Math.imul(seed^c.charCodeAt(0),16777619);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const s={x,y,row:0,moving:false,elapsed:0,duration:.3+random()*1.7,turnAt:0,phase:random()*3000};let from,target;
  function choose(others){target=null;for(let i=0;i<80;i++){const row=Math.floor(random()*8),[dx,dy]=vectors[row],distance=40+random()*65,p={x:s.x+dx*distance/1280,y:s.y+dy*distance/760};if(!inside(p)||others.some(o=>o!==s&&Math.hypot((p.x-o.x)*1280,(p.y-o.y)*760)<38))continue;target=p;s.row=row;break}if(!target){s.elapsed=0;s.duration=1;return}from={x:s.x,y:s.y};const distance=Math.hypot((target.x-from.x)*1280,(target.y-from.y)*760);s.duration=distance/(23+random()*12);s.elapsed=0;s.moving=true}
  function step(dt,others=[],reduced=false){if(reduced)return s;dt=Math.max(0,Math.min(.08,dt));s.elapsed+=dt;if(s.moving){const t=Math.min(1,s.elapsed/s.duration);s.x=from.x+(target.x-from.x)*t;s.y=from.y+(target.y-from.y)*t;if(t===1){s.moving=false;s.elapsed=0;s.duration=.9+random()*2.6;s.turnAt=.5;target=null}}else{if(s.elapsed>s.turnAt&&s.turnAt>0){s.row=(s.row+(random()<.5?1:7))%8;s.turnAt+=.8+random()*.6}if(s.elapsed>=s.duration)choose(others)}return s}
  return {state:s,step};
 }
 const api={create,inside,rowFor};if(typeof module!=='undefined')module.exports=api;else root.RURAL_WANDER=api;
})(typeof window==='undefined'?globalThis:window);
