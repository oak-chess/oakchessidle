# Arena local

A classificação inclui os 143 treinadores NPC e o jogador. Os combates usam a equipe real e o motor de batalha do Idle; este modo ainda não representa jogadores online.

- Vitória: +30 pontos. Derrota, abandono por recarga ou combate sem vencedor: -15 pontos, com mínimo zero.
- A tabela é ordenada por pontos. Empates mantêm a ordem anterior; vencer não troca diretamente a posição com o adversário.
- É permitido desafiar até cinco posições acima ou abaixo. Para enfrentar qualquer integrante do Top 5, é necessário estar no Top 10; a distância máxima continua valendo.
- A lista inteira possui scroll, começa perto de um adversário elegível e mantém a linha do jogador fixa. Consultar um treinador distante não libera o desafio.
- Cada marco de dez vitórias concede 10.000 Coins, recolhidas separadamente. Recompensas não podem ser repetidas após recarregar.
- Saves da classificação antiga recebem pontuação equivalente à ordem existente, preservando vitórias, histórico e recompensas já recolhidas.
- Histórico registra adversário, resultado, posições, alteração de pontos e total após cada partida. Até 100 partidas recentes são exibidas.

Verificações: scripts/check-arena-ranking.cjs e scripts/check-arena-ranking-browser.cjs.

## Histórico e recompensas

Os dois painéis usam as artes aprovadas, com exterior transparente e valores reais sobrepostos. Histórico: filtros Todas/Vitórias/Derrotas, quatro partidas por página, retratos do catálogo e navegação por páginas. Recompensas: cinco marcos por página, barra do próximo marco, botões dourados disponíveis, estados recolhido/bloqueado e confirmação de resgate. Escape fecha primeiro o subpainel e devolve o foco ao botão da Arena. As imagens WebP e sprites de botões só são solicitados quando necessários; as fontes grandes ficam em output, fora da publicação.

Validação visual e funcional: scripts/check-arena-ledgers-browser.cjs.
