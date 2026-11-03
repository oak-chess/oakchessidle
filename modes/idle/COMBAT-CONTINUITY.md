# Hunt energy and move sequence continuity

Ordinary hunt encounters no longer restart each partner's accumulated energy and move cursor. The native cast order remains sequential: move 1 → move 2 → move 3 → move 4 → move 1, restricted to however many moves the current species/form actually has. A ready first move never jumps ahead of the next move.

## Persistence

`member.combatCarry` stores version 1, owning member ID, the next move's stable identity, and remaining combat mana. Snapshotting happens during normal save operations, encounter resolution and pausing an ongoing hunt. This includes autosave, visibility changes and page hide. Restore happens after native stats, hunt bonuses and temporary Mega setup, so it uses the final combat profile and mana capacity.

Stored energy is clamped to the native two-charge limit. A fainted partner retains its next move but loses accumulated mana. A missing/removed move falls back to the first move; malformed numbers cannot inject energy. The owner ID prevents offspring or copied records from inheriting another partner's energy. Legacy saves without this field retain their existing first-encounter preparation.

## Challenge isolation

A battle-origin flag is set before combat begins. Gyms, events, Mega fights, tower floors and training do not read or overwrite ordinary hunt continuity, even when their challenge object is cleared before the final save. Their original starting energy and move order remain intact. Returning to exploration resumes the stored hunt state.

No new moves, damage changes, mana-cost changes or per-move cooldown rules are introduced. Base attacks, shared animation intervals and the existing active-cast gate remain unchanged. This change also does not award combat mana through offline simulation.

## Validation

- `scripts/check-idle-combat-continuity.cjs`: stable move identity, energy limits, fainting, old saves, invalid values, profile changes and ownership.
- `scripts/check-idle-combat-continuity-browser.cjs`: real successive encounters casting Hidrobomba → Canhão de Flash → Jato de Água → Surf → Hidrobomba; remaining energy retained; reload during preparation and mid-combat; challenge isolation; normal evolution move limits and saved protections preserved.
- `scripts/check-idle-mega-moves.cjs`: all 31 Mega forms still have four legal, distinct moves on both combat sides.
