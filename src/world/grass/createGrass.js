import { GRASS_TILESETS } from './preloadGrass.js';

function createTilemapLayer(scene, {
  bounds,
  data,
  depth,
  tileSize,
  tilesetConfig,
}) {
  const map = scene.make.tilemap({
    data,
    tileWidth: tileSize,
    tileHeight: tileSize,
  });
  const tileset = map.addTilesetImage(
    tilesetConfig.name,
    tilesetConfig.key,
    tileSize,
    tileSize,
    0,
    0,
    tilesetConfig.firstGid,
  );

  if (!tileset) {
    throw new Error(`Could not create grass tileset: ${tilesetConfig.key}`);
  }

  const layer = map.createLayer(0, tileset, bounds.x, bounds.y);

  if (!layer) {
    throw new Error(`Could not create grass tilemap layer: ${tilesetConfig.key}`);
  }

  layer.setDepth(depth);

  return { map, layer, tileset };
}

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const { bounds, data, detailData, tileSize } = layout;
  const base = createTilemapLayer(scene, {
    bounds,
    data,
    depth,
    tileSize,
    tilesetConfig: GRASS_TILESETS.base,
  });
  const detail = createTilemapLayer(scene, {
    bounds,
    data: detailData,
    depth: depth + 1,
    tileSize,
    tilesetConfig: GRASS_TILESETS.detail,
  });

  return {
    baseMap: base.map,
    baseLayer: base.layer,
    baseTileset: base.tileset,
    detailMap: detail.map,
    detailLayer: detail.layer,
    detailTileset: detail.tileset,
  };
}
