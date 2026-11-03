# Idiomas locais do Pokéfone

Português brasileiro é a fonte de conteúdo. O catálogo inicial de inglês e espanhol foi gerado localmente com modelos abertos Argos/CTranslate2, com sobreposições revisadas para nomes e termos do jogo. Não há consulta a tradutores durante o jogo; dados dos jogadores não são enviados.

Fontes dos modelos de preparação: índice oficial https://github.com/argosopentech/argospm-index e distribuição oficial https://data.argosopentech.com/argospm/v1/ (`translate-pt_en-1_9.argosmodel`, `translate-en_es-1_0.argosmodel`). Os modelos e as ferramentas de geração ficam em tmp/ e não fazem parte da publicação.

`i18n-catalog.js`: catálogo gerado. `i18n-overrides.js`: terminologia revisada. `i18n.js`: tradução apenas da apresentação; valores de opções, chaves, nomes dos Pokémon, saves e cálculos mantêm a representação original. Strings dinâmicas usam os segmentos locais; nomes e termos que não tenham tradução permanecem originais. Novos textos devem ser acrescentados ao catálogo ou às sobreposições.

A mudança de idioma é reversível, vale para menus, descrições, acessibilidade e textos de canvas, e permanece salva no navegador. O português restaura os textos originais. Os serviços da vila recebem o mesmo idioma por serem parte do mesmo site.
