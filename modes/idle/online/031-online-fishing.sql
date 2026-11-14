-- Apply after 030, together with fishing-battle. No local saves are imported.
begin;
create table oakchess_server.fishing_profiles(
 owner_id uuid primary key references public.journeys(owner_id) on delete cascade,
 rods integer[] not null default '{}', level integer not null default 1 check(level between 1 and 200),
 xp bigint not null default 0 check(xp>=0), last_xp integer not null default 0,
 total_caught integer not null default 0, attempts integer not null default 0,
 missed integer not null default 0, completed text[] not null default '{}');
create table oakchess_server.fishing_casts(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.journeys(owner_id)on delete cascade,
 request_id uuid not null, payload jsonb not null, shoal integer[] not null,
 technique text not null check(technique in('float','precision')),
 seed uuid not null default gen_random_uuid(),started_at timestamptz not null default clock_timestamp(),
 finished_at timestamptz,result jsonb,unique(owner_id,request_id));
create unique index fishing_one_cast on oakchess_server.fishing_casts(owner_id)where finished_at is null;
create table oakchess_server.fishing_catches(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.journeys(owner_id)on delete cascade,
 cast_id uuid not null references oakchess_server.fishing_casts(id),ordinal integer not null,
 pokemon_id integer not null,level integer not null check(level between 1 and 100000),
 genes jsonb not null check(jsonb_typeof(genes)='object'),caught_at timestamptz not null default clock_timestamp(),
 unique(cast_id,ordinal));
create index fishing_catch_owner on oakchess_server.fishing_catches(owner_id);
alter table oakchess_server.fishing_profiles enable row level security;
alter table oakchess_server.fishing_casts enable row level security;
alter table oakchess_server.fishing_catches enable row level security;
revoke all on oakchess_server.fishing_profiles,oakchess_server.fishing_casts,oakchess_server.fishing_catches from public,anon,authenticated;

create function oakchess_server.fishing_add_xp(p_player uuid,p_amount integer)returns void
language plpgsql set search_path='' as $$
declare f oakchess_server.fishing_profiles%rowtype;
begin
 select * into strict f from oakchess_server.fishing_profiles where owner_id=p_player for update;
 f.xp:=f.xp+p_amount;
 while f.level<200 and f.xp>=60+(f.level-1)*12 loop
  f.xp:=f.xp-(60+(f.level-1)*12);f.level:=f.level+1;
 end loop;
 update oakchess_server.fishing_profiles set level=f.level,xp=case when f.level=200 then 0 else f.xp end,last_xp=p_amount where owner_id=p_player;
end $$;
revoke all on function oakchess_server.fishing_add_xp(uuid,integer)from public,anon,authenticated;

create function oakchess_server.fishing_catch_view(p_capture oakchess_server.fishing_catches)returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('uid',p_capture.id,'id',p_capture.pokemon_id,
 'name',(select data->'species'->p_capture.pokemon_id::text->>'name' from oakchess_server.game_rules where id),
 'level',p_capture.level,'genes',p_capture.genes,
 'ivs',jsonb_build_array(coalesce((p_capture.genes->'ivs'->>'hp')::integer,0),coalesce((p_capture.genes->'ivs'->>'atk')::integer,0),
 coalesce((p_capture.genes->'ivs'->>'def')::integer,0),coalesce((p_capture.genes->'ivs'->>'spa')::integer,0),
 coalesce((p_capture.genes->'ivs'->>'spd')::integer,0),coalesce((p_capture.genes->'ivs'->>'spe')::integer,0)),
 'potency',coalesce((p_capture.genes->>'potency')::integer,1),'shiny',coalesce((p_capture.genes->>'shiny')::boolean,false),
 'favorite',coalesce((p_capture.genes->>'favorite')::boolean,false),'locked',coalesce((p_capture.genes->>'locked')::boolean,false),
 'caughtAt',floor(extract(epoch from p_capture.caught_at)*1000),'time',to_char(p_capture.caught_at at time zone 'America/Sao_Paulo','HH24:MI'))
$$;
revoke all on function oakchess_server.fishing_catch_view(oakchess_server.fishing_catches)from public,anon,authenticated;

create function oakchess_server.fishing_view(p_player uuid)returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('online',true,'ownedRods',coalesce(f.rods,'{}'::integer[]),
 'fishingLevel',coalesce(f.level,1),'fishingXP',coalesce(f.xp,0),'lastXP',coalesce(f.last_xp,0),
 'totalCaught',coalesce(f.total_caught,0),'attempts',coalesce(f.attempts,0),'missed',coalesce(f.missed,0),
 'completedOrders',coalesce(f.completed,'{}'::text[]),
 'catches',coalesce((select jsonb_agg(oakchess_server.fishing_catch_view(c)order by c.caught_at desc,c.id)from oakchess_server.fishing_catches c where c.owner_id=p_player),'[]'),
 'activeCast',(select jsonb_build_object('id',c.id,'shoal',c.shoal,'technique',c.technique,'settings',c.payload,
 'started',floor(extract(epoch from c.started_at)*1000))from oakchess_server.fishing_casts c where c.owner_id=p_player and c.finished_at is null),
 'catalog',(select jsonb_object_agg(key,value)from oakchess_server.game_rules r,jsonb_each(r.data->'species')where r.id))
 from (select p_player as owner_id)u left join oakchess_server.fishing_profiles f using(owner_id)
$$;
revoke all on function oakchess_server.fishing_view(uuid)from public,anon,authenticated;
alter function oakchess_server.farm_view(uuid)rename to farm_view_properties;
create function oakchess_server.farm_view(p_player uuid)returns jsonb
language sql stable security definer set search_path='' as $$
 select oakchess_server.farm_view_properties(p_player)||jsonb_build_object('onlineFishing',true,'fishing',oakchess_server.fishing_view(p_player))
$$;
revoke all on function oakchess_server.farm_view_properties(uuid),oakchess_server.farm_view(uuid)from public,anon,authenticated;

-- Public controls are small, authenticated, account-locked and idempotent.
create function public.journey_fishing(p_request uuid,p_action text,p_payload jsonb default '{}')returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();f oakchess_server.fishing_profiles%rowtype;
 old oakchess_server.shop_operations%rowtype;c oakchess_server.fishing_catches%rowtype;
 receipt jsonb:='{}';i integer;cost integer;ids uuid[];chosen uuid[];amount bigint:=0;
 species integer;needed integer;reward integer;experience integer;entry jsonb;ivsum integer;price bigint;
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_action is null or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>16000 then raise exception 'Operação de pesca inválida.';end if;
 perform 1 from public.journeys where owner_id=player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'fishing:'||p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 insert into oakchess_server.fishing_profiles(owner_id)values(player)on conflict do nothing;
 select * into f from oakchess_server.fishing_profiles where owner_id=player for update;
 if p_action='rod'then
  if p_payload-array['index','method']<>'{}'::jsonb then raise exception 'Pedido inválido.';end if;
  i:=(p_payload->>'index')::integer;
  if i is null or i<0 or i>2 or i=any(f.rods)or f.level<(array[1,10,30])[i+1]then raise exception 'Vara indisponível.';end if;
  if p_payload->>'method'='quest'then
   if f.total_caught<(array[0,3,8])[i+1]then raise exception 'Complete a missão da vara.';end if;
  elsif p_payload->>'method'='buy'and i>0 then
   cost:=(array[0,1200,4500])[i+1];
   update public.journeys set gold=gold-cost where owner_id=player and gold>=cost;
   if not found then raise exception 'Coins insuficientes.';end if;
  else raise exception 'Opção inválida.';end if;
  update oakchess_server.fishing_profiles set rods=array_append(rods,i)where owner_id=player;
 elsif p_action='cancelFish'then
  if p_payload<>'{}'::jsonb then raise exception 'Pedido inválido.';end if;
  update oakchess_server.fishing_casts set finished_at=clock_timestamp(),result='{"cancelled":true}'where owner_id=player and finished_at is null;
 elsif p_action='fishFlag'then
  if p_payload-array['id','flag']<>'{}'::jsonb or coalesce(p_payload->>'flag','')not in('favorite','locked')then raise exception 'Pedido inválido.';end if;
  update oakchess_server.fishing_catches set genes=jsonb_set(genes,array[p_payload->>'flag'],to_jsonb(not coalesce((genes->>(p_payload->>'flag'))::boolean,false)))where id=(p_payload->>'id')::uuid and owner_id=player;
  if not found then raise exception 'Captura indisponível.';end if;
 elsif p_action='fishPC'then
  if p_payload-array['id']<>'{}'::jsonb then raise exception 'Pedido inválido.';end if;
  select * into c from oakchess_server.fishing_catches where id=(p_payload->>'id')::uuid and owner_id=player for update;
  if not found then raise exception 'Captura indisponível.';end if;
  if(select count(*)from public.inventory where owner_id=player)>=300 then raise exception 'PC cheio. Libere uma vaga no Centro.';end if;
  insert into public.inventory(id,owner_id,pokemon_id,level,stars,combat_data)values(c.id,player,c.pokemon_id,c.level,1,c.genes||jsonb_build_object('xp',0,'condition',1,'items','[]'::jsonb,'inDepot',false,'fromEconomyDepot',false));
  delete from oakchess_server.fishing_catches where id=c.id;
  receipt:=jsonb_build_object('inventoryId',c.id);
 elsif p_action='sellFish'then
  if p_payload-array['ids']<>'{}'::jsonb or jsonb_typeof(p_payload->'ids')is distinct from 'array' or jsonb_array_length(p_payload->'ids')not between 1 and 300 then raise exception 'Seleção inválida.';end if;
  select array_agg(value::uuid)into ids from jsonb_array_elements_text(p_payload->'ids');
  for c in select * from oakchess_server.fishing_catches where owner_id=player and id=any(ids)order by id for update loop
   if coalesce((c.genes->>'favorite')::boolean,false)or coalesce((c.genes->>'locked')::boolean,false)then continue;end if;
   select data->'species'->c.pokemon_id::text into entry from oakchess_server.game_rules where id;
   select coalesce(sum(value::integer),0)into ivsum from jsonb_each_text(c.genes->'ivs');
   price:=greatest(1,floor((5*coalesce((entry->>'cost')::integer,1)+c.level+3*(coalesce((entry->>'star')::integer,1)-1))*coalesce((c.genes->>'potency')::integer,1)+ivsum/31.0))::bigint*50;
   if coalesce((c.genes->>'shiny')::boolean,false)then price:=price*10;end if;
   amount:=amount+price;chosen:=array_append(chosen,c.id);
  end loop;
  delete from oakchess_server.fishing_catches where owner_id=player and id=any(chosen);
  update public.journeys set gold=gold+amount where owner_id=player;
  receipt:=jsonb_build_object('sale',jsonb_build_object('count',coalesce(cardinality(chosen),0),'gold',amount));
 elsif p_action='order'then
  if p_payload-array['id']<>'{}'::jsonb or coalesce(p_payload->>'id','')not in('magikarp','goldeen','poliwag')or (p_payload->>'id')=any(f.completed)then raise exception 'Pedido já entregue ou inválido.';end if;
  i:=array_position(array['magikarp','goldeen','poliwag'],p_payload->>'id');
  species:=(array[129,118,60])[i];needed:=(array[3,2,2])[i];reward:=(array[60,90,120])[i];experience:=(array[30,45,60])[i];
  select array_agg(id)into chosen from(select id from oakchess_server.fishing_catches where owner_id=player and pokemon_id=species and coalesce((genes->>'potency')::integer,1)<=2 and not coalesce((genes->>'favorite')::boolean,false)and not coalesce((genes->>'locked')::boolean,false)order by coalesce((genes->>'potency')::integer,1),caught_at,id limit needed for update)candidates;
  if coalesce(cardinality(chosen),0)<>needed then raise exception 'Faltam capturas livres P1 ou P2 no balde.';end if;
  delete from oakchess_server.fishing_catches where id=any(chosen);
  update public.journeys set gold=gold+reward where owner_id=player;
  update oakchess_server.fishing_profiles set completed=array_append(completed,p_payload->>'id')where owner_id=player;
  perform oakchess_server.fishing_add_xp(player,experience);
 else raise exception 'Operação de pesca inválida.';end if;
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'fishing:'||p_action,p_payload,receipt);
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_fishing(uuid,text,jsonb)from public,anon,authenticated;
grant execute on function public.journey_fishing(uuid,text,jsonb)to authenticated;

-- Only the Edge Function can choose an encounter or confirm its replay.
create function public.fishing_prepare(p_player uuid,p_request uuid,p_payload jsonb)returns jsonb
language plpgsql security definer set search_path='' as $$
declare f oakchess_server.fishing_profiles%rowtype;c oakchess_server.fishing_casts%rowtype;
 spot integer;rod integer;depth text;bait text;technique text;pool integer[];weighted integer[]:='{}';
 ids integer[]:=array[129,118,60,54,194,339,72,98,116,223,79,170,222,120,349,61,119,340,130,147,131];
 ranks integer[]:=array[1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,3,3,3,3];
 species integer;idx integer;r integer;weight integer;quantity integer:=1;shoal integer[]:='{}';roll double precision;
begin
 perform 1 from public.journeys where owner_id=p_player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 select * into c from oakchess_server.fishing_casts where owner_id=p_player and request_id=p_request;
 if found then
  if c.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return to_jsonb(c)||jsonb_build_object('wallElapsed',floor(extract(epoch from(clock_timestamp()-c.started_at))*1000));
 end if;
 if p_request is null or p_payload is null or jsonb_typeof(p_payload)<>'object' or p_payload-array['spot','rod','depth','bait','technique']<>'{}'::jsonb then raise exception 'Tentativa inválida.';end if;
 if exists(select 1 from oakchess_server.fishing_casts where owner_id=p_player and finished_at is null)then raise exception 'Conclua ou cancele a fisgada atual.';end if;
 insert into oakchess_server.fishing_profiles(owner_id)values(p_player)on conflict do nothing;
 select * into strict f from oakchess_server.fishing_profiles where owner_id=p_player for update;
 spot:=(p_payload->>'spot')::integer;rod:=(p_payload->>'rod')::integer;depth:=p_payload->>'depth';bait:=p_payload->>'bait';technique:=p_payload->>'technique';
 if spot is null or rod is null or spot not between 0 and 2 or rod not between 0 and 2 or not rod=any(f.rods)or f.level<(array[1,10,30])[spot+1]
 or coalesce(depth,'')not in('bank','channel','deep')or coalesce(bait,'')not in('basic','rare')or coalesce(technique,'')not in('float','precision')then raise exception 'Adquira a vara e alcance o nível deste local.';end if;
 if depth='channel'and(rod<1 or f.level<10)or depth='deep'and(rod<2 or f.level<30)then raise exception 'Este ponto exige outra vara.';end if;
 if(select count(*)from oakchess_server.fishing_catches where owner_id=p_player)>=300 then raise exception 'Balde cheio.';end if;
 pool:=case spot when 0 then array[129,118,60,54,79,119,130,147]when 1 then array[129,60,339,194,61,340,349,130]else array[129,72,98,116,120,222,170,223,131]end;
 foreach species in array pool loop
  idx:=array_position(ids,species);r:=ranks[idx];
  if f.level<(case when idx=1 then 1 else(idx-1)*10 end)or r>rod+1 or(depth='bank'and r<>1)or(depth='channel'and r>2)or(depth='deep'and r<2)then continue;end if;
  weight:=case r when 1 then case when bait='rare'then 8 else 14 end when 2 then case when bait='rare'then 9 else 6 end else case when bait='rare'then 5 else 2 end end;
  weighted:=weighted||array_fill(species,array[weight]);
 end loop;
 if cardinality(weighted)=0 then raise exception 'Nenhuma espécie liberada neste ponto.';end if;
 roll:=random();if f.level>=50 then quantity:=case when roll<.15 then 3 when roll<.6 then 2 else 1 end;elsif f.level>=20 and roll<.3 then quantity:=2;end if;
 quantity:=least(quantity,300-(select count(*)from oakchess_server.fishing_catches where owner_id=p_player));
 for idx in 1..quantity loop shoal:=array_append(shoal,weighted[1+floor(random()*cardinality(weighted))::integer]);end loop;
 insert into oakchess_server.fishing_casts(owner_id,request_id,payload,shoal,technique)values(p_player,p_request,p_payload,shoal,technique)returning * into c;
 update oakchess_server.fishing_profiles set attempts=attempts+1 where owner_id=p_player;
 return to_jsonb(c)||jsonb_build_object('wallElapsed',0);
end $$;
create function public.fishing_get(p_player uuid,p_cast uuid)returns jsonb
language sql security definer set search_path='' as $$
 select to_jsonb(c)||jsonb_build_object('wallElapsed',floor(extract(epoch from(clock_timestamp()-c.started_at))*1000))from oakchess_server.fishing_casts c where c.id=p_cast and c.owner_id=p_player
$$;
create function public.fishing_settle(p_player uuid,p_cast uuid,p_won boolean,p_captures jsonb)returns jsonb
language plpgsql security definer set search_path='' as $$
declare c oakchess_server.fishing_casts%rowtype;g jsonb;captured oakchess_server.fishing_catches%rowtype;
 captures jsonb:='[]';idx integer:=0;maxrank integer:=1;species integer;lv integer;trainer text;
begin
 perform 1 from public.journeys where owner_id=p_player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 select * into c from oakchess_server.fishing_casts where owner_id=p_player and id=p_cast for update;
 if not found then raise exception 'Tentativa não encontrada.';end if;
 if c.finished_at is not null then return jsonb_build_object('receipt',c.result,'state',oakchess_server.hunt_view(p_player));end if;
 if p_won is null or jsonb_typeof(p_captures)is distinct from 'array' or jsonb_array_length(p_captures)<>(case when p_won then cardinality(c.shoal)else 0 end)then raise exception 'Resultado inválido.';end if;
 select username into trainer from public.profiles where id=p_player;
 if p_won then
  foreach species in array c.shoal loop
   g:=p_captures->idx;lv:=(g->>'level')::integer;
   if(g->>'species')::integer is distinct from species or lv is null or lv<1 or jsonb_typeof(g->'genes')is distinct from 'object'then raise exception 'Captura inválida.';end if;
   insert into oakchess_server.fishing_catches(owner_id,cast_id,ordinal,pokemon_id,level,genes)
   values(p_player,c.id,idx,species,lv,(g->'genes')||jsonb_build_object('originalTrainerId',p_player,'originalTrainer',trainer,
    'originSource','fishing','originLevel',lv,'caughtAt',floor(extract(epoch from clock_timestamp())*1000),
    'captureDetails',jsonb_build_object('speciesId',species,'level',lv,'place','Pesca da Vila'),
    'favorite',coalesce((g->'genes'->>'shiny')::boolean,false),'locked',coalesce((g->'genes'->>'shiny')::boolean,false)))returning * into captured;
   captures:=captures||jsonb_build_array(oakchess_server.fishing_catch_view(captured));idx:=idx+1;
   maxrank:=greatest(maxrank,case when species in(130,147,340,131)then 3 when species in(79,119,61,349,120,222,170)then 2 else 1 end);
  end loop;
  update oakchess_server.fishing_profiles set total_caught=total_caught+cardinality(c.shoal)where owner_id=p_player;
 else update oakchess_server.fishing_profiles set missed=missed+1 where owner_id=p_player;end if;
 perform oakchess_server.fishing_add_xp(p_player,case when p_won then 40+maxrank*10 else 5 end);
 update oakchess_server.fishing_casts set finished_at=clock_timestamp(),result=jsonb_build_object('won',p_won,'captures',captures)where id=c.id returning * into c;
 return jsonb_build_object('receipt',c.result,'state',oakchess_server.hunt_view(p_player));
end $$;
revoke all on function public.fishing_prepare(uuid,uuid,jsonb),public.fishing_get(uuid,uuid),public.fishing_settle(uuid,uuid,boolean,jsonb)from public,anon,authenticated;
grant execute on function public.fishing_prepare(uuid,uuid,jsonb),public.fishing_get(uuid,uuid),public.fishing_settle(uuid,uuid,boolean,jsonb)to service_role;
notify pgrst,'reload schema';
commit;

