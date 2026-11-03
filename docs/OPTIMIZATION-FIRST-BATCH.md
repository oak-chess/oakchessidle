# Primeiro lote — inicialização do Idle

Data: 02/11/2026. Base: `c540fbb2`. Lote validado antes da publicação.

## O que foi alterado

As duas entradas (`index.html` e `modes/idle/index.html`) deixaram de carregar:

| Script | Motivo | Bytes do arquivo |
|---|---|---:|
| `asset-inventory.js` | Não possui consumidores nos scripts do motor, assets ou Idle. O carregador inicial usa os recursos visíveis. | 429.893 |
| `assets/title-menu.js` | Organiza o menu inicial da campanha e observa seu DOM. Não exporta uma API usada pelo Idle. | 3.892 |
| `assets/run-challenges.js` | Desafios de runs da campanha; as chamadas do motor verificam a existência de `window.RUN_CHALLENGE`. Mantinha um intervalo de 350 ms. | 9.772 |

Os arquivos continuam no repositório para consulta e reversão. Não foram removidos dados, imagens ou áudios compartilhados. A torre antiga também não foi removida neste lote: suas dependências exigem outra análise.

Os desafios do Idle continuam em `modes/idle/challenges.js`. O teste de inicialização verifica explicitamente que sua função de torre está disponível, enquanto os dois globais antigos deixaram de ser criados.

## Medição

Chrome 156.0.8078.79, headless, 1366 × 768, três amostras de quatro segundos por cenário, após aquecimento de 1,5 s. Perfil isolado, área inicial, Turtwig nível 8, sem dados de jogador real. Requisições externas bloqueadas nas duas séries. Mesma máquina e cenário; escolhas aleatórias e cargas transitórias não foram eliminadas.

| Mediana | Preparação antes → depois | Combate antes → depois | Tablet aberto antes → depois |
|---|---:|---:|---:|
| Scripts locais carregados | 225 → 222 | 225 → 222 | 225 → 222 |
| Memória JavaScript após GC, MiB | 37,37 → 36,57 | 37,45 → 36,86 | 37,18 → 36,71 |
| Processamento principal, ms/s | 474,72 → 452,51 | 465,29 → 420,47 | 432,38 → 476,22 |

Redução determinística: **443.557 bytes (433,2 KiB) de JavaScript local deixam de ser carregados**, de 29.359.819 para 28.916.262 bytes. Esses valores são tamanhos de arquivos descomprimidos lidos pelo ensaio, não o tráfego comprimido do GitHub Pages.

O temporizador de desafios antigos executava 11–12 callbacks em cada janela de quatro segundos e passou a zero em todas as nove amostras. O observador do menu antigo também deixa de ser instalado.

A memória foi menor nas três medianas. O processamento oscilou e piorou na amostra com tablet: **este ensaio não demonstra ganho consistente de CPU ou FPS**. A contagem de rAF registrada no JSON mede oportunidades de atualização, não quadros efetivamente desenhados pela batalha. Memória de imagens, GPU e áudio não está incluída no heap JavaScript.

Arquivos completos locais: `output/performance-baseline.json` e `output/performance-cleaned.json`. Reproduzir com `npm run profile -- nome-da-amostra`.

## Verificações

- Abertura pelas duas entradas, inclusive sob `/oakchessidle/`.
- Sem erros JavaScript nem recursos locais ausentes nas rotas exercitadas.
- Importação, namespace independente, cópia única do save antigo e reversão de falha de armazenamento.
- Equipe preservada após importação e navegação.
- Progressão, níveis reais e força das caçadas nas 40 regiões.
- Tutorial completo e resumido coerentes com as regras atuais.
- Três amostras de combate ativo e três de tablet aberto em cada série.

## Próxima investigação

O perfil registra alta frequência de callbacks no agendamento de música, em integrações antigas de streaming, no painel antigo de equipe e no relatório antigo de batalha. Frequência não prova inutilidade: o agendador de áudio, por exemplo, pode precisar desse ritmo.

O próximo lote deve mapear consumidores e visibilidade dessas integrações. Suspender apenas o trabalho confirmado como invisível ou exclusivo de campanha; preservar o relógio de simulação, alertas shiny, autosave e continuidade da caçada. Depois repetir o ensaio, incluindo equipe cheia e eventos pesados.
