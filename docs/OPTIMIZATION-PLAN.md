# Plano de otimização do OakChess Idle

## Objetivo e limites

Reduzir o trabalho e os recursos que o Idle não usa, mantendo batalhas, animações aprovadas, cinco gerações, eventos, fazenda, pesca, Pokéfone e progresso dos jogadores. A campanha antiga não será alterada.

Cada lote deve ter diagnóstico, mudança pequena, teste de regressão e comparação. Separar arquivos não é, por si só, uma melhora de FPS. Tamanho em disco, bytes carregados, memória JavaScript e tempo de processamento serão tratados como medidas diferentes.

## 1. Base de comparação — começar aqui

- Usar a mesma equipe de teste, região, resolução de 1366 × 768 e Chrome.
- Medir preparação parada, caçada em andamento e tablet do treinador aberto.
- Registrar versão do navegador, janela de amostragem, bytes dos scripts locais, memória JavaScript após coleta de lixo, tempo de processamento e oportunidades de atualização por requestAnimationFrame (não equivalem ao FPS real da batalha).
- Registrar erros de execução e recursos locais ausentes.
- Executar três amostras de cada cenário, sem misturar perfis de jogadores ou comparar máquinas diferentes.
- Resultado: JSON em `output/`, com medianas e condições do ensaio. É um teste de laboratório, não uma estimativa de FPS de todos os jogadores.

## 2. Primeiro lote: inicialização e rotinas exclusivas da campanha

Candidatos confirmados por leitura das referências:

- Inventário `OAK_STARTUP_FILES`: o carregador usa recursos visíveis na entrada. Verificar consumidores antes de retirar o catálogo extenso da inicialização.
- Organização do menu inicial de campanha: retirar o script da página Idle se não exportar funcionalidades usadas pelo modo.
- Desafios de runs da campanha: verificar chamadas protegidas no motor e retirar o script que mantém um temporizador a cada 350 ms. Os desafios do Idle, em `modes/idle/challenges.js`, devem continuar disponíveis.

Não excluir as mídias ou os arquivos compartilhados neste lote. Manter os caminhos de entrada principal e de compatibilidade sincronizados.

Validação: inicialização, saves antigos, importação/exportação, isolamento entre versões, recursos carregados, progressão das 40 regiões, tutorial e APIs dos desafios do Idle. Repetir as medições nas mesmas condições. Se houver erro funcional, reverter o lote antes de avançar.

## 3. Motor compartilhado

- Levantar os consumidores e efeitos de inicialização de torre antiga, Operação Rocket, conquistas antigas, títulos e relatórios de campanha.
- Distinguir a torre antiga da torre de treinamento do Idle e os eventos antigos das invasões atuais.
- Retirar uma integração por vez; não criar objetos vazios apenas para esconder erros.
- Extrair dados e renderização do motor em scripts clássicos menores, preservando a ordem e as variáveis globais necessárias.
- Critério de avanço: formação, preparação, vitória, derrota, evolução, captura, lendários, Megas e caçada automática funcionando sem erros.

## 4. Trabalho atrás dos painéis

- Medir quais observadores, temporizadores, canvases e efeitos continuam executando com painéis abertos ou aba oculta.
- Suspender apenas a apresentação que ficou invisível. Manter simulação, captura, autosave e compensação de tempo.
- Consolidar atualizações repetidas da interface e evitar reconstruções de DOM sem mudança de estado.
- Respeitar a preferência por movimento reduzido e preservar o alerta sonoro especial de shiny.
- Validar reabertura de painéis, retorno à aba, duração de combate e ausência de recompensas duplicadas.

## 5. Mídias por necessidade

- Mapear pedidos reais por tela e região, além das referências estáticas.
- Carregar cenário, trilha e sprites da próxima tela quando solicitados, com pré-carga pequena e cancelável.
- Limitar imagens decodificadas, áudios e efeitos simultâneos sem remover as animações aprovadas.
- Excluir mídias apenas com confirmação de que não são usadas, incluindo nomes montados dinamicamente.
- Validar primeira entrada sem cache, troca de região, variantes shiny/Mega e conexões lentas.

## 6. Organização e publicação

- Documentar as responsabilidades dos módulos e comandos de teste.
- Criar uma matriz de regressão para os principais sistemas e executar os checks a cada lote.
- Publicar lotes pequenos e identificar o commit anterior para reversão.
- Não alterar a versão do save nem os dados salvos em uma limpeza visual ou de desempenho.

## Critérios de aceitação

- Sem novos erros JavaScript ou recursos locais faltando nas rotas exercitadas.
- Saves e preferências preservados; original e independente continuam isolados.
- Sem mudança de recompensas, atributos ou progressão causada pela otimização.
- Economia de bytes/rotinas comprovada; ganhos de memória e processamento só serão anunciados quando sustentados pelas amostras.
- Nenhuma remoção ampla por nome de pasta, geração ou modo.

## Execução iniciada

A base foi medida e o primeiro lote foi implementado e comparado. Resultados, limitações e próximo alvo: [OPTIMIZATION-FIRST-BATCH.md](OPTIMIZATION-FIRST-BATCH.md). As demais etapas permanecem planejadas; ainda não representam otimizações concluídas.

O segundo lote removeu três integrações invisíveis da campanha, preservando os painéis próprios do Idle e o estilo compartilhado. Comparação e testes: [OPTIMIZATION-SECOND-BATCH.md](OPTIMIZATION-SECOND-BATCH.md). A checagem de dimensões dos bosses permanece como próximo alvo, sem alterações neste lote.

O terceiro lote substituiu a varredura de encaixe dos bosses por observação de mudanças de layout, sprite e viewport. A fórmula de encaixe foi preservada. Validação e comparação: [OPTIMIZATION-THIRD-BATCH.md](OPTIMIZATION-THIRD-BATCH.md).
