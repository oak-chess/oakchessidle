import {buildHuntPlan,huntRoute,captureChance,evolutionFloor} from './hunt-plan.mjs';

export function createAuthoritativeHuntHandler({supabaseUrl,serviceKey,publishableKey,origins,fetcher=fetch}){
 const uuid=/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i,allowed=new Set(origins);
 return async request=>{
  const origin=request.headers.get('Origin'),headers={'Cache-Control':'no-store','Vary':'Origin'};
  const reply=(status,value)=>Response.json(value,{status,headers});
  if(origin&&!allowed.has(origin))return reply(403,{error:'Origem não autorizada.'});
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,
   'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'}});
  if(request.method!=='POST')return reply(405,{error:'Use POST.'});
  const authorization=request.headers.get('Authorization');
  if(!/^Bearer [^\s]+$/i.test(authorization||''))return reply(401,{error:'Entre na sua conta.'});
  const length=Number(request.headers.get('content-length'));
  if(length>1024)return reply(413,{error:'Pedido muito grande.'});
  let body;
  try{
   // Bound streaming reads as well, including requests without Content-Length.
   const reader=request.body?.getReader();let bytes=0,parts=[];
   if(!reader)throw Error();
   for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>1024){await reader.cancel();return reply(413,{error:'Pedido muito grande.'});}parts.push(value);}
   const raw=new Uint8Array(bytes);let at=0;for(const part of parts){raw.set(part,at);at+=part.length;}
   body=JSON.parse(new TextDecoder().decode(raw));
   const keys={begin:['action','requestId','route'],finish:['action','huntId'],capture:['action','huntId','index','ball'],evolve:['action','requestId','inventoryId','target']};
   if(!body||!keys[body.action]||Object.keys(body).some(k=>!keys[body.action].includes(k)))throw Error();
   if(['begin','evolve'].includes(body.action)?!uuid.test(body.requestId):!uuid.test(body.huntId))throw Error();
   if(body.action==='evolve'&&(!uuid.test(body.inventoryId)||!Number.isInteger(body.target)||body.target<1||body.target>649))throw Error();
   if(body.action==='capture'&&(!Number.isInteger(body.index)||body.index<0||body.index>5||typeof body.ball!=='string'))throw Error();
  }catch{return reply(400,{error:'Pedido de caçada inválido.'});}
  async function rpc(name,args){
   const response=await fetcher(supabaseUrl+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:serviceKey,
    Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(12000)});
   const data=await response.json();
   if(!response.ok){const error=Error(data.code==='P0001'?data.message:'Serviço de caçadas indisponível.');error.status=data.code==='P0001'?409:503;throw error;}
   return data;
  }
  try{
   const auth=await fetcher(supabaseUrl+'/auth/v1/user',{headers:{apikey:publishableKey,Authorization:authorization},signal:AbortSignal.timeout(10000)});
   if(!auth.ok)return reply(401,{error:'Sessão inválida ou expirada.'});
   const user=await auth.json();if(!uuid.test(user.id))return reply(401,{error:'Sessão inválida.'});
   if(body.action==='evolve'){
    const source=await rpc('journey_evolution_source',{p_player:user.id,p_inventory:body.inventoryId});
    if(!source||source.is_listed)return reply(409,{error:'Pokémon indisponível para evolução.'});
    let floor;try{floor=evolutionFloor(source,body.target);}catch(error){return reply(409,{error:error.message});}
    return reply(200,await rpc('journey_evolve',{p_player:user.id,p_request:body.requestId,p_inventory:source.id,p_from:source.pokemon_id,p_target:body.target,p_floor:floor}));
   }
   if(body.action==='begin'){
    let route;try{route=huntRoute(body.route);}catch(error){return reply(400,{error:error.message});}
    let encounter=await rpc('hunt_prepare',{p_player:user.id,p_request:body.requestId,p_route:route.key,p_area:route.area,p_min:route.isGym?1:route.min});
    if(!encounter.plan){
     let plan;try{plan=buildHuntPlan(encounter);}catch(error){
      await rpc('hunt_cancel_unstarted',{p_player:user.id,p_hunt:encounter.id});
      return reply(409,{error:error.message});
     }
     encounter=await rpc('hunt_store_plan',{p_player:user.id,p_hunt:encounter.id,p_plan:plan});
    }
    // No private RNG seed is returned. Replays are presentation, never proof of a reward.
    return reply(200,{id:encounter.id,route:encounter.route,readyAt:encounter.ready_at,remainingMs:Math.max(0,Date.parse(encounter.ready_at)-Date.now()),
     settled:!!encounter.finished_at,replay:{frames:encounter.plan.frames,snapshot:encounter.plan.snapshot,elapsedMs:encounter.plan.elapsedMs}});
   }
   if(body.action==='finish')return reply(200,await rpc('hunt_finish',{p_player:user.id,p_hunt:body.huntId}));
   const encounter=await rpc('hunt_get',{p_player:user.id,p_hunt:body.huntId});
   if(encounter?.route?.endsWith(':gym'))return reply(409,{error:'Os Pokémon do ginásio não podem ser capturados.'});
   if(!encounter?.plan?.enemies?.[body.index])return reply(404,{error:'Encontro não encontrado.'});
   let chance;try{chance=captureChance(encounter.plan.enemies[body.index],body.ball,false);}catch(error){return reply(400,{error:error.message});}
   return reply(200,await rpc('hunt_capture',{p_player:user.id,p_hunt:body.huntId,p_index:body.index,p_ball:body.ball,p_chance:chance}));
  }catch(error){return reply(error.status||503,{error:error.status===409?error.message:'Não foi possível processar a caçada. Tente novamente com o mesmo encontro.'});}
 };
}
