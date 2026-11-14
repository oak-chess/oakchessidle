import {createHuntSimulation} from './hunt-engine.mjs';
import {replayCast,FISH_RANK} from '../fishing/cast-rules.mjs';

export function fishingCaptures(cast) {
 const engine=createHuntSimulation();
 return cast.shoal.map((species,index)=>({species,
  level:({119:33,130:20,61:25,340:30}[species]||5+FISH_RANK[species]*5)+
   (parseInt(cast.seed.replaceAll('-','').slice(index*4,index*4+4),16)%6),
  genes:engine.genes(species,cast.seed+':fish:'+index,true)}));
}

export function createFishingHandler({supabaseUrl,serviceKey,publishableKey,origins,fetcher=fetch}) {
 const uuid=/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i,allowed=new Set(origins);
 return async request=>{
  const origin=request.headers.get('Origin'),headers={'Cache-Control':'no-store',Vary:'Origin'};
  const reply=(status,data)=>Response.json(data,{status,headers});
  if(origin&&!allowed.has(origin))return reply(403,{error:'Origem não autorizada.'});
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,
   'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'}});
  if(request.method!=='POST')return reply(405,{error:'Use POST.'});
  const authorization=request.headers.get('Authorization');
  if(!/^Bearer [^\s]+$/i.test(authorization||''))return reply(401,{error:'Entre na sua conta.'});
  if(Number(request.headers.get('content-length'))>32768)return reply(413,{error:'Pedido muito grande.'});
  let body;
  try {
   const reader=request.body?.getReader();if(!reader)throw Error();
   let bytes=0;const chunks=[];
   for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;
    if(bytes>32768){await reader.cancel();return reply(413,{error:'Pedido muito grande.'});}chunks.push(value);}
   const raw=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.length;}
   body=JSON.parse(new TextDecoder().decode(raw));
   const keys={cast:['action','requestId','settings'],finish:['action','castId','trace','duration']};
   if(!body||!keys[body.action]||Object.keys(body).some(key=>!keys[body.action].includes(key)) ||
      !uuid.test(body.action==='cast'?body.requestId:body.castId))throw Error();
   if(body.action==='cast'&&(!body.settings||Array.isArray(body.settings)||typeof body.settings!=='object'))throw Error();
   if(body.action==='finish'&&(!Array.isArray(body.trace)||body.trace.length>512))throw Error();
  }catch{return reply(400,{error:'Pedido de pesca inválido.'});}
  async function rpc(name,args){
   const response=await fetcher(supabaseUrl+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:serviceKey,
    Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(12000)});
   const data=await response.json();if(!response.ok){const error=Error(data.code==='P0001'?data.message:'Serviço de pesca indisponível.');error.status=data.code==='P0001'?409:503;throw error;}return data;
  }
  try {
   const auth=await fetcher(supabaseUrl+'/auth/v1/user',{headers:{apikey:publishableKey,Authorization:authorization},signal:AbortSignal.timeout(10000)});
   if(!auth.ok)return reply(401,{error:'Sessão inválida ou expirada.'});
   const user=await auth.json();if(!uuid.test(user.id))return reply(401,{error:'Sessão inválida.'});
   if(body.action==='cast') {
    const cast=await rpc('fishing_prepare',{p_player:user.id,p_request:body.requestId,p_payload:body.settings});
    if(cast.finished_at)return reply(409,{error:'Esta tentativa já foi encerrada. Atualize a pesca.'});
    return reply(200,{cast:{id:cast.id,shoal:cast.shoal,technique:cast.technique,settings:cast.payload,started:Date.parse(cast.started_at)}});
   }
   const cast=await rpc('fishing_get',{p_player:user.id,p_cast:body.castId});
   if(!cast)return reply(404,{error:'Tentativa não encontrada.'});
   if(cast.finished_at)return reply(200,await rpc('fishing_settle',{p_player:user.id,p_cast:cast.id,p_won:false,p_captures:[]}));
   let result;
   try {result=replayCast({species:cast.shoal[0],technique:cast.technique},body.trace,body.duration,cast.wallElapsed);}
   catch(error){return reply(400,{error:error.message});}
   if(!['caught','lost'].includes(result.phase))return reply(409,{error:'A fisgada ainda está em andamento.'});
   return reply(200,await rpc('fishing_settle',{p_player:user.id,p_cast:cast.id,p_won:result.won,p_captures:result.won?fishingCaptures(cast):[]}));
  }catch(error){return reply(error.status||503,{error:error.status===409?error.message:'Não foi possível confirmar a pesca. Tente novamente com a mesma tentativa.'});}
 };
}
