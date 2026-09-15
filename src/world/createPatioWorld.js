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
import { createPatioAmbient, preloadPatioAmbient } from './patioAmbient.js';
import { PATIO_LAYOUT } from './patioLayout.js';

export function preloadPatioWorld(scene) {
  preloadGrass(scene);
  preloadDeckSurface(scene);
  preloadDjBooth(scene);
  preloadBar(scene);
  preloadHouseFacade(scene);
  preloadPool(scene);
  preloadPatioAmbient(scene);
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
}
function drawArchitectureAndProps(scene) {
  const graphics = scene.add.graphics();

  createHouseFacade(scene, PATIO_LAYOUT);
  createBar(scene, PATIO_LAYOUT.bar);
  createDjBooth(scene, PATIO_LAYOUT.dj);
  createPatioAmbient(scene, PATIO_LAYOUT);
  drawEdgeGardens(graphics);
  drawPatioLanterns(graphics);
  drawGarlands(graphics);
  drawClutter(graphics);
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
