# Vila e Fazenda online — entregas 029 e 030

## Implementado nesta entrega

- Vila habilitada apenas quando o snapshot oficial contém `farm.onlineCore=true`.
- Primeira casa Comum, recebida uma vez após conhecer Elias e Rosa.
- Selecionar, renomear, guardar e reinstalar a propriedade.
- Enviar Pokémon do PC e devolver residentes ao PC.
- Reserva no banco de dados contra venda, anúncio, evolução, alteração de equipamento,
  mudança de dono, depósito, campo, banco e defesa da Arena.
- Treinamento dentro da transação que conclui cada caçada. A Fazenda usa
  `result.rewards.pokemonXp`: o XP total dos adversários derrotados, já calculado
  pelo servidor com os multiplicadores vigentes. Cada morador recebe a taxa de sua
  casa (25%, 40%, 75%, 100%, 100%), sem reduzir o XP da equipe.
- Frações acumuladas por morador durante a permanência na casa. Nível/XP usam
  `hunt_add_xp`, a mesma curva dos Pokémon em campo. Ao retirar, o XP inteiro e os
  níveis permanecem; o saldo fracionário inferior a 1 XP é encerrado.
- Somente caçadas comuns treinam. Ginásios não treinam a Fazenda. Ganhos por
  derrotar adversários antes de perder uma caçada também seguem o recibo oficial.
- Conclusão repetida, recarga e atualização das capturas não concedem XP novamente.
- O snapshot oficial reconstrói a aba Fazenda e os residentes; os efeitos existentes
  de XP consomem os incrementos de `trained`, sem conceder recompensas no navegador.

## Escrituras e decorações — migração 030

- `farm.onlineProperties=true` libera o painel completo existente de escrituras.
- Uma escritura custa 10 Fragmentos de Casa, em lotes de 1, 5 ou 10. Pagamento
  por Coins é recusado pelo servidor.
- Fragmentos exclusivos das Invasões Rocket, conforme decisão do jogador dono do
  projeto. Não há drop de caçadas nem missão semanal. O saldo começa em zero;
  esta migração não distribui materiais retroativos nem cria recompensa de teste.
- Qualidades: Comum 74,495%, Incomum 20%, Rara 5%, Mítica 0,5%, Lendária 0,005%.
  A amostragem e os resultados são determinados no servidor. A animação não altera
  o resultado. Cada escritura sorteada já está no inventário antes da apresentação.
- A apresentação pendente permanece no snapshot e pode ser concluída após recarga.
- Proteção, venda, reciclagem e fusão de cinco Comuns ou cinco Incomuns são atômicas.
  Fusão recusa casas instaladas, protegidas, repetidas, de qualidades diferentes ou
  de outra conta. Consome cinco e cria uma propriedade nova, sem decoração.
- Reciclagem fornece Madeira/Pedra/Peças pelos valores anteriores. Construção e
  ativação de Jardim de flores e Caminho de pedra usam os mesmos custos existentes.
- Histórico limitado às 30 operações recentes. Repetir uma confirmação não repete
  o pagamento, a venda, os materiais ou a fusão.

## Ainda bloqueado

O evento Rocket online. A pesca depende da instalação da entrega 031 e de sua
função própria; sem ela, continua bloqueada. A Rocket precisará creditar os Fragmentos de Casa
na mesma transação de sua vitória confirmada, com identificação única do encontro,
quando for integrada. Não há importação de dados locais de teste.

## Instalação e publicação

1. Aplicar `029-online-farm.sql` no SQL Editor do projeto de teste, após 028.
   O script é transacional e não remove inventário, casas locais nem saldos existentes.
   Executar uma vez. Se falhar, corrigir a causa antes de tentar novamente.
2. Aplicar `030-online-farm-properties.sql`, uma vez, após 029. Até sua instalação,
   o frontend continua oferecendo somente as operações básicas da primeira entrega.
3. Publicar os arquivos de frontend desta entrega. O código anterior continua
   compatível com o snapshot ampliado. O frontend novo mantém a Vila bloqueada
   caso a migração ainda não esteja instalada.
4. Com duas contas, testar primeira casa, transferências e uma caçada completa;
   conferir recarga e troca de conta. Não é necessário atualizar `hunt-battle`
   nesta entrega: o treinamento é confirmado por um trigger de `hunt_finish`.

Para mover moradores, concluir o encontro ativo primeiro. Pokémon no depósito ou
no banco precisam ser enviados ao PC. Pokémon registrados na defesa da Arena
precisam sair dessa defesa antes do envio à Fazenda. O mesmo vale para ofertas ou
partidas ativas da Arena; isso evita usar o mesmo indivíduo nos dois sistemas.

## Verificação local

- `node scripts/check-online-farm.cjs <diretório-do-pacote-pglite>` executa SQL real
  em PostgreSQL isolado, incluindo o `hunt_finish` da migração 027.
- `node scripts/check-online-farm-client.cjs` confere projeção e serviço online.
- `node scripts/check-online-farm-ui.cjs` exercita o painel existente em Chrome
  isolado com uma conta fictícia e respostas de interface controladas.
- Os testes de UI não substituem o teste das duas contas no Supabase de teste.

## Próximas entregas

1. Crédito de Fragmentos de Casa ao integrar o evento Rocket online.
2. Pesca: resultado da fisgada, tempo, capturas, balde, vendas e PC no servidor.

### Pesca — entrega 031 preparada e testada localmente

- Tentativas, espécies sorteadas, varas, nível e XP de pesca ficam no servidor.
- A função fishing-battle valida a sessão e refaz os comandos com cast-rules.mjs.
  Ela compara o tempo ativo ao relógio do banco. Não aceita vitória, espécie,
  IVs, qualidade, nível, dono ou recompensa enviados pelo navegador.
- Os indivíduos usam o gerador atual compartilhado das caçadas, com sorteio
  aleatório de shiny de 1/25.000, sem contador de garantia. A semente é privada.
- Confirmação repetida retorna o mesmo resultado sem duplicar capturas nem XP.
- A recarga recupera o mesmo encontro. A apresentação da linha recomeça, com
  a mesma espécie, técnica e cardume; não cria outra tentativa nem sorteia de novo.
- Pausa visual e troca de aba suspendem os controles; não concedem resultado.
- Balde limitado a 300. Venda protege favoritos e bloqueados; transferência ao
  PC preserva identidade, genes, origem e treinador original. Repetir a mesma
  confirmação não transfere nem credita duas vezes. Transferidos ocupam o PC real.
- Venda usa a fórmula do NPC atual (fator 50 e shiny ×10); a prévia do balde
  online usa a mesma fórmula. Encomendas continuam sendo únicas por conta.
- Não há importação de baldes locais, moedas grátis ou aumento de saldo de teste.
- Em falha de confirmação, o painel oferece nova tentativa manual com os mesmos
  dados; não dispara repetidamente pedidos sem interação.

#### Para instalar no projeto de teste

1. Criar uma NOVA Edge Function chamada **fishing-battle**. Copiar todo o arquivo
   fishing-edge.ts para index.ts e publicar. Não substituir hunt-battle.
   O arquivo usa as variáveis padrão SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e
   SUPABASE_ANON_KEY somente no servidor; nenhuma chave privada vai ao frontend.
2. Aplicar 031-online-fishing.sql após 030, uma vez. A alteração é transacional;
   não remove Pokémon nem progresso existentes. Ela habilita onlineFishing no
   snapshot oficial somente após instalar as tabelas e operações necessárias.
3. Recarregar a prévia local e testar as duas contas: obter Vara Antiga com Elias,
   pescar por boia e precisão, conferir balde/XP, vender, proteger, enviar ao PC,
   recarregar durante a fisgada e repetir uma confirmação após falha de conexão.
4. Publicar frontend somente depois da conferência no projeto conectado.

Verificações locais concluídas: PostgreSQL isolado (propriedade, proteção, venda,
idempotência, encomendas e PC), simulação de controles, função autenticada com
respostas controladas e Chrome isolado com captura e recuperação da mesma fisgada.
Esses testes não equivalem a afirmar que a entrega já foi instalada no Supabase.

Comandos adicionais: node scripts/check-fishing-cast-rules.mjs,
node scripts/check-fishing-handler.mjs e node scripts/check-online-fishing-ui.cjs.
Gerar novamente a função após mudar suas dependências com
node scripts/build-fishing-edge.cjs.

As regras históricas em `village/README.md` e `HOUSE-PLAN.md` descrevem a versão
anterior. Para o online, a disponibilidade desta entrega está definida acima.
