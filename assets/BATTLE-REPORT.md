# Relatório de batalha — fase 2

`battle-report.js` envolve o capturador existente antes que as unidades sejam removidas. Guarda até 80 relatórios compactos em `oakchess_battle_reports_v1`, sem vídeo, quadros ou cópias do cenário. O resumo aguarda eventos e conquistas, permanecendo visível por dez segundos efetivos.

Acesso pelo botão lateral de relatório existente, menu inicial e histórico. Novas composições finais têm o identificador do relatório correspondente. Registros antigos não inventam estatísticas ausentes; relatórios removidos pelo limite de 80 exibem uma mensagem de indisponibilidade.

## Métricas

- Dano: PS efetivamente atingidos, mais dano absorvido pelo escudo do alvo; sem excesso de dano após o nocaute.
- Cura realizada: PS realmente recuperados, atribuídos à fonte quando o efeito cura outro Pokémon. Regeneração e autocura contam para o próprio Pokémon.
- Cura recebida: recuperação de PS do destinatário.
- Dano recebido: PS atingidos e escudos absorvidos pelo destinatário.
- Escudos absorvidos: dano bloqueado no escudo de quem recebeu o golpe. Não atribui esse valor ao criador do escudo.

As métricas do relatório são contadores novos e não alteram dano, cura, escudo ou balanceamento. Os contadores anteriores continuam disponíveis no histórico legado. Nenhuma conclusão tática subjetiva é apresentada como fato: o resumo informa sobreviventes e participação no dano.

Scripts tiveram a sintaxe conferida. Revisão visual no navegador não foi executada nesta etapa devido ao bloqueio de acesso a URLs `file:` pela ferramenta. Alterações locais, sem deploy.
