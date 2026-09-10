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

const POOL_DISTRIBUTION = Object.freeze([
  { maximum: 78, pool: GRASS_SOURCE_TILE_POOLS.base },
  { maximum: 85, pool: GRASS_SOURCE_TILE_POOLS.verySmall },
  { maximum: 98, pool: GRASS_SOURCE_TILE_POOLS.soft },
  { maximum: 100, pool: GRASS_SOURCE_TILE_POOLS.medium },
]);

function hashGrassCell(column, row, seed, salt = 0) {
  let value = Math.imul(column + 1, 374761393)
    ^ Math.imul(row + 1, 668265263)
    ^ Math.imul(seed + salt, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

export function getGrassSourceTileId(column, row, seed) {
  const distributionValue = hashGrassCell(column, row, seed) % 100;
  const { pool } = POOL_DISTRIBUTION.find(({ maximum }) => distributionValue < maximum);
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

function createLayout(bounds, seed, extra = {}) {
  const layout = {
    bounds: { ...bounds },
    tileSize: GRASS_TILE_SIZE,
    seed,
    ...extra,
  };

  return {
    ...layout,
    data: createGrassTileData(layout),
  };
}

export const GRASS_CALIBRATION_LAYOUT = createLayout(
  { x: 0, y: 0, width: 384, height: 256 },
  417,
  { tambuSpot: { x: 192, y: 136 } },
);

export function createPatioGrassLayout({ terrain }) {
  return createLayout(terrain.grass, 9721);
}
