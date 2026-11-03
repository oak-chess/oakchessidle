# Fronteiras do runtime independente

| Módulo | Responsabilidade | Contrato preservado |
|---|---|---|
| `engine.js` | Estado e passos do combate, motor compartilhado | `FX.update` continua processando projéteis/dano; a apresentação não controla o relógio da batalha |
| `modes/idle/render-budget.js` | Detectar janelas e escolher quando pintar FX | `IDLE_RENDER_FX(ts, draw)` executa o callback na cadência permitida; sem dados de save ou recompensa |
| `modes/idle/boss-fit.js` | Encaixe de bosses quando geometria/sprite muda | Fórmula original fornecida pelo motor; observadores substituem polling |
| `modes/idle/idle.js` | Coordenar caçada, serviços, retomada e persistência | Dono da partida Idle e dos checkpoints |
| `modes/idle/village/service.js` | Treinamento, casas, pesca e transferências autoritativas | Mutações passam por ações/commit; roda mesmo sem iframe carregado |
| `modes/idle/village/scene.js` | Cena, NPCs, moradores e carregamento dos serviços | Reutiliza um iframe; envia snapshots e delega ações ao serviço |
| `modes/idle/village/app.js` | Interface embutida de casas e escrituras | No modo nativo recebe o estado autoritativo; não inventa recompensas locais |
| `modes/idle/pokefone.js` | Aplicativos e interação do aparelho | Preserva input no mesmo app; navegação explícita pode reconstruir a tela |
| `modes/idle/mystery-portal-audio.js` | Efeitos sonoros do portal | Uma verificação de mute apenas enquanto há notas ativas |
| `modes/idle/storage-bootstrap.js` e `save-transfer.js` | Namespace, cópia inicial e transferência | Nenhuma limpeza ampla de localStorage; isolamento de saves preservado |

## Ordem e compatibilidade

As duas entradas HTML carregam scripts clássicos na ordem existente. Variáveis lexicais do motor ainda são compartilhadas; não converter um arquivo para módulo ES isoladamente. O controlador de apresentação pode carregar depois do motor: se sua função ainda não existir, o motor desenha normalmente. O helper de bosses mantém a recuperação dinâmica para HTML em cache.

Novos arquivos sob `modes/` já entram no pacote de Pages. Um arquivo novo na raiz exige revisão explícita da cópia no workflow. As URLs versionadas das duas entradas devem mudar juntas.

## O que não foi extraído

Catálogos completos, fórmulas de atributos, aplicação de dano, resolução de turnos e economia não foram movimentados neste lote. Os vínculos com torre/Rocket antigos ainda necessários foram preservados. Uma extração maior é trabalho futuro de arquitetura, não condição para anunciar o lote atual como uma reescrita completa.

## Verificação

- `node scripts/check-render-scheduler.cjs`: contrato da apresentação.
- `node scripts/check-standalone.cjs`: motor integrado, saves e compatibilidade.
- `node scripts/check-optimized-session.cjs`: serviços sob demanda e sessão isolada; padrão de três minutos.
- `node scripts/profile-idle.cjs etiqueta`: medição laboratorial, sem usar perfil do jogador.
