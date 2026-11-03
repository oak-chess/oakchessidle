# Berçário: genética e rastreabilidade

## Regras implementadas

- Dois pais compatíveis, livres do banco ou PC, são consumidos após confirmação explícita. Favoritos, protegidos, equipados, em campo ou em atividade não são elegíveis.
- Custo: 50 ouro e 5 materiais. Criação: 30 minutos. Incubação: 24 passos. O bebê nasce no nível 1, na forma inicial da família.
- Normal + normal nunca resulta em shiny. Ao menos um pai shiny garante um bebê shiny.
- Para cada IV, o piso é a média dos pais arredondada para cima, acrescida de 1; o teto é a mesma média acrescida de 3. Ambos são limitados a 31. Para shiny, o piso também é no mínimo 26.
- A potência é a maior dos pais; shiny tem mínimo P4. Não há promoção aleatória de potência.
- Nature: 50% de cada pai. Talento: sorteio normal da espécie.
- A prévia exibe os seis intervalos, o total possível, o ganho sobre a média dos pais, potência e variante garantidas.

## Fluxo e persistência

1. Selecionar os pais e, opcionalmente, nomear a linhagem.
2. Conferir a prévia e a confirmação de consumo permanente.
3. Salvar pais consumidos, custos, genes fixados e registro histórico juntos; restaurar o estado se o salvamento falhar.
4. Recolher o Baby Egg e incubar. Os genes não são sorteados novamente.
5. No nascimento, anexar o certificado ao Pokémon e atualizar o histórico com seu identificador e atributos. O registro continua existindo mesmo se o Pokémon sair da coleção.

Criações e ovos antigos mantêm os genes e as condições salvas. As novas regras não alteram capturas, Safari ou Gachapon.

## Validação

- `check-breeding-genetics.cjs`: 160 combinações, limites dos seis IVs, shiny, Nature, potência, certificado e histórico.
- `check-baby-egg-consumption.cjs`: proteções, consumo, recarregamento, falha de salvamento e criações antigas.
- `check-nursery-refresh.cjs`: fluxo no navegador, vagas independentes e ausência de novos ovos nas caçadas.
