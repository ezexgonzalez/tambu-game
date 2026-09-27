# Friends Runtime Experiment

Estado: integrado técnicamente; **VISUAL QA REQUIRED**.

## Alcance

Este pase integra Tobi, Pitity, Eze y Santy a partir de sus masters grandes aprobados. Uriel y Thiago conservan el placeholder procedural. Se mantienen sus posiciones actuales.

## Runtime

| Personaje | Atlas walk | Idle down | Posición |
|---|---|---|---|
| Eze | `friend_eze_atlas_v1.png` | `friend_eze_idle_down_atlas_v1.png` | `(1215, 470)` |
| Pitity | `friend_pitity_atlas_v1.png` | `friend_pitity_idle_down_atlas_v1.png` | `(1270, 500)` |
| Santy | `friend_santy_atlas_v1.png` | `friend_santy_idle_down_atlas_v1.png` | `(380, 390)` |
| Tobi | `friend_tobi_atlas_v1.png` | `friend_tobi_idle_down_atlas_v1.png` | `(470, 835)` |

Los walk sheets usan 12 frames en grilla 3×4, cada frame de 32×48 px. Las filas son down/left/right/up; las columnas son paso/neutral/paso. Escala 1.24 y depth por pies con offset 30, siguiendo la familia humana actual. Idle down usa una única pose neutral aprobada del master runtime, para mantener quietud sin movimiento corporal artificial.

## Procedencia y normalización

Cada master adjunto fue usado como referencia primaria para generar la hoja del personaje correspondiente. La pasada de normalización recortó las celdas, eliminó el fondo en el canal alpha, alineó los pies y llevó cada frame a 32×48 mediante remuestreo nearest-neighbor. Los assets de runtime residen en `public/assets/characters/friends/`.

Dirección de generación utilizada: sprite sheet pixel-art de cuerpo completo, grilla 3×4 down/left/right/back, identidad/outfit/colores del master preservados, sin texto ni fondo, transparencia real, pasos contenidos y pose neutral central.

La integración técnica no certifica la fidelidad final a escala de juego. Eze debe validar legibilidad, orientación, recorte, alpha y consistencia con el cast en vivo antes de marcar estos cuatro assets como baseline aprobada.
