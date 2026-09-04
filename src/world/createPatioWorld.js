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

function drawBar(scene, graphics) {
  const { bar } = PATIO_LAYOUT;
  const { body, counter, inset, label, bottles } = bar;

  graphics.fillStyle(0x392632, 1);
  graphics.fillRect(bar.x + body.offsetX, bar.y + body.offsetY, body.width, body.height);
  graphics.fillStyle(0x765066, 1);
  graphics.fillRect(bar.x + counter.offsetX, bar.y + counter.offsetY, counter.width, counter.height);
  graphics.fillStyle(0x1f1720, 0.92);
  graphics.fillRect(bar.x + inset.offsetX, bar.y + inset.offsetY, inset.width, inset.height);
  scene.add.text(bar.x + label.offsetX, bar.y + label.offsetY, 'BARRA', {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#ffe5ed',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  const bottleColors = [0x7ccf8d, 0xf0bd5f, 0x91a9ff, 0xd96868, 0xc38ed8];
  for (let i = 0; i < bottles.count; i += 1) {
    const x = bar.x + bottles.offsetX + (i % bottles.columns) * bottles.columnGap;
    const y = bar.y + bottles.offsetY + Math.floor(i / bottles.columns) * bottles.rowGap;
    graphics.fillStyle(bottleColors[i % bottleColors.length], 1);
    graphics.fillRect(x, y, bottles.width, bottles.height);
    graphics.fillRect(x + 3, y - 5, 2, 6);
  }
}

function drawDj(scene, graphics) {
  const { dj } = PATIO_LAYOUT;
  const { booth, counter, label } = dj;

  graphics.fillStyle(0x23212f, 1);
  graphics.fillRect(dj.x + booth.offsetX, dj.y + booth.offsetY, booth.width, booth.height);
  graphics.fillStyle(0x4c4763, 1);
  graphics.fillRect(dj.x + counter.offsetX, dj.y + counter.offsetY, counter.width, counter.height);
  scene.add.text(dj.x + label.offsetX, dj.y + label.offsetY, 'DJ', {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#ffffff',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  dj.speakers.forEach(({ x, y, width, height }) => {
    graphics.fillStyle(0x171820, 1);
    graphics.fillRect(x, y, width, height);
    graphics.fillStyle(0x343746, 1);
    graphics.fillCircle(x + 24, y + 27, 13);
    graphics.fillCircle(x + 24, y + 63, 19);
  });
}

function drawPartyTable(graphics, x, y) {
  graphics.fillStyle(0x5b4337, 1);
  graphics.fillCircle(x, y, 32);
  graphics.fillRect(x - 4, y + 24, 8, 36);
  graphics.fillStyle(0xefddbd, 1);
  graphics.fillRect(x - 18, y - 9, 7, 12);
  graphics.fillStyle(0x9bc7d1, 1);
  graphics.fillRect(x + 8, y - 13, 7, 14);
}

function drawCooler(graphics) {
  const { cooler } = PATIO_LAYOUT;
  graphics.fillStyle(0xd7e2e4, 1);
  graphics.fillRect(cooler.x, cooler.y, cooler.width, cooler.height);
  graphics.fillStyle(0x89a8b0, 1);
  graphics.fillRect(cooler.x + 8, cooler.y + 8, 42, 10);
}

function drawPlants(graphics) {
  PATIO_LAYOUT.plants.forEach(({ x, y }) => {
    graphics.fillStyle(0x8e6749, 1);
    graphics.fillRect(x - 12, y + 8, 24, 22);
    graphics.fillStyle(0x1f6a3d, 1);
    graphics.fillCircle(x, y, 21);
    graphics.fillStyle(0x337e4f, 1);
    graphics.fillCircle(x - 14, y - 6, 11);
    graphics.fillCircle(x + 14, y - 4, 11);
  });
}

function drawGarlands(graphics) {
  const bulbs = [0xffd45b, 0xff6f91, 0x55d7ff, 0xc58cff];

  PATIO_LAYOUT.garlands.forEach(({ x1, y1, x2, y2, sag }, row) => {
    graphics.lineStyle(3, 0x24202f, 0.88);
    graphics.lineBetween(x1, y1, x2, y2);

    for (let i = 0; i <= 8; i += 1) {
      const t = i / 8;
      const x = Phaser.Math.Linear(x1, x2, t);
      const y = Phaser.Math.Linear(y1, y2, t) + Math.sin(t * Math.PI) * sag;
      graphics.fillStyle(bulbs[(i + row) % bulbs.length], 1);
      graphics.fillRect(x - 4, y - 4, 8, 8);
    }
  });
}

function drawClutter(graphics) {
  PATIO_LAYOUT.clutter.forEach(([x, y], i) => {
    graphics.fillStyle(i % 3 === 0 ? 0xf1d2a1 : (i % 3 === 1 ? 0x8dc8a1 : 0xcc6f83), 1);
    graphics.fillRect(x, y, 7, 13);
    if (i % 4 === 0) graphics.fillRect(x - 5, y + 10, 15, 4);
  });
}
