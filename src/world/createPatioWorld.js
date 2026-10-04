import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';
import { createGrass } from './grass/createGrass.js';
import { createPatioGrassLayout } from './grass/grassLayout.js';
import { preloadGrass } from './grass/preloadGrass.js';
import { createDeckSurface, preloadDeckSurface } from './deck/deckSurface.js';
import { createDjBooth, preloadDjBooth } from './dj/djBooth.js';
import { createBar, preloadBar } from './bar/barStructure.js';
import { createHouseFacade, preloadHouseFacade } from './house/houseFacade.js';
import { createPool, preloadPool } from './pool/poolStructure.js';
import { PATIO_LAYOUT } from './patioLayout.js';

export function preloadPatioWorld(scene) {
  preloadGrass(scene);
  preloadDeckSurface(scene);
  preloadDjBooth(scene);
  preloadBar(scene);
  preloadHouseFacade(scene);
  preloadPool(scene);
  scene.load.spritesheet('terrain', '/assets/tiles/terrain/terrain.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
  });
}

export function createPatioWorld(scene) {
  drawTerrain(scene);
  return drawArchitectureAndProps(scene);
}

function drawTerrain(scene) {
  const { terrain } = PATIO_LAYOUT;
  const { entry } = terrain;

  createGrass(scene, createPatioGrassLayout(PATIO_LAYOUT), { depth: -30 });
  createDeckSurface(scene, terrain);

  scene.add.tileSprite(entry.x, entry.y, entry.width, entry.height, 'terrain', TERRAIN_TILE.PATH_A)
    .setOrigin(0)
    .setDepth(-18);

  for (let y = entry.y + TILE_SIZE; y < entry.y + entry.height; y += 48) {
    scene.add.tileSprite(entry.x + TILE_SIZE, y, entry.width - TILE_SIZE * 2, TILE_SIZE, 'terrain', TERRAIN_TILE.PATH_B)
      .setOrigin(0)
      .setDepth(-17)
      .setAlpha(0.42);
  }

  scene.add.tileSprite(entry.x, entry.y, TILE_SIZE, entry.height, 'terrain', TERRAIN_TILE.PATH_EDGE_LEFT)
    .setOrigin(0)
    .setDepth(-16);
  scene.add.tileSprite(
    entry.x + entry.width - TILE_SIZE,
    entry.y,
    TILE_SIZE,
    entry.height,
    'terrain',
    TERRAIN_TILE.PATH_EDGE_RIGHT,
  ).setOrigin(0).setDepth(-16);

  createPool(scene, PATIO_LAYOUT.pool);
}
function drawArchitectureAndProps(scene) {
  const { bathroomDoor } = createHouseFacade(scene, PATIO_LAYOUT);
  createBar(scene, PATIO_LAYOUT.bar);
  createDjBooth(scene, PATIO_LAYOUT.dj);
  return { bathroomDoor };
}
