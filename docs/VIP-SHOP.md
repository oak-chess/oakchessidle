# Loja VIP local

Acesso: quinto botão da lateral direita, usando a mesma moldura expansível dos demais serviços. Interface baseada na prévia aprovada; controles, carteira, preços e durações são nativos.

## Economia e catálogo
1 crédito VIP = 50.000 Coins, conversão inteira com confirmação, sem retorno para Coins e sem pagamentos reais. Nenhum crédito inicial é concedido. Saldo, histórico (100 entradas), compras e efeitos visuais ficam em state.vip no mesmo save e backup da jornada. Valores de Coins e créditos devem ser inteiros seguros e positivos nas transações.

Seis tipos, oito durações: 1h/2h/3h/6h/12h/24h/7d/30d.
- XP do treinador e XP dos Pokémon vivos em campo: +50%, preços 3/6/8/12/20/29/175/645 créditos.
- Loot comum: +40% relativo à chance; Coins de nocautes +20%; captura: chance ×2 até 100%; Shiny Secret Lure: sorteio aleatório de novos encontros ×2. Preços 6/12/15/24/40/58/350/1290 créditos.
- Pacote Jornada: 1h de cada XP e loot por 10 créditos.
- Utilitários: 100 Poké Bolas, Poções ou Revives por 2 créditos.
- Cosméticos: Aura Prisma (40), moldura do treinador (30), detalhes Rocket VIP do Pokéfone (35).
- Outfits: visuais de recruta masculino/feminino com acabamento VIP (45 cada). Usa sprites locais existentes, sem trocar o catálogo de personalização normal.

## Tempo e aplicação
Comprar adiciona duração ao banco. Ativar transfere o tempo guardado para o saldo ativo do mesmo tipo. Durações somam; porcentagens não. Cada tipo pode ser pausado. Limite de cinco anos por tipo. Relógio usa tempo decorrido enquanto a caçada comum está rodando, inclusive aba oculta; desafios e jogo fechado não consomem. Ao recarregar, o relógio de sessão começa novamente sem cobrar o período fechado.

XP e Coins são aplicados no nocaute da caçada normal. Boosts avulsos não alteram XP de missões, ovos, eventos ou offline. A assinatura aplica seu bônus offline proporcional à validade. O XP da casa continua calculado pelo ganho de caçada que seu sistema já recebe. O histórico seguro usado para estimativa offline exclui o XP VIP para não perpetuar o bônus.

Loot multiplica apenas a chance da tabela comum; não muda quantidade, preço, pedras, fragmentos ou recompensas de bosses. Prey e VIP multiplicam suas chances separadamente, limitadas a 100%.

Captura mantém filtros, estoque e bola escolhida. Multiplicador aplicado uma vez, após a fórmula e penalidade shiny; offline usa a taxa sem VIP. Shiny Lure muda apenas a geração de genes dos novos encontros normais; não altera ovos, garantia de 4.000, IVs ou potência. Encontros existentes preservam seus genes.

## Arte e desempenho
frame.webp, boost-illustrations.webp e menu-button.webp são derivados dos conceitos gerados nesta conversa, com controles nativos sobrepostos. WebP preserva dimensões e transparência; total aproximado 817 KB (originais somavam 6,3 MB). O cronômetro reutiliza o ciclo existente da jornada; o atualizador visual retorna imediatamente quando a loja está fechada. Não há animação contínua de partículas no novo painel.

## Validação
scripts/check-vip.cjs: transações, estoque, durações, porcentagens, pausa, expiração, reload e suprimentos.
scripts/check-vip-browser.cjs: menu real, categorias e recursos, 48 variantes, confirmação de conversão, ativação, XP/Coins reais por nocaute, chance de captura, save e imagens.

## Pacotes de compra única
Iniciante: 10 créditos (1h de XP treinador, XP Pokémon e loot). Intermediário: 30 créditos (3h de cada XP e loot, 1h de Coins). Avançado: 96 créditos (6h dos seis boosts). Cada pacote só pode ser adquirido uma vez por jornada; o registro persiste no save. O tempo fica guardado para ativação manual.

## Assinatura VIP e histórico
Planos de 30/60/90 dias custam 10/17/25 créditos. Começam na compra, acumulam dias corridos e expiram mesmo offline. +50% XP treinador/Pokémon, sem somar com boosts de XP: aplica-se o maior fator. Auto-captura exige assinatura e respeita configurações, estoque e foco. Sem outfit exclusivo. A aba Histórico reúne as últimas 100 movimentações com data e saldo após as novas compras. Indicadores compactos abaixo do título da caçada mostram só VIP vigente e boosts ativados e não pausados.

## Auto Catch VIP e captura manual
Auto Catch e capturas offline exigem assinatura VIP válida. Preferências salvas não autorizam consumo sem VIP. Não VIP e VIP com automação desligada recebem fila de derrotados por 120s, até 30 entradas, priorizando shiny na remoção por lotação. Cada clique consome uma bola escolhida; falhas permitem nova tentativa, sucesso remove a entrada. A fila é da sessão, não sobrevive a F5 e não representa capturas offline. O foco de espécie limita a automação; o clique manual é uma escolha explícita. Farm offline gratuito continua em 8h; VIP considera até 12h e +50% XP dentro da validade, sem ampliar atividades de reserva/ovos. Capturas offline usam só as horas válidas do VIP e o estoque de bolas.
