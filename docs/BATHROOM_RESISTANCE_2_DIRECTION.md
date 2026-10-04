# Tambu Game — Bathroom Resistance 2.0 / Dirección narrativa

**Estado:** CORRECTION PASS INTEGRATED / VISUAL QA REQUIRED  
**Fecha:** 2026-10-03  
**Autoridad:** dirección narrativa y presentation contract de Bathroom Resistance 2.0  
**No reemplaza:** balance, rewards ni contratos de `bathroomResistance.js`

---

# 1. Objetivo

Bathroom Resistance 2.0 no cambia el minijuego base.

Su objetivo es transformar tres repeticiones mecánicas en una progresión narrativa clara:

1. **BAÑO 1 — SORPRESA**
2. **BAÑO 2 — INCREDULIDAD**
3. **BAÑO 3 — CAOS**

La fiesta debe recordar lo que ya ocurrió durante la run. Los amigos reconocibles pasan a ser voces/personajes concretos en vez de un genérico `AFUERA`.

---

# 2. Mecánica protegida

Queda congelado el balance aceptado del Pass 2:

- duración: **10 s**;
- `SPACE` repetido;
- recuperación por pulsación: **+4**;
- 7 impactos por intento;
- perfiles 1/2/3 actuales;
- drain actual;
- daños actuales;
- ordinal de intento basado solo en bathrooms ya liquidados;
- success → `secured` +500;
- failure → `interrupted` +250;
- reward settlement idempotente;
- Perfect Night requiere 3 `secured`.

Bathroom Resistance 2.0 NO puede alterar esos contratos.

---

# 3. Portrait Reaction System — foundation

Los seis amigos ya tienen portraits UI aprobados.

Archivos:

- `ui_portrait_pitity_v1.png`
- `ui_portrait_tobi_v1.png`
- `ui_portrait_uriel_v1.png`
- `ui_portrait_santy_v1.png`
- `ui_portrait_thiago_v1.png`
- `ui_portrait_eze_v1.png`

Contrato visual:

- strip horizontal;
- **192×64 px**;
- 3 frames de **64×64**;
- frame 0 = `talk`;
- frame 1 = `angry`;
- frame 2 = `shout`;
- RGBA transparente.

Este sistema debe diseñarse como foundation reutilizable. Más adelante podrá recibir portraits de Tambu, Sofi, Mili y Cami para HUD/dialogue, pero esos assets y esa migración quedan fuera de este task.

---

# 4. Presentation contract

Durante Bathroom Resistance puede existir como máximo **una intervención hablada visible a la vez**.

Cada intervención muestra:

- portrait 64×64 del speaker;
- nombre corto del speaker;
- globito/caja breve de texto al lado;
- expresión indicada por el beat.

Los golpes sin diálogo pueden seguir funcionando como feedback de puerta/cámara sin portrait.

Principios:

- retrato pequeño, no domina la pantalla;
- frase corta;
- lectura instantánea;
- mismo lenguaje nocturno/pixel de `UI_DIRECTION.md`;
- sin rounded web cards;
- sin blur/glass;
- sin emojis del sistema;
- no tapar barra/timer;
- no convertir el minijuego en una conversación larga.

La frase debe desaparecer o ser reemplazada por la siguiente intervención. No acumular globos.

---

# 5. Memoria real de run

La narrativa puede consultar resultados anteriores ya liquidados.

## Segundo intento

Existe exactamente un resultado previo:

- `secured`
- o `interrupted`

La línea contextual debe cambiar según ese resultado.

## Tercer intento

Existen dos resultados previos.

La rama narrativa usa el total de bathrooms previos `secured`:

- **2 secured**
- **1 secured**
- **0 secured**

No recalcular rewards ni outcomes. Esta memoria es exclusivamente presentation/narrative.

---

# 6. BAÑO 1 — SORPRESA

## Cast

**Pitity**

Objetivo: el grupo todavía no entiende del todo qué está pasando. Pitity golpea porque necesita entrar y descubre que Tambu está adentro.

## Anticipation

### 1700 ms
SFX / golpe:
`PUM PUM PUM`

Sin portrait.

### 2450 ms
Speaker: **Pitity**  
Expression: **TALK**  
Copy:

`¿TAMBU?`

Debe sentirse más confundido que enojado.

## Resistance hits

Los timings y damages siguen siendo los del perfil actual. Solo cambia la presentation.

### Hit 1 — 800 ms
`PUM`

Sin portrait.

### Hit 2 — 1900 ms
Speaker: **Pitity**  
Expression: **TALK**  
Copy:

`¿ESTÁS AHÍ?`

### Hit 3 — 3100 ms
`PUM PUM`

Sin portrait.

### Hit 4 — 4400 ms
Speaker: **Pitity**  
Expression: **ANGRY**  
Copy:

`ABRÍ, BOLUDO.`

### Hit 5 — 6100 ms
`PUM PUM PUM`

Sin portrait.

### Hit 6 — 7900 ms
Speaker: **Pitity**  
Expression: **SHOUT**  
Copy:

`¡DALE, TENGO QUE MEAR!`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

## Resolution flavor

### Secured
Speaker: **Pitity**  
Expression: **ANGRY**  
Copy:

`BUENO. CAGATE.`

### Interrupted
Speaker: **Pitity**  
Expression: **SHOUT**  
Copy:

`¡TE DIJE QUE ABRAS!`

La resolución mecánica y reward no cambian.

---

# 7. BAÑO 2 — INCREDULIDAD

## Cast

**Tobi + Uriel**

Objetivo: ya ocurrió un Bathroom Resistance. Los amigos reconocen el patrón y no pueden creer que Tambu esté repitiendo la jugada.

## Anticipation

### 1700 ms
Speaker: **Tobi**  
Expression: **TALK**  
Copy:

`NO ME JODAS...`

### 2450 ms
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`¿OTRA VEZ?`

## Resistance hits

### Hit 1 — 800 ms
Speaker: **Tobi**  
Expression: **ANGRY**  
Copy:

`ABRÍ.`

### Hit 2 — 1900 ms
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`ESTÁ AHÍ ADENTRO, ¿NO?`

### Hit 3 — 3100 ms
`PUM PUM`

Sin portrait.

### Hit 4 — 4400 ms
Speaker: **Tobi**  
Expression: **SHOUT**  
Copy:

`¡TAMBU, ABRÍ!`

### Hit 5 — 6100 ms — MEMORY BRANCH

Si el bathroom anterior fue **secured**:

Speaker: **Uriel**  
Expression: **ANGRY**  
Copy:

`LA PRIMERA TE SALIÓ. ESTA NO.`

Si el bathroom anterior fue **interrupted**:

Speaker: **Uriel**  
Expression: **ANGRY**  
Copy:

`¿NO APRENDISTE NADA?`

### Hit 6 — 7900 ms
Speaker: **Tobi**  
Expression: **SHOUT**  
Copy:

`¡DALE, PELOTUDO!`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

## Resolution flavor

### Secured
Speaker: **Tobi**  
Expression: **ANGRY**  
Copy:

`NO PUEDE SER.`

### Interrupted
Speaker: **Uriel**  
Expression: **TALK**  
Copy:

`Y... ERA OBVIO.`

---

# 8. BAÑO 3 — CAOS

## Cast

**Santy + Thiago “La Abuela” + Eze**

Objetivo: ya no existe sorpresa. Todos saben exactamente qué está haciendo Tambu. La escena debe sentirse como el grupo entero participando del desastre.

La intensidad nace principalmente del cambio rápido de speakers, no de aumentar daños ni duración.

## Anticipation

### 1700 ms
Speaker: **Santy**  
Expression: **TALK**  
Copy:

`CHE...`

### 2450 ms
Speaker: **Thiago**  
Expression: **ANGRY**  
Copy:

`NO. OTRA VEZ NO.`

## Resistance hits

### Hit 1 — 800 ms
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡TAMBU!`

### Hit 2 — 1900 ms
Speaker: **Thiago**  
Expression: **ANGRY**  
Copy:

`ABRÍ LA PUERTA.`

### Hit 3 — 3100 ms — MEMORY BRANCH

Speaker: **Eze**

Si los dos bathrooms anteriores fueron **secured**:

Expression: **ANGRY**  
Copy:

`DOS VECES TE SALIÓ. ESTA NO.`

Si hubo **1 secured + 1 interrupted**:

Expression: **TALK**  
Copy:

`UNA TE SALIÓ. UNA TE LA CAGAMOS.`

Si ambos anteriores fueron **interrupted**:

Expression: **TALK**  
Copy:

`TERCERA VEZ Y TODAVÍA INSISTÍS.`

### Hit 4 — 4400 ms
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡ABRÍ, HIJO DE PUTA!`

### Hit 5 — 6100 ms
Speaker: **Thiago**  
Expression: **SHOUT**  
Copy:

`¡TENGO QUE MEAR!`

### Hit 6 — 7900 ms
Speaker: **Eze**  
Expression: **ANGRY**  
Copy:

`YA ESTÁ. TIREN LA PUERTA.`

### Hit 7 — 9200 ms
`PUM PUM PUM`

Sin portrait.

La cámara/puerta puede usar el feedback de hit existente. No agregar mecánica nueva de “tirar la puerta”.

## Resolution flavor

### Secured
Speaker: **Eze**  
Expression: **TALK**  
Copy:

`NAH. DEJALO. YA ESTÁ.`

### Interrupted
Speaker: **Santy**  
Expression: **SHOUT**  
Copy:

`¡TE AGARRAMOS, GIL!`

---

# 9. Separación narrativa / balance

Crear una capa narrativa separada del balance.

Objetivo conceptual:

- `bathroomResistance.js` → mecánica, timings, drain, damage;
- nueva data/helper narrativa → speakers, expressions, copy y ramas de memoria.

No hacer que texto/portrait determine damage.

No duplicar perfiles de balance para poder cambiar frases.

---

# 10. Data contract recomendado

Cada beat narrativo debería poder resolverse a una forma similar a:

```js
{
  speaker: 'pitity',
  expression: 'talk',
  text: '¿TAMBU?',
}
```

Un golpe sin diálogo puede resolver a:

```js
{
  speaker: null,
  expression: null,
  text: 'PUM PUM',
}
```

Las ramas de memoria deben resolverse antes de llegar a UI. La UI presenta datos, no decide historia.

---

# 11. Out of scope

No entra en Bathroom Resistance 2.0:

- mover amigos físicamente a la puerta;
- nuevos sprites o animaciones de amigos;
- nuevos portraits;
- portraits de Tambu/chicas;
- voice acting;
- audio final;
- rebalance;
- nuevas rewards;
- cambiar duración;
- cambiar número de golpes;
- nueva física de puerta;
- cutscene adicional;
- refactor general de UI;
- rediseño completo del HUD.

---

# 12. QA narrativo

La pasada se considera exitosa si, jugando tres bathroom attempts en una misma run:

1. el primero se siente como descubrimiento/sorpresa;
2. el segundo reconoce explícitamente que esto ya pasó;
3. el tercero se siente como escalada social y caos;
4. los portraits permiten reconocer inmediatamente quién habla;
5. las ramas reflejan resultados anteriores reales;
6. ninguna frase modifica dificultad;
7. el spam visual no dificulta SPACE/bar/timer;
8. la escena sigue siendo corta;
9. failure sigue siendo divertido;
10. success sigue sintiéndose como victoria.

---

# 13. Estado de cierre esperado

Después de implementación + QA manual de Dirección:

**BATHROOM RESISTANCE 2.0 — CLOSED / BASELINE**

El siguiente bloque del roadmap será:

**PARTY PRESENCE**


---

# 14.1 QA visual de Dirección — correction pass requerido (2026-10-04)

La primera integración técnica valida portraits, memoria y narrativa, pero **NO queda visualmente aprobada**.

Problemas observados en juego:

- Portrait Reaction aparece como un bloque superior independiente del panel del minijuego/resolución, fragmentando la composición.
- El panel central y el bloque de reacción deben convertirse en **una sola unidad visual**.
- Las reacciones cambian demasiado rápido; algunas no llegan a leerse.
- Una reacción presente al inicio del minijuego desaparece casi inmediatamente por el cambio de fase.
- Los golpes puros siguen representándose como `PUM / PUM PUM / PUM PUM PUM` en texto, con lectura pobre y centrado poco convincente.
- El HUD de Resistance todavía se siente provisional y necesita una pasada dedicada de jerarquía, spacing, pixel display y agrupación.
- La resolución actual repite el mismo problema de dos bloques independientes.

Nueva dirección aprobada:

1. **ONE COMPOSITE BATHROOM PANEL.** Resistance, reaction dock y resolution pertenecen al mismo componente visual. Portrait + speaker + frase viven debajo del núcleo del minijuego dentro del mismo panel/marco.
2. **REACTION DOCK BELOW GAMEPLAY.** El área de comments queda reservada debajo de barra/timer/prompt. No debe saltar el layout cuando aparece/desaparece una frase.
3. **READABLE PACING.** Golpes puros no limpian una reacción hablada. Las líneas habladas deben tener exposición suficiente y la narrativa visual puede desacoplarse de los timings mecánicos para mantener lectura, sin alterar damage/drain/duration.
4. **NO TEXTUAL KNOCKS.** El texto `PUM` deja de formar parte de la UI final. Los golpes se comunican mediante staging físico de puerta + feedback mecánico existente.
5. **DOOR ANTICIPATION CINEMATIC.** Antes del panel de minijuego, la cámara prepara la escena con un zoom/pan corto hacia la puerta del baño. La puerta recibe pequeños impactos visuales sincronizados. Luego vuelve al framing normal y aparece el panel.
6. **DOOR HIT FEEDBACK DURING RESISTANCE.** Los hits mecánicos pueden volver a sacudir/nudgear la puerta además del feedback de barra/cámara, sin cambiar daños.
7. **SAME PANEL FOR RESOLUTION.** Success/failure transforma el mismo lenguaje del panel: result title + reward + reaction dock + return prompt. No portrait block separado arriba.
8. **BALANCE STILL FROZEN.** 10 s, SPACE +4, hit timings/damages/drain, rewards y secured/interrupted siguen intactos.
9. **NO NEW ART REQUIRED.** Reutilizar la puerta runtime actual y los portraits aprobados. La animación de golpe puede resolverse con desplazamiento pixel-safe del sprite/label de puerta y cámara; no generar un nuevo atlas de puerta salvo blocker demostrado.

Esta correction pass es de presentación, pacing y staging. No reabre el diseño mecánico.


---

# 14. Registro histórico de la primera integración técnica — 2026-10-04

**Registro histórico: composición y knock cleanup reemplazados por la sección 15.**

**BATHROOM RESISTANCE 2.0 — INTEGRATED TECHNICALLY / VISUAL QA REQUIRED.** El copy de las secciones 6–8 permanece intacto. CLOSED/FROZEN/BASELINE para esta capa depende del playtest de Dirección; el balance Pass 2 continúa cerrado.

## Assets y UI foundation

Los seis PNG aprobados se copiaron byte por byte, sin reexportar ni alterar píxeles/alpha, a `public/assets/ui/portraits/friends/`:

| Archivo | Asset key |
|---|---|
| `ui_portrait_pitity_v1.png` | `ui_portrait_pitity` |
| `ui_portrait_tobi_v1.png` | `ui_portrait_tobi` |
| `ui_portrait_uriel_v1.png` | `ui_portrait_uriel` |
| `ui_portrait_santy_v1.png` | `ui_portrait_santy` |
| `ui_portrait_thiago_v1.png` | `ui_portrait_thiago` |
| `ui_portrait_eze_v1.png` | `ui_portrait_eze` |

Todos cumplen PNG RGBA transparente 192×64, tres frames de 64×64. `PORTRAIT_EXPRESSIONS` define talk=0, angry=1, shout=2. `preloadPortraitReactions(scene)` carga los strips en `PatioScene.preload()`.

`createPortraitReactionUi(scene, options)` expone `show({ speaker, expression, text })`, `hide()` y `destroy()`. Presenta una sola reacción: portrait nativo nearest-neighbor, nombre uppercase mediante `pixelText`, globito rectangular oscuro con borde/cola y texto legible. El layout deriva del viewport y vive arriba del panel jugable. Reemplazo, hide, destroy y shutdown limpian los objetos/listeners; no hay timers ni input propios.

## Narrativa y memoria

`getBathroomResistanceNarrative({ attemptNumber, previousResults })`, en `src/data/bathroomResistanceNarrative.js`, devuelve data inmutable para anticipation/hits/resolution. Conserva la dirección sorpresa → incredulidad → caos y todo el copy aprobado, incluidas las seis reacciones de success/failure.

`getCompletedBathroomResults(gameState)` devuelve únicamente resultados anteriores secured/interrupted de outcomes bathroom. Excluye el bathroom actual pending y cualquier outcome no-bathroom. `getBathroomEventConfigForRun(gameState)` en PatioScene resuelve una única vez el perfil y la narrativa al iniciar BathroomEvent; settlement posterior no cambia la rama de memoria. Intento 2 lee el único resultado previo; intento 3 cuenta secured previos (0/1/2), sin distinguir el orden de las dos combinaciones mixtas.

BathroomEvent consume la narrativa sin acceder a gameState. Las UI de anticipation/resistance/resolution reciben presentation data. Los golpes puros limpian el portrait anterior; la resolución reemplaza el párrafo genérico por la reacción del amigo y conserva título, reward y ENTER. Todos los objetos nuevos se destruyen al cambiar de fase, finish, destroy, shutdown o retry.

## Regresiones protegidas y validación

Balance numérico sin cambios: 10 s, SPACE +4 mediante JustDown, siete impactos con timings/daños idénticos, perfiles/drain Pass 2, anticipation 3000 ms con beats 1700/2450. Solo se desacopló el texto embebido del perfil. Shake 80 ms/0.002, ordinal, secured/interrupted, settlement idempotente +500/+250 sin penalización de vidas, Perfect Night de tres secured, rutas y retornos permanecen intactos.

**246/246 tests aprobados, 0 fallos, 0 omitidos. `npm run build` correcto**, con advertencia existente de chunk >500 kB. Cobertura nueva en `bathroomResistanceNarrative.test.js` y `portraitReactionUi.test.js`; extensión de `bathroomEvent.test.js`, `bathroomResistance.test.js` y `patioIntroGate.test.js` para contracts de assets/preload/expresiones, reemplazo/hide/destroy, knock cleanup, copy completo, ramas/snapshot sin mutación, fases/hits, seis resoluciones, cleanup/retry, layout geométrico y números de balance exactos. La cobertura existente de rewards, run state y retornos sigue verde.

No se ejecutó browser QA ni se levantó el juego. Próximo paso exclusivo: **MANUAL NARRATIVE + VISUAL QA BY DIRECTION** sobre los tres intentos y sus ramas, según la sección 12. Esta integración no declara aprobación visual ni inicia PARTY PRESENCE.


---

# 15. Correction pass integrada — 2026-10-04

**CORRECTION PASS INTEGRATED / VISUAL QA REQUIRED.** Este es el presentation contract runtime vigente. Las secciones 6–8 conservan la autoridad de copy/speakers/expresiones/memoria; sus timestamps describen los hits mecánicos, no obligan a reemplazar la frase visible en ese mismo instante. Los timings históricos de anticipation y la composición/cleanup de la sección 14 quedan supersedidos por esta corrección.

## Una unidad visual

`createBathroomChallengeUi()` crea un solo marco centrado de 760×310 px en viewport 1280×720, con núcleo de 210 px y dock inferior reservado de 100 px. Título `RESISTENCIA DEL BAÑO`, timer pixel `00:10` arriba a la derecha, barra oscura con borde y padding, resistencia numérica secundaria y prompt pequeño `SPACE · APRETÁ REPETIDAMENTE`. Divider de 1 px `0x355a78`; portrait nativo 64×64, nombre pixel uppercase y frase legible debajo. `framed: false` evita caja/cola de globo flotante adicional. El layout no cambia al reemplazar una voz o entrar a resolución.

Success/failure transforma la misma instancia en `PUERTA ASEGURADA` / `LA PUERTA CEDIÓ`, reward +500/+250 liquidado y reaction dock. El prompt `ENTER · VOLVER AL PATIO` aparece tras 900 ms. ENTER/SPACE previos, incluidos los del frame habilitante, se consumen; se exige ENTER fresco para volver.

## Puerta real y cámara

HouseFacade devuelve `{ bathroomDoor: { sprite, label } }`. PatioWorld propaga esas referencias y PatioScene las conserva en `worldVisuals` para BathroomEvent. No se alteraron assets ni se creó puerta alternativa.

La anticipación visual dura 4800 ms: approach 400 ms a zoom 1.75 hacia el centro real del baño, 250 ms de hold antes del primer impacto, tres golpes físicos a 650/850/1050 ms y voces aprobadas a 1700/3200 ms. **QA de Dirección 2026-10-04: el framing de puerta NO vuelve a normal al comenzar Resistance. El zoom/foco alcanzado durante anticipation debe mantenerse durante los 10 s completos del minijuego para que los siete golpes físicos sigan ocurriendo sobre la puerta en primer plano. La cámara se restaura recién cuando Resistance termina y se entra a success/failure, o antes si el evento se destruye/shutdown/retry.** La última frase se conserva al entrar al panel y no desaparece por el cambio de fase.

`bathroomDoorStaging.js` interpola por delta, sin efectos pan/zoom, timers ni tweens pendientes. Snapshot/restauración de scroll, zoom X/Y, follow, roundPixels, lerp, offset y bounds; los bounds se suspenden solo durante el encuadre para centrar la fachada superior. Destroy/shutdown/retry abortan y restauran.

Los nudges de puerta duran 120 ms con offsets enteros +2/−2/+1/0, moviendo sprite y BAÑO juntos y restituyendo el neutral exacto. Los siete impactos activos conservan daño/bar feedback y shake 80 ms/0.002, además del nudge. No hay rotación, scale ni deformación.

## Pacing y golpes sin texto

No se muestra `PUM` ni sus variantes. Un marcador sin speaker no genera texto y no limpia una intervención hablada. La última voz permanece hasta la siguiente voz/fase/resolución; nunca se acumulan portraits.

`getBathroomReactionTimeline()` mantiene la selección narrativa aprobada y reserva lectura independientemente del daño: 1600 ms mínimos en intentos 1/2; 1400 ms para el cambio más rápido del intento 3; ramas de memoria con 2000 ms prioritarios. Las últimas líneas reciben 1900–2100 ms en intentos 1/2 y 1600 ms en el tercero. El timeline cabe en 10 s; no extiende el gameplay ni altera un hit. Fallo temprano puede interrumpir naturalmente la secuencia activa y pasar a su reacción final.

## Regresiones protegidas y QA pendiente

Balance Pass 2 intacto: active duration 10000 ms, JustDown/+4, perfiles, ordinal, siete timestamps/daños/drain y maxResistance. Rewards/vidas, secured/interrupted, Perfect Night, rutas/velocidad/return, portraits y copy/memoria no cambiaron. Los campos históricos de anticipation en el config mecánico no se modificaron; el controller usa el pacing visual explícito de esta sección.

**253/253 tests verdes, 0 failures/skips; `npm run build` verde**. Sigue la advertencia conocida del chunk >500 kB. Tests nuevos en `bathroomDoorStaging.test.js`; ampliaciones en `bathroomEvent.test.js`, `portraitReactionUi.test.js` y `pixelText.test.js`: referencias reales, cámara y cleanup, impactos sin drift, timeline legible, dock/panel únicos, no textual knocks, persistencia de voces, transición y resolución compartidas, input residual y regresiones mecánicas/rewards.

No hubo browser QA, screenshots ni ejecución visual local. Dirección debe validar encuadre/puerta, lectura de las tres progresiones y memoria, handoff, composición/dock, resolución e input. **No se declara CLOSED/BASELINE para Bathroom Resistance 2.0 ni se comienza el siguiente bloque.**
