# Torre de Batalha nativa do Idle

## Escopo e invariantes
- Acesso pelo card Torre de Batalha em Modos; progresso independente da Torre de Treinamento existente.
- Motor e equipe reais do Idle: espécie, estágio, nível, IVs, potência, shiny, golpes, posições e equipamentos preservados. Sem descanso ou cura entre andares. A subida é contínua até o último Pokémon cair; derrotados ficam fora dos andares seguintes. Após derrota a nova tentativa inicia no primeiro andar, preservando recorde e sem repetir recompensas já recebidas. Sem importação da campanha, cartas, loja TFT ou itens temporários.
- Não capturar adversários, não conceder loot/XP de caçada por nocaute, não consumir Poções/Revives automaticamente. A condição da equipe persiste; Centro disponível entre tentativas.
- Uma vitória confirma apenas o próximo andar e concede recompensa uma vez. Derrota/interrupção não avança nem remove a coleção.

## Progressão
Setores de cinco andares: portão (combate), arena viva (efeito de terreno), combate de especialidade, vanguarda (combate com efeito de terreno), guardião (seis adversários e efeito anunciado). Tipos dos setores alternam e os níveis crescem pela fórmula 8 + 8 × andar + 0,22 × andar², arredondada. Não escala com a equipe escolhida; retirar parceiros não reduz dificuldade.

O próximo andar, vitórias, derrotas, histórico curto e recompensas são salvos em world.battleTower. F5 durante combate cancela a tentativa sem prêmio e mantém o último andar concluído; não cria uma vitória offline. O jogador reinicia o mesmo andar pelo painel.

## Apresentação
Imagem aprovada como referência: moldura metálica, violeta/ciano, navegação de andares à esquerda, prévia e regra do andar à direita, equipe real na base, ação esmeralda e retorno escuro. Artes decorativas sem botões falsos; textos e controles acessíveis ao vivo. Prévia e combate usam o mesmo tema nativo.

## Verificação
Modelo: próximo andar, ausência de descanso, derrota, recompensa única, save antigo, catálogos válidos. Navegador: Modos → Torre, equipe real, iniciar, sem captura/consumíveis, efeito anunciado, resolução, recarregar, encaixes em duas resoluções. Verificar Safari e não alterar Torre de Treinamento.
