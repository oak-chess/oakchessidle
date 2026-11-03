/* Append-only Unova pack. Existing species and region indices remain stable. */
(()=>{'use strict';
const D=window.IDLE_WORLD_DATA,N=window.IDLE_UNOVA_SPECIES;
Object.assign(window.IDLE_EVOLUTIONS,window.IDLE_UNOVA_EVOLUTIONS);
Object.assign(window.PMD_ANIM_DATA,window.IDLE_UNOVA_PMD);
Object.assign(window.PMD_BOUNDS_DATA,window.IDLE_UNOVA_BOUNDS);
Object.assign(window.PLAYABLE_MOVES,window.IDLE_UNOVA_MOVES);
const loot={forest:'fiber',garden:'seed',meadow:'fur',cave:'ore',power:'ore',lake:'shell',quarry:'ore',ancient:'essence',ironmine:'ore',marsh:'essence',frost:'snow',haunted:'essence',dragon:'scale'};
window.IDLE_UNOVA_DESTINATIONS.forEach((entry,index)=>{
 const level=386+index*12,pools={},habitat=[];
 for(const [j,h]of entry.habitats.entries()){
  const species=h.ids.map(id=>N[id]);pools[h.theme]={name:h.name,min:level+j*2,loot:loot[h.theme],species};
  species.forEach((name,k)=>habitat.push([name,k<3?'common':k===3?'uncommon':'rare']));
 }
 const theme=[3,0,3,2,0,0,11,5][index];
 D.regions.push({name:'Rotas de '+entry.city,continent:'Unova',leader:entry.leaders.join(' / '),badge:entry.badge,level:level+8,need:18+index*2,theme,gymTheme:theme,types:entry.types,foes:entry.foes.map(id=>N[id]),mechanic:'Especialidade: '+entry.types.join(' / ')+'. Ajuste tipos, golpes e formação.',habitat});
 D.gyms.push({city:entry.city,type:entry.types.map(t=>({grass:'Planta',fire:'Fogo',water:'Água',normal:'Normal',bug:'Inseto',electric:'Elétrico',ground:'Terra',flying:'Voador',ice:'Gelo',dragon:'Dragão'})[t]||t).join(' / '),trainer:entry.trainers[0],trainers:entry.trainers,color:['#9fca88','#bc9d7b','#dbb36c','#f1ce66','#b89772','#83bdde','#b1e3ef','#aa98d3'][index],continent:'Unova'});
 window.IDLE_REGION_HUNTS.push({level,habitats:pools,boss:entry.foes.map(id=>N[id])});
});
const groups={},levels={},meta={},requirements={};
for(const e of window.IDLE_UNOVA_EVENTS){
 const key=e.key.replaceAll('-','_'),quest=e.unlock.quest;
 groups[key]={interval:60*60000,names:[e.name],themes:[e.id===643?6:e.id===644?2:e.id===646?11:5],badge:31+e.unlock.unovaBadges,...(quest?{unlock:quest}:{})};
 levels[e.name]=300;meta[key]=['Unova',e.name];
 requirements[key]='Conquistar '+e.unlock.unovaBadges+' insígnia(s) de Unova'+(quest?' e recolher a missão correspondente na Jornada.':'.');
}
window.IDLE_UNOVA_EVENT_GROUPS=groups;window.IDLE_UNOVA_EVENT_LEVELS=levels;window.IDLE_UNOVA_EVENT_META=meta;window.IDLE_UNOVA_EVENT_REQUIREMENTS=requirements;
for(const [id,title,need,reward]of [
['unova-arrival','Pesquisa de Unova',1,{gold:2500,materials:5}],
 ['unova-swords','O juramento dos espadachins',8,{unlock:'unova-swords',materials:35}],
 ['unova-melody','A melodia de Castelia',8,{unlock:'unova-melody',gold:2500}],
 ['unova-plasma','Os arquivos do laboratório P2',8,{unlock:'unova-plasma',materials:50}],
 ['unova-league','Conquista de Unova',8,{gold:7500,materials:90}]
 ])D.quests.push({id,title,detail:'Conquiste '+need+' insígnia(s) de Unova.',metric:'unovaBadges',need,reward,npc:'Prof. Juniper'});
})();
