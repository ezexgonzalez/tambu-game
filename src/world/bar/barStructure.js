const BAR_ASSET_ROOT = '/assets/props/bar';

const BAR_ASSETS = Object.freeze({
  sign: Object.freeze({ key: 'bar-sign-01', path: `${BAR_ASSET_ROOT}/bar_sign_01.png` }),
  backShelf: Object.freeze({ key: 'bar-back-shelf-01', path: `${BAR_ASSET_ROOT}/bar_back_shelf_01.png` }),
  countertop: Object.freeze({ key: 'bar-countertop-01', path: `${BAR_ASSET_ROOT}/bar_countertop_01.png` }),
  frontCounter: Object.freeze({ key: 'bar-front-counter-01', path: `${BAR_ASSET_ROOT}/bar_front_counter_01.png` }),
  shaker: Object.freeze({ key: 'bar-shaker-01', path: `${BAR_ASSET_ROOT}/bar_shaker_01.png` }),
  lowball: Object.freeze({ key: 'bar-lowball-01', path: `${BAR_ASSET_ROOT}/bar_lowball_01.png` }),
  iceBucket: Object.freeze({ key: 'bar-ice-bucket-01', path: `${BAR_ASSET_ROOT}/bar_ice_bucket_01.png` }),
});

export function preloadBar(scene) {
  Object.values(BAR_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

// The bar is assembled as semantic planes: rear shelving, work surface, then its solid front.
export function createBar(scene, bar) {
  const centerX = bar.x + bar.width / 2;
  const dimensions = {
    sign: scene.textures.get(BAR_ASSETS.sign.key).getSourceImage(),
    backShelf: scene.textures.get(BAR_ASSETS.backShelf.key).getSourceImage(),
    countertop: scene.textures.get(BAR_ASSETS.countertop.key).getSourceImage(),
    frontCounter: scene.textures.get(BAR_ASSETS.frontCounter.key).getSourceImage(),
  };

  // Structural geometry is derived from true asset bounds rather than unrelated offsets.
  const backShelfToCountertopOverlap = 60;
  const countertopToFrontCounterOverlap = 16;
  const signIntoBackShelfOverlap = 72;
  const backShelfTop = bar.y + 7;
  const countertopTop = backShelfTop + dimensions.backShelf.height - backShelfToCountertopOverlap;
  // The lower countertop rail meets the upper front-counter lip with a measured 16px seam overlap.
  const frontCounterTop = countertopTop + dimensions.countertop.height - countertopToFrontCounterOverlap;
  const surfaceBottom = frontCounterTop - 2;
  const signTop = backShelfTop - (dimensions.sign.height - signIntoBackShelfOverlap);
  const depth = {
    backShelf: backShelfTop + 63,
    sign: backShelfTop + 68,
    countertop: countertopTop + 20,
    props: countertopTop + 21,
    frontCounter: frontCounterTop + 44,
  };

  const backShelf = scene.add.image(centerX, backShelfTop, BAR_ASSETS.backShelf.key)
    .setOrigin(0.5, 0)
    .setDepth(depth.backShelf);
  const sign = scene.add.image(centerX, signTop, BAR_ASSETS.sign.key)
    .setOrigin(0.5, 0)
    .setDepth(depth.sign);
  const countertop = scene.add.image(centerX, countertopTop, BAR_ASSETS.countertop.key)
    .setOrigin(0.5, 0)
    .setDepth(depth.countertop);

  // Keep the work area asymmetric and the middle clear for a future bartender.
  const props = [
    scene.add.image(centerX - 88, surfaceBottom, BAR_ASSETS.shaker.key).setOrigin(0.5, 1).setDepth(depth.props),
    scene.add.image(centerX + 58, surfaceBottom, BAR_ASSETS.lowball.key).setOrigin(0.5, 1).setDepth(depth.props),
    scene.add.image(centerX + 100, surfaceBottom, BAR_ASSETS.iceBucket.key).setOrigin(0.5, 1).setDepth(depth.props),
  ];

  const frontCounter = scene.add.image(centerX, frontCounterTop, BAR_ASSETS.frontCounter.key)
    .setOrigin(0.5, 0)
    .setDepth(depth.frontCounter);

  return { backShelf, sign, countertop, props, frontCounter };
}
