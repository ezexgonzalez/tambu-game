export const SOFI_SPRITE = {
  key: 'sofi',
  path: '/assets/characters/women/women_sofi_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
};

export const SOFI_IDLE_SPRITE = {
  key: 'sofi-idle',
  path: '/assets/characters/women/women_sofi_idle_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
};

export const SOFI_SPECIAL_SPRITES = Object.freeze({
  phone: {
    key: 'sofi-phone',
    path: '/assets/characters/women/women_sofi_idle_phone_down_atlas_v1.png',
    frameWidth: 32,
    frameHeight: 48,
  },
  drink: {
    key: 'sofi-drink',
    path: '/assets/characters/women/women_sofi_idle_drink_down_atlas_v1.png',
    frameWidth: 32,
    frameHeight: 48,
  },
});

export const SOFI_ANIMS = {
  down: { idle: [0, 1, 2, 3], walk: [1, 0, 2, 0] },
  left: { idle: [4, 5, 6, 7], walk: [4, 3, 5, 3] },
  right: { idle: [8, 9, 10, 11], walk: [7, 6, 8, 6] },
  up: { idle: [12, 13, 14, 15], walk: [10, 9, 11, 9] },
};

export const SOFI_STATES = Object.freeze({
  IDLE: 'idle',
  SPECIAL_IDLE: 'special-idle',
  WALK: 'walk',
});

export const SOFI_IDLE_FRAME_RATE = 1;
export const SOFI_BLINK_FRAME_RATE = 4;
export const SOFI_SPECIAL_FRAME_RATE = 5;
export const SOFI_WALK_FRAME_RATE = 8;
export const SOFI_IDLE_DELAY_RANGE_MS = Object.freeze({ min: 5000, max: 10000 });
export const SOFI_IDLE_VARIATION_WEIGHTS = Object.freeze({
  blink: 70,
  phone: 15,
  drink: 15,
});

function cancelSofiIdleTimer(sprite) {
  sprite.sofiIdleTimer?.remove?.();
  sprite.sofiIdleTimer = null;
}

function clearSofiSpecialCompletion(sprite) {
  const completion = sprite.sofiSpecialCompletion;
  if (!completion) return;

  sprite.off?.(completion.event, completion.handler);
  sprite.removeListener?.(completion.event, completion.handler);
  sprite.sofiSpecialCompletion = null;
}

export function getSofiIdleDelay(random = Math.random) {
  const { min, max } = SOFI_IDLE_DELAY_RANGE_MS;
  return Math.round(min + Math.max(0, Math.min(1, random())) * (max - min));
}

export function chooseSofiIdleVariation(sprite, random = sprite.sofiVariationRandom ?? Math.random) {
  if (sprite.sofiFacing !== 'down') return 'blink';

  const { blink, phone, drink } = SOFI_IDLE_VARIATION_WEIGHTS;
  const roll = Math.max(0, Math.min(1, random())) * (blink + phone + drink);
  if (roll < blink) return 'blink';
  if (roll < blink + phone) return 'phone';
  return 'drink';
}

function scheduleSofiIdleVariation(sprite) {
  if (
    sprite.sofiState !== SOFI_STATES.IDLE
    || !sprite.sofiScene?.time?.delayedCall
  ) return;

  cancelSofiIdleTimer(sprite);
  const random = sprite.sofiIdleRandom ?? Math.random;
  sprite.sofiIdleTimer = sprite.sofiScene.time.delayedCall(
    getSofiIdleDelay(random),
    () => {
      sprite.sofiIdleTimer = null;
      playSofiVariation(sprite, chooseSofiIdleVariation(sprite));
    },
  );
}

function playSofiVariation(sprite, variation) {
  if (sprite.sofiState !== SOFI_STATES.IDLE) return;

  const direction = sprite.sofiFacing ?? 'down';
  const animationKey = variation === 'blink'
    ? `${SOFI_SPRITE.key}-special-idle-${direction}`
    : `${SOFI_SPRITE.key}-special-${variation}-${direction}`;
  const completeEvent = `animationcomplete-${animationKey}`;

  cancelSofiIdleTimer(sprite);
  clearSofiSpecialCompletion(sprite);
  sprite.sofiState = SOFI_STATES.SPECIAL_IDLE;
  const handler = () => {
    sprite.sofiSpecialCompletion = null;
    if (sprite.sofiState === SOFI_STATES.SPECIAL_IDLE) playSofiIdle(sprite, direction);
  };
  if (sprite.once) {
    sprite.once(completeEvent, handler);
    sprite.sofiSpecialCompletion = { event: completeEvent, handler };
  }
  sprite.play(animationKey, true);
}

export function preloadSofi(scene) {
  scene.load.spritesheet(SOFI_SPRITE.key, SOFI_SPRITE.path, {
    frameWidth: SOFI_SPRITE.frameWidth,
    frameHeight: SOFI_SPRITE.frameHeight,
  });
  scene.load.spritesheet(SOFI_IDLE_SPRITE.key, SOFI_IDLE_SPRITE.path, {
    frameWidth: SOFI_IDLE_SPRITE.frameWidth,
    frameHeight: SOFI_IDLE_SPRITE.frameHeight,
  });
  Object.values(SOFI_SPECIAL_SPRITES).forEach((sprite) => {
    scene.load.spritesheet(sprite.key, sprite.path, {
      frameWidth: sprite.frameWidth,
      frameHeight: sprite.frameHeight,
    });
  });
}

export function createSofiAnimations(scene) {
  Object.entries(SOFI_ANIMS).forEach(([direction, config]) => {
    const idleKey = `${SOFI_SPRITE.key}-idle-${direction}`;
    const walkKey = `${SOFI_SPRITE.key}-walk-${direction}`;

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [{ key: SOFI_IDLE_SPRITE.key, frame: config.idle[0] }],
        frameRate: SOFI_IDLE_FRAME_RATE,
        repeat: -1,
      });
    }

    const specialIdleKey = `${SOFI_SPRITE.key}-special-idle-${direction}`;
    if (!scene.anims.exists(specialIdleKey)) {
      scene.anims.create({
        key: specialIdleKey,
        frames: config.idle.map((frame) => ({ key: SOFI_IDLE_SPRITE.key, frame })),
        frameRate: SOFI_BLINK_FRAME_RATE,
        repeat: 0,
      });
    }

    if (direction === 'down') {
      Object.entries(SOFI_SPECIAL_SPRITES).forEach(([variation, sprite]) => {
        const specialKey = `${SOFI_SPRITE.key}-special-${variation}-${direction}`;
        if (scene.anims.exists(specialKey)) return;

        scene.anims.create({
          key: specialKey,
          frames: Array.from({ length: 8 }, (_, frame) => ({ key: sprite.key, frame })),
          frameRate: SOFI_SPECIAL_FRAME_RATE,
          repeat: 0,
        });
      });
    }

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: config.walk.map((frame) => ({ key: SOFI_SPRITE.key, frame })),
        frameRate: SOFI_WALK_FRAME_RATE,
        repeat: -1,
      });
    }
  });
}

export function createSofiSprite(scene, character) {
  createSofiAnimations(scene);

  const sprite = scene.add.sprite(character.x, character.y, SOFI_IDLE_SPRITE.key, 0)
    .setOrigin(0.5, 0.5)
    .setScale(SOFI_SPRITE.scale)
    .setDepth(character.y + SOFI_SPRITE.footDepthOffset);

  sprite.sofiScene = scene;
  sprite.sofiFacing = 'down';
  sprite.sofiState = SOFI_STATES.IDLE;
  playSofiIdle(sprite, 'down');
  return sprite;
}

export function setSofiDepth(sprite) {
  sprite.setDepth(sprite.y + SOFI_SPRITE.footDepthOffset);
}

export function playSofiWalk(sprite, destination) {
  const dx = destination.x - sprite.x;
  const dy = destination.y - sprite.y;
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx >= 0 ? 'right' : 'left')
    : (dy >= 0 ? 'down' : 'up');
  const key = `${SOFI_SPRITE.key}-walk-${direction}`;

  cancelSofiIdleTimer(sprite);
  clearSofiSpecialCompletion(sprite);
  sprite.sofiState = SOFI_STATES.WALK;
  sprite.sofiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playSofiIdle(sprite, direction = sprite.sofiFacing ?? 'down') {
  const key = `${SOFI_SPRITE.key}-idle-${direction}`;

  cancelSofiIdleTimer(sprite);
  clearSofiSpecialCompletion(sprite);
  sprite.sofiState = SOFI_STATES.IDLE;
  sprite.sofiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
  scheduleSofiIdleVariation(sprite);
}
