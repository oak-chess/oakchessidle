begin;
create function public.journey_storage(p_request uuid,p_inventory uuid,p_depot boolean)returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();m public.inventory%rowtype;h oakchess_server.hunt_profiles%rowtype;old oakchess_server.shop_operations%rowtype;payload jsonb;
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_inventory is null or p_depot is null then raise exception 'Destino inválido.';end if;
 perform 1 from public.journeys where owner_id=player for update;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 payload:=jsonb_build_object('inventoryId',p_inventory,'depot',p_depot);
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'storage'or old.payload<>payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('state',oakchess_server.hunt_view(player));
 end if;
 select * into m from public.inventory where owner_id=player and id=p_inventory and not is_listed for update;
 if not found or p_inventory=any(h.formation) or exists(select 1 from jsonb_array_elements(h.organization)slot where slot->>'id'=p_inventory::text)then raise exception 'Retire o Pokémon da equipe antes de mudar o armazenamento.';end if;
 update public.inventory set combat_data=combat_data||jsonb_build_object('inDepot',p_depot,'fromEconomyDepot',true)where id=m.id;
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'storage',payload,'{}');
 return jsonb_build_object('state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_storage(uuid,uuid,boolean)from public,anon,authenticated;
grant execute on function public.journey_storage(uuid,uuid,boolean)to authenticated;
-- Captures enter the account depot.
create or replace function public.hunt_capture(p_player uuid,p_hunt uuid,p_index integer,p_ball text,p_chance numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare encounter oakchess_server.online_hunts%rowtype; h oakchess_server.hunt_profiles%rowtype;
 enemy jsonb; caught boolean; identity uuid; receipt jsonb; stock integer; genes jsonb;
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
 if stock<1 then raise exception 'Você não tem essa Poké Bola.'; end if;
 update oakchess_server.hunt_profiles set supplies=jsonb_set(supplies,array[p_ball],to_jsonb(stock-1)) where owner_id=p_player;
 caught:=random()<p_chance;
 if caught then
   genes:=(enemy->'combat_data')||jsonb_build_object('xp',0,'condition',1,'originalTrainerId',p_player,
   'originalTrainer',(select username from public.profiles where id=p_player),'caughtAt',floor(extract(epoch from now())*1000),
   'inDepot',true,'fromEconomyDepot',true,'originSource','hunt','originLevel',(enemy->>'level')::integer,'originRoute',encounter.route,'originWave',encounter.snapshot->'wave',
   'ball',p_ball,'captureChance',p_chance);
   insert into public.inventory(owner_id,pokemon_id,level,stars,combat_data)
   values(p_player,(enemy->>'pokemon_id')::integer,(enemy->>'level')::integer,1,genes) returning id into identity;
 end if;
 receipt:=jsonb_build_object('caught',caught,'id',identity,'speciesId',enemy->'pokemon_id','ball',p_ball);
 update oakchess_server.online_hunts set captures=jsonb_set(captures,array[p_index::text],receipt,true) where id=p_hunt;
 return jsonb_build_object('capture',receipt,'state',oakchess_server.hunt_view(p_player));
end $$;


notify pgrst,'reload schema';
commit;
