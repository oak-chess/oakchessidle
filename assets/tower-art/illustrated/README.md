# Artes ilustradas da Torre

14 imagens novas foram criadas com a ferramenta integrada de geração de imagens, em pixel art. Os prompts finais estão em [PROMPTS.json](PROMPTS.json).

Cada imagem tem o original PNG e uma versão WebP usada pelo jogo. O pacote preserva transparência real. As artes são exibidas com a composição inteira, sem recorte por preenchimento.

## Cartas e eventos

| Arquivo | Uso |
|---|---|
| entrance | Carta de entrada, menu principal e encerramento |
| relic-shell | Concha Restauradora |
| relic-feather | Pena do Impulso |
| relic-root | Raiz Persistente |
| relic-reserve | Núcleo de Reserva |
| relic-last | Medalhão do Último |
| relic-crystal | Cristal de Sintonia |
| starter-grass | Carta de Bulbasaur |
| starter-water | Carta de Squirtle |
| path-guard | Caminho comum |
| rest-heal | Descanso com Chansey |
| rest-supplies | Equipamento do refúgio |
| rest-shop | Renovação da loja |
| relic-pack | Embalagem reservada para futuros eventos com carrossel |

## Composições com sprites locais

A geração das imagens de Charmander e do caminho de elite foi recusada pelo serviço. Essas duas cartas usam composição no próprio HTML/CSS com cenas novas e sprites locais:

- **Charmander:** varanda ilustrada de `relic-feather` com sprite de Charmander.
- **Elite:** arsenal de `relic-reserve` com sprites de Machop e Graveler.

Essas composições não criam um PNG adicional nem usam um arquivo de imagem inexistente.

## Apresentação

As cartas compartilham a estrutura das cartas colecionáveis de desafio (`rc-collectible`, `rc-flip`, `rc-front`): moldura, nome, ilustração e efeito curto. Não há painel azul ao redor da seleção. As três relíquias aparecem diretamente; as ofertas ficam persistidas, sem novo sorteio ao recarregar. A embalagem está reservada para futuros eventos com carrossel.
