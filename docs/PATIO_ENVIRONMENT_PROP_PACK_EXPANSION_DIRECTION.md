# TAMBU GAME — PATIO ENVIRONMENT PROP PACK EXPANSION
**Direction:** 2026-11-26
**Status:** DIRECTION APPROVED / ART PRODUCTION AUTHORIZED / INTEGRATION BY SEPARATE HANDOFF
**Scope:** Patio V1 only (1680×960) / visual ambient dressing / editor-first production.

## 1. Product decision
Direction successfully composed the DJ lounge and the approved Concept A residential edge manually with `?djLayoutEdit=1` and saved a working checkpoint. This editor-first workflow replaces the inefficient loop of Engineering guessing prop X/Y locations. Extend **the production pipeline** to all existing patio areas: DJ, pool, bar, house/deck, perimeter and natural transitions. This is not approval to create more maps, alter level geometry, enable decoration in normal gameplay or create a generic all-purpose editor.

**Core workflow:** Art Director produces focused pixel-art packs -> Integration Engineer checks art/manifest and adds them to a visual approved-asset catalog -> Direction places objects in the real in-game patio editor -> Direction exports a reproducible JSON checkpoint -> Engineering persists/activates only after explicit approval.

Prioritize a visually lively, inhabitable party space, not clutter density or asset count.

## 2. Source-of-truth order
1. `docs/CURRENT_STATE.md` and `docs/GAME_DESIGN.md` — V1 scope, protected systems.
2. `docs/ART_DIRECTION.md`, `docs/PIXEL_ART_STYLE_GUIDE.md`, `docs/HUMAN_SCALE.md`, `docs/ASSET_PRODUCTION.md` — pixel art, human scale, night-born palette.
3. Approved assets and running scene in `src/world`, `src/scenes/PatioScene.js`, `src/world/patioLayout.js`.
4. Current DJ editor V2.1 and documented Concept A perimeter; current editable checkpoint `src/world/dj/layouts/dj-direction-working-layout-v1.json`.
5. Direction-approved screenshot(s) of the real game and accepted art for each pack. Never use generic generated pixel-art imagery as literal pixel-density/geometry reference.

## 3. Environment scope and protected regions
Patio is currently 1680×960, with DJ to left, pool central, bar right, house/deck upper. Preserve the architecture and positions, existing interactive NPCs, bathroom event paths, access to bar and house, pool clearance, dance/social circulation, camera zoom=1, Tambu's 32×48 source frame and 1.24 runtime scale. All art must read at native resolution.
- **Poolside**: decorate only available dry circulation-safe space; do not overlap water or pool edge, block paths, or imply a newly accessible/usable area without gameplay approval.
- **Bar**: provide loose furnishing/objects around existing bar and surface props where supports are explicit; do not replace booth, bartender or interaction collider.
- **House/deck/transitions**: embellish appropriate edges and empty corners, not doorways, bathroom entrance, guaranteed routes or fixed furniture.
- **DJ**: current layout is a saved working composition; protect it. New packs may be reused there, but no automatic rewrites/placements.

## 4. Pack roadmap
### PACK P01 — POOLSIDE & SUMMER PARTY (FIRST)
8–12 distinct deployable pieces; priority to objects that convey summer party / used space:
- 1–2 genuinely differentiated modern pool loungers or upright poolside seats, native perspective;
- 1 folded towel on a seat / 1 rolled or draped towel recipe with explicit support;
- a dry-side table with summer drinks, separable/support-defined if needed;
- cooler / icebox with readable volume;
- duffel/pool bag or small belongings cluster;
- a small beach-ball or flotation object if it actually belongs on an accessible location (no new pool-water physics);
- a considered cluster of personal items;
- one additional small accent only if distinct from existing approved catalog.

Do not force all examples into 12 files; coherent visual function beats quotas. No generic loungers disproportionate to Tambu. Any support-mounted cluster must include previewable recipe.

### PACK P02 — BAR & DRINKS (SECOND)
8–12 distinct deployable pieces supporting the existing right-side bar:
- 1–2 compatible outdoor stools/standing-height seats, grouped if appropriate;
- portable cooler, crate, bottle rack or beverage case;
- tray, stacked cups or compact drink staging cluster;
- small bin / service accessory if plausible;
- another distinctive small storage/service prop;
- low-standing decorative ambient accent only if justified.
Avoid duplicates of the existing `C01`, `C02`, DJ tables and lamps. Bottles/cups requiring a surface need explicit attachment/assembly data; no floating items.

### PACK P03 — PATIO ATMOSPHERE & TRANSITIONS (THIRD)
8–12 deployable pieces, composable in DJ/house/deck/bar/pool perimeter:
- variety in warm practical fixtures (actual hardware sprites, no giant baked glow);
- restrained architectural pots / decorative elements not simply more generic plants;
- compact low separators / functional corner treatments;
- one or two curated furniture-adjacent decorative clusters;
- low hardscape / transition object only when compatible with current terrain;
- intentional material/height variations.
Do not recreate Concept A, old rejected hedge/fence, thin repeated planters or fill empty space purely for density.

**For each pack:** the Art Director may propose fewer pieces if strong and sufficient; prioritize ~8–12 useful placements over 30 weak variations. A small set of repeatable art families and precise variants is preferable to bespoke scene-sized compositions.

## 5. Art production contract
- Use the **real screenshot of the current patio** plus existing approved assets; keep camera, geometry, characters, architecture and perspective. Do not regenerate the screenshot as final asset.
- Deliver **individual, original transparent PNGs**, true chunky Tambu-style pixel art, nearest-neighbor, no antialias/blur/photo texture, coherent night palette and shadows. Native resolution, proportion against Tambu and other props. No pre-baked large light spill.
- Provide a compact clear metadata manifest (JSON preferred) with stable pack-prefixed ID, readable Spanish label, path, width/height, origin/contact, intended runtime scale (default 1), depth behavior (ground/feet/host/overhead), single vs multipart, collider intent and intended sector(s), SHA-256 for each PNG. `host` parts must have supported recipes, not loose invalid spawns. Include meaningful reusable preview compositions if supported; no large flattened backdrop.
- Static QC: PNG count, dimensions/alpha, empty transparent margins, join quality if modular, native-scale board with a full-size 32×48 Tambu sprite at 1.24 world scale, and at least one representative arrangement overlay on real game screenshot, clearly marked concept/QA not runtime.
- Treat user-approved official concept boards as locked references when applicable. Distinguish *quality review* from *new aesthetic exploration*. No filler or asset quota padding.
- The first pack should be submitted for Direction review before creating the next. Each pack must be independently useful and possible to integrate.

## 6. Technical/editor contract
**Current reality:** DJ editor already supports world-space 1680×960, dynamic props, visual miniatures and JSON V2; its catalog is `DJ_ENVIRONMENT_ASSETS`, groups `DJ_LAYOUT_GROUPS` use DJ-centric names, and JSON V2 is tightly validated against those names/assets/baseline. **Do not assume it is already a whole-patio editor.**
- Engineer's separate, narrowly scoped task: extend the existing opt-in editor to a **Patio Dressing Composer** without duplicating/replacing code. Catalog supports new pack folders and families, plus clearly labeled destination areas (Poolside, Bar, House/Deck, DJ, Perimeter). Keep placement inside world bounds; guides for routes/door/pool/bar; use actual catalog textures and recipes. Avoid replacing structural map geometry.
- **Do not silently break V2 schema or saved working JSON.** If zone names require structural group changes, implement explicit compatible migration or lightweight new metadata instead. Verify old checkpoint loads bit-for-bit and export/import remains deterministic. Preserve editor-only nature and unmodified normal gameplay.
- Existing image-based library and selection, depth, undo, add/delete/duplicate, bottom edge snap for PA modules, group/individual drag and export/import must remain functional. Do not build a universal engine/Figma/physics editor.
- If creating noncollidable decorator props, mark editor-only visualization and avoid promising gameplay colliders. After final staging, Engineering evaluates actual collisions and activation separately.

## 7. Work stages
1. **NOW:** Art Director starts P01 Poolside & Summer Party; Direction supplies current real screenshot and reviews finished pack. No generic new explorations unless specifically requested.
2. **IN PARALLEL:** Integration Engineer receives separate focused prep request to make gallery/catalog/area labels ready for whole-patio use, without breaking saved layout or enabling default runtime.
3. Engineer integrates each accepted pack to existing editor with QA, then Direction manually composes it and exports a JSON checkpoint after meaningful progress.
4. P02 and P03 follow, independently approved; avoid waiting until all three packs finish.
5. Once visual staging is acceptable, integrate a final exact composition for regular gameplay along with restrained light/collider passes and subsequent social NPC population / ambient sound stage.

## 8. Acceptance
- Art pack is visibly compatible with current game at zoom=1, has individual validated source PNGs and accurate manifest.
- Approved PNGs appear as **correct clear image cards**, can be placed anywhere appropriate in the single current patio, and can be selected and moved; entire compound assets are represented accurately.
- Current saved DJ + Concept A arrangement is not changed or removed. Existing exported JSON remains importable.
- Individual zone composition exports round-trip deterministically; Engineering is never asked to guess approved coordinates.
- Normal gameplay defaults, characters, collisions, routes and protected scene remain unchanged until explicitly approved.
- Direction can build an engaging, complete-feeling patio scene using the editor, not multiple rounds of numeric adjustments.

**STOP:** Stage one is the P01 art pack and a compatible technical preparation; no automatic activation or full V1 release claim.

## 9. Compositor del patio — uso y registro

La preparación del editor está implementada, pendiente de QA manual de Dirección. El checkpoint del DJ y sus assets se conservan tal como están.

1. Abrí el juego con **`?djLayoutEdit=1`**. En **Agregar objetos → Zona del patio**, elegí **DJ / Lounge**, **Piscina / Poolside**, **Barra**, **Casa / Deck** o **Perímetro**. **Todo el patio** muestra la biblioteca completa. La zona filtra sugerencias y propone el grupo para la siguiente alta; no mueve la cámara, no cambia piezas colocadas y no limita el lugar de colocación.
2. Usá **Espacio + arrastre** para recorrer el patio. Elegí una categoría o buscá por nombre, ID o pack. Elegí la tarjeta con preview del PNG real y hacé clic para colocarla. **Agregar al grupo** permite elegir otro destino. En **Edición → Pieza → Grupo de la pieza** se cambia la pertenencia de forma explícita; arrastrar no reclasifica.
3. Activá **Guías y avisos de solapes** para ver estructuras y piscina (coral), puertas, frente de la barra y entrada (lila), rutas al baño (naranja), personajes (celeste) y pista (verde). Los avisos no son bloqueos ni colisiones. En una pieza de perímetro, el botón **Alinear borde inferior** sigue disponible.
4. Usá **Exportar JSON** para guardar cambios y **Importar JSON** para retomarlos. **Restaurar versión guardada** recarga el checkpoint versionado. La selección de zona es una preferencia de la sesión: no se agrega al JSON.

**Compatibilidad:** la versión sigue siendo V2. Los siete grupos históricos son obligatorios y conservan sus IDs, contenido y orden de exportación. El checkpoint sin editar se reexporta byte por byte. Solo una colocación o reasignación a Barra / Casa–Deck crea las claves opcionales `bar-side` / `house-deck`; desde entonces su visibilidad y membresía se guardan en V2. El editor ampliado importa V1, V2 anteriores y los V2 ampliados. Un editor anterior que valide exactamente siete grupos no abre un export nuevo que use grupos opcionales. No se migran ni se mueven piezas existentes automáticamente.

**Registrar un pack aprobado:** incorporar sus PNG versionados a `public/assets/props/<pack>/` e incluir un registro en `PATIO_PROP_PACKS` de `src/world/dj/patioPropPacks.js`. El registro es estático, revisado en repo: ID de pack, mapa opcional `families` (ID → etiqueta), mapa `assets` (ID → metadata del catálogo existente) y mapa opcional `recipes` (ID → receta con `label`, `assetId`, `parts` y, opcionalmente, `sectors`). Cada asset declara `sectors`: `DJ`, `poolside`, `bar`, `deck` o `perimeter`. Para recetas, los miembros siguen el mismo contrato de apoyo, recorte, profundidad y relativo a raíz del catálogo V2.1. Los componentes `host` no se colocan sueltos; se montan con recetas. El catálogo, precarga del editor, thumbnails, plantillas y validador de JSON usan el mismo registro. Los PNG de un pack se cargan al abrir el editor, no en juego normal ni en la preview histórica.

La preparación no registra el pack P01 ni promueve arte: se incorpora en su entrega de integración después de la aprobación de Dirección.
