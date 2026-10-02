const FRIENDS = {
  tobi: {
    name: 'Tobi',
    asset: 'friend_tobi',
    idleDown: 'friend_tobi_idle_down',
    specials: [
      {
        id: 'drink',
        asset: 'friend_tobi_drink',
        path: '/assets/characters/friends/friend_tobi_drink_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.5,
      },
      {
        id: 'arms-crossed',
        asset: 'friend_tobi_arms_crossed',
        path: '/assets/characters/friends/friend_tobi_arms_crossed_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.5,
      },
    ],
  },
  pitity: {
    name: 'Pitity',
    asset: 'friend_pitity',
    idleDown: 'friend_pitity_idle_down',
    specials: [
      {
        id: 'blink',
        asset: 'friend_pitity_blink',
        path: '/assets/characters/friends/friend_pitity_blink_down_atlas_v1.png',
        frames: 5,
        frameRate: 10,
        weight: 0.75,
      },
      {
        id: 'phone-check',
        asset: 'friend_pitity_phone_check',
        path: '/assets/characters/friends/friend_pitity_phone_check_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.25,
      },
    ],
  },
  eze: {
    name: 'Eze',
    asset: 'friend_eze',
    idleDown: 'friend_eze_idle_down',
    specials: [
      {
        id: 'blink',
        asset: 'friend_eze_blink',
        path: '/assets/characters/friends/friend_eze_blink_down_atlas_v1.png',
        frames: 5,
        frameRate: 10,
        weight: 0.70,
      },
      {
        id: 'drink',
        asset: 'friend_eze_drink',
        path: '/assets/characters/friends/friend_eze_drink_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.20,
      },
      {
        id: 'drunk',
        asset: 'friend_eze_drunk',
        path: '/assets/characters/friends/friend_eze_drunk_down_atlas_v1.png',
        frames: 8,
        frameRate: 5,
        weight: 0.10,
      },
    ],
  },
  santy: {
    name: 'Santy',
    asset: 'friend_santy',
    idleDown: 'friend_santy_idle_down',
    specials: [
      {
        id: 'blink',
        asset: 'friend_santy_blink',
        path: '/assets/characters/friends/friend_santy_blink_down_atlas_v1.png',
        frames: 5,
        frameRate: 10,
        weight: 0.70,
      },
      {
        id: 'phone-check',
        asset: 'friend_santy_phone_check',
        path: '/assets/characters/friends/friend_santy_phone_check_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.15,
      },
      {
        id: 'drink',
        asset: 'friend_santy_drink',
        path: '/assets/characters/friends/friend_santy_drink_down_atlas_v1.png',
        frames: 8,
        frameRate: 6,
        weight: 0.15,
      },
    ],
  },
  uriel: {
    name: 'Uriel',
    asset: 'friend_uriel',
    idleDown: 'friend_uriel_idle_down',
  },
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

export const FRIEND_STATES = Object.freeze({
  IDLE: 'idle',
  SPECIAL_IDLE: 'special-idle',
  WALK: 'walk',
});

export const FRIEND_IDLE_DELAY_RANGE_MS = Object.freeze({ min: 5000, max: 10000 });

export function getFriendIdleDelay(random = Math.random) {
  const { min, max } = FRIEND_IDLE_DELAY_RANGE_MS;
  return Math.round(min + Math.max(0, Math.min(1, random())) * (max - min));
}

export function chooseTobiIdleVariation(random = Math.random) {
  return chooseFriendIdleVariation('tobi', random);
}

export function chooseFriendIdleVariation(friendId, random = Math.random) {
  const specials = FRIENDS[friendId]?.specials;
  if (!specials?.length) return null;

  const roll = Math.max(0, Math.min(1, random()));
  let cumulativeWeight = 0;
  for (const special of specials) {
    cumulativeWeight += special.weight ?? 1 / specials.length;
    if (roll < cumulativeWeight) return special.id;
  }
  return specials[specials.length - 1].id;
}

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
    friend.specials?.forEach((special) => {
      scene.load.spritesheet(special.asset, special.path, {
        frameWidth: FRIEND_SPRITE_CONFIG.frameWidth,
        frameHeight: FRIEND_SPRITE_CONFIG.frameHeight,
      });
    });
  }
}

export function createFriendAnimations(scene) {
  for (const [id, friend] of Object.entries(FRIENDS)) {
    for (const direction of DIRECTIONS) {
      const idleKey = `${id}-idle-${direction}`;
      const walkKey = `${id}-walk-${direction}`;
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

    friend.specials?.forEach((special) => {
      const key = `${id}-${special.id}-down`;
      createAnimation(scene, {
        key,
        frames: Array.from({ length: special.frames }, (_, frame) => ({ key: special.asset, frame })),
        frameRate: special.frameRate,
        repeat: 0,
      });
    });
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

  sprite.friendId = friendData.id;
  if (!config.specials) {
    sprite.play(`${friendData.id}-idle-down`);
    return sprite;
  }

  sprite.friendState = FRIEND_STATES.IDLE;
  sprite.friendFacing = 'down';
  sprite.friendScene = scene;
  playFriendIdle(sprite, 'down');
  scene.events?.once?.('shutdown', () => destroyFriendSprite(sprite));
  return sprite;
}

export function playFriendIdle(sprite, direction = sprite.friendFacing ?? 'down') {
  cancelFriendIdleTimer(sprite);
  clearFriendSpecialCompletion(sprite);
  sprite.friendState = FRIEND_STATES.IDLE;
  sprite.friendFacing = direction;
  const key = `${sprite.friendId}-idle-${direction}`;
  if (sprite.anims?.currentAnim?.key !== key) sprite.play(key, true);
  scheduleFriendIdleVariation(sprite);
}

export function playFriendWalk(sprite, destination) {
  const dx = destination.x - sprite.x;
  const dy = destination.y - sprite.y;
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx >= 0 ? 'right' : 'left')
    : (dy >= 0 ? 'down' : 'up');
  cancelFriendIdleTimer(sprite);
  clearFriendSpecialCompletion(sprite);
  sprite.friendState = FRIEND_STATES.WALK;
  sprite.friendFacing = direction;
  sprite.play(`${sprite.friendId}-walk-${direction}`, true);
}

export function playFriendIdleSpecial(sprite, variation) {
  const friend = FRIENDS[sprite.friendId];
  if (!friend?.specials || sprite.friendState !== FRIEND_STATES.IDLE || sprite.friendFacing !== 'down') return false;
  const special = friend.specials.find(({ id }) => id === variation);
  if (!special) return false;
  const key = `${sprite.friendId}-${special.id}-down`;

  cancelFriendIdleTimer(sprite);
  clearFriendSpecialCompletion(sprite);
  sprite.friendState = FRIEND_STATES.SPECIAL_IDLE;
  const event = `animationcomplete-${key}`;
  const handler = () => {
    if (sprite.friendSpecialCompletion?.handler !== handler) return;
    sprite.friendSpecialCompletion = null;
    if (sprite.friendState === FRIEND_STATES.SPECIAL_IDLE && sprite.friendFacing === 'down') {
      playFriendIdle(sprite, 'down');
    }
  };
  sprite.once?.(event, handler);
  sprite.friendSpecialCompletion = { event, handler };
  sprite.play(key, true);
  return true;
}

export function playTobiIdleSpecial(sprite, variation) {
  return sprite.friendId === 'tobi' && playFriendIdleSpecial(sprite, variation);
}

export function setFriendDepth(sprite) {
  sprite.setDepth(sprite.y + FRIEND_SPRITE_CONFIG.footDepthOffset);
}

export function destroyFriendSprite(sprite) {
  cancelFriendIdleTimer(sprite);
  clearFriendSpecialCompletion(sprite);
  sprite.friendScene = null;
}

function scheduleFriendIdleVariation(sprite) {
  if (!FRIENDS[sprite.friendId]?.specials || sprite.friendState !== FRIEND_STATES.IDLE
    || sprite.friendFacing !== 'down' || !sprite.friendScene?.time?.delayedCall) return;
  cancelFriendIdleTimer(sprite);
  const random = sprite.friendIdleRandom ?? Math.random;
  sprite.friendIdleTimer = sprite.friendScene.time.delayedCall(getFriendIdleDelay(random), () => {
    sprite.friendIdleTimer = null;
    if (sprite.friendState !== FRIEND_STATES.IDLE || sprite.friendFacing !== 'down') return;
    playFriendIdleSpecial(sprite, chooseFriendIdleVariation(sprite.friendId, random));
  });
}

function cancelFriendIdleTimer(sprite) {
  sprite.friendIdleTimer?.remove?.();
  sprite.friendIdleTimer = null;
}

function clearFriendSpecialCompletion(sprite) {
  const completion = sprite.friendSpecialCompletion;
  if (!completion) return;
  sprite.off?.(completion.event, completion.handler);
  sprite.removeListener?.(completion.event, completion.handler);
  sprite.friendSpecialCompletion = null;
}

function createAnimation(scene, config) {
  if (!scene.anims.exists(config.key)) scene.anims.create(config);
}
