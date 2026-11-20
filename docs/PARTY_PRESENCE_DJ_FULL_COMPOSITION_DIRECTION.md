# TAMBU GAME — DJ Environment Full Controlled Composition Pass

**Fecha:** 2026-11-19  
**Estado:** DJ FULL ENVIRONMENT COMPOSITION — BASE INTEGRATED / NOT APPROVED AS FINAL
**Scope:** composición final **de objetos ambientales**, no NPCs ni nueva arquitectura.

La composición de este documento es la base histórica de la preview. Para ajustar el layout, usar el [editor visual](PARTY_PRESENCE_DJ_VISUAL_COMPOSITION_WORKFLOW.md#6-guía-de-uso--pass-01).

## Resultado aprobado y decisión

Dirección inspeccionó captura real del prototipo `?djEnvPreview=1`: **sofá, mesa, bebidas, alfombra, lámpara y arquitectura general con escala aceptada para continuar**. Un único defecto relevante: V02A tropical wide tenía hojas demasiado finas frente a las plantas gruesas de las ventanas del juego. Dirección recibió nueva V02A y **la aprobó sin más microcorrecciones**. No volver a producir ni pulir ese sprite. Esto cierra la escala general como **BASELINE MANUAL APPROVED FOR CONTINUATION**, no declara colliders/lights/whole zone runtime cerrados.

Asset aprobado V02A: `dj_plant_tropical_wide_v1.png`, **80×67 RGBA**, alpha {0,255}, SHA-256 `99d1f76301cf4396fd34ef7b7e0fb4ee751ca4c949f71997baf68d441782c6aa`. El PNG del ZIP `TAMBU_DJ_V02A_APPROVED_REPLACEMENT.zip` reemplaza por bytes a `public/assets/props/dj_environment/vegetation/dj_plant_tropical_wide_v1.png`. Se verificaron dimensiones, RGBA, alpha binaria y SHA-256, también registrado en `djEnvironmentAssets.js`. Se conservaron escala 1.0, origin/contact (40,65), inserción de raíz y macetero. Es el único PNG modificado.

## Dirección aprobada: composición por sectores

No crear otra imagen IA ni recrear el mockup como suelo. Utilizar los **PNG reales ya integrados** en main, referencia ambiental final de **1087×1447** como target de relación/ambientación (no coordenadas), y geometría vigente de `PATIO_LAYOUT` (mundo 1680×960, DJ, piscina, casa, bar, rutas).

**Entregable de esta pasada:** un layout declarativo de placements de entorno, renderizado detrás de un **flag opt-in** para validación de la composición completa. El flag actual de scale prototype `?djEnvPreview=1` debe reemplazarse o reutilizarse para mostrar la nueva composición SIN dejar el prototipo de calibración duplicado. Documentar exactamente cómo habilitarla. **Default OFF** hasta QA visual de Dirección.

### Zonas y relación compositiva

1. **Borde izquierdo superior junto al DJ**: árbol ornamental en esquina o zona lateral si la geometría real lo permite, vegetación y guirnalda con anclajes físicos existentes; mesa alta F05 con botellas/vasos. No alterar DJ/booth.
2. **Borde izquierdo medio**: lounge compacto con sofá F01, mesa F03, F06 pouf, cojines F02, macetero(s) V06 + V02 y luces L01/L04. 
3. **Borde izquierdo inferior**: lounge más amplio F01, mesa baja F04, alfombra F07, props C01/C02, V08 y vegetación de transición. 
4. **Borde inferior de sector**: tres agrupaciones paisajísticas de V07 modular + V04/V05/V09 y L02, con **pausas**, siluetas diferentes y sin barrera continua/cerca/collider lineal. Tomar el borde de la ZONA, no pintar una pared uniforme por todo el mapa.
5. **Lateral de piscina/derecha de este sector**: vegetación/maceteros y faroles puntuales que NO cubran agua ni borde, ni bloqueen caminos e interacciones.
6. **Centro / dance core futuro**: mantener libre para Social Population Pass. **No agregar NPCs** y no usar muebles para llenar negative space.

La referencia ilustra intención y densidades, no dicta cantidades obligatorias. Todos los props se colocan con criterio por tramo, respetando espacios y rutas. L05 deck lantern **EXCLUIDO** de nuevas colocaciones DJ hasta revisión posterior, puede omitirse.

### Ingeniería prevista

- Un `src/world/dj/djEnvironmentLayout.js` declarativo con IDs por instancia, sector, assetId(s), world x/y, origin, scale, relationship/depth y role (ground/structure/surface/foliage/light).
- Un renderer/preloader pequeño reutiliza `djEnvironmentAssets.js` y su metadata, mantiene módulos y soportes reales, agrupa lounge y maceteros cuando corresponda y respeta front lip/soil. Sin duplicar keys/cambiar bits de assets.
- Reusar o refactorizar lo mínimo de `djEnvironmentPreview.js`, **sin tener dos composiciones superpuestas**. El prototipo anterior puede conservarse en código como calibración solo si activarlo es distinto y documentado, pero la ruta común de preview muestra el layout nuevo.
- Scale base **1.0 nativa** salvo motivo local claramente justificado, no `1.65` ilustrativo ni conversión directa de pixeles de captura.
- Profundidad por pies/contactos para sofá, faroles/macetas/árbol; arbustos y copas pueden usar reglas host/foreground adecuadas. Alfombra siempre suelo; bebidas/lámparas sobre mesas según contactos y depth relativo a superficie. Evitar rectángulos colliders por tamaño total de sprite.
- **NO colisiones definitivas ni iluminación ambiental completa en esta pasada:** prioridad a placement visual total y evitar regresiones. Guardar candidatos de footprints/emission anchors como datos; luego en fase de activación se harán físicos/lighting después del QA de composición.
- Guirnaldas a partir de cables/bombillas reales del Pack C; sin inventar truss/soportes y sin cables flotantes. Si no existe punto de fijación sensato en patio real, omitir esa instancia temporalmente y reportarlo.
- No refactorizar HUD, audio, caracteres, Bathroom Event/Resistance, Player, camera/world bounds ni UI.
- No redistribuir Uriel, Santy, Sofi, Thiago, Tobi; preserve interacciones visibles, camino entre DJ/piscina y rutas. No introducir NPC fillers.
- No editor drag/drop, no Playwright, no browser/screenshot por Engineer.
- Crear tests de IDs y paths, bounds/constraints, composición modular, ausencia de solapes incompatibles comprobables con geometría, orden de depth y cleanup. `npm test`, `npm run build`.
- Commit + push directo a main con estado **DJ FULL ENVIRONMENT COMPOSITION — INTEGRATED / MANUAL VISUAL QA REQUIRED**, flag preview default OFF. Reportar coordenadas/sectores, omitidos y SHA.

## QA de Dirección

Dirección activará el flag, observará zona completa en captura real y dará APPROVED o una **correction pass de coordenadas/oclusiones/escala**. No reabrir arte completo por detalles mínimos. Tras aprobar composición: siguiente encargo focalizado para **colliders + luces runtime + activación definitiva**, y luego **Social Zone NPC Pass**. No declarar entorno cerrado en esta pasada.

## Regla de eficiencia

Alcance único, una implementación completa de layout y una ronda de QA visual global: no multiplicar micro-passes. Respeto a las piezas ya aprobadas y la decisión del creador de priorizar avanzar.

## Entrega de integración

Abrir el juego con **`?djEnvPreview=1`** al final de la URL (o **`&djEnvPreview=1`** si ya tiene parámetros) e ir al sector izquierdo del patio. Quitar el parámetro y recargar devuelve la vista habitual. El flag ahora muestra una única composición, en lugar del conjunto de calibración anterior.

El [layout declarativo](../src/world/dj/djEnvironmentLayout.js) registra la posición world de cada instancia, su asset, sector, escala, depth y soporte local donde aplica. **75 piezas + 16 recortes de labio** de las mismas texturas = **91 imágenes** de preview, todas a **1×**. No se agregaron PNG de labios ni se duplicó la botella del deck.

| Sector | Imágenes (recortes incluidos) | Anclajes de mundo | Assets |
| --- | ---: | --- | --- |
| Borde superior izquierdo | 17 | Árbol a pies (80,307); guirnalda (52,258) → (116,268); pie de mesa alta (147,436); farol (100,355); V02A en macetero a (44,412). | V01 tronco/copa, V03B, V06A, V02A, F05, C01/C02, L01, L03-A1/A2/B/C, L04 |
| Lounge superior | 15 | Esquina de contenido del sofá (28,466); pie de mesa (163,639); pouf (117,695); macetero (44,686). | F01a/c/d/e, F02a, F03, F06, V06A, V02B, V08, V09B, C02, L01/L04 |
| Lounge inferior | 20 | Esquina de contenido del sofá (16,724); alfombra centrada en (172,874); pie de mesa (180,891); maceteros (292,821) y (46,930). | F01a–e, F02a/b, F04, F07, V09A, V06A/B, V04B, V02A, C01/C02, L01/L04 |
| Borde inferior | 32 | Orígenes de contenido V07: (28,927), (210,914), (398,925); balizas (198,951) y (384,949); remate con macetero (584,939) y farol (568,952), al sur de la piscina. | V07 izq./centro/der., V04A/B, V05A/B, V03A, V09B, V06A, V02B, L01/L02 |
| Lateral de piscina | 7 | Maceteros a (460,370) y (474,482); baliza a (492,579), por fuera del borde. | V06A/B, V02B, V03A, L02 |
| Pista central | 0 | Queda libre de decoración para circulación y futura población. | — |

Se usan **39 IDs del catálogo** (38 PNG del kit y C01 reutilizado). El tramo recto **L03-A0** no se precarga: el vano usa los tramos inclinados A2 y A1, con bombillas en píxeles de cable y clips sobre una rama y el lateral del parlante. Se omitió un segundo vano: no se agregó un soporte nuevo. **L05** sigue fuera de la composición; su uso existente en el deck no cambia. **C03** quedó fuera del Pack D.

Los módulos de sofá conservan sus uniones y depth por contacto. Los props se apoyan en las tapas y se ordenan desde atrás hacia adelante; el follaje queda entre el recipiente y el recorte de su borde frontal. La alfombra queda en el plano del suelo. Las tres jardineras tienen vegetación diferente y pausas entre módulos. Los anchors de emisión y footprints sugeridos quedan en el catálogo, sin luces, halos ni colisiones nuevas.

**Validación:** `npm test` 277/277, sin fallos ni saltos; `npm run build` OK (Vite advierte por tamaño del chunk principal). Los tests cubren IDs/texturas, bounds, rutas y espacios protegidos, uniones, apoyos y depth, flag, shutdown y restart. Sin validación en navegador por Ingeniería.

**QA pendiente por Dirección:** verificar lectura conjunta de los seis sectores, oclusión junto al DJ y la piscina, apoyos/costuras y espacio de circulación con Tambu. Después de aprobar la composición se evaluarán colisiones, iluminación y activación. La población social queda para una pasada posterior.
