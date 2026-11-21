# TAMBU GAME — DJ Visual Library UX V2.1
**Date:** 2026-11-20
**Status:** DIRECTION APPROVED / IMPLEMENTATION PENDING
**Mode:** TARGETED EDITOR UX REFINEMENT, NO STATE/SCHEMA REDESIGN

## 1. Creator feedback and validated current state
Direction manually tested the V2 in-game layout editor. Dynamic add/remove, duplicate, depth, groups, history and export are working well. The current object-picking experience, however, is frustrating: having to try names one by one is unintuitive.

Repo inspection (main): `djLayoutEditorPanel.js` already has separate **Edición** and **Biblioteca** tabs; `djLayoutEditor.js` already renders approved asset thumbnails via `<img src=entry.path>` and handles click-to-place. The CSS displays them at **40×40 CSS px**, with ~82px-wide grid cells. The **Edición** existing-piece picker is still a text-only `<select>`. Recipe cards use `entry.path` for one representative component, not the visible assembled recipe. The actual defect is **discoverability + legibility + incomplete assembly previews**, NOT absence of a catalog or lack of runtime add support.

This is a *focused V2.1 usability correction* on top of the existing successful V2, NOT an excuse to rebuild it.

## 2. User experience target
The creator should open the editor, recognize the available props by **real, large pixel-art pictures**, choose one visually, place it immediately and identify any selected existing placement without memorizing internal IDs.

### A. Make visual placement obvious
- Make **Biblioteca** easily discoverable and the prominent starting action: clear primary action `Agregar objetos` or equivalent. Keep `Edición` discoverable for moving already placed items. The exact layout can be a two-tab panel if it stays easy to understand; no separate app or overlay that hides the whole map.
- Preserve the existing family filters and search. Labels are supplemental, not the primary way to choose.
- Show **larger, legible thumbnails**: approximately 80–100 CSS px of image presentation space, preserving PNG aspect ratio with contain/pixelated interpolation and real alpha. Avoid blur, antialias, fake redrawing or replacing sprites with icons. A compact two-column card grid or adjustable-width sidebar is preferable to tiny, densely packed cards. The panel must remain usable at 1280×720 and 960×540 without obscuring the map; collapsible/scrollable.
- Distinguish single sprites vs complete recipes with subtle labels. Show a small asset name; keep internal IDs secondary (e.g. tooltip).
- Clicking a card must clearly arm placement on the real Phaser canvas. The user clicks a world position to place, sees the resulting object, and can immediately edit/drag it. Esc cancels. Keep current behavior reliable.
- A larger **selected-object preview/inspector** inside the editor is valuable, particularly for narrow PNGs. User must be able to see what they chose before placing. Do not require trial placement to identify a prop.

### B. Previews of full composed sets must tell the truth
- Recipe thumbnails (sofa long/short, assembled pot with plant/lip, tree canopy/trunk, dressed table, border modules) must depict the **whole resulting assembly**, not a single representative `assetId` fragment.
- Generate recipe previews deterministically from the **same registered approved PNGs and recipe offsets/crops/depth** used by runtime, using a minimal renderer, or verified generated cache thumbnails sourced from those PNGs. Alpha + pixelated scaling; transparent canvas or neutral checkerboard. Correct bounds/partial overlaps.
- No external generative images, fake screenshots, bespoke illustration, or interpretation of PNGs. If an asset/recipe preview cannot be produced honestly, show a clear fallback rather than misleading users.
- Reuse the catalog registry; newly approved packs registered into `djEnvironmentAssets.js` and `djEnvironmentCatalog.js` must appear with thumbnails automatically.

### C. Visual selection of existing placed instances
- In `Edición`, make identifying already placed objects visual too: replace/supplement the piece-only text picker with a small **scrollable list of instances with icon/thumbnail + readable label + short ID** or add a visible selected-asset preview connected to the existing selection. Prefer to retain current `<select>` logic for keyboard compatibility.
- For repeated same-looking objects, include stable instance name/ID and optionally group, but distinguish them without requiring random guessing. Clicking the real object in-game remains supported.
- The chosen placement's preview reflects the whole rooted assembly if it is a recipe or compound baseline object, whenever feasible.

### D. Avoid adding unnecessary complexity
- No refactor of JSON V2, dynamic `state`, assembly graph, world-geometry, scale/depth/collision, undo/redo semantics, add/remove/duplicate behavior, movement, normal game, NPCs or lighting unless correcting a verified regression.
- No new packs/assets, upload capability, arbitrary preview generation from unknown URLs, full-screen library, React framework or generic editor infrastructure.
- The previews/UI live only in the dev-only `?djLayoutEdit=1` flow; `?djEnvPreview=1` and normal gameplay must remain untouched.
- Respect canvas input: panel click should not place anything in the game, world click should not interact with panel. No leaking listeners or temporary canvas objects across scene shutdown.

## 3. Source files to inspect
1. `docs/CURRENT_STATE.md`
2. `docs/PARTY_PRESENCE_DJ_VISUAL_EDITOR_V2_DIRECTION.md`
3. `src/world/dj/djLayoutEditorPanel.js`, `djLayoutEditor.js`, `djEnvironmentCatalog.js`, `djEnvironmentAssets.js`, `djEnvironmentPreview.js`, `djLayoutEditorState.js`, `djLayoutComposition.js`
4. `test/djLayoutEditor.test.js` and catalog/composition tests.

## 4. Acceptance criteria
- On opening editor, creator can clearly see how to browse image-based assets; **no mandatory name-by-name trial**.
- Gallery visibly includes >1 image-based option and an approved asset absent from baseline. Cards have comfortably readable previews.
- Complete sofa and planted-container recipes display actual composed thumbnails matching the placed assemblies.
- Select visual card -> click map -> exact approved prop/recipe appears and remains editable. Esc cancels.
- Existing placed objects can be selected and recognized visually in `Edición`; duplicates remain distinguishable by ID.
- Search, family filter, include-components flag, pan, drag, nudge, groups, depth, add/delete/duplicate, undo/redo, reset and export/import V1/V2 continue to work.
- No change to the JSON schema or normal runtime. No unapproved props.
- Tests cover catalog preview selection, recipe rendering metadata/assembly consistency, panel event isolation and cleanup. `npm test` and `npm run build` pass.
- Engineer does not perform browser/Playwright/screenshot visual QA. Commit + push main with SHA and exact usage directions. Direction performs real in-game visual QA and decides closure.

## 5. Design principle
**The catalog is visual first, text second.** The user sees the actual asset *before* placing it. This is a polish pass on a functioning tool, not a new editor.
