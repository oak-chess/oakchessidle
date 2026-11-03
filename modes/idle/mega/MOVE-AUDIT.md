# Four-move Mega loadouts

The 31-form audit found one truncated profile: Mega Gallade inherited the two-move cap from Gallade's internal star-one line, despite four legal species moves already existing in the catalog. Other Mega forms had four available moves.

The native Mega model now receives the complete species profile through its context and copies it only onto transformed combat units. Both enemy bosses and designated partners receive the full four-move cycle. Reapplying the model is idempotent and does not reset an existing move cycle. Ordinary forms, source move objects, saved partners and their evolution progression are unchanged.

Mega Gallade's full loadout: Confusão, Combate Corpo a Corpo, Psíquico and Esfera de Aura.

The Mega-only copy also corrects ambiguous display names: Shadow Ball → Bola Sombria, Dragon Breath → Sopro do Dragão, Double Kick → Chute Duplo, Night Slash → Talho Noturno. Move IDs, behavior and effects remain unchanged.

Validation: `scripts/check-idle-mega-moves.cjs` audits all 62 boss/partner profiles against recorded learnsets, checks four unique move IDs/names, source immutability, normal progression, actual Gallade combat and return to the normal form. `check-idle-mega-expanded-model.cjs` covers stat/form/progression regressions.
