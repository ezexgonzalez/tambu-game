export const GRASS_TILE_SIZE = 16;

export const GRASS_SOURCE_TILE_POOLS = Object.freeze({
  base: Object.freeze([
    0, 1, 3, 7, 11, 15, 16, 17, 19, 21, 28, 33, 34, 36, 39, 42, 44, 47, 49, 51,
    52, 53, 64, 70, 72, 78, 80, 81, 86, 87, 89, 94, 95, 97, 100, 102, 110, 117, 125,
  ]),
  verySmall: Object.freeze([6, 14, 18, 26, 61, 68, 76, 108]),
  soft: Object.freeze([
    4, 5, 13, 20, 38, 46, 54, 55, 62, 63, 66, 83, 85, 96, 101, 104, 109, 118, 119, 126,
  ]),
  medium: Object.freeze([
    22, 23, 30, 32, 48, 50, 58, 60, 65, 67, 69, 71, 73, 77, 84, 98, 103, 113, 114, 115,
  ]),
});

const PLANT_DETAIL_PATTERN_ORIGINS = Object.freeze([
  [24, 0], [24, 2], [24, 4], [24, 6],
  [26, 0], [26, 2], [26, 4], [26, 6],
  [28, 0], [28, 2], [28, 4], [28, 6],
  [30, 0], [30, 2], [30, 4],
]);

export const PLANT_DETAIL_TILE_PATTERNS = Object.freeze(
  PLANT_DETAIL_PATTERN_ORIGINS.map(([row, column]) => Object.freeze([
    Object.freeze([row * 32 + column, row * 32 + column + 1]),
    Object.freeze([(row + 1) * 32 + column, (row + 1) * 32 + column + 1]),
  ])),
);

export const PLANT_DETAIL_SOURCE_TILE_IDS = Object.freeze(
  PLANT_DETAIL_TILE_PATTERNS.flat(2),
);

const BASE_SHARE = 67;
const VERY_SMALL_SHARE = 9;
const MEDIUM_SHARE = 4;
const BASE_COARSE_CELL_SIZE = 8;
const BASE_SHARE_MODULATION = Object.freeze([-2, -1, 0, 0, 1, 2]);
const DETAIL_COARSE_CELL_SIZE = 5;
const DETAIL_PATTERN_SIZE = 2;

function hashGrassCell(column, row, seed, salt = 0) {
  let value = Math.imul(column + 1, 374761393)
    ^ Math.imul(row + 1, 668265263)
    ^ Math.imul(seed + salt, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

function getBasePool(column, row, seed, distributionValue) {
  const coarseColumn = Math.floor(column / BASE_COARSE_CELL_SIZE);
  const coarseRow = Math.floor(row / BASE_COARSE_CELL_SIZE);
  const modulationValue = hashGrassCell(coarseColumn, coarseRow, seed, 4241);
  const baseMaximum = BASE_SHARE
    + BASE_SHARE_MODULATION[modulationValue % BASE_SHARE_MODULATION.length];
  const verySmallMaximum = baseMaximum + VERY_SMALL_SHARE;
  const softMaximum = 100 - MEDIUM_SHARE;

  if (distributionValue < baseMaximum) return GRASS_SOURCE_TILE_POOLS.base;
  if (distributionValue < verySmallMaximum) return GRASS_SOURCE_TILE_POOLS.verySmall;
  if (distributionValue < softMaximum) return GRASS_SOURCE_TILE_POOLS.soft;
  return GRASS_SOURCE_TILE_POOLS.medium;
}

export function getGrassSourceTileId(column, row, seed) {
  const distributionValue = hashGrassCell(column, row, seed) % 100;
  const pool = getBasePool(column, row, seed, distributionValue);
  const variantValue = hashGrassCell(column, row, seed, 7919);

  return pool[variantValue % pool.length];
}

export function createGrassTileData({ bounds, tileSize = GRASS_TILE_SIZE, seed }) {
  const columns = Math.ceil(bounds.width / tileSize);
  const rows = Math.ceil(bounds.height / tileSize);

  return Array.from({ length: rows }, (_, row) => (
    Array.from({ length: columns }, (_, column) => getGrassSourceTileId(column, row, seed))
  ));
}

function isWithin({ x, y, width, height }, pointX, pointY) {
  return pointX >= x && pointX < x + width && pointY >= y && pointY < y + height;
}

function isNearEdge(bounds, edgeSize, pointX, pointY) {
  return pointX < bounds.x + edgeSize
    || pointX >= bounds.x + bounds.width - edgeSize
    || pointY < bounds.y + edgeSize
    || pointY >= bounds.y + bounds.height - edgeSize;
}

function getDetailPlacementChance(layout, worldX, worldY) {
  if (isWithin(layout.detailCenter, worldX, worldY)) return 10;
  if (isNearEdge(layout.bounds, layout.detailEdgeSize, worldX, worldY)) return 38;
  return 23;
}

export function createGrassDetailData({
  bounds,
  tileSize = GRASS_TILE_SIZE,
  seed,
  detailCenter,
  detailEdgeSize,
}) {
  const columns = Math.ceil(bounds.width / tileSize);
  const rows = Math.ceil(bounds.height / tileSize);
  const data = Array.from({ length: rows }, () => Array(columns).fill(-1));
  const coarseColumns = Math.ceil(columns / DETAIL_COARSE_CELL_SIZE);
  const coarseRows = Math.ceil(rows / DETAIL_COARSE_CELL_SIZE);
  const layout = { bounds, detailCenter, detailEdgeSize };

  for (let coarseRow = 0; coarseRow < coarseRows; coarseRow += 1) {
    for (let coarseColumn = 0; coarseColumn < coarseColumns; coarseColumn += 1) {
      const blockColumn = coarseColumn * DETAIL_COARSE_CELL_SIZE;
      const blockRow = coarseRow * DETAIL_COARSE_CELL_SIZE;
      const availableColumns = Math.min(DETAIL_COARSE_CELL_SIZE, columns - blockColumn);
      const availableRows = Math.min(DETAIL_COARSE_CELL_SIZE, rows - blockRow);

      if (availableColumns < DETAIL_PATTERN_SIZE || availableRows < DETAIL_PATTERN_SIZE) continue;

      const worldX = bounds.x + (blockColumn + availableColumns / 2) * tileSize;
      const worldY = bounds.y + (blockRow + availableRows / 2) * tileSize;
      const placementValue = hashGrassCell(coarseColumn, coarseRow, seed, 12011);

      if (placementValue % 100 >= getDetailPlacementChance(layout, worldX, worldY)) continue;

      const offsetRangeX = availableColumns - DETAIL_PATTERN_SIZE + 1;
      const offsetRangeY = availableRows - DETAIL_PATTERN_SIZE + 1;
      const column = blockColumn + hashGrassCell(coarseColumn, coarseRow, seed, 13759) % offsetRangeX;
      const row = blockRow + hashGrassCell(coarseColumn, coarseRow, seed, 15401) % offsetRangeY;
      const patternValue = hashGrassCell(coarseColumn, coarseRow, seed, 17107);
      const pattern = PLANT_DETAIL_TILE_PATTERNS[patternValue % PLANT_DETAIL_TILE_PATTERNS.length];

      for (let patternRow = 0; patternRow < DETAIL_PATTERN_SIZE; patternRow += 1) {
        for (let patternColumn = 0; patternColumn < DETAIL_PATTERN_SIZE; patternColumn += 1) {
          data[row + patternRow][column + patternColumn] = pattern[patternRow][patternColumn];
        }
      }
    }
  }

  return data;
}

function createLayout(bounds, seed, detailCenter, detailEdgeSize, extra = {}) {
  const layout = {
    bounds: { ...bounds },
    tileSize: GRASS_TILE_SIZE,
    seed,
    detailCenter,
    detailEdgeSize,
    ...extra,
  };

  return {
    ...layout,
    data: createGrassTileData(layout),
    detailData: createGrassDetailData(layout),
  };
}

export const GRASS_CALIBRATION_LAYOUT = createLayout(
  { x: 0, y: 0, width: 384, height: 256 },
  417,
  { x: 96, y: 56, width: 192, height: 128 },
  48,
  { tambuSpot: { x: 192, y: 136 } },
);

export function createPatioGrassLayout({ terrain, pool }) {
  return createLayout(
    terrain.grass,
    9721,
    {
      x: pool.x - 160,
      y: terrain.deck.y + terrain.deck.height,
      width: pool.width + 320,
      height: pool.height + 180,
    },
    128,
  );
}
