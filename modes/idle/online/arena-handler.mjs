import {createArenaSimulation} from './arena-engine.mjs';

// Runs in Supabase Edge Functions. No browser result, seed, team or stats are accepted.
export function createArenaHandler({supabaseUrl,serviceKey,publishableKey,origins,fetcher=fetch}){
 const allowed=new Set(origins);
 const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
 return async function(request){
  const origin=request.headers.get('Origin');
  const headers={'Cache-Control':'no-store','Vary':'Origin'};
  const reply=(status,body)=>Response.json(body,{status,headers});
  if(origin&&!allowed.has(origin))return reply(403,{error:'Origem não autorizada.'});
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,
   'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'}});
  if(request.method!=='POST')return reply(405,{error:'Use POST.'});
  if(!supabaseUrl||!serviceKey||!publishableKey)return reply(503,{error:'Arena não configurada.'});
  const authorization=request.headers.get('Authorization');
  if(!/^Bearer [^\s]+$/i.test(authorization||''))return reply(401,{error:'Entre na sua conta.'});
  let body;
  try{
   const raw=await request.text();
   if(raw.length>256)return reply(413,{error:'Pedido muito grande.'});
   body=JSON.parse(raw);
   if(!body||Object.keys(body).length!==1||!uuid.test(body.offerId))return reply(400,{error:'Informe somente a busca do adversário.'});
  }catch{return reply(400,{error:'Pedido inválido.'})}
  async function remote(path,init){
   return fetcher(supabaseUrl+path,{...init,signal:AbortSignal.timeout(10000)});
  }
  async function rpc(name,args){
   const response=await remote('/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:serviceKey,
    Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},body:JSON.stringify(args)});
   const data=await response.json();
   if(!response.ok){const error=Error(data.code==='P0001'?data.message:'Falha ao processar a partida.');error.status=data.code==='P0001'?409:503;throw error}
   return data;
  }
  try{
   const response=await remote('/auth/v1/user',{headers:{apikey:publishableKey,Authorization:authorization}});
   if(!response.ok)return reply(401,{error:'Sessão inválida ou expirada.'});
   const user=await response.json();
   if(!uuid.test(user.id))return reply(401,{error:'Sessão inválida.'});
   const match=await rpc('arena_prepare_match',{p_player:user.id,p_offer:body.offerId});
   if(match.result)return reply(200,match.result);
   const simulation=createArenaSimulation(match.seed);
   const result=simulation.run(match.snapshot.allies,match.snapshot.enemies);
   const settled=await rpc('arena_settle_match',{p_player:user.id,p_match:match.id,p_result:result});
   return reply(200,settled);
  }catch(error){return reply(error.status||503,{error:error.status===409?error.message:'Não foi possível concluir a partida. Tente novamente com a mesma busca.'})}
 };
}
