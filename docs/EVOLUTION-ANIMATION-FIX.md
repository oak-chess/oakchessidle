# Evolução: forma anterior e nova

## Causa reproduzida

`CFG.reduceFx` vem ativado por padrão e corresponde a **Reduzir flashes**, com a descrição “Suaviza clarões e brilhos”. `celebrateEvolution` tratava esse valor como movimento reduzido: marcava o efeito com `data-reduced=true`, desativava as animações e revelava o resultado após apenas 150 ms. Os IDs das duas imagens estavam corretos, mas a opção padrão praticamente pulava a transformação.

O teste real reproduziu o problema antes da correção: com `reduceFx=true` e nenhuma preferência de movimento reduzido no navegador, o efeito era marcado indevidamente como reduzido.

## Correção local

- **Reduzir flashes** agora seleciona uma alternância suave de 3,2 segundos entre as duas silhuetas, sem partículas e com brilho menor. Não pula a transformação.
- Sem redução de flashes, a sequência alternada existente foi preservada.
- A forma anterior fica visível por um breve intervalo após as imagens carregarem, antes de iniciar a transformação.
- A preferência real `prefers-reduced-motion` mantém uma sequência estática: forma anterior por tempo legível, depois a nova, sem alternância rápida.
- Evolução, atributos, XP, genes, shininess e persistência não foram modificados. A origem e o destino continuam vindo do evento da evolução.

## Verificação

`node scripts/check-idle-evolution-animation.cjs` passou usando botões reais do painel:

1. Bulbasaur → Ivysaur, equipe, redução de flashes ligada (padrão).
2. Gastly shiny → Haunter shiny, PC, efeitos normais.
3. Bulbasaur → Ivysaur com preferência de movimento reduzido.

Verificados: URLs distintas e imagens carregadas, silhuetas antiga e nova na sequência, ausência do salto de 150 ms, revelação final, painel de evolução fechado, nível e variante shiny preservados e nenhum erro JavaScript.

Validada para publicação junto do novo padrão de prévia dos golpes.

## Prévia dos golpes

O padrão `CFG0.movePreview` e o fallback do interruptor passam a `false`. Instalações novas, configurações antigas sem essa propriedade e restauração dos padrões ficam com a prévia desligada. Valores `true` ou `false` já salvos continuam respeitados. Verificados os quatro casos usando o bloco real de configuração do motor. O ajuste não altera golpes, dano ou efeitos da batalha.
