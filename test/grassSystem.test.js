import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import {
  createGrassTileData,
  createPatioGrassLayout,
  getGrassSourceTileId,
  GRASS_CALIBRATION_LAYOUT,
  GRASS_SOURCE_TILE_POOLS,
  GRASS_TILE_SIZE,
} from '../src/world/grass/grassLayout.js';
import { GRASS_TILESET } from '../src/world/grass/preloadGrass.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const DISALLOWED_SOURCE_TILE_IDS = new Set([2, 10, 35]);

function readPngSize(path) {
  const png = readFileSync(new URL(`../public${path}`, import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

function flattenPools() {
  return Object.values(GRASS_SOURCE_TILE_POOLS).flat();
}

test('grass usa un único tileset fuente de 256x256', () => {
  const grassAssetDirectory = new URL('../public/assets/tiles/grass/', import.meta.url);

  assert.deepEqual(readdirSync(grassAssetDirectory), ['tx_tileset_grass_night.png']);
  assert.equal(GRASS_TILESET.path, '/assets/tiles/grass/tx_tileset_grass_night.png');
  assert.deepEqual(readPngSize(GRASS_TILESET.path), { width: 256, height: 256 });
});

test('la fuente se interpreta como tiles 16x16 con ids válidos y aprobados', () => {
  const sourceIds = flattenPools();

  assert.equal(GRASS_TILE_SIZE, 16);
  assert.equal(GRASS_TILESET.tileSize, 16);
  assert.equal(new Set(sourceIds).size, sourceIds.length);
  assert.ok(sourceIds.every((id) => Number.isInteger(id) && id >= 0 && id < 256));
  assert.ok(sourceIds.every((id) => !DISALLOWED_SOURCE_TILE_IDS.has(id)));
});

test('la selección de tile es determinista y solo usa los pools permitidos', () => {
  const permittedIds = new Set(flattenPools());
  const first = [];
  const second = [];

  for (let row = 0; row < 64; row += 1) {
    for (let column = 0; column < 64; column += 1) {
      first.push(getGrassSourceTileId(column, row, 9721));
      second.push(getGrassSourceTileId(column, row, 9721));
    }
  }

  assert.deepEqual(first, second);
  assert.ok(first.every((id) => permittedIds.has(id)));
});

test('la distribución conserva base dominante, detalle suave y detalle medio escaso', () => {
  const categories = new Map();
  Object.entries(GRASS_SOURCE_TILE_POOLS).forEach(([category, ids]) => {
    ids.forEach((id) => categories.set(id, category));
  });
  const counts = { base: 0, verySmall: 0, soft: 0, medium: 0 };
  const sampleSize = 10000;

  for (let index = 0; index < sampleSize; index += 1) {
    const id = getGrassSourceTileId(index % 100, Math.floor(index / 100), 9721);
    counts[categories.get(id)] += 1;
  }

  assert.ok(counts.base / sampleSize > 0.74 && counts.base / sampleSize < 0.82);
  assert.ok((counts.verySmall + counts.soft) / sampleSize > 0.16);
  assert.ok((counts.verySmall + counts.soft) / sampleSize < 0.24);
  assert.ok(counts.medium / sampleSize > 0.01 && counts.medium / sampleSize < 0.03);
});

test('la matriz cubre todo el grass bounds sin huecos', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const expectedColumns = Math.ceil(layout.bounds.width / GRASS_TILE_SIZE);
  const expectedRows = Math.ceil(layout.bounds.height / GRASS_TILE_SIZE);

  assert.equal(layout.tileSize, GRASS_TILE_SIZE);
  assert.equal(layout.data.length, expectedRows);
  assert.ok(layout.data.every((row) => row.length === expectedColumns));
  assert.ok(expectedColumns * GRASS_TILE_SIZE >= layout.bounds.width);
  assert.ok(expectedRows * GRASS_TILE_SIZE >= layout.bounds.height);
  assert.deepEqual(layout.data, createGrassTileData(layout));
});

test('la calibración usa el mismo renderer y una única posición de Tambu', () => {
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.tileSize, GRASS_TILE_SIZE);
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.tambuSpot, { x: 192, y: 136 });
  assert.equal('tambusSpots' in GRASS_CALIBRATION_LAYOUT, false);
});

test('el renderer crea una sola TilemapLayer y no usa imágenes por celda ni masks', () => {
  const renderer = readFileSync(new URL('../src/world/grass/createGrass.js', import.meta.url), 'utf8');
  const layoutSource = readFileSync(new URL('../src/world/grass/grassLayout.js', import.meta.url), 'utf8');
  const runtimeSources = [
    renderer,
    layoutSource,
    readFileSync(new URL('../src/world/grass/preloadGrass.js', import.meta.url), 'utf8'),
    readFileSync(new URL('../src/scenes/GrassCalibrationScene.js', import.meta.url), 'utf8'),
  ].join('\n');

  assert.match(renderer, /scene\.make\.tilemap/);
  assert.match(renderer, /addTilesetImage/);
  assert.match(renderer, /createLayer/);
  assert.doesNotMatch(renderer, /scene\.add\.image|enableFilters|addMask|createGeometryMask|\.setMask\s*\(/);
  assert.doesNotMatch(layoutSource, /Math\.random|patches|clusters|decals|ground01|ground02|ground03/);
  assert.doesNotMatch(runtimeSources, /grass_ground_|grass_patch_|grass_cluster_|grass_tuft_/);
});

test('el patio integra el nuevo grass sin reactivar el renderer procedural', () => {
  const patioWorld = readFileSync(new URL('../src/world/createPatioWorld.js', import.meta.url), 'utf8');

  assert.match(patioWorld, /createGrass\(scene, createPatioGrassLayout\(PATIO_LAYOUT\)/);
  assert.doesNotMatch(patioWorld, /drawGrassTexture/);
});
