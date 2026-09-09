import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import {
  createPatioGrassLayout,
  getGrassGroundKey,
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

function getTileCounts(layout) {
  const counts = new Map(GRASS_BASE_KEYS.map((key) => [key, 0]));
  const columns = Math.ceil(layout.bounds.width / layout.tileSize);
  const rows = Math.ceil(layout.bounds.height / layout.tileSize);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const key = getGrassGroundKey(column, row, layout);
      counts.set(key, counts.get(key) + 1);
    }
  }

  return { counts, columns, rows };
}

function getTileShareInBounds(layout, area, key) {
  const columns = Math.ceil(layout.bounds.width / layout.tileSize);
  const rows = Math.ceil(layout.bounds.height / layout.tileSize);
  let count = 0;
  let matching = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = layout.bounds.x + column * layout.tileSize + layout.tileSize / 2;
      const y = layout.bounds.y + row * layout.tileSize + layout.tileSize / 2;
      if (x >= area.x && x < area.x + area.width && y >= area.y && y < area.y + area.height) {
        count += 1;
        if (getGrassGroundKey(column, row, layout) === key) matching += 1;
      }
    }
  }

  return matching / count;
}

test('el Grass Pass declara tres grounds runtime y dos macros sin assets extra', () => {
  const expected = {
    ground01: [64, 64], ground02: [64, 64], ground03: [64, 64],
    macroSoft01: [256, 256], macroSoft02: [256, 256],
  };

  assert.deepEqual(Object.keys(GRASS_ASSETS).sort(), Object.keys(expected).sort());
  Object.entries(expected).forEach(([name, [width, height]]) => {
    assert.deepEqual(readPngSize(GRASS_ASSETS[name].path), { width, height });
  });
});

test('la grilla usa tiles de 64 px y cubre por completo el grass bounds', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const { columns, rows } = getTileCounts(layout);

  assert.equal(layout.tileSize, 64);
  assert.equal(GRASS_CALIBRATION_LAYOUT.tileSize, 64);
  assert.ok(columns * layout.tileSize >= layout.bounds.width);
  assert.ok(rows * layout.tileSize >= layout.bounds.height);
});

test('la selección de ground es determinista y usa las tres keys', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const first = [];
  const second = [];

  for (let row = 0; row < 13; row += 1) {
    for (let column = 0; column < 27; column += 1) {
      first.push(getGrassGroundKey(column, row, layout));
      second.push(getGrassGroundKey(column, row, layout));
    }
  }

  assert.deepEqual(first, second);
  assert.deepEqual(new Set(first), new Set(GRASS_BASE_KEYS));
});

test('ground01 domina, ground02 aparece y ground03 queda por debajo de ground02', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const { counts } = getTileCounts(layout);
  const [ground01, ground02, ground03] = GRASS_BASE_KEYS;

  assert.ok(counts.get(ground01) > counts.get(ground02));
  assert.ok(counts.get(ground02) > counts.get(ground03));
  assert.ok(counts.get(ground02) > 0);
  assert.ok(counts.get(ground03) > 0);
});

test('el centro cercano a la piscina contiene más ground01 que los bordes', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const [ground01] = GRASS_BASE_KEYS;
  const centerShare = getTileShareInBounds(layout, layout.distribution.center, ground01);
  const edgeShare = getTileShareInBounds(layout, {
    x: layout.bounds.x,
    y: layout.bounds.y,
    width: layout.distribution.edgeSize,
    height: layout.bounds.height,
  }, ground01);

  assert.ok(centerShare > edgeShare);
});

test('la calibración usa la misma grilla dirigida, macros y spots de Tambu', () => {
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.macro.length, 2);
  assert.equal('worn' in GRASS_CALIBRATION_LAYOUT, false);
  assert.notDeepEqual(
    GRASS_CALIBRATION_LAYOUT.tambuSpots.quiet,
    GRASS_CALIBRATION_LAYOUT.tambuSpots.dense,
  );
});

test('el patio conserva macros, sin worn, clusters ni accents', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);

  assert.deepEqual(layout.bounds, PATIO_LAYOUT.terrain.grass);
  assert.equal(layout.macro.length, 2);
  assert.ok(layout.macro.every(({ alpha, scale }) => alpha === 0.72 && scale === 1));
  assert.equal('worn' in layout, false);
  assert.equal('clusters' in layout, false);
  assert.equal('accents' in layout, false);
});

test('el renderer compone tiles base completos antes de los macros sin masks', () => {
  const renderer = readFileSync(new URL('../src/world/grass/createGrass.js', import.meta.url), 'utf8');
  const macroIndex = renderer.indexOf('macro: addLayer');

  assert.ok(macroIndex > 0);
  assert.ok(renderer.indexOf('base,') < macroIndex);
  assert.match(renderer, /scene\.add\.image/);
  assert.doesNotMatch(renderer, /enableFilters|addMask|createGeometryMask|\.setMask\s*\(/);
  assert.doesNotMatch(renderer, /clusters|accents|micro|worn/);
});

test('el patio no reactiva render procedural, worn ni el generador provisional', () => {
  const patioWorld = readFileSync(new URL('../src/world/createPatioWorld.js', import.meta.url), 'utf8');

  assert.match(patioWorld, /createGrass\(scene, createPatioGrassLayout\(PATIO_LAYOUT\)/);
  assert.doesNotMatch(patioWorld, /drawGrassTexture/);
  assert.equal(existsSync(new URL('../public/assets/tiles/grass/worn', import.meta.url)), false);
  assert.equal(existsSync(new URL('../tools/generate_grass_v2.mjs', import.meta.url)), false);
});
