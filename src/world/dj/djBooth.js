const DJ_ASSET_ROOT = '/assets/props/dj';
const DJ_CHARACTER_ASSET_ROOT = '/assets/characters/dj';
const DJ_SPEAKER_PULSE_ANIMATION = 'dj-speaker-pulse-v1';
const DJ_RESIDENT_IDLE_ANIMATION = 'dj-resident-idle-v1';
const DJ_RESIDENT_MIX_ANIMATION = 'dj-resident-mix-v1';

const DJ_ASSETS = Object.freeze({
  boothFront: Object.freeze({ key: 'dj-booth-front-01', path: `${DJ_ASSET_ROOT}/dj_booth_front_01.png` }),
  backPlatform: Object.freeze({ key: 'dj-back-platform-01', path: `${DJ_ASSET_ROOT}/dj_back_platform_01.png` }),
  stageBase: Object.freeze({ key: 'dj-stage-base-01', path: `${DJ_ASSET_ROOT}/dj_stage_base_01.png` }),
  speakerTallLeft: Object.freeze({ key: 'dj-speaker-tall-01', path: `${DJ_ASSET_ROOT}/speaker_tall_01.png` }),
  speakerTallRight: Object.freeze({ key: 'dj-speaker-tall-02', path: `${DJ_ASSET_ROOT}/speaker_tall_02.png` }),
  lightTruss: Object.freeze({ key: 'dj-light-truss-01', path: `${DJ_ASSET_ROOT}/dj_light_truss_01.png` }),
  supportLeft: Object.freeze({ key: 'dj-light-support-left-01', path: `${DJ_ASSET_ROOT}/dj_light_support_left_01.png` }),
  supportRight: Object.freeze({ key: 'dj-light-support-right-01', path: `${DJ_ASSET_ROOT}/dj_light_support_right_01.png` }),
  consoleShelf: Object.freeze({ key: 'dj-console-shelf-01', path: `${DJ_ASSET_ROOT}/dj_console_shelf_01.png` }),
  consoleFacingDj: Object.freeze({ key: 'dj-console-facing-dj-01', path: `${DJ_ASSET_ROOT}/dj_console_facing_dj_01.png` }),
  headphones: Object.freeze({ key: 'dj-headphones-02', path: `${DJ_ASSET_ROOT}/dj_headphones_02.png` }),
  cupAmber: Object.freeze({ key: 'dj-cup-amber-02', path: `${DJ_ASSET_ROOT}/dj_cup_amber_02.png` }),
  bottleTall: Object.freeze({ key: 'dj-bottle-tall-02', path: `${DJ_ASSET_ROOT}/dj_bottle_tall_02.png` }),
  speakerPulseFrames: Object.freeze({ key: 'dj-speaker-pulse-frames-01', path: `${DJ_ASSET_ROOT}/dj_speaker_pulse_frames_01.png` }),
});

const DJ_CHARACTER_ASSETS = Object.freeze({
  resident: Object.freeze({ key: 'dj-resident-01', path: `${DJ_CHARACTER_ASSET_ROOT}/dj_resident_01.png` }),
});

export function preloadDjBooth(scene) {
  Object.values(DJ_ASSETS)
    .filter(({ key }) => key !== DJ_ASSETS.speakerPulseFrames.key)
    .forEach(({ key, path }) => scene.load.image(key, path));
  scene.load.spritesheet(DJ_ASSETS.speakerPulseFrames.key, DJ_ASSETS.speakerPulseFrames.path, {
    frameWidth: 42,
    frameHeight: 80,
  });
  Object.values(DJ_CHARACTER_ASSETS).forEach(({ key, path }) => scene.load.spritesheet(key, path, {
    frameWidth: 32,
    frameHeight: 48,
  }));
}

export function createDjBooth(scene, dj) {
  const centerX = dj.x + dj.width / 2;
  const stageBottom = dj.y + dj.height;
  const rigDepth = {
    // Semantic layers: floor -> actor -> shelf -> console/props -> structure -> front occluders.
    platform: dj.y + 10,
    residentDj: dj.y + 60,
    shelf: dj.y + 67,
    console: dj.y + 68,
    surfaceProps: dj.y + 69,
    supports: dj.y + 70,
    truss: dj.y + 71,
    speakers: dj.y + 109,
    booth: dj.y + 114,
    stage: dj.y + 113,
  };

  const stage = scene.add.image(centerX, stageBottom, DJ_ASSETS.stageBase.key)
    .setOrigin(0.5, 1)
    .setDepth(rigDepth.stage);

  // This clean platform deliberately reserves standing room for the future DJ.
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

  if (!scene.anims.exists(DJ_SPEAKER_PULSE_ANIMATION)) {
    scene.anims.create({
      key: DJ_SPEAKER_PULSE_ANIMATION,
      frames: scene.anims.generateFrameNumbers(DJ_ASSETS.speakerPulseFrames.key, { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
  }

  // Transparent overlays animate only the speaker cones; the existing speaker art and colliders stay untouched.
  const speakerPulses = [
    scene.add.sprite(dj.speakers[0].x, dj.speakers[0].y, DJ_ASSETS.speakerPulseFrames.key)
      .setOrigin(0)
      .setDepth(rigDepth.speakers + 0.1)
      .play(DJ_SPEAKER_PULSE_ANIMATION),
    scene.add.sprite(dj.speakers[1].x, dj.speakers[1].y, DJ_ASSETS.speakerPulseFrames.key)
      .setOrigin(0)
      .setDepth(rigDepth.speakers + 0.1)
      .play(DJ_SPEAKER_PULSE_ANIMATION),
  ];

  if (!scene.anims.exists(DJ_RESIDENT_IDLE_ANIMATION)) {
    scene.anims.create({
      key: DJ_RESIDENT_IDLE_ANIMATION,
      frames: scene.anims.generateFrameNumbers(DJ_CHARACTER_ASSETS.resident.key, { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
    scene.anims.create({
      key: DJ_RESIDENT_MIX_ANIMATION,
      frames: scene.anims.generateFrameNumbers(DJ_CHARACTER_ASSETS.resident.key, { start: 4, end: 7 }),
      frameRate: 5,
      repeat: 0,
    });
  }

  // Static resident performer: behind the shelf/console, but in front of the back platform.
  const residentDj = scene.add.sprite(centerX, dj.y + 56, DJ_CHARACTER_ASSETS.resident.key)
    .setOrigin(0.5, 1)
    .setScale(1.24)
    .setDepth(rigDepth.residentDj)
    .play(DJ_RESIDENT_IDLE_ANIMATION);

  const mixIntervals = [3600, 4600, 3200];
  let nextMixInterval = 0;
  const scheduleMix = () => {
    scene.time.delayedCall(mixIntervals[nextMixInterval], () => {
      nextMixInterval = (nextMixInterval + 1) % mixIntervals.length;
      residentDj.play(DJ_RESIDENT_MIX_ANIMATION);
      residentDj.once(`animationcomplete-${DJ_RESIDENT_MIX_ANIMATION}`, () => {
        residentDj.play(DJ_RESIDENT_IDLE_ANIMATION);
        scheduleMix();
      });
    });
  };
  scheduleMix();

  // The empty shelf sits in front of the DJ position and below the structural rig.
  const consoleShelf = scene.add.image(centerX, dj.y + 39, DJ_ASSETS.consoleShelf.key)
    .setOrigin(0.5, 0)
    .setDepth(rigDepth.shelf);

  // The console faces the DJ, rests on the shelf and stays below the lighting structure.
  const console = scene.add.image(centerX, dj.y + 51, DJ_ASSETS.consoleFacingDj.key)
    .setOrigin(0.5, 1)
    .setDepth(rigDepth.console);

  // A few asymmetric surface details keep the booth lived-in without crowding the DJ position.
  const surfaceProps = [
    scene.add.image(centerX - 59, dj.y + 51, DJ_ASSETS.headphones.key).setOrigin(0.5, 1).setDepth(rigDepth.surfaceProps),
    scene.add.image(centerX + 35, dj.y + 50, DJ_ASSETS.cupAmber.key).setOrigin(0.5, 1).setDepth(rigDepth.surfaceProps),
    scene.add.image(centerX + 57, dj.y + 51, DJ_ASSETS.bottleTall.key).setOrigin(0.5, 1).setDepth(rigDepth.surfaceProps),
  ];

  return {
    stage,
    backPlatform,
    truss,
    supports,
    booth,
    speakers: [leftSpeaker, rightSpeaker],
    speakerPulses,
    residentDj,
    consoleShelf,
    console,
    surfaceProps,
  };
}
