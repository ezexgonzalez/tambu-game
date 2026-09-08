const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_ASSETS = {
  base01: { key: 'grass-v3-base-01', path: `${GRASS_ASSET_ROOT}/base/grass_base_01.png` },
  base02: { key: 'grass-v3-base-02', path: `${GRASS_ASSET_ROOT}/base/grass_base_02.png` },
  base03: { key: 'grass-v3-base-03', path: `${GRASS_ASSET_ROOT}/base/grass_base_03.png` },
  base04: { key: 'grass-v3-base-04', path: `${GRASS_ASSET_ROOT}/base/grass_base_04.png` },
  micro01: { key: 'grass-v3-micro-01', path: `${GRASS_ASSET_ROOT}/micro/grass_micro_01.png` },
  micro02: { key: 'grass-v3-micro-02', path: `${GRASS_ASSET_ROOT}/micro/grass_micro_02.png` },
  micro03: { key: 'grass-v3-micro-03', path: `${GRASS_ASSET_ROOT}/micro/grass_micro_03.png` },
  micro04: { key: 'grass-v3-micro-04', path: `${GRASS_ASSET_ROOT}/micro/grass_micro_04.png` },
  macroSoft01: { key: 'grass-v3-macro-soft-01', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_soft_01.png` },
  macroSoft02: { key: 'grass-v3-macro-soft-02', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_soft_02.png` },
  macroDark01: { key: 'grass-v3-macro-dark-01', path: `${GRASS_ASSET_ROOT}/macro/grass_macro_dark_01.png` },
  cluster01: { key: 'grass-v3-cluster-01', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_01.png` },
  cluster02: { key: 'grass-v3-cluster-02', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_02.png` },
  cluster03: { key: 'grass-v3-cluster-03', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_03.png` },
  cluster04: { key: 'grass-v3-cluster-04', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_04.png` },
  cluster05: { key: 'grass-v3-cluster-05', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_05.png` },
  cluster06: { key: 'grass-v3-cluster-06', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_06.png` },
  cluster07: { key: 'grass-v3-cluster-07', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_07.png` },
  cluster08: { key: 'grass-v3-cluster-08', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_08.png` },
  flowerWhite01: { key: 'grass-v3-flower-white-01', path: `${GRASS_ASSET_ROOT}/accents/flower_white_01.png` },
  flowerPink01: { key: 'grass-v3-flower-pink-01', path: `${GRASS_ASSET_ROOT}/accents/flower_pink_01.png` },
  flowerPink02: { key: 'grass-v3-flower-pink-02', path: `${GRASS_ASSET_ROOT}/accents/flower_pink_02.png` },
  leaf01: { key: 'grass-v3-leaf-01', path: `${GRASS_ASSET_ROOT}/accents/leaf_01.png` },
  leaf02: { key: 'grass-v3-leaf-02', path: `${GRASS_ASSET_ROOT}/accents/leaf_02.png` },
  leaf03: { key: 'grass-v3-leaf-03', path: `${GRASS_ASSET_ROOT}/accents/leaf_03.png` },
  smallPlant01: { key: 'grass-v3-small-plant-01', path: `${GRASS_ASSET_ROOT}/accents/small_plant_01.png` },
  smallPlant02: { key: 'grass-v3-small-plant-02', path: `${GRASS_ASSET_ROOT}/accents/small_plant_02.png` },
  bushEdge01: { key: 'grass-v3-bush-edge-01', path: `${GRASS_ASSET_ROOT}/extra/bush_edge_01.png` },
  bushEdge02: { key: 'grass-v3-bush-edge-02', path: `${GRASS_ASSET_ROOT}/extra/bush_edge_02.png` },
};

export function preloadGrass(scene) {
  Object.values(GRASS_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}
