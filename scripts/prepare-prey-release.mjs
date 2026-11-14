// Rebuild the private species allowlist and the single-file Edge deployment.
import fs from 'node:fs';
import {HUNT_CATALOG as catalog} from '../modes/idle/online/hunt-catalog.mjs';
const file='modes/idle/online/033-online-prey.sql';
let sql=fs.readFileSync(file,'utf8');
const rows=catalog.routes.flatMap((route,area)=>Object.values(route.habitats).map(h=>`(${area},${h.min},'${JSON.stringify(h.species.map(name=>{const s=catalog.species.find(s=>s.name===name);if(!s)throw Error(name);return {id:s.id,name};})).replaceAll("'","''")}')`));
const schema=`-- BEGIN GENERATED CATALOG
create table if not exists oakchess_server.prey_catalog(area integer,min_level integer,species jsonb not null);
alter table oakchess_server.prey_catalog enable row level security;
revoke all on oakchess_server.prey_catalog from public,anon,authenticated;
truncate oakchess_server.prey_catalog;
insert into oakchess_server.prey_catalog(area,min_level,species) values\n${rows.join(',\n')};
-- END GENERATED CATALOG`;
sql=sql.replace(/-- BEGIN GENERATED CATALOG[\s\S]*?-- END GENERATED CATALOG\n?/,'');
sql=sql.replace('begin;','begin;\n'+schema);
fs.writeFileSync(file,sql);
const read=f=>fs.readFileSync('modes/idle/online/'+f,'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/^import .*;\r?\n/gm,'');
fs.writeFileSync('modes/idle/online/hunt-edge.ts',read('hunt-engine.mjs')+'\n'+read('hunt-catalog.mjs').replace('export const HUNT_CATALOG','const catalog')+'\n'+read('hunt-plan.mjs')+'\n'+read('authoritative-hunt-handler.mjs')+`
Deno.serve(createAuthoritativeHuntHandler({supabaseUrl:Deno.env.get('SUPABASE_URL'),
serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),publishableKey:Deno.env.get('SUPABASE_ANON_KEY'),
origins:['https://oakchessidle.pages.dev','http://127.0.0.1:8798']}));
`);
console.log('Prey catalog and hunt-battle deployment built.');
