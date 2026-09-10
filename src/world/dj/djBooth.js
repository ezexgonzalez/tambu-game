const DJ_ASSET_ROOT = '/assets/props/dj';

const DJ_ASSETS = Object.freeze({
  boothFront: Object.freeze({ key: 'dj-booth-front-01', path: `${DJ_ASSET_ROOT}/dj_booth_front_01.png` }),
  consoleTop: Object.freeze({ key: 'dj-console-top-01', path: `${DJ_ASSET_ROOT}/dj_console_top_01.png` }),
  backPlatform: Object.freeze({ key: 'dj-back-platform-01', path: `${DJ_ASSET_ROOT}/dj_back_platform_01.png` }),
  stageBase: Object.freeze({ key: 'dj-stage-base-01', path: `${DJ_ASSET_ROOT}/dj_stage_base_01.png` }),
  speakerTallLeft: Object.freeze({ key: 'dj-speaker-tall-01', path: `${DJ_ASSET_ROOT}/speaker_tall_01.png` }),
  speakerTallRight: Object.freeze({ key: 'dj-speaker-tall-02', path: `${DJ_ASSET_ROOT}/speaker_tall_02.png` }),
  trussPortal: Object.freeze({ key: 'dj-truss-portal-01', path: `${DJ_ASSET_ROOT}/dj_truss_portal_01.png` }),
  consoleShelf: Object.freeze({ key: 'dj-console-shelf-01', path: `${DJ_ASSET_ROOT}/dj_console_shelf_01.png` }),
  cupBlue: Object.freeze({ key: 'dj-cup-blue-01', path: `${DJ_ASSET_ROOT}/dj_cup_blue_01.png` }),
  cupRed: Object.freeze({ key: 'dj-cup-red-01', path: `${DJ_ASSET_ROOT}/dj_cup_red_01.png` }),
  bottle: Object.freeze({ key: 'dj-bottle-01', path: `${DJ_ASSET_ROOT}/dj_bottle_01.png` }),
});

export function preloadDjBooth(scene) {
  Object.values(DJ_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

export function createDjBooth(scene, dj) {
  const centerX = dj.x + dj.width / 2;
  const stageBottom = dj.y + dj.height;

  const stage = scene.add.image(centerX, stageBottom, DJ_ASSETS.stageBase.key)
    .setOrigin(0.5, 1)
    .setDepth(8);

  // This clean platform deliberately reserves standing room behind the controller.
  const backPlatform = scene.add.image(centerX, dj.y + 78, DJ_ASSETS.backPlatform.key)
    .setOrigin(0.5, 1)
    .setDepth(9);

  const truss = scene.add.image(centerX, dj.y - 29, DJ_ASSETS.trussPortal.key)
    .setOrigin(0.5, 0)
    .setDepth(10);

  const booth = scene.add.image(centerX, dj.y + 114, DJ_ASSETS.boothFront.key)
    .setOrigin(0.5, 1)
    .setDepth(12);

  const leftSpeaker = scene.add.image(
    dj.speakers[0].x,
    dj.speakers[0].y,
    DJ_ASSETS.speakerTallLeft.key,
  ).setOrigin(0).setDepth(13);
  const rightSpeaker = scene.add.image(
    dj.speakers[1].x,
    dj.speakers[1].y,
    DJ_ASSETS.speakerTallRight.key,
  ).setOrigin(0).setDepth(13);

  const consoleShelf = scene.add.image(centerX, dj.y + 47, DJ_ASSETS.consoleShelf.key)
    .setOrigin(0.5, 0)
    .setDepth(14);

  // Controller sits on the shelf; the open deck above remains reserved for the future DJ.
  const consoleTop = scene.add.image(centerX, dj.y + 24, DJ_ASSETS.consoleTop.key)
    .setOrigin(0.5, 0)
    .setDepth(16);
  const props = [
    scene.add.image(centerX - 68, dj.y + 31, DJ_ASSETS.cupBlue.key).setOrigin(0.5, 0).setDepth(17),
    scene.add.image(centerX + 66, dj.y + 20, DJ_ASSETS.bottle.key).setOrigin(0.5, 0).setDepth(17),
    scene.add.image(centerX + 78, dj.y + 34, DJ_ASSETS.cupRed.key).setOrigin(0.5, 0).setDepth(17),
  ];

  return {
    stage,
    backPlatform,
    truss,
    lights: [],
    booth,
    speakers: [leftSpeaker, rightSpeaker],
    consoleTop,
    consoleShelf,
    props,
  };
}
