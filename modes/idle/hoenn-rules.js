/* Pure Hoenn rules shared by combat, evolution and tests. No save is opened here. */
window.IDLE_HOENN_RULES=(()=>{'use strict';
 const hash=text=>{let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0};
 const branches={Wurmple:['Silcoon','Cascoon'],Clamperl:['Huntail','Gorebyss']};
 const weatherForm=w=>w==='Sol forte'?1:w==='Chuva'?2:['Granizo','Neve'].includes(w)?3:0;
 const formNames={351:['Normal','Sol','Chuva','Neve'],386:['Normal','Ataque','Defesa','Velocidade']};
 const ratios=[[1,1,1,1,1],[1.2,1.2,.4,.4,1],[70/150,70/150,3.2,3.2,.6],[95/150,95/150,1.8,1.8,1.2]];
 function branch(m,current){if(m.name==='Azurill')return 'Marill';if(m.name==='Wynaut')return 'Wobbuffet';if(current==='Wurmple')return branches.Wurmple[hash(m.geneSeed||m.id||m.name)%2];if(current==='Clamperl')return m.evolutionChoice==='Gorebyss'?'Gorebyss':'Huntail';return null}
 function passive(id,fallback){if(id===292)return {id:'wonderguard',n:'Guarda Mística',d:'PS máximo 1. Bloqueia ataques diretos sem vantagem de tipo; dano indireto continua atingindo.'};if(id===287||id===289)return {id:'truant',n:'Preguiça',d:'Alterna ações com um intervalo de descanso.'};if(id===288)return {id:'vigoroth',n:'Atividade Contínua',d:'Vigoroth age sem o descanso de Slakoth e Slaking.'};if(id===351)return {id:'forecast',n:'Previsão do Tempo',d:'Muda forma e tipo no combate conforme Sol forte, Chuva ou Granizo. Bola Climática acompanha a forma.'};return fallback}
 function setup(u){u.L={...u.L,passive:passive(u.id,u.L.passive)};if(u.id===287||u.id===289)u._truantUntil=0;clamp(u)}
 function clamp(u){if(u.id===292){u.maxHp=1;u.hp=u.hp>0?1:0}}
 function form(u,m,weather){const next=u.id===351?weatherForm(weather):u.id===386?Math.max(0,Math.min(3,Number(m?.form??u.idleForm)||0)):0,old=u.idleForm||0;
  if(u.id===386){const prev=ratios[u._hoennStatsForm||0],r=ratios[next];for(const [i,k]of ['atk','spell','armor','mr','as'].entries())u[k]*=r[i]/prev[i];u._hoennStatsForm=next}
  if(u.id===351){u.types=[['normal','fire','water','ice'][next]];u.moves=u.moves.map(move=>move.emerald==='WEATHER_BALL'?{...move,_weatherBase:move._weatherBase??move.p,t:u.types[0],p:(move._weatherBase??move.p)*(next?2:1)}:move)}
  u.idleForm=next;if(u.el&&next!==old)window.IDLE_HOENN_FORM_CHANGE?.(u);clamp(u);return next;
 }
 function beforeAction(u,time){if(u.id!==287&&u.id!==289)return true;if((u._truantUntil||0)>time)return false;u._truantUntil=time+2/Math.max(.2,u.as*(1+(u.buffAS||0)));return true}
 function canDamage(target,source,kind,options={}){if(target.id!==292||options.indirect||options.dot&&kind==='true')return true;if(window.IDLE_TACTICS)return window.IDLE_TACTICS.factor(source,target,kind,options)>0;const type=options.type||source?.types?.[0];return ['fire','flying','rock','ghost','dark'].includes(type)}
 function gift(s,m,rule,normalize){if(m.name!=='Nincada'||m.star!==1||rule.targetId!==291||m.shedinjaGiftDone)return null;m.shedinjaGiftDone=true;if(s.collection.length>=300||(s.balls||0)<1)return null;
  const gift=normalize({...m,id:null,name:'Shedinja',star:1,origin:'Nincada',items:[],pos:undefined,ivs:{...m.ivs},candy:0,condition:1,energy:100,shedinjaGiftDone:true});s.balls--;s.collection.push(gift);s.discovered=Array.from(new Set([...s.discovered,'Shedinja']));return gift;
 }
 function eventReady(group,w){return (group.badge===undefined||w.badges.includes(group.badge))&&(!group.unlock||w.unlocks?.[group.unlock])&&(!group.afterWeather||w.legendaryWins?.Groudon&&w.legendaryWins?.Kyogre)}
 const spriteId=(id,form=0)=>({351:[351,10013,10014,10015],386:[386,10001,10002,10003]})[id]?.[form]||id;
 function viewStats(values,id,m){if(id!==386)return values;const r=ratios[Math.max(0,Math.min(3,Number(m.form)||0))],out={...values};for(const [i,key]of ['atk','spell','armor','mr','speed'].entries())out[key]*=r[i];return out}
 function afterCast(u,move){if(move.emerald!=='PSYCHO_BOOST')return;const stages=[1,.5,1/3,.25],old=u._psychoDrops||0,next=Math.min(3,old+1);u.spell*=stages[next]/stages[old];u._psychoDrops=next}
 return {branch,branches,weatherForm,formNames,spriteId,viewStats,passive,setup,clamp,form,beforeAction,canDamage,gift,eventReady,afterCast};
})();
