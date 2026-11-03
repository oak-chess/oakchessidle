/* Isolated Pokédex animation viewer; does not register playable units. */
(()=>{
 const base='https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/',cache=new Map();let generation=0;
 async function load(form){
  if(cache.has(form.path))return cache.get(form.path);
  const promise=(async()=>{
   const local=window.DEX_PMD_LOCAL?.[form.path];
   if(local){const image=new Image();image.src=local.sheet;await image.decode();return {...local,image}}
   const response=await fetch(base+form.path+'/AnimData.xml');if(!response.ok)throw Error('metadata');
   const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
   const nodes=[...xml.querySelectorAll('Anim')];let anim=nodes.find(n=>n.querySelector('Name')?.textContent==='Idle')||nodes.find(n=>n.querySelector('Name')?.textContent==='Walk');
   if(!anim)throw Error('animation');const name=anim.querySelector('Name').textContent,copy=anim.querySelector('CopyOf')?.textContent;
   if(copy)anim=nodes.find(n=>n.querySelector('Name')?.textContent===copy)||anim;
   const w=+anim.querySelector('FrameWidth')?.textContent,h=+anim.querySelector('FrameHeight')?.textContent;
   if(!w||!h)throw Error('dimensions');
   const image=new Image();image.src=base+form.path+'/'+(copy||name)+'-Anim.png';await image.decode();
   return {image,w,h,durations:[...anim.querySelectorAll('Duration')].map(n=>Math.max(1,+n.textContent)),name};
  })();cache.set(form.path,promise);try{return await promise}catch(error){cache.delete(form.path);throw error}
 }
 async function show(host,form,status){
  const token=++generation;host.replaceChildren();status.textContent='Carregando animação PMD…';
  try{const data=await load(form);if(token!==generation||!host.isConnected)return;
   const canvas=document.createElement('canvas');canvas.width=data.w;canvas.height=data.h;canvas.style.cssText='width:'+Math.round(data.w*Math.min(128/data.w,128/data.h))+'px;height:'+Math.round(data.h*Math.min(128/data.w,128/data.h))+'px;image-rendering:pixelated';host.append(canvas);const ctx=canvas.getContext('2d'),durations=data.durations.length?data.durations:[8],total=durations.reduce((a,b)=>a+b,0),start=performance.now();status.textContent=data.name+' · '+form.name;
   function tick(now){if(token!==generation||!host.isConnected||!host.closest('.show'))return;let time=(now-start)/1000*60%total,frame=0;while(frame<durations.length-1&&time>=durations[frame])time-=durations[frame++];if(matchMedia('(prefers-reduced-motion:reduce)').matches)frame=0;ctx.clearRect(0,0,data.w,data.h);ctx.drawImage(data.image,frame*data.w,0,data.w,data.h,0,0,data.w,data.h);requestAnimationFrame(tick)}requestAnimationFrame(tick);
  }catch{if(token===generation)status.textContent='Prévia indisponível no momento. Reabra a ficha para tentar novamente.'}
 }
 window.DEX_PMD_PREVIEW={show};
})();
