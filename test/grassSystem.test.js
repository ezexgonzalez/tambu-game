import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createPatioGrassLayout,
  getGrassBaseKey,
  GRASS_BASE_KEYS,
  GRASS_CALIBRATION_LAYOUT,
} from '../src/world/grass/grassLayout.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';
import { GRASS_ASSETS } from '../src/world/grass/preloadGrass.js';

function readPngSize(path) {
  const png = readFileSync(new URL(`../public${path}`, import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test('Night Grass Pack V3 declara el set modular completo con tamaños nativos', () => {
  const expected = {
    base01: [16, 16], base02: [16, 16], base03: [16, 16], base04: [16, 16],
    micro01: [16, 16], micro02: [16, 16], micro03: [16, 16], micro04: [16, 16],
    macroSoft01: [64, 64], macroSoft02: [64, 64], macroDark01: [64, 64],
    cluster01: [48, 48], cluster02: [48, 48], cluster03: [48, 48], cluster04: [48, 48],
    cluster05: [48, 48], cluster06: [48, 48], cluster07: [48, 48], cluster08: [48, 48],
    flowerWhite01: [16, 16], flowerPink01: [16, 16], flowerPink02: [16, 16],
    leaf01: [16, 16], leaf02: [16, 16], leaf03: [16, 16],
    smallPlant01: [32, 32], smallPlant02: [32, 32],
    bushEdge01: [64, 32], bushEdge02: [64, 32],
  };

  Object.entries(expected).forEach(([name, [width, height]]) => {
    assert.deepEqual(readPngSize(GRASS_ASSETS[name].path), { width, height });
  });
});

test('la base usa cuatro variantes deterministas sin checker regular', () => {
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

test('la calibración conserva capas Night Grass y zonas de lectura de Tambu', () => {
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.micro.length, 8);
  assert.equal(GRASS_CALIBRATION_LAYOUT.macro.length, 3);
  assert.equal(GRASS_CALIBRATION_LAYOUT.clusters.length, 5);
  assert.equal(GRASS_CALIBRATION_LAYOUT.accents.length, 5);
  assert.equal('worn' in GRASS_CALIBRATION_LAYOUT, false);
  assert.notDeepEqual(
    GRASS_CALIBRATION_LAYOUT.tambuSpots.quiet,
    GRASS_CALIBRATION_LAYOUT.tambuSpots.dense,
  );
});

test('el patio usa capas verdes dirigidas, sin worn ni tierra', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const allOverlays = [...layout.micro, ...layout.macro, ...layout.clusters, ...layout.accents];

  assert.deepEqual(layout.bounds, PATIO_LAYOUT.terrain.grass);
  assert.ok(layout.macro.every(({ alpha }) => alpha >= 0.75 && alpha <= 1));
  assert.ok(layout.micro.length > 0);
  assert.ok(layout.clusters.length > 0);
  assert.ok(layout.accents.length > 0);
  assert.equal('worn' in layout, false);
  assert.equal(allOverlays.some(({ asset }) => asset.includes('worn')), false);
});

test('el renderer usa el orden base, micro, macro, clusters y accents', () => {
  const renderer = readFileSync(new URL('../src/world/grass/createGrass.js', import.meta.url), 'utf8');
  const microIndex = renderer.indexOf('micro: addLayer');
  const macroIndex = renderer.indexOf('macro: addLayer');
  const clustersIndex = renderer.indexOf('clusters: addLayer');
  const accentsIndex = renderer.indexOf('accents: addLayer');

  assert.ok(microIndex > 0);
  assert.ok(microIndex < macroIndex && macroIndex < clustersIndex && clustersIndex < accentsIndex);
  assert.doesNotMatch(renderer, /worn/);
});

test('el patio no reactiva render procedural, worn ni el generador provisional', () => {
  const patioWorld = readFileSync(new URL('../src/world/createPatioWorld.js', import.meta.url), 'utf8');

  assert.match(patioWorld, /createGrass\(scene, createPatioGrassLayout\(PATIO_LAYOUT\)/);
  assert.doesNotMatch(patioWorld, /drawGrassTexture/);
  assert.equal(existsSync(new URL('../public/assets/tiles/grass/worn', import.meta.url)), false);
  assert.equal(existsSync(new URL('../tools/generate_grass_v2.mjs', import.meta.url)), false);
});
