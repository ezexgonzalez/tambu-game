# Tambu Game — Night Grass Pack V3

**Estado:** integrado en GrassCalibrationScene y PatioScene.
**Scope:** solo césped; no autoriza cambios de deck, piscina, barra, DJ, NPCs ni iluminación final.

## Fuente de verdad

Los PNG de `tambu_night_grass_pack_v3.zip` son arte autorado y se integran sin redibujarse, regenerarse ni transformarse. La hoja `reference/night_grass_pack_v3_reference.png` sirve únicamente como referencia y no se carga en el juego.

```
public/assets/tiles/grass/
├── base/       grass_base_01…04.png       16x16
├── micro/      grass_micro_01…04.png      16x16
├── macro/      grass_macro_soft_01…02.png,
│               grass_macro_dark_01.png    64x64
├── clusters/   grass_cluster_01…08.png    48x48
├── accents/    flores, hojas y plantas    16x16 / 32x32
└── extra/      bush_edge_01…02.png        64x32
```

No existe una capa ni assets `worn`: no se usa tierra marrón, caminos desgastados ni textura procedimental adicional.

## Capas y escala

`createGrass()` renderiza en este orden estable:

```
base → micro → macro → clusters → accents
```

La base usa cuatro variantes con hash determinista para evitar checker o secuencias repetidas. Los micro tiles aparecen en grupos pequeños; los macro patches se mantienen dentro de alpha `0.75–1.0`; los clusters, plantas y bush edges se reservan para bordes y rincones. El centro jugable queda intencionalmente limpio.

Tambu se conserva como referencia humana: frame fuente `32x48`, `scale: 1.24`, cámara `zoom = 1`.

## Integración

- `preloadGrass.js` declara las rutas y keys de Night Grass Pack V3.
- `grassLayout.js` concentra la composición estable de calibración y patio.
- `createPatioWorld.js` sigue llamando `createGrass(scene, createPatioGrassLayout(PATIO_LAYOUT))`.
- No se modifican colisiones, macro-layout, personajes ni interacciones.
- `tools/generate_grass_v2.mjs` continúa eliminado para que no pueda sobrescribir el pack.

## Calibración

Durante desarrollo:

```
/?scene=grass-calibration&grassSpot=quiet
/?scene=grass-calibration&grassSpot=dense
```

`quiet` mantiene aire alrededor de Tambu; `dense` lo acerca a un cluster sin cubrir su silueta.

## Validación automática

`test/grassSystem.test.js` comprueba los 29 assets y sus tamaños nativos, las cuatro bases deterministas, el orden de capas, la ausencia de `worn`, la integración del patio y la ausencia del generador antiguo.

No avanzar a Deck hasta aprobar visualmente el césped en el patio real.
