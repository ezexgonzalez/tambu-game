const DJ_ASSET_ROOT = '/assets/props/dj';

const DJ_ASSETS = Object.freeze({
  boothFront: Object.freeze({ key: 'dj-booth-front-01', path: `${DJ_ASSET_ROOT}/dj_booth_front_01.png` }),
  consoleTop: Object.freeze({ key: 'dj-console-top-01', path: `${DJ_ASSET_ROOT}/dj_console_top_01.png` }),
  backPlatform: Object.freeze({ key: 'dj-back-platform-01', path: `${DJ_ASSET_ROOT}/dj_back_platform_01.png` }),
  stageBase: Object.freeze({ key: 'dj-stage-base-01', path: `${DJ_ASSET_ROOT}/dj_stage_base_01.png` }),
  speakerTallLeft: Object.freeze({ key: 'dj-speaker-tall-01', path: `${DJ_ASSET_ROOT}/speaker_tall_01.png` }),
  speakerTallRight: Object.freeze({ key: 'dj-speaker-tall-02', path: `${DJ_ASSET_ROOT}/speaker_tall_02.png` }),
  lightTruss: Object.freeze({ key: 'dj-light-truss-01', path: `${DJ_ASSET_ROOT}/dj_light_truss_01.png` }),
  supportLeft: Object.freeze({ key: 'dj-light-support-left-01', path: `${DJ_ASSET_ROOT}/dj_light_support_left_01.png` }),
  supportRight: Object.freeze({ key: 'dj-light-support-right-01', path: `${DJ_ASSET_ROOT}/dj_light_support_right_01.png` }),
  consoleShelf: Object.freeze({ key: 'dj-console-shelf-01', path: `${DJ_ASSET_ROOT}/dj_console_shelf_01.png` }),
});

export function preloadDjBooth(scene) {
  Object.values(DJ_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

export function createDjBooth(scene, dj) {
  const centerX = dj.x + dj.width / 2;
  const stageBottom = dj.y + dj.height;
  const rigDepth = {
    // Semantic layers: floor -> rear support -> actor -> console/structure -> front occluders.
    platform: dj.y + 10,
    shelf: dj.y + 28,
    console: dj.y + 58,
    supports: dj.y + 70,
    truss: dj.y + 71,
    speakers: dj.y + 109,
    booth: dj.y + 114,
    stage: dj.y + 115,
  };

  const stage = scene.add.image(centerX, stageBottom, DJ_ASSETS.stageBase.key)
    .setOrigin(0.5, 1)
    .setDepth(rigDepth.stage);

  // This clean platform deliberately reserves standing room behind the controller.
  const backPlatform = scene.add.image(centerX, dj.y + 78, DJ_ASSETS.backPlatform.key)
    .setOrigin(0.5, 1)
    .setDepth(rigDepth.platform);

  const truss = scene.add.image(centerX, dj.y - 31, DJ_ASSETS.lightTruss.key)
    .setOrigin(0.5, 0)
    .setDepth(rigDepth.truss);
  const supports = [
    scene.add.image(centerX - 94, dj.y - 20, DJ_ASSETS.supportLeft.key).setOrigin(0.5, 0).setDepth(rigDepth.supports),
    scene.add.image(centerX + 94, dj.y - 20, DJ_ASSETS.supportRight.key).setOrigin(0.5, 0).setDepth(rigDepth.supports),
  ];

  const booth = scene.add.image(centerX, dj.y + 114, DJ_ASSETS.boothFront.key)
    .setOrigin(0.5, 1)
    .setDepth(rigDepth.booth);

  const leftSpeaker = scene.add.image(
    dj.speakers[0].x,
    dj.speakers[0].y,
    DJ_ASSETS.speakerTallLeft.key,
  ).setOrigin(0).setDepth(rigDepth.speakers);
  const rightSpeaker = scene.add.image(
    dj.speakers[1].x,
    dj.speakers[1].y,
    DJ_ASSETS.speakerTallRight.key,
  ).setOrigin(0).setDepth(rigDepth.speakers);

  // Keep the support surface inside the booth body, behind the side supports and front panel.
  const consoleShelf = scene.add.image(centerX, dj.y + 39, DJ_ASSETS.consoleShelf.key)
    .setOrigin(0.5, 0)
    .setDepth(rigDepth.shelf);

  // Controller sits on the shelf; the open deck above remains reserved for the future DJ.
  const consoleTop = scene.add.image(centerX, dj.y + 24, DJ_ASSETS.consoleTop.key)
    .setOrigin(0.5, 0)
    .setDepth(rigDepth.console);

  return {
    stage,
    backPlatform,
    truss,
    supports,
    booth,
    speakers: [leftSpeaker, rightSpeaker],
    consoleTop,
    consoleShelf,
  };
}
