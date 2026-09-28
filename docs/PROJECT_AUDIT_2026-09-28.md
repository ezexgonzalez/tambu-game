# Tambu Game — segunda auditoría integral y preparación de V1

**Fecha:** 28 de septiembre de 2026  
**Repositorio:** `ezexgonzalez/tambu-game`, rama `main`  
**Snapshot auditado:** [`4101516dcee495116dca43d656a9ec0cfe959699`](https://github.com/ezexgonzalez/tambu-game/commit/4101516dcee495116dca43d656a9ec0cfe959699)  
**Comparación histórica:** [primera auditoría, 21 de septiembre, `aa619e9`](https://github.com/ezexgonzalez/tambu-game/blob/aa619e9f22aecce57bb41004f70df84d4e0d9443/docs/PROJECT_AUDIT_2026-09-21.md)  
**Alcance:** lectura y análisis; ningún cambio en el repositorio.

## Método y lenguaje de evidencia

Se comprobó el `main` remoto al comienzo y al final. Se contrastaron **234 archivos rastreados**, byte por byte, con el árbol remoto fijado; la lectura y los comandos se ejecutaron en una copia aislada. Se revisaron los documentos exigidos, historia reciente, código de escena/estado/conversaciones/personajes/mundo/UI, inventario de assets y tests. No se ejecutó el juego ni un navegador. Las conclusiones sobre sensación, legibilidad real, continuidad de píxeles, FPS y diversión quedan pendientes de QA humano.

- **VERIFIED FACT:** comprobado en código, datos, tests, historial o salida de comandos del snapshot.
- **OBSERVATION:** interpretación de esos hechos, con su alcance indicado.
- **RISK:** posible consecuencia concreta; su existencia en runtime no queda demostrada por la sola lectura.
- **RECOMMENDATION:** intervención propuesta, **no autorizada por este informe**.
- **PLAYTEST / VISUAL QA REQUIRED:** decisión imposible de cerrar mediante inspección estática.

**Validación:** `npm test` → **193/193 aprobados, 0 fallos, 0 omitidos**. `npm run build` → **correcto**, Vite 8.2.2, 58 módulos; JS `1,542.00 kB` / `404.08 kB` gzip. Advertencia de Vite por chunk >500 kB; advertencia de npm sobre `http-proxy` del entorno. Ninguna es un fallo de build. Los tests pasaron en la copia de análisis; no se midieron rendimiento, tiempos de carga ni duración de una partida.

**Fuentes de referencia:** [estado vigente](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/docs/CURRENT_STATE.md), [dirección V1](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/docs/V1_DIRECTION_2026-09-21.md), [escena principal](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/scenes/PatioScene.js), [estado de run](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/state/runState.js), [estado de juego](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/state/gameState.js), [layout](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/world/patioLayout.js), [amigos](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/characters/friendSprite.js), [creación de personajes](https://github.com/ezexgonzalez/tambu-game/blob/4101516dcee495116dca43d656a9ec0cfe959699/src/characters/createCharacters.js). Los enlaces corresponden al commit auditado, no al `main` móvil.

## 1. Executive summary

**VERIFIED FACT.** Tambu ya tiene una noche jugable con principio, tres conversaciones completas, consecuencias sociales, recorrido y resistencia del baño, regreso al patio, tres desenlaces de run, reintento limpio y continuación tras victoria. La primera auditoría describía un vertical slice sin cierre; esa crítica central **ya fue resuelta**. La documentación registra QA manual de las tres rutas terminales el 27 de septiembre; esta auditoría no repitió esa prueba.

**OBSERVATION.** La fortaleza mayor es la combinación de una voz propia —Tambu, tres chicas y El Consejo— con una arquitectura suficientemente separada para sostenerla. El mayor déficit perceptible probable es que todavía conviven protagonistas terminadas con dos amigos y 37 extras procedurales, utilería provisional, UI de distintas generaciones y ausencia total de audio. La debilidad de producción ya no es “cómo hacemos una noche completa”, sino **qué hay que terminar y qué hay que dejar fuera para que esa noche tenga presencia, ritmo y cierre**.

**RISK.** La siguiente ronda de retrabajo puede venir de animar amigos uno por uno sin cerrar primero las fuentes visuales aprobadas y el rol jugable de cada gesto. El balance Pass 2 de Bathroom Resistance está implementado pero no validado manualmente. Tests verdes certifican contratos de estado; no certifican que el tercer baño resulte ganable ni que una animación conserve la cara de Tobi frame a frame.

**RECOMMENDATION.** Cerrar primero la lectura real del balance y dos incoherencias puntuales; decidir un presupuesto estrecho para elenco, sonido, UI e intervenciones. Un menú de entrada sencillo, audio mínimo, personajes focales coherentes, interfaz honesta y dos o tres momentos ambientales bien colocados acercan más a V1 que otra docena de idles aislados. **Una noche · un patio · una experiencia completa** sigue siendo el criterio.

## 2. Progress since Audit 1

| Hallazgo de la primera auditoría | Estado actual y evidencia | Veredicto |
|---|---|---|
| No hay cierre global, resumen ni reintento | `runState.js`, Game Over, Normal End, Perfect Night y UI asociadas; `PatioScene` evalúa en punto estable; QA manual documentado | **Resuelto** |
| Baño compartido atraviesa piscina; depth de Tambu se congela; salida insegura | Rutas por chica, formación, depth por pies, exits junto a puerta y tests geométricos en `bathroomEvent.test.js` | **Resuelto a nivel de código; QA visual informada** |
| La chica desaparece y `resolved` bloquea toda interacción | Retorno independiente hacia tres anchors; reacción post-outcome sin doble recompensa, marker oculto | **Resuelto** |
| Baño otorga +500 antes de jugar; resistencia sin consecuencia | Recompensa diferida e idempotente: `secured` +500, `interrupted` +250; Perfect Night exige tres `secured` | **Resuelto** |
| Consejo elogia advertencia 4,4 de Mili y callback inventa un vaso robado | `suppressEmits` para `already-accelerated`, prompt condicionado por historia, tests directos | **Resuelto en esas rutas**; otra variante de Mili tiene señales contradictorias (sección 5) |
| Cami procedural y seis amigos procedurales | Cami tiene sprite/idles; Eze, Pitity, Santy y Tobi tienen atlas base; Uriel/Thiago siguen procedurales | **Parcial**; avanzó más de lo previsto |
| Patio poblado con fillers procedurales | Continúan 37 fillers, ocho con tween `dance`; actividades `chat/phone/drink/sit` no actúan | **Sigue abierto** |
| Agua estática, utilería Graphics, falta de vida ambiental | Sectores mayores estables; agua estática y utilería/extra provisional persisten | **Parcial**; no rehacer mundo por reflejo |
| UI funcional sin identidad común | Intro y tres pantallas terminales usan tipografía pixel; HUD, diálogo, Consejo y baño aún provisionales | **Parcial** |
| Sin audio, alcohol visible sin efectos, sin menú | Aún sin audio/menu; alcohol sigue en 0 y visible en HUD | **Sigue abierto** |
| Riesgo de perder masters y deriva de identidad | Cuatro amigos pasaron por generación e iteración manual; especiales corregidos; masters aprobados no versionados en árbol | **Cambió de forma:** hoy es trazabilidad y continuidad del idle corregido |
| 112 tests, sin validación real de estados terminales | 193 tests y QA manual documentada para las tres rutas; Phaser visual y balance aún manuales | **Gran avance; límite conocido** |
| Consejo anti-repetición nominal | `councilLineHistory` es de sesión con una consulta; no persiste entre runs | **Sigue abierto, bajo impacto V1** |
| Tensión de producto: posponer fin por arte | Fin y retry ya existen; ahora riesgo inverso de seguir puliendo cada asset sin cerrar audiovisual/UX | **Ya no aplica en su forma original** |

## 3. Verified current state

`FROZEN` significa dirección/escala congelada; `STABLE` significa baseline implementada, no certificación visual universal.

| Sistema | Estado | Evidencia | Riesgo / nota |
|---|---|---|---|
| Una noche, patio único, cámara zoom 1, escala humana 32×48 @1.24 | **FROZEN** | `CURRENT_STATE`, `patioLayout.js`, config de sprites | No rediseñar macro-layout |
| Césped, deck, casa, piscina, barra, DJ | **STABLE** | Módulos de `src/world/`; `CURRENT_STATE` | Superficie de agua estática; otros detalles dependen de QA visual |
| Sofi, Mili, Cami y sus especiales down | **STABLE** | `sofiSprite.js`, `miliSprite.js`, `camiSprite.js`, atlas cargados | Cami conserva polish fino diferido |
| Conversaciones, signals, cuatro outcomes, Consejo | **STABLE** | `src/data/conversations/`, `src/systems/`, 256 rutas enumeradas por chica | Señales contradictorias en variante adicional; balance subjetivo |
| Baño, rutas/retornos/recompensa y run state | **STABLE** | `bathroomEvent.js`, `resolvedCharacterReturn.js`, `gameState.js`, `runState.js`, tests | Texto de input engañoso; retorno final congelado en Normal End |
| Bathroom Resistance, ordinal/perfiles 1–3 | **IN VALIDATION** | `bathroomResistance.js`, `getBathroomAttemptNumber` y tests | Pass 2 sin informe de playtest |
| Intro y pantallas Game Over/Normal/Perfect | **STABLE** | `nightIntro.js`, tres UIs, `pixelText.js` | Polishing residual de intro marcado en documentación |
| Eze, Pitity, Santy, Tobi con walk/idle | **IN VALIDATION** | `friendSprite.js` y atlas respectivos | QA visual de los cuatro sin cierre documentado |
| Pitity blink/phone, Tobi drink/arms | **IN VALIDATION** | `friendSprite.js`, archivos PNG presentes | Tobi blink **no existe** en runtime; 50/50, no 70/15/15 |
| Uriel, Thiago y 37 fillers | **PROVISIONAL** | `patioCharacters.js`, `createCharacters.js` | Son cuerpos procedurales; evitar producción masiva no acotada |
| Props del patio con Graphics | **PROVISIONAL** | `createPatioWorld.js`; kit de `public/assets/props/patio/` no aprobado | Función espacial cubierta; brecha de acabado |
| HUD, diálogo, Consejo, outcome y UI del baño | **PROVISIONAL** | `src/ui/`, `UI_DIRECTION.md` | No comparten aún el acabado de las terminales |
| Audio integrado, menú principal, nuevos callbacks de fiesta | **NOT IMPLEMENTED** | Inventario de `src/`, `public/`, `CURRENT_STATE` | Brecha de atmósfera/entrada/reacción |
| Alcohol jugable, touch, guardado, segundo mapa | **NOT IMPLEMENTED** | `gameState.js`, `createHud.js`, inventario | Alcohol visible es decisión pendiente; los demás fuera de V1 recomendada |
| Configuración única antigua de baño, marcador `!` en resolved, seis amigos todos procedural | **OBSOLETE** | Comparación Audit 1 con código actual | No reabrir arreglos ya integrados |

## 4. Documentation vs runtime drift

| ID | Documento dice | Runtime actual | Impacto | Recomendación |
|---|---|---|---|---|
| D01 | `CURRENT_STATE` verificado en `55eecb0`, Tobi con dos especiales, Pitity sin especiales | `main@4101516`: Pitity blink/phone; retoque manual de idles; Tobi drink/arms corregidos, **sin blink** | Un brief nuevo puede repetir trabajo o dar por aprobado otro | Actualizar snapshot, inventario y QA pendiente tras revisión humana |
| D02 | `CURRENT_STATE`: “completar el loop de la noche” como próximo salto | Primera noche completa y tres salidas constan en el mismo documento y en código | Prioridad ejecutiva ambigua | Sustituir resumen inicial por “cerrar experiencia audiovisual y población” |
| D03 | `ASSET_PRODUCTION`: Fase B futura, producir seis amigos | Cuatro ya integrados experimentalmente; faltan dos | Backlog agranda trabajo | Reescribir Fase B como QA/corrección de cuatro y producción acotada de Uriel/Thiago |
| D04 | `GAME_DESIGN`, apartados de “implementación actual”: primer flujo de baño y recompensa uniforme +500 aun fallando | `gameState.js` difiere recompensa hasta `secured`/`interrupted` y aplica +500/+250 | Explica mal los stakes centrales | Separar contrato histórico de semántica vigente |
| D05 | `HUMAN_SCALE`: medidas “actuales” de barra 320×156 y DJ 322×126 | `patioLayout.js`: barra 264×246, DJ 302×120; collider de barra 264×220 | Riesgo de diseñar assets/colliders con medidas viejas | Actualizar tabla desde layout |
| D06 | Primeras secciones de `V1_DIRECTION`: piscina cruzada, first complete night pendiente, pass 1 del baño “actual” | Rutas corregidas, loop cerrado, Pass 2 vigente | Documento histórico parece backlog actual | Etiquetar secciones reemplazadas y remitir a `CURRENT_STATE`; conservar decisiones futuras claramente fechadas |
| D07 | `V1_DIRECTION` describe contar el outcome social actual para ordinal en sección Pass 1 | Sección Pass 2 posterior y código cuentan solo anteriores **liquidados** | Lectura parcial reintroduce bug `2/3/3` | Anotar “superseded by Pass 2” en Pass 1 |
| D08 | `FRIENDS_RUNTIME_EXPERIMENT`: idle derivado del master como baseline inicial | Hay idles corregidos manualmente después de esa generación | Nuevos especiales pueden revivir cara vieja | Registrar por personaje cuál idle pixelado aprobado fue usado como referencia de continuidad |
| D09 | `ASSET_PRODUCTION` desaconseja sprites pequeños como fuente visual de reconstrucción | La corrección manual del idle runtime aporta una referencia exacta para continuidad frame a frame | Reglas interpretadas como excluyentes | Distinguir master grande = identidad; idle runtime **aprobado** = geometría/color exactos de specials; versionar procedencia |

**OBSERVATION.** Una propuesta antigua en `V1_DIRECTION` no se convierte automáticamente en bug ni en compromiso V1. Por ejemplo, Santy interceptando el trayecto o un sistema completo de roaming describen dirección posible; el código no los implementa. `CURRENT_STATE` es la autoridad declarada, pero también requiere el ajuste D01–D02.

## 5. Critical findings

### P0 — BLOCKS V1

**No se verificó un crash, doble recompensa ni transición terminal rota que bloquee hoy una run completa.** P0 aquí es una puerta de **definición de producto** antes de llamar terminado al patio: una fiesta sin audio integrado y con parte visible del elenco focal todavía procedural/provisional necesita una decisión explícita de cierre, no más features indiscriminadas. Si dirección acepta deliberadamente esos placeholders como estética de V1, debe documentarlo; con el estándar declarado en `ART_DIRECTION`/`UI_DIRECTION`, hoy no hay tal aceptación.

### P1 — HIGH VALUE BEFORE V1

**F01 — Instrucción del minijuego contradice el input. VERIFIED FACT.** `eventUi.js` dice `SPACE · MANTENÉ LA PUERTA CERRADA`; `bathroomEvent.js` concede +4 con `Phaser.Input.Keyboard.JustDown(spaceKey)`. Mantener la tecla no repite pulsaciones. **RISK:** una persona nueva puede perder intentando sostener SPACE. **RECOMMENDATION:** copy que diga explícitamente pulsar repetidamente, verificado en playtest de primera vez; no cambiar mecánica durante este arreglo.

**F02 — Contrato de depth de amigos sobrescrito. VERIFIED FACT.** `createFriendSprite()` asigna `friendData.y + footDepthOffset` (+30). `createCharacters()` llama después `sprite.setDepth(friend.y)` para todos los amigos y anula ese valor; sus labels tampoco reciben el depth de pies que sí usan otras entidades. **RISK:** orden de oclusión incorrecto donde se cruzan planos; **VISUAL QA REQUIRED** para dimensionar el efecto. **RECOMMENDATION:** corregir el overwrite y probar la superposición en mapa; no refactorizar el sistema de sprites.

**F03 — Segunda inconsistencia semántica de Mili. VERIFIED FACT.** Ruta de elecciones `[4,4,4]` (índices `[3,3,3]`): `too-much-teasing-intensity` hace decir a Mili “¿vos solamente sabés bardear?” y emite `mili_disliked_overplay` + advertencia, **pero la misma última history entry conserva** `mili_returned_challenge`, `npc_returned_flirt` y `mili_played_along_with_dance_tease` de la elección base. Reproducción pura del resolver: Pitity/Eze/Tobi **sí eligieron warning**, por lo que no se afirma que el Consejo falle en esta ruta; el historial sigue mintiendo y puede contaminar callbacks/reglas futuras. **RECOMMENDATION:** `suppressEmits` opt-in en las dos variantes de overplay, y test del último history entry y del Consejo; no tocar balance.

**F04 — Balance Pass 2 sin validación manual. VERIFIED FACT + PLAYTEST VALIDATION REQUIRED.** El ordinal excluye correctamente el baño pendiente, aumenta drenaje por fases y conserva hits deterministas. Los tests prueban delta independence y configuración, no que attempt 1 sea justo ni attempt 3 ganable bajo una mano humana. **RECOMMENDATION:** probar los tres perfiles con jugadores de distinto ritmo y registrar éxitos, fallos, segundos críticos y si el copy induce a mantener SPACE; ajustar solo después.

**F05 — Entrada y lectura UX incompletas. VERIFIED FACT/OBSERVATION.** La aplicación inicia en la intro sin menú; HUD muestra `ALCOHOL 0%` pese a que ningún sistema lo incrementa. Pantallas centrales aún usan composición anterior a las terminales. **RECOMMENDATION:** menú mínimo/instrucciones, ocultar alcohol hasta darle función, y pasada UI focalizada con `UI_DIRECTION`; no construir gestor universal ni alcohol RPG.

### P2 — POLISH

- **OBSERVATION:** `NORMAL_END` deja de actualizar el retorno de la última chica al entrar en fase terminal; `PERFECT_NIGHT` sí lo actualiza. El patio se congela deliberadamente para el beat y luego se cubre; si se percibe la chica parada frente a la puerta, validar visualmente y decidir si importa para esos 700 ms. No elevarlo a bloqueo sin reproducción.
- **RISK:** `councilLineHistory` solo vive en la sesión y Consejo se usa una vez, de modo que no evita repetición entre runs. `pitity-cami-optimus` depende de señales del beat final, posteriores a la última consulta normal. Auditar alcance antes de escribir más líneas; no refactor urgente.
- **RISK:** el build advierte un chunk grande de Phaser+juego. Medir carga en dispositivo objetivo antes de separar bundles. Sin medición no hay problema de FPS demostrado.

### POST-V1

Touch/mobile, persistencia, más mapas, campaña, inventario, árbol amplio de eventos, schedules de NPC, sistema general de navegación y alcohol profundo. Su ausencia no invalida una V1 de teclado y una noche si esa plataforma se declara claramente.

## 6. Gameplay / systems review

| Sistema | Función actual y fortaleza | Problema / riesgo | Recomendación |
|---|---|---|---|
| Intro → patio | Negro inicial, reloj 00:00/00:01, ventana pixel y gameplay bloqueado; entrada con identidad | Sin menú ni instrucción inicial; último microdetalle de túnel declarado pendiente | Conservar baseline, QA visual final junto a audio; entrada breve con controles |
| Exploración/interacción | Mapa fijo; E cerca de chicas, marker `!` solo para conversación principal | Amigos presentes no responden físicamente; extras con actividad nominal | Una o dos interacciones del grupo y señales ambientales acotadas |
| Conversación | Tres voces, cuatro beats×cuatro elecciones, reacción contextual, historia y stats ocultos | ESC antes del commit permite recomenzar el arco sin costo; puede facilitar ensayo hasta conseguir Baño | Decidir explícitamente si se acepta como accesibilidad o si se limita; medir en playtest |
| Consejo | Un consejo contextual por conversación, Pitity/Eze/Tobi diferenciados, sin efectos de stats | Es modal: cuerpos amigos no son lugares de consulta; riesgo narrativo en señales, contenido inalcanzable | Fijar coherencia de hechos; si se agrega callback físico, uno que responda a un consejo ya dado |
| Outcomes | Baño/Instagram/Friendzone/Rechazo con reacciones posteriores y rewards protegidos | Resultados no Baño dan cierre narrativo corto; su valor subjetivo puede ser menor | Playtest de satisfacción por outcome; dos callbacks bien condicionados |
| BathroomEvent | Tres rutas localizadas, velocidad 160, pareja, depth, safe exit, retorno background | Tests parten de posiciones preparadas; variación real del punto de interacción no está exhaustivamente simulada | Conservar rutas aprobadas; smoke QA manual desde extremos de radio de E si se ve roce |
| Resistance | 10 s, siete hits, +4 por `JustDown`, fases progresivas, tres perfiles; resultado persistido | Copy induce input erróneo; dificultad sin nueva QA | Corregir copy y validar perfiles; luego capa narrativa por intento 1/2/3 |
| Run/endings | Prioridad Game Over, Perfect 3 secured, Normal 3 resueltas; bloqueo inmediato y restart limpio | Final Normal al tercer baño puede congelar retorno antes de llegar al anchor; no hay menú | Decidir caso por QA, mantener tests de transiciones/restart; menú pequeño |
| Post-win | Se conserva run, movimiento y reacciones post-outcome | Libre deambular sin contenido nuevo, posible sensación vacía tras victoria | Una reacción o gag de victoria de bajo costo si playtest lo pide; no construir simulación |
| Alcohol | Campo de estado y HUD en cero | Promesa visual de sistema inexistente | **Opción B:** ocultar de V1; implementación futura solo con brief y presupuesto propios |

**OBSERVATION — rejugabilidad.** El orden de abordar a las tres cambia el ordinal y la presión del baño; las rutas sociales son deterministas por opciones. Hay variedad de combinaciones de cierre, pero pocas consecuencias visibles fuera del resultado y del scoreboard. **PLAYTEST VALIDATION REQUIRED:** observar qué motiva a repetir, cuánto dura una run real, si se lee todo de nuevo y si Instagram/Friendzone/Rechazo se sienten como resultados o como “no gané”. No se pueden deducir rutas dominantes solo de contar 256 combinaciones posibles.

## 7. Visual / content review

| Personaje | Estado verificable y animaciones | Función V1 / brecha |
|---|---|---|
| Tambu | Sprite real, walk/idle de cuatro direcciones, body de pies | Protagonista funcional; no requiere otra animación para justificar V1 |
| Sofi | Base walk/idle; blink, phone y drink down; conversación, baño, retorno | Foco social establecido; no añadir idles por volumen |
| Mili | Base walk/idle; blink, hair adjust y drink down; conversación, baño, retorno | Foco social; comprobar continuidad visual solo donde QA detecte salto |
| Cami | Base walk/idle; blink, hair touch, hand-on-hip down; conversación, baño, retorno | Foco social; polish fino indicado en estado vigente |
| Pitity | Base walk/idle + blink/phone check down, 75/25 cada 5–10 s | Voz del Consejo y presencia; reciente integración **en validación visual** |
| Tobi | Base walk/idle + drink/arms crossed down, 50/50 cada 5–10 s | Voz del Consejo; atlas corregidos, **blink no integrado**; no afirmar paquete final 70/15/15 |
| Santy | Base walk/idle; sin specials | Presencia visual; futuro evento de interrupción es diseño, no runtime |
| Eze | Base walk/idle; sin specials | Voz del Consejo; presencia visual sin interacción de patio |
| Uriel | Procedural, sin atlas humano ni especiales | Reemplazo focal o decisión explícita de excepción visual |
| Thiago | Procedural, sin atlas humano ni especiales | Igual que Uriel; evitar especializarlo sin uso |
| Fillers (37) | Procedurales; ocho bailan por tween, pareja con corazón; el resto inmóvil | Mayor contraste visual por cantidad; pequeño lote coherente y actividades reales bastan |

**VERIFIED FACT.** El mundo estable incluye piscina, DJ, barra y casa con assets; `createPatioWorld.js` aún dibuja mesas, cooler, lámparas, guirnaldas y clutter como `Graphics`. Existe un kit candidato en `public/assets/props/patio/` que la documentación **no considera automáticamente aprobado**. La superficie de agua actual no es una animación. **OBSERVATION:** la brecha perceptiva más grande probable es el encuentro entre humanos principales detallados y una multitud procedural/silenciosa, seguido de UI antigua. Determinar qué se ve primero y qué se nota realmente exige **VISUAL QA REQUIRED**.

**Pipeline recomendado.** Master grande aprobado conserva identidad, outfit y silueta. El **idle runtime retocado y aprobado** fija píxeles, alineación de pies, cara y colores para construir especiales; atlas walk/especiales derivados deben llevar un identificador de esa baseline y checklist de primer/último frame. Después: revisión de alpha/dimensiones, integración de un personaje, QA visual en zoom 1 y cierre de baseline. La secuencia histórica de Tobi/Pitity muestra por qué generar cuatro personajes en lote y corregirlos después no garantiza continuidad. No hay evidencia versionada en el repo para evaluar si SpriteCook ahorra trabajo: probarlo con una pieza y comparar tiempo/fidelidad contra corrección manual antes de adoptarlo.

**RECOMMENDATION — vida de fiesta limitada.** Dos o tres señales por run, condicionadas por hechos: una breve interrupción nominada en el segundo/tercer baño, un comentario del grupo tras un resultado y un pequeño beat ambiental cerca de DJ/barra. Reutilizar sprites, datos de outcome y ventanas libres entre modales; no crear un simulador de agenda. En fillers, convertir uno o dos `drink/phone/chat` nominales en acción visible reconocible rinde más que producir 37 fichas únicas.

## 8. Engineering review

**VERIFIED FACT.** El ownership principal está bien delimitado: escena crea estado por run; lógica social y resistencia viven en funciones y datos; BathroomEvent reporta resultado y la escena liquida recompensa; terminales tienen UI propia; shutdown detiene sistemas y los tres sprites de chicas; timers/listeners de especiales de amigos se cancelan en `destroyFriendSprite` por shutdown. `friendSprite.js` generaliza solo especiales opt-in para Pitity/Tobi. Esta abstracción **alcanza para seis amigos**; no hay razón para multiplicar seis módulos individuales mientras no surja una necesidad diferente.

**Deuda que sí conviene pagar antes de agregar contenido:** (1) sobrescritura comprobada del depth de amigos, (2) texto engañoso del botón, (3) señales falsas en variantes concretas y sus contratos, (4) correspondencia documentos/runtime que guía la próxima producción, (5) procedencia de idle corregido para no rehacer atlases. Son fixes pequeños y de alto retorno, no un rediseño.

**POTENTIAL RISK:** ciclos de vida de temporizadores, input residual y completions tienen tests con dobles de Phaser, pero no equivalen a reiniciar cientos de escenas reales. Un gate manual de varios reintentos es suficiente para V1. `PatioScene` concentra wiring y algunas ramas, pero se entiende; fragmentarlo ahora aumenta superficie de error. Animaciones de amigos se registran defensivamente si no existen, con trabajo redundante menor: **NOT WORTH TOUCHING FOR V1**. El bundle grande es una advertencia, no un cuello de botella comprobado. No se encontró configuración de CI en el árbol ni política `engines` en `package.json`: recomendar gate simple de test/build en la plataforma Node validada, sin migración de tooling.

**Conclusión directa:** no hay una deuda arquitectónica general que deba pagarse para seguir agregando contenido V1. Sí existen contratos locales y documentación que deben corregirse en briefs acotados.

## 9. Test / QA review

| Dominio | Cobertura automatizada | QA funcional manual | QA visual | Playtest |
|---|---|---|---|---|
| Intro/terminales/restart | Fases, locks, delays, input y snapshot de nueva run | Reintentos consecutivos y entrada real | Máscara, frame inicial/final, pixel typography | Timing percibido |
| Social/Consejo | 256 rutas por chica, variantes y algunas reglas concretas; test de 4,4 de Mili | ESC/teclas rápidas, consultas en varios beats | Legibilidad y longitud de copy | Rutas dominantes, outcomes valiosos |
| Recompensa/run | Idempotencia, secured/interrupted, prioridad de final, summary | Flujo completo 3 outcomes; ya hay QA registrada de tres finales | HUD en instante de acreditar | Percepción de stakes |
| Bathroom rutas/retorno | Segmentos/colliders/formation, profundidad y estado en mocks | Tres rutas y distintos puntos de inicio E | Oclusión, puerta, pareja, anchors | Duración/ritmo |
| Resistance | Fases integradas según delta, ordinal y `JustDown` | Tecla real, triples attempts | Barra, golpes, señal de pulsar | **Pass 2 pendiente**, dificultad/ganabilidad |
| Personajes/arte | Preloads/config/selección/lifecycle de specials | Restart y state interruption | Cara y silueta frame a frame, pies, depth | Frecuencia natural de idles |
| Mundo/performance | Geometría fija y tests de césped | Colisiones en bordes, pausa/reinicio | Lectura a zoom 1, zonas muertas | Recorrido/tiempo de exploración |
| Audio/UI/alcohol | Sin audio que cubrir; mocks de UI/copy parciales | Mute/focus y controles cuando existan | Jerarquía y affordances | Primera vez sin explicación oral |

**RISK — falsa seguridad.** Los tests Node no representan renderer, física, mezcla de audio ni legibilidad de 32×48 a zoom 1. Algunos tests de UI fijan coordenadas/textos de implementación; los conservaría para gates críticos y evitaría expandirlos a cada píxel. Una matriz QA breve por SHA y un smoke manual de las tres terminaciones, perfiles del baño, interacción resuelta y dos reintentos dará más señal que tests espejo de código. No usar resultados de esta auditoría como certificación visual.

## 10. V1 content gap

**Si mañana se lo entregáramos a los amigos**, los huecos más probables, por impacto, serían:

1. **Silencio de la fiesta.** No hay música/ambiente ni golpes/confirmaciones sonoras: la identidad de “noche” depende solo de imagen y texto.
2. **Elenco no homogéneo.** Cuatro amigos bajo QA, dos amigos procedurales y 37 extras procedurales contrastan con las tres protagonistas terminadas. No se requieren 37 diseños distintos.
3. **Baños idénticos en contenido.** La presión numérica escala, pero los mismos siete textos/golpes anónimos vuelven cada vez. El clímax puede ser mecánico sin ser narrativo.
4. **Poca memoria visible del patio.** Relaciones se persisten y se puede volver a hablar; el resto de la fiesta casi no responde a lo que pasó.
5. **Entrada y controles.** No hay menú inicial; algunos prompts son provisionales y el botón de resistencia se describe de modo equívoco.
6. **UI entre dos etapas.** Finales e intro fijaron un lenguaje; HUD, diálogo, Consejo y baño no terminaron de adoptarlo.
7. **Balance y ritmo reales.** Ninguna distribución matemática garantiza diversión. La ausencia de medición de runs tras Pass 2 impide congelar dificultad.

No incluiría como hueco V1 obligado una campaña, guardado, más chicas, simulación social o un sistema completo de alcohol.

## 11. Recommended production blocks

### BLOCK 1 — Contratos reales y playtest de balance

**WHY NOW:** evita construir narrativa/UI sobre instrucciones falsas y dificultad no aceptada. **GOAL:** cerrar Pass 2 y los dos fixes locales comprobados. **DEPENDENCIES:** ninguna. **INCLUDES:** QA 1/2/3 con registros de ritmo; copy SPACE, depth amigos, señales overplay de Mili con tests; decidir ESC. **DOES NOT INCLUDE:** refactor social, cambio masivo de números sin evidencia. **DONE WHEN:** tres perfiles clasificados por Eze/jugadores, input comprendido al primer intento, depth verificado, último history entry coherente. **EXPECTED IMPACT:** confianza en reglas y menos retrabajo.

### BLOCK 2 — Cierre del elenco y población mínima

**WHY NOW:** los protagonistas visuales gobiernan la lectura del patio y futuras voces del baño. **GOAL:** reconocer a los seis amigos en runtime y reducir contraste procedural dominante. **DEPENDENCIES:** fuentes aprobadas y QA de cuatro existentes. **INCLUDES:** cerrar Pitity/Tobi/Eze/Santy visualmente; decidir Tobi blink según valor real; Uriel/Thiago base; una pequeña familia reutilizable de fillers o dos actividades visibles. **DOES NOT INCLUDE:** special idles para todos, decenas de variantes, rehacer mapa. **DONE WHEN:** seis amigos con identidad/posición/idle aprobados; fillers ya no dominan la percepción en sectores focales; QA a zoom 1. **EXPECTED IMPACT:** fiesta reconocible sin fábrica de NPC.

### BLOCK 3 — Bathroom Resistance con identidad narrativa

**WHY NOW:** tres intentos son el arco cómico natural de una Perfect Night. **GOAL:** sorpresa → insistencia → caos reconocible. **DEPENDENCIES:** balance aprobado y amigos visuales/copy disponibles. **INCLUDES:** pocos golpeadores identificables, frases por ordinal, feedback de secured/interrupted, guion breve sin alterar +500/+250. **DOES NOT INCLUDE:** Santy intercepción, retratos completos de todo el grupo, más minijuegos. **DONE WHEN:** se distingue cada baño sin leer un número de nivel; el tercero remata el arco; reglas/recompensas conservadas. **EXPECTED IMPACT:** clímax memorable con sistemas ya construidos.

### BLOCK 4 — Audio mínimo con control

**WHY NOW:** sin ambiente la fiesta y la puerta carecen de peso sensorial. **GOAL:** presencia sonora coherente, no banda sonora grande. **DEPENDENCIES:** assets/licencias sonoras aprobadas y puntos de sincronización actuales. **INCLUDES:** loop musical/ambiente con volumen sensato, mute/volumen simple, tick de reloj, 2–3 SFX clave (elección/golpe/resultado); manejo de foco/restart. **DOES NOT INCLUDE:** audio adaptativo por cada NPC, doblaje, composición extensa. **DONE WHEN:** inicio, patio, golpes y finales tienen señales legibles y pueden silenciarse; no hay duplicados tras replay. **EXPECTED IMPACT:** percepción de producto completo y timing cómico.

### BLOCK 5 — Reacción pequeña del patio

**WHY NOW:** el estado narrativo existe; falta que el mundo lo reconozca. **GOAL:** dos o tres momentos por run de alto impacto. **DEPENDENCIES:** reparto y ventanas seguras entre diálogo/eventos. **INCLUDES:** callback de un amigo a un resultado, una reacción tras baño y un gesto ambiental de DJ/barra; condicionados por datos reales, one-shot, cleanup. **DOES NOT INCLUDE:** roaming autónomo, rumors system, segundo mapa, gran scheduler. **DONE WHEN:** aparecen sin interrumpir modal ni mentir sobre el history; rutas no Baño también tienen al menos un retorno satisfactorio. **EXPECTED IMPACT:** el patio deja de sentirse como decorado.

### BLOCK 6 — UI, onboarding y recorte explícito

**WHY NOW:** la experiencia completa necesita explicar acciones y mantener una sola gramática visual. **GOAL:** facilitar primera partida y coherencia de superficies. **DEPENDENCIES:** copy/inputs/balance congelados para no redibujar dos veces. **INCLUDES:** menú mínimo con Jugar/controles y audio, HUD sin alcohol falso, diálogo/Consejo/outcome/Resistance alineados a `UI_DIRECTION`, prompts honestos. **DOES NOT INCLUDE:** UI manager universal, controles táctiles, nuevo sistema de alcohol. **DONE WHEN:** jugador nuevo puede empezar, entender E/1–4/C/ESC y pulsar SPACE correctamente; HUD y modales leen como el mismo juego que finales. **EXPECTED IMPACT:** claridad y acabado.

### BLOCK 7 — Release candidate y QA de una noche

**WHY NOW:** la suma de bloques debe terminar en un producto testeado, no en backlog perpetuo. **GOAL:** fijar candidato V1. **DEPENDENCIES:** 1–6. **INCLUDES:** tests/build en gate reproducible, sesión manual de tres finales y retry, visual QA del elenco/UI, playtests de first-time y dificultad, lista corta de bugs P0/P1, ajuste de documentación vigente. **DOES NOT INCLUDE:** nuevas mecánicas una vez cerrado feature complete. **DONE WHEN:** criterios de sección 13 y checklist por SHA cumplidos. **EXPECTED IMPACT:** posibilidad real de entregar la noche a amigos.

## 12. Critical path to V1

**NOW:** Bloque 1, congelar balance y corregir contratos comprobados.  
**NEXT:** Bloque 2, cerrar elenco focal y población mínima; audio puede prepararse en paralelo.  
**NEXT:** Bloque 3, clímax narrativo del baño con balance estable.  
**NEXT:** Bloques 4 y 5, sonido y dos/tres respuestas del patio.  
**V1 FEATURE COMPLETE:** Bloque 6, menú, onboarding, recorte de alcohol y UI coherente; sin nuevos sistemas mayores.  
**POLISH:** corregir únicamente hallazgos de QA a zoom real y primera partida.  
**RELEASE CANDIDATE:** Bloque 7 con smoke de todos los finales y gate técnico.

Siete bloques macro, con arte/audio en paralelo cuando no dependan del balance. No es necesario esperar a perfeccionar cada filler para que el audio avance.

## 13. V1 definition of done

| Área | Criterio verificable |
|---|---|
| **FUNCTIONAL** | Intro → tres chicas en cualquier orden → cuatro outcomes válidos → baño 1/2/3 → Game Over/Normal/Perfect según estado; secured/interrupted acreditan una sola vez; retry limpio; post-win conserva estado e interacción; sin P0/P1 de bloqueo conocidos |
| **CONTENT** | Seis amigos identificables, tres arcos y reacciones resueltas; 2–3 beats de fiesta seleccionados; baño 1/2/3 con progresión mecánica y narrativa; ningún callback inventa hechos |
| **VISUAL** | Elenco principal y fillers focales coherentes a zoom 1; pies, depth y continuidad de idle/especial aprobados; UI de conversación, Consejo, baño y HUD alineada a baseline; props provisionales restantes explícitamente aceptados o sustituidos según QA |
| **AUDIO** | Música/ambiente y SFX mínimos presentes con mute/volumen; sincronía de reloj/baño/finales sin dobles reproducciones en retry |
| **UX** | Entrada clara y controles disponibles; instrucciones equivalentes al input real; textos legibles, consecuencias visibles cuando ocurren, resultados no Baño con cierre propio; alcohol sin promesa vacía |
| **QA** | `npm test`/`npm run build` verdes en SHA candidato, sin warnings nuevos inexplicados; matriz manual de 3 finales, 3 perfiles, escenas/restarts e interacción resolved; deuda residual documentada |
| **PLAYTEST** | Jugadores nuevos completan una noche sin guía del creador, entienden SPACE, identifican por qué ganaron/perdieron, califican la escalada del baño como justa y recuerdan al menos un momento del grupo; duración/repetición observadas, no supuestas |

## 14. What not to do — not before V1

- Segundo mapa, campaña, progresión entre días o más chicas: diluyen la noche actual.
- Social roaming con anchors aleatorios y schedules completos: un par de callbacks puede cumplir la función perceptiva sin simulación.
- Generar specials para todos los amigos: primero aprobar baseline y utilidad visible; más frames multiplican QA.
- Sistema genérico de pathfinding: patio fijo y rutas explícitas funcionan.
- Gran biblioteca modular de fillers u outfits: empezar con lote pequeño y medir contraste.
- Alcohol con stats/penalizaciones/quests: ocultar su HUD vacío y discutirlo después.
- Rehacer piscina, barra, césped, escala o pantalla terminal sin problema observado.
- Migración arquitectónica, nuevo framework de señales, UI manager universal, sound engine complejo o herramienta de arte solo por novedad.
- Touch/mobile, save slots y optimizaciones de bundle sin dispositivo/perfil objetivo definidos.

## 15. Future recommendations — posibilidades, no backlog comprometido

**V1.1.** Uno o dos callbacks condicionados adicionales, pequeño contenido post-win que reaccione a la Perfect Night, variación de frases sin cambiar outcomes y un gesto ambiental más en sector DJ. Solo si los playtests demuestran que la V1 actual invita a permanecer allí.

**POST-V1.** Evento Santy durante el trayecto con su propio contrato de interrupción; social roaming limitado con anchors y memoria compartida; más amigos conversables o un alcohol deliberadamente pequeño; más variaciones de Baño. Requieren escribir consecuencias y QA, no solo instanciar sprites.

**LONG TERM.** Otros mapas/noches, campaña, persistencia, plataforma táctil, progresión entre días. No preasignar recursos V1.

## 16. Top 10 recommendations

| # | Recomendación | WHY | IMPACT | WHEN |
|---:|---|---|---|---|
| 1 | Playtest del balance Pass 2 con tres intentos y perfiles humanos | Tests matemáticos no prueban dificultad | Evita congelar una puerta injusta o trivial | Ahora |
| 2 | Corregir “MANTENÉ” y enseñar pulsaciones | Copy contradice `JustDown` | Evita derrotas por instrucción falsa | Ahora |
| 3 | Corregir overwrite de depth de amigos | Código anula offset por pies | Preserva oclusión al integrar cast | Ahora, con QA visual |
| 4 | Auditar/suprimir emits falsos en variantes overplay de Mili | History registra reacción positiva incompatible | Conserva confianza en Consejo/callbacks | Antes de más contenido social |
| 5 | Cerrar identidad visual de cuatro amigos y completar dos restantes con baseline versionada | Hoy hay mezcla y QA abierta | El grupo pertenece al mismo patio | Próximo bloque visual |
| 6 | Producir pequeño lote de fillers y dos actividades reales | 37 cuerpos similares se notan | Fiesta con vida sin factory | Tras cast focal |
| 7 | Hacer que los tres baños escalen también narrativamente | Siete hits anónimos idénticos | Baño 3 como clímax cómico | Tras balance |
| 8 | Integrar audio mínimo con mute desde puntos de evento | Fiesta silenciosa | Mayor calidad sensorial por costo acotado | Antes de QA final |
| 9 | Menú/onboarding mínimo, esconder alcohol, unificar UI central | Primera partida e interfaz prometen reglas ambiguas | Menos fricción y acabado | Feature complete |
| 10 | Mantener documentación vigente y QA por commit | Fuentes históricas aún contradicen runtime | Reduce briefs equivocados y retrabajo | Al cerrar cada bloque |

## 17. Final director brief — if we do only five things next

1. Probar los tres baños Pass 2 con gente real y corregir la instrucción de SPACE.
2. Arreglar el depth de amigos y las señales contradictorias de Mili con tests dirigidos.
3. Aprobar visualmente los cuatro amigos integrados y resolver Uriel, Thiago y un lote pequeño de fillers.
4. Dar a Bathroom Resistance tres momentos narrativos distinguibles y sumar audio mínimo con mute.
5. Cerrar menú, onboarding, HUD sin alcohol vacío, UI central y una matriz final de QA de las tres terminaciones.

**Dictamen:** la primera noche **funciona**; el trabajo V1 pendiente consiste en hacer que su espacio, personajes, instrucciones y ritmo comuniquen la misma calidad que su arquitectura y sus finales. Cualquier conclusión sobre cómo se siente al jugarla sigue marcada **PLAYTEST / VISUAL QA REQUIRED** hasta que se pruebe en runtime.
