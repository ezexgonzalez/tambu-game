const ASSET_ROOT = '/assets/props/perimeter';

const HEDGE_SCALE = 0.2;
const FENCE_SCALE = 0.17;
const HEDGE_BASELINE = 960;
const FENCE_TOP = 278;
const ENTRY_GAP = { left: 1456, right: 1552 };

const ASSETS = {
  hedgeMiddle: ['perimeter-hedge-middle-01', 'perimeter-hedge-middle-02'],
  hedgeCornerLeft: 'perimeter-hedge-corner-left',
  hedgeCornerRight: 'perimeter-hedge-corner-right',
  fenceMiddle: 'perimeter-fence-middle',
  fenceTopCap: 'perimeter-fence-top-cap',
};

// All pieces within each family share this one scale. The hedge middles were
// trimmed from the supplied seamless section before export, so their joining
// sides carry leaf texture rather than a second exterior outline.
const SOURCE_SIZE = {
  [ASSETS.hedgeMiddle[0]]: { width: 606, height: 168 },
  [ASSETS.hedgeMiddle[1]]: { width: 616, height: 172 },
  [ASSETS.hedgeCornerLeft]: { width: 309, height: 215 },
  [ASSETS.hedgeCornerRight]: { width: 320, height: 217 },
  [ASSETS.fenceMiddle]: { width: 204, height: 364 },
  [ASSETS.fenceTopCap]: { width: 183, height: 346 },
};

export function preloadPatioPerimeter(scene) {
  scene.load.image(ASSETS.hedgeMiddle[0], `${ASSET_ROOT}/hedge_bottom_middle_01.png`);
  scene.load.image(ASSETS.hedgeMiddle[1], `${ASSET_ROOT}/hedge_bottom_middle_02.png`);
  scene.load.image(ASSETS.hedgeCornerLeft, `${ASSET_ROOT}/hedge_corner_left_01.png`);
  scene.load.image(ASSETS.hedgeCornerRight, `${ASSET_ROOT}/hedge_corner_right_01.png`);
  scene.load.image(ASSETS.fenceMiddle, `${ASSET_ROOT}/fence_vertical_middle_01.png`);
  scene.load.image(ASSETS.fenceTopCap, `${ASSET_ROOT}/fence_top_cap_01.png`);
}

export function createPatioPerimeter(scene, layout) {
  const { world } = layout;

  createBottomHedge(scene, world.width);
  createSideFence(scene, 0, false, world.height);
  createSideFence(scene, world.width, true, world.height);
}

function createBottomHedge(scene, worldWidth) {
  const leftCornerWidth = SOURCE_SIZE[ASSETS.hedgeCornerLeft].width * HEDGE_SCALE;
  const rightCornerWidth = SOURCE_SIZE[ASSETS.hedgeCornerRight].width * HEDGE_SCALE;
  const cornerJoinOverlap = 2;

  scene.add.image(0, HEDGE_BASELINE, ASSETS.hedgeCornerLeft)
    .setOrigin(0, 1)
    .setScale(HEDGE_SCALE)
    .setDepth(HEDGE_BASELINE);
  scene.add.image(worldWidth, HEDGE_BASELINE, ASSETS.hedgeCornerRight)
    .setOrigin(1, 1)
    .setScale(HEDGE_SCALE)
    .setDepth(HEDGE_BASELINE);

  createHedgeRun(scene, leftCornerWidth - cornerJoinOverlap, ENTRY_GAP.left);
  createHedgeRun(scene, ENTRY_GAP.right, worldWidth - rightCornerWidth + cornerJoinOverlap);
}

function createHedgeRun(scene, startX, endX) {
  let x = startX;
  let tileIndex = 0;

  while (x < endX) {
    const key = ASSETS.hedgeMiddle[tileIndex % ASSETS.hedgeMiddle.length];
    const { width, height } = SOURCE_SIZE[key];
    const remaining = endX - x;
    const displayWidth = width * HEDGE_SCALE;
    const image = scene.add.image(x, HEDGE_BASELINE, key)
      .setOrigin(0, 1)
      .setScale(HEDGE_SCALE)
      .setDepth(HEDGE_BASELINE);

    if (remaining < displayWidth) {
      image.setCrop(0, 0, Math.ceil(remaining / HEDGE_SCALE), height);
    }

    x += Math.min(displayWidth, remaining);
    tileIndex += 1;
  }
}

function createSideFence(scene, x, mirror, worldHeight) {
  const cap = SOURCE_SIZE[ASSETS.fenceTopCap];
  const middle = SOURCE_SIZE[ASSETS.fenceMiddle];
  const capHeight = cap.height * FENCE_SCALE;
  const middleStep = middle.height * FENCE_SCALE - 1;
  const bottomCornerHeight = Math.max(
    SOURCE_SIZE[ASSETS.hedgeCornerLeft].height,
    SOURCE_SIZE[ASSETS.hedgeCornerRight].height,
  ) * HEDGE_SCALE;
  const bodyBottom = worldHeight - bottomCornerHeight + 2;
  const originX = mirror ? 1 : 0;

  scene.add.image(x, FENCE_TOP, ASSETS.fenceTopCap)
    .setOrigin(originX, 0)
    .setScale(FENCE_SCALE)
    .setDepth(FENCE_TOP + capHeight);

  for (let y = FENCE_TOP + capHeight - 1; y < bodyBottom; y += middleStep) {
    scene.add.image(x, y, ASSETS.fenceMiddle)
      .setOrigin(originX, 0)
      .setScale(FENCE_SCALE)
      .setDepth(y + middle.height * FENCE_SCALE);
  }
}
