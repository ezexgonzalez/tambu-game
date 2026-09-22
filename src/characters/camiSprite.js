export const CAMI_SPRITE = {
  key: 'cami',
  path: '/assets/characters/women/women_cami_atlas_v1.png',
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
};

export const CAMI_ANIMS = {
  down: { idle: 1, walk: [1, 0, 2, 1] },
  left: { idle: 4, walk: [4, 3, 5, 4] },
  right: { idle: 7, walk: [7, 6, 8, 7] },
  up: { idle: 10, walk: [10, 9, 11, 10] },
};

export const CAMI_STATES = Object.freeze({
  IDLE: 'idle',
  WALK: 'walk',
});

export const CAMI_WALK_FRAME_RATE = 8;

export function preloadCami(scene) {
  scene.load.spritesheet(CAMI_SPRITE.key, CAMI_SPRITE.path, {
    frameWidth: CAMI_SPRITE.frameWidth,
    frameHeight: CAMI_SPRITE.frameHeight,
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
}

export function createCamiSprite(scene, character) {
  createCamiAnimations(scene);

  const sprite = scene.add.sprite(character.x, character.y, CAMI_SPRITE.key, CAMI_ANIMS.down.idle)
    .setOrigin(0.5, 0.5)
    .setScale(CAMI_SPRITE.scale)
    .setDepth(character.y + CAMI_SPRITE.footDepthOffset);

  sprite.camiFacing = 'down';
  sprite.camiState = CAMI_STATES.IDLE;
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

  sprite.camiState = CAMI_STATES.WALK;
  sprite.camiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}

export function playCamiIdle(sprite, direction = sprite.camiFacing ?? 'down') {
  const key = `${CAMI_SPRITE.key}-idle-${direction}`;

  sprite.camiState = CAMI_STATES.IDLE;
  sprite.camiFacing = direction;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
}
