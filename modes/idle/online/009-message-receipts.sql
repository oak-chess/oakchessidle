begin;
alter table public.private_messages add column delivered_at timestamptz, add column read_at timestamptz;
create table public.chat_group_receipts (
 message_id bigint not null references public.chat_group_messages(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 delivered_at timestamptz, read_at timestamptz,
 primary key(message_id,recipient_id)
);
alter table public.chat_group_receipts enable row level security;
revoke all on public.chat_group_receipts from public,anon,authenticated;
create function public.record_group_recipients() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.chat_group_receipts(message_id,recipient_id)
 select new.id,player_id from public.chat_group_members where group_id=new.group_id and player_id<>new.sender_id;
 return new;
end; $$;
revoke all on function public.record_group_recipients() from public,anon,authenticated;
create trigger record_group_recipients after insert on public.chat_group_messages for each row execute function public.record_group_recipients();
create function public.read_private_thread(target_id uuid, mark_read boolean default false)
returns table(id bigint,sender_id uuid,body text,created_at timestamptz,delivered boolean,seen boolean)
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 update public.private_messages m set delivered_at=coalesce(m.delivered_at,clock_timestamp()),
 read_at=case when mark_read then coalesce(m.read_at,clock_timestamp()) else m.read_at end
 where m.recipient_id=auth.uid() and m.sender_id=target_id and (m.delivered_at is null or (mark_read and m.read_at is null));
 return query select m.id,m.sender_id,m.body,m.created_at,m.delivered_at is not null,m.read_at is not null
 from public.private_messages m where (m.sender_id=auth.uid() and m.recipient_id=target_id) or (m.sender_id=target_id and m.recipient_id=auth.uid())
 order by m.id desc limit 30;
end; $$;
create function public.read_group_thread(target_id uuid, mark_read boolean default false)
returns table(id bigint,sender_id uuid,username text,body text,created_at timestamptz,delivered boolean,seen boolean)
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.chat_group_members where group_id=target_id and player_id=auth.uid()) then raise exception 'Grupo indisponível.' using errcode='42501'; end if;
 update public.chat_group_receipts r set delivered_at=coalesce(r.delivered_at,clock_timestamp()),
 read_at=case when mark_read then coalesce(r.read_at,clock_timestamp()) else r.read_at end
 from public.chat_group_messages m where m.id=r.message_id and m.group_id=target_id and r.recipient_id=auth.uid()
 and (r.delivered_at is null or (mark_read and r.read_at is null));
 return query select m.id,m.sender_id,p.username,m.body,m.created_at,
 coalesce((select bool_and(r.delivered_at is not null) from public.chat_group_receipts r where r.message_id=m.id),false),
 coalesce((select bool_and(r.read_at is not null) from public.chat_group_receipts r where r.message_id=m.id),false)
 from public.chat_group_messages m join public.profiles p on p.id=m.sender_id where m.group_id=target_id order by m.id desc limit 30;
end; $$;
revoke all on function public.read_private_thread(uuid,boolean),public.read_group_thread(uuid,boolean) from public,anon,authenticated;
grant execute on function public.read_private_thread(uuid,boolean),public.read_group_thread(uuid,boolean) to authenticated;
commit;
