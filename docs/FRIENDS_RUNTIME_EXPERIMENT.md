# Friends Runtime Experiment

Estado: integrado técnicamente; **VISUAL QA REQUIRED**. Actualizado 2026-10-02.

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
- Eze: blink + drink + drunk down integrados técnicamente / **VISUAL QA REQUIRED**. Los tres PNG aprobados se integraron sin modificar sus bytes. `drunk` es solo actuación ambiental: no depende de `alcohol` ni cambia estado/balance de gameplay.
- Santy: blink + phone-check + drink down integrados técnicamente / **VISUAL QA REQUIRED**. Se usan exactamente los tres PNG aprobados, sin reexportar ni modificar sus píxeles. La animación de baile queda **DEFERRED**.
- **Tobi blink no está integrado** y no debe asumirse como parte del paquete actual.

Los walk sheets usan 12 frames en grilla 3×4, cada frame de 32×48 px. Las filas son down/left/right/up; las columnas son paso/neutral/paso. Escala 1.24 y depth por pies con offset 30, siguiendo la familia humana actual. Idle down usa una única pose neutral aprobada del master runtime, para mantener quietud sin movimiento corporal artificial.

### Santy — special idles integrados

Los atlas RGBA transparentes viven en `public/assets/characters/friends/`, con frames de 32×48 px:

| Archivo | Asset key | Animation key | Dimensiones | Frames | FPS | Peso |
|---|---|---|---|---|---|---|
| `friend_santy_blink_down_atlas_v1.png` | `friend_santy_blink` | `santy-blink-down` | 160×48 | 5 | 10 | 70% |
| `friend_santy_phone_check_down_atlas_v1.png` | `friend_santy_phone_check` | `santy-phone-check-down` | 256×48 | 8 | 6 | 15% |
| `friend_santy_drink_down_atlas_v1.png` | `friend_santy_drink` | `santy-drink-down` | 256×48 | 8 | 6 | 15% |

Las tres animaciones tienen `repeat: 0`. El scheduler existente de `friendSprite.js` espera 5–10 s, selecciona por peso solo en IDLE + DOWN y pasa a SPECIAL_IDLE. Al completar vuelve a `santy-idle-down`, usando el neutral aprobado `friend_santy_idle_down`, y programa una única nueva espera. Caminar/cambiar de facing o apagar la Scene cancela los timers y listeners mediante el lifecycle genérico existente.

Validación técnica: **202/202 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto. Cobertura para preload, atlas, frames/FPS, boundaries 70/15/15, retorno a neutral, exclusión mutua, interrupción y shutdown/restart. Eze debe validar en patio la continuidad de cara/pelo, pies y silueta, aparición/desaparición del teléfono/vaso y frecuencia. Santy sigue en **VISUAL QA REQUIRED**.

### Eze — special idles integrados

Los atlas RGBA transparentes viven en `public/assets/characters/friends/`, con frames de 32×48 px:

| Archivo | Asset key | Animation key | Dimensiones | Frames | FPS | Peso |
|---|---|---|---|---|---|---|
| `friend_eze_blink_down_atlas_v1.png` | `friend_eze_blink` | `eze-blink-down` | 160×48 | 5 | 10 | 70% |
| `friend_eze_drink_down_atlas_v1.png` | `friend_eze_drink` | `eze-drink-down` | 256×48 | 8 | 6 | 20% |
| `friend_eze_drunk_down_atlas_v1.png` | `friend_eze_drunk` | `eze-drunk-down` | 256×48 | 8 | 5 | 10% |

Eze utiliza el scheduler genérico de 5–10 s, únicamente en IDLE + DOWN. Los tres specials tienen `repeat: 0`, no se solapan y vuelven mediante `playFriendIdle(sprite, 'down')` a `eze-idle-down`, cuyo neutral oficial sigue siendo `friend_eze_idle_down`. Después de completar se programa una única nueva espera. Walk/cambio de facing y shutdown/restart reutilizan la cancelación de timers/listeners existente.

`drunk` es exclusivamente una animación ambiental aleatoria de Eze. No existe integración con un sistema de alcohol, HUD, puntos, vidas, outcomes, stats sociales ni fases de la run.

Validación técnica de esta integración: **210/210 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto. Los contratos existentes de Santy se parametrizaron también para Eze, reutilizando el mismo fixture: preload, atlas, frames/FPS, boundaries 70/20/10, retorno a neutral, exclusión mutua, state guards, interrupción y shutdown/restart. Eze debe validar manualmente cara/pelo, brazos/vaso en Drink, pies/sway en Drunk, continuidad con el neutral y frecuencia. Estado: **VISUAL QA REQUIRED**.

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
