# Tambu Game — Pixel Art Style Guide

**Versión:** 1.0  
**Estado:** FUENTE DE VERDAD DE PRODUCCIÓN VISUAL  
**Scope actual:** V1 · Patio nocturno  

Este documento fija las reglas técnicas estrictas para producir assets de Tambu Game.

`ART_DIRECTION.md` define **qué debe sentirse y comunicar el juego**.  
`PIXEL_ART_STYLE_GUIDE.md` define **cómo debe producirse visualmente cada asset**.  
`HUMAN_SCALE.md` define **la escala humana y proporciones**.  
`ASSET_PRODUCTION.md` define **qué producir y en qué orden**.

Si una generación, asset o referencia contradice este documento, **este documento prevalece para producción**.

---

# 1. Regla principal

Todo asset nuevo debe parecer parte del mismo juego antes de recibir iluminación dinámica.

No se permite diseñar assets diurnos para luego intentar convertirlos en nocturnos únicamente con un overlay.

> **Los sprites nacen nocturnos. Phaser después los ilumina.**

La iluminación dinámica complementa el arte; no corrige una paleta base incorrecta.

---

# 2. Lenguaje visual obligatorio

- Pixel art 2D moderno.
- Vista top-down / 3/4 superior coherente.
- Píxel duro y legible.
- Sin antialias dentro de sprites.
- Sin blur dentro de PNG.
- Sin texturas fotográficas.
- Sin degradados suaves pintados dentro del asset.
- Sin ruido aleatorio de píxel usado como sustituto de diseño.
- Siluetas claras antes que microdetalle.
- El detalle debe describir material, volumen o función.
- La lectura a `camera zoom = 1` tiene prioridad sobre una captura ampliada.

---

# 3. Base técnica y escala

- Grid jugable / tile lógico del entorno: `16x16 px`.
- El arte **no está obligado** a caber dentro de 16x16 si el asset necesita mayor resolución visual.
- Tambu es la unidad humana oficial.
- Frame fuente de Tambu: `32x48 px`.
- Runtime scale de Tambu: `1.24`.
- Envolvente nominal runtime: `39.68x59.52 world px`.
- Cámara principal: `zoom = 1`.
- Render: nearest-neighbor / `image-rendering: pixelated`.

La resolución visual y la grilla de gameplay son conceptos distintos.

Assets de entorno grandes, overlays, vegetación y arquitectura pueden ocupar múltiples tiles si eso mejora la lectura, siempre respetando el layout y la escala humana.

Para proporciones ver `docs/HUMAN_SCALE.md`.

---

# 4. Jerarquía de contraste

El contraste no se distribuye de forma uniforme.

## Tier A — protagonistas

Piscina, Tambu, NPCs interactuables, barra, DJ, casa/deck.

- contraste: medio/alto;
- silueta: muy clara;
- materiales: más definidos;
- highlights: permitidos de forma controlada;
- iluminación local: puede reforzar protagonismo.

## Tier B — soporte

Mesas, parlantes, jardineras, macetas, muebles, postes.

- contraste: medio;
- detalle: suficiente para verse terminado;
- no competir con Tier A.

## Tier C — clutter

Flores, hojas, vasos, latas, pequeños objetos.

- contraste: bajo/medio;
- tamaño visual pequeño;
- debe desaparecer como protagonista al mirar el mapa completo.

---

# 5. Paleta nocturna global

La escena usa una base nocturna fría. Los materiales tienen paletas propias dentro de esa atmósfera.

## Sombras globales

- `NS-01` Deep night: `#111827`
- `NS-02` Blue shadow: `#18243A`
- `NS-03` Ambient blue: `#22304A`

Reglas:

- evitar negro puro como sombra general;
- negro puro solo para huecos, oclusión extrema o UI;
- sombras locales deben tender levemente a azul/teal antes que a gris neutro.

---

# 6. NIGHT GRASS — paleta oficial estricta

La referencia cromática oficial del césped es la variante aprobada el `2026-09-09`: césped frío, teal/verde profundo, uniforme y suave.

## Colores oficiales

| ID | Rol | Hex |
|---|---|---|
| `NG-01` | Deep shadow | `#112A2F` |
| `NG-02` | Shadow | `#112F31` |
| `NG-03` | Dark base | `#123232` |
| `NG-04` | Base | `#153B35` |
| `NG-05` | Mid grass | `#194137` |
| `NG-06` | Soft light | `#1C4839` |
| `NG-07` | Highlight | `#25553D` |

### Distribución tonal objetivo para ground

- `NG-01` a `NG-04`: **60–70%** del área visible.
- `NG-05` y `NG-06`: **20–30%**.
- `NG-07`: **5–10% máximo**.

No hace falta usar los siete colores en todos los assets.

### Regla de normalización

Una generación IA puede entregar colores cercanos durante exploración, pero **un asset no se aprueba para producción si su paleta se aleja perceptiblemente de esta familia**.

Antes de integrar, el asset debe:

1. mantener el mismo hue frío/teal;
2. evitar verdes amarillentos;
3. evitar aumentos fuertes de saturación;
4. mantener luminosidad comparable con los ground ya aprobados;
5. poder normalizarse a esta paleta sin destruir su lectura.

No introducir una nueva familia de verde porque una generación aislada se vea linda.

---

# 7. NIGHT GRASS — diseño de superficie

El césped del patio es **superficie atmosférica**, no protagonista.

Debe verse:

- continuo;
- suave;
- cuidado;
- nocturno;
- rico de cerca;
- tranquilo de lejos.

## Ground principal

- textura corta;
- contraste bajo;
- distribución orgánica;
- sin checker;
- sin costuras visibles;
- sin grandes matas hero repetidas;
- sin flores integradas en la textura base;
- sin tierra;
- sin zonas marrones;
- sin caminos gastados.

## Variantes ground

Las variantes cambian **patrón y densidad**, no identidad cromática.

`grass_ground_01`, `02`, `03`, etc. deben sentirse como el mismo césped bajo la misma noche.

No se acepta que una variante sea más amarilla, más brillante o más saturada que las demás de forma evidente.

## Macro variation

- cambios amplios de valor;
- todo dentro de verdes oficiales;
- bordes orgánicos;
- contraste muy bajo;
- deben percibirse subconscientemente al mirar el mapa entero.

## Clusters

- 2–3 verdes principales derivados de Night Grass;
- mayor detalle que ground;
- uso principalmente en bordes, rincones y vegetación decorativa;
- no cubrir circulación ni pies de personajes.

## Accents

Flores y hojas aparecen poco.

- blanco: crema nocturno, no blanco puro;
- rosa: apagado/desaturado;
- jamás fluorescente;
- no teñir el ground alrededor.

---

# 8. Densidad de píxel

Los assets deben compartir una densidad visual coherente.

## Ground

- microdetalle frecuente pero de contraste bajo;
- ningún píxel individual debe sentirse como ruido aislado;
- formas repetidas deben agruparse en pequeñas familias de briznas.

## Props y vegetación

- formas principales de 2–5 px lógicos antes que ruido de 1 px;
- highlights más escasos que sombras;
- evitar que cada hoja tenga el mismo nivel de definición.

## Tier A

Puede usar mayor densidad de información, pero sigue subordinada a la escala de Tambu.

---

# 9. Complejidad tonal por material

Regla general:

- material secundario: 2–3 tonos principales;
- material importante: 3–4 tonos;
- highlight adicional solo si explica luz o volumen.

No sumar colores solo para “hacerlo más detallado”.

La variación de color debe describir:

- profundidad;
- orientación;
- material;
- desgaste permitido por dirección;
- iluminación pintada local muy pequeña.

---

# 10. Iluminación pintada vs iluminación runtime

Los assets contienen:

- sombra de contacto;
- sombras estructurales;
- highlights duros y pequeños;
- luz material localizada cuando sea inherente al objeto.

Phaser/CSS resuelve:

- ambient tint global;
- halos;
- contaminación de luz;
- pulsos;
- luces DJ;
- cian de piscina;
- luz cálida de casa/deck/barra;
- beams y partículas.

**Nunca hornear halos grandes o blur dentro del PNG.**

---

# 11. Materiales base

## Deck / madera

Paleta objetivo actual:

- sombra `#4A3027`
- base `#6A4531`
- luz `#8A5B3A`
- highlight excepcional `#B07A4C`

Reglas:

- madera cálida pero ya adaptada a noche;
- dirección de tablas consistente;
- no dibujar una línea negra fuerte en cada tabla;
- profundidad mediante grupos de valor, no outline excesivo.

## Piedra / borde piscina

- sombra `#8E8A84`
- base `#B8B2A9`
- luz `#D7D0C4`

Debe mantenerse más neutra que el césped y ser legible bajo luz fría de piscina.

## Agua

- profundo `#12627A`
- base `#1688A5`
- luz `#39B8D2`
- brillo `#8BE7EF`

El agua puede ser el material naturalmente más luminoso de la escena.

---

# 12. Transparencia y fondos

Assets aislados como:

- plantas;
- flores;
- hojas;
- clusters;
- props;
- muebles;
- elementos de barra/DJ;

deben entregarse como PNG con **fondo transparente real**.

No se acepta:

- checkerboard dibujado dentro de la imagen;
- fondo negro usado como falsa transparencia;
- panel de presentación;
- texto;
- labels;
- marco;
- sombra rectangular del canvas.

Las texturas ground pueden ser opacas si su función es cubrir superficie.

---

# 13. Regla obligatoria para generación IA

## Una imagen = un asset

Nunca generar como entrega de producción:

- sprite sheets conceptuales;
- collages;
- atlas visuales;
- presentación de pack;
- varios objetos en una misma imagen;
- una imagen grande para después recortarla.

Si se necesitan ocho assets, se producen **ocho imágenes independientes**.

Cada imagen debe nacer con la función técnica de su asset final.

### Está prohibido para producción

1. generar una sheet;
2. recortarla automáticamente;
3. limpiar texto/fondo;
4. entregar esos recortes a Work.

Las sheets solo pueden existir como **referencia conceptual** y jamás son fuente de assets finales.

---

# 14. Reglas de prompt para agentes generadores

Todo prompt de asset debe indicar, como mínimo:

1. `Tambu Game`;
2. pixel art 2D;
3. top-down / overhead;
4. night environment;
5. función exacta del asset;
6. paleta/material correspondiente;
7. densidad de detalle;
8. si requiere transparencia;
9. qué elementos están prohibidos.

## Prompt base obligatorio para Night Grass

Incluir conceptualmente:

> top-down 2D pixel art, nighttime lawn, cool deep teal-green palette, soft low-contrast grass, uniform atmospheric surface, colors derived from #112A2F #112F31 #123232 #153B35 #194137 #1C4839 #25553D, no dirt, no brown, no yellow-green daylight tones, no flowers unless requested, no objects, no text, no UI

Para variantes ground cambiar **patrón/densidad**, no la paleta.

---

# 15. Validación obligatoria antes de aprobar un asset

## A. Paleta

- ¿pertenece al material correcto?
- ¿mantiene temperatura nocturna?
- ¿introduce colores que ningún asset hermano usa?

## B. Pixel art

- ¿hay antialias?
- ¿hay blur?
- ¿hay ruido innecesario?
- ¿las formas se leen a zoom 1?

## C. Escala

Para Tier A/B:

- comparar con Tambu real a `scale: 1.24`;
- nunca reescalar a Tambu para hacer coincidir el asset.

## D. Integración

- ¿se distingue su función?
- ¿compite con la piscina/personajes?
- ¿parece del mismo mundo que los assets vecinos?

## E. Técnica

- transparencia real si corresponde;
- sin texto;
- sin marco;
- sin residuos de sheet;
- dimensiones y anchor documentados;
- nearest-neighbor.

---

# 16. Gate especial para texturas repetibles

Antes de integrar cualquier ground/tile repetible:

1. repetirlo al menos `3x3`;
2. revisar costuras X/Y;
3. revisar patrones diagonales;
4. revisar manchas repetidas demasiado reconocibles;
5. probar junto a al menos otra variante;
6. mirar el resultado a zoom `1`.

Una textura linda aislada **no está aprobada** hasta pasar el repeat test.

---

# 17. Relación entre arte e iluminación nocturna

La base del patio debe funcionar sin efectos dinámicos, pero estar deliberadamente contenida para que la iluminación tenga espacio.

Jerarquía prevista:

1. piscina cian;
2. personajes;
3. barra / DJ;
4. luces cálidas de casa/deck;
5. césped y arquitectura secundaria.

El césped no debe alcanzar de base el brillo final de las fuentes de luz.

---

# 18. Estado actual del césped

Decisiones cerradas:

- patio completamente verde;
- no `worn`;
- no tierra marrón;
- no caminos gastados;
- look nocturno desde el PNG;
- base fría/teal;
- superficie relativamente uniforme;
- variaciones por patrón y valor, no por cambio de hue;
- mayor vegetación hacia bordes;
- centro jugable visualmente más tranquilo.

La primera familia cromática aprobada utiliza la paleta `NG-01` a `NG-07` de este documento.

---

# 19. Fuentes de verdad y precedencia

En caso de conflicto:

1. `src/data/tambuSprite.js` + `docs/HUMAN_SCALE.md` → escala humana.
2. `docs/PIXEL_ART_STYLE_GUIDE.md` → reglas técnicas visuales y paletas de producción.
3. `docs/ART_DIRECTION.md` → visión y jerarquía artística.
4. `docs/PHASE_1_*.md` → decisiones específicas de fase.
5. `docs/ASSET_PRODUCTION.md` → backlog y orden de producción.
6. notas antiguas / prompts / concepts → referencia, no autoridad.

---

# 20. Criterio de aprobación global

Un asset se considera parte de Tambu Game cuando:

- funciona a zoom 1;
- respeta la escala;
- respeta su paleta material;
- ya nace nocturno;
- comparte densidad de píxel con el mundo;
- no necesita un overlay para ocultar una paleta diurna;
- no contiene residuos de generación/presentación;
- cumple su función sin romper jerarquía;
- puede colocarse junto a Tambu y los assets aprobados sin parecer de otro juego.
