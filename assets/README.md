# Recursos locais do jogo

Os sprites de Pokémon, itens, ícones de tipos, insígnias, gritos e retratos de treinadores usados pelo jogo foram copiados para esta pasta. O `index.html` aponta para esses arquivos locais.

- `pokeapi/`: sprites, sons, itens, tipos e insígnias do repositório PokeAPI.
- `showdown/trainers/`: retratos dos treinadores usados nas rotas e na história.
- `pmd/`: metadados e folhas de animação Mystery Dungeon do PMDCollab.
- `missing-assets.txt`: dois retratos que não estavam disponíveis na fonte; o jogo usa retratos vetoriais de fallback para eles.

Para repetir a coleta de PokeAPI/Showdown, execute `download-assets.ps1`. Para atualizar as animações PMDCollab, execute `download-pmd-assets.ps1` na pasta do jogo.

As animações PMDCollab também são locais; os metadados são empacotados em `pmd/anim-data.js` para que não dependam de requisições `fetch` ao abrir o HTML localmente. A fonte decorativa ainda é carregada de Google Fonts.
