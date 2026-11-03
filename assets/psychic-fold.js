/* Psychic mobility presentation: original blink destination, combat-clock animation. */
(()=>{
 const arena=document.getElementById('arenaView'),units=document.getElementById('units');if(!arena||!units)return;
 const layer=z=>{const c=document.createElement('canvas');c.width=1280;c.height=800;c.setAttribute('aria-hidden','true');c.style.cssText=`position:absolute;inset:0;width:1280px;height:800px;pointer-events:none;z-index:${z}`;if(z===2)arena.insertBefore(c,units);else arena.append(c);return c.getContext('2d')},floor=layer(2),fx=layer(2500);
 const jobs=new Map(),clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>n*n*(3-2*n);
 const css=document.createElement('style');css.textContent='#world .unit.psychic-fold-active .bob{animation:none!important}#world .unit.psychic-fold-active .sh{visibility:hidden}';document.head.append(css);
 function finish(u){const job=jobs.get(u);if(!job)return;const {node,old,brow,items}=job;for(const key of ['translate','scale','opacity','filter'])node.style[key]=old[key];if(brow)brow.style.opacity=old.brow;if(items)items.style.opacity=old.items;u.el.classList.remove('psychic-fold-active');jobs.delete(u);if(u.el.isConnected)updateCUEl(u)}
 function clear(){for(const u of [...jobs.keys()])finish(u);floor.clearRect(0,0,1280,800);fx.clearRect(0,0,1280,800)}
 function begin(u,from,to){
  if(!u?.alive||!u.el)return false;finish(u);
  const node=u.el.querySelector('canvas.pmdc')||u.el.querySelector('.spr img'),width=node&&(node.width||node.naturalWidth),height=node&&(node.height||node.naturalHeight);if(!width||!height)return false;
  const image=document.createElement('canvas');image.width=width;image.height=height;const ig=image.getContext('2d');
  try{ig.drawImage(node,0,0,width,height);ig.globalCompositeOperation='source-in';ig.fillStyle='#c8a1e2';ig.fillRect(0,0,width,height)}catch(e){return false}
  const rect=node.getBoundingClientRect(),brow=u.el.querySelector('.brow'),items=u.el.querySelector('.its');
  jobs.set(u,{u,node,brow,items,image,from:{...from},to:{...to},r:u.r,c:u.c,start:B.t,duration:1.1,w:rect.width/SC,h:rect.height/SC,old:{translate:node.style.translate,scale:node.style.scale,opacity:node.style.opacity,filter:node.style.filter,brow:brow?.style.opacity||'',items:items?.style.opacity||''}});
  u.el.classList.add('psychic-fold-active');u.el.style.transform=`translate(${from.x}px,${from.y}px)`;return true;
 }
 function draw(job,age){
  const {u,node,from:origin,to:end,w,h,image,brow,items}=job,t=age/job.duration*2.3,reduced=CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
  function ripple(p,progress,alpha){floor.save();floor.strokeStyle='#bda1dc';floor.lineWidth=1.5;floor.globalAlpha=alpha;for(let i=0;i<3;i++){const radius=10+(progress+i*.16)%1*39;floor.beginPath();floor.ellipse(p.x,p.y,radius,radius*.35,0,0,Math.PI*2);floor.stroke()}floor.restore()}
  function residue(x,y,alpha,scale=1){fx.save();fx.globalAlpha=alpha;fx.imageSmoothingEnabled=false;fx.drawImage(image,x-w*scale/2,y-h*scale,w*scale,h*scale);fx.restore()}
  const departure=clamp(t/.65),arrival=clamp((t-1.2)/.55),moving=t>=.65;
  const visibility=!moving?1-smooth(clamp((t-.18)/.47)):t<1.2?0:smooth(arrival),pos=moving?end:origin;
  u.el.style.transform=`translate(${pos.x}px,${pos.y}px)`;node.style.opacity=String(visibility);node.style.scale=reduced?'1 1':`${Math.max(.2,visibility)} ${1+(1-visibility)*.16}`;node.style.filter=`brightness(${1+(1-visibility)*.7}) sepia(.25) hue-rotate(225deg) drop-shadow(0 0 ${3+(1-visibility)*6}px #b97cd6)`;if(brow)brow.style.opacity=String(visibility);if(items)items.style.opacity=String(visibility);
  const charge=Math.sin(departure*Math.PI);if(t<.8){ripple(origin,departure,charge*.65);residue(origin.x-6,origin.y,charge*.22);residue(origin.x+6,origin.y,charge*.22)}
  if(t>.42&&t<1.65){const count=reduced?3:7;for(let i=0;i<count;i++){const delay=.48+i*.085*7/count,elapsed=t-delay;if(elapsed<0||elapsed>.5)continue;const p=(i+1)/(count+1);residue(origin.x+(end.x-origin.x)*p,origin.y+(end.y-origin.y)*p,Math.sin(elapsed/.5*Math.PI)*.43,.92)}}
  if(t>1.05&&t<2.1){const elapsed=clamp((t-1.05)/1.05),intensity=Math.sin(elapsed*Math.PI);ripple(end,1-elapsed,intensity*.75);if(!reduced){fx.save();fx.globalAlpha=intensity*.75;fx.strokeStyle='#d7b7ee';fx.lineWidth=1.5;for(let i=0;i<4;i++){const a=i*Math.PI/2+t,rad=14+(1-arrival)*28,x=end.x+Math.cos(a)*rad,y=end.y-h*.45+Math.sin(a)*rad*.65;fx.beginPath();fx.moveTo(x-Math.cos(a)*7,y-Math.sin(a)*5);fx.lineTo(x,y);fx.stroke()}fx.restore()}}
 }
 function tick(){floor.clearRect(0,0,1280,800);fx.clearRect(0,0,1280,800);if(!B.on||B.over){clear();return}for(const [u,job] of jobs){const age=B.t-job.start;if(!u.alive||!u.el.isConnected||age>=job.duration||u.r!==job.r||u.c!==job.c||u.moving){finish(u);continue}draw(job,age)}}
 window.PSYCHIC_FOLD={begin,tick,clear};
})();
