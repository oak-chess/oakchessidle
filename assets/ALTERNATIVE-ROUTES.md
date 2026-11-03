# Rotas alternativas

Escolha disponível na primeira batalha normal de cada etapa de Kanto após Brock (etapas 2 a 8). Não aparece em demonstrações, prévias, eventos extras nem revanches. Partidas salvas com o checkpoint já concluído recebem a escolha na próxima etapa elegível.

As cartas usam arte de Pokémon em toda a superfície; clicar seleciona a rota. Há também um caminho normal.

- Confronto de elite: o adversário da rodada atual recebe 20% de vida e 15% de ataque/poder de habilidade extras, após os ajustes normais de dificuldade. Vitória concede 4 de ouro adicionais; derrota não concede esse bônus. Não acrescenta uma rodada ao cronograma.
- Poké Mart: três equipamentos, 2 de ouro cada; permite uma compra ou sair. Equipamento entra na mochila. Não altera a loja normal.
- Encontro em Kanto: recuperar até 6 PS de treinador (máximo 100) ou ganhar 3 de ouro.

Loja e encontro são paradas antes da batalha normal da etapa. A descrição mostra os efeitos antes da escolha.

Dados em `G.alternativeRoutes`, incluídos no salvamento: escolha, etapa do diálogo, ofertas, ação e resolução do confronto. Reabrir o jogo retoma a escolha/visita/confirmação pendente sem repetir recompensas.

Integração: checkpoint após desafios/eventos regionais; modificador em `beginBattle`; recompensa em `finishBattle`, antes de calcular o resultado normal.

Artes: `assets/route-art/`. Geração pela ferramenta integrada de imagens, sem CLI. Prompts das novas imagens: cenas de Poké Mart com Chansey/Poké Balls/Poções e encontro de Pikachu/Eevee/Caterpie/Pidgey na Floresta de Viridian, composição vertical 2:3, ilustração Pokémon sem texto ou moldura, parte inferior escura para texto. A carta de elite reutiliza a cena de Onix do jogo porque a geração solicitada foi bloqueada.
