# Terceiro lote — encaixe dos bosses por eventos

Data: 02/11/2026. Lote validado antes da publicação.

## Implementação

O motor mantinha um intervalo de 80 ms que percorria `B.units` e chamava `fitBossEl`. A função consultava a altura do conteúdo antes de verificar o cache, mesmo sem mudanças de tamanho.

Esse intervalo foi substituído pelo módulo `modes/idle/boss-fit.js`. Ele acompanha:

- Entrada e remoção de adversários no tabuleiro.
- Dimensões do conteúdo do sprite, palco e cabeçalho.
- Carregamento de imagens, alteração da forma e ativação do renderer PMD.
- Redimensionamento da janela e tela cheia.
- Retorno da visibilidade da página.

As solicitações são agrupadas em um único `requestAnimationFrame`. Mudanças comuns de caminhada e condições não invalidam o encaixe. A página oculta guarda as mudanças pendentes e reaplica o cálculo ao voltar. Observações de elementos removidos são liberadas.

**A função e a fórmula de `fitBossEl` são idênticas às da base publicada `c540fbb2`**, verificadas por comparação de texto normalizado. Âncora, limites de escala e reserva do HUD foram preservados. Este lote altera quando calcular, não as regras de tamanho nem a simulação de combate.

As duas entradas carregam o módulo antes do motor e versionam seus endereços. Se um HTML antigo em cache não incluir o módulo, o motor solicita o helper uma vez. Essa situação foi simulada em navegador; não causa erro de função ausente nem instala a dependência duas vezes.

## Testes

- Inicialização pelas duas entradas, sem erros de execução ou recursos locais ausentes.
- Comparação com a fórmula original para unidades nativas Mewtwo, Moltres e Gengar, com dimensões controladas, mudança de altura e viewport.
- Limpeza de escala ao deixar de ser um boss gigante.
- **Zero consultas de `offsetHeight` na janela estável de teste**, inclusive ao mudar apenas a classe de caminhada.
- Alteração de dimensão com página simulada como oculta: nenhum encaixe imediato; resultado correto ao restaurar visibilidade.
- Batalha real de treino contra Mega Charizard X, pausada para comparar o encaixe com a fórmula do motor.
- Recuperação de dependência ausente em um HTML antigo simulado.
- Painéis próprios do Idle, importação, isolamento dos saves, progressão das 40 regiões e tutorial aprovados.

Os testes não representam uma revisão visual individual dos 31 Megas. A comparação do módulo cobre dimensões e eventos; o teste real de Mega cobre uma batalha. Outros cenários ainda devem fazer parte da matriz ampliada.

## Medição

Mesmo ensaio local dos lotes anteriores: Chrome 156.0.8078.79, headless, 1366 × 768, três amostras de quatro segundos por cenário. Comparação entre `output/performance-second-batch.json` e `output/performance-boss-events-final.json`.

| Mediana | Preparação antes → depois | Combate antes → depois | Tablet antes → depois |
|---|---:|---:|---:|
| Callbacks de intervalos / amostra | 291 → 242 | 292 → 242 | 292 → 241 |
| Memória JavaScript após GC, MiB | 36,58 → 36,30 | 36,82 → 36,94 | 36,52 → 36,50 |
| Processamento principal, ms/s | 418,39 → 406,57 | 443,02 → 429,62 | 406,91 → 413,53 |

Resultado comprovado: **aproximadamente 50 callbacks de intervalo a menos por quatro segundos**, além de não consultar dimensões repetidamente quando estável. Os callbacks dos observadores não entram na contagem de intervalos: não se deve interpretar esse número como a contagem de todo o trabalho da página.

O novo módulo e sua recuperação de cache acrescentam 3.631 bytes de JavaScript ao conjunto medido. O saldo dos três lotes continua sendo uma redução de 474.892 bytes frente à base inicial, com 220 scripts carregados em vez de 225. Tamanho de arquivo não é tráfego comprimido.

CPU e memória continuam apresentando oscilações; não foi demonstrado ganho consistente de FPS. A contagem de rAF não mede FPS real, e o heap não inclui toda a memória de imagens, áudio ou GPU.

## Próxima etapa

Medir o custo visual de canvases e animações que permanecem atrás de painéis. Verificar visibilidade e necessidade de cada ciclo antes de suspender apresentação. Manter ativos o relógio de combate, captura, salvamento, progressão offline e alertas. O agendamento de áudio permanece intacto neste lote.
