# Sinnoh — fontes e implementação

- Elenco: Pokémon 387–493, incluindo as cinco espécies já cadastradas anteriormente, sem duplicar ou renumerar linhas antigas.
- Sprites PMD normais e shiny: https://github.com/PMDCollab/SpriteCollab , revisão fixada em SOURCE.json. Licença CC BY-NC 4.0. Históricos completos em assets/pmd/sprite/<número>/credits.txt e <número>/0000/0001/credits.txt; nomes dos autores em credit_names.txt. Foram instaladas 214 variantes com 4.027 folhas físicas, validadas contra os XMLs correspondentes.
- Retratos e sprites alternativos: https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/other/showdown ; líderes: https://play.pokemonshowdown.com/sprites/trainers/ ; insígnias e itens: https://github.com/PokeAPI/sprites . Mesmas atribuições das outras regiões; não há nova declaração de licença de Pokémon ou marcas.
- Evoluções: https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_evolution.csv e pokemon_species.csv, consultados em 27/10/2026. Regras geradas em evolutions.js; condições assistidas do Idle descritas na Wiki e no painel.
- Golpes: assets/dex/learnsets.js e assets/dex/moves.js já existentes; todos os golpes escolhidos passam por validação de aprendizado. As assinaturas da quarta geração usam comportamentos de combate adaptados, sem afirmar reprodução exata da animação do cartucho.
- Cenários: 22 novas artes geradas com a ferramenta integrada de imagens, oito ginásios e 14 encontros lendários/míticos. Arquivos finais WebP em art/. Prompts individuais e originais em ART-SOURCES.json.

Prefixo comum de todos os prompts das artes:
Landscape 3:2 hand-painted Pokemon anime RPG background, elevated three-quarter view looking down. Rich textured natural painted materials, coherent integrated architecture, no artificial flat vector decoration. Center 55 percent must remain broad empty level ground for a separate game board overlay. Landmarks and decoration at far back and outer sides. No characters, Pokemon, text, interface, hexagons or board. Opaque full bleed art.

## Regras específicas
- A região segue a ordem de ginásios Diamond/Pearl. A escala de níveis das caçadas é própria do Idle e começa em 290, após Hoenn.
- Formas base das 107 espécies incluídas; mudanças opcionais de forma de Rotom, Giratina, Shaymin e tipos de Arceus não estão implementadas nesta expansão. Mega Evoluções não foram acrescentadas por esta etapa.
- Leafeon/Glaceon e Probopass usam a alternativa moderna por pedra. Evoluções que exigem conhecer um golpe são assistidas no Centro a partir do nível da aprendizagem registrado. O requisito de Remoraid de Mantyke aceita equipe ou PC.
- Os saves anteriores mantêm os 24 destinos existentes, índices de espécies, inventários, genes, ovos e agenda de eventos. Sinnoh acrescenta oito destinos e grupos desbloqueados gradualmente.

## Verificação
- scripts/check-idle-sinnoh.cjs: elenco, golpes legais, 24 habitats, migração, índices, evoluções, gênero, parceiro, gachapon e arquivos de sprites.
- scripts/check-idle-sinnoh-browser.cjs: 214 variantes PMD, Jornada, eventos, gachapon, oito ginásios, 14 eventos com execução de golpes, cenários e F5.
- scripts/check-idle-center-evolution.cjs: animação no Centro e preservação dos dados.

Gritos: https://github.com/PokeAPI/cries/tree/main/cries/pokemon/latest ; arquivos OGG originais, normal e shiny compartilham o grito da espécie. Imagens estáticas de fallback normal/shiny e frente/costas na fonte PokeAPI/sprites acima. Os 107 gritos e as quatro imagens por espécie foram verificados.

Atualização de acesso aos encontros: lendários e míticos agora são escolhidos livremente após desbloquear, usando até três tentativas compartilhadas, com uma recarga a cada 20 minutos. Rocket permanece separado. Ver ../LEGENDARY-ACCESS.md. A publicação conjunta de Sinnoh e do novo acesso foi autorizada pelo usuário após esta validação.
