import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
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
import { patioFriends } from '../src/data/patioCharacters.js';

const root = resolve('public/assets/characters/friends');
const santy = patioFriends.find(({ id }) => id === 'santy');
const specials = [
  { id: 'blink', asset: 'friend_santy_blink', frames: 5, frameRate: 10 },
  { id: 'phone-check', asset: 'friend_santy_phone_check', frames: 8, frameRate: 6 },
  { id: 'drink', asset: 'friend_santy_drink', frames: 8, frameRate: 6 },
];

function makeScene(random = () => 0) {
  const timers = [];
  const animations = [];
  const sprite = Object.assign(new EventEmitter(), {
    anims: { currentAnim: null },
    friendIdleRandom: random,
    setOrigin(...value) { this.origin = value; return this; },
    setScale(value) { this.scale = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  });
  return {
    sprite, timers, animations,
    events: new EventEmitter(),
    anims: { exists: () => false, create: (config) => animations.push(config) },
    add: { sprite(x, y) { Object.assign(sprite, { x, y }); return sprite; } },
    time: { delayedCall(delay, callback) {
      const timer = {
        delay, callback, removed: false,
        remove() { this.removed = true; },
        fire() {
          assert.equal(this.removed, false);
          this.removed = true;
          this.callback();
        },
      };
      timers.push(timer);
      return timer;
    } },
  };
}

test('Santy carga los tres atlas RGBA con sus frames reales de 32x48', () => {
  const loaded = [];
  preloadFriends({ load: { spritesheet: (...args) => loaded.push(args) } });
  for (const { asset, frames } of specials) {
    const filename = `${asset}_down_atlas_v1.png`;
    const png = readFileSync(resolve(root, filename));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [frames * 32, 48]);
    assert.equal(png[25], 6, 'PNG color type is RGBA');
    assert.ok(loaded.some(([key, path, frame]) => key === asset
      && path === `/assets/characters/friends/${filename}`
      && frame.frameWidth === 32 && frame.frameHeight === 48));
  }
});

test('Santy registra blink a 10 fps, phone y drink a 6 fps, todos one-shot DOWN', () => {
  const scene = makeScene();
  createFriendAnimations(scene);
  for (const { id, asset, frames, frameRate } of specials) {
    const animation = scene.animations.find(({ key }) => key === `santy-${id}-down`);
    assert.deepEqual(animation.frames, Array.from({ length: frames }, (_, frame) => ({ key: asset, frame })));
    assert.equal(animation.frameRate, frameRate);
    assert.equal(animation.repeat, 0);
  }
  assert.deepEqual(scene.animations.find(({ key }) => key === 'santy-idle-down').frames,
    [{ key: 'friend_santy_idle_down', frame: 0 }]);
  assert.ok(scene.animations.every(({ key }) => !key.includes('santy-dance')));
});

test('Santy selecciona blink/phone/drink con boundaries 70/15/15 y espera 5–10 s', () => {
  assert.deepEqual(FRIEND_IDLE_DELAY_RANGE_MS, { min: 5000, max: 10000 });
  for (const [roll, expected] of [
    [0, 'blink'], [0.699999, 'blink'],
    [0.70, 'phone-check'], [0.849999, 'phone-check'],
    [0.85, 'drink'], [1, 'drink'],
  ]) {
    assert.equal(chooseFriendIdleVariation('santy', () => roll), expected);
  }
  for (const [roll, expectedDelay] of [[0, 5000], [1, 10000]]) {
    const scene = makeScene(() => roll);
    const sprite = createFriendSprite(scene, santy);
    assert.equal(sprite.friendIdleTimer.delay, expectedDelay);
  }
});

test('el timer genérico de Santy reproduce la selección y reprograma un único timer al completar', () => {
  for (const [roll, variation] of [[0.699999, 'blink'], [0.70, 'phone-check'], [0.85, 'drink']]) {
    const rolls = [0, roll, 0];
    const scene = makeScene(() => rolls.shift() ?? 0);
    const sprite = createFriendSprite(scene, santy);
    sprite.friendIdleTimer.fire();
    assert.equal(sprite.anims.currentAnim.key, `santy-${variation}-down`);
    assert.equal(sprite.friendState, FRIEND_STATES.SPECIAL_IDLE);
    assert.equal(sprite.friendIdleTimer, null);
    sprite.emit(`animationcomplete-santy-${variation}-down`);
    assert.equal(sprite.friendState, FRIEND_STATES.IDLE);
    assert.equal(sprite.friendFacing, 'down');
    assert.equal(sprite.anims.currentAnim.key, 'santy-idle-down');
    assert.equal(sprite.friendSpecialCompletion, null);
    assert.equal(sprite.eventNames().length, 0);
    assert.equal(scene.timers.filter(({ removed }) => !removed).length, 1);
  }
});

test('los tres specials de Santy vuelven al neutral sin solaparse ni cambiar su transform', () => {
  for (const { id } of specials) {
    const scene = makeScene();
    const sprite = createFriendSprite(scene, santy);
    const transform = () => ({ x: sprite.x, y: sprite.y, origin: sprite.origin, scale: sprite.scale, depth: sprite.depth });
    const neutral = transform();
    const timer = sprite.friendIdleTimer;
    assert.equal(playFriendIdleSpecial(sprite, id), true);
    assert.equal(timer.removed, true);
    for (const special of specials) assert.equal(playFriendIdleSpecial(sprite, special.id), false);
    assert.deepEqual(transform(), neutral);
    sprite.emit(`animationcomplete-santy-${id}-down`);
    assert.equal(sprite.anims.currentAnim.key, 'santy-idle-down');
    assert.equal(sprite.friendState, FRIEND_STATES.IDLE);
    assert.equal(sprite.friendFacing, 'down');
    assert.deepEqual(transform(), neutral);
    assert.ok(sprite.friendIdleTimer);
  }
});

test('Santy rechaza specials fuera de IDLE DOWN y cancela el timer al cambiar de facing', () => {
  const scene = makeScene();
  const sprite = createFriendSprite(scene, santy);
  const pendingTimer = sprite.friendIdleTimer;
  for (const direction of ['left', 'right', 'up']) {
    playFriendIdle(sprite, direction);
    assert.equal(sprite.friendIdleTimer, null);
    for (const { id } of specials) assert.equal(playFriendIdleSpecial(sprite, id), false);
  }
  assert.equal(pendingTimer.removed, true);
  playFriendWalk(sprite, { x: sprite.x, y: sprite.y + 10 });
  assert.equal(sprite.friendFacing, 'down');
  for (const { id } of specials) assert.equal(playFriendIdleSpecial(sprite, id), false);
});

test('caminar o cambiar a otro idle limpia cada completion de Santy sin callbacks residuales', () => {
  for (const { id } of specials) {
    for (const action of ['walk', 'idle']) {
      const scene = makeScene();
      const sprite = createFriendSprite(scene, santy);
      playFriendIdleSpecial(sprite, id);
      const completion = sprite.friendSpecialCompletion.handler;
      if (action === 'walk') playFriendWalk(sprite, { x: sprite.x - 10, y: sprite.y });
      else playFriendIdle(sprite, 'left');
      const expectedKey = `santy-${action}-left`;
      assert.equal(sprite.anims.currentAnim.key, expectedKey);
      assert.equal(sprite.friendIdleTimer, null);
      assert.equal(sprite.friendSpecialCompletion, null);
      assert.equal(sprite.eventNames().length, 0);
      completion();
      assert.equal(sprite.anims.currentAnim.key, expectedKey);
      assert.equal(sprite.friendState, action === 'walk' ? FRIEND_STATES.WALK : FRIEND_STATES.IDLE);
    }
  }
});

test('shutdown de Santy cancela espera/completion y una Scene nueva programa solo su propio timer', () => {
  for (const variation of [null, ...specials.map(({ id }) => id)]) {
    const scene = makeScene();
    const sprite = createFriendSprite(scene, santy);
    const timer = sprite.friendIdleTimer;
    if (variation) playFriendIdleSpecial(sprite, variation);
    const staleCompletion = sprite.friendSpecialCompletion?.handler;
    scene.events.emit('shutdown');
    assert.equal(timer.removed, true);
    assert.equal(sprite.friendIdleTimer, null);
    assert.equal(sprite.friendSpecialCompletion ?? null, null);
    assert.equal(sprite.friendScene, null);
    assert.equal(sprite.eventNames().length, 0);
    assert.equal(scene.events.listenerCount('shutdown'), 0);
    const stoppedKey = sprite.anims.currentAnim.key;
    staleCompletion?.();
    destroyFriendSprite(sprite);
    assert.equal(sprite.anims.currentAnim.key, stoppedKey);

    const nextScene = makeScene();
    const nextSprite = createFriendSprite(nextScene, santy);
    assert.equal(nextSprite.anims.currentAnim.key, 'santy-idle-down');
    assert.equal(nextScene.timers.filter(({ removed }) => !removed).length, 1);
    assert.equal(nextScene.events.listenerCount('shutdown'), 1);
  }
});
