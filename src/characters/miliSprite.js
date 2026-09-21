export const MILI_SPRITE = {
  key: 'mili',
  path: '/assets/characters/women/women_mili_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
};

export const MILI_ANIMS = {
  down: { idle: 1, walk: [1, 0, 2, 1] },
  left: { idle: 4, walk: [4, 3, 5, 4] },
  right: { idle: 7, walk: [7, 6, 8, 7] },
  up: { idle: 10, walk: [10, 9, 11, 10] },
};

export const MILI_STATES = Object.freeze({
  IDLE: 'idle',
  WALK: 'walk',
});

export const MILI_IDLE_FRAME_RATE = 1;
export const MILI_WALK_FRAME_RATE = 8;

export function preloadMili(scene) {
  scene.load.spritesheet(MILI_SPRITE.key, MILI_SPRITE.path, {
    frameWidth: MILI_SPRITE.frameWidth,
    frameHeight: MILI_SPRITE.frameHeight,
  });
}

export function createMiliAnimations(scene) {
  Object.entries(MILI_ANIMS).forEach(([direction, config]) => {
    const idleKey = `${MILI_SPRITE.key}-idle-${direction}`;
    const walkKey = `${MILI_SPRITE.key}-walk-${direction}`;

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [{ key: MILI_SPRITE.key, frame: config.idle }],
        frameRate: MILI_IDLE_FRAME_RATE,
        repeat: -1,
      });
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

  const sprite = scene.add.sprite(character.x, character.y, MILI_SPRITE.key, MILI_ANIMS.down.idle)
    .setOrigin(0.5, 0.5)
    .setScale(MILI_SPRITE.scale)
    .setDepth(character.y + MILI_SPRITE.footDepthOffset);

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

  sprite.miliState = MILI_STATES.WALK;
  sprite.miliFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playMiliIdle(sprite, direction = sprite.miliFacing ?? 'down') {
  const key = `${MILI_SPRITE.key}-idle-${direction}`;

  sprite.miliState = MILI_STATES.IDLE;
  sprite.miliFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}
