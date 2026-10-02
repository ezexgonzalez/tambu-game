import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createFriendAnimations,
  createFriendSprite,
  FRIEND_SPRITE_CONFIG,
  preloadFriends,
} from '../src/characters/friendSprite.js';
import { patioFriends } from '../src/data/patioCharacters.js';

const ids = ['tobi', 'pitity', 'eze', 'santy'];
const atlasPath = (id, idle = false) => resolve(`public/assets/characters/friends/friend_${id}${idle ? '_idle_down' : ''}_atlas_v1.png`);
const pngSize = (path) => {
  const png = readFileSync(path);
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
};

test('los cuatro amigos tienen atlas walk 3x4 e idle down estable 1x1', () => {
  for (const id of ids) {
    assert.deepEqual(pngSize(atlasPath(id)), [96, 192]);
    assert.deepEqual(pngSize(atlasPath(id, true)), [32, 48]);
  }
  assert.deepEqual(FRIEND_SPRITE_CONFIG, {
    frameWidth: 32, frameHeight: 48, scale: 1.24, footDepthOffset: 30, walkFrameRate: 8,
  });
});

test('preload y animaciones respetan filas, frames neutros y cuatro direcciones', () => {
  const sheets = [];
  const animations = [];
  const scene = {
    load: { spritesheet: (...args) => sheets.push(args) },
    anims: { exists: () => false, create: (config) => animations.push(config) },
  };
  preloadFriends(scene);
  createFriendAnimations(scene);
  assert.equal(sheets.length, 15);
  assert.equal(animations.length, 39);
  for (const id of ids) {
    const directions = ['down', 'left', 'right', 'up'];
    for (let row = 0; row < 4; row++) {
      const direction = directions[row];
      const walk = animations.find(({ key }) => key === `${id}-walk-${direction}`);
      const idle = animations.find(({ key }) => key === `${id}-idle-${direction}`);
      assert.deepEqual(walk.frames.map(({ frame }) => frame), [1 + row * 3, row * 3, 2 + row * 3, 1 + row * 3]);
      assert.equal(walk.repeat, -1);
      assert.deepEqual(idle.frames, [{ key: direction === 'down' ? `friend_${id}_idle_down` : `friend_${id}`, frame: direction === 'down' ? 0 : 1 + row * 3 }]);
      assert.equal(idle.repeat, -1);
    }
  }
});

test('reemplaza únicamente los cuatro slots aprobados; Uriel y Thiago siguen con fallback', () => {
  assert.deepEqual(patioFriends.filter(({ id }) => id).map(({ id }) => id), ['eze', 'pitity', 'santy', 'tobi']);
  assert.deepEqual(patioFriends.filter(({ id }) => !id).map(({ name }) => name), ['Uriel', 'Thiago']);
  const calls = [];
  const sprite = {
    setOrigin(...v) { calls.push(['origin', ...v]); return this; },
    setScale(v) { calls.push(['scale', v]); return this; },
    setDepth(v) { calls.push(['depth', v]); return this; },
    play(v) { calls.push(['play', v]); return this; },
  };
  const scene = {
    add: { sprite: (...v) => { calls.push(['sprite', ...v]); return sprite; } },
    anims: { exists: () => true, create() {} },
  };
  createFriendSprite(scene, { id: 'tobi', x: 470, y: 835 });
  assert.deepEqual(calls[0], ['sprite', 470, 835, 'friend_tobi_idle_down', 0]);
  assert.ok(calls.some((call) => call[0] === 'play' && call[1] === 'tobi-idle-down'));
});
