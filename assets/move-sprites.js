/* Emerald battle graphics, adapted to OakChess's existing combat clock. */
(()=>{
 'use strict';
 const sheets={},effects=[];
 const definitions={fire:[32,32],small_ember:[32,32],bubble:[16,16],bubble_burst:[16,16],water_orb:[16,16],water_impact:[32,32],electricity:[32,32],lightning:[32,32],ice_crystals_0:[16,16],claw_slash:[32,32],hit:[32,32],leaf:[16,16],rocks:[32,32],poison_bubble:[16,16],air_wave:[32,16],fangs:[32,32],seed:[16,16],needle:[16,16]};
 for(const [name,[w,h]] of Object.entries(definitions)){
  const img=new Image(),sheet=sheets[name]={img,w,h,frames:1,ready:false};
  img.onload=()=>{sheet.frames=Math.max(1,Math.floor(img.naturalHeight/h));sheet.ready=true};
  img.src='assets/move-fx/emerald/'+name+'.png';
 }
 const byType={fire:'fire',water:'water_orb',electric:'electricity',grass:'leaf',ice:'ice_crystals_0',poison:'poison_bubble',flying:'air_wave',rock:'rocks',ground:'rocks',bug:'needle'};
 const byShape={flame:'fire',bubble:'bubble',needle:'needle',fang:'fangs',claw:'claw_slash',crystal:'ice_crystals_0',boulder:'rocks',zap:'electricity'};
 function sprite(g,name,x,y,size,time,angle=0,once=false,alpha=1){
  const s=sheets[name];if(!s?.ready)return false;
  const frame=once?Math.min(s.frames-1,Math.floor(time*18)):Math.floor(time*14)%s.frames;
  g.save();g.globalCompositeOperation='source-over';g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
  g.translate(Math.round(x),Math.round(y));g.rotate(angle);
  g.drawImage(s.img,0,frame*s.h,s.w,s.h,-size/2,-size*s.h/s.w/2,size,size*s.h/s.w);g.restore();return true;
 }
 function add(name,x,y,scale=1){
  const s=sheets[name];if(!s?.ready)return false;
  if(effects.length>=80)effects.shift();
  effects.push({name,x,y,size:Math.max(24,Math.min(76,44*scale)),t:0,life:Math.max(.24,s.frames/18)});return true;
 }
 window.MOVE_SPRITES={
  projectile(g,p){
   if(window.EMERALD_MOVES?.projectile(g,p))return true;
   const shape=p.o?.shape,name=shape?(byShape[shape]||(['grass','ice','flying','rock','ground'].includes(shape)?byType[shape]:null)):byType[p.type];
   if(!name)return false;
   return sprite(g,name,p.x+(p.ox||0),p.y+(p.oy||0),Math.min(54,28*(p.size||1)),p.age||0,['leaf','needle','air_wave'].includes(name)?(p.dir||0):0);
  },
  impact(type,x,y,scale){return add(({fire:'fire',water:'bubble_burst',electric:'electricity',ice:'ice_crystals_0',grass:'leaf',poison:'poison_bubble',normal:'hit',fighting:'hit',steel:'hit',rock:'rocks',ground:'rocks'})[type],x,y,scale)},
  effect(name,x,y,scale){return add(({slash:'claw_slash',cross:'claw_slash',bite:'fangs',embers:'small_ember',bubbles:'bubble_burst',sparks:'electricity'})[name],x,y,scale)},
  update(dt){window.EMERALD_MOVES?.update(dt);for(let i=effects.length-1;i>=0;i--){effects[i].t+=dt;if(effects[i].t>=effects[i].life)effects.splice(i,1)}},
  draw(g){for(const e of effects)sprite(g,e.name,e.x,e.y,e.size,e.t,0,true,Math.min(1,(e.life-e.t)*12));window.EMERALD_MOVES?.draw(g)},
  clear(){effects.length=0;window.EMERALD_MOVES?.clear()},get active(){return effects.length>0||!!window.EMERALD_MOVES?.active}
 };
})();
