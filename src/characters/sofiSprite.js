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

export const SOFI_IDLE_FRAME_RATE = 2;
export const SOFI_WALK_FRAME_RATE = 8;

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
        frames: config.idle.map((frame) => ({ key: SOFI_IDLE_SPRITE.key, frame })),
        frameRate: SOFI_IDLE_FRAME_RATE,
        repeat: -1,
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

  sprite.sofiFacing = 'down';
  sprite.play(`${SOFI_SPRITE.key}-idle-down`);
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

  sprite.sofiFacing = direction;
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}

export function playSofiIdle(sprite, direction = sprite.sofiFacing ?? 'down') {
  const key = `${SOFI_SPRITE.key}-idle-${direction}`;

  sprite.sofiFacing = direction;
  if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
}
