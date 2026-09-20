# Terrain tileset legacy v0.1

Tileset base del patio. Cada tile mide 16x16 px.

`terrain.png` nació como primer tileset general de césped, deck, camino y piscina. Ya no es la fuente de verdad de esos materiales.

El runtime actual lo conserva únicamente para el camino de entrada. Los índices activos están centralizados en `src/data/terrainTiles.js`.

Fuentes vigentes:

- césped: `public/assets/tiles/grass/`;
- deck: `public/assets/tiles/deck/`;
- piscina: `public/assets/props/pool/`;
- estado y precedencia: `docs/CURRENT_STATE.md`.

No agregar materiales nuevos a `terrain.png` ni reactivar sus tiles antiguos sin una decisión explícita de arquitectura.
