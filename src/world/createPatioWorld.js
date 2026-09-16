import Phaser from 'phaser';
import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';
import { createGrass } from './grass/createGrass.js';
import { createPatioGrassLayout } from './grass/grassLayout.js';
import { preloadGrass } from './grass/preloadGrass.js';
import { createDeckSurface, preloadDeckSurface } from './deck/deckSurface.js';
import { createDjBooth, preloadDjBooth } from './dj/djBooth.js';
import { createBar, preloadBar } from './bar/barStructure.js';
import { createHouseFacade, preloadHouseFacade } from './house/houseFacade.js';
import { createPool, preloadPool } from './pool/poolStructure.js';
import { createPatioPerimeter, preloadPatioPerimeter } from './patioPerimeter.js';
import { PATIO_LAYOUT } from './patioLayout.js';

export function preloadPatioWorld(scene) {
  preloadGrass(scene);
  preloadDeckSurface(scene);
  preloadDjBooth(scene);
  preloadBar(scene);
  preloadHouseFacade(scene);
  preloadPool(scene);
  preloadPatioPerimeter(scene);
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

  createPool(scene, PATIO_LAYOUT.pool);
  createPatioPerimeter(scene, PATIO_LAYOUT);
}
function drawArchitectureAndProps(scene) {
  const graphics = scene.add.graphics();

  createHouseFacade(scene, PATIO_LAYOUT);
  createBar(scene, PATIO_LAYOUT.bar);
  createDjBooth(scene, PATIO_LAYOUT.dj);
  PATIO_LAYOUT.partyTables.forEach(({ x, y }) => drawPartyTable(graphics, x, y));
  drawCooler(graphics);
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

  [16, 29, 42].forEach((offsetX, index) => {
    const x = cooler.x + offsetX;
    graphics.fillStyle(index === 1 ? 0xd56678 : 0x67a8a0, 1);
    graphics.fillRect(x, cooler.y - 5, 7, 13);
    graphics.fillStyle(0x263139, 1);
    graphics.fillRect(x + 2, cooler.y - 9, 3, 5);
    graphics.fillStyle(0xd7f1eb, 0.6);
    graphics.fillRect(x + 1, cooler.y - 2, 2, 6);
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
