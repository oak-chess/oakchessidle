// Shared, deterministic fishing rules. This module never grants rewards.
// The server supplies species/technique and replays inputs before settling a cast.
export const FISH_RANK = Object.freeze({129:1,118:1,60:1,54:1,79:2,119:2,130:3,147:3,
 339:1,194:1,61:2,340:3,349:2,72:1,98:1,120:2,116:1,222:2,170:2,223:1,131:3});
const clamp = n => Math.max(0, Math.min(100, n));
const STEP = 20;

export function createCastState({species, technique}) {
 if (!Object.hasOwn(FISH_RANK, species) || !['float','precision'].includes(technique))
  throw new Error('Configuração de pesca inválida.');
 return {species, technique, phase:'cast', time:0, phaseTime:0, tension:35,
  progress:0, holding:false, precisionPosition:50, won:false, reason:null};
}

function phase(s, next) { s.phase=next; s.phaseTime=0; s.holding=false; }
function end(s, won, reason) { s.won=won; s.reason=reason; phase(s, won?'caught':'lost'); }
export function castInput(s, input) {
 if (!['hook','hold','release','tap'].includes(input)) throw new Error('Comando de pesca inválido.');
 if (input==='release') { s.holding=false; return; }
 if (input==='hook') { if(s.phase==='bite') phase(s,'reel'); return; }
 if(s.phase!=='reel') return;
 if(input==='hold' && s.technique==='float') s.holding=true;
 if(input==='tap' && s.technique==='precision') {
  if(s.precisionPosition>=42 && s.precisionPosition<=62) {
   s.progress=clamp(s.progress+26); s.tension=clamp(s.tension-7);
  } else s.tension=clamp(s.tension+18);
  if(s.tension>=100) end(s,false,'line');
  else if(s.progress>=100) end(s,true,'caught');
 }
}

function step(s, milliseconds) {
 if(s.phase==='caught'||s.phase==='lost') return;
 const dt=milliseconds/1000; s.time+=milliseconds; s.phaseTime+=milliseconds;
 if(s.phase==='cast') { if(s.phaseTime>=1100) phase(s,'wait'); return; }
 if(s.phase==='wait') { if(s.phaseTime>=2800+(s.species%3)*500) phase(s,'bite'); return; }
 if(s.phase==='bite') { if(s.phaseTime>=2800) end(s,false,'missed'); return; }
 const force=[0,3,5,8][FISH_RANK[s.species]];
 if(s.technique==='precision') {
  s.precisionPosition=(.5+.5*Math.sin(s.phaseTime/1000*2.8))*100;
  s.tension=clamp(s.tension+2.5*dt+Math.sin(s.time/1000*4)*force*dt);
 } else {
  s.tension=clamp(s.tension+(s.holding?24:-17)*dt+Math.sin(s.time/1000*4)*force*dt);
  if(s.holding && s.tension>=20 && s.tension<86) s.progress=clamp(s.progress+14*dt);
  else if(s.tension<12) s.progress=clamp(s.progress-4*dt);
 }
 if(s.tension>=100) end(s,false,'line');
 else if(s.progress>=100) end(s,true,'caught');
 else if(s.phaseTime>40000) end(s,false,'escaped');
}

// Inputs are placed on a fixed clock so device frame rate cannot change results.
// Callers must advance using multiples of STEP; the final remainder is carried.
export function advanceCast(s, milliseconds) {
 if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds%STEP!==0||milliseconds>120000)
  throw new Error('Tempo de pesca inválido.');
 for(let elapsed=0;elapsed<milliseconds;elapsed+=STEP) step(s,STEP);
 return s;
}

export function replayCast(config, trace, duration, wallElapsed) {
 // wallElapsed must come from the database/server clock, never request JSON.
 if(!Number.isSafeInteger(duration)||duration<0||duration>120000||duration%STEP!==0 ||
    !Number.isFinite(wallElapsed)||wallElapsed<duration)
  throw new Error('A tentativa ainda não atingiu esse tempo.');
 if(!Array.isArray(trace)||trace.length>512) throw new Error('Tentativa de pesca muito grande.');
 const s=createCastState(config); let previous=-1, cursor=0;
 for(const event of trace) {
  if(!event||Object.keys(event).length!==2||!Object.hasOwn(event,'at')||!Object.hasOwn(event,'input') ||
     !Number.isSafeInteger(event.at)||event.at<0||event.at%STEP!==0||event.at<=previous||event.at>duration)
   throw new Error('Sequência de pesca inválida.');
  advanceCast(s,event.at-cursor); cursor=event.at; previous=event.at;
  castInput(s,event.input);
 }
 advanceCast(s,duration-cursor);
 return s;
}
