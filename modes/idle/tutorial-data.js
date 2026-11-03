/* One instruction at a time. Exact prices and advanced recipes remain in their panels/Wiki. */
window.IDLE_TUTORIAL_DATA=(()=>{
 const step=(text,panel=null,target=null)=>({text,panel,target}),topic=(id,title,steps)=>({id,title,steps});
 const full=[
  topic('screen','Seu treinador e a tela',[
   step('Clique no cartão do treinador, no canto esquerdo, para abrir seu tablet. Ele reúne seu progresso, insígnias e personalização.','trainer','.is-trainer'),
   step('O saldo de Coins fica abaixo dos controles do canto superior direito. Valores grandes aparecem em mi, bi ou tri; passe o mouse para ver o total completo.',null,'#idle-coins-balance'),
   step('Os cartões abaixo mostram os Pokémon em campo. Verde é vida; azul é experiência. O ganho de XP e o novo nível aparecem animados; subir de nível recupera toda a vida.','party','.is-team')]),
  topic('team','Prepare a equipe',[
   step('Na preparação, arraste os Pokémon entre o tabuleiro e o banco. O limite em campo cresce com o treinador até seis parceiros; o banco tem nove vagas.',null,'.is-team'),
   step('Distribua a equipe pelo tabuleiro e confira as sinergias de tipos. Clique em um cartão para ver golpes e atributos. Você pode minimizar o quadro de sinergias pela seta.','party','.is-synergies'),
   step('Sua equipe e os adversários escolhem os golpes conforme dano, tipos, energia e recargas. Confira Fraquezas e resistências na ficha: mudar a formação pode ajudar mais que subir níveis.','party','.is-navigation [data-menu=pokemon]')]),
  topic('hunt','Escolha onde explorar',[
   step('Abra Caçadas, selecione uma área e confira seus níveis e habitantes. Para procurar uma espécie em outras regiões, digite o nome dela na busca.','hunts','.is-navigation [data-menu=hunts]'),
   step('Cada caçada tem dez ondas; três vitórias liberam a seguinte. As ondas sobem 5 níveis, exceto na região inicial. Recuar permite treinar antes de avançar. Configure a continuidade na Automação. Quando terminar o guia, use EXPLORAR para começar; o mesmo botão pausa a caçada.','expedition','#combatbtn')]),
  topic('capture','Configure as capturas',[
   step('Na Automação, ligue Captura automática e escolha as bolas para Pokémon normais e shiny. A tentativa acontece nos selvagens elegíveis derrotados. Sem a bola escolhida, nenhuma outra é consumida.','capture','.is-quick [aria-label=Automação]'),
   step('Em Focar captura, escolha um habitante da caçada atual para economizar bolas. A opção de capturar também shiny de outras espécies é separada.','capture','.is-quick [aria-label=Automação]'),
   step('Escolha o destino dos repetidos. Trancar banco envia novas capturas ao PC; as regras de conversão em doces continuam valendo. Ative a proteção automática para boas capturas.','capture','.is-supply-hud')]),
  topic('recovery','Prepare a recuperação',[
   step('Na Automação, escolha a poção, o Revive e a porcentagem de vida que inicia a cura. A poção é repetida até completar a vida, enquanto houver estoque. Revive usa uma unidade por desmaiado em campo.','recovery','.is-quick [aria-label=Automação]'),
   step('Compre suprimentos na Loja e confira o estoque. Os ícones no canto inferior direito permitem trocar os itens selecionados. Para recuperar a equipe de graça, visite a enfermeira no Centro.','shop','.is-supply-hud')]),
  topic('quality','Entenda seus parceiros',[
   step('Na ficha, compare nível, potência P1–P5, Nature e IVs antes de trocar um parceiro. A potência é a qualidade do indivíduo; não é a mesma coisa que a raridade da espécie.','party','.is-navigation [data-menu=pokemon]'),
   step('O shiny tem visual próprio e aviso especial. A garantia de '+window.IDLE_SHINY.guarantee.toLocaleString('pt-BR')+' encontros elegíveis sem shiny garante o aparecimento, não a captura. O som shiny toca mesmo com os sons comuns silenciados.','shiny','.is-quick [aria-label=Automação]')]),
  topic('center','Use o Centro Pokémon',[
   step('Abra Centro e converse com a enfermeira ou Chansey para recuperar a equipe gratuitamente. Confirme o atendimento; o descanso encerra a caçada.','center','.is-navigation [data-menu=center]'),
   step('Os NPCs do cenário abrem PC, evolução, loja, incubadora, tarefas, Gachapon e a oficina do Professor Carvalho. A Vila possui um botão próprio e não substitui o Centro.','center','.is-navigation [data-menu=center]')]),
  topic('pc','Organize o PC',[
   step('Use os filtros e a busca do PC para encontrar um parceiro. Compare repetidos antes de decidir quem vai para o banco e quem fica guardado.','pc','.is-navigation [data-menu=pokemon]'),
   step('A estrela marca um favorito; o cadeado protege contra venda. Favoritos, protegidos e parceiros ocupados ficam resguardados na venda da Loja.','pc','.is-navigation [data-menu=pokemon]')]),
  topic('evolution','Evolua no momento certo',[
   step('Abra Evolução, escolha um Pokémon e veja o que falta: nível, pedra, amizade, item ou outra condição da espécie. As pedras servem às evoluções que pedem aquele item.','evolution','.is-navigation [data-menu=evolution]'),
   step('Confirme a evolução no Centro, fora da caçada. Pokémon guardados no PC também podem evoluir. O painel fecha e as duas formas brilham até a transformação final. Nível, IVs e proteções são preservados.','evolution','.is-navigation [data-menu=evolution]')]),
  topic('inventory','Cuide dos recursos',[
   step('O Pokéfone reúne seus aplicativos. Abra Inventário para consultar os itens que possui; PokéNav encontra caçadas, Registros acompanha atividades e finanças, e Avisos reúne suas novidades.','bag','.is-navigation [data-menu=bag]'),
   step('Na Loja, digite a quantidade que quer comprar ou vender. Em Vender loot, a venda automática transforma novos drops comuns em Coins. Ela não vende seus fragmentos especiais.','shop','.is-quick [aria-label=Loja]')]),
  topic('sales','Venda com segurança',[
   step('Na Loja → Vender Pokémon, use busca e filtros para localizar as capturas do PC. Em Selecionar, escolha os filtrados ou repetidos; a seleção de repetidos preserva o melhor da família.','shop','.is-quick [aria-label=Loja]'),
   step('Confira o total antes de Confirmar venda. Favoritos, cadeados e parceiros ocupados não são vendidos. Equipamentos voltam ao Inventário; o aviso é temporário e o Histórico guarda a transação.','shop','.is-quick [aria-label=Loja]')]),
  topic('journey','Avance na Jornada',[
   step('Na Jornada, confira o ginásio atual, os requisitos e a equipe do líder. Vencer o ginásio concede a insígnia e libera o próximo destino. As ondas das caçadas ficam salvas.','journey','.is-navigation [data-menu=journey]'),
   step('Recolha as missões concluídas. Consulte os habitantes e drops na Pokédex para planejar capturas. O tablet do treinador mostra as insígnias separadas por região.','dex','#collectionPokedex')]),
  topic('events','Enfrente os eventos',[
   step('Clique no Hoopa voando junto ao anel no topo e revele um adversário aleatório no Portal misterioso. A descoberta fica salva; a tentativa é consumida ao entrar na batalha. O treino é gratuito e não entrega recompensas.','events','#idle-legendary-event'),
   step('Vencer eventos lendários e míticos concede Bronze Boss Token para as Fendas Mega. Esses combates não usam a captura automática das caçadas; o arquivo serve para consultar, sem escolher o adversário.','events',null)]),
  topic('rocket','Atenção à Equipe Rocket',[
   step('O R na lateral direita abre a invasão da Equipe Rocket. Ela tem relógio e painel próprios, separados do Hoopa. Jessie e James chegam a cada 45 minutos; você tem 1 minuto para aceitar.','rocket','#idle-rocket-event'),
   step('Quando estiver disponível, prepare parceiros em campo e clique em Enfrentar Jessie e James. A entrada não gasta tentativas do portal. Vencer concede Coins, materiais e o resgate de Cubone.','rocket','#idle-rocket-event')]),
  topic('mega','Desbloqueie Mega Evoluções',[
   step('Abra Fendas Mega e recolha Pesquisa Mega quando cumprir a missão inicial. Você recebe a Pedra-Chave e tokens. Escolha um boss e confirme o custo; treino permite experimentar sem recompensa.','mega','#idle-mega-portal'),
   step('Com 100 fragmentos, fabrique uma Mega Pedra no Professor Carvalho. Use os específicos da pedra e complete com universais. Equipe um parceiro compatível: a transformação vale durante a batalha.','craft','.is-navigation [data-menu=center]')]),
  topic('eggs','Incube seus ovos',[
   step('Novos ovos vêm apenas do Gachapon ou do berçário. As incubadoras são separadas: duas vagas para ovos do berçário e antigos, cinco para os do Gachapon. Escolha um ovo da reserva para incubar.','nursery','.is-navigation [data-menu=center]'),
   step('Vitórias fazem a incubação avançar. Quando o ovo estiver pronto, choque para revelar o Pokémon. O berçário tem regras próprias de compatibilidade e herança, mostradas antes de iniciar.','nursery','.is-navigation [data-menu=center]')]),
  topic('breeding','Planeje o Baby Egg',[
   step('No Berçário, selecione dois pais livres e compatíveis. Consulte a prévia de espécie, qualidade e IVs antes de confirmar: os dois pais são consumidos na criação do Baby Egg.','nursery','.is-navigation [data-menu=center]'),
   step('Normal com normal nunca gera shiny. Com pelo menos um pai shiny, o bebê será shiny e nascerá no nível 1. Confira a base e a faixa dos IVs na prévia; as regras de herança aparecem antes do consumo.','nursery','.is-navigation [data-menu=center]')]),
  topic('gacha','Conheça o Gachapon',[
   step('No Centro, escolha uma região liberada e a quantidade de ovos. Cada tentativa custa '+window.IDLE_GACHA_DATA.price.toLocaleString('pt-BR')+' Coins; 5x e 10x fazem sorteios independentes. Consulte as chances antes de comprar.','gacha','.is-navigation [data-menu=center]'),
   step('Ovos P1–P5 ficam numa reserva própria, sem limite e sem garantia por tentativas. Lendário P5 é qualidade, não espécie lendária. Ao chocar, todos os Pokémon do Gachapon nascem no nível 1.','gacha','.is-navigation [data-menu=center]')]),
  topic('safari','Explore o Safari',[
   step('O Safari fica em Caçadas e é liberado pela insígnia Arco-íris de Erika. A expedição tem Safari Balls e passos próprios; não há batalha, e sua caçada pode continuar em paralelo.','safari','.is-navigation [data-menu=hunts]'),
   step('Escolha um setor e explore. Em cada encontro, decida entre bola, alimento, aproximação ou seguir adiante. A automação para ao fechar o painel ou ocultar a aba; as capturas vão ao PC.','safari','.is-navigation [data-menu=hunts]')]),
  topic('village','Visite a Vila',[
   step('Abra Vila na barra inferior. Seu Elias cuida da pesca e Dona Rosa das casas. Conheça os dois moradores para receber sua primeira propriedade.','village','#rv-village-launch'),
   step('O cercado mostra todos os Pokémon em treinamento nas casas instaladas. O ganho de XP e a subida de nível aparecem sobre o parceiro; administrar uma casa permite trocar seus moradores.','village','#rv-village-launch')]),
  topic('fishing','Comece a pescar',[
   step('Converse com Seu Elias para conseguir a primeira vara. Equipe vara e isca, lance a linha e siga o momento de fisgar ou a faixa correta da técnica de precisão.','fishing','#rv-village-launch'),
   step('Você começa pescando Magikarp. A habilidade de pesca cresce e libera novas espécies a cada dez níveis; varas também precisam ser adquiridas. No balde, compare, proteja, venda ou envie capturas ao PC.','fishing','#rv-village-launch')]),
  topic('houses','Treine nas casas',[
   step('Com Dona Rosa, sorteie escrituras usando Coins ou dez Fragmentos de Escritura. As escrituras ficam guardadas até você escolher quais instalar; podem existir até quatro casas instaladas.','houses','#rv-village-launch'),
   step('Cada casa tem vagas próprias. Escolha Pokémon disponíveis do PC: eles recebem uma parcela do XP ganho nas caçadas, conforme a qualidade da casa, sem tirar XP da equipe. Casas vazias não acumulam treino.','village','#rv-village-launch')]),
  topic('challenges','Escolha atividades extras',[
   step('Nas Tarefas da reserva, escolha uma atividade e um parceiro disponível. Ao terminar, recolha a recompensa. O parceiro fica ocupado enquanto participa; repetir uma função melhora sua especialização.','tasks','.is-navigation [data-menu=center]'),
   step('Em Jornada → Desafios, experimente a Torre e as regras especiais. Confira adversários e recompensa antes de entrar. A Torre permite continuar os próximos andares automaticamente.','challenges','.is-navigation [data-menu=journey]')]),
  topic('records','Consulte e preserve seu progresso',[
   step('Registro reúne o resultado da caçada e o histórico de capturas. O ícone Capturados mostra as vinte mais recentes da sessão. Ao retornar depois de ficar fora, consulte as recompensas offline, limitadas a oito horas.','report','.is-quick [aria-label=Registro]'),
   step('Pronto para explorar! A Wiki tem as regras detalhadas e os atalhos. O progresso é salvo neste navegador: exporte um backup em Configurações → Dados. Você pode rever ou retomar este guia pelo Professor Carvalho.','wiki','#idleWikiLaunch')])
 ];
 const quick=[
  topic('quick-team','Equipe e tablet',[step('Prepare até seis parceiros em campo e nove no banco. Os cartões mostram vida, XP e level up; clicar no treinador abre o tablet, e clicar num Pokémon abre a ficha.','party','.is-team')]),
  topic('quick-hunts','Caçadas e continuidade',[step('Caçadas tem busca global por espécie. Três vitórias avançam uma onda; são dez por caçada. Configure a continuidade na Automação e use EXPLORAR para iniciar ou pausar.','hunts','.is-navigation [data-menu=hunts]')]),
  topic('quick-auto','Captura e recuperação',[step('A Automação liga as capturas, escolhe bolas, foco, destino e proteção. A cura usa poções até completar a vida, conforme estoque. O Centro recupera a equipe gratuitamente.','capture','.is-quick [aria-label=Automação]')]),
  topic('quick-center','PC, evolução e ovos',[step('No Centro, organize o PC, confira as condições de evolução e use incubadora e Gachapon. Cadeados e favoritos protegem vendas; os Pokémon do Gachapon nascem no nível 1.','center','.is-navigation [data-menu=center]')]),
  topic('quick-village','Vila, pesca e casas',[step('A Vila tem acesso próprio. Seu Elias oferece pesca e varas; Dona Rosa cuida das casas. Instale até quatro propriedades e escolha moradores do PC para receber XP das caçadas.','village','#rv-village-launch')]),
  topic('quick-mega','Eventos e Mega Evolução',[step('Hoopa revela um lendário ou mítico aleatório; a entrada usa tentativas recarregáveis. A Rocket tem acesso próprio na lateral. Nas Fendas Mega, enfrente bosses ou treine grátis. Carvalho fabrica Mega Pedras com 100 fragmentos.','mega','#idle-mega-portal')]),
  topic('quick-help','Registros e segurança',[step('Consulte resultados no Registro e regras na Wiki. Exporte backups em Configurações → Dados. O progresso é local ao navegador; você pode voltar ao guia completo pelo Professor Carvalho.','wiki','#idleWikiLaunch')])
 ];
 return {version:4,full,quick};
})();
