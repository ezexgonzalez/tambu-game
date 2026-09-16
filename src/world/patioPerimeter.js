const ASSET_ROOT = '/assets/props/perimeter';

const HEDGE_SCALE = 0.2;
const CORNER_SCALE = 0.4;
const FENCE_SCALE = 0.5;
// Slightly below the world edge: the hedge finishes the viewport and naturally
// occludes Tambu's feet at the lower collision limit without closing the entry.
const HEDGE_BASELINE = 966;
const FENCE_TOP = 278;
const ENTRY_GAP = { left: 1456, right: 1552 };

const ASSETS = {
  hedgeMiddle: ['perimeter-hedge-middle-01', 'perimeter-hedge-middle-02'],
  hedgeCornerLeft: 'perimeter-fence-hedge-corner-left-02',
  hedgeCornerRight: 'perimeter-fence-hedge-corner-right-02',
  fenceMiddle: 'perimeter-fence-side-topdown-middle-02',
};

// All pieces within each family share this one scale. The hedge middles were
// trimmed from the supplied seamless section before export, so their joining
// sides carry leaf texture rather than a second exterior outline.
const SOURCE_SIZE = {
  [ASSETS.hedgeMiddle[0]]: { width: 606, height: 168 },
  [ASSETS.hedgeMiddle[1]]: { width: 616, height: 172 },
  [ASSETS.hedgeCornerLeft]: { width: 106, height: 94 },
  [ASSETS.hedgeCornerRight]: { width: 106, height: 94 },
  [ASSETS.fenceMiddle]: { width: 18, height: 162 },
};

export function preloadPatioPerimeter(scene) {
  scene.load.image(ASSETS.hedgeMiddle[0], `${ASSET_ROOT}/hedge_bottom_middle_01.png`);
  scene.load.image(ASSETS.hedgeMiddle[1], `${ASSET_ROOT}/hedge_bottom_middle_02.png`);
  scene.load.image(ASSETS.hedgeCornerLeft, `${ASSET_ROOT}/fence_hedge_corner_left_02.png`);
  scene.load.image(ASSETS.hedgeCornerRight, `${ASSET_ROOT}/fence_hedge_corner_right_02.png`);
  scene.load.image(ASSETS.fenceMiddle, `${ASSET_ROOT}/fence_side_topdown_middle_02.png`);
}

export function createPatioPerimeter(scene, layout) {
  const { world } = layout;

  createBottomHedge(scene, world.width);
  createSideFence(scene, 0, false);
  createSideFence(scene, world.width, true);
}

function createBottomHedge(scene, worldWidth) {
  const leftCornerWidth = SOURCE_SIZE[ASSETS.hedgeCornerLeft].width * CORNER_SCALE;
  const rightCornerWidth = SOURCE_SIZE[ASSETS.hedgeCornerRight].width * CORNER_SCALE;
  const cornerJoinOverlap = 2;

  scene.add.image(0, HEDGE_BASELINE, ASSETS.hedgeCornerLeft)
    .setOrigin(0, 1)
    .setScale(CORNER_SCALE)
    .setDepth(HEDGE_BASELINE);
  scene.add.image(worldWidth, HEDGE_BASELINE, ASSETS.hedgeCornerRight)
    .setOrigin(1, 1)
    .setScale(CORNER_SCALE)
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

function createSideFence(scene, x, mirror) {
  const middle = SOURCE_SIZE[ASSETS.fenceMiddle];
  const middleStep = middle.height * FENCE_SCALE - 1;
  const bottomCornerHeight = Math.max(
    SOURCE_SIZE[ASSETS.hedgeCornerLeft].height,
    SOURCE_SIZE[ASSETS.hedgeCornerRight].height,
  ) * CORNER_SCALE;
  const bodyBottom = HEDGE_BASELINE - bottomCornerHeight + 2;
  const originX = mirror ? 1 : 0;

  for (let y = FENCE_TOP; y < bodyBottom; y += middleStep) {
    scene.add.image(x, y, ASSETS.fenceMiddle)
      .setOrigin(originX, 0)
      .setScale(FENCE_SCALE)
      .setFlipX(mirror)
      .setDepth(y + middle.height * FENCE_SCALE);
  }
}
