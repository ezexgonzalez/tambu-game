const POOL_ASSET_ROOT = '/assets/props/pool';
const POOL_SCALE = 0.25;
const WATER_INSET = 22;

const POOL_ASSETS = Object.freeze({
  cornerTl: { key: 'pool-corner-tl-01', path: `${POOL_ASSET_ROOT}/pool_corner_tl_01.png` },
  cornerTr: { key: 'pool-corner-tr-01', path: `${POOL_ASSET_ROOT}/pool_corner_tr_01.png` },
  cornerBl: { key: 'pool-corner-bl-01', path: `${POOL_ASSET_ROOT}/pool_corner_bl_01.png` },
  cornerBr: { key: 'pool-corner-br-01', path: `${POOL_ASSET_ROOT}/pool_corner_br_01.png` },
  edgeTop: { key: 'pool-edge-top-01', path: `${POOL_ASSET_ROOT}/pool_edge_top_01.png` },
  edgeBottom: { key: 'pool-edge-bottom-01', path: `${POOL_ASSET_ROOT}/pool_edge_bottom_01.png` },
  edgeLeft: { key: 'pool-edge-left-01', path: `${POOL_ASSET_ROOT}/pool_edge_left_01.png` },
  edgeRight: { key: 'pool-edge-right-01', path: `${POOL_ASSET_ROOT}/pool_edge_right_01.png` },
  waterBase: { key: 'pool-water-base-01', path: `${POOL_ASSET_ROOT}/pool_water_base_01.png` },
  waterSoft: { key: 'pool-water-soft-01', path: `${POOL_ASSET_ROOT}/pool_water_soft_01.png` },
  waterWave: { key: 'pool-water-wave-01', path: `${POOL_ASSET_ROOT}/pool_water_wave_01.png` },
  waterHighlight: { key: 'pool-water-highlight-01', path: `${POOL_ASSET_ROOT}/pool_water_highlight_01.png` },
  lightOne: { key: 'pool-light-01', path: `${POOL_ASSET_ROOT}/pool_light_01.png` },
  lightTwo: { key: 'pool-light-02', path: `${POOL_ASSET_ROOT}/pool_light_02.png` },
  lightThree: { key: 'pool-light-03', path: `${POOL_ASSET_ROOT}/pool_light_03.png` },
  ladder: { key: 'pool-ladder-01', path: `${POOL_ASSET_ROOT}/pool_ladder_01.png` },
  ring: { key: 'pool-float-ring-01', path: `${POOL_ASSET_ROOT}/pool_float_ring_01.png` },
  ball: { key: 'pool-float-ball-01', path: `${POOL_ASSET_ROOT}/pool_float_ball_01.png` },
});

// Fixed coordinates keep the selected water accents organic without a random/checkerboard pattern.
const WATER_OVERLAYS = Object.freeze([
  ['waterSoft', 3, 1], ['waterSoft', 10, 1], ['waterSoft', 6, 5], ['waterSoft', 14, 5],
  ['waterWave', 8, 3], ['waterWave', 13, 4],
  ['waterHighlight', 4, 3], ['waterHighlight', 15, 1],
]);

export function preloadPool(scene) {
  Object.values(POOL_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

function addPoolImage(scene, x, y, asset, depth, options = {}) {
  const image = scene.add.image(x, y, POOL_ASSETS[asset].key)
    .setOrigin(0)
    .setScale(POOL_SCALE)
    .setDepth(depth);
  if (options.flipY) image.setFlipY(true);
  return image;
}

function createWater(scene, pool) {
  const x = pool.x + WATER_INSET;
  const y = pool.y + WATER_INSET;
  const width = pool.width - WATER_INSET * 2;
  const height = pool.height - WATER_INSET * 2;
  const base = scene.add.tileSprite(x, y, width / POOL_SCALE, height / POOL_SCALE, POOL_ASSETS.waterBase.key)
    .setOrigin(0)
    .setScale(POOL_SCALE)
    .setDepth(-12);
  const tileWidth = scene.textures.get(POOL_ASSETS.waterBase.key).getSourceImage().width * POOL_SCALE;
  const tileHeight = scene.textures.get(POOL_ASSETS.waterBase.key).getSourceImage().height * POOL_SCALE;

  WATER_OVERLAYS.forEach(([asset, column, row]) => {
    addPoolImage(scene, x + column * tileWidth, y + row * tileHeight, asset, -11);
  });

  return { x, y, width, height, base };
}

function createCoping(scene, pool) {
  const topWidth = scene.textures.get(POOL_ASSETS.edgeTop.key).getSourceImage().width * POOL_SCALE;
  const leftHeight = scene.textures.get(POOL_ASSETS.edgeLeft.key).getSourceImage().height * POOL_SCALE;
  const rightHeight = scene.textures.get(POOL_ASSETS.edgeRight.key).getSourceImage().height * POOL_SCALE;

  addPoolImage(scene, pool.x, pool.y, 'cornerTl', -6);
  addPoolImage(scene, pool.x + pool.width - 136 * POOL_SCALE, pool.y, 'cornerTr', -6);
  addPoolImage(scene, pool.x, pool.y + pool.height - 148 * POOL_SCALE, 'cornerBl', -6);
  addPoolImage(scene, pool.x + pool.width - 142 * POOL_SCALE, pool.y + pool.height - 148 * POOL_SCALE, 'cornerBr', -6);

  for (let x = pool.x + 32; x < pool.x + pool.width - 32; x += topWidth) {
    addPoolImage(scene, x, pool.y, 'edgeTop', -6);
    addPoolImage(scene, x, pool.y + pool.height - 94 * POOL_SCALE, 'edgeBottom', -6, { flipY: true });
  }
  for (let y = pool.y + 34; y < pool.y + pool.height - 34; y += leftHeight) addPoolImage(scene, pool.x, y, 'edgeLeft', -6);
  for (let y = pool.y + 34; y < pool.y + pool.height - 34; y += rightHeight) addPoolImage(scene, pool.x + pool.width - 99 * POOL_SCALE, y, 'edgeRight', -6);
}

export function createPool(scene, pool) {
  scene.add.rectangle(pool.x + pool.width / 2 + 6, pool.y + pool.height / 2 + 9, pool.width + 10, pool.height + 10, 0x061018, 0.3)
    .setDepth(-14);
  const water = createWater(scene, pool);

  [0.16, 0.47, 0.76].forEach((position, index) => {
    const asset = ['lightOne', 'lightTwo', 'lightThree'][index];
    const texture = scene.textures.get(POOL_ASSETS[asset].key).getSourceImage();
    addPoolImage(scene, water.x + water.width * position - texture.width * POOL_SCALE / 2, water.y + 8, asset, -9);
  });

  addPoolImage(scene, pool.x + 122, pool.y + 116, 'ring', -8);
  addPoolImage(scene, pool.x + 335, pool.y + 173, 'ball', -8);
  createCoping(scene, pool);
  addPoolImage(scene, pool.x + pool.width - 64, pool.y + 20, 'ladder', -5);
}
