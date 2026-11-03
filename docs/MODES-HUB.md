# Menu Modos

## Escopo implementado

Um único botão Modos foi acrescentado à barra existente, entre Jornada e Centro. A arte original da barra foi adaptada para incluir esse espaço, sem outra barra. O painel segue o modelo aprovado, com quatro cards ilustrados e controles HTML reais.

- Equipe Rocket: abre o painel existente, mostra o relógio do agendamento e preserva recompensas/requisitos. O atalho flutuante foi retirado.
- Safari: abre a expedição existente; o card muda para Continuar quando há uma sessão. O atalho de Caçadas foi retirado.
- Prey: abre o sistema existente e mostra o número de contratos e slots. Foram retirados o botão em Caçadas e o aplicativo do Pokéfone. O indicador ativo permanece apenas como informação, sem ação.
- Torre de Batalha: bloqueada e identificada como em desenvolvimento. Não inicia a Torre de Treinamento já existente.

Os links antigos de guia ou aplicativo são encaminhados ao hub. Tutorial e Wiki foram ajustados. Nenhuma regra de captura, bônus, prêmio, custo ou desbloqueio foi alterada.

## Funcionamento e desempenho

O hub consulta os sistemas existentes e não tem estado próprio no save. A arte é carregada apenas na primeira abertura. O relógio usa a atualização já existente dos eventos, sem novo intervalo. Fechar o Safari continua suspendendo sua automação conforme o comportamento anterior, sem apagar a expedição.

O módulo independente `modes/idle/modes.js` é carregado nas duas entradas HTML, com recuperação para HTML antigo em cache. O CSS é isolado em `modes/idle/modes.css`. Falhas no carregamento da arte de navegação mantêm os controles HTML originais.

## Arte

Ferramenta integrada de imagens, edição da referência aprovada: preservar painel, personagens, nomes e molduras; retirar textos dinâmicos e legendas dos botões para sobreposição funcional. Ativos finais:

- `modes/idle/assets/modes/panel-v1.png`
- `modes/idle/assets/navigation/device-modes-v1.png`
- `modes/idle/assets/menu-icons/modes.svg` (alternativa vetorial para a navegação sem arte)

## Validação

`node scripts/check-prey-browser.cjs` verifica um único menu de navegação, quatro cards, Torre bloqueada, remoção dos acessos antigos, navegação Rocket/Safari/Prey, contagem regressiva, sessão do Safari preservada, funcionamento do Prey, salvamento após F5 e limites do painel em duas resoluções. Capturas locais ficam em `output/modes-panel.png`, `output/modes-navigation.png` e `output/modes-panel-small.png`.
