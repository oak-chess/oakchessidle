# Eventos regionais — fase 3

Implementação em `regional-events.js` e `regional-events.css`, usando o sistema de diálogo e escolhas existente. Não altera o cronograma nem a versão dos saves.

## Encontros

- Floresta: preparação 1-2. Resgatar um Pokémon por 2 de ouro, ajudá-lo gratuitamente e recuperar até 4 PS de treinador, ou seguir viagem.
- Pedreira: primeira preparação de Brock, após a introdução dele. Restaurar Omanyte ou Kabuto por 4 de ouro; recolher fragmentos por 2 de ouro; ou seguir viagem.
- Costa: primeira preparação de Misty, após a introdução dela. Guardar 4 de ouro; recuperar por 2 de ouro um item cujo nome e efeito são apresentados antes da escolha; ou seguir viagem.

Pokémon disponíveis respeitam o estoque e exigem vaga no banco. As ofertas são estáveis para a semente da campanha. Sem sorteios ocultos após pagar.

## Continuidade

`G.regionEvents` faz parte do snapshot da campanha e é zerado em `newGame`. Cada encontro possui estados `choice`, `result` e `done`, além da rodada de origem. A recompensa é aplicada uma vez antes de salvar o resultado; recarregar nesse estado reapresenta somente a confirmação.

O snapshot é salvo explicitamente durante o evento, pois o salvamento geral bloqueia telas modais. A continuação do checkpoint roda somente após confirmar o resultado. Fusões aguardam o fechamento de todos os eventos antes de iniciar animações ou escolhas de evolução.

Conquistas, notificações shiny e resumos de batalha já aguardam `G.eventModal`. Demonstração inicial, prévia de arenas e revanche de chefe não oferecem estes eventos. Saves antigos em um checkpoint já concluído não são interrompidos retroativamente.

Sintaxe conferida; revisão visual e recarga de campanha no navegador ainda pendentes pelo bloqueio da ferramenta a arquivos locais. Alterações não publicadas.

## Artes correspondentes ao Pokémon

As duas escolhas da floresta e a confirmação usam a espécie registrada no encontro: 10 (Caterpie), 16 (Pidgey) ou 43 (Oddish). Arquivos em `assets/regional-art/forest-<id>.png`. As imagens anteriores de Pikachu/Eevee e Venusaur não são usadas nesse encontro.

Artes geradas pela ferramenta integrada de imagens. Prompts finais: um único Caterpie sobre uma folha, Pidgey sobre uma raiz com musgo ou Oddish entre samambaias, na Floresta de Viridian; ilustração Pokémon pintada em formato vertical, personagem em destaque na metade superior, vegetação escura embaixo para o texto, sem escrita ou moldura.

As cartas dos fósseis e sua confirmação usam `assets/regional-art/quarry-138.png` (Omanyte) e `quarry-140.png` (Kabuto). Artes criadas pela ferramenta integrada de imagens: único Pokémon em destaque na metade superior, escavação na pedreira de Pewter com fósseis nas rochas e luz quente, ilustração Pokémon pintada em formato vertical, terço inferior escuro para o texto, sem escrita ou moldura.

Escolhas regionais, desafios e rotas reutilizam `SND.hover()` no mouse e `SND.click()` na confirmação. A navegação por setas mantém o som já existente. O som segue as configurações de áudio do jogo.
