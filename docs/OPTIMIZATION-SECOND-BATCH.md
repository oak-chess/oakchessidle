# Segundo lote — interfaces antigas invisíveis

Data: 02/11/2026. Comparação com o primeiro lote local, usando o mesmo ensaio. Lote validado antes da publicação.

## Mudança

As entradas principal e de compatibilidade deixam de carregar três scripts:

| Script | Uso antigo | Bytes |
|---|---|---:|
| `assets/game-home/streaming.js` | Biblioteca da campanha: DOM, imagens, observador, ciclo de rAF e atualização a cada 150 ms | 15.535 |
| `assets/team-view.js` | Revelar o tabuleiro durante escolhas dos eventos antigos, com checagem a cada 180 ms | 7.474 |
| `assets/battle-report.js` | Relatórios de campanha, conexão ao capturador antigo e checagem de aviso a cada 200 ms | 11.957 |

O motor protege suas consultas a `TEAM_VIEW` e `BREPORT` pela existência das APIs. Os módulos próprios de equipe, desafios e registros do Idle continuam carregados.

A biblioteca aplicava `body.stream-themed`, usado por estilos compartilhados. Essa classe agora é declarada diretamente no HTML para manter o acabamento. Os arquivos antigos e seus dados salvos permanecem disponíveis no repositório; não foram apagados nem migrados.

## Resultado determinístico

- Mais três scripts deixam de ser solicitados: **34.966 bytes (34,1 KiB)**.
- Os três intervalos e o ciclo de rAF da biblioteca não são mais instalados.
- O segundo lote reduz aproximadamente 70 callbacks de intervalo por janela de quatro segundos no ensaio.
- Total dos dois lotes: **seis scripts e 478.523 bytes (467,3 KiB)** fora da inicialização.
- Nenhuma alteração de simulação, atributos, recompensas, áudio, alertas shiny ou autosave.

## Medianas do ensaio

Chrome 156.0.8078.79, headless, 1366 × 768. Três amostras de quatro segundos em cada cenário, perfil de teste isolado, mesma região e equipe. Os relatórios completos ficam em `output/performance-cleaned.json` e `output/performance-second-batch.json`.

| Medida | Preparação antes → depois | Combate antes → depois | Tablet antes → depois |
|---|---:|---:|---:|
| Scripts carregados | 222 → 219 | 222 → 219 | 222 → 219 |
| Callbacks de intervalos / amostra | 362 → 291 | 362 → 292 | 358 → 292 |
| Memória JavaScript após GC, MiB | 36,57 → 36,58 | 36,86 → 36,82 | 36,71 → 36,52 |
| Processamento principal, ms/s | 452,51 → 418,39 | 420,47 → 443,02 | 476,22 → 406,91 |

A redução de rotinas e bytes é comprovada. A memória permaneceu aproximadamente igual, e o processamento em combate oscilou para cima. **Não há evidência suficiente de ganho consistente de CPU ou FPS.** rAF não é FPS efetivo; o heap não inclui toda a memória de imagens, áudio ou GPU.

## Regressão

- Duas entradas e todos os recursos locais exercitados sem erros.
- Importação/exportação estrutural, cópia única, namespace independente e reversão de falha de armazenamento.
- APIs antigas ausentes e torre de treinamento do Idle disponível.
- Abertura dos painéis nativos de Pokémon, Pokéfone, Evolução, Caçadas, Jornada e Registro.
- Combate ativo nos três ensaios e tablet aberto nos três ensaios.
- Progressão das 40 regiões e tutorial completo/resumido aprovados.

Os testes fecham um painel antes de abrir o seguinte, respeitando a interação modal existente.

## Próximo alvo

O motor verifica o encaixe dos bosses a cada 80 ms. A função lê dimensões antes de consultar parte do cache. É um candidato a atualização por mudança de sprite/tamanho, mas requer testes com lendários, Megas, mudança de forma e redimensionamento. O agendamento de música a cada 40 ms permanece intacto: sua frequência pode ser necessária para transições e mixagem.
