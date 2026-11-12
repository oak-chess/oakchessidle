# Integração da jornada online

O projeto Supabase de teste já tem as tabelas de perfil, jornada e inventário.
Cadastro, login e criação da jornada foram exercitados com duas contas.
`verify-isolation.sql` verifica o isolamento e as permissões de escrita.

## Próxima entrega — caçada autorizada pelo servidor

1. Extrair as regras de uma caçada inicial de `../hunts.js` e as regras de
   captura de `../capture.js`, incluindo consumo de bolas e expiração. Usar os
   dados de espécies e de encontros do jogo como fonte das regras.
2. Criar no servidor o encontro com ID, dono e estado. O cliente pede a
   ação de explorar e recebe a formação e o encontro para exibir. O servidor
   calcula o resultado a partir da equipe e dos dados que ele próprio carregou.
3. Registrar o resultado e creditar XP, Coins e drops na mesma transação.
   Uma repetição da requisição devolve o resultado registrado. O cliente
   nunca fornece o valor das recompensas ou o resultado do combate.
4. Validar no servidor a tentativa de captura e registrar o consumo da bola
   e a inclusão do Pokémon na mesma transação. O cliente informa somente o
   alvo e a bola escolhida. Sorteio, nível e demais atributos vêm do servidor.
5. Portar o fluxo de evolução de `../party.js`. Validar dono, espécie, nível,
   requisitos e bloqueio de anúncio. Debitar o item exigido e atualizar o
   mesmo Pokémon, preservando seu ID e os dados que a evolução mantém.

O fluxo online começa com o estado criado por `initialize_journey`.
Caçada offline, compras e vendas de NPC, Torre, Arena, pesca, Vila e demais
fontes de recursos precisam de operações próprias no servidor antes de
participarem da mesma economia. Os saldos e Pokémon gerados no cliente
legado ficam fora dessa economia.

## Verificação antes do mercado

- Repetir e enviar em paralelo a conclusão de um encontro e a tentativa de
  captura. Verificar que cada operação produz efeitos uma vez.
- Conferir que outra conta não consegue agir sobre o encontro ou Pokémon.
- Conferir que uma evolução sem requisito ou sobre um Pokémon anunciado
  é recusada e preserva o inventário.
- Recarregar a página durante um encontro e conferir que o servidor
  recupera o estado da mesma jornada.

O mercado e o chat ainda não estão integrados ao protótipo online.
