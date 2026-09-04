import Phaser from 'phaser';
import { PatioScene } from './PatioScene.js';
import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';

const WORLD = { width: 1680, height: 960 };

const ENTRY = {
  x: 1456,
  y: 800,
  width: 96,
  height: 160,
};

export class PatioSceneV011 extends PatioScene {
  drawTerrain() {
    this.add.tileSprite(0, 150, WORLD.width, WORLD.height - 150, 'terrain', TERRAIN_TILE.GRASS_BASE)
      .setOrigin(0)
      .setDepth(-30);

    const grassVariants = [
      TERRAIN_TILE.GRASS_A,
      TERRAIN_TILE.GRASS_B,
      TERRAIN_TILE.GRASS_WORN,
      TERRAIN_TILE.GRASS_DARK,
      TERRAIN_TILE.GRASS_LEAF,
    ];

    for (let y = 294; y < WORLD.height; y += 80) {
      for (let x = 32; x < WORLD.width; x += 96) {
        const seed = ((x / 16) * 3 + (y / 16) * 7) % 11;
        if (seed < 6) {
          const frame = grassVariants[seed % grassVariants.length];
          this.add.image(x + (seed % 3) * 8, y + (seed % 2) * 8, 'terrain', frame)
            .setOrigin(0)
            .setDepth(-28)
            .setAlpha(seed === 2 ? 0.78 : 1);
        }
      }
    }

    this.add.tileSprite(0, 150, WORLD.width, 120, 'terrain', TERRAIN_TILE.DECK_A)
      .setOrigin(0)
      .setDepth(-24);

    this.add.tileSprite(0, 254, WORLD.width, 16, 'terrain', TERRAIN_TILE.DECK_EDGE_BOTTOM)
      .setOrigin(0)
      .setDepth(-23);

    for (let x = 64; x < WORLD.width; x += 160) {
      this.add.tileSprite(x, 166, 48, 72, 'terrain', TERRAIN_TILE.DECK_B)
        .setOrigin(0)
        .setDepth(-22)
        .setAlpha(0.34);
    }

    // Acceso angosto: deja de competir visualmente con la piscina.
    this.add.tileSprite(ENTRY.x, ENTRY.y, ENTRY.width, ENTRY.height, 'terrain', TERRAIN_TILE.PATH_A)
      .setOrigin(0)
      .setDepth(-18);

    for (let y = ENTRY.y + 16; y < ENTRY.y + ENTRY.height; y += 48) {
      this.add.tileSprite(ENTRY.x + 16, y, ENTRY.width - 32, 16, 'terrain', TERRAIN_TILE.PATH_B)
        .setOrigin(0)
        .setDepth(-17)
        .setAlpha(0.42);
    }

    this.add.tileSprite(ENTRY.x, ENTRY.y, 16, ENTRY.height, 'terrain', TERRAIN_TILE.PATH_EDGE_LEFT)
      .setOrigin(0)
      .setDepth(-16);
    this.add.tileSprite(ENTRY.x + ENTRY.width - 16, ENTRY.y, 16, ENTRY.height, 'terrain', TERRAIN_TILE.PATH_EDGE_RIGHT)
      .setOrigin(0)
      .setDepth(-16);

    this.drawPixelPool();
  }

  drawArchitectureAndProps() {
    const g = this.add.graphics();

    // Casa / fondo provisional.
    g.fillStyle(0xd2cab8, 1);
    g.fillRect(0, 0, WORLD.width, 150);
    g.fillStyle(0x9b927f, 1);
    g.fillRect(0, 136, WORLD.width, 14);

    [80, 330, 590, 850].forEach((x, i) => {
      g.fillStyle(0x282b3a, 1);
      g.fillRect(x, 28, 190, 74);
      g.fillStyle(i % 2 ? 0x514b68 : 0xd0b85d, 0.8);
      g.fillRect(x + 9, 37, 82, 56);
      g.fillStyle(0x45415d, 1);
      g.fillRect(x + 99, 37, 82, 56);
      g.lineStyle(3, 0x191b25, 1);
      g.lineBetween(x + 95, 28, x + 95, 102);
    });

    // Baño provisional.
    g.fillStyle(0x554237, 1);
    g.fillRect(1460, 18, 118, 132);
    g.lineStyle(4, 0x806654, 1);
    g.strokeRect(1460, 18, 118, 132);
    g.fillStyle(0xede8da, 1);
    g.fillRect(1480, 38, 78, 30);
    this.add.text(1519, 53, 'BAÑO', {
      fontFamily: 'monospace', fontSize: '16px', color: '#25242b', fontStyle: 'bold',
    }).setOrigin(0.5);
    g.fillStyle(0xe8e2d4, 1);
    g.fillCircle(1507, 91, 5);
    g.fillRect(1502, 97, 10, 18);
    g.fillCircle(1531, 91, 5);
    g.fillRect(1526, 97, 10, 18);

    // Barra provisional.
    g.fillStyle(0x392632, 1);
    g.fillRect(1200, 178, 390, 185);
    g.fillStyle(0x765066, 1);
    g.fillRect(1186, 330, 418, 36);
    g.fillStyle(0x1f1720, 0.9);
    g.fillRect(1220, 205, 350, 46);
    this.add.text(1395, 198, 'BARRA', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffe5ed', fontStyle: 'bold',
    }).setOrigin(0.5);

    const bottleColors = [0x7ccf8d, 0xf0bd5f, 0x91a9ff, 0xd96868, 0xc38ed8];
    for (let i = 0; i < 18; i += 1) {
      const x = 1230 + (i % 9) * 36;
      const y = 275 + Math.floor(i / 9) * 32;
      g.fillStyle(bottleColors[i % bottleColors.length], 1);
      g.fillRect(x, y, 9, 22);
      g.fillRect(x + 3, y - 6, 3, 7);
    }

    // DJ provisional.
    g.fillStyle(0x23212f, 1);
    g.fillRect(110, 205, 330, 145);
    g.fillStyle(0x4c4763, 1);
    g.fillRect(130, 310, 290, 28);
    this.add.text(275, 225, 'DJ', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    [75, 462].forEach((x) => {
      g.fillStyle(0x171820, 1);
      g.fillRect(x, 220, 55, 105);
      g.fillStyle(0x343746, 1);
      g.fillCircle(x + 27, 250, 15);
      g.fillCircle(x + 27, 292, 22);
    });

    this.drawPartyTable(g, 1180, 530);
    this.drawPartyTable(g, 360, 565);

    g.fillStyle(0xd7e2e4, 1);
    g.fillRect(1325, 500, 70, 45);
    g.fillStyle(0x89a8b0, 1);
    g.fillRect(1334, 510, 52, 12);

    [[70, 430], [1600, 470], [1160, 825]].forEach(([x, y]) => {
      g.fillStyle(0x8e6749, 1);
      g.fillRect(x - 14, y + 6, 28, 28);
      g.fillStyle(0x1f6a3d, 1);
      g.fillCircle(x, y, 24);
      g.fillStyle(0x337e4f, 1);
      g.fillCircle(x - 16, y - 7, 13);
      g.fillCircle(x + 16, y - 5, 13);
    });

    // Guirnaldas locales: no atraviesan la piscina ni cortan la composición.
    this.drawGarland(g, {
      x1: 500, y1: 330, x2: 1120, y2: 330, bulbs: 10, sag: 16, offset: 0,
    });
    this.drawGarland(g, {
      x1: 1180, y1: 405, x2: 1620, y2: 385, bulbs: 8, sag: 12, offset: 1,
    });

    // Acceso: dos postes bajos y vegetación lateral, sin sensación de portón gigante.
    g.fillStyle(0x6b6257, 1);
    g.fillRect(1438, 790, 14, 38);
    g.fillRect(1556, 790, 14, 38);
    g.fillStyle(0xa89b88, 1);
    g.fillRect(1436, 786, 18, 7);
    g.fillRect(1554, 786, 18, 7);

    [[1418, 804], [1588, 806]].forEach(([x, y]) => {
      g.fillStyle(0x754f3b, 1);
      g.fillRect(x - 10, y + 8, 20, 18);
      g.fillStyle(0x275f3b, 1);
      g.fillCircle(x, y, 18);
      g.fillStyle(0x3b7951, 1);
      g.fillCircle(x - 10, y - 5, 10);
      g.fillCircle(x + 10, y - 4, 10);
    });

    const clutter = [
      [485, 350], [1090, 385], [1190, 740], [1280, 610], [410, 805], [1040, 830],
      [720, 790], [280, 500], [1560, 580], [850, 360], [200, 720], [1240, 450],
      [470, 755], [1180, 870], [840, 805], [1600, 860], [310, 870], [60, 700],
    ];
    clutter.forEach(([x, y], i) => {
      // Evitar basura visual en el sendero de entrada.
      const onEntry = x >= ENTRY.x - 12 && x <= ENTRY.x + ENTRY.width + 12 && y >= ENTRY.y - 12;
      if (onEntry) return;
      g.fillStyle(i % 3 === 0 ? 0xf1d2a1 : (i % 3 === 1 ? 0x8dc8a1 : 0xcc6f83), 1);
      g.fillRect(x, y, 7, 13);
      if (i % 4 === 0) g.fillRect(x - 5, y + 10, 15, 4);
    });
  }

  drawGarland(g, { x1, y1, x2, y2, bulbs, sag, offset }) {
    const points = [];
    const segments = 28;

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      points.push({
        x: Phaser.Math.Linear(x1, x2, t),
        y: Phaser.Math.Linear(y1, y2, t) + Math.sin(Math.PI * t) * sag,
      });
    }

    g.lineStyle(2, 0x24202f, 0.72);
    for (let i = 1; i < points.length; i += 1) {
      g.lineBetween(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    }

    const colors = [0xe7c65f, 0xdc7189, 0x68c4d4, 0xa887c7];
    for (let i = 0; i < bulbs; i += 1) {
      const t = bulbs === 1 ? 0.5 : i / (bulbs - 1);
      const x = Phaser.Math.Linear(x1, x2, t);
      const y = Phaser.Math.Linear(y1, y2, t) + Math.sin(Math.PI * t) * sag;
      g.fillStyle(colors[(i + offset) % colors.length], 0.9);
      g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    }
  }

  createPlayer() {
    super.createPlayer();
    this.player.setPosition(ENTRY.x + ENTRY.width / 2, 890);
    this.playerLabel.setPosition(this.player.x, this.player.y + 34);
  }
}
