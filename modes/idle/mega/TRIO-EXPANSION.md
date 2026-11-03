# Blastoise, Lucario and Swampert — integration plan and implementation

## Scope

Add these three capturable partner species to the six existing Mega definitions, retaining all previous keys and progression. Mega Rayquaza was explicitly replaced by Mega Swampert; Rayquaza is not part of this expansion.

## Progression and persistence

- Same level 350 / P5 / perfect IV bosses, one Bronze Boss Token per paid entry, free training without rewards.
- Same three to five specific fragments per paid victory, five bonus fragments on the first paid victory, independent five percent whole-stone chance and forty-fragment crafting.
- Blastoisinite, Lucarionite and Swampertite only work on the matching final species.
- Existing `world.mega` fields are extended through the existing default initialization. Old fragment counts, stones, tokens and selected partner are preserved.
- Exactly one selected Mega partner per combat; saved species, genes, shiny, equipment, favorites and locks are unchanged. No capture of bosses or newly obtainable legendary is introduced.

## Battles

Base-stat ratios adapt the Mega's Attack, Special Attack, Defense, Special Defense and Speed to native unit attributes. Existing legal species move lists and effects remain in use.

- Blastoise: water typing; an eight-second tidal pulse deals five percent target maximum HP as special damage (before native mitigation), affecting allies within one hexagon of the nearest target, plus two seconds of slow.
- Lucario: fighting/steel typing; every eight seconds removes up to eight percent target maximum HP from its shield and deals seven percent maximum HP as mitigated special damage to the nearest target.
- Swampert: water/ground typing; every eight seconds deals six percent target maximum HP as mitigated physical damage to allies within two hexagons and slows them for two seconds.

These periodic boss mechanics are gameplay adaptations, not exact cartridge ability implementations. No changes to the six original mechanics.

## Visuals

Normal Mega battle sprites use the user-approved PAdventures sheets. Source cardinal directions are mapped to native direction slots; available cycles are shared for movement/attack because the package does not label separate attack sequences. Genuine canonical Mega shiny GIFs serve shiny partners without altering their colors. Normal preparation/Center forms remain unchanged.

Exclusive illustrated habitats: Fortaleza das Marés, Santuário da Aura, and Manguezal do Abalo Profundo. Each has its own opaque court and color scheme. The laboratory lists all nine bosses with scrolling navigation on shorter screens. New typings are translated in the hero panel.

## Verification

Browser checks cover old PMD variants, new PAdventures frames/directions, correct shiny fallback, nine-boss UI, icons, crafting, compatible assignment, paid entry and rewards, free training, periodic mechanics, distinct loaded scenes, unchanged saved Pokémon, return to base form, save/reload and mobile widths. Model tests retain atomic reward and entry behavior.

Publication of this trio and the subsequent 22-form expansion was subsequently authorized by the user.
