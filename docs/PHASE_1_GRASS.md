# Tambu Game — Fase 1 / Paso 1: Césped

**Versión:** 1.0  
**Estado:** candidato visual V1 listo para calibración  
**Depende de:** `ART_DIRECTION.md`, `HUMAN_SCALE.md`, `PHASE_1_CALIBRATION.md`

Este documento congela el primer candidato de césped para la muestra de calibración. No se busca un pasto hiper detallado: se busca una masa nocturna tranquila que sostenga a Tambu, piscina, deck, luces y NPCs sin generar ruido visual.

---

# 1. Objetivo

El césped debe:

- leerse inmediatamente como césped a `camera zoom = 1`;
- pertenecer al mismo pixel-density que Tambu;
- evitar el checker/repetición visible del prototipo;
- funcionar como fondo y no competir con personajes ni piscina;
- admitir zonas gastadas y clusters decorativos sin convertirse en ruido;
- seguir viéndose bien con la iluminación nocturna futura.

La regla principal es:

> **El césped se percibe primero como una masa continua; el detalle aparece después.**

---

# 2. Unidad técnica

- tile base: `16x16 px`;
- sin antialias;
- nearest-neighbor;
- sprites a resolución nativa;
- Tambu permanece en `32x48 @ 1.24` y no se modifica para acomodar el entorno.

---

# 3. Paleta del candidato

Familia derivada de `ART_DIRECTION.md`:

- sombra profunda: `#21432D`;
- base: `#2F5A38`;
- luz: `#487348`;
- oscuro intermedio: `#294F34`;
- luz intermedia: `#3B673F`;
- gastado oscuro: `#4F5638`;
- gastado base: `#697047`;
- gastado luz: `#7B7E4B`.

No añadir verdes nuevos durante esta prueba salvo que la revisión en contexto demuestre una necesidad concreta.

---

# 4. Set V1

## `grass_01.png`

Tile dominante.

- base muy calma;
- pocos clusters de 2–3 px;
- contraste mínimo;
- diseñado para ocupar aproximadamente `65–75%` del campo.

No debe verse como un tile decorado cuando se repite.

## `grass_02.png`

Variación oscura agrupada.

- pequeños grupos de briznas y masa oscura;
- nunca dispersarlo en patrón uniforme;
- usar en clusters de `2–4 tiles`.

Objetivo aproximado: `10–15%`.

## `grass_03.png`

Variación algo más luminosa/foliada.

- acento escaso;
- ayuda a romper grandes superficies;
- no usar pegado sistemáticamente a `grass_02`.

Objetivo aproximado: `5–10%`.

## `grass_worn_01.png`

Pasto desgastado por circulación.

- parche irregular verde-seco;
- bordes orgánicos pixelados;
- conserva pequeños rastros de césped;
- nunca distribuir como ruido aleatorio.

Usar solo cerca de:

- rutas reales de Tambu/NPCs;
- acceso a barra;
- laterales transitados de piscina;
- mesas o zonas donde naturalmente se pisa más.

---

# 5. Distribución

No usar RNG visual por tile en runtime para decidir cada variante.

La distribución debe ser dirigida por composición:

- `grass_01`: gran masa continua;
- `grass_02`: clusters oscuros separados;
- `grass_03`: pequeños acentos agrupados;
- `grass_worn_01`: manchas conectadas a circulación.

Evitar:

- checker;
- alternancia A/B/A/B;
- colocar una variante cada N tiles;
- una brizna brillante en todos los módulos;
- porcentajes exactos que produzcan patrones mecánicos.

Los porcentajes son una guía visual, no una regla matemática.

---

# 6. Cambio respecto al prototipo actual

El código actual mezcla tiles con una textura procedural dibujada por `Phaser.Graphics`, con tallos y colores colocados regularmente en todo el terreno. Esa capa ayuda al prototipo pero genera ruido y dificulta controlar la dirección visual final.

Para la muestra de calibración:

1. probar primero los cuatro tiles sin `drawGrassTexture()`;
2. desactivar temporalmente flores y microbriznas procedurales en la zona de muestra;
3. evaluar si los assets por sí solos producen suficiente material;
4. reintroducir después solo decoración dirigida que aporte composición.

No eliminar todavía el sistema del patio completo hasta aprobar la calibración.

---

# 7. Criterio de aprobación

A `zoom = 1`:

- [ ] Tambu destaca inmediatamente sobre el césped;
- [ ] no se percibe una grilla de `16x16`;
- [ ] `grass_01` no parece repetirse de forma obvia;
- [ ] los clusters secundarios se leen como variación natural;
- [ ] la zona gastada parece uso del espacio y no tierra aleatoria;
- [ ] el fondo no vibra ni roba atención;
- [ ] los colores conservan suficiente rango para recibir ambient nocturno;
- [ ] el set puede extenderse por todo el patio sin requerir decenas de tiles únicos.

---

# 8. Producción reproducible

El repo incluye `tools/generate_grass_v1.py`, que genera de forma determinista este candidato:

- `grass_01.png`;
- `grass_02.png`;
- `grass_03.png`;
- `grass_worn_01.png`;
- un campo de prueba `384x256`.

El script es una herramienta de calibración. Si el candidato se aprueba, los PNG generados pueden convertirse en assets de producción y el patrón puede ajustarse manualmente sin obligación de mantener generación procedural.

---

# 9. Próximo gate

Antes de pasar al deck, este candidato debe verse:

1. aislado a resolución nativa;
2. repetido en un campo `384x256`;
3. con Tambu real encima;
4. sin textura procedural adicional.

Si funciona, se congela el tratamiento del césped y se pasa a **Deck + edge**.
