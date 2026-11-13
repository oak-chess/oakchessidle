/* Replays server positions inside the existing arena. It never decides an outcome. */
window.createServerHunts=function(ctx){
 const bridge=window.IDLE_SERVER_JOURNEY;
 let pending=null,requestId=null,checkpointPlayback=null,abandoning=false;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function execute(){
  const challenge=ctx.challenge();
  if(challenge&&challenge.kind!=='boss')throw Error('Este modo ainda não está ligado à economia online. Use as caçadas disponíveis.');
  await bridge.syncPreferences(ctx.state);
  if(!bridge.snapshot.activeHunt&&!requestId){
   await bridge.syncOrganization(ctx.state);
  }
  requestId??=crypto.randomUUID();
  const encounter=await bridge.request({action:'begin',requestId,route:challenge?challenge.area+':gym':ctx.state.area+':'+ctx.state.hunts.kind});
  if(abandoning)return;
  const prepared=!ctx.running()&&!!ctx.preview;
  if(prepared){
   ctx.preview(encounter.replay);
   while(!ctx.running()&&!abandoning)await wait(200);
   if(abandoning)return;
  }
  ctx.show(encounter.replay);
  const frames=encounter.replay.frames,elapsedMs=encounter.replay.elapsedMs;
  const resumed=prepared?0:Math.max(0,elapsedMs-encounter.remainingMs),start=performance.now();let index=0,lastIndex=-1;
  // Resuming must not replay old damage/attack effects in a single burst.
  const checkpointKey='oak-online-hunt-frame:'+encounter.id;
  const storage=window.sessionStorage;
  const checkpoint=storage?.getItem(checkpointKey);
  let elapsed=checkpoint!=null?Math.min(elapsedMs,Math.max(0,Number(checkpoint)||0)):ctx.running()?resumed:0;
  let previous=start,wasRunning=ctx.running();
  checkpointPlayback=()=>storage?.setItem(checkpointKey,String(elapsed));
  while(index+1<frames.length&&frames[index+1].t<=elapsed)index++;
  lastIndex=elapsed>0?index:-1;
  if(frames.length)ctx.frame(frames[index],[]);
  while(elapsed<elapsedMs||!ctx.running()){
   await wait(!ctx.running()||document.hidden?200:33);
   if(abandoning)return;
   const now=performance.now(),delta=now-previous;
   previous=now;
   if(!ctx.running()){
    if(wasRunning)storage?.setItem(checkpointKey,String(elapsed));
    wasRunning=false;
    continue;
   }
   elapsed=Math.min(elapsedMs,elapsed+(wasRunning?delta:0));
   wasRunning=true;
   while(index+1<frames.length&&frames[index+1].t<=elapsed)index++;
   if(ctx.running()&&!document.hidden){
    const a=frames[index],b=frames[index+1],q=b?Math.max(0,Math.min(1,(elapsed-a.t)/(b.t-a.t))):0;
    const shown={...a,u:a.u.map((p,i)=>{const n=b?.u[i];return n?[p[0]+(n[0]-p[0])*q,p[1]+(n[1]-p[1])*q,...p.slice(2)]:p})};
    const events=frames.slice(lastIndex+1,index+1).flatMap(f=>f.e||[]);
    ctx.frame(shown,events);
   }
   lastIndex=index;
  }
  if(abandoning)return;
  if(ctx.running()&&!document.hidden){ctx.frame(frames.at(-1),frames.slice(lastIndex+1).flatMap(f=>f.e||[]));}
  let settled;
  for(let retry=0;retry<4;retry++){
   try{settled=await bridge.request({action:'finish',huntId:encounter.id});break;}
   catch(error){if(retry===3||!error.message.includes('andamento'))throw error;await wait(750);}
  }
  requestId=null;
  checkpointPlayback=null;
  storage?.removeItem(checkpointKey);
  await ctx.finish(settled);
  if(encounter.route.endsWith(':gym')){ctx.complete?.();return;}
  const last=frames.at(-1),offset=encounter.replay.snapshot.allies.length;
  for(const [index,enemy] of encounter.replay.snapshot.enemies.entries()){
   if(last.u[offset+index][3])continue;
   await ctx.capture(enemy,async ball=>{
    const result=await bridge.request({action:'capture',huntId:encounter.id,index,ball});
    ctx.apply(result.state);return result.capture;
   });
  }
  ctx.complete?.();
 }
 return {get busy(){return !!pending||abandoning},checkpoint(){checkpointPlayback?.();},async abandon(){
  if(abandoning)throw Error('Aguarde a troca de caçada.');
  abandoning=true;
  try{
   await pending?.catch(()=>{});
   const snapshot=await bridge.abandon();
   requestId=null;
   ctx.apply(snapshot);
  }finally{abandoning=false;}
 },run(){
  if(pending)return pending;
  pending=execute().finally(()=>{pending=null;checkpointPlayback=null;});return pending;
 }};
};
