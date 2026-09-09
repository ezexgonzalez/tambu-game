const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_ASSETS = {
  ground01: { key: 'grass-ground-01', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_01.png` },
  ground02: { key: 'grass-ground-02', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_02.png` },
  ground03: { key: 'grass-ground-03', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_03.png` },
  macroSoft01: { key: 'grass-macro-soft-01', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_soft_01.png` },
  macroSoft02: { key: 'grass-macro-soft-02', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_soft_02.png` },
};

export function preloadGrass(scene) {
  Object.values(GRASS_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}
