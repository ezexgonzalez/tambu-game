const FRIENDS = {
  tobi: { name: 'Tobi', asset: 'friend_tobi', idleDown: 'friend_tobi_idle_down' },
  pitity: { name: 'Pitity', asset: 'friend_pitity', idleDown: 'friend_pitity_idle_down' },
  eze: { name: 'Eze', asset: 'friend_eze', idleDown: 'friend_eze_idle_down' },
  santy: { name: 'Santy', asset: 'friend_santy', idleDown: 'friend_santy_idle_down' },
};

const DIRECTIONS = ['down', 'left', 'right', 'up'];
const IDLE_FRAMES = { down: 1, left: 4, right: 7, up: 10 };
const WALK_FRAMES = {
  down: [1, 0, 2, 1],
  left: [4, 3, 5, 4],
  right: [7, 6, 8, 7],
  up: [10, 9, 11, 10],
};

export const FRIEND_SPRITE_CONFIG = Object.freeze({
  frameWidth: 32,
  frameHeight: 48,
  scale: 1.24,
  footDepthOffset: 30,
  walkFrameRate: 8,
});

export function preloadFriends(scene) {
  for (const friend of Object.values(FRIENDS)) {
    scene.load.spritesheet(friend.asset, `/assets/characters/friends/${friend.asset}_atlas_v1.png`, {
      frameWidth: FRIEND_SPRITE_CONFIG.frameWidth,
      frameHeight: FRIEND_SPRITE_CONFIG.frameHeight,
    });
    scene.load.spritesheet(friend.idleDown, `/assets/characters/friends/${friend.idleDown}_atlas_v1.png`, {
      frameWidth: FRIEND_SPRITE_CONFIG.frameWidth,
      frameHeight: FRIEND_SPRITE_CONFIG.frameHeight,
    });
  }
}

export function createFriendAnimations(scene) {
  for (const friend of Object.values(FRIENDS)) {
    for (const direction of DIRECTIONS) {
      const idleKey = `${friend.name.toLowerCase()}-idle-${direction}`;
      const walkKey = `${friend.name.toLowerCase()}-walk-${direction}`;
      createAnimation(scene, {
        key: idleKey,
        frames: [{ key: direction === 'down' ? friend.idleDown : friend.asset, frame: direction === 'down' ? 0 : IDLE_FRAMES[direction] }],
        frameRate: 1,
        repeat: -1,
      });
      createAnimation(scene, {
        key: walkKey,
        frames: WALK_FRAMES[direction].map((frame) => ({ key: friend.asset, frame })),
        frameRate: FRIEND_SPRITE_CONFIG.walkFrameRate,
        repeat: -1,
      });
    }
  }
}

export function createFriendSprite(scene, friendData) {
  const config = FRIENDS[friendData.id];
  if (!config) throw new Error(`Unknown patio friend: ${friendData.id}`);
  createFriendAnimations(scene);
  const sprite = scene.add.sprite(friendData.x, friendData.y, config.idleDown, 0)
    .setOrigin(0.5, 0.5)
    .setScale(FRIEND_SPRITE_CONFIG.scale)
    .setDepth(friendData.y + FRIEND_SPRITE_CONFIG.footDepthOffset);
  sprite.play(`${config.name.toLowerCase()}-idle-down`);
  return sprite;
}

function createAnimation(scene, config) {
  if (!scene.anims.exists(config.key)) scene.anims.create(config);
}
