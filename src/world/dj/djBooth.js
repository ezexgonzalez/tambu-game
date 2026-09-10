const DJ_ASSET_ROOT = '/assets/props/dj';

const DJ_ASSETS = Object.freeze({
  boothFront: Object.freeze({ key: 'dj-booth-front-01', path: `${DJ_ASSET_ROOT}/dj_booth_front_01.png` }),
  consoleTop: Object.freeze({ key: 'dj-console-top-01', path: `${DJ_ASSET_ROOT}/dj_console_top_01.png` }),
  backPlatform: Object.freeze({ key: 'dj-back-platform-01', path: `${DJ_ASSET_ROOT}/dj_back_platform_01.png` }),
  stageBase: Object.freeze({ key: 'dj-stage-base-01', path: `${DJ_ASSET_ROOT}/dj_stage_base_01.png` }),
  speakerTallLeft: Object.freeze({ key: 'dj-speaker-tall-01', path: `${DJ_ASSET_ROOT}/speaker_tall_01.png` }),
  speakerTallRight: Object.freeze({ key: 'dj-speaker-tall-02', path: `${DJ_ASSET_ROOT}/speaker_tall_02.png` }),
  backTruss: Object.freeze({ key: 'dj-back-truss-01', path: `${DJ_ASSET_ROOT}/back_truss_01.png` }),
  lightLeft: Object.freeze({ key: 'dj-light-left', path: `${DJ_ASSET_ROOT}/mini_light_fixture_blue.png` }),
  lightRight: Object.freeze({ key: 'dj-light-right', path: `${DJ_ASSET_ROOT}/mini_light_fixture_violet.png` }),
});

export function preloadDjBooth(scene) {
  Object.values(DJ_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

export function createDjBooth(scene, dj) {
  const centerX = dj.x + dj.width / 2;
  const stageBottom = dj.y + dj.height + 4;

  const stage = scene.add.image(centerX, stageBottom, DJ_ASSETS.stageBase.key)
    .setOrigin(0.5, 1)
    .setDepth(8);

  // The open upper part of this platform is deliberately reserved for the DJ.
  const backPlatform = scene.add.image(centerX, dj.y + 80, DJ_ASSETS.backPlatform.key)
    .setOrigin(0.5, 1)
    .setDepth(9);

  const truss = scene.add.image(centerX, dj.y - 37, DJ_ASSETS.backTruss.key)
    .setOrigin(0.5, 0)
    .setDepth(10);

  const lightLeft = scene.add.image(centerX - 86, dj.y - 30, DJ_ASSETS.lightLeft.key)
    .setOrigin(0.5, 0)
    .setDepth(11);
  const lightRight = scene.add.image(centerX + 86, dj.y - 30, DJ_ASSETS.lightRight.key)
    .setOrigin(0.5, 0)
    .setDepth(11);

  const booth = scene.add.image(centerX, dj.y + 125, DJ_ASSETS.boothFront.key)
    .setOrigin(0.5, 1)
    .setDepth(12);

  const leftSpeaker = scene.add.image(
    dj.speakers[0].x,
    dj.speakers[0].y - 6,
    DJ_ASSETS.speakerTallLeft.key,
  ).setOrigin(0).setDepth(13);
  const rightSpeaker = scene.add.image(
    dj.speakers[1].x,
    dj.speakers[1].y - 6,
    DJ_ASSETS.speakerTallRight.key,
  ).setOrigin(0).setDepth(13);

  // Controller faces screen-bottom; the DJ stands in the clear platform above it.
  const consoleTop = scene.add.image(centerX, dj.y + 39, DJ_ASSETS.consoleTop.key)
    .setOrigin(0.5, 0)
    .setDepth(14);

  return {
    stage,
    backPlatform,
    truss,
    lights: [lightLeft, lightRight],
    booth,
    speakers: [leftSpeaker, rightSpeaker],
    consoleTop,
  };
}
