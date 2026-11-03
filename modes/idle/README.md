# Jornada Idle

Modo oficial de exploração, captura e progressão contínua do OakChess.

Abra o jogo principal e escolha **Jornada Idle** na biblioteca. A seta no canto superior esquerdo retorna à biblioteca salvando o progresso.

Os dados usam o prefixo `oakchess-idle:`. A primeira entrada oficial começa do zero, sem importar `idle-sandbox:`. Entradas seguintes preservam o progresso oficial. Uma marca de inicialização descarta somente dados oficiais de uma eventual importação anterior, sem alterar o protótipo. Campanha, Torre e Operação Rocket mantêm seus dados separados.

Implementação em `modes/idle/`; a pasta histórica de protótipos não é necessária para executar este modo.
