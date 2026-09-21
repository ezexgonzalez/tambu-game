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
export const SOFI_WALK_FRAME_RATE = 8;
export const SOFI_IDLE_DELAY_RANGE_MS = Object.freeze({ min: 5000, max: 10000 });

function cancelSofiIdleTimer(sprite) {
  sprite.sofiIdleTimer?.remove?.();
  sprite.sofiIdleTimer = null;
}

export function getSofiIdleDelay(random = Math.random) {
  const { min, max } = SOFI_IDLE_DELAY_RANGE_MS;
  return Math.round(min + Math.max(0, Math.min(1, random())) * (max - min));
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
      playSofiBlink(sprite);
    },
  );
}

function playSofiBlink(sprite) {
  if (sprite.sofiState !== SOFI_STATES.IDLE) return;

  const direction = sprite.sofiFacing ?? 'down';
  const blinkKey = `${SOFI_SPRITE.key}-special-idle-${direction}`;
  const completeEvent = `animationcomplete-${blinkKey}`;

  cancelSofiIdleTimer(sprite);
  sprite.sofiState = SOFI_STATES.SPECIAL_IDLE;
  sprite.once?.(completeEvent, () => {
    if (sprite.sofiState === SOFI_STATES.SPECIAL_IDLE) playSofiIdle(sprite, direction);
  });
  sprite.play(blinkKey, true);
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
  sprite.sofiState = SOFI_STATES.WALK;
  sprite.sofiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playSofiIdle(sprite, direction = sprite.sofiFacing ?? 'down') {
  const key = `${SOFI_SPRITE.key}-idle-${direction}`;

  cancelSofiIdleTimer(sprite);
  sprite.sofiState = SOFI_STATES.IDLE;
  sprite.sofiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
  scheduleSofiIdleVariation(sprite);
}
