const BAR_ASSET_ROOT = '/assets/props/bar';
const BAR_CHARACTER_ASSET_ROOT = '/assets/characters/bartender';
const BAR_BARTENDER_IDLE_ANIMATION = 'bar-bartender-idle-v1';
const BAR_BARTENDER_WORK_ANIMATION = 'bar-bartender-work-v1';

const BAR_ASSETS = Object.freeze({
  sign: Object.freeze({ key: 'bar-sign-01', path: `${BAR_ASSET_ROOT}/bar_sign_01.png` }),
  backShelf: Object.freeze({ key: 'bar-back-shelf-01', path: `${BAR_ASSET_ROOT}/bar_back_shelf_01.png` }),
  countertop: Object.freeze({ key: 'bar-countertop-01', path: `${BAR_ASSET_ROOT}/bar_countertop_01.png` }),
  frontCounter: Object.freeze({ key: 'bar-front-counter-01', path: `${BAR_ASSET_ROOT}/bar_front_counter_01.png` }),
  shaker: Object.freeze({ key: 'bar-shaker-01', path: `${BAR_ASSET_ROOT}/bar_shaker_01.png` }),
  lowball: Object.freeze({ key: 'bar-lowball-01', path: `${BAR_ASSET_ROOT}/bar_lowball_01.png` }),
  iceBucket: Object.freeze({ key: 'bar-ice-bucket-01', path: `${BAR_ASSET_ROOT}/bar_ice_bucket_01.png` }),
});

const BAR_CHARACTER_ASSETS = Object.freeze({
  bartender: Object.freeze({ key: 'bar-bartender-01', path: `${BAR_CHARACTER_ASSET_ROOT}/bartender_01.png` }),
});

// Source-pixel seam markers, measured on the visible central structure rather than PNG canvas edges.
const COUNTERTOP_FRONT_SEAM = Object.freeze({
  countertopSupportRailY: 47,
  frontCounterSupportLipY: 15,
  overlapSourcePixels: 2,
});

// External visible bounds, measured from the opaque body of each PNG.
// These are the edges that must read as one continuous bar unit in-game.
const COUNTERTOP_FRONT_BODY_FIT = Object.freeze({
  countertopLeft: 0,
  countertopRight: 303,
  frontCounterLeft: 0,
  frontCounterRight: 309,
});

export function preloadBar(scene) {
  Object.values(BAR_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
  scene.load.spritesheet(BAR_CHARACTER_ASSETS.bartender.key, BAR_CHARACTER_ASSETS.bartender.path, {
    frameWidth: 32,
    frameHeight: 48,
  });
}

// The bar is assembled as semantic planes: rear shelving, work surface, then its solid front.
export function createBar(scene, bar) {
  const centerX = bar.x + bar.width / 2;
  const scale = bar.scale ?? 1;
  const scaled = (value) => value * scale;
  const dimensions = {
    sign: scene.textures.get(BAR_ASSETS.sign.key).getSourceImage(),
    backShelf: scene.textures.get(BAR_ASSETS.backShelf.key).getSourceImage(),
    countertop: scene.textures.get(BAR_ASSETS.countertop.key).getSourceImage(),
    frontCounter: scene.textures.get(BAR_ASSETS.frontCounter.key).getSourceImage(),
  };

  // Structural geometry is derived from true asset bounds rather than unrelated offsets.
  const backShelfToCountertopOverlap = 60;
  const signIntoBackShelfOverlap = 72;
  const backShelfTop = bar.y + scaled(7);
  const countertopTop = backShelfTop + scaled(dimensions.backShelf.height - backShelfToCountertopOverlap);
  // Join the measured lower countertop rail to the front counter's actual support lip.
  const frontCounterTop = countertopTop + scaled(
    COUNTERTOP_FRONT_SEAM.countertopSupportRailY
    - COUNTERTOP_FRONT_SEAM.frontCounterSupportLipY
    - COUNTERTOP_FRONT_SEAM.overlapSourcePixels,
  );
  const surfaceBottom = frontCounterTop - scaled(2);
  const countertopVisibleCenter =
    (COUNTERTOP_FRONT_BODY_FIT.countertopLeft
      + COUNTERTOP_FRONT_BODY_FIT.countertopRight) / 2
    - dimensions.countertop.width / 2;
  const frontCounterVisibleCenter =
    (COUNTERTOP_FRONT_BODY_FIT.frontCounterLeft
      + COUNTERTOP_FRONT_BODY_FIT.frontCounterRight) / 2
    - dimensions.frontCounter.width / 2;
  const countertopVisibleWidth =
    COUNTERTOP_FRONT_BODY_FIT.countertopRight
    - COUNTERTOP_FRONT_BODY_FIT.countertopLeft
    + 1;
  const frontCounterVisibleWidth =
    COUNTERTOP_FRONT_BODY_FIT.frontCounterRight
    - COUNTERTOP_FRONT_BODY_FIT.frontCounterLeft
    + 1;
  const countertopScaleX = scale * (frontCounterVisibleWidth / countertopVisibleWidth);
  const countertopX = centerX
    + scaled(frontCounterVisibleCenter)
    - countertopVisibleCenter * countertopScaleX;
  const signTop = backShelfTop - scaled(dimensions.sign.height - signIntoBackShelfOverlap);
  const depth = {
    backShelf: backShelfTop + scaled(63),
    sign: backShelfTop + scaled(68),
    bartender: countertopTop + scaled(18),
    countertop: countertopTop + scaled(20),
    props: countertopTop + scaled(21),
    frontCounter: frontCounterTop + scaled(44),
  };

  const backShelf = scene.add.image(centerX, backShelfTop, BAR_ASSETS.backShelf.key)
    .setOrigin(0.5, 0)
    .setScale(scale)
    .setDepth(depth.backShelf);
  const sign = scene.add.image(centerX, signTop, BAR_ASSETS.sign.key)
    .setOrigin(0.5, 0)
    .setScale(scale)
    .setDepth(depth.sign);

  if (!scene.anims.exists(BAR_BARTENDER_IDLE_ANIMATION)) {
    scene.anims.create({
      key: BAR_BARTENDER_IDLE_ANIMATION,
      frames: scene.anims.generateFrameNumbers(BAR_CHARACTER_ASSETS.bartender.key, { frames: [0, 1, 5, 1] }),
      frameRate: 2,
      repeat: -1,
    });
    scene.anims.create({
      key: BAR_BARTENDER_WORK_ANIMATION,
      frames: scene.anims.generateFrameNumbers(BAR_CHARACTER_ASSETS.bartender.key, { frames: [2, 3, 4, 2] }),
      frameRate: 3,
      repeat: 0,
    });
  }

  // Decorative resident: the counter and props naturally occlude his lower body.
  const bartender = scene.add.sprite(centerX, countertopTop + scaled(22), BAR_CHARACTER_ASSETS.bartender.key)
    .setOrigin(0.5, 1)
    .setScale(1.24)
    .setDepth(depth.bartender)
    .play(BAR_BARTENDER_IDLE_ANIMATION);

  const scheduleBartenderWork = () => {
    scene.time.delayedCall(5200, () => {
      bartender.play(BAR_BARTENDER_WORK_ANIMATION);
      bartender.once(`animationcomplete-${BAR_BARTENDER_WORK_ANIMATION}`, () => {
        bartender.play(BAR_BARTENDER_IDLE_ANIMATION);
        scheduleBartenderWork();
      });
    });
  };
  scheduleBartenderWork();

  const countertop = scene.add.image(countertopX, countertopTop, BAR_ASSETS.countertop.key)
    .setOrigin(0.5, 0)
    .setScale(countertopScaleX, scale)
    .setDepth(depth.countertop);

  // Keep the work area asymmetric and the middle clear for a future bartender.
  const props = [
    scene.add.image(centerX - scaled(88), surfaceBottom, BAR_ASSETS.shaker.key).setOrigin(0.5, 1).setScale(scale).setDepth(depth.props),
    scene.add.image(centerX + scaled(58), surfaceBottom, BAR_ASSETS.lowball.key).setOrigin(0.5, 1).setScale(scale).setDepth(depth.props),
    scene.add.image(centerX + scaled(100), surfaceBottom, BAR_ASSETS.iceBucket.key).setOrigin(0.5, 1).setScale(scale).setDepth(depth.props),
  ];

  const frontCounter = scene.add.image(centerX, frontCounterTop, BAR_ASSETS.frontCounter.key)
    .setOrigin(0.5, 0)
    .setScale(scale)
    .setDepth(depth.frontCounter);

  return { backShelf, sign, bartender, countertop, props, frontCounter };
}
