# Tambu Game — Estado actual

**Versión:** 1.1
**Última verificación:** 2026-09-28
**Base runtime inspeccionada:** `main@4101516`
**Auditoría vigente:** [`PROJECT_AUDIT_2026-09-28.md`](./PROJECT_AUDIT_2026-09-28.md)
**Autoridad:** estado, vigencia, prioridades y límites del proyecto

Este es el punto de entrada obligatorio antes de diseñar, producir assets o modificar el juego. Su función es evitar que un agente confunda una especificación histórica, un objetivo futuro o un archivo disponible con algo aprobado en runtime.

## Cómo interpretar este documento

- **Congelado:** no se cambia salvo decisión explícita de dirección.
- **Integrado / estable:** está en `main` y es la base vigente. Puede recibir fixes acotados, no rediseños silenciosos.
- **En validación:** está integrado, pero todavía puede requerir correcciones dirigidas por playtest o revisión visual.
- **Provisional / placeholder:** funciona, pero no representa la calidad final buscada.
- **Disponible, no aprobado:** existe un archivo o kit en el repo, pero no forma parte del runtime vigente.
- **No implementado:** no debe describirse ni tratarse como funcional.

## Resumen ejecutivo

Tambu ya tiene una **primera noche funcional completa**: intro, exploración, tres conversaciones, outcomes persistidos, Bathroom Event, Bathroom Resistance, regreso al patio, GAME OVER, NORMAL END, PERFECT NIGHT, retry limpio y continuación post-win. La primera auditoría describía un vertical slice sin cierre; ese bloqueo ya está resuelto y la QA manual del 27 de septiembre validó las tres rutas terminales.

La segunda auditoría integral del 28 de septiembre no encontró una deuda arquitectónica general ni un crash estructural que obligue a frenar la V1. El trabajo restante es de **cierre de producto**: corregir contratos locales comprobados, cerrar el elenco focal, reducir el contraste de población procedural, dar identidad narrativa a los tres Baños, integrar audio mínimo y llevar onboarding/HUD/UI central al lenguaje ya aprobado. **Bathroom Resistance Pass 2 ya fue corregido, playtesteado manualmente y aceptado como baseline de balance.**

La regla de dirección pasa a ser: **dejar de demostrar que el juego puede crecer y empezar a terminar esta única noche**. No se reabren sectores estables ni se agregan animaciones, sistemas o personajes por volumen; cada pieza nueva debe justificar impacto visible en la V1.

## Baselines congeladas

### Producto y alcance

- La V1 ocurre en un único mapa: **la fiesta en el patio**.
- El objetivo es terminar una noche completa, pulida y rejugable antes de agregar otros mapas o una campaña mayor.
- La piscina sigue siendo el centro físico y visual; DJ a la izquierda, barra a la derecha, casa/deck arriba y acceso abajo.
- El arte se adapta al macro-layout y a la jugabilidad existentes. No se rediseña el mapa para acomodar una imagen.

### Escala y rendering

- Grid lógico del entorno: `16x16 px`.
- Cámara principal: `zoom = 1`.
- Tambu: frames `32x48 px`, escala runtime `1.24`.
- Tambu es la unidad humana oficial. No se reescala para corregir assets ajenos.
- Pixel art sin antialias, con nearest-neighbor y lectura prioritaria al tamaño real de juego.

### Césped

- Fuentes runtime aprobadas:
  - `public/assets/tiles/grass/tx_tileset_grass_night.png`;
  - `public/assets/tiles/grass/tx_plant_grass_details_night.png`.
- Paleta Night Grass vigente: `#122D23`, `#153427`, `#183A2B`, `#1C4230`, `#214A35`, `#28533A`, `#316040`.
- Dos `TilemapLayer` deterministas de `16x16`; centro más calmo y detalle vegetal más denso hacia bordes.
- Sin tierra, zonas worn, verdes amarillentos, macros legacy, imágenes por celda ni `Math.random()`.
- Los píxeles de los dos tilesets integrados no se modifican durante una integración.

### Sistema social

- Stats ocultos: `attraction`, `trust`, `intensity`.
- Historial, señales, micro-branches, branches contextuales y resolución por outcomes.
- **Baño** es el outcome máximo actual y se resuelve fuera de la lógica social mediante la capa de eventos.
- El Consejo tiene un uso por conversación y conserva su regla anti-repetición.
- Las bases narrativas aprobadas de Sofi, Mili y Cami no se reescriben durante tareas visuales o técnicas.

### Lenguaje de UI

- `docs/UI_DIRECTION.md` es la autoridad especializada para HUD, diálogos, prompts, pantallas de estado, resultados y menús.
- La baseline global queda definida por la intro, GAME OVER, PERFECT NIGHT y NORMAL END: display pixel 5×7, fondos nocturnos profundos, frames/dividers azul grisáceo, blanco jerarquizado, geometría ortogonal, composición con aire y prompts secundarios.
- `src/ui/pixelText.js` es la fuente runtime de tipografía display. Los textos largos no están obligados a usar 5×7 si perjudica legibilidad.
- GAME OVER conserva su rojo opaco como excepción semántica; no habilita a usar colores fuertes como decoración general.
- El timing forma parte de la UI: primero se comunica el momento, después se habilita el input; ENTER/SPACE residual debe consumirse durante transiciones.
- Nuevas pantallas no pueden inventar una identidad aislada: deben partir de `UI_DIRECTION.md` y de las baselines integradas.

## Integrado y estable

### Amigos principales — CLOSED / FROZEN FOR V1

- **CAST CLOSURE — CLOSED / FROZEN FOR V1 (Dirección, 2026-10-02).**
- Los seis amigos principales usan sprites runtime propios: **Eze, Pitity, Uriel, Santy, Thiago y Tobi**.
- Todos conservan walk 4 direcciones + idle DOWN dentro de la arquitectura genérica de `friendSprite.js`; no queda ningún amigo principal procedural.
- Paquetes V1 de special idles cerrados:
  - Eze: blink + drink + drunk.
  - Pitity: blink + phone-check.
  - Uriel: blink + phone-check.
  - Santy: blink + phone-check + drink.
  - Thiago “La Abuela”: blink + drink.
  - Tobi: drink + arms-crossed.
- Uriel y Thiago completaron la última pasada técnica: sus bases, walks y specials están integrados; la validación automatizada más reciente terminó en **226/226 tests aprobados** y `npm run build` correcto.
- La Dirección da por aprobado el elenco de amigos para V1. Desde este punto **no se producen nuevos sprites, walks, special idles ni correcciones cosméticas de amigos antes de V1**, salvo bug visual/runtime concreto que rompa lectura, identidad o gameplay.
- Specials previamente descartados o diferidos, como el dance de Santy o un blink adicional de Tobi, permanecen fuera del scope V1 y no constituyen deuda de cierre.

### Arquitectura

- `PatioScene` funciona como orquestador.
- Mundo modularizado en césped, deck, casa, piscina, barra, DJ, perímetro y colisiones.
- Sistemas separados para interacción, diálogo, flujo de conversación, estado social, Consejo, outcomes y eventos.
- Movimiento con teclado, cámara con seguimiento, bounds y Arcade Physics.

### Mundo visual con assets de producción

| Sector | Runtime vigente | Estado |
|---|---|---|
| Césped | Dos TilemapLayers y whitelist de tiles | Congelado |
| Deck | Superficie, borde, transición, luces y props seleccionados | Integrado / estable |
| Casa | Pared, banda, ventanas, puertas, lámparas y jardineras | Integrado / estable |
| Piscina | Frame, superficie continua, luces, escalera y flotadores | Integrado / estable |
| Barra | Kit modular, props y bartender animado | Integrado / estable |
| DJ | Estructura por planos, consola, parlantes animados y DJ residente | Integrado / estable |
| Perímetro | Laterales top-down, seto inferior y uniones de esquina | En validación visual |
| Tambu | Spritesheet 4 direcciones, idle y walk | Integrado / estable |
| Sofi | Walk 4 direcciones, idle estable con blink ocasional, special idles de teléfono/bebida en down y caminata del evento del baño | Integrado / estable |
| Mili | Atlas 4 direcciones, idle estático, blink down ocasional, hair adjust y drink down esporádicos, y caminata del evento del baño | Congelado |
| Cami | Atlas 4 direcciones, idle estático, blink/hair touch/hand-on-hip ocasionales en down, walk y caminata del evento del baño; polish fino diferido | Integrado / estable |

“Estable” significa que estos sectores son la base vigente. Una tarea nueva no puede reemplazarlos o reinterpretarlos si su scope no lo autoriza de forma explícita.

### Gameplay social y contenido

- Sofi, Mili y Cami tienen conversaciones data-driven de cuatro beats.
- Las tres conversaciones usan stats, historial, señales, Consejo y outcomes.
- Mili ya corrigió incoherencias previas entre variantes, señales, Consejo y callbacks de vaso. La auditoría del 28/09 detectó una segunda inconsistencia acotada en las variantes `too-much-teasing-*`: la reacción negativa todavía puede conservar emits positivos de la choice base en el history. Queda pendiente un fix dirigido con `suppressEmits`; no implica reabrir el balance social completo.
- Presentación secuencial de intervenciones, respuestas y cierre de outcome.
- Persistencia de outcome por personaje durante la run: el arco principal queda cerrado y sin recompensas repetidas; la chica sigue interactuable con una reacción breve según outcome, sin `!`.
- Puntos y vidas se actualizan según el outcome.

### Evento del baño

- `OutcomeEventSystem` desacopla el resultado social del evento especial.
- Caminata de Tambu y la chica hasta el baño con rutas específicas por sector, diagonales/formation naturales, ritmo relajado y tramo común recién cerca de la puerta.
- Depth por body/pies durante el recorrido y retorno de Tambu alineado frente a la puerta del baño, fuera de colliders.
- Al cerrar el resultado, Tambu recupera control frente a la puerta; la chica vuelve visible junto a él e inicia en background un camino seguro hasta su anchor social temporal, donde queda mirando down, retoma sus idles normales/special idles, permanece interactuable, con label visible y marker oculto.
- Anticipación, golpes, barra de resistencia, input con `SPACE`, éxito o fracaso y regreso al patio.
- El outcome social Baño se conserva si la chica acepta y llegan al evento, pero la recompensa se difiere hasta Bathroom Resistance: success acredita +500 y persiste `bathroomResult: secured`; failure acredita +250, persiste `bathroomResult: interrupted` y no quita vida. La acreditación es idempotente y la futura Perfect Night contará solo Baños asegurados.

### Bathroom Resistance 2.0 — correction pass

**CORRECTION PASS INTEGRATED / VISUAL QA REQUIRED (2026-10-04).** Se implementó la corrección dirigida de UI, pacing y staging de puerta. La autoridad narrativa sigue siendo `docs/BATHROOM_RESISTANCE_2_DIRECTION.md`. No se declara CLOSED ni aprobación visual; el balance Pass 2 permanece congelado.

- `createBathroomChallengeUi()` mantiene un único panel compuesto para Resistance y resolución: marco de 760×310 a 1280×720, núcleo de 210 px y reaction dock inferior reservado de 100 px. Título, timer, speaker y prompts usan `pixelText`; se agregaron los glifos Á/Ó necesarios sin cambiar los existentes. El dock reutiliza portraits nativos 64×64 con `framed: false`, sin segunda caja flotante.
- Los seis PNG aprobados siguen intactos en `public/assets/ui/portraits/friends/`, RGBA 192×64, expresiones TALK/ANGRY/SHOUT = 0/1/2 y nearest-neighbor. La UI no conoce `gameState` ni decide ramas narrativas.
- No se muestra ningún `PUM`. Los marcadores puros pueden permanecer en la data, pero no borran la última frase hablada. SPACE conserva su feedback mecánico.
- `createHouseFacade()` devuelve `{ bathroomDoor: { sprite, label } }`; `createPatioWorld()` propaga esas mismas referencias y `PatioScene.worldVisuals` las entrega al evento, junto con los bounds reales del baño. No se duplicó la puerta ni se buscaron objetos globalmente.
- `bathroomDoorStaging.js` controla la presentación con delta, sin nuevos timers/tweens: approach 400 ms a zoom 1.75, pausa inicial 250 ms, impactos a 650/850/1050 ms, voces a 1700/3200 ms y retorno de cámara durante los últimos 350 ms. Anticipación visual total 4800 ms. Se restauran zoom, scroll, follow, lerp/offset y bounds antes de comenzar los 10 s activos o al abortar.
- Los impactos mueven sprite y label juntos con offsets enteros +2/−2/+1/0 durante 120 ms, sin rotación/scale/deformación. Los siete hits activos disparan impacto y conservan shake 80 ms/0.002. Finish/destroy/shutdown restauran exactamente ambos neutrales.
- `bathroomReactionTimeline.js` separa exposición hablada de daño: mínimo 1600 ms para intentos 1/2, 1400 ms para el caos del tercero y 2000 ms reservados para memoria. Todas las voces caben dentro del minijuego; los golpes no retrasan el reloj. La última intervención de anticipation conserva el mismo widget al entrar a Resistance.
- Success/failure transforma el mismo panel: título, reward liquidado, reaction dock y prompt de retorno. ENTER/SPACE se consumen durante 900 ms; el frame que habilita el prompt tampoco devuelve al patio sin una nueva pulsación de ENTER.
- Copy, speakers, expresiones y memoria aprobada permanecen intactos. `getCompletedBathroomResults()` excluye pending y otros outcomes; `PatioScene` resuelve perfil + narrativa una sola vez al iniciar el evento.
- Balance, duración activa 10 s, SPACE +4/JustDown, ordinal, los siete timings/daños/drains, rewards secured +500/interrupted +250, vidas, Perfect Night, rutas, velocidad y retornos no cambiaron. `bathroomResistance.js`, `bathroomResistanceNarrative.js`, `gameState.js` y `patioLayout.js` permanecen byte por byte iguales a la base sincronizada.
- **253/253 tests aprobados, 0 fallos, 0 omitidos. `npm run build` correcto**, con advertencia existente de bundle >500 kB. Cobertura de referencias world→scene→event, impacto sin drift, snapshot/restore de cámara, timeline y memoria, panel/dock estables, knock persistence, handoff de anticipation, seis resoluciones, input gate, rewards y cleanup/retry. No se ejecutó navegador ni QA visual. Próximo paso: **MANUAL VISUAL QA BY DIRECTION** sobre los tres intentos; PARTY PRESENCE no se inicia todavía.

### Ciclo de la run

- `src/state/runState.js` mantiene las fases `INTRO`, `PARTY_ACTIVE`, `GAME_OVER`, `NORMAL_END`, `PERFECT_NIGHT` y `POST_WIN_FREE_ROAM`, sin duplicar puntos, vidas ni resultados sociales.
- La intro activa la run una sola vez. `PatioScene` evalúa finales cuando intro, outcome event y diálogo ya terminaron; el retorno de una chica sigue en background y no bloquea la evaluación. La evaluación ocurre antes de habilitar otra interacción en el mismo frame.
- GAME OVER tiene prioridad con cero vidas y queda aceptado como baseline: congela gameplay, conserva ~900 ms el último frame para timing cómico, luego muestra rojo opaco con `SOS UN HIJO DE PUTA` en glifos pixelados 5×7; el prompt de retry aparece 450 ms después. ENTER o SPACE reinicia `PatioScene` desde una escena/run nueva. PERFECT NIGHT requiere que Sofi, Mili y Cami tengan outcome `bathroom` y resultado `secured`; con las tres resueltas, vidas restantes y sin Perfect Night se alcanza `NORMAL_END`.
- `PERFECT_NIGHT` está integrado funcionalmente: conserva el HUD durante un beat de 700 ms y luego muestra un overlay oscuro con `3 / 3`, `NOCHE PERFECTA` y `3 BAÑOS ASEGURADOS` en tipografía pixelada; el prompt aparece 500 ms después. ENTER o SPACE llama `continueParty()` y transiciona a `POST_WIN_FREE_ROAM` dentro de la misma run: se oculta la UI, vuelve el HUD y se conservan puntos, relaciones y posiciones. En post-win Tambu puede caminar y usar las reacciones post-outcome existentes; no hay contenido postgame nuevo.
- `NORMAL_END` congela el gameplay y conserva el patio con HUD durante 700 ms; después aparece un tablero arcade pixelado con filas alineadas para Sofi/Mili/Cami, resultados explícitos y el puntaje en un marco separado, y se oculta el HUD. El resumen lee un snapshot de `getRunSummary(gameState)`, distingue Baño asegurado e interrumpido y muestra los puntos finales sin recalcularlos. Tras 500 ms aparece `ENTER / SPACE · VOLVER A JUGAR`; la entrada reinicia `PatioScene` para iniciar otra run limpia desde la intro. No hay botón de menú principal porque todavía no existe una Start/Menu Scene.
- El reinicio de Scene detiene primero outcome/retornos y después cancela los timers y listeners de special idles. Intro, UI, diálogo y eventos limpian sus objetos o estado en `SHUTDOWN`.
- **FIRST COMPLETE NIGHT — CLOSED / BASELINE (QA manual 2026-09-27):** Eze validó las tres rutas completas: GAME OVER → retry → nueva intro limpia; NORMAL END con outcomes mixtos → summary/replay → nueva intro limpia; y 3 Baños secured → PERFECT NIGHT → POST_WIN_FREE_ROAM. El loop de principio a fin deja de ser un blocker funcional y pasa a baseline protegida para las siguientes capas de contenido/polish.

### Cobertura automatizada

Hay tests para sistema social, Sofi, Mili, Cami, Consejo, presentación y flujo de diálogo, outcomes, evento del baño, resistencia, césped, lifecycle de la intro, fases de la run, Game Over/retry, presentación/transición de Perfect Night y resumen/replay de Normal End. La segunda auditoría ejecutó **193/193 tests aprobados, 0 fallos, 0 omitidos**, y `npm run build` correcto sobre `main@4101516`. Los tests no sustituyen QA visual, renderer real ni playtest de dificultad.

## Provisional / placeholder

### Población de relleno

- Los **37 fillers** siguen siendo provisionales; ocho tienen tween de baile y varias etiquetas de actividad todavía no producen una acción visible.
- La V1 no exige 37 diseños únicos: se resolverá con una familia pequeña/reutilizable y pocas actividades legibles.
- El cierre de amigos principales no implica cerrar fillers; son un bloque separado de PARTY PRESENCE.

### Props y ambientación activa

`createPatioWorld.js` todavía dibuja mediante `Graphics`:

- mesas de fiesta;
- cooler;
- faroles del patio;
- guirnaldas y postes;
- vasos, botellas y clutter pequeño.

Cumplen función espacial, pero no son arte final.

### UI

- El lenguaje visual global ya está definido y documentado en `docs/UI_DIRECTION.md`.
- Intro, GAME OVER, PERFECT NIGHT y NORMAL END son las referencias runtime principales de ese lenguaje.
- HUD de vidas, alcohol y puntos sigue funcional pero su layout específico es provisional.
- Prompt de interacción, diálogo, Consejo, outcomes y Bathroom Resistance siguen funcionales/provisionales y deben converger al sistema global mediante tareas dedicadas, no mediante rediseños silenciosos.
- `alcohol` existe en state y todavía se muestra como `0%` en el HUD, pero no tiene gameplay. **Dirección decide no implementar un sistema de alcohol antes de V1**: el indicador debe ocultarse en la pasada de UX salvo que una decisión posterior reabra explícitamente esa mecánica.

## Disponible en el repo, no aprobado para runtime

`public/assets/props/patio/` contiene un kit de bancos, mesas, cooler, macetas, arbustos y poufs. Una integración ambiental anterior fue revertida. Estos PNG son **candidatos**, no una orden de colocación ni una familia aprobada automáticamente.

Antes de reutilizarlos se debe revisar en contexto:

- escala frente a Tambu;
- perspectiva top-down / 3/4;
- paleta y contraste;
- función dentro de la composición;
- colisión y circulación;
- compatibilidad con los sectores vecinos.

El hecho de que un archivo exista en `public/assets` no significa que esté aprobado.

## En validación o ajuste

- Intro de la noche `00:00 → 00:01`: blackout desde el primer frame, reloj pixelado, transición blanco → ventana, reveal centrado y túnel final a través del `:` integrados. Baseline visual aprobada para avanzar; quedan microdetalles de polish diferidos para una pasada posterior.
- Perímetro actual: comprobar en juego continuidad de laterales, oclusión de pies en el seto inferior y uniones de ambas esquinas.
- Retorno post-baño: rutas seguras temporales por personaje, retorno a facing down e idles normales/special idles validados manualmente.
- Balance numérico de rutas sociales y recompensas: la estructura está implementada, pero el playtest puede justificar ajustes.
- **Bathroom Resistance — BALANCE PASS 2 CLOSED / BASELINE:** el ordinal runtime cuenta solo resultados previos liquidados (`secured` o `interrupted`), excluyendo el outcome `bathroom` pending del evento actual. Los tres perfiles mantienen SPACE `+4`, 10 s y siete golpes con dificultad progresiva 1/2/3. Eze ya realizó el playtest manual posterior al rebalance y la baseline actual queda aceptada. No ajustar números nuevamente salvo evidencia nueva de playtest.
- **Contrato de input pendiente:** la UI actual dice `SPACE · MANTENÉ LA PUERTA CERRADA`, pero el runtime usa `JustDown`; el jugador debe pulsar repetidamente. Corregir el copy, no la mecánica, antes de congelar onboarding.
- **Depth de amigos pendiente:** `createFriendSprite()` aplica `y + 30`, pero `createCharacters()` vuelve a ejecutar `sprite.setDepth(friend.y)` y pisa ese offset. Requiere fix local + QA visual, no refactor.
- **History de Mili pendiente:** las variantes `too-much-teasing-*` deben suprimir emits positivos incompatibles de la elección base antes de agregar más callbacks sociales.
- Composición ambiental general: debe evaluarse después de resolver población visual suficiente, evitando llenar espacios por llenar.

## No implementado

- QA visual y cierre de los sprites runtime de los seis amigos principales; sprites runtime de NPCs de relleno.
- Sistema modular de población/NPCs con outfits, peinados y acciones reutilizables.
- Sistema general de eventos ambientales del patio; hoy existe el evento especial del baño, no una fiesta autónoma completa.
- Gameplay de alcohol y sus efectos.
- Audio, música y efectos de sonido integrados al runtime.
- Menú inicial y contenido nuevo de post-win. GAME OVER, NORMAL_END con resumen/replay y Perfect Night con su transición a free roam están integrados.
- Aplicación completa del nuevo lenguaje de UI a HUD, diálogo, Consejo, outcomes y Bathroom Resistance; la dirección global ya está definida, pero esas superficies todavía no tienen layout final.
- Controles táctiles/mobile.
- Guardado o persistencia entre sesiones.
- Otros mapas, días o campaña posterior a la fiesta.

## Prioridad vigente

La segunda auditoría del 28/09 confirma que el loop funcional ya está cerrado. El roadmap activo de Dirección es:

1. **STABILIZATION PASS** — corregir copy de SPACE, overwrite de depth de amigos y emits falsos de Mili. Bathroom Resistance Pass 2 ya está playtesteado y no forma parte de esta pasada salvo el copy de input engañoso.
2. **CAST CLOSURE — CLOSED / FROZEN FOR V1** — los seis amigos principales, sus walks/idles y los paquetes de special idles aprobados quedan cerrados. No reabrir producción individual de amigos salvo bug concreto.
3. **BATHROOM RESISTANCE 2.0 — IDENTIDAD NARRATIVA / DIRECTION APPROVED** — dirección congelada en `docs/BATHROOM_RESISTANCE_2_DIRECTION.md`: intento 1 = sorpresa (Pitity), intento 2 = incredulidad (Tobi + Uriel), intento 3 = caos (Santy + Thiago + Eze), con portraits 64×64 TALK/ANGRY/SHOUT y memoria real de resultados previos. **CORRECTION PASS REQUIRED — UI / PACING / DOOR STAGING** tras QA visual. Portrait/memory/narrativa base se conservan; balance/rewards siguen congelados.
4. **PARTY PRESENCE** — audio mínimo con mute/volumen + lote pequeño de fillers/actividades + 2–3 callbacks o beats ambientales de alto impacto. No construir simulación social.
5. **V1 UX CLOSURE** — menú/onboarding mínimo, ocultar alcohol vacío, alinear HUD/diálogo/Consejo/outcomes/Resistance a `UI_DIRECTION.md` y asegurar que todos los prompts describan el input real.
6. **FEATURE FREEZE** — una vez cerrados los bloques anteriores no se agregan mecánicas, personajes o specials por impulso; solo fixes surgidos de QA.
7. **RELEASE CANDIDATE / PLAYTEST** — tests + build verdes, smoke manual de las tres terminaciones y reintentos, QA visual del elenco/UI y playtest con personas que completen una noche sin explicación oral del creador.

Audio puede prepararse en paralelo al cierre del cast cuando no dependa de assets visuales. Los sectores estables solo se tocan ante un defecto concreto.

### Regla de recorte V1

Quedan fuera antes de V1 salvo reapertura explícita de Dirección:

- segundo mapa/campaña/progresión entre días;
- más chicas por volumen;
- alcohol profundo;
- social roaming/schedules;
- pathfinding general;
- gran factory de outfits/fillers;
- specials únicos para todos los amigos;
- touch/save slots;
- migración arquitectónica o UI/audio managers universales;
- optimización de bundle sin un problema medido.

## Límites para agentes

### Dirección

- Decide prioridades, alcance y criterios de aprobación.
- No considera “terminado” algo solo porque compila.
- No envía a producción una idea sin definir función, contexto y límite.

### Producción visual

- No genera Tier A/B aislado del mapa y de Tambu.
- Produce familias coherentes, no objetos sueltos sin sistema.
- Entrega transparencia, escala, perspectiva y variantes necesarias antes de integración.
- No modifica código ni declara aprobado un asset sin prueba contextual.

### Integración

- Implementa decisiones aprobadas sin rediseñar.
- Puede resolver arquitectura, depths, colliders, carga, animación y performance.
- Si el asset o la especificación no funciona, reporta `ASSET BLOCKER` o `SPEC BLOCKER`; no fabrica un reemplazo improvisado con primitives.
- No toca sectores fuera del scope de la tarea.

## Cuándo actualizar este archivo

Actualizarlo en el mismo cambio cuando:

- un placeholder pasa a producción;
- un sistema importante se implementa o se elimina;
- una baseline se congela o se abre nuevamente;
- cambia el orden de prioridades;
- un documento deja de estar vigente;
- aparece una nueva contradicción resuelta.

No hace falta modificarlo por microajustes que no cambian el estado conceptual del proyecto.
