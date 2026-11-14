# Ativação do Prey online

Implementação preparada; a instalação e o teste no Supabase continuam necessários.

## Instalar nesta ordem

1. Na Edge Function `hunt-battle`, substituir todo o conteúdo de `index.ts` pelo arquivo `modes/idle/online/hunt-edge.ts` e publicar a função. Manter a configuração de autenticação existente: o código valida a sessão no servidor.
2. No SQL Editor, executar integralmente `modes/idle/online/033-online-prey.sql`. Não executar apenas o trecho de gatilhos: o catálogo e a função também fazem parte da migração.
3. Testar o frontend atualizado na prévia, com uma conta que tenha ao menos uma insígnia.
4. Publicar o frontend depois da validação. O bloqueio do Prey só é retirado quando a conta recebe `profile.prey.online = true` do banco.

## Regras mantidas

- Uma vaga com a primeira insígnia; duas com oito; três com dezesseis.
- Três espécies distintas, sorteadas entre as caçadas acessíveis ao nível e à progressão da conta.
- Dano, redução de dano ou loot comum: 10%, 15% ou 20%. XP: 10%, 15%, 20% ou 25%.
- Cem derrotas da espécie escolhida. Ginásios não aplicam bônus nem consomem cargas.
- Configuração preparada entra no próximo encontro; o encontro já criado mantém sua configuração original.
- Uma renovação gratuita por dia de Brasília. As seguintes custam nível do treinador × 100 Coins, entre 100 e 50.000.
- Loot não aumenta a tabela de pedras de evolução; não aumenta captura nem chance de shiny.
- Nenhum resultado, porcentagem ou saldo enviado pelo navegador é aceito como recompensa.
- O encerramento da batalha consome as cargas na mesma transação. Repetir a confirmação não consome novamente.
- Sem consultas novas por golpe: o encontro recebe um retrato imutável do Prey ao ser criado.

## Conferência na conta

Abrir Prey, selecionar uma espécie e ativar. Atualizar a página: a configuração deve permanecer preparada ou ativa. Derrotar uma espécie correspondente numa caçada normal: conferir o bônus e a redução de uma carga. Reabrir a página e confirmar que a carga não foi descontada novamente. Trocar a configuração durante uma batalha: a nova deve aparecer como preparada e valer somente no encontro seguinte.

## Verificações automatizadas

- `node scripts/check-prey.cjs`: regras locais e separação do loot comum.
- `node scripts/check-online-prey.mjs`: efeitos no combate/recompensas e projeção canônica do cliente.
- `node scripts/check-prey-database.mjs`: PostgreSQL isolado, com PGlite extraído em `output/prey-db-check/package`. Exercita a migração e RPCs, não se conecta ao Supabase real.
- Conferência do replay sem Prey contra a versão anterior para três sementes: resultados idênticos.

O teste isolado não substitui o teste das funções instaladas e do painel autenticado em produção.
