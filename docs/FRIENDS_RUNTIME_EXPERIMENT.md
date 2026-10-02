# Friends Runtime Experiment

Estado: integrado técnicamente; **VISUAL QA REQUIRED**. Actualizado 2026-09-28.

## Alcance

Este pase integra Tobi, Pitity, Eze y Santy a partir de sus masters grandes aprobados. Uriel y Thiago conservan el placeholder procedural. Se mantienen sus posiciones actuales.

## Runtime

| Personaje | Atlas walk | Idle down | Posición |
|---|---|---|---|
| Eze | `friend_eze_atlas_v1.png` | `friend_eze_idle_down_atlas_v1.png` | `(1215, 470)` |
| Pitity | `friend_pitity_atlas_v1.png` | `friend_pitity_idle_down_atlas_v1.png` | `(1270, 500)` |
| Santy | `friend_santy_atlas_v1.png` | `friend_santy_idle_down_atlas_v1.png` | `(380, 390)` |
| Tobi | `friend_tobi_atlas_v1.png` | `friend_tobi_idle_down_atlas_v1.png` | `(470, 835)` |

Special idles integrados al momento de esta actualización:

- Pitity: blink + phone-check down.
- Tobi: drink + arms-crossed down, con atlas reemplazados/corregidos para seguir su idle manual.
- Eze: sin specials integrados.
- Santy: sin specials integrados todavía. Dirección aprobó tres atlas listos para integración: `friend_santy_blink_down_atlas_v1.png` (5 frames), `friend_santy_phone_check_down_atlas_v1.png` (8 frames) y `friend_santy_drink_down_atlas_v1.png` (8 frames). La animación de baile queda deferida.
- **Tobi blink no está integrado** y no debe asumirse como parte del paquete actual.

Los walk sheets usan 12 frames en grilla 3×4, cada frame de 32×48 px. Las filas son down/left/right/up; las columnas son paso/neutral/paso. Escala 1.24 y depth por pies con offset 30, siguiendo la familia humana actual. Idle down usa una única pose neutral aprobada del master runtime, para mantener quietud sin movimiento corporal artificial.

## Procedencia, baseline y normalización

Los masters grandes siguen siendo la fuente de verdad de **identidad, outfit, silueta y actuación**. Durante el QA de amigos, varios idle down runtime fueron corregidos manualmente a nivel de píxel; esas correcciones mejoraron de forma visible la continuidad de los atlas derivados.

Regla vigente:

- el master grande responde **quién es / cómo se mueve** el personaje;
- el idle runtime manualmente aprobado responde **cómo se ve exactamente a 32×48**;
- cualquier special posterior debe conservar durante **todos sus frames** la cara, pelo, paleta, outlines y geometría estable de ese idle, no solamente copiar el primer/último neutral;
- si una región no participa de la acción, debe conservar los píxeles aprobados siempre que sea posible;
- generar/corregir una animación por vez es preferible a batches cuando aparecen errores de anatomía o identidad.

La normalización elimina fondos, alinea pies y conserva `32x48` con nearest-neighbor. Los assets runtime viven en `public/assets/characters/friends/`.

La integración técnica no certifica fidelidad final. Antes de congelar cada amigo, Eze valida a zoom 1: identidad, cara frame a frame, baseline de pies, alpha, depth, escala y transición idle ↔ special. Un asset compilando no equivale a asset aprobado.
