-- All prices and stock mutations are server-side. Apply after 015.
begin;
alter table oakchess_server.hunt_profiles add column shop_history jsonb not null default '[]';
alter table oakchess_server.hunt_profiles add column gear jsonb not null default '[]';
create table oakchess_server.shop_operations(
 owner_id uuid not null references public.journeys(owner_id),request_id uuid not null,
 action text not null,payload jsonb not null,receipt jsonb not null,created_at timestamptz not null default now(),
 primary key(owner_id,request_id)
);
alter table oakchess_server.shop_operations enable row level security;
revoke all on oakchess_server.shop_operations from public,anon,authenticated;

create function public.journey_shop(p_request uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); j public.journeys%rowtype; h oakchess_server.hunt_profiles%rowtype;
 old oakchess_server.shop_operations%rowtype; rules jsonb; product jsonb; bucket jsonb; receipt jsonb;
 key text; stock bigint; quantity bigint; amount bigint:=0; total bigint:=0; label text; entry jsonb;
begin
 if player is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 if p_request is null or p_action is null or p_payload is null or jsonb_typeof(p_payload)<>'object'
 or octet_length(p_payload::text)>4096 then raise exception 'Operação inválida.'; end if;
 -- Same lock order as battles, captures and formation: account first.
 select * into j from public.journeys where owner_id=player for update;
 if not found then raise exception 'Jornada não encontrada.'; end if;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 if not found then raise exception 'Carregue sua jornada.'; end if;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>p_action or old.payload<>p_payload then raise exception 'Não reutilize uma confirmação com outra operação.'; end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 select data into rules from oakchess_server.game_rules where id;
 if p_action='buy' then
  if p_payload-ARRAY['product','quantity']<>'{}'::jsonb then raise exception 'Compra inválida.'; end if;
  key:=p_payload->>'product'; product:=rules->'products'->key;
  if product is null then raise exception 'Item indisponível na loja.'; end if;
  if coalesce(p_payload->>'quantity','')!~'^[1-9][0-9]{0,5}$' then raise exception 'Quantidade inválida.'; end if;
  quantity:=(p_payload->>'quantity')::bigint;amount:=(product->>'price')::bigint*quantity;
  if j.gold<amount then raise exception 'Coins insuficientes.'; end if;
  key:=coalesce(product->>'key',key);
  bucket:=case product->>'bucket' when 'stones' then h.stones else h.supplies end;
  stock:=coalesce((bucket->>key)::bigint,0);
  if stock+quantity>2147483647 then raise exception 'Limite de estoque atingido.'; end if;
  bucket:=jsonb_set(bucket,array[key],to_jsonb(stock+quantity),true);
  update public.journeys set gold=gold-amount where owner_id=player;
  if product->>'bucket'='stones' then update oakchess_server.hunt_profiles set stones=bucket where owner_id=player;
  else update oakchess_server.hunt_profiles set supplies=bucket where owner_id=player;end if;
  label:='Comprou '||quantity||' × '||(product->>'name')||' por '||amount||' ouro.';
 elsif p_action='sell_loot' then
  if p_payload-ARRAY['key','quantity']<>'{}'::jsonb then raise exception 'Venda inválida.';end if;
  key:=p_payload->>'key';bucket:=h.loot;
  if key='*' then
   for key,entry in select k,v from jsonb_each(rules->'loot')e(k,v) loop
    stock:=coalesce((bucket->>key)::bigint,0);total:=total+stock*(entry->>'price')::bigint;
    bucket:=jsonb_set(bucket,array[key],'0',true);
   end loop;
  else
   entry:=rules->'loot'->key;if entry is null then raise exception 'Material indisponível.';end if;
   stock:=coalesce((bucket->>key)::bigint,0);
   if coalesce(p_payload->>'quantity','')!~'^[1-9][0-9]{0,9}$' then raise exception 'Quantidade inválida.';end if;
   quantity:=(p_payload->>'quantity')::bigint;
   if quantity>stock then raise exception 'Estoque insuficiente.';end if;
   total:=quantity*(entry->>'price')::bigint;
   bucket:=jsonb_set(bucket,array[key],to_jsonb(stock-quantity));
  end if;
  if total<=0 then raise exception 'Nenhum material disponível para vender.';end if;
  update oakchess_server.hunt_profiles set loot=bucket where owner_id=player;
  update public.journeys set gold=gold+total where owner_id=player;
  amount:=total;label:='Todo o loot vendido por '||total||' ouro.';
 elsif p_action='rest' then
  if p_payload<>'{}'::jsonb then raise exception 'Descanso inválido.';end if;
  if exists(select 1 from oakchess_server.online_hunts where owner_id=player and finished_at is null)
  then raise exception 'Aguarde o encontro terminar antes de descansar.';end if;
  update public.inventory set combat_data=combat_data||'{"condition":1,"energy":100}'::jsonb
  where owner_id=player and not is_listed;
  label:='Equipe recuperada no Centro Pokémon.';
 else raise exception 'Operação indisponível.';end if;
 receipt:=jsonb_build_object('text',label,'amount',amount,'type',case when p_action='buy' then 'buy' when p_action='sell_loot' then 'sell' else 'other' end,
  'time',floor(extract(epoch from clock_timestamp())*1000));
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,p_action,p_payload,receipt);
 update oakchess_server.hunt_profiles set shop_history=(select coalesce(jsonb_agg(value),'[]')from(select value from jsonb_array_elements(jsonb_build_array(receipt)||shop_history)limit 30)recent)where owner_id=player;
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_shop(uuid,text,jsonb)from public,anon,authenticated;
grant execute on function public.journey_shop(uuid,text,jsonb)to authenticated;
notify pgrst,'reload schema';
commit;
