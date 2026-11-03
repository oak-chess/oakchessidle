# Cenários das Fendas Mega

Três cenários exclusivos, usados tanto no treino como no confronto pago. A seleção da caçada não é modificada; ao encerrar o desafio, sua arena volta normalmente. Piso e bordas são opacos, sem portões ou bandeiras herdados dos ginásios. A animação central da Pokébola usa o mesmo sistema das outras arenas.

| Boss | Cenário | Arquivo |
|---|---|---|
| Mega Charizard X | Caldeira das Chamas Azuis | assets/arena-charizard-x.webp |
| Mega Gengar | Ruínas do Véu Sombrio | assets/arena-gengar.webp |
| Mega Mawile | Santuário do Ferro Florido | assets/arena-mawile.webp |

Imagens criadas com a ferramenta integrada de geração de imagens em 27/10/2026. Originais PNG preservados no diretório de imagens geradas do Codex; versões WebP incorporadas ao projeto. Não foram usados assets de outros ginásios para os cenários.

## Prompts finais

Prefixo comum:

Create a landscape 3:2 hand-painted anime RPG battle environment background for a Pokemon autochess game. Elevated three-quarter view looking down, coherent perspective, polished richly textured natural materials, atmospheric painted lighting, NOT flat vector or cheap geometric props. The middle 55% of image must be broad empty level ground for a separate game board overlay. Detailed decoration belongs along left/right edges and far back. No characters, Pokemon, text, interface, hexagons or board drawn. Full bleed opaque art.

Charizard X:
A volcanic obsidian caldera for Mega Charizard X: rugged black basalt cliffs, vivid cyan blue fire vents, cooled cracked dark ground, distant glowing blue magma, charcoal and teal atmosphere, massive weathered stone natural forms.

Gengar:
A haunted ruined courtyard for Mega Gengar: crooked ancient violet stone archways, gnarled dead trees at edges, spectral violet mist, abandoned lanterns, deep indigo night, weathered plum stone ground, mysterious eerie but colorful anime mood.

Mawile:
A secluded Japanese iron shrine for Mega Mawile: aged iron torii and forged metal sculptures at edges, rose pink camellias, hanging old bronze bells, black iron rock garden, dusky warm pink sky, level slate paving in center, delicate petals and strong material texture.

## Validação

`scripts/check-idle-mega-arenas.cjs`: entrada nos três confrontos de treino, carregamento de cada arte, tema exclusivo, animação central disponível e restauração da arena/área original ao concluir. Navegador isolado, sem alterar o progresso do jogador.

## Expansão: Alakazam, Houndoom e Gardevoir

| Boss | Cenário | Arquivo |
|---|---|---|
| Mega Alakazam | Biblioteca do Horizonte Psíquico | assets/arena-alakazam.webp |
| Mega Houndoom | Fortaleza das Brasas Negras | assets/arena-houndoom.webp |
| Mega Gardevoir | Jardim do Véu Lunar | assets/arena-gardevoir.webp |

Geradas com a ferramenta integrada em 27/10/2026, convertidas para WebP e incluídas no projeto. O piso da arena usa a geometria nativa e permanece opaco.

Prefixo comum dos prompts:
Landscape 3:2 hand-painted Pokemon anime RPG battle environment, elevated three-quarter view looking down, matching an illustrated autochess game. Coherent perspective, rich natural textures and integrated decoration, sophisticated painted lighting. Broad flat empty ground across central 55 percent for separate battle board overlay; distinctive landmarks at outer edges and far back. No characters, Pokemon, text, UI, hexagonal grid or drawn board. Full bleed opaque art.

Alakazam:
Mega Alakazam habitat: an ancient psychic library-observatory open to an amber twilight sky, weathered sandstone arches, levitating books and small bronze astronomical instruments along edges, carved stepped stone terraces, warm ochre and luminous violet accents, intelligent mysterious mood, flat central old sandstone courtyard.

Houndoom:
Mega Houndoom habitat: ruined volcanic fortress of black basalt, scorched Gothic stone pillars and chained braziers along edges, crimson lava streams and ember smoke in the distance, charcoal slate courtyard center, infernal red orange light, dramatic ominous atmosphere, asymmetric naturally eroded stone architecture.

Gardevoir:
Mega Gardevoir habitat: secluded moonlit white stone garden sanctuary with reflecting pools along edges, elegant weathered arches, lush emerald foliage, clusters of blue and lavender flowers, pale moon and floating tiny motes, deep blue and soft mint silver palette, beautiful tranquil mysterious atmosphere, broad flat slate central courtyard.

As mecânicas extras das Fendas são adaptações do Idle, separadas dos golpes reais já cadastrados. Alakazam atordoa por 0,8s a cada 8s; Houndoom gera fogo e queimadura; Gardevoir recebe escudo de 8% dos PS máximos, limitado a 16%, a cada 8s. Atributos Mega usam razões entre os atributos-base da forma Mega e da forma normal. Nenhum movimento genérico substitui o repertório da espécie.

Teste da expansão: scripts/check-idle-mega-expansion.cjs.

## Novas arenas PAdventures
- Mega Blastoise: Fortaleza das Marés (`assets/arena-blastoise.webp`).
- Mega Lucario: Santuário da Aura (`assets/arena-lucario.webp`).
- Mega Swampert: Manguezal do Abalo Profundo (`assets/arena-swampert.webp`).

Criadas com image_gen integrado. Prompts completos e fontes: `padventures/ART-SOURCES.json`. Tabuleiro nativo opaco e cores próprias para cada habitat.

## Catálogo ampliado
As 22 novas arenas têm imagens próprias em `assets/arena-<key>.webp`, listadas em `expansion-specs.json` e registradas em `padventures/ART-SOURCES.json`. O catálogo atual tem 31 habitats Mega, sem reutilizar os cenários anteriores para os novos bosses.
