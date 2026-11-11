# Ativação do PokéChat

1. Aplicar `005-player-contacts.sql` somente se os contatos ainda não foram criados.
2. Aplicar `006-private-chat.sql` no projeto de teste. Ela cria as mensagens privadas e RPCs; não importa saves locais.
3. Verificar com duas contas: adicionar os nomes mutuamente, enviar e ler uma mensagem. Uma terceira conta não pode ler a conversa das outras duas. Sem contato mútuo, o envio deve ser recusado. Duas requisições simultâneas do mesmo remetente devem respeitar o intervalo de 40 segundos.
4. Publicar o frontend com `chat.css` e `private-chat.mjs` incluídos. O servidor atual continua compatível; a nova versão acrescenta o identificador autenticado às mensagens dos canais.

Os canais guardam 30 mensagens na memória do servidor. As mensagens privadas ficam no Supabase, mostram as últimas 30 e consultam apenas a conversa aberta a cada 8 segundos, suspendendo a consulta em aba oculta. Esse recurso consome a quota do banco. Não há promessa de envio instantâneo nas conversas privadas.

Os avisos sonoros dos canais usam as preferências existentes do Pokéfone. Contadores são da sessão, enquanto a conexão do aplicativo estiver aberta. Notificações de mensagens privadas em segundo plano, histórico anterior às últimas 30 e push com o Pokéfone fechado ainda não estão implementados. A migração SQL deve passar pelos testes de isolamento antes da ativação pública.

## Próxima ativação

Depois da 006, aplicar 007-chat-verification.sql e 008-chat-groups.sql no projeto de teste. Rodar verify-chat.sql; ele usa duas contas existentes e desfaz as alterações. O resultado esperado é Chat isolation and cooldown checks passed. A execução ainda precisa ocorrer no Supabase; testes locais de interface não validam essas migrações.

Publicar também verification.mjs e new-conversation.mjs. Os grupos exigem contatos mútuos, até 20 membros e até 10 grupos por criador. A lista só inclui grupos dos quais a conta participa. A saída do criador exclui o grupo; nenhuma interface deve chamar essa operação sem informar a consequência.

Atualização 11/11/2026: migrações 005–009 instaladas no projeto oakchessidle-test e teste SQL de isolamento, intervalo e recibos concluído com sucesso. Intervalo de envio: 40 segundos. Recibos: ✓ aceito pelo servidor, ✓✓ entregue, ✓✓ azul lido (grupos: todos os destinatários da mensagem). Canais públicos exibem apenas aceitação pelo servidor; não fingem leitura coletiva. Consultas da conversa privada/grupo continuam a cada 8 segundos enquanto aberta e visível.
