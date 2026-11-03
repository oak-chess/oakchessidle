# OakChess Idle

Projeto independente da Jornada Idle. Origem: `oak-chess/oakchess`, commit `57bfa6c4`.

## Jogar e desenvolver

- Entrada principal: `index.html`.
- O caminho `modes/idle/index.html` continua funcionando por compatibilidade.
- Sirva esta pasta por HTTP para desenvolvimento, por exemplo: `python -m http.server 8080`.
- Não é necessário compilar o jogo. O GitHub Pages publica arquivos estáticos.
- As alterações deste repositório não precisam ser copiadas de volta ao projeto de campanha.

## Progresso dos jogadores

O novo jogo usa o espaço de armazenamento `oakchessidle:`. O jogo antigo continua usando `oakchess-idle:`.

Na primeira abertura, se ambos estiverem no mesmo domínio e houver progresso antigo válido, ele é **copiado**, sem apagar ou alterar a versão antiga. A cópia não é repetida depois de já existir progresso no novo jogo. Não jogue nas duas versões esperando que elas sincronizem.

Para outro navegador ou domínio:

1. No jogo antigo: Configurações → Dados → Exportar backup.
2. No novo endereço: abra `transfer.html`, escolha o arquivo e confira o resumo.
3. Guarde uma cópia do progresso atual, feche outras abas do jogo e confirme a importação.
4. Abra o jogo e confira equipe, PC, Coins e progresso.

A página também exporta o conjunto de configurações e dados locais do novo Idle. O backup antigo contém o estado da jornada, mas pode não incluir preferências salvas em outras chaves. A importação preserva dados de outros jogos e tenta reverter a operação se houver falha de armazenamento. Backups são locais: não são enviados a um servidor.

## Organização

- `engine.js`: motor nativo extraído do HTML; permanece como script clássico, na mesma ordem de execução.
- `layout.css`: estilos básicos extraídos, preservando sua posição na cascata.
- `asset-inventory.js`: inventário de recursos, separado do documento inicial; não é uma ordem para baixar todos os arquivos.
- `modes/idle/`: regras, telas e dados do Idle.
- `assets/` e `wallpapers/`: recursos locais, incluindo dependências herdadas do motor.
- `modes/idle/storage-bootstrap.js`: isolamento e cópia inicial de progresso.
- `transfer.html`: transferência manual por backup.

## Validação

Instale Node.js, Chrome e as dependências de desenvolvimento (`npm install`). Execute `npm test`.

O teste independente inicia um servidor temporário sob `/oakchessidle/`, abre as duas entradas, verifica os recursos carregados e a inicialização, importa um backup e valida a cópia de saves, o isolamento entre versões e a reversão de falhas. `scripts/check-idle-hunt-wave-curve.cjs` cobre a progressão das 40 regiões.

## Limites desta separação

Esta base prioriza compatibilidade. Os recursos compartilhados foram preservados porque o motor ainda possui dependências de campanha e torre. Separar o repositório, por si só, não reduz o custo de uma batalha nem garante mais FPS.

As filas de imagens e o carregamento de recursos visíveis já existentes foram mantidos. O carregador agora resolve URLs pelo endereço base do documento, inclusive no caminho de compatibilidade.

Próximas limpezas devem ser pequenas e verificáveis: mapear dependências do motor, remover rotinas exclusivas de outros modos, eliminar mídias comprovadamente sem uso e só depois dividir o motor em módulos menores. Não apague um diretório por seu nome: algumas arenas e interfaces são compartilhadas.

Créditos e atribuições: [CREDITS.md](CREDITS.md).
