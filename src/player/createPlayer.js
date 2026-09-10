import Phaser from 'phaser';
import { createTambuAnimations } from '../animations/createTambuAnimations.js';
import { PLAYER_CONFIG } from './playerConfig.js';

export function preloadPlayer(scene) {
  const { sprite } = PLAYER_CONFIG;
  scene.load.spritesheet(sprite.key, sprite.path, {
    frameWidth: sprite.frameWidth,
    frameHeight: sprite.frameHeight,
  });
}

export function createPlayer(scene) {
  const { sprite: spriteConfig, start, initialFacing, label: labelConfig } = PLAYER_CONFIG;

  createTambuAnimations(scene);

  const sprite = scene.physics.add.sprite(start.x, start.y, spriteConfig.key, 0);
  sprite.setScale(spriteConfig.scale);
  sprite.setCollideWorldBounds(true);
  sprite.body.setSize(spriteConfig.bodyWidth, spriteConfig.bodyHeight);
  sprite.body.setOffset(spriteConfig.bodyOffsetX, spriteConfig.bodyOffsetY);
  const footDepth = sprite.body.bottom;
  sprite.setDepth(footDepth);
  sprite.play(`${spriteConfig.key}-idle-${initialFacing}`);

  const label = scene.add.text(
    start.x,
    start.y + labelConfig.initialOffsetY,
    labelConfig.text,
    labelConfig.style,
  ).setOrigin(0.5).setDepth(footDepth + 1);

  const cursors = scene.input.keyboard.createCursorKeys();
  const wasd = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  return {
    sprite,
    label,
    input: { cursors, wasd },
    facing: initialFacing,
  };
}
