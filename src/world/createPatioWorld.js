import Phaser from 'phaser';
import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';
import { createGrass } from './grass/createGrass.js';
import { createPatioGrassLayout } from './grass/grassLayout.js';
import { preloadGrass } from './grass/preloadGrass.js';
import { createDeckSurface, preloadDeckSurface } from './deck/deckSurface.js';
import { createDjBooth, preloadDjBooth } from './dj/djBooth.js';
import { createBar, preloadBar } from './bar/barStructure.js';
import { createHouseFacade, preloadHouseFacade } from './house/houseFacade.js';
import { PATIO_LAYOUT } from './patioLayout.js';

export function preloadPatioWorld(scene) {
  preloadGrass(scene);
  preloadDeckSurface(scene);
  preloadDjBooth(scene);
  preloadBar(scene);
  preloadHouseFacade(scene);
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

  drawPixelPool(scene);
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

  createHouseFacade(scene, PATIO_LAYOUT);
  createBar(scene, PATIO_LAYOUT.bar);
  createDjBooth(scene, PATIO_LAYOUT.dj);

  PATIO_LAYOUT.partyTables.forEach(({ x, y }) => drawPartyTable(graphics, x, y));
  drawCooler(graphics);
  drawPlants(graphics);
  drawEdgeGardens(graphics);
  drawPatioLanterns(graphics);
  drawGarlands(graphics);
  drawClutter(graphics);
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
