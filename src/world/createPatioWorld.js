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
  const { x, y, width, height } = PATIO_LAYOUT.pool;
  const innerX = x + TILE_SIZE;
  const innerY = y + TILE_SIZE;
  const innerWidth = width - TILE_SIZE * 2;
  const innerHeight = height - TILE_SIZE * 2;

  scene.add.rectangle(x + width / 2 + 6, y + height / 2 + 9, width, height, 0x071017, 0.28)
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

  const graphics = scene.add.graphics().setDepth(-5);
  graphics.lineStyle(4, 0xd3d7d8, 1);
  graphics.strokeCircle(x + width - 58, y + 48, 18);
  graphics.lineBetween(x + width - 40, y + 38, x + width - 40, y + 88);
  graphics.lineBetween(x + width - 62, y + 64, x + width - 42, y + 64);

  graphics.fillStyle(0xf4c95e, 1);
  graphics.fillCircle(x + 148, y + 128, 22);
  graphics.fillStyle(0x2a879f, 1);
  graphics.fillCircle(x + 148, y + 128, 10);
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

  graphics.fillStyle(0xd5cec0, 1);
  graphics.fillRect(house.x, house.y, house.width, house.height);
  graphics.fillStyle(0xf0ece2, 1);
  graphics.fillRect(house.x, house.y, house.width, house.topBandHeight);
  graphics.fillStyle(0xc5bcac, 1);
  graphics.fillRect(house.x, house.middleBand.y, house.width, house.middleBand.height);
  graphics.fillStyle(0x9b927f, 1);
  graphics.fillRect(house.x, house.bottomBand.y, house.width, house.bottomBand.height);

  house.verticalCuts.forEach((x) => {
    graphics.fillStyle(0xe4ddd0, 0.75);
    graphics.fillRect(x - 3, 18, 4, 102);
  });

  house.windows.forEach(({ x, y, width, height, warm }) => {
    graphics.fillStyle(0x1d2230, 1);
    graphics.fillRect(x, y, width, height);
    graphics.fillStyle(warm ? 0xd5b66d : 0x445582, 0.9);
    graphics.fillRect(x + 8, y + 8, Math.floor((width - 22) / 2), height - 16);
    graphics.fillStyle(warm ? 0x8f7447 : 0x29334e, 0.35);
    graphics.fillRect(x + 14, y + 8, 12, height - 16);
    graphics.fillStyle(warm ? 0x5e5140 : 0x37415d, 1);
    graphics.fillRect(x + width / 2 + 2, y + 8, Math.floor((width - 24) / 2), height - 16);
    graphics.lineStyle(3, 0x11131a, 1);
    graphics.lineBetween(x + Math.floor(width / 2), y, x + Math.floor(width / 2), y + height);
  });

  drawSecondaryDoor(graphics, house.secondaryDoor);
  drawBathroom(scene, graphics, house.bathroom);
  house.lamps.forEach((lamp) => drawWallLamp(graphics, lamp));
}

function drawSecondaryDoor(graphics, door) {
  graphics.fillStyle(0x5c544c, 1);
  graphics.fillRect(door.x, door.y, door.width, door.height);
  graphics.fillStyle(0x474038, 1);
  graphics.fillRect(door.x + 8, door.y + 8, 56, 88);
  graphics.fillStyle(0x7a7367, 1);
  graphics.fillRect(door.x + 22, door.y + 18, 28, 24);
  graphics.fillStyle(0xd9c37d, 1);
  graphics.fillCircle(door.x + 54, door.y + 60, 3);
}

function drawBathroom(scene, graphics, bathroom) {
  graphics.fillStyle(0x6c655d, 1);
  graphics.fillRect(bathroom.x, bathroom.y, bathroom.width, bathroom.height);
  graphics.fillStyle(0x4e4944, 1);
  graphics.fillRect(bathroom.x + 12, bathroom.y + 12, 86, 98);
  graphics.fillStyle(0x1d2230, 1);
  graphics.fillRect(bathroom.x + 27, bathroom.y + 20, 56, 20);
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
  graphics.fillStyle(0x9b927f, 1);
  graphics.fillRect(bathroom.x + 4, bathroom.y + 2, 106, 3);
}

function drawWallLamp(graphics, { x, y }) {
  graphics.fillStyle(0x7e877f, 1);
  graphics.fillRect(x, y, 14, 28);
  graphics.fillStyle(0xf1dc93, 1);
  graphics.fillRect(x + 3, y + 4, 8, 16);
  graphics.fillStyle(0xf1dc93, 0.14);
  graphics.fillCircle(x + 7, y + 14, 18);
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
