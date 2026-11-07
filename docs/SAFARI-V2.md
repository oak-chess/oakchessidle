# Safari de expedição — implementação

1. Entrada por ticket: 60 minutos corridos; de 1 a 24 por entrada; +30 minutos por grupo de seis. Consumo só após validação. Migração preserva capturas e relatório antigo; sessão antiga aberta recebe um ticket de transição.
2. Sorteio: ao abrir, uma das três arenas é registrada. Não muda ao fechar, reabrir ou atualizar. Espécies são sorteadas depois, numa sequência determinística por entrada; catálogo real do Idle, sem lendários, míticos, Megas ou IDs duplicados.
3. Combate: selvagens de nível 1 com 1 PS; captura usa estoque e chances das bolas existentes. Painel manual e Auto Catch VIP. Nenhum XP, Coins, loot, ovos, progresso de onda ou Prey.
4. Capturado: dobro do nível mínimo da espécie, baseado nos dados de evolução disponíveis, teto 200. Esse valor é informado na Pokédex.
5. Continuidade: encontro, genes, vida, mana, posições, condições e recargas salvos; relógio de parede não pausa. Sem batalhas ou capturas simuladas offline. Saída, derrota e expiração encerram a entrada sem reembolso.
6. Tickets no Pokéfone: drop por vitória real de boss, excluindo treinos. 0,25% até nível 649; 0,50% a partir de 650; 0,75% a partir de 3100; 1% a partir de 9750.
7. Arenas: Pradaria da Reserva, Lago das Passarelas e Selva Antiga, com cenários naturais e plataformas próprias. A arena permanece durante toda a entrada.

Validação: `node scripts/check-safari-v2.cjs` e `node scripts/check-safari-v2-browser.cjs`. Conferir também o teste de projeto independente antes de publicar.

Acesso temporário para testes: IDLE_SAFARI_DATA.freeEntry=true libera entradas de 60 minutos sem consumir tickets e sem exigir a insígnia. Equipe saudável e bolas continuam necessárias. Definir false restaura as regras de tickets e acesso.
