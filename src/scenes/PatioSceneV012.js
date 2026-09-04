import Phaser from 'phaser';
import { PatioSceneV011 } from './PatioSceneV011.js';
import { TAMBU_SPRITE } from '../data/tambuSprite.js';
import { createTambuAnimations } from '../animations/createTambuAnimations.js';

const PLAYER_START = { x: 1504, y: 890 };
const WORLD_WIDTH = 1680;
const HOUSE_HEIGHT = 150;

export class PatioSceneV012 extends PatioSceneV011 {
  preload() {
    super.preload();
    this.load.spritesheet(TAMBU_SPRITE.key, TAMBU_SPRITE.path, {
      frameWidth: TAMBU_SPRITE.frameWidth,
      frameHeight: TAMBU_SPRITE.frameHeight,
    });
  }

  create() {
    createTambuAnimations(this);
    super.create();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(
      PLAYER_START.x,
      PLAYER_START.y,
      TAMBU_SPRITE.key,
      0,
    );

    this.player.setScale(1.24);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(2000);
    this.player.body.setSize(13, 15);
    this.player.body.setOffset(9, 31);

    this.playerFacing = 'down';
    this.player.play('tambu-idle-down');

    this.playerLabel = this.add.text(PLAYER_START.x, PLAYER_START.y + 26, 'TAMBU', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#7fe4ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2001);
  }

  drawArchitectureAndProps() {
    const g = this.add.graphics();

    g.fillStyle(0xd5cec0, 1);
    g.fillRect(0, 0, WORLD_WIDTH, HOUSE_HEIGHT);
    g.fillStyle(0xf0ece2, 1);
    g.fillRect(0, 0, WORLD_WIDTH, 18);
    g.fillStyle(0xc5bcac, 1);
    g.fillRect(0, 122, WORLD_WIDTH, 16);
    g.fillStyle(0x9b927f, 1);
    g.fillRect(0, 138, WORLD_WIDTH, 12);

    [180, 440, 700, 960].forEach((x) => {
      g.fillStyle(0xe4ddd0, 0.75);
      g.fillRect(x - 3, 18, 4, 102);
    });

    const windows = [
      { x: 36, y: 28, w: 150, h: 54, warm: true },
      { x: 240, y: 28, w: 162, h: 54, warm: false },
      { x: 470, y: 28, w: 162, h: 54, warm: true },
      { x: 680, y: 28, w: 162, h: 54, warm: false },
    ];

    windows.forEach(({ x, y, w, h, warm }) => {
      g.fillStyle(0x1d2230, 1);
      g.fillRect(x, y, w, h);
      g.fillStyle(warm ? 0xd5b66d : 0x445582, 0.9);
      g.fillRect(x + 8, y + 8, Math.floor((w - 22) / 2), h - 16);
      g.fillStyle(warm ? 0x8f7447 : 0x29334e, 0.35);
      g.fillRect(x + 14, y + 8, 12, h - 16);
      g.fillStyle(warm ? 0x5e5140 : 0x37415d, 1);
      g.fillRect(x + w / 2 + 2, y + 8, Math.floor((w - 24) / 2), h - 16);
      g.lineStyle(3, 0x11131a, 1);
      g.lineBetween(x + Math.floor(w / 2), y, x + Math.floor(w / 2), y + h);
    });

    g.fillStyle(0x5c544c, 1);
    g.fillRect(880, 18, 72, 102);
    g.fillStyle(0x474038, 1);
    g.fillRect(888, 26, 56, 88);
    g.fillStyle(0x7a7367, 1);
    g.fillRect(902, 36, 28, 24);
    g.fillStyle(0xd9c37d, 1);
    g.fillCircle(934, 78, 3);

    g.fillStyle(0x6c655d, 1);
    g.fillRect(1288, 10, 110, 122);
    g.fillStyle(0x4e4944, 1);
    g.fillRect(1300, 22, 86, 98);
    g.fillStyle(0x1d2230, 1);
    g.fillRect(1315, 30, 56, 20);
    this.add.text(1343, 40, 'BAÑO', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cfd7dc',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    g.fillStyle(0xe8e2d4, 1);
    g.fillCircle(1330, 66, 4);
    g.fillRect(1326, 72, 8, 13);
    g.fillCircle(1356, 66, 4);
    g.fillRect(1352, 72, 8, 13);
    g.fillStyle(0xd9c37d, 1);
    g.fillCircle(1376, 78, 3);
    g.fillStyle(0x9b927f, 1);
    g.fillRect(1292, 12, 106, 3);

    [[855, 44], [1276, 44]].forEach(([x, y]) => {
      g.fillStyle(0x7e877f, 1);
      g.fillRect(x, y, 14, 28);
      g.fillStyle(0xf1dc93, 1);
      g.fillRect(x + 3, y + 4, 8, 16);
      g.fillStyle(0xf1dc93, 0.14);
      g.fillCircle(x + 7, y + 14, 18);
    });

    g.fillStyle(0x392632, 1);
    g.fillRect(1236, 182, 300, 152);
    g.fillStyle(0x765066, 1);
    g.fillRect(1226, 307, 320, 28);
    g.fillStyle(0x1f1720, 0.92);
    g.fillRect(1256, 206, 260, 38);
    this.add.text(1386, 196, 'BARRA', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffe5ed',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const bottleColors = [0x7ccf8d, 0xf0bd5f, 0x91a9ff, 0xd96868, 0xc38ed8];
    for (let i = 0; i < 16; i += 1) {
      const x = 1268 + (i % 8) * 30;
      const y = 262 + Math.floor(i / 8) * 28;
      g.fillStyle(bottleColors[i % bottleColors.length], 1);
      g.fillRect(x, y, 8, 19);
      g.fillRect(x + 3, y - 5, 2, 6);
    }

    g.fillStyle(0x23212f, 1);
    g.fillRect(132, 214, 270, 122);
    g.fillStyle(0x4c4763, 1);
    g.fillRect(148, 310, 238, 24);
    this.add.text(267, 228, 'DJ', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    [92, 414].forEach((x) => {
      g.fillStyle(0x171820, 1);
      g.fillRect(x, 225, 48, 94);
      g.fillStyle(0x343746, 1);
      g.fillCircle(x + 24, 252, 13);
      g.fillCircle(x + 24, 288, 19);
    });

    this.drawPartyTable(g, 1178, 530);
    this.drawPartyTable(g, 360, 565);

    g.fillStyle(0xd7e2e4, 1);
    g.fillRect(1326, 502, 58, 38);
    g.fillStyle(0x89a8b0, 1);
    g.fillRect(1334, 510, 42, 10);

    [[70, 430], [1600, 470], [1160, 825]].forEach(([x, y]) => {
      g.fillStyle(0x8e6749, 1);
      g.fillRect(x - 12, y + 8, 24, 22);
      g.fillStyle(0x1f6a3d, 1);
      g.fillCircle(x, y, 21);
      g.fillStyle(0x337e4f, 1);
      g.fillCircle(x - 14, y - 6, 11);
      g.fillCircle(x + 14, y - 4, 11);
    });

    const bulbs = [0xffd45b, 0xff6f91, 0x55d7ff, 0xc58cff];
    [[76, 378, 910, 378], [1140, 458, 1590, 446]].forEach(([x1, y1, x2, y2], row) => {
      g.lineStyle(3, 0x24202f, 0.88);
      g.lineBetween(x1, y1, x2, y2);

      for (let i = 0; i <= 8; i += 1) {
        const t = i / 8;
        const x = Phaser.Math.Linear(x1, x2, t);
        const y = Phaser.Math.Linear(x1, x2, t) * 0 + Phaser.Math.Linear(y1, y2, t)
          + (row === 0 ? Math.sin(t * Math.PI) * 4 : Math.sin(t * Math.PI) * 3);
        g.fillStyle(bulbs[(i + row) % bulbs.length], 1);
        g.fillRect(x - 4, y - 4, 8, 8);
      }
    });

    const clutter = [
      [485, 350], [1090, 385], [1190, 740], [1280, 610], [410, 805], [1040, 830],
      [720, 790], [280, 500], [1560, 580], [850, 360], [200, 720], [1240, 450],
      [470, 755], [1180, 870], [840, 805], [1500, 860], [310, 870], [60, 700],
    ];

    clutter.forEach(([x, y], i) => {
      g.fillStyle(i % 3 === 0 ? 0xf1d2a1 : (i % 3 === 1 ? 0x8dc8a1 : 0xcc6f83), 1);
      g.fillRect(x, y, 7, 13);
      if (i % 4 === 0) g.fillRect(x - 5, y + 10, 15, 4);
    });
  }

  drawPartyTable(g, x, y) {
    g.fillStyle(0x5b4337, 1);
    g.fillCircle(x, y, 32);
    g.fillRect(x - 4, y + 24, 8, 36);
    g.fillStyle(0xefddbd, 1);
    g.fillRect(x - 18, y - 9, 7, 12);
    g.fillStyle(0x9bc7d1, 1);
    g.fillRect(x + 8, y - 13, 7, 14);
  }

  createCollisions() {
    const zones = [
      { x: WORLD_WIDTH / 2, y: HOUSE_HEIGHT / 2, w: WORLD_WIDTH, h: HOUSE_HEIGHT },
      { x: 1386, y: 258, w: 320, h: 156 },
      { x: 267, y: 275, w: 322, h: 126 },
      { x: 1178, y: 558, w: 72, h: 80 },
      { x: 360, y: 592, w: 72, h: 80 },
      { x: 1354, y: 521, w: 68, h: 50 },
    ];

    zones.forEach(({ x, y, w, h }) => {
      const zone = this.add.rectangle(x, y, w, h, 0xff0000, 0);
      this.physics.add.existing(zone, true);
      this.obstacles.push(zone);
      this.physics.add.collider(this.player, zone);
    });
  }

  update() {
    super.update();
    if (!this.player?.body) return;

    const velocity = this.player.body.velocity;
    const moving = Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5;

    if (moving) {
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        this.playerFacing = velocity.x > 0 ? 'right' : 'left';
      } else {
        this.playerFacing = velocity.y > 0 ? 'down' : 'up';
      }

      const walkKey = `tambu-walk-${this.playerFacing}`;
      if (this.player.anims.currentAnim?.key !== walkKey) {
        this.player.play(walkKey, true);
      }
    } else {
      const idleKey = `tambu-idle-${this.playerFacing ?? 'down'}`;
      if (this.player.anims.currentAnim?.key !== idleKey) {
        this.player.play(idleKey, true);
      }
    }
  }
}
