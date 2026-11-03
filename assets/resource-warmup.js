/* Small decoded-image queue. Never blocks startup or downloads the full inventory. */
(()=>{
 const cache=new Map(),queue=[];let active=0;
 function pump(){while(active<2&&queue.length){const job=queue.shift();active++;
  const image=new Image();image.decoding='async';image.fetchPriority=job.urgent?'auto':'low';let finished=false;
  const finish=ok=>{if(finished)return;finished=true;clearTimeout(timer);active--;job.done=true;if(!ok)cache.delete(job.url);job.resolve(ok?image:null);pump()};
  const timer=setTimeout(()=>finish(false),15000);
  image.onload=async()=>{try{await image.decode()}catch{}finish(!!image.naturalWidth)};image.onerror=()=>finish(false);image.src=job.url;
 }}
 function image(url,urgent=false){
  if(!url)return Promise.resolve(null);
  if(cache.has(url)){const job=cache.get(url),index=queue.indexOf(job);if(urgent&&index>=0){queue.splice(index,1);job.urgent=true;queue.unshift(job)}return job.promise}
  const job={url,urgent,done:false};job.promise=new Promise(resolve=>job.resolve=resolve);cache.set(url,job);urgent?queue.unshift(job):queue.push(job);pump();
  if(cache.size>96)for(const [key,value]of cache){if(cache.size<=96)break;if(value.done)cache.delete(key)}
  return job.promise;
 }
 window.OAK_ASSETS={image,warm(urls){return Promise.all([...new Set(urls)].map(url=>image(url)))}};
})();
