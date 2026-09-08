import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getGrassBaseKey, GRASS_BASE_KEYS, GRASS_CALIBRATION_LAYOUT } from '../src/world/grass/grassLayout.js';
import { GRASS_ASSETS } from '../src/world/grass/preloadGrass.js';

function readPngSize(path) {
  const png = readFileSync(new URL(`../public${path}`, import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test('Grass System V2 declara el set modular completo con tamaños nativos', () => {
  const expected = {
    base01: [16, 16], base02: [16, 16], base03: [16, 16],
    dense01: [32, 32], dense02: [32, 32], lively01: [32, 32],
    macroDark01: [64, 64], macroDark02: [64, 64], macroSoft01: [64, 64],
    worn01: [32, 32], worn02: [48, 32], worn03: [48, 48],
    flowerWhite01: [16, 16], flowerPink01: [16, 16], leaf01: [16, 16],
  };

  Object.entries(expected).forEach(([name, [width, height]]) => {
    assert.deepEqual(readPngSize(GRASS_ASSETS[name].path), { width, height });
  });
});

test('la base usa una composición determinista sin checker regular', () => {
  const first = [];
  const second = [];
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 24; x += 1) {
      first.push(getGrassBaseKey(x, y));
      second.push(getGrassBaseKey(x, y));
    }
  }

  assert.deepEqual(first, second);
  assert.equal(new Set(first).size, GRASS_BASE_KEYS.length);
  assert.notEqual(first.join(','), GRASS_BASE_KEYS.flatMap((key) => [key]).join(','));
});

test('la calibración conserva las capas dirigidas y zonas de lectura de Tambu', () => {
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.macro.length, 6);
  assert.equal(GRASS_CALIBRATION_LAYOUT.clusters.length, 16);
  assert.equal(GRASS_CALIBRATION_LAYOUT.worn.length, 3);
  assert.equal(GRASS_CALIBRATION_LAYOUT.accents.length, 6);
  assert.notDeepEqual(
    GRASS_CALIBRATION_LAYOUT.tambuSpots.quiet,
    GRASS_CALIBRATION_LAYOUT.tambuSpots.dense,
  );
});
