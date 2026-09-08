# Tambu Game — Fase 1 / Paso 1: Grass System V2

**Versión:** 2.0
**Estado:** muestra de calibración integrada para revisión
**Scope:** solo césped; no autoriza deck, piscina, barra, DJ, NPCs ni iluminación final.

## Objetivo

Grass System V2 sustituye la idea de “un tile con ruido” por una composición de pixel art en capas. A cámara `zoom = 1` debe leerse primero una masa nocturna calma; la riqueza aparece al mirar el terreno completo mediante zonas macro, grupos de vegetación y desgaste de circulación.

Tambu permanece como referencia de escala: frame fuente `32x48`, `scale: 1.24`, `1H = 59.52 world px`. El césped no se reescala ni invade su silueta.

## Assets producidos

```
public/assets/tiles/grass/
├── base/
│   ├── grass_base_01.png       16x16
│   ├── grass_base_02.png       16x16
│   └── grass_base_03.png       16x16
├── clusters/
│   ├── grass_dense_01.png      32x32
│   ├── grass_dense_02.png      32x32
│   └── grass_lively_01.png     32x32
├── macro/
│   ├── grass_macro_dark_01.png 64x64
│   ├── grass_macro_dark_02.png 64x64
│   └── grass_macro_soft_01.png 64x64
├── worn/
│   ├── grass_worn_01.png       32x32
│   ├── grass_worn_02.png       48x32
│   └── grass_worn_03.png       48x48
└── accents/
    ├── flower_white_01.png     16x16
    ├── flower_pink_01.png      16x16
    └── leaf_01.png             16x16
```

Todos son PNG raster nativos, con transparencia donde hace falta, píxel duro y sin blur ni antialias. No se usa una imagen de concepto como textura, atlas ni fondo.

## Paleta

- oscuro: `#21432D`
- base: `#2F5A38`
- luz: `#487348`
- intermedios: `#294F34`, `#3B673F`
- desgaste apagado: `#4F5638`, `#697047`, `#7B7E4B`, con tierra `#5D5138`

La familia mantiene margen para que piscina e iluminación nocturna tengan más presencia que el terreno.

## Arquitectura

```
src/world/grass/
├── preloadGrass.js  → claves Phaser y rutas de los quince PNG
├── grassLayout.js   → composición dirigida y hash estable de la base
└── createGrass.js   → render por capas: base → macro → clusters → worn → accents
```

`createGrass()` no usa `Math.random()`. Los overlays relevantes viven en `GRASS_CALIBRATION_LAYOUT`, por lo que la muestra conserva exactamente la misma composición entre cargas. El hash de base también es estable y evita secuencias/checkers regulares.

La herramienta `tools/generate_grass_v2.mjs` genera de forma reproducible los PNG de producción; se ejecuta fuera del runtime. Phaser solo carga archivos raster terminados.

## Distribución de la muestra

- base 01 dominante; base 02 oscura; base 03 algo más viva;
- objetivo perceptual: aproximadamente `40% / 30% / 20%`, dejando el resto de la riqueza a capas superiores;
- como la base debe cubrir el 100% del piso, la selección de underlay es `44% / 33% / 23%`; macro, clusters, worn y accents completan la lectura perceptual sin crear huecos;
- seis macrovariaciones de 64 px rompen masas amplias sin mostrar cuadrados;
- dieciséis clusters se concentran en bordes y rincones, y dejan aire alrededor de `tambuSpots.quiet`;
- tres parches worn compactos se leen como pasto pisado/tierra irregular, no como líneas ni caminos;
- seis accents son puntuales: dos flores blancas, dos rosas y dos hojas.

## Muestra de calibración

`src/scenes/GrassCalibrationScene.js` construye el campo de `384x256 world px` (`24x16` tiles) con Tambu real a escala runtime. Solo está disponible durante desarrollo:

```
/?scene=grass-calibration&grassSpot=quiet
/?scene=grass-calibration&grassSpot=dense
```

La cámara mantiene `zoom = 1`. `grassSpot=quiet` prueba espacio negativo y lectura del personaje; `grassSpot=dense` prueba proximidad a un cluster sin ocultar sus pies.

## Relación con el patio actual

Esta entrega es deliberadamente un gate de calibración. El patio productivo todavía conserva su `drawGrassTexture()` histórico: no se ejecuta en la muestra V2 y no compite con sus assets. Se retirará al migrar el patio completo, después de aprobar esta muestra; hacerlo ahora contradiría el alcance de “solo muestra” y modificaría el mapa antes del visto bueno.

## Validación automática

`test/grassSystem.test.js` verifica:

- los quince assets y sus dimensiones;
- selección base estable con las tres variantes;
- canvas y capas de la muestra (`384x256`, macro, clusters, worn, accents y dos posiciones de Tambu).

La migración de todo el patio queda explícitamente fuera de este paso. No avanzar a deck hasta aprobar visualmente la muestra.
