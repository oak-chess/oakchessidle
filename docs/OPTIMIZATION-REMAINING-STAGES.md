# Conclusão da otimização — cinco etapas

## Regras comuns

- Trabalhar somente no repositório independente. Preservar a versão antiga e o namespace do save.
- Manter as entradas `/index.html` e `/modes/idle/index.html` sincronizadas e atualizar a versão dos arquivos alterados.
- Separar bytes transferidos, memória JavaScript, imagens/áudio e tempo de processamento. Não anunciar rAF como FPS nem generalizar amostras curtas.
- Um problema comprovado por lote. Se o teste não mostrar benefício ou a mudança prejudicar a aparência, abandonar a hipótese e registrar o resultado.
- Os ajustes de painéis, áudio e rótulos da vila já validados integram esta rodada. Não repetir essa implementação; conferir o fechamento e a publicação do lote.
- Nunca interromper cálculos de projéteis, captura, treinamento, alertas shiny, compensação de tempo ou salvamento para economizar desenho.

## 1. Concluir painéis e atualizações da interface

**Entrada:** medições existentes de preparação, batalha, tablet, portal, vila cheia, Clima e central de controle.

**Execução:**

1. Rastrear quem solicita refresh, quais subárvores são reconstruídas e quais observadores são disparados. Distinguir ação do jogador de atualização automática.
2. Priorizar Pokéfone: relógios, notificações, Clima, controles e listas. Confirmar estabilidade de foco, cursor, rolagem e seleção antes de mudar o render.
3. Evitar escritas de texto/atributos quando o valor não mudou. Atualizar valores visíveis sem recriar botões, inputs ou diálogos desnecessariamente.
4. Só pausar apresentação comprovadamente invisível. Manter o relatório flutuante com a arena em ritmo normal.

**Testes:** alterações reais de saldo, XP, clima, relógio e avisos aparecem; troca de aplicativo, bloqueio/desbloqueio, gestos, orientação, reabertura e retorno à aba funcionam; sem timers duplicados. Nome/nível dos moradores continuam atualizando.

**Conclusão:** caminhos principais sem reconstruções evitáveis comprovadas; medições comparáveis; nenhum controle perdido. Não exige remover toda animação do jogo.

## 2. Recursos carregados por necessidade

**Execução:**

1. Registrar pedidos e bytes na primeira entrada sem cache, em combate, por região, no portal, na vila e no Pokéfone. Separar catálogo de dados de imagens efetivamente baixadas/decodificadas.
2. Identificar pré-cargas amplas e consumidores. Preparar mapa de dependências incluindo nomes montados dinamicamente, shiny, Mega e sprites direcionais.
3. Adiar uma família de recursos por vez. Compartilhar pedidos em andamento, limitar pré-carga e tratar erro/retentativa sem bloquear a partida inteira.
4. Trocar de tela enquanto o pedido está pendente: descartar aplicação visual obsoleta, sem cancelar recursos que outro consumidor ainda precisa.

**Testes:** cache vazio e quente, rede lenta, pedido que falha, troca rápida de região, áudio bloqueado pelo navegador, primeira evolução e variantes. Não alterar o progresso quando um recurso falhar.

**Conclusão:** redução de pedidos/bytes antecipados comprovada; primeiras entradas continuam corretas. Tamanho total do repositório não será usado como medida de desempenho em execução.

## 3. Dependências restantes de campanha e torre

**Execução:**

1. Listar scripts carregados, globais exportadas, efeitos de inicialização, callbacks e consumidores no Idle.
2. Revisar torre antiga, Rocket antigo, conquistas, títulos e menus compartilhados individualmente. Não confundir com torre de treinamento e Rocket atuais.
3. Retirar uma importação somente após confirmar que seus recursos não são necessários. Não preencher APIs ausentes com objetos vazios.
4. Primeiro interromper o carregamento; remover arquivo/mídia só depois de confirmar ausência de referências estáticas e dinâmicas.

**Testes:** combate, preparação, desafios, eventos, conquistas/cosméticos usados, perfil e tutorial. Conferir erros e caminhos faltantes nas duas entradas.

**Conclusão:** dependências classificadas como necessárias ou removidas com evidência. Nenhuma exclusão ampla por nome de pasta.

## 4. Organização do motor

**Execução:**

1. Mapear ordem de inicialização e variáveis compartilhadas do `engine.js`. Definir responsabilidades de dados, combate, apresentação e interface.
2. Extrair primeiro um bloco com fronteiras claras. Preservar a ordem e o comportamento antes de modernizar interfaces.
3. Reduzir acessos globais gradualmente; não converter tudo para módulos de uma vez. Incluir novos arquivos no pacote do Pages quando necessário.
4. Documentar entradas, dependências, funções públicas e como testar cada bloco.

**Testes:** comparação de comportamento, inicialização limpa e com save, entradas alternativas, recarregamento com HTML em cache, início/fim de combate, evolução e eventos.

**Conclusão:** responsabilidades documentadas e extrações prioritárias testadas. Não é necessário dividir todas as funções nem prometer ganho de FPS apenas por separar arquivos.

## 5. Validação final e publicação

**Execução:**

1. Revisar o diff e executar testes de saves/importação/isolamento, progressão, tutorial, bosses, portal e ajustes novos.
2. Testar uma sessão prolongada, registrando sua duração: caçada automática, aba em segundo plano, retorno, F5, região, menus e eventos. Verificar ausência de recompensas duplicadas e crescimento contínuo de timers/nós.
3. Exercitar fazenda, pesca, incubadora, Gachapon, evoluções e Pokéfone com dados isolados. Não anunciar cobertura de caminhos que não foram exercitados.
4. Conferir o pacote publicado, preservar um commit anterior para reversão e publicar os lotes validados quando autorizado.
5. Verificar sucesso do Pages e disponibilidade real do HTML e arquivos versionados. Informar commit, endereço e limitações.

**Conclusão:** publicação verificada, progresso preservado e resultados documentados. Se um teste material falhar, corrigir ou retirar o lote antes de publicar.

## Ordem e limite

Começar pela etapa 1. A etapa 2 usa o mapa de consumidores da etapa 3; o levantamento pode anteceder a alteração de carregamento. A extração da etapa 4 vem após estabilizar esses contratos. Cada etapa pode ter mais de um lote, mas não repetiremos medições sem mudança, falha ou hipótese nova que as justifique.

## Início da etapa 1

- Revisadas as funções de renderização de `party.js` e `pokefone.js`. Ainda não foi aplicada uma trava genérica de refresh: aplicativos diferentes têm dados e controles diferentes, e bloquear todos por uma assinatura incompleta deixaria dados desatualizados.
- Primeiro ajuste: o tick existente da tela de bloqueio compara os textos de hora, data, clima e ícone e o atributo de clima antes de escrevê-los. Consulta o clima uma vez por tick. Não muda intervalo, aparência, gestos, notificações, áudio nem persistência.
- `scripts/check-phone-clock.cjs` usa a função real do arquivo e verifica 60 ticks estáveis sem escritas repetidas, mudança de minuto, data e clima/ícone. O teste passou.
- Isso elimina mutações ociosas comprovadas; não foi anunciado ganho perceptível de FPS. Próximo alvo da etapa 1: identificar quais chamadas de refresh realmente reconstroem aplicativos abertos e testar foco/rolagem antes de mudar sua renderização.
- Este registro descreve o início da etapa 1; o fechamento do ciclo prioritário está registrado abaixo.
- Validação integrada após o ajuste: passaram o teste independente (duas entradas, saves, rollback, bosses, Mega, continuidade do combate com painel e recuperação de HTML em cache) e o conteúdo do tutorial. O comando `npm` não estava no PATH deste ambiente; os scripts foram executados diretamente com Node.

## Fechamento do ciclo prioritário

O lote das cinco frentes está descrito em [OPTIMIZATION-CLOSING-BATCH.md](OPTIMIZATION-CLOSING-BATCH.md). Foram tratadas as atualizações ociosas e a navegação do Pokéfone, carregamento da vila na primeira visita, quatro integrações da biblioteca antiga, extração do controlador de pintura e regressão integrada com F5. As responsabilidades estão em [RUNTIME-MODULES.md](RUNTIME-MODULES.md).

Isso conclui um ciclo delimitado dessas cinco frentes, não toda otimização possível. O motor ainda contém código compartilhado necessário; uma reescrita ampla e carregamento segmentado de todos os catálogos não foram feitos nem apresentados como concluídos. Testes de horas e de todos os caminhos de cada sistema também não foram realizados. Publicar apenas o lote validado, mantendo essas limitações explícitas.
