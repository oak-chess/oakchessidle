/* Six stable component keys; legacy inventory keys remain valid. */
(()=>{
 const components=[
  {k:'hp',n:'PS Extra',s:'hp-up',c:'#ff7a9a',d:'+10% de PS máximos',f:u=>u.maxHp*=1.1},
  {k:'pr',n:'Proteína',s:'protein',c:'#ff9a3a',d:'+12% de Ataque',f:u=>u.atk*=1.12},
  {k:'ca',n:'Cálcio',s:'calcium',c:'#869bff',d:'+12% de poder de habilidade',f:u=>u.ap+=.12},
  {k:'sp',n:'Carbos',s:'carbos',c:'#f67ac6',d:'+8% de velocidade de ataque',f:u=>u.as*=1.08},
  {k:'fe',n:'Ferro',s:'iron',c:'#f4d36c',d:'+20% de Armadura',f:u=>u.armor*=1.2},
  {k:'zn',n:'Zinco',s:'zinc',c:'#82d99a',d:'+20% de Resistência Mágica',f:u=>u.mr*=1.2}
 ];
 VIALS.splice(0,VIALS.length,...components);POTI.splice(0,POTI.length,...components.map(v=>v.k));
 components.forEach(v=>{VBY[v.k]=v;let p=POTS.find(p=>p.k==='pot_'+v.k);if(!p){p={};POTS.push(p)}Object.assign(p,{k:'pot_'+v.k,n:v.n,s:v.s,d:v.d,sd:v.d,f:v.f});ITEMRAW[p.k]=p});
 const define=(k,n,s,d,f)=>{let it=ITEMRAW[k];if(!it){it={k};ITEMS.push(it);ITEMRAW[k]=it}Object.assign(it,{n,s,d,sd:d,f})};
 const base=(a,b,u)=>{components[a].f(u);components[b].f(u)};
 const item=(a,b,k,n,s,d,effect)=>{define(k,n,s,d,u=>{base(a,b,u);effect?.(u)})};
 item(0,0,'leftovers','Sobras','leftovers','+21% PS. Regenera 1% dos PS máximos por segundo.',u=>u.regen+=.01);
 define('band','Faixa da Escolha','choice-band','+45% de Ataque.',u=>u.atk*=1.45);
 define('specs','Óculos de Escolha','choice-specs','+45% de poder de habilidade.',u=>u.ap+=.45);
 define('scarf','Lenço da Escolha','choice-scarf','+35% de velocidade de ataque.',u=>u.as*=1.35);
 item(4,4,'protector','Protetor','protector','+44% de Armadura. Recebe 12% menos dano de ataques básicos.',u=>u.basicGuard=.12);
 item(5,5,'vest','Colete de Assalto','assault-vest','+44% de Resistência Mágica. Recebe 12% menos dano de habilidades.',u=>u.spellGuard=.12);
 item(0,1,'helmet','Capacete de Pedra','rocky-helmet','+10% PS e +12% Ataque. Reflete 18% do dano de ataques básicos corpo a corpo.',u=>u.reflect=.18);
 item(0,2,'bell','Sino de Concha','shell-bell','+10% PS e +12% poder de habilidade. Cura 15% do dano causado.',u=>u.ls+=.15);
 item(0,3,'sash','Cinta de Foco','focus-sash','+10% PS e +8% velocidade de ataque. Sobrevive a um golpe fatal com 1 PS, uma vez.',u=>u.sash=true);
 item(0,4,'flameorb','Orbe de Chamas','flame-orb','+10% PS e +20% Armadura. A cada segundo, inimigos adjacentes perdem 0,3% dos PS máximos e recebem −30% de cura por 2 s.',u=>u.flameAura=true);
 item(0,5,'sitrus','Fruta Sitrus','sitrus-berry','+10% PS e +20% Resistência Mágica. Abaixo de 50% PS, cura 25%, uma vez.',u=>{u.berry=true;u.berryThreshold=.5;u.berryHeal=.25});
 item(1,2,'lifeorb','Orbe da Vida','life-orb','+12% Ataque e poder de habilidade. +24% de dano; cada ataque custa 2% dos PS máximos.',u=>{u.dmgAmp+=.24;u.lifeOrb=true});
 item(1,3,'scope','Lente de Alcance','scope-lens','+12% Ataque e +8% velocidade de ataque. +25% chance e +40% dano crítico.',u=>{u.crit+=.25;u.critDmg+=.4});
 item(1,4,'razorfang','Presa Afiada','razor-fang','+12% Ataque e +20% Armadura. Ataques básicos reduzem as defesas do alvo em 18% por 4 s.',u=>u.basicShred=true);
 item(1,5,'expert','Faixa de Especialista','expert-belt','+12% Ataque e +20% Resistência Mágica. +22% de dano causado.',u=>u.dmgAmp+=.22);
 item(2,3,'quick','Garra Rápida','quick-claw','+12% poder de habilidade e +8% velocidade de ataque. Começa com 20% de mana e recupera 8% ao lançar uma habilidade.',u=>{u.mana+=u.maxMana*.2;u.castRefund=.08});
 item(2,4,'spoon','Colher Torta','twisted-spoon','+12% poder de habilidade e +20% Armadura. Habilidades reduzem as defesas dos alvos em 18% por 4 s.',u=>u.spellShred=true);
 item(2,5,'lightclay','Argila Luminosa','light-clay','+12% poder de habilidade e +20% Resistência Mágica. Curas recebidas são 30% maiores.',u=>u.healBoost=.3);
 item(3,4,'poisonbarb','Ferrão Venenoso','poison-barb','+8% velocidade de ataque e +20% Armadura. Ataques reduzem a cura do alvo em 30% por 4 s e causam +50% dano contra escudos.',u=>u.antiHeal=true);
 item(3,5,'mentalherb','Erva Mental','mental-herb','+8% velocidade de ataque e +20% Resistência Mágica. Bloqueia o primeiro efeito de controle.',u=>u.mentalHerb=true);
 item(4,5,'eviolite','Eviolita','eviolite','+20% Armadura e Resistência Mágica. Antes da forma final, ganha mais 15% em ambas.',u=>{if(u.id!==u.L.ids[u.L.ids.length-1]){u.armor*=1.15;u.mr*=1.15}});
 const rows=[['leftovers','helmet','bell','sash','flameorb','sitrus'],['helmet','band','lifeorb','scope','razorfang','expert'],['bell','lifeorb','specs','quick','spoon','lightclay'],['sash','scope','quick','scarf','poisonbarb','mentalherb'],['flameorb','razorfang','spoon','poisonbarb','protector','eviolite'],['sitrus','expert','lightclay','mentalherb','eviolite','vest']];
 Object.keys(REC).forEach(k=>delete REC[k]);rows.forEach((row,i)=>row.forEach((key,j)=>REC[i+'-'+j]=key));
})();
