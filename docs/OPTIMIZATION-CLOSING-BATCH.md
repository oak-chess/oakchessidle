# Lote de conclusão: carregamento, dependências e apresentação

## 1. Pokéfone

Preservada a atualização condicional dos relógios e do clima. O teste de integração encontrou um bloqueio de navegação: o render mantinha a tela anterior sempre que um input tinha foco, mesmo após solicitar outro aplicativo. A proteção agora se aplica somente ao mesmo aplicativo. Digitação e foco permanecem estáveis em atualizações automáticas; navegação explícita muda de tela normalmente.

Não foi introduzido cache genérico de aplicativos: ele exigiria uma assinatura completa de todos os dados e poderia esconder mudanças reais. Desfoques, ícones e layout foram mantidos.

## 2. Carregamento conforme a visita

- O panorama da vila e o documento de serviços do iframe não recebem `src` durante a montagem inicial. São solicitados na primeira visita à vila, pesca ou escrituras.
- O serviço autoritativo de treinamento continua no documento principal. Recebe XP e salva antes da primeira visita; a interface apenas recebe seu estado quando termina de carregar.
- Apenas um iframe é mantido e reutilizado. Ações solicitadas durante o carregamento aguardam a inicialização existente.
- Falha na página de serviços mantém o estado e oferece tentar novamente ou fechar. A verificação do documento é protegida contra páginas de erro do navegador.
- A montagem inicial não recebe mudanças de save, preços, XP ou regras de recompensa.

Escopo deliberado: os cenários de regiões e efeitos que já usam cache sob demanda foram preservados. Não foi removido o catálogo de dados de Pokémon nem feita exclusão ampla de mídias.

## 3. Auditoria das integrações antigas

Retiradas das duas entradas, com arquivos preservados:

| Integração | Motivo | Bytes de script |
|---|---|---:|
| `assets/game-home/scores.js` | Recordes de campanha/torre da biblioteca antiga; não há consumidor Idle | 8.396 |
| `assets/game-home/mode-arenas.js` | Prévias da antiga tela inicial; referência no motor protegida por optional chaining | 1.987 |
| `assets/game-home/menu-sounds.js` | Listeners exclusivos de botões da biblioteca antiga | 1.731 |
| `assets/game-home/trainer-card.js` | Cartão da biblioteca antiga, condicionado a `.stream-hero` | 1.918 |

Total retirado do carregamento: **14.032 bytes não comprimidos**, quatro scripts e seus efeitos de inicialização.

Retidos após inspeção: `tower.js` e integrações Rocket que ainda expõem funcionalidades do motor compartilhado; conquistas e perfil que fornecem cosméticos/sprites usados; dados e renderizadores de golpes; créditos e atribuições. Remover esses blocos exige separar contratos antes de excluir. Não os classificamos como removidos nem como otimizações concluídas.

## 4. Fronteira de apresentação

O controle de frequência de pintura atrás dos painéis saiu do motor e passou a `modes/idle/render-budget.js`. O motor solicita `IDLE_RENDER_FX(ts, FX.draw)`; o módulo escolhe quando desenhar. Atualização de partículas/projéteis e aplicação de dano permanecem no motor, na frequência original.

Se um HTML antigo carregar um módulo de apresentação em cache sem essa função, o motor mantém o desenho original. Isso evita erro de inicialização ou interrupção de combate. O módulo fica sob `modes/`, já incluído no pacote do Pages.

O motor ainda é grande. Esta é uma extração pequena e testável, não uma conversão completa dos mais de 4 MB para uma arquitetura nova. Não afirmamos ganho de FPS pela separação de arquivos.

## 5. Validação e limites

Testes específicos: relógio do Pokéfone, nomes/níveis da vila, ciclo de vida do áudio e módulo de pintura. Teste independente: duas entradas, saves/importação/rollback, bosses, Mega, pintura com painel e recuperação de HTML em cache.

Teste de sessão: `scripts/check-optimized-session.cjs`, padrão de 180 segundos, contexto isolado. Exercita ausência de pedidos da vila na entrada, treinamento antes da UI, erro/retentativa dos serviços, oito moradores, reapertura sem download duplicado, foco do PokéNav, troca para Clima, controles, compra de ovo, incubadora, caçada automática e recarregamento. Resultado deve ser registrado antes da publicação; não representa uma sessão de horas ou todos os caminhos do jogo.

Validação realizada: caçada de três minutos com vitórias aumentando de 5 para 14; verificação final focada de 30 segundos com todos os asserts passando, incluindo duas falhas consecutivas dos serviços, fechamento, retentativa, treinamento anterior à UI, preservação do input, troca de app, compra de ovo, abertura da incubadora e retomada após F5. O retorno de aba foi simulado por `visibilitychange` durante 2,5 segundos; não representa uma aba suspensa por horas. O sentinel de armazenamento é lido pela API original capturada antes do wrapper do jogo.

Também passaram as 40 regiões e a compatibilidade com módulo de apresentação antigo em cache. Não foram realizados novos testes completos de todas as receitas do berçário, todas as evoluções nem todas as modalidades de pesca, pois suas regras não mudaram neste lote. Nenhum dado do perfil real do jogador é usado nos ensaios.

Ponto anterior para reversão: `3d776140b530d65687717d36068ee6a0b5f2c274`. O pacote continua incluindo os arquivos sob `modes/`; nenhum novo arquivo de runtime na raiz foi introduzido. A publicação precisa ter o sucesso do Pages e as URLs efetivas conferidos.

## Medição de fechamento

`output/performance-final-cycle.json`: três amostras por cenário, mesmas condições do profiler. Scripts carregados na entrada passaram de 220 / 28.884.927 bytes na base desta rodada para **215 / 28.833.123 bytes**: 51.804 bytes a menos no conjunto de JS carregado (arquivos não comprimidos). O panorama de 837.688 bytes também foi adiado até visitar a vila; não está incluído nessa conta de JS. A regressão confirmou ausência dos dois pedidos da vila antes da visita.

Callbacks em 4 segundos ficaram em 201 na preparação, 201 no combate e 199 no tablet, contra aproximadamente 243 na base. Medianas de processamento total: 467,02 / 472,43 / 437,75 ms/s; heap JavaScript após GC: 35,82 / 36,28 / 35,93 MiB. Houve uma long task na mediana de combate. Não há base para anunciar ganho geral de FPS, GPU ou memória total; esses números são laboratoriais e a carga varia.

Os relatórios locais de diagnóstico ficam ignorados em `output/`. Não entram no pacote publicado.
