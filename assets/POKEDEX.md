# Pokédex de descobertas — fase 1

Interface em `pokedex.js` e `pokedex.css`. Acesso pelo menu inicial, botão de livro junto aos controles e menu de pausa. Abrir durante preparação ou combate pausa a partida; fechar retoma somente se a Pokédex tiver iniciado essa pausa.

Armazenamento independente: `oakchess_pokedex_v1`. Entradas por número de espécie, formas vistas/obtidas, evoluções efetivamente alcançadas e golpes usados. Sinergias contam espécies distintas e são registradas no início das batalhas; até 60 combinações de tipos são guardadas. Escritas agrupadas, sem gravação a cada quadro. Limpar o histórico não apaga a Pokédex.

Fontes de registro: renderização da loja, adversários revelados, novas unidades obtidas, fusões e escolha da evolução do Eevee, habilidades usadas e início de combate. Demonstração da tela inicial e prévia de arenas não contam.

Migração limitada às formas da composição final comprovadas no histórico existente. Não presume que o jogador tenha realizado uma evolução, usado uma habilidade ou visto todas as formas anteriores. Catálogo e textos vêm das mesmas estruturas do jogo; números de atributos são valores base sem itens e bônus.

A conferência de sintaxe dos scripts foi concluída. A revisão visual e a verificação de uma campanha real não foram executadas nesta etapa; a ferramenta de navegador bloqueia acesso a URLs locais `file:`.

Fases seguintes do plano: relatório de batalha, eventos regionais, desafios opcionais e rotas alternativas.
