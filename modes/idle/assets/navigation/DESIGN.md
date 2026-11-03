# Barra de navegação aprovada

`approved-concept.png`: imagem original aprovada pelo usuário. `device-neutral.png`: preparação da mesma arte, com transparência externa, seleção do Pokéfone removida e botão de ação vazio para receber estado funcional.

Geradas com a ferramenta integrada de imagens. Nenhum redesenho de ícones foi usado na interface. A imagem de produção mantém 2172 × 724 px; a área do dispositivo é enquadrada por CSS, sem processamento dos pixels. As áreas clicáveis permanecem os botões nativos do jogo.

Prompt final da preparação:

> Edit this approved game UI artwork for implementation. Preserve the EXACT device shape, proportions, metal details, red rim, cyan corner LEDs, the seven painted icons and all labels in the same order. Remove the forest background completely to genuine transparency outside the device and crop closely around the full horizontal device. Only change the selected Pokéfone key to the same neutral dark unselected key finish as its neighbors: remove its cyan border glow and little cyan triangle, keep the phone icon in full color, make its label white like Pokémon/Evolução. Keep every other icon and label unchanged. On the far-right red action button remove ONLY the pause symbol and the word PAUSAR, leaving the red glass button blank inside its exact original bezel; code will draw live action content there. Output a single clean game UI sprite on a transparent background, not a mockup scene. Do not redesign, add elements or change any remaining artwork.

O destaque acompanha o painel aberto. Explorar, Pausar e Voltar usam a ação real existente. O espaço do Pokéfone considera a altura da nova barra para não a cobrir. Se a arte falhar ao carregar, a navegação original continua visível e funcional.
