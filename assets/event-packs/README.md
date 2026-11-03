# Pacote Misterioso de Kanto

## Comportamento

A partir da preparação 1–2, um pacote gratuito reúne os encontros opcionais de resgate, fósseis, tesouro, Poké Mart e descanso. Sorteia um evento por pacote; a escolha desse evento continua com o jogador. Os antigos disparos independentes de eventos regionais e de rotas são substituídos pelo pacote no checkpoint.

Só aparece em preparações normais de Kanto, sem bênção ou evento de roteiro marcado. Não aparece em bosses, carrosséis, eventos extras, revanches, demonstração ou prévia. Exige cinco índices de rodada desde o último pacote; ignorar um pacote também consome esse intervalo. História, desafios e bênçãos mantêm seu fluxo.

Resgate disponível uma vez por campanha; fósseis entram no sorteio após Brock e tesouro após Misty. Loja e descanso podem voltar em pacotes posteriores.

`G.mysteryEvents` é incluído no save: resultado, opções disponíveis, rodada e etapa (`sealed`, `revealed`, `event`, `done`). Resultado é escolhido e salvo antes da abertura. Ao recarregar, retoma o pacote/evento; a roleta não sorteia novamente. Encontros antigos que já estavam abertos ainda podem ser concluídos.

A abertura usa cartas passando e um botão para continuar ao encontro revelado. Respeita a preferência do sistema por movimento reduzido. Sem custo de ouro.

## Arte

Arquivo: `assets/event-packs/kanto-mystery.png`. Ferramenta integrada de geração de imagens, sem CLI. Referência inspecionada: pacote existente de Electabuzz (`PACKIMG.usina`), extraído temporariamente para `tmp/mystery-pack/reference.webp`. Não substitui os pacotes de bênçãos.

A primeira geração com referência foi bloqueada. Prompt final utilizado: “One front-facing tall collectible foil booster packet, complete sealed package with crimped top and bottom, crimson red and navy blue metallic wrapping with elegant golden trim. Original colorful Pokémon illustration of cheerful Pikachu and Eevee exploring a lush forest trail, with a glowing gold question-mark emblem above them. Premium illustrated trading-card booster aesthetic. No printed words, no letters, no logos, no numbers. Leave dark navy label areas at top and bottom for game UI text. Full complete pack visible centered, straight-on view, transparent background, no floor, no outside scenery, no shadow outside the pack.”

O nome legível é sobreposto pelo jogo. O recorte visual da embalagem é feito na apresentação por CSS.

## Versão aprovada

`kanto-mystery-lettered-v1.png`: versão aprovada com “PACOTE DE KANTO” na faixa superior e “EVENTO MISTERIOSO” na inferior, incorporados ao PNG por edição local autorizada. O jogo utiliza essa imagem sem textos sobrepostos.
