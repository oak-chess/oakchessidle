/* Shadow-passive presentation. Combat destination and occupancy remain owned by blinkBehind. */
(()=>{
 const arena=document.getElementById('arenaView'),units=document.getElementById('units');if(!arena||!units)return;
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=800;canvas.style.cssText='position:absolute;inset:0;width:1280px;height:800px;pointer-events:none;z-index:2';canvas.setAttribute('aria-hidden','true');arena.insertBefore(canvas,units);const g=canvas.getContext('2d');
 const jobs=new Map(),clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>n*n*(3-2*n);
 const style=document.createElement('style');style.textContent='#world .unit.ghost-shadow-active .bob{animation:none!important;overflow:hidden}#world .unit.ghost-shadow-active .sh{visibility:hidden}#world .unit.ghost-shadow-active canvas.pmdc{animation:none!important}';document.head.append(style);
 function finish(u){const job=jobs.get(u);if(!job)return;const {node,old,brow,items}=job;node.style.translate=old.translate;node.style.filter=old.filter;node.style.opacity=old.opacity;if(brow)brow.style.opacity=old.brow;if(items)items.style.opacity=old.items;u.el.classList.remove('ghost-shadow-active');jobs.delete(u);if(u.el.isConnected)updateCUEl(u)}
 function clear(){for(const u of [...jobs.keys()])finish(u);g.clearRect(0,0,1280,800)}
 function begin(u,from,to){
  if(!u?.el||!u.alive)return false;finish(u);
  const node=u.el.querySelector('canvas.pmdc')||u.el.querySelector('.spr img');if(!node)return false;
  const width=node.width||node.naturalWidth,height=node.height||node.naturalHeight;if(!width||!height)return false;
  const silhouette=document.createElement('canvas');silhouette.width=width;silhouette.height=height;const sg=silhouette.getContext('2d');
  try{sg.drawImage(node,0,0,width,height);sg.globalCompositeOperation='source-in';sg.fillStyle='#18151e';sg.fillRect(0,0,width,height)}catch(e){return false}
  const brow=u.el.querySelector('.brow'),items=u.el.querySelector('.its');
  const job={u,node,brow,items,from:{...from},to:{...to},r:u.r,c:u.c,silhouette,start:B.t,duration:1.15,height:Math.max(50,node.getBoundingClientRect().height/(SC||1)),old:{translate:node.style.translate,filter:node.style.filter,opacity:node.style.opacity,brow:brow?.style.opacity||'',items:items?.style.opacity||''}};
  jobs.set(u,job);u.el.classList.add('ghost-shadow-active');u.el.style.transform=`translate(${from.x}px,${from.y}px)`;return true;
 }
 function draw(job,elapsed){
  const {u:ghost,node,brow,items,silhouette}=job,t=elapsed/job.duration*3.2;
    function shadow(x,y,width,alpha,phase){
   g.save();g.globalAlpha=alpha;g.fillStyle='#211b2b';g.beginPath();g.moveTo(x-width*.6,y);g.bezierCurveTo(x-width*.55,y-9,x-width*.12,y-12,x+width*.1,y-8);g.bezierCurveTo(x+width*.75,y-10,x+width*.7,y+6,x+width*.2,y+7);g.bezierCurveTo(x-width*.3,y+11,x-width*.65,y+6,x-width*.6,y);g.fill();
   g.globalAlpha=alpha*.75;g.imageSmoothingEnabled=false;g.drawImage(silhouette,x-width*.6,y-8,width*1.2,16);
   g.globalAlpha=alpha*.3;g.strokeStyle='#756184';g.lineWidth=1;g.beginPath();g.ellipse(x,y,width*.55,8+Math.sin(phase*8),0,.2,Math.PI*.95);g.stroke();g.restore();
  }
  function shadowFace(x,y,alpha){
   g.save();g.translate(x,y);g.scale(1,.52);g.globalAlpha=alpha;
   if(ghost.id===200){
    g.fillStyle='#1c1627';g.beginPath();g.moveTo(-23,9);g.bezierCurveTo(-43,5,-29,-8,-35,-23);g.quadraticCurveTo(-18,-18,-16,-32);g.quadraticCurveTo(0,-42,17,-29);g.quadraticCurveTo(34,-29,26,-13);g.quadraticCurveTo(45,5,24,14);g.quadraticCurveTo(0,27,-23,9);g.fill();
    g.fillStyle='#d1b86e';for(const side of [-1,1]){g.beginPath();g.ellipse(side*12,-9,7,5,side*.25,0,Math.PI*2);g.fill();g.fillStyle='#954c66';g.fillRect(side*12-1,-13,3,7);g.fillStyle='#d1b86e'}g.fillStyle='#b66679';g.fillRect(-3,5,6,3);g.restore();return;
   }
   g.fillStyle='#1c1627';g.beginPath();
   if(ghost.id===92){g.arc(0,-4,30,0,Math.PI*2);g.fill();g.globalAlpha=alpha*.4;for(let j=0;j<9;j++){const a=j*Math.PI*2/9;g.beginPath();g.ellipse(Math.cos(a)*31,Math.sin(a)*27-4,9,7,a,0,Math.PI*2);g.fill()}g.globalAlpha=alpha}
   else if(ghost.id===93){g.moveTo(-35,-5);g.lineTo(-42,-26);g.lineTo(-24,-20);g.lineTo(-28,-39);g.lineTo(-9,-28);g.lineTo(0,-34);g.lineTo(14,-27);g.lineTo(33,-38);g.lineTo(29,-17);g.lineTo(43,-21);g.lineTo(33,6);g.lineTo(18,18);g.lineTo(0,27);g.lineTo(-22,16);g.closePath();g.fill();for(const side of[-1,1]){g.beginPath();g.moveTo(side*39,13);g.lineTo(side*52,6);g.lineTo(side*50,18);g.lineTo(side*59,14);g.lineTo(side*54,27);g.lineTo(side*40,24);g.closePath();g.fill()}}
   else{g.moveTo(-30,7);g.quadraticCurveTo(-38,-10,-25,-23);g.lineTo(-29,-39);g.lineTo(-11,-29);g.quadraticCurveTo(0,-34,11,-29);g.lineTo(29,-39);g.lineTo(25,-23);g.quadraticCurveTo(38,-8,30,8);g.quadraticCurveTo(0,34,-30,7);g.fill()}
   // Narrow red eyes and the wide, toothy grin belong to the shadow itself.
   g.fillStyle=ghost.id===94?'#cf5369':'#e2dbe3';g.beginPath();g.moveTo(-21,-15);g.lineTo(-6,-9);g.lineTo(-8,-3);g.lineTo(-19,-6);g.closePath();g.fill();g.beginPath();g.moveTo(21,-15);g.lineTo(6,-9);g.lineTo(8,-3);g.lineTo(19,-6);g.closePath();g.fill();
   if(ghost.id!==94){g.fillStyle='#6d345d';g.fillRect(-13,-10,3,6);g.fillRect(10,-10,3,6)}
   g.fillStyle='#d5cbd3';g.beginPath();g.moveTo(-23,0);g.quadraticCurveTo(0,13,23,0);g.quadraticCurveTo(15,23,0,24);g.quadraticCurveTo(-15,23,-23,0);g.fill();
   g.strokeStyle='#302638';g.lineWidth=1.4;for(let i=-2;i<=2;i++){const x=i*6;g.beginPath();g.moveTo(x,8-Math.abs(i)*1.4);g.lineTo(x*.9,22-Math.abs(i)*2);g.stroke()}g.restore();
  }
  let sink,p;
  if(t<.55){sink=smooth(clamp(t/.55));p=0}
  else if(t<1.65){sink=1;p=clamp((t-.55)/1.1)}
  else if(t<2){sink=1;p=1}
  else{sink=1-smooth(clamp((t-2)/.65));p=1}
  const point=progress=>{const e=smooth(clamp(progress));return{x:job.from.x+(job.to.x-job.from.x)*e,y:job.from.y+(job.to.y-job.from.y)*e}},pos=point(p);
  ghost.el.style.transform=`translate(${pos.x}px,${pos.y}px)`;
  node.style.translate=`0px ${sink*job.height}px`;node.style.filter=`brightness(${1-sink*.87}) saturate(${1-sink*.85})`;node.style.opacity=sink>.995?'0':'1';if(brow)brow.style.opacity=String(1-sink);if(items)items.style.opacity=String(1-sink);
  const reduced=CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(!reduced&&p>0&&p<1)for(let j=5;j>=1;j--){const trail=point(p-j*.025);shadow(trail.x,trail.y,26-j*2,(6-j)*.045,t)}
  shadow(pos.x,pos.y,32+Math.sin(sink*Math.PI)*12,.45+sink*.5,t);
  if(t>1.45&&t<2.65){const alpha=Math.min(1,(t-1.45)/.2)*Math.min(1,(2.65-t)/.45);shadowFace(pos.x,pos.y,alpha)}
 }
 function tick(){
  g.clearRect(0,0,1280,800);if(!B.on||B.over){clear();return}
  for(const [u,job] of jobs){const elapsed=B.t-job.start;if(!u.alive||!u.el.isConnected||elapsed>=job.duration||u.r!==job.r||u.c!==job.c||u.moving){finish(u);continue}draw(job,elapsed)}
 }
 window.GHOST_SHADOW={begin,tick,clear};
})();
