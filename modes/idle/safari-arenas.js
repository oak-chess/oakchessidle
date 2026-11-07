(()=>{
 const colors=[['safari-meadow','Pradaria da Reserva','#466b37','#a2b563','#d2c68a','modes/idle/assets/safari-art/meadow-ground-v2.webp'],['safari-boardwalk','Lago das Passarelas','#235b62','#8cae8a','#a78b56','modes/idle/assets/safari-art/lake-ground-v2.webp'],['safari-jungle','Selva Antiga','#294b3a','#74916b','#766c4f','modes/idle/assets/safari-art/jungle-ground-v2.webp']];
 window.IDLE_SAFARI_ARENAS=colors.map(([id,name,edge,light,path,art])=>{const base=ARENA_THEMES.find(t=>t.id==='garden')||ARENA_THEMES[0],theme={...base,id,name,tex:id==='safari-boardwalk'?'wood':id==='safari-jungle'?'rock':'garden',emb:'star',tile:JSON.parse(JSON.stringify(base.tile)),wall:{...base.wall,a:edge,b:edge,trim:path,tex:'wood'},floor:[edge,light],disc:edge,banner:[edge,path,edge,'#fff0bf'],glow:'rgba(130,210,120,.12)',vig:'rgba(12,33,24,.23)'};for(const side of ['e','p'])theme.tile[side]={...theme.tile[side],a:[light,path],b:[path,light],side:edge,line:'rgba(38,65,34,.28)'};ARENA_THEMES.push(theme);return {id,name,accent:path,theme:ARENA_THEMES.length-1,art}});
 const original=paintArena,cache=new Map(),previews=new Map();function paintSafari(g,part,entry,preview=false){if(part!=='arena'){let img=cache.get(entry.id);if(!img){img=new Image();img.onload=()=>{repaintArena();for(const [canvas,n]of previews)if(canvas.isConnected)window.IDLE_SAFARI_PREVIEW(canvas,n);else previews.delete(canvas)};img.src=entry.art;cache.set(entry.id,img)}if(img.complete&&img.naturalWidth){g.save();g.imageSmoothingEnabled=true;g.drawImage(img,-640,0,2560,H);g.restore()}}if(part==='scene')return;const A=arGeo();
 // A solid, shallow field: scenery must never substitute for the playable floor.
 const palettes=[['#a99b70','#887b53','#c5b78b'],['#8c9d88','#667c6b','#b3bba0'],['#8e8a61','#646c49','#b3ad7b']];
 const pal=palettes[IDLE_SAFARI_ARENAS.indexOf(entry)];
 g.save();g.globalAlpha=1;
 g.fillStyle=pal[1];arRR(g,A.FL-12,A.FT-12,A.FR-A.FL+24,A.FB-A.FT+24,22);g.fill();
 g.strokeStyle=pal[2];g.lineWidth=3;g.stroke();
 g.fillStyle=pal[0];arRR(g,A.FL,A.FT,A.FR-A.FL,A.FB-A.FT,16);g.fill();
 // Keep the battlefield readable during combat without a tall floating platform.
 g.globalAlpha=1-(preview?0:LEGACY_HEX_SOFTNESS)*.55;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const p=hexXY(r,c);hexPath(g,p.x,p.y,S_-1,perspectiveScale(r));
  g.fillStyle=(r+c)%2?pal[0]:pal[2];g.fill();
  g.strokeStyle=pal[1];g.lineWidth=1.3;g.stroke();
 }
 g.restore();arWell(g,A)}
 paintArena=function(g,part='all'){const entry=IDLE_SAFARI_ARENAS.find(e=>e.theme===ARENA_TID);return entry?paintSafari(g,part,entry):original(g,part)};
 window.IDLE_SAFARI_PREVIEW=function(canvas,index){const entry=IDLE_SAFARI_ARENAS[index];if(!entry)return;for(const c of previews.keys())if(!c.isConnected)previews.delete(c);previews.set(canvas,index);const g=canvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,canvas.width,canvas.height);g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);paintSafari(g,'scene',entry,true);const scale=canvas.width/1000;g.setTransform(scale,0,0,scale,canvas.width/2-scale*W/2,canvas.height*.55-scale*(BY+HH/2+3.5*RH));paintSafari(g,'arena',entry,true);g.save();g.translate(W/2,BY+HH/2+3.5*RH);g.fillStyle='#c7594e';g.beginPath();g.arc(0,0,60,Math.PI,Math.PI*2);g.fill();g.fillStyle='#e4e8e0';g.beginPath();g.arc(0,0,60,0,Math.PI);g.fill();g.strokeStyle='#172330';g.lineWidth=4;g.beginPath();g.arc(0,0,60,0,Math.PI*2);g.moveTo(-60,0);g.lineTo(60,0);g.stroke();g.fillStyle='#e4e8e0';g.beginPath();g.arc(0,0,14,0,Math.PI*2);g.fill();g.stroke();g.restore()};
})();
