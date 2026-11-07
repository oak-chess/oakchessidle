/* Timed Safari: save-owned clock and deterministic species sequence. */
window.IDLE_SAFARI_DATA={minutes:60,maxTickets:24,freeEntry:true};
window.createIdleSafari=function(ctx){
 const s=ctx.state,now=ctx.now||Date.now,random=ctx.random||Math.random,old=s.safari;
 if(old&&old.version!==2)s.safari={version:2,tickets:old.session?1:0,legacyReport:old.session||old.lastReport,session:null};
 const data=s.safari=Object.assign({version:2,tickets:0,serial:0,session:null,lastReport:null,pending:[]},s.safari);data.tickets=Math.max(0,Math.floor(Number(data.tickets)||0));
 const catalog=[],seen=new Set();for(const L of ctx.lines)for(let i=0;i<L.ids.length;i++){const id=L.ids[i];if(seen.has(id)||id>649||L.boss||window.ARENA_SPECIAL_CRYSTALS?.category(id))continue;seen.add(id);catalog.push({id,name:L.names[i],star:i+1,L})}
 const persist=()=>{ctx.save?.();ctx.changed?.()};
 function captureLevel(e){return Math.min(200,2*Math.max(1,...e.L.ids.slice(0,e.star).map(id=>window.IDLE_EVOLUTIONS?.[id]?.level||1)))}
 function duration(n){return (n*60+Math.floor(n/6)*30)*60000}
 function remaining(){return Math.max(0,(data.session?.endsAt||0)-now())}
 function freeEntry(){return window.IDLE_SAFARI_DATA.freeEntry===true}
 function unlocked(){return freeEntry()||!!s.world?.badges?.includes(3)}
 function blocked(){return !unlocked()?'Conquiste a insígnia Arco-íris de Erika.':ctx.preflight?.()||null}
 function finish(reason){const a=data.session;if(!a)return {ok:false};s.encounter=a.previousEncounter||null;s.encounterGenes=a.previousGenes||null;data.lastReport={id:a.id,started:a.started,ended:now(),encounters:a.index,caught:a.caught,reason};data.session=null;data.pending=[];ctx.exit?.(reason);persist();return {ok:true,ended:true,reason}}
 function tick(){if(data.session&&!remaining())return finish('O tempo da expedição terminou.');return null}
 function nextEncounter(){const a=data.session;if(!a||!remaining())return null;if(a.encounter)return a.encounter;let n=(a.seed+Math.imul(a.index+1,0x9e3779b9))>>>0;n^=n>>>16;n=Math.imul(n,0x85ebca6b)>>>0;n^=n>>>13;const e=catalog[(n>>>0)%catalog.length];if(!e)return null;const genes=window.IDLE_INDIVIDUALS.roll(e.L,'safari:'+a.id+':'+a.index,true,false,window.IDLE_VIP?.factor(s,'shiny')||1);window.IDLE_SHINY.register(s,genes,e.L,e.id,'safari');a.encounter={key:a.id+':'+a.index,name:e.name,speciesId:e.id,star:e.star,level:captureLevel(e),genes,defeated:false};a.snapshot=null;persist();return a.encounter}
 function chooseArena(){if(!Number.isInteger(data.nextArena)){data.nextArena=Math.floor(random()*3);persist()}return data.nextArena}
 function start(count=1){if(freeEntry())count=1;tick();if(data.session)return {ok:false,reason:'Você já tem uma expedição.'};if(!Number.isInteger(count)||count<1||count>24)return {ok:false,reason:'Escolha de 1 a 24 tickets.'};const reason=blocked();if(reason)return {ok:false,reason};if(!freeEntry()&&data.tickets<count)return {ok:false,reason:'Tickets insuficientes. Derrote bosses para encontrar Safari Tickets.'};if(!catalog.length)return {ok:false,reason:'Catálogo indisponível.'};const arena=chooseArena();if(!freeEntry())data.tickets-=count;data.serial++;data.lastReport=null;data.session={id:'safari-'+data.serial+'-'+now(),previousEncounter:s.encounter,previousGenes:s.encounterGenes,arena,seed:Math.floor(random()*4294967296),started:now(),endsAt:now()+duration(count),tickets:freeEntry()?0:count,freeTest:freeEntry(),index:0,caught:[],encounter:null,snapshot:null};delete data.nextArena;nextEncounter();ctx.enter?.();persist();return {ok:true}}
 function advance(win){if(!data.session)return false;if(!win){finish('Sua equipe foi derrotada.');return false}if(tick())return false;data.session.index++;data.session.encounter=null;nextEncounter();return true}
 function captured(event){const a=data.session;if(!a||a.caught.some(e=>e.key===event.key))return;a.caught.push({...event,at:now()});persist()}
 function drop(level,training=false){if(training)return false;const chance=level>=9750?.01:level>=3100?.0075:level>=650?.005:.0025;if(random()>=chance)return false;data.tickets++;persist();return true}
 return {freeEntry,chooseArena,data,catalog,captureLevel,duration,remaining,unlocked,blocked,start,finish,tick,nextEncounter,advance,captured,drop};
};
