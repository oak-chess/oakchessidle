begin;
create function public.journey_evolution_source(p_player uuid,p_inventory uuid)returns jsonb
language sql stable security definer set search_path='' as $$
select to_jsonb(i)from public.inventory i where i.owner_id=p_player and i.id=p_inventory
$$;

create function oakchess_server.seed_hash(p_text text)returns bigint language plpgsql immutable set search_path='' as $$
declare result bigint:=2166136261;n integer;
begin for n in 1..length(p_text)loop result:=((result # ascii(substr(p_text,n,1)))*16777619)%4294967296;end loop;return result;end $$;
revoke all on function oakchess_server.seed_hash(text)from public,anon,authenticated;

-- Only the Edge computes the rating floor and checks nature-dependent branches.
create function public.journey_evolve(p_player uuid,p_request uuid,p_inventory uuid,p_from integer,p_target integer,p_floor numeric)returns jsonb
language plpgsql security definer set search_path='' as $$
declare m public.inventory%rowtype;h oakchess_server.hunt_profiles%rowtype;old oakchess_server.shop_operations%rowtype;
 rules jsonb;spec jsonb;target jsonb;payload jsonb;receipt jsonb;key text;need integer;party integer;gender text;rate integer;
begin
 perform 1 from public.journeys where owner_id=p_player for update;if not found then raise exception 'Jornada não encontrada.';end if;
 payload:=jsonb_build_object('inventoryId',p_inventory,'target',p_target);
 select * into old from oakchess_server.shop_operations where owner_id=p_player and request_id=p_request;
 if found then
  if old.action<>'evolve' or old.payload<>payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(p_player));
 end if;
 if p_request is null or p_floor is null or p_floor<0 or p_floor>10 then raise exception 'Evolução inválida.';end if;
 if exists(select 1 from oakchess_server.online_hunts where owner_id=p_player and finished_at is null)
 then raise exception 'Conclua o encontro antes de evoluir.';end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=p_player for update;
 select * into m from public.inventory where owner_id=p_player and id=p_inventory for update;
 if not found or m.is_listed or m.pokemon_id<>p_from then raise exception 'Pokémon indisponível para evolução.';end if;
 select data into rules from oakchess_server.game_rules where id;
 if not coalesce((rules->'edges'->p_from::text)@>jsonb_build_array(p_target),false)then raise exception 'Evolução não pertence à espécie.';end if;
 spec:=rules->'evolutions'->p_target::text;target:=rules->'species'->p_target::text;
 if spec is null or target is null or coalesce((spec->>'bonus')::boolean,false) then raise exception 'Evolução indisponível.';end if;
 if m.level<coalesce((spec->>'level')::integer,0)then raise exception 'Nível insuficiente para evoluir.';end if;
 if coalesce((m.combat_data->>'friendship')::integer,0)<coalesce((spec->>'friendship')::integer,0)then raise exception 'Amizade insuficiente para evoluir.';end if;
 if coalesce((spec->>'day')::boolean,false) and extract(hour from clock_timestamp() at time zone 'America/Sao_Paulo')not between 6 and 17
 or coalesce((spec->>'night')::boolean,false) and extract(hour from clock_timestamp() at time zone 'America/Sao_Paulo')between 6 and 17
 then raise exception 'Aguarde o horário de evolução.';end if;
 if spec ? 'gender' then
  rate:=(rules->'births'->p_from::text->>'genderRate')::integer;
  gender:=case when rate is null or rate<0 then 'Sem gênero' when oakchess_server.seed_hash(coalesce(m.combat_data->>'geneSeed',m.id::text)||':gender')%8<rate then 'Fêmea' else 'Macho' end;
  if gender<>spec->>'gender' then raise exception 'Gênero incompatível com a evolução.';end if;
 end if;
 party:=coalesce((spec->>'party')::integer,(spec->>'tradePartner')::integer);
 if party is not null and not exists(select 1 from public.inventory where owner_id=p_player and pokemon_id=party and not is_listed)
 then raise exception 'O parceiro exigido precisa estar disponível na sua coleção.';end if;
 if spec ? 'item' then
  key:=spec->>'item';need:=coalesce((h.stones->>key)::integer,0);
  if need<1 then raise exception 'Pedra de evolução insuficiente.';end if;
  update oakchess_server.hunt_profiles set stones=jsonb_set(stones,array[key],to_jsonb(need-1))where owner_id=p_player;
 end if;
 update public.inventory set pokemon_id=p_target,stars=least(3,(target->>'star')::integer),combat_data=combat_data||jsonb_build_object(
 'evolutionRatingFloor',greatest(p_floor,coalesce((combat_data->>'evolutionRatingFloor')::numeric,0)),
 'evolvedAt',floor(extract(epoch from clock_timestamp())*1000))where id=m.id;
 -- Nincada's bonus is server-created once, with identical inherited genes and one real Poké Ball.
 if p_from=290 and p_target=291 and coalesce((h.supplies->>'poke')::integer,0)>0 and (select count(*)from public.inventory where owner_id=p_player)<300 then
  update oakchess_server.hunt_profiles set supplies=jsonb_set(supplies,array['poke'],to_jsonb((supplies->>'poke')::integer-1))where owner_id=p_player;
  insert into public.inventory(owner_id,pokemon_id,level,stars,combat_data)values(p_player,292,m.level,1,m.combat_data||jsonb_build_object('originSource','evolution','originSpeciesId',290));
 end if;
 receipt:=jsonb_build_object('text','Evolução concluída: '||(target->>'name')||'. Nível, XP e identidade preservados.',
 'fromId',p_from,'toId',p_target,'inventoryId',m.id,'time',floor(extract(epoch from clock_timestamp())*1000));
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(p_player,p_request,'evolve',payload,receipt);
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(p_player));
end $$;
revoke all on function public.journey_evolution_source(uuid,uuid),public.journey_evolve(uuid,uuid,uuid,integer,integer,numeric)from public,anon,authenticated;
grant execute on function public.journey_evolution_source(uuid,uuid),public.journey_evolve(uuid,uuid,uuid,integer,integer,numeric)to service_role;
notify pgrst,'reload schema';
commit;
