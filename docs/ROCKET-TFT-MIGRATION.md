# Transferência da Operação Rocket para o Idle

## Objetivo e decisões

Trazer o módulo TFT completo já implementado — Celadon e Lavender — para o repositório oakchessidle. Preservar compra de Pokémon, fusões, equipamentos, economia e equipe próprias por tentativa. A finalidade é pontuação e recordes pessoais, preparados para ranking online futuro por capítulo. Não há premiação top 10, conexão de servidor ou transferência de Pokémon/Coins entre operação e Idle nesta etapa.

Silph sob ataque permanece bloqueado: o capítulo ainda não foi implementado no original. A invasão rápida de Jessie e James continua separada das operações TFT.

## Etapas

1. **Auditoria:** conferir arquivos Rocket, capítulos, cenários, trilhas, dependências, salvamento, fórmula de pontos e saídas. Comparar os arquivos já presentes no Idle com o original antes de copiar.
2. **Isolamento:** executar o host TFT em uma página local interna e em um contexto próprio. Carregar apenas ao entrar. Usar o motor compartilhado, com estado JavaScript separado e chaves de armazenamento exclusivas das operações.
3. **Interface:** o card Rocket de Modos abre uma seleção de Celadon, Lavender, Silph bloqueado e invasão rápida. Manter o visual aprovado, botão para voltar a Modos e estado Iniciar/Continuar/bloqueio.
4. **Entrada e retorno:** bloquear entrada durante combate/captura em andamento; salvar a jornada antes da operação e suspender a caçada. Ao sair, confirmar o salvamento Rocket antes de desmontar o host e restaurar a jornada. Erro de carga oferece retorno seguro.
5. **Conteúdo:** reutilizar eventos, contrabandista, seleção inicial, loja, fusões, cenários, diálogos, trilhas, alerta, resgates, extração, bosses e recordes. Lavender exige Silph Scope da conclusão de Celadon.
6. **Recordes:** manter fórmula original e deduplicação por tentativa. Registrar capítulo, resultado, etapas, resgates, vitórias, derrotas, tempo ativo, pontuação e versão da fórmula. Guardar histórico e melhor pontuação local por capítulo.
7. **Navegação:** todos os botões da operação ficam no mesmo projeto. Substituir Voltar à biblioteca e redirecionamentos antigos por retorno às operações Rocket. Bloquear abertura de nova aba/repositório no host. Validar o caminho GitHub Pages /oakchessidle/ e a entrada de compatibilidade.
8. **Verificação:** testar início, seleção de equipe, combate, loja/compra/fusão, eventos, derrota, retomada, save/F5, extração, conclusão, desbloqueio de Lavender, recordes sem duplicação e retorno sem alterações indevidas no Idle. Conferir recursos locais e ausência de navegação externa.

## Arquitetura

- `modes/rocket/index.html`: casca TFT local, construída a partir do host nativo e com o motor compartilhado. Não é uma ligação para o repositório original.
- `modes/rocket/storage.js`: isolamento das chaves e proteção da navegação.
- `modes/rocket/host.js`: inicialização do capítulo, comunicação de entrada/saída e tempo ativo.
- `modes/idle/rocket-operations.js`: apresentação e ciclo de vida do host dentro do Idle.
- `assets/rocket-operation*.js`, `rocket-lavender.js`, `rocket-dialogue.*`, cenários, equipe e sons: conteúdo local já presente, com adaptações condicionais para o host Idle.

Os recursos necessários devem ser servidos pelo próprio oakchessidle. O host será descartado na saída para encerrar loops, áudio e ouvintes. A jornada não será substituída por `newGame()` da operação: cada contexto possui seu próprio `G`, `B`, inventário e equipe.

## Limites de validação

Os testes automatizados verificam mecanismos e transições com dados isolados. Uma campanha inteira de 50 etapas em ritmo normal ainda exige avaliação de balanceamento jogando. Recordes locais não têm validação antifraude de servidor e não são rankings online.

## Implementação e verificação local

- Host e seleção dos capítulos implementados; loja TFT original, diálogos, eventos e trilhas locais preservados. O host é carregado somente ao entrar e removido ao voltar.
- Teste de navegador aprovado em /oakchessidle/: trio inicial, combate nativo, compra real no contrabandista, salvar/continuar, bloqueio de saída durante combate, conclusões de Celadon/Lavender, Silph Scope, Fuji, recordes e preservação dos dados do Idle após retorno e F5. As conclusões usam cenários controlados de teste; não representam uma campanha inteira jogada.
- Nenhum pedido externo partiu do host Rocket, nenhuma nova aba e nenhum recurso local ausente no percurso testado. Corrigido retrato ausente de Lavender usando o sprite local medium. A fonte externa já existente na página principal foi bloqueada pelo teste e não faz parte do host.
- Regressões Prey/Safari/Modos, entradas independentes/compatibilidade, importação de backup e conteúdo do tutorial aprovadas.
- Extração, derrota e fusão continuam no módulo nativo; nesta rodada não foram verificadas separadamente de ponta a ponta. Balanceamento das 50 etapas e áudio ouvido manualmente ainda precisam de avaliação jogando.
- Correção de retorno: mensagens entre o host e o Idle aceitam a origem opaca de arquivos locais somente quando a página é file://, mantendo a verificação da janela remetente. Testes de retorno nativo aprovados em file:// e HTTP. Removida a barra superior redundante; aviso de recuperação aparece somente em falha real de carga.
