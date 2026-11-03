# Prey — implementação e validação

## Acesso e apresentação

O painel abre exclusivamente pelo card Prey no menu Modos da barra inferior. A moldura possui fundo transparente; textos, sprites, barras e botões são elementos da interface. O Professor Carvalho apresenta o recurso uma vez. O indicador de campo fica oculto no Centro Pokémon e na Vila.

## Regras

- Liberação após a primeira insígnia; segundo espaço com 8 e terceiro com 16 insígnias.
- Três espécies distintas entre as caçadas comuns disponíveis. Cada opção recebe seu bônus no sorteio, sem novo sorteio ao selecionar.
- Dano ou defesa: 10%, 15% ou 20%. Experiência: 10%, 15%, 20% ou 25%. Loot comum: 10%, 15% ou 20% relativos à chance original.
- Cada contrato dura 100 derrotas da espécie exata. Evoluções diferentes não contam. Uma derrota não pode consumir duas cargas.
- A ativação ou substituição entra em vigor no próximo encontro normal. Substituir exige confirmação. Não permite repetir a espécie em espaços diferentes.
- Uma renovação gratuita por dia, com calendário de São Paulo. As seguintes custam 100 Coins por nível do treinador, até 50.000 Coins. Renovar não remove contratos ativos.
- Ofertas, contratos, cargas, introdução e renovação diária ficam no save. Atualizar a página não reinicia esses dados.

## Limites e isolamento

Não altera eventos, ginásios, desafios, Megas, Safari, pesca, captura, shiny, pedras ou fragmentos raros. O bônus de loot afeta apenas a tabela de materiais comuns. O progresso offline não consome contratos nem mantém o bônus de XP no cálculo da taxa base.

O combate recebe uma marca por adversário no início do encontro. O modelo central controla contratos e deduplicação; a interface apenas consulta e envia ações. Não há temporizador exclusivo para atualizar o painel. Há carregamento de compatibilidade e tentativa manual em caso de falha para páginas HTML antigas conservadas em cache.

## Verificação

- `node scripts/check-prey.cjs`: liberação, ofertas únicas, ativação pendente, cargas, expiração, persistência, renovação, fundos insuficientes, confirmação e tabela de loot.
- `node scripts/check-prey-browser.cjs`: navegador isolado, navegação real, recarga, XP, dano, defesa, imunidade, exclusão de desafios, introdução e limites visuais em duas resoluções.
- `node scripts/check-standalone.cjs`: inicialização independente e recuperação de dependências em HTML antigo.

Arte da moldura: `modes/idle/assets/prey/frame-v1.png`. Ícone do aplicativo: `modes/idle/assets/phone/prey.svg`. Captura de conferência local: `output/prey-panel.png`.

## Acabamento da referência

A versão visual 3 usa `modes/idle/assets/prey/reference-backplate-v3.png`, preparada com a ferramenta integrada de imagens a partir da referência aprovada. Prompt: preservar a composição e o acabamento metálico, logotipo, título, louros, faixa, ícones ilustrados e botões; remover Pokémon e valores dinâmicos; fundo externo transparente. Os cartões dos Pokémon continuam nativos. Valores, seleção, progresso, confirmação, custo e áreas clicáveis continuam funcionais em HTML, sem mudanças nas regras.
