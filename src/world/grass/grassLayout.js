export const GRASS_TILE_SIZE = 16;

export const GRASS_SOURCE_TILE_POOLS = Object.freeze({
  base: Object.freeze([0]),
  verySmall: Object.freeze([6, 14, 68, 76, 108]),
  soft: Object.freeze([5, 13, 55, 63, 96, 101, 104, 109]),
  medium: Object.freeze([23, 50, 58, 60, 65, 71, 73, 84, 98, 115]),
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

// Classified by the visible mass of each complete 32x32 plant, not by its tile fragments.
export const PLANT_DETAIL_PATTERN_GROUPS = Object.freeze({
  light: Object.freeze([11, 12, 13, 14]),
  medium: Object.freeze([4, 5, 6, 7, 8, 9, 10]),
  dense: Object.freeze([0, 1, 2, 3]),
});

export const PLANT_DETAIL_SOURCE_TILE_IDS = Object.freeze(
  PLANT_DETAIL_TILE_PATTERNS.flat(2),
);

const BASE_SHARE = 66;
const VERY_SMALL_SHARE = 9;
const MEDIUM_SHARE = 4;
const BASE_COARSE_CELL_SIZE = 8;
const BASE_SHARE_MODULATION = Object.freeze([-2, -1, 0, 0, 1, 2]);
const DETAIL_ANCHOR_CELL_SIZE = 8;
const DETAIL_PATTERN_SIZE = 2;

const DETAIL_GROUP_SHAPES = Object.freeze({
  1: Object.freeze([
    Object.freeze([[0, 0]]),
  ]),
  2: Object.freeze([
    Object.freeze([[0, 0], [3, 1]]),
    Object.freeze([[1, 0], [0, 3]]),
    Object.freeze([[0, 1], [3, 0]]),
    Object.freeze([[0, 0], [2, 3]]),
    Object.freeze([[0, 2], [3, 0]]),
  ]),
  3: Object.freeze([
    Object.freeze([[0, 1], [3, 0], [2, 4]]),
    Object.freeze([[1, 0], [0, 3], [4, 2]]),
    Object.freeze([[0, 0], [4, 1], [2, 4]]),
    Object.freeze([[3, 0], [0, 2], [4, 4]]),
  ]),
});

const DETAIL_PLACEMENT_CHANCES = Object.freeze({
  center: Object.freeze({ quiet: 18, normal: 33, rich: 48 }),
  intermediate: Object.freeze({ quiet: 38, normal: 58, rich: 74 }),
  edge: Object.freeze({ quiet: 56, normal: 76, rich: 90 }),
});

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

function getDetailZone(layout, worldX, worldY) {
  if (isWithin(layout.detailCenter, worldX, worldY)) return 'center';
  if (isNearEdge(layout.bounds, layout.detailEdgeSize, worldX, worldY)) return 'edge';
  return 'intermediate';
}

function getDetailDensityState(anchorColumn, anchorRow, seed) {
  const broadValue = hashGrassCell(
    Math.floor(anchorColumn / 2),
    Math.floor(anchorRow / 2),
    seed,
    12011,
  ) % 100;
  const crossingValue = hashGrassCell(
    Math.floor((anchorColumn + 1) / 3),
    Math.floor((anchorRow + 2) / 3),
    seed,
    12457,
  ) % 100;
  const densityValue = (broadValue * 3 + crossingValue) / 4;

  if (densityValue < 28) return 'quiet';
  if (densityValue >= 72) return 'rich';
  return 'normal';
}

function getDetailGroupSize(zone, densityState, value) {
  if (zone === 'center') {
    return densityState === 'rich' && value % 100 < 22 ? 2 : 1;
  }

  if (zone === 'intermediate') {
    if (densityState === 'quiet') return value % 100 < 22 ? 2 : 1;
    if (densityState === 'rich') return value % 100 < 12 ? 3 : 2;
    return value % 100 < 58 ? 2 : 1;
  }

  if (densityState === 'quiet') return value % 100 < 48 ? 2 : 1;
  if (densityState === 'rich') return value % 100 < 58 ? 3 : 2;
  return value % 100 < 18 ? 3 : 2;
}

function getPatternPool(zone, densityState, patternIndex, value) {
  if (zone === 'center') {
    return patternIndex > 0 || value % 100 < 82
      ? PLANT_DETAIL_PATTERN_GROUPS.light
      : PLANT_DETAIL_PATTERN_GROUPS.medium;
  }

  if (zone === 'intermediate') {
    return (patternIndex + value) % 3 === 0
      ? PLANT_DETAIL_PATTERN_GROUPS.light
      : PLANT_DETAIL_PATTERN_GROUPS.medium;
  }

  if (densityState === 'rich' && patternIndex === 0 && value % 100 < 62) {
    return PLANT_DETAIL_PATTERN_GROUPS.dense;
  }

  return (patternIndex + value) % 4 === 0
    ? PLANT_DETAIL_PATTERN_GROUPS.light
    : PLANT_DETAIL_PATTERN_GROUPS.medium;
}

function getShapeBounds(shape) {
  return {
    width: Math.max(...shape.map(([column]) => column)) + DETAIL_PATTERN_SIZE,
    height: Math.max(...shape.map(([, row]) => row)) + DETAIL_PATTERN_SIZE,
  };
}

function selectGroupShape(groupSize, availableColumns, availableRows, value) {
  for (let size = groupSize; size >= 1; size -= 1) {
    const shapes = DETAIL_GROUP_SHAPES[size].filter((shape) => {
      const shapeBounds = getShapeBounds(shape);
      return shapeBounds.width <= availableColumns && shapeBounds.height <= availableRows;
    });

    if (shapes.length > 0) return shapes[value % shapes.length];
  }

  return null;
}

function selectPatternIndex(pool, value, usedPatternIndexes) {
  const initialIndex = value % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const patternIndex = pool[(initialIndex + offset) % pool.length];
    if (!usedPatternIndexes.has(patternIndex)) return patternIndex;
  }

  return pool[initialIndex];
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
  const anchorColumns = Math.ceil(columns / DETAIL_ANCHOR_CELL_SIZE);
  const anchorRows = Math.ceil(rows / DETAIL_ANCHOR_CELL_SIZE);
  const layout = { bounds, detailCenter, detailEdgeSize };

  for (let anchorRow = 0; anchorRow < anchorRows; anchorRow += 1) {
    for (let anchorColumn = 0; anchorColumn < anchorColumns; anchorColumn += 1) {
      const blockColumn = anchorColumn * DETAIL_ANCHOR_CELL_SIZE;
      const blockRow = anchorRow * DETAIL_ANCHOR_CELL_SIZE;
      const availableColumns = Math.min(DETAIL_ANCHOR_CELL_SIZE, columns - blockColumn);
      const availableRows = Math.min(DETAIL_ANCHOR_CELL_SIZE, rows - blockRow);

      if (availableColumns < DETAIL_PATTERN_SIZE || availableRows < DETAIL_PATTERN_SIZE) continue;

      const worldX = bounds.x + (blockColumn + availableColumns / 2) * tileSize;
      const worldY = bounds.y + (blockRow + availableRows / 2) * tileSize;
      const zone = getDetailZone(layout, worldX, worldY);
      const densityState = getDetailDensityState(anchorColumn, anchorRow, seed);
      const placementValue = hashGrassCell(anchorColumn, anchorRow, seed, 13103);
      const placementChance = DETAIL_PLACEMENT_CHANCES[zone][densityState];

      if (placementValue % 100 >= placementChance) continue;

      const groupValue = hashGrassCell(anchorColumn, anchorRow, seed, 13759);
      const groupSize = getDetailGroupSize(zone, densityState, groupValue);
      const shapeValue = hashGrassCell(anchorColumn, anchorRow, seed, 14321);
      const shape = selectGroupShape(groupSize, availableColumns, availableRows, shapeValue);
      if (!shape) continue;

      const shapeBounds = getShapeBounds(shape);
      const originColumn = blockColumn + hashGrassCell(anchorColumn, anchorRow, seed, 15401)
        % (availableColumns - shapeBounds.width + 1);
      const originRow = blockRow + hashGrassCell(anchorColumn, anchorRow, seed, 16001)
        % (availableRows - shapeBounds.height + 1);
      const usedPatternIndexes = new Set();

      for (let groupIndex = 0; groupIndex < shape.length; groupIndex += 1) {
        const [columnOffset, rowOffset] = shape[groupIndex];
        const patternValue = hashGrassCell(
          anchorColumn + columnOffset,
          anchorRow + rowOffset,
          seed,
          17107 + groupIndex * 977,
        );
        const patternPool = getPatternPool(zone, densityState, groupIndex, patternValue);
        const patternIndex = selectPatternIndex(patternPool, patternValue, usedPatternIndexes);
        const pattern = PLANT_DETAIL_TILE_PATTERNS[patternIndex];
        const column = originColumn + columnOffset;
        const row = originRow + rowOffset;
        usedPatternIndexes.add(patternIndex);

        for (let patternRow = 0; patternRow < DETAIL_PATTERN_SIZE; patternRow += 1) {
          for (let patternColumn = 0; patternColumn < DETAIL_PATTERN_SIZE; patternColumn += 1) {
            data[row + patternRow][column + patternColumn] = pattern[patternRow][patternColumn];
          }
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
