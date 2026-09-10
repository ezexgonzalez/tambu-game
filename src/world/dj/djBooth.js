const DJ_ASSET_ROOT = '/assets/props/dj';

const DJ_ASSETS = Object.freeze({
  boothFront: Object.freeze({ key: 'dj-booth-front-01', path: `${DJ_ASSET_ROOT}/dj_booth_front_01.png` }),
  consoleTop: Object.freeze({ key: 'dj-console-top-01', path: `${DJ_ASSET_ROOT}/dj_console_top_01.png` }),
  stageBase: Object.freeze({ key: 'dj-stage-base-01', path: `${DJ_ASSET_ROOT}/dj_stage_base_01.png` }),
  speakerTallLeft: Object.freeze({ key: 'dj-speaker-tall-01', path: `${DJ_ASSET_ROOT}/speaker_tall_01.png` }),
  speakerTallRight: Object.freeze({ key: 'dj-speaker-tall-02', path: `${DJ_ASSET_ROOT}/speaker_tall_02.png` }),
  subSpeaker: Object.freeze({ key: 'dj-sub-speaker-01', path: `${DJ_ASSET_ROOT}/sub_speaker_01.png` }),
  backTruss: Object.freeze({ key: 'dj-back-truss-01', path: `${DJ_ASSET_ROOT}/back_truss_01.png` }),
  equipmentCase: Object.freeze({ key: 'dj-equipment-case-01', path: `${DJ_ASSET_ROOT}/equipment_case_01.png` }),
  drinkCup: Object.freeze({ key: 'dj-drink-cup-01', path: `${DJ_ASSET_ROOT}/drink_cup_01.png` }),
  waterBottle: Object.freeze({ key: 'dj-water-bottle-01', path: `${DJ_ASSET_ROOT}/bottle_water_01.png` }),
  lightBlue: Object.freeze({ key: 'dj-light-blue', path: `${DJ_ASSET_ROOT}/mini_light_fixture_blue.png` }),
  lightViolet: Object.freeze({ key: 'dj-light-violet', path: `${DJ_ASSET_ROOT}/mini_light_fixture_violet.png` }),
});

export function preloadDjBooth(scene) {
  Object.values(DJ_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

export function createDjBooth(scene, dj) {
  const centerX = dj.x + dj.width / 2;
  const stageBottom = dj.y + dj.height + 4;
  const boothBottom = dj.y + dj.height - 2;

  const stage = scene.add.image(centerX, stageBottom, DJ_ASSETS.stageBase.key)
    .setOrigin(0.5, 1)
    .setDepth(8);

  const truss = scene.add.image(centerX, dj.y - 32, DJ_ASSETS.backTruss.key)
    .setOrigin(0.5, 0)
    .setDepth(9);

  const lightBlue = scene.add.image(centerX - 61, dj.y - 23, DJ_ASSETS.lightBlue.key)
    .setOrigin(0.5, 0)
    .setDepth(10);
  const lightViolet = scene.add.image(centerX + 42, dj.y - 26, DJ_ASSETS.lightViolet.key)
    .setOrigin(0.5, 0)
    .setDepth(10);

  const booth = scene.add.image(centerX, boothBottom, DJ_ASSETS.boothFront.key)
    .setOrigin(0.5, 1)
    .setDepth(12);

  const leftSpeaker = scene.add.image(
    dj.speakers[0].x,
    dj.speakers[0].y - 7,
    DJ_ASSETS.speakerTallLeft.key,
  ).setOrigin(0).setDepth(13);
  const rightSpeaker = scene.add.image(
    dj.speakers[1].x,
    dj.speakers[1].y - 7,
    DJ_ASSETS.speakerTallRight.key,
  ).setOrigin(0).setDepth(13);

  const consoleTop = scene.add.image(centerX, dj.y + 7, DJ_ASSETS.consoleTop.key)
    .setOrigin(0.5, 0)
    .setDepth(14);
  const cup = scene.add.image(centerX + 51, dj.y + 24, DJ_ASSETS.drinkCup.key)
    .setOrigin(0.5, 0)
    .setDepth(15);

  const label = scene.add.text(centerX, dj.y + 91, 'DJ', {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#e7dcff',
    fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(15);
  label.setShadow(0, 0, '#8d65ff', 3, true, true);

  return {
    stage,
    truss,
    lights: [lightBlue, lightViolet],
    booth,
    speakers: [leftSpeaker, rightSpeaker],
    consoleTop,
    cup,
    label,
  };
}
