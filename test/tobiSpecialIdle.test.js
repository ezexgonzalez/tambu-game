import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  chooseTobiIdleVariation,
  createFriendAnimations,
  createFriendSprite,
  destroyFriendSprite,
  FRIEND_IDLE_DELAY_RANGE_MS,
  FRIEND_STATES,
  getFriendIdleDelay,
  playFriendIdle,
  playFriendWalk,
  playTobiIdleSpecial,
  preloadFriends,
} from '../src/characters/friendSprite.js';

const root = resolve('public/assets/characters/friends');
const specialPaths = {
  drink: resolve(root, 'friend_tobi_drink_down_atlas_v1.png'),
  'arms-crossed': resolve(root, 'friend_tobi_arms_crossed_down_atlas_v1.png'),
};
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
    x: 470, y: 835, anims: { currentAnim: null }, listeners,
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

function createTobi(scene) {
  return createFriendSprite(scene, { id: 'tobi', x: 470, y: 835 });
}

test('Tobi special sheets match 32x48 cells and contain eight frames each', () => {
  for (const path of Object.values(specialPaths)) {
    assert.deepEqual(pngDimensions(path), [256, 48]);
  }
  const sheets = [];
  preloadFriends({ load: { spritesheet: (...args) => sheets.push(args) } });
  for (const [key, path] of [
    ['friend_tobi_drink', '/assets/characters/friends/friend_tobi_drink_down_atlas_v1.png'],
    ['friend_tobi_arms_crossed', '/assets/characters/friends/friend_tobi_arms_crossed_down_atlas_v1.png'],
  ]) {
    assert.ok(sheets.some(([sheetKey, sheetPath, frame]) => sheetKey === key
      && sheetPath === path && frame.frameWidth === 32 && frame.frameHeight === 48));
  }
});

test('Tobi registra dos specials DOWN one-shot de ocho frames a 6 fps', () => {
  const scene = makeScene();
  createFriendAnimations(scene);
  for (const [id, asset] of [['drink', 'friend_tobi_drink'], ['arms-crossed', 'friend_tobi_arms_crossed']]) {
    const animation = scene.animations.find(({ key }) => key === `tobi-${id}-down`);
    assert.deepEqual(animation.frames, Array.from({ length: 8 }, (_, frame) => ({ key: asset, frame })));
    assert.equal(animation.frameRate, 6);
    assert.equal(animation.repeat, 0);
  }
});

test('el scheduler de Tobi espera entre 5 y 10 s y reparte ambos specials', () => {
  assert.equal(getFriendIdleDelay(() => 0), FRIEND_IDLE_DELAY_RANGE_MS.min);
  assert.equal(getFriendIdleDelay(() => 1), FRIEND_IDLE_DELAY_RANGE_MS.max);
  assert.equal(chooseTobiIdleVariation(() => 0.2), 'drink');
  assert.equal(chooseTobiIdleVariation(() => 0.8), 'arms-crossed');
});

test('Tobi solo inicia specials en IDLE DOWN y al completar vuelve al idle neutral oficial', () => {
  const scene = makeScene();
  const sprite = createTobi(scene);
  assert.equal(sprite.friendState, FRIEND_STATES.IDLE);
  assert.equal(sprite.friendFacing, 'down');
  assert.equal(sprite.anims.currentAnim.key, 'tobi-idle-down');
  const pendingTimer = sprite.friendIdleTimer;
  assert.equal(pendingTimer.delay >= 5000 && pendingTimer.delay <= 10000, true);
  assert.equal(playTobiIdleSpecial(sprite, 'drink'), true);
  assert.equal(pendingTimer.removed, true);
  assert.equal(sprite.friendState, FRIEND_STATES.SPECIAL_IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'tobi-drink-down');
  assert.equal(playTobiIdleSpecial(sprite, 'arms-crossed'), false);
  const event = 'animationcomplete-tobi-drink-down';
  const finish = scene.listeners.get(event);
  scene.listeners.delete(event);
  finish();
  assert.equal(sprite.friendState, FRIEND_STATES.IDLE);
  assert.equal(sprite.friendFacing, 'down');
  assert.equal(sprite.anims.currentAnim.key, 'tobi-idle-down');
  assert.equal(scene.listeners.has('animationcomplete-tobi-drink-down'), false);
  assert.ok(sprite.friendIdleTimer);
});

test('cambiar de facing o caminar cancela timer y callback del special', () => {
  const scene = makeScene();
  const sprite = createTobi(scene);
  const idleTimer = sprite.friendIdleTimer;
  playFriendIdle(sprite, 'left');
  assert.equal(idleTimer.removed, true);
  assert.equal(sprite.friendIdleTimer, null);
  assert.equal(playTobiIdleSpecial(sprite, 'drink'), false);

  playFriendIdle(sprite, 'down');
  playTobiIdleSpecial(sprite, 'arms-crossed');
  const completion = scene.listeners.get('animationcomplete-tobi-arms-crossed-down');
  playFriendWalk(sprite, { x: 420, y: 835 });
  assert.equal(sprite.friendState, FRIEND_STATES.WALK);
  assert.equal(sprite.friendFacing, 'left');
  assert.equal(sprite.anims.currentAnim.key, 'tobi-walk-left');
  assert.equal(scene.listeners.has('animationcomplete-tobi-arms-crossed-down'), false);
  completion();
  assert.equal(sprite.friendState, FRIEND_STATES.WALK);
  assert.equal(sprite.anims.currentAnim.key, 'tobi-walk-left');
});

test('shutdown de Scene cancela el delayedCall y limpia listener y referencia del sprite', () => {
  const waitingScene = makeScene();
  const waitingSprite = createTobi(waitingScene);
  const idleTimer = waitingSprite.friendIdleTimer;
  waitingScene.shutdown.forEach((callback) => callback());
  assert.equal(idleTimer.removed, true);
  assert.equal(waitingSprite.friendIdleTimer, null);
  assert.equal(waitingSprite.friendScene, null);

  const activeScene = makeScene();
  const activeSprite = createTobi(activeScene);
  playTobiIdleSpecial(activeSprite, 'drink');
  assert.ok(activeSprite.friendSpecialCompletion);
  activeScene.shutdown.forEach((callback) => callback());
  assert.equal(activeSprite.friendScene, null);
  assert.equal(activeSprite.friendSpecialCompletion, null);
  assert.equal(activeScene.listeners.has('animationcomplete-tobi-drink-down'), false);
});
