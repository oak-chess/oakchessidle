# Encontros lendários à escolha

- Até 3 tentativas compartilhadas entre lendários e míticos. Uma recarga a cada 20 minutos, inclusive fora do jogo; a reserva cheia não acumula tempo adicional.
- Todo encontro desbloqueado pode ser escolhido no painel. Insígnias, missões e condições especiais anteriores permanecem.
- Gasto persistido antes do combate. Derrota, F5 ou encerramento não devolvem uma entrada paga.
- Treino não gasta tentativa nem dá tokens, equipamento, vitórias, descobertas ou XP. Saúde e suprimentos continuam seguindo as regras dos desafios.
- Vitória paga: 1 Bronze Boss Token e chance independente de 1% de equipamento. Resultado creditado uma vez, por identificação da tentativa.
- Equipe Rocket continua em sua invasão separada, a cada 45 minutos, com prazo de 1 minuto para aceitar.
- O painel e a Wiki mostram os contadores, a próxima recarga e a diferença entre confronto pago e treino.

## Migração e falhas

O progresso permanece na chave de save existente. `world.legendaryAccess` guarda cargas, horário, serial e tentativa pendente. Na primeira migração recebe a reserva de 3 tentativas; não reinicia vitórias nem itens. Contadores antigos são mantidos como dados legados, mas só Rocket continua sendo agendado. Uma batalha interrompida não é concluída nem recompensada no retorno.

Entrada e resultado usam salvamento com restauração dos valores em caso de falha. As recompensas não são aplicadas novamente se o resultado já estiver registrado. Ao voltar de outra aba, a recarga é calculada pelo horário decorrido, sem depender de animações ou timers em segundo plano.

## Testes

- `scripts/check-idle-legendary-access.cjs`: recarga, teto, bloqueios, gasto, vitória/derrota, treino sem recompensa, salvamento, interrupção e Rocket independente.
- `scripts/check-idle-legendary-choice-browser.cjs`: fluxo real, painel, batalha, tokens, treino sem XP, tentativas esgotadas, recarga offline, F5 e Rocket.
- Testes de Sinnoh, Megas e evolução no Centro permanecem como regressão.
