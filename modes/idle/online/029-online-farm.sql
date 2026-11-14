-- Phase 1: first property, residents and hunt training. Apply after 028.
-- No browser save, XP amount, house quality or reward is accepted from a player.
begin;
create table oakchess_server.farm_profiles(
 owner_id uuid primary key references public.journeys(owner_id) on delete cascade,
 met_fisher boolean not null default false,met_farmer boolean not null default false,
 starter_claimed boolean not null default false,active_house_id uuid,
 created_at timestamptz not null default now()
);
create table oakchess_server.farm_houses(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.journeys(owner_id) on delete cascade,
 tier integer not null default 0 check(tier between 0 and 4),
 name text not null default 'Sítio das Amoras' check(length(name) between 1 and 40),
 installed boolean not null default true,starter boolean not null default false,
 received_xp bigint not null default 0 check(received_xp>=0),created_at timestamptz not null default now(),
 unique(owner_id,id)
);
create unique index farm_one_starter on oakchess_server.farm_houses(owner_id)where starter;
create table oakchess_server.farm_residents(
 inventory_id uuid primary key references public.inventory(id),
 owner_id uuid not null references public.journeys(owner_id) on delete cascade,
 house_id uuid not null,slot integer not null check(slot between 0 and 1),
 carry numeric not null default 0 check(carry>=0 and carry<1),
 trained bigint not null default 0 check(trained>=0),
 foreign key(owner_id,house_id)references oakchess_server.farm_houses(owner_id,id),unique(house_id,slot)
);
alter table oakchess_server.farm_profiles enable row level security;
alter table oakchess_server.farm_houses enable row level security;
alter table oakchess_server.farm_residents enable row level security;
revoke all on oakchess_server.farm_profiles,oakchess_server.farm_houses,oakchess_server.farm_residents from public,anon,authenticated;

create function oakchess_server.farm_view(p_player uuid)returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',1,'onlineCore',true,
 'metFisher',coalesce(f.met_fisher,false),'metFarmer',coalesce(f.met_farmer,false),
 'questClaimed',coalesce(f.starter_claimed,false),'activeHouseId',f.active_house_id,
 'houses',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,
 'created',extract(epoch from h.created_at),'receivedXp',h.received_xp)order by h.created_at,h.id)
 from oakchess_server.farm_houses h where h.owner_id=p_player and h.installed),'[]'),
 'deeds',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'tier',h.tier,'name',h.name,
 'created',extract(epoch from h.created_at)))from oakchess_server.farm_houses h where h.owner_id=p_player and not h.installed),'[]'),
 'residents',coalesce((select jsonb_agg(jsonb_build_object('key',r.inventory_id,'houseId',r.house_id,
 'trainingCarry',r.carry,'trained',r.trained))from oakchess_server.farm_residents r where r.owner_id=p_player),'[]'))
 from(select p_player as owner_id)base left join oakchess_server.farm_profiles f on f.owner_id=base.owner_id
$$;
revoke all on function oakchess_server.farm_view(uuid)from public,anon,authenticated;

-- Extend the canonical snapshot rather than introducing an independent save.
create or replace function oakchess_server.hunt_view(p_player uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',1,'ownerId',j.owner_id,'username',p.username,
 'gold',j.gold,'trainerLevel',j.trainer_level,'trainerXp',j.trainer_xp,
 'profile',to_jsonb(h)-'owner_id','farm',oakchess_server.farm_view(p_player),
 'inventory',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'pokemon_id',i.pokemon_id,
 'level',i.level,'stars',i.stars,'is_listed',i.is_listed,'combat_data',i.combat_data)order by i.id)
 from public.inventory i where i.owner_id=p_player),'[]'),
 'activeHunt',(select id from oakchess_server.online_hunts where owner_id=p_player and finished_at is null))
 from public.journeys j join public.profiles p on p.id=j.owner_id
 join oakchess_server.hunt_profiles h on h.owner_id=j.owner_id where j.owner_id=p_player
$$;

-- Reservation is enforced underneath existing NPC, evolution, storage and market RPCs.
create function oakchess_server.farm_guard_inventory()returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from oakchess_server.farm_residents where inventory_id=old.id)then
  if tg_op='DELETE'then raise exception 'Retire o Pokémon da Fazenda antes desta operação.';end if;
  if new.owner_id<>old.owner_id or new.pokemon_id<>old.pokemon_id or new.stars<>old.stars
  or new.is_listed<>old.is_listed or new.level<>old.level
  or(new.combat_data-array['condition','favorite','locked'])is distinct from(old.combat_data-array['condition','favorite','locked'])then
   -- Only the private hunt-training trigger may change resident XP and level.
   if current_setting('oakchess.farm_training',true)is distinct from old.owner_id::text
   or new.owner_id<>old.owner_id or new.pokemon_id<>old.pokemon_id or new.stars<>old.stars or new.is_listed<>old.is_listed
   or(new.combat_data-'xp')is distinct from(old.combat_data-'xp')then
    raise exception 'Retire o Pokémon da Fazenda antes desta operação.';
   end if;
  end if;
 end if;
 if tg_op='DELETE'then return old;end if;return new;
end $$;
create trigger farm_inventory_reservation before update or delete on public.inventory
for each row execute function oakchess_server.farm_guard_inventory();

create function oakchess_server.farm_guard_formation()returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from oakchess_server.farm_residents r where r.owner_id=new.owner_id
 and(r.inventory_id=any(new.formation)or exists(select 1 from jsonb_array_elements(new.organization)s where s->>'id'=r.inventory_id::text)))
 then raise exception 'Um Pokémon da Fazenda não pode ocupar campo ou banco.';end if;
 return new;
end $$;
create trigger farm_formation_reservation before insert or update on oakchess_server.hunt_profiles
for each row execute function oakchess_server.farm_guard_formation();

create function oakchess_server.farm_guard_defense()returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from oakchess_server.farm_residents where inventory_id=any(new.inventory_ids))
 then raise exception 'Retire os moradores da Fazenda antes de usá-los na defesa da Arena.';end if;
 return new;
end $$;
create trigger farm_arena_reservation before insert or update on oakchess_server.arena_defenses
for each row execute function oakchess_server.farm_guard_defense();
revoke all on function oakchess_server.farm_guard_inventory(),oakchess_server.farm_guard_formation(),oakchess_server.farm_guard_defense()from public,anon,authenticated;

create function public.journey_farm(p_request uuid,p_action text,p_payload jsonb default '{}')returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid();f oakchess_server.farm_profiles%rowtype;h oakchess_server.farm_houses%rowtype;
 m public.inventory%rowtype;old oakchess_server.shop_operations%rowtype;created_house uuid;member_id uuid;free_slot integer;label text;
begin
 if player is null then raise exception 'Entre na sua conta.'using errcode='42501';end if;
 if p_request is null or p_action is null or p_payload is null or jsonb_typeof(p_payload)<>'object'
 or octet_length(p_payload::text)>1024 then raise exception 'Operação da Fazenda inválida.';end if;
 perform 1 from public.journeys where owner_id=player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 perform 1 from oakchess_server.hunt_profiles where owner_id=player for update;if not found then raise exception 'Carregue sua jornada.';end if;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'farm:'||p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('state',oakchess_server.hunt_view(player));
 end if;
 if p_action not in('meet','starter','selectHouse','rename','assign','return','pack','install')then
  raise exception 'Este serviço da Vila ainda está em preparação no beta online.';
 end if;
 insert into oakchess_server.farm_profiles(owner_id)values(player)on conflict do nothing;
 select * into f from oakchess_server.farm_profiles where owner_id=player for update;
 if p_action='meet'then
  if p_payload-array['who']<>'{}'or coalesce(p_payload->>'who','')not in('fisher','farmer')then raise exception 'Morador inválido.';end if;
  update oakchess_server.farm_profiles set met_fisher=met_fisher or p_payload->>'who'='fisher',
  met_farmer=met_farmer or p_payload->>'who'='farmer'where owner_id=player;
 elsif p_action='starter'then
  if p_payload<>'{}'or not f.met_fisher or not f.met_farmer or f.starter_claimed then raise exception 'Conheça os dois moradores. A primeira casa só pode ser recebida uma vez.';end if;
  insert into oakchess_server.farm_houses(owner_id,starter)values(player,true)returning id into created_house;
  update oakchess_server.farm_profiles set starter_claimed=true,active_house_id=created_house where owner_id=player;
 elsif p_action in('assign','return')then
  if p_payload-(case when p_action='assign'then array['key','id']else array['key']end)<>'{}'then raise exception 'Parceiro inválido.';end if;
  member_id:=(p_payload->>'key')::uuid;
  select * into m from public.inventory where owner_id=player and id=member_id for update;
  if not found or m.is_listed then raise exception 'Pokémon indisponível.';end if;
  -- Keep membership constant throughout a hunt so XP belongs to its original residents.
  if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)then raise exception 'Conclua o encontro antes de trocar moradores.';end if;
  if p_action='return'then
   delete from oakchess_server.farm_residents where inventory_id=member_id and owner_id=player;
   if not found then raise exception 'Morador não encontrado.';end if;
  else
   select * into h from oakchess_server.farm_houses where owner_id=player and id=(p_payload->>'id')::uuid and installed for update;
   if not found then raise exception 'Casa não encontrada.';end if;
   if coalesce((m.combat_data->>'inDepot')::boolean,false)
   or exists(select 1 from oakchess_server.hunt_profiles where owner_id=player and(member_id=any(formation)or exists(select 1 from jsonb_array_elements(organization)s where s->>'id'=member_id::text)))
   or exists(select 1 from oakchess_server.arena_defenses where player_id=player and member_id=any(inventory_ids))
   or exists(select 1 from oakchess_server.arena_offers where(player_id=player or opponent_id=player)and expires_at>clock_timestamp())
   or exists(select 1 from oakchess_server.arena_matches where(player_id=player or opponent_id=player)and finished_at is null)
   then raise exception 'Envie o Pokémon ao PC e retire-o da defesa da Arena antes de treinar.';end if;
   select candidates.n into free_slot from generate_series(0,case when h.tier=4 then 1 else 0 end)candidates(n)
   where not exists(select 1 from oakchess_server.farm_residents r where r.house_id=h.id and r.slot=candidates.n)order by candidates.n limit 1;
   if free_slot is null then raise exception 'Esta casa está cheia.';end if;
   insert into oakchess_server.farm_residents(inventory_id,owner_id,house_id,slot)values(member_id,player,h.id,free_slot);
  end if;
 else
  if p_payload-(case when p_action='rename'then array['id','name']else array['id']end)<>'{}'then raise exception 'Propriedade inválida.';end if;
  select * into h from oakchess_server.farm_houses where owner_id=player and id=(p_payload->>'id')::uuid for update;
  if not found then raise exception 'Casa não encontrada.';end if;
  if p_action='selectHouse'then
   if not h.installed then raise exception 'Instale esta casa primeiro.';end if;
   update oakchess_server.farm_profiles set active_house_id=h.id where owner_id=player;
  elsif p_action='rename'then
   label:=btrim(p_payload->>'name');if label is null or length(label)not between 1 and 40 or label~'[[:cntrl:]]'then raise exception 'Use um nome de 1 a 40 caracteres.';end if;
   update oakchess_server.farm_houses set name=label where id=h.id;
  elsif p_action='pack'then
   if not h.installed then raise exception 'Casa já guardada.';end if;
   if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)then raise exception 'Conclua o encontro antes de guardar a casa.';end if;
   delete from oakchess_server.farm_residents where house_id=h.id;
   update oakchess_server.farm_houses set installed=false where id=h.id;
   update oakchess_server.farm_profiles set active_house_id=(select id from oakchess_server.farm_houses where owner_id=player and installed order by created_at,id limit 1)where owner_id=player;
  elsif p_action='install'then
   if h.installed or(select count(*)from oakchess_server.farm_houses where owner_id=player and installed)>=4 then raise exception 'Casa indisponível ou limite de quatro casas atingido.';end if;
   update oakchess_server.farm_houses set installed=true where id=h.id;
   update oakchess_server.farm_profiles set active_house_id=h.id where owner_id=player;
  end if;
 end if;
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)
 values(player,p_request,'farm:'||p_action,p_payload,jsonb_build_object('text','Fazenda atualizada.'));
 return jsonb_build_object('state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_farm(uuid,text,jsonb)from public,anon,authenticated;
grant execute on function public.journey_farm(uuid,text,jsonb)to authenticated;

-- Runs inside hunt_finish's transaction; retries and capture updates cannot train twice.
create function oakchess_server.farm_train_hunt()returns trigger
language plpgsql security definer set search_path='' as $$
declare r record;m public.inventory%rowtype;progress jsonb;portion numeric;gain bigint;xp bigint;previous_setting text;
begin
 if old.finished_at is not null or new.finished_at is null or new.route like '%:gym'then return new;end if;
 xp:=coalesce((new.result->'rewards'->>'pokemonXp')::bigint,0);
 if xp<=0 then return new;end if;
 previous_setting:=current_setting('oakchess.farm_training',true);
 perform set_config('oakchess.farm_training',new.owner_id::text,true);
 for r in select residents.*,houses.tier from oakchess_server.farm_residents residents
 join oakchess_server.farm_houses houses on houses.id=residents.house_id and houses.installed
 where residents.owner_id=new.owner_id order by residents.inventory_id for update of residents loop
  select * into m from public.inventory where id=r.inventory_id and owner_id=new.owner_id and not is_listed for update;
  if not found then raise exception 'Morador da Fazenda indisponível.';end if;
  portion:=xp*(array[0.25,0.40,0.75,1.0,1.0]::numeric[])[r.tier+1]+r.carry;gain:=floor(portion)::bigint;
  progress:=oakchess_server.hunt_add_xp(m.level,coalesce((m.combat_data->>'xp')::bigint,0),gain);
  update public.inventory set level=(progress->>'level')::integer,combat_data=jsonb_set(combat_data,'{xp}',progress->'xp',true)where id=m.id;
  update oakchess_server.farm_residents set carry=portion-gain,trained=trained+gain where inventory_id=m.id;
  update oakchess_server.farm_houses set received_xp=received_xp+gain where id=r.house_id;
 end loop;
 perform set_config('oakchess.farm_training',coalesce(previous_setting,''),true);
 return new;
end $$;
create trigger farm_hunt_training after update of finished_at on oakchess_server.online_hunts
for each row execute function oakchess_server.farm_train_hunt();
revoke all on function oakchess_server.farm_train_hunt()from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
