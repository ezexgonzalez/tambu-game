import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMI_ANIMS,
  CAMI_SPRITE,
  CAMI_STATES,
  CAMI_WALK_FRAME_RATE,
  createCamiAnimations,
  createCamiSprite,
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

test('Cami precarga el atlas y crea idle/walk para las cuatro direcciones', () => {
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
  }]);
  assert.equal(animations.length, 8);

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
