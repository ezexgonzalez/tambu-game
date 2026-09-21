import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacters, preloadCharacters } from '../src/characters/createCharacters.js';
import {
  createMiliAnimations,
  createMiliSprite,
  MILI_ANIMS,
  MILI_IDLE_FRAME_RATE,
  MILI_SPRITE,
  MILI_STATES,
  MILI_WALK_FRAME_RATE,
  playMiliIdle,
  playMiliWalk,
  preloadMili,
  setMiliDepth,
} from '../src/characters/miliSprite.js';

function object(x = 0, y = 0) {
  return {
    x,
    y,
    anims: { currentAnim: null },
    add() { return this; },
    setOrigin() { return this; },
    setScale(value) { this.scale = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };
}

function characterScene(sheets = []) {
  return {
    load: { spritesheet: (key, path, config) => sheets.push({ key, path, config }) },
    anims: {
      exists: () => false,
      create() {},
    },
    add: {
      container: (x, y) => object(x, y),
      ellipse: object,
      rectangle: object,
      sprite: (x, y, key, frame) => Object.assign(object(x, y), { key, frame }),
      text: object,
    },
    tweens: { add() {} },
  };
}

test('Mili respeta el contrato del atlas aprobado', () => {
  assert.equal(MILI_SPRITE.path, '/assets/characters/women/women_mili_atlas_v1.png');
  assert.equal(MILI_SPRITE.frameWidth, 32);
  assert.equal(MILI_SPRITE.frameHeight, 48);
  assert.equal(MILI_SPRITE.scale, 1.24);
  assert.equal(MILI_SPRITE.footDepthOffset, 30);
  assert.deepEqual(MILI_ANIMS, {
    down: { idle: 1, walk: [1, 0, 2, 1] },
    left: { idle: 4, walk: [4, 3, 5, 4] },
    right: { idle: 7, walk: [7, 6, 8, 7] },
    up: { idle: 10, walk: [10, 9, 11, 10] },
  });
});

test('Mili preload y animaciones separan idle estatico de walk en las cuatro direcciones', () => {
  const sheets = [];
  const animations = [];
  const scene = {
    load: { spritesheet: (key, path, config) => sheets.push({ key, path, config }) },
    anims: {
      exists: () => false,
      create: (config) => animations.push(config),
    },
  };

  preloadMili(scene);
  createMiliAnimations(scene);

  assert.deepEqual(sheets, [{
    key: 'mili',
    path: MILI_SPRITE.path,
    config: { frameWidth: 32, frameHeight: 48 },
  }]);
  assert.equal(animations.length, 8);

  for (const [direction, config] of Object.entries(MILI_ANIMS)) {
    const idle = animations.find(({ key }) => key === `mili-idle-${direction}`);
    const walk = animations.find(({ key }) => key === `mili-walk-${direction}`);
    assert.deepEqual(idle.frames, [{ key: MILI_SPRITE.key, frame: config.idle }]);
    assert.equal(idle.frameRate, MILI_IDLE_FRAME_RATE);
    assert.equal(idle.repeat, -1);
    assert.deepEqual(walk.frames.map(({ frame }) => frame), config.walk);
    assert.equal(walk.frameRate, MILI_WALK_FRAME_RATE);
    assert.equal(walk.repeat, -1);
  }
});

test('Mili inicia en down, orienta el walk y calcula depth por pies', () => {
  const animations = [];
  const sprite = {
    x: 920,
    y: 350,
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

  createMiliSprite(scene, { x: 920, y: 350 });

  assert.deepEqual(sprite.createdAt, { x: 920, y: 350, key: 'mili', frame: 1 });
  assert.deepEqual(sprite.origin, [0.5, 0.5]);
  assert.equal(sprite.scale, 1.24);
  assert.equal(sprite.depth, 380);
  assert.equal(sprite.anims.currentAnim.key, 'mili-idle-down');
  assert.equal(sprite.miliFacing, 'down');
  assert.equal(sprite.miliState, MILI_STATES.IDLE);

  for (const [destination, direction] of [
    [{ x: 1000, y: 350 }, 'right'],
    [{ x: 800, y: 350 }, 'left'],
    [{ x: 920, y: 250 }, 'up'],
    [{ x: 920, y: 450 }, 'down'],
  ]) {
    playMiliWalk(sprite, destination);
    assert.equal(sprite.anims.currentAnim.key, `mili-walk-${direction}`);
    assert.equal(sprite.miliFacing, direction);
    assert.equal(sprite.miliState, MILI_STATES.WALK);
  }

  playMiliIdle(sprite);
  assert.equal(sprite.anims.currentAnim.key, 'mili-idle-down');
  assert.equal(sprite.miliState, MILI_STATES.IDLE);
  sprite.y = 400;
  setMiliDepth(sprite);
  assert.equal(sprite.depth, 430);
});

test('createCharacters usa Mili real y conserva Sofi real y Cami procedural', () => {
  const sheets = [];
  const scene = characterScene(sheets);
  preloadCharacters(scene);
  const interactables = createCharacters(scene);

  assert.deepEqual(sheets.map(({ key }) => key), [
    'sofi',
    'sofi-idle',
    'sofi-phone',
    'sofi-drink',
    'mili',
  ]);
  assert.equal(interactables.find(({ character }) => character.id === 'sofi').visual, 'sofi-sprite');
  const mili = interactables.find(({ character }) => character.id === 'mili');
  assert.equal(mili.visual, 'mili-sprite');
  assert.equal(mili.sprite.key, 'mili');
  assert.equal(mili.sprite.anims.currentAnim.key, 'mili-idle-down');
  assert.equal(interactables.find(({ character }) => character.id === 'cami').visual, 'procedural');
});
