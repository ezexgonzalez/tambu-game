import { GRASS_ASSETS } from './preloadGrass.js';

export const GRASS_BASE_KEYS = [
  GRASS_ASSETS.ground01.key,
  GRASS_ASSETS.ground02.key,
  GRASS_ASSETS.ground03.key,
];

function polygon(points) {
  return points.map(([x, y]) => ({ x, y }));
}

export const GRASS_CALIBRATION_LAYOUT = {
  bounds: { x: 0, y: 0, width: 384, height: 256 },
  base: [
    { asset: GRASS_ASSETS.ground01.key, points: polygon([[0, 0], [384, 0], [384, 256], [0, 256]]) },
    { asset: GRASS_ASSETS.ground02.key, points: polygon([[0, 0], [72, 0], [92, 60], [64, 122], [84, 196], [0, 220]]) },
    { asset: GRASS_ASSETS.ground03.key, points: polygon([[384, 172], [306, 192], [280, 256], [384, 256]]) },
  ],
  macro: [
    { asset: GRASS_ASSETS.macroSoft01.key, x: 6, y: 76, scale: 0.16 },
    { asset: GRASS_ASSETS.macroSoft02.key, x: 300, y: 8, scale: 0.13 },
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
    // Base 01 remains the calm, continuous surface. The two overlays deliberately live
    // at the sides and corners so the pool's playable centre stays visually quiet.
    base: [
      { asset: GRASS_ASSETS.ground01.key, points: polygon([[0, 150], [1680, 150], [1680, 960], [0, 960]]) },
      {
        asset: GRASS_ASSETS.ground02.key,
        points: polygon([[0, 150], [238, 150], [200, 252], [262, 350], [190, 450], [248, 540], [212, 620], [250, 720], [0, 720]]),
      },
      {
        asset: GRASS_ASSETS.ground02.key,
        points: polygon([[1680, 150], [1442, 150], [1478, 252], [1418, 350], [1490, 450], [1432, 540], [1468, 620], [1430, 720], [1680, 720]]),
      },
      { asset: GRASS_ASSETS.ground03.key, points: polygon([[0, 758], [176, 744], [308, 826], [274, 960], [0, 960]]) },
      { asset: GRASS_ASSETS.ground03.key, points: polygon([[1680, 740], [1510, 754], [1380, 852], [1430, 960], [1680, 960]]) },
      { asset: GRASS_ASSETS.ground03.key, points: polygon([[0, 150], [144, 150], [192, 222], [130, 286], [0, 270]]) },
    ],
    macro: [
      { asset: GRASS_ASSETS.macroSoft01.key, x: 44, y: 360, scale: 0.35 },
      { asset: GRASS_ASSETS.macroSoft02.key, x: 1294, y: 680, scale: 0.35 },
    ],
  };
}
