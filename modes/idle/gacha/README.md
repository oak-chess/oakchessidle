# Gachapon regional integrado ao Idle

## Acesso e catálogo

Estação Gachapon no Centro Pokémon, serviço Gachapon regional na Base, atalho na incubadora e artigo próprio na Wiki. Kanto inicia liberado; Johto é liberado pela insígnia 7 ou por já estar na região; Hoenn usa a insígnia 15 ou a área de Hoenn. Os mesmos limites acompanham o acesso à Jornada.

O catálogo usa o elenco real e os metadados de famílias: 73 famílias de Kanto, 45 de Johto e 63 de Hoenn na versão atual. Cada família aparece uma vez. Lendários e míticos são excluídos. A região é a geração de origem da família; a forma escolhida é a raiz disponível, mesmo que seja um bebê de geração posterior. Exemplo: Pichu em Kanto. Quando um bebê ainda não existe no elenco, usa a forma inicial disponível. Todas as famílias de uma máquina são equiprováveis, independentemente da potência.

## Compra e garantias

1x: 5.000 ouro; 5x: 25.000; 10x: 50.000. A reserva do gachapon é separada e sem limite de ovos. O lote inteiro precisa ter saldo antes da cobrança. A incubadora normal tem duas vagas e a do gachapon cinco vagas independentes.

Comum/P1: 50%; Incomum/P2: 30%; Raro/P3: 15%; Épico/P4: 4%; Lendário/P5: 1%. Após dez resultados consecutivos abaixo de P3, o próximo garante no mínimo P3; após cem sem P5, o próximo garante P5. P5 tem prioridade e reinicia os dois contadores. Cada ovo do lote atualiza as garantias, compartilhadas entre as regiões.

O preço, os resultados, os genes, os identificadores e os contadores são salvos juntos, antes da animação. Falha no salvamento reverte ouro, ovos e contadores. Fechar ou recarregar não perde ovos nem permite sortear novamente. A última compra pode ser consultada ao reabrir.

## Incubação

Ovos de gachapon têm `source: gacha`, `gachaRegion`, `gachaTier`, espécie e genes fixos. Começam na reserva, inativos, e precisam de 12 passos. A interface mostra região, qualidade e potência; espécie/IVs são revelados ao chocar. Ovos anteriores e do berçário mantêm suas regras.

Todos nascem no nível 1, no PC, com potência e IVs preservados e proteção automática aplicada. PC cheio bloqueia a eclosão sem remover o ovo. Não há conversão automática em doces. A chance aleatória de shiny dos ovos é mantida, sem o contador de 4.000 encontros. No gachapon a potência é sempre a qualidade do ovo, inclusive em um eventual shiny.

## Apresentação e áudio

Máquina aprovada com cápsulas físicas, letreiro regional e LEDs simétricos. Lotes entregam cada cápsula separadamente e mantêm todos os resultados na bandeja. Pular revela a compra já salva. Não existem saldo de demonstração, qualidade forçada, reposição gratuita ou eclosão instantânea na interface integrada.

Efeitos da máquina sintetizados localmente. A música do painel é Goldenrod Game Corner de Pokémon HeartGold/SoulSilver, em arquivo local (créditos em assets/music/idle/SOURCES.md). Respeitam os volumes/mute do jogo; a música ambiente é pausada enquanto a máquina está aberta, e retomada ao fechar. Fechar interrompe efeitos/temporizadores. Movimento reduzido do sistema permite pular as animações; a opção de efeitos reduzidos do jogo reduz brilhos sem remover a sequência de entrega.

## Arquivos e verificação

`../gacha.js`: catálogo, transação e persistência. `view.js`, `template.js`, `view.css`, `integration.css`: painel isolado. `mixer.js` e `sound.js`: efeitos. `eggs.js`: apresentação dos ovos na incubadora. O estado fica em `world.gacha`; os ovos ficam em `world.eggs`.

Testes: `scripts/check-idle-gacha.cjs`, `check-idle-gacha-rules.cjs`, `check-idle-gacha-view.cjs`, além dos testes existentes de life/berçário e Wiki. O protótipo em `prototypes/egg-gacha` permanece separado.


Venda de ovos do gachapon inativos, com confirmação: P1 200, P2 400, P3 800, P4 1.600 e P5 3.000 ouro. Venda conjunta de P1/P2 disponível na reserva. Ovos em incubação são preservados.
