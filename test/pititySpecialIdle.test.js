import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  chooseFriendIdleVariation,
  createFriendAnimations,
  createFriendSprite,
  destroyFriendSprite,
  FRIEND_IDLE_DELAY_RANGE_MS,
  FRIEND_STATES,
  playFriendIdle,
  playFriendIdleSpecial,
  playFriendWalk,
  preloadFriends,
} from '../src/characters/friendSprite.js';

const root = resolve('public/assets/characters/friends');
const sheets = [
  ['friend_pitity_blink', 'friend_pitity_blink_down_atlas_v1.png', 5, 10],
  ['friend_pitity_phone_check', 'friend_pitity_phone_check_down_atlas_v1.png', 8, 6],
];

function pngDimensions(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

function makeScene() {
  const timers = [];
  const listeners = new Map();
  const shutdown = [];
  const animations = [];
  const sprite = {
    x: 470, y: 835, anims: { currentAnim: null },
    setOrigin(...value) { this.origin = value; return this; },
    setScale(value) { this.scale = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
    once(event, callback) { listeners.set(event, callback); return this; },
    off(event, callback) { if (listeners.get(event) === callback) listeners.delete(event); return this; },
    removeListener(event, callback) { return this.off(event, callback); },
  };
  return {
    sprite, timers, listeners, shutdown, animations,
    load: { spritesheet() {} },
    anims: { exists: () => false, create: (config) => animations.push(config) },
    add: { sprite: () => sprite },
    time: { delayedCall(delay, callback) {
      const timer = { delay, callback, removed: false, remove() { this.removed = true; } };
      timers.push(timer);
      return timer;
    } },
    events: { once(event, callback) { if (event === 'shutdown') shutdown.push(callback); } },
  };
}

function createPitity(scene) {
  return createFriendSprite(scene, { id: 'pitity', x: 470, y: 835 });
}

test('Pitity special atlases respetan 32x48 y el número real de cuadros', () => {
  for (const [, filename, frames] of sheets) {
    const [width, height] = pngDimensions(resolve(root, filename));
    assert.equal(width, frames * 32);
    assert.equal(height, 48);
  }

  const loaded = [];
  preloadFriends({ load: { spritesheet: (...args) => loaded.push(args) } });
  for (const [key, filename] of sheets) {
    assert.ok(loaded.some(([assetKey, path, frame]) => assetKey === key
      && path.endsWith(filename) && frame.frameWidth === 32 && frame.frameHeight === 48));
  }
});

test('Pitity registra blink y phone check DOWN one-shot con sus frames reales', () => {
  const scene = makeScene();
  createFriendAnimations(scene);

  for (const [id, asset, frames, frameRate] of [
    ['blink', 'friend_pitity_blink', 5, 10],
    ['phone-check', 'friend_pitity_phone_check', 8, 6],
  ]) {
    const animation = scene.animations.find(({ key }) => key === `pitity-${id}-down`);
    assert.deepEqual(animation.frames, Array.from({ length: frames }, (_, frame) => ({ key: asset, frame })));
    assert.equal(animation.frameRate, frameRate);
    assert.equal(animation.repeat, 0);
  }
});

test('Pitity espera 5–10 s y prioriza blink 75% frente a phone check 25%', () => {
  assert.equal(chooseFriendIdleVariation('pitity', () => 0.749), 'blink');
  assert.equal(chooseFriendIdleVariation('pitity', () => 0.75), 'phone-check');
  assert.equal(chooseFriendIdleVariation('pitity', () => 1), 'phone-check');

  const scene = makeScene();
  const sprite = createPitity(scene);
  assert.ok(sprite.friendIdleTimer.delay >= FRIEND_IDLE_DELAY_RANGE_MS.min);
  assert.ok(sprite.friendIdleTimer.delay <= FRIEND_IDLE_DELAY_RANGE_MS.max);
});

test('el timer de Pitity activa la variación sorteada con los pesos configurados', () => {
  const previousRandom = Math.random;
  try {
    for (const [roll, expected] of [[0.749, 'pitity-blink-down'], [0.75, 'pitity-phone-check-down']]) {
      const values = [0, roll];
      Math.random = () => values.shift() ?? 0;
      const scene = makeScene();
      const sprite = createPitity(scene);
      sprite.friendIdleTimer.callback();
      assert.equal(sprite.anims.currentAnim.key, expected);
      assert.equal(sprite.friendState, FRIEND_STATES.SPECIAL_IDLE);
    }
  } finally {
    Math.random = previousRandom;
  }
});

test('Pitity specials solo corren en idle DOWN y vuelven al idle neutral sin duplicar scheduling', () => {
  const scene = makeScene();
  const sprite = createPitity(scene);
  assert.equal(sprite.anims.currentAnim.key, 'pitity-idle-down');

  const idleTimer = sprite.friendIdleTimer;
  assert.equal(playFriendIdleSpecial(sprite, 'blink'), true);
  assert.equal(idleTimer.removed, true);
  assert.equal(sprite.friendState, FRIEND_STATES.SPECIAL_IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'pitity-blink-down');
  assert.equal(playFriendIdleSpecial(sprite, 'phone-check'), false);

  const completionEvent = 'animationcomplete-pitity-blink-down';
  const complete = scene.listeners.get(completionEvent);
  scene.listeners.delete(completionEvent);
  complete();

  assert.equal(sprite.friendState, FRIEND_STATES.IDLE);
  assert.equal(sprite.friendFacing, 'down');
  assert.equal(sprite.anims.currentAnim.key, 'pitity-idle-down');
  assert.equal(sprite.friendSpecialCompletion, null);
  assert.equal([...scene.listeners.keys()].filter((event) => event.startsWith('animationcomplete-pitity')).length, 0);
  assert.equal(scene.timers.filter(({ removed }) => !removed).length, 1);

  const nextTimer = sprite.friendIdleTimer;
  for (const direction of ['left', 'right', 'up']) {
    playFriendIdle(sprite, direction);
    assert.equal(sprite.friendIdleTimer, null);
    assert.equal(playFriendIdleSpecial(sprite, 'blink'), false);
    assert.equal(playFriendIdleSpecial(sprite, 'phone-check'), false);
  }
  assert.equal(nextTimer.removed, true);
});

test('caminar o apagar la Scene cancela timer/listener y un callback viejo no cambia el estado', () => {
  const scene = makeScene();
  const sprite = createPitity(scene);
  assert.equal(playFriendIdleSpecial(sprite, 'phone-check'), true);
  const staleCompletion = scene.listeners.get('animationcomplete-pitity-phone-check-down');

  playFriendWalk(sprite, { x: 420, y: 835 });
  assert.equal(sprite.friendState, FRIEND_STATES.WALK);
  assert.equal(sprite.friendFacing, 'left');
  assert.equal(sprite.anims.currentAnim.key, 'pitity-walk-left');
  assert.equal(sprite.friendSpecialCompletion, null);
  assert.equal(scene.listeners.has('animationcomplete-pitity-phone-check-down'), false);
  staleCompletion();
  assert.equal(sprite.friendState, FRIEND_STATES.WALK);
  assert.equal(sprite.anims.currentAnim.key, 'pitity-walk-left');

  playFriendIdle(sprite, 'down');
  const waitingTimer = sprite.friendIdleTimer;
  scene.shutdown.forEach((callback) => callback());
  assert.equal(waitingTimer.removed, true);
  assert.equal(sprite.friendIdleTimer, null);
  assert.equal(sprite.friendScene, null);

  const activeScene = makeScene();
  const activeSprite = createPitity(activeScene);
  playFriendIdleSpecial(activeSprite, 'blink');
  destroyFriendSprite(activeSprite);
  assert.equal(activeSprite.friendSpecialCompletion, null);
  assert.equal(activeSprite.friendIdleTimer, null);
  assert.equal(activeScene.listeners.has('animationcomplete-pitity-blink-down'), false);
});
