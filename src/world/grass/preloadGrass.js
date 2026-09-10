const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_TILESET = Object.freeze({
  name: 'night-grass',
  key: 'grass-night-tileset',
  path: `${GRASS_ASSET_ROOT}/tx_tileset_grass_night.png`,
  tileSize: 16,
  firstGid: 0,
});

export function preloadGrass(scene) {
  scene.load.image(GRASS_TILESET.key, GRASS_TILESET.path);
}
