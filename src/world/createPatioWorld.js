import Phaser from 'phaser';
import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';
import { PATIO_LAYOUT } from './patioLayout.js';

export function preloadPatioWorld(scene) {
  scene.load.spritesheet('terrain', '/assets/tiles/terrain/terrain.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
  });
}

export function createPatioWorld(scene) {
  drawTerrain(scene);
  drawArchitectureAndProps(scene);
}

function drawTerrain(scene) {
  const { world, terrain } = PATIO_LAYOUT;
  const { grass, grassDetails, deck, deckEdge, deckDetails, entry } = terrain;

  scene.add.tileSprite(grass.x, grass.y, grass.width, grass.height, 'terrain', TERRAIN_TILE.GRASS_BASE)
    .setOrigin(0)
    .setDepth(-30);

  drawGrassTexture(scene);

  const grassVariants = [
    TERRAIN_TILE.GRASS_A,
    TERRAIN_TILE.GRASS_B,
    TERRAIN_TILE.GRASS_WORN,
    TERRAIN_TILE.GRASS_DARK,
    TERRAIN_TILE.GRASS_LEAF,
  ];

  for (let y = grassDetails.startY; y < world.height; y += grassDetails.stepY) {
    for (let x = grassDetails.startX; x < world.width; x += grassDetails.stepX) {
      const seed = ((x / TILE_SIZE) * 3 + (y / TILE_SIZE) * 7) % 11;
      if (seed < 6) {
        const frame = grassVariants[seed % grassVariants.length];
        scene.add.image(x + (seed % 3) * 8, y + (seed % 2) * 8, 'terrain', frame)
          .setOrigin(0)
          .setDepth(-28)
          .setAlpha(seed === 2 ? 0.78 : 1);
      }
    }
  }

  scene.add.tileSprite(deck.x, deck.y, deck.width, deck.height, 'terrain', TERRAIN_TILE.DECK_A)
    .setOrigin(0)
    .setDepth(-24);

  scene.add.tileSprite(deckEdge.x, deckEdge.y, deckEdge.width, deckEdge.height, 'terrain', TERRAIN_TILE.DECK_EDGE_BOTTOM)
    .setOrigin(0)
    .setDepth(-23);

  for (let x = deckDetails.startX; x < world.width; x += deckDetails.stepX) {
    scene.add.tileSprite(x, deckDetails.y, deckDetails.width, deckDetails.height, 'terrain', TERRAIN_TILE.DECK_B)
      .setOrigin(0)
      .setDepth(-22)
      .setAlpha(0.34);
  }

  drawDeckSurface(scene);

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

  drawPixelPool(scene);
}

function drawGrassTexture(scene) {
  const { grass, grassPatches, flowerClusters } = PATIO_LAYOUT.terrain;
  const texture = scene.add.graphics().setDepth(-29);

  grassPatches.forEach((patch) => {
    texture.fillStyle(patch.color, patch.alpha);
    texture.fillEllipse(patch.x + patch.width / 2, patch.y + patch.height / 2, patch.width, patch.height);
  });

  texture.fillStyle(0x061b14, 0.2);
  texture.fillRect(grass.x, grass.y, 18, grass.height);
  texture.fillRect(grass.x + grass.width - 18, grass.y, 18, grass.height);
  texture.fillRect(grass.x, grass.y + grass.height - 22, grass.width, 22);

  for (let y = grass.y + 132; y < grass.y + grass.height - 18; y += 31) {
    for (let x = grass.x + 22; x < grass.x + grass.width - 18; x += 43) {
      const seed = (x * 7 + y * 11) % 17;
      if (seed > 10) continue;
      const color = seed % 3 === 0 ? 0x4d8749 : (seed % 3 === 1 ? 0x225a35 : 0x76a04f);
      texture.fillStyle(color, seed % 4 === 0 ? 0.48 : 0.3);
      texture.fillRect(x + (seed % 5), y + (seed % 3), 2, seed % 2 === 0 ? 5 : 3);
      if (seed % 4 === 0) texture.fillRect(x - 2, y + 3, 2, 2);
    }
  }

  flowerClusters.forEach(({ x, y, color }, clusterIndex) => {
    const offsets = [[0, 0], [6, -4], [-5, 5], [10, 6]];
    offsets.slice(0, 2 + (clusterIndex % 3)).forEach(([offsetX, offsetY], flowerIndex) => {
      texture.fillStyle(0x214a2e, 0.9);
      texture.fillRect(x + offsetX, y + offsetY + 2, 2, 5);
      texture.fillStyle(flowerIndex % 2 === 0 ? color : 0xf3e09a, 0.9);
      texture.fillRect(x + offsetX - 2, y + offsetY, 2, 2);
      texture.fillRect(x + offsetX + 2, y + offsetY, 2, 2);
      texture.fillRect(x + offsetX, y + offsetY - 2, 2, 2);
    });
  });
}

function drawDeckSurface(scene) {
  const { deck, deckLights } = PATIO_LAYOUT.terrain;
  const planks = scene.add.graphics().setDepth(-21);

  planks.fillStyle(0x1d1010, 0.18);
  planks.fillRect(deck.x, deck.y, deck.width, 5);
  planks.fillRect(deck.x, deck.y + deck.height - 18, deck.width, 18);

  for (let y = deck.y + 8; y < deck.y + 104; y += 16) {
    planks.lineStyle(2, 0x2a1716, 0.36);
    planks.lineBetween(deck.x, y, deck.x + deck.width, y);
    planks.lineStyle(1, 0xc8925e, 0.18);
    planks.lineBetween(deck.x, y + 2, deck.x + deck.width, y + 2);

    const row = Math.floor((y - deck.y) / 16);
    for (let x = 28 + (row % 2) * 48; x < deck.width; x += 96) {
      planks.fillStyle(0x281617, 0.34);
      planks.fillRect(x, y - 7, 2, 7);
      planks.fillStyle(0xd19b68, 0.14);
      planks.fillRect(x + 18, y - 10, 24, 2);
    }
  }

  deckLights.forEach((x) => {
    planks.fillStyle(0xffc968, 0.08);
    planks.fillCircle(x, deck.y + deck.height - 11, 19);
    planks.fillStyle(0xffd981, 0.18);
    planks.fillCircle(x, deck.y + deck.height - 11, 10);
    planks.fillStyle(0xffe2a0, 1);
    planks.fillRect(x - 5, deck.y + deck.height - 13, 10, 4);
    planks.fillStyle(0x9c6333, 1);
    planks.fillRect(x - 6, deck.y + deck.height - 9, 12, 2);
  });
}

function drawPixelPool(scene) {
  const { x, y, width, height, internalLights } = PATIO_LAYOUT.pool;
  const innerX = x + TILE_SIZE;
  const innerY = y + TILE_SIZE;
  const innerWidth = width - TILE_SIZE * 2;
  const innerHeight = height - TILE_SIZE * 2;

  scene.add.rectangle(x + width / 2 + 8, y + height / 2 + 12, width + 14, height + 14, 0x061018, 0.34)
    .setDepth(-14);

  scene.add.tileSprite(innerX, innerY, innerWidth, innerHeight, 'terrain', TERRAIN_TILE.WATER_A)
    .setOrigin(0)
    .setDepth(-12);

  for (let rowY = innerY + 32; rowY < innerY + innerHeight - 16; rowY += 64) {
    scene.add.tileSprite(innerX + 16, rowY, innerWidth - 32, 16, 'terrain', TERRAIN_TILE.WATER_B)
      .setOrigin(0)
      .setDepth(-11)
      .setAlpha(0.45);
  }

  for (let rowY = innerY + 8; rowY < innerY + innerHeight - 12; rowY += 48) {
    scene.add.tileSprite(innerX + 8, rowY, innerWidth - 16, 16, 'terrain', TERRAIN_TILE.WATER_C)
      .setOrigin(0)
      .setDepth(-11)
      .setAlpha(0.2);
  }

  const glints = scene.add.tileSprite(
    innerX,
    innerY,
    innerWidth,
    innerHeight,
    'terrain',
    TERRAIN_TILE.WATER_GLINT,
  ).setOrigin(0).setDepth(-10).setAlpha(0.23);

  scene.tweens.add({
    targets: glints,
    tilePositionX: TILE_SIZE,
    duration: 2100,
    ease: 'Linear',
    repeat: -1,
  });

  drawPoolWaterTexture(scene, { x, y, width, height, innerX, innerY, innerWidth, innerHeight, internalLights });

  scene.add.tileSprite(x + TILE_SIZE, y, width - TILE_SIZE * 2, TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_EDGE_TOP)
    .setOrigin(0)
    .setDepth(-8);
  scene.add.tileSprite(
    x + TILE_SIZE,
    y + height - TILE_SIZE,
    width - TILE_SIZE * 2,
    TILE_SIZE,
    'terrain',
    TERRAIN_TILE.POOL_EDGE_BOTTOM,
  ).setOrigin(0).setDepth(-8);
  scene.add.tileSprite(x, y + TILE_SIZE, TILE_SIZE, height - TILE_SIZE * 2, 'terrain', TERRAIN_TILE.POOL_EDGE_LEFT)
    .setOrigin(0)
    .setDepth(-8);
  scene.add.tileSprite(
    x + width - TILE_SIZE,
    y + TILE_SIZE,
    TILE_SIZE,
    height - TILE_SIZE * 2,
    'terrain',
    TERRAIN_TILE.POOL_EDGE_RIGHT,
  ).setOrigin(0).setDepth(-8);

  scene.add.image(x, y, 'terrain', TERRAIN_TILE.POOL_CORNER_TL).setOrigin(0).setDepth(-7);
  scene.add.image(x + width - TILE_SIZE, y, 'terrain', TERRAIN_TILE.POOL_CORNER_TR).setOrigin(0).setDepth(-7);
  scene.add.image(x, y + height - TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_CORNER_BL).setOrigin(0).setDepth(-7);
  scene.add.image(x + width - TILE_SIZE, y + height - TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_CORNER_BR)
    .setOrigin(0)
    .setDepth(-7);

  drawPoolCoping(scene, { x, y, width, height });

  const graphics = scene.add.graphics().setDepth(-5);
  graphics.lineStyle(3, 0xe7eef1, 1);
  graphics.lineBetween(x + width - 53, y + 29, x + width - 53, y + 79);
  graphics.lineBetween(x + width - 33, y + 29, x + width - 33, y + 79);
  graphics.lineBetween(x + width - 53, y + 43, x + width - 33, y + 43);
  graphics.lineBetween(x + width - 53, y + 61, x + width - 33, y + 61);
  graphics.lineStyle(1, 0x7d9aa7, 0.8);
  graphics.lineBetween(x + width - 50, y + 31, x + width - 50, y + 77);
  graphics.lineBetween(x + width - 30, y + 31, x + width - 30, y + 77);

  graphics.fillStyle(0x9a6a2e, 0.45);
  graphics.fillCircle(x + 151, y + 132, 24);
  graphics.fillStyle(0xf4c95e, 1);
  graphics.fillCircle(x + 148, y + 128, 22);
  graphics.fillStyle(0xffdd79, 1);
  graphics.fillCircle(x + 143, y + 123, 15);
  graphics.fillStyle(0x1889a9, 1);
  graphics.fillCircle(x + 148, y + 128, 10);
  graphics.fillStyle(0x86d8dc, 0.7);
  graphics.fillRect(x + 134, y + 115, 8, 3);
}

function drawPoolWaterTexture(scene, pool) {
  const water = scene.add.graphics().setDepth(-9);

  water.fillStyle(0x39d4e6, 0.07);
  water.fillRect(pool.innerX, pool.innerY, pool.innerWidth, pool.innerHeight);

  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 18; column += 1) {
      const cellX = pool.innerX + 8 + column * 34 + (row % 2) * 11;
      const cellY = pool.innerY + 10 + row * 29;
      const seed = (row * 19 + column * 7) % 13;
      const length = 8 + (seed % 4) * 3;

      water.lineStyle(1, seed % 3 === 0 ? 0xb2f4f1 : 0x6bcedd, seed % 4 === 0 ? 0.5 : 0.3);
      water.lineBetween(cellX, cellY, cellX + length, cellY - 3 + (seed % 3) * 3);
      if (seed % 2 === 0) {
        water.lineBetween(cellX + length, cellY - 3 + (seed % 3) * 3, cellX + length + 5, cellY + 4);
      }
    }
  }

  const lights = scene.add.graphics().setDepth(-6);
  pool.internalLights.forEach((position) => {
    const lightX = pool.innerX + pool.innerWidth * position;
    const lightY = pool.innerY + 14;
    lights.fillStyle(0x8df8f0, 0.05);
    lights.fillEllipse(lightX, lightY + 20, 86, 54);
    lights.fillStyle(0xa8fff4, 0.13);
    lights.fillEllipse(lightX, lightY + 10, 48, 28);
    lights.fillStyle(0xd6fff6, 0.92);
    lights.fillRect(lightX - 10, lightY - 2, 20, 4);
    lights.fillStyle(0xffffff, 0.78);
    lights.fillRect(lightX - 5, lightY - 3, 10, 2);
  });
}

function drawPoolCoping(scene, { x, y, width, height }) {
  const coping = scene.add.graphics().setDepth(-6);

  coping.lineStyle(2, 0xf0e7d8, 0.72);
  coping.lineBetween(x + 5, y + 4, x + width - 5, y + 4);
  coping.lineBetween(x + 5, y + height - 4, x + width - 5, y + height - 4);
  coping.lineStyle(2, 0x72737a, 0.55);
  coping.lineBetween(x + 5, y + 13, x + width - 5, y + 13);
  coping.lineBetween(x + 5, y + height - 13, x + width - 5, y + height - 13);

  for (let offset = TILE_SIZE; offset < width; offset += 48) {
    coping.lineStyle(1, 0x756f6b, 0.58);
    coping.lineBetween(x + offset, y, x + offset, y + TILE_SIZE);
    coping.lineBetween(x + offset, y + height - TILE_SIZE, x + offset, y + height);
  }
  for (let offset = TILE_SIZE; offset < height; offset += 48) {
    coping.lineBetween(x, y + offset, x + TILE_SIZE, y + offset);
    coping.lineBetween(x + width - TILE_SIZE, y + offset, x + width, y + offset);
  }
}

function drawArchitectureAndProps(scene) {
  const graphics = scene.add.graphics();

  drawHouse(scene, graphics);
  drawBar(scene, graphics);
  drawDj(scene, graphics);

  PATIO_LAYOUT.partyTables.forEach(({ x, y }) => drawPartyTable(graphics, x, y));
  drawCooler(graphics);
  drawPlants(graphics);
  drawEdgeGardens(graphics);
  drawPatioLanterns(graphics);
  drawGarlands(graphics);
  drawClutter(graphics);
}

function drawHouse(scene, graphics) {
  const { house } = PATIO_LAYOUT;

  graphics.fillStyle(0xbcb6b2, 1);
  graphics.fillRect(house.x, house.y, house.width, house.height);
  graphics.fillStyle(0xd8d1ca, 1);
  graphics.fillRect(house.x, house.y + 18, house.width, 104);
  graphics.fillStyle(0xeee7dc, 1);
  graphics.fillRect(house.x, house.y, house.width, house.topBandHeight);
  graphics.fillStyle(0xa69e97, 1);
  graphics.fillRect(house.x, house.middleBand.y, house.width, house.middleBand.height);
  graphics.fillStyle(0x615c5c, 1);
  graphics.fillRect(house.x, house.bottomBand.y, house.width, house.bottomBand.height);
  graphics.fillStyle(0x12151d, 0.3);
  graphics.fillRect(house.x, house.height - 3, house.width, 12);

  for (let x = 18; x < house.width; x += 58) {
    const seed = (x * 5) % 17;
    graphics.fillStyle(seed % 2 === 0 ? 0xffffff : 0x776f6d, seed % 2 === 0 ? 0.11 : 0.08);
    graphics.fillRect(x, 23 + (seed % 9) * 10, 2 + (seed % 4), 2);
  }

  house.verticalCuts.forEach((x) => {
    graphics.fillStyle(0x817a78, 0.3);
    graphics.fillRect(x - 4, 18, 6, 104);
    graphics.fillStyle(0xf4eee5, 0.48);
    graphics.fillRect(x - 3, 18, 4, 102);
  });

  house.windows.forEach((window, index) => drawWindow(graphics, window, index));

  drawSecondaryDoor(graphics, house.secondaryDoor);
  drawBathroom(scene, graphics, house.bathroom);
  house.lamps.forEach((lamp) => drawWallLamp(graphics, lamp));
  drawWallPlanters(graphics);
}

function drawWindow(graphics, window, index) {
  const { x, y, width, height, warm, silhouettes } = window;
  const glow = warm ? 0xffca69 : 0x718dff;
  const glass = warm ? 0xc88b47 : 0x29345e;
  const glassShade = warm ? 0x72523b : 0x1a2348;

  graphics.fillStyle(glow, warm ? 0.06 : 0.035);
  graphics.fillRect(x - 12, y - 10, width + 24, height + 26);
  graphics.fillStyle(0x37343b, 1);
  graphics.fillRect(x - 5, y - 5, width + 10, height + 12);
  graphics.fillStyle(0x171a27, 1);
  graphics.fillRect(x, y, width, height);
  graphics.fillStyle(glass, 0.96);
  graphics.fillRect(x + 7, y + 7, width - 14, height - 14);
  graphics.fillStyle(glassShade, 0.55);
  graphics.fillRect(x + width / 2 + 3, y + 7, width / 2 - 10, height - 14);

  if (warm) {
    graphics.fillStyle(0xffe3a1, 0.2);
    graphics.fillRect(x + 12, y + 9, 10, height - 20);
    graphics.fillRect(x + width / 2 + 12, y + 9, 6, height - 20);
  } else {
    graphics.fillStyle(0x8fa8ff, 0.1);
    graphics.fillRect(x + 10, y + 8, 8, height - 18);
  }

  for (let silhouette = 0; silhouette < silhouettes; silhouette += 1) {
    const silhouetteX = x + 28 + silhouette * 34 + (index % 2) * 5;
    graphics.fillStyle(0x171822, warm ? 0.7 : 0.5);
    graphics.fillCircle(silhouetteX, y + 28, 6);
    graphics.fillRect(silhouetteX - 7, y + 34, 14, 13);
  }

  graphics.lineStyle(3, 0x10121a, 1);
  graphics.lineBetween(x + Math.floor(width / 2), y, x + Math.floor(width / 2), y + height);
  graphics.lineStyle(2, 0x6f6764, 0.8);
  graphics.lineBetween(x, y + height, x + width, y + height);
  graphics.fillStyle(0xf2e8dc, 0.38);
  graphics.fillRect(x + 4, y + 3, width - 8, 2);
}

function drawSecondaryDoor(graphics, door) {
  graphics.fillStyle(0x3b3538, 1);
  graphics.fillRect(door.x, door.y, door.width, door.height);
  graphics.fillStyle(0x211d22, 1);
  graphics.fillRect(door.x + 8, door.y + 8, 56, 88);
  graphics.fillStyle(0x6c4b3b, 1);
  graphics.fillRect(door.x + 22, door.y + 18, 28, 24);
  graphics.fillStyle(0x9b6a45, 0.5);
  graphics.fillRect(door.x + 25, door.y + 21, 22, 18);
  graphics.lineStyle(2, 0x4e3831, 1);
  graphics.strokeRect(door.x + 15, door.y + 52, 42, 32);
  graphics.fillStyle(0xd9c37d, 1);
  graphics.fillCircle(door.x + 54, door.y + 60, 3);
  graphics.fillStyle(0xffd57a, 0.08);
  graphics.fillCircle(door.x + 54, door.y + 60, 12);
}

function drawBathroom(scene, graphics, bathroom) {
  graphics.fillStyle(0x514c50, 1);
  graphics.fillRect(bathroom.x, bathroom.y, bathroom.width, bathroom.height);
  graphics.fillStyle(0x302d32, 1);
  graphics.fillRect(bathroom.x + 12, bathroom.y + 12, 86, 98);
  graphics.fillStyle(0x141923, 1);
  graphics.fillRect(bathroom.x + 27, bathroom.y + 20, 56, 20);
  graphics.fillStyle(0x8dd8d0, 0.08);
  graphics.fillRect(bathroom.x + 30, bathroom.y + 23, 50, 14);
  scene.add.text(bathroom.x + 55, bathroom.y + 30, 'BAÑO', {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#cfd7dc',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  graphics.fillStyle(0xe8e2d4, 1);
  graphics.fillCircle(bathroom.x + 42, bathroom.y + 56, 4);
  graphics.fillRect(bathroom.x + 38, bathroom.y + 62, 8, 13);
  graphics.fillCircle(bathroom.x + 68, bathroom.y + 56, 4);
  graphics.fillRect(bathroom.x + 64, bathroom.y + 62, 8, 13);
  graphics.fillStyle(0xd9c37d, 1);
  graphics.fillCircle(bathroom.x + 88, bathroom.y + 68, 3);
  graphics.fillStyle(0xa79c91, 1);
  graphics.fillRect(bathroom.x + 4, bathroom.y + 2, 106, 3);
  graphics.lineStyle(2, 0x18161a, 0.7);
  graphics.strokeRect(bathroom.x + 17, bathroom.y + 82, 76, 23);
}

function drawWallLamp(graphics, { x, y }) {
  graphics.fillStyle(0xffcf67, 0.035);
  graphics.fillCircle(x + 7, y + 14, 32);
  graphics.fillStyle(0xffd87c, 0.075);
  graphics.fillCircle(x + 7, y + 14, 23);
  graphics.fillStyle(0x4b484d, 1);
  graphics.fillRect(x, y, 14, 28);
  graphics.fillStyle(0xffdf8a, 1);
  graphics.fillRect(x + 3, y + 4, 8, 16);
  graphics.fillStyle(0xfff1bd, 0.9);
  graphics.fillRect(x + 5, y + 6, 3, 12);
  graphics.fillStyle(0x232229, 1);
  graphics.fillRect(x - 2, y - 2, 18, 3);
  graphics.fillRect(x - 2, y + 26, 18, 3);
}

function drawWallPlanters(graphics) {
  PATIO_LAYOUT.wallPlanters.forEach(({ x, y, width }, planterIndex) => {
    graphics.fillStyle(0x161920, 0.28);
    graphics.fillRect(x + 3, y + 6, width, 19);
    graphics.fillStyle(0x4b505d, 1);
    graphics.fillRect(x, y, width, 17);
    graphics.fillStyle(0x747a87, 1);
    graphics.fillRect(x - 3, y - 2, width + 6, 5);
    graphics.fillStyle(0x252a33, 1);
    graphics.fillRect(x + 5, y + 12, width - 10, 5);

    for (let leaf = 0; leaf < Math.floor(width / 12); leaf += 1) {
      const leafX = x + 7 + leaf * 12;
      const leafY = y - 4 - ((leaf + planterIndex) % 3) * 3;
      graphics.fillStyle((leaf + planterIndex) % 2 === 0 ? 0x2f7044 : 0x438553, 1);
      graphics.fillCircle(leafX, leafY, 6);
      graphics.fillStyle(0x77a75e, 0.55);
      graphics.fillRect(leafX - 1, leafY - 5, 2, 6);
      if ((leaf + planterIndex) % 4 === 0) {
        graphics.fillStyle(0xe9a65f, 1);
        graphics.fillRect(leafX - 2, leafY - 6, 3, 3);
      }
    }
  });
}

function drawBar(scene, graphics) {
  const { bar } = PATIO_LAYOUT;
  const { body, counter, inset, label, bottles } = bar;

  graphics.fillStyle(0x090b12, 0.34);
  graphics.fillRect(bar.x + 6, bar.y + 9, bar.width + 7, bar.height + 4);
  graphics.fillStyle(0x241525, 1);
  graphics.fillRect(bar.x + body.offsetX, bar.y + body.offsetY, body.width, body.height);
  graphics.fillStyle(0x49304b, 1);
  graphics.fillRect(bar.x + body.offsetX, bar.y + body.offsetY, body.width, 43);
  graphics.fillStyle(0xa73984, 0.35);
  graphics.fillRect(bar.x + body.offsetX + 4, bar.y + body.offsetY + 38, body.width - 8, 3);
  graphics.fillStyle(0xff5ad4, 0.08);
  graphics.fillRect(bar.x + body.offsetX + 12, bar.y + body.offsetY + 35, body.width - 24, 10);

  graphics.fillStyle(0x15121c, 1);
  graphics.fillRect(bar.x + inset.offsetX, bar.y + inset.offsetY + 21, inset.width, inset.height + 36);
  graphics.fillStyle(0x72516b, 0.7);
  graphics.fillRect(bar.x + inset.offsetX, bar.y + inset.offsetY + 50, inset.width, 3);
  graphics.fillRect(bar.x + inset.offsetX, bar.y + inset.offsetY + 79, inset.width, 3);

  graphics.fillStyle(0x63405b, 1);
  graphics.fillRect(bar.x + 10, bar.y + 42, 10, 92);
  graphics.fillRect(bar.x + bar.width - 20, bar.y + 42, 10, 92);
  graphics.fillStyle(0xb27691, 0.45);
  graphics.fillRect(bar.x + 13, bar.y + 45, 2, 83);
  graphics.fillRect(bar.x + bar.width - 17, bar.y + 45, 2, 83);

  drawBarLamp(graphics, bar.x + 27, bar.y + 57);
  drawBarLamp(graphics, bar.x + bar.width - 27, bar.y + 57);

  const barLabel = scene.add.text(bar.x + label.offsetX, bar.y + label.offsetY, 'BARRA', {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#ffb8ee',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  barLabel.setShadow(0, 0, '#ff45cd', 7, true, true);

  graphics.lineStyle(2, 0xffa6e4, 0.9);
  graphics.lineBetween(bar.x + 251, bar.y + 9, bar.x + 267, bar.y + 9);
  graphics.lineBetween(bar.x + 254, bar.y + 9, bar.x + 260, bar.y + 18);
  graphics.lineBetween(bar.x + 264, bar.y + 9, bar.x + 260, bar.y + 18);
  graphics.lineBetween(bar.x + 260, bar.y + 18, bar.x + 260, bar.y + 25);
  graphics.lineBetween(bar.x + 255, bar.y + 25, bar.x + 265, bar.y + 25);

  const bottleColors = [0x7ccf8d, 0xf0bd5f, 0x91a9ff, 0xd96868, 0xc38ed8];
  for (let i = 0; i < bottles.count; i += 1) {
    const x = bar.x + bottles.offsetX + (i % bottles.columns) * bottles.columnGap;
    const y = bar.y + bottles.offsetY + Math.floor(i / bottles.columns) * bottles.rowGap;
    graphics.fillStyle(0x090b12, 0.75);
    graphics.fillRect(x - 2, y - 6, bottles.width + 4, bottles.height + 8);
    graphics.fillStyle(bottleColors[i % bottleColors.length], 1);
    graphics.fillRect(x, y, bottles.width, bottles.height);
    graphics.fillRect(x + 3, y - 5, 2, 6);
    graphics.fillStyle(0xf5f1df, 0.82);
    graphics.fillRect(x + 2, y + 6, bottles.width - 4, 4);
    graphics.fillStyle(0xffffff, 0.42);
    graphics.fillRect(x + 1, y + 2, 2, 7);
    graphics.fillStyle(0x31222e, 1);
    graphics.fillRect(x + 2, y - 7, 4, 2);
  }

  graphics.fillStyle(0x9a637e, 1);
  graphics.fillRect(bar.x + counter.offsetX, bar.y + counter.offsetY, counter.width, counter.height);
  graphics.fillStyle(0xd59ab3, 0.65);
  graphics.fillRect(bar.x + counter.offsetX, bar.y + counter.offsetY, counter.width, 4);
  graphics.fillStyle(0x33202f, 1);
  graphics.fillRect(bar.x + counter.offsetX + 8, bar.y + counter.offsetY + 20, counter.width - 16, 8);
  graphics.fillStyle(0xff4fc5, 0.2);
  graphics.fillRect(bar.x + counter.offsetX + 14, bar.y + counter.offsetY + 25, counter.width - 28, 3);
}

function drawBarLamp(graphics, x, y) {
  graphics.fillStyle(0xffba57, 0.055);
  graphics.fillCircle(x, y, 22);
  graphics.fillStyle(0xffca67, 0.13);
  graphics.fillCircle(x, y, 13);
  graphics.fillStyle(0x3d2832, 1);
  graphics.fillRect(x - 2, y - 17, 4, 11);
  graphics.fillStyle(0xffd778, 1);
  graphics.fillRect(x - 4, y - 7, 8, 12);
  graphics.fillStyle(0xfff0b2, 1);
  graphics.fillRect(x - 1, y - 5, 3, 8);
}

function drawDj(scene, graphics) {
  const { dj } = PATIO_LAYOUT;
  const { booth, counter, label } = dj;

  graphics.fillStyle(0x080a12, 0.4);
  graphics.fillRect(dj.x + 8, dj.y + 9, dj.width + 5, dj.height + 5);
  graphics.fillStyle(0x171525, 1);
  graphics.fillRect(dj.x + booth.offsetX, dj.y + booth.offsetY, booth.width, booth.height);
  graphics.fillStyle(0x0b0d19, 1);
  graphics.fillRect(dj.x + booth.offsetX + 8, dj.y + booth.offsetY + 18, booth.width - 16, 71);

  graphics.fillStyle(0x45415f, 1);
  graphics.fillRect(dj.x + booth.offsetX, dj.y + booth.offsetY, booth.width, 8);
  graphics.fillRect(dj.x + booth.offsetX, dj.y + booth.offsetY, 8, 89);
  graphics.fillRect(dj.x + booth.offsetX + booth.width - 8, dj.y + booth.offsetY, 8, 89);
  graphics.lineStyle(2, 0x7a75a0, 0.7);
  for (let x = dj.x + booth.offsetX + 10; x < dj.x + booth.offsetX + booth.width - 10; x += 24) {
    graphics.lineBetween(x, dj.y + booth.offsetY + 2, x + 12, dj.y + booth.offsetY + 7);
    graphics.lineBetween(x + 12, dj.y + booth.offsetY + 2, x, dj.y + booth.offsetY + 7);
  }

  graphics.fillStyle(0x7b45ff, 0.05);
  graphics.fillTriangle(dj.x + 75, dj.y + 30, dj.x + 26, dj.y + 99, dj.x + 131, dj.y + 99);
  graphics.fillStyle(0x4aa9ff, 0.05);
  graphics.fillTriangle(dj.x + 245, dj.y + 30, dj.x + 190, dj.y + 99, dj.x + 296, dj.y + 99);
  drawDjLight(graphics, dj.x + 74, dj.y + 25, 0xa45bff);
  drawDjLight(graphics, dj.x + 246, dj.y + 25, 0x61bcff);

  graphics.fillStyle(0x5a5475, 1);
  graphics.fillRect(dj.x + counter.offsetX, dj.y + counter.offsetY - 10, counter.width, counter.height + 10);
  graphics.fillStyle(0x8f7bc2, 0.55);
  graphics.fillRect(dj.x + counter.offsetX, dj.y + counter.offsetY - 10, counter.width, 4);
  graphics.fillStyle(0x232036, 1);
  graphics.fillRect(dj.x + counter.offsetX + 8, dj.y + counter.offsetY - 4, counter.width - 16, 20);

  for (let deck = 0; deck < 3; deck += 1) {
    const deckX = dj.x + counter.offsetX + 20 + deck * 68;
    graphics.fillStyle(0x0d101b, 1);
    graphics.fillRect(deckX, dj.y + counter.offsetY, 48, 11);
    graphics.fillStyle(deck === 1 ? 0xd66bd1 : 0x679ee8, 0.9);
    graphics.fillRect(deckX + 5, dj.y + counter.offsetY + 3, 8, 3);
    graphics.fillRect(deckX + 33, dj.y + counter.offsetY + 3, 8, 3);
  }

  graphics.fillStyle(0x2b263e, 1);
  graphics.fillRect(dj.x + booth.offsetX, dj.y + booth.offsetY + 89, booth.width, 33);
  graphics.fillStyle(0x594d77, 0.65);
  for (let x = dj.x + booth.offsetX + 12; x < dj.x + booth.offsetX + booth.width - 8; x += 34) {
    graphics.fillRect(x, dj.y + booth.offsetY + 96, 22, 3);
  }

  const djLabel = scene.add.text(dj.x + label.offsetX, dj.y + label.offsetY + 81, 'DJ', {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#e7dcff',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  djLabel.setShadow(0, 0, '#8d65ff', 5, true, true);

  dj.speakers.forEach(({ x, y, width, height }) => {
    graphics.fillStyle(0x080910, 0.35);
    graphics.fillRect(x + 4, y + 6, width, height);
    graphics.fillStyle(0x151722, 1);
    graphics.fillRect(x, y, width, height);
    graphics.lineStyle(2, 0x515369, 0.85);
    graphics.strokeRect(x + 3, y + 3, width - 6, height - 6);
    drawSpeakerCone(graphics, x + 24, y + 27, 13);
    drawSpeakerCone(graphics, x + 24, y + 63, 19);
    graphics.fillStyle(0x8c69c9, 0.7);
    graphics.fillRect(x + 6, y + height - 8, width - 12, 2);
  });
}

function drawDjLight(graphics, x, y, color) {
  graphics.fillStyle(color, 0.05);
  graphics.fillCircle(x, y, 19);
  graphics.fillStyle(color, 0.16);
  graphics.fillCircle(x, y, 10);
  graphics.fillStyle(color, 1);
  graphics.fillRect(x - 5, y - 4, 10, 8);
  graphics.fillStyle(0xffffff, 0.8);
  graphics.fillRect(x - 2, y - 2, 4, 3);
}

function drawSpeakerCone(graphics, x, y, radius) {
  graphics.fillStyle(0x090b12, 1);
  graphics.fillCircle(x, y, radius + 2);
  graphics.lineStyle(2, 0x3f4359, 1);
  graphics.strokeCircle(x, y, radius);
  graphics.fillStyle(0x262a3a, 1);
  graphics.fillCircle(x, y, radius - 4);
  graphics.fillStyle(0x0d0f18, 1);
  graphics.fillCircle(x, y, Math.max(4, radius - 10));
  graphics.fillStyle(0x6c7191, 0.45);
  graphics.fillCircle(x - 3, y - 4, 3);
}

function drawPartyTable(graphics, x, y) {
  graphics.fillStyle(0x070b0e, 0.32);
  graphics.fillEllipse(x + 5, y + 8, 72, 28);
  graphics.fillStyle(0x38251f, 1);
  graphics.fillCircle(x, y, 34);
  graphics.fillStyle(0x76513a, 1);
  graphics.fillCircle(x, y, 32);
  graphics.lineStyle(2, 0xa9794d, 0.55);
  graphics.strokeCircle(x, y, 26);
  graphics.lineStyle(1, 0x432a21, 0.65);
  graphics.lineBetween(x - 28, y - 5, x + 27, y + 4);
  graphics.lineBetween(x - 24, y + 9, x + 22, y + 14);
  graphics.fillStyle(0x2e201b, 1);
  graphics.fillRect(x - 4, y + 24, 8, 36);

  graphics.fillStyle(0xffcb64, 0.07);
  graphics.fillCircle(x + 4, y - 6, 18);
  graphics.fillStyle(0xf2d195, 1);
  graphics.fillRect(x, y - 13, 8, 14);
  graphics.fillStyle(0xfff0b0, 1);
  graphics.fillRect(x + 2, y - 17, 4, 7);
  graphics.fillStyle(0xffc94e, 0.9);
  graphics.fillRect(x + 3, y - 19, 2, 3);

  graphics.fillStyle(0x17130f, 1);
  graphics.fillRect(x - 20, y - 12, 8, 17);
  graphics.fillStyle(0xc99b62, 1);
  graphics.fillRect(x - 18, y - 9, 4, 11);
  graphics.fillStyle(0x9bc7d1, 1);
  graphics.fillRect(x + 8, y - 13, 7, 14);
  graphics.fillStyle(0xdaf4f1, 0.72);
  graphics.fillRect(x + 10, y - 11, 2, 8);
}

function drawCooler(graphics) {
  const { cooler } = PATIO_LAYOUT;
  graphics.fillStyle(0x081015, 0.28);
  graphics.fillRect(cooler.x + 5, cooler.y + 7, cooler.width + 2, cooler.height + 2);
  graphics.fillStyle(0xb8c9cd, 1);
  graphics.fillRect(cooler.x, cooler.y, cooler.width, cooler.height);
  graphics.fillStyle(0xe6eeee, 1);
  graphics.fillRect(cooler.x + 2, cooler.y + 2, cooler.width - 4, 7);
  graphics.fillStyle(0x71949e, 1);
  graphics.fillRect(cooler.x + 8, cooler.y + 8, 42, 10);
  graphics.fillStyle(0x3f6672, 1);
  graphics.fillRect(cooler.x + 4, cooler.y + 22, cooler.width - 8, 3);
  graphics.fillStyle(0xe9f3f3, 0.82);
  graphics.fillRect(cooler.x + 7, cooler.y + 27, 8, 5);
  graphics.fillRect(cooler.x + 43, cooler.y + 27, 8, 5);

  [cooler.x + 16, cooler.x + 29, cooler.x + 42].forEach((x, index) => {
    graphics.fillStyle(index === 1 ? 0xd56678 : 0x67a8a0, 1);
    graphics.fillRect(x, cooler.y - 5, 7, 13);
    graphics.fillStyle(0x263139, 1);
    graphics.fillRect(x + 2, cooler.y - 9, 3, 5);
    graphics.fillStyle(0xd7f1eb, 0.6);
    graphics.fillRect(x + 1, cooler.y - 2, 2, 6);
  });
}

function drawPlants(graphics) {
  PATIO_LAYOUT.plants.forEach(({ x, y }) => {
    graphics.fillStyle(0x080c0b, 0.28);
    graphics.fillEllipse(x + 4, y + 24, 38, 13);
    graphics.fillStyle(0x5d3f32, 1);
    graphics.fillRect(x - 12, y + 8, 24, 22);
    graphics.fillStyle(0x9a6541, 1);
    graphics.fillRect(x - 14, y + 7, 28, 5);
    graphics.fillStyle(0xc28757, 0.55);
    graphics.fillRect(x - 9, y + 13, 3, 13);

    const leaves = [
      { offsetX: 0, offsetY: -15, width: 8, height: 27, color: 0x347447 },
      { offsetX: -11, offsetY: -8, width: 10, height: 23, color: 0x245f3c },
      { offsetX: 11, offsetY: -7, width: 10, height: 22, color: 0x3c8250 },
      { offsetX: -17, offsetY: 0, width: 9, height: 17, color: 0x1f5437 },
      { offsetX: 17, offsetY: 1, width: 9, height: 17, color: 0x2f7147 },
    ];
    leaves.forEach((leaf) => {
      graphics.fillStyle(leaf.color, 1);
      graphics.fillEllipse(x + leaf.offsetX, y + leaf.offsetY, leaf.width, leaf.height);
      graphics.fillStyle(0x7faf63, 0.35);
      graphics.fillRect(x + leaf.offsetX, y + leaf.offsetY - 5, 2, 9);
    });
  });
}

function drawEdgeGardens(graphics) {
  PATIO_LAYOUT.edgeGardens.forEach(({ x, y, width, height }, bedIndex) => {
    graphics.fillStyle(0x091b14, 0.42);
    graphics.fillRect(x + 4, y + 5, width, height);
    graphics.fillStyle(0x163924, 1);
    graphics.fillRect(x, y, width, height);
    graphics.fillStyle(0x315b35, 1);
    graphics.fillRect(x, y, width, 4);

    for (let offset = 8; offset < width - 5; offset += 17) {
      const heightOffset = (offset * 3 + bedIndex * 7) % 9;
      graphics.fillStyle(heightOffset % 2 === 0 ? 0x28643d : 0x3c7746, 1);
      graphics.fillCircle(x + offset, y + 5 - heightOffset / 2, 7 + (heightOffset % 3));
      graphics.fillStyle(0x75a45c, 0.35);
      graphics.fillRect(x + offset - 1, y - heightOffset / 2, 2, 7);
      if ((offset + bedIndex) % 5 === 0) {
        graphics.fillStyle(0xe99e72, 1);
        graphics.fillRect(x + offset + 3, y - 4, 3, 3);
      }
    }
  });

  PATIO_LAYOUT.edgeShrubs.forEach(({ x, y }, shrubIndex) => {
    graphics.fillStyle(0x07160f, 0.4);
    graphics.fillEllipse(x + 4, y + 7, 43, 63);
    for (let leaf = 0; leaf < 7; leaf += 1) {
      const offsetX = ((leaf * 11 + shrubIndex * 5) % 29) - 14;
      const offsetY = ((leaf * 17) % 49) - 24;
      graphics.fillStyle(leaf % 2 === 0 ? 0x215c38 : 0x347344, 1);
      graphics.fillCircle(x + offsetX, y + offsetY, 10);
      graphics.fillStyle(0x72a05b, 0.3);
      graphics.fillRect(x + offsetX - 2, y + offsetY - 5, 3, 6);
    }
  });
}

function drawPatioLanterns(graphics) {
  PATIO_LAYOUT.patioLanterns.forEach(({ x, y }) => {
    graphics.fillStyle(0xffbd58, 0.035);
    graphics.fillCircle(x, y, 34);
    graphics.fillStyle(0xffcb68, 0.075);
    graphics.fillCircle(x, y, 22);
    graphics.fillStyle(0x382722, 1);
    graphics.fillRect(x - 3, y - 28, 6, 46);
    graphics.fillStyle(0x191820, 1);
    graphics.fillRect(x - 7, y - 31, 14, 4);
    graphics.fillRect(x - 7, y - 14, 14, 4);
    graphics.fillStyle(0xffd477, 1);
    graphics.fillRect(x - 5, y - 27, 10, 13);
    graphics.fillStyle(0xfff1b6, 1);
    graphics.fillRect(x - 1, y - 25, 3, 9);
    graphics.fillStyle(0x12151a, 0.8);
    graphics.fillRect(x - 7, y + 17, 14, 4);
  });
}

function drawGarlands(graphics) {
  const bulbs = [0xffd45b, 0xff6f91, 0x55d7ff, 0xc58cff];

  PATIO_LAYOUT.garlands.forEach(({ x1, y1, x2, y2, sag, poleHeight }, row) => {
    drawGarlandPole(graphics, x1, y1, poleHeight);
    drawGarlandPole(graphics, x2, y2, poleHeight);

    const points = [];
    for (let segment = 0; segment <= 24; segment += 1) {
      const t = segment / 24;
      points.push({
        x: Phaser.Math.Linear(x1, x2, t),
        y: Phaser.Math.Linear(y1, y2, t) + Math.sin(t * Math.PI) * sag,
      });
    }
    graphics.lineStyle(2, 0x171923, 0.92);
    for (let point = 1; point < points.length; point += 1) {
      graphics.lineBetween(points[point - 1].x, points[point - 1].y, points[point].x, points[point].y);
    }

    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const x = Phaser.Math.Linear(x1, x2, t);
      const y = Phaser.Math.Linear(y1, y2, t) + Math.sin(t * Math.PI) * sag;
      const color = bulbs[(i + row) % bulbs.length];
      graphics.fillStyle(color, 0.035);
      graphics.fillCircle(x, y + 5, 17);
      graphics.fillStyle(color, 0.12);
      graphics.fillCircle(x, y + 5, 10);
      graphics.fillStyle(0x171923, 1);
      graphics.fillRect(x - 2, y - 1, 4, 5);
      graphics.fillStyle(color, 1);
      graphics.fillRect(x - 4, y + 3, 8, 8);
      graphics.fillStyle(0xffffff, 0.72);
      graphics.fillRect(x - 1, y + 4, 3, 3);
    }
  });
}

function drawGarlandPole(graphics, x, y, height) {
  graphics.fillStyle(0x090b10, 0.35);
  graphics.fillRect(x + 3, y - 5, 8, height + 14);
  graphics.fillStyle(0x3d2b27, 1);
  graphics.fillRect(x - 3, y - 8, 7, height + 16);
  graphics.fillStyle(0x725044, 0.8);
  graphics.fillRect(x - 2, y - 6, 2, height + 11);
  graphics.fillStyle(0x15151a, 1);
  graphics.fillRect(x - 6, y - 11, 13, 5);
}

function drawClutter(graphics) {
  PATIO_LAYOUT.clutter.forEach(([x, y], i) => {
    graphics.fillStyle(i % 3 === 0 ? 0xf1d2a1 : (i % 3 === 1 ? 0x8dc8a1 : 0xcc6f83), 1);
    graphics.fillRect(x, y, 7, 13);
    if (i % 4 === 0) graphics.fillRect(x - 5, y + 10, 15, 4);
  });
}
