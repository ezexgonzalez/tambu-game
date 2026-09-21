import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSofiSprite,
  SOFI_ANIMS,
  SOFI_SPRITE,
} from '../src/characters/sofiSprite.js';

test('Sofi uses the approved 12-frame atlas contract', () => {
  assert.equal(SOFI_SPRITE.path, '/assets/characters/women/women_sofi_atlas_v1.png');
  assert.equal(SOFI_SPRITE.frameWidth, 32);
  assert.equal(SOFI_SPRITE.frameHeight, 48);
  assert.equal(SOFI_SPRITE.scale, 1.24);
  assert.equal(SOFI_SPRITE.footDepthOffset, 30);
  assert.deepEqual(SOFI_ANIMS.down, { idle: 0, walk: [1, 0, 2, 0] });
  assert.deepEqual(SOFI_ANIMS.left, { idle: 3, walk: [4, 3, 5, 3] });
  assert.deepEqual(SOFI_ANIMS.right, { idle: 6, walk: [7, 6, 8, 6] });
  assert.deepEqual(SOFI_ANIMS.up, { idle: 9, walk: [10, 9, 11, 9] });
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
  assert.deepEqual(sprite.createdAt, { x: 400, y: 690, key: 'sofi', frame: 0 });
  assert.deepEqual(sprite.origin, [0.5, 0.5]);
  assert.equal(sprite.scale, 1.24);
  assert.equal(sprite.depth, 720);
  assert.equal(sprite.played, 'sofi-idle-down');
});
