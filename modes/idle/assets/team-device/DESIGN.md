# Team telemetry HUD

Approved visual reference: `approved-concept.png`.
Production frame atlas: `frames-atlas.png`.
Method: built-in image_gen, reference-preserving edit. Preview art was approved by the user before implementation. Native sprites, labels, percentages, interactions and XP effects are rendered live over the neutral frames; the atlas contains no baked player data.

Original generated reference: `exec-e5bdbb0e-3de0-4f88-8090-4fe9f0969016.png`.
Edited atlas: `exec-4b26fc6a-91c0-4137-b01b-65e8e87d1a50.png`.

Final edit prompt:

> Edit this approved game HUD into a reusable UI frame atlas. Keep EXACT same image dimensions, positions, sizes and all nine module OUTER frames, cyan/red LED edges, black glass surfaces, fine circuit etchings and physical finish. Remove forest completely to transparent alpha background. Remove ALL Pokémon sprites, trainer sprite, all text, numbers, type icons, health/XP bars, six cyan dots and internal icon menus. Fill removed contents with matching deep dark teal black glass and subtle circuit etchings. Preserve the outer rounded metal bezels and glowing edge lights identically. Keep the decorative round Pokéball emblem at far left of trainer frame, and the small Pokéball at far left of each team card and heading frame, and the synergy network emblem left of last frame. Keep the thin cyan outline of each empty sprite bay. Do not move any frame. This is same layout with empty neutral interiors, ready for live game data. No new text or symbols. All nine frames fully intact and separate; preserve exact approved appearance.

The generated file retains a dark surround, so CSS samples only the full individual module bounds rather than displaying the whole image. The first team frame is reused for all members. No runtime health, XP, species, name, level or count comes from the artwork. Frame loading failure leaves the previous HUD active. Native reduced-motion behavior and XP/level animations are preserved.
