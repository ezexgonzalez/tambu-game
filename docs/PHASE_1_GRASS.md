# Tambu Game — Fase 1 · Night Grass

**Estado runtime:** tileset único integrado.
**Estado de arte:** asset aprobado y congelado para esta fase.
**Scope:** solo césped; no autoriza cambios de deck, piscina, barra, DJ, NPCs ni iluminación.

---

# Fuente de verdad

El césped V1 utiliza exclusivamente:

```text
public/assets/tiles/grass/tx_tileset_grass_night.png
```

Es un PNG `256x256 px` organizado como una grilla de `16x16` tiles fuente de `16x16 px`.

Reglas cerradas:

- no modificar sus píxeles;
- no regenerarlo;
- no recortarlo a assets independientes;
- no mantener versiones legacy dentro del repositorio;
- los IDs de frame permitidos viven en `src/world/grass/grassLayout.js`.

Para paleta, densidad y lenguaje visual prevalece `docs/PIXEL_ART_STYLE_GUIDE.md`.

---

# Paleta oficial Night Grass

| ID | Hex |
|---|---|
| `NG-01` | `#122D23` |
| `NG-02` | `#153427` |
| `NG-03` | `#183A2B` |
| `NG-04` | `#1C4230` |
| `NG-05` | `#214A35` |
| `NG-06` | `#28533A` |
| `NG-07` | `#316040` |

No seleccionar del sheet flores, piedras, amarillos, bordes ni elementos que no sean césped.

---

# Arquitectura runtime

El sistema conserva tres módulos pequeños:

- `preloadGrass.js`: carga una sola textura;
- `grassLayout.js`: contiene tile size, seed, pools aprobados y genera la matriz;
- `createGrass.js`: crea el Tilemap, registra el Tileset y renderiza una sola `TilemapLayer`.

Flujo:

```text
PATIO_LAYOUT.terrain.grass
→ matriz determinista de source frame IDs
→ Phaser Tilemap
→ una TilemapLayer a depth de suelo
```

El patio mide aproximadamente `1680x810 px`, por lo que la matriz usa `ceil(width / 16)` por `ceil(height / 16)` y cubre el bounds completo sin huecos.

No se usan:

- `GeometryMask`;
- `FilterMask`;
- polygon clipping;
- `scene.add.image()` por celda;
- overlays runtime separados;
- `Math.random()`.

---

# Composición determinista

La selección depende únicamente de:

- columna;
- fila;
- seed fija.

Cada reload produce exactamente la misma superficie.

Distribución objetivo:

- base plana: aproximadamente `78%`;
- detalle muy pequeño y suave: aproximadamente `20%` combinado;
- matas medianas: aproximadamente `2%`.

Los pools usan IDs de frame 0-based del tileset. La rareza se decide antes de seleccionar una variante dentro del pool, por lo que el tamaño desigual de los pools no altera la distribución visual prevista.

---

# Calibración

`GrassCalibrationScene` usa el mismo layout de tiles y el mismo renderer que el patio. Mantiene una única posición de Tambu para comprobar:

- lectura a `camera zoom = 1`;
- escala runtime `1.24`;
- ausencia de costuras o huecos;
- jerarquía visual frente al personaje.

Los conceptos legacy `quiet` y `dense` quedan retirados porque ya no existen capas separadas de macros o clusters.

---

# Criterio de aprobación

La fase queda aprobada cuando:

1. el grass bounds está completamente cubierto;
2. solo se carga el tileset oficial;
3. la distribución es estable entre reloads;
4. los tiles de base dominan;
5. las matas medianas son escasas;
6. no aparecen frames prohibidos;
7. piscina, Tambu y NPCs conservan prioridad visual;
8. no hay errores de render ni assets faltantes.
