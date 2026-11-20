# Tambu Game — DJ Visual Composition Workflow / Direction Correction

**Direction review:** 2026-11-19  
**State:** DJ VISUAL COMPOSER INTEGRATED / MANUAL TOOL QA REQUIRED / BASE COMPOSITION NOT APPROVED
**Scope:** correcting spatial composition workflow without creating new assets, NPCs or gameplay.

## 1. Diagnosis after manual preview

Direction compared the real `?djEnvPreview=1` full DJ composition (75 placements and 16 front-lip visual clones, 91 images) with the reference image of 1087×1447. **Current screenshot is NOT APPROVED as final environmental composition.** Technically integrated art, valid tests and build are distinct from acceptable scene art direction.

Actual issues observable in the two images:

1. **Lighting gap:** physical lanterns are present but ambient warm lighting onto grass/plants/sofas is not implemented (intentionally deferred); reference contains extensive warm lighting. This is not an asset failure.
2. **Border/vegetation spacing:** three low planters read as distinct rigid identical-height troughs, with sparse foliage, especially at lower edge; left edge has insufficient lush volume compared with reference.
3. **Lounge staging:** sofas/tables exist and preserve identity/scale, but seating/props spacing and supporting greenery do not yet reproduce the intimate landscape composition of the reference.
4. **Uncalibrated screenshot expectations:** target illustration is not a 1:1 world screenshot and cannot dictate exact coordinates or crop. Match spatial relationships, visual density, mood, lighting and playable circulation, not pixel-to-pixel geometry.
5. **Workflow defect:** the Engineer encodes dozens of numeric placements, cannot do visual QA under current no-browser rule; Direction sees screenshot only after commit. More rounds of manual numeric guessing create latency/rework.

**Do not request more pixel art** or micro-tune foliage; packs A–D stay ART APPROVED, with approved corrected V02A. Do not commission another AI-generated mockup.

## 2. New tool: minimal in-game DJ Layout Composer

Replace the previous repeated X/Y guess-and-review workflow with a **purpose-built, dev-only visual layout composer inside Phaser**. It edits *exactly the real scene with real sprites and world coordinates*. This is a production tool, NOT a player UI or full engine editor.

**Required features:**

- Explicit opt-in flag: `?djLayoutEdit=1` (or equally transparent dev-only toggle). Off by default. Ordinary runtime unaffected; `?djEnvPreview=1` remains available for comparison.
- Existing composition loads as baseline. Select **semantic groups** (tree/upper edge, upper lounge, lower lounge, lower border west/middle/east, pool side) and drag/nudge group positions using world-space mouse coordinates, snapping optionally to 1px or 4px. Selection outlines/labels are debug only.
- Selected placement inspection and movement for individuals that need a local correction. Respect parent/child attachment (glass on table, cushions on sofa, plant and pot and foreground lip, guirnalda cables/bulbs, canopy/trunk), or move the entire rooted assembly rather than breaking sockets.
- Ability to hide/restore and (if simple) duplicate a *supported* prop/plant light for dressing, not fabricate assets. New placements use only existing approved catalog keys.
- **Export of deterministic versioned JSON** with final world X/Y and group overrides/additional instances, using an explicit Copy/Export control, plus option to import/paste overrides for revision. No backend, no permanent edit of user files from browser. Export must be consumable by the repository (layout JSON or small JS data layer).
- Previews always use Phaser current real camera and current depth; do NOT apply screenshot 1087x1447 coordinates nor factor 1.65. No alteration of real camera zoom or gameplay.
- Render visual debug guides for protected characters/interaction access/DJ/pool and reserved dance core when enabled. Avoid clutter; togglable guides. Retain collision/routing rules as warnings, not physics changes.
- Correct depth propagation for moved groups and children, including grounds staying below furniture, attached props atop surfaces, pot front lip occluding root. Do not assign depth based on updated world Y to every child independently.
- Imported committed baseline and temporary edits must clean up on scene restart; unsubscribe listeners and avoid leaks.
- Scope the implementation to DJ; reuse minimal helpers for next zones but DO NOT build a universal scene editor, scene graph framework or Figma connector.

**Engineer is not authorized to run a browser, Playwright or produce visual screenshots.** Engineer delivers the tool, tests/build and a concise operator guide, commits to main. **Eze uses it visually** and exports the desired JSON. Next integration pass applies approved JSON rather than inventing placements.

## 3. Lighting boundary and follow-up

The reference's warm light cannot be judged fairly while emission isn't implemented. Do not reopen Pack C. After the layout is approved with composer, implement one **contained warm runtime-light pass** using physical lamp emission anchors, local extent and restrained falloff. No baked halos; no giant bloom; keep characters readable. Lighting pass and collision/activation pass will follow layout QA; do not combine into layout composer unless there is a compelling minimal technical dependency.

## 4. Acceptance criteria for composer

1. A group can be selected, moved, and its children/depth remain correct.
2. An individual supported prop can be nudged without breaking tables/planters.
3. Preview can restore original baseline without altering normal game.
4. Export/import JSON reproduces exact placement deterministically.
5. No full editor feature creep and no gameplay changes.
6. Debug mode default OFF; no global input collisions or leaked listeners.
7. Tests for coordinates/child propagation, depth, export/import, state defaults, cleanup. `npm test` and `npm run build` pass.
8. Engineer commits and pushes main, reports SHA and how Eze enables/uses/export.
9. Direction uses tool to approve grouped positions and fills actual density; only afterward implement lights/colliders and enable decoration by default.

## 5. Protected state

- All A/B/C/D assets and approved V02A remain frozen art.
- No NPC fillers or dancing population until environment QA.
- No rebalancing gameplay, no character edits, no UI changes, no added furniture family.
- Current runtime composition stays **INTEGRATED / VISUAL COMPOSITION CORRECTION REQUIRED**, not CLOSED.

## 6. Guía de uso — Pass 01

1. Agregá **`?djLayoutEdit=1`** a la URL del juego (o **`&djLayoutEdit=1`** si ya tiene otros parámetros). Se abre el patio real con la decoración base y la cámara a 1×. En este modo se pausa la interacción de juego y no se inicia una partida.
2. En **Grupo**, hacé clic sobre una pieza visible o elegí uno de los siete grupos en la lista. Arrastrá desde un sprite del grupo. Para ajustar la selección, usá **Flechas** (1 px) o **Shift + flechas** (8 px). **Esc** deselecciona y conserva los cambios hechos. Para recorrer el patio, mantené **Espacio** y arrastrá el fondo.
3. En **Pieza**, seleccioná por sprite o ID. Si seleccionás un componente montado, se mueve su conjunto: el vaso con la mesa, el sofá con sus almohadones o el macetero con planta y borde. Así se pueden ajustar, por separado, `upper-tropical` y `lower-tropical`. **Ocultar / Mostrar** actúa sobre la selección. Un conjunto oculto se puede seleccionar de nuevo por su ID en la lista.
4. **Guías y avisos de solapes** muestra las estructuras, el espacio de los personajes, la pista reservada y las rutas de baño. Los avisos son orientativos: no bloquean la edición ni crean colisiones. Si movés el árbol/guirnalda, revisá su anclaje al parlante, que permanece fijo.
5. **Exportar JSON** descarga `tambu-dj-layout-v1.json`. **Importar JSON** reproduce un archivo compatible. **Reset** vuelve al layout base. Exportá antes de recargar: el editor no guarda automáticamente ni modifica el repo. Para comparar sin herramientas, abrí `?djEnvPreview=1`; sin flags se abre el juego normal.

### Formato JSON v1

- **`version`**: `1`.
- **`groups`**: los siete IDs estables, con desplazamientos `dx`, `dy` enteros respecto a la base. IDs: `upper-dj-edge`, `upper-lounge`, `lower-lounge`, `lower-border-west`, `lower-border-middle`, `lower-border-east`, `pool-side`.
- **`overrides`**: desplazamientos `dx`, `dy` adicionales por ID raíz de conjunto (p. ej. `lower-tropical`). Puede estar vacío. Tanto grupos como overrides admiten `visible: false`; se omite cuando es verdadero.
- **`objects`**: todos los IDs, incluidos los componentes montados y labios, con coordenadas enteras **`x`, `y` del borde superior izquierdo del PNG** en el mundo, y `visible: false` si están ocultos. La posición resulta de sumar base, grupo y override. La profundidad se deriva de la base: se conserva el plano de la alfombra y el orden de los apoyos.

Al importar se verifican versión, IDs, límites del mundo y que las posiciones coincidan con los desplazamientos. Un archivo inválido no borra la edición. Pasá el JSON exportado completo a Integración cuando apruebes la composición; el editor tampoco duplica piezas en Pass 01.

**Verificación de ingeniería:** 288/288 tests; build OK (aviso de Vite por tamaño del bundle). Sin browser ni screenshots. Pendiente: validación manual de Dirección y entrega del JSON aprobado.
