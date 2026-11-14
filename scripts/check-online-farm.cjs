/* Run with: node scripts/check-online-farm.cjs <path-to-pglite-package> */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PGlite}=require(path.resolve(process.argv[2]||'node_modules/@electric-sql/pglite'));
const source=name=>fs.readFileSync('modes/idle/online/'+name,'utf8');
const extract=(text,start,end)=>text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)));
(async()=>{
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid()returns uuid language sql stable as $$select nullif(current_setting('test.player',true),'')::uuid$$;
 grant usage on schema auth to authenticated,anon;grant execute on function auth.uid()to authenticated,anon;`);
 await db.exec(source('schema.sql'));
 await db.exec(`create schema oakchess_server;
 alter table public.inventory add combat_data jsonb not null default '{}';
 create table oakchess_server.hunt_profiles(owner_id uuid primary key references public.journeys(owner_id),
 formation uuid[] not null default '{}',organization jsonb not null default '[]',
 supplies jsonb default '{}',preferences jsonb default '{}',loot jsonb default '{}',stones jsonb default '{}',
 gear jsonb default '[]',shop_history jsonb default '[]',badges integer[] default '{}',
 unlocked_area integer default 0,region_wins jsonb default '{}',total_wins integer default 0,
 wave integer default 1,wave_wins integer default 0,route text default '0:forest');
 create table oakchess_server.online_hunts(id uuid primary key default gen_random_uuid(),owner_id uuid,
 route text,plan jsonb,snapshot jsonb,ready_at timestamptz,finished_at timestamptz,result jsonb,captures jsonb default '{}');
 create table oakchess_server.shop_operations(owner_id uuid,request_id uuid,action text,payload jsonb,receipt jsonb,primary key(owner_id,request_id));
 create table oakchess_server.arena_defenses(player_id uuid primary key,inventory_ids uuid[]);
 create table oakchess_server.arena_offers(player_id uuid,opponent_id uuid,expires_at timestamptz);
 create table oakchess_server.arena_matches(player_id uuid,opponent_id uuid,finished_at timestamptz);
 create table oakchess_server.game_rules(id boolean primary key,data jsonb);
 insert into oakchess_server.game_rules values(true,'{"loot":{},"species":{"1":{"cost":1,"star":1}},"births":{"1":{"legendary":false}}}');`);
 await db.exec(extract(source('014-authoritative-hunts.sql'),'create function oakchess_server.hunt_add_xp','create function public.hunt_finish'));
 await db.exec(extract(source('027-auto-sell-loot.sql'),'create or replace function public.hunt_finish',"notify pgrst"));
 await db.exec(extract(source('027-auto-sell-loot.sql'),'create or replace function public.journey_shop','create or replace function public.hunt_finish'));
 await db.exec(extract(source('026-capture-destinations.sql'),'create or replace function public.journey_organization','create or replace function public.hunt_capture_destination'));
 await db.exec(source('029-online-farm.sql'));
 const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
 const m='20000000-0000-4000-8000-000000000001',n='20000000-0000-4000-8000-000000000002';
 for(const [id,name]of[[a,'Alice'],[b,'Bob']])await db.query(`insert into auth.users values($1);`,[id]);
 await db.exec(`insert into public.profiles(id,username)values('${a}','Alice'),('${b}','Bob');
 insert into public.journeys(owner_id)values('${a}'),('${b}');
 insert into oakchess_server.hunt_profiles(owner_id)values('${a}'),('${b}');
 insert into public.inventory(id,owner_id,pokemon_id,level,combat_data)values
 ('${m}','${a}',1,1,'{"xp":0,"items":["lens"],"ivs":{"hp":31},"condition":0.5,"shiny":true}'),
 ('${n}','${a}',4,1,'{"xp":0}');`);
 const q=async(sql,args=[])=>(await db.query(sql,args)).rows;
 const scalar=async(sql,args=[])=>(await q(sql,args))[0];
 const player=async id=>{await q("select set_config('test.player',$1,false)",[id]);};
 const op=async(action,payload={},id=crypto.randomUUID())=>(await scalar('select public.journey_farm($1,$2,$3)as result',[id,action,payload])).result;
 const fail=async(fn,pattern)=>{await assert.rejects(fn,pattern);};
 await player(a);
 await fail(()=>op('starter'),/Conheça/);
 await op('meet',{who:'fisher'});await op('meet',{who:'farmer'});
 const request=crypto.randomUUID(),first=await op('starter',{},request),house=first.state.farm.activeHouseId;
 assert.equal(first.state.farm.houses.length,1);
 await op('starter',{},request);assert.equal((await op('selectHouse',{id:house})).state.farm.houses.length,1);
 await fail(()=>op('starter'),/uma vez/);
 await fail(()=>op('meet',{who:'farmer',gold:999}),/inválido/);
 await fail(()=>op('assign',{key:m,id:house,gain:999}),/inválido/);
 await player(b);await fail(()=>op('rename',{id:house,name:'Stolen'}),/não encontrada/);
 await fail(()=>op('assign',{key:m,id:house}),/indisponível/);
 await player(a);
 await op('assign',{key:m,id:house});await fail(()=>op('assign',{key:n,id:house}),/cheia/);
 await fail(()=>q('update public.inventory set level=999 where id=$1',[m]),/Retire/);
 await fail(()=>q('update public.inventory set is_listed=true where id=$1',[m]),/Retire/);
 await fail(()=>q('delete from public.inventory where id=$1',[m]),/Retire/);
 await fail(()=>q('update public.inventory set pokemon_id=2 where id=$1',[m]),/Retire/);
 await fail(()=>q(`update public.inventory set combat_data=jsonb_set(combat_data,'{items}','[]')where id=$1`,[m]),/Retire/);
 await fail(()=>q('update oakchess_server.hunt_profiles set formation=array[$1::uuid]where owner_id=$2',[m,a]),/campo ou banco/);
 await fail(()=>q('insert into oakchess_server.arena_defenses values($1,array[$2::uuid])',[a,m]),/defesa/);
 await fail(()=>q('select public.journey_shop($1,$2,$3)',[crypto.randomUUID(),'sell_pokemon',{ids:[m]}]),/Retire/);
 await q(`update public.inventory set combat_data=jsonb_set(combat_data,'{condition}','1')where id=$1`,[m]);
 // Use the production hunt_finish implementation, not a replica of reward logic.
 const hunt=crypto.randomUUID(),plan={winner:0,rewards:{pokemonXp:7,trainerXp:0,coins:0,defeated:1},allies:[],frames:[{}]};
 await q(`insert into oakchess_server.online_hunts(id,owner_id,route,plan,snapshot,ready_at)values($1,$2,'0:forest',$3,'{"area":0}',now()-interval '1 second')`,[hunt,a,plan]);
 await fail(()=>op('return',{key:m}),/Conclua/);
 await q('select public.hunt_finish($1,$2)',[a,hunt]);
 let row=await scalar('select trained,carry from oakchess_server.farm_residents where inventory_id=$1',[m]);
 assert.equal(Number(row.trained),1);assert.equal(Number(row.carry),.75);
 await q('select public.hunt_finish($1,$2)',[a,hunt]);
 assert.equal(Number((await scalar('select trained from oakchess_server.farm_residents where inventory_id=$1',[m])).trained),1);
 const before=await scalar('select combat_data from public.inventory where id=$1',[m]);assert.deepEqual(before.combat_data.items,['lens']);assert.equal(before.combat_data.ivs.hp,31);
 // Second hunt preserves fractions and levels up using the shared server curve.
 const second=crypto.randomUUID();await q(`insert into oakchess_server.online_hunts(id,owner_id,route,plan,snapshot,ready_at)values($1,$2,'0:forest',$3,'{"area":0}',now()-interval '1 second')`,[second,a,{...plan,rewards:{...plan.rewards,pokemonXp:397}}]);
 await q('select public.hunt_finish($1,$2)',[a,second]);
 row=await scalar('select trained,carry from oakchess_server.farm_residents where inventory_id=$1',[m]);assert.equal(Number(row.trained),101);assert.equal(Number(row.carry),0);
 assert.equal((await scalar('select level from public.inventory where id=$1',[m])).level,2);
 await op('pack',{id:house});assert.equal((await scalar('select count(*)as n from oakchess_server.farm_residents')).n,0);
 await op('install',{id:house});await op('assign',{key:m,id:house});await op('return',{key:m});
 // Legendary capacity and every quality multiplier use the same production trigger.
 for(const [tier,rate]of[[0,.25],[1,.4],[2,.75],[3,1],[4,1]]){
  await q('update oakchess_server.farm_houses set tier=$1 where id=$2',[tier,house]);
  await op('assign',{key:m,id:house});
  if(tier===4){await op('assign',{key:n,id:house});}
  const huntId=crypto.randomUUID();await q(`insert into oakchess_server.online_hunts(id,owner_id,route,plan,snapshot,ready_at)values($1,$2,'0:forest',$3,'{"area":0}',now()-interval '1 second')`,[huntId,a,{...plan,rewards:{...plan.rewards,pokemonXp:100}}]);
  await q('select public.hunt_finish($1,$2)',[a,huntId]);
  assert.equal(Number((await scalar('select trained from oakchess_server.farm_residents where inventory_id=$1',[m])).trained),100*rate);
  const gym=crypto.randomUUID();await q(`insert into oakchess_server.online_hunts(id,owner_id,route,plan,snapshot,ready_at)values($1,$2,'0:gym',$3,'{"area":0}',now()-interval '1 second')`,[gym,a,plan]);
  await q('select public.hunt_finish($1,$2)',[a,gym]);
  assert.equal(Number((await scalar('select trained from oakchess_server.farm_residents where inventory_id=$1',[m])).trained),100*rate);
  await op('return',{key:m});if(tier===4)await op('return',{key:n});
 }
 // Banking and market flags must be respected on assignment, with rollback.
 await q(`update public.inventory set combat_data=combat_data||'{"inDepot":true}'where id=$1`,[m]);await fail(()=>op('assign',{key:m,id:house}),/Envie/);
 await q(`update public.inventory set combat_data=combat_data-'inDepot',is_listed=true where id=$1`,[m]);await fail(()=>op('assign',{key:m,id:house}),/indisponível/);
 await q('update public.inventory set is_listed=false where id=$1',[m]);
 await q('set role authenticated');await op('selectHouse',{id:house});
 await fail(()=>q('select * from oakchess_server.farm_houses'),/permission denied/);
 await q('reset role');await player('');await fail(()=>op('starter'),/Entre/);
 await q('set role anon');await fail(()=>op('starter'),/permission denied/);await q('reset role');
 console.log('PASS farm SQL: isolation, permissions, first-house idempotency, reservations, capacity, server hunt XP, fractional carry, level-up, retry, packing and transfers.');
 await db.exec(source('030-online-farm-properties.sql'));
 await player(a);
 await require('./online-farm-property-cases.cjs')({db,q,scalar,op,player,fail,a,b,house});
 await db.exec(source('031-online-fishing.sql'));
 await require('./online-fishing-cases.cjs')({db,q,scalar,player,fail,a,b});
 await db.exec(source('032-item-reserves.sql'));
 await player(a);
 await q(`update oakchess_server.hunt_profiles set preferences=preferences||'{"threshold":50,"healItem":"potions","reviveItem":"revives","shinyBall":"ultra","captureBall":"poke"}'::jsonb where owner_id=$1`,[a]);
 const preferences=async itemReserves=>q("select public.journey_shop(gen_random_uuid(),'preferences',jsonb_build_object('itemReserves',$1::jsonb))",[JSON.stringify(itemReserves)]);
 await preferences({poke:20,potions:10});
 assert.equal(Number((await scalar("select preferences->'itemReserves'->>'potions' as minimum from oakchess_server.hunt_profiles where owner_id=$1",[a])).minimum),10);
 await fail(()=>preferences({potions:-1}),/Reserva inválida/);
 await fail(()=>preferences({coins:100}),/Reserva inválida/);
 await preferences({poke:0,potions:0});
 console.log('PASS item reserves: save, validate and clear minima.');
 await db.close();
})().catch(error=>{console.error(error.message,error.where||'',error.internalQuery||'',error.position||'');process.exit(1);});
