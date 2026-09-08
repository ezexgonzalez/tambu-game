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
    { asset: GRASS_ASSETS.macroDark01.key, x: 12, y: 20 },
    { asset: GRASS_ASSETS.macroSoft01.key, x: 132, y: 16 },
    { asset: GRASS_ASSETS.macroDark02.key, x: 274, y: 30 },
    { asset: GRASS_ASSETS.macroSoft01.key, x: 30, y: 154 },
    { asset: GRASS_ASSETS.macroDark01.key, x: 184, y: 164 },
    { asset: GRASS_ASSETS.macroDark02.key, x: 300, y: 174 },
  ],
  clusters: [
    { asset: GRASS_ASSETS.dense01.key, x: 8, y: 8 },
    { asset: GRASS_ASSETS.lively01.key, x: 30, y: 18 },
    { asset: GRASS_ASSETS.dense02.key, x: 50, y: 42 },
    { asset: GRASS_ASSETS.lively01.key, x: 94, y: 14 },
    { asset: GRASS_ASSETS.dense01.key, x: 130, y: 28 },
    { asset: GRASS_ASSETS.dense01.key, x: 322, y: 16 },
    { asset: GRASS_ASSETS.dense02.key, x: 348, y: 56 },
    { asset: GRASS_ASSETS.lively01.key, x: 304, y: 92 },
    { asset: GRASS_ASSETS.dense02.key, x: 350, y: 118 },
    { asset: GRASS_ASSETS.lively01.key, x: 18, y: 188 },
    { asset: GRASS_ASSETS.dense02.key, x: 56, y: 214 },
    { asset: GRASS_ASSETS.dense01.key, x: 88, y: 198 },
    { asset: GRASS_ASSETS.dense01.key, x: 288, y: 198 },
    { asset: GRASS_ASSETS.lively01.key, x: 338, y: 216 },
    { asset: GRASS_ASSETS.dense01.key, x: 232, y: 222 },
    { asset: GRASS_ASSETS.dense02.key, x: 188, y: 226 },
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
