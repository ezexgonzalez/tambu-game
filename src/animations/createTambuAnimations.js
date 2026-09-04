import { TAMBU_ANIMS, TAMBU_SPRITE } from '../data/tambuSprite.js';

export function createTambuAnimations(scene) {
  Object.entries(TAMBU_ANIMS).forEach(([direction, config]) => {
    const idleKey = `${TAMBU_SPRITE.key}-idle-${direction}`;
    const walkKey = `${TAMBU_SPRITE.key}-walk-${direction}`;

    if (!scene.anims.exists(idleKey)) {
      scene.anims.create({
        key: idleKey,
        frames: [{ key: TAMBU_SPRITE.key, frame: config.idle }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(walkKey)) {
      scene.anims.create({
        key: walkKey,
        frames: config.walk.map((frame) => ({ key: TAMBU_SPRITE.key, frame })),
        frameRate: 8,
        repeat: -1,
      });
    }
  });
}
