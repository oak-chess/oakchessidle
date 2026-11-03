# Quarto lote — desenho atrás dos painéis

## Plano e limites

1. Medir preparação, batalha e tablet nas mesmas condições dos lotes anteriores, antes da alteração.
2. Reduzir somente chamadas de desenho de FX, inicialmente para até 10 por segundo com uma janela nativa aberta. O registro flutuante continua com a arena em ritmo normal.
3. Manter `FX.update`, projéteis, colisões, dano, tempo da batalha, atualização das unidades, captura, áudio e salvamento na frequência original. Não limpar efeitos para economizar trabalho: limpar também apagaria projéteis em voo.
4. Ao fechar o painel, desenhar no próximo frame sem esperar o intervalo limitado. Fora dos painéis, preservar a frequência original.
5. Verificar a cadência e a continuidade dos cálculos em navegador isolado, executar regressões existentes e repetir as medições. Não prometer ganho de FPS com base apenas na redução de chamadas.

## Escopo seguinte

Este lote não suspende todos os canvases nem as animações CSS. A arena pode aparecer parcialmente pelas bordas dos painéis: por isso o desenho continua em frequência reduzida. Outros custos serão tratados separadamente após medição.

Sem mudanças em save, economia, progressão ou recursos disponíveis. Publicação em lote separado após validação.

## Resultado local

- Implementado somente em `paintBattleFx`: até 10 desenhos/s com painel aberto, frequência original ao fechar. `FX.update` e as demais atualizações permanecem no fluxo original.
- Navegador isolado confirmou o limite, atualização frequente dos efeitos, avanço do tempo de um combate Mega e retorno ao desenho por frame. Passaram também entrada principal/compatibilidade, importação, isolamento e rollback de saves, encaixe de bosses e recuperação de HTML em cache. Tutorial validado.
- Três amostras de 4 segundos por cenário, Chrome local a 1366 × 768, relatórios `output/performance-panel-before.json` e `output/performance-panel-after.json`.
- Com tablet aberto: mediana de processamento total 440,42 → 437,08 ms/s; JavaScript 70,21 → 71,00 ms/s; memória JavaScript após GC 36,57 → 36,35 MiB. A variação é pequena e não comprova melhora geral de FPS ou CPU.
- O benefício comprovado é limitar chamadas de desenho atrás dos painéis sem reduzir as atualizações de combate. As amostras de preparação e batalha sem painel também variaram; não atribuímos essa variação ao ajuste, que não limita esses cenários.
- Validação realizada antes da publicação desta rodada.
