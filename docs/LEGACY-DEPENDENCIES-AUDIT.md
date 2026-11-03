# Auditoria inicial de dependências antigas

Escopo: importações de `index.html` e `modes/idle/index.html`, consumidores no motor e módulos Idle. A busca textual foi usada para localizar contratos, não como justificativa única para apagar arquivos.

| Integração | Evidência | Decisão deste lote |
|---|---|---|
| `assets/tower.js` e `tower-sectors.js` | Torre antiga exporta `TOWER`/`TOWER_SECTORS`, envolve HUD e prévia antiga e registra controles da tela inicial antiga. Chamadas do motor dependem de `G.tower` ou verificam a existência da API. A torre de treinamento Idle usa `IDLE_CHALLENGES.tower` e `createIdleSystems`, sem ativar `G.tower`. | Retiradas somente as duas importações nas duas entradas; arquivos e mídia conservados. Teste integrado exige ausência das APIs antigas e inicia combate real da torre nativa. |
| `assets/game-menu.js` | Reorganiza `sysbar`, conserva fullscreen/configurações e cria os controles usados pela interface. | Manter: não é descartável por ter nome genérico. |
| `assets/alternative-routes.js` | Exporta `ROUTES`; motor e `mystery-events.js` consultam suas funções. Altera `SAVE_KEYS`. | Manter neste lote; separar fluxo antigo e chamadas atuais antes de propor retirada. |
| `assets/mystery-events.js` | Exporta `MYSTERY_EVENTS.offer`; motor usa antes de prosseguir eventos, com delegação a `REGION`/`ROUTES`. | Manter neste lote; ainda requer ensaio de eventos e recuperação. |
| `assets/rocket-theft.js` | Exporta `ROCKET_THEFT`; motor consulta reserva do banco, marcadores e resolução. Envolve `newGame` e adiciona campos de salvamento. | Manter neste lote; não confundir com invasões Rocket nativas. |
| `assets/achievements.js` | O motor chama `ACH.boardProgress` ao organizar unidades; `trainer-profile/runtime.js` consulta equipamentos cosméticos e vitórias. | Manter; separar o cálculo antigo antes de retirar a integração. |
| `trainer-profile/profile.js` e `runtime.js` | `modes/idle/trainer.js` lê `TRAINER_PROFILE_API.state` como compatibilidade de aparência; `trainer.js` e `idle.js` ainda expõem acesso a `TRAINER_PROFILE.open`. | Manter os contratos atuais; substituir só com um lote dedicado de aparência e migração. |
| `trainer-profile/data.js`, `art.js`, `achievement-catalog.js`, `expansion.js` | `profile.js` consulta `TRAINER_PROFILE_DATA.snapshot`, registra molduras/títulos em `TRAINER_ART` e compõe seu catálogo de conquistas. | Manter a cadeia do perfil conservado; não remover fornecedores deixando catálogos incompletos. |
| `trainer-profile/partner-sprites.js` | Centro e vila chamam `TRAINER_PARTNER_SPRITES.load/draw`; perfil usa `create`. | Manter; corrigido apenas o agendamento ocioso das miniaturas, com teste próprio. |

A revisão das categorias prioritárias deste ciclo está concluída: as duas importações da torre foram retiradas e as demais cadeias acima foram classificadas para conservação. Isso não significa que todo código antigo seja indispensável para sempre. Rotas, eventos e perfil exigem substituição de contratos antes de novas exclusões; não se removeu código apenas porque uma chamada tinha `?.`.

## Medida verificável

As duas importações retiradas somam **109.159 bytes de código fonte** no disco. Isso elimina suas duas solicitações diretas e sua avaliação JavaScript na entrada atual; não é uma medição de bytes comprimidos na rede, memória nem FPS. Arquivos continuam no pacote de publicação por compatibilidade e cautela.

## Limites

Não foi removido o código condicional de torre que permanece no motor. Retirar esses ramos exige outro lote. As demais integrações acima foram conservadas até haver evidência suficiente para separá-las. Não foram usados objetos vazios para simular APIs removidas.
