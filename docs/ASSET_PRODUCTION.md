# Tambu Game — Producción de assets del Patio

**Versión:** 1.0
**Estado:** roadmap activo
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

La producción se mueve de “construir el escenario base” hacia:

1. personajes interactuables;
2. amigos;
3. población modular;
4. props ambientales activos;
5. UI, feedback y polish.

No se vuelve a producir un sector estable salvo que exista un problema concreto y una tarea explícita.

## Estado del arte disponible

### Base vigente de runtime

- Tambu: `public/assets/characters/tambu/tambu.png`.
- Sofi: walk, idle y special idles aprobados en `public/assets/characters/women/`, integrados desde `src/characters/sofiSprite.js`.
- Mili: walk 4 direcciones, idle estático, blink down, hair adjust y drink down aprobados en `public/assets/characters/women/`, integrados desde `src/characters/miliSprite.js`; baseline congelada.
- Césped: dos tilesets aprobados en `public/assets/tiles/grass/`.
- Deck y props seleccionados: `public/assets/tiles/deck/` y `public/assets/props/deck/`.
- Casa: `public/assets/tiles/house/`.
- Piscina: ensamblaje activo definido en `src/world/pool/poolStructure.js`.
- Barra y bartender: `src/world/bar/barStructure.js`.
- DJ, estructura, consola y residente: `src/world/dj/djBooth.js`.
- Perímetro: `src/world/patioPerimeter.js`, todavía en validación visual.

Estos elementos son contexto de producción y referencia de coherencia. No son invitación a regenerarlos.

### Candidatos no aprobados

`public/assets/props/patio/` conserva piezas de una pasada ambiental revertida. Pueden evaluarse y rescatarse individualmente, pero no forman un kit aprobado por el solo hecho de existir.

### Placeholders que sí deben reemplazarse

- Cami.
- Eze, Pitity, Uriel, Santy, Thiago y Tobi.
- NPCs de relleno.
- Mesas, cooler, faroles, guirnaldas y clutter creados en `createPatioWorld.js` con Phaser Graphics.
- UI funcional actual, en una etapa posterior.

## Política de referencias visuales

Para producción visual asistida por IA, la fuente principal debe ser un **visual master grande, claro y literal** del personaje u objeto aprobado.

- No usar sprites runtime pequeños (por ejemplo frames de `32x48`) como referencia visual principal para crear o extender arte: al perder detalle, el agente tiende a reinterpretar rostro, pelo, silueta, manos o sombreado.
- Los assets runtime pequeños sirven como referencia **técnica secundaria**: dimensiones, grid, orden de frames, naming, escala y contrato de integración.
- Si todavía no existe una referencia literal suficientemente clara de la animación o variante buscada, primero se produce y aprueba ese visual master; recién después se normaliza al tamaño runtime.
- El Art Director / Asset Studio trabaja sobre referencias literales aprobadas: puede limpiar, alinear y normalizar, pero no debe inventar un Tier A desde un asset runtime diminuto.
- Cuando los visual masters se versionen en el repo, deben vivir fuera de `public/assets/` para no formar parte del runtime.

Esta regla aplica especialmente a personajes Tier A/B y a animaciones donde ojos, manos, accesorios o microexpresiones puedan degradarse al reducir tamaño.

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

Sofi y Mili ya están resueltas e integradas como baselines de calidad. Completar la primera familia con Cami sin romper la escala ni el lenguaje visual establecido por Tambu, Sofi y Mili.

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

- segura, filosa y con presencia;
- distinguirla mediante outfit, pelo y postura;
- mantenerla dentro de la misma familia visual.

## Gate de aprobación de la familia

- Las tres parecen pertenecer al mismo juego y al mismo sistema humano que Tambu.
- Se distinguen sin labels.
- Ninguna parece más detallada o de otra perspectiva.
- Funcionan en sus posiciones actuales y en la caminata del baño.
- El formato permite que Integration Engineer implemente las tres sin lógica especial innecesaria.

# FASE B — Amigos principales

Producir una familia común para:

1. Pitity;
2. Uriel;
3. Thiago;
4. Tobi;
5. Santy;
6. Eze.

El orden puede cambiar por necesidad narrativa o disponibilidad de referencia, pero no se deben generar como seis estilos aislados.

## Reglas

- misma base proporcional y densidad que Tambu;
- rasgos reconocibles mediante pelo, outfit, silueta y uno o dos detalles;
- expresividad reservada para estados que tengan uso en gameplay;
- evitar retratos o animaciones complejas antes de validar el cuerpo base.

# FASE C — Población modular

No diseñar treinta personas únicas. Construir un sistema reutilizable compatible con los estados ambientales previstos.

## Familia mínima

- cuerpos/base de proporciones compatibles;
- 4–6 peinados por familia necesaria;
- 4 tonos de piel;
- 6–8 outfits combinables;
- variantes de piernas/calzado;
- accesorios separados: vaso, celular, gorra, bolso y anteojos;
- paleta controlada para evitar clones demasiado obvios.

## Estados prioritarios

- idle/charla;
- baile;
- tomar;
- mirar celular;
- beso o pareja, solo si se resuelve sin crear un sistema desproporcionado.

El sistema debe probar diversidad sin perder coherencia, performance ni claridad social.

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

- HUD de vidas, alcohol y puntos;
- prompt de interacción;
- diálogo y opciones;
- El Consejo;
- outcomes;
- evento del baño;
- resumen final de la noche.

La UI debe compartir lenguaje pixel-art, pero priorizar lectura y jerarquía. No congelar un HUD final antes de definir gameplay de alcohol y cierre de run.

## Reglas técnicas comunes

### Escala

- Tambu sigue siendo la unidad oficial.
- Para pixel art manual, autorar cerca del tamaño final cuando sea posible.
- Para generación asistida por IA, partir de un visual master grande y normalizar después al tamaño runtime; no usar un frame runtime pequeño como referencia visual principal.
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
