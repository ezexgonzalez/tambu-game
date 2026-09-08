import { TILE_SIZE } from '../../data/terrainTiles.js';
import { GRASS_ASSETS } from './preloadGrass.js';

export const GRASS_BASE_KEYS = [
  GRASS_ASSETS.base01.key,
  GRASS_ASSETS.base02.key,
  GRASS_ASSETS.base03.key,
];

export const GRASS_CALIBRATION_LAYOUT = {
  bounds: { x: 0, y: 0, width: 384, height: 256 },
  tileSize: TILE_SIZE,
  seed: 417,
  macro: [
    { asset: GRASS_ASSETS.macroDark01.key, x: 16, y: 22, alpha: 0.9 },
    { asset: GRASS_ASSETS.macroSoft01.key, x: 282, y: 24, alpha: 0.86 },
    { asset: GRASS_ASSETS.macroDark02.key, x: 26, y: 176, alpha: 0.88 },
  ],
  clusters: [
    { asset: GRASS_ASSETS.dense01.key, x: 8, y: 8 },
    { asset: GRASS_ASSETS.dense02.key, x: 50, y: 42 },
    { asset: GRASS_ASSETS.dense01.key, x: 322, y: 16 },
    { asset: GRASS_ASSETS.dense02.key, x: 344, y: 62 },
    { asset: GRASS_ASSETS.lively01.key, x: 18, y: 188 },
    { asset: GRASS_ASSETS.dense01.key, x: 288, y: 198 },
    { asset: GRASS_ASSETS.lively01.key, x: 340, y: 218 },
  ],
  worn: [
    { asset: GRASS_ASSETS.worn02.key, x: 136, y: 74 },
    { asset: GRASS_ASSETS.worn01.key, x: 236, y: 116 },
    { asset: GRASS_ASSETS.worn03.key, x: 132, y: 180 },
  ],
  accents: [
    { asset: GRASS_ASSETS.flowerWhite01.key, x: 46, y: 90 },
    { asset: GRASS_ASSETS.flowerPink01.key, x: 72, y: 160 },
    { asset: GRASS_ASSETS.leaf01.key, x: 34, y: 224 },
    { asset: GRASS_ASSETS.flowerWhite01.key, x: 310, y: 86 },
    { asset: GRASS_ASSETS.flowerPink01.key, x: 358, y: 174 },
    { asset: GRASS_ASSETS.leaf01.key, x: 304, y: 230 },
  ],
  tambuSpots: {
    quiet: { x: 192, y: 136 },
    dense: { x: 310, y: 210 },
  },
};

export function createPatioGrassLayout({ terrain, pool, bar, partyTables, cooler }) {
  const { grass, entry } = terrain;

  return {
    bounds: grass,
    tileSize: TILE_SIZE,
    seed: 9721,
    macro: [
      { asset: GRASS_ASSETS.macroDark01.key, x: 20, y: 302, alpha: 0.82 },
      { asset: GRASS_ASSETS.macroSoft01.key, x: 152, y: 760, alpha: 0.8 },
      { asset: GRASS_ASSETS.macroDark02.key, x: 1426, y: 376, alpha: 0.84 },
      { asset: GRASS_ASSETS.macroDark01.key, x: 1492, y: 742, alpha: 0.82 },
      { asset: GRASS_ASSETS.macroSoft01.key, x: 916, y: 836, alpha: 0.8 },
    ],
    clusters: [
      { asset: GRASS_ASSETS.dense01.key, x: 20, y: 298 },
      { asset: GRASS_ASSETS.dense02.key, x: 44, y: 442 },
      { asset: GRASS_ASSETS.lively01.key, x: 20, y: 804 },
      { asset: GRASS_ASSETS.dense01.key, x: 112, y: 900 },
      { asset: GRASS_ASSETS.dense02.key, x: 392, y: 892 },
      { asset: GRASS_ASSETS.lively01.key, x: 760, y: 904 },
      { asset: GRASS_ASSETS.dense02.key, x: 1110, y: 894 },
      { asset: GRASS_ASSETS.dense01.key, x: 1608, y: 392 },
      { asset: GRASS_ASSETS.lively01.key, x: 1620, y: 638 },
      { asset: GRASS_ASSETS.dense02.key, x: 1560, y: 872 },
      { asset: GRASS_ASSETS.dense01.key, x: bar.x + 12, y: bar.y + bar.height + 30 },
      { asset: GRASS_ASSETS.lively01.key, x: pool.x - 92, y: pool.y + pool.height + 86 },
    ],
    worn: [
      { asset: GRASS_ASSETS.worn01.key, x: pool.x - 54, y: pool.y + 80 },
      { asset: GRASS_ASSETS.worn02.key, x: pool.x - 68, y: pool.y + 192 },
      { asset: GRASS_ASSETS.worn03.key, x: pool.x + pool.width + 12, y: pool.y + 68 },
      { asset: GRASS_ASSETS.worn02.key, x: pool.x + pool.width + 22, y: pool.y + 210 },
      { asset: GRASS_ASSETS.worn01.key, x: bar.x - 38, y: bar.y + bar.height + 38 },
      { asset: GRASS_ASSETS.worn02.key, x: partyTables[0].x - 26, y: partyTables[0].y + 70 },
      { asset: GRASS_ASSETS.worn03.key, x: partyTables[1].x - 28, y: partyTables[1].y + 66 },
      { asset: GRASS_ASSETS.worn01.key, x: cooler.x - 14, y: cooler.y + cooler.height + 22 },
      { asset: GRASS_ASSETS.worn02.key, x: entry.x - 24, y: entry.y - 52 },
    ],
    accents: [
      { asset: GRASS_ASSETS.flowerWhite01.key, x: 92, y: 706 },
      { asset: GRASS_ASSETS.flowerPink01.key, x: 210, y: 866 },
      { asset: GRASS_ASSETS.leaf01.key, x: 448, y: 820 },
      { asset: GRASS_ASSETS.flowerWhite01.key, x: 1190, y: 862 },
      { asset: GRASS_ASSETS.flowerPink01.key, x: 1540, y: 704 },
      { asset: GRASS_ASSETS.leaf01.key, x: 1592, y: 542 },
    ],
  };
}

// Stable coordinate hash: assets are always arranged identically between loads.
function hashTile(x, y, seed) {
  let value = (x * 374761393 + y * 668265263 + seed * 1442695041) >>> 0;
  value = (value ^ (value >>> 13)) * 1274126177;
  return (value ^ (value >>> 16)) >>> 0;
}

export function getGrassBaseKey(tileX, tileY, seed = GRASS_CALIBRATION_LAYOUT.seed) {
  const bucket = hashTile(tileX, tileY, seed) % 100;
  if (bucket < 44) return GRASS_BASE_KEYS[0];
  if (bucket < 77) return GRASS_BASE_KEYS[1];
  return GRASS_BASE_KEYS[2];
}
