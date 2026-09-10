const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_TILESETS = Object.freeze({
  base: Object.freeze({
    name: 'night-grass',
    key: 'grass-night-tileset',
    path: `${GRASS_ASSET_ROOT}/tx_tileset_grass_night.png`,
    tileSize: 16,
    firstGid: 0,
  }),
  detail: Object.freeze({
    name: 'night-grass-plant-details',
    key: 'grass-night-plant-details',
    path: `${GRASS_ASSET_ROOT}/tx_plant_grass_details_night.png`,
    tileSize: 16,
    firstGid: 0,
  }),
});

export function preloadGrass(scene) {
  Object.values(GRASS_TILESETS).forEach(({ key, path }) => scene.load.image(key, path));
}
