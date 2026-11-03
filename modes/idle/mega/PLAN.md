# Mega Evolução — plano e critérios de aceitação

## Escopo inicial
Charizard X (Charizardite X), Gengar (Gengarite), Mawile (Mawilite), Alakazam (Alakazite), Houndoom (Houndoominite), Gardevoir (Gardevoirite). Somente formas com Idle, Walk e Attack PMD verificados. Variantes normais e shiny e créditos preservados. Não altera as espécies, os IDs ou as linhas evolutivas existentes.

## Progressão
Após cinco vitórias de exploração, a missão do Professor Carvalho entrega uma Pedra-Chave permanente e três Bronze Boss Tokens, uma única vez. Cada vitória válida em lendário/mítico de evento entrega um token; Rocket, exploração, torre, offline e treino não entregam tokens. Não existe recompensa retroativa.

## Desafios
Nível 350, IVs perfeitos, P5, atributos da forma Mega adaptados ao combate nativo. Uma entrada custa um token e exige confirmação. Validação da equipe vem antes da cobrança. Treino gratuito, sem quaisquer recompensas. Recarregar/abandonar interrompe o desafio e não devolve o token. Não altera rota ou progresso de caçadas. Saúde segue as regras existentes de desafio.

## Recompensas
Vitória paga: 3–5 fragmentos da espécie, +5 na primeira vitória paga, chance independente de 5% da pedra inteira. Derrota/treino: zero. Fabricação custa 100 fragmentos (específicos da pedra, completados por universais de caçadas; consumir específicos primeiro), permanente e específica; pedras repetidas não são consumidas nem liberam múltiplas Megas simultâneas. Não há venda de tokens/pedras nesta versão. Consulte CRAFT-PLAN.md para a oficina do Carvalho e o drop universal de 0,5% por vitória comum.

## Parceiro
Pedra-Chave + pedra específica + forma final compatível. Slot exclusivo, separado dos equipamentos; um único parceiro designado por vez, selecionado no laboratório Mega ou por atalho na ficha. Transformação no início do combate, encerra junto do combate, sem modificar o membro salvo. Identidade, nível, genes, favorito/cadeado e itens preservados. Compatibilidade revalidada em cada luta. Forma normal durante preparação. Shiny continua shiny.

## Interface
Painel Mega no Centro Pokémon: missão, tokens, catálogo dos seis bosses, requisitos, recompensas, treino e entrada paga, fragmentos/fabricação, escolha de parceiro, remoção da designação. Ficha e Wiki com atalhos e explicações. Estilo Rocket existente com acentos de energia/cristal, suporte a telas menores e movimento reduzido.

## Persistência e testes
Estado versionado em world.mega; transações com rollback em falha de salvamento. Recompensas idempotentes por identificador de encontro/desafio. IDs de desafio monotônicos. Migração sem apagar dados. Testes de missão única, elegibilidade, cobrança, derrota/treino, limites RNG, primeira vitória, fabricação/equipagem, recarga e preservação dos membros. Navegador: PMD normal/shiny, fluxo real, combate, retorno à forma base, regressão de eventos e caçadas. Publicação só após solicitação.

## Expansão PAdventures
Mega Blastoise, Mega Lucario e Mega Swampert foram integrados posteriormente. Veja `TRIO-EXPANSION.md` para regras, limitações das direções/animações, versão shiny e testes. O elenco atual tem nove bosses; os seis PMD originais foram preservados.

## Ampliação do catálogo
Mais 22 formas aprovadas foram adicionadas, totalizando 31. Regras, fontes, sprites, Charizard Y e testes: `EXPANDED-ROSTER.md`. Os nove bosses anteriores foram preservados.
