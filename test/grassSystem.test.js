import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createPatioGrassLayout,
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

test('el primer rediseño declara únicamente las cinco texturas aprobadas', () => {
  const expected = {
    ground01: [64, 64], ground02: [64, 64], ground03: [64, 64],
    macroSoft01: [1254, 1254], macroSoft02: [1254, 1254],
  };

  assert.deepEqual(Object.keys(GRASS_ASSETS).sort(), Object.keys(expected).sort());
  Object.entries(expected).forEach(([name, [width, height]]) => {
    assert.deepEqual(readPngSize(GRASS_ASSETS[name].path), { width, height });
  });
});

test('la superficie usa tres grounds en regiones orgánicas, no una grilla de tiles', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const assets = layout.base.map(({ asset }) => asset);

  assert.equal(GRASS_BASE_KEYS.length, 3);
  assert.equal(assets.filter((asset) => asset === GRASS_ASSETS.ground01.key).length, 1);
  assert.equal(assets.filter((asset) => asset === GRASS_ASSETS.ground02.key).length, 2);
  assert.equal(assets.filter((asset) => asset === GRASS_ASSETS.ground03.key).length, 3);
  assert.equal(layout.base[0].full, true);
  assert.ok(layout.base.every(({ points }) => points.length >= 4));
});

test('la calibración conserva base, macros suaves y zonas de lectura de Tambu', () => {
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.base.length, 3);
  assert.equal(GRASS_CALIBRATION_LAYOUT.macro.length, 2);
  assert.equal('worn' in GRASS_CALIBRATION_LAYOUT, false);
  assert.notDeepEqual(
    GRASS_CALIBRATION_LAYOUT.tambuSpots.quiet,
    GRASS_CALIBRATION_LAYOUT.tambuSpots.dense,
  );
});

test('el patio mantiene el centro limpio y concentra la variación en laterales y bordes', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);

  assert.deepEqual(layout.bounds, PATIO_LAYOUT.terrain.grass);
  assert.equal(layout.macro.length, 2);
  assert.ok(layout.macro.every(({ scale }) => scale === 0.35));
  assert.ok(layout.macro.every(({ x, y }) => x < PATIO_LAYOUT.pool.x - 20 || x > PATIO_LAYOUT.pool.x + PATIO_LAYOUT.pool.width));
  assert.equal('worn' in layout, false);
  assert.equal('clusters' in layout, false);
  assert.equal('accents' in layout, false);
});

test('el renderer compone base orgánica antes de los macros, sin capas no aprobadas', () => {
  const renderer = readFileSync(new URL('../src/world/grass/createGrass.js', import.meta.url), 'utf8');
  const macroIndex = renderer.indexOf('macro: addLayer');

  assert.ok(macroIndex > 0);
  assert.ok(renderer.indexOf('base: baseLayers') < macroIndex);
  assert.match(renderer, /tileSprite/);
  assert.match(renderer, /enableFilters\(\)/);
  assert.match(renderer, /filters\.internal\.addMask/);
  assert.doesNotMatch(renderer, /createGeometryMask/);
  assert.doesNotMatch(renderer, /\.setMask\s*\(/);
  assert.doesNotMatch(renderer, /clusters|accents|micro/);
  assert.doesNotMatch(renderer, /worn/);
});

test('el patio no reactiva render procedural, worn ni el generador provisional', () => {
  const patioWorld = readFileSync(new URL('../src/world/createPatioWorld.js', import.meta.url), 'utf8');

  assert.match(patioWorld, /createGrass\(scene, createPatioGrassLayout\(PATIO_LAYOUT\)/);
  assert.doesNotMatch(patioWorld, /drawGrassTexture/);
  assert.equal(existsSync(new URL('../public/assets/tiles/grass/worn', import.meta.url)), false);
  assert.equal(existsSync(new URL('../tools/generate_grass_v2.mjs', import.meta.url)), false);
});
