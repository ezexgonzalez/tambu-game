import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { createGrass } from '../src/world/grass/createGrass.js';
import {
  createGrassDetailData,
  createGrassTileData,
  createPatioGrassLayout,
  getGrassSourceTileId,
  GRASS_CALIBRATION_LAYOUT,
  GRASS_SOURCE_TILE_POOLS,
  GRASS_TILE_SIZE,
  PLANT_DETAIL_PATTERN_GROUPS,
  PLANT_DETAIL_SOURCE_TILE_IDS,
  PLANT_DETAIL_TILE_PATTERNS,
} from '../src/world/grass/grassLayout.js';
import { GRASS_TILESETS, preloadGrass } from '../src/world/grass/preloadGrass.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const DISALLOWED_BASE_TILE_IDS = new Set([2, 10, 35]);
const DISALLOWED_PLANT_TILE_IDS = new Set([966, 967, 998, 999]);

function readPngSize(path) {
  const png = readFileSync(new URL(`../public${path}`, import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

function flattenBasePools() {
  return Object.values(GRASS_SOURCE_TILE_POOLS).flat();
}

const DETAIL_PATTERN_BY_TOP_LEFT_ID = new Map(
  PLANT_DETAIL_TILE_PATTERNS.map((pattern, index) => [pattern[0][0], index]),
);

function getDetailPatternStarts(layout) {
  const starts = [];

  layout.detailData.forEach((row, rowIndex) => {
    row.forEach((tileId, columnIndex) => {
      if (DETAIL_PATTERN_BY_TOP_LEFT_ID.has(tileId)) {
        starts.push({
          column: columnIndex,
          row: rowIndex,
          patternIndex: DETAIL_PATTERN_BY_TOP_LEFT_ID.get(tileId),
        });
      }
    });
  });

  return starts;
}

function getLayoutZone(layout, column, row) {
  const worldX = layout.bounds.x + (column + 0.5) * layout.tileSize;
  const worldY = layout.bounds.y + (row + 0.5) * layout.tileSize;
  const center = layout.detailCenter;

  if (
    worldX >= center.x && worldX < center.x + center.width
    && worldY >= center.y && worldY < center.y + center.height
  ) return 'center';

  if (
    worldX < layout.bounds.x + layout.detailEdgeSize
    || worldX >= layout.bounds.x + layout.bounds.width - layout.detailEdgeSize
    || worldY < layout.bounds.y + layout.detailEdgeSize
    || worldY >= layout.bounds.y + layout.bounds.height - layout.detailEdgeSize
  ) return 'edge';

  return 'intermediate';
}

test('grass carga exactamente los dos tilesets actuales con sus dimensiones originales', () => {
  const grassAssetDirectory = new URL('../public/assets/tiles/grass/', import.meta.url);
  const loaded = [];

  preloadGrass({ load: { image: (key, path) => loaded.push({ key, path }) } });

  assert.deepEqual(readdirSync(grassAssetDirectory), [
    'tx_plant_grass_details_night.png',
    'tx_tileset_grass_night.png',
  ]);
  assert.deepEqual(readPngSize(GRASS_TILESETS.base.path), { width: 256, height: 256 });
  assert.deepEqual(readPngSize(GRASS_TILESETS.detail.path), { width: 512, height: 512 });
  assert.equal(GRASS_TILESETS.base.tileSize, 16);
  assert.equal(GRASS_TILESETS.detail.tileSize, 16);
  assert.equal(loaded.length, 2);
});

test('la base usa tiles 16x16 válidos y nunca selecciona frames excluidos', () => {
  const sourceIds = flattenBasePools();

  assert.equal(GRASS_TILE_SIZE, 16);
  assert.equal(new Set(sourceIds).size, sourceIds.length);
  assert.ok(sourceIds.every((id) => Number.isInteger(id) && id >= 0 && id < 256));
  assert.ok(sourceIds.every((id) => !DISALLOWED_BASE_TILE_IDS.has(id)));
});

test('el whitelist vegetal contiene solo fragmentos de grass inferior autorizado', () => {
  assert.equal(PLANT_DETAIL_TILE_PATTERNS.length, 15);
  assert.equal(PLANT_DETAIL_SOURCE_TILE_IDS.length, 60);
  assert.equal(new Set(PLANT_DETAIL_SOURCE_TILE_IDS).size, 60);
  assert.ok(PLANT_DETAIL_TILE_PATTERNS.every((pattern) => (
    pattern.length === 2 && pattern.every((row) => row.length === 2)
  )));
  assert.ok(PLANT_DETAIL_SOURCE_TILE_IDS.every((id) => {
    const row = Math.floor(id / 32);
    const column = id % 32;
    return row >= 24 && row <= 31 && column >= 0 && column <= 7;
  }));
  assert.ok(PLANT_DETAIL_SOURCE_TILE_IDS.every((id) => !DISALLOWED_PLANT_TILE_IDS.has(id)));
});

test('los 15 patrones se clasifican una sola vez por su masa visual', () => {
  const classifiedIndexes = Object.values(PLANT_DETAIL_PATTERN_GROUPS).flat();

  assert.deepEqual(Object.keys(PLANT_DETAIL_PATTERN_GROUPS), ['light', 'medium', 'dense']);
  assert.equal(classifiedIndexes.length, PLANT_DETAIL_TILE_PATTERNS.length);
  assert.equal(new Set(classifiedIndexes).size, PLANT_DETAIL_TILE_PATTERNS.length);
  assert.deepEqual([...classifiedIndexes].sort((a, b) => a - b), [...Array(15).keys()]);
});

test('la selección de base es determinista y solo usa sus pools permitidos', () => {
  const permittedIds = new Set(flattenBasePools());
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

test('base y detalle cubren la matriz completa; detalle deja celdas vacías', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const expectedColumns = Math.ceil(layout.bounds.width / GRASS_TILE_SIZE);
  const expectedRows = Math.ceil(layout.bounds.height / GRASS_TILE_SIZE);
  const permittedDetailIds = new Set(PLANT_DETAIL_SOURCE_TILE_IDS);
  const detailIds = layout.detailData.flat();

  assert.equal(layout.data.length, expectedRows);
  assert.equal(layout.detailData.length, expectedRows);
  assert.ok(layout.data.every((row) => row.length === expectedColumns));
  assert.ok(layout.detailData.every((row) => row.length === expectedColumns));
  assert.ok(expectedColumns * GRASS_TILE_SIZE >= layout.bounds.width);
  assert.ok(expectedRows * GRASS_TILE_SIZE >= layout.bounds.height);
  assert.ok(detailIds.includes(-1));
  assert.ok(detailIds.some((id) => id !== -1));
  assert.ok(detailIds.every((id) => id === -1 || permittedDetailIds.has(id)));
  assert.deepEqual(layout.data, createGrassTileData(layout));
  assert.deepEqual(layout.detailData, createGrassDetailData(layout));
});

test('la matriz vegetal es determinista y conserva la misma configuración en calibración', () => {
  const first = createPatioGrassLayout(PATIO_LAYOUT);
  const second = createPatioGrassLayout(PATIO_LAYOUT);

  assert.deepEqual(first.detailData, second.detailData);
  assert.deepEqual(GRASS_CALIBRATION_LAYOUT.bounds, { x: 0, y: 0, width: 384, height: 256 });
  assert.equal(GRASS_CALIBRATION_LAYOUT.tileSize, GRASS_TILE_SIZE);
  assert.ok(GRASS_CALIBRATION_LAYOUT.detailData.flat().some((id) => id !== -1));
});

test('cada mata vegetal conserva completo su bloque fuente 2x2', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);

  layout.detailData.forEach((row, rowIndex) => {
    row.forEach((tileId, columnIndex) => {
      if (tileId === -1) return;

      const sourceRow = Math.floor(tileId / 32);
      const sourceColumn = tileId % 32;
      const fragmentRow = sourceRow % 2;
      const fragmentColumn = sourceColumn % 2;
      const patternRow = rowIndex - fragmentRow;
      const patternColumn = columnIndex - fragmentColumn;
      const topLeftId = (sourceRow - fragmentRow) * 32 + sourceColumn - fragmentColumn;
      const patternIndex = DETAIL_PATTERN_BY_TOP_LEFT_ID.get(topLeftId);

      assert.notEqual(patternIndex, undefined);
      assert.equal(
        layout.detailData[patternRow][patternColumn],
        PLANT_DETAIL_TILE_PATTERNS[patternIndex][0][0],
      );
      assert.equal(
        layout.detailData[patternRow + 1][patternColumn + 1],
        PLANT_DETAIL_TILE_PATTERNS[patternIndex][1][1],
      );
    });
  });
});

test('la composición forma grupos irregulares y mantiene el centro más limpio que los bordes', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const starts = getDetailPatternStarts(layout);
  const patternCounts = { center: 0, intermediate: 0, edge: 0 };
  const cellCounts = { center: 0, intermediate: 0, edge: 0 };

  starts.forEach(({ column, row }) => {
    patternCounts[getLayoutZone(layout, column + 1, row + 1)] += 1;
  });
  layout.detailData.forEach((row, rowIndex) => {
    row.forEach((_, columnIndex) => {
      cellCounts[getLayoutZone(layout, columnIndex, rowIndex)] += 1;
    });
  });

  const centerDensity = patternCounts.center / cellCounts.center;
  const intermediateDensity = patternCounts.intermediate / cellCounts.intermediate;
  const edgeDensity = patternCounts.edge / cellCounts.edge;
  const neighborCounts = starts.map((start, index) => starts.filter((other, otherIndex) => (
    index !== otherIndex
    && Math.max(
      Math.abs(start.column - other.column),
      Math.abs(start.row - other.row),
    ) <= 5
  )).length);

  assert.ok(intermediateDensity > centerDensity);
  assert.ok(edgeDensity > intermediateDensity);
  assert.ok(neighborCounts.some((count) => count === 0));
  assert.ok(neighborCounts.some((count) => count >= 1));
});

test('el renderer crea dos TilemapLayers alineadas y ordenadas', () => {
  const layout = createPatioGrassLayout(PATIO_LAYOUT);
  const calls = [];
  const scene = {
    make: {
      tilemap(config) {
        const map = {
          config,
          addTilesetImage(name, key) {
            return { name, key };
          },
          createLayer(index, tileset, x, y) {
            const layer = {
              depth: null,
              setDepth(depth) {
                this.depth = depth;
                return this;
              },
            };
            calls.push({ index, tileset, x, y, layer });
            return layer;
          },
        };
        return map;
      },
    },
  };

  const result = createGrass(scene, layout);

  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(({ x, y }) => ({ x, y })), [layout.bounds, layout.bounds].map(({ x, y }) => ({ x, y })));
  assert.equal(result.baseLayer.depth, -40);
  assert.equal(result.detailLayer.depth, -39);
  assert.notEqual(result.baseMap, result.detailMap);
  assert.equal(result.baseTileset.key, GRASS_TILESETS.base.key);
  assert.equal(result.detailTileset.key, GRASS_TILESETS.detail.key);
});

test('el grass no usa random, assets legacy, imágenes por celda ni masks', () => {
  const renderer = readFileSync(new URL('../src/world/grass/createGrass.js', import.meta.url), 'utf8');
  const layoutSource = readFileSync(new URL('../src/world/grass/grassLayout.js', import.meta.url), 'utf8');
  const runtimeSources = [
    renderer,
    layoutSource,
    readFileSync(new URL('../src/world/grass/preloadGrass.js', import.meta.url), 'utf8'),
  ].join('\n');

  assert.match(renderer, /scene\.make\.tilemap/);
  assert.match(renderer, /createTilemapLayer/);
  assert.doesNotMatch(renderer, /scene\.add\.image|enableFilters|addMask|createGeometryMask|\.setMask\s*\(/);
  assert.doesNotMatch(layoutSource, /Math\.random/);
  assert.doesNotMatch(runtimeSources, /grass_ground_|grass_patch_|grass_cluster_|grass_tuft_|grass_macro_|grass_micro_/);
});

test('el patio conserva la integración modular sin renderer procedural', () => {
  const patioWorld = readFileSync(new URL('../src/world/createPatioWorld.js', import.meta.url), 'utf8');

  assert.match(patioWorld, /createGrass\(scene, createPatioGrassLayout\(PATIO_LAYOUT\)/);
  assert.doesNotMatch(patioWorld, /drawGrassTexture/);
});
