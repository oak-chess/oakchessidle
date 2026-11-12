/* Account matchmaking and authoritative combat. No local results are uploaded. */
window.createIdleArenaPreview = function(ctx) {
  let root, opener, account = null, opponent = null, offerId = null, busy = false, epoch = 0, currentNotice;
  const E = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const fmt = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('pt-BR');
  const button = (label, action, cls) => {
    const node = E('button', cls, label);
    node.type = 'button'; node.title = label;
    node.onclick = () => { SND.init(); SND.click(); action(); };
    node.onmouseenter = () => SND.hover();
    return node;
  };
  function localTeam() {
    return ctx.state.team.filter(member => member.pos?.z === 'b').map(member => {
      const identity = IDLE_PMD_PORTRAITS.identity(member, LINES);
      return { pokemon_id: LINES.find(line => line.names[0] === member.name)?.ids[member.star - 1],
        name: identity.name, form: identity.form, shiny: member.shiny === true, level: member.level,
        power: window.IDLE_TRAINER_CARD?.strength(member) || 0 };
    });
  }
  function mon(member) {
    const node = IDLE_TRAINER_CARD.portrait(member.pokemon_id, member.shiny === true, member.form || 0);
    node.classList.add('ap-mon'); node.setAttribute('aria-label', member.name || species(member.pokemon_id));
    return node;
  }
  function species(id) {
    const line = LINES.find(line => line.ids.includes(id));
    return line?.names[line.ids.indexOf(id)] || 'Pokémon #' + id;
  }
  function portrait(id) {
    const node = IDLE_TRAINER_PORTRAITS.render({ portrait: id || 'art-red' });
    node.classList.add('ap-face'); return node;
  }
  function fit() {
    if (!root || root.hidden || root.hasAttribute('popover')) return;
    const parent = root.offsetParent || root.parentElement, rect = parent.getBoundingClientRect();
    const scale = rect.width / parent.offsetWidth || 1;
    const width = Math.min(1360, innerWidth - 24, (innerHeight - 24) * 1.5);
    for (const [key, value] of Object.entries({ width: width / scale + 'px', height: width / scale / 1.5 + 'px',
      left: (innerWidth / 2 - rect.left) / scale + 'px', top: (innerHeight / 2 - rect.top) / scale + 'px' })) {
      root.style.setProperty(key, value, 'important');
    }
  }
  async function request(action, params) {
    if (!window.IDLE_ACCOUNT_IDENTITY?.arena) throw Error('A conexão da Arena está sendo preparada.');
    return window.IDLE_ACCOUNT_IDENTITY.arena(action, params);
  }
  async function perform(action) {
    if (busy) return;
    const requestEpoch = epoch; busy = true; currentNotice = ''; draw();
    try { await action(requestEpoch); }
    catch (error) { if (requestEpoch === epoch) currentNotice = error.message || 'Não foi possível acessar a Arena.'; }
    finally { if (requestEpoch === epoch) { busy = false; draw(); } }
  }
  function search() {
    return perform(async requestEpoch => {
      if (!account) {
        account = await request('status');
        if (requestEpoch !== epoch) return;
      }
      if (account.trainerLevel < 200) {
        currentNotice = 'Arena bloqueada: alcance o nível 200 de treinador.';
        return;
      }
      if (!account.defense?.length) {
        currentNotice = 'Salve seis Pokémon na equipe de defesa antes de buscar.';
        return;
      }
      const result = await request('search');
      if (requestEpoch !== epoch) return;
      opponent = result.opponent || null;
      offerId = result.offerId || null;
      currentNotice = opponent ? 'Adversário encontrado. Equipe de defesa registrada.'
        : 'Nenhum adversário próximo disponível. Tente novamente mais tarde.';
    });
  }
  function fight(){
    if(!opponent||!offerId||busy)return;
    const rival=opponent;
    return perform(async requestEpoch=>{
      ctx.pause?.();
      const result=await request('play',{offerId});
      if(requestEpoch!==epoch)return;
      const toIntro=m=>({id:m.pokemon_id,level:m.level,shiny:m.combat_data?.shiny===true,name:species(m.pokemon_id)});
      const intro=await window.IDLE_ARENA_INTRO?.play({
        player:{name:IDLE_ACCOUNT_IDENTITY.name,portrait:ctx.state.idleProfile?.portrait||'art-red'},
        opponent:{name:rival.username,portrait:rival.portrait},
        own:result.snapshot.allies.map(toIntro),roster:result.snapshot.enemies.map(toIntro),
        renderPokemon:(id,_name,shiny,form)=>IDLE_TRAINER_CARD.portrait(id,shiny,form)});
      if(requestEpoch!==epoch)return;
      if(intro!==false)await window.IDLE_ARENA_REPLAY.play(result);
      if(requestEpoch!==epoch)return;
      account=await request('status');opponent=null;offerId=null;
      currentNotice=result.winner===-1?'Empate · nenhum ponto alterado.':result.winner===0?'Vitória confirmada · +30 pontos.':'Derrota registrada · '+result.delta+' pontos.';
    });
  }
  function history(){
    return perform(async requestEpoch=>{
      const rows=await request('history');if(requestEpoch!==epoch)return;
      // Draw after perform's finally replaces the DOM.
      setTimeout(()=>{
        if(requestEpoch!==epoch||root.hidden)return;
        const box=E('section','ap-notice aq-picker');
        box.append(E('h3','','Histórico da Arena'));
        const list=E('div','aq-picker-list');list.style.gridTemplateColumns='1fr';
        for(const row of rows){list.append(E('p','',
          (row.winner===0?'Vitória':row.winner===1?'Derrota':'Empate')+' · '+row.opponent+' · '+new Date(row.at).toLocaleString('pt-BR')+' · '+(row.delta>=0?'+':'')+row.delta+' pts'))}
        if(!rows.length)list.append(E('p','','Nenhuma partida registrada.'));
        box.append(list,button('Fechar',()=>box.remove(),'ap-dismiss'));root.append(box);
      },0);
    });
  }
  function defensePicker() {
    root.querySelector('.aq-picker')?.remove();
    const box = E('section', 'ap-notice aq-picker');
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Equipe de defesa');
    box.append(E('h3', '', 'Salvar equipe de defesa'), E('p', '', 'Escolha seis Pokémon registrados na sua conta.'));
    const chosen = new Set((account?.defense || []).map(member => member.id));
    const list = E('div', 'aq-picker-list');
    for (const member of account?.available || []) {
      const label = E('label', 'aq-picker-choice'), input = E('input');
      input.type = 'checkbox'; input.checked = chosen.has(member.id);
      input.onchange = () => {
        if (input.checked && chosen.size >= 6) { input.checked = false; return; }
        if (input.checked) chosen.add(member.id); else chosen.delete(member.id);
        save.disabled = chosen.size !== 6;
        count.textContent = chosen.size + ' / 6 selecionados';
      };
      label.append(input, mon(member), E('span', '', species(member.pokemon_id) + ' · Nv. ' + member.level));
      list.append(label);
    }
    if (!list.children.length) list.append(E('p', '', 'Nenhum Pokémon disponível no inventário online.'));
    const count = E('p', '', chosen.size + ' / 6 selecionados');
    const save = button('Salvar defesa', () => {
      const ids = [...chosen];
      perform(async requestEpoch => {
        const result = await request('defense', { p_inventory_ids: ids,
          p_portrait: ctx.state.idleProfile?.portrait || 'art-red' });
        if (requestEpoch === epoch) { account = result; opponent = null; currentNotice = 'Equipe de defesa salva.'; }
      });
    }, 'ap-dismiss');
    save.disabled = chosen.size !== 6;
    box.append(list, count, save, button('Cancelar', () => box.remove(), 'ap-dismiss'));
    root.append(box); box.querySelector('input,button')?.focus();
  }
  function draw() {
    if (!root || root.hidden) return;
    root.replaceChildren();
    root.append(E('h2', 'ap-sr', 'Arena · buscar adversário'),
      E('span', 'ap-season', 'Arena · ' + fmt(account?.points) + ' pts'),
      E('span', 'ap-timer', 'Equipes de jogadores reais'),
      E('span', 'ap-charges', 'PvP assíncrono'),
      button('', () => close(true), 'ap-close'));
    root.querySelector('.ap-close').setAttribute('aria-label', 'Fechar Arena');

    const searchBox = E('section', 'aq-search');
    searchBox.append(E('h3', 'aq-search-title', 'BUSCAR ADVERSÁRIO'));
    const body = E('div', 'aq-search-body');
    const levelLocked = !!account && Number(account.trainerLevel) < 200;
    const rosterLocked = !!account && (account.available?.length || 0) < 6;
    const art = E('i', 'aq-search-icon layout-nav-art layout-nav-hunts');
    art.setAttribute('aria-hidden', 'true');
    body.append(art, E('h4', '', busy ? 'Conectando à Arena…' : levelLocked || rosterLocked ? 'Arena bloqueada' : opponent ? 'Seu próximo confronto' : 'Encontre seu próximo rival'),
      E('p', '', 'Enfrente a equipe de defesa de outro treinador, mesmo quando ele estiver offline.'));
    const stats = E('div', 'aq-stats');
    for (const [name, value] of [['Pontos', account?.points], ['Vitórias', account?.wins], ['Derrotas', account?.losses]]) {
      const stat = E('div'); stat.append(E('small', '', name), E('strong', '', fmt(value))); stats.append(stat);
    }
    body.append(stats);
    const seek = button(opponent ? 'Buscar outro adversário' : 'Buscar adversário', search, 'aq-seek');
    seek.disabled = busy || levelLocked || rosterLocked;
    body.append(seek);
    const save = button('Salvar equipe de defesa', async () => {
      if (!account) await perform(async requestEpoch => {
        const result = await request('status');
        if (requestEpoch === epoch) account = result;
      });
      if (account && !root.hidden) defensePicker();
    }, 'aq-save-defense');
    save.disabled = busy || levelLocked || rosterLocked; body.append(save);
    body.append(E('p', 'aq-message', levelLocked
      ? 'Requer nível 200 de treinador · seu nível online: ' + fmt(account.trainerLevel)
      : rosterLocked ? 'Requer seis Pokémon disponíveis na conta online · ' + fmt(account.available?.length) + ' / 6'
      : currentNotice || (account?.defense?.length
      ? 'Busca por pontuação próxima · somente ao clicar.'
      : 'Salve sua equipe de defesa para participar.')));
    const ranks = button('Ver ranking mensal', () => { close(); window.IDLE_MONTHLY_RANKINGS?.open(); }, 'aq-ranks');
    body.append(ranks); searchBox.append(body); root.append(searchBox);

    const detail = E('section', 'ap-detail');
    if (opponent) {
      detail.append(portrait(opponent.portrait), E('h3', 'ap-enemy-name', opponent.username),
        E('strong', 'ap-place', fmt(opponent.points) + ' pts'),
        E('span', 'ap-power-label', 'Equipe de defesa'));
      const roster = E('div', 'ap-enemies');
      for (const member of opponent.roster) {
        const slot = E('div', 'ap-enemy');
        slot.append(mon(member), E('b', '', species(member.pokemon_id)), E('small', '', 'Nv. ' + member.level));
        roster.append(slot);
      }
      detail.append(roster);
    } else {
      const empty = E('div', 'aq-opponent-empty');
      empty.append(E('b', '', 'Aguardando adversário'), E('p', '', 'A equipe encontrada aparecerá aqui.'));
      detail.append(empty);
    }
    const rules = E('div', 'ap-rules');
    rules.append(E('span', '', 'Vitória: +30 pontos · Derrota: −15'),
      E('span', '', 'O resultado será confirmado pelo servidor.'));
    detail.append(rules); root.append(detail);
    const challenge = button('', fight, 'ap-challenge');
    challenge.disabled = busy || !opponent || !offerId;
    challenge.setAttribute('aria-label', 'Desafiar adversário');
    root.append(challenge, E('small', 'ap-challenge-note',
      opponent ? 'Resultado confirmado pelo servidor' : 'Busque um adversário para continuar'));

    const own = account?.defense?.length ? account.defense : localTeam(), bar = E('div', 'ap-own');
    for (let index = 0; index < 6; index++) {
      const slot = E('div', 'ap-own-slot'), member = own[index];
      if (member) slot.append(mon(member), E('b', '', member.name || species(member.pokemon_id)), E('small', '', 'Nv. ' + member.level));
      else slot.append(E('small', '', 'Vaga livre'));
      bar.append(slot);
    }
    root.append(bar);
    const total = E('div', 'ap-total');
    total.append(E('small', '', account?.defense?.length ? 'Defesa salva' : 'Equipe atual'),
      E('strong', '', own.length + ' / 6'));
    root.append(total, button('', () => { close(); ctx.adjust(); }, 'ap-adjust'),
      button('', history, 'ap-history'),
      button('', () => { close(); window.IDLE_MONTHLY_RANKINGS?.open(); }, 'ap-rewards'));
    root.querySelector('.ap-adjust').setAttribute('aria-label', 'Ajustar equipe');
    root.querySelector('.ap-history').setAttribute('aria-label', 'Ver histórico mensal');
    root.querySelector('.ap-rewards').setAttribute('aria-label', 'Ver premiações mensais');
  }
  function open() {
    opener = document.activeElement; ctx.closePanels(); epoch++; busy = false;
    root.hidden = false; SND.init(); draw(); fit();
    root.querySelector('.ap-close').focus();
    perform(async requestEpoch => {
      const result = await request('status');
      if (requestEpoch === epoch) account = result;
    });
  }
  function close(restore = false) {
    epoch++; busy = false;
    window.IDLE_ARENA_INTRO?.cancel();
    if (root) root.hidden = true;
    if (restore) opener?.focus?.();
  }
  function mount(stage) {
    root = E('section', 'idle-window ap-panel aq-panel');
    root.id = 'idle-arena-preview'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Arena · buscar adversário');
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(true); }
      if (event.key === 'Tab') {
        const scope = root.querySelector('.aq-picker') || root;
        const nodes = [...scope.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        const first = nodes[0], last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    });
    stage.append(root);
  }
  window.addEventListener('resize', fit);
  return { mount, open, close, dismissLedger: () => false, isOpen: () => !!root && !root.hidden };
};
