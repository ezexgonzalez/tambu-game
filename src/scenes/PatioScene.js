import Phaser from 'phaser';

const WORLD = { width: 1600, height: 900 };
const PLAYER_SPEED = 230;

export class PatioScene extends Phaser.Scene {
  constructor() {
    super('PatioScene');
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBackgroundColor('#121722');

    this.drawPatio();
    this.createPlayer();
    this.createHud();
    this.createInput();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
  }

  drawPatio() {
    const g = this.add.graphics();

    // Lawn
    g.fillStyle(0x315c39, 1);
    g.fillRect(0, 130, WORLD.width, WORLD.height - 130);

    // Subtle grass checker pattern
    g.fillStyle(0x2b5234, 1);
    for (let y = 130; y < WORLD.height; y += 48) {
      for (let x = 0; x < WORLD.width; x += 48) {
        if (((x / 48) + (y / 48)) % 2 === 0) g.fillRect(x, y, 48, 48);
      }
    }

    // House / rear wall
    g.fillStyle(0xcfc8b6, 1);
    g.fillRect(0, 0, WORLD.width, 130);
    g.fillStyle(0x9d9584, 1);
    g.fillRect(0, 118, WORLD.width, 12);

    // Windows
    [90, 330, 570, 850].forEach((x) => {
      g.fillStyle(0x302d45, 1);
      g.fillRect(x, 26, 150, 62);
      g.fillStyle(0xd2bd66, 0.8);
      g.fillRect(x + 8, 34, 64, 46);
      g.fillStyle(0x564f75, 1);
      g.fillRect(x + 78, 34, 64, 46);
    });

    // Bathroom door
    g.fillStyle(0x574437, 1);
    g.fillRect(1390, 18, 110, 112);
    g.lineStyle(4, 0x806654, 1);
    g.strokeRect(1390, 18, 110, 112);
    this.add.text(1445, 70, 'WC', {
      fontFamily: 'monospace', fontSize: '18px', color: '#f5f3e8', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Pool
    g.fillStyle(0xe3dfd4, 1);
    g.fillRect(120, 490, 460, 250);
    g.fillStyle(0x2b8da3, 1);
    g.fillRect(140, 510, 420, 210);
    g.fillStyle(0x55bfd0, 0.55);
    for (let y = 540; y < 700; y += 45) g.fillRect(175, y, 350, 5);

    // Bar
    g.fillStyle(0x402938, 1);
    g.fillRect(1140, 180, 360, 150);
    g.fillStyle(0x735064, 1);
    g.fillRect(1126, 300, 388, 34);
    this.add.text(1320, 205, 'BARRA', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffdce9', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Bottle silhouettes
    const bottleColors = [0x7ccf8d, 0xf0bd5f, 0x91a9ff, 0xd96868];
    for (let i = 0; i < 14; i += 1) {
      const x = 1170 + (i % 7) * 42;
      const y = 245 + Math.floor(i / 7) * 34;
      g.fillStyle(bottleColors[i % bottleColors.length], 1);
      g.fillRect(x, y, 10, 24);
      g.fillRect(x + 3, y - 6, 4, 7);
    }

    // DJ booth
    g.fillStyle(0x23212f, 1);
    g.fillRect(700, 175, 270, 105);
    g.fillStyle(0x4c4763, 1);
    g.fillRect(715, 245, 240, 25);
    this.add.text(835, 198, 'DJ', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Entrance path
    g.fillStyle(0xa98a70, 1);
    g.fillRect(1360, 650, 150, 250);

    // Party lights
    const bulbs = [0xffd45b, 0xff6f91, 0x55d7ff, 0xc58cff];
    g.lineStyle(4, 0x24202f, 1);
    g.beginPath();
    g.moveTo(40, 170);
    g.lineTo(1560, 170);
    g.strokePath();
    for (let x = 70, i = 0; x < 1560; x += 120, i += 1) {
      g.fillStyle(bulbs[i % bulbs.length], 1);
      g.fillRect(x, 164, 12, 12);
    }

    // Scattered party clutter
    const clutter = [
      [650, 410], [1030, 495], [935, 690], [1240, 550], [690, 740], [350, 790],
      [1070, 760], [620, 605], [1500, 450], [775, 355], [260, 355],
    ];
    clutter.forEach(([x, y], i) => {
      g.fillStyle(i % 2 === 0 ? 0xf1d2a1 : 0x8dc8a1, 1);
      g.fillRect(x, y, 7, 13);
    });

    // Static silhouettes to establish party density
    const people = [
      [250, 260], [300, 275], [420, 330], [465, 325], [640, 320], [680, 350],
      [1010, 290], [1050, 305], [890, 500], [925, 500], [700, 610], [760, 600],
      [1180, 430], [1230, 455], [580, 430], [530, 400], [1000, 700], [1040, 700],
    ];
    people.forEach(([x, y], i) => this.drawPlaceholderPerson(x, y, i));

    this.add.text(60, WORLD.height - 54, 'FIESTA EN EL PATIO · prototipo visual', {
      fontFamily: 'monospace', fontSize: '15px', color: '#d7d9df',
    }).setScrollFactor(0);
  }

  drawPlaceholderPerson(x, y, index) {
    const colors = [0xe8edf2, 0xd44f65, 0x6571c8, 0x3f9a74, 0xc4944c, 0x8965ad];
    const container = this.add.container(x, y);
    const shadow = this.add.rectangle(0, 22, 24, 7, 0x000000, 0.22);
    const legs = this.add.rectangle(0, 13, 15, 22, 0x252a33, 1);
    const torso = this.add.rectangle(0, -2, 22, 22, colors[index % colors.length], 1);
    const head = this.add.rectangle(0, -24, 17, 17, 0xe4b48f, 1);
    const hair = this.add.rectangle(0, -31, 19, 7, index % 3 === 0 ? 0x1d1715 : 0x593a2d, 1);
    container.add([shadow, legs, torso, head, hair]);
  }

  createPlayer() {
    const textureKey = 'tambu-placeholder';
    const tex = this.textures.createCanvas(textureKey, 28, 44);
    const c = tex.context;
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#222731';
    c.fillRect(6, 23, 7, 18);
    c.fillRect(16, 23, 7, 18);
    c.fillStyle = '#23242c';
    c.fillRect(4, 14, 20, 18);
    c.fillStyle = '#edc2a0';
    c.fillRect(6, 2, 16, 15);
    c.fillStyle = '#1b1512';
    c.fillRect(5, 0, 18, 6);
    c.fillRect(5, 5, 5, 6);
    tex.refresh();

    this.player = this.physics.add.sprite(1430, 810, textureKey);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 24);
    this.player.body.setOffset(4, 18);

    this.add.text(1430, 842, 'TAMBU', {
      fontFamily: 'monospace', fontSize: '13px', color: '#7fe4ff', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  createHud() {
    const hudBg = this.add.rectangle(1086, 40, 350, 58, 0x090b10, 0.88)
      .setOrigin(0.5)
      .setScrollFactor(0);
    hudBg.setStrokeStyle(1, 0xffffff, 0.12);

    this.add.text(935, 27, '♥ ♥ ♥', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ff5a65', fontStyle: 'bold',
    }).setScrollFactor(0);

    this.add.text(1035, 29, 'ALCOHOL  0%', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f1d18a', fontStyle: 'bold',
    }).setScrollFactor(0);

    this.add.text(1188, 29, '★ 0000', {
      fontFamily: 'monospace', fontSize: '15px', color: '#f4cd63', fontStyle: 'bold',
    }).setScrollFactor(0);

    this.add.text(22, 24, 'WASD / FLECHAS · EXPLORAR', {
      fontFamily: 'monospace', fontSize: '14px', color: '#f4f4ef',
      backgroundColor: '#090b10', padding: { x: 12, y: 8 },
    }).setScrollFactor(0);
  }

  update() {
    if (!this.player) return;

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
