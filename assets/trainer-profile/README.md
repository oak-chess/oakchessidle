# Perfil do treinador

Executivos Rocket na arena: Archer, Ariana, Petrel e Proton possuem folhas originais HGSS com 16 poses de 32×32. Fonte e conversão estão em `prototypes/trainer-profile/sources/hgss-rocket/README.md` e `scripts/import-rocket-trainers.cjs`. O renderizador de oponentes usa essas folhas diretamente, sem substituir os executivos por recrutas. Oficiais e escoltas da Operação Rocket variam entre os quatro; Giovanni continua como chefe final de Celadon.

Integrado ao jogo por scripts/build-trainer-profile.cjs. Catálogos e interface derivam do protótipo aprovado; data.js e runtime.js conectam o progresso e as entradas do jogo.

- Perfil: oakchess_trainer_profile_v1. Cenário: oakchess_trainer_arena_v1.
- Não importa o progresso fictício ou o perfil do protótipo.
- Desbloqueios usam ACH e PDEX; a Torre registra andares oficiais em ACH.towerProgress.
- Dez conquistas de Torre: andares 5, 10, 20, 30, 40, 50 e 60; doze chefes; seis relíquias; conclusão sem derrotas.
- Histórico oficial da Torre e tentativa salva são reconhecidos; prévias são excluídas.
- Contadores cumulativos antigos que já haviam atingido o limite continuam a partir do valor salvo.
- Mudanças cosméticas usam o treinador e parceiro selecionados no recolhimento da arena.

Após editar as fontes: node scripts/build-trainer-profile.cjs e node scripts/build-startup-manifest.cjs.

Não foram executados testes nesta integração.
