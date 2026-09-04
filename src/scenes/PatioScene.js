import Phaser from 'phaser';
import { fillerGroups, patioFriends, patioWomen } from '../data/patioCharacters.js';
import { TERRAIN_TILE, TILE_SIZE } from '../data/terrainTiles.js';

const WORLD = { width: 1680, height: 960 };
const PLAYER_SPEED = 225;
const INTERACT_DISTANCE = 82;

const POOL = {
  x: 512,
  y: 432,
  width: 624,
  height: 304,
};

export class PatioScene extends Phaser.Scene {
  constructor() {
    super('PatioScene');
  }

  preload() {
    this.load.spritesheet('terrain', '/assets/tiles/terrain/terrain.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  create() {
    this.dialogueOpen = false;
    this.interactables = [];
    this.obstacles = [];

    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBackgroundColor('#10151f');

    this.drawTerrain();
    this.drawArchitectureAndProps();
    this.createCharacters();
    this.createPlayer();
    this.createCollisions();
    this.createHud();
    this.createInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

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

    this.add.tileSprite(1392, 720, 176, 240, 'terrain', TERRAIN_TILE.PATH_A)
      .setOrigin(0)
      .setDepth(-18);

    for (let y = 720; y < 960; y += 48) {
      this.add.tileSprite(1408, y, 128, 16, 'terrain', TERRAIN_TILE.PATH_B)
        .setOrigin(0)
        .setDepth(-17)
        .setAlpha(0.45);
    }

    this.add.tileSprite(1392, 720, 16, 240, 'terrain', TERRAIN_TILE.PATH_EDGE_LEFT)
      .setOrigin(0)
      .setDepth(-16);
    this.add.tileSprite(1552, 720, 16, 240, 'terrain', TERRAIN_TILE.PATH_EDGE_RIGHT)
      .setOrigin(0)
      .setDepth(-16);

    this.drawPixelPool();
  }

  drawPixelPool() {
    const { x, y, width, height } = POOL;
    const innerX = x + TILE_SIZE;
    const innerY = y + TILE_SIZE;
    const innerWidth = width - TILE_SIZE * 2;
    const innerHeight = height - TILE_SIZE * 2;

    this.add.rectangle(x + width / 2 + 6, y + height / 2 + 9, width, height, 0x071017, 0.28)
      .setDepth(-14);

    this.add.tileSprite(innerX, innerY, innerWidth, innerHeight, 'terrain', TERRAIN_TILE.WATER_A)
      .setOrigin(0)
      .setDepth(-12);

    for (let rowY = innerY + 32; rowY < innerY + innerHeight - 16; rowY += 64) {
      this.add.tileSprite(innerX + 16, rowY, innerWidth - 32, 16, 'terrain', TERRAIN_TILE.WATER_B)
        .setOrigin(0)
        .setDepth(-11)
        .setAlpha(0.45);
    }

    const glints = this.add.tileSprite(innerX, innerY, innerWidth, innerHeight, 'terrain', TERRAIN_TILE.WATER_GLINT)
      .setOrigin(0)
      .setDepth(-10)
      .setAlpha(0.23);

    this.tweens.add({
      targets: glints,
      tilePositionX: TILE_SIZE,
      duration: 2100,
      ease: 'Linear',
      repeat: -1,
    });

    this.add.tileSprite(x + TILE_SIZE, y, width - TILE_SIZE * 2, TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_EDGE_TOP)
      .setOrigin(0)
      .setDepth(-8);
    this.add.tileSprite(x + TILE_SIZE, y + height - TILE_SIZE, width - TILE_SIZE * 2, TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_EDGE_BOTTOM)
      .setOrigin(0)
      .setDepth(-8);
    this.add.tileSprite(x, y + TILE_SIZE, TILE_SIZE, height - TILE_SIZE * 2, 'terrain', TERRAIN_TILE.POOL_EDGE_LEFT)
      .setOrigin(0)
      .setDepth(-8);
    this.add.tileSprite(x + width - TILE_SIZE, y + TILE_SIZE, TILE_SIZE, height - TILE_SIZE * 2, 'terrain', TERRAIN_TILE.POOL_EDGE_RIGHT)
      .setOrigin(0)
      .setDepth(-8);

    this.add.image(x, y, 'terrain', TERRAIN_TILE.POOL_CORNER_TL).setOrigin(0).setDepth(-7);
    this.add.image(x + width - TILE_SIZE, y, 'terrain', TERRAIN_TILE.POOL_CORNER_TR).setOrigin(0).setDepth(-7);
    this.add.image(x, y + height - TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_CORNER_BL).setOrigin(0).setDepth(-7);
    this.add.image(x + width - TILE_SIZE, y + height - TILE_SIZE, 'terrain', TERRAIN_TILE.POOL_CORNER_BR)
      .setOrigin(0)
      .setDepth(-7);

    const g = this.add.graphics().setDepth(-5);
    g.lineStyle(4, 0xd3d7d8, 1);
    g.strokeCircle(x + width - 58, y + 48, 18);
    g.lineBetween(x + width - 40, y + 38, x + width - 40, y + 88);
    g.lineBetween(x + width - 62, y + 64, x + width - 42, y + 64);

    g.fillStyle(0xf4c95e, 1);
    g.fillCircle(x + 148, y + 128, 22);
    g.fillStyle(0x2a879f, 1);
    g.fillCircle(x + 148, y + 128, 10);
  }

  drawArchitectureAndProps() {
    const g = this.add.graphics();

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

    const bulbs = [0xffd45b, 0xff6f91, 0x55d7ff, 0xc58cff];
    [[40, 385, 1640, 385], [280, 165, 1030, 850]].forEach(([x1, y1, x2, y2], row) => {
      g.lineStyle(3, 0x24202f, 0.9);
      g.lineBetween(x1, y1, x2, y2);
      for (let i = 0; i <= 12; i += 1) {
        const t = i / 12;
        const x = Phaser.Math.Linear(x1, x2, t);
        const y = Phaser.Math.Linear(y1, y2, t);
        g.fillStyle(bulbs[(i + row) % bulbs.length], 1);
        g.fillRect(x - 5, y - 5, 10, 10);
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
    g.fillCircle(x, y, 35);
    g.fillRect(x - 5, y + 28, 10, 42);
    g.fillStyle(0xefddbd, 1);
    g.fillRect(x - 20, y - 10, 8, 14);
    g.fillStyle(0x9bc7d1, 1);
    g.fillRect(x + 9, y - 14, 8, 16);
  }

  createCharacters() {
    fillerGroups.forEach(([x, y, palette, activity]) => {
      const npc = this.drawPerson(x, y, palette);
      if (activity === 'dance') {
        this.tweens.add({ targets: npc, y: y - 5, duration: 320 + (palette % 4) * 70, yoyo: true, repeat: -1 });
      }
      if (activity === 'kiss') {
        this.add.text(x, y - 54, '♥', { fontFamily: 'monospace', fontSize: '13px', color: '#ff7b9c' }).setOrigin(0.5);
      }
    });

    patioFriends.forEach((friend) => {
      const npc = this.drawPerson(friend.x, friend.y, friend.palette);
      this.add.text(friend.x, friend.y + 34, friend.name, {
        fontFamily: 'monospace', fontSize: '11px', color: '#d4d7df',
      }).setOrigin(0.5);
      npc.setDepth(friend.y);
    });

    patioWomen.forEach((woman) => {
      const npc = this.drawPerson(woman.x, woman.y, woman.palette, true);
      npc.setData('character', woman);
      this.interactables.push(npc);
      this.add.text(woman.x, woman.y + 36, woman.name, {
        fontFamily: 'monospace', fontSize: '12px', color: '#fff0b8', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(woman.x, woman.y - 55, '!', {
        fontFamily: 'monospace', fontSize: '20px', color: '#f4cd63', fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  drawPerson(x, y, index, interactive = false) {
    const shirtColors = [0xe8edf2, 0xd44f65, 0x6571c8, 0x3f9a74, 0xc4944c, 0x8965ad, 0x20242d, 0xd99caa];
    const skinColors = [0xe8b990, 0xd79c73, 0xc5835f, 0xf0c8a7];
    const hairColors = [0x1d1715, 0x593a2d, 0xb88652, 0x15151a, 0x7a5139];
    const container = this.add.container(x, y);
    const shadow = this.add.ellipse(0, 23, 26, 8, 0x000000, 0.24);
    const legs = this.add.rectangle(0, 13, 16, 22, 0x252a33, 1);
    const torso = this.add.rectangle(0, -2, 22, 22, shirtColors[index % shirtColors.length], 1);
    const skin = skinColors[index % skinColors.length];
    const head = this.add.rectangle(0, -25, 17, 18, skin, 1);
    const hair = this.add.rectangle(0, -33, 19, 7, hairColors[index % hairColors.length], 1);
    const armL = this.add.rectangle(-13, -1, 4, 16, skin, 1);
    const armR = this.add.rectangle(13, -1, 4, 16, skin, 1);
    container.add([shadow, legs, torso, armL, armR, head, hair]);
    container.setDepth(y);
    if (interactive) container.setScale(1.05);
    return container;
  }

  createPlayer() {
    const textureKey = 'tambu-placeholder-v2';
    const tex = this.textures.createCanvas(textureKey, 30, 46);
    const c = tex.context;
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#1e222a';
    c.fillRect(6, 25, 7, 18);
    c.fillRect(17, 25, 7, 18);
    c.fillStyle = '#24252e';
    c.fillRect(4, 15, 22, 20);
    c.fillStyle = '#edc2a0';
    c.fillRect(6, 2, 18, 16);
    c.fillStyle = '#1b1512';
    c.fillRect(5, 0, 20, 7);
    c.fillRect(5, 6, 5, 7);
    tex.refresh();

    this.player = this.physics.add.sprite(1460, 840, textureKey);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 25);
    this.player.body.setOffset(5, 19);
    this.player.setDepth(2000);

    this.playerLabel = this.add.text(1460, 873, 'TAMBU', {
      fontFamily: 'monospace', fontSize: '12px', color: '#7fe4ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2001);
  }

  createCollisions() {
    const zones = [
      { x: WORLD.width / 2, y: 75, w: WORLD.width, h: 150 },
      { x: POOL.x + POOL.width / 2, y: POOL.y + POOL.height / 2, w: POOL.width, h: POOL.height },
      { x: 1395, y: 271, w: 418, h: 190 },
      { x: 275, y: 278, w: 410, h: 150 },
      { x: 1180, y: 565, w: 80, h: 90 },
      { x: 360, y: 600, w: 80, h: 90 },
      { x: 1360, y: 520, w: 90, h: 65 },
    ];

    zones.forEach(({ x, y, w, h }) => {
      const zone = this.add.rectangle(x, y, w, h, 0xff0000, 0);
      this.physics.add.existing(zone, true);
      this.obstacles.push(zone);
      this.physics.add.collider(this.player, zone);
    });
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.choiceKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    ];
  }

  createHud() {
    const hudBg = this.add.rectangle(1086, 40, 350, 58, 0x090b10, 0.9)
      .setOrigin(0.5).setScrollFactor(0).setDepth(5000);
    hudBg.setStrokeStyle(1, 0xffffff, 0.13);

    this.add.text(935, 27, '♥ ♥ ♥', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff5a65', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(5001);
    this.add.text(1035, 29, 'ALCOHOL  0%', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f1d18a', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(5001);
    this.add.text(1188, 29, '★ 0000', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f4cd63', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(5001);

    this.interactionPrompt = this.add.text(640, 658, '', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f4f4ef', fontStyle: 'bold',
      backgroundColor: '#090b10', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(5001).setVisible(false);
  }

  getNearestWoman() {
    let nearest = null;
    let best = Infinity;
    this.interactables.forEach((npc) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (distance < best) {
        best = distance;
        nearest = npc;
      }
    });
    return best <= INTERACT_DISTANCE ? nearest : null;
  }

  openDialogue(npc) {
    if (!npc || this.dialogueOpen) return;
    this.dialogueOpen = true;
    this.player.setVelocity(0, 0);
    this.currentWoman = npc.getData('character');

    const panel = this.add.rectangle(640, 575, 1160, 248, 0x090b10, 0.97)
      .setScrollFactor(0).setDepth(6000);
    panel.setStrokeStyle(2, 0xffffff, 0.16);

    const name = this.add.text(92, 474, this.currentWoman.name.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffe8a8', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(6001);

    const line = this.add.text(92, 510, this.currentWoman.intro, {
      fontFamily: 'monospace', fontSize: '17px', color: '#f4f4ef', wordWrap: { width: 1080 },
    }).setScrollFactor(0).setDepth(6001);

    const answerTexts = this.currentWoman.answers.map((answer, i) => this.add.text(
      110 + (i % 2) * 555,
      568 + Math.floor(i / 2) * 46,
      `${i + 1}. ${answer}`,
      { fontFamily: 'monospace', fontSize: '14px', color: '#d8dce5', wordWrap: { width: 510 } },
    ).setScrollFactor(0).setDepth(6001));

    const help = this.add.text(1175, 675, '1–4 elegir · ESC cerrar', {
      fontFamily: 'monospace', fontSize: '12px', color: '#8e95a2',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(6001);

    this.dialogueUi = [panel, name, line, ...answerTexts, help];
  }

  resolveDialogue(index) {
    if (!this.dialogueOpen || !this.currentWoman) return;
    const reaction = this.currentWoman.reactions[index] ?? '...';
    this.dialogueUi.forEach((item) => item.destroy());

    const panel = this.add.rectangle(640, 610, 1160, 160, 0x090b10, 0.97)
      .setScrollFactor(0).setDepth(6000);
    panel.setStrokeStyle(2, 0xffffff, 0.16);
    const name = this.add.text(92, 557, this.currentWoman.name.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffe8a8', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(6001);
    const line = this.add.text(92, 593, reaction, {
      fontFamily: 'monospace', fontSize: '17px', color: '#f4f4ef', wordWrap: { width: 1040 },
    }).setScrollFactor(0).setDepth(6001);
    const help = this.add.text(1175, 665, 'ESC cerrar', {
      fontFamily: 'monospace', fontSize: '12px', color: '#8e95a2',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(6001);
    this.dialogueUi = [panel, name, line, help];
    this.currentWoman = null;
  }

  closeDialogue() {
    if (!this.dialogueOpen) return;
    this.dialogueUi?.forEach((item) => item.destroy());
    this.dialogueUi = null;
    this.currentWoman = null;
    this.dialogueOpen = false;
  }

  update() {
    if (!this.player) return;

    this.playerLabel.setPosition(this.player.x, this.player.y + 34);

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey) && this.dialogueOpen) {
      this.closeDialogue();
      return;
    }

    if (this.dialogueOpen) {
      this.player.setVelocity(0, 0);
      this.choiceKeys.forEach((key, i) => {
        if (Phaser.Input.Keyboard.JustDown(key) && this.currentWoman) this.resolveDialogue(i);
      });
      this.interactionPrompt.setVisible(false);
      return;
    }

    const nearest = this.getNearestWoman();
    if (nearest) {
      const woman = nearest.getData('character');
      this.interactionPrompt.setText(`E · HABLAR CON ${woman.name.toUpperCase()}`).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.openDialogue(nearest);
    } else {
      this.interactionPrompt.setVisible(false);
    }

    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) y += 1;

    const direction = new Phaser.Math.Vector2(x, y);
    if (direction.lengthSq() > 0) direction.normalize().scale(PLAYER_SPEED);
    this.player.setVelocity(direction.x, direction.y);
  }
}
