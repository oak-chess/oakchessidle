# Combate tático do Idle

Implementação local em 1 de novembro de 2026. A campanha e a torre fora do Idle continuam usando a escolha e o dano anteriores.

## Dados e regras

- Relações dos 18 tipos: [PokeAPI, type_efficacy.csv](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/type_efficacy.csv). Cópia usada na validação em `source/type_efficacy.csv`; 324 entradas verificadas automaticamente. O arquivo `type-chart.js` contém essas relações, não os multiplicadores adaptados.
- Intensidades do Idle: vantagem 1,5; resistência 0,75; imunidade zero. Dois tipos distintos se multiplicam. Sem STAB adicional.
- `tactics.js` centraliza eficácia, mitigação, previsão, pontuação, elegibilidade e recarga. A execução e a previsão usam a mesma mitigação, preservando reduções e o teto de dano de boss.
- Ataques básicos são neutros. Guarda Mística ainda os bloqueia. Danos indiretos e mecanismos especiais de arena mantêm suas próprias regras, explicitamente identificadas. Danos de movimentação e passivas ofensivas identificam seu tipo.
- Zero de dano por imunidade não vira 1, não consome escudo e não ativa efeitos de acerto. Ataques básicos ainda podem gerar a energia do atacante; não geram mana de dano recebido no alvo imune.

## Decisões

Mesma função para aliados e inimigos. Considera somente unidades vivas, alcance, energia, recarga, condições e efeitos presentes. Sem sorteios antecipados. Oportunidades de nocaute são naturalmente valorizadas pelo dano útil; excesso de dano não recebe valor ilimitado.

O estimador usa os formatos do executor: projétil, área centrada no alvo/atacante, linha, corrente, campo, chuva, rajada e suporte. Efeitos aleatórios usam contribuição esperada. Movimentação e efeitos acessórios de passivas não são previstos como dano garantido.

Cura considera PS faltantes e bônus/bloqueio de cura; escudo considera ameaça próxima e proteção já existente; buffs e condições não são renovados sem benefício. Transformação e Esboço mantêm seus executores próprios. Não há obrigação de usar os quatro golpes.

Diferença de até 5% permite desempate pelo golpe preferido já salvo, depois pelo menos recente. A antiga opção foi renomeada para explicar esse papel: ela não força um ataque ruim nem ignora recarga. Trocar de alvo exige ganho de 15% e intervalo de 1 segundo; decisões são reavaliadas a cada 0,2 s quando a unidade pode agir.

## Recarga e energia

Mínimos: simples 6 s, área 10 s, controle 12 s, suporte 16 s. Recarga efetiva = máximo entre o mínimo e 1,5 vez o tempo nominal de recuperar uma carga; teto de 45 s. O tempo nominal considera velocidade de ataque, energia por básico e regeneração, sem contar dano futuro recebido. O valor é fixado no lançamento.

Essa adaptação evita que uma recarga curta fique pronta antes de toda recuperação de energia. A energia por lançamento, a capacidade de duas cargas, a espera da animação e os projéteis permanecem. Não se inventa energia extra para a IA.

Continuidade versão 2 preserva energia, recargas restantes e idade do último uso por identidade do golpe. Lê saves versão 1. Menus não fazem o relógio de combate avançar; recargas são retomadas no próximo encontro. Cópias e formas não apagam mapas de recarga existentes.

## Limite e offline

Com os dois lados vivos ao fim do limite existente de 80 s, o resultado é sem vencedor. Pausa o automático e a fila da torre; não concede recompensa de conclusão, insígnia ou resolução vitoriosa de boss. Ganhos de derrotados anteriores não são apagados. Recursos de entrada já gastos não são devolvidos.

Offline continua sendo estimativa baseada no último rendimento seguro, conforme o sistema anterior; não simula a IA golpe a golpe. O processamento real em outra aba usa o mesmo motor de combate.

## Verificação

- `scripts/check-idle-tactics.cjs`: 324 relações, dois tipos, imunidades, teto de boss, dano indireto, área por vítima, energia, controle, cura, escudo, buffs, quatro alternativas, Castform e simetria em 100 configurações.
- `scripts/check-idle-tactics-browser.cjs`: motor real, dano previsto/efetivo, imunidade sem efeitos, energia, recargas, continuidade, Guarda Mística, efeitos reais, ficha e encerramento sem recompensa.
- `scripts/check-idle-combat-continuity.cjs`: identidade e limites de energia, saves e formas alteradas.
- `scripts/check-idle-combat-continuity-browser.cjs`: cinco encontros, escolha real, recargas persistentes, recarregamento durante combate, desafio isolado e favoritos/cadeados preservados.
- `scripts/check-idle-mega-moves.cjs`: 31 Megas, 62 perfis de boss/parceiro, golpes legais e progressão comum preservada.
- `scripts/check-idle-approved-native.cjs`: os 24 efeitos aprovados continuam nos executores nativos; amostras são forçadas somente nesse teste visual, pois a IA não deve gastar cura inútil para uma demonstração.
- `scripts/check-idle-tactics-balance.cjs`: 100 sementes por composição e modo, 600 confrontos controlados. Efeitos gráficos e viagem de projétil são simplificados para viabilizar a amostra; não é uma medição completa de recompensa/hora ou consumo de poções em produção. Resultado em `output/idle-tactics-balance.json`.

Comparação observada: trio inicial contra Pidgey/Caterpie/Rattata, 66→27 vitórias; formas finais mistas, 98→92; Água contra Planta, 100→57, em 100 sementes cada. Duração média permaneceu próxima de 20–23 s, sem impasses nessa amostra. A revisão mostrou maior uso de ataques fortes/vantajosos pelos inimigos, especialmente Dois Gumes e Rajada, em vez de uma alternância obrigatória com golpes fracos. Não houve bônus exclusivo de inimigo nem mudança de atributos para esconder esse efeito. Esses resultados tornam a composição da equipe mais importante e não demonstram equilíbrio de todas as rotas e bosses.

Dois testes antigos de VM (`check-idle-hoenn.cjs` e `check-idle-move-slots.cjs`) possuem fixtures anteriores às expansões atuais: faltam temporizadores e os perfis de Unova. Não foram usados como evidência de aprovação; a regressão de Megas e a verificação no navegador carregam os dados atuais.

## Limites assumidos

Previsão de dano não é uma busca de todos os futuros possíveis: movimentação posterior, cura futura, mudanças de alvo após mortes e acertos aleatórios podem alterar o resultado. A imunidade a condições continua com as regras existentes, separada da eficácia de dano. A ficha resumida não tenta calcular todas as futuras ativações de habilidades especiais.

Para acompanhar a decisão atual em desenvolvimento, inspecionar `unit.tacticalDecision` (golpe, alvo, valor, tempo). Não existe painel extra obrigatório para o jogador.
