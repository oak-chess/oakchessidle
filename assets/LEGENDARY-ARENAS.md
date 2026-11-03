# Arenas lendárias integradas

Os encontros de Articuno, Moltres e Zapdos usam as versões ilustradas aprovadas nos protótipos. Os adaptadores `articuno-arena.js`, `moltres-arena.js` e `zapdos-arena.js` expõem a mesma interface `paint/tick` das arenas integradas de Brock, Misty e Mewtwo.

## Integração

- Cenário, piso temático, decoração, banco e moradores ambientes vêm dos respectivos protótipos.
- O emblema central se transforma gradualmente em Pokébola quando começa o combate.
- O grid usa as coordenadas originais; projeção da arena e posição do banco são adaptadas à vista 2D/3D do jogo.
- Pausa, volume de efeitos, silêncio, qualidade e redução de movimento controlam os efeitos ambientes. Ao trocar de arena, os canvases e o som da anterior são desativados.
- A ave cenográfica aparece na preparação. No combate, ela é ocultada e o Pokémon adversário real assume. Não há alteração em atributos, mana, ataques ou resultado da partida.
- As pequenas interfaces dos protótipos permanecem em elementos destacados do documento; não são acrescentadas ao menu do jogo.

## Fontes e arte

`scripts/build-legendary-arenas.cjs` reúne os módulos dos protótipos em escopos separados, adapta os caminhos das imagens e produz os três arquivos usados pelo jogo. Ele também empacota as artes em WebP com transparência, em `assets/legendary-art/`, preservando os PNGs originais dos protótipos. Execute novamente ao atualizar os protótipos.

As artes dos ambientes foram criadas pela ferramenta integrada de geração de imagens. Os prompts e arquivos originais ficam nas pastas `prototypes/articuno-arena/assets`, `prototypes/moltres-arena/assets` e `prototypes/zapdos-arena/assets`. Os Pokémon ambientes usam os sprites PMD já presentes no projeto, com as atribuições mantidas em `assets/pmd`.

Implementação local, sem deploy e sem testes ou conferência visual de partida nesta etapa.
