-- Apply after 005-player-contacts.sql. No local saves are imported.
begin;
create table public.private_messages (
 id bigint generated always as identity primary key,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 140),
 created_at timestamptz not null default now(),
 check(sender_id <> recipient_id)
);
create index private_messages_thread on public.private_messages(sender_id,recipient_id,id desc);
alter table public.private_messages enable row level security;
revoke all on public.private_messages from public,anon,authenticated;
create function public.send_private_message(target_id uuid, message_text text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare player uuid := auth.uid(); result bigint; cleaned text;
begin
 if player is null then raise exception 'Authentication required' using errcode='42501'; end if;
 cleaned := btrim(regexp_replace(message_text,'[[:cntrl:]]',' ','g'));
 if cleaned is null or char_length(cleaned) not between 1 and 140 then raise exception 'Use de 1 a 140 caracteres.'; end if;
 -- Lock the sender to serialize cooldown checks across tabs and concurrent requests.
 perform 1 from public.profiles where id=player for update;
 if not exists(select 1 from public.player_contacts where owner_id=player and contact_id=target_id)
 or not exists(select 1 from public.player_contacts where owner_id=target_id and contact_id=player)
 then raise exception 'Os dois jogadores precisam se adicionar como contatos.'; end if;
 if exists(select 1 from public.private_messages where sender_id=player and created_at>clock_timestamp()-interval '40 seconds')
 then raise exception 'Aguarde 40 segundos entre mensagens.'; end if;
 insert into public.private_messages(sender_id,recipient_id,body) values(player,target_id,cleaned) returning id into result;
 return result;
end; $$;
create function public.get_private_messages(target_id uuid)
returns table(id bigint,sender_id uuid,body text,created_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select m.id,m.sender_id,m.body,m.created_at from public.private_messages m
 where auth.uid() is not null and
 ((m.sender_id=auth.uid() and m.recipient_id=target_id) or (m.sender_id=target_id and m.recipient_id=auth.uid()))
 order by m.id desc limit 30;
$$;
revoke all on function public.send_private_message(uuid,text),public.get_private_messages(uuid) from public,anon,authenticated;
grant execute on function public.send_private_message(uuid,text),public.get_private_messages(uuid) to authenticated;
commit;
