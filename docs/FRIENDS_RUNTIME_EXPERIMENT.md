# Friends Runtime Experiment

Estado: **CAST CLOSURE — CLOSED / FROZEN FOR V1**. Aprobado por Dirección 2026-10-02.

## Alcance

Tobi, Pitity, Eze y Santy están integrados a partir de sus masters grandes aprobados. Uriel ahora tiene idle down + walk atlas 4 direcciones integrados técnicamente / **VISUAL QA REQUIRED**, reemplazando su placeholder con los dos PNG aprobados sin modificar sus bytes. Thiago tiene idle down + walk atlas 4 direcciones integrados técnicamente / **VISUAL QA REQUIRED**, con los PNG aprobados copiados byte por byte; reemplaza el último placeholder procedural de amigo principal. Se mantienen sus posiciones actuales.

## Runtime

| Personaje | Atlas walk | Idle down | Posición |
|---|---|---|---|
| Eze | `friend_eze_atlas_v1.png` | `friend_eze_idle_down_atlas_v1.png` | `(1215, 470)` |
| Pitity | `friend_pitity_atlas_v1.png` | `friend_pitity_idle_down_atlas_v1.png` | `(1270, 500)` |
| Santy | `friend_santy_atlas_v1.png` | `friend_santy_idle_down_atlas_v1.png` | `(380, 390)` |
| Tobi | `friend_tobi_atlas_v1.png` | `friend_tobi_idle_down_atlas_v1.png` | `(470, 835)` |
| Uriel (integrado técnicamente / VISUAL QA REQUIRED) | `friend_uriel_atlas_v1.png` | `friend_uriel_idle_down_atlas_v1.png` | `(320, 355)` |
| Thiago (integrado técnicamente / VISUAL QA REQUIRED) | `friend_thiago_atlas_v1.png` | `friend_thiago_idle_down_atlas_v1.png` | `(420, 800)` |

Special idles integrados al momento de esta actualización:

- Pitity: blink + phone-check down.
- Tobi: drink + arms-crossed down, con atlas reemplazados/corregidos para seguir su idle manual.
- Eze: blink + drink + drunk down integrados técnicamente / **VISUAL QA REQUIRED**. Los tres PNG aprobados se integraron sin modificar sus bytes. `drunk` es solo actuación ambiental: no depende de `alcohol` ni cambia estado/balance de gameplay.
- Santy: blink + phone-check + drink down integrados técnicamente / **VISUAL QA REQUIRED**. Se usan exactamente los tres PNG aprobados, sin reexportar ni modificar sus píxeles. La animación de baile queda **DEFERRED**.
- Thiago: blink + drink down integrados técnicamente / **VISUAL QA REQUIRED**, con los dos PNG aprobados sin modificar sus bytes.
- Uriel: blink + phone-check down integrados técnicamente / **VISUAL QA REQUIRED**, con los dos PNG aprobados sin modificar sus bytes. Paquete funcional de animaciones V1 completo.
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

### Uriel — idle + walk integrados

Los dos PNG RGBA transparentes aprobados viven en `public/assets/characters/friends/`, copiados byte por byte:

| Archivo | Asset key | Dimensiones | Frames |
|---|---|---|---|
| `friend_uriel_idle_down_atlas_v1.png` | `friend_uriel_idle_down` | 32×48 | 1 |
| `friend_uriel_atlas_v1.png` | `friend_uriel` | 96×192 | 12 (3×4) |

El atlas walk usa frames de 32×48 y filas DOWN/LEFT/RIGHT/UP. Las animaciones `uriel-walk-down`, `uriel-walk-left`, `uriel-walk-right` y `uriel-walk-up` utilizan respectivamente `[1,0,2,1]`, `[4,3,5,4]`, `[7,6,8,7]` y `[10,9,11,10]`, a 8 fps con `repeat: -1`. `uriel-idle-down` usa el neutral oficial `friend_uriel_idle_down`, frame 0; los idles LEFT/RIGHT/UP usan `friend_uriel`, frames 4/7/10.

La entrada `id: 'uriel'` activa el path genérico de `createCharacters()` sin branch nuevo. Conserva nombre, posición `(320,355)`, escala 1.24 y `footDepthOffset: 30`: depth 385, label 386. Al integrar la base no tenía special idles; el paquete posterior registrado abajo incorpora el scheduler y completion listeners genéricos. En el momento de la integración de Uriel, Thiago todavía conservaba su placeholder procedural en `(420,800)`; la integración posterior registrada abajo lo reemplaza.

Validación técnica: **211/211 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto. Cobertura extendida en `friendSprite.test.js` y `miliSprite.test.js` para dimensiones, preload, registro/frame mappings/FPS, creación real por `createCharacters()`, posición, escala/depth/label, ausencia de specials y preservación de Thiago procedural. Estado: **VISUAL QA REQUIRED**. Dirección valida cara, pelo, camiseta, pies, escala y continuidad de los frames a zoom de juego; esta integración no declara aprobación visual.

### Uriel — Blink + Phone Check integrados

Los dos PNG RGBA aprobados se integraron byte por byte en `public/assets/characters/friends/`, con frames de 32×48:

| Archivo | Asset key | Animation key | Dimensiones | Frames | FPS | Peso |
|---|---|---|---|---|---|---|
| `friend_uriel_blink_down_atlas_v1.png` | `friend_uriel_blink` | `uriel-blink-down` | 160×48 | 5 | 10 | 75% |
| `friend_uriel_phone_check_down_atlas_v1.png` | `friend_uriel_phone_check` | `uriel-phone-check-down` | 256×48 | 8 | 6 | 25% |

Ambas animaciones tienen `repeat: 0`. `FRIENDS.uriel.specials` activa exactamente el scheduler genérico de 5–10 s, solo en IDLE + DOWN. La selección usa Blink para valores menores que 0.75 y Phone Check desde 0.75. Durante SPECIAL_IDLE no puede comenzar otra variación. `animationcomplete` vuelve mediante `playFriendIdle(sprite, 'down')` a `uriel-idle-down`, cuyo neutral oficial sigue siendo `friend_uriel_idle_down`, frame 0, y programa una única nueva espera. No se conserva el último frame del teléfono como idle.

Walk/cambio de facing cancela la espera y limpia el completion pendiente; shutdown/restart usa `destroyFriendSprite()` para remover timer/listener y limpiar `friendScene`. No se creó lógica exclusiva para Uriel. Sus atlas base, posición `(320,355)`, escala 1.24, depth 385 y label 386 permanecen intactos, al igual que los contratos de los otros amigos.

Validación: **219/219 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto. El fixture existente de `santySpecialIdle.test.js` cubre también Uriel: PNG/preload, frames/FPS/repeat, boundaries deterministas 75/25, scheduler, retorno de ambos specials al neutral, exclusión mutua, guards IDLE + DOWN, interrupción y callbacks antiguos, shutdown y nueva Scene. Se actualizaron las expectativas de preload/lifecycle en `friendSprite.test.js` y `miliSprite.test.js`; el contrato anterior de ausencia de specials se reemplaza por esta cobertura.

Estado: **INTEGRATED TECHNICALLY / VISUAL QA REQUIRED**. Dirección valida continuidad de cara/pelo/camiseta/pies, brazo/celular, aparición/desaparición del teléfono y frecuencia. El paquete funcional V1 de Uriel está implementado; no se declara FROZEN/FINAL/CAST CLOSED.

### Thiago “La Abuela” — idle + walk integrados

Los dos PNG RGBA transparentes aprobados viven en `public/assets/characters/friends/`, copiados sin modificar sus bytes:

| Archivo | Asset key | Dimensiones | Frames |
|---|---|---|---|
| `friend_thiago_idle_down_atlas_v1.png` | `friend_thiago_idle_down` | 32×48 | 1 |
| `friend_thiago_atlas_v1.png` | `friend_thiago` | 96×192 | 12 (3×4) |

Frames de 32×48, filas DOWN/LEFT/RIGHT/UP. `thiago-walk-down`, `thiago-walk-left`, `thiago-walk-right` y `thiago-walk-up` utilizan respectivamente `[1,0,2,1]`, `[4,3,5,4]`, `[7,6,8,7]` y `[10,9,11,10]`, a 8 fps con `repeat: -1`. `thiago-idle-down` usa `friend_thiago_idle_down`, frame 0; `thiago-idle-left/right/up` usan `friend_thiago`, frames 4/7/10.

`FRIENDS.thiago` y `id: 'thiago'` activan la arquitectura genérica existente, sin branch exclusivo ni cambios en `createCharacters.js`. Conserva posición `(420,800)`, escala 1.24 y `footDepthOffset: 30`: sprite depth 830, label depth 831. El label sigue siendo `Thiago`, con su offset/estilo existente. Al integrar su base no tenía special idles ni timers/listeners adicionales; el paquete posterior registrado abajo incorpora el lifecycle genérico. Los otros amigos conservan sus configuraciones.

Validación técnica: **212/212 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto. Se extendieron `friendSprite.test.js` y `miliSprite.test.js` para atlas/preload, mappings/FPS, datos, creación runtime por `createCharacters()`, posición, escala/depth/label y ausencia de specials. Se protege que los seis registros de `patioFriends` tengan ids válidos y se creen como sprites, sin fallback procedural. El lifecycle existente sigue pasando sin nuevos timers.

### Thiago “La Abuela” — Blink + Drink integrados

Los PNG aprobados se validaron como PNG RGBA transparentes y se copiaron byte por byte, sin reexportar ni modificar píxeles:

| Archivo | Asset key | Animation key | Dimensiones | Frames | FPS | Peso |
|---|---|---|---|---|---|---|
| `friend_thiago_blink_down_atlas_v1.png` | `friend_thiago_blink` | `thiago-blink-down` | 160×48 | 5 | 10 | 75% |
| `friend_thiago_drink_down_atlas_v1.png` | `friend_thiago_drink` | `thiago-drink-down` | 256×48 | 8 | 6 | 25% |

Ambos usan frames de 32×48 y `repeat: 0`. `FRIENDS.thiago.specials` reutiliza exclusivamente el sistema genérico existente: espera 5–10 s, selección ponderada, guard IDLE + DOWN, SPECIAL_IDLE excluyente y completion que vuelve mediante `playFriendIdle(sprite, 'down')` a `thiago-idle-down` (`friend_thiago_idle_down`, frame 0). Al terminar Drink no queda el vaso/frame especial como neutral permanente. Walk/cambio de facing cancela timer y completion; `destroyFriendSprite()` limpia timer/listener y `friendScene` durante shutdown/restart. No hay scheduler exclusivo.

Sus atlas base, posición `(420,800)`, escala 1.24, walk a 8 fps, depth 830 y label 831 permanecen intactos. No cambian las configuraciones de otros amigos.

Validación: **226/226 tests aprobados**, sin fallos ni omitidos; `npm run build` correcto (advertencia existente de bundle >500 kB). El fixture de `santySpecialIdle.test.js` ahora cubre Thiago: PNG/preload, frames/FPS/repeat, boundaries deterministas 75/25, scheduler, retorno al neutral, exclusión mutua, guards, interrupción y callbacks antiguos, shutdown y nueva Scene. `friendSprite.test.js` y `miliSprite.test.js` actualizan preload/registro y cleanup de la creación real, reemplazando la expectativa obsoleta de ausencia de specials.

Estado: **INTEGRATED TECHNICALLY / VISUAL QA REQUIRED**. Dirección valida idle → blink → idle e idle → drink → idle, cara/pelo/ropa, vaso/brazo, pies, jitter y frecuencia. Esta integración no declara aprobación visual.

**ALL SIX MAIN FRIENDS NOW USE RUNTIME SPRITES:** Eze, Pitity, Uriel, Santy, Thiago y Tobi. **CAST CLOSURE — CLOSED / FROZEN FOR V1**. No queda ningún amigo principal procedural; `drawPerson()` permanece para fillers y otros fallbacks. Dirección aprobó el elenco completo el 2026-10-02. Los paquetes V1 de bases, walks y special idles quedan congelados y no se reabren antes de V1 salvo bug concreto.

## Cierre V1

Dirección confirma el cierre del bloque de amigos el **2026-10-02**.

Estado vigente:

- Eze — CLOSED / FROZEN FOR V1
- Pitity — CLOSED / FROZEN FOR V1
- Uriel — CLOSED / FROZEN FOR V1
- Santy — CLOSED / FROZEN FOR V1
- Thiago “La Abuela” — CLOSED / FROZEN FOR V1
- Tobi — CLOSED / FROZEN FOR V1

La cobertura técnica más reciente queda en **226/226 tests aprobados**, sin fallos ni omitidos, con `npm run build` correcto.

A partir de este punto no se agregan nuevos special idles, rediseños, walks ni polish cosmético de amigos dentro de V1. Solo se reabre este bloque ante un bug concreto que afecte lectura, identidad, lifecycle o gameplay. Fillers/NPCs de relleno pertenecen a PARTY PRESENCE y no forman parte de este cierre.

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
