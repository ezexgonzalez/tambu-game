# TAMBU GAME — CONCEPTO A / Perímetro Residencial Moderno
## Asset intake & DJ Editor V2.1 visual trial
**Fecha:** 2026-11-20
**Estado:** DIRECTION APPROVED FOR EDITOR TRIAL ONLY / ART NOT FROZEN / RUNTIME DEFAULT OFF
**Responsable técnico:** Integration Engineer
**Objetivo:** incorporar al repo los 21 sprites finales de `Tambu_Perimetro_Concepto_A_Refinement01(1).zip`, registrarlos en el catálogo de `?djLayoutEdit=1` y permitir composición manual por Dirección. NO integrar un perímetro fijo en gameplay.

### 1. Fuente adjunta imprescindible
El ZIP `Tambu_Perimetro_Concepto_A_Refinement01(1).zip` **no está en GitHub**. El usuario debe adjuntarlo al encargo del Engineer, o el Engineer debe solicitar acceso al archivo fuente exacto; jamás recrear PNGs a partir de vistas previas. No usar `Tambu_Perimetro_Concepto_A_v1(1).zip` ni el pack previo decorativo. Extraer:
- `assets/`: 21 sprites `a_01_..._v2.png` a `a_21_..._v2.png`.
- `asset_manifest.json`: nombres, ID A01–A21, dimensiones, hashes SHA-256, `contactPx`, `originPx`, puertos de encastre, ejemplo de composición y contrato de cierre.
- `README.md` y `production_notes.md`.
- `qa/` evidencia artística/estática, **no QA Phaser**.

Auditoría de Dirección realizada sobre el archivo exacto: 21/21 PNG RGBA, alfa binaria, tamaños y SHA-256 iguales al manifiesto. El README declara 289 pares de conexión horizontal, 5 pares laterales y última fila completa (1680/1680 píxeles) para una composición estática. Esto **no constituye aprobación visual dentro de Phaser**.

### 2. Arquitectura y fuentes de verdad
Leer:
1. `docs/CURRENT_STATE.md`, `docs/README.md`, `docs/ART_DIRECTION.md`, `docs/PIXEL_ART_STYLE_GUIDE.md`, `docs/HUMAN_SCALE.md`.
2. `docs/PARTY_PRESENCE_DJ_VISUAL_EDITOR_V2_DIRECTION.md` y `docs/PARTY_PRESENCE_DJ_VISUAL_LIBRARY_V21_DIRECTION.md`.
3. `src/world/dj/djEnvironmentAssets.js`, `djEnvironmentCatalog.js`, `djLayoutEditor.js`, `djLayoutEditorPanel.js`, `djLayoutThumbnails.js`, `djLayoutEditorState.js`, `djLayoutComposition.js`, `djEnvironmentPreview.js`, `src/world/createPatioWorld.js`.
4. Tests actuales y registros de arte. Partir de último `main` (no del commit histórico 2732508 que figura en el ZIP).

El Concepto A (board visual aprobado por Dirección, entregado previamente) sigue siendo fuente de identidad. El pack Refinement01 es el **único candidato autorizado en este trial**; no alterar sus píxeles ni declarar su arte CLOSED.

### 3. Alcance autorizado
- Incorporar **los 21 PNG originales sin cambios** a una carpeta propia, por ejemplo `public/assets/props/dj_environment/perimeter_concept_a/`. No sobreescribir A/B/C/D ni el kit del perímetro v1.
- Registrar A01–A21 en el asset catalog con IDs distintos de los A/B/C/D existentes (por ejemplo `PA01`–`PA21`), `key` Phaser única, `family: "perimeter"` (o categoría equivalente), etiqueta legible en español, `path`, dimensiones exactas del manifest, `originPx`, `contactPx`, `scale: 1`, hashes del manifest y `depthBehavior` compatible.
- Actualizar `DJ_CATALOG_FAMILIES` para mostrar **Perímetro / Concepto A** en la biblioteca visual. Las 21 piezas deben poder inspeccionarse por imagen en V2.1; permitir agregar, editar, duplicar, ocultar, borrar, ordenar por profundidad, deshacer y exportar.
- Los módulos con puertos compatibles deben poder colocarse **lado a lado sin huecos** y formar un borde inferior continuo. Usar medidas reales refinadas, NO dimensiones v1. Si se requiere un ajuste mínimo de interfaz para facilitar colocación exacta sobre el borde, implementar una ayuda **opt-in sólo para piezas de perímetro** (ej. `Alinear pie a Y=960` y snap horizontal con vecinos en el borde). No crear un editor de física ni un nuevo framework de módulos.
- Importante: si el contrato de puertos no basta para snap seguro, limitarse a colocar con las coordenadas exactas del manifest y documentar cómo efectuar la alineación manual. No fingir que existe un snap que no se implementó. Mantener libre el drag normal.
- Usar las miniaturas reales del PNG V2.1. No recortar del board/mockup ni inventar vistas de assets.
- Mantener los 21 módulos como props de ensayo incluso si aún no se resuelve auto-join. En el JSON V2 deben salir como IDs de instancia estables, posiciones reales, familia/asset, visibility y depth; el proceso de export/import debe conservarlos. Verificar que agregar nuevos IDs al manifest NO rompe importación de layouts anteriores que no usen el nuevo pack.
- Opcional, **solo si aporta al workflow y es barato**: crear un preset de montaje compatible con los puertos del manifest. No componer el perímetro entero por cuenta de Ingeniería; la posición y densidad final pertenecen a Dirección.

### 4. Contrato geométrico real del pack
Mundo actual `1680 × 960`. Los 19 módulos horizontales se apoyan en borde inferior:
- pie visual con `bottomExclusiveY = 960` y última fila visible `y=959`;
- `topLeftY = 960 - imageHeight`;
- módulo siguiente a `x_next = x_current + width_current` sin gaps/solapamiento arbitrario;
- `scale=1.0` (no factor de mockup).
- Los 18 renglones inferiores de cada sprite de borde son opacos; dos filas finales compatibles.
- Las 21 piezas tienen estas dimensiones según manifest: A01 32×26, A02 64×26, A03 32×26, A04 24×52, A05 24×52, A06 32×52, A07 32×42, A08 48×42, A09 64×42, A10 48×42, A11 48×58, A12 32×51, A13 48×42, A14 48×42, A15 24×40, A16 24×40, A17 32×72, A18 32×72, A19 16×32, A20 16×32, A21 32×72.
- Esquinas: A17 (izquierda), A18 (derecha), prolongaciones laterales A19/A20 y retorno A21. Los puertos exactos W/E/N/S son los del manifest, no de esta sinopsis.
- Si el editor no permite colocar al límite y=959 de modo repetible mediante el mouse, usar controles de posicionamiento exacto o una acción de alineación segura, limitada a este tipo de módulo. No forzar Y por sprite con pérdida de encastre.

### 5. Restricciones fuertes
- **Solo biblioteca del editor**: `?djLayoutEdit=1`. El juego normal permanece visualmente idéntico, sin nuevos sprites, luces, NPCs, colliders, colisiones de perímetro ni rutas modificadas.
- No activar por defecto `?djEnvPreview=1` con este pack. Preview de DJ continúa mostrando el baseline salvo autorización posterior.
- No rediseñar Art Director / materiales / vegetación / luz. No poner glows en PNG.
- No reconstruir UI ni migrar JSON V2, no modificar baselines ya aceptadas.
- Las nuevas piezas son **AVAILABLE IN EDITOR FOR MANUAL QA**, no ART APPROVED FINAL ni RUNTIME CLOSED.
- El Integration Engineer NO realiza browser, Playwright ni screenshots; solo validaciones estáticas, tests y build.

### 6. Evidencia exigida y cierre
1. Listar exactamente 21 PNG nuevos y comprobar dimensión, hash y alfa del manifest.
2. Tests: precarga y catálogo, familia `perimeter`, preview real de cada asset, placement con native size, export/import JSON V2, dimensiones para cierre y no regression de layouts previos. Si hay snap, verificar Y=960 exclusiva y contigüidad X para distintos anchos, así como esquinas.
3. `npm test`, `npm run build`; actualizar `docs/CURRENT_STATE.md` a **PACK IN REPO / EDITOR QA PENDING**, no arte congelado.
4. Commit + push a `main`, informar SHA, archivos y pasos exactos de acceso y colocación.
5. Dirección abre editor V2.1, filtra `Perímetro / Concepto A`, compone y valida capturas reales; **no integración fija** antes de esa aprobación.

**STOP:** los 21 sprites reales están registrados y visualmente seleccionables en el editor, las operaciones JSON siguen estables y gameplay normal sigue intacto. A la espera de QA visual de Dirección.
