-- After 005-player-contacts.sql. Only server-validated members can access a group.
begin;
create table public.chat_groups (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 48),
 created_at timestamptz not null default now()
);
create table public.chat_group_members (
 group_id uuid not null references public.chat_groups(id) on delete cascade,
 player_id uuid not null references public.profiles(id) on delete cascade,
 primary key(group_id,player_id)
);
create table public.chat_group_messages (
 id bigint generated always as identity primary key,
 group_id uuid not null references public.chat_groups(id) on delete cascade,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 140),
 created_at timestamptz not null default now()
);
create index chat_group_messages_latest on public.chat_group_messages(group_id,id desc);
create index chat_group_members_player on public.chat_group_members(player_id,group_id);
alter table public.chat_groups enable row level security;
alter table public.chat_group_members enable row level security;
alter table public.chat_group_messages enable row level security;
revoke all on public.chat_groups,public.chat_group_members,public.chat_group_messages from public,anon,authenticated;
create function public.create_chat_group(group_name text, member_ids uuid[])
returns uuid language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); target uuid; result uuid; cleaned text:=btrim(group_name);
begin
 if player is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform 1 from public.profiles where id=player for update;
 if cleaned is null or char_length(cleaned) not between 1 and 48 or cleaned ~ '[[:cntrl:]]' then raise exception 'Nome inválido.'; end if;
 if member_ids is null or cardinality(member_ids) not between 1 and 19 then raise exception 'Escolha de 1 a 19 contatos.'; end if;
 if (select count(*) from public.chat_groups where owner_id=player)>=10 then raise exception 'Limite de 10 grupos criados.'; end if;
 foreach target in array member_ids loop
  if target is null or target=player or not exists(select 1 from public.player_contacts where owner_id=player and contact_id=target)
   or not exists(select 1 from public.player_contacts where owner_id=target and contact_id=player)
  then raise exception 'Os participantes precisam ser contatos mútuos.'; end if;
 end loop;
 insert into public.chat_groups(owner_id,name) values(player,cleaned) returning id into result;
 insert into public.chat_group_members values(result,player);
 insert into public.chat_group_members select result,x from unnest(member_ids) x on conflict do nothing;
 return result;
end; $$;
create function public.get_chat_groups()
returns table(id uuid,name text,member_count bigint)
language sql stable security definer set search_path='' as $$
 select g.id,g.name,(select count(*) from public.chat_group_members m where m.group_id=g.id)
 from public.chat_groups g join public.chat_group_members own on own.group_id=g.id
 where own.player_id=auth.uid() order by g.created_at desc,g.id;
$$;
create function public.get_group_messages(target_id uuid)
returns table(id bigint,sender_id uuid,username text,body text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select m.id,m.sender_id,p.username,m.body,m.created_at from public.chat_group_messages m
 join public.profiles p on p.id=m.sender_id
 where m.group_id=target_id and exists(select 1 from public.chat_group_members own where own.group_id=target_id and own.player_id=auth.uid())
 order by m.id desc limit 30;
$$;
create function public.send_group_message(target_id uuid,message_text text)
returns bigint language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); result bigint; cleaned text:=btrim(regexp_replace(message_text,'[[:cntrl:]]',' ','g'));
begin
 if player is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform 1 from public.profiles where id=player for update;
 if not exists(select 1 from public.chat_group_members where group_id=target_id and player_id=player) then raise exception 'Grupo indisponível.' using errcode='42501'; end if;
 if cleaned is null or char_length(cleaned) not between 1 and 140 then raise exception 'Use de 1 a 140 caracteres.'; end if;
 if exists(select 1 from public.chat_group_messages where sender_id=player and created_at>clock_timestamp()-interval '40 seconds') then raise exception 'Aguarde 40 segundos entre mensagens.'; end if;
 insert into public.chat_group_messages(group_id,sender_id,body) values(target_id,player,cleaned) returning id into result;
 return result;
end; $$;
create function public.leave_chat_group(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 -- Creator departure removes the group; other departures remove only membership.
 if exists(select 1 from public.chat_groups where id=target_id and owner_id=auth.uid()) then
  delete from public.chat_groups where id=target_id and owner_id=auth.uid();
 else delete from public.chat_group_members where group_id=target_id and player_id=auth.uid(); end if;
end; $$;
revoke all on function public.create_chat_group(text,uuid[]),public.get_chat_groups(),public.get_group_messages(uuid),public.send_group_message(uuid,text),public.leave_chat_group(uuid) from public,anon,authenticated;
grant execute on function public.create_chat_group(text,uuid[]),public.get_chat_groups(),public.get_group_messages(uuid),public.send_group_message(uuid,text),public.leave_chat_group(uuid) to authenticated;
commit;
