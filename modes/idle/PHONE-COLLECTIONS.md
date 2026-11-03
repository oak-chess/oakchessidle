# Estojo e Pokédex do Pokéfone

Os dois aplicativos ocupam os primeiros atalhos da base, substituindo PokéChat e Inventário nesse local. Esses aplicativos continuam na tela inicial. PokéNav e Ajustes mantêm seus lugares na base. Os novos aplicativos também aparecem na segunda página, na busca e na biblioteca.

O Estojo consulta `world.badges` e as mesmas regiões, líderes, sprites e requisitos da Jornada. Selecionar uma insígnia não muda a caçada. “Ver ginásio” abre o líder escolhido na Jornada. Insígnias obtidas depois da criação do aplicativo recebem um brilho ao serem exibidas.

A Pokédex deriva suas 649 espécies das linhas realmente disponíveis no Idle. Vistos e capturados seguem os registros já usados pela Pokédex da jornada; shiny registrado considera exemplares existentes e o histórico de capturas disponível. Não há uma segunda contagem salva. Os filtros e a paginação são locais à interface.

O detalhe separa a espécie dos atributos individuais, mostra a família e as condições de evolução do jogo e localiza os encontros em todas as caçadas cadastradas. Não apresenta descrições de lore inventadas. Dados e progresso permanecem nos sistemas existentes.

Validação: `node scripts/check-phone-collections.cjs`. Confere regiões e insígnias, navegação para o líder correto sem viajar, catálogo de Unova, busca numérica, shiny registrado, evoluções, filtros e orientação horizontal.
