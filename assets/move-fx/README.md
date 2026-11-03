# Efeitos de golpes do Emerald

Fonte: [pret/pokeemerald](https://github.com/pret/pokeemerald), obtida em 18/10/2026.

## Recursos importados

Atualização de cobertura: 359 modelos e 191 folhas/paletas, incluindo as quatro folhas compostas que a fonte monta a partir de fragmentos. Consulte [COVERAGE.md](COVERAGE.md) para a contagem atual e os limites reais. `scripts/prepare-emerald-composites.ps1` deve executar antes do importador e da preparação das folhas.

- `emerald-catalog.js`: os 354 registros MOVE_POUND a MOVE_PSYCHO_BOOST, com eventos de sprites, atrasos, tarefas e recursos referenciados. Macros de sprites são expandidas e sub-rotinas são percorridas pelo importador.
- 359 modelos de sprites, com tamanhos de OAM e sequências ANIMCMD_FRAME, duração de quadros, repetição e inversões.
- `sheets/`: 191 folhas com transparência e paletas específicas aplicadas. O índice zero da paleta original vira transparente.
- 305 golpes contêm eventos de sprites extraídos; os demais dependem de tarefas, transformações ou não têm animação independente. Uma contagem de golpes não equivale a uma contagem de imagens.
- `aliases.js` e [MAPPING.md](MAPPING.md): associação das habilidades atuais do OakChess aos movimentos da fonte. Golpes originais ou de gerações posteriores usam equivalentes visuais.

## Integração

`../emerald-moves.js` escolhe os recursos pelo golpe, em vez de apenas pelo tipo. Projéteis usam as coordenadas e o momento de chegada da simulação existente. Impactos são emitidos no callback de dano. Feixes ocupam sua trajetória imediatamente no momento do acerto. Efeitos de suporte usam sequências curtas de partículas. Pausa e velocidade seguem o relógio de FX.update; FX.clear remove também as animações novas.

As imagens são locais; se ainda não estiverem disponíveis, o efeito anterior continua funcionando. Limites de partículas respeitam a qualidade gráfica e a opção de efeitos reduzidos. `EMERALD_MOVES.play` disponibiliza os registros pelo identificador em inglês para futuras habilidades.

## Limites da adaptação

Não é um emulador de scripts ou callbacks C do GBA. Os sprites e suas sequências de quadros são da fonte, mas trajetórias, duração total e quantidade são adaptadas à arena e ao ritmo do OakChess. Ramificações condicionais do GBA, fundos de tela, efeitos de hardware, sons individuais e todas as tarefas visuais originais não são reproduzidos integralmente. As tarefas sem sprites usam efeitos simplificados ou o efeito anterior. O catálogo não adiciona 354 habilidades ao elenco.

## Regenerar os recursos

Descompactar o repositório da fonte em `tmp/emerald-source/pokeemerald-master`, executar `scripts/prepare-emerald-composites.ps1`, `node scripts/import-emerald-moves.cjs` e depois `scripts/prepare-emerald-sheets.ps1`. São ferramentas de importação, não testes do jogo.

## Nove efeitos do elenco atual

Fonte adicional: rh-hideout/pokeemerald-expansion; revisão e hashes em nine-sources.json. Sete folhas com paletas originais foram importadas.

- Surf: onda com crista e espuma, deslocamento e respingo no impacto; porta visual do comando create_surf_wave, sem emular o fundo GBA.
- Harden: brilho metálico no próprio sprite e reflexos locais.
- Aura Sphere: carga, esfera original em movimento e impacto.
- Dark Pulse e Dragon Pulse: partículas originais em pulsos direcionados ao alvo.
- Night Slash: cortes sucessivos nos dois sentidos com quadros e inversões da fonte.
- Air Slash: lâminas e cortes no alvo; usa o caminho de batalha normal, sem fundo de concurso.
- Flash Cannon: carga prateada, disparo e faíscas no impacto.
- Iron Head: brilho no usuário, movimento de contato existente e impacto no alvo; não altera o tamanho do sprite.

Execução específica em nine-moves.js, integrada ao relógio e à limpeza de cada renderizador. Danos e tempos de combate continuam definidos pelo jogo. As nove animações são adaptadas, não emulação integral.

Regeneração: importar as fontes para tmp/dex-source, executar scripts/import-nine-moves.cjs e scripts/prepare-nine-sheets.ps1; depois regenerar os catálogos e o manifesto.
