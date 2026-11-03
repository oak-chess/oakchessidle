# Efeitos aprovados para o Idle

24 associações visuais aprovadas no protótipo PAdventures. A associação aos nomes é uma adaptação visual do OakChess, não um mapeamento oficial do servidor.

Fonte: PAdventures Sprites por DistTopic e comunidade: https://github.com/DistTopic/padventures-sprites

Contribuições originais sob CC BY-NC-SA 4.0. Consulte LICENSE, NOTICE e DISCLAIMER.md nesta pasta. Os direitos de Pokémon pertencem aos respectivos titulares.

O adaptador usa apenas o identificador exato do golpe já escolhido pelo jogo. Não adiciona golpes aos Pokémon e não altera dano, acerto, aprendizado ou progressão. Projéteis acompanham a posição real do combate; impactos são disparados na resolução do acerto. Arquivos indisponíveis usam o renderizador anterior.

## Combat presentation

The Idle adapter owns the approved spell visuals once its sheet is loaded. Native damage, targeting, mana, statuses, projectile arrival callbacks and passive mechanics remain unchanged. Legacy spell charge, rings, area splashes and impact overlays are suppressed for these casts only. Missing sheets retain the existing fallback.

Projectile sheets follow the native projectile; impact sheets appear on arrival. Beam calls use one effect instead of tiling impact sprites. Surf travels as one seven-frame wave; burst area sheets play once at the caster. Vine Whip retains its single horizontal directional composition. These are game adaptations of the approved sheets, not original server scripts or newly drawn assets.

Checks: `scripts/check-idle-approved-effects.cjs` covers all 24 sheets, presentation modes, single-effect beams, Surf travel and effect expiry. `scripts/check-idle-approved-native.cjs` checks native cast integration without legacy spell overlays, separately from passive effects.
