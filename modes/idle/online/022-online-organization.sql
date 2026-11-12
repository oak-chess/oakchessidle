-- Placement is a player choice; identity, ownership and capacity remain server rules.
begin;
alter table oakchess_server.hunt_profiles add column organization jsonb not null default '[]';
create function public.journey_organization(p_request uuid,p_slots jsonb)returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();h oakchess_server.hunt_profiles%rowtype;old oakchess_server.shop_operations%rowtype;
 slot jsonb;member_id uuid;ids uuid[]:='{}';field_ids uuid[]:='{}';places text[]:='{}';place text;maximum integer;pos jsonb;receipt jsonb;
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or jsonb_typeof(p_slots) is distinct from 'array' or jsonb_array_length(p_slots)not between 1 and 15 then raise exception 'Organização inválida.';end if;
 select least(6,trainer_level+2)into maximum from public.journeys where owner_id=player for update;
 if not found then raise exception 'Jornada não encontrada.';end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'organization' or old.payload<>p_slots then raise exception 'Confirmação já utilizada.';end if;
  return oakchess_server.hunt_view(player);
 end if;
 if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)then raise exception 'Conclua o encontro antes de trocar a equipe.';end if;
 for slot in select value from jsonb_array_elements(p_slots)loop
  if jsonb_typeof(slot)is distinct from 'object' or slot-array['id','pos']<>'{}'then raise exception 'Posição inválida.';end if;
  member_id:=(slot->>'id')::uuid;pos:=slot->'pos';
  if member_id is null or member_id=any(ids)or jsonb_typeof(pos)is distinct from 'object'then raise exception 'Parceiro repetido ou posição inválida.';end if;
  perform 1 from public.inventory where owner_id=player and id=member_id and not is_listed for update;
  if not found then raise exception 'Use somente Pokémon próprios e disponíveis.';end if;
  if pos->>'z'='b' then
   if pos-array['z','r','c']<>'{}' or coalesce(pos->>'r','')!~'^[4-7]$' or coalesce(pos->>'c','')!~'^[0-6]$'then raise exception 'Casa de campo inválida.';end if;
   place:='b:'||(pos->>'r')||':'||(pos->>'c');field_ids:=array_append(field_ids,member_id);
  elsif pos->>'z'='n' then
   if pos-array['z','i']<>'{}'or coalesce(pos->>'i','')!~'^[0-8]$'then raise exception 'Vaga de banco inválida.';end if;
   place:='n:'||(pos->>'i');
  else raise exception 'Destino inválido.';end if;
  if place=any(places)then raise exception 'Dois Pokémon não podem ocupar a mesma casa.';end if;
  ids:=array_append(ids,member_id);places:=array_append(places,place);
 end loop;
 if cardinality(field_ids)not between 1 and maximum or cardinality(ids)-cardinality(field_ids)>9 then raise exception 'Limite de equipe excedido.';end if;
 update oakchess_server.hunt_profiles set organization=p_slots,formation=field_ids where owner_id=player;
 receipt:=jsonb_build_object('text','Equipe organizada.');
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'organization',p_slots,receipt);
 return oakchess_server.hunt_view(player);
end $$;
revoke all on function public.journey_organization(uuid,jsonb)from public,anon,authenticated;
grant execute on function public.journey_organization(uuid,jsonb)to authenticated;
-- Canonical positions in battle snapshots.
create or replace function public.hunt_prepare(p_player uuid,p_request uuid,p_route text,p_area integer,p_min integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare h oakchess_server.hunt_profiles%rowtype; j public.journeys%rowtype;
 encounter oakchess_server.online_hunts%rowtype; roster jsonb;
begin
 select * into j from public.journeys where owner_id=p_player for update;
 if not found then raise exception 'Jornada não encontrada.'; end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=p_player for update;
 if not found then raise exception 'Carregue a jornada antes de explorar.'; end if;
 select * into encounter from oakchess_server.online_hunts where owner_id=p_player
 and(request_id=p_request or finished_at is null) order by(request_id=p_request) desc limit 1;
 if found then return to_jsonb(encounter); end if;
 if p_area<0 or p_area>h.unlocked_area or j.trainer_level<p_min
 then raise exception 'Esta caçada ainda não foi liberada na sua jornada online.'; end if;
 if exists(select 1 from oakchess_server.online_hunts where owner_id=p_player and finished_at>now()-interval '2.5 seconds')
 then raise exception 'Aguarde o intervalo entre encontros.'; end if;
 perform 1 from public.inventory where id=any(h.formation) order by id for update;
 select jsonb_agg(jsonb_build_object('id',i.id,'pokemon_id',i.pokemon_id,'level',i.level,
 'stars',i.stars,'combat_data',i.combat_data) order by positions.n) into roster
 from unnest(h.formation)with ordinality positions(id,n)
 join public.inventory i on i.id=positions.id and i.owner_id=p_player and not i.is_listed;
 if jsonb_array_length(coalesce(roster,'[]'))<>cardinality(h.formation) or cardinality(h.formation) not between 1 and least(6,j.trainer_level+2)
 then raise exception 'Sua equipe não está disponível. Prepare a formação novamente.'; end if;
 if p_route like '%:gym' then
  if p_area<>h.unlocked_area or p_area=any(h.badges) then raise exception 'Este ginásio já foi concluído ou ainda não foi liberado.';end if;
  if coalesce((h.region_wins->>p_area::text)::integer,0)<(select (data->'regions'->p_area->>'need')::integer from oakchess_server.game_rules where id)
  then raise exception 'Vença os encontros exigidos antes de desafiar o ginásio.';end if;
 end if;
 if p_route not like '%:gym' and h.route<>p_route then update oakchess_server.hunt_profiles set route=p_route,wave=1,wave_wins=0 where owner_id=p_player; h.wave:=1; end if;
 insert into oakchess_server.online_hunts(owner_id,request_id,route,snapshot)
 values(p_player,p_request,p_route,jsonb_build_object('allies',roster,'wave',h.wave,'area',p_area,
 'vip',h.vip_until>now(),'supplies',h.supplies,'preferences',h.preferences,'organization',h.organization)) returning * into encounter;
 return to_jsonb(encounter);
end $$;

notify pgrst,'reload schema';
commit;
