import { GRASS_ASSETS } from './preloadGrass.js';

export const GRASS_BASE_KEYS = [
  GRASS_ASSETS.ground01.key,
  GRASS_ASSETS.ground02.key,
  GRASS_ASSETS.ground03.key,
];

export const GRASS_DECAL_KEYS = [
  GRASS_ASSETS.tuftSmall01.key,
  GRASS_ASSETS.tuftSmall02.key,
  GRASS_ASSETS.tuftSmall03.key,
  GRASS_ASSETS.tuftPair01.key,
];

const DECAL_SIZES = [16, 16, 16, 24];

function createDistribution({ center, edgeSize }) {
  return {
    center,
    edgeSize,
    weights: {
      center: [88, 12, 0],
      sides: [65, 25, 10],
      edges: [56, 27, 17],
    },
  };
}

export const GRASS_CALIBRATION_LAYOUT = {
  bounds: { x: 0, y: 0, width: 384, height: 256 },
  tileSize: 64,
  seed: 417,
  distribution: createDistribution({
    center: { x: 96, y: 56, width: 192, height: 128 },
    edgeSize: 48,
  }),
  macro: [
    { asset: GRASS_ASSETS.macroSoft01.key, x: 0, y: 48, alpha: 0.62, scale: 1 },
    { asset: GRASS_ASSETS.macroSoft02.key, x: 218, y: 0, alpha: 0.62, scale: 1 },
    { asset: GRASS_ASSETS.macroDense01.key, x: 208, y: 96, alpha: 0.54, scale: 1 },
  ],
  decals: createGrassDecals({
    bounds: { x: 0, y: 0, width: 384, height: 256 },
    center: { x: 96, y: 56, width: 192, height: 128 },
    edgeSize: 48,
    seed: 417,
  }),
  tambuSpots: {
    quiet: { x: 192, y: 136 },
    dense: { x: 304, y: 210 },
  },
};

export function createPatioGrassLayout({ terrain, pool }) {
  const { grass } = terrain;

  return {
    bounds: grass,
    tileSize: 64,
    seed: 9721,
    distribution: createDistribution({
      center: {
        x: pool.x - 160,
        y: terrain.deck.y + terrain.deck.height,
        width: pool.width + 320,
        height: pool.height + 180,
      },
      edgeSize: 128,
    }),
    macro: [
      { asset: GRASS_ASSETS.macroSoft01.key, x: 44, y: 360, alpha: 0.62, scale: 1 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 1294, y: 680, alpha: 0.62, scale: 1 },
      { asset: GRASS_ASSETS.macroDense01.key, x: 1450, y: 380, alpha: 0.54, scale: 1 },
    ],
    decals: createGrassDecals({
      bounds: grass,
      center: {
        x: pool.x - 160,
        y: terrain.deck.y + terrain.deck.height,
        width: pool.width + 320,
        height: pool.height + 180,
      },
      edgeSize: 128,
      seed: 9721,
    }),
  };
}

function hashTile(x, y, seed) {
  let value = (x * 374761393 + y * 668265263 + seed * 1442695041) >>> 0;
  value = (value ^ (value >>> 13)) * 1274126177;
  return (value ^ (value >>> 16)) >>> 0;
}

function isWithin({ x, y, width, height }, pointX, pointY) {
  return pointX >= x && pointX < x + width && pointY >= y && pointY < y + height;
}

function isNearEdge(bounds, edgeSize, x, y) {
  return x < bounds.x + edgeSize
    || x >= bounds.x + bounds.width - edgeSize
    || y < bounds.y + edgeSize
    || y >= bounds.y + bounds.height - edgeSize;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function createGrassDecals({ bounds, center, edgeSize, seed }) {
  const spacing = 48;
  const columns = Math.ceil(bounds.width / spacing);
  const rows = Math.ceil(bounds.height / spacing);
  const decals = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cellX = bounds.x + column * spacing + spacing / 2;
      const cellY = bounds.y + row * spacing + spacing / 2;
      const edge = isNearEdge(bounds, edgeSize, cellX, cellY);
      const central = !edge && isWithin(center, cellX, cellY);
      const frequency = edge ? 18 : central ? 4 : 10;
      const value = hashTile(column, row, seed + 1301);

      if (value % 100 >= frequency) continue;

      const variantValue = hashTile(column, row, seed + 2719);
      const variantBucket = variantValue % 100;
      const variant = variantBucket < 29 ? 0 : variantBucket < 56 ? 1 : variantBucket < 84 ? 2 : 3;
      const size = DECAL_SIZES[variant];
      const jitterX = (hashTile(column, row, seed + 4001) % 25) - 12;
      const jitterY = (hashTile(column, row, seed + 6151) % 25) - 12;

      decals.push({
        asset: GRASS_DECAL_KEYS[variant],
        x: clamp(cellX - size / 2 + jitterX, bounds.x, bounds.x + bounds.width - size),
        y: clamp(cellY - size / 2 + jitterY, bounds.y, bounds.y + bounds.height - size),
        alpha: edge ? 0.72 : central ? 0.58 : 0.66,
        flipX: (variantValue & 1) === 1,
        flipY: (variantValue & 2) === 2,
      });
    }
  }

  return decals;
}

function getZoneWeights(layout, worldX, worldY) {
  const { bounds, distribution } = layout;

  if (isWithin(distribution.center, worldX, worldY)) {
    return distribution.weights.center;
  }

  const edgeSize = distribution.edgeSize;
  const isEdge = worldX < bounds.x + edgeSize
    || worldX >= bounds.x + bounds.width - edgeSize
    || worldY >= bounds.y + bounds.height - edgeSize;

  return isEdge ? distribution.weights.edges : distribution.weights.sides;
}

export function getGrassGroundKey(column, row, layout) {
  const { bounds, tileSize, seed } = layout;
  const worldX = bounds.x + column * tileSize + tileSize / 2;
  const worldY = bounds.y + row * tileSize + tileSize / 2;
  const [ground01, ground02] = getZoneWeights(layout, worldX, worldY);
  const bucket = hashTile(column, row, seed) % 100;

  if (bucket < ground01) return GRASS_BASE_KEYS[0];
  if (bucket < ground01 + ground02) return GRASS_BASE_KEYS[1];
  return GRASS_BASE_KEYS[2];
}
