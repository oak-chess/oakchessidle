# Histórico cheio, memória e ciclo de vida dos painéis

## Cenário isolado

`node scripts/check-panel-lifecycle.cjs` usa Chrome headless 1366×768 com perfil novo: 300 Pokémon armazenados, 200 capturas recentes (limite atual), 80 registros da jornada e 1.000 eventos de laboratório no arquivo permanente. Este último não tem limite fixo; 1.000 é a carga exercitada, não uma capacidade máxima.

O arquivo permanente é gravado pelo serviço real em IndexedDB. Foram conferidos seus 1.000 eventos e uma página de 20 itens, sem duplicação ao alternar aplicativos. As capturas recentes e o PC conservaram seus tamanhos. Recursos externos ficaram bloqueados, sem acessar dados reais do jogador.

Cada ciclo abre/fecha o PC e alterna Registros, Clima, Rádio e Início no Pokéfone. Após dois ciclos de aquecimento, são medidos 24 ciclos, sempre com painéis fechados e coleta de lixo solicitada pelo Chrome. São registrados heap JavaScript, contadores DOM e de listeners do navegador e os intervalos/frames agendados no documento principal. Não mede memória de GPU/imagens decodificadas nem processos de outros programas.

## Resultados locais

| Medida | Antes do ajuste | Depois do ajuste |
|---|---:|---:|
| Intervalos, início → final | 16 → 16 | 16 → 16 |
| Frames pendentes, início → final | 6 → 6 | 5 → 5 |
| Heap JS após GC, início → final | 36,60 → 37,28 MiB | 36,64 → 37,31 MiB |
| Nós DOM, início → final | 8.062 → 8.075 | 8.140 → 8.149 |
| Listeners reportados, início → final | 1.264 → 1.290 | 1.304 → 1.322 |

O ensaio não detectou acúmulo de intervalos nem grande crescimento de heap nesse intervalo. Há pequena retenção de nós/listeners e acomodação do heap; os números não demonstram ausência universal de vazamentos. Não foi atribuído ganho de memória ao ajuste. Comparações de FPS não foram feitas.

Os testes usam limites de regressão explícitos (mesma quantidade de intervalos, até dois frames adicionais, até 150 nós e até 8 MiB adicionais após aquecimento). Passar nesses limites não equivale a uma prova de estabilidade por horas. Relatórios locais: `output/panel-lifecycle-before.json` e `output/panel-lifecycle.json`.

## Ajuste comprovado: miniaturas do perfil

`assets/trainer-profile/partner-sprites.js` agendava rAF continuamente mesmo sem miniaturas visíveis. Agora agenda um único ciclo somente quando há miniaturas conectadas e visíveis e o perfil/aba estão visíveis. Observação de interseção e retorno de visibilidade retomam o desenho; remoção desconecta a observação. A API `load/draw` usada pelo Centro e pela vila permanece disponível.

`node scripts/check-partner-sprite-lifecycle.cjs` verifica início sem loop, uma única cadeia ativa, ocultação e retorno do perfil, ocultação e retorno de aba e liberação de miniaturas removidas. O teste integrado de painéis confirmou a redução de um frame pendente ocioso nesse cenário. Não foi reduzida a cadência do desenho quando visível.
