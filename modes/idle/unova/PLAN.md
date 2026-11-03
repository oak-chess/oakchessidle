# Expansão de Unova — plano de implementação

## Decisões da expansão
- Elenco nacional #494–649 (156 espécies), incluindo os 13 lendários/míticos apenas nos sistemas de eventos.
- Base da jornada: Black/White. O primeiro destino reúne Cilan, Chili e Cress; Opelucid usa Drayden e Iris. Cheren, Roxie e Marlon ficam para desafios futuros, sem misturar duas campanhas na progressão inicial.
- Oito destinos acrescentados depois de Sinnoh, sem alterar os índices 0–31, chaves de save, identificadores de parceiros ou inventários.
- Níveis de evolução seguem dados de referência. Níveis das caçadas seguem o balanceamento próprio do Idle e serão definidos após simulações; não representam níveis de encontros dos cartuchos.
- Evoluções não exigem juntar cópias. Preservar IVs, potência, shiny, XP, equipamentos, favoritos, proteção e identidade.
- Manter ovos no nível 1, preços e probabilidades atuais do gachapon; excluir lendários e míticos dos ovos.

## 1. Dados e disponibilidade — em execução
- Gerar catálogo completo de nomes, tipos, famílias e classificação a partir das tabelas PokeAPI.
- Preservar todas as alternativas das evoluções, incluindo gênero, pedra, amizade, troca e condição de equipe. Não reduzir condições especiais a um nível inventado.
- Conferir learnsets e selecionar repertórios legais respeitando a progressão de espaços por evolução. Distinguir golpe aprendido de efeito visual disponível.
- Auditar normal/shiny, andar e repousar, direções, retratos e gritos; registrar créditos e revisão dos sprites.
- Fonte PMD conferida: 13 espécies sem animação base. Uma espécie não deve entrar com sprite de outra, imagem invisível ou direção improvisada. Buscar outra fonte compatível e montar prévia para essas lacunas.

## 2. Elenco e combate
- Acrescentar linhas sem reordenar as existentes. Tratar ramificações de Pansear/Pansage/Panpour e famílias com gênero corretamente.
- Regras especiais explícitas para Karrablast/Shelmet e evolução por troca; definir adaptação assistida no Centro para as duas espécies, sem consumir parceiros silenciosamente.
- Verificar Deino/Zweilous/Hydreigon, Larvesta/Volcarona e Rufflet/Vullaby para não antecipar evoluções.
- Formas de Darmanitan, Deerling/Sawsbuck, Basculin, Frillish/Jellicent, forças da natureza, Kyurem, Keldeo, Meloetta e Genesect precisam de decisão separada. Mudança de forma não é evolução.
- Nenhuma Mega é criada por esta expansão.

## 3. Jornada e caçadas
- Striaton, Nacrene, Castelia, Nimbasa, Driftveil, Mistralton, Icirrus e Opelucid.
- Três caçadas por destino, evitando repetição local e distribuindo todos os Pokémon comuns por habitat ou evolução.
- Busca global por espécie, níveis, bloqueios, surtos, foco de captura e automação usam as mesmas regras existentes.
- Missões de Juniper e encontros de N/Equipe Plasma com recompensas únicas; evitar replicar menus de coleção e registros.

## 4. Eventos
- Victini; Cobalion/Terrakion/Virizion; Tornadus/Thundurus/Landorus; Reshiram/Zekrom/Kyurem; Keldeo/Meloetta/Genesect.
- Integrar ao acesso atual por tentativas: sem reintroduzir espera por rotação individual.
- Manter nível 300, qualidade perfeita e regras atuais de recompensas. Nenhum lendário entra em caçadas ou gachapon por engano.
- Não conceder captura automática como recompensa de vitória.

## 5. Arte e áudio
- Oito ginásios e cenários próprios dos 13 eventos; reutilizar o motor, não o cenário visual de outro Pokémon.
- Identidade de Unova: estufa/restaurante, museu de Nacrene, ateliê de insetos, parque elétrico, mineração, hangar, gelo e arquitetura dracônica.
- Piso opaco, desaparecimento dos hexágonos em combate, selo animado e enquadramento compatível com a interface.
- Conferir gritos, trilhas regionais, transições e controles de áudio.

## 6. Integração e validação antes da publicação
- Pokédex, objetivos de coleção, pesquisa, PC, comparação, torre, ovos, gachapon de Unova, incubadora e fazenda.
- Testar cópias de saves anteriores: F5, vitória/derrota, retorno de evento e região selecionada.
- Validar os 156 IDs, repertórios legais, caminhos de evolução, todos os recursos visuais e exclusões de eventos.
- Conferir quatro regiões anteriores, Megas, evolução no Centro e oito direções da fazenda.
- Revisão no navegador com servidor HTTP e caminhos equivalentes ao GitHub Pages, além do modo local.
- Atualizar Wiki/tutorial de forma curta. Publicar somente quando os critérios acima passarem e a publicação estiver autorizada.

## Estado inicial
O jogo publicado permanece intacto. A primeira entrega é o catálogo e a auditoria reproduzível; arquivos de preparação não são carregados no jogo até que elenco, recursos e regras estejam consistentes.

## Progresso da continuação
Concluída a preparação dos 156 repertórios legais, 74 regras de evolução base, oito destinos/24 habitats e 13 eventos. Instaladas e conferidas 283 variantes PMD e 802 recursos de apoio. Criada prévia de revisão em prototypes/unova-review/index.html. Testes de dados, arquivos e prévia passaram. Esta é uma etapa de preparação; a região ainda não está ativa e as 29 variantes sem Walk original continuam registradas como pendentes, sem substituição improvisada.

## Integração concluída localmente
Unova foi integrada ao index principal após os testes da cópia isolada. São 649 espécies/40 destinos, 24 caçadas novas, 13 encontros, Gachapon/Pokédex/coleção e 21 ambientes ilustrados próprios. Evoluções, ovos nível 1, genes e índices de save foram conferidos. As variantes sem PMD usam o fallback animado correto de frente/costas que o motor já suporta, sem inventar direções. Formas opcionais, roteiro completo da Equipe Plasma e trilha específica de Unova ficam fora desta entrega; detalhes no README. Publicação autorizada em 29/10/2026 após nova validação completa, incluindo os sistemas recentes do Pokéfone.
