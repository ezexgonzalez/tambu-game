import Phaser from 'phaser';
import { PatioSceneV011 } from './PatioSceneV011.js';
import { TAMBU_SPRITE } from '../data/tambuSprite.js';
import { createTambuAnimations } from '../animations/createTambuAnimations.js';

const PLAYER_START = { x: 1504, y: 890 };

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

    this.player.setScale(TAMBU_SPRITE.scale);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(2000);
    this.player.body.setSize(TAMBU_SPRITE.bodyWidth, TAMBU_SPRITE.bodyHeight);
    this.player.body.setOffset(TAMBU_SPRITE.bodyOffsetX, TAMBU_SPRITE.bodyOffsetY);

    this.playerFacing = 'down';
    this.player.play('tambu-idle-down');

    this.playerLabel = this.add.text(PLAYER_START.x, PLAYER_START.y + 34, 'TAMBU', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#7fe4ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2001);
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
