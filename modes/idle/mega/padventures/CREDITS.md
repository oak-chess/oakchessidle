# PAdventures Mega adaptation

Source: [PAdventures Sprites by DistTopic](https://github.com/DistTopic/padventures-sprites).
Original repository contributions are CC BY-NC-SA 4.0: non-commercial, attribution and share-alike. The repository license does not grant rights to underlying Pokémon intellectual property. Original terms are reproduced in `NOTICE` and `DISCLAIMER.md`.

The user identified and approved the normal-form sheets 41479 (Mega Blastoise), 45003 (Mega Lucario) and 41650 (Mega Swampert). Original PNGs, geometry and source hashes are retained in `source/` and `manifest.json`.

Changes: reorganized frame cells to the native renderer's layout; repeated four source cardinal directions in eight directional slots; added alpha bounds and size adjustment. The original cycle is reused for Idle, Walk and Attack. This does **not** supply dedicated attack animations or eight original directions. These converted sheets are PAdventures artwork, not PMDCollab artwork.

Until genuine PAdventures shiny counterparts are identified, shiny partners use the correct animated Mega sprite from [PokeAPI/sprites](https://github.com/PokeAPI/sprites), preserving their shiny identity and colors. No recolored approximation is used. Base Pokémon continue using the existing PMD assets outside battle.

Three exclusive environment illustrations were generated with the built-in image generation tool. Exact prompts and saved assets are recorded in `ART-SOURCES.json`.

## Additional approved sheets
The next 22 approved normal Mega sheets and the identified shiny Mega Gyarados sheet (47271) are now included. `manifest.json` lists all 26 converted variants, their original hashes, geometry and form folders. Charizard Y uses form 2; the existing PMDCollab Charizard X resources were not replaced. The image-generation prompt record now includes all 25 PAdventures Mega environments.
