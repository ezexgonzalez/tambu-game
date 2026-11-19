# Tambu Game — DJ Environment Pack C v1 — Direction QA

**Fecha:** 2026-11-19  
**Entrega:** `Tambu_DJ_Pack_C_v1(1).zip` (archivo adjunto en conversación; PNGs **no incorporados a main**)  
**Veredicto:** **TARGETED CORRECTION PASS — NOT YET ART APPROVED**  
**Scope:** Pack C, iluminación física. No cambiar A/B, NPCs, composición global ni Phaser.

## 1. Validación técnica verificada

- 9 PNG en `assets/`: **8 nuevos, 1 reutilización** de `props/deck/lantern.png` declarada en el handoff.
- 9/9 decodifican, formato RGBA, **alpha 0/255 sin semitransparencias**, márgenes transparentes y contenido no vacío.
- CRC del ZIP completo: **PASS**.
- `asset_manifest.json`: 9/9 archivos/medidas/hashes SHA-256 corresponden a los PNG reales; origins y emission anchors quedan dentro de cada canvas.
- La referencia declarada coincide byte por byte con la captura final `image(4).png` de **1087×1447**, SHA-256 `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418`.
- Incluye QA de 1x con Tambu, mesas Pack A, jardineras Pack B, guirnaldas de 4/6 módulos, emission anchors, referencias y prueba junto al DJ.
- Guirnalda con 3 variantes de cable (flat, slope3, slope7), fijación y bombilla; el QA muestra dos arcos viables; avance contractual de **32 px entre sockets** (no 37 px de ancho PNG) y espejo de cable únicamente al ascender.
- Puntos emisores declarados (canvas px): L01 (9,27), L02 (6,9), L04 (9,13), L05 (7,18), L03-B (5,10). No hay halo extendido en los PNG.
- Ninguna prueba Phaser/world position/collision/depth se ha realizado; correctamente reportado como no integrado.

## 2. Evaluación visual por familia

| ID | Resultado | Decisión |
| --- | --- | --- |
| **L01 farol de suelo** | Buena estructura de metal, capucha, dos caras de vidrio, profundidad y emisión localizada. | **KEEP**, aprobado visualmente como pieza individual |
| **L02 baliza corta** | Silueta estructural y contraste de escala con L01 correctos, pero **ventana de emisión minúscula en zoom 1** respecto del papel que cumple en la referencia. | **TUNE LOCALLY** panel/vidrio, sin agrandar todo el cuerpo |
| **L03-A cable modular y L03-C fijación** | Uniones, curvatura controlada y sockets técnicamente resueltos. | **KEEP** |
| **L03-B bombilla** | En los ensamblajes se lee como un pequeño **bloque cuadrado/mini lámpara**, más que bombilla redondeada cálida colgante del patio moderno de la referencia. | **TARGETED REDESIGN del bulbo solamente**; mantener socket/offset |
| **L04 lámpara de mesa** | Tamaño legible sobre F03/F04/F05, superficie de apoyo plausible, material nocturno y halo excluido. | **KEEP** |
| **L05 farol del deck REUSE** | Reutilización técnicamente válida y coherente con el asset existente del deck, pero su interior tiene un gradiente/suavizado visual fuerte (observación medible: **309 colores RGBA distintos en 329 píxeles opacos**, frente al estilo de color agrupado de los nuevos PNG). | **NO modificar archivo histórico de deck**. Marcar L05 como **EXISTING REUSE CANDIDATE / STYLE EXCEPTION** hasta QA contextual; si da contraste notorio junto al DJ, crear variante local de píxel duro, nunca sobrescribir el original |

## 3. Correction01 — scope estrictamente localizado

**C01 — L03-B BULB SILHOUETTE:** cambiar la forma de vidrio a bombilla cálida legible, con redondez expresada en escalones de píxeles duros, sin antialias ni glows. Conservar punto de fijación local **(5,2)**, punto emisor **(5,10)** y compatibilidad con cables/sockets. No escalar bombilla arbitrariamente ni alterar cables.

**C02 — L02 LIGHT WINDOW:** hacer que el panel cálido de la baliza tenga mejor lectura a tamaño **1×**, aumentado/distribuyendo su superficie emisora solo lo imprescindible dentro del mismo armazón. Mantener **canvas 14×38**, ground anchor **(7,35)** y centro emisor **(6,9)** salvo justificación demostrable, sin subir brillo global.

**C03 — L05 REUSE STYLING:** no reprocesar ni sobrescribir `public/assets/props/deck/lantern.png`; conservar copia idéntica y marcarla como candidato con excepción de estilo. Acompañar una comparativa a 1× L01 vs L05. Dirección puede omitir L05 del diseño DJ final o solicitar reemplazo local más adelante; no es requisito generar un asset extra ahora.

**No cambiar L01, L03-A, L03-C ni L04 sin defecto demostrado.** No regenerar kit completo, no generar halos ni estados OFF.

## 4. Entrega de la corrección

- ZIP completo con 9 PNG, salvo decisión documentada de omitir el candidato L05 del kit; preferir mantener su referencia existente con etiqueta de no aprobación para nueva ubicación.
- Contact sheet, Tambu-scale check, dos ensamblajes de guirnalda, mapa emisor actualizado, compatibilidad con A/B y notas breves de `KEEP/REFINE`.
- Validación PNG/alpha, manifest vs archivos, sockets, anchors, SHA de referencia; sin claims de runtime.
- **STOP** tras entregar correction01. Packs A/B cerrados artísticamente; Pack D pendiente. Ningún NPC nuevo o integración.

## 5. Estado

**A/B — ART APPROVED. C — DELIVERED / TARGETED CORRECTION REQUIRED. D — NOT STARTED.**
Integración solo después de cerrar packs y composición aprobada sobre base limpia. Los ZIPs adjuntos a conversaciones no equivalen a assets publicados en repo.


---

## 6. Correction01 — Direction QA (2026-11-19)

**Entrega inspeccionada:** `Tambu_DJ_Pack_C_Correction01(2).zip` (archivo de conversación, todavía NO subido al repositorio).

**VEREDICTO: PACK C APPROVED FOR ART / L05 EXCLUDED FROM NEW DJ PLACEMENT PENDING STYLE REVIEW.** El pack físico de iluminación se puede cerrar artísticamente sin otra pasada.

### Evidencia verificada

- ZIP completo de 24 entradas pasa CRC; 9 PNG de `assets/` decodifican y tienen `RGBA` con alpha estricta `{0,255}`, contenido no vacío y margen transparente. Coinciden exactamente los 9 paths/dimensiones/SHA-256 del manifiesto.
- Comparación directa contra `Tambu_DJ_Pack_C_v1(1).zip`: SOLO dos PNG modificados. `L02` baliza 23 píxeles cambiados; `L03-B` bombilla 17 píxeles cambiados. Los otros siete PNG son byte-identical, incluido L05.
- `L02`: mismo canvas **14×38**, mismo ground anchor `(7,35)`, emission `(6,9)`; vidrio cálido creció a 5×7, lectura a 1x mejorada manteniendo armazón y alpha.
- `L03-B`: mismo canvas **11×16**, attachment `(5,2)`, emission `(5,10)`; silueta cálida con hombros/base escalonados y forma menos cuadrada. El bulbo mantiene conexiones con cable.
- `L03-A0/A1/A2`, fijación L03-C, farol L01 y mesa L04: intactos y previamente aprobables. Los montajes de guirnaldas de 4/6 módulos se conservan en `qa/05_garland_assemblies.png`.
- `qa/09_glass_before_after.png` documenta a 1x y 5x cambios de material/silueta, sin halo horneado.
- Referencia `1087×1447` y SHA `b77a8380f219d529f2291fc3c03b4d068fbb765a41c0188cf911401a70a3e418` confirmada contra `image(4).png` local; en esta corrección el ZIP **no contiene** copia binaria de esa referencia, sino que la declara y verifica en el manifest/README.

### Decisiones específicas

- **L01, L02, L03 completo, L04: ART APPROVED.** No reabrir por refinamiento cosmético sin un problema claro en escena.
- **L05:** archivo original `public/assets/props/deck/lantern.png` intacto y su copia de Pack C también. **NO APROBADO PARA COLOCACIONES NUEVAS DE DJ POR AHORA**. Es un candidato de reutilización con excepción de estilo, no defecto que bloquee el resto del pack. Reconsiderar opcionalmente al componer; puede omitirse sin fabricar reemplazo.
- La recomendación de escala 1x, anchors, footprints y depth es handoff ilustrativo; **no equivale** a runtime QA. No hay emisiones Phaser, world coords, collisions ni zoom comprobados.

### Next authorized stage

Pack D **minimal drinks and microprops reuse audit**: evaluar primero `props/deck/bottle.png` y `glass.png`, fabricar sólo lo necesario para la referencia. Luego composición controlada con PNG A+B+C+D sobre screenshot limpia, QA Dirección y posterior integración Phaser. **No social NPC pass todavía.**

**State:** PACK A + PACK B + PACK C: ART APPROVED (con excepción L05). PACK D: PENDING. Integración pendiente. No se declara PARTY PRESENCE CLOSED.
