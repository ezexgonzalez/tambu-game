export const CAMI_SPRITE = {
  key: 'cami',
  path: '/assets/characters/women/women_cami_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
};

export const CAMI_SPECIALS = Object.freeze({
  blink: { key: 'cami-blink', path: '/assets/characters/women/women_cami_blink_down_atlas_v1.png', frames: 5, frameRate: 6, weight: 70 },
  hairTouch: { key: 'cami-hair-touch', path: '/assets/characters/women/women_cami_hair_touch_down_atlas_v1.png', frames: 8, frameRate: 6, weight: 15 },
  handOnHip: { key: 'cami-hand-on-hip', path: '/assets/characters/women/women_cami_hand_on_hip_down_atlas_v1.png', frames: 8, frameRate: 6, weight: 15 },
});

export const CAMI_ANIMS = {
  down: { idle: 1, walk: [1, 0, 2, 1] },
  left: { idle: 4, walk: [4, 3, 5, 4] },
  right: { idle: 7, walk: [7, 6, 8, 7] },
  up: { idle: 10, walk: [10, 9, 11, 10] },
};

export const CAMI_STATES = Object.freeze({
  IDLE: 'idle',
  SPECIAL_IDLE: 'special-idle',
  WALK: 'walk',
});

export const CAMI_WALK_FRAME_RATE = 8;
export const CAMI_IDLE_DELAY_RANGE_MS = Object.freeze({ min: 5000, max: 10000 });

function cancelCamiIdleTimer(sprite) {
  sprite.camiIdleTimer?.remove?.();
  sprite.camiIdleTimer = null;
}

function clearCamiSpecialCompletion(sprite) {
  const completion = sprite.camiSpecialCompletion;
  if (!completion) return;
  sprite.off?.(completion.event, completion.handler);
  sprite.camiSpecialCompletion = null;
}

export function getCamiIdleDelay(random = Math.random) {
  const { min, max } = CAMI_IDLE_DELAY_RANGE_MS;
  return Math.round(min + Math.max(0, Math.min(1, random())) * (max - min));
}

export function chooseCamiIdleVariation(random = Math.random) {
  const roll = Math.max(0, Math.min(1, random()))
    * Object.values(CAMI_SPECIALS).reduce((total, special) => total + special.weight, 0);
  let threshold = 0;
  for (const [variation, special] of Object.entries(CAMI_SPECIALS)) {
    threshold += special.weight;
    if (roll < threshold) return variation;
  }
  return 'handOnHip';
}

function scheduleCamiVariation(sprite) {
  if (sprite.camiState !== CAMI_STATES.IDLE || sprite.camiFacing !== 'down'
    || !sprite.camiScene?.time?.delayedCall) return;

  cancelCamiIdleTimer(sprite);
  const random = sprite.camiIdleRandom ?? Math.random;
  sprite.camiIdleTimer = sprite.camiScene.time.delayedCall(getCamiIdleDelay(random), () => {
    sprite.camiIdleTimer = null;
    playCamiSpecial(sprite, chooseCamiIdleVariation(random));
  });
}

function playCamiSpecial(sprite, variation) {
  if (sprite.camiState !== CAMI_STATES.IDLE || sprite.camiFacing !== 'down') return;

  const key = `${CAMI_SPECIALS[variation].key}-down`;
  cancelCamiIdleTimer(sprite);
  clearCamiSpecialCompletion(sprite);
  sprite.camiState = CAMI_STATES.SPECIAL_IDLE;
  const event = `animationcomplete-${key}`;
  const handler = () => {
    if (sprite.camiSpecialCompletion?.handler !== handler) return;
    sprite.camiSpecialCompletion = null;
    if (sprite.camiState === CAMI_STATES.SPECIAL_IDLE && sprite.camiFacing === 'down') {
      playCamiIdle(sprite, 'down');
    }
  };
  if (sprite.once) {
    sprite.once(event, handler);
    sprite.camiSpecialCompletion = { event, handler };
  }
  sprite.play(key, true);
}

export function preloadCami(scene) {
  scene.load.spritesheet(CAMI_SPRITE.key, CAMI_SPRITE.path, {
    frameWidth: CAMI_SPRITE.frameWidth,
    frameHeight: CAMI_SPRITE.frameHeight,
  });
  Object.values(CAMI_SPECIALS).forEach((special) => {
    scene.load.spritesheet(special.key, special.path, { frameWidth: 32, frameHeight: 48 });
  });
}

export function createCamiAnimations(scene) {
  Object.entries(CAMI_ANIMS).forEach(([direction, config]) => {
    const idleKey = `${CAMI_SPRITE.key}-idle-${direction}`;
    const walkKey = `${CAMI_SPRITE.key}-walk-${direction}`;

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [{ key: CAMI_SPRITE.key, frame: config.idle }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: config.walk.map((frame) => ({ key: CAMI_SPRITE.key, frame })),
        frameRate: CAMI_WALK_FRAME_RATE,
        repeat: -1,
      });
    }
  });
  Object.values(CAMI_SPECIALS).forEach((special) => {
    const key = `${special.key}-down`;
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: Array.from({ length: special.frames }, (_, frame) => ({ key: special.key, frame })),
      frameRate: special.frameRate,
      repeat: 0,
    });
  });
}

export function createCamiSprite(scene, character) {
  createCamiAnimations(scene);

  const sprite = scene.add.sprite(character.x, character.y, CAMI_SPRITE.key, CAMI_ANIMS.down.idle)
    .setOrigin(0.5, 0.5)
    .setScale(CAMI_SPRITE.scale)
    .setDepth(character.y + CAMI_SPRITE.footDepthOffset);

  sprite.camiFacing = 'down';
  sprite.camiState = CAMI_STATES.IDLE;
  sprite.camiScene = scene;
  playCamiIdle(sprite, 'down');
  return sprite;
}

export function setCamiDepth(sprite) {
  sprite.setDepth(sprite.y + CAMI_SPRITE.footDepthOffset);
}

export function playCamiWalk(sprite, destination) {
  const dx = destination.x - sprite.x;
  const dy = destination.y - sprite.y;
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx >= 0 ? 'right' : 'left')
    : (dy >= 0 ? 'down' : 'up');
  const key = `${CAMI_SPRITE.key}-walk-${direction}`;

  cancelCamiIdleTimer(sprite);
  clearCamiSpecialCompletion(sprite);
  sprite.camiState = CAMI_STATES.WALK;
  sprite.camiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playCamiIdle(sprite, direction = sprite.camiFacing ?? 'down') {
  const key = `${CAMI_SPRITE.key}-idle-${direction}`;

  cancelCamiIdleTimer(sprite);
  clearCamiSpecialCompletion(sprite);
  sprite.camiState = CAMI_STATES.IDLE;
  sprite.camiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
  scheduleCamiVariation(sprite);
}
