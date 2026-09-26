import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMI_ANIMS,
  CAMI_SPRITE,
  CAMI_SPECIALS,
  CAMI_STATES,
  CAMI_IDLE_DELAY_RANGE_MS,
  CAMI_WALK_FRAME_RATE,
  chooseCamiIdleVariation,
  createCamiAnimations,
  createCamiSprite,
  getCamiIdleDelay,
  playCamiIdle,
  playCamiWalk,
  preloadCami,
  setCamiDepth,
} from '../src/characters/camiSprite.js';

test('Cami respeta el contrato del atlas base aprobado', () => {
  assert.equal(CAMI_SPRITE.path, '/assets/characters/women/women_cami_atlas_v1.png');
  assert.equal(CAMI_SPRITE.frameWidth, 32);
  assert.equal(CAMI_SPRITE.frameHeight, 48);
  assert.equal(CAMI_SPRITE.scale, 1.24);
  assert.equal(CAMI_SPRITE.footDepthOffset, 30);
  assert.deepEqual(CAMI_ANIMS, {
    down: { idle: 1, walk: [1, 0, 2, 1] },
    left: { idle: 4, walk: [4, 3, 5, 4] },
    right: { idle: 7, walk: [7, 6, 8, 7] },
    up: { idle: 10, walk: [10, 9, 11, 10] },
  });
});

test('Cami precarga los atlas y crea idle/walk y especiales down', () => {
  const sheets = [];
  const animations = [];
  const scene = {
    load: { spritesheet: (key, path, config) => sheets.push({ key, path, config }) },
    anims: {
      exists: () => false,
      create: (config) => animations.push(config),
    },
  };

  preloadCami(scene);
  createCamiAnimations(scene);

  assert.deepEqual(sheets, [{
    key: 'cami',
    path: CAMI_SPRITE.path,
    config: { frameWidth: 32, frameHeight: 48 },
  }, ...Object.values(CAMI_SPECIALS).map(({ key, path }) => ({
    key, path, config: { frameWidth: 32, frameHeight: 48 },
  }))]);
  assert.equal(animations.length, 11);

  for (const [direction, config] of Object.entries(CAMI_ANIMS)) {
    const idle = animations.find(({ key }) => key === `cami-idle-${direction}`);
    const walk = animations.find(({ key }) => key === `cami-walk-${direction}`);
    assert.deepEqual(idle.frames, [{ key: CAMI_SPRITE.key, frame: config.idle }]);
    assert.equal(idle.frameRate, 1);
    assert.equal(idle.repeat, -1);
    assert.deepEqual(walk.frames.map(({ frame }) => frame), config.walk);
    assert.equal(walk.frameRate, CAMI_WALK_FRAME_RATE);
    assert.equal(walk.repeat, -1);
  }
  for (const special of Object.values(CAMI_SPECIALS)) {
    const animation = animations.find(({ key }) => key === `${special.key}-down`);
    assert.deepEqual(animation.frames, Array.from({ length: special.frames }, (_, frame) => ({
      key: special.key, frame,
    })));
    assert.equal(animation.repeat, 0);
    assert.equal(animation.frameRate, special.frameRate);
  }
});

test('Cami espera entre variaciones y favorece blink', () => {
  assert.equal(getCamiIdleDelay(() => 0), CAMI_IDLE_DELAY_RANGE_MS.min);
  assert.equal(getCamiIdleDelay(() => 1), CAMI_IDLE_DELAY_RANGE_MS.max);
  assert.equal(chooseCamiIdleVariation(() => 0.69), 'blink');
  assert.equal(chooseCamiIdleVariation(() => 0.70), 'hairTouch');
  assert.equal(chooseCamiIdleVariation(() => 0.84), 'hairTouch');
  assert.equal(chooseCamiIdleVariation(() => 0.85), 'handOnHip');
});

test('Cami inicia down, usa escala humana y actualiza depth por pies', () => {
  const animations = [];
  const sprite = {
    x: 1235,
    y: 635,
    anims: { currentAnim: null },
    setOrigin(x, y) { this.origin = [x, y]; return this; },
    setScale(value) { this.scale = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
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

  createCamiSprite(scene, { x: 1235, y: 635 });

  assert.deepEqual(sprite.createdAt, { x: 1235, y: 635, key: 'cami', frame: 1 });
  assert.deepEqual(sprite.origin, [0.5, 0.5]);
  assert.equal(sprite.scale, 1.24);
  assert.equal(sprite.depth, 665);
  assert.equal(sprite.anims.currentAnim.key, 'cami-idle-down');
  assert.equal(sprite.camiFacing, 'down');
  assert.equal(sprite.camiState, CAMI_STATES.IDLE);

  for (const [destination, direction] of [
    [{ x: 1300, y: 635 }, 'right'],
    [{ x: 1180, y: 635 }, 'left'],
    [{ x: 1235, y: 550 }, 'up'],
    [{ x: 1235, y: 700 }, 'down'],
  ]) {
    playCamiWalk(sprite, destination);
    assert.equal(sprite.anims.currentAnim.key, `cami-walk-${direction}`);
    assert.equal(sprite.camiFacing, direction);
    assert.equal(sprite.camiState, CAMI_STATES.WALK);
  }

  playCamiIdle(sprite);
  assert.equal(sprite.anims.currentAnim.key, 'cami-idle-down');
  assert.equal(sprite.camiState, CAMI_STATES.IDLE);
  sprite.y = 700;
  setCamiDepth(sprite);
  assert.equal(sprite.depth, 730);
});

function activeCami() {
  const timers = [];
  const listeners = new Map();
  const sprite = {
    x: 300, y: 400, camiState: CAMI_STATES.IDLE, camiFacing: 'down',
    camiIdleRandom: () => 0,
    camiScene: { time: { delayedCall(delay, callback) {
      const timer = { delay, callback, removed: false, remove() { this.removed = true; } };
      timers.push(timer);
      return timer;
    } } },
    anims: { currentAnim: null },
    play(key) { this.anims.currentAnim = { key }; return this; },
    once(event, handler) { listeners.set(event, () => { listeners.delete(event); handler(); }); return this; },
    off(event) { listeners.delete(event); return this; },
  };
  return { sprite, timers, listeners };
}

test('Cami ejecuta un especial a la vez y vuelve a idle down con una sola espera', () => {
  for (const [roll, key] of [[0, 'blink'], [0.75, 'hair-touch'], [0.95, 'hand-on-hip']]) {
    const { sprite, timers, listeners } = activeCami();
    sprite.camiIdleRandom = () => roll;
    playCamiIdle(sprite, 'down');
    assert.equal(timers.length, 1);
    timers[0].callback();
    assert.equal(sprite.camiState, CAMI_STATES.SPECIAL_IDLE);
    assert.equal(sprite.anims.currentAnim.key, `cami-${key}-down`);
    assert.equal(listeners.size, 1);
    listeners.get(`animationcomplete-cami-${key}-down`)();
    assert.equal(sprite.camiState, CAMI_STATES.IDLE);
    assert.equal(sprite.anims.currentAnim.key, 'cami-idle-down');
    assert.equal(timers.length, 2);
    assert.equal(listeners.size, 0);
    playCamiIdle(sprite, 'down');
    assert.equal(timers[1].removed, true);
    assert.equal(timers.length, 3);
  }
});

test('Cami walk interrumpe todos los especiales y callbacks tardíos no la devuelven a idle', () => {
  for (const roll of [0, 0.75, 0.95]) {
    const { sprite, timers, listeners } = activeCami();
    sprite.camiIdleRandom = () => roll;
    playCamiIdle(sprite, 'down');
    timers[0].callback();
    const callback = [...listeners.values()][0];
    playCamiWalk(sprite, { x: 350, y: 400 });
    assert.equal(sprite.camiState, CAMI_STATES.WALK);
    assert.equal(sprite.anims.currentAnim.key, 'cami-walk-right');
    assert.equal(listeners.size, 0);
    callback();
    assert.equal(sprite.camiState, CAMI_STATES.WALK);
    assert.equal(sprite.anims.currentAnim.key, 'cami-walk-right');
    playCamiIdle(sprite);
    assert.equal(sprite.anims.currentAnim.key, 'cami-idle-right');
    assert.equal(timers.length, 1);
    playCamiIdle(sprite, 'down');
    assert.equal(timers.length, 2);
  }
});

test('Cami fuera de down no programa especiales y walk cancela timer pendiente', () => {
  const { sprite, timers } = activeCami();
  for (const direction of ['left', 'right', 'up']) playCamiIdle(sprite, direction);
  assert.equal(timers.length, 0);
  playCamiIdle(sprite, 'down');
  playCamiWalk(sprite, { x: 300, y: 350 });
  assert.equal(timers[0].removed, true);
  timers[0].callback();
  assert.equal(sprite.camiState, CAMI_STATES.WALK);
  assert.equal(sprite.anims.currentAnim.key, 'cami-walk-up');
});
