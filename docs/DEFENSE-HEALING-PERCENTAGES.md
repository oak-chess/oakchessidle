# Defesa e cura em porcentagem

1. Exibir redução física/especial = 100 × defesa / (100 + defesa), limitando a defesa a zero no cálculo. Preservar atributos e combate; valores originais em tooltip. Em combate, considerar redução de defesa ativa. Aplicar à ficha e à prévia.
2. Poção 20%, Super 50%, Hyper 80%, Max/Full 100% dos PS máximos. Full mantém remoção de estados. Revives mantêm 50/100%. Preços e estoques preservados.
3. Cura automática e manual usam a mesma fração; consomem unidades até completar PS, respeitando estoque e limite máximo. Não reviver usando poções. Atualizar loja, automação, Wiki e textos.
4. Testar conversão, dano inalterado, cura em níveis diferentes, estoque insuficiente e vida cheia; publicar após verificações.

Verificado no navegador: cura e consumo nos níveis 1/240/5000, estoque parcial, PS cheios, desmaiados, defesa zero/negativa e valores 72→41,9%, 59→37,1%. Preços/estoques não foram migrados. Teste de defesa altera somente texto de interface, sem modificar os atributos ou a função de dano.
