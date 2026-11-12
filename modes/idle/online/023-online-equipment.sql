begin;
create function public.journey_equipment(p_request uuid,p_action text,p_payload jsonb)returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();h oakchess_server.hunt_profiles%rowtype;m public.inventory%rowtype;old oakchess_server.shop_operations%rowtype;
 bag jsonb;equipped jsonb;key text;idx integer;qty integer;receipt jsonb;label text;
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_action not in('equip','unequip','sell')or jsonb_typeof(p_payload)is distinct from 'object'then raise exception 'Equipamento inválido.';end if;
 perform 1 from public.journeys where owner_id=player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'equipment:'||p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)then raise exception 'Conclua o encontro antes de alterar equipamentos.';end if;
 bag:=h.gear;
 if p_action='sell' then
  if p_payload-array['key','quantity']<>'{}'or coalesce(p_payload->>'quantity','')!~'^[0-9]{1,4}$'then raise exception 'Quantidade inválida.';end if;
  qty:=(p_payload->>'quantity')::integer;key:=p_payload->>'key';
  if qty<1 or qty>(select count(*)from jsonb_array_elements_text(bag)v where v=key)then raise exception 'Estoque insuficiente.';end if;
  for idx in 1..qty loop bag:=bag-(select ordinality::integer-1 from jsonb_array_elements_text(bag)with ordinality v(value,ordinality)where value=key limit 1);end loop;
  update public.journeys set gold=gold+qty*5 where owner_id=player;
  label:='Equipamentos vendidos: '||qty||' · +'||(qty*5)||' Coins.';
 else
  if p_payload-array['inventoryId','key','slot']<>'{}'then raise exception 'Equipamento inválido.';end if;
  select * into m from public.inventory where owner_id=player and id=(p_payload->>'inventoryId')::uuid and not is_listed for update;
  if not found then raise exception 'Pokémon indisponível.';end if;
  equipped:=coalesce(m.combat_data->'items','[]');
  if p_action='equip' then
   key:=p_payload->>'key';
   select ordinality::integer-1 into idx from jsonb_array_elements_text(bag)with ordinality v(value,ordinality)where value=key limit 1;
   if idx is null then raise exception 'Você não possui esse equipamento.';end if;
   if jsonb_array_length(equipped)>=3 then raise exception 'Os três espaços já estão ocupados.';end if;
   bag:=bag-idx;equipped:=equipped||jsonb_build_array(key);label:='Equipamento aplicado.';
  else
   if coalesce(p_payload->>'slot','')!~'^[0-2]$'then raise exception 'Espaço inválido.';end if;
   idx:=(p_payload->>'slot')::integer;key:=equipped->>idx;
   if key is null then raise exception 'Espaço vazio.';end if;
   equipped:=equipped-idx;bag:=bag||jsonb_build_array(key);label:='Equipamento devolvido ao Pokéfone.';
  end if;
  update public.inventory set combat_data=jsonb_set(combat_data,'{items}',equipped,true)where id=m.id;
 end if;
 update oakchess_server.hunt_profiles set gear=bag where owner_id=player;
 receipt:=jsonb_build_object('text',label,'time',floor(extract(epoch from clock_timestamp())*1000));
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'equipment:'||p_action,p_payload,receipt);
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_equipment(uuid,text,jsonb)from public,anon,authenticated;
grant execute on function public.journey_equipment(uuid,text,jsonb)to authenticated;
notify pgrst,'reload schema';
commit;
