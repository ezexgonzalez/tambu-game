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
5. **DOOR ANTICIPATION CINEMATIC.** Antes del panel de minijuego, la cámara prepara la escena con un zoom/pan corto hacia la puerta del baño. La puerta recibe pequeños impactos visuales sincronizados. El panel aparece sobre ese framing, que permanece enfocado durante Resistance; la cámara vuelve al framing normal al entrar a success/failure.
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

# 14.2 QA visual de Dirección — UI desacoplada del zoom + framing dentro del mapa (2026-10-04)

QA detectó dos defectos; corrección integrada técnicamente, pendiente de QA visual:

1. El zoom de la world camera también escala el HUD de Bathroom Challenge. El HUD debe permanecer en tamaño/coordenadas de pantalla.
2. El foco actual centra la puerta saliendo por encima de los límites del mapa, exponiendo un void oscuro.

Dirección aprueba:

- Separar world camera y Bathroom Challenge UI. La puerta/mundo mantiene zoom 1.75 durante Resistance; el HUD se renderiza mediante cámara/UI viewport propio a zoom 1.0.
- No compensar con escala inversa del HUD.
- La cámara UI debe cubrir panel, barra, timer, labels pixel, portraits, reaction dock, reward y prompt; limpiarse en finish/destroy/shutdown/retry.
- El focus de puerta debe respetar/clamp `PATIO_LAYOUT.world`. No usar scroll Y negativo ni mostrar espacio fuera del world bound.
- La puerta no necesita quedar centrada matemáticamente. Preferir tercio superior y composición limpia.
- No agregar cielo/techo/fondo ficticio para tapar el vacío. Resolverlo con framing correcto.
- Zoom 1.75, door impacts, narrative pacing y balance siguen protegidos.


---

# 14.3 Cierre de Dirección — 2026-10-04

Dirección aprueba Bathroom Resistance 2.0 como **CLOSED / BASELINE FOR V1**.

Quedan aceptados:

- progresión narrativa sorpresa → incredulidad → caos;
- portraits y expresiones de los seis amigos;
- memoria real de run;
- composite panel;
- reaction dock;
- pacing de intervenciones;
- golpes físicos de puerta;
- zoom sostenido durante Resistance;
- cámara UI desacoplada del zoom/shake del mundo;
- framing clamped dentro del mapa;
- success/failure + rewards actuales.

Queda **polish visual/UI pendiente**, pero se difiere explícitamente. No es blocker de V1 ni justifica otra pasada ahora.

Reabrir este bloque únicamente ante bug concreto que afecte lectura, input, cámara/lifecycle, narrativa/memoria o gameplay. No reabrir por microspacing, gusto cosmético, tamaños finos, ornamentación o refinamiento visual aislado.

Siguiente bloque activo del roadmap:

**PARTY PRESENCE**

---

# 14.4 Dialogue direction — wording deferred to final V1 dialogue pass

Dirección **rechaza** el copy propuesto en la pasada anterior por falta de voz real del grupo. No integrar esas líneas ni tomarlas como referencia de tono.

El problema no se resolverá con frases genéricas de comedia. La escritura final de Bathroom Resistance se hará más adelante dentro de un bloque completo de **DIALOGUE / CHARACTER VOICE PASS** para todo el juego, con un agente especializado que reciba:

- vocabulario real y ampliado del grupo;
- formas de hablar de cada personaje;
- insultos, muletillas, ritmos y remates propios;
- relaciones entre personajes;
- contexto narrativo completo de la noche;
- conversaciones y outcomes ya existentes;
- límites de personalidad: qué diría y qué jamás diría cada uno.

Regla lingüística del proyecto: en este grupo/contexto usar **PISCINA**, no `pileta`.

Hasta esa pasada, el wording actual de Bathroom Resistance se considera **provisional** y no debe recibir nuevos “punch-ups” aislados.

Lo que SÍ queda congelado desde ahora es la diferencia estructural entre los tres intentos:

## BAÑO 1 — SORPRESA

- escala social pequeña;
- **Pitity solo**;
- sensación de descubrimiento;
- todavía no existe certeza colectiva de lo que Tambu está haciendo;
- intensidad más baja;
- pocas interrupciones;
- humor futuro debe salir de la voz específica de Pitity, no de chistes intercambiables.

## BAÑO 2 — INCREDULIDAD

- **Tobi + Uriel**;
- ambos reconocen que esto ya ocurrió;
- debe sentirse claramente “no puede estar haciendo esto otra vez”;
- la memoria real del primer resultado sigue siendo parte central;
- más intercambio entre speakers y más presión que en el primero;
- humor futuro debe salir de cómo Tobi y Uriel reaccionarían realmente, no de arquetipos.

## BAÑO 3 — CAOS TOTAL

- **Santy + Thiago + Eze**;
- ya no hay sorpresa: todos saben qué está pasando;
- ritmo visual/social más denso;
- cambios de speaker más frecuentes;
- golpes físicos y staging de puerta deben sentirse más agresivos aunque el balance mecánico no cambie;
- la memory branch de Eze sigue siendo importante;
- debe sentirse cualitativamente más descontrolado que los dos intentos anteriores.

Se aprueba para el intento 3 un recurso visual de **alerta roja pixelada puntual** para enfatizar la escalada, pero su copy final queda diferido junto con el resto de los diálogos. Puede ser un flash/label corto de alto impacto, no un theme rojo permanente.

No cambiar:

- duración activa;
- hit timings;
- damage/drain;
- rewards;
- portraits;
- expresiones;
- cámara;
- composite HUD;
- memory logic.

La próxima vez que se reabra wording de Bathroom Resistance debe ser dentro del **DIALOGUE / CHARACTER VOICE PASS global**, no como microtarea aislada.


---

# 15. Correction pass integrada — 2026-10-04

**CORRECTION PASS INTEGRATED / VISUAL QA REQUIRED.** Este es el presentation contract runtime vigente. Las secciones 6–8 conservan la autoridad de copy/speakers/expresiones/memoria; sus timestamps describen los hits mecánicos, no obligan a reemplazar la frase visible en ese mismo instante. Los timings históricos de anticipation y la composición/cleanup de la sección 14 quedan supersedidos por esta corrección.

## Una unidad visual

`createBathroomChallengeUi()` crea un solo marco centrado de 760×310 px en viewport 1280×720, con núcleo de 210 px y dock inferior reservado de 100 px. Título `RESISTENCIA DEL BAÑO`, timer pixel `00:10` arriba a la derecha, barra oscura con borde y padding, resistencia numérica secundaria y prompt pequeño `SPACE · APRETÁ REPETIDAMENTE`. Divider de 1 px `0x355a78`; portrait nativo 64×64, nombre pixel uppercase y frase legible debajo. `framed: false` evita caja/cola de globo flotante adicional. El layout no cambia al reemplazar una voz o entrar a resolución.

Success/failure transforma la misma instancia en `PUERTA ASEGURADA` / `LA PUERTA CEDIÓ`, reward +500/+250 liquidado y reaction dock. El prompt `ENTER · VOLVER AL PATIO` aparece tras 900 ms. ENTER/SPACE previos, incluidos los del frame habilitante, se consumen; se exige ENTER fresco para volver.

## Puerta real y cámara

HouseFacade devuelve `{ bathroomDoor: { sprite, label } }`. PatioWorld propaga esas referencias y PatioScene las conserva en `worldVisuals` para BathroomEvent. No se alteraron assets ni se creó puerta alternativa.

La anticipación visual dura 4800 ms: approach 400 ms a zoom 1.75 hacia el centro real del baño, 250 ms de hold antes del primer impacto, tres golpes físicos a 650/850/1050 ms y voces aprobadas a 1700/3200 ms. **CAMERA HOLD THROUGH RESISTANCE — INTEGRATED / VISUAL QA REQUIRED (2026-10-04): el framing de puerta NO vuelve a normal al comenzar Resistance. El zoom/foco alcanzado durante anticipation debe mantenerse durante los 10 s completos del minijuego para que los siete golpes físicos sigan ocurriendo sobre la puerta en primer plano. La cámara se restaura recién cuando Resistance termina y se entra a success/failure, o antes si el evento se destruye/shutdown/retry.** La última frase se conserva al entrar al panel y no desaparece por el cambio de fase.

`bathroomDoorStaging.js` interpola por delta, sin efectos pan/zoom, timers ni tweens pendientes. Snapshot/restauración de scroll, zoom X/Y, follow, roundPixels, lerp, offset, bounds y pivote. Los bounds permanecen activos; el viewport físico se limita al world real, sin scroll Y negativo. La puerta ocupa la franja superior. `hold()` mantiene el encuadre alcanzado sin nuevas escrituras/interpolación de cámara durante Resistance. `restore()` restituye el snapshot antes de transformar el panel a success/failure. `destroy()` queda como cleanup/final safety; restore/destroy son idempotentes y no duplican follow. No existe retorno de cámara en los últimos 350 ms de anticipation. Destroy/shutdown/retry abortan y restauran.

Los nudges de puerta duran 120 ms con offsets enteros +2/−2/+1/0, moviendo sprite y BAÑO juntos y restituyendo el neutral exacto. Los siete impactos activos conservan daño/bar feedback y shake 80 ms/0.002, además del nudge. No hay rotación, scale ni deformación.

## Pacing y golpes sin texto

No se muestra `PUM` ni sus variantes. Un marcador sin speaker no genera texto y no limpia una intervención hablada. La última voz permanece hasta la siguiente voz/fase/resolución; nunca se acumulan portraits.

`getBathroomReactionTimeline()` mantiene la selección narrativa aprobada y reserva lectura independientemente del daño: 1600 ms mínimos en intentos 1/2; 1400 ms para el cambio más rápido del intento 3; ramas de memoria con 2000 ms prioritarios. Las últimas líneas reciben 1900–2100 ms en intentos 1/2 y 1600 ms en el tercero. El timeline cabe en 10 s; no extiende el gameplay ni altera un hit. Fallo temprano puede interrumpir naturalmente la secuencia activa y pasar a su reacción final.

## Regresiones protegidas y QA pendiente

Balance Pass 2 intacto: active duration 10000 ms, JustDown/+4, perfiles, ordinal, siete timestamps/daños/drain y maxResistance. Rewards/vidas, secured/interrupted, Perfect Night, rutas/velocidad/return, portraits y copy/memoria no cambiaron. Los campos históricos de anticipation en el config mecánico no se modificaron; el controller usa el pacing visual explícito de esta sección.

**254/254 tests verdes, 0 failures/skips; `npm run build` verde**. Sigue la advertencia conocida del chunk >500 kB. Tests nuevos en `bathroomDoorStaging.test.js`; ampliaciones en `bathroomEvent.test.js`, `portraitReactionUi.test.js` y `pixelText.test.js`: referencias reales, cámara y cleanup, impactos sin drift, timeline legible, dock/panel únicos, no textual knocks, persistencia de voces, transición y resolución compartidas, input residual y regresiones mecánicas/rewards.

No hubo browser QA, screenshots ni ejecución visual local. Dirección debe validar encuadre/puerta, lectura de las tres progresiones y memoria, handoff, composición/dock, resolución e input. **No se declara CLOSED/BASELINE para Bathroom Resistance 2.0 ni se comienza el siguiente bloque.**


## Validación de CAMERA HOLD THROUGH RESISTANCE — 2026-10-04

Microcorrección exclusivamente de cámara en `bathroomDoorStaging.js` y `bathroomEvent.js`. Tests de staging/event actualizados para no restaurar al comenzar Resistance, mantener zoom 1.75 y scroll estables durante los siete hits (sin interpolación), restituir el snapshot en los seis casos success/failure de los tres intentos y limpiar destroy/shutdown durante Resistance. Repetir restore/destroy no reinicia follow más de una vez.

**254 tests aprobados, 0 fallos/omitidos; build correcto**, con advertencia existente de bundle >500 kB. UI, pacing, impactos +2/−2/+1/0 de 120 ms, shake 80 ms/0.002, active duration 10 s, balance/rewards y rutas permanecen intactos. Sin browser QA ni ejecución visual local.

Próxima acción exclusiva: **MANUAL QA BY DIRECTION** para verificar puerta grande durante los diez segundos y framing normal al aparecer el resultado. **VISUAL QA REQUIRED; Bathroom Resistance 2.0 no queda CLOSED.**


## UI CAMERA ISOLATION + WORLD-BOUND DOOR FRAMING — 2026-10-04

**INTEGRATED TECHNICALLY / VISUAL QA REQUIRED.** Cámara local `bathroom-ui` (viewport completo, scroll 0/0, zoom 1, rotación 0) creada al comenzar anticipation y reutilizada hasta cerrar resolution. Main ignora todos los objetos Bathroom; la cámara UI ignora el mundo y demás HUDs, incluidos objetos añadidos después. El registro opt-in alcanza panel, barra, reward, texto, portraits y cada label pixel dinámico de timer/title/help/speaker, sin cambiar sus tamaños ni coordenadas. Los shakes siguen únicamente en main.

PatioScene entrega `PATIO_LAYOUT.world` explícitamente al evento y al staging. El target usa width/zoom y height/zoom, clamped a 1680×960. A viewport 1280×720 y zoom 1.75: scroll aproximado (948.57, 0), puerta en franja superior; `useBounds = true` durante approach y hold. El pivote temporal (0,0) permite scroll como borde físico del viewport. Phaser 4.2.1 calcula clampX/Y y worldView suponiendo un pivote central: staging traduce únicamente los bounds del motor para conservar los límites físicos y ajusta worldView/midPoint derivado después de preRender, evitando culling incorrecto de tiles. El método preRender original, pivote, bounds y demás snapshot se restauran en success/failure y abort; no se modifica la geometría del mundo.

La cámara UI permanece a zoom 1 durante resolution aunque main ya haya restaurado su framing. Finish/destroy/shutdown/retry eliminan cámara y listeners, restauran los bits de cameraFilter afectados preservando filtros ajenos y limpian referencias. Tres presentaciones consecutivas no acumulan cámaras. Restore/destroy son idempotentes.

**257 tests aprobados; 0 fallos, 0 omitidos. `npm run build` correcto**, con advertencia existente de bundle >500 kB. Tests de UI cubren objetos estáticos/dinámicos y portrait speaker, aislamiento ante zoom/shake, resolución y tres ciclos/shutdown. Tests de staging aplican la fórmula real de clamp de Phaser durante todo approach y comprueban viewport/culling dentro del mundo y snapshot completo. Tests de evento mantienen siete golpes, hold activo, seis resoluciones y cleanup.

No hubo navegador, screenshots ni ejecución visual local. Composición/pacing/copy/portraits, impactos, duración, JustDown/+4, perfiles/drain/damage/ordinal/rewards, rutas y retornos siguen intactos. Próxima acción exclusiva: **MANUAL QA BY DIRECTION** para framing dentro del mapa, HUD estable y cleanup visual. **VISUAL QA REQUIRED; Bathroom Resistance 2.0 no queda CLOSED.**
