import Phaser from 'phaser';
import { PatioScene } from './PatioScene.js';
import { TERRAIN_TILE } from '../data/terrainTiles.js';

const WORLD = { width: 1680, height: 960 };

const ENTRY = {
  x: 1456,
  y: 800,
  width: 96,
  height: 160,
};

const FACADE = {
  height: 150,
  topBand: 18,
  baseBand: 18,
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

    this.drawHouseFacade(g);

    // Barra provisional: se mantiene para el siguiente batch visual.
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

    // DJ provisional: se mantiene para el siguiente batch visual.
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

    // Guirnaldas locales: limpias y sin invadir la piscina.
    this.drawGarland(g, {
      x1: 500, y1: 330, x2: 1120, y2: 330, bulbs: 10, sag: 16, offset: 0,
    });
    this.drawGarland(g, {
      x1: 1180, y1: 405, x2: 1620, y2: 385, bulbs: 8, sag: 12, offset: 1,
    });

    // Entrada baja y discreta.
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
      const onEntry = x >= ENTRY.x - 12 && x <= ENTRY.x + ENTRY.width + 12 && y >= ENTRY.y - 12;
      if (onEntry) return;
      g.fillStyle(i % 3 === 0 ? 0xf1d2a1 : (i % 3 === 1 ? 0x8dc8a1 : 0xcc6f83), 1);
      g.fillRect(x, y, 7, 13);
      if (i % 4 === 0) g.fillRect(x - 5, y + 10, 15, 4);
    });
  }

  drawHouseFacade(g) {
    // Sombra sobre el deck: separa casa y patio.
    g.fillStyle(0x0b1015, 0.28);
    g.fillRect(0, FACADE.height - 4, WORLD.width, 26);

    // Cuerpo principal de la fachada.
    g.fillStyle(0xcac2b0, 1);
    g.fillRect(0, 0, WORLD.width, FACADE.height);

    // Banda superior e inferior para dar profundidad arquitectónica.
    g.fillStyle(0xb2a996, 1);
    g.fillRect(0, 0, WORLD.width, FACADE.topBand);
    g.fillStyle(0x8f8778, 1);
    g.fillRect(0, FACADE.height - FACADE.baseBand, WORLD.width, FACADE.baseBand);

    // Línea de sombra y pequeños cortes verticales para evitar una pared infinita.
    g.fillStyle(0x716b61, 0.55);
    g.fillRect(0, FACADE.height - FACADE.baseBand - 5, WORLD.width, 5);

    [300, 565, 830, 1110, 1370].forEach((x) => {
      g.fillStyle(0xa59d8d, 0.55);
      g.fillRect(x, 20, 4, 106);
      g.fillStyle(0xd9d2c2, 0.36);
      g.fillRect(x + 4, 20, 2, 106);
    });

    // Ventanales cálidos. Tienen variaciones para sugerir un interior vivo.
    this.drawWindowModule(g, { x: 72, y: 34, width: 210, height: 76, warmth: 0 });
    this.drawWindowModule(g, { x: 338, y: 34, width: 210, height: 76, warmth: 1 });
    this.drawWindowModule(g, { x: 604, y: 34, width: 210, height: 76, warmth: 2 });
    this.drawWindowModule(g, { x: 870, y: 34, width: 210, height: 76, warmth: 3 });

    // Puerta secundaria decorativa: da ritmo a la fachada sin competir con el baño.
    this.drawSecondaryDoor(g, 1134, 28);

    // El baño funciona como módulo propio integrado en la casa.
    this.drawBathroomModule(g, 1424, 18);

    // Dos apliques cálidos ayudan a que la fachada se sienta nocturna.
    this.drawWallLamp(g, 1112, 48);
    this.drawWallLamp(g, 1388, 48);
  }

  drawWindowModule(g, { x, y, width, height, warmth }) {
    const frame = 0x242630;
    const recess = 0x181a22;
    const warm = [0xd7b75d, 0xc69d55, 0xe0c773, 0xb88f54][warmth % 4];
    const cool = [0x41465a, 0x373b50, 0x4d5267, 0x343849][warmth % 4];

    // Hueco y marco.
    g.fillStyle(recess, 1);
    g.fillRect(x - 5, y - 5, width + 10, height + 10);
    g.fillStyle(frame, 1);
    g.fillRect(x, y, width, height);

    // Cristales interiores.
    g.fillStyle(warm, 0.9);
    g.fillRect(x + 8, y + 8, 88, height - 16);
    g.fillStyle(cool, 1);
    g.fillRect(x + 108, y + 8, width - 116, height - 16);

    // Reflejo vertical y división central.
    g.fillStyle(0xf3ddb0, 0.18);
    g.fillRect(x + 18, y + 12, 8, height - 24);
    g.fillRect(x + 118, y + 12, 6, height - 24);
    g.fillStyle(0x171923, 1);
    g.fillRect(x + 101, y, 6, height);

    // Sombra inferior del marco.
    g.fillStyle(0x11131b, 0.85);
    g.fillRect(x, y + height - 6, width, 6);
  }

  drawSecondaryDoor(g, x, y) {
    g.fillStyle(0x777064, 1);
    g.fillRect(x - 6, y - 6, 112, 128);
    g.fillStyle(0x3d3935, 1);
    g.fillRect(x, y, 100, 122);
    g.fillStyle(0x4b4540, 1);
    g.fillRect(x + 8, y + 8, 84, 106);
    g.fillStyle(0x24262d, 1);
    g.fillRect(x + 18, y + 14, 64, 38);
    g.fillStyle(0xc5aa65, 0.5);
    g.fillRect(x + 23, y + 19, 54, 28);
    g.fillStyle(0xc9b37a, 1);
    g.fillCircle(x + 78, y + 78, 4);
  }

  drawBathroomModule(g, x, y) {
    const width = 156;
    const height = 132;

    // Receso oscuro para integrar la puerta en la fachada.
    g.fillStyle(0x82796c, 1);
    g.fillRect(x - 8, y - 5, width + 16, height + 10);
    g.fillStyle(0x2d2b2b, 1);
    g.fillRect(x, y, width, height);

    // Puerta interior con paneles sencillos.
    g.fillStyle(0x4a4038, 1);
    g.fillRect(x + 10, y + 10, width - 20, height - 10);
    g.fillStyle(0x5a4d43, 1);
    g.fillRect(x + 18, y + 55, width - 36, 58);
    g.fillStyle(0x372f2a, 1);
    g.fillRect(x + 23, y + 61, width - 46, 6);

    // Cartel BAÑO tipo señalética local y clara.
    g.fillStyle(0xf1ede1, 1);
    g.fillRect(x + 24, y + 14, width - 48, 34);
    g.fillStyle(0x2a2b30, 1);
    g.fillRect(x + 24, y + 45, width - 48, 3);

    this.add.text(x + width / 2, y + 31, 'BAÑO', {
      fontFamily: 'monospace', fontSize: '16px', color: '#24262b', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Iconos simples y neutros debajo del cartel.
    g.fillStyle(0xd9d4c8, 1);
    g.fillCircle(x + 61, y + 79, 5);
    g.fillRect(x + 56, y + 85, 10, 18);
    g.fillCircle(x + 94, y + 79, 5);
    g.fillRect(x + 89, y + 85, 10, 18);

    // Picaporte y pequeña placa inferior.
    g.fillStyle(0xd0b06a, 1);
    g.fillCircle(x + width - 27, y + 94, 4);
    g.fillStyle(0x75665a, 1);
    g.fillRect(x + 43, y + 113, 70, 6);
  }

  drawWallLamp(g, x, y) {
    g.fillStyle(0x4a463f, 1);
    g.fillRect(x - 7, y - 9, 14, 28);
    g.fillStyle(0xe1be6d, 0.95);
    g.fillRect(x - 5, y - 5, 10, 14);
    g.fillStyle(0xf2d995, 0.14);
    g.fillCircle(x, y + 2, 26);
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
