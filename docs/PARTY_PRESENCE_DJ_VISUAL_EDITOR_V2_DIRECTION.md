# TAMBU GAME — DJ Visual Environment Editor V2
**Direction:** 2026-11-20
**Status:** V2 INTEGRATED / MANUAL TOOL QA REQUIRED / COMPOSITION NOT APPROVED
**Scope:** dev-only DJ environmental composition editor. No changes to normal gameplay or to approved art.

## 1. Product decision and why now
Direction has manually tried the initial `?djLayoutEdit=1` tool and verified its usefulness: moving real props in the real camera is far more productive than serial coordinate guessing by Engineering. However, the V1 state model and controller only support moving/toggling the immutable baseline placements, and rendering assumes a fixed array of images. This blocks creative composition.

V2 makes the editor a small, visual **approved-prop library + composition tool**, so Direction can place and recompose the DJ environment itself. It is still a limited, opt-in developer workflow inside the existing Phaser scene, **not** a universal engine editor, external web app, upload manager or gameplay feature.

## 2. Sources and protected baselines
Read, in this order:
1. `docs/CURRENT_STATE.md`, `docs/README.md`, `docs/GAME_DESIGN.md`.
2. `docs/PARTY_PRESENCE_DJ_VISUAL_COMPOSITION_WORKFLOW.md`, `docs/PARTY_PRESENCE_DJ_FULL_COMPOSITION_DIRECTION.md`, `docs/PARTY_PRESENCE_DJ_ASSET_MANIFEST.md`.
3. `docs/ART_DIRECTION.md`, `docs/PIXEL_ART_STYLE_GUIDE.md`, `docs/HUMAN_SCALE.md`, `docs/UI_DIRECTION.md` (only if touching editor's DOM styling).
4. `src/world/dj/djEnvironmentAssets.js`, `djEnvironmentLayout.js`, `djEnvironmentPreview.js`, `djLayoutEditor.js`, `djLayoutEditorState.js`, `djLayoutEditorGuides.js`, `src/world/createPatioWorld.js`, `src/scenes/PatioScene.js` and tests.

Protect every approved A/B/C/D PNG (including V02A), Tambu and friends/women assets, architecture (DJ, pool, deck, house, bar, grass), world scale/camera, interaction, routes, collisions, bathroom systems, audio and UI. The existing 75 DJ environment placement records and 16 front-lip images remain the **starting baseline**, not an approved final composition. The editor and decoration remain OFF by default in the ordinary game.

## 3. Editor UX, scoped to DJ
- Keep `?djLayoutEdit=1`, real Phaser world-space drag, pan, guides, group/individual selection, arrow nudge, existing selection behaviors, import/export/reset and opt-in `?djEnvPreview=1`.
- Add a clear compact, collapsible side-panel **Biblioteca** tab or mode that displays actual PNG miniatures (pixelated/nearest-neighbor, transparent background) from the repo's approved catalog. Group by `family` (furniture / vegetation / lighting / drinks, extensible via metadata), allow text search, readable names and asset ID. Do not display arbitrary unapproved/historical props.
- **Add:** click/select an approved placeable asset then click an unoccupied or desired world point to insert it. Immediately select it for precise drag/nudge. Show a ghost placement if easily supported; it is optional. Placement starts at the catalog's native scale, using declared contact point/origin. New placement must use a stable, unique, serializable ID; repeated assets are allowed.
- **Duplicate:** duplicate a selected independent placement or complete supported assembly, retaining relative member offsets, crops, support and depth. Duplicates can be moved independently; stable IDs.
- **Delete:** remove a selected DJ environment placement/assembly from the editable scene and export. Baseline removals must be represented explicitly rather than deleting asset files or changing immutable baseline data. Children must not be orphaned. Keep **Hide/Show** separate from Delete. No destructive impact on other runtime/world structures.
- **Selection/list:** selectable dynamic objects appear in the existing piece selector, searchable/usable by their instance ID. On-canvas click and panel selection remain synchronized. Group moving also moves newly placed members assigned to that group.
- **Undo/Redo** for adds, deletes, moves, duplicate, visibility, group moves, depth and reset, with simple bounded in-memory history. Keyboard shortcuts only when focus is outside inputs, selects and other editable controls.
- Avoid a panel that obscures the world. Scrolling and compact collapse must work at regular desktop viewport sizes; DOM controls remain editor-only.

## 4. Assembly and approved-catalog integrity
- `DJ_ENVIRONMENT_ASSETS` is the **only authoritative approved asset catalog** for this pass; as of direction review it has 40 asset IDs and four families. V2 must make all eligible, registered assets available even if not used by the current baseline; preload editor-only textures so selecting an unused entry works.
- Some entries are components (tree canopy, pot lips, modular sofa/jardiniere segments, support-only decorations). Do **not** treat pieces with required attachment as safely freestanding by default. Introduce minimal `placeable`/attachment metadata or a small set of approved assembly recipes to distinguish standalone entries, support-only items and reusable complete presets.
- At minimum, **duplicating existing composed assemblies** must work without breaking parent/mount relationships. When adding a compound prop from a catalog preset, create all its component sprites as a single rooted assembly with correct baseline relationship (pot + foliage + front lip where applicable).
- New future art packs become usable by **explicitly registering approved assets and optional assembly recipes** in this catalog/manifest, not by editing the UI's hardcoded options or copying PNGs into random directories. Do not auto-scan or offer unapproved files.
- For objects such as drinks/cushions that normally require a host surface, support valid standalone editing only when visually coherent; otherwise offer a rooted preset or attach to an allowed host socket. Do not silently break support/depth. Any narrower supported set must be described precisely in operator docs.

## 5. Depth and ordering
- Provide an easy-to-understand **Profundidad** control for the selected DJ prop/assembly: `Automática`, `Adelante`, `Atrás`, and `Restablecer`; display the applied layer/depth value or offset.
- `Automática` must preserve floor-depth behavior based on ground/contact Y for freestanding objects, `ground` for rugs, and inherited relative depth for mounted children/front lips. Moving a rooted object recomputes its auto depth.
- `Adelante/Atrás` modify a **deterministic, serialized bounded depth override/offset** relative to a well-defined base layer, not a one-off DOM/image index, and can be applied repeatedly to resolve actual overlaps. Keep existing parent-child sublayer precedence. Do not use blanket giant depth values that unintentionally cover Tambu, dialogue, or protected structures.
- Preserve crop on lip sprites, joint ordering, table surface props, depth of ground rugs, and front-lip occlusion when duplicating/moving/adjusting layers. Warn when depth overrides cross protected rules or when a placed instance risks occluding a protected path/interaction.
- The visual preview in edit mode must match the deterministic render that will be used after integration. Engineering does not certify aesthetic correctness; Direction performs visual QA.

## 6. State model and deterministic handoff
The existing `djLayoutEditorState.js` works from an immutable baseline with `groupOffsets`, `overrides` and a V1 export listing those immutable objects. **Redesign incrementally to support dynamic instance add/remove/reorder**, preserving baseline and V1 compatibility.

- Adopt JSON **schema version 2** (suggested filename `tambu-dj-layout-v2.json`). Export the **entire effective composition** with stable placement IDs; catalog asset IDs, world coordinates, group, visible, effective depth/depth offset, scale, assembly/parent references and optional crop/support anchors as needed to reproduce exact visuals. Record baseline revision and/or manifest fingerprint so the Integration Engineer can detect mismatched assets. A compact diff is acceptable only if accompanied by a complete deterministic resolved representation.
- Record removed baseline objects/assemblies unambiguously; dropping a new instance should not leave ghost sprites. Do not mutate original PNGs or hard-code current camera screenshot coordinates.
- **Import/export round-trip must be pixel-identical in state**: existing baseline + new objects + deletions + depth + group associations + visibility + assembly links. Validate version, source/asset IDs, unique IDs, required fields, finite integer positions, bounds, assembly acyclicity, parent presence, depth limits and consistency; reject invalid files atomically (keep previous edit).
- **Import legacy schema V1** from current editor, preserving existing positions, visibility and groups; save again as V2. Do not silently lose V1 work.
- Export/import remain manual browser-local downloads/uploads, no backend. After import, the user can continue editing.
- Document a small, explicit **Integration Handoff Contract**: Engineer receives V2 JSON, checks manifest/baseline, applies exact instance data and relative depth/assembly relationships to runtime. Engineer must not reinterpret positioning or fill empty space independently.
- Rendering can no longer assume `images[index]` corresponds forever to immutable `baseline[index]`; manage live sprites by stable placement ID and perform create/update/destroy on state changes. Do not leak textures, event handlers, DOM nodes, or orphan assembly sprites after reset/import/scene shutdown.

## 7. Non-goals
- No universal multi-map scene editor, sophisticated grouping tool, free-form sprite slicing, arbitrary file uploads, rotated/flipped sprites, arbitrary scaling, physics editor, collider authoring or light simulator.
- No creating new art, random props or NPCs in this engineering pass.
- No changes to core gameplay state, UI, player movement, original architecture, route/collider contracts or existing approved assets.
- No decoration enabled by default. Do not implement illumination or new collider/activation pass until Direction approves an exported composition.
- Engineer MUST NOT run browser, Playwright, DevTools, automated screenshots or claim manual visual QA.

## 8. Acceptance gates and delivery
1. Open editor opt-in; existing base, pan, group/individual drag, native scale, guides and V1 workflow remain correct.
2. Catalog shows thumbnails of eligible registered assets with search/categories; includes an eligible approved asset not used in baseline.
3. Add two copies of the same asset in distinct positions; select, drag, nudge, duplicate, hide, delete and restore through Undo/Redo without changing other props.
4. Duplicate/move/delete existing *compound* planter or sofa while correct child placement/crop/depth survives.
5. Change manual depth front/back, reset auto, move object and confirm depth is deterministic.
6. Move a group containing a newly added prop and verify member moves along with baseline.
7. Export V2, reset, import V2 and get identical IDs, positions, visibility, depth and assembly state. Import current valid V1 JSON, export V2 without loss. Reject invalid JSON atomically.
8. Normal game without flags remains unaffected. No new collisions, NPCs or lighting. Stop/retry and scene shutdown leave no leaked objects/listeners.
9. Run `npm test` and `npm run build`; add focused automated tests for catalog eligibility, state operations, ordering, JSON round trip/migration and lifecycle. Report test/build results, risks, changed paths and SHA.
10. Commit and push `main` on completed implementation, without falsely marking visual composition CLOSED; deliver concise usage instructions. **Manual visual tool QA and composition QA are Direction's gate**.

## 9. Sequencing
One implementation task may be divided internally into (A) dynamic model / schema and import migration, (B) catalog and create/delete/duplicate UI, (C) manual depth / history and polish, (D) tests/build/docs. Avoid tangential refactor. If implementing all features safely requires splitting the work, finish a coherent testable V2 editor feature set rather than half-working buttons.

**Post-V2 design workflow:** Art Director delivers small approved asset kits + manifests -> Engineer registers/catalogues assets only when necessary -> Direction dresses scene by hand -> Direction exports approved V2 JSON -> Engineer integrates *exact* layout -> visual QA -> minimal lighting/colliders -> separate social population pass.

## 10. Guía de uso y entrega

1. Abrí la URL del juego con **`?djLayoutEdit=1`** (o **`&djLayoutEdit=1`** si ya tiene parámetros). Conserva el layout inicial en el patio real a 1×. Usá **Plegar** para despejar la vista y **Espacio + arrastre** para desplazar la cámara.
2. En **Biblioteca**, buscá por nombre o ID y filtrá por categoría. Elegí el grupo de destino, seleccioná una miniatura y hacé clic en el patio donde quieras apoyar el objeto. La pieza queda seleccionada para moverla. Para agregar otra copia, repetí el proceso o usá **Duplicar**.
3. En **Edición**, usá **Grupo** para mover un sector o **Pieza** para ajustar un objeto o conjunto. Seleccioná por clic en el mundo o buscá por nombre/ID. Arrastrá o usá **Flechas** (1 px) y **Shift + flechas** (8 px). Con **Esc** cancelás una colocación pendiente o deseleccionás sin perder los cambios. Cambiar el grupo de una pieza no la desplaza.
4. **Duplicar** copia el conjunto completo con IDs nuevos. **Eliminar** (o **Supr**) saca la pieza y sus miembros; **Ocultar/Mostrar** mantiene la instancia y actúa también sobre grupos. Las piezas ocultas se pueden seleccionar por ID. Si un grupo está oculto, mostrar una pieza de ese grupo no vuelve visible al grupo.
5. **Adelante/Atrás** aplica ±4 al orden por contacto, hasta un máximo de ±32. La alfombra ajusta en pasos de 0,04 dentro de su capa de suelo (±0,32). **Restablecer auto** vuelve al orden por apoyo; mesa, vasos, planta, macetero y labios conservan sus subcapas. **Guías y avisos de solapes** señala zonas protegidas; no aplica física.
6. **Deshacer/Rehacer** guarda hasta 50 operaciones en memoria; cada arrastre completo cuenta como una. Atajos: **Ctrl/Cmd + Z** y **Ctrl/Cmd + Shift + Z** (también **Ctrl/Cmd + Y** para rehacer). Los atajos se ignoran al editar campos. **Reset** restaura la base y se puede deshacer.
7. **Exportar JSON** descarga `tambu-dj-layout-v2.json`. Guardalo antes de recargar. **Importar JSON** abre V2 o migra un V1 válido conservando la colocación y visibilidad. Si la validación falla, tu composición queda intacta. Los cambios sólo se guardan en el archivo que descargás.

**Alcance de la Biblioteca:** el catálogo contiene 40 entradas aprobadas entre las cuatro familias, 17 colocables de forma independiente. La vista inicial muestra esas piezas y nueve conjuntos. **Ver componentes** incluye miniaturas de piezas que necesitan soporte. Botellas, vasos y lámparas de mesa se pueden usar en **Mesa baja servida** o duplicando una mesa que ya los contiene; los cojines, en sofás completos; la copa del árbol, en conjuntos de árbol; y las tropicales, en sus maceteros. El cable recto `L03-A0`, que no está en la base, está disponible en **Árbol con guirnalda recta**. Esta pasada no ofrece un editor de anclajes internos ni permite subir PNG. Las nuevas familias entran registrando cada PNG aprobado, su hash, geometría, nombre, familia y `placeable` en `djEnvironmentAssets.js`, y opcionalmente su receta en `djEnvironmentCatalog.js`. No hay que modificar las opciones de la UI.

### Contrato de entrega de Integración

Entregar el **JSON V2 completo**, con estos campos:

| Campo | Contenido |
| --- | --- |
| `version` | `2`. |
| `baselineRevision` | SHA que identifica la base del editor. |
| `manifest` | IDs de los assets usados → SHA-256 del PNG. |
| `groups` y `instances` | Visibilidad por grupo; ID raíz, origen (base, asset o receta), grupo, posición absoluta, visibilidad propia y offset de depth por instancia. |
| `removedBaseline` | IDs de todas las partes de base eliminadas explícitamente. |
| `placements` | Representación completa resultante: IDs, referencias de asset, coordenadas de la esquina superior izquierda en píxeles de mundo, escala, visibilidad efectiva, profundidad automática, offset, profundidad efectiva y `renderDepth` para empates; referencias a raíz, ensamblaje, soporte, crop y anclaje cuando corresponda. |

El lector `readDjLayout` valida revisión y manifest comparando el archivo con los miembros y relaciones que resuelve el catálogo. Rechaza IDs desconocidos o repetidos, enlaces inconsistentes, posiciones que no encajan en el mapa, profundidad fuera de rango y archivos de más de 512 imágenes (contando subcapas). Para integrar un layout aprobado, usar las colocaciones de `resolveDjComposition(readDjLayout(json))` con `createDjEnvironmentComposition`; respetar `renderDepth` y el catálogo sin reinterpretar posiciones ni reponer elementos eliminados. Esta pasada no aplica ningún export al juego normal.

**Validación:** `npm test` 297/297; `npm run build` OK, con aviso de tamaño del bundle de Vite. Sin navegador ni capturas por Ingeniería. Estado: **MANUAL TOOL QA REQUIRED**. Probar altas, duplicado de un macetero y un sofá, orden contra otros props y Tambu, undo/redo y export/import antes de aprobar una composición. `?djEnvPreview=1` conserva la base sin edición.
