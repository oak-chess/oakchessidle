-- UI guide progress only; never accepts rewards or player levels.
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
  if p_payload-ARRAY['heal','revive','threshold','healItem','reviveItem','afterDefeat','autoAdvance','captureEnabled','captureBall','shinyBall','tutorial']<>'{}'::jsonb then raise exception 'Preferência inválida.';end if;
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
  prefs:=h.preferences||p_payload;
  for key in select unnest(array['heal','revive','afterDefeat','autoAdvance','captureEnabled'])loop
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

notify pgrst,'reload schema';
commit;
