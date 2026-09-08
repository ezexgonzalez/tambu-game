# Tambu Game — Fase 1 / Paso 1: Césped

**Versión:** 1.1  
**Estado:** candidato visual V3 listo para prueba en contexto  
**Depende de:** `ART_DIRECTION.md`, `HUMAN_SCALE.md`, `PHASE_1_CALIBRATION.md`

Este documento define el candidato actual de césped para la muestra de calibración. No se busca un pasto hiper detallado: se busca una masa nocturna tranquila que sostenga a Tambu, piscina, deck, luces y NPCs sin generar ruido visual.

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

# 4. Set V3

## `grass_01.png`

Tile dominante.

- base deliberadamente calma y casi plana;
- no lleva textura repetitiva interna;
- diseñado para ocupar aproximadamente `65–75%` del campo.

La prueba V1 mostró que incluso clusters muy pequeños repetidos dentro del tile base forman diagonales visibles al llenar superficies grandes. Por eso el tile dominante queda neutro y la riqueza se construye con variantes agrupadas y composición macro.

## `grass_02.png`

Variación oscura agrupada.

- pequeños grupos de briznas y masa oscura;
- nunca dispersarlo en patrón uniforme;
- usar en clusters pequeños o como acento aislado.

Objetivo aproximado: `10–15%`.

## `grass_03.png`

Variación algo más luminosa/foliada.

- acento escaso;
- ayuda a romper grandes superficies;
- no usar pegado sistemáticamente a `grass_02`.

Objetivo aproximado: `5–10%`.

## `grass_worn_01.png`
## `grass_worn_02.png`
## `grass_worn_03.png`

Tres variantes de pasto desgastado por circulación.

La prueba inicial con un único `grass_worn_01` repetido produjo manchas reconocibles como copia del mismo sprite. Se amplía el set a tres direcciones/formas para romper esa repetición.

Reglas:

- líneas y manchas verde-seco estrechas, no círculos centrales;
- bordes pixelados irregulares;
- conservar césped alrededor;
- alternar variantes cuando formen una zona transitada;
- no construir caminos rectos perfectos.

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
- `grass_worn_*`: secuencias cortas ligadas a circulación.

Evitar:

- checker;
- alternancia A/B/A/B;
- colocar una variante cada N tiles;
- una brizna brillante en todos los módulos;
- porcentajes exactos que produzcan patrones mecánicos;
- repetir la misma variante worn varias veces seguidas.

Los porcentajes son guía visual, no regla matemática.

---

# 6. Cambio respecto al prototipo actual

El patio actual ya usa tiles reales, pero luego agrega encima `drawGrassTexture()` con `Phaser.Graphics`: parches, tallos y flores distribuidos por bucles. Esa capa fue útil para salir del prototipo plano, pero para esta calibración necesitamos comprobar cuánto material puede resolver el arte por sí mismo.

Para la muestra:

1. probar primero el set V3 sin `drawGrassTexture()`;
2. desactivar temporalmente flores y microbriznas procedurales en la muestra;
3. revisar el césped junto a Tambu, deck y piscina;
4. solo después decidir qué macrovariación o decoración dirigida vuelve como capa separada.

No eliminar todavía `drawGrassTexture()` del patio completo hasta aprobar la calibración.

---

# 7. Criterio de aprobación

A `zoom = 1`:

- [ ] Tambu destaca inmediatamente sobre el césped;
- [ ] no se percibe una grilla de `16x16`;
- [ ] `grass_01` no delata repetición;
- [ ] los clusters secundarios se leen como variación natural;
- [ ] la zona gastada parece uso del espacio y no un patrón copiado;
- [ ] el fondo no vibra ni roba atención;
- [ ] los colores conservan suficiente rango para recibir ambient nocturno;
- [ ] el set puede extenderse por todo el patio sin requerir decenas de tiles únicos.

Importante: el césped NO se aprueba por verse espectacular aislado. Se aprueba por funcionar dentro de la muestra completa. Si al sumar deck/piscina/luces queda excesivamente plano, se agrega una capa macro de variación; no se vuelve a llenar cada tile de ruido.

---

# 8. Producción reproducible

El repo incluye `tools/generate_grass_v1.py`, que genera de forma determinista el candidato actual:

- `grass_01.png`;
- `grass_02.png`;
- `grass_03.png`;
- `grass_worn_01.png`;
- `grass_worn_02.png`;
- `grass_worn_03.png`;
- campo de prueba `384x256`.

El script es una herramienta de calibración. Si el candidato se aprueba, los PNG generados pueden convertirse en assets de producción y luego ajustarse manualmente sin obligación de mantener generación procedural.

---

# 9. Próximo gate

El tratamiento base ya está suficientemente definido para incorporarlo a la muestra, pero todavía NO queda congelado como arte final.

Siguiente paso:

1. colocar Tambu real sobre el campo;
2. sumar **Deck + edge**;
3. revisar juntos el balance de detalle;
4. si sigue funcionando, avanzar a borde/agua de piscina.

La evaluación del césped se mantiene abierta hasta verlo acompañado por esos materiales.
