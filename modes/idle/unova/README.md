# Unova — quinta geração no Idle

## Integração
Unova está integrada em `modes/idle/index.html`. Publicação autorizada em 29/10/2026, após os testes de dados, sprites e integração no navegador.

- Elenco nacional completo #494–649: 156 espécies, incluindo 143 comuns e 13 lendários/míticos de evento. O catálogo jogável chega a 649 espécies.
- Oito destinos acrescentados após Sinnoh, sem mover os índices 0–31 nem as linhas antigas do elenco. Jornada: Striaton, Nacrene, Castelia, Nimbasa, Driftveil, Mistralton, Icirrus e Opelucid.
- 24 habitats com as 143 espécies comuns distribuídas sem repetição. Níveis de exploração são balanceamento do Idle (a partir do nível 386), não níveis oficiais dos encontros dos cartuchos.
- 13 encontros no acesso atual por tentativas compartilhadas. Nível 300, potência P5, IVs perfeitos e recompensas atuais. Desbloqueios progressivos e três missões de Juniper para os míticos finais.
- Gachapon regional, incubadora, PC, Pokédex, filtros, comparação, coleção, torre, fazenda e busca de caçadas usam os mesmos registros. Ovos do gachapon nascem no nível 1. Preços e chances existentes preservados; lendários e míticos excluídos.

## Sprites e recursos
- 283 variantes PMD originais instaladas, 2.057 folhas validadas contra seus XMLs; 1.774 folhas possuem oito direções. Isso não significa 283 espécies: são variantes normal/shiny de parte do elenco.
- 29 variantes de 15 espécies não têm Walk original nesta revisão. O motor usa a imagem animada correta da própria espécie e variante, de frente/costas, como fallback já existente. Não há recoloração, sprite de outra espécie ou oito direções inventadas. Karrablast normal possui PMD; shiny usa fallback. A limitação visual está registrada em SPRITES.json.
- 1.426 recursos de apoio: quatro retratos animados e quatro PNGs estáticos por espécie, 156 gritos, 14 líderes/NPCs e oito insígnias. Fontes em SUPPORT-SOURCES.json.
- 21 cenários exclusivos: oito ginásios e 13 eventos. Artes geradas com a ferramenta integrada image_gen, exportadas em WebP sem mudar sua composição. Prompts completos, originais e caminhos finais em ART-SOURCES.json. Pisos opacos, grid com desaparecimento em combate e selo animado.

## Evoluções e combate
- 74 regras de evolução base; formas regionais e mudanças de forma não são aplicadas como evoluções.
- Níveis oficiais preservados, incluindo Snivy/Tepig/Oshawott 17/36, Zweilous 50, Hydreigon 64 e Volcarona 59.
- Amizade usa 90 na escala 0–100 do Idle; valores da referência permanecem no catálogo.
- Karrablast exige Shelmet na equipe ou PC; Shelmet exige Karrablast. A evolução é assistida no Centro e não consome nem evolui silenciosamente o parceiro exigido. Genes, identidade, equipamentos e proteções são preservados.
- Repertórios selecionados somente de learnsets registrados. Tynamo tem três comportamentos compatíveis; não foi inventado um quarto golpe. A progressão existente controla os espaços por estágio, evitando quatro golpes em todos os iniciais.
- Golpe legal não implica efeito gráfico exclusivo. Dano, área, cadência e comportamentos continuam adaptações do Idle, usando os efeitos compatíveis existentes.

## Fontes
- Espécies, nomes, tipos, golpes, evoluções e grupos de ovos: https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv . Cópias de referência e hashes em source/manifest.json.
- Sprites PMD e créditos: https://github.com/PMDCollab/SpriteCollab . Revisão fixada em source/manifest.json, créditos por variante em assets/pmd/sprite e nomes em credit_names.txt. Mesmas condições de uso não comercial da fonte.
- Retratos: https://github.com/PokeAPI/sprites ; gritos: https://github.com/PokeAPI/cries ; treinadores: https://play.pokemonshowdown.com/sprites/trainers/ . Atribuições das fontes mantidas.
- Learnsets existentes preservam seus jogos de referência. Espécies ausentes no catálogo anterior usam o último version_group disponível na tabela consultada.

## Validação
- check-idle-unova-foundation.cjs: IDs, classificação, famílias, fontes e níveis de referência.
- check-idle-unova-moves.cjs: 156 repertórios legais, regras base, itens e parceiros.
- check-idle-unova-pmd.cjs: 283 variantes e 2.057 pares folha/XML com créditos.
- check-idle-unova-content.cjs: oito ginásios, 24 habitats, exclusão dos lendários, 1.426 recursos de apoio, os 649 retratos do catálogo e todas as variantes estáticas de Unova.
- check-idle-unova-integration-browser.cjs: 649 espécies/40 destinos, índices antigos, migração, gacha 10x, eclosão nível 1, troca preservando genes/parceiro, coleção, 13 eventos, oito ginásios e 13 combates lendários com artes, F5 e isolamento de saves. Executado tanto na prévia quanto na página principal; também por HTTP local.
- Backups dos arquivos antes da integração em tmp/unova-before-integration. Nenhum save real foi usado pelos testes.

## Limites desta entrega
Formas sazonais, Zen, Therian, Kyurem Branco/Preto, Keldeo Resolute, Meloetta Pirouette, drives de Genesect e diferenças visuais de gênero não constituem novas evoluções nesta etapa. Não foram criadas Megas de Unova nem uma campanha narrativa completa da Equipe Plasma. Trilhas específicas de Unova ficam para uma etapa própria; o mixer atual continua funcionando.

## Ferramentas de preparação
Os geradores de dados e assets ficam em scripts/. build-unova-integration-preview.cjs e activate-idle-unova.cjs são scaffolds de uso único e recusam reaplicação após a promoção. A prévia de sprites permanece em prototypes/unova-review/index.html. A cópia isolada do motor em prototypes/unova-review/real.html conserva armazenamento separado.

Correção do catálogo: as 13 espécies ausentes do antigo catálogo PMD também não tinham os PNGs estáticos locais. Os arquivos corretos foram instalados. check-idle-unova-catalog-browser.cjs verifica a decodificação dos 649 retratos e de 468 variantes adicionais de Unova, além dos seis Pokémon reportados dentro do pop-up real do gachapon.
