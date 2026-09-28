# Tambu Game — Producción de assets del Patio

**Versión:** 1.1
**Estado:** roadmap activo · actualizado 2026-09-28
**Scope:** V1 · La fiesta

Este documento define qué arte conviene producir a partir del estado actual y bajo qué contrato debe entregarse. No describe el estado global del juego: para eso prevalece [`CURRENT_STATE.md`](./CURRENT_STATE.md).

## Lectura previa obligatoria

Antes de producir cualquier asset:

1. `CURRENT_STATE.md` — vigencia, prioridades y sectores protegidos.
2. `ART_DIRECTION.md` — intención y jerarquía visual.
3. `PIXEL_ART_STYLE_GUIDE.md` — paletas, pixel density, transparencia y validación.
4. `HUMAN_SCALE.md` — proporciones respecto de Tambu.
5. Código, layout y assets vecinos del sector real donde se integrará.

Si una especificación antigua contradice esta cadena, no se elige una versión por intuición: se reporta el conflicto.

## Objetivo de la etapa actual

El entorno principal ya tiene una base de producción en césped, deck, casa, piscina, barra, DJ y perímetro. El mayor déficit visual es la población del patio y, en segundo lugar, la capa de props que todavía se dibuja con primitives.

La producción se mueve de “construir el escenario base” hacia el **cierre de población y experiencia**:

1. cerrar QA de los cuatro amigos ya integrados;
2. producir bases de Uriel y Thiago;
3. reducir el contraste procedural con una población reutilizable pequeña;
4. producir únicamente animaciones con función visible;
5. dejar props/UI para pasadas dirigidas por impacto y QA.

La segunda auditoría confirma que la V1 ya tiene loop completo. El riesgo actual es transformar la producción de personajes en un pozo infinito de atlas. **Identidad clara y función > cantidad de animaciones.**

No se vuelve a producir un sector estable salvo que exista un problema concreto y una tarea explícita.

## Estado del arte disponible

### Base vigente de runtime

- Tambu: `public/assets/characters/tambu/tambu.png`.
- Sofi: walk, idle y special idles aprobados en `public/assets/characters/women/`, integrados desde `src/characters/sofiSprite.js`.
- Mili: walk 4 direcciones, idle estático, blink down, hair adjust y drink down aprobados en `public/assets/characters/women/`, integrados desde `src/characters/miliSprite.js`; baseline congelada.
- Cami: walk 4 direcciones, idle estático, blink down, hair touch y hand-on-hip aprobados e integrados desde `src/characters/camiSprite.js`; baseline funcional cerrada para avanzar, con polish visual fino diferido.
- Césped: dos tilesets aprobados en `public/assets/tiles/grass/`.
- Deck y props seleccionados: `public/assets/tiles/deck/` y `public/assets/props/deck/`.
- Casa: `public/assets/tiles/house/`.
- Piscina: ensamblaje activo definido en `src/world/pool/poolStructure.js`.
- Barra y bartender: `src/world/bar/barStructure.js`.
- DJ, estructura, consola y residente: `src/world/dj/djBooth.js`.
- Perímetro: `src/world/patioPerimeter.js`, todavía en validación visual.
- Amigos en runtime: **Eze, Pitity, Santy y Tobi** ya tienen walk 4 direcciones + idle down y siguen en QA visual. Pitity tiene blink/phone-check; Tobi tiene drink/arms-crossed corregidos. Uriel y Thiago siguen procedurales.

Estos elementos son contexto de producción y referencia de coherencia. No son invitación a regenerarlos.

### Candidatos no aprobados

`public/assets/props/patio/` conserva piezas de una pasada ambiental revertida. Pueden evaluarse y rescatarse individualmente, pero no forman un kit aprobado por el solo hecho de existir.

### Placeholders / capas todavía abiertas

- **Uriel y Thiago** como amigos principales procedurales.
- NPCs de relleno, mediante una solución finita/reutilizable; no 37 personajes únicos.
- Mesas, cooler, faroles, guirnaldas y clutter creados en `createPatioWorld.js` con Phaser Graphics, solo donde QA justifique el reemplazo.
- UI funcional anterior a `UI_DIRECTION.md`, en una pasada dedicada.

Eze, Pitity, Santy y Tobi **ya no se consideran placeholders**, sino assets runtime en validación.

## Política de referencias visuales

Para personajes humanos se usan **dos fuentes de verdad complementarias**, con responsabilidades distintas:

1. **Visual master grande aprobado** → identidad general, outfit, silueta, anatomía, intención de pose/animación y detalles que un frame pequeño no puede expresar.
2. **Idle runtime manualmente corregido y aprobado** → resolución pixel-art exacta del personaje a `32x48`: cara, pelo, paleta, outlines, alineación de pies, densidad y geometría neutral.

Reglas:

- No reconstruir la identidad completa de un personaje nuevo usando solamente un sprite runtime pequeño.
- Una vez que el idle runtime fue corregido manualmente y aprobado, **sí pasa a ser referencia obligatoria para continuidad de todos los special idles y frames derivados**. Una animación no puede volver a la cara/píxeles de una reducción antigua.
- El master grande define principalmente **quién es y cómo se mueve** el personaje; el idle runtime aprobado define **cómo se resuelve exactamente en píxeles dentro del juego**.
- Si todavía no existe un master claro de una pose compleja, producir/aprobar ese master antes de normalizar.
- En una animación, toda región que no participa del movimiento debe conservar el idle runtime aprobado siempre que sea posible.
- Primer/último neutral y frames cercanos al neutral deben ser compatibles con el idle integrado, evitando saltos al entrar/salir.
- Los masters versionados deben vivir fuera de `public/assets/`; los assets runtime viven en `public/assets/`.
- Ninguna herramienta nueva (IA, SpriteCook u otra) se adopta como pipeline estable por novedad: primero debe superar una prueba de **un único asset**, comparando fidelidad, tiempo y retrabajo.

Esta política aplica especialmente a caras, manos, brazos, pies y microexpresiones, que fueron los principales puntos de deriva observados durante la producción de amigos.

## Contrato obligatorio para producir assets

Una tarea visual Tier A o Tier B debe definir antes de generar:

1. **Función:** qué aporta al juego y por qué existe.
2. **Ubicación:** sector y vecinos reales.
3. **Footprint:** tamaño objetivo en world pixels, anchor y posible colisión.
4. **Escala humana:** comparación con Tambu `32x48 @ 1.24`.
5. **Perspectiva:** top-down / 3/4 exacta del sector.
6. **Jerarquía:** Tier A, B o C.
7. **Paleta y luz:** familia material, noche y contraste permitido.
8. **Estados:** frames, direcciones o variantes realmente necesarias.
9. **Entrega:** PNGs separados, transparencia, nombres y dimensiones.
10. **Validación:** prueba junto a Tambu y captura dentro del mapa.

Ningún Tier A/B se aprueba aislado sobre un fondo vacío.

## Pipeline de producción

### 1. Contexto

- leer el layout y el módulo de integración;
- medir el espacio real;
- identificar assets vecinos y profundidad;
- determinar si ya existe una pieza reutilizable.

### 2. Especificación

- definir silueta, tamaño, estados y variantes;
- decidir qué debe formar parte del PNG y qué debe resolver Phaser;
- declarar colisión, anchor y oclusión esperada.

### 3. Exploración

- usar referencias, boceto o generación para encontrar lenguaje;
- generar una familia coherente cuando corresponda;
- descartar cualquier propuesta que solo funcione ampliada o fuera del mapa.

### 4. Normalización

- normalizar desde el visual master aprobado hacia el tamaño runtime; no usar el asset runtime pequeño como fuente visual de reconstrucción;
- separar las piezas de cualquier sheet intermedia;
- limpiar fondos, texto, marcos y residuos;
- asegurar transparencia real;
- corregir perspectiva, escala, bordes, pixel density y paleta;
- exportar PNGs finales con nombres semánticos.

### 4.5. Gate de baseline humana

Para personajes y animaciones:

- cerrar primero un idle down runtime que Dirección pueda describir como “este sprite ya es el personaje”;
- si hace falta, corregir manualmente sus píxeles antes de producir specials;
- registrar ese idle como baseline de continuidad;
- producir **una animación por vez** cuando la anatomía/identidad sea difícil; evitar batches que propaguen errores;
- no integrar una animación cuyo rostro, brazos o neutral todavía difieran de la baseline.

### 5. Prueba contextual

- mostrar el asset junto a Tambu a escala runtime;
- probarlo dentro del sector real;
- revisar silueta, jerarquía, circulación, depth y contacto con el suelo;
- comprobar que las variantes se sienten de la misma familia.

### 6. Aprobación e integración

- Dirección aprueba intención y resultado contextual.
- Integración usa los PNG aprobados sin rediseñarlos.
- Si la prueba revela un defecto de arte, vuelve a producción con un blocker concreto.

## Roadmap visual activo

# FASE A — Mujeres interactuables

**Estado: cerrada para avanzar.** Sofi, Mili y Cami ya están resueltas e integradas como baselines funcionales de la V1. Cami conserva margen de polish manual futuro, pero ese refinamiento no bloquea el siguiente milestone.

## Entrega mínima por personaje

- spritesheet o frames definidos por un layout común;
- cuatro direcciones si el evento del baño o futuras escenas requieren giro/desplazamiento;
- idle y walk solo cuando el uso real lo justifique;
- sombra de contacto coherente;
- una silueta distinguible a zoom `1`;
- outfit, pelo y postura propios;
- dimensiones y orden de frames documentados.

La entrega exacta debe decidirse con el módulo de integración. No generar animaciones que el runtime todavía no vaya a usar.

## Identidad visual

### Sofi

- baseline visual y técnico aprobado; no regenerar salvo bug concreto o tarea explícita;
- tranquila, observadora y amable;
- postura contenida;
- silueta clara sin exceso de accesorios.

### Mili

- baseline visual y técnica aprobada y congelada; no regenerar salvo bug concreto o tarea explícita;
- walk 4 direcciones, idle estático, blink down ocasional, hair adjust y drink down esporádicos;
- energía más alta y pose más dinámica;
- lectura social rápida y segura;
- no comunicar su personalidad mediante una escala arbitrariamente mayor.

### Cami

- baseline visual y técnica integrada;
- walk 4 direcciones e idle estático;
- blink down ocasional;
- hair touch down ocasional;
- hand-on-hip down ocasional;
- segura, filosa y con presencia;
- distinguirla mediante outfit, pelo y postura;
- mantenerla dentro de la misma familia visual;
- el polish manual pendiente es mejora futura, no blocker de V1 ni motivo para reabrir producción automática ahora.

## Gate de aprobación de la familia

- Las tres parecen pertenecer al mismo juego y al mismo sistema humano que Tambu.
- Se distinguen sin labels.
- Ninguna parece más detallada o de otra perspectiva.
- Funcionan en sus posiciones actuales y en la caminata del baño.
- El formato permite que Integration Engineer implemente las tres sin lógica especial innecesaria.

# FASE B — Amigos principales

**Estado: activa / cierre de cast.**

La primera noche ya está cerrada funcionalmente. En runtime existen Eze, Pitity, Santy y Tobi; Uriel y Thiago siguen procedurales.

Objetivo de esta fase:

1. aprobar visualmente las bases de Eze, Pitity, Santy y Tobi;
2. producir walk/idle base de Uriel y Thiago;
3. cerrar una baseline pixelada versionada por amigo;
4. detener la producción intensiva de specials cuando cada personaje ya tenga identidad y función suficientes.

## Reglas

- misma base proporcional y densidad que Tambu;
- rasgos reconocibles mediante pelo, outfit, silueta y uno o dos detalles;
- **no todos los amigos necesitan special idles**;
- un special nuevo debe justificar una escena, gag o función ambiental concreta;
- Santy puede usar baile como firma contextual por su ubicación en DJ si el asset pasa QA; no implica que todos los amigos necesiten una animación equivalente;
- priorizar una animación bien cerrada sobre tres atlas mediocres;
- no producir en batch varios personajes/animaciones cuando la fidelidad frame a frame esté fallando.

# FASE C — Población modular

No diseñar treinta personas únicas ni construir una factory combinatoria antes de medir necesidad.

La V1 necesita **romper la sensación de cuerpos procedurales repetidos**, no individualizar a cada invitado.

## Lote inicial

- una familia pequeña de cuerpos/outfits reutilizables;
- suficiente variación de pelo, piel y ropa para evitar clones evidentes;
- acciones visibles prioritarias: **baile, tomar, celular y charla**;
- pareja/beso solo si reutiliza infraestructura simple.

Primero integrar un lote reducido en sectores focales (DJ/barra/social), evaluar a zoom 1 y recién después decidir si hace falta ampliar. Diversidad perceptible > cantidad de combinaciones.

# FASE D — Props ambientales activos

Reemplazar los primitives que siguen en `createPatioWorld.js` mediante familias pequeñas y contextualizadas.

## Orden recomendado

1. mesas de fiesta y objetos de superficie;
2. cooler y bebidas;
3. faroles/postes;
4. guirnaldas;
5. clutter de suelo;
6. mobiliario adicional solo si resuelve una necesidad de composición.

## Reglas de composición

- no llenar cada vacío;
- mayor densidad en barra, DJ, mesas y bordes sociales;
- mantener aire en circulación, accesos y frente de interactuables;
- todo prop con masa necesita contacto con el suelo;
- Tier C acompaña y desaparece al mirar el mapa completo.

## Reutilización del kit existente

Antes de generar una pieza nueva, revisar `public/assets/props/patio/`. Cada candidato debe pasar el mismo gate que un asset nuevo. Si falla escala, perspectiva o lenguaje, se descarta o se devuelve a producción; no se salva deformándolo en integración.

# FASE E — UI y presentación

Se aborda después de estabilizar la población visual y el loop completo de la noche.

Alcance previsto:

- HUD de vidas y puntos; el indicador de alcohol vacío debe ocultarse para V1;
- prompt de interacción;
- diálogo y opciones;
- El Consejo;
- outcomes;
- evento del baño;
- resumen final de la noche.

La UI debe compartir el lenguaje definido en `UI_DIRECTION.md`, priorizando lectura y jerarquía. El cierre de run ya existe; alcohol no se implementará antes de V1 y por eso no debe condicionar el HUD final.

## Reglas técnicas comunes

### Escala

- Tambu sigue siendo la unidad oficial.
- Para pixel art manual, autorar cerca del tamaño final cuando sea posible.
- Para generación asistida por IA, partir de un visual master grande para identidad/movimiento; cuando exista un idle runtime manualmente aprobado, usarlo también como referencia exacta de continuidad pixelada para specials.
- Evitar escalados no uniformes durante integración.
- Un asset grande se mide por masa visible, no solo por su canvas transparente.

### Perspectiva

- Vista top-down / 3/4 superior coherente.
- Props de perímetro, muebles y superficies deben representar el ángulo desde el que realmente se ven.
- No mezclar un objeto frontal con vecinos vistos desde arriba.

### Paleta

- Los sprites nacen nocturnos.
- Night Grass usa exclusivamente la paleta vigente de `PIXEL_ART_STYLE_GUIDE.md`.
- Los materiales vecinos pueden derivar sus propios tonos sin contaminar el césped.
- No usar overlays para esconder una base diurna incorrecta.

### Transparencia

- PNG RGBA real cuando el asset no sea rectangular.
- Sin fondos opacos accidentales.
- Sin halo de antialias ni píxeles semitransparentes innecesarios en bordes duros.

### Iluminación

Dentro del sprite:

- sombra de contacto;
- highlight pixelado;
- luz material localizada.

Por Phaser:

- glows amplios;
- pulsos;
- haces;
- tintes de zona;
- partículas y feedback temporal.

### Nombres y entrega

Formato recomendado:

```text
<familia>_<pieza>_<variante>_<version>.png
```

Ejemplos:

```text
women_sofi_idle_v1.png
npc_hair_short_03_v1.png
patio_table_round_02_v1.png
```

La entrega debe incluir:

- archivos finales separados;
- dimensiones fuente;
- anchor recomendado;
- escala runtime prevista;
- orden de frames si aplica;
- colisión/footprint si aplica;
- captura de prueba junto a Tambu;
- captura de prueba dentro del mapa.

## Criterio global de aprobación

Un asset está listo cuando:

- cumple una función real dentro del juego;
- se lee a zoom `1`;
- respeta escala, perspectiva, paleta y densidad;
- pertenece a una familia coherente;
- funciona junto a Tambu y a sus vecinos;
- no bloquea circulación ni interacción;
- tiene transparencia y archivos listos para runtime;
- Dirección lo aprueba en contexto;
- Integration Engineer no necesita rediseñarlo para usarlo.
