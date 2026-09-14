const POOL_ASSET_ROOT = '/assets/props/pool';
const PROP_SCALE = 0.25;

// Measured from pool_frame_03.png. Water overlaps the frame beneath its opaque inner wall.
const INNER_WATER_RECT = Object.freeze({ x: 34, y: 54, width: 556, height: 204 });

const POOL_ASSETS = Object.freeze({
  frame: { key: 'pool-frame-03', path: `${POOL_ASSET_ROOT}/pool_frame_03.png` },
  water: { key: 'pool-water-surface-02', path: `${POOL_ASSET_ROOT}/pool_water_surface_02.png` },
  lightOn: { key: 'pool-light-on-02', path: `${POOL_ASSET_ROOT}/pool_light_03.png` },
  ladder: { key: 'pool-ladder-01', path: `${POOL_ASSET_ROOT}/pool_ladder_01.png` },
  ring: { key: 'pool-float-ring-01', path: `${POOL_ASSET_ROOT}/pool_float_ring_01.png` },
  ball: { key: 'pool-float-ball-01', path: `${POOL_ASSET_ROOT}/pool_float_ball_01.png` },
});

export function preloadPool(scene) {
  Object.values(POOL_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

function addProp(scene, x, y, asset, depth) {
  return scene.add.image(x, y, POOL_ASSETS[asset].key)
    .setOrigin(0)
    .setScale(PROP_SCALE)
    .setDepth(depth);
}

export function createPool(scene, pool) {
  scene.add.rectangle(pool.x + pool.width / 2 + 6, pool.y + pool.height / 2 + 9, pool.width + 10, pool.height + 10, 0x061018, 0.3)
    .setDepth(-14);

  const waterX = pool.x + INNER_WATER_RECT.x;
  const waterY = pool.y + INNER_WATER_RECT.y;
  scene.add.image(waterX, waterY, POOL_ASSETS.water.key).setOrigin(0).setDepth(-12);

  const lightTexture = scene.textures.get(POOL_ASSETS.lightOn.key).getSourceImage();
  pool.internalLights.forEach((position) => {
    addProp(
      scene,
      waterX + INNER_WATER_RECT.width * position - lightTexture.width * PROP_SCALE / 2,
      waterY + 24,
      'lightOn',
      -9,
    );
  });

  addProp(scene, pool.x + 122, pool.y + 116, 'ring', -8);
  addProp(scene, pool.x + 335, pool.y + 173, 'ball', -8);
  scene.add.image(pool.x, pool.y, POOL_ASSETS.frame.key).setOrigin(0).setDepth(-6);
  addProp(scene, pool.x + pool.width - 64, pool.y + 20, 'ladder', -5);
}
