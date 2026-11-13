-- Server-authoritative auto-sale of newly earned common loot. Apply after 026.
begin;
update oakchess_server.hunt_profiles set preferences=jsonb_build_object('autoSellLoot',true)||preferences
where not(preferences ? 'autoSellLoot');
alter table oakchess_server.hunt_profiles alter column preferences set default '{"heal":true,"revive":true,"threshold":50,"healItem":"potions","reviveItem":"revives","afterDefeat":true,"autoAdvance":true,"captureEnabled":true,"captureBall":"poke","shinyBall":"ultra","autoSellLoot":true}'::jsonb;
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
  if p_payload-ARRAY['heal','revive','threshold','healItem','reviveItem','afterDefeat','autoAdvance','captureEnabled','captureBall','shinyBall','tutorial','bankLocked','duplicates','autoSellLoot']<>'{}'::jsonb then raise exception 'Preferência inválida.';end if;
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

create or replace function public.hunt_finish(p_player uuid,p_hunt uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare encounter oakchess_server.online_hunts%rowtype; j public.journeys%rowtype;
 rewards jsonb; progress jsonb; member jsonb; item public.inventory%rowtype; key text; amount integer; rules jsonb; sell_enabled boolean; unit_price bigint; loot_value bigint:=0; sold_value bigint:=0;
begin
 select * into j from public.journeys where owner_id=p_player for update;
 select * into encounter from oakchess_server.online_hunts where id=p_hunt and owner_id=p_player for update;
 if not found or encounter.plan is null then raise exception 'Encontro não encontrado.'; end if;
 if encounter.finished_at is not null then return jsonb_build_object('result',encounter.result,'state',oakchess_server.hunt_view(p_player)); end if;
 if clock_timestamp()<encounter.ready_at then raise exception 'O combate ainda está em andamento.'; end if;
 rewards:=encounter.plan->'rewards';
 select data into rules from oakchess_server.game_rules where id;
 select coalesce((preferences->>'autoSellLoot')::boolean,true)into sell_enabled
 from oakchess_server.hunt_profiles where owner_id=p_player for update;
 -- Values are read from the same server catalog used by manual sales.
 for key,amount in select k,v::integer from jsonb_each_text(coalesce(rewards->'loot','{}'))e(k,v)loop
  unit_price:=coalesce((rules->'loot'->key->>'price')::bigint,0);
  loot_value:=loot_value+amount::bigint*unit_price;
  if sell_enabled and key=any(array['fiber','ore','shell','essence','seed','powder','sand','fur','spirit','dragon','glitter','bulb','fireTail','spoon','wing','sting','feather','bone','bugGoo','venom','fireEssence','leaves','pollen','steel','snow','waterGem','beak','ratTail','redWing','snakeTail','electricTail','armadilloClaw','femaleEar','maleEar','foxTail','microphone','batWing','giantBatWing','flower','mushroom','antenna','medallion','wool','duckMug','bracelet','giantFur','plantTail','tentacle','strangeRock','horseFoot','slowTail','magnetPart','stick','dodrioFeather','sealTail','sludge','ghostTrace','onixTail','hypnosis','crabClaw','tongue','venomFlute','hornDrill','egg','vines','kangaEar','seahorseTail','fin','gemStar','mimic','scythe','electricAppendage','magmaFoot','pinsirHorn','bullTail','magikarpFin','gyaradosTail','bigFur','dragonTail']) and unit_price>0 then
   sold_value:=sold_value+amount::bigint*unit_price;
   rewards:=jsonb_set(rewards,'{loot}',(rewards->'loot')-key);
  end if;
 end loop;
 rewards:=rewards||jsonb_build_object('coins',(rewards->>'coins')::bigint+sold_value,'autoSoldLoot',sold_value,'lootValue',loot_value);
 if encounter.route like '%:gym' then
  rewards:=jsonb_build_object('trainerXp',case when(encounter.plan->>'winner')::integer=0 then 10 else 0 end,'pokemonXp',0,
  'autoSoldLoot',0,'lootValue',0,'coins',case when(encounter.plan->>'winner')::integer=0 then 100+(encounter.snapshot->>'area')::integer*30 else 0 end,'loot','{}'::jsonb,'stones','{}'::jsonb,'defeated',rewards->'defeated');
 end if;
 progress:=oakchess_server.hunt_add_xp(j.trainer_level,j.trainer_xp,(rewards->>'trainerXp')::bigint);
 update public.journeys set gold=gold+(rewards->>'coins')::bigint,
 trainer_level=(progress->>'level')::integer,trainer_xp=(progress->>'xp')::bigint where owner_id=p_player;
 for member in select value from jsonb_array_elements(encounter.plan->'allies') loop
   select * into item from public.inventory where id=(member->>'id')::uuid and owner_id=p_player for update;
   if not found or item.is_listed then raise exception 'Equipe alterada durante o encontro.'; end if;
   progress:=oakchess_server.hunt_add_xp(item.level,coalesce((item.combat_data->>'xp')::bigint,0),case when encounter.route like '%:gym' then case when(encounter.plan->>'winner')::integer=0 and(member->>'condition')::numeric>0 then 12 else 0 end else coalesce((member->>'xpGain')::bigint,0)end);
   update public.inventory set level=(progress->>'level')::integer,
   combat_data=coalesce(member->'combat_data',item.combat_data)||jsonb_build_object('locked',coalesce(item.combat_data->'locked','false'::jsonb),'favorite',coalesce(item.combat_data->'favorite','false'::jsonb))||jsonb_build_object('xp',(progress->>'xp')::bigint,
   'friendship',least(100,coalesce((item.combat_data->>'friendship')::integer,0)+case when(encounter.plan->>'winner')::integer=0 then 2 else 0 end),
   'condition',case when(progress->>'level')::integer>item.level then 1 else(member->>'condition')::numeric end)
   where id=item.id;
 end loop;
 for key,amount in select k,v::integer from jsonb_each_text(coalesce(rewards->'loot','{}')) e(k,v) loop
   update oakchess_server.hunt_profiles set loot=jsonb_set(loot,array[key],to_jsonb(coalesce((loot->>key)::integer,0)+amount),true) where owner_id=p_player;
 end loop;
 for key,amount in select k,v::integer from jsonb_each_text(coalesce(rewards->'stones','{}')) e(k,v) loop
   update oakchess_server.hunt_profiles set stones=jsonb_set(stones,array[key],to_jsonb(coalesce((stones->>key)::integer,0)+amount),true) where owner_id=p_player;
 end loop;
 if (encounter.plan->>'winner')::integer=0 then
   if encounter.route like '%:gym' then
    update oakchess_server.hunt_profiles set badges=array_append(badges,(encounter.snapshot->>'area')::integer),
    unlocked_area=least(39,unlocked_area+1),stones=jsonb_set(stones,array['water'],to_jsonb(coalesce((stones->>'water')::integer,0)+1),true)
    where owner_id=p_player and not((encounter.snapshot->>'area')::integer=any(badges));
   else
    update oakchess_server.hunt_profiles set total_wins=total_wins+1,region_wins=jsonb_set(region_wins,array[(encounter.snapshot->>'area')],to_jsonb(coalesce((region_wins->>(encounter.snapshot->>'area'))::integer,0)+1),true),wave_wins=least(3,wave_wins+1) where owner_id=p_player;
   end if;
   update oakchess_server.hunt_profiles set wave=least(10,wave+1),wave_wins=0 where owner_id=p_player and wave_wins>=3 and(preferences->>'autoAdvance')::boolean;
 end if;
 update oakchess_server.online_hunts set plan=jsonb_set(plan,'{frames}',jsonb_build_array(plan->'frames'->-1))-'units',finished_at=clock_timestamp(),result=jsonb_build_object(
 'winner',encounter.plan->'winner','rewards',rewards,'kind',case when encounter.route like '%:gym' then 'gym' else 'hunt' end) where id=p_hunt returning * into encounter;
 return jsonb_build_object('result',encounter.result,'state',oakchess_server.hunt_view(p_player));
end $$;

notify pgrst,'reload schema';
commit;
