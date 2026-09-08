# Tambu Game — Escala humana oficial

**Versión:** 1.0  
**Estado:** baseline de escala congelada  
**Fuente de verdad:** `src/data/tambuSprite.js` + sprite de producción de Tambu  

Este documento define a **Tambu como la unidad humana oficial del juego**. Todo personaje, mobiliario, arquitectura, prop y elemento interactuable debe diseñarse y validarse en relación con él.

La regla principal es simple:

> El mundo se adapta a Tambu. Tambu no se reescala para hacer encajar assets nuevos.

---

# 1. Medidas oficiales de Tambu

Configuración actual en producción:

- Spritesheet: `public/assets/characters/tambu/tambu.png`
- Spritesheet total: `96x192 px`
- Layout: `3 columnas x 4 filas`
- Frames totales: `12`
- Frame fuente: `32x48 px`
- Escala en runtime: `1.24`
- Cámara principal actual: `zoom = 1`
- Tile base del entorno: `16x16 px`

## Envolvente visual en runtime

El frame completo de Tambu ocupa nominalmente:

- ancho: `32 × 1.24 = 39.68` world px
- alto: `48 × 1.24 = 59.52` world px

Relación con tile de 16 px:

- ancho del frame: `2.48 tiles`
- alto del frame: `3.72 tiles`

Estas medidas corresponden a la **envolvente del frame**, no necesariamente a la cantidad exacta de píxeles opacos de la silueta.

---

# 2. Unidad humana

Para hablar de proporciones durante producción se define:

- `1H = 59.52 world px` → alto nominal del frame de Tambu en runtime.
- `1W = 39.68 world px` → ancho nominal del frame de Tambu en runtime.

`H` no equivale literalmente a metros reales. Es una unidad de comparación visual para mantener coherencia interna.

Ejemplos de uso:

- una puerta se evalúa colocando a Tambu delante;
- una mesa se evalúa comprobando que su altura/profundidad se lea correctamente junto a Tambu;
- una barra se diseña para que Tambu parezca poder apoyarse en ella;
- un DJ booth debe alojar un humano de esta escala sin parecer miniatura ni gigante;
- la escalera, borde y props de la piscina deben mantener proporción humana;
- los NPCs parten de la misma familia proporcional.

---

# 3. Footprint físico de Tambu

Configuración actual del body en `src/data/tambuSprite.js`:

- `bodyWidth: 13`
- `bodyHeight: 15`
- `bodyOffsetX: 9`
- `bodyOffsetY: 31`

Estas medidas pertenecen a la configuración del sprite/physics y no deben confundirse con el tamaño visual completo de `32x48`.

Para diseño de entorno se deben considerar dos cosas por separado:

1. **escala visual** → cómo se ve el objeto al lado de Tambu;
2. **footprint jugable** → cuánto espacio ocupa realmente para colisiones y circulación.

Un asset puede verse proporcionado y aun así tener un collider incorrecto. Ambos deben aprobarse.

---

# 4. Referencias actuales del patio expresadas en H

Estas cifras describen los footprints actuales de `PATIO_LAYOUT`. Sirven para saber qué espacio jugable existe hoy. **No significan que la forma gráfica actual sea final.**

| Elemento | Medida actual | Relación aprox. con Tambu |
| --- | --- | --- |
| Piscina | `624x304` | `10.48H x 5.11H` |
| Barra | `320x156` | `5.38H x 2.62H` |
| DJ | `322x126` | `5.41H x 2.12H` |
| Puerta secundaria | `72x102` | `1.21H x 1.71H` |
| Sector puerta baño | `110x122` | `1.85H x 2.05H` |
| Collider mesa social | `72x80` | `1.21H x 1.34H` |
| Cooler | `58x38` | `0.97H x 0.64H` |

La lectura correcta de esta tabla es:

> al rediseñar un objeto, primero comprobamos si el footprint actual sigue siendo razonable frente a Tambu; después diseñamos el sprite dentro de esa restricción o justificamos un ajuste sin romper el macro-layout.

---

# 5. Reglas para personajes

Tambu es el estándar humano, no un placeholder.

## NPCs base

- deben partir de la misma lógica de frame y proporción corporal;
- pueden variar altura aparente, ancho, peinado, postura y silueta;
- las variaciones deben sentirse humanas dentro del mismo mundo;
- no reducir NPCs a una escala que los haga parecer niños accidentalmente;
- no agrandar personajes para comunicar importancia.

## Personajes importantes

Sofi, Mili, Cami, amigos y futuros NPCs relevantes deben distinguirse principalmente mediante:

- peinado;
- outfit;
- postura;
- silueta;
- accesorios;
- animación/idle.

La importancia narrativa no se representa cambiando arbitrariamente la escala humana.

---

# 6. Regla para diseño de objetos

Todo asset Tier A o Tier B debe pasar por una prueba de escala con Tambu.

Antes de aprobarlo se debe visualizar al menos:

1. asset aislado;
2. asset al lado de Tambu a escala real de runtime;
3. asset dentro del patio real;
4. footprint/collider superpuesto si es interactuable o bloquea movimiento.

## Gate de aprobación

Preguntas obligatorias:

- ¿parece construido para una persona del tamaño de Tambu?
- ¿la superficie útil queda a una altura visual creíble?
- ¿las partes manipulables tienen tamaño legible?
- ¿el objeto conserva perspectiva 3/4 compatible con Tambu?
- ¿su collider deja suficiente circulación?
- ¿mantiene el macro-layout actual?

Si alguna falla, el asset vuelve a diseño.

---

# 7. Importante sobre la escala 1.24

Tambu usa actualmente `scale: 1.24` y esa decisión está estabilizada.

Aunque para nuevos assets suele ser preferible autorarlos a una resolución nativa que reduzca reescalados innecesarios, **no se debe cambiar la escala de Tambu solo para obtener números enteros**.

Tambu es la referencia existente. Los nuevos assets deben calibrarse contra su tamaño real en runtime.

---

# 8. Fuente de verdad

Si alguna documentación futura contradice estas medidas, verificar primero:

- `src/data/tambuSprite.js`
- `src/player/createPlayer.js`
- `src/scenes/PatioScene.js`
- `public/assets/characters/tambu/README.md`
- `docs/TAMBU_SPRITE_V011.md`

La configuración ejecutada por el juego tiene prioridad sobre notas antiguas.

---

# 9. Aplicación inmediata

La muestra de calibración visual de Fase 1 debe incluir a Tambu **sin reescalarlo** junto a:

- césped;
- deck;
- borde de piscina;
- agua;
- una planta/prop;
- una fuente cálida;
- una fuente fría.

A partir de esa muestra se fijará el tamaño visual definitivo de los primeros assets del entorno.