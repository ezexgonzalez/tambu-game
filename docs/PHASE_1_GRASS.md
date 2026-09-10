# Tambu Game — Fase 1 · Night Grass

**Estado runtime:** dos TilemapLayers 16×16 integradas.
**Estado de arte:** base aprobada más detalle vegetal inferior autorizado.
**Scope:** solo piso de césped; no autoriza árboles, arbustos, deck, piscina, barra, DJ, NPCs ni iluminación.

---

# Fuentes de verdad

## Base

```text
public/assets/tiles/grass/tx_tileset_grass_night.png
```

- PNG `256x256 px`;
- 16 columnas por 16 filas;
- tiles fuente `16x16 px`.

## Detalle vegetal

```text
public/assets/tiles/grass/tx_plant_grass_details_night.png
```

- PNG `512x512 px` conservado completo;
- 32 columnas por 32 filas;
- tiles fuente `16x16 px`;
- runtime limitado a filas fuente `24..31` y columnas `0..7`;
- whitelist explícito en `src/world/grass/grassLayout.js`.

Los píxeles de ambos PNG quedan congelados. No se recortan, recolorean, reescalan ni regeneran.

---

# Límites del sheet vegetal

La región inferior autorizada contiene 16 patrones de 32×32 formados por fragmentos de tiles 16×16. Quince son grass bajo válido y se colocan como bloques coherentes 2×2. El patrón marrón restante queda excluido.

No se usa del segundo sheet:

- árboles;
- copas;
- troncos;
- sombras de árboles;
- bushes o arbustos superiores;
- el patrón marrón/no-grass;
- cualquier frame fuera del whitelist.

Esta fase enriquece el piso. No constituye una pasada de vegetación general.

---

# Paleta oficial Night Grass

La paleta vigente no cambia:

| ID | Hex |
|---|---|
| `NG-01` | `#122D23` |
| `NG-02` | `#153427` |
| `NG-03` | `#183A2B` |
| `NG-04` | `#1C4230` |
| `NG-05` | `#214A35` |
| `NG-06` | `#28533A` |
| `NG-07` | `#316040` |

---

# Arquitectura runtime

El sistema conserva tres módulos:

- `preloadGrass.js`: carga exactamente los dos tilesets;
- `grassLayout.js`: contiene seeds, pools, whitelist y genera ambas matrices;
- `createGrass.js`: crea las dos TilemapLayers alineadas.

Flujo:

```text
matriz base continua → TilemapLayer base
matriz dispersa con -1 → TilemapLayer vegetal
```

Ambas capas:

- usan tiles `16x16 px`;
- comparten los bounds y el origen de `PATIO_LAYOUT.terrain.grass`;
- cubren `ceil(width / 16)` por `ceil(height / 16)`;
- permanecen debajo del resto del mundo;
- se generan sin máscaras ni imágenes individuales por celda.

---

# Composición base

La selección depende de columna, fila y seed. Un hash adicional de baja frecuencia modula suavemente regiones amplias para evitar una distribución tipo confetti.

Calibración objetivo:

- base plana: `65–68%`;
- variación muy pequeña: `8–10%`;
- variación suave: `20–23%`;
- variación media: `4–5%`.

La base sigue dominando, pero los detalles suaves tienen más presencia que en la primera migración.

---

# Composición vegetal

La matriz de detalle comienza completamente vacía con `-1`. Una grilla coarse determinista permite como máximo un patrón 2×2 por región, separando las matas y evitando repeticiones pegadas.

Densidad aproximada de celdas ocupadas:

- centro y entorno de piscina: `1–2%`;
- zonas intermedias: `3–4%`;
- bordes y laterales: `5–7%`.

Mismo seed y mismas coordenadas producen exactamente el mismo resultado. No se usa `Math.random()`.

---

# Sistemas descartados

No se reintroducen:

- grounds de 64 px;
- patches/macros PNG independientes;
- clusters o tufts legacy;
- `scene.add.image()` por celda;
- `GeometryMask`;
- `FilterMask`;
- polygon clipping.

El segundo recurso es otro tileset técnico, no una vuelta al sistema de overlays legacy.

---

# Calibración

`GrassCalibrationScene` utiliza exactamente el mismo renderer base + detail del patio, con Tambu a zoom 1. No mantiene una implementación alternativa.

---

# Criterio de aprobación

La pasada queda lista para playtest cuando:

1. la base cubre completamente el grass bounds;
2. el detalle solo usa frames del whitelist inferior;
3. el centro conserva aire;
4. los bordes presentan más vida;
5. no aparecen árboles, bushes ni el patrón marrón;
6. la composición es idéntica entre reloads;
7. piscina, Tambu y NPCs conservan prioridad visual;
8. no hay errores de render ni assets faltantes.
