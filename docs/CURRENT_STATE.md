# Tambu Game — Estado actual

**Versión:** 1.0
**Última verificación:** 2026-09-27
**Base inspeccionada:** `main@55eecb0`
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

Tambu ya es un vertical slice jugable de la fiesta en el patio. La arquitectura, el loop social, las tres conversaciones principales y el evento del baño tienen implementación real y tests. El escenario combina sectores de producción con una capa todavía provisional: la mayoría de las personas y varios props ambientales continúan dibujados con primitives de Phaser.

La estructura del juego está más avanzada que su presentación. El próximo salto de calidad no consiste en rediseñar el mapa ni volver a producir sectores estabilizados, sino en crear la población visual, dar vida ambiental al patio y completar el loop de la noche.

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
- Mili ya tiene coherencia entre variantes, señales y Consejo: una advertencia puede suprimir señales base contradictorias, y sus callbacks de vaso respetan el historial real.
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

### Ciclo de la run

- `src/state/runState.js` mantiene las fases `INTRO`, `PARTY_ACTIVE`, `GAME_OVER`, `NORMAL_END`, `PERFECT_NIGHT` y `POST_WIN_FREE_ROAM`, sin duplicar puntos, vidas ni resultados sociales.
- La intro activa la run una sola vez. `PatioScene` evalúa finales cuando intro, outcome event y diálogo ya terminaron; el retorno de una chica sigue en background y no bloquea la evaluación. La evaluación ocurre antes de habilitar otra interacción en el mismo frame.
- GAME OVER tiene prioridad con cero vidas y queda aceptado como baseline: congela gameplay, conserva ~900 ms el último frame para timing cómico, luego muestra rojo opaco con `SOS UN HIJO DE PUTA` en glifos pixelados 5×7; el prompt de retry aparece 450 ms después. ENTER o SPACE reinicia `PatioScene` desde una escena/run nueva. PERFECT NIGHT requiere que Sofi, Mili y Cami tengan outcome `bathroom` y resultado `secured`; con las tres resueltas, vidas restantes y sin Perfect Night se alcanza `NORMAL_END`.
- `PERFECT_NIGHT` está integrado funcionalmente: conserva el HUD durante un beat de 700 ms y luego muestra un overlay oscuro con `3 / 3`, `NOCHE PERFECTA` y `3 BAÑOS ASEGURADOS` en tipografía pixelada; el prompt aparece 500 ms después. ENTER o SPACE llama `continueParty()` y transiciona a `POST_WIN_FREE_ROAM` dentro de la misma run: se oculta la UI, vuelve el HUD y se conservan puntos, relaciones y posiciones. En post-win Tambu puede caminar y usar las reacciones post-outcome existentes; no hay contenido postgame nuevo.
- `NORMAL_END` congela el gameplay y conserva el patio con HUD durante 700 ms; después aparece un tablero arcade pixelado con filas alineadas para Sofi/Mili/Cami, resultados explícitos y el puntaje en un marco separado, y se oculta el HUD. El resumen lee un snapshot de `getRunSummary(gameState)`, distingue Baño asegurado e interrumpido y muestra los puntos finales sin recalcularlos. Tras 500 ms aparece `ENTER / SPACE · VOLVER A JUGAR`; la entrada reinicia `PatioScene` para iniciar otra run limpia desde la intro. No hay botón de menú principal porque todavía no existe una Start/Menu Scene.
- El reinicio de Scene detiene primero outcome/retornos y después cancela los timers y listeners de special idles. Intro, UI, diálogo y eventos limpian sus objetos o estado en `SHUTDOWN`.
- **FIRST COMPLETE NIGHT — CLOSED / BASELINE (QA manual 2026-09-27):** Eze validó las tres rutas completas: GAME OVER → retry → nueva intro limpia; NORMAL END con outcomes mixtos → summary/replay → nueva intro limpia; y 3 Baños secured → PERFECT NIGHT → POST_WIN_FREE_ROAM. El loop de principio a fin deja de ser un blocker funcional y pasa a baseline protegida para las siguientes capas de contenido/polish.

### Cobertura automatizada

Hay tests para sistema social, Sofi, Mili, Cami, Consejo, presentación y flujo de diálogo, outcomes, evento del baño, resistencia, césped, lifecycle de la intro, fases de la run, Game Over/retry, presentación/transición de Perfect Night y resumen/replay de Normal End. La suite y el build deben mantenerse verdes en cambios de lógica o documentación estructural.

## Provisional / placeholder

### Personajes del patio

- Eze, Pitity, Uriel, Santy, Thiago y Tobi todavía usan el mismo sistema procedural.
- Los NPCs de relleno también son placeholders; solo algunos tienen tween de baile o un indicador simple de actividad.
- No existen todavía sprites finales de la población principal fuera de Tambu, Sofi, Mili, Cami, bartender y DJ residente.

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
- `alcohol` existe en estado y HUD, pero permanece en `0`: todavía no hay gameplay de alcohol.

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
- Bathroom Resistance: Balance Pass 2 ya corrige el ordinal runtime contando solo resultados previos liquidados (`secured` o `interrupted`), excluyendo el outcome `bathroom` pending del evento actual. Los tres perfiles tienen mayor drenaje y daño, manteniendo SPACE `+4`, 10 s y siete golpes. Falta QA manual de esta baseline para confirmar que el primer baño sea justo y el tercero difícil pero ganable.
- Composición ambiental general: debe evaluarse después de resolver población visual suficiente, evitando llenar espacios por llenar.

## No implementado

- Sprites finales de amigos y NPCs de relleno.
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

Orden de dirección recomendado:

1. **BATHROOM RESISTANCE — QA MANUAL PASS 2** — probar cada perfil en juego y reportar dificultad percibida y en qué segundo empieza a exigir ritmo rápido; ajustar solo con esos resultados.
2. **Amigos principales** — producir siluetas y rasgos reconocibles con el mismo estándar humano; serán la base visual de Bathroom Resistance 2.0 y de callbacks de la fiesta.
3. **BATHROOM RESISTANCE — IDENTIDAD NARRATIVA** — con amigos visuales disponibles, integrar voces, retratos/intervenciones y memoria de run sobre el balance 1/2/3 ya validado.
4. **Audio mínimo** — música/ambiente y pocos SFX con controles básicos; debe entrar antes del QA final de ritmo.
5. **Población / fillers en lote pequeño** — reemplazar contraste procedural sin abrir una fábrica combinatoria grande.
6. **Vida del patio** — seleccionar 2–3 microeventos/callbacks por run y consecuencias visibles de lo ocurrido.
7. **UI, balance y polish** — aplicar el lenguaje global a HUD, diálogo, Consejo, outcomes y Bathroom Resistance; cerrar accesibilidad y balance final.

Las correcciones puntuales a sectores ya integrados siguen siendo válidas cuando existe un defecto concreto. No deben desplazar indefinidamente las prioridades anteriores.

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

