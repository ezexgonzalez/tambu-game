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
