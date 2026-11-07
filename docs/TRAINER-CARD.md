# Cartão do treinador

O cartão usa dados reais do perfil, VIP, equipe em campo, sinergias, insígnias e objetivos de coleção. O editor e os comandos de navegação continuam sendo os originais. A visão geral segue as posições da arte aprovada; as demais abas têm conteúdo próprio rolável.

O poder total é um índice de preparação: soma de PS máximos, Ataque, Poder, Defesa e Resistência, após genes e equipamentos. Não aplica efeitos temporários de combate nem altera Pokémon ou batalhas.

Os retratos usam uma pose dos sprites Mystery Dungeon já disponíveis, com cache limitado, sem iniciar novas animações. O teste `node scripts/check-trainer-card-browser.cjs` verifica seis posições, cinco regiões, abas, edição, isolamento dos estilos e limites em duas resoluções.

## Coleção de retratos ilustrados

A coleção possui 143 retratos de rosto: os cinco da referência aprovada, 24 do primeiro lote e 114 novos nos quatro lotes seguintes. Os atlas `portraits-v2.webp` até `portraits-v6.webp` usam seis colunas e quatro ou cinco linhas. A ordem dos 114 adicionais está em `trainer-portraits-extra.js`. Arte criada com a ferramenta integrada de imagens, orientada pelo estilo dos retratos da Arena: close de rosto, fundo azul escuro, lineart e cores de anime, um personagem por célula. Apenas retratos ilustrados são oferecidos; não são todos os personagens da franquia.

Há busca por nome, filtro regional e 12 páginas. Busca, filtro e página são preservados ao selecionar. A seleção é salva em `idleProfile.portrait`, independente do outfit em `idleProfile.trainer`. O mesmo retrato aparece no cartão e na própria linha da Arena. Sem alterar atributos ou ranking.

Validação: `node scripts/check-trainer-portraits-browser.cjs` (seleção, busca, Arena, recarga e preservação do outfit).
Validação completa: node scripts/check-trainer-portraits-complete-browser.cjs percorre as 12 páginas e verifica os 143 retratos carregados, seleção na Arena e recarga sem perder a escolha.