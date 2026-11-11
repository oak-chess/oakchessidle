-- TEST project only, after 005 through 008. All changes are rolled back.
begin;
do $$
declare a uuid; b uuid; outsider uuid:=gen_random_uuid(); g uuid; denied boolean; n bigint; t text;
begin
 foreach t in array array['private_messages','player_contacts','player_verifications','chat_groups','chat_group_members','chat_group_messages','chat_group_receipts'] loop
  if has_table_privilege('authenticated','public.'||t,'INSERT,UPDATE,DELETE') or has_table_privilege('anon','public.'||t,'SELECT,INSERT,UPDATE,DELETE') then raise exception 'Unsafe grants: %',t; end if;
  if not (select relrowsecurity from pg_class where oid=('public.'||t)::regclass) then raise exception 'RLS disabled: %',t; end if;
 end loop;
 select id into a from public.profiles order by id limit 1;
 select id into b from public.profiles where id<>a order by id limit 1;
 if b is null then raise exception 'Two test profiles required'; end if;
 delete from public.player_contacts where (owner_id=a and contact_id=b) or (owner_id=b and contact_id=a);
 perform set_config('request.jwt.claim.sub',a::text,true);
 denied:=false;
 begin perform public.send_private_message(b,'not a contact'); exception when others then denied:=true; end;
 if not denied then raise exception 'Mutual contacts bypassed'; end if;
 insert into public.player_contacts values(a,b,now()),(b,a,now());
 delete from public.private_messages where sender_id=a and created_at>clock_timestamp()-interval '40 seconds';
 n:=public.send_private_message(b,'Private test');
 denied:=false;
 begin perform public.send_private_message(b,'spam'); exception when others then denied:=true; end;
 if not denied then raise exception 'Cooldown bypassed'; end if;
 perform set_config('request.jwt.claim.sub',b::text,true);
 if exists(select 1 from public.read_private_thread(a,false) m where m.id=n and (not m.delivered or m.seen)) then raise exception 'Delivery receipt failed'; end if;
 if not exists(select 1 from public.read_private_thread(a,true) m where m.id=n and m.delivered and m.seen) then raise exception 'Read receipt failed'; end if;
 if not exists(select 1 from public.get_private_messages(a) m where m.id=n) then raise exception 'Recipient read failed'; end if;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from public.get_private_messages(a)) then raise exception 'Private thread leaked'; end if;
 perform set_config('request.jwt.claim.sub',a::text,true);
 g:=public.create_chat_group('Rollback test',array[b]);
 delete from public.chat_group_messages where sender_id=a and created_at>clock_timestamp()-interval '40 seconds';
 n:=public.send_group_message(g,'Group test');
 perform set_config('request.jwt.claim.sub',b::text,true);
 if not exists(select 1 from public.get_group_messages(g) m where m.id=n) then raise exception 'Member read failed'; end if;
 if not exists(select 1 from public.read_group_thread(g,true) m where m.id=n and m.delivered and m.seen) then raise exception 'Group read receipt failed'; end if;
 perform public.leave_chat_group(g);
 if exists(select 1 from public.get_group_messages(g)) then raise exception 'Former member read allowed'; end if;
 denied:=false;
 begin perform public.send_group_message(g,'not a member'); exception when others then denied:=true; end;
 if not denied then raise exception 'Nonmember send allowed'; end if;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 if exists(select 1 from public.get_group_messages(g)) or exists(select 1 from public.get_chat_groups()) then raise exception 'Group leaked'; end if;
end; $$;
rollback;
select 'Chat isolation and cooldown checks passed' as result;
