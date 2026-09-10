import { GRASS_TILESET } from './preloadGrass.js';

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const { bounds, data, tileSize } = layout;
  const map = scene.make.tilemap({
    data,
    tileWidth: tileSize,
    tileHeight: tileSize,
  });
  const tileset = map.addTilesetImage(
    GRASS_TILESET.name,
    GRASS_TILESET.key,
    tileSize,
    tileSize,
    0,
    0,
    GRASS_TILESET.firstGid,
  );

  if (!tileset) {
    throw new Error(`Could not create grass tileset: ${GRASS_TILESET.key}`);
  }

  const layer = map.createLayer(0, tileset, bounds.x, bounds.y);

  if (!layer) {
    throw new Error('Could not create grass tilemap layer');
  }

  layer.setDepth(depth);

  return { map, layer, tileset };
}
