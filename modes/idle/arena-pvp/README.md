# Arena local contra treinadores NPC

Acesso: Modos → Arena. O card é o quinto da lista, ao lado da Torre; clique e arraste para navegar. O combate usa a equipe real do jogador e os adversários do catálogo de 143 retratos. Não há jogadores online ou servidor multiplayer nesta etapa.

A classificação é ordenada por pontos (+30 na vitória, −15 na derrota, mínimo zero), com desafios até cinco posições de distância. O Top 5 exige estar no Top 10. A lista possui scroll e mantém a posição do jogador fixa. Histórico e recompensas são permanentes no save; cada marco de dez vitórias oferece resgate único de 10.000 Coins. Detalhes e migração em docs/ARENA-LOCAL.md.

As molduras, retratos e botões são artes geradas e aprovadas nesta conversa, otimizadas para WebP. Histórico e Recompensas usam fundos sem os dados ilustrativos; resultados e controles são preenchidos em tempo de execução. O exterior das molduras é transparente. Não há polling nem animação contínua nos painéis.

Verificações: scripts/check-arena-ranking.cjs, scripts/check-arena-ranking-browser.cjs e scripts/check-arena-ledgers-browser.cjs.

## Retratos adicionais

`portraits-v2.webp`: 24 personagens, seis colunas × quatro linhas.
`portraits-v3.webp`, `portraits-v4.webp`, `portraits-v5.webp`: 30 retratos cada, seis colunas × cinco linhas.
`portraits-v6.webp`: 24 retratos, seis colunas × quatro linhas.

Arte gerada nesta conversa com a ferramenta integrada de imagens, usando o primeiro atlas como referência de estilo. Prompt de produção: coleção uniforme de closeups dos personagens Pokémon, rostos e ombros, lineart limpo e cel shading, fundo azul escuro, sem nomes ou molduras, ordem explícita por célula. Os nomes, IDs, regiões e coordenadas ficam separados em dados da interface. Arquivos compactados em WebP, carregados sob demanda, sem animações contínuas.
