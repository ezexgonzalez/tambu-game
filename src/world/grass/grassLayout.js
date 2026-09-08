import { TILE_SIZE } from '../../data/terrainTiles.js';
import { GRASS_ASSETS } from './preloadGrass.js';

export const GRASS_BASE_KEYS = [
  GRASS_ASSETS.base01.key,
  GRASS_ASSETS.base02.key,
  GRASS_ASSETS.base03.key,
  GRASS_ASSETS.base04.key,
];

export const GRASS_CALIBRATION_LAYOUT = {
  bounds: { x: 0, y: 0, width: 384, height: 256 },
  tileSize: TILE_SIZE,
  seed: 417,
  micro: [
    { asset: GRASS_ASSETS.micro01.key, x: 112, y: 52 },
    { asset: GRASS_ASSETS.micro03.key, x: 128, y: 52 },
    { asset: GRASS_ASSETS.micro02.key, x: 112, y: 68 },
    { asset: GRASS_ASSETS.micro04.key, x: 144, y: 68 },
    { asset: GRASS_ASSETS.micro02.key, x: 228, y: 168 },
    { asset: GRASS_ASSETS.micro04.key, x: 244, y: 168 },
    { asset: GRASS_ASSETS.micro01.key, x: 228, y: 184 },
    { asset: GRASS_ASSETS.micro03.key, x: 260, y: 184 },
  ],
  macro: [
    { asset: GRASS_ASSETS.macroSoft01.key, x: 16, y: 22, alpha: 0.88 },
    { asset: GRASS_ASSETS.macroSoft02.key, x: 282, y: 24, alpha: 0.84 },
    { asset: GRASS_ASSETS.macroDark01.key, x: 26, y: 176, alpha: 0.8 },
  ],
  clusters: [
    { asset: GRASS_ASSETS.cluster02.key, x: 8, y: 8 },
    { asset: GRASS_ASSETS.cluster04.key, x: 328, y: 10 },
    { asset: GRASS_ASSETS.cluster05.key, x: 12, y: 196 },
    { asset: GRASS_ASSETS.cluster07.key, x: 328, y: 198 },
    { asset: GRASS_ASSETS.cluster01.key, x: 270, y: 208 },
  ],
  accents: [
    { asset: GRASS_ASSETS.flowerWhite01.key, x: 42, y: 96 },
    { asset: GRASS_ASSETS.leaf02.key, x: 68, y: 184 },
    { asset: GRASS_ASSETS.flowerPink02.key, x: 336, y: 138 },
    { asset: GRASS_ASSETS.smallPlant01.key, x: 18, y: 214 },
    { asset: GRASS_ASSETS.leaf03.key, x: 340, y: 228 },
  ],
  tambuSpots: {
    quiet: { x: 192, y: 136 },
    dense: { x: 304, y: 210 },
  },
};

export function createPatioGrassLayout({ terrain }) {
  const { grass } = terrain;

  return {
    bounds: grass,
    tileSize: TILE_SIZE,
    seed: 9721,
    micro: [
      { asset: GRASS_ASSETS.micro01.key, x: 172, y: 326 },
      { asset: GRASS_ASSETS.micro03.key, x: 188, y: 326 },
      { asset: GRASS_ASSETS.micro02.key, x: 172, y: 342 },
      { asset: GRASS_ASSETS.micro04.key, x: 204, y: 342 },
      { asset: GRASS_ASSETS.micro02.key, x: 348, y: 754 },
      { asset: GRASS_ASSETS.micro04.key, x: 364, y: 754 },
      { asset: GRASS_ASSETS.micro01.key, x: 348, y: 770 },
      { asset: GRASS_ASSETS.micro03.key, x: 380, y: 770 },
      { asset: GRASS_ASSETS.micro04.key, x: 642, y: 842 },
      { asset: GRASS_ASSETS.micro01.key, x: 658, y: 842 },
      { asset: GRASS_ASSETS.micro03.key, x: 642, y: 858 },
      { asset: GRASS_ASSETS.micro02.key, x: 674, y: 858 },
      { asset: GRASS_ASSETS.micro03.key, x: 1172, y: 732 },
      { asset: GRASS_ASSETS.micro01.key, x: 1188, y: 732 },
      { asset: GRASS_ASSETS.micro04.key, x: 1172, y: 748 },
      { asset: GRASS_ASSETS.micro02.key, x: 1204, y: 748 },
      { asset: GRASS_ASSETS.micro02.key, x: 1448, y: 804 },
      { asset: GRASS_ASSETS.micro04.key, x: 1464, y: 804 },
      { asset: GRASS_ASSETS.micro01.key, x: 1448, y: 820 },
      { asset: GRASS_ASSETS.micro03.key, x: 1480, y: 820 },
    ],
    macro: [
      { asset: GRASS_ASSETS.macroSoft01.key, x: 80, y: 302, alpha: 0.86 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 300, y: 368, alpha: 0.82 },
      { asset: GRASS_ASSETS.macroDark01.key, x: 64, y: 684, alpha: 0.78 },
      { asset: GRASS_ASSETS.macroSoft01.key, x: 388, y: 856, alpha: 0.8 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 770, y: 330, alpha: 0.8 },
      { asset: GRASS_ASSETS.macroDark01.key, x: 920, y: 374, alpha: 0.78 },
      { asset: GRASS_ASSETS.macroSoft01.key, x: 1424, y: 382, alpha: 0.84 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 1490, y: 664, alpha: 0.82 },
      { asset: GRASS_ASSETS.macroDark01.key, x: 1300, y: 842, alpha: 0.8 },
      { asset: GRASS_ASSETS.macroSoft01.key, x: 950, y: 856, alpha: 0.78 },
    ],
    clusters: [
      { asset: GRASS_ASSETS.cluster01.key, x: 8, y: 288 },
      { asset: GRASS_ASSETS.cluster02.key, x: 16, y: 438 },
      { asset: GRASS_ASSETS.cluster03.key, x: 10, y: 754 },
      { asset: GRASS_ASSETS.cluster04.key, x: 118, y: 880 },
      { asset: GRASS_ASSETS.cluster05.key, x: 356, y: 888 },
      { asset: GRASS_ASSETS.cluster06.key, x: 738, y: 896 },
      { asset: GRASS_ASSETS.cluster07.key, x: 1048, y: 884 },
      { asset: GRASS_ASSETS.cluster08.key, x: 1552, y: 862 },
      { asset: GRASS_ASSETS.cluster01.key, x: 1612, y: 380 },
      { asset: GRASS_ASSETS.cluster04.key, x: 1614, y: 626 },
      { asset: GRASS_ASSETS.bushEdge01.key, x: 0, y: 848 },
      { asset: GRASS_ASSETS.bushEdge02.key, x: 1616, y: 790 },
    ],
    accents: [
      { asset: GRASS_ASSETS.flowerWhite01.key, x: 92, y: 706 },
      { asset: GRASS_ASSETS.flowerPink01.key, x: 210, y: 866 },
      { asset: GRASS_ASSETS.leaf01.key, x: 448, y: 820 },
      { asset: GRASS_ASSETS.smallPlant01.key, x: 18, y: 744 },
      { asset: GRASS_ASSETS.flowerWhite01.key, x: 1190, y: 862 },
      { asset: GRASS_ASSETS.flowerPink02.key, x: 1540, y: 704 },
      { asset: GRASS_ASSETS.leaf02.key, x: 1592, y: 542 },
      { asset: GRASS_ASSETS.smallPlant02.key, x: 1614, y: 678 },
      { asset: GRASS_ASSETS.leaf03.key, x: 1468, y: 844 },
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
  if (bucket < 38) return GRASS_BASE_KEYS[0];
  if (bucket < 67) return GRASS_BASE_KEYS[1];
  if (bucket < 87) return GRASS_BASE_KEYS[2];
  return GRASS_BASE_KEYS[3];
}
