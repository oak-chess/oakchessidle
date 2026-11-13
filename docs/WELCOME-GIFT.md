# Presente inicial

Somente jornadas criadas sem save anterior recebem automaticamente 30 dias corridos de VIP, 300 Revives, 300 Ultra Balls e 300 Poções. Os itens são adicionais ao estoque inicial (3 Revives e 10 Poções), resultando em 303 e 310 respectivamente. O VIP começa na criação da jornada, permite as mesmas funções de um plano comprado e expira mesmo com o jogo fechado.

A marca `welcomeGift.version` fica no save. Recarregar, importar ou continuar um progresso existente não concede o presente novamente. A entrega consta no histórico VIP. Testes: `node scripts/check-vip.cjs` e `node scripts/check-welcome-browser.cjs`.
