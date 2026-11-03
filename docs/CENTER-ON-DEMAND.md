# Cenário do Centro Pokémon sob demanda

## Evidência e escopo

`createIdleCenterScene` criava a imagem `modes/idle/assets/center/interior-pixel-v2.png` ao montar o serviço, mesmo que a partida começasse no campo. O teste local, em contexto novo do Chrome e com o jogador no campo, registrou **1 pedido antecipado**. O arquivo tem **2.078.019 bytes** de fonte.

Foi adiado somente o interior do Centro. NPCs, serviços, regras de cura, evolução, economia e persistência não foram reformulados. O arquivo não foi removido nem recomprimido.

## Novo comportamento

- A primeira abertura do Centro solicita a imagem. A retomada de um save que abre o Centro também passa pelo mesmo caminho.
- Enquanto o pedido está pendente, novas aberturas reutilizam a mesma imagem; não há polling nem novas filas.
- Imagem carregada é reutilizada nas visitas seguintes.
- Fechar durante o carregamento não reabre o Centro quando a resposta chega.
- Em erro, a referência é liberada para uma nova tentativa na próxima abertura. O erro de apresentação não altera recompensas nem bloqueia a partida.
- A pintura provisória já existente é mantida enquanto a imagem ainda não está pronta.

## Comparação local e testes

`node scripts/check-center-demand.cjs --measure` foi executado antes da alteração; depois, `node scripts/check-center-demand.cjs`:

| Cenário | Pedidos ao entrar no campo | Total após visitas |
|---|---:|---:|
| Antes | 1 | 1 |
| Depois, primeira visita e reabertura | 0 | 1 |
| Depois, falha 503 e nova abertura | 0 | 2 |

O teste atrasa o pedido em 500 ms e exercita o fechamento durante o carregamento. São contextos isolados, sem dados do jogador; os relatórios ficam em `output/center-demand-*.json` e não fazem parte da publicação.

Também passaram o teste integrado das duas entradas e os três cenários de evolução: equipe, PC shiny e preferência de movimento reduzido. As duas entradas usam `center-scene.js?v=on-demand-4`.

Isso adia aproximadamente 1,98 MiB de imagem na entrada pelo campo. Não é uma medida de tráfego comprimido nem uma promessa de aumento de FPS. Quem abre o Centro continua precisando carregar a imagem uma vez.
