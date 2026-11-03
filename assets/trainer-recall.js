/* Player and campaign opponent trainers recall their own defeated Pokemon. */
(()=>{
 if(window.OAK_IDLE_MODE||location.pathname.includes('/prototypes/'))return;
 const arena=document.getElementById('arenaView');if(!arena)return;
 const layer=z=>{const cv=document.createElement('canvas');cv.width=1280;cv.height=800;cv.setAttribute('aria-hidden','true');cv.style.cssText=`position:absolute;inset:0;width:1280px;height:800px;pointer-events:none;z-index:${z}`;arena.append(cv);return cv.getContext('2d')},ground=layer(1),front=layer(2501);
 const assets={};for(const name of ['red_normal','red_item']){const im=new Image();im.src='assets/trainers/'+name+'.png';assets[name]=im}
 const ball=new Image();ball.src=itemUrl('poke-ball');
 const trainers=[{x:345,y:590,name:'VOCÊ',sprite:'red_normal',mirror:true}],jobs=[];
 const clamp=n=>Math.max(0,Math.min(1,n));
 function visible(){return !DEMO.on&&!document.body.classList.contains('on-title')&&['plan','combat','result'].includes(G.phase)}
 function clear(){jobs.length=0;ground.clearRect(0,0,1280,800);front.clearRect(0,0,1280,800)}
 function drawTrainers(active=-1,gesture=false){
  ground.clearRect(0,0,1280,800);front.clearRect(0,0,1280,800);
  if(window.TRAINER_DUO){TRAINER_DUO.draw(front,345,590,performance.now(),1,'arena');front.font='10px Arial';front.textAlign='center';front.fillStyle='#f3deb0';front.fillText(window.TRAINER_PROFILE_API?.state.name||'VOCÊ',345,610);return}
  trainers.forEach((p,i)=>{
   ground.globalAlpha=.45;ground.fillStyle='#17201a';ground.beginPath();ground.ellipse(p.x,p.y+2,27,9,0,0,Math.PI*2);ground.fill();ground.globalAlpha=1;
   const img=assets[i===0&&i===active&&gesture?'red_item':p.sprite];if(img&&img.complete&&img.naturalWidth){const frame=i===0&&i===active&&gesture?5:2;front.save();front.translate(p.x,p.y);front.scale(p.mirror?-1:1,1);front.imageSmoothingEnabled=false;front.drawImage(img,frame*16,0,16,32,-30,-120,60,120);front.restore()}
   front.font='10px Arial';front.textAlign='center';front.fillStyle='#f3deb0';front.fillText(p.name,p.x,p.y+20);
  });
 }


 // Campaign opponents stand on the far-side walkway, outside the playable hexes.
 const opponentAliases={"schoolkid":"youngster","schoolkidf":"lass","scubadiver":"swimmer","surfer":"swimmer","tuber":"youngster","tuberf":"lass","scientistf":"scientist","punkguy":"biker","punkgirl":"cooltrainerf","guitarist":"cooltrainerm","officeworker":"gentleman","gardener":"worker","aromalady":"beauty","parasollady":"picnicker","lady":"beauty","cowgirl":"picnicker","juggler":"pokemaniac","burglar":"rocketgrunt","birdkeeper":"camper","clown":"pokemaniac","supernerd":"scientist","collector":"pokemaniac","psychic":"channeler","psychicf":"channeler","medium":"channeler","sage":"gentleman","ninjaboy":"youngster","harlequin":"pokemaniac","dancer":"cooltrainerm","kimonogirl":"beauty","firebreather":"hiker","veteran":"cooltrainerm","veteranf":"cooltrainerf","roughneck":"biker","ruffian":"biker","cyclist":"biker","cyclistf":"cooltrainerf","skier":"cooltrainerm","skierf":"cooltrainerf","streetthug":"biker","youngathlete":"youngster","youngathletef":"lass","battlegirl":"blackbelt","striker":"cooltrainerm","pokemonranger":"camper","pokemonrangerf":"picnicker","doctor":"scientist","pilot":"policeman","green":"leaf","blue-gen1":"blue","blue-gen3":"blue","blue-lgpe":"blue","blue-masters":"blue","blue-gen7":"blue","blue-masters2":"blue"},opponentSprites=new Map();for(const slug of ["archer","ariana","proton","petrel","agatha","beauty","biker","bill","blackbelt","blaine","blue","brendan","brock","bruno","bugcatcher","camper","channeler","cooltrainerf","cooltrainerm","erika","fisherman","gentleman","giovanni","hiker","koga","lance","lass","leaf","lorelei","ltsurge","may","misty","mrfuji","nurse","oak","picnicker","pokemaniac","policeman","red","richboy","rocketgruntf","rocketgrunt","sabrina","sailor","scientist","swimmerf","swimmer","worker","youngster"]){const image=new Image();image.src='assets/trainer-profile/sprites/'+slug+'_normal.png';opponentSprites.set(slug,image)}
 function campaignOpponent(){if(G.tower||DEMO.on)return null;const r=G.round;if(!r)return null;let opponent=r.kind==='boss'&&r.gym<8?LEADERS[r.gym]:r.kind==='e4'?LEAGUE[r.lg]:r.kind==='champ'?LEAGUE[4]:null;if(!opponent&&G.oppSlug&&(r.kind==='trainer'||r.kind==='rival'||['rocket','adapt','rematch'].includes(r.event)))opponent={s:G.oppSlug,n:G.oppName||'Treinador'};if(!opponent?.s)return null;const slug=opponentAliases[opponent.s]||opponent.s,image=opponentSprites.get(slug);if(!image?.complete||!image.naturalWidth)return null;const player=trainers[0],nearEdge=hexXY(ROWS-1,0),farEdge=hexXY(0,COLS-1);return {image,name:opponent.n,frameWidth:slug==='biker'||['archer','ariana','proton','petrel'].includes(slug)?32:16,hgss:['archer','ariana','proton','petrel'].includes(slug),x:W-player.x,y:farEdge.y+(player.y-nearEdge.y)}}

 function drawOpponent(){const opponent=campaignOpponent();if(!opponent)return;const {image,name,x,y,frameWidth,hgss}=opponent,frameHeight=32,frameCount=Math.floor(image.naturalWidth/frameWidth),recall=jobs.find(j=>j.side===1&&j.age>.15&&j.age<2.15),pose=hgss?(recall?(recall.age<.4||recall.age>1.8?4:8):8):recall?(recall.age<.4||recall.age>1.8?7:8):2,frame=Math.min(pose,frameCount-1);if(window.ROCKET_DUO?.drawOpponent(front,x,y,recall?.u))return;ground.save();ground.globalAlpha=.4;ground.fillStyle='#17201a';ground.beginPath();ground.ellipse(x,y+2,25,8,0,0,Math.PI*2);ground.fill();ground.restore();front.save();front.imageSmoothingEnabled=false;const still=CFG.reduceFx||G.paused||matchMedia('(prefers-reduced-motion:reduce)').matches,bob=still||recall?0:Math.floor(performance.now()/1500)%2;front.drawImage(image,frame*frameWidth,0,frameWidth,frameHeight,x-frameWidth*3.75/2,y-120-bob,frameWidth*3.75,120);front.font='10px Arial';front.textAlign='center';front.lineWidth=3;front.strokeStyle='#18201dcc';front.strokeText(name,x,y+20,175);front.fillStyle='#f3deb0';front.fillText(name,x,y+20,175);front.restore()}

 function begin(u){
  if(!visible()||![0,1].includes(u.side))return false;
  const side=u.side,owner=side===0?trainers[0]:campaignOpponent();if(!owner)return false;
  const node=u.el?.querySelector('canvas.pmdc')||u.el?.querySelector('.spr img');if(!node)return false;
  try{
  const width=node.width||node.naturalWidth,height=node.height||node.naturalHeight;if(!width||!height){return false}
  // Use the visible body bounds, excluding PMD padding reserved for attack poses.
  let sx=0,sy=0,sw=width,sh=height;
  const st=u.el._pmd;
  if(st&&node===st.cv){
   const a=st.d[st.name]||st.d.Idle,b=a.b,row=Math.min(a.rows-1,st.frow||0);
   const bottom=b.rb[row]??b.mxy,top=b.rt[row]??b.mny;
   sx=Math.max(0,Math.floor(st.d.ax-a.fw/2+b.mnx));
   sy=Math.max(0,Math.floor(st.d.ch-bottom-1+top));
   sw=Math.min(width-sx,b.mxx-b.mnx+1);sh=Math.min(height-sy,bottom-top+1);
  }
  const image=document.createElement('canvas');image.width=sw;image.height=sh;const ig=image.getContext('2d');ig.drawImage(node,sx,sy,sw,sh,0,0,sw,sh);ig.globalCompositeOperation='source-in';ig.fillStyle='#ff7f94';ig.fillRect(0,0,sw,sh);
  const rect=node.getBoundingClientRect(),px=rect.width/width,py=rect.height/height;
  // The arena has a perspective transform: screen coordinates cannot simply
  // be divided by SC. Use the same inverse projection as arena pointer input.
  const point=(x,y)=>toWorld({clientX:x,clientY:y});
  const screenX=rect.left+(sx+sw/2)*px,screenY=rect.top+(sy+sh/2)*py;
  const center=point(screenX,screenY),left=point(screenX-sw*px/2,screenY),right=point(screenX+sw*px/2,screenY),top=point(screenX,screenY-sh*py/2),bottom=point(screenX,screenY+sh*py/2);
  const w=Math.hypot(right.x-left.x,right.y-left.y),h=Math.hypot(bottom.x-top.x,bottom.y-top.y),hand=(side===1?window.ROCKET_DUO?.recallOrigin(owner.x,owner.y,u):null)||{x:owner.x+(side===0?26:-26),y:owner.y-68};

  if(side===0)window.TRAINER_DUO?.react('recall');jobs.push({side,u,node,image,w,h,center,hand,age:0});u.el.style.display='none';return true;
  }catch(e){return false}
 }
 function drawJob(job){
  const {u,node,image,w,h,center,hand}=job,t=job.age,reduced=CFG.reduceFx||matchMedia('(prefers-reduced-motion:reduce)').matches;
   if(t<=.35){front.imageSmoothingEnabled=false;front.drawImage(image,center.x-w/2,center.y-h/2,w,h)}
   if(t>.25&&t<1.85){
    if(ball.complete&&ball.naturalWidth){front.imageSmoothingEnabled=false;front.drawImage(ball,hand.x-11,hand.y-11,22,22)}
   }
   if(t>.35&&t<1.6){
    const pull=clamp((t-.72)/.85),ease=1-Math.pow(1-pull,3),x=center.x+(hand.x-center.x)*ease,y=center.y+(hand.y-center.y)*ease;
    front.save();front.globalAlpha=Math.min(1,(t-.35)*8)*(1-pull*.6);front.lineCap='round';front.strokeStyle='rgba(246,87,115,.28)';front.lineWidth=10;front.beginPath();front.moveTo(hand.x,hand.y);front.lineTo(x,y);front.stroke();front.strokeStyle='#f76c86';front.lineWidth=3;front.stroke();front.strokeStyle='#ffd4d6';front.lineWidth=1;front.stroke();front.restore();

    const scale=Math.max(.035,Math.pow(1-pull,1.6));front.save();front.globalAlpha=1-pull*.25;front.imageSmoothingEnabled=false;front.drawImage(image,x-w*scale/2,y-h*scale/2,w*scale,h*scale);front.restore();
   }

   if(t>=1.6){const flash=clamp((t-1.6)/.45);if(flash<1){front.save();front.globalAlpha=(1-flash)*.85;front.strokeStyle='#ffd2c5';front.lineWidth=2;front.beginPath();front.ellipse(hand.x,hand.y,5+flash*19,5+flash*19,0,0,Math.PI*2);front.stroke();if(!reduced){front.fillStyle='#fff0d6';front.fillRect(hand.x-3,hand.y-7,6,14);front.fillRect(hand.x-7,hand.y-3,14,6)}front.restore()}}

 }
 function tick(dt){
  if(!visible()){clear();return}
  for(let i=jobs.length-1;i>=0;i--){jobs[i].age+=dt;if(jobs[i].age>=2.5||!jobs[i].u.el?.isConnected)jobs.splice(i,1)}
  drawTrainers(jobs.some(j=>j.side===0)?0:-1,jobs.some(j=>j.side===0&&j.age>.2&&j.age<1.8));
  drawOpponent();
  for(const job of jobs)drawJob(job);
 }
 window.TRAINER_RECALL={begin,tick,clear};
})();
