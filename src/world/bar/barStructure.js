const BAR_ASSET_ROOT = '/assets/props/bar';
const BAR_CHARACTER_ASSET_ROOT = '/assets/characters/bartender';
const BAR_BARTENDER_IDLE_ANIMATION = 'bar-bartender-idle-v1';
const BAR_BARTENDER_WORK_ANIMATION = 'bar-bartender-work-v1';

const BAR_ASSETS = Object.freeze({
  sign: Object.freeze({ key: 'bar-sign-01', path: `${BAR_ASSET_ROOT}/bar_sign_01.png` }),
  backShelf: Object.freeze({ key: 'bar-back-shelf-01', path: `${BAR_ASSET_ROOT}/bar_back_shelf_01.png` }),
  countertopCenter: Object.freeze({ key: 'bar-countertop-center-02', path: `${BAR_ASSET_ROOT}/bar_countertop_center_02.png` }),
  frontCenter: Object.freeze({ key: 'bar-front-center-02', path: `${BAR_ASSET_ROOT}/bar_front_center_02.png` }),
  baseCenter: Object.freeze({ key: 'bar-base-center-02', path: `${BAR_ASSET_ROOT}/bar_base_center_02.png` }),
  shaker: Object.freeze({ key: 'bar-shaker-01', path: `${BAR_ASSET_ROOT}/bar_shaker_01.png` }),
  lowball: Object.freeze({ key: 'bar-lowball-01', path: `${BAR_ASSET_ROOT}/bar_lowball_01.png` }),
  iceBucket: Object.freeze({ key: 'bar-ice-bucket-01', path: `${BAR_ASSET_ROOT}/bar_ice_bucket_01.png` }),
});

const BAR_CHARACTER_ASSETS = Object.freeze({
  bartender: Object.freeze({ key: 'bar-bartender-01', path: `${BAR_CHARACTER_ASSET_ROOT}/bartender_01.png` }),
});

// Source-space assembly measured directly from the approved modular kit.
// All modules use the exact same runtime scale; the top overhang is part of the kit geometry.
const BAR_FRONT_ASSEMBLY = Object.freeze({
  width: 1264,
  topOffsetY: 122,
  counterSurfaceSourceY: 118,
  modules: Object.freeze({
    countertop: Object.freeze({ asset: 'countertopCenter', x: 0, y: 0 }),
    front: Object.freeze({ asset: 'frontCenter', x: 64, y: 118 }),
    base: Object.freeze({ asset: 'baseCenter', x: 58, y: 428 }),
  }),
});

export function preloadBar(scene) {
  Object.values(BAR_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
  scene.load.spritesheet(BAR_CHARACTER_ASSETS.bartender.key, BAR_CHARACTER_ASSETS.bartender.path, {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function createBarFrontAssembly(scene, { centerX, topY, scale, depth }) {
  const assemblyLeftX = centerX - BAR_FRONT_ASSEMBLY.width * scale / 2;
  const addModule = ({ asset, x, y }, moduleDepth) => scene.add.image(
    assemblyLeftX + x * scale,
    topY + y * scale,
    BAR_ASSETS[asset].key,
  ).setOrigin(0).setScale(scale).setDepth(moduleDepth);

  const countertop = addModule(BAR_FRONT_ASSEMBLY.modules.countertop, depth.countertop);
  const front = addModule(BAR_FRONT_ASSEMBLY.modules.front, depth.front);
  const base = addModule(BAR_FRONT_ASSEMBLY.modules.base, depth.base);
  const baseHeight = scene.textures.get(BAR_ASSETS.baseCenter.key).getSourceImage().height;

  return {
    countertop,
    front,
    base,
    counterSurfaceY: topY + BAR_FRONT_ASSEMBLY.counterSurfaceSourceY * scale,
    bottomY: topY + (BAR_FRONT_ASSEMBLY.modules.base.y + baseHeight) * scale,
  };
}

// The bar is assembled as semantic planes: rear shelving, bartender, work surface, then its solid front.
export function createBar(scene, bar) {
  const centerX = bar.x + bar.width / 2;
  const shelfScale = bar.scale ?? 1;
  const scaledShelf = (value) => value * shelfScale;
  const frontAssemblyScale = bar.width / BAR_FRONT_ASSEMBLY.width;
  const signHeight = scene.textures.get(BAR_ASSETS.sign.key).getSourceImage().height;
  const backShelfTop = bar.y + scaledShelf(7);
  const signTop = backShelfTop - scaledShelf(signHeight - 72);
  const frontAssemblyTop = bar.y + BAR_FRONT_ASSEMBLY.topOffsetY;
  const counterSurfaceY = frontAssemblyTop
    + BAR_FRONT_ASSEMBLY.counterSurfaceSourceY * frontAssemblyScale;
  const depth = {
    backShelf: backShelfTop + scaledShelf(63),
    sign: backShelfTop + scaledShelf(68),
    bartender: counterSurfaceY - 8,
    countertop: counterSurfaceY - 6,
    props: counterSurfaceY - 5,
    front: counterSurfaceY + 44,
    base: counterSurfaceY + 45,
  };

  const backShelf = scene.add.image(centerX, backShelfTop, BAR_ASSETS.backShelf.key)
    .setOrigin(0.5, 0)
    .setScale(shelfScale)
    .setDepth(depth.backShelf);
  const sign = scene.add.image(centerX, signTop, BAR_ASSETS.sign.key)
    .setOrigin(0.5, 0)
    .setScale(shelfScale)
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

  // Decorative resident: the assembly's countertop and front naturally occlude his lower body.
  const bartender = scene.add.sprite(
    centerX,
    counterSurfaceY - frontAssemblyScale * 24,
    BAR_CHARACTER_ASSETS.bartender.key,
  )
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

  const frontAssembly = createBarFrontAssembly(scene, {
    centerX,
    topY: frontAssemblyTop,
    scale: frontAssemblyScale,
    depth,
  });

  // Keep the work area asymmetric and the middle clear for the bartender.
  const props = [
    scene.add.image(centerX - scaledShelf(88), counterSurfaceY - frontAssemblyScale * 8, BAR_ASSETS.shaker.key)
      .setOrigin(0.5, 1).setScale(shelfScale).setDepth(depth.props),
    scene.add.image(centerX + scaledShelf(58), counterSurfaceY - frontAssemblyScale * 8, BAR_ASSETS.lowball.key)
      .setOrigin(0.5, 1).setScale(shelfScale).setDepth(depth.props),
    scene.add.image(centerX + scaledShelf(100), counterSurfaceY - frontAssemblyScale * 8, BAR_ASSETS.iceBucket.key)
      .setOrigin(0.5, 1).setScale(shelfScale).setDepth(depth.props),
  ];

  return { backShelf, sign, bartender, frontAssembly, props };
}
