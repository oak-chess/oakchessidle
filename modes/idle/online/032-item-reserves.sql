begin;

create or replace function public.journey_shop(p_request uuid,p_action text,p_payload jsonb)returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();old oakchess_server.shop_operations%rowtype;h oakchess_server.hunt_profiles%rowtype;
 m public.inventory%rowtype;rules jsonb;meta jsonb;ids uuid[];member_id uuid;key text;receipt jsonb;amount bigint:=0;price bigint;
 iv_total integer;count_members integer:=0;returned_gear jsonb;label text;prefs jsonb;
begin
 if p_action not in('flags','preferences','sell_pokemon')then return public.journey_shop_base(p_request,p_action,p_payload);end if;
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>16384 then raise exception 'Operação inválida.';end if;
 perform 1 from public.journeys where owner_id=player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 select data into rules from oakchess_server.game_rules where id;
 if p_action='preferences' then
  if p_payload-ARRAY['heal','revive','threshold','healItem','reviveItem','afterDefeat','autoAdvance','captureEnabled','captureBall','shinyBall','tutorial','bankLocked','duplicates','autoSellLoot','itemReserves']<>'{}'::jsonb then raise exception 'Preferência inválida.';end if;
  if p_payload ? 'tutorial' then
   if jsonb_typeof(p_payload->'tutorial')<>'object' or octet_length((p_payload->'tutorial')::text)>4096
   or (p_payload->'tutorial')-array['index','tip','visited','introduced','complete','contentVersion','version','mode','skipped']<>'{}'::jsonb then raise exception 'Guia inválido.';end if;
   for key in select unnest(array['introduced','complete','skipped'])loop
    if (p_payload->'tutorial')?key and jsonb_typeof(p_payload->'tutorial'->key)<>'boolean'then raise exception 'Guia inválido.';end if;
   end loop;
   for key in select unnest(array['index','tip'])loop
    if (p_payload->'tutorial')?key and (coalesce(p_payload->'tutorial'->>key,'')!~'^[0-9]{1,3}$')then raise exception 'Guia inválido.';end if;
   end loop;
  end if;
  if p_payload ? 'itemReserves' then
   if jsonb_typeof(p_payload->'itemReserves') <> 'object' then raise exception 'Reserva inválida.'; end if;
   if exists(select 1 from jsonb_each(p_payload->'itemReserves') as reserve(item, quantity)
     where item not in('poke','great','ultra','net','repeat','potions','superPotions','hyperPotions','maxPotions','fullRestores','revives','maxRevives') or jsonb_typeof(quantity) <> 'number'
     or quantity::text !~ '^(0|[1-9][0-9]{0,5})$') then raise exception 'Reserva inválida.'; end if;
  end if;
  prefs:=jsonb_build_object('bankLocked',false,'duplicates','keep','autoSellLoot',true)||h.preferences||p_payload;
  if prefs->>'duplicates' not in('keep','pc','weak-candies','candies')then raise exception 'Destino de captura inválido.';end if;
  for key in select unnest(array['heal','revive','afterDefeat','autoAdvance','captureEnabled','bankLocked','autoSellLoot'])loop
   if jsonb_typeof(prefs->key)<>'boolean'then raise exception 'Opção inválida.';end if;
  end loop;
  if coalesce(prefs->>'threshold','')!~'^[0-9]{1,3}$'or(prefs->>'threshold')::integer not between 1 and 100
  or coalesce(prefs->>'healItem','') not in('potions','superPotions','hyperPotions','maxPotions','fullRestores')
  or coalesce(prefs->>'reviveItem','')not in('revives','maxRevives')or coalesce(prefs->>'captureBall','')not in('poke','great','ultra','net','repeat')or coalesce(prefs->>'shinyBall','')not in('poke','great','ultra','net','repeat')then raise exception 'Configuração de cura inválida.';end if;
  update oakchess_server.hunt_profiles set preferences=prefs where owner_id=player;
  label:='Automações atualizadas.';
 elsif p_action='flags' then
  if p_payload-ARRAY['inventoryId','key','value']<>'{}'::jsonb or p_payload->>'key'not in('favorite','locked')or jsonb_typeof(p_payload->'value')<>'boolean'then raise exception 'Proteção inválida.';end if;
  select * into m from public.inventory where owner_id=player and id=(p_payload->>'inventoryId')::uuid for update;
  if not found or m.is_listed then raise exception 'Pokémon indisponível.';end if;
  update public.inventory set combat_data=jsonb_set(combat_data,array[p_payload->>'key'],p_payload->'value',true)where id=m.id;
  label:='Proteção atualizada.';
 else
  if p_payload-ARRAY['ids']<>'{}'::jsonb or jsonb_typeof(p_payload->'ids')<>'array' or jsonb_array_length(p_payload->'ids')not between 1 and 300 then raise exception 'Seleção inválida.';end if;
  select array_agg(value::uuid order by value::uuid)into ids from jsonb_array_elements_text(p_payload->'ids');
  if cardinality(ids)<>(select count(distinct id)from unnest(ids)id)then raise exception 'Seleção repetida.';end if;
  returned_gear:=h.gear;
  foreach member_id in array ids loop
   select * into m from public.inventory where owner_id=player and id=member_id for update;
   if not found or m.is_listed or member_id=any(h.formation)or coalesce((m.combat_data->>'locked')::boolean,false)or coalesce((m.combat_data->>'favorite')::boolean,false)
   then raise exception 'Um Pokémon está protegido, em campo ou indisponível.';end if;
   if (rules->'births'->m.pokemon_id::text->>'legendary')::boolean or m.combat_data->>'captureSource'='mystic' then raise exception 'Lendários e míticos não podem ser vendidos na loja comum.';end if;
   meta:=rules->'species'->m.pokemon_id::text;if meta is null then raise exception 'Espécie indisponível.';end if;
   select coalesce(sum(value::integer),0)into iv_total from jsonb_each_text(coalesce(m.combat_data->'ivs','{}'));
   price:=greatest(1,floor((5*(meta->>'cost')::integer+m.level+3*((meta->>'star')::integer-1))*coalesce((m.combat_data->>'potency')::numeric,1)+iv_total/31.0))::bigint*50;
   if coalesce((m.combat_data->>'shiny')::boolean,false)then price:=price*10;end if;
   amount:=amount+price;count_members:=count_members+1;returned_gear:=returned_gear||coalesce(m.combat_data->'items','[]');
  end loop;
  -- Entire selection is checked before deleting any row; errors roll back every change.
  delete from public.inventory where owner_id=player and id=any(ids);
  update public.journeys set gold=gold+amount where owner_id=player;
  update oakchess_server.hunt_profiles set gear=returned_gear where owner_id=player;
  label:='Vendeu '||count_members||' Pokémon por '||amount||' ouro. Equipamentos devolvidos ao Pokéfone.';
 end if;
 receipt:=jsonb_build_object('text',label,'amount',amount,'type',case when p_action='sell_pokemon'then 'sell'else 'other'end,'time',floor(extract(epoch from clock_timestamp())*1000));
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,p_action,p_payload,receipt);
 if p_action='sell_pokemon'then update oakchess_server.hunt_profiles set shop_history=(select jsonb_agg(value)from(select value from jsonb_array_elements(jsonb_build_array(receipt)||shop_history)limit 30)recent)where owner_id=player;end if;
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;

create or replace function public.hunt_capture_destination(p_player uuid,p_hunt uuid,p_index integer,p_ball text,p_chance numeric,p_economy boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare encounter oakchess_server.online_hunts%rowtype; h oakchess_server.hunt_profiles%rowtype;
 enemy jsonb; caught boolean; identity uuid; receipt jsonb; stock integer; genes jsonb; destination text; bench_slot integer; already_owned boolean;
begin
 perform 1 from public.journeys where owner_id=p_player for update;
 select * into encounter from oakchess_server.online_hunts where id=p_hunt and owner_id=p_player for update;
 if not found or encounter.finished_at is null then raise exception 'Conclua o encontro primeiro.'; end if;
 -- The same defeated target can consume only one ball, even from concurrent tabs.
 if encounter.captures ? p_index::text then return jsonb_build_object('capture',encounter.captures->p_index::text,'state',oakchess_server.hunt_view(p_player)); end if;
 if clock_timestamp()>encounter.finished_at+interval '15 seconds' then raise exception 'O prazo de captura terminou.'; end if;
 enemy:=encounter.plan->'enemies'->p_index;
 if p_index<0 or enemy is null or p_chance not between 0 and 1
 or ((encounter.plan->'frames'->-1->'u'->(jsonb_array_length(encounter.snapshot->'allies')+p_index))->>3)::integer<>0
 then raise exception 'Alvo de captura inválido.'; end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=p_player for update;
 stock:=coalesce((h.supplies->>p_ball)::integer,0);
 if stock<=coalesce((h.preferences->'itemReserves'->>p_ball)::integer,0) then raise exception 'Poké Bolas indisponíveis acima da reserva.'; end if;
 update oakchess_server.hunt_profiles set supplies=jsonb_set(supplies,array[p_ball],to_jsonb(stock-1)) where owner_id=p_player;
 caught:=random()<p_chance;
 if caught then
  destination:=case when p_economy then 'depot' else 'pc' end;
  select exists(select 1 from public.inventory where owner_id=p_player and pokemon_id=(enemy->>'pokemon_id')::integer)into already_owned;
  if not p_economy and not coalesce((h.preferences->>'bankLocked')::boolean,false)
   and not(coalesce(h.preferences->>'duplicates','keep')='pc' and already_owned)then
   select n into bench_slot from generate_series(0,8)n where not exists(
    select 1 from jsonb_array_elements(h.organization)slot where slot->'pos'->>'z'='n' and (slot->'pos'->>'i')::integer=n)order by n limit 1;
   if bench_slot is not null then destination:='bench';end if;
  end if;
   genes:=(enemy->'combat_data')||jsonb_build_object('xp',0,'condition',1,'originalTrainerId',p_player,
   'originalTrainer',(select username from public.profiles where id=p_player),'caughtAt',floor(extract(epoch from now())*1000),
   'inDepot',destination='depot','fromEconomyDepot',p_economy,'originSource','hunt','originLevel',(enemy->>'level')::integer,'originRoute',encounter.route,'originWave',encounter.snapshot->'wave',
   'ball',p_ball,'captureChance',p_chance);
   insert into public.inventory(owner_id,pokemon_id,level,stars,combat_data)
   values(p_player,(enemy->>'pokemon_id')::integer,(enemy->>'level')::integer,1,genes) returning id into identity;
  if destination='bench' then
   update oakchess_server.hunt_profiles set organization=organization||jsonb_build_array(jsonb_build_object('id',identity,'pos',jsonb_build_object('z','n','i',bench_slot)))where owner_id=p_player;
  end if;
 end if;
 receipt:=jsonb_build_object('caught',caught,'destination',destination,'id',identity,'speciesId',enemy->'pokemon_id','ball',p_ball);
 update oakchess_server.online_hunts set captures=jsonb_set(captures,array[p_index::text],receipt,true) where id=p_hunt;
 return jsonb_build_object('capture',receipt,'state',oakchess_server.hunt_view(p_player));
end $$;

create or replace function public.hunt_store_plan(p_player uuid,p_hunt uuid,p_plan jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare encounter oakchess_server.online_hunts%rowtype; duration integer; key text; before_count integer; after_count integer; current_count integer;
begin
 perform 1 from public.journeys where owner_id=p_player for update;
 select * into encounter from oakchess_server.online_hunts where id=p_hunt and owner_id=p_player for update;
 if not found then raise exception 'Encontro não encontrado.'; end if;
 if encounter.plan is null then
   duration:=(p_plan->>'elapsedMs')::integer;
   if duration not between 1 and 82000 or jsonb_typeof(p_plan->'rewards')<>'object'
   then raise exception 'Plano de combate inválido.'; end if;
   -- Debit only recovery items, exactly once. Never replace the whole inventory:
   -- captures from the previous encounter may still consume balls concurrently.
   for key in select unnest(array['potions','superPotions','hyperPotions','maxPotions','fullRestores','revives','maxRevives']) loop
    before_count:=coalesce((encounter.snapshot->'supplies'->>key)::integer,0);
    after_count:=coalesce((p_plan->'supplies'->>key)::integer,0);
    select coalesce((supplies->>key)::integer,0) into current_count from oakchess_server.hunt_profiles where owner_id=p_player for update;
    if after_count<0 or after_count>before_count or (before_count>after_count and current_count-(before_count-after_count)<coalesce((select (preferences->'itemReserves'->>key)::integer from oakchess_server.hunt_profiles where owner_id=p_player),0)) then raise exception 'Suprimentos insuficientes.'; end if;
    update oakchess_server.hunt_profiles set supplies=jsonb_set(supplies,array[key],to_jsonb(current_count-before_count+after_count)) where owner_id=p_player;
   end loop;
   update oakchess_server.online_hunts set plan=p_plan,
     ready_at=clock_timestamp()+make_interval(secs=>duration/1000.0)
   where id=p_hunt returning * into encounter;
 end if;
 return to_jsonb(encounter);
end $$;

notify pgrst,'reload schema';
commit;
