# Tambu Game — UI Consolidation & Polish Pass

**Estado:** UI CONSOLIDATION INTEGRATED / MANUAL VISUAL QA REQUIRED  
**Fecha:** 2026-10-15  
**Scope:** UI de V1 ya existente; no feature design  
**Autoridades:** `docs/CURRENT_STATE.md`, `docs/UI_DIRECTION.md`, `docs/GAME_DESIGN.md`

## 1. Intención

Integrar de punta a punta la identidad existente de Tambu Game: **arcade pixel nocturno**, jerarquía, sobriedad, composición ortogonal, pixel display 5x7 para alto nivel y tipografía de cuerpo legible. Se aprueba una pasada integral de **polish UI/UX visual**, no una nueva dirección de arte ni una reescritura narrativa.

La pasada debe mejorar superficies actualmente provisionales, pero también corregir microinconsistencias concretas de las pantallas ceremoniales existentes sin rehacer sus conceptos, tiempos ni semánticas.

**La prioridad es calidad coherente a escala de juego, no decoración extra.**

## 2. Orden de ejecución

1. **AUDIT & FOUNDATIONS:** inspeccionar todos los módulos UI activos, sus dependencias/contratos de input y los tests; definir tokens reutilizables de color, tipografía, frame, divisores, spacing y anclaje por viewport con abstracciones pequeñas y justificadas.
2. **HUD PERSISTENTE:** vidas, puntos y prompt de interacción, livianos y correctos. Quitar indicador visual `ALCOHOL 0%` y barra vacía; conservar campo interno de state sin crear mecánica.
3. **DIÁLOGOS + CONSEJO + OUTCOMES:** unificar lenguaje y estructura visual, clarificar speaker, progreso, opciones, ayuda, consecuencia y rewards; conservar text/choices, orden, branches, gameplay, typewriter y acciones.
4. **BATHROOM EVENT / RESISTANCE:** refinar en forma conservadora panel inicial, panel compuesto, reaction dock, lectura/tamaño/spacings, timer/barra/input y resolución. Preservar aislamiento de cámara UI, foco de puerta, impactos, pacing y balance.
5. **TERMINALES / INTRO:** pulir detalles consistentes de GAME OVER, NORMAL END, PERFECT NIGHT e intro solo donde aporte. Preservar estructura, mensajes, composición nuclear, timing y gating aprobados. No inventar start/menu en este bloque.
6. **CONSOLIDATION & REGRESSION:** homogeneidad global, tests/build, documentación y handoff para QA manual.

## 3. Lenguaje visual

- `src/ui/pixelText.js`: display 5×7, sin antialias, para títulos/scores/labels; no forzarlo en párrafos.
- Paleta de `UI_DIRECTION.md`: fondos `#05080D/#060B14/#081421`, texto `#F2F5F7/#D5DCE4/#94A6B9`, líneas `#355A78`, acentos solo semánticos.
- Marcos ortogonales finos, módulos visuales consistentes, aire proporcional y proximidad semántica; no glass, blur, rounded cards, glow ornamental ni emojis de sistema.
- UI screen-space estable a zoom/camera shake, especialmente Bathroom Challenge. No recurrir a escala inversa por frame ni reabrir cámara de mundo.
- Layout derivado de viewport, fit mediante medición; referencia 1280×720 pero evitar hardcode funcional.
- Texto de interacción = acción REAL; prompts terciarios y visibles solo cuando la acción está habilitada.

## 4. Protected contracts

NO cambiar:

- texto narrativo, humor, voces, decisiones, outcomes, stats, rewards o señales;
- HUD/game state de vidas/puntos, solo presentación;
- lógica de conversaciones/Consejo, typewriter, timing y claves reales;
- fases de run, summary, Perfect Night, GAME OVER/retry, post-win;
- Bathroom Resistance de 10 s, +4 SPACE repetido, 7 hits, daños, memoria, recompensa ni secuencia;
- cámara UI del baño, staging, zoom, puerta y cleanup;
- sprites/personajes, mundo, mapa/props, audio, Party Presence;
- presentación de textos generados por fuentes narrativas salvo formateo/fit visual;
- no introducir nuevos NPC portraits, iconos no aprobados, start menu ni simulación.

El `DIALOGUE / CHARACTER VOICE PASS` global queda diferido.

## 5. UI surfaces / required audit

Inspeccionar como mínimo:

- `src/ui/createHud.js`
- `src/ui/dialogueUi.js`
- `src/ui/dialoguePresentation.js`
- `src/ui/eventUi.js`
- `src/ui/bathroomUiCamera.js`
- `src/ui/portraitReactionUi.js`
- `src/ui/gameOverUi.js`
- `src/ui/normalEndUi.js`
- `src/ui/perfectNightUi.js`
- `src/ui/pixelText.js`
- `src/events/nightIntro.js`
- `src/systems/dialogueSystem.js`
- `src/systems/interactionSystem.js`
- `src/events/bathroomEvent.js`
- `src/scenes/PatioScene.js`

## 6. Contrato de mejora

Cada cambio debe demostrar por qué mejora una de: claridad, consistencia, jerarquía, legibilidad, proporción, semántica, timing/prompt o mantenimiento. **No cambiar un componente solo por estilizarlo.** Cuando existan layouts aceptados, proteger su jerarquía. No sobregeneralizar: pequeños helpers y tokens reutilizables son válidos, un UI manager universal no.

El Engineer puede trabajar de manera autónoma dentro de este scope, con checkpoints lógicos; no necesita autorización para microdecisiones visuales coherentes. Pero si detecta blocker de asset o contradicción de gameplay debe documentarla y no improvisar su solución.

## 7. Testing, commit y validación

- Tests unitarios/contratos de UI y lifecycle: hud state/visibility, no alcohol, prompts, opciones, historia, branching, input gating, camera masking, scene shutdown/retry, fit/layout con widths variables.
- `npm test` y `npm run build` verdes.
- **NO browser, Playwright, screenshots, DevTools ni QA visual automatizado** por Integration Engineer. La aprobación visual la hace Dirección.
- Publicar implementación y docs en `main` después de tests/build verdes. Reportar archivos, criterios, tests/build, SHA, riesgos y breve checklist de inspección manual.
- Estado final: **UI CONSOLIDATION INTEGRATED / MANUAL VISUAL QA REQUIRED**. No declarar CLOSED o FROZEN unilateralmente.

## 8. Acceptance quality bar

1. HUD reducido, claro y sin alcohol inútil.
2. Dialog, Consejo y outcome pertenecen a la misma familia visual sin perder lectura de contenido.
3. Bathroom challenge se integra visualmente sin romper lo ya conseguido.
4. Terminales e intro se pulen de manera conservadora.
5. No emojis de sistema nuevos ni iconos inventados.
6. UI no reacciona al zoom/shake del mundo.
7. Input/prompts reflejan código real.
8. Sin overflow visible por lógica de layout en referencia y tamaños menores razonables.
9. Tests + build verdes, contratos funcionales conservados.
10. Dirección puede hacer una pasada visual con la V1 completa y decidir correcciones dirigidas.

**No reabrir PARTY PRESENCE ni otro scope durante este bloque.**


## 9. Entrega técnica — 2026-10-15

Base sincronizada: `main@76a495f386eb4e5172af2d2ac542a5209772f32f`.

### Auditoría y decisiones

| Hallazgo | Corrección | Motivo |
|---|---|---|
| HUD rígido a 1280, alcohol vacío, glyphs de sistema y glow | Anclaje por viewport; solo VIDAS/PUNTOS; display pixel; prompt separado | Menor ruido y lectura inmediata |
| Diálogos/Consejo con títulos monospace y spacing independiente | Familia de paneles/labels/body; jerarquía speaker → cuerpo → opciones → ayudas | Coherencia sin sacrificar lectura |
| Opciones largas y coordenadas inflexibles | Dos columnas con fit conservador, padding y número propio | Fit a 960×540 y asociación teclado/texto |
| Outcomes dependen de emojis y símbolos de reward | Títulos pixel y consecuencias explícitas; pending en Baño | Semántica legible sin iconografía ajena |
| Bathroom header/timer y valores sin misma alineación | Padding compartido, barra/valores refinados, dock original | Mejora conservadora del panel aprobado |
| Terminales con distinto peso de prompts/subtitles | Prompt Game Over pixel; jerarquía Perfect Night; tabla Normal End más consistente | Conservar carácter de cada cierre |
| Falta divisoria horizontal entre segunda/tercera fila | Tres reglas de tabla y outcomes alineados a padding fijo | Lectura por filas sin cortes |

Foundation: `src/ui/uiTheme.js`, extensión acotada de `pixelText.js`; sin framework/manager, librerías nuevas ni assets. Actualización de labels en el mismo Graphics y fit de cuerpo cacheado por intervención completa.

### Protección funcional

GameState/RunState, rewards/stats/choices/signals, data y copy narrativo, typewriter 28 ms, inputs, terminal beats/gates, restart/post-win, intro, Bathroom Resistance balance/10 s/+4/siete hits, door impacts, cámaras, memoria, rutas, mapa y personajes permanecen intactos. Se modifica solo presentación y su cobertura. Alcohol deja de verse, el campo sigue existiendo.

### Validación

- Checkpoints: suite previa de 259 tests mantenida verde tras foundation/diálogo y después de adaptar los mocks de render a los labels pixel nuevos.
- Final: **266 tests aprobados; 0 fallos, 0 omitidos**.
- Build: correcto; bundle JS aproximado 1.55 MB minificado, advertencia existente de chunk >500 kB; sin cambios de dependencias.
- Nuevos tests: HUD/state/visibility/prompt/shutdown, pixel labels dinámicos, preguntas/opciones reales, reacción/post-outcome/Consejo, outcomes/pending sin emojis, composite Bathroom y geometría/gating de los tres terminales en dos viewports.
- Existentes: se conservan contratos de typewriter, 256 rutas sociales, input/Consejo, cámara/shake/cleanup, rewards, fases terminales y replay. Se sustituyen únicamente expectativas cosméticas de coordenadas/texto de reward por la presentación nueva.
- Sin navegador, Playwright, screenshots, DevTools ni sesión visual local.

### Checklist de Dirección

1. HUD legible/discreto, score estable, alcohol ausente, prompt E visible solo cuando corresponde; intro oculta todo.
2. Preguntas/reacciones y opciones largas en las tres chicas: speaker/cuerpo claros, sin salto de tamaño mientras se escribe, Consejo y post-outcome con prompts correctos.
3. Instagram/Friendzone/Rechazo y entrada al baño: copy original, consecuencias correctas, sin +500 anticipado ni emojis de sistema.
4. Bathroom intentos 1/2/3: HUD a zoom 1, puerta enfocada, barra/timer/dock claros, portraits/voz intactos y success/failure sumando +500/+250 en su momento.
5. GAME OVER/retry, NORMAL END/replay y PERFECT NIGHT/continue: delays iguales, sin input residual, tabla/score legibles; repetir en 960×540.

Limitación pendiente: fit lógico/estimación monospace no reemplaza la evaluación óptica real sobre el mundo, ni verifica preferencias de ritmo/jerarquía. **GLOBAL UI VISUAL QA BY DIRECTION** es la siguiente acción. No se declara CLOSED/FROZEN ni se inicia Party Presence, audio, menú o contenido nuevo.
