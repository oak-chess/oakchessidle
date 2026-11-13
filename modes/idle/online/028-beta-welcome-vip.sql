-- Initial beta: upgrade each account's welcome VIP from 3 to 30 days.
-- The recorded grant makes re-running this migration safe.
begin;
alter table oakchess_server.hunt_profiles
 add column if not exists welcome_vip_days integer not null default 3;
alter table oakchess_server.hunt_profiles
 alter column vip_until set default now()+interval '30 days';
update oakchess_server.hunt_profiles
 set vip_until=vip_until+make_interval(days=>30-welcome_vip_days),welcome_vip_days=30
 where welcome_vip_days<30;
alter table oakchess_server.hunt_profiles
 alter column welcome_vip_days set default 30;
notify pgrst,'reload schema';
commit;
select count(*) as accounts, min(welcome_vip_days) as minimum_welcome_days
from oakchess_server.hunt_profiles;
