const GRASS_ASSET_ROOT = '/assets/tiles/grass';

export const GRASS_ASSETS = {
  ground01: { key: 'grass-ground-01', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_01.png` },
  ground02: { key: 'grass-ground-02', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_02.png` },
  ground03: { key: 'grass-ground-03', path: `${GRASS_ASSET_ROOT}/ground/grass_ground_03.png` },
  patchSoft01: { key: 'grass-patch-soft-01', path: `${GRASS_ASSET_ROOT}/macro/grass_patch_soft_01.png` },
  patchSoft02: { key: 'grass-patch-soft-02', path: `${GRASS_ASSET_ROOT}/macro/grass_patch_soft_02.png` },
  clusterMedium01: { key: 'grass-cluster-medium-01', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_medium_01.png` },
  clusterMedium02: { key: 'grass-cluster-medium-02', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_medium_02.png` },
  clusterMedium03: { key: 'grass-cluster-medium-03', path: `${GRASS_ASSET_ROOT}/clusters/grass_cluster_medium_03.png` },
  tuftSmall01: { key: 'grass-tuft-small-01', path: `${GRASS_ASSET_ROOT}/decals/grass_tuft_small_01.png` },
  tuftSmall02: { key: 'grass-tuft-small-02', path: `${GRASS_ASSET_ROOT}/decals/grass_tuft_small_02.png` },
  tuftSmall03: { key: 'grass-tuft-small-03', path: `${GRASS_ASSET_ROOT}/decals/grass_tuft_small_03.png` },
  tuftPair01: { key: 'grass-tuft-pair-01', path: `${GRASS_ASSET_ROOT}/decals/grass_tuft_pair_01.png` },
};

export function preloadGrass(scene) {
  Object.values(GRASS_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}
