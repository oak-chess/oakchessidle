# Aplicativos abertos e fazenda com moradores

## Plano

1. Usar oito moradores reais em quatro casas lendárias no save isolado, esperando os sprites direcionais carregarem antes de medir. Não substituir os Pokémon por imagens estáticas.
2. Medir separadamente aplicativo de clima e central de controle, verificando que a tela solicitada está realmente aberta.
3. Registrar três amostras de quatro segundos, mesma resolução/navegador das etapas anteriores, sem outros testes de navegador simultâneos.
4. Inspecionar trabalho de desenho, consultas ao DOM e alterações de texto/estilo. Manter treinamento, XP, posições e oito direções. Evitar mudanças de visual sem evidência.
5. Aplicar um ajuste pequeno, testar moradores entrando/saindo e atualização de nível, abertura/fechamento e retorno à aba. Comparar antes/depois e registrar limitações.

O quarto lote e o ajuste de áudio da etapa anterior continuam locais durante ambas as medições. Esta etapa não altera save real, recompensas, música ou recursos por região.

## Base medida

`output/performance-populated-before.json`, Chrome local, 1366 × 768, três amostras de 4 segundos, sem erros de navegador ou recursos locais faltando:

| Cenário | Processamento total ms/s | JavaScript ms/s | Heap após GC MiB |
|---|---:|---:|---:|
| Fazenda, 8 moradores | 524,25 | 150,53 | 36,59 |
| Pokéfone, Clima | 478,32 | 77,10 | 36,49 |
| Pokéfone, central de controle | 507,07 | 71,15 | 36,63 |

A fazenda apresentou o maior custo entre estas três condições. O ensaio de aplicativos desbloqueia o aparelho antes de abrir a tela; não mede o aplicativo escondido atrás da tela de bloqueio. A fixture usa famílias válidas de Bulbasaur, Charmander, Squirtle e Gastly, duplicadas para preencher as oito vagas, com sprites PMD carregados.

## Alteração pequena

O loop da vila escrevia o texto de nome/nível de cada morador a cada frame. Agora compara o valor e escreve somente quando necessário. Não reduz frequência de movimentação, desenho do sprite, direção, lago, vento ou luzes.

`node scripts/check-village-labels.cjs` executa a função real extraída do arquivo: antes do ajuste, 120 escritas idênticas em 120 passos; depois, zero escritas idênticas, mantendo 120 passos e 120 desenhos. Mudanças de nível e nome são refletidas no passo seguinte. A medição posterior também observa as mutações dos rótulos no navegador e verifica movimento e reabertura com os oito moradores.

## Resultado

`output/performance-populated-after.json`: passaram as três verificações de zero mutações repetidas nos rótulos, movimento real e oito moradores após reabertura. Nenhum erro de navegador nem recurso local faltando nas telas exercitadas.

| Cenário | Total ms/s antes → depois | JavaScript ms/s antes → depois |
|---|---:|---:|
| Fazenda cheia | 524,25 → 483,36 | 150,53 → 136,00 |
| Clima | 478,32 → 470,15 | 77,10 → 76,88 |
| Central de controle | 507,07 → 520,99 | 71,15 → 71,22 |

O ensaio da fazenda apresentou cerca de 7,8% menos processamento total e 9,7% menos JavaScript. São amostras curtas em uma máquina, não promessa de ganho de FPS. As telas do Pokéfone não foram modificadas, e sua variação não é atribuída a esse ajuste. A redução de escritas repetidas foi comprovada separadamente pelos testes.

Sem mudanças em XP, save, geometria, frequência dos sprites ou velocidade/direção dos moradores. Lote validado para publicação nesta rodada. Próxima investigação: reconstruções e observadores nos aplicativos do Pokéfone, medidos individualmente; nenhum desfoque ou decoração foi retirado por suposição.
