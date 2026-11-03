# Diário permanente de atividades

Os agregados de cada dia e as metas ficam em `state.activity`. O arquivo detalhado fica no IndexedDB `oakchess-activity-v1`, separado por identificador do diário. Não há corte de 200 entradas no arquivo. A fila pendente fica no save até a confirmação da gravação; falhas de arquivo são sinalizadas no aplicativo. Não há exclusão automática para liberar espaço.

Horas contam tempo visível com limite por intervalo para evitar contagem de suspensão. Horas offline/aba oculta não são presumidas. Ouro é observado no estado autoritativo; receitas, despesas e lucro líquido são separados do custo estimado dos suprimentos. Dias usam America/Sao_Paulo.

A migração importa somente históricos realmente disponíveis. Os registros recuperados são identificados; horas e balanços antigos não são inventados. Ovos, evoluções, sorteios, casas e marcos são copiados dos registros existentes para o arquivo permanente; capturas novas entram diretamente antes do corte da lista recente. Encontros shiny são registrados mesmo sem tentativa de captura. Um shiny encontrado e sua tentativa são acontecimentos diferentes, não duas capturas.

O arquivo é local deste navegador. O backup normal preserva agregados, metas e a fila pendente, mas não inclui automaticamente o arquivo IndexedDB já gravado. O aplicativo permite exportar o arquivo completo em JSON ou CSV; exporte os registros antes de mudar de navegador/dispositivo ou limpar os dados. Exportar não apaga nem reinicia registros. Não há sincronização de conta.
