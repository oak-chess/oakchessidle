(() => {
  'use strict';
  const economyPreference = 'oakchess-layout-economy';

  let automation, party, shop, saveEconomy;
  function intercept(name,receive,prepare=ctx=>ctx) {
    let factory;
    Object.defineProperty(window,name,{
      configurable:true,get(){return factory&&function(ctx){const result=factory(prepare(ctx));receive(ctx,result);return result}},
      set(value){factory=value},
    });
  }
  intercept('createIdleAutomation',ctx=>{automation=ctx});
  intercept('createIdleParty',(_ctx,result)=>{party=result});
  intercept('createIdleShop',(ctx,result)=>{shop=result;saveEconomy=ctx.save});
  let openGuidePanel;
  intercept('createIdleTutorial',ctx=>{openGuidePanel=ctx.open},ctx=>({...ctx,guideData:layoutGuide()}));
  function layoutGuide(){
    const data=window.IDLE_TUTORIAL_DATA;
    const targets={
      '.is-trainer':'.layout-trainer',
      '.is-team':'.layout-field',
      '.is-synergies':'.layout-synergies',
      '#idle-coins-balance':'.layout-wallet',
      '#combatbtn':'.layout-arena > .layout-button',
      '#collectionPokedex':'[data-layout-menu=dex]',
      '#idleWikiLaunch':'[data-layout-menu=wiki]',
      '#rv-village-launch':'[data-layout-menu=village]',
      '#idle-mega':'#idle-legendary-event',
      '.is-quick [aria-label=Automação]':'.layout-auto',
      '.is-quick [aria-label=Loja]':'.layout-links button:first-child',
      '.is-supply-hud':'.layout-auto'
    };
    const adapt=chapter=>({...chapter,steps:chapter.steps.map(step=>{
      const menu=step.target?.match(/\[data-menu=(\w+)\]/)?.[1];
      let text=step.text.replace(/na barra inferior/g,'no menu superior');
      text=text.replace('O saldo de Coins fica abaixo dos controles do canto superior direito. Valores grandes aparecem em mi, bi ou tri; passe o mouse para ver o total completo.','O saldo de Coins e o status VIP ficam no cartão do treinador, à esquerda. Logo abaixo você encontra os painéis Campo e Banco.');
      text=text.replace('Verde é vida; azul é experiência.','As barras mostram vida e experiência.');
      text=text.replace('clique no Pokémon derrotado no painel inferior direito em até 15 segundos','abra Captura manual pela Poké Bola no canto da arena e escolha o Pokémon derrotado em até 15 segundos');
      return {...step,text,target:menu?'[data-layout-menu='+menu+']':targets[step.target]||step.target};
    })});
    const economy={id:'layout-economy',title:'Pokédex e Modo Economia',steps:[
      {text:'Abra Pokédex no menu superior para consultar as espécies e descobrir onde encontrá-las.',panel:'dex',target:'[data-layout-menu=dex]'},
      {text:'No canto superior da arena, o ícone de bateria abre o Modo Economia. A cena fica suspensa e a caçada continua. Ligar cena traz a arena de volta.',target:'.layout-economy-toggle'},
      {text:'No Modo Economia, confira XP, Coins por hora e capturas. O Depósito guarda as capturas desse modo. Abra a ficha pelo sprite ou use o atalho do card para enviar ao PC do Centro.',target:'.layout-economy-toggle'}
    ]};
    return {...data,full:[...data.full.map(adapt),economy],quick:[...data.quick.map(adapt),{...economy,steps:economy.steps.slice(0,2)}]};
  }

  const make=(tag,cls,text)=>{
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  const one=(selector,root=document)=>root.querySelector(selector);
  const item=key=>'assets/pokeapi/sprites/items/'+key+'.png';
  function button(text,handler,icon) {
    const b=make('button','layout-button');b.type='button';b.onclick=handler;b.title=text;
    if(icon){const img=make('img');img.src=icon;img.alt='';b.append(img)}
    b.append(make('span','',text));return b;
  }
  function card(title,cls='') {
    const box=make('section','layout-card '+cls);
    if(title)box.append(make('h2','',title));return box;
  }
  function proxy(selector){return ()=>one(selector)?.click()}
  const quick=label=>proxy('.is-quick [aria-label="'+label+'"]');
  const menu=key=>proxy('.is-navigation [data-menu="'+key+'"]');
  const icons=key=>'modes/idle/assets/menu-icons/'+key+'.svg';
  const fmt=n=>Math.floor(Number(n)||0).toLocaleString('pt-BR');

  function mountViewportPanels(stage, captureButton, captureCount) {
    const selector = '.idle-window, .idle-forge, #rv-native-tools, #idle-rocket-panel, #idle-oak-tutorial, #tip, #toast, #idle-manual-capture, .idle-capture-notice, .idle-shiny-notice';
    let capturePanel, captureExpanded = false;
    captureButton.onclick = () => {
      if (!capturePanel || capturePanel.hidden) {
        toast('Nenhum Pokémon disponível para captura.');
        return;
      }
      captureExpanded = !captureExpanded;
      sync(capturePanel);
    };
    function sync(panel) {
      // Keep the native DOM parent and close handlers. The top layer escapes the arena clip.
      const manual = panel.id === 'idle-manual-capture';
      if (manual && panel.hidden) captureExpanded = false;
      const suppressed = window.IDLE_ARENA_ECONOMY && (manual || panel.classList.contains('idle-capture-notice'));
      const visible = !suppressed && !panel.hidden && (!manual || captureExpanded) && (panel.id === 'tip'
        ? panel.style.display === 'block' || panel.classList.contains('show')
        : panel.id !== 'toast' || panel.childElementCount > 0);
      const open = panel.matches(':popover-open');
      if (!visible && open) panel.hidePopover();
      if (visible && !open) panel.showPopover();
      if (visible && panel.classList.contains('idle-capture-notice')) measureCaptureNotice(panel);
      if (manual) {
        const count = panel.hidden ? 0 : one('.imc-list',panel).childElementCount;
        captureCount.hidden = count === 0;
        captureCount.textContent = count || '';
        captureButton.setAttribute('aria-expanded',String(visible));
        captureButton.setAttribute('aria-label',count ? 'Captura manual · '+count+' disponíveis' : 'Captura manual');
      }
    }
    const visibility = new MutationObserver(records => {
      for (const {target} of records) if (target.parentElement === stage) sync(target);
    });
    function measureCaptureNotice(panel) {
      const height=panel.getBoundingClientRect().height;
      if(height)stage.style.setProperty('--layout-capture-notice-height',height+'px');
    }
    const captureNoticeSize = new ResizeObserver(([entry]) => measureCaptureNotice(entry.target));
    function register(panel) {
      if (!(panel instanceof HTMLElement) || !panel.matches(selector)) return;
      panel.popover = 'manual';
      if (panel.id === 'tip') visibility.observe(panel, {attributes:true, attributeFilter:['style','class','hidden']});
      else if (panel.id === 'toast') visibility.observe(panel, {childList:true});
      else visibility.observe(panel, {attributes:true, attributeFilter:['hidden']});
      if (panel.classList.contains('idle-capture-notice')) captureNoticeSize.observe(panel);
      if (panel.id === 'idle-manual-capture') {
        capturePanel = panel;
        captureButton.setAttribute('aria-controls',panel.id);
        new MutationObserver(()=>sync(panel)).observe(one('.imc-list',panel),{childList:true});
      }
      sync(panel);
    }
    for (const panel of stage.children) register(panel);
    new MutationObserver(records => {
      for (const {addedNodes} of records) for (const node of addedNodes) register(node);
    }).observe(stage, {childList:true});
    return () => {
      captureExpanded=false;
      for(const panel of stage.querySelectorAll(':scope > :is(#idle-manual-capture,.idle-capture-notice)'))sync(panel);
    };
  }

  function mount() {
    const vp=one('#vp'),state=automation.state;
    const stage=one('#stage',vp);
    const layout=make('main','layout-preview'),left=make('aside','layout-left'),center=make('section','layout-center'),right=make('aside','layout-right');
    const nav=card('','layout-nav'),arena=card('','layout-arena');
    const profile=card('','layout-trainer'),field=card('Campo','layout-field'),bench=card('Banco','layout-bench');
    const fieldList=make('div','layout-roster'),benchList=make('div','layout-roster'),slots=make('div','layout-slots');
    function collapsible(panel,label){
      const heading=one('h2',panel)||make('h2');
      const title=make('span','layout-side-title',label),content=make('div','layout-side-content');
      content.id='layout-side-'+label.toLowerCase();
      const toggle=button('',()=>{
        content.hidden=!content.hidden;
        panel.classList.toggle('layout-side-collapsed',content.hidden);
        toggle.setAttribute('aria-expanded',String(!content.hidden));
        toggle.setAttribute('aria-label',(content.hidden?'Expandir ':'Minimizar ')+label);
        toggle.title=toggle.getAttribute('aria-label');
      });
      toggle.classList.add('layout-side-toggle');
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-controls',content.id);
      toggle.setAttribute('aria-label','Minimizar '+label);
      toggle.title='Minimizar '+label;
      heading.replaceChildren(title,toggle);
      panel.append(heading,content);
      return {title,content};
    }
    const trainerCard=collapsible(profile,'Treinador'),fieldCard=collapsible(field,'Campo'),benchCard=collapsible(bench,'Banco');
    const synergies=make('details','layout-synergies'),traits=make('div','layout-traits');
    const synergyButton=make('summary','layout-button');
    synergyButton.title='Sinergias';
    synergyButton.setAttribute('aria-label','Sinergias');
    synergyButton.prepend(make('i','layout-synergy-icon','✦'));
    const detail=make('div','layout-synergy-bonus');
    detail.id='layout-synergy-bonus';
    detail.setAttribute('role','tooltip');
    detail.hidden=true;
    synergies.append(synergyButton,traits,detail);
    function showTraitBonus(row){
        const type=row?.dataset.trait,rule=TRAITS[type];
        detail.hidden=!rule;
        if(!rule)return;
        const tier=tierOf(type,Number(row.dataset.n));
        detail.replaceChildren(make('strong','',TYPES[type].n));
        rule.tiers.forEach((threshold,index)=>{
          const text=(rule.s||rule.d).replace(/\{v\}/g,fmtV(type,rule.v[index]));
          detail.append(make('p',index===tier?'active':'',threshold+' famílias · '+text+(index===tier?' · Ativo':'')));
        });
        row.setAttribute('aria-describedby',detail.id);
    }
    const revealTrait=event=>showTraitBonus(event.target.closest('[data-trait]'));
    traits.addEventListener('pointerover',revealTrait);
    traits.addEventListener('pointerleave',()=>showTraitBonus());
    traits.addEventListener('focusin',revealTrait);
    traits.addEventListener('focusout',()=>showTraitBonus());
    traits.addEventListener('click',event=>{if(event.pointerType==='touch')revealTrait(event)});
    synergies.addEventListener('toggle',()=>{if(!synergies.open)showTraitBonus()});
    synergies.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&synergies.open){
        event.stopPropagation();
        synergies.open=false;
        synergyButton.focus();
      }
    });
    const benchContent=make('div'),farmList=make('div','layout-roster');
    const benchTab=button('Banco',()=>showBenchTab(false)),farmTab=button('Fazenda',()=>showBenchTab(true));
    benchCard.title.classList.add('layout-bench-tabs');
    benchCard.title.replaceChildren(benchTab,farmTab);
    function showBenchTab(showFarm){
      benchContent.hidden=showFarm;
      farmList.hidden=!showFarm;
      benchTab.setAttribute('aria-pressed',String(!showFarm));
      farmTab.setAttribute('aria-pressed',String(showFarm));
    }
    benchContent.append(benchList,slots);
    fieldCard.content.append(fieldList);benchCard.content.append(benchContent,farmList);left.append(profile,field,bench);
    showBenchTab(false);
    for(const [label,id] of [['Pokémon','pokemon'],['Pokédex','dex'],['Pokéfone','bag'],['Evolução','evolution'],['Caçadas','hunts'],['Jornada','journey'],['Modos','modes'],['Centro','center'],['Vila','village'],['Wiki','wiki']]){
      const action=id==='dex'?()=>openGuidePanel?.('dex'):id==='village'?proxy('#rv-village-launch'):id==='wiki'?proxy('#idleWikiLaunch'):menu(id);
      const icon=id==='dex'||id==='wiki'?'modes/idle/assets/phone/'+id+'.svg':undefined;
      const entry=button(label,action,icon);entry.dataset.layoutMenu=id;
      if(!icon)entry.prepend(make('i','layout-nav-art layout-nav-'+id));
      nav.append(entry);
    }
    const banner=make('div','layout-hunt'),status=make('div','layout-log'),controls=make('div','layout-arena-tools');
    const action=button('Explorar',proxy('#combatbtn'));
    action.classList.add('layout-explore');
    action.prepend(make('i','layout-nav-art layout-nav-hunts'));
    const economyInfo=card('','layout-economy-info');
    economyInfo.hidden=true;
    const economyStatus=make('small','','Preparação da equipe');
    const economyHeader=make('header','layout-economy-heading');
    const economyTitle=make('div');
    economyTitle.append(make('small','','MODO ECONOMIA'),make('h2','','Resumo da caçada'),economyStatus);
    const restoreScene=button('Ligar cena',()=>{chooseEconomy(false);economy.focus()});
    const summaryActions=make('div','layout-economy-toolbar');
    summaryActions.append(button('Resetar resumo',()=>{
      if(!confirm('Reiniciar os contadores do resumo da caçada?'))return;
      state.hunts.session=null;
      saveEconomy?.();
      refreshCaptureFilter?.();
    }),restoreScene);
    economyHeader.append(economyTitle,summaryActions);
    const economyMetrics=make('div','layout-economy-metrics');
    const metricLabels=['XP do treinador','Saldo estimado','Abates','Capturas'];
    const metrics=metricLabels.map(label=>{
      const cell=make('article'),value=make('strong'),detail=make('small');
      cell.append(make('span','',label),value,detail);
      economyMetrics.append(cell);
      return {cell,value,detail};
    });
    const economyDetails=make('div','layout-economy-details');
    const captures=make('section','layout-economy-recent'),captureList=make('ul','layout-economy-captures');
    captureList.tabIndex=0;
    captureList.setAttribute('aria-label','Lista de capturas recentes');
    const archivedCapture=make('dialog','layout-economy-archive');
    archivedCapture.setAttribute('aria-labelledby','layout-economy-archive-title');
    document.body.append(archivedCapture);
    function openCaptureRecord(entry,id,typeNames,source){
      const title=make('h2','',(entry.shiny?'✦ ':'')+entry.name);
      title.id='layout-economy-archive-title';
      const close=button('Fechar',()=>archivedCapture.close());
      const metadata=[id?'Pokédex #'+id:null,entry.level?'Nv. '+entry.level:null,entry.potency?'P'+entry.potency:null,entry.ivTotal!=null?'IV '+entry.ivTotal+'/186':null,...typeNames].filter(Boolean);
      const sprite=make('img');sprite.alt='';if(source)sprite.src=source;
      archivedCapture.replaceChildren(make('small','','REGISTRO DE CAPTURA'),title,sprite,make('p','',metadata.join(' · ')),make('p','','Este registro guarda os dados do momento da captura.'),make('p','',entry.result||''),close);
      archivedCapture.showModal();
    }
    let shinyOnly=false,refreshCaptureFilter;
    const captureHeading=make('div','layout-economy-section-heading');
    const shinyFilter=button('Só shiny',()=>{
      shinyOnly=!shinyOnly;
      shinyFilter.setAttribute('aria-pressed',String(shinyOnly));
      shinyFilter.querySelector('span').textContent=shinyOnly?'Só shiny':'Todos';
      refreshCaptureFilter?.();
    });
    shinyFilter.classList.add('layout-economy-shiny-filter');
    shinyFilter.setAttribute('aria-label','Filtrar somente shiny');
    shinyFilter.prepend(make('i','','✦'));
    shinyFilter.querySelector('span').textContent='Todos';
    shinyFilter.setAttribute('aria-pressed','false');
    const clearCaptures=button('Limpar capturas recentes',()=>{
      state.economyCaptureCutoff=Date.now();
      saveEconomy?.();
      refreshCaptureFilter?.();
    });
    clearCaptures.setAttribute('aria-label','Limpar capturas recentes');
    clearCaptures.querySelector('span').remove();
    clearCaptures.insertAdjacentHTML('afterbegin','<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"/></svg>');
    captureHeading.append(make('h3','','Capturas recentes'),shinyFilter,clearCaptures);
    const captureCountLabel=make('b','layout-economy-tab-count');
    captureHeading.querySelector('h3').append(captureCountLabel);
    const captureSortBar=make('div','layout-economy-capture-sort');
    let captureSort='recent';
    const captureSortButtons=new Map();
    for(const [key,label] of [['recent','Recentes'],['score','Nota'],['iv','IV'],['power','Potência'],['quality','Qualidade'],['level','Nível']]){
      const sort=button(label,()=>{
        captureSort=key;
        for(const [id,control] of captureSortButtons)control.setAttribute('aria-pressed',String(id===key));
        captureList.scrollTop=0;
        refreshCaptureFilter?.();
      });
      sort.setAttribute('aria-pressed',String(key===captureSort));
      captureSortButtons.set(key,sort);
      captureSortBar.append(sort);
    }
    captures.append(captureHeading,captureSortBar,captureList);
    const usage=make('section'),usageList=make('ul','layout-economy-usage');
    usage.append(make('h3','','Suprimentos utilizados'),usageList);
    const supplies=[['balls','Poké Bolas','poke-ball'],['potions','Poções','potion'],['revives','Revives','revive']].map(([key,label,sprite])=>{
      const row=make('li'),image=make('img'),count=make('b');
      image.src=item(sprite);image.alt='';
      row.append(image,make('span','',label),count);
      usageList.append(row);
      return {key,count};
    });
    const earnings=make('div','layout-economy-earnings');
    const cashValues=['Coins recebidos','Valor do loot','Reposição estimada'].map(label=>{
      const row=make('div'),value=make('b');
      row.append(make('span','',label),value);
      earnings.append(row);
      return value;
    });
    usage.append(earnings);
    const storage=make('section','layout-economy-storage'),storageNav=make('div','layout-economy-toolbar'),storageList=make('div','layout-economy-storage-list');
    let storageTab='depot',storageSnapshot='',storagePortraits,resetStorageScroll=false;
    const filters=make('div','layout-economy-storage-filters'),search=make('input');
    search.type='search';search.placeholder='Buscar Pokémon';search.setAttribute('aria-label','Buscar Pokémon');
    const filterChanged=()=>{resetStorageScroll=true;renderStorage()};
    search.oninput=filterChanged;
    function storageSelect(label,options){
      const select=make('select');select.setAttribute('aria-label',label);
      for(const [value,text] of options){const option=make('option','',text);option.value=value;select.append(option)}
      select.onchange=filterChanged;
      return select;
    }
    const order=storageSelect('Ordenar Pokémon',[['score','Nota'],['recent','Recentes'],['level','Nível'],['power','Potência'],['quality','Qualidade'],['iv','IV']]);
    let storageType='',filterPanel='';
    const advanced={power:1,quality:0,ivs:{}};
    const storageFilterPanel=make('div','layout-economy-filter-panel');
    const typeButton=button('Tipo ▾',()=>toggleFilters('types'));
    const advancedButton=button('Filtros avançados',()=>toggleFilters('advanced'));
    advancedButton.setAttribute('aria-label','Filtros avançados');
    advancedButton.querySelector('span').remove();
    advancedButton.insertAdjacentHTML('afterbegin','<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>');
    function toggleFilters(name){
      filterPanel=filterPanel===name?'':name;
      renderStorage();
    }
    function memberTypes(member){
      const line=LINES.find(line=>line.names[0]===member.name);
      return line?typesOf(line,member.star||1):[];
    }
    let filterPanelSnapshot='';
    function renderStorageFilters(members){
      const counts={};
      if(filterPanel==='types')for(const member of members)for(const type of memberTypes(member))counts[type]=(counts[type]||0)+1;
      const signature=JSON.stringify([storageTab,filterPanel,storageType,members.length,counts]);
      const show=storageTab!=='items'&&!!filterPanel;
      storageFilterPanel.hidden=!show;
      typeButton.setAttribute('aria-expanded',String(show&&filterPanel==='types'));
      advancedButton.setAttribute('aria-expanded',String(show&&filterPanel==='advanced'));
      advancedButton.setAttribute('aria-pressed',String(advanced.power>1||advanced.quality>0||Object.values(advanced.ivs).some(Boolean)));
      typeButton.querySelector('span').textContent=(TYPES[storageType]?.n||'Tipo')+(filterPanel==='types'?' ▴':' ▾');
      if(!show||signature===filterPanelSnapshot)return;
      filterPanelSnapshot=signature;
      storageFilterPanel.replaceChildren();
      if(filterPanel==='types'){
        const grid=make('div','layout-economy-type-grid');
        for(const [key,label] of [['','Todos os tipos'],...Object.entries(TYPES).map(([id,type])=>[id,type.n])]){
          const pick=button(label,()=>{
            storageType=key;
            filterPanel='';
            filterChanged();
            typeButton.focus();
          });
          pick.append(make('b','',String(key?counts[key]||0:members.length)));
          pick.setAttribute('aria-pressed',String(storageType===key));
          if(key)pick.style.setProperty('--type-accent',TYPES[key].c);
          grid.append(pick);
        }
        storageFilterPanel.append(make('small','','Pokémon com dois tipos contam em ambos.'),grid);
        return;
      }
      for(const [key,label,choices] of [['power','Potência mínima',[[1,'Todas'],[2,'P2+'],[3,'P3+'],[4,'P4+'],[5,'P5']]],['quality','Qualidade mínima',[[0,'Todas'],[1.1,'Q 1,1+'],[1.3,'Q 1,3+'],[1.5,'Q 1,5+'],[1.6,'Q 1,6+']]]]){
        const group=make('div','layout-economy-filter-options');
        group.append(make('small','',label));
        for(const [value,caption] of choices){
          const choice=button(caption,()=>{
            advanced[key]=value;
            for(const control of group.querySelectorAll('button'))control.setAttribute('aria-pressed',String(control===choice));
            filterChanged();
          });
          choice.setAttribute('aria-pressed',String(advanced[key]===value));
          group.append(choice);
        }
        storageFilterPanel.append(group);
      }
      const ivGrid=make('div','layout-economy-iv-grid');
      const stats=window.IDLE_INDIVIDUALS;
      for(const key of stats.keys){
        const label=make('label'),slider=make('input'),value=make('b','',String(advanced.ivs[key]||0));
        slider.type='range';slider.min=0;slider.max=31;slider.value=advanced.ivs[key]||0;
        slider.setAttribute('aria-label','IV mínimo de '+stats.labels[key]);
        slider.oninput=()=>{advanced.ivs[key]=Number(slider.value);value.textContent=slider.value;filterChanged()};
        label.append(make('small','',stats.labels[key]),slider,value);
        ivGrid.append(label);
      }
      storageFilterPanel.append(make('small','','IV mínimo por atributo'),ivGrid);
    }
    let storageShiny=false,selectedDepot=null;
    const storageShinyButton=button('✦ Shiny',()=>{
      storageShiny=!storageShiny;
      storageShinyButton.setAttribute('aria-pressed',String(storageShiny));
      filterChanged();
    });
    storageShinyButton.setAttribute('aria-pressed','false');
    filters.append(search,typeButton,storageShinyButton,advancedButton,order);
    const tabs=new Map();
    for(const [key,label] of [['items','Itens'],['depot','Depósito'],['pc','PC Pokémon']]){
      const tab=button(label,()=>{storageTab=key;selectedDepot=null;filterChanged()});
      if(key==='pc')tab.setAttribute('aria-description','Mostra somente os Pokémon enviados do Depósito ao PC do Centro Pokémon.');
      tab.append(make('b','layout-economy-tab-count'));
      tabs.set(key,tab);storageNav.append(tab);
    }
    storageNav.classList.add('layout-economy-storage-tabs');
    const storageContent=make('div','layout-economy-storage-content');
    storageContent.append(storageList,storageFilterPanel);
    storage.append(storageNav,filters,storageContent);
    storage.onkeydown=event=>{
      if(event.key==='Escape'&&filterPanel){
        event.stopPropagation();
        const trigger=filterPanel==='types'?typeButton:advancedButton;
        filterPanel='';
        renderStorage();
        trigger.focus();
      }
    };
    economyDetails.append(captures,storage);
    economyInfo.append(economyHeader,economyMetrics,usage,economyDetails);

    function sellDepot(members){
      const eligible=members.filter(m=>shop?.depotPrice(m)!=null);
      const total=eligible.reduce((sum,m)=>sum+shop.depotPrice(m),0);
      if(!eligible.length||!confirm('Vender '+eligible.length+' Pokémon por '+fmt(total)+' Coins?'))return;
      shop.sellDepot(eligible.map(m=>m.id));
      renderStorage();
    }
    function moveEconomyPokemon(member,fromDepot){
      const source=fromDepot?state.captureDepot:state.collection;
      const target=fromDepot?state.collection:(state.captureDepot??=[]);
      const index=source.indexOf(member);
      if(index<0||target.length>=300||!shop?.canMoveDepot(member))return;
      source.splice(index,1);
      member.fromEconomyDepot=true;
      target.push(member);
      selectedDepot=null;
      saveEconomy?.();
      renderStorage();
    }
    function renderStorage(){
      const depot=state.captureDepot||[],pc=state.collection.filter(m=>m.fromEconomyDepot||String(m.id).startsWith('depot-'));
      const items=window.IDLE_ITEMS,supplies=state.hunts.supplies;
      const stock=[
        ...Object.entries(items.balls).map(([key,data])=>[data,items.stock(state,key)]),
        ...Object.entries({...items.healing,...items.reviving}).map(([key,data])=>[data,supplies[key]])
      ].filter(([,count])=>count>0);
      const members=storageTab==='depot'?depot:pc;
      renderStorageFilters(members);
      const query=search.value.trim().toLowerCase(),individuals=window.IDLE_INDIVIDUALS;
      const sortValue={recent:m=>m.caughtAt||0,level:m=>m.level,power:m=>m.potency||1,quality:m=>m.quality||0,iv:m=>individuals.total(m),score:m=>individuals.potentialScore(m)}[order.value];
      const found=storageTab==='items'?stock:members.filter(m=>{
        if(storageShiny&&!m.shiny||!pokemonName(m).toLowerCase().includes(query))return false;
        if(storageType&&!memberTypes(m).includes(storageType))return false;
        return (m.potency||1)>=advanced.power&&(m.quality||0)>=advanced.quality&&Object.entries(advanced.ivs).every(([key,min])=>(m.ivs?.[key]||0)>=min);
      }).map(member=>({member,value:sortValue(member)})).sort((a,b)=>b.value-a.value).map(({member})=>member);
      const selected=storageTab==='depot'?found.find(m=>m.id===selectedDepot):null;
      const eligible=depot.filter(m=>shop?.depotPrice(m)!=null);
      const total=eligible.reduce((sum,m)=>sum+shop.depotPrice(m),0);
      const signature=JSON.stringify([storageTab,depot.length,pc.length,state.collection.length,storageTab==='items'?stock:stock.length,storageTab==='items'?null:found.map(m=>[m.id,m.level,m.star,m.megaKey,m.favorite,m.locked,shop?.canMoveDepot(m)]),eligible.length,total,selected?.id]);
      const previousList=storageList.querySelector('.layout-economy-storage-grid');
      const scrollTop=resetStorageScroll?0:previousList?.scrollTop||0;
      resetStorageScroll=false;
      if(signature===storageSnapshot){if(previousList)previousList.scrollTop=scrollTop;return}
      storageSnapshot=signature;
      for(const [key,tab] of tabs){
        const count=key==='depot'?depot.length:key==='pc'?pc.length:stock.length;
        tab.querySelector('.layout-economy-tab-count').textContent=count;
        tab.setAttribute('aria-pressed',String(key===storageTab));
      }
      filters.hidden=storageTab==='items';
      const list=make('div','layout-economy-storage-grid');
      list.classList.toggle('layout-economy-storage-stock',storageTab==='items');
      list.tabIndex=0;
      list.setAttribute('aria-label',tabs.get(storageTab).title);
      storagePortraits?.disconnect();
      const visibleMembers=new Map();
      storagePortraits=new IntersectionObserver(entries=>{
        for(const {target,isIntersecting} of entries){
          if(!isIntersecting||!target.isConnected||!visibleMembers.has(target))continue;
          target.append(portrait(visibleMembers.get(target)));
          visibleMembers.delete(target);
          storagePortraits.unobserve(target);
        }
      },{root:list,rootMargin:'50px'});
      storageList.replaceChildren(list);
      if(storageTab==='items'){
        for(const [data,count] of stock){const row=make('div','layout-economy-stock'),icon=make('img');icon.src=item(data.sprite);icon.alt='';row.append(icon,make('span','',data.name),make('b','','×'+fmt(count)));row.title=data.description||data.name;list.append(row)}
        if(!stock.length)list.append(make('p','','Nenhum suprimento no inventário.'));
      }else for(const m of found){
        const open=button(pokemonName(m),()=>{
          if(storageTab==='depot'){
            selectedDepot=m.id;
            renderStorage();
            storageList.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
          }
          party?.open(m.id);
        });
        open.classList.add('layout-economy-pokemon');
        open.setAttribute('aria-label','Abrir ficha de '+pokemonName(m));
        if(storageTab==='depot')open.setAttribute('aria-pressed',String(selected===m));
        const portraitSlot=make('span','layout-economy-portrait-slot');
        const score=individuals.potentialScore(m);
        open.querySelector('span').textContent=Number.isFinite(score)?'N '+score.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'Nv. '+m.level;
        open.prepend(portraitSlot);
        visibleMembers.set(portraitSlot,m);
        storagePortraits.observe(portraitSlot);
        if(storageTab==='depot')open.append(make('small','layout-economy-new','Novo'));
        const fromDepot=storageTab==='depot';
        const tile=make('div','layout-economy-tile'+(fromDepot?'':' layout-economy-tile-pc'));
        const moveLabel=fromDepot?'Enviar ao PC do Centro Pokémon':'Devolver ao Depósito';
        const move=button(moveLabel,()=>moveEconomyPokemon(m,fromDepot));
        move.classList.add('layout-economy-tile-move');
        move.setAttribute('aria-label',moveLabel+' · '+pokemonName(m));
        move.title=moveLabel+(fromDepot?' · sai da lista de venda':' · volta à lista de venda');
        move.querySelector('span').textContent=fromDepot?'↗':'↙';
        move.disabled=!shop?.canMoveDepot(m)||(fromDepot?state.collection.length:depot.length)>=300;
        tile.append(open,move);list.append(tile);
      }
      if(!found.length&&storageTab!=='items')list.append(make('p','',members.length?'Nenhum Pokémon encontrado.':storageTab==='depot'?'As capturas do Modo Economia chegam aqui.':'Aqui aparecem os Pokémon enviados do Depósito ao PC do Centro Pokémon.'));
      if(selected){
          const actions=make('div','layout-economy-toolbar layout-economy-selected');
          const price=shop?.depotPrice(selected),sell=button(price==null?'Protegido':'Vender · '+fmt(price),()=>sellDepot([selected]));
          sell.disabled=price==null;
          actions.append(make('b','',pokemonName(selected)),sell);storageList.append(actions);
      }
      const footer=make('div','layout-economy-toolbar layout-economy-storage-footer');
      if(storageTab==='depot'){
        const bulk=button('Vender todo o Depósito',()=>sellDepot(state.captureDepot));
        bulk.disabled=!eligible.length;
        bulk.classList.add('layout-economy-bulk-sale');
        const summary=make('div','layout-economy-sale-summary'),coins=make('b','','◉ '+fmt(total)+' Coins');
        const collectionLink=button(pc.length+' no PC Pokémon',()=>tabs.get('pc').click());
        collectionLink.classList.add('layout-economy-sale-pc');
        summary.append(make('small','',eligible.length+' para vender · rende'),coins,collectionLink);
        footer.append(summary,bulk);
      }
      if(footer.childElementCount)storageList.append(footer);
      list.scrollTop=scrollTop;
    }
    function pokemonName(m){const info=IDLE_PMD_PORTRAITS.identity(m,LINES);return (m.shiny?'✦ ':'')+info.name}
    let lastEconomy='';
    let syncEconomyNotices;
    function refreshEconomy(title,combatStatus){
      refreshCaptureFilter=()=>refreshEconomy(title,combatStatus);
      const session=state.hunts?.session||{};
      renderStorage();
      const recent=(state.captureLog||[]).filter(entry=>entry.source==='hunt'&&entry.status==='caught'&&entry.time>(state.economyCaptureCutoff||0)&&(!shinyOnly||entry.shiny));
      const roster=[...state.team,...state.collection,...(state.captureDepot||[])];
      const capturesWithMembers=recent.map(entry=>{
        const line=LINES.find(line=>line.ids.includes(entry.speciesId)||line.names.includes(entry.name));
        const member=!entry.converted&&roster.find(member=>entry.memberToken
          ? member.captureToken===entry.memberToken
          : entry.memberCaughtAt&&member.caughtAt===entry.memberCaughtAt&&line?.names.includes(member.name));
        const id=entry.speciesId||line?.ids[line.names.indexOf(entry.name)];
        const types=line?typesOf(line,Math.max(1,line.ids.indexOf(id)+1)).filter(type=>TYPES[type]):[];
        const score=entry.captureScore??(member?IDLE_INDIVIDUALS.potentialScore(member):null);
        return {entry,id,types,memberId:member?.id,score,quality:entry.captureQuality??member?.quality,level:entry.level??member?.captureDetails?.level};
      });
      const sortValue={recent:c=>c.entry.time,score:c=>c.score,iv:c=>c.entry.ivTotal,power:c=>c.entry.potency,quality:c=>c.quality,level:c=>c.level}[captureSort];
      capturesWithMembers.sort((a,b)=>(sortValue(b)??-Infinity)-(sortValue(a)??-Infinity)||b.entry.time-a.entry.time);
      const records=JSON.stringify([shinyOnly,captureSort,capturesWithMembers]);
      const snapshot=JSON.stringify([title,combatStatus,Math.floor(session.seconds||0),session.xp,session.coins,session.loot,session.ballCost,session.supplyCost,session.defeated,session.captures,session.balls,session.potions,session.revives,session.wins,session.battles,records]);
      if(snapshot===lastEconomy)return;
      const seconds=Math.floor(session.seconds||0);
      const activeTime=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(value=>String(value).padStart(2,'0')).join(':');
      economyStatus.textContent=title+' · '+combatStatus+' · '+activeTime+' ativo';
      const perHour=value=>session.seconds>=60?fmt((value||0)*3600/session.seconds)+'/h':'Calculando ritmo';
      const balance=(session.coins||0)+(session.loot||0)-(session.ballCost||0)-(session.supplyCost||0);
      const values=[
        [session.xp,perHour(session.xp)],
        [balance,seconds>=60?fmt(balance*3600/session.seconds)+' Coins/h · estimativa':'Calculando Coins/h'],
        [session.defeated,perHour(session.defeated)+' · '+fmt(session.wins)+' vitórias em '+fmt(session.battles)+' encontros'],
        [session.captures,perHour(session.captures)]
      ];
      metrics.forEach(({cell,value,detail},index)=>{
        const [amount,hint]=values[index];
        value.textContent=fmt(amount)+(index===1?' Coins':'');
        detail.textContent=hint;
        if(index===1)cell.title='Coins recebidos + valor do loot − custo de reposição.';
        cell.classList.toggle('is-negative',index===1&&balance<0);
      });
      supplies.forEach(({key,count})=>{count.textContent=fmt(session[key])});
      [session.coins,session.loot,(session.ballCost||0)+(session.supplyCost||0)].forEach((value,index)=>{cashValues[index].textContent=fmt(value)+' Coins'});
      if(captureList.dataset.records!==records){
        captureList.dataset.records=records;
        captureCountLabel.textContent=recent.length;
        captureList.replaceChildren(...capturesWithMembers.map(({entry,id,types,memberId,score,quality,level},index)=>{
          const row=make('li'),icon=make('img'),name=make('b','',(entry.shiny?'✦ ':'')+entry.name);
          const identity=make('span','layout-economy-capture-identity');
          identity.append(name);
          if(level)identity.append(make('small','','Nv. '+level));
          if(id)icon.src=IDLE_PMD_THUMBNAIL.fromLegacy(IDLE_SHINY.sprite(sprFront(id),entry.shiny));
          icon.alt='';
          const tags=make('span','layout-economy-tags');
          if(entry.potency){const power=make('b','layout-economy-tag','P'+entry.potency);power.dataset.power=entry.potency;tags.append(power)}
          if(entry.ivTotal!=null)tags.append(make('b','layout-economy-tag','IV '+entry.ivTotal));
          if(Number.isFinite(quality))tags.append(make('b','layout-economy-tag','Q '+quality.toLocaleString('pt-BR',{maximumFractionDigits:3})));
          if(Number.isFinite(score))tags.append(make('b','layout-economy-tag','N '+score.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})));
          for(const type of types){
            const badge=make('span','layout-economy-tag layout-economy-type',TYPES[type].n);
            badge.style.setProperty('--type-accent',TYPES[type].c);
            tags.append(badge);
          }
          const time=entry.time?new Date(entry.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'';
          const entryView=make('button','layout-economy-capture');
          entryView.type='button';
          entryView.setAttribute('aria-label',(memberId==null?'Abrir registro de ':'Abrir ficha de ')+entry.name);
          entryView.onclick=()=>{
            const owned=[...state.team,...state.collection,...(state.captureDepot||[])].some(m=>m.id===memberId);
            if(memberId!=null&&owned&&party)party.open(memberId);
            else openCaptureRecord(entry,id,types.map(type=>TYPES[type].n),icon.getAttribute('src'));
          };
          const copy=make('span','layout-economy-capture-copy');
          copy.append(identity,tags);
          entryView.append(make('span','layout-economy-capture-rank',String(index+1)),icon,copy,make('small','layout-economy-capture-time',time));
          row.append(entryView);
          return row;
        }));
        if(!recent.length)captureList.append(make('li','layout-economy-empty',shinyOnly?'Nenhuma captura shiny registrada.':'Nenhuma captura registrada na caçada.'));
      }
      lastEconomy=snapshot;
    }
    const economy=button('Modo Economia',()=>{chooseEconomy(true);restoreScene.focus()});
    economy.classList.add('layout-economy-toggle');
    const immersive=button('Modo Imersivo',()=>{
      const enabled=!layout.classList.contains('layout-immersive');
      if(enabled)chooseEconomy(false);
      setImmersive(enabled);
    });
    let preferEconomy=localStorage.getItem(economyPreference)==='1';
    function chooseEconomy(enabled){
      preferEconomy=enabled;
      localStorage.setItem(economyPreference,enabled?'1':'0');
      setEconomy(enabled);
    }
    function setEconomy(enabled){
      window.IDLE_ARENA_ECONOMY=enabled;
      arena.classList.toggle('layout-arena-suspended',enabled);
      economy.setAttribute('aria-pressed',String(enabled));
      economyInfo.hidden=!enabled;
      syncEconomyNotices?.();
      positionArenaOverlays();
    }
    function setImmersive(enabled){
      layout.classList.toggle('layout-immersive',enabled);
      immersive.setAttribute('aria-pressed',String(enabled));
    }
    const rocketHost=one('#idle-rocket-operation-host',stage);
    let previousImmersive=null;
    function syncRocketImmersion(){
      const inHideout=rocketHost&&!rocketHost.hidden&&rocketHost.dataset.chapter==='celadon';
      if(inHideout&&previousImmersive===null){
        previousImmersive=layout.classList.contains('layout-immersive');
        setEconomy(false);
        setImmersive(true);
      }else if(!inHideout&&previousImmersive!==null){
        setImmersive(previousImmersive);
        previousImmersive=null;
        syncSceneModes();
      }
    }
    if(rocketHost)new MutationObserver(syncRocketImmersion).observe(rocketHost,{attributes:true,attributeFilter:['hidden','data-chapter']});
    function syncSceneModes(){
      const visiting=document.body.classList.contains('idle-center-view')||document.body.classList.contains('rv-native-open');
      const enabled=preferEconomy&&!visiting&&previousImmersive===null;
      if(window.IDLE_ARENA_ECONOMY!==enabled)setEconomy(enabled);
      economy.disabled=visiting;
    }
    new MutationObserver(syncSceneModes).observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!event.defaultPrevented&&layout.classList.contains('layout-immersive')&&!stage.querySelector(':popover-open'))setImmersive(false);
    });
    const fullscreen=button('Tela cheia',proxy('#fsBtn'));
    const sound=button('Som',()=>{toggleMute();syncSound()});
    function syncSound(){
      const muted=String(!!CFG.mute),label=CFG.mute?'Ativar som':'Silenciar som';
      if(sound.getAttribute('aria-pressed')===muted)return;
      sound.setAttribute('aria-pressed',muted);
      sound.setAttribute('aria-label',label);
      sound.title=label;
    }
    syncSound();
    const settings=button('Ajustes',proxy('#gear'));
    fullscreen.classList.add('layout-tool-fullscreen');
    sound.classList.add('layout-tool-sound');
    settings.classList.add('layout-tool-settings');
    economy.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="7" width="17" height="10" rx="2"/><path d="M22 10v4m-9-5-3 3h4l-3 3"/></svg>');
    immersive.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="m10 14 5-5m-4 0h4v4"/></svg>');
    controls.append(fullscreen,economy,immersive,sound,settings);
    const mini=make('div','layout-arena-mini');
    const zoom=button('Ampliar arena',()=>{
      const enlarged=arena.classList.toggle('layout-zoom');
      zoom.setAttribute('aria-pressed',String(enlarged));
      zoom.title=enlarged?'Restaurar zoom da arena':'Ampliar arena';
      zoom.setAttribute('aria-label',zoom.title);
    });
    zoom.classList.add('layout-zoom-button');
    zoom.setAttribute('aria-pressed','false');
    zoom.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M7.5 10.5h6"/><path class="layout-zoom-plus" d="M10.5 7.5v6"/></svg>');
    const captureButton=button('Captura manual',null,item('poke-ball'));
    captureButton.classList.add('layout-capture-button');
    captureButton.setAttribute('aria-expanded','false');
    const captureCount=make('b','layout-capture-count');
    captureCount.hidden=true;
    captureCount.setAttribute('aria-hidden','true');
    captureButton.append(captureCount);
    mini.append(captureButton,button('Registro',quick('Registro'),icons('report')),button('Recompensas',quick('Recompensas'),icons('rewards')),zoom);
    mini.append(synergies);
    const benefits=make('div','layout-arena-benefits');
    arena.append(vp,banner,controls,status,mini,action,benefits);center.append(nav,arena,economyInfo);
    economy.setAttribute('aria-pressed','false');
    setImmersive(false);
    const auto=card('','layout-auto'),disclosure=make('details'),autoBody=make('div','layout-auto-body');
    disclosure.open=true;disclosure.append(make('summary','','Automações'),autoBody);auto.append(disclosure);
    const links=card('','layout-links');
    for(const [label,action,glyph] of [
      ['Loja',quick('Loja'),'<path d="M2 4h3l3 11h11l3-8H6m4 3h9"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>'],
      ['Loja VIP',quick('Loja VIP'),'<path d="m3 6 5 4 4-6 4 6 5-4-2 11H5zM5 20h14"/>'],
      ['RMT',()=>toast('Mercado da Comunidade · Em desenvolvimento.'),'<path d="M3 7h17m-4-4 4 4-4 4m5 6H4m4-4-4 4 4 4"/>']
    ]){
      const shortcut=button(label,action);
      shortcut.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" aria-hidden="true">'+glyph+'</svg>');
      if(label==='RMT')shortcut.title='RMT · Mercado da Comunidade em desenvolvimento';
      links.append(shortcut);
    }
    right.append(auto,links);layout.append(left,center,right);document.body.append(layout);
    const soundControls='button, a[href], input, select, summary, [role="button"]';
    const hoverTarget=soundControls+', .layout-card:not(.layout-arena)';
    const enabledControl=control=>!control.matches(':disabled, [aria-disabled="true"]');
    layout.addEventListener('pointerover',event=>{
      if(event.pointerType==='touch')return;
      const target=event.target.closest(hoverTarget);
      if(!target||!enabledControl(target)||target.contains(event.relatedTarget))return;
      SND.hover();
    });
    layout.addEventListener('click',event=>{
      if(!event.isTrusted)return;
      const control=event.target.closest(soundControls);
      if(!control||!enabledControl(control)||control===sound)return;
      SND.init();
      SND.click();
    },true);
    document.body.classList.add('layout-preview-mode');
    syncEconomyNotices=mountViewportPanels(stage,captureButton,captureCount);
    const nativeHunt=one('.is-hunt',stage);
    function syncBenefits(){
      const current=one(':scope > .is-active-benefits',nativeHunt);
      if(current)benefits.replaceChildren(current);
      else if(benefits.firstChild)benefits.replaceChildren();
    }
    new MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>node instanceof HTMLElement)))syncBenefits();
    }).observe(nativeHunt,{childList:true});
    new ResizeObserver(()=>{
      const height=benefits.offsetHeight;
      stage.style.setProperty('--layout-benefit-notice-gap',(height?height+5:0)+'px');
    }).observe(benefits);
    syncBenefits();
    let lastOverlayPosition='';
    function positionArenaOverlays(){
      const board=stage.getBoundingClientRect(),title=banner.getBoundingClientRect();
      if(!board.width||!board.height)return;
      const left=(title.left-board.left)*stage.offsetWidth/board.width;
      const top=(title.bottom+6-board.top)*stage.offsetHeight/board.height;
      const frame=(window.IDLE_ARENA_ECONOMY?economyInfo:arena).getBoundingClientRect(),noticeTop=Math.max(frame.top,nav.getBoundingClientRect().bottom)+18,noticeCenter=frame.left+frame.width/2;
      const next=[left,top,noticeTop,noticeCenter].map(Math.round).join(',');
      if(next===lastOverlayPosition)return;
      lastOverlayPosition=next;
      stage.style.setProperty('--layout-hoopa-left',left+'px');
      stage.style.setProperty('--layout-hoopa-top',top+'px');
      stage.style.setProperty('--layout-notice-top',noticeTop+'px');
      stage.style.setProperty('--layout-notice-center',noticeCenter+'px');
    }
    syncSceneModes();
    window.dispatchEvent(new Event('resize'));

    const refreshItems=[];
    function buildAutomation(){
      const raw=make('div'),shiny=make('div'),recovery=make('div'),expedition=make('div');
      automation.captureSettings(raw,false,{compact:true});automation.captureSettings(shiny,true,{compact:true});
      automation.recoverySettings(recovery,{compact:true});automation.expeditionSettings(expedition);
      const items=window.IDLE_ITEMS;
      const pickers={
        normalBall:[items.balls,()=>state.capture.ball],
        shinyBall:[items.balls,()=>state.captureShiny.ball],
        healItem:[items.healing,()=>state.hunts.supplies.healItem],
        reviveItem:[items.reviving,()=>state.hunts.supplies.reviveItem]
      };
      function itemPicker(select,key,label){
        const [catalog,selected]=pickers[key],row=make('div','layout-select'),tiles=make('div','layout-item-tiles');
        tiles.setAttribute('role','group');
        tiles.setAttribute('aria-label',label);
        const isBall=catalog===items.balls;
        tiles.style.setProperty('--layout-item-count',select.options.length+Number(isBall));
        for(const option of select.options){
          const id=option.value,entry=catalog[id];
          const tile=button('',()=>{
            select.value=id;
            select.dispatchEvent(new Event('change',{bubbles:true}));
            update();
          },item(entry.sprite));
          const stock=make('small','layout-item-stock');
          stock.setAttribute('aria-hidden','true');
          tile.replaceChildren(one('img',tile),stock);
          tile.disabled=option.disabled;
          function update(){
            const count=catalog===items.balls?items.stock(state,id):state.hunts.supplies[id]||0;
            const pressed=String(selected()===id);
            if(tile.getAttribute('aria-pressed')!==pressed)tile.setAttribute('aria-pressed',pressed);
            if(tile.dataset.stock===String(count))return;
            tile.dataset.stock=String(count);
            stock.textContent=count>999?'999+':count;
            tile.title=entry.name+' · Estoque: '+fmt(count)+' · '+entry.description;
            tile.setAttribute('aria-label',entry.name+', estoque '+fmt(count));
          }
          refreshItems.push(update);
          tiles.append(tile);
        }
        if(isBall){
          const resources=window.IDLE_RESOURCES;
          const tile=button('',null,resources.image('mysticBalls'));
          const stock=make('small','layout-item-stock');
          tile.replaceChildren(one('img',tile),stock);
          tile.disabled=true;
          tile.classList.add('layout-mystic-tile');
          refreshItems.push(()=>{
            const count=state.resources?.mysticBalls||0;
            if(tile.dataset.stock===String(count))return;
            tile.dataset.stock=String(count);
            stock.textContent=count>999?'999+':count;
            tile.title='Mystic Ball · Estoque: '+fmt(count)+' · Uso exclusivo em encontros Mystic';
            tile.setAttribute('aria-label',tile.title);
          });
          tiles.append(tile);
        }
        row.append(make('span','',label),tiles);
        return row;
      }
      const take=(root,key,label)=>{
        const original=one('[data-capture-field="'+key+'"],[data-supply-field="'+key+'"]',root);
        if(!original)return make('div');
        const input=one('input,select',original);
        if(!input)return original;
        if(pickers[key])return itemPicker(input,key,label);
        const field=make('label',input.type==='checkbox'?'layout-switch':'layout-select');
        if(input.type==='checkbox')field.append(input,make('span','',label));
        else {
          input.setAttribute('aria-label',label);
          field.append(make('span','',label),input);
        }
        return field;
      };
      const capture=take(raw,'enabled','Captura automática');capture.append(make('small','layout-vip-tag','VIP'));
      const heal=take(recovery,'heal','Curar automaticamente'),revive=take(recovery,'revive','Reviver automaticamente');
      const value=one('[data-supply-field=threshold] input',recovery);
      const slider=make('input');slider.type='range';slider.min=1;slider.max=100;slider.value=value?.value||75;
      const output=make('output','',slider.value+'%');slider.setAttribute('aria-label','Iniciar cura com PS abaixo de');
      const updateThreshold=()=>{
        output.textContent=slider.value+'%';
        slider.style.setProperty('--layout-heal-fill',slider.value+'%');
      };
      slider.oninput=updateThreshold;
      updateThreshold();
      slider.onchange=()=>{if(value){value.value=slider.value;value.dispatchEvent(new Event('change',{bubbles:true}))}};
      const threshold=make('label','layout-threshold');threshold.append(make('span','','Iniciar cura com PS abaixo de'),slider,output);
      autoBody.append(
        capture,
        take(raw,'normalBall','Bola (normal)'),
        take(shiny,'shinyBall','Bola (shiny)'),
        take(recovery,'healItem','Item de cura'),
        take(recovery,'reviveItem','Item para reviver'),
        make('hr'),heal,revive,threshold,make('hr'),
        take(expedition,'autoAdvance','Avançar após 3 vitórias'),
        take(recovery,'afterDefeat','Continuar após derrota')
      );
      const more=make('details','layout-auto-more'),options=make('div','layout-auto-options');
      options.append(
        take(raw,'duplicates','Capturas repetidas'),
        take(raw,'offline','Capturas offline'),
        take(raw,'bankLocked','Trancar banco'),
        button('Configuração completa',quick('Automação'),icons('automation'))
      );
      more.append(make('summary','','Mais opções'),options);
      autoBody.append(more);
    }
    buildAutomation();

    function portrait(member){
      const canvas=IDLE_PMD_PORTRAITS.member(member,LINES);
      canvas.setAttribute('aria-label',IDLE_PMD_PORTRAITS.identity(member,LINES).name);return canvas;
    }
    function meter(label,ratio){
      const meter=make('div','layout-meter '+label.toLowerCase()),bar=make('i');
      const percent=Math.round(Math.max(0,Math.min(1,ratio))*100);
      bar.style.width=percent+'%';meter.append(bar,make('span','',label+' '+percent+'%'));return meter;
    }
    const gains=new Map();
    function trackGain(key,level,xp,coins=0){
      const now=performance.now(),previous=gains.get(key);
      if(!previous){gains.set(key,{level,xp,coins});return}
      if(previous.until<=now){previous.xpGain=0;previous.coinGain=0;previous.levelGain=0}
      if(level>previous.level||level===previous.level&&xp>previous.xp||coins>previous.coins){
        let earned=xp-previous.xp;
        for(let lv=previous.level;lv<level;lv++)earned+=IDLE_XP.need(lv);
        previous.xpGain=(previous.xpGain||0)+Math.max(0,earned);
        previous.coinGain=(previous.coinGain||0)+Math.max(0,coins-previous.coins);
        previous.levelGain=(previous.levelGain||0)+Math.max(0,level-previous.level);
        previous.until=now+1300;
      }
      Object.assign(previous,{level,xp,coins});
    }
    function paintGain(node,key){
      const gain=gains.get(key),visible=gain?.until>performance.now();
      const text=visible?[gain.xpGain?'+'+fmt(gain.xpGain)+' XP':'',gain.coinGain?'+'+fmt(gain.coinGain)+' Coins':'',gain.levelGain?'Nível +'+gain.levelGain:''].filter(Boolean).join(' · '):'';
      let badge=node.querySelector('.layout-gain');
      if(!text){badge?.remove();node.classList.remove('layout-level-gain');return}
      if(!badge){badge=make('span','layout-gain');badge.setAttribute('aria-hidden','true');node.append(badge)}
      if(badge.dataset.gain!==text){
        badge.dataset.gain=text;
        badge.replaceChildren(...[
          ['xp',gain.xpGain?'+'+fmt(gain.xpGain)+' XP':''],
          ['coins',gain.coinGain?'+'+fmt(gain.coinGain)+' Coins':''],
          ['level',gain.levelGain?'Nível +'+gain.levelGain:'']
        ].filter(([,label])=>label).map(([kind,label])=>make('span','layout-gain-'+kind,label)));
      }
      node.classList.toggle('layout-level-gain',!!gain.levelGain);
    }
    function memberRow(m){
      const b=button('',()=>party?.open(m.id)),name=IDLE_PMD_PORTRAITS.identity(m,LINES).name;
      b.className='layout-member';b.replaceChildren(portrait(m));
      const words=make('div');words.append(make('b','',name),make('small','','Nv. '+m.level));
      const bars=make('div','layout-bars'),live=typeof B!=='undefined'&&B.on?B.units.find(u=>u._idleId===m.id || u._idleMember===m.id):null;
      bars.append(meter('PS',live?live.hp/live.maxHp:m.condition??1),meter('XP',(m.xp||0)/IDLE_XP.need(m.level)));b.append(words,bars);b.dataset.memberId=m.id;return b;
    }
    let last='',lastFarm='',lastTrainer='',lastCombat='',lastEconomyUpdate=0,feed=[];
    function refresh(){
      syncSound();
      positionArenaOverlays();
      refreshItems.forEach(update=>update());
      const members=state.team,active=members.filter(m=>m.pos?.z==='b'),reserve=members.filter(m=>m.pos?.z==='n').sort((a,b)=>a.pos.i-b.pos.i);
      for(const m of active)trackGain('field:'+m.id,m.level,m.xp||0);
      const data=JSON.stringify(members.map(m=>[m.id,m.name,m.level,m.star,m.xp,m.condition,m.shiny,m.megaKey,m.pos,typeof B!=='undefined'&&B.on?Math.round(B.units.find(u=>u._idleId===m.id || u._idleMember===m.id)?.hp||0):0]));
      if(data!==last){
        const focused=document.activeElement?.dataset.memberId;
        fieldList.replaceChildren(...active.map(m=>{const row=memberRow(m);row.dataset.memberId=m.id;return row}));
        benchList.replaceChildren(...reserve.map(m=>{const row=memberRow(m);row.dataset.memberId=m.id;return row}));
        slots.replaceChildren(...Array.from({length:9},(_,i)=>{
          const m=reserve.find(x=>x.pos.i===i),slot=make('span',m?'occupied':'');
          slot.title=m?'Vaga '+(i+1)+' ocupada':'Vaga '+(i+1)+' livre';return slot;
        }));
        if(focused)[...layout.querySelectorAll('[data-member-id]')].find(el=>el.dataset.memberId===focused)?.focus({preventScroll:true});
        last=data;
      }
      const fieldTitle='Campo · '+active.length+'/6',benchTitle='Banco · '+reserve.length+'/9';
      if(fieldCard.title.textContent!==fieldTitle)fieldCard.title.textContent=fieldTitle;
      if(benchTab.textContent!==benchTitle)benchTab.querySelector('span').textContent=benchTitle;
      for(const row of fieldList.children)paintGain(row,'field:'+row.dataset.memberId);
      {
        const village=state.village;
        const assigned=new Set((village?.roster||[]).filter(p=>p.place==='farm'&&village.houses?.some(h=>h.id===p.houseId)).map(p=>p.key));
        const residents=state.collection.filter(m=>assigned.has(m.id));
        for(const m of residents)trackGain('farm:'+m.id,m.level,m.xp||0);
        const farmData=JSON.stringify(residents.map(m=>[m.id,m.name,m.level,m.star,m.xp,m.condition,m.shiny,m.megaKey]));
        if(!farmList.hidden&&farmData!==lastFarm){
          farmList.replaceChildren(...residents.map(memberRow));
          if(!residents.length)farmList.append(make('p','layout-farm-empty','Nenhum Pokémon em treinamento.'));
          lastFarm=farmData;
        }
        if(!farmList.hidden)for(const row of farmList.querySelectorAll('[data-member-id]'))paintGain(row,'farm:'+row.dataset.memberId);
      }
      const vipSeconds=IDLE_VIP.membership(state),diamonds=state.vip?.credits||0;
      trackGain('trainer',state.trainerLevel,state.trainerXp||0,state.gold||0);
      const trainer=JSON.stringify([state.idleProfile?.name,state.trainerLevel,state.trainerXp,state.gold,diamonds,vipSeconds>0]);
      if(trainer!==lastTrainer){
        const identity=make('button','layout-trainer-id'),native=one('.is-trainer img');
        identity.type='button';
        identity.setAttribute('aria-label','Abrir cartão do treinador');
        identity.setAttribute('aria-haspopup','dialog');
        identity.onclick=proxy('.is-trainer');
        if(native)identity.append(native.cloneNode());
        const copy=make('div'),progress=meter('XP',(state.trainerXp||0)/IDLE_XP.need(state.trainerLevel));
        const xpLabel=progress.querySelector('span'),xpLine=make('div','layout-trainer-xp');
        xpLabel.textContent=fmt(state.trainerXp||0)+' / '+fmt(IDLE_XP.need(state.trainerLevel))+' XP';
        xpLine.append(progress);
        copy.append(make('strong','',state.idleProfile?.name||'Treinador'),make('small','','Nível '+state.trainerLevel),xpLine);identity.append(copy);
        const wallet=make('div','layout-wallet');
        const vip=make('button','layout-vip-tag'+(vipSeconds>0?'':' is-inactive'));
        const badgeIcon=(name)=>{const img=make('img');img.src='modes/idle/assets/menu-icons/'+name+'.svg';img.alt='';return img};
        vip.append(badgeIcon('vip'),make('span','layout-vip-bonus',vipSeconds>0?'VIP · +50% XP':'VIP inativo'),make('span','layout-vip-time'));
        vip.setAttribute('aria-label',vipSeconds>0?'VIP ativo':'VIP inativo');
        vip.type='button';vip.onclick=()=>vipDetails.hidden=!vipDetails.hidden;
        const vipDetails=make('div','layout-vip-details');vipDetails.hidden=trainerCard.content.querySelector('.layout-vip-details')?.hidden??true;
        const compact=new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1});
        const coins=make('b','layout-coins','◉ '+compact.format(state.gold)+' Coins');
        coins.title=fmt(state.gold)+' Coins';
        const gems=make('b','layout-diamonds');
        gems.append(badgeIcon('diamond'),make('span','',fmt(diamonds)));
        gems.title=fmt(diamonds)+' Diamantes';
        wallet.append(coins,gems);
        const presence=make('div','layout-trainer-online');
        presence.append(make('span','layout-trainer-online-dot'),make('span','layout-trainer-online-label'));
        presence.append(make('span','layout-trainer-beta','Beta 0.1.0'));
        trainerCard.content.replaceChildren(identity,wallet,vip,vipDetails,presence);lastTrainer=trainer;
      }
      const remaining=Math.max(0,IDLE_XP.need(state.trainerLevel)-(state.trainerXp||0)),session=state.hunts?.session;
      const rate=session?.seconds>=60?session.xp*3600/session.seconds:0;
      const xpInfo=fmt(remaining)+' XP para o próximo nível'+(rate>0?' · '+fmt(rate)+' XP/h · ~'+Math.max(1,Math.ceil(remaining*60/rate))+' min':'');
      one('.layout-trainer-xp',trainerCard.content).title=xpInfo;
      const vipInfo=vipSeconds>0?'Restam '+Math.ceil(vipSeconds/3600)+' h · +50% XP, captura automática e até 12 h de farm offline.':'VIP inativo.';
      one('.layout-vip-tag',trainerCard.content).title=vipInfo;
      const vipTime=one('.layout-vip-time',trainerCard.content);
      const timeLabel=vipSeconds>=86400?Math.ceil(vipSeconds/86400)+' d':vipSeconds>0?Math.ceil(vipSeconds/3600)+' h':'';
      if(vipTime.textContent!==timeLabel)vipTime.textContent=timeLabel;
      const vipDetails=one('.layout-vip-details',trainerCard.content);
      if(vipDetails.textContent!==vipInfo)vipDetails.textContent=vipInfo;
      const onlineCount=window.IDLE_ACCOUNT_IDENTITY?.onlineCount;
      const presence=one('.layout-trainer-online',trainerCard.content);
      const onlineLabel=onlineCount==null?'Presença indisponível':fmt(onlineCount)+' '+(onlineCount===1?'jogador online':'jogadores online');
      presence.classList.toggle('is-live',onlineCount!=null);
      const presenceLabel=one('.layout-trainer-online-label',presence);
      if(presenceLabel.textContent!==onlineLabel)presenceLabel.textContent=onlineLabel;
      paintGain(one('.layout-wallet',trainerCard.content),'trainer');
      const hunt=one('.is-hunt'),liveTitle=hunt?.querySelector('h2,h3,strong')?.textContent||'Trilhas de Viridian',wave=state.hunts?.wave||1;
      if(banner.dataset.label!==liveTitle+wave){banner.replaceChildren(make('b','',liveTitle),make('span','','Onda '+wave+'/10'));banner.dataset.label=liveTitle+wave}
      const combat=one('#combatbtn')?.dataset.deviceLabel||one('#combatbtn')?.textContent.trim()||'Explorar';
      one('span',action).textContent=combat;
      const nextCombat=(G.phase==='combat'?'Encontro em andamento':'Preparação da equipe')+' · Onda '+wave+'/10';
      const now=performance.now();
      if(window.IDLE_ARENA_ECONOMY&&now-lastEconomyUpdate>=900){lastEconomyUpdate=now;refreshEconomy(liveTitle,nextCombat)}
      if(nextCombat!==lastCombat){
        feed=[nextCombat,...feed].slice(0,3);
        status.replaceChildren(...feed.map(text=>make('span','',text)));lastCombat=nextCombat;
      }
      if(synergies.open&&one('#traits')?.innerHTML!==traits.dataset.source){
        traits.dataset.source=one('#traits')?.innerHTML||'';traits.innerHTML=traits.dataset.source;
        traits.querySelectorAll('.trait-detail,.trait-anim').forEach(node=>node.remove());
        traits.querySelectorAll('.trait-expanded,.trait-gain,.trait-level').forEach(node=>node.classList.remove('trait-expanded','trait-gain','trait-level'));
        traits.querySelectorAll('[data-trait]').forEach(row=>{row.tabIndex=0});
        showTraitBonus(traits.querySelector('[data-trait]:hover'));
      }
    }
    refresh();setInterval(refresh,350);
    let viewportResizeFrame=0;
    new ResizeObserver(()=>{
      if(viewportResizeFrame)return;
      viewportResizeFrame=requestAnimationFrame(()=>{
        viewportResizeFrame=0;
        window.dispatchEvent(new Event('resize'));
      });
    }).observe(vp);
    const hoopaLayout=new ResizeObserver(positionArenaOverlays);
    hoopaLayout.observe(stage);
    hoopaLayout.observe(banner);
    window.addEventListener('resize',()=>requestAnimationFrame(positionArenaOverlays));
    window.addEventListener('scroll',positionArenaOverlays,{passive:true});
    positionArenaOverlays();
  }
  const ready=setInterval(()=>{
    if(!window.OAK_GAME_INITIALIZED||!automation||!one('.is-navigation'))return;
    clearInterval(ready);mount();
  },50);
})();
