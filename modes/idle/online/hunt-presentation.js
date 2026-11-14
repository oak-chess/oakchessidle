/* Visual replay only. Never calls attack/cast/hurt or changes canonical rewards. */
window.createHuntPresentation=function(api){
 let lastTime=-1;
 function reset(){lastTime=-1;}
 function frame(frame,events=[]){
  const units=api.units(),first=lastTime<0;lastTime=frame.t;
  frame.u.forEach((p,i)=>{
   const u=units[i];if(!u)return;
   const wasAlive=u.alive,dx=p[0]-u.x,dy=p[1]-u.y;
   u.x=p[0];u.y=p[1];u.hp=u.maxHp*p[2]/1000;u.alive=!!p[3];u.mi=p[4];
   u.fa=p[5]??(Math.hypot(dx,dy)>.5?Math.atan2(dy,dx):u.fa);
   u.moving=p[6]===undefined?Math.hypot(dx,dy)>.5:!!p[6];
   u.target=units[p[7]]||null;u.r=p[8]??u.r;u.c=p[9]??u.c;
   u.mana=p[10]??u.mana;u.shield=p[11]??0;u.stun=p[12]||0;u.slow=p[13]||0;
   u.frozen=!!p[14];u.burn=p[15]?{}:null;u.pois=p[16]?{}:null;
   if(u.el){u.el.style.left='';u.el.style.top='';api.update(u);}
   if(!u.alive&&first&&u.el)u.el.style.display='none';
   if(!u.alive&&wasAlive&&!first){u.moving=false;const lastHit=events.filter(e=>e.k==='hit'&&e.b===i).at(-1);api.defeat?.(lastHit?units[lastHit.a]:null,u);api.faint(u);}
  });
  // Events are passed once, even when several rendering ticks share one server frame.
  for(const e of events){const a=units[e.a],b=units[e.b];
   if(e.k==='attack'&&a&&b)api.attack(a,b);
   else if(e.k==='cast'&&a)api.cast(a,b,e.m);
   else if(e.k==='hit'&&b)api.hit(a,b,e);
   else if(e.k==='heal'&&b)api.heal(b,e.n);
   else if(e.k==='text')api.text?.(e);
  }
 }
 return {reset,frame};
};
