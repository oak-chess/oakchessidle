begin;
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
 'vip',h.vip_until>now(),'supplies',h.supplies,'preferences',h.preferences)) returning * into encounter;
 return to_jsonb(encounter);
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
    if after_count<0 or after_count>before_count or current_count<before_count-after_count then raise exception 'Suprimentos insuficientes.'; end if;
    update oakchess_server.hunt_profiles set supplies=jsonb_set(supplies,array[key],to_jsonb(current_count-before_count+after_count)) where owner_id=p_player;
   end loop;
   update oakchess_server.online_hunts set plan=p_plan,
     ready_at=clock_timestamp()+make_interval(secs=>duration/1000.0)
   where id=p_hunt returning * into encounter;
 end if;
 return to_jsonb(encounter);
end $$;
create or replace function public.hunt_finish(p_player uuid,p_hunt uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare encounter oakchess_server.online_hunts%rowtype; j public.journeys%rowtype;
 rewards jsonb; progress jsonb; member jsonb; item public.inventory%rowtype; key text; amount integer;
begin
 select * into j from public.journeys where owner_id=p_player for update;
 select * into encounter from oakchess_server.online_hunts where id=p_hunt and owner_id=p_player for update;
 if not found or encounter.plan is null then raise exception 'Encontro não encontrado.'; end if;
 if encounter.finished_at is not null then return jsonb_build_object('result',encounter.result,'state',oakchess_server.hunt_view(p_player)); end if;
 if clock_timestamp()<encounter.ready_at then raise exception 'O combate ainda está em andamento.'; end if;
 rewards:=encounter.plan->'rewards';
 if encounter.route like '%:gym' then
  rewards:=jsonb_build_object('trainerXp',case when(encounter.plan->>'winner')::integer=0 then 10 else 0 end,'pokemonXp',0,
  'coins',case when(encounter.plan->>'winner')::integer=0 then 100+(encounter.snapshot->>'area')::integer*30 else 0 end,'loot','{}'::jsonb,'stones','{}'::jsonb,'defeated',rewards->'defeated');
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
create function public.hunt_cancel_unstarted(p_player uuid,p_hunt uuid)returns void language plpgsql security definer set search_path='' as $$
begin
perform 1 from public.journeys where owner_id=p_player for update;
delete from oakchess_server.online_hunts where owner_id=p_player and id=p_hunt and plan is null;
end $$;
revoke all on function public.hunt_cancel_unstarted(uuid,uuid)from public,anon,authenticated;
grant execute on function public.hunt_cancel_unstarted(uuid,uuid)to service_role;
notify pgrst,'reload schema';
commit;
