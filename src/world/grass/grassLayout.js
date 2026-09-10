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

export const GRASS_CLUSTER_KEYS = [
  GRASS_ASSETS.clusterMedium01.key,
  GRASS_ASSETS.clusterMedium02.key,
  GRASS_ASSETS.clusterMedium03.key,
];

const DECAL_SIZES = [16, 16, 16, 24];
const CLUSTER_SIZES = [32, 32, 48];

function createDistribution({ center, edgeSize }) {
  return {
    center,
    edgeSize,
    weights: {
      center: [88, 12, 0],
      sides: [67, 24, 9],
      edges: [59, 27, 14],
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
  patches: [
    { asset: GRASS_ASSETS.patchSoft01.key, x: 4, y: 48, alpha: 0.82 },
    { asset: GRASS_ASSETS.patchSoft01.key, x: 214, y: 0, alpha: 0.82, flipX: true },
    { asset: GRASS_ASSETS.patchSoft02.key, x: 252, y: 152, alpha: 0.78, flipY: true },
  ],
  clusters: createGrassClusters({
    bounds: { x: 0, y: 0, width: 384, height: 256 },
    center: { x: 96, y: 56, width: 192, height: 128 },
    edgeSize: 48,
    seed: 417,
  }),
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

export function createPatioGrassLayout({
  terrain,
  pool,
  plants = [],
  edgeShrubs = [],
  edgeGardens = [],
  garlands = [],
}) {
  const { grass } = terrain;
  const center = {
    x: pool.x - 160,
    y: terrain.deck.y + terrain.deck.height,
    width: pool.width + 320,
    height: pool.height + 180,
  };
  const vegetationAnchors = [
    ...plants.map(({ x, y }) => ({ x, y })),
    ...edgeShrubs.map(({ x, y }) => ({ x, y })),
    ...edgeGardens.map(({ x, y, width, height }) => ({
      x: x + width / 2,
      y: y + height / 2,
    })),
    ...garlands.flatMap(({ x1, y1, x2, y2 }) => [{ x: x1, y: y1 }, { x: x2, y: y2 }]),
  ];

  return {
    bounds: grass,
    tileSize: 64,
    seed: 9721,
    distribution: createDistribution({
      center,
      edgeSize: 128,
    }),
    patches: [
      { asset: GRASS_ASSETS.patchSoft02.key, x: 18, y: 382, alpha: 0.78 },
      { asset: GRASS_ASSETS.patchSoft01.key, x: 2, y: 516, alpha: 0.82, flipY: true },
      { asset: GRASS_ASSETS.patchSoft02.key, x: 12, y: 770, alpha: 0.78, flipX: true },
      { asset: GRASS_ASSETS.patchSoft01.key, x: 280, y: 862, alpha: 0.82 },
      { asset: GRASS_ASSETS.patchSoft02.key, x: 558, y: 850, alpha: 0.78, flipY: true },
      { asset: GRASS_ASSETS.patchSoft02.key, x: 1002, y: 850, alpha: 0.78, flipX: true },
      { asset: GRASS_ASSETS.patchSoft01.key, x: 1112, y: 774, alpha: 0.82 },
      { asset: GRASS_ASSETS.patchSoft02.key, x: 1522, y: 392, alpha: 0.78, flipX: true },
      { asset: GRASS_ASSETS.patchSoft01.key, x: 1540, y: 638, alpha: 0.82, flipY: true },
    ],
    clusters: createGrassClusters({
      bounds: grass,
      center,
      edgeSize: 128,
      seed: 9721,
      anchors: vegetationAnchors,
    }),
    decals: createGrassDecals({
      bounds: grass,
      center,
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

function isNearAnchor(anchors, x, y) {
  return anchors.some((anchor) => {
    const deltaX = anchor.x - x;
    const deltaY = anchor.y - y;
    return deltaX * deltaX + deltaY * deltaY < 110 * 110;
  });
}

function createGrassClusters({ bounds, center, edgeSize, seed, anchors = [] }) {
  const spacing = 88;
  const columns = Math.ceil(bounds.width / spacing);
  const rows = Math.ceil(bounds.height / spacing);
  const clusters = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cellX = bounds.x + column * spacing + spacing / 2;
      const cellY = bounds.y + row * spacing + spacing / 2;
      const edge = isNearEdge(bounds, edgeSize, cellX, cellY);
      const central = !edge && isWithin(center, cellX, cellY);
      const anchorBoost = isNearAnchor(anchors, cellX, cellY) ? 8 : 0;
      const frequency = Math.min(50, (edge ? 40 : central ? 2 : 20) + anchorBoost);
      const value = hashTile(column, row, seed + 8101);

      if (value % 100 >= frequency) continue;

      const variantValue = hashTile(column, row, seed + 9319);
      const variantBucket = variantValue % 100;
      const variant = variantBucket < 35 ? 0 : variantBucket < 70 ? 1 : 2;
      const width = CLUSTER_SIZES[variant];
      const jitterX = (hashTile(column, row, seed + 10301) % 37) - 18;
      const jitterY = (hashTile(column, row, seed + 11717) % 29) - 14;

      clusters.push({
        asset: GRASS_CLUSTER_KEYS[variant],
        x: clamp(cellX - width / 2 + jitterX, bounds.x, bounds.x + bounds.width - width),
        y: clamp(cellY - 16 + jitterY, bounds.y, bounds.y + bounds.height - 32),
        flipX: (variantValue & 1) === 1,
        flipY: (variantValue & 2) === 2,
      });
    }
  }

  return clusters;
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
      const frequency = edge ? 25 : central ? 6 : 14;
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
        alpha: edge ? 1 : central ? 0.9 : 0.96,
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
