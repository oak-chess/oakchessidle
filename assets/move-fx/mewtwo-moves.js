/* Psychic-family task ports. Local fields preserve actor size and gameplay hits.
 * These are browser adaptations of background, sway and palette tasks. */
(()=>{
 const kinds={PSYCHIC:'psychic',CONFUSION:'confusion',PSYBEAM:'psybeam'};
 window.CREATE_PSYCHIC_EFFECTS=function(reduced){
  const effects=[],kind=mv=>kinds[typeof mv==='string'?mv:mv?.emerald||window.EMERALD_ALIASES?.[mv?.n]||mv?.n];
  function add(type,phase,x,y,extra={}){if(effects.length>=48)return false;effects.push({type,phase,x,y,t:0,life:phase==='charge'?.55:.95,...extra});return true}
  function start(mv,x,y){const type=kind(mv);return type?add(type,'charge',x,y):null}
  function hit(mv,x,y,scale=1){const type=kind(mv);return type?add(type,'impact',x,y,{scale:Math.max(.9,Math.min(1.4,scale))}):null}
  function beam(mv,x,y,x2,y2,width=24){const type=kind(mv);return type?add(type,'link',x,y,{x2,y2,width,life:.75}):null}
  function star(g,x,y,r,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+2,y-2);g.lineTo(x+r,y);g.lineTo(x+2,y+2);g.lineTo(x,y+r);g.lineTo(x-2,y+2);g.lineTo(x-r,y);g.lineTo(x-2,y-2);g.closePath();g.fill()}
  function ribbon(g,x,y,x2,y2,time,width,prismatic){
   const length=Math.hypot(x2-x,y2-y),angle=Math.atan2(y2-y,x2-x);g.save();g.translate(x,y);g.rotate(angle);
   const colors=prismatic?['#5230a4','#b756dd','#f391db','#d9d6ff','#fff3ff']:['#502780','#a352e1','#d69cff'];
   colors.forEach((color,layer)=>{const radius=Math.max(1,width*(1-layer/colors.length)/2);g.fillStyle=color;g.beginPath();
    for(let at=0;at<=length;at+=5){const py=Math.round(Math.sin(at*.045-time*14)*radius*.2-radius);at?g.lineTo(at,py):g.moveTo(at,py)}
    for(let at=length;at>=0;at-=5)g.lineTo(at,Math.round(Math.sin(at*.045-time*14)*radius*.2+radius));g.closePath();g.fill();
   });g.restore();
  }
  return {start,hit,beam,
   kind,
   preview(mv,x,y,x2,y2){const type=kind(mv);if(!type)return false;start(mv,x,y);add(type,'link',x,y,{x2,y2,width:type==='psybeam'?30:16,delay:.22,life:.65});return add(type,'impact',x2,y2,{delay:.45,scale:1.1})},
   projectile(g,p){const type=kind(p.o?.move);if(!type)return null;const angle=p.dir||0;
    if(type==='psybeam'&&!p._psyOrigin)p._psyOrigin={x:p.x,y:p.y};
    const origin=p._psyOrigin||{x:p.x-Math.cos(angle)*45,y:p.y-Math.sin(angle)*45};
    g.save();g.globalAlpha=.95;ribbon(g,origin.x,origin.y,p.x,p.y,p.age||0,type==='psybeam'?25:15,type==='psybeam');star(g,p.x,p.y,9,'#f5d5ff');g.restore();return true;
   },
   update(dt){for(let i=effects.length-1;i>=0;i--){effects[i].t+=dt;if(effects[i].t>=effects[i].life+(effects[i].delay||0))effects.splice(i,1)}},
   draw(g){for(const e of effects){const time=e.t-(e.delay||0);if(time<0)continue;const k=time/e.life,fade=Math.min(1,time/.07,(e.life-time)/.18);g.save();g.globalAlpha=fade;g.imageSmoothingEnabled=false;
    if(e.phase==='link'){g.globalAlpha=fade*(e.type==='psybeam'?1:.5);ribbon(g,e.x,e.y,e.x2,e.y2,time,e.width||22,e.type==='psybeam')}
    else if(e.phase==='charge'){
     for(let i=0;i<(reduced()?5:9);i++){const a=i*2.399+time*5,r=(1-k)*28;star(g,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,3,'#efbfff')}
     star(g,e.x,e.y,4+Math.sin(k*Math.PI)*7,'#fff0ff');
    }else{
     const scale=e.scale||1,radius=(e.type==='psychic'?43:33)*scale;
     // A filled field and moving bands make the target readable for almost a second.
     for(let layer=3;layer>=0;layer--){g.globalAlpha=fade*(.09+layer*.02);g.fillStyle=e.type==='confusion'?'#f166c9':'#9949e8';g.beginPath();g.ellipse(e.x,e.y,radius+layer*4,radius*.8+layer*3,0,0,Math.PI*2);g.fill()}
     g.globalAlpha=fade;g.lineWidth=e.type==='psychic'?3:2;
     const bands=e.type==='psychic'?4:3;
     for(let i=0;i<bands;i++){
      const a=time*(e.type==='confusion'?8:4)+i*Math.PI/bands;
      g.strokeStyle=i%2?'#efbdff':'#b66cff';g.beginPath();g.ellipse(e.x,e.y,radius*(.65+.25*Math.sin(time*6+i)),radius*.32,a,0,Math.PI*2);g.stroke();
     }
     for(let i=0;i<(reduced()?4:7);i++){const a=i*2.399+time*(e.type==='confusion'?6:-3),r=radius*(.7+.2*Math.sin(time*7+i));star(g,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*.8,3+i%2,'#ffe4ff')}
     if(e.type==='psybeam')star(g,e.x,e.y,12*(1-k)+3,'#fff3ff');
    }
    g.restore();
   }},
   clear(){effects.length=0},get active(){return effects.length>0}
  };
 };
})();
