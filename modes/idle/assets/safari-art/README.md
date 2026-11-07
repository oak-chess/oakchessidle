# Safari ground artwork

Three high overhead painted clearings, generated for OakChess Idle with image generation: meadow, lakeside boardwalk, and ancient jungle. Each composition reserves the center for the native battlefield; no sky, horizon, UI or characters.

Runtime assets: meadow-ground-v2.webp, lake-ground-v2.webp, jungle-ground-v2.webp (2172 × 724). WebP conversion preserves the generated artwork; battlefield geometry, units and bench are drawn separately by safari-arenas.js.

Generation direction: cheerful Pokémon-inspired natural reserve, elevated camera matching the game board, integrated vegetation/rocks/water at the perimeter, uninterrupted packed earth in the middle. The meadow image served as the camera/style reference for the other two scenes.

## Illustrated panels
Entry and draw frames were derived from approved concept exec-e845cb03-6d4f-4131-b822-9b9d95930059.png using image generation. The prompts retained the metal/cyan frame and botanical corners, removing all text, creatures and controls. The UI overlays live labels, accessible buttons, existing Pokemon sprites and previews from the native Safari arena painter. Sources remain in the Codex generated-images library: entry exec-7b2ac975-84ba-4480-9ff3-0a40552cbb66.png, draw exec-8195c320-692a-47c8-b2c8-3a015fecd762.png. Converted to WebP for runtime. Safari is excluded from remaining-terminal styles so generic menus cannot overwrite its art.

Controls atlas: controls-atlas-v1.png is the transparent 2x2 atlas generated from the same approved reference (source exec-84c4fd14-a60c-40bb-b6c8-b426de3eee0c.png). CSS positions each sprite without modifying its pixels; button labels remain live and accessible. It replaces the approximate CSS-only stopwatch, ball, net badges and action button.
