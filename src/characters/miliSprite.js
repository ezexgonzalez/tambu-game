export const MILI_SPRITE = {
  key: 'mili',
  path: '/assets/characters/women/women_mili_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
};

export const MILI_IDLE_SPRITE = {
  key: 'mili-idle',
  path: '/assets/characters/women/women_mili_idle_down_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
};

export const MILI_BLINK_SPRITE = {
  key: 'mili-blink',
  path: '/assets/characters/women/women_mili_blink_down_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
};

export const MILI_ANIMS = {
  down: { idle: 1, walk: [1, 0, 2, 1] },
  left: { idle: 4, walk: [4, 3, 5, 4] },
  right: { idle: 7, walk: [7, 6, 8, 7] },
  up: { idle: 10, walk: [10, 9, 11, 10] },
};

export const MILI_STATES = Object.freeze({
  IDLE: 'idle',
  BLINK: 'blink',
  WALK: 'walk',
});

export const MILI_IDLE_FRAME_RATE = 6;
export const MILI_BLINK_FRAME_RATE = 6;
export const MILI_WALK_FRAME_RATE = 8;
export const MILI_IDLE_BLINK_DELAY_RANGE_MS = Object.freeze({ min: 5000, max: 10000 });

function cancelMiliIdleTimer(sprite) {
  sprite.miliIdleTimer?.remove?.();
  sprite.miliIdleTimer = null;
}

function clearMiliBlinkCompletion(sprite) {
  const completion = sprite.miliBlinkCompletion;
  if (!completion) return;

  sprite.off?.(completion.event, completion.handler);
  sprite.removeListener?.(completion.event, completion.handler);
  sprite.miliBlinkCompletion = null;
}

export function getMiliBlinkDelay(random = Math.random) {
  const { min, max } = MILI_IDLE_BLINK_DELAY_RANGE_MS;
  return Math.round(min + Math.max(0, Math.min(1, random())) * (max - min));
}

function scheduleMiliBlink(sprite) {
  if (
    sprite.miliState !== MILI_STATES.IDLE
    || sprite.miliFacing !== 'down'
    || !sprite.miliScene?.time?.delayedCall
  ) return;

  cancelMiliIdleTimer(sprite);
  const random = sprite.miliIdleRandom ?? Math.random;
  sprite.miliIdleTimer = sprite.miliScene.time.delayedCall(
    getMiliBlinkDelay(random),
    () => {
      sprite.miliIdleTimer = null;
      playMiliBlink(sprite);
    },
  );
}

export function preloadMili(scene) {
  scene.load.spritesheet(MILI_SPRITE.key, MILI_SPRITE.path, {
    frameWidth: MILI_SPRITE.frameWidth,
    frameHeight: MILI_SPRITE.frameHeight,
  });
  scene.load.spritesheet(MILI_IDLE_SPRITE.key, MILI_IDLE_SPRITE.path, {
    frameWidth: MILI_IDLE_SPRITE.frameWidth,
    frameHeight: MILI_IDLE_SPRITE.frameHeight,
  });
  scene.load.spritesheet(MILI_BLINK_SPRITE.key, MILI_BLINK_SPRITE.path, {
    frameWidth: MILI_BLINK_SPRITE.frameWidth,
    frameHeight: MILI_BLINK_SPRITE.frameHeight,
  });
}

export function createMiliAnimations(scene) {
  Object.entries(MILI_ANIMS).forEach(([direction, config]) => {
    const idleKey = `${MILI_SPRITE.key}-idle-${direction}`;
    const walkKey = `${MILI_SPRITE.key}-walk-${direction}`;

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: direction === 'down'
          ? Array.from({ length: 8 }, (_, frame) => ({ key: MILI_IDLE_SPRITE.key, frame }))
          : [{ key: MILI_SPRITE.key, frame: config.idle }],
        frameRate: direction === 'down' ? MILI_IDLE_FRAME_RATE : 1,
        repeat: -1,
      });
    }

    if (direction === 'down') {
      const blinkKey = `${MILI_SPRITE.key}-blink-down`;
      if (!scene.anims.exists(blinkKey)) {
        scene.anims.create({
          key: blinkKey,
          frames: Array.from({ length: 5 }, (_, frame) => ({ key: MILI_BLINK_SPRITE.key, frame })),
          frameRate: MILI_BLINK_FRAME_RATE,
          repeat: 0,
        });
      }
    }

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: config.walk.map((frame) => ({ key: MILI_SPRITE.key, frame })),
        frameRate: MILI_WALK_FRAME_RATE,
        repeat: -1,
      });
    }
  });
}

export function createMiliSprite(scene, character) {
  createMiliAnimations(scene);

  const sprite = scene.add.sprite(character.x, character.y, MILI_IDLE_SPRITE.key, 0)
    .setOrigin(0.5, 0.5)
    .setScale(MILI_SPRITE.scale)
    .setDepth(character.y + MILI_SPRITE.footDepthOffset);

  sprite.miliScene = scene;
  sprite.miliFacing = 'down';
  sprite.miliState = MILI_STATES.IDLE;
  playMiliIdle(sprite, 'down');
  return sprite;
}

export function setMiliDepth(sprite) {
  sprite.setDepth(sprite.y + MILI_SPRITE.footDepthOffset);
}

export function playMiliWalk(sprite, destination) {
  const dx = destination.x - sprite.x;
  const dy = destination.y - sprite.y;
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx >= 0 ? 'right' : 'left')
    : (dy >= 0 ? 'down' : 'up');
  const key = `${MILI_SPRITE.key}-walk-${direction}`;

  cancelMiliIdleTimer(sprite);
  clearMiliBlinkCompletion(sprite);
  sprite.miliState = MILI_STATES.WALK;
  sprite.miliFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playMiliBlink(sprite) {
  if (sprite.miliState !== MILI_STATES.IDLE || sprite.miliFacing !== 'down') return;

  const key = `${MILI_SPRITE.key}-blink-down`;
  cancelMiliIdleTimer(sprite);
  clearMiliBlinkCompletion(sprite);
  sprite.miliState = MILI_STATES.BLINK;

  const handler = () => {
    sprite.miliBlinkCompletion = null;
    if (sprite.miliState === MILI_STATES.BLINK && sprite.miliFacing === 'down') {
      playMiliIdle(sprite, 'down');
    }
  };
  if (sprite.once) {
    const event = `animationcomplete-${key}`;
    sprite.once(event, handler);
    sprite.miliBlinkCompletion = { event, handler };
  }
  sprite.play(key, true);
}

export function playMiliIdle(sprite, direction = sprite.miliFacing ?? 'down') {
  const key = `${MILI_SPRITE.key}-idle-${direction}`;

  cancelMiliIdleTimer(sprite);
  clearMiliBlinkCompletion(sprite);
  sprite.miliState = MILI_STATES.IDLE;
  sprite.miliFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
  scheduleMiliBlink(sprite);
}
