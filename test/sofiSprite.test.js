import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSofiSprite,
  playSofiIdle,
  playSofiWalk,
  preloadSofi,
  SOFI_ANIMS,
  SOFI_BLINK_FRAME_RATE,
  SOFI_IDLE_DELAY_RANGE_MS,
  SOFI_IDLE_FRAME_RATE,
  SOFI_IDLE_SPRITE,
  SOFI_IDLE_VARIATION_WEIGHTS,
  SOFI_SPECIAL_FRAME_RATE,
  SOFI_SPECIAL_SPRITES,
  SOFI_SPRITE,
  SOFI_STATES,
  SOFI_WALK_FRAME_RATE,
  chooseSofiIdleVariation,
} from '../src/characters/sofiSprite.js';

test('Sofi separates the approved walk and idle atlas contracts', () => {
  assert.equal(SOFI_SPRITE.path, '/assets/characters/women/women_sofi_atlas_v1.png');
  assert.equal(SOFI_IDLE_SPRITE.path, '/assets/characters/women/women_sofi_idle_atlas_v1.png');
  assert.equal(SOFI_SPRITE.frameWidth, 32);
  assert.equal(SOFI_SPRITE.frameHeight, 48);
  assert.equal(SOFI_IDLE_SPRITE.frameWidth, 32);
  assert.equal(SOFI_IDLE_SPRITE.frameHeight, 48);
  assert.equal(SOFI_SPRITE.scale, 1.24);
  assert.equal(SOFI_SPRITE.footDepthOffset, 30);
  assert.deepEqual(SOFI_ANIMS.down, { idle: [0, 1, 2, 3], walk: [1, 0, 2, 0] });
  assert.deepEqual(SOFI_ANIMS.left, { idle: [4, 5, 6, 7], walk: [4, 3, 5, 3] });
  assert.deepEqual(SOFI_ANIMS.right, { idle: [8, 9, 10, 11], walk: [7, 6, 8, 6] });
  assert.deepEqual(SOFI_ANIMS.up, { idle: [12, 13, 14, 15], walk: [10, 9, 11, 9] });
  assert.ok(SOFI_IDLE_FRAME_RATE < SOFI_WALK_FRAME_RATE);
  assert.ok(SOFI_BLINK_FRAME_RATE < SOFI_WALK_FRAME_RATE);
  assert.deepEqual(SOFI_IDLE_DELAY_RANGE_MS, { min: 5000, max: 10000 });
  assert.deepEqual(SOFI_IDLE_VARIATION_WEIGHTS, { blink: 70, phone: 15, drink: 15 });
  assert.ok(SOFI_SPECIAL_FRAME_RATE < SOFI_WALK_FRAME_RATE);
  assert.equal(SOFI_SPECIAL_SPRITES.phone.frameWidth, 32);
  assert.equal(SOFI_SPECIAL_SPRITES.drink.frameHeight, 48);
});

test('Sofi preloads all sheets and separates stable idle, special idle and walk', () => {
  const sheets = [];
  const animations = [];
  const scene = {
    load: { spritesheet: (key, path, config) => sheets.push({ key, path, config }) },
    anims: {
      exists: () => false,
      create: (config) => animations.push(config),
    },
    add: {
      sprite: () => ({
        setOrigin() { return this; },
        setScale() { return this; },
        setDepth() { return this; },
        play() { return this; },
      }),
    },
  };

  preloadSofi(scene);
  createSofiSprite(scene, { x: 400, y: 690 });

  assert.deepEqual(sheets.map(({ key }) => key), ['sofi', 'sofi-idle', 'sofi-phone', 'sofi-drink']);
  assert.equal(sheets[2].path, SOFI_SPECIAL_SPRITES.phone.path);
  assert.equal(sheets[3].path, SOFI_SPECIAL_SPRITES.drink.path);
  assert.deepEqual(sheets.slice(2).map(({ config }) => config), [
    { frameWidth: 32, frameHeight: 48 },
    { frameWidth: 32, frameHeight: 48 },
  ]);
  const idleAnimations = animations.filter(({ key }) => /^sofi-idle-/.test(key));
  const specialIdleAnimations = animations.filter(({ key }) => /^sofi-special-idle-/.test(key));
  const walkAnimations = animations.filter(({ key }) => /^sofi-walk-/.test(key));
  assert.equal(idleAnimations.length, 4);
  assert.equal(specialIdleAnimations.length, 4);
  assert.equal(walkAnimations.length, 4);
  assert.ok(idleAnimations.every(({ frames, frameRate, repeat }) => (
    frames.length === 1
    && frames[0].key === SOFI_IDLE_SPRITE.key
    && frameRate === SOFI_IDLE_FRAME_RATE
    && repeat === -1
  )));
  assert.ok(specialIdleAnimations.every(({ frames, frameRate, repeat }) => (
    frames.length === 4
    && frames.every(({ key }) => key === SOFI_IDLE_SPRITE.key)
    && frameRate === SOFI_BLINK_FRAME_RATE
    && repeat === 0
  )));
  for (const variation of ['phone', 'drink']) {
    const animationsForVariation = animations.filter(({ key }) => key === `sofi-special-${variation}-down`);
    assert.equal(animationsForVariation.length, 1);
    assert.deepEqual(animationsForVariation[0].frames.map(({ frame }) => frame), [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.equal(animationsForVariation[0].frames[0].key, SOFI_SPECIAL_SPRITES[variation].key);
    assert.equal(animationsForVariation[0].frameRate, SOFI_SPECIAL_FRAME_RATE);
    assert.equal(animationsForVariation[0].repeat, 0);
  }
  assert.ok(walkAnimations.every(({ frames, frameRate, repeat }) => (
    frames.length === 4
    && frames.every(({ key }) => key === SOFI_SPRITE.key)
    && frameRate === SOFI_WALK_FRAME_RATE
    && repeat === -1
  )));
});

test('Sofi starts idle-down with centered origin, Tambu scale and foot depth', () => {
  const animations = [];
  const sprite = {
    anims: {},
    setOrigin(x, y) { this.origin = [x, y]; return this; },
    setScale(value) { this.scale = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.played = key; return this; },
  };
  const scene = {
    anims: {
      exists: () => false,
      create: (config) => animations.push(config),
    },
    add: {
      sprite: (x, y, key, frame) => {
        sprite.createdAt = { x, y, key, frame };
        return sprite;
      },
    },
  };

  createSofiSprite(scene, { x: 400, y: 690 });

  assert.equal(animations.length, 14);
  assert.deepEqual(sprite.createdAt, { x: 400, y: 690, key: 'sofi-idle', frame: 0 });
  assert.deepEqual(sprite.origin, [0.5, 0.5]);
  assert.equal(sprite.scale, 1.24);
  assert.equal(sprite.depth, 720);
  assert.equal(sprite.played, 'sofi-idle-down');
  assert.equal(sprite.sofiFacing, 'down');
  assert.equal(sprite.sofiState, SOFI_STATES.IDLE);
});

test('Sofi returns to the idle matching her last walk direction', () => {
  const sprite = {
    x: 400,
    y: 690,
    anims: { currentAnim: null },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };

  playSofiWalk(sprite, { x: 500, y: 690 });
  assert.equal(sprite.anims.currentAnim.key, 'sofi-walk-right');
  assert.equal(sprite.sofiState, SOFI_STATES.WALK);
  playSofiIdle(sprite);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-idle-right');
  assert.equal(sprite.sofiState, SOFI_STATES.IDLE);
});

test('Sofi schedules an occasional special idle and returns to the stable pose', () => {
  const timers = [];
  const listeners = {};
  const sprite = {
    anims: { currentAnim: null },
    sofiFacing: 'down',
    sofiIdleRandom: () => 0.5,
    sofiVariationRandom: () => 0,
    sofiScene: {
      time: {
        delayedCall(delay, callback) {
          const timer = { delay, callback, removed: false, remove() { this.removed = true; } };
          timers.push(timer);
          return timer;
        },
      },
    },
    once(event, callback) { listeners[event] = callback; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };

  playSofiIdle(sprite);
  assert.equal(sprite.sofiState, SOFI_STATES.IDLE);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 7500);

  timers[0].callback();
  assert.equal(sprite.sofiState, SOFI_STATES.SPECIAL_IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-special-idle-down');
  listeners['animationcomplete-sofi-special-idle-down']();
  assert.equal(sprite.sofiState, SOFI_STATES.IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-idle-down');
  assert.equal(timers.length, 2);
});

test('Sofi chooses phone and drink only while facing down', () => {
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'down' }, () => 0.69), 'blink');
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'down' }, () => 0.70), 'phone');
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'down' }, () => 0.84), 'phone');
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'down' }, () => 0.85), 'drink');
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'left' }, () => 0.99), 'blink');
  assert.equal(chooseSofiIdleVariation({ sofiFacing: 'up' }, () => 0.99), 'blink');
});

test('Sofi returns from phone and drink to idle-down without looping', () => {
  const timers = [];
  const listeners = {};
  const sprite = {
    anims: { currentAnim: null },
    sofiFacing: 'down',
    sofiIdleRandom: () => 0,
    sofiVariationRandom: () => 0.70,
    sofiScene: {
      time: {
        delayedCall(delay, callback) {
          const timer = { delay, callback, remove() {} };
          timers.push(timer);
          return timer;
        },
      },
    },
    once(event, callback) { listeners[event] = callback; return this; },
    off(event, callback) { if (listeners[event] === callback) delete listeners[event]; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };

  playSofiIdle(sprite);
  timers[0].callback();
  assert.equal(sprite.sofiState, SOFI_STATES.SPECIAL_IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-special-phone-down');
  listeners['animationcomplete-sofi-special-phone-down']();
  assert.equal(sprite.sofiState, SOFI_STATES.IDLE);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-idle-down');

  sprite.sofiVariationRandom = () => 0.99;
  timers[1].callback();
  assert.equal(sprite.anims.currentAnim.key, 'sofi-special-drink-down');
  listeners['animationcomplete-sofi-special-drink-down']();
  assert.equal(sprite.anims.currentAnim.key, 'sofi-idle-down');
});

test('Sofi walking interrupts a phone special idle and removes its completion listener', () => {
  const listeners = {};
  const sprite = {
    x: 400,
    y: 690,
    anims: { currentAnim: null },
    sofiFacing: 'down',
    sofiScene: {
      time: {
        delayedCall(delay, callback) { return { delay, callback, remove() {} }; },
      },
    },
    sofiIdleRandom: () => 0,
    sofiVariationRandom: () => 0.70,
    once(event, callback) { listeners[event] = callback; return this; },
    off(event, callback) { if (listeners[event] === callback) delete listeners[event]; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };

  playSofiIdle(sprite);
  const timer = sprite.sofiIdleTimer;
  timer.callback();
  assert.equal(sprite.sofiState, SOFI_STATES.SPECIAL_IDLE);
  assert.ok(listeners['animationcomplete-sofi-special-phone-down']);

  playSofiWalk(sprite, { x: 500, y: 690 });
  assert.equal(sprite.sofiState, SOFI_STATES.WALK);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-walk-right');
  assert.equal(listeners['animationcomplete-sofi-special-phone-down'], undefined);
});
