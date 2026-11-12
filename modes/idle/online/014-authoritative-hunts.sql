-- Online progression is independent of every browser save. Apply after 013.
begin;
create table oakchess_server.hunt_profiles(
 owner_id uuid primary key references public.journeys(owner_id) on delete cascade,
 formation uuid[] not null default '{}',
 unlocked_area integer not null default 0 check(unlocked_area between 0 and 39),
 wave integer not null default 1 check(wave between 1 and 10),
 wave_wins integer not null default 0,
 route text not null default '0:forest',
 vip_until timestamptz not null default now()+interval '3 days',
 supplies jsonb not null default '{"poke":25,"ultra":300,"potions":300,"revives":300}',
 loot jsonb not null default '{}',
 stones jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create table oakchess_server.online_hunts(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.journeys(owner_id),
 request_id uuid not null,
 route text not null,
 seed integer not null default floor(random()*2147483647)::integer,
 snapshot jsonb not null,
 plan jsonb,
 started_at timestamptz not null default now(),
 ready_at timestamptz,
 finished_at timestamptz,
 result jsonb,
 captures jsonb not null default '{}',
 unique(owner_id,request_id)
);
create unique index online_hunts_active on oakchess_server.online_hunts(owner_id) where finished_at is null;
alter table oakchess_server.hunt_profiles enable row level security;
alter table oakchess_server.online_hunts enable row level security;
revoke all on oakchess_server.hunt_profiles,oakchess_server.online_hunts from public,anon,authenticated;

create function oakchess_server.hunt_view(p_player uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',1,'ownerId',j.owner_id,'username',p.username,
 'gold',j.gold,'trainerLevel',j.trainer_level,'trainerXp',j.trainer_xp,
 'profile',to_jsonb(h)-'owner_id','inventory',coalesce((select jsonb_agg(jsonb_build_object(
 'id',i.id,'pokemon_id',i.pokemon_id,'level',i.level,'stars',i.stars,'is_listed',i.is_listed,'combat_data',i.combat_data) order by i.id)
 from public.inventory i where i.owner_id=p_player),'[]'::jsonb),
 'activeHunt',(select id from oakchess_server.online_hunts where owner_id=p_player and finished_at is null))
 from public.journeys j join public.profiles p on p.id=j.owner_id
 join oakchess_server.hunt_profiles h on h.owner_id=j.owner_id where j.owner_id=p_player
$$;
revoke all on function oakchess_server.hunt_view(uuid) from public,anon,authenticated;

create function public.hunt_state() returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); fresh boolean;
begin
 if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 perform 1 from public.journeys where owner_id=player for update;
 if not found then raise exception 'Conclua seu cadastro.'; end if;
 -- Fixed welcome items, once per account. Never consumes a browser payload.
 insert into oakchess_server.hunt_profiles(owner_id)values(player) on conflict do nothing;
 fresh:=found;
 if fresh then
   -- Existing online starters stay owned and keep their server IDs.
   insert into public.inventory(owner_id,pokemon_id,level,stars,combat_data)
   select player,species,1,1,jsonb_build_object('xp',0,'condition',1,'originSource','starter',
     'originalTrainerId',player,'originalTrainer',(select username from public.profiles where id=player),
     'caughtAt',floor(extract(epoch from now())*1000),'originLevel',1)
   from unnest(array[1,4,7])species
   where not exists(select 1 from public.inventory where owner_id=player and pokemon_id=species);
   update public.inventory set combat_data=combat_data||jsonb_build_object('originSource','starter',
     'originalTrainerId',player,'originalTrainer',(select username from public.profiles where id=player),
     'caughtAt',floor(extract(epoch from now())*1000),'originLevel',1)
   where owner_id=player and pokemon_id=1 and combat_data='{}'::jsonb;
   update oakchess_server.hunt_profiles set formation=(select array_agg(id order by pokemon_id)
     from public.inventory where owner_id=player and pokemon_id in (1,4,7) and not is_listed) where owner_id=player;
 end if;
 return oakchess_server.hunt_view(player);
end $$;

create function public.hunt_set_formation(p_ids uuid[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); available integer; max_count integer;
begin
 if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 select least(6,trainer_level+2) into max_count from public.journeys where owner_id=player for update;
 if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)
 then raise exception 'Conclua o encontro antes de trocar a equipe.'; end if;
 if cardinality(p_ids) not between 1 and max_count or cardinality(p_ids)<>(select count(distinct id) from unnest(p_ids)id)
 then raise exception 'Formação inválida.'; end if;
 perform 1 from public.inventory where id=any(p_ids) order by id for update;
 select count(*) into available from public.inventory where owner_id=player and not is_listed and id=any(p_ids);
 if available<>cardinality(p_ids) then raise exception 'Escolha apenas seus Pokémon disponíveis.'; end if;
 update oakchess_server.hunt_profiles set formation=p_ids where owner_id=player;
 return oakchess_server.hunt_view(player);
end $$;

-- Called only by the authenticated Edge service after validating the shared route catalog.
create function public.hunt_prepare(p_player uuid,p_request uuid,p_route text,p_area integer,p_min integer)
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
 if h.route<>p_route then update oakchess_server.hunt_profiles set route=p_route,wave=1,wave_wins=0 where owner_id=p_player; h.wave:=1; end if;
 insert into oakchess_server.online_hunts(owner_id,request_id,route,snapshot)
 values(p_player,p_request,p_route,jsonb_build_object('allies',roster,'wave',h.wave,'area',p_area,
 'vip',h.vip_until>now(),'supplies',h.supplies)) returning * into encounter;
 return to_jsonb(encounter);
end $$;

create function public.hunt_store_plan(p_player uuid,p_hunt uuid,p_plan jsonb) returns jsonb
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
   for key in select unnest(array['potions','revives']) loop
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

create function public.hunt_get(p_player uuid,p_hunt uuid) returns jsonb
language sql stable security definer set search_path='' as $$
select to_jsonb(h) from oakchess_server.online_hunts h where h.id=p_hunt and h.owner_id=p_player
$$;

create function oakchess_server.hunt_add_xp(p_level integer,p_xp bigint,p_gain bigint) returns jsonb
language plpgsql immutable set search_path='' as $$
declare required bigint;
begin
 if p_gain<0 or p_gain>100000000 then raise exception 'XP inválida.'; end if;
 p_xp:=p_xp+p_gain;
 loop
 required:=50*(p_level::bigint*p_level-3*p_level+4);
 exit when p_xp<required or p_level>=100000;
 p_xp:=p_xp-required; p_level:=p_level+1;
 end loop;
 return jsonb_build_object('level',p_level,'xp',p_xp);
end $$;
revoke all on function oakchess_server.hunt_add_xp(integer,bigint,bigint) from public,anon,authenticated;

create function public.hunt_finish(p_player uuid,p_hunt uuid) returns jsonb
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
 progress:=oakchess_server.hunt_add_xp(j.trainer_level,j.trainer_xp,(rewards->>'trainerXp')::bigint);
 update public.journeys set gold=gold+(rewards->>'coins')::bigint,
 trainer_level=(progress->>'level')::integer,trainer_xp=(progress->>'xp')::bigint where owner_id=p_player;
 for member in select value from jsonb_array_elements(encounter.plan->'allies') loop
   select * into item from public.inventory where id=(member->>'id')::uuid and owner_id=p_player for update;
   if not found or item.is_listed then raise exception 'Equipe alterada durante o encontro.'; end if;
   progress:=oakchess_server.hunt_add_xp(item.level,coalesce((item.combat_data->>'xp')::bigint,0),coalesce((member->>'xpGain')::bigint,0));
   update public.inventory set level=(progress->>'level')::integer,
   combat_data=coalesce(member->'combat_data',item.combat_data)||jsonb_build_object('xp',(progress->>'xp')::bigint,
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
   update oakchess_server.hunt_profiles set wave_wins=wave_wins+1 where owner_id=p_player;
   update oakchess_server.hunt_profiles set wave=least(10,wave+1),wave_wins=0 where owner_id=p_player and wave_wins>=3;
 end if;
 update oakchess_server.online_hunts set finished_at=clock_timestamp(),result=jsonb_build_object(
 'winner',encounter.plan->'winner','rewards',rewards) where id=p_hunt returning * into encounter;
 return jsonb_build_object('result',encounter.result,'state',oakchess_server.hunt_view(p_player));
end $$;

create function public.hunt_capture(p_player uuid,p_hunt uuid,p_index integer,p_ball text,p_chance numeric) returns jsonb
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
   'originSource','hunt','originLevel',(enemy->>'level')::integer,'originRoute',encounter.route,'originWave',encounter.snapshot->'wave',
   'ball',p_ball,'captureChance',p_chance);
   insert into public.inventory(owner_id,pokemon_id,level,stars,combat_data)
   values(p_player,(enemy->>'pokemon_id')::integer,(enemy->>'level')::integer,1,genes) returning id into identity;
 end if;
 receipt:=jsonb_build_object('caught',caught,'id',identity,'speciesId',enemy->'pokemon_id','ball',p_ball);
 update oakchess_server.online_hunts set captures=jsonb_set(captures,array[p_index::text],receipt,true) where id=p_hunt;
 return jsonb_build_object('capture',receipt,'state',oakchess_server.hunt_view(p_player));
end $$;

revoke all on function public.hunt_state(),public.hunt_set_formation(uuid[]),
 public.hunt_prepare(uuid,uuid,text,integer,integer),public.hunt_store_plan(uuid,uuid,jsonb),public.hunt_finish(uuid,uuid),public.hunt_capture(uuid,uuid,integer,text,numeric),public.hunt_get(uuid,uuid)
 from public,anon,authenticated;
grant execute on function public.hunt_state(),public.hunt_set_formation(uuid[]) to authenticated;
grant execute on function public.hunt_prepare(uuid,uuid,text,integer,integer),public.hunt_store_plan(uuid,uuid,jsonb),public.hunt_finish(uuid,uuid),public.hunt_capture(uuid,uuid,integer,text,numeric),public.hunt_get(uuid,uuid) to service_role;
notify pgrst,'reload schema';
commit;
