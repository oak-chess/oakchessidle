# Cartas completas dos companheiros

Geradas com a ferramenta integrada `image_gen`. Os prompts finais e o estado de cada pedido estão em `PROMPTS.json`.

- `bulbasaur-v1.png`: ilustração original, moldura temática e informações em português na própria imagem, 1024 × 1536. Integrada à seleção da torre.
- `squirtle-v1.png`: mesmo formato, usando Bulbasaur como referência de composição. Integrada à seleção da torre.
- Charmander, Pikachu e Eevee: bloqueados pelo serviço durante a nova tentativa autorizada pelo usuário. Nenhuma nova imagem foi produzida para eles; a seleção mantém as versões anteriores.

As imagens foram inspecionadas para conferir personagem, enquadramento e texto. A seleção mantém botões HTML com nomes e descrições acessíveis. Nenhum teste de combate ou verificação no navegador foi executado.

Atualização: `eevee-v1.png` foi gerada, inspecionada e integrada em nova tentativa autorizada. Prompt em `eevee-prompt.json`. Charmander e Pikachu continuam bloqueados pelo serviço; permanecem com a apresentação anterior.

Conclusão das cinco cartas: o usuário forneceu as artes geradas no Gemini para Charmander e Pikachu. Copiadas sem alterações para `charmander-v1.jpg` e `pikachu-v1.jpg` e integradas à seleção. Todas as cinco opções agora usam carta completa, com informações desenhadas na imagem, sem sobreposição de sprites. As imagens fornecidas foram inspecionadas no anexo da conversa; o enquadramento usa contain para preservar a carta inteira.
