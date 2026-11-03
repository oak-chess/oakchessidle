# Trilhas de Hoenn — Ruby, Sapphire e Emerald

Fonte: https://www.enls.eu/prelooped/album/?game=RSE

20 faixas Ogg locais, selecionadas do álbum original de Game Boy Advance. Os nomes originais, URLs, tamanho, taxa de amostragem e pontos de loop estão em `tracks-hoenn.json`. Reprodução respeita volume, mute e crossfade do mixer nativo. Apenas a faixa selecionada é carregada.

| Arquivo | Nome na fonte | Uso |
|---|---|---|
| hoenn-forest.ogg | Petalburg Woods | Bosques de Hoenn |
| hoenn-meadow.ogg | Route 104 | Pradarias e rotas |
| hoenn-garden.ogg | Route 120 | Jardins e reservas |
| hoenn-cave.ogg | Cave of Origin & Meteor Falls | Cavernas e gelo |
| hoenn-water.ogg | Surf | Águas e praias |
| hoenn-ghost.ogg | Mt. Pyre | Regiões de espíritos |
| hoenn-dragon.ogg | Victory Road | Regiões de dragões |
| hoenn-volcano.ogg | Mt. Chimney | Regiões vulcânicas |
| hoenn-center.ogg | Pokemon Center | Centro Pokémon |
| hoenn-shop.ogg | Poke Mart | Loja |
| hoenn-gym-lobby.ogg | Pokemon Gym | Preparação de ginásio |
| hoenn-gym.ogg | Battle! (Gym Leader) | Batalhas de ginásio |
| hoenn-trainer.ogg | Battle! (Trainer Battle) | Desafios de treinadores |
| hoenn-wild.ogg | Battle! (Wild Pokemon) | Latias, Latios, Jirachi e Deoxys — tema de batalha compartilhado |
| hoenn-regis.ogg | Battle! (Regirock, Regice, Registeel) | Regirock, Regice e Registeel |
| hoenn-ancient.ogg | Battle! (Super-Ancient Pokemon) | Groudon, Kyogre e Rayquaza |
| hoenn-mew.ogg | Battle! Mew | Mew — versão de Emerald |
| hoenn-tower.ogg | Battle Tower | Preparação da torre |
| hoenn-frontier.ogg | Battle! Frontier Brain | Batalhas da torre e ligas especiais |
| hoenn-ruins.ogg | Sealed Chamber | Preparação dos Regis |

O tema Battle! (Wild Pokemon) é compartilhado por Latias, Latios, Jirachi e Deoxys nesta adaptação; não é apresentado como tema exclusivo de Jirachi ou Deoxys. Battle! Mew é a faixa de Emerald e também acompanha o evento do Mew fora de Hoenn. Áreas geladas usam o tema de cavernas. A música de exploração não é reiniciada a cada onda.

Ginásios e torre alternam preparação e combate; os Regis usam Sealed Chamber na preparação. Os eventos selecionam sua trilha pela espécie, mesmo quando o jogador está em outra região. Kanto e Johto preservam as trilhas HGSS anteriores, e a Equipe Rocket mantém suas faixas próprias.

Pontos LOOPSTART/LOOPLENGTH são lidos do cabeçalho Vorbis e normalizados para a escala de 44100 usada pelo mixer. Validação: `scripts/check-hoenn-music.cjs` (seleção, continuidade e metadados) e `scripts/check-hoenn-audio-browser.cjs` (decodificação real das 20 faixas e reprodução no Chromium).

Créditos da preparação dos loops: ENLS’s Pre-Looped Music Library. Músicas originais: Game Freak/Nintendo/The Pokémon Company e seus compositores. Nenhuma licença aberta é atribuída às gravações.
