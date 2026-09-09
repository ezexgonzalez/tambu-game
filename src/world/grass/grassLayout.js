import { GRASS_ASSETS } from './preloadGrass.js';

export const GRASS_BASE_KEYS = [
  GRASS_ASSETS.ground01.key,
  GRASS_ASSETS.ground02.key,
  GRASS_ASSETS.ground03.key,
];

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
    { asset: GRASS_ASSETS.macroSoft01.key, x: 6, y: 76, scale: 0.16 },
    { asset: GRASS_ASSETS.macroSoft02.key, x: 300, y: 8, scale: 0.13 },
  ],
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
      { asset: GRASS_ASSETS.macroSoft01.key, x: 44, y: 360, scale: 0.35 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 1294, y: 680, scale: 0.35 },
    ],
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
