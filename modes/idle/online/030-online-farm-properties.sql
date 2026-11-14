-- Apply after 029. Fragments belong exclusively to Rocket; no hunt/weekly grants.
begin;
alter table oakchess_server.farm_profiles
 add column fragments bigint not null default 0 check(fragments between 0 and 9007199254740991),
 add column construction jsonb not null default '{"wood":0,"stone":0,"parts":0}',
 add column history jsonb not null default '[]',
 add column rolling jsonb,
 add column last_roll jsonb not null default '[]';
alter table oakchess_server.farm_houses
 add column locked boolean not null default false,
 add column decor_owned text[] not null default '{}',
 add column decor_enabled text[] not null default '{}';

-- Pure server sampler; no client seed, tier or percentage enters the draw.
create function oakchess_server.farm_deed_tier(p_draw integer)returns integer
language sql immutable set search_path='' as $$
 select case when p_draw between 0 and 74494 then 0 when p_draw between 74495 and 94494 then 1
 when p_draw between 94495 and 99494 then 2 when p_draw between 99495 and 99994 then 3
 when p_draw between 99995 and 99999 then 4 else null end
$$;
revoke all on function oakchess_server.farm_deed_tier(integer)from public,anon,authenticated;

create or replace function oakchess_server.farm_view(p_player uuid)returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',1,'onlineCore',true,'onlineProperties',true,'houseRules',2,
 'metFisher',coalesce(f.met_fisher,false),'metFarmer',coalesce(f.met_farmer,false),
 'questClaimed',coalesce(f.starter_claimed,false),'activeHouseId',f.active_house_id,
 'fragments',coalesce(f.fragments,0),'fragmentSource','rocket',
 'construction',coalesce(f.construction,'{"wood":0,"stone":0,"parts":0}'::jsonb),
 'history',coalesce(f.history,'[]'),'rolling',f.rolling,'lastRoll',coalesce(f.last_roll,'[]'),
 'houses',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,
 'created',extract(epoch from h.created_at),'receivedXp',h.received_xp,'locked',h.locked,
 'decorOwned',h.decor_owned,'decorEnabled',h.decor_enabled)order by h.created_at,h.id)
 from oakchess_server.farm_houses h where h.owner_id=p_player and h.installed),'[]'),
 'deeds',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,
 'created',extract(epoch from h.created_at),'locked',h.locked,'decorOwned',h.decor_owned,'decorEnabled',h.decor_enabled)
 order by h.created_at,h.id)from oakchess_server.farm_houses h where h.owner_id=p_player and not h.installed),'[]'),
 'residents',coalesce((select jsonb_agg(jsonb_build_object('key',r.inventory_id,'houseId',r.house_id,
 'trainingCarry',r.carry,'trained',r.trained))from oakchess_server.farm_residents r where r.owner_id=p_player),'[]'))
 from(select p_player as owner_id)base left join oakchess_server.farm_profiles f on f.owner_id=base.owner_id
$$;

-- Keep the validated first-house/transfer implementation and extend its public entry.
alter function public.journey_farm(uuid,text,jsonb)rename to journey_farm_core;
revoke all on function public.journey_farm_core(uuid,text,jsonb)from public,anon,authenticated;
create function public.journey_farm(p_request uuid,p_action text,p_payload jsonb default '{}')returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();f oakchess_server.farm_profiles%rowtype;h oakchess_server.farm_houses%rowtype;
 old oakchess_server.shop_operations%rowtype;receipt jsonb:='{}';results jsonb:='[]';deed jsonb;event jsonb;
 ids uuid[];deed_id uuid;requested integer;i integer;t integer;quantity integer;cost bigint;price bigint;
 materials jsonb;recipe jsonb;material text;amount bigint;label text;chosen_count integer;key text;
 names text[]:=array['Sítio das Amoras','Chácara do Lago','Refúgio dos Ipês','Refúgio Celestial','Vale das Estrelas'];
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_action is null or p_payload is null or jsonb_typeof(p_payload)<>'object'
 or octet_length(p_payload::text)>2048 then raise exception 'Operação da Fazenda inválida.';end if;
 perform 1 from public.journeys where owner_id=player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 perform 1 from oakchess_server.hunt_profiles where owner_id=player for update;if not found then raise exception 'Carregue sua jornada.';end if;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'farm:'||p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 select * into f from oakchess_server.farm_profiles where owner_id=player for update;
 if f.rolling is not null and p_action<>'settleDeeds'then raise exception 'Conclua a apresentação das escrituras antes de outra operação.';end if;
 if p_action in('meet','starter','selectHouse','rename','assign','return','pack','install')then
  return public.journey_farm_core(p_request,p_action,p_payload);
 end if;
 if not found or not coalesce(f.starter_claimed,false)then raise exception 'Receba sua primeira fazenda com Dona Rosa.';end if;
 if p_action='buyDeeds'then
  if p_payload-array['count','currency']<>'{}'or coalesce(p_payload->>'count','')not in('1','5','10')
  or coalesce(p_payload->>'currency','')<>'fragments'then raise exception 'Use somente fragmentos em lotes de 1, 5 ou 10 escrituras.';end if;
  quantity:=(p_payload->>'count')::integer;cost:=quantity*10;
  if f.fragments<cost then raise exception 'Fragmentos de Casa insuficientes. Obtidos somente nas Invasões Rocket.';end if;
  for i in 1..quantity loop
   t:=oakchess_server.farm_deed_tier(floor(random()*100000)::integer);
   insert into oakchess_server.farm_houses(owner_id,tier,name,installed)values(player,t,names[t+1],false)returning * into h;
   deed:=jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,'created',extract(epoch from h.created_at));results:=results||jsonb_build_array(deed);
  end loop;
  -- Inventory, payment and result are committed before the animation starts.
  update oakchess_server.farm_profiles set fragments=fragments-cost,
   rolling=jsonb_build_object('results',results,'currency','fragments','cost',cost,'startedAt',floor(extract(epoch from clock_timestamp())*1000),'elapsed',0,'lastFrame',-1),
   last_roll=results where owner_id=player;
  receipt:=jsonb_build_object('results',results,'cost',cost);label:='Sorteio de '||quantity||' escritura(s)';
 elsif p_action='settleDeeds'then
  if p_payload<>'{}'then raise exception 'Confirmação inválida.';end if;
  receipt:=jsonb_build_object('results',coalesce(f.rolling->'results','[]'));
  update oakchess_server.farm_profiles set rolling=null where owner_id=player;
 elsif p_action='fuseDeeds'then
  if p_payload-array['ids']<>'{}'or jsonb_typeof(p_payload->'ids')is distinct from 'array'
  or jsonb_array_length(p_payload->'ids')<>5 then raise exception 'Selecione cinco escrituras.';end if;
  select array_agg(value::uuid order by value::uuid)into ids from jsonb_array_elements_text(p_payload->'ids');
  if cardinality(ids)<>(select count(distinct id)from unnest(ids)id)then raise exception 'Escrituras repetidas.';end if;
  perform 1 from oakchess_server.farm_houses where owner_id=player and id=any(ids)order by id for update;
  select count(*),min(tier)into chosen_count,t from oakchess_server.farm_houses
   where owner_id=player and id=any(ids)and not installed and not locked;
  if chosen_count<>5 or t not in(0,1)or exists(select 1 from oakchess_server.farm_houses where id=any(ids)and tier<>t)
   then raise exception 'Use cinco escrituras livres e da mesma qualidade: Comum ou Incomum.';end if;
  delete from oakchess_server.farm_houses where owner_id=player and id=any(ids);
  insert into oakchess_server.farm_houses(owner_id,tier,name,installed)values(player,t+1,names[t+2],false)returning * into h;
  deed:=jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,'created',extract(epoch from h.created_at));
  receipt:=jsonb_build_object('deed',deed,'consumed',ids);label:='Fusão de cinco escrituras';
 elsif p_action in('deedLock','dispose','decorate','toggleDecor')then
  if p_payload-(case p_action when 'dispose'then array['id','mode']when 'deedLock'then array['id']else array['id','key']end)<>'{}'
   then raise exception 'Propriedade inválida.';end if;
  select * into h from oakchess_server.farm_houses where owner_id=player and id=(p_payload->>'id')::uuid for update;
  if not found then raise exception 'Propriedade não encontrada.';end if;
  if p_action='deedLock'then
   update oakchess_server.farm_houses set locked=not locked where id=h.id;
  elsif p_action='dispose'then
   if h.installed or h.locked then raise exception 'Guarde e desproteja a escritura antes desta operação.';end if;
   if coalesce(p_payload->>'mode','')not in('sell','recycle')then raise exception 'Operação inválida.';end if;
   delete from oakchess_server.farm_houses where id=h.id;
   if p_payload->>'mode'='sell'then
    price:=(array[400,700,1200,2000,3000]::bigint[])[h.tier+1];
    update public.journeys set gold=gold+price where owner_id=player;receipt:=jsonb_build_object('amount',price);label:='Venda de escritura';
   else
    materials:=jsonb_build_object('wood',(array[3,5,7,10,15])[h.tier+1],'stone',(array[2,3,5,7,10])[h.tier+1],'parts',(array[0,0,1,3,5])[h.tier+1]);
    for material,amount in select k,v::bigint from jsonb_each_text(materials)e(k,v)loop
     f.construction:=jsonb_set(f.construction,array[material],to_jsonb((f.construction->>material)::bigint+amount));
    end loop;
    update oakchess_server.farm_profiles set construction=f.construction where owner_id=player;
    receipt:=jsonb_build_object('materials',materials);label:='Reciclagem de escritura';
   end if;
  else
   key:=p_payload->>'key';if not h.installed or key is null or key not in('flowers','stones')then raise exception 'Decoração indisponível.';end if;
   if p_action='toggleDecor'then
    if not(key=any(h.decor_owned))then raise exception 'Construa esta decoração primeiro.';end if;
    update oakchess_server.farm_houses set decor_enabled=case when key=any(decor_enabled)then array_remove(decor_enabled,key)else array_append(decor_enabled,key)end where id=h.id;
   else
    if key=any(h.decor_owned)then raise exception 'Decoração já construída.';end if;
    recipe:=case when key='flowers'then '{"wood":8,"stone":4,"parts":0}'::jsonb else '{"wood":2,"stone":8,"parts":0}'::jsonb end;
    for material,amount in select k,v::bigint from jsonb_each_text(recipe)e(k,v)loop
     if (f.construction->>material)::bigint<amount then raise exception 'Materiais de construção insuficientes.';end if;
     f.construction:=jsonb_set(f.construction,array[material],to_jsonb((f.construction->>material)::bigint-amount));
    end loop;
    update oakchess_server.farm_profiles set construction=f.construction where owner_id=player;
    update oakchess_server.farm_houses set decor_owned=array_append(decor_owned,key),decor_enabled=array_append(decor_enabled,key)where id=h.id;
    label:='Construção de decoração';
   end if;
  end if;
 else
  raise exception 'Este serviço da Vila ainda está em preparação no beta online.';
 end if;
 if label is not null then
  event:=receipt||jsonb_build_object('action',label,'time',to_char(clock_timestamp()at time zone 'America/Sao_Paulo','DD/MM/YYYY HH24:MI'),
   'tier',coalesce(h.tier,0),'id',h.id,'created',extract(epoch from clock_timestamp()));
  update oakchess_server.farm_profiles set history=(select jsonb_agg(value)from(select value from jsonb_array_elements(jsonb_build_array(event)||history)limit 30)recent)where owner_id=player;
 end if;
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'farm:'||p_action,p_payload,receipt);
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_farm(uuid,text,jsonb)from public,anon,authenticated;
grant execute on function public.journey_farm(uuid,text,jsonb)to authenticated;
notify pgrst,'reload schema';
commit;
