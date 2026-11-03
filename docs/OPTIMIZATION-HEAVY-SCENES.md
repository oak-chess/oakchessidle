# Diagnóstico dos cenários e aplicativos

## Plano de execução

1. Reproduzir portal misterioso, vila/fazenda e Pokéfone com o mesmo save de laboratório, resolução e navegador. Nenhum perfil real será usado.
2. Executar três amostras por cenário, registrar processamento total, JavaScript, memória após GC, temporizadores e erros de recursos. Manter o quarto lote local durante ambas as medições.
3. Inspecionar o maior custo encontrado. Separar animação puramente visual de treinamento, XP, sorteios, captura, combate e persistência.
4. Aplicar uma mudança pequena e reversível. Preservar os caminhos das duas entradas, movimento nas oito direções, velocidade dos personagens, alertas e áudio.
5. Comparar nas mesmas condições e testar abertura/fechamento, movimento reduzido e continuidade do jogo. Só atribuir ganhos comprovados; os ensaios são curtos e não equivalem ao FPS de todos os jogadores.

## Etapas seguintes

Depois da análise visual, mapear recursos realmente carregados por região antes de alterar o carregamento de mídias. Não excluir arquivos por nome de geração ou pasta. Publicação será feita após a validação do lote.

## Primeira medição

Relatório local `output/performance-extended-before.json`, três amostras de 4 segundos por tela. Cenários abertos de verdade pelos controles/APIs nativos, com recursos externos bloqueados. Nenhum erro de execução ou recurso local ausente nas rotas exercitadas.

| Tela | Processamento total (ms/s) | JavaScript (ms/s) | Heap após GC (MiB) |
|---|---:|---:|---:|
| Portal misterioso | 468,79 | 84,42 | 36,61 |
| Vila | 431,84 | 115,48 | 36,44 |
| Pokéfone | 561,45 | 75,83 | 36,63 |

O Pokéfone foi o maior custo total neste ensaio; a vila teve maior custo JavaScript. A fixture inicial não tem moradores treinando: não representa uma fazenda cheia. O custo com moradores exige outra medição antes de alterar a movimentação.

O portal já limita seu canvas a 24 atualizações/s e encerra a animação ao fechar. A vila já limita a ambientação a 30/s, mas atualiza os personagens no ritmo da tela. Não há motivo para simplesmente remover esses efeitos.

## Experimento de diagnóstico

O profiler ganhou cenários `portal`, `village`, `phone` e `phone-no-blur`. O último remove o desfoque somente através de estilo injetado pelo teste; não muda os arquivos CSS do jogo. Também permite escolher cenários por `IDLE_PROFILE_SCENARIOS`.

Um primeiro teste sem desfoque apresentou menor processamento total, mas também menos oportunidades de rAF; isso pode refletir variação da máquina. Foi solicitada uma comparação pareada, alternando as duas configurações na mesma execução, antes de decidir qualquer mudança visual.

A comparação pareada (`performance-phone-blur-paired.json`) terminou com 532,06 ms/s com desfoque e 529,05 ms/s sem desfoque, ambos próximos de 60 oportunidades de rAF/s. Diferença pequena: o desfoque foi preservado. Não há evidência suficiente para atribuir a ele o custo maior do Pokéfone.

## Primeiro ajuste comprovável

As três telas mantinham aproximadamente 40 callbacks em 4 segundos de `mystery-portal-audio.js`, mesmo sem efeitos sonoros ativos. A verificação de silenciamento agora só existe enquanto houver notas tocando. Um único temporizador é compartilhado pelas notas; termina após a última nota, ao silenciar, ocultar a aba ou fechar o portal. Música, volume, duração e timbre não foram alterados.

Teste de ciclo de vida: `node scripts/check-portal-audio-lifecycle.cjs`. O teste real do portal também passou: canvas animado, roleta, áudio, silenciamento, descoberta salva, combate pago, fechamento e Rocket separado, sem erros de navegador. O benefício esperado é retirar callbacks ociosos, não um ganho expressivo de FPS.

## Comparação após o ajuste

`output/performance-extended-after.json`, mesmas três amostras por tela:

| Tela | Callbacks/4 s antes → depois | Total ms/s antes → depois |
|---|---:|---:|
| Portal | 238 → 200 | 468,79 → 459,18 |
| Vila | 242 → 201 | 431,84 → 448,66 |
| Pokéfone | 243 → 205 | 561,45 → 541,39 |

A redução de callbacks foi confirmada. Processamento variou nos dois sentidos; não há ganho geral comprovado de FPS. Sem erros ou recursos locais faltando nas amostras.

Próximo diagnóstico: Pokéfone com aplicativos/central de controle abertos e fazenda com moradores, medindo separadamente trabalho de desenho e composição. O cenário de vila vazia não justifica reduzir a animação dos Pokémon. Nenhuma mudança visual foi aplicada neste lote. Validação realizada antes da publicação desta rodada.
