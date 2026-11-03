/* Specific adapters for nine moves. Uses expansion sprite frames and palettes.
 * Surf's wave and the metallic sheen are canvas/browser ports of source tasks,
 * not a GBA interpreter. Each renderer owns its effects and clock. */
(()=>{
 'use strict';
 const definitions=window.OAK_NINE_MOVES||{};
 window.CREATE_NINE_MOVE_EFFECTS=function(drawSprite,reduced){
  const effects=[],definition=mv=>definitions[typeof mv==='string'?mv:mv?.emerald||mv?.key||mv?.n];
  function add(d,phase,x,y,extra={}){if(effects.length>=64)return false;effects.push({d,phase,x,y,t:0,life:phase==='prepare'?.55:d.duration,...extra});return true}
  function start(mv,x,y){const d=definition(mv);if(!d)return null;if(['metal','head','orb','cannon'].includes(d.kind))return add(d,'prepare',x,y);return false}
  function hit(mv,x,y,scale=1){const d=definition(mv);if(!d)return null;return add(d,d.kind==='metal'?'prepare':'impact',x,y,{scale})}
  function beam(mv,x,y,x2,y2,width=24){const d=definition(mv);if(!d)return null;if(d.kind==='metal')return start(mv,x,y);return add(d,'travel',x,y,{x2,y2,width,life:d.kind==='wave'?1.05:.65})}
  function projectile(g,p){const d=definition(p.o?.move);if(!d)return null;if(!d.sprite)return false;
   const angle=p.dir||0,t=p.age||0,scale=d.kind==='orb'||d.kind==='cannon'?1.4:1.25;
   if(d.kind==='pulse')for(let i=2;i>=0;i--)drawSprite(g,d.sprite,p.x-Math.cos(angle)*i*12,p.y-Math.sin(angle)*i*12,scale*(1-i*.12),t,angle,0,1-i*.24);
   else drawSprite(g,d.sprite,p.x,p.y,scale*(1+Math.sin(t*18)*.06),t,angle,0,1);
   return true;
  }
  function spark(g,x,y,size,color){g.fillStyle=color;g.fillRect(Math.round(x-size),Math.round(y-1),size*2+2,2);g.fillRect(Math.round(x-1),Math.round(y-size),2,size*2+2)}
  function wave(g,x,y,t,scale){
   g.save();g.translate(Math.round(x),Math.round(y));g.scale(scale,scale);
   // A breaking crest with a dark body, cyan face and stepped white foam.
   for(let col=-60;col<=20;col+=4){const crest=-Math.sin((col+60)/80*Math.PI)*46,foam=Math.sin(col*.2+t*24)*3;
    g.fillStyle='#114a9c';g.fillRect(col,crest,4,55-crest);
    g.fillStyle='#1689d1';g.fillRect(col,crest+8,4,31-crest*.2);
    g.fillStyle='#56d6e9';g.fillRect(col,crest+3,4,12);
    g.fillStyle='#dbfbff';g.fillRect(col,crest+foam,4,5);
   }
   for(let i=0;i<7;i++){const x=-55+i*10+Math.sin(t*10+i)*5,y=-35-Math.sin(t*7+i)*18;g.fillStyle=i%2?'#baf5ff':'#37b5e4';g.fillRect(Math.round(x),Math.round(y),3,5)}
   g.restore();
  }
  function impact(g,e,k,fade){const {d,x,y}=e,scale=Math.min(1.8,Math.max(.9,e.scale||1));
   if(d.kind==='slash'||d.kind==='air'){
    const name=d.kind==='slash'&&k>.35?d.second:d.sprite;
    drawSprite(g,name,x-9,y-7,1.9*scale,e.t,0,0,fade);
    drawSprite(g,name,x+9,y+7,1.9*scale,Math.max(0,e.t-.06),0,0,fade);
   }else if(d.kind==='orb'){
    drawSprite(g,d.impact,x,y,scale*(1.1+k),e.t,0,0,fade);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,r=9+k*30;spark(g,x+Math.cos(a)*r,y+Math.sin(a)*r,2,'#86e5ff')}
   }else if(d.kind==='pulse'){
    for(let i=0;i<3;i++)drawSprite(g,d.sprite,x+(i-1)*9,y,(.7+k*2.1)*scale,e.t,i*.2,0,fade*(1-i*.18));
   }else if(d.kind==='cannon'||d.kind==='head'){
    if(d.impact)drawSprite(g,d.impact,x,y,1.7*scale,e.t,0,0,fade);
    else drawSprite(g,d.sprite,x,y,(1+k*2)*scale,e.t,0,0,fade);
    for(let i=0;i<10;i++){const a=i*2.399,r=9+k*38;spark(g,x+Math.cos(a)*r,y+Math.sin(a)*r,2+k*2,i%2?'#f5ffff':'#92adc4')}
   }else if(d.kind==='wave'){
    for(let i=0;i<12;i++){const a=i*Math.PI/6,r=10+k*40;g.fillStyle=i%2?'#c4faff':'#31b8e5';g.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.65-k*15),4,6)}
   }
  }
  return {start,hit,beam,projectile,has:mv=>!!definition(mv),
   preview(mv,x,y,x2,y2){const d=definition(mv);if(!d)return false;
    start(mv,x,y);
    if(d.kind==='metal')return true;
    if(['wave','orb','pulse','cannon'].includes(d.kind))add(d,'travel',x,y,{x2,y2,width:d.kind==='wave'?75:24,delay:.2,life:d.kind==='wave'?.8:.55});
    return add(d,'impact',x2,y2,{delay:d.kind==='wave'?1:['slash','air','head'].includes(d.kind)?.3:.75});
   },
   kind:mv=>definition(mv)?.kind,
   pose(mv,node){const d=definition(mv);if(!node?.animate||!['metal','head'].includes(d?.kind))return;node.animate([{filter:'brightness(1)'},{filter:'grayscale(.85) brightness(2.1)',offset:.35},{filter:'brightness(1)'}],{duration:550})},
   update(dt){for(let i=effects.length-1;i>=0;i--){effects[i].t+=dt;if(effects[i].t>=effects[i].life+(effects[i].delay||0))effects.splice(i,1)}},
   draw(g){for(const e of effects){const time=e.t-(e.delay||0);if(time<0)continue;const k=time/e.life,fade=Math.min(1,k*12,(1-k)*6);g.save();g.imageSmoothingEnabled=false;g.globalAlpha=fade;
    if(e.phase==='prepare'){
     if(e.d.kind==='metal'||e.d.kind==='head'){
      // Two diagonal moving glints accompany the actual sprite's metallic filter.
      for(let i=0;i<4;i++)spark(g,e.x-25+i*16,e.y+23-k*52+i*5,3,i%2?'#fffde2':'#a5d8eb');
     }else{
      for(let i=0;i<(reduced()?6:12);i++){const a=i*2.399+k*3,r=(1-k)*32;spark(g,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2,e.d.kind==='orb'?'#72d9ff':'#d5e7f4')}
      drawSprite(g,e.d.charge||e.d.sprite,e.x,e.y,.25+k*.65,e.t,0,0,fade);
     }
    }else if(e.phase==='travel'){
     const dx=e.x2-e.x,dy=e.y2-e.y,angle=Math.atan2(dy,dx),x=e.x+dx*k,y=e.y+dy*k;
     if(e.d.kind==='wave'){g.translate(x,y);g.rotate(angle);wave(g,0,0,e.t,Math.min(1.7,Math.max(.85,(e.width||70)/70)))}
     else if(e.d.kind==='cannon'){
      g.save();g.globalAlpha=fade*.7;g.strokeStyle='#d6edf5';g.lineWidth=6;g.beginPath();g.moveTo(e.x,e.y);g.lineTo(x,y);g.stroke();g.restore();
      drawSprite(g,e.d.sprite,x,y,1.45,e.t,angle,0,fade);
     }else if(e.d.sprite)projectile(g,{x,y,dir:angle,age:e.t,o:{move:{emerald:Object.keys(definitions).find(key=>definitions[key]===e.d)}}});
    }else impact(g,{...e,t:time},k,fade);
    g.restore();
   }},
   clear(){effects.length=0},get active(){return effects.length>0}
  };
 };
})();
