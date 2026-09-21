# Tambu Game — Full Project Audit

**Fecha:** 2026-09-21  
**Repositorio:** `ezexgonzalez/tambu-game` · `main`  
**Snapshot auditado:** [`aa619e9f22aecce57bb41004f70df84d4e0d9443`](https://github.com/ezexgonzalez/tambu-game/commit/aa619e9f22aecce57bb41004f70df84d4e0d9443)  
**Alcance:** producto, sistemas, ingeniería, narrativa, UX, arte, QA y producción. Solo análisis; ninguna recomendación está implementada por este informe.

## Cómo leer la evidencia

- **VERIFIED FACT:** comprobado en el contenido del snapshot, en su historial o mediante una verificación técnica identificada.
- **OBSERVATION:** interpretación de esos hechos, incluida una limitación o un riesgo; no equivale automáticamente a un bug.
- **RECOMMENDATION:** trabajo propuesto, sujeto a decisión de dirección y a un brief posterior.
- **PLAYTEST VALIDATION REQUIRED:** algo cuya calidad, frecuencia percibida, legibilidad o diversión no puede resolverse inspeccionando código.

**VERIFIED FACT — Método.** Se verificó `main` remoto y su árbol completo: 189 archivos, incluidos 45 en `src/`, 12 en `test/`, 12 documentos en `docs/` y 115 archivos en `public/`. Se leyeron los documentos activos e históricos, los módulos de todos los dominios y los tests. Se revisaron 40 commits recientes, con especial atención a las incorporaciones y correcciones de personajes, barra, piscina y perímetro. Se contrastaron contratos de preload y las cabeceras/decodificación de los 111 PNG. No se inspeccionó el juego visualmente ni se ejecutó un navegador.

El checkout encontrado tenía una historia local distinta y documentos/referencias adicionales. Para no auditar ese estado como si fuese `main`, se construyó un snapshot de lectura cuyos **189 blobs coinciden con el árbol remoto**, utilizando las versiones remotas de README, ASSET_PRODUCTION y CURRENT_STATE. Los masters de Sofi encontrados únicamente en el workspace quedaron excluidos del estado publicado. La publicación del informe debe avanzar el `main` remoto, sin arrastrar esa historia local ni sus archivos adicionales.

**VERIFIED FACT — Validación técnica.** `npm test`: **112/112**, sin fallos ni skips, con Node **24.19.0**. `npm run build`: correcto; también comprobado sobre el snapshot limpio. El JS generado mide aproximadamente **1.505 MB minificado / 393.55 kB gzip**; Vite advierte un chunk superior a 500 kB. No se midieron FPS, memoria GPU, latencia de carga ni duración de runs. Los tests usan dobles de Phaser cuando necesitan escena/input; no prueban el renderer real.

---

## 1. EXECUTIVE SUMMARY

**OBSERVATION.** Tambu tiene una identidad definida y un núcleo social suficientemente desarrollado para construir una V1 corta. Sigue siendo un vertical slice: permite iniciar conversaciones, obtener resultados y vivir un evento especial, pero no permite completar una noche con principio, cierre y reintento propios del juego. No es responsable asignarle un porcentaje de avance: falta una definición verificable de V1 y un playtest completo.

**VERIFIED FACT.** Ya hay tres conversaciones de cuatro beats, diferencias de personalidad, señales narrativas, tres consejeros con voces propias, consecuencias persistidas durante la sesión, un dispatcher de eventos y el minijuego del baño. Sofi y Mili tienen sprites reales. La mayor parte del resto de la población continúa procedural. Alcohol figura en el HUD sin gameplay; no hay audio ni fin de noche.

**OBSERVATION — Fortalezas principales.** La separación entre narrativa y runtime ya produce valor: Mili y Cami usan el mismo núcleo sin rehacer la escena. El lore del grupo está presente en intercambios concretos, no solamente en documentación. La escala humana y el macro-layout tienen límites claros. Los tests protegen decisiones narrativas y transiciones importantes. La retirada del breathing de Mili muestra capacidad de abandonar una solución técnicamente válida que no funciona visualmente.

**OBSERVATION — Cinco riesgos para terminar.**

1. **Posponer el cierre hasta terminar todo el arte.** Sin final y reintento no se puede evaluar el ritmo de una run ni decidir cuánto contenido necesita.
2. **Confundir integración con coherencia completa.** El recorrido al baño atraviesa la piscina desde Mili/Cami; ciertos callbacks de Mili no coinciden con lo que ocurrió. Los tests verdes no cubren esos contratos.
3. **Expandir población, idles y ambientación sin presupuesto de V1.** El plan de NPCs modulares puede transformarse en otro producto.
4. **Perder la fuente visual aprobada.** La política de visual masters existe, pero los masters localizados en el workspace no están en el árbol remoto auditado.
5. **Seguir puliendo sectores estabilizados sin medir experiencia.** El historial concentra numerosas iteraciones de piscina/barra; no hay registro equivalente de una noche completa jugada y cerrada.

**RECOMMENDATION.** El próximo hito debe ser **“una noche completa, comprensible y repetible”**, con Cami visual como trabajo paralelo prioritario. Corregir antes los defectos que atraviesan esa experiencia; después completar población y elegir muy pocos momentos ambientales memorables.

## 2. VERIFIED CURRENT STATE

La palabra “estable” en CURRENT_STATE significa baseline vigente, no certificación independiente de ausencia de defectos o de QA visual reciente.

| Estado | VERIFIED FACT | Evidencia principal |
|---|---|---|
| Integrado / baseline | Patio único 1680×960, cámara zoom 1, viewport lógico 1280×720, teclado y Arcade Physics | `src/main.js`, `src/scenes/PatioScene.js`, `src/world/patioLayout.js` |
| Integrado / baseline | Tambu 32×48 @ 1.24, cuatro direcciones, body de pies y depth por `body.bottom` | `src/data/tambuSprite.js`, `src/player/` |
| Integrado / baseline | Sofi: walk, idle estable, blink en cuatro direcciones; phone/drink solo down, sin loop, pesos 70/15/15 | `src/characters/sofiSprite.js` |
| Integrado / baseline | Mili: idle estático 1/4/7/10, walk, blink down de cinco frames; breathing retirado y PNG ausente | `src/characters/miliSprite.js`, árbol de assets |
| Integrado / baseline | Conversaciones Sofi/Mili/Cami, cuatro outcomes cada una, Consejo Pitity/Eze/Tobi y persistencia dentro de la run | `src/data/conversations/`, `src/systems/`, `src/state/gameState.js` |
| Integrado con hallazgos | BathroomEvent y Resistance completos a nivel de flujo; no equivalen a navegación validada desde todas las posiciones | `src/events/`, hallazgos T01–T02 |
| Integrado / baseline | Césped de dos TilemapLayers; deck, casa, piscina, barra y DJ con assets | `src/world/` |
| En validación declarada | Perímetro; balance social y recompensas; composición ambiental | `docs/CURRENT_STATE.md` |
| Placeholder | Cami, seis amigos y 37 fillers: 44 cuerpos procedurales; ocho fillers tienen tween de baile | `src/data/patioCharacters.js`, `src/characters/createCharacters.js` |
| Provisional | Mesas, cooler, faroles, guirnaldas y clutter mediante Graphics; UI por rectángulos/texto | `src/world/createPatioWorld.js`, `src/ui/` |
| Disponible, no aprobado | Kit `public/assets/props/patio/`, conservado tras una pasada revertida | `public/assets/README.md`, CURRENT_STATE, historial |
| No implementado | Fin de noche/resumen/reintento, alcohol jugable, audio, amigos interactuables en el mundo, gestor general de ambient events, guardado entre sesiones, touch | Inventario y lectura de `src/`; CURRENT_STATE |

**VERIFIED FACT.** `chat`, `drink`, `phone` y `sit` en `fillerGroups` son etiquetas de datos, no animaciones implementadas. Solo `dance` crea tween y `kiss` agrega un corazón. El DJ y bartender sí tienen animaciones; la superficie actual de la piscina es una imagen estática, sin ciclo de agua en `poolStructure.js`.

### Diferencias entre documentación y runtime

| ID | Declaración / documento | Hecho contrastado | Interpretación y acción recomendada |
|---|---|---|---|
| D01 | CURRENT_STATE excluye Mili de la lista de humanos finales en “Provisional” | Su propia tabla y `miliSprite.js` la incluyen correctamente | Contradicción interna; corregir esa frase en una tarea documental posterior |
| D02 | ASSET_PRODUCTION enumera a Mili y Cami como placeholders y pendientes de Fase A | Mili ya está integrada, Cami no | Backlog visual desactualizado; no volver a producir Mili por leer esa lista |
| D03 | CURRENT_STATE indica base `main@b7759bd` | Incluye cambios posteriores, hasta `aa619e9` | Metadato de verificación rezagado; separar fecha de revisión y último hito |
| D04 | PHASE_1_GRASS dice máximo un patrón 2×2 por región coarse | `getDetailGroupSize()` puede elegir 1, 2 o 3 patrones | Documento de implementación desactualizado, no defecto probado del césped |
| D05 | HUMAN_SCALE presenta como actuales barra 320×156 y DJ 322×126 | PATIO_LAYOUT declara barra 264×246 y DJ 302×120 | Conservar unidad humana; actualizar o marcar histórica la tabla de footprints |
| D06 | CURRENT_STATE habla de ocultamiento/restauración segura de “personajes” | Al completar baño vuelve Tambu; la chica queda oculta, también lo espera el test | Ambigüedad de producto. No “arreglar” su retorno sin decisión |
| D07 | SOCIAL_DIALOGUE_DESIGN tiene un apartado antiguo “Cita” y posteriormente aclara su reemplazo por Baño | Sofi no tiene `date` y el test lo prohíbe | Evolución registrada, pero lectura confusa; marcar el apartado anterior como reemplazado |
| D08 | Se habla de anti-repetición del Consejo | La selección es determinista; el historial de líneas vive en una sesión que permite una sola consulta | Existe mecanismo de exclusión, no anti-repetición efectiva entre runs |
| D09 | ART_DIRECTION prohíbe copiar literalmente una referencia generada; ASSET_PRODUCTION exige fuente visual literal para personajes | Las dos formulaciones conviven sin una excepción clara por tipo de asset | Aclarar exploración versus master aprobado, sin autorizar reinterpretación en integración |
| D10 | Se exige referencia visual grande como fuente de producción | No hay visual masters versionados en el árbol remoto; los encontrados eran locales | La política está escrita, la custodia compartida no está resuelta en este repo |

**OBSERVATION.** Las aspiraciones de agua animada, alcohol o eventos generales en GAME_DESIGN/ART_DIRECTION no son por sí solas contradicciones: esos documentos describen dirección. Sí es problemático llamar “actual” a medidas o estados ya reemplazados.

## 3. PRODUCT / GAME DIRECTION REVIEW

**OBSERVATION — Identidad.** La V1 tiene una identidad clara: Tambu intenta leer situaciones románticas dentro de una fiesta íntima, mientras sus amigos interpretan, exageran o complican lo que ocurre. Psicopedagogía, “papi”, Pitity, las respuestas de Tobi y el baño son elementos concretos de autoría. El Consejo hace que el grupo forme parte de la conversación aun cuando sus cuerpos no intervienen físicamente.

**VERIFIED FACT.** Las fantasías sociales difieren: Sofi contrapone comodidad e intención; Mili premia energía y respuesta al desafío; Cami pide leer ironía sin sobreactuar. Sus reglas y señales no son solo tres skins del mismo texto. El lore de los amigos está en `CHARACTERS.md`; el de las chicas se desarrolla principalmente en `SOCIAL_DIALOGUE_DESIGN.md` y sus conversaciones.

**OBSERVATION — Una sola noche / patio único.** Es una restricción productiva: el jugador puede aprender un espacio reconocible y descubrir nuevas lecturas sociales. No necesita más mapas. Pero un espacio persistente solo se siente como una noche si las acciones dejan huellas y existe un cierre. Hoy las relaciones cambian en datos, mientras el patio conserva casi toda su composición inicial.

**OBSERVATION — Ritmo.** Cuatro beats no significan cuatro pulsaciones: cada elección puede abrir varias intervenciones, puentes y dos acciones por línea para revelar/avanzar. El baño añade recorrido, cartel, tres segundos de anticipación y hasta diez de resistencia. Repetir ese premio varias veces puede ser divertido o desgastante; no se puede decidir sin jugar. **PLAYTEST VALIDATION REQUIRED:** tiempo hasta primera decisión, tiempo por charla, proporción lectura/recorrido, repetición del baño y momento en que el jugador quiere terminar.

**RECOMMENDATION — Para que se sienta una noche.** Introducir un arranque breve con intención clara, resolución finita de oportunidades, una forma explícita de cerrar, resumen que recuerde decisiones y reinicio limpio. Recomendación inicial a aprobar: el jugador puede retirarse; resolver las tres conversaciones ofrece cierre, sin obligarlo a agotar todos los gags. No agregar un reloj punitivo por defecto.

**OBSERVATION — Humor y consecuencias.** Instagram, Friendzone y Rechazo deben conservar valor narrativo aunque sus puntos sean menores. Si todo contenido memorable queda detrás de Baño, la run se convierte en buscar una combinación ganadora. El minijuego es un remate identitario, no debería borrar el valor del intercambio anterior. La implementación ya preserva los +500 aunque se pierda resistencia: proteger esa separación salvo decisión expresa.

**RECOMMENDATION — No agregar antes de V1.** Más chicas, mapas, campaña, schedules de NPCs, inventario, sistema combinatorio de outfits, nuevos consejeros completos o una simulación de alcohol con múltiples rutas. Ninguno resuelve la ausencia de final. Una docena de ideas en este informe es un menú, no un compromiso de producción.

## 4. GAMEPLAY & SYSTEMS REVIEW

| Sistema | VERIFIED FACT: función y dependencias | OBSERVATION: calidad, complejidad y riesgo | RECOMMENDATION: extensión razonable |
|---|---|---|---|
| Movimiento | WASD/flechas, vector normalizado, velocidad 225, animación según eje dominante; depende de Arcade y PLAYER_CONFIG | Simple y apropiado. Falta cobertura directa de movimiento/colisiones; evento usa otro camino de actualización | Proteger normales, bloqueo de input y depth; no locomoción nueva |
| Interacción | Busca el más cercano entre tres elegibles, radio 82; resolución impide repetir | Adecuado a escala V1. No considera línea de visión; `!` no refleja resuelto; E se consume solo si hay candidato | Unificar disponibilidad visual con disponibilidad real; revisar bordes de input |
| Conversación | Controlador modal, prompt, reaction/bridge, Consejo y cierre; consume teclas anticipadas | Buena separación de datos/presentación. Cancelar con ESC descarta la sesión; puede reiniciarse sin coste | Definir si ese reintento es deseado, especialmente antes de añadir reloj/alcohol |
| Attraction / trust / intensity | Tres acumuladores ocultos; variants y outcomes por condiciones ordenadas | Modelo suficiente. Los umbrales globales de socialSituation no equivalen a los de cada chica | Balancear leyendo rutas; no sumar stats para arreglar problemas de texto |
| Historial y señales | Guarda intención, choice, variante, señales, stats antes/después en sesión; persiste selección resumida al resolver | Es la infraestructura más útil para callbacks. Base y variante suman emits incluso si la reacción se vuelve negativa | Revisar contratos semánticos antes de añadir más consumidores |
| Outcomes | Baño +500, Instagram +250, Friendzone +75, Rechazo −1 vida; commit por chica una sola vez | Idempotencia útil. Las tres recompensan igual; el resultado no produce cierre global | Reutilizar resultados para resumen y una reacción contextual |
| Consejo | Pitity/Eze/Tobi desde beat 2, una consulta, sin modificar stats; prioridad + contexto determinista | Potente y distintivo; datos grandes pero justificables. Hay prioridades/señales que contradicen reacciones | Corregir casos concretos; preservar incertidumbre del consejo sin confundir hechos |
| Puntos y vidas | Estado inicial 0 puntos/3 vidas; vidas clamp a cero | Subdesarrollados como capa de run. No hay consumidor de “cero vidas”; sin gasto de puntos | Decidir su función final. Con tres conversaciones, tres rechazos ya agotan todas las oportunidades actuales |
| BathroomEvent | Evento exclusivo; traslada actores por waypoints; oculta, presenta minijuego y restaura jugador | Responsabilidad coherente, pero navegación de acceso y depth tienen defectos verificables | Entradas seguras por zona hacia una ruta compartida; no pathfinding general |
| Bathroom Resistance | Estado puro, 65 inicial, drenaje 15/s, +6 por pulsación, golpes deterministas, duración 10 s | Buena pieza aislada. Resultado no se conserva para un futuro resumen; pauta idéntica en cada baño | Primero registrar resultado si el resumen lo necesita; después valorar 2 guiones de golpes |
| Estado global | Objeto propiedad de escena, relaciones resueltas y recursos | Adecuado al patio único; no hay estado de run, semilla ni historial de eventos | Agregar solo los campos necesarios para cierre y eventos aprobados |
| Ambiente | Ocho tweens de baile, corazones, DJ/bartender con ciclos; grass determinista | Presencia visual, casi sin reacción al jugador. Etiquetas de actividad prometen más de lo que ejecutan | Aprovechar grupos existentes y banderas once-per-run, sin agentes autónomos |

### Hallazgos verificables con reproducción técnica

**T01 — Primer segmento del baño cruza la piscina. VERIFIED FACT.** En `patioLayout.js`, el primer waypoint es `(464,796)` y el objetivo de la chica, por `actorSpacing=14`, es `(478,796)`. `bathroomEvent.js` mueve en línea recta hasta ese punto; el body del jugador está deshabilitado y los sprites de chicas no tienen navegación física.

| Chica | Origen vigente | Punto medio del primer segmento de su sprite | Dentro de piscina `(512..1136, 432..736)` |
|---|---|---|---|
| Sofi | `(400,690)` | `(439,743)` | No |
| Mili | `(930,330)` | `(704,563)` | Sí |
| Cami | `(1235,635)` | `(856.5,715.5)` | Sí |

El cruce geométrico no depende de una impresión visual. El tramo inicial del jugador también requiere validación desde su posición real de interacción. El test de Mili usa `(920,350)` y coloca a Tambu en `(400,690)`, no junto a Mili; solo verifica llegada y animación, no ruta libre. **RECOMMENDATION:** resolver entrada al circuito por zona y comprobar segmentos contra obstáculos relevantes. No introducir navegación genérica. **PLAYTEST VALIDATION REQUIRED:** lectura del recorrido corregido, ritmo y oclusiones.

**T02 — Depth de Tambu congelado durante caminata del evento. VERIFIED FACT.** `PatioScene.update()` retorna mientras el evento está activo; `updatePlayer()` no corre. `BathroomEvent.updateWalking()` actualiza animación y posición del label, pero no depth de sprite/label. En cambio, sí llama `setSofiDepth`/`setMiliDepth`. **OBSERVATION:** la ordenación del protagonista conserva la profundidad previa al evento y puede atravesar planos incorrectos. **RECOMMENDATION:** actualización visual de pies independiente del control manual. **PLAYTEST VALIDATION REQUIRED:** impacto visible contra personajes/props.

**T03 — Consejo de Mili puede elogiar una advertencia. VERIFIED FACT.** Elegir opciones **4,4** produce variante `already-accelerated`, intensidad 12 y “Bajá medio cambio”. `applyConversationChoice()` conserva `mili_played_along_with_chaos` de la elección base y agrega `mili_warned_tambu_to_slow_down`. Las reglas de Mili tienen igual prioridad 160 y `chaos` aparece antes de `warning`; además superan el freno genérico de Eze/Tobi de prioridad 140. El resolver entrega `pitity-mili-chaos`, `eze-mili-chaos` y `tobi-mili-chaos`; Eze dice “Te siguió lo de ser parte del problema. Ojo.”. **RECOMMENDATION:** revisar precedencia y semántica de señales con dirección; no cambiar thresholds globales para encubrir esta incoherencia.

**T04 — Callback de Mili presupone una elección que no ocurrió. VERIFIED FACT.** Ruta **1,1,4**, al llegar a beat 4, muestra “Primero me robás el vaso…” aunque solo `claim-drink` —opción 4 del primer beat— expresa ese robo. La variante de prompt exige únicamente `beat-3:you-cant-dance`. **RECOMMENDATION:** condicionar esa referencia al historial correcto o aprobar un puente alternativo. Se conserva aquí como hallazgo, sin reescritura.

**T05 — Estado de interacción y marker divergen. VERIFIED FACT.** `canInteractWithCharacter()` bloquea a una chica resuelta. No hay actualización del `!` al resolver Instagram/Friendzone/Rechazo; únicamente BathroomEvent lo oculta. **OBSERVATION:** la señal visual invita a una acción que ya no existe. **RECOMMENDATION:** reflejar disponibilidad o resultado mediante una decisión mínima de UI.

**T06 — Alcance real de anti-repetición. VERIFIED FACT.** `createConversationSession()` inicia `councilLineHistory=[]`; `markCouncilUsed()` lo llena al consumir la única consulta y `gameState` no lo guarda. El filtro de IDs funciona unitariamente, pero no evita repetir al abrir otra sesión/run. **RECOMMENDATION:** conservar determinismo y, solo si se necesita variedad, añadir memoria acotada dentro de la run o semilla para selección cosmética.

**OBSERVATION — Contenido reutilizable.** `dialoguePresentation` puede presentar líneas incidentales; `matchesConversationConditions` y las señales pueden habilitar callbacks; el dispatcher puede excluir eventos incompatibles. Esto no significa que ya exista un sistema ambiental: el diálogo actual se organiza alrededor de preguntas/outcomes y la interacción solo conoce chicas. Un gag necesita un pequeño disparador y lifecycle explícito, no simplemente pegar texto en el catálogo.

## 5. CODEBASE / ARCHITECTURE REVIEW

**VERIFIED FACT.** El árbol separa `data`, `state`, `systems`, `ui`, `events`, `characters`, `player`, `animations`, `scenes` y `world`. PatioScene coordina sin contener los textos ni el resolver. Los módulos sociales puros permiten enumerar rutas sin Phaser. `OutcomeEventSystem` acepta handlers, impide superposición y destruye el evento al terminar o detenerse.

**VERIFIED FACT — Configuración.** `package.json` fija Phaser `4.2.1` y Vite `8.2.2`, usa ES modules y scripts `dev`, `test`, `build` y `preview`; el lockfile está versionado. No hay configuración Vite propia, workflow de CI en el árbol ni herramienta de lint declarada. No se comprobó una instalación limpia en otra versión de Node.

**OBSERVATION.** Esta arquitectura es suficiente para V1. No hay fundamento para migrar a ECS, TypeScript de todo el proyecto, bus global, framework de quests o clases base profundas. La complejidad está más concentrada en el contenido que en infraestructura, lo cual es razonable para este juego.

### Sofi, Mili y creación de personajes

**VERIFIED FACT.** Ambos módulos concentran assets, creación de animaciones, facing, depth, timers y completions, con nombres propios. Eso conserva responsabilidad local. Sofi separa walk/idle/variaciones; Mili usa atlas base para idle y blink separado. Ambas conservan un timer por sprite y eliminan su completion al caminar. Usan eventos específicos `animationcomplete-<key>` y verifican estado antes del retorno a idle. No se identificó un loop infinito de special idles en el flujo normal.

**OBSERVATION.** Existe duplicación en cálculo de dirección, depth, cancelación de timer y listener. Con dos personajes no es una crisis. `createCharacters` y BathroomEvent repiten branches por `visual`; un tercer personaje real hará más útil un contrato pequeño.

**RECOMMENDATION — Momento de abstraer.** Al integrar Cami, si requiere el mismo soporte, introducir un adapter visual con `walkTo`, `idle`, `updateDepth` y `dispose` opcional. Los módulos de cada chica conservan frame maps, textures, pesos y estados propios. El evento trabaja con capacidades; no crea animaciones por nombre de personaje. Extraer el manejo de variaciones solo cuando dos módulos deban cambiar por el mismo motivo y exista una prueba común. No copiar drink/phone a Mili ni fabricar un state machine universal.

**RECOMMENDATION — Qué no generalizar.** Personalidades, prioridades narrativas, secuencias de frames distintas, timing aprobado de cada asset, geometría de barra/DJ y composición artística. La similitud del prefijo de una función no basta para imponer configuración global.

### Contratos y deuda de implementación

| Área | VERIFIED FACT | OBSERVATION / RECOMMENDATION |
|---|---|---|
| Datos narrativos | Objetos JS sin schema; first-match en variants/outcomes, suma de efectos y emits | Agregar validaciones de IDs, destinos, señales y fallbacks al cambiar contenido. No un editor narrativo completo |
| Consejo | `TAMBU_REACTIONS` indexa por texto literal para Sofi/Mili; Cami suele declarar reacción junto a la línea | Cambiar puntuación puede perder una reacción. Migrar gradualmente a ID o colocación conjunta cuando se editen esas líneas |
| Reglas heredadas | Mili/Cami incorporan BASE_COUNCIL_CONFIG, que incluye callbacks específicos de Sofi | Hoy muchas quedan inalcanzables por sus señales; no separar todo por estética. Vigilar filtración al añadir señales |
| Reglas no alcanzables | `pitity-cami-optimus` exige señal emitida en beat 4, después de la última oportunidad normal de consulta | No confundir existencia en datos con contenido experimentable; auditar alcance al editar Consejo |
| Semántica de `latestSignals` | En Council exige **todas** las señales del array | Arrays con alternativas pueden no representar la intención; ej. interés de Cami mezcla señales emitidas en beats distintos. Aclarar contrato y añadir caso dirigido |
| Snapshot | Council copia stats y cada entrada de history superficialmente; conserva referencias anidadas | No hay mutación problemática en resolver actual. Endurecer copia solo si se incorpora consumidor que modifique historial |
| Profundidad | Player por body; chicas `y+30`; amigos/fillers por centro; labels/markers de NPC sin depth explícito; props Graphics agrupados | Contratos distintos pueden producir oclusiones. Definir referencia de pies y plano de labels, sin alterar escala aprobada |
| Lifecycle | Timers ambientales pertenecen a escena; sprites no exponen dispose propio; bartender/DJ reprograman tras completion | Suficiente para escena estática; antes de entradas/salidas de NPCs, cancelar por actor y escena |
| Resueltos invisibles | Chica entra al baño, pasa a idle y queda invisible al terminar | Puede conservar timer ambiental activo. No se demostró fuga creciente; suspenderlo al retirar actor en una tarea de lifecycle |
| Datos residuales | `PLAYER_CONFIG.depth`, `label.depth`, `terrainPalette.js` no gobiernan el runtime actual; quedan campos visuales antiguos en layout | LOW. Limpieza cuando se toque su dominio; no refactor transversal previo a V1 |

**OBSERVATION.** `clear...Completion` llama tanto `off` como `removeListener` si existen; es redundante, no evidencia de listener duplicado. Los guards de estado y la eliminación explícita son correctos para interrupción normal. Faltan pruebas con emisor real y lifecycle de destrucción; no se debe afirmar “no hay ninguna fuga” solo por mocks.

## 6. TESTING / QA REVIEW

**VERIFIED FACT.** Hay 112 tests y 12 archivos. La suite cubre rutas sociales, variantes y voces, no solo getters. Se enumeran 256 rutas por chica; Consejo se comprueba en múltiples prefijos y, para Sofi, en todas las combinaciones de consulta sin alterar outcomes. La UI/controlador se ejercita con mocks de teclado y display objects; los tests de césped leen dimensiones reales de sus PNG.

| Protección existente | Valor | Límite |
|---|---|---|
| Inmutabilidad de efectos, persistencia once y clamp de vidas | Evita duplicar recompensas y contaminar conversaciones | No verifica final de run porque no existe |
| Rutas representativas y enumeración exhaustiva | Detecta outcomes imposibles y cambios accidentales de distribución | Distribución uniforme de elecciones no mide dificultad humana ni diversión |
| Input secuencial y Consejo | Evita saltos por teclas anticipadas, doble avance y consultas repetidas | Tests acoplados a coordenadas exactas de UI; no prueban legibilidad |
| Sprites Sofi/Mili | Protege contratos de frames, facing, timers básicos, walk que interrumpe | No lee sus PNG reales ni simula Phaser AnimationManager/Clock; stubs `once` no siempre se autocancelan |
| BathroomEvent | Verifica fases, llegada, visibilidad y retorno controlable; soporte Mili | No verifica ruta libre, depth de Tambu, origen real junto a Mili/Cami ni cleanup en cada fase |
| Grass | Whitelist, determinismo, patrones completos y dos TilemapLayers | Algunos tests buscan strings/nombres de helpers: frágiles ante cambios equivalentes |

**RECOMMENDATION — Tests siguientes por valor.**

1. T01: segmentos del recorrido desde posiciones reales y radio de interacción, con márgenes de collider; T02: actualización de profundidad durante traslado.
2. T03–T04: rutas concretas de Mili y coherencia de reacción/señales/Consejo, sin congelar toda la prosa.
3. Al construir cierre: finalizar una sola vez, tercera relación, cero vidas según decisión, baño activo que demora resumen, y reinicio limpio.
4. Preload/atlas: validar archivos reales, dimensiones divisibles, IDs de frames dentro del sheet y keys únicas. La auditoría ejecutó esta comprobación sin añadirla a la suite.
5. Timer/listener: usar un emisor que respete `once`, contar recursos activos tras ciclos de idle→blink→walk→idle y retirar personaje/escena. No confundir “dos timers creados, uno removido” con dos activos.

**OBSERVATION — Sobretesting relativo.** Repetir la distribución exacta de Sofi en varios archivos y fijar strings de implementación del césped aporta menos que cubrir navegación. No hay un problema de tiempo de ejecución de tests; la suite tardó alrededor de medio segundo. El coste es mantenimiento y falsa confianza. Los tests de canon textual son legítimos cuando protegen una frase aprobada, pero no todos los textos deben convertirse en snapshots rígidos.

**RECOMMENDATION — Gate liviano.** Un workflow de CI con versión Node validada, instalación desde lockfile, tests y build aportaría una verificación compartida para commits a main. No necesita navegador ni screenshots. La ausencia de CI no demuestra fallos actuales: reduce la reproducibilidad del gate entre agentes.

**RECOMMENDATION — QA manual de Eze.** Probar una run con resultados mixtos, una ruta de baño por chica, intentos de interacción tras resolver, ESC y reentrada, soltar/mantener SPACE, lectura de prompts largos, oclusiones y escala a zoom 1. Luego validar inicio→fin→reinicio cuando exista. Registrar SHA, ruta por IDs/opciones, resultado esperado, observación y aprobado/rechazado. **PLAYTEST VALIDATION REQUIRED.** No se recomienda browser automation pesada: los bugs geométricos y de estado admiten pruebas técnicas baratas; arte, humor y ritmo siguen siendo manuales.

## 7. ART / ASSET PIPELINE REVIEW

**VERIFIED FACT.** La organización por personajes, props y tiles es entendible. Los nombres técnicos identifican personaje, acción, dirección y versión. Los preloads de PatioScene solicitan **64 recursos con 64 keys únicas**, todos existentes; **11 son spritesheets**, con dimensiones divisibles por su frame declarado. Los 111 PNG del árbol se decodifican. Los recursos solicitados suman **1,415,864 bytes** en disco; no representa memoria GPU ni tiempo de carga.

| Atlas humano | Dimensiones verificadas | Frames 32×48 |
|---|---:|---:|
| Tambu | 96×192 | 12 |
| Sofi walk | 96×192 | 12 |
| Sofi idle/blink | 128×192 | 16 |
| Sofi phone down | 256×48 | 8 |
| Sofi drink down | 256×48 | 8 |
| Mili base/walk | 96×192 | 12 |
| Mili blink down | 160×48 | 5 |
| Bartender | 192×48 | 6 |
| DJ | 128×48 | 4 |

**VERIFIED FACT.** ASSET_PRODUCTION prescribe referencia grande aprobada, fuente literal y normalización al runtime, separando referencia visual de calibrador técnico. HUMAN_SCALE fija 32×48 @ 1.24 y baseline de pies. Esa base sostiene el flujo solicitado: **referencia → aprobación → normalización → integración → QA manual**.

**OBSERVATION.** La fragilidad principal es custodia y trazabilidad, no naming. No hay directorio remoto de visual masters; la existencia de archivos locales o adjuntos previos no garantiza que otro agente pueda producir el siguiente idle sin regenerar identidad. Tampoco hay ficha por atlas que vincule master aprobado, estado visual y contrato técnico.

**RECOMMENDATION — Estructura concreta, a crear en otra tarea.**

```text
docs/references/characters/sofi/README.md
docs/references/characters/sofi/sofi_visual_master_v01.png
docs/references/characters/sofi/sofi_phone_down_visual_master_v01.png
docs/references/characters/mili/README.md
docs/references/characters/mili/mili_visual_master_v01.png
public/assets/characters/women/women_sofi_atlas_v1.png
public/assets/characters/women/women_mili_atlas_v1.png
```

Cada README debe identificar el master aprobado por Eze/dirección, fecha, checksum o commit, atlas derivado, tamaño de frame/grid, orden, neutral por fila, pies, origin, escala, animaciones autorizadas y restricciones. Conservar solo masters y variantes aprobadas necesarias; no toda exploración descartada. Un PNG grande no tiene que cargarse en runtime. Si el volumen futuro lo justifica, evaluar almacenamiento externo con versión verificable; no asumir que hace falta LFS ahora.

**RECOMMENDATION — Roles.** El sprite pequeño de Tambu sirve para medir proporciones/pies; el master grande del personaje sirve para preservar identidad. No son referencias intercambiables. Art Studio normaliza el kit aprobado; Integración valida contrato y estados sin modificar píxeles. Un asset ilegible vuelve a arte/dirección: no se rescata cambiando arbitrariamente escala o multiplicando loops.

**VERIFIED FACT.** Hay 47 PNG sin referencia por nombre en `src/` —2,535,724 bytes— y el examen de los preloads confirma que quedan fuera de la carga del patio. Incluyen variantes antiguas de piscina, kit patio revertido y piezas alternativas. Vite copia `public` al build, aunque esos archivos no se soliciten al jugar. Dos props del deck se precargan pero no se colocan: `planter_terracotta` y `glass`; `planter_dark`, `doormat`, `lantern`, `bottle` y `stool` sí se usan según `DECK_PROPS`. No tratar todos los recursos del kit como visibles.

**OBSERVATION.** No se deben borrar candidatos por una búsqueda textual sin revisar su estado. Para releases, separar candidatos de producción fuera de `public`; versiones históricas ya recuperables por Git no necesitan viajar en la distribución.

**VERIFIED FACT / límite.** Tambu y bartender contienen valores de alpha intermedio; los atlas de Sofi/Mili y DJ comprobados no. Eso no prueba antialias defectuoso: puede incluir sombra u otro tratamiento aprobado. No se alteraron ni recalificaron visualmente. **PLAYTEST VALIDATION REQUIRED:** coherencia de contacto, densidad, siluetas y transición entre sheets.

**RECOMMENDATION — Escalar a amigos y fillers.** Primero siluetas reconocibles de los seis amigos; luego una familia finita de pocos cuerpos/outfits aprobados reutilizables, no 37 personajes únicos ni un compositor runtime de pelo/piel/accesorios. Definir poses realmente utilizadas antes de producir walk de alguien que nunca camina. Una animación down no habilita otras direcciones.

## 8. DOCUMENTATION REVIEW

**OBSERVATION.** El mapa `docs/README.md` es una buena puerta de entrada y evita tratar documentos históricos como instrucciones nuevas. CURRENT_STATE distingue integrado, provisional y no implementado mejor que un changelog. ART_DIRECTION, HUMAN_SCALE y SOCIAL_DIALOGUE_DESIGN registran decisiones que importan y ayudan a proteger el juego de reinterpretaciones.

| Documento | Evaluación | RECOMMENDATION |
|---|---|---|
| CURRENT_STATE | Útil y mayormente consistente, con D01/D03/D06/D08 | Mantener corto; estado actual y gates reales, sin copiar contratos completos |
| docs/README | Autoridad por dominio clara | Conservar; incorporar enlace al audit solo si se aprueba luego, no modificarlo en esta tarea |
| GAME_DESIGN | Buena identidad y límite de una noche; mezcla visión y propuestas | Agregar en una tarea futura Definition of Done V1 y lista explícita de cortes |
| SOCIAL_DIALOGUE_DESIGN | Canon, ejemplos y reglas valiosas; extensa evolución acumulada | Marcar apartados reemplazados y enlazar datos actuales; no duplicar toda la conversación en cada brief |
| CHARACTERS | Lore compacto, memorable; amigos más definidos que chicas | Mantener canon; referencias a fantasías sociales de chicas sin duplicar scripts completos |
| ASSET_PRODUCTION | Pipeline correcto, estado/backlog rezagado | Resolver D02/D09/D10 y reducir población modular a necesidad V1 aprobada |
| HUMAN_SCALE | Baseline humana clara; tabla de footprints obsoleta | Mantener escala como autoridad; enlazar layout en lugar de repetir medidas cambiantes |
| ART_DIRECTION / PIXEL_ART_STYLE_GUIDE | Jerarquía y técnica diferenciadas, pero repiten escala, paletas y gates | Mantener ambos; concentrar valores en especialista y usar referencias cruzadas |
| PHASE_1_GRASS | Documento técnico activo útil, una regla de densidad rezagada | Actualizar grupos coarse y evitar prometer una composición que ya cambió |
| PHASE_1_CALIBRATION | Bien marcado histórico | Conservar por trazabilidad; no leer completo para una integración de personaje |
| TAMBU_SPRITE_V011 y READMEs de assets | Contratos breves y útiles | Repetir ese formato para atlas de chicas, sin otro manual general |

**RECOMMENDATION — Información faltante.** Definición de cierre, matriz corta de QA por SHA, manifiesto de masters aprobados, contratos de datos narrativos —incluido que emits se suman y latestSignals exige todos—, política de cancelación/reinicio y plataforma Node validada. No hace falta crear seis documentos: varios pueden vivir como secciones pequeñas en fuentes existentes.

**OBSERVATION.** La prohibición documental de improvisar ante conflictos funciona para integración. En una auditoría, los conflictos deben registrarse, como aquí, no impedir terminar el análisis. Este informe no reemplaza CURRENT_STATE ni aprueba cambios por sí mismo.

## 9. DEVELOPMENT WORKFLOW REVIEW

**VERIFIED FACT — Historia reciente.** Sofi evolucionó de atlas real (`ecd17c1`) a idle (`9f3ad51`), naturalización (`838d790`) y variaciones (`d37e16c`). Mili pasó a sprite (`921d6aa`), limpieza local (`f170e82`), breathing (`07b5097`) y retirada del breathing (`aa619e9`). Piscina acumula cambios de frame/superficie, costuras, escala y contraste. El kit ambiental incorporado en `65dc4f8` se retiró en `dcc7d22`. Barra acumula varias alineaciones antes de sus correcciones de proporción. Esto evidencia iteración; no permite medir horas, tokens ni coste económico por commit.

**OBSERVATION.** Los cambios recientes de personajes tienen propósito acotado y estados técnicos verificables. La separación Game Director → referencia → Art Studio → Integration → Eze es adecuada. Funciona especialmente cuando dirección decide retirar algo en lugar de pedir al integrador que lo reinvente. Falla si “PNG aprobado” significa solo aprobado aislado, si el master se pierde o si “build verde” se transforma en “QA visual aprobada”.

### Flujo recomendado por tipo de tarea

| Etapa | Entrega concreta | Gate / responsable |
|---|---|---|
| Dirección | Función, intención, límites, ejemplos de comportamiento y criterios observables | Director aprueba diseño; define qué sería un fallo |
| Referencia | Master grande identificable y accesible, con versión aprobada | Eze/dirección aprueban identidad; no inferir aprobación por adjunto |
| Normalización | PNG runtime más ficha técnica; escala uniforme y frames identificados | Art Studio comprueba export y adjunta comparación técnica |
| Integración | Asset + preload + estado + tests afectados, diff mínimo | Integrador verifica técnica; nunca declara QA visual propia |
| QA | SHA, ruta/acción, aprobado o defecto concreto; captura manual si Eze la aporta | Eze valida escala, ritmo, legibilidad y humor |
| Cierre | Resultado de QA y estado documental consistente | Solo entonces congelar baseline artística |

**RECOMMENDATION — Agrupar.** Asset y su contrato/preload/animación/tests en una entrega funcional. Revisión de rutas sociales más callbacks del Consejo que consumen esas mismas señales. Producción de una familia pequeña de fillers para comprobar consistencia, antes de expandir variaciones.

**RECOMMENDATION — Mantener pequeño.** Una corrección de atlas, un problema de oclusión, una limpieza local de población, un bug de flujo. No mezclar esos fixes con balance, conversaciones o rediseño del patio. Una vez aprobado el contrato de Mili, agregarle otro special idle no necesita releer toda la documentación de césped.

**RECOMMENDATION — Reducir retrabajo/tokens.** Usar siempre SHA remoto; empezar por CURRENT_STATE, especialista y archivos afectados. Inventario de fuentes aprobadas para no buscar adjuntos perdidos. Una ficha de delta —qué cambia respecto de la baseline y qué queda protegido— evita volver a explicar el proyecto entero. QA por criterios y evidencias, no pedidos como “más natural” sin señalar acción/fase. No repetir build/test suites tras una edición puramente textual si ya no queda riesgo concreto; sí mantener una verificación reproducible antes de publicar cambios de lógica.

**OBSERVATION — Publicación.** La divergencia local/remota encontrada en esta auditoría es un riesgo real de proceso, no una prueba de que el juego publicado esté corrupto. **RECOMMENDATION:** un único head de trabajo por tarea, diff contra ese head y verificación remota tras publicar. Si se usa API por credenciales, el commit debe tener como padre el main actual; no mantener como fuente de verdad un commit local “equivalente”.

**RECOMMENDATION — Elección de agente/modelo, sin precios supuestos.** Usar razonamiento más fuerte para dirección, contradicciones cross-system, bugs de lifecycle y auditorías de rutas; y revisión final cuando varios dominios interactúan. Un agente más económico alcanza para integración repetida con ficha cerrada, dimensiones, un delta pequeño y tests relevantes. La generación visual requiere capacidad visual y master explícito; pagar más razonamiento de código no recupera una referencia perdida. No usar un agente costoso para repetir QA visual que Eze ya realiza.

**Brief mínimo obligatorio:** objetivo y motivo; SHA/base; fuente/master aprobado accesible; contrato de frames/keys/origin/scale/pies; estado anterior/nuevo; prioridad e interrupciones; sistemas afectados/protegidos; comportamiento de retorno/cancelación; criterios técnicos y visuales separados; cambios documentales; autorización de commit/push. Para eventos: condición de disparo, exclusividad, duración, repetición máxima, consecuencias y cleanup.

## 10. PERFORMANCE / MAINTAINABILITY REVIEW

| Clasificación | Evidencia / preocupación | Recomendación proporcional |
|---|---|---|
| CURRENT ISSUE | T01 navegación cruza piscina y T02 depth de Tambu no actualizado; problemas de corrección, no FPS | Resolver antes de ampliar eventos |
| CURRENT ISSUE | Recursos históricos/candidatos permanecen en `public` y se copian al build | Separar distribución y archivo de producción; no afirmar que todos se cargan por red |
| CURRENT ISSUE | Datos de Consejo/prompts pueden contradecir reacciones; D01–D10 dificultan decisiones | Corregir contratos puntuales y sincronizar fuentes en tareas propias |
| WATCH LATER | 44 cuerpos procedurales con siete hijos cada uno, más 44 containers: 352 objetos de esa población, sin contar labels/corazones | Sustituir por sprites por calidad visual; medir si la población crece antes de pooling |
| WATCH LATER | Un timer de variación por chica y ciclos del DJ/bartender; ocho tweens de baile | Lifecycle por actor antes de despawns; no un timer/gestor nuevo por cada gag |
| WATCH LATER | Objetos ocultos pueden seguir con timers y animación | Cancelar/suspender al retirarlos; no se demostró acumulación ilimitada actual |
| WATCH LATER | Chunk de ~393.55 kB gzip; no code splitting específico ni pantalla de carga | Medir carga en dispositivo/red objetivo; no cambiar motor por la advertencia de Vite |
| WATCH LATER | Diálogo llama setText/presentación por frame; strings y slices temporales | Solo optimizar al medir coste real; se muestran pocos textos a la vez |
| WATCH LATER | Recorrido capea delta a 50 ms; resistencia usa delta completo; no pausa explícita de minijuego por foco | Probar pérdida/retorno de foco manualmente; definir política antes de añadir más timers de gameplay |
| NOT A PROBLEM FOR V1 | Búsqueda lineal entre tres interactuables | No spatial index |
| NOT A PROBLEM FOR V1 | Dos capas de grass de 105×51 celdas, deterministas y creadas una vez | No streaming ni chunks de mundo |
| NOT A PROBLEM FOR V1 | Clones pequeños de historia y sort de reglas al consultar una vez | No memoización ni ECS |
| NOT A PROBLEM FOR V1 | Nuevo Vector2 por update del único jugador; Graphics estático creado una vez | No optimización preventiva sin perfil |
| NOT A PROBLEM FOR V1 | Escala aprobada 1.24 y diferentes escalas de props existentes | No “optimizar” cambiando lenguaje visual ni reescalando PNG aprobados |

**VERIFIED FACT / límite.** No hay medición de performance runtime en esta auditoría. “WATCH LATER” no significa regresión confirmada. El presupuesto de memoria debe calcularse con dimensiones/texturas, no a partir de bytes comprimidos del PNG.

## 11. V1 GAP ANALYSIS

**RECOMMENDATION — Definición propuesta de V1 completa.** Una persona puede entender qué hacer, recorrer el patio, vivir conversaciones con consecuencias coherentes, reconocer al grupo, cerrar la noche y volver a empezar sin recargar manualmente; presentación y audio sostienen identidad, sin placeholders involuntarios en focos principales. La run no necesita mostrar todo el contenido ni producir Baño para resultar satisfactoria.

| Orden | Falta concreta / decisión | ¿Necesario para V1? | Criterio verificable |
|---|---|---|---|
| 1 | Acordar qué termina la noche y qué significan vidas/puntos | Sí | Regla de cierre, salida voluntaria y comportamiento a cero vidas aprobados |
| 2 | Resolver T01–T05 y verificar transiciones críticas | Sí | Las tres rutas al baño no cruzan obstáculos; Consejo/puentes no inventan hechos; resueltos no invitan a interacción inexistente |
| 3 | Inicio, fin, resumen y reintento | Sí | Run completa con mezcla de outcomes y segunda run limpia, sin duplicar recursos |
| 4 | Cami visual | Sí, alto valor | Idle/walk real donde se necesita; interacción y BathroomEvent preservados; QA manual |
| 5 | Amigos reconocibles | Sí en presentación, no seis sistemas nuevos | Siluetas finales; al menos unos momentos breves del grupo usando voces aprobadas |
| 6 | Fillers | Sí eliminar el contraste procedural visible; no compositor modular obligatorio | Familia finita coherente, densidad local aprobada y sin invadir interacciones |
| 7 | Props activos | Acotado | Priorizar mesas/cooler/guirnaldas por exposición; aceptar o recortar candidatos antes de producir en masa |
| 8 | Audio mínimo | Recomendado como parte de la promesa de fiesta | Música/ambiente y pocos SFX, control de volumen/mute y lectura cómoda del diálogo |
| 9 | UI funcional final | Sí | Objetivo y controles claros; textos largos no chocan; outcomes y disponibilidad comprensibles; cierre/reintento |
| 10 | Vida ambiental | Sí, pequeña dosis; no toda lista de ideas | Selección de 3–5 momentos en el catálogo, presupuesto de 2–3 por run y silencio entre ellos |
| 11 | Alcohol | Decisión de recorte, no bloqueo automático | Para V1 inicial recomiendo excluir gameplay y retirar/prometer claramente su UI inactiva; si dirección lo exige, brief separado y recorte equivalente |
| 12 | Balance y polish de run | Sí | Outcomes interesantes, ritmo tolerable, baño comprensible y QA de final a reinicio |
| 13 | Agua animada / más idles | Opcional | Solo si playtest encuentra falta de vida que las otras medidas no resuelven |
| 14 | Guardado, touch, otros mapas, más chicas, nuevos consejeros | No | Fuera de V1 propuesta; confirmar plataforma desktop/teclado como objetivo |

**OBSERVATION.** “Amigos completos” no implica seis conversaciones románticas ni seis consejeros adicionales. “Audio” no implica un sistema DJ interactivo. “NPCs finales” no implica personajes únicos para cada posición. Esas equivalencias inflarían el alcance.

## 12. RECOMMENDED ROADMAP TO V1

Todas las fases son propuestas; el orden cambia la prioridad vigente y requiere decisión de dirección. No se modificó CURRENT_STATE para imponerlo.

| Fase | Objetivo y por qué ahora | Desbloquea / dependencias | Criterio de salida |
|---|---|---|---|
| A — Contrato de noche | Definir cierre, reintento, vidas/puntos y cortes; evita producir contenido sin final conocido | No depende de arte final; habilita B/C y balance | Definition of Done breve y lista explícita fuera de V1 |
| B — Coherencia crítica | Resolver ruta/depth del baño y contradicciones narrativas/markers | Depende de decisiones mínimas de A; habilita playtest fiable de C | Pruebas dirigidas verdes y QA manual del recorrido por las tres chicas |
| C — Noche de punta a punta | Inicio corto, final/resumen, restart; medir experiencia antes de completar decoración | Depende A/B; habilita balance global, callbacks y release | Dos runs seguidas, una con resultados mixtos y otra con baño, final comprensible y reset limpio |
| D — El elenco pertenece al patio | Cami primero; amigos y familia de fillers por lotes pequeños | Arte requiere masters y contratos; Cami puede producirse en paralelo a B/C | Cami conserva gameplay; focos humanos sin placeholders; Eze aprueba escala y placements |
| E — Fiesta mínima con consecuencias | Audio mínimo, callbacks y 3–5 eventos seleccionados; props más visibles | Depende de estado de run C y voces/assets D; no requiere alcohol | 2–3 momentos por run, sin interrumpir diálogo/baño y con outcomes recordados |
| F — Cierre de producción | UI, balance, oclusiones y candidato de release | Depende C/D/E, con recortes si E crece | QA inicio→fin→restart, controles claros, build reproducible y pendientes no críticos explícitos |

**RECOMMENDATION.** Cada fase termina con algo jugable y verificable. No abrir una fase “pulir todo” sin salida. Si D se demora, C debe poder validarse con los placeholders existentes; el arte no debe bloquear la decisión de cómo termina la noche.

## 13. SMALL EVENTS / AMBIENT LIFE IDEAS

**RECOMMENDATION — Criterio creativo.** Los siguientes 15 conceptos son propuestas nuevas basadas en lore o conversaciones verificadas. No son canon aprobado ni features existentes. XS: texto/condición muy acotados sobre una infraestructura ya disponible; S: disparador/presentación local; M: varias piezas o un contrato pequeño nuevo. El esfuerzo incluye integración/QA del evento, y aumenta si faltan assets. Los primeros eventos comparten un coste inicial S/M de disparo ambiental; no atribuir coste cero a esa infraestructura.

Elegir como máximo 3–5 para el primer catálogo, reproducir solo 2–3 por run. Recomendación inicial: **E01, E04, E09, E11 y E13**, si se aprueban sus voces y dependencias. No ejecutar cadenas automáticas sin pausas. Los gags de friends no habilitan sus voces definitivas como nuevos consejeros.

## 14. EVENT IDEA FORMAT — Catálogo

### E01 — Enzo, vení

- **Qué sucede:** una vez entre conversaciones, Thiago llama a Tambu “Enzo” por un asunto mínimo junto a su grupo; dos líneas de familiaridad áspera y termina, sin misión.
- **Por qué aporta:** transmite una relación propia y deja respirar después de una charla importante.
- **Sistemas reutilizados:** posiciones de `patioFriends`, presentación secuencial; necesita disparador por proximidad/estado libre y flag de run.
- **Scope:** S.
- **Riesgos / dependencias:** voz de Thiago aprobada a partir de CHARACTERS; no bloquear circulación ni interrumpir una conversación.
- **Recomendación:** V1 CANDIDATE.

### E02 — Pitity ya respondió

- **Qué sucede:** al acercarse a su grupo, alguien hace una pregunta trivial y Pitity contesta “Ez”; Tambu decide no intentar sacarle explicación. Ocurre una sola vez y no evalúa romance.
- **Por qué aporta:** usa su economía verbal en otro contexto sin gastar “Optimus” como saludo ambiental.
- **Sistemas reutilizados:** presentación de líneas, posición del amigo, condición once-per-run.
- **Scope:** S.
- **Riesgos / dependencias:** no competir con el Consejo ni repetir el mismo remate en una run; aprobar intercambio.
- **Recomendación:** NICE TO HAVE.

### E03 — Pocho tiene otro plan

- **Qué sucede:** Uriel anuncia que “después pasa por otro lado”; un mensaje breve reconoce que conoce a todos. La versión inicial termina ahí, sin hacerlo recorrer o salir del mapa.
- **Por qué aporta:** sugiere vida fuera del encuadre y comunica su personalidad social.
- **Sistemas reutilizados:** amigo existente, secuencia breve y flag tras una relación resuelta.
- **Scope:** S.
- **Riesgos / dependencias:** confirmar voz; no insinuar infidelidad real. Una salida animada sería alcance adicional y requiere lifecycle.
- **Recomendación:** NICE TO HAVE.

### E04 — No lo digas más fuerte

- **Qué sucede:** Santy arranca un comentario absurdo y desubicado dentro del grupo; Tobi o Tambu lo corta antes de que llegue a la conversación cercana.
- **Por qué aporta:** hace visible la diferencia entre humor privado y conducta social, sin convertir cada opción romántica en meme.
- **Sistemas reutilizados:** secuencia con speakers, posiciones fijas de amigos, disparo solo fuera de diálogo.
- **Scope:** S.
- **Riesgos / dependencias:** wording de Santy todavía necesita dirección; conservar remate corto y no quemar públicamente a Tambu.
- **Recomendación:** V1 CANDIDATE.

### E05 — Tobi no da una segunda consulta

- **Qué sucede:** tras usar el Consejo, un encuentro breve con Tobi al salir de esa conversación devuelve una reacción al hecho de haberle preguntado, sin sugerir otra opción ni modificar stats.
- **Por qué aporta:** une el Consejo modal con el amigo que existe en el patio.
- **Sistemas reutilizados:** catálogo de voces, presentación y resultado de conversación.
- **Scope:** S.
- **Riesgos / dependencias:** actualmente no se persiste quién aconsejó; requiere guardar ese dato mínimo y evitar un segundo consejo encubierto.
- **Recomendación:** NICE TO HAVE.

### E06 — La foto de los viernes

- **Qué sucede:** en una conversación incidental, Thiago o un amigo alude a la foto de Furiosos y Tambu intenta cortar el tema. No se muestra ni produce una fotografía nueva.
- **Por qué aporta:** un gag con historia compartida que no necesita otro sistema.
- **Sistemas reutilizados:** lore de CHARACTERS, secuencia breve, flag por run.
- **Scope:** S.
- **Riesgos / dependencias:** aprobar quién inicia y dónde; evitar repetir la misma exposición delante de las chicas.
- **Recomendación:** NICE TO HAVE.

### E07 — Sin informe, por favor

- **Qué sucede:** si Sofi terminó en Instagram y Tambu había ofrecido el informe, al pasar otra vez hay una sola línea seca que recuerda ese momento. No reabre su charla ni recalcula outcome.
- **Por qué aporta:** convierte el historial en una consecuencia reconocible y da vida a un resultado distinto de Baño.
- **Sistemas reutilizados:** history/signals persistidos de Sofi, presentación y disponibilidad de interactuables.
- **Scope:** S.
- **Riesgos / dependencias:** necesita un modo de callback distinto de conversación resuelta; texto nuevo aprobado, no sobreescribir canon congelado.
- **Recomendación:** V1 CANDIDATE.

### E08 — Energía de accidente

- **Qué sucede:** solo si Mili y Tambu compartieron la observación sobre la pileta, después se ve un pequeño amague torpe de un filler y un comentario breve de Mili. Nadie cae ni se añade natación.
- **Por qué aporta:** hace que una frase de la charla describa realmente la fiesta.
- **Sistemas reutilizados:** `mili_agreed_on_pool_accident`, grupo existente, tween local y línea incidental.
- **Scope:** M.
- **Riesgos / dependencias:** un filler reconocible y pose aprobada; no mover colliders ni hacerlo cruzar el agua; Mili debe seguir visible/elegible para el callback.
- **Recomendación:** NICE TO HAVE.

### E09 — Una fila menos en el Excel

- **Qué sucede:** si Cami y Tambu jugaron con el Excel sin llegar al sobrejuego, un callback corto tras Instagram recupera la broma. Si ella ya lo frenó, el gag no ocurre.
- **Por qué aporta:** premia recordar contexto, sin dar puntos extra por la respuesta “correcta”.
- **Sistemas reutilizados:** historial `beat-2:excel`, señales de overplay y outcome; presentación existente.
- **Scope:** S.
- **Riesgos / dependencias:** Cami visual y mecanismo de callback de resueltos; no asumir que toda ruta del Excel fue positiva.
- **Recomendación:** V1 CANDIDATE.

### E10 — Eze abandona el análisis

- **Qué sucede:** un cambio de tema musical hace que Eze deje una observación sobre gym/proyectos para irse al baile; la versión mínima es una línea y un giro/pose aprobada, sin traslado por el patio.
- **Por qué aporta:** enseña que Eze también vive la fiesta; no existe solo para dar consejos a Tambu.
- **Sistemas reutilizados:** amigo, presentación, pista musical cuando exista.
- **Scope:** M.
- **Riesgos / dependencias:** audio mínimo, pose/giro aprobado y prioridad contra Consejo; no inventar dance con walk ni deformar un sprite estático.
- **Recomendación:** NICE TO HAVE.

### E11 — El vaso que nadie pidió

- **Qué sucede:** el bartender termina una animación de trabajo y deja el remate textual de que nadie reconoce de quién era el pedido. Una línea del grupo cercano cierra el momento.
- **Por qué aporta:** conecta la animación decorativa ya existente con una pequeña situación de fiesta.
- **Sistemas reutilizados:** animación de trabajo del bartender, completion, presentación breve.
- **Scope:** S.
- **Riesgos / dependencias:** un hook controlado al ciclo existente y presupuesto ambiental; no inventario, compra ni alcohol jugable.
- **Recomendación:** V1 CANDIDATE.

### E12 — Todos conocen ese tema

- **Qué sucede:** al cambiar una canción, dos grupos reaccionan una vez mediante poses/giros aprobados; no todo el patio salta simultáneamente.
- **Por qué aporta:** un momento compartido hace sentir que hay una fiesta, no nueve conversaciones aisladas.
- **Sistemas reutilizados:** DJ, grupos y audio mínimo; animaciones aprobadas de población cuando existan.
- **Scope:** M.
- **Riesgos / dependencias:** no hay sistema de música actual; elegir tema utilizable y dos reacciones legibles. No animar a todos por rutina.
- **Recomendación:** V1 CANDIDATE.

### E13 — La puerta quedó famosa

- **Qué sucede:** tras el primer baño, un comentario privado de un amigo recuerda si Tambu aseguró la puerta o si cedió. No vuelve a premiar ni penalizar el resultado social.
- **Por qué aporta:** conecta el minijuego con el resto de la noche y hace que perder también produzca contenido.
- **Sistemas reutilizados:** resultado de Bathroom Resistance, secuencia de diálogo y ubicación del grupo.
- **Scope:** S.
- **Riesgos / dependencias:** persistir éxito/fracaso del evento y disparar después del retorno; limitar a uno por run y no reabrir el baño.
- **Recomendación:** V1 CANDIDATE.

### E14 — El cooler tiene dueño imaginario

- **Qué sucede:** dos fillers discuten en dos líneas quién dejó algo junto al cooler; ambos se desentienden y siguen en lo suyo.
- **Por qué aporta:** da intención a un prop activo sin una quest de recoger objetos.
- **Sistemas reutilizados:** placement del cooler, fillers cercanos y texto incidental.
- **Scope:** S.
- **Riesgos / dependencias:** prop y población aprobados, espacio para leer sin tapar a Cami; no agregar pickup ni colisión nueva.
- **Recomendación:** NICE TO HAVE.

### E15 — Última vuelta por el patio

- **Qué sucede:** al optar por cerrar la noche, un remate de amigo depende de un resultado vivido. Si no hubo romance exitoso, se recuerda un momento del grupo, sin presentar la run como contenido perdido.
- **Por qué aporta:** da conclusión y una razón emocional para repetir, más allá de puntos.
- **Sistemas reutilizados:** relaciones persistidas, historial de eventos propuesto y presentación secuencial.
- **Scope:** M.
- **Riesgos / dependencias:** contrato de cierre y resumen; no fabricar una escena nueva ni exigir ver todos los eventos.
- **Recomendación:** V1 CANDIDATE.

## 15. CHARACTER-SPECIFIC EVENT IDEAS

**VERIFIED FACT / RECOMMENDATION.** Esta tabla enlaza las propuestas con su fuente de personalidad; no convierte los gags en canon.

| Personaje | Fuente verificada | Momento propuesto | Límite que lo protege |
|---|---|---|---|
| Sofi | Tranquila, observadora, humor seco; informe/psicopedagogía en conversación | E07 | Una línea precisa; no volverla una máquina de sarcasmos o special idles |
| Mili | Iniciativa, vasos, baile y observación sobre piscina | E08 | Contexto real de su ruta; sin drink/hair-adjust nuevos por obligación |
| Cami | Ironía, Excel, castigo al sobrejuego | E09 | Callback condicionado; no premiar la misma broma cuando cayó mal |
| Pitity | Habla poco, Ez/Optimus y veredictos raros | E02 | Reservar Optimus para evidencia romántica fuerte |
| Uriel | Social, conoce gente, varios planes, pareja Agusti | E03 | No convertir el chiste de “infieles” en infidelidad canónica |
| Thiago | “Enzo”, intimidad áspera, La Abuela | E01 / E06 | Brevedad y familiaridad; su voz nueva requiere aprobación |
| Santy | Caos y desubicación dentro del grupo | E04 | No convertir toda la fiesta en su monólogo ni revelar datos a chicas |
| Tobi | Directo, corta sobreanálisis y también exceso | E04 / E05 | No empujar intensidad siempre, ni dar otra consulta gratuita |
| Eze | Observa, ayuda, gym/proyectos y modo baile; no expone públicamente | E10 / E13 | Reacción privada; keke excepcional y sin “hermano” |

**OBSERVATION.** El mayor rendimiento está en mostrar personalidad mediante momentos cortos y consecuencias. Dar a cada amigo un sistema completo diluiría la energía que hoy conviene poner en final, Cami y coherencia social.

## 16. PARTY-WIDE EVENT IDEAS

**RECOMMENDATION.** E11, E12, E13 y E14 cubren barra, música, baño y cooler; E15 hace participar al patio en el cierre. Elegir dos de esas áreas para la primera pasada, además de uno o dos callbacks personales. Evitar que todo evento ocurra al mismo tiempo o reclame input modal.

Un contrato mínimo puede expresar: `id`, condición, prioridad, cooldown, máximo por run y cleanup. La primera versión no necesita un editor, cronograma de cada NPC ni un bus universal. El coordinador no debe disparar durante diálogo, Consejo, BathroomEvent o cierre; si el jugador entra a una conversación, el texto ambiental debe terminar/cancelarse limpiamente. Las condiciones deben leerse del estado real, no de un timer que suponga que ya consiguió Baño.

**OBSERVATION.** Un corte de luz o una caída real a la piscina parece pequeño por su descripción, pero afecta iluminación, colisiones, assets y estados. No se incluye como candidato inmediato. Más rendimiento: un cambio de canción, una interrupción verbal o un callback de una decisión ya tomada.

## 17. REPLAYABILITY REVIEW

**VERIFIED FACT — Distribución exhaustiva actual.** Se enumeraron las 256 combinaciones de cuatro opciones por cuatro beats de cada conversación mediante el resolver real:

| Chica | Baño | Instagram | Friendzone | Rechazo |
|---|---:|---:|---:|---:|
| Sofi | 54 | 88 | 41 | 73 |
| Mili | 41 | 87 | 31 | 97 |
| Cami | 24 | 113 | 7 | 112 |

**OBSERVATION.** Estos conteos no son probabilidades de éxito de una persona jugando: suponen elecciones uniformes y no miden comprensión. Cami tiene Friendzone mucho menos representada y Baño más escaso. Puede ser carácter deliberado, no un bug de balance. **PLAYTEST VALIDATION REQUIRED:** si esa distribución produce matices interesantes o se siente binaria/castigadora.

**VERIFIED FACT.** El orden de acercarse a las chicas es libre; sus stats se resuelven independientemente. La misma secuencia de opciones genera el mismo outcome y el mismo Consejo contextual. El grass y los placements son deterministas; los idles aleatorios cambian gestos, no decisiones ni consecuencias. Las tres chicas se resuelven una vez; no hay variación de aperturas por run ni metaprogresión.

**RECOMMENDATION — Variación barata en orden de valor.**

1. Recordar uno o dos hechos de la run en callbacks y resumen, incluyendo resultados modestos o fracaso del minijuego.
2. Seleccionar un subconjunto de eventos por run; una semilla pequeña para lo ambiental permite reproducir problemas de QA.
3. Variar orden o momento de gags, con separación suficiente y sin alterar outcomes aleatoriamente.
4. Dar dos lecturas incidentales a un mismo rincón, sin mover chicas o colliders por azar.
5. Añadir variantes de líneas de Consejo solo después de resolver su memoria/precedencia; más texto no arregla las señales contradictorias.

**RECOMMENDATION.** No randomizar thresholds ni “hacer fallar” una respuesta coherente para forzar rejugabilidad. El jugador debe poder aprender a leer a las personas. La sorpresa debe estar en la fiesta y en nuevas consecuencias narrativas, no en castigos arbitrarios.

## 18. TOP RECOMMENDATIONS

### TOP 10 — HIGHEST VALUE IMPROVEMENTS

Todo lo siguiente es **RECOMMENDATION**. Esfuerzos relativos, no presupuestos ni fechas.

| # | Mejora | Beneficio | Esfuerzo | Dependencia principal | Momento |
|---|---|---|---|---|---|
| 1 | Contrato de noche + final/resumen/reintento mínimo | Convierte slice en experiencia terminable y permite medir ritmo | M | Decisión sobre vidas/cierre | Próximo hito |
| 2 | Recorridos al baño seguros y depth de Tambu | Corrige defecto visible en el evento central | S | T01/T02 y waypoints aprobados | Antes de ampliar eventos |
| 3 | Coherencia señales/Consejo y callback de Mili | Protege confianza del jugador en lectura social | S | T03/T04, revisión narrativa | Antes del playtest de balance |
| 4 | Cami real, sin idles avanzados | Elimina placeholder en el tercer foco jugable | M | Master/atlas aprobado | Paralelo al cierre |
| 5 | Custodia de masters + ficha de export + fuente remota única | Reduce retrabajo, deriva visual y pérdidas | S | Localizar y aprobar originales | Antes del próximo lote de arte |
| 6 | Amigos reconocibles y familia finita de fillers | Mayor salto de coherencia visual restante | L | Presupuesto cerrado de personajes/poses | Tras validar primer lote con Cami |
| 7 | Disponibilidad visual e instrucciones inequívocas | Evita falsas invitaciones y confusión SPACE/vidas/alcohol | S | Decisiones de UI y recursos de run | Con cierre funcional |
| 8 | Música/ambiente y pocos SFX con mute | Hace perceptible una fiesta y mejora feedback | M | Assets sonoros aprobados y arranque de audio | Antes de QA de ritmo final |
| 9 | 3–5 microeventos/callbacks, pocos por run | Identidad y consecuencias visibles con infraestructura mínima | M | Estado de run y voces aprobadas | Después del loop completo |
| 10 | Gate técnico y QA manual de run reproducible | Protege publicación y centra el trabajo en terminar | S | Contratos anteriores; Node validado | Instalar ahora, ampliar al cierre |

### TOP 5 — THINGS NOT TO DO YET

1. **Más mapas o más chicas.** Multiplican contenido y QA sin resolver cierre o consecuencias del elenco actual.
2. **Fábrica combinatoria de NPCs.** Muchas combinaciones de pelo/outfit/acciones generan contratos y QA nuevos; una familia pequeña de sprites alcanza para comprobar la necesidad.
3. **Otro paquete de special idles por personaje.** No sustituye personalidad, callbacks ni fin de noche; Mili ya demostró que más animación puede empeorar reposo.
4. **Alcohol profundo y consejeros nuevos simultáneamente.** Expande opciones, voces y balance antes de validar las tres conversaciones actuales. Si alcohol entra, recortar otra cosa explícitamente.
5. **Refactor general o nueva pasada artística de sectores estables.** Corregir fallos concretos; proteger césped, escala, macro-layout y recursos aprobados frente a mejoras indefinidas.

## 19. TECHNICAL DEBT REGISTER

La severidad mide riesgo real para continuidad/V1, no elegancia. HIGH no significa “código feo”. Las carencias de producto se identifican como tales.

| Área | Problema | Severidad | Cuándo resolver | Recomendación |
|---|---|---|---|---|
| Producto / estado de run | No existe fin/resumen/reintento; impide cumplir definición de noche completa | HIGH | Próximo hito | Contrato pequeño y flujo completo, sin esperar todo el arte |
| Producción visual | Masters aprobados no disponibles en main; fuente local frágil | HIGH | Antes de ampliar elenco | Custodia versionada o fuente externa durable y verificable; manifiesto |
| BathroomEvent | T01 acceso directo cruza piscina desde Mili/Cami | MEDIUM | Antes de validar run completa | Entradas seguras por zona y pruebas geométricas |
| Player/evento | T02 depth congelado durante traslado | MEDIUM | Con T01 | Actualización de pies visual independiente del input |
| Narrativa/Consejo | T03 suma señales positivas y negativas; prioridad tapa advertencia | MEDIUM | Antes de balance/contenido extra | Contrato de emits y precedencia explícitos; ruta 4,4 |
| Narrativa Mili | T04 referencia a robo sin elección correspondiente | MEDIUM | Próxima corrección narrativa | Condición de historial o variante aprobada |
| Interacción/UI | T05 marker sigue activo visualmente en resueltos | MEDIUM | Con UI/cierre | Estado visual derivado de disponibilidad real |
| Documentación | D01–D10: estados, footprints, precedencia y alcances inconsistentes | MEDIUM | Antes del siguiente brief afectado | Corregir en fuente de dominio; no duplicar contratos |
| Git/workflow | Checkout e historia remota divergentes; archivos locales no publicados | MEDIUM | Inicio/publicación de cada tarea | Head remoto único, diff acotado y confirmación de ref |
| Entorno/tests | README enumera mínimos Node de build; tests usan `node:module.registerHooks`; package sin engine/gate propio | MEDIUM | Próxima tarea de tooling | Fijar versión efectivamente validada y probar instalación limpia; no asumir que todo mínimo de Vite corre los tests |
| QA de integración | Mocks validan llegada, no geometría/depth; poca cobertura de interacción/player | MEDIUM | Con fixes de sus dominios | Pruebas dirigidas al contrato, no más snapshots de constants |
| Lifecycle | Actor retirado sin dispose de timer propio; hidden NPC puede seguir animándose | LOW | Antes de entradas/salidas o reinicio explícito | Cancelación por actor/escena y test de recursos activos |
| Consejo | T06 anti-repetición solo local a sesión; reglas inalcanzables o heredadas irrelevantes | LOW | Al trabajar rejugabilidad | Memoria pequeña si se aprueba; auditar prefijos consultables |
| Catálogo de reacciones | Mapeo por texto literal puede romper con copy edit | LOW | Cuando se editen esas líneas | ID estable o reacción junto al consejo |
| Assets distribuidos | 47 candidatos/variantes sin carga, pero incluidos en public | LOW | Preparación de release | Separar archivo y runtime tras revisar estado |
| Duplicación visual | Helpers Sofi/Mili y branches por tipo | LOW | Integración Cami si repite contrato | Adapter mínimo; conservar especificidad de animaciones |
| Snapshot social | Copia superficial de entradas anidadas | LOW | Si aparece consumidor mutante | Copiar solo lo requerido o contrato de inmutabilidad |
| Datos residuales | Depths/playerConfig y paleta legacy sin uso real | LOW | Mantenimiento local oportunista autorizado | Eliminar en tarea acotada, nunca como requisito para V1 |

**OBSERVATION — Decisiones abiertas, no bugs automáticos.** Destino de la chica al terminar baño; reintento de charla con ESC; función de vidas; inclusión de alcohol; dificultad de Cami y memoria de Consejo. Requieren dirección. La retirada de breathing, la exclusividad down del blink de Mili y la independencia de recompensa/resistencia son decisiones vigentes que deben protegerse.

## 20. FINAL DIRECTOR NOTE

**OBSERVATION.** Tambu está haciendo bien lo difícil de copiar: tiene voz, relaciones reconocibles y situaciones que pertenecen a este grupo. Su arquitectura ya permite contar más sin reconstruir el motor. También existe una buena práctica de aceptar el resultado del QA, incluso cuando obliga a retirar un asset integrado.

Debe proteger el patio único, la escala aprobada, las personalidades diferenciadas, el Consejo que interpreta sin resolver y el humor con timing. La energía ahora conviene concentrarla en conectar esos logros: que el mundo recuerde lo vivido y que la noche pueda terminar.

**RECOMMENDATION.** Después de Sofi/Mili, el próximo gran objetivo es **una primera noche completa de Tambu**, con Cami visual en paralelo, recorridos seguros, consecuencias coherentes, un cierre propio y reinicio. Luego unos pocos momentos del grupo y audio pueden darle más vida que otra larga serie de animaciones aisladas.

**PLAYTEST VALIDATION REQUIRED:** ninguna inspección estática puede certificar que esa noche sea divertida. Este informe aporta un orden concreto para llegar a la prueba que importa, sin implementar sus recomendaciones ni alterar el juego.
