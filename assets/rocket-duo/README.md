# Jessie e James — eventos Rocket

## Versão colorida em uso

A arena e as apresentações agora usam `jessie-color.png` e `james-color.png`, adaptações da comunidade provenientes de https://github.com/LucianoNeo/gen1recomp-mods/tree/master/hgss_sprites/overrides/sprites . São folhas de 256×1536, com seis quadros quadrados: frente, costas, lado e respectivas variações de passo. Não são sprites oficiais de HGSS. O renderizador respeita os quadros completos, alterna as poses de frente e vira para o lado no recolhimento. A preferência do sistema por movimento reduzido e a pausa interrompem a alternância. Os arquivos foram mantidos sem recoloração ou redesenho; a fonte do pacote e seus créditos gerais estão em https://github.com/LucianoNeo/gen1recomp-mods/blob/master/hgss_sprites/README.md .

## Versão anterior, preservada como referência

Sprites oficiais de mapa de Pokémon Yellow, obtidos em:

- https://github.com/pret/pokeyellow/blob/master/gfx/sprites/jessie.png
- https://github.com/pret/pokeyellow/blob/master/gfx/sprites/james.png

Gráficos: Game Freak/Nintendo/The Pokémon Company. As folhas originais são mantidas em preto e branco. As cópias transparentes para arena são geradas por scripts/prepare-rocket-duo.ps1, preenchendo as bordas de cada quadro e preservando os pixels brancos internos. O navegador apenas carrega os PNGs; não executa getImageData, que pode ser bloqueado ao abrir o jogo por file:. Poses originais são usadas sem inventar um gesto de lançamento.

## Encontros

Base Escondida: rotas opcionais nas etapas 14 e 34. Lavender: etapas 19 e 44, com bloqueio da escadaria. Não substituem os chefes, Marowak ou o resgate final do Sr. Fuji. Saves existentes recebem somente rotas futuras; o encontro atual e as escolhas já abertas são preservados.

Equipe: linhas de Ekans, Koffing e Meowth, com o desenvolvimento de estrelas já utilizado pelo capítulo. Recompensa padrão: 6 ouro e 2 XP. Derrota causa o dano normal e pode roubar 20% do ouro disponível (mínimo 1) ou um item da mochila, com sorteio entre categorias disponíveis. Não retira equipamentos, Pokémon ou recursos de outro modo. O roubo é limitado a uma ocorrência por encontro; a revanche devolve o saque antes de conceder o avanço. Sem recursos elegíveis, não há roubo.

Estado persistido na tentativa: `duoRoutesVersion`, `duoTheftSteps`, `duoLoot`, `duoWonStep`. O diálogo de vitória é salvo como sala concluída antes do avanço; recarregar não concede novamente a recompensa nem restitui o saque duas vezes. Sair salva a revanche na mesma etapa; perder a tentativa por vida zero encerra a operação normalmente.

Integração em `events.js` com navegação e combate de `assets/rocket-operation.js`; a dupla é desenhada pelo renderizador real de oponentes de `assets/trainer-recall.js`. Não foram executados testes ou revisão visual na partida nesta entrega. Não publicado remotamente.
