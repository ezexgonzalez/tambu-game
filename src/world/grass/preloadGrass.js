const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_ASSETS = {
  base01: { key: 'grass-v2-base-01', path: `${GRASS_ASSET_ROOT}/base/grass_base_01.png` },
  base02: { key: 'grass-v2-base-02', path: `${GRASS_ASSET_ROOT}/base/grass_base_02.png` },
  base03: { key: 'grass-v2-base-03', path: `${GRASS_ASSET_ROOT}/base/grass_base_03.png` },
  dense01: { key: 'grass-v2-dense-01', path: `${GRASS_ASSET_ROOT}/clusters/grass_dense_01.png` },
  dense02: { key: 'grass-v2-dense-02', path: `${GRASS_ASSET_ROOT}/clusters/grass_dense_02.png` },
  lively01: { key: 'grass-v2-lively-01', path: `${GRASS_ASSET_ROOT}/clusters/grass_lively_01.png` },
  macroDark01: { key: 'grass-v2-macro-dark-01', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_dark_01.png` },
  macroDark02: { key: 'grass-v2-macro-dark-02', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_dark_02.png` },
  macroSoft01: { key: 'grass-v2-macro-soft-01', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_soft_01.png` },
  worn01: { key: 'grass-v2-worn-01', path: `${GRASS_ASSET_ROOT}/worn/grass_worn_01.png` },
  worn02: { key: 'grass-v2-worn-02', path: `${GRASS_ASSET_ROOT}/worn/grass_worn_02.png` },
  worn03: { key: 'grass-v2-worn-03', path: `${GRASS_ASSET_ROOT}/worn/grass_worn_03.png` },
  flowerWhite01: { key: 'grass-v2-flower-white-01', path: `${GRASS_ASSET_ROOT}/accents/flower_white_01.png` },
  flowerPink01: { key: 'grass-v2-flower-pink-01', path: `${GRASS_ASSET_ROOT}/accents/flower_pink_01.png` },
  leaf01: { key: 'grass-v2-leaf-01', path: `${GRASS_ASSET_ROOT}/accents/leaf_01.png` },
};

export function preloadGrass(scene) {
  Object.values(GRASS_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}
