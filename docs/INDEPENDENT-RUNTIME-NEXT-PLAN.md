# Próximo ciclo de organização do Idle

## Escopo e ponto de partida

O ciclo anterior foi concluído em `da117a7c`; as correções de evolução e do padrão da prévia dos golpes foram publicadas em `e0e9c321`. Este plano continua esse trabalho, sem apresentar aquelas entregas como pendentes. O jogo independente permanece no mesmo endereço e com o mesmo namespace de salvamento.

Separar arquivos melhora manutenção; não significa, por si só, mais FPS. Cada otimização precisa de comparação antes/depois. Este ciclo não inclui novas regras de combate, balanceamento, conteúdo ou migração de progresso.

## Regras para todos os lotes

- Um conjunto pequeno de dependências por alteração; registrar consumidores, ordem de inicialização e efeitos colaterais antes de mover código.
- Preservar fórmulas, cadências da simulação e contratos públicos. Não suspender dano, projéteis, captura, treinamento ou salvamento para reduzir desenho.
- Manter as duas entradas HTML sincronizadas, incluindo versões. Conferir pacote do Pages e recuperação quando um HTML antigo recebe arquivos novos.
- Testar com perfis isolados. Nunca usar ou sobrescrever o progresso do jogador nos testes.
- Se surgir regressão, retirar o lote ou corrigi-lo antes da publicação. Não juntar uma reescrita extensa a uma correção urgente.
- Não apagar mídia com base somente em busca textual: considerar nomes construídos, variantes shiny, Mega, direções e evoluções.

## 1. Fronteiras menores no motor

**Ordem:** apresentação dos bosses → controles de configurações → apresentação de unidades → serviços comuns. Só avaliar extração de combate/progressão depois de estabilizar seus contratos.

Para cada bloco: listar valores lidos/escritos e chamadas externas; receber dependências explicitamente; deixar uma ponte compatível no motor; transferir a implementação sem reformular a regra; documentar o novo dono. Preferir scripts clássicos enquanto houver variáveis lexicais compartilhadas.

**Primeiro lote:** transferir a geometria de `fitBossEl` para o módulo existente `boss-fit.js`. Escala do palco e margem do HUD são argumentos; o motor conserva o ponto de chamada. Observadores e fórmula permanecem iguais. Se o helper estiver ausente, a recuperação existente carrega sua nova versão e faz o encaixe ao instalar, sem bloquear o combate.

**Aceite:** bosses cabem abaixo do HUD nas duas entradas; Pokémon comuns não encolhem; mudança de viewport/sprite refaz o encaixe; nenhuma consulta de layout repetida quando estável; recuperação de HTML em cache funciona. Configurações, unidades e combate são lotes futuros, não entregas deste primeiro lote.

## 2. Dependências antigas restantes

Gerar inventário de scripts realmente carregados e seus consumidores: torre antiga, Rocket antigo, cosméticos, conquistas, perfil e interfaces compartilhadas. Classificar cada um como necessário, substituível ou removível, com referências e efeitos de inicialização. Diferenciar os sistemas atuais de torre/Rocket dos antigos.

Primeiro retirar uma importação comprovadamente dispensável; depois testar preparação, combate, desafios, eventos, perfil e tutorial. Só excluir arquivos em lote posterior, após conferir caminhos dinâmicos e recursos publicados.

**Aceite:** nenhuma API fictícia para esconder dependência ausente, nenhuma função Idle perdida, nenhum erro novo ou recurso faltante nas duas entradas. Não há meta de quantidade de arquivos apagados.

## 3. Carregamento sob demanda

Medir entrada fria/quente, primeira troca de região, primeiro portal, vila e Pokéfone. Separar bytes transferidos de memória decodificada e processamento. Priorizar o recurso com maior custo comprovado, não o maior diretório.

Adiar uma família por lote, compartilhar pedidos em andamento, limitar pré-carga e prever falha/retentativa. Se a tela mudar enquanto carrega, impedir atualização de uma tela obsoleta. Serviços autoritativos continuam ativos mesmo sem sua interface.

**Aceite:** menos recursos antecipados com números registrados; primeira abertura correta em rede lenta, falha recuperável e cache quente; áudio respeita restrições do navegador; sprites normais/shiny/Mega e evolução carregam. Não mover todos os catálogos de uma vez.

## 4. Carga com perfis grandes

Usar fixtures isoladas com PC próximo da capacidade vigente, histórico cheio dentro dos limites atuais, cinco gerações disponíveis e quatro casas ocupadas. Exercitar filtros, paginação, trocas rápidas de aplicativo, balde, incubadora e notificações. Registrar os tamanhos exatos utilizados.

Comparar tempo de abertura, tarefas longas, número de nós, timers e memória quando o navegador fornecer medição confiável. Repetir abertura/fechamento para identificar crescimento, distinguindo cache limitado de vazamento. Não confundir frequência de rAF com FPS.

**Aceite:** seleção, foco e rolagem estáveis; nenhuma duplicação de handlers/recompensas; após fechar, nenhuma atividade de apresentação desnecessária comprovada. Mudanças na renderização precisam de teste da interação afetada.

## 5. Regressão e publicação por lote

Executar checks específicos da alteração e a regressão integrada: entradas raiz/compatível, migração/importação/rollback, preparação, bosses, Mega, evolução, tutorial e continuidade da caçada. Para carregamento/serviços, acrescentar sessão com F5, retorno de aba, falha de rede e treinamento antes de abrir a vila.

Realizar sessão prolongada no fechamento, informando duração real; uma simulação curta de aba oculta não equivale a horas em segundo plano. Cobrir fazenda, pesca, incubadora, Gachapon e Pokéfone com cenários documentados.

Revisar diff, incluir todos os novos recursos no pacote e manter um commit de retorno. Publicar apenas lotes validados quando autorizado. Depois conferir execução do Pages e arquivos versionados públicos; informar separadamente qualquer limitação de verificação.

## Acompanhamento

- [x] Plano e primeiro bloco de apresentação identificados.
- [x] Primeiro lote de geometria validado e documentado localmente.
- [x] Primeiras fronteiras de interface extraídas: geometria dos bosses e sincronização das configurações.
- [x] Dependências antigas prioritárias classificadas; fornecedores do perfil e eventos conservados com justificativa.
- [x] Próxima família de recursos adiada com medição: interior do Centro Pokémon.
- [x] Perfis grandes e sessão local de fechamento validados, com os limites documentados abaixo.
- [ ] Lote publicado quando autorizado.

As caixas ainda abertas representam frentes completas. Já há avanços parciais de configurações e da auditoria, descritos abaixo; isso não conclui todas as extrações nem toda a auditoria.

## Resultado do primeiro lote

- A fórmula foi movida integralmente para `boss-fit.js`, com comparação automática de igualdade do corpo contra a versão publicada. O motor conserva somente a ponte `fitBossEl`.
- O carregamento de recuperação usa `geometry-2` e detecta também um helper antigo que existe, mas ainda não tem a geometria extraída. As duas entradas referenciam essa versão e `engine.js?v=boss-geometry-4`.
- `node scripts/check-boss-geometry.cjs`: passou (margem real do HUD, escala, limite mínimo, cache, unidades comuns, aliadas e desconectadas).
- `node scripts/check-standalone.cjs`: passou nas duas entradas, saves/importação/rollback, bosses, Mega, pintura durante combate e recuperação de HTML antigo com helper antigo simulado. A primeira execução apresentou uma diferença transitória de 0,002 no encaixe ao esperar 150 ms após mudar a dimensão de Moltres; a segunda execução completa passou. A fórmula extraída permaneceu idêntica. Esse teste com espera fixa deve ser acompanhado nos próximos lotes; não foi usado como medição de desempenho.
- Sintaxe dos arquivos JavaScript e `git diff --check`: passaram.
- Nenhum ganho de FPS é atribuído a esta extração. O lote está local; publicação não realizada nesta etapa.

## Continuação: configurações e torre antiga

1. Extraída a sincronização visual de `syncMenuUI` para `modes/idle/settings-view.js`. A API recebe configuração e auxiliares. Handlers, gravação, áudio, restauração e configuração de velocidade permanecem no motor. Não foram criados timers nem registros duplicados de eventos.
2. Incluído o helper antes do motor nas duas entradas. Para HTML antigo, o motor carrega o helper com pedido único enquanto pendente; falha libera nova tentativa e não interrompe a inicialização. Entrada do motor atualizada para `settings-view-5`.
3. Auditadas integrações antigas em [LEGACY-DEPENDENCIES-AUDIT.md](LEGACY-DEPENDENCIES-AUDIT.md). Retiradas duas importações da torre antiga, somando 109.159 bytes de fonte. Não foram apagados arquivos, saves ou a torre de treinamento nativa.
4. Teste integrado ampliado: handlers de prévia, redução de flashes, mana, cronômetro e volume; renderização sem modificar preferências; recuperação com HTML antigo; primeiro pedido do helper falha propositalmente, o boot continua e uma sincronização explícita recupera o módulo sem pedidos duplicados; combate real da torre nativa sem `TOWER` antigo.

**Validação local:** passaram `check-standalone.cjs`, `check-boss-geometry.cjs`, `check-render-scheduler.cjs`, `check-phone-clock.cjs`, `check-village-labels.cjs`, `check-portal-audio-lifecycle.cjs` e `check-idle-tutorial-content.cjs`. Sintaxe, igualdade das importações das duas entradas e diff também conferidos. O cenário de rede inclui uma falha simulada, não medição de rede real. Nenhuma promessa de FPS baseada em divisão de arquivos.

**Ainda falta:** próximas fronteiras de apresentação, restante da auditoria, próxima família de recursos sob demanda, fixtures grandes e sessão prolongada de fechamento. Este lote continua local, sem publicação.

## Continuação: cenário do Centro

Concluído um lote de carregamento sob demanda, documentado em [CENTER-ON-DEMAND.md](CENTER-ON-DEMAND.md). Antes da alteração, o interior de 2.078.019 bytes era solicitado na entrada pelo campo; depois, zero pedidos antes da primeira visita e um pedido reutilizado após abrir o Centro. Falha 503 simulada libera nova tentativa; fechamento durante o carregamento não reabre a tela. Regressão integrada e evolução passaram.

A frente de recursos continua aberta para outros grupos, mas este grupo já foi medido e adiado. Próxima verificação: PC com 300 indivíduos e quatro casas/oito moradores em sessão isolada, incluindo filtros e F5. Não considerar esse ensaio como teste de históricos máximos ou de horas em segundo plano.

## Continuação: perfil grande e sessão integrada

Executado `IDLE_LARGE_SAVE=1 node scripts/check-optimized-session.cjs`, com fixture isolada: 300 Pokémon no PC, 40 insígnias, quatro casas e oito moradores. O teste do PC passou por três aberturas, busca com foco preservado, filtro de potência e navegação para a segunda de 25 páginas, mantendo 12 cartões por página.

A sessão automática de 180 segundos passou. Na primeira amostra havia 5 vitórias e na última 21; retorno de aba foi simulado por 2,5 segundos e F5 manteve a região e a caçada ativa. Também passaram treinamento antes da primeira visita, falha/retentativa do serviço da vila, reutilização de um único iframe, Pokéfone, compra de ovo e abertura da incubadora. Nenhum erro de execução ou recurso 404 foi detectado nos caminhos exercitados.

Ao ampliar a fixture, ajustou-se a asserção de treinamento para conferir somente os oito moradores atribuídos à fazenda: o cadastro do serviço também inclui os demais Pokémon no PC, que corretamente não recebem esse treinamento. Nenhuma regra do jogo foi alterada para fazer o teste passar.

Relatório local em `output/optimized-session.json`. Este ensaio é funcional: o campo antigo `units` do relatório usa seletor `.cu`, enquanto as unidades atuais usam `.unit`; seus valores não foram usados como evidência de quantidade de nós ou vazamento. Não houve comparação de memória/FPS nem teste com histórico máximo. Esses diagnósticos e uma sessão mais longa continuam pendentes. Nenhuma publicação realizada neste lote.

## Fechamento local da rodada

- Histórico: 200 capturas recentes, 80 registros da jornada e 1.000 eventos de arquivo permanente, juntamente com 300 Pokémon. Paginação e alternância de aplicativos validadas; arquivo permanente não tem teto, portanto o teste não representa todo tamanho possível.
- Memória e ciclos: dois ciclos de aquecimento e 24 ciclos medidos de PC/Pokéfone. Contagem de intervalos permaneceu em 16. Pequena retenção de nós/listeners e acomodação do heap foram registradas, sem alegação de ausência de vazamentos por horas. Resultados em [PANEL-LIFECYCLE-VALIDATION.md](PANEL-LIFECYCLE-VALIDATION.md).
- Ajuste adicional: miniaturas do perfil não mantêm rAF quando invisíveis. Unidade verifica agendamento e retorno; navegador real verifica pausa e retomada com IntersectionObserver. Centro/fazenda continuam usando as funções de desenho existentes.
- Auditoria prioritária concluída em [LEGACY-DEPENDENCIES-AUDIT.md](LEGACY-DEPENDENCIES-AUDIT.md): torre antiga retirada da entrada; demais contratos conservados com consumidores identificados.
- Sessão final: `IDLE_LARGE_SAVE=1 IDLE_SOAK_MS=300000 node scripts/check-optimized-session.cjs` passou. 300 Pokémon, quatro casas, oito moradores, cinco minutos de caçada e F5; vitórias nas amostras: 5 → 32. O seletor do relatório de unidades foi corrigido para `.unit`. Retorno de aba simulado por 2,5 segundos, não horas de aba oculta.
- A oscilação do teste de encaixe foi resolvida na verificação: agora espera a igualdade entre encaixe aplicado e geometria corrente sem forçar um novo encaixe durante a espera, em vez de presumir que 150 ms bastam. A fórmula do jogo não foi alterada. Regressão integrada passou, inclusive teste real das miniaturas e recuperação de helpers.

Esta rodada delimitada das cinco frentes está validada localmente. Publicação continua pendente. Extrações maiores de apresentação de unidades e serviços, retirada dos ramos antigos restantes do motor, testes de horas e investigação da pequena retenção em sessões mais extensas são trabalho posterior; não foram apresentados como uma reescrita completa nem requisito cumprido neste lote.
