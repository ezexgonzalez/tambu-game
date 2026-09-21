import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSofiSprite,
  playSofiIdle,
  playSofiWalk,
  preloadSofi,
  SOFI_ANIMS,
  SOFI_IDLE_FRAME_RATE,
  SOFI_IDLE_SPRITE,
  SOFI_SPRITE,
  SOFI_WALK_FRAME_RATE,
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
});

test('Sofi preloads both sheets and builds four-frame looping idle animations', () => {
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

  assert.deepEqual(sheets.map(({ key }) => key), ['sofi', 'sofi-idle']);
  const idleAnimations = animations.filter(({ key }) => key.includes('-idle-'));
  const walkAnimations = animations.filter(({ key }) => key.includes('-walk-'));
  assert.equal(idleAnimations.length, 4);
  assert.equal(walkAnimations.length, 4);
  assert.ok(idleAnimations.every(({ frames, frameRate, repeat }) => (
    frames.length === 4
    && frames.every(({ key }) => key === SOFI_IDLE_SPRITE.key)
    && frameRate === SOFI_IDLE_FRAME_RATE
    && repeat === -1
  )));
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

  assert.equal(animations.length, 8);
  assert.deepEqual(sprite.createdAt, { x: 400, y: 690, key: 'sofi-idle', frame: 0 });
  assert.deepEqual(sprite.origin, [0.5, 0.5]);
  assert.equal(sprite.scale, 1.24);
  assert.equal(sprite.depth, 720);
  assert.equal(sprite.played, 'sofi-idle-down');
  assert.equal(sprite.sofiFacing, 'down');
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
  playSofiIdle(sprite);
  assert.equal(sprite.anims.currentAnim.key, 'sofi-idle-right');
});
