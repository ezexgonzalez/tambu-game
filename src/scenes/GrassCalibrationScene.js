import Phaser from 'phaser';
import { createTambuAnimations } from '../animations/createTambuAnimations.js';
import { TAMBU_SPRITE } from '../data/tambuSprite.js';
import { preloadPlayer } from '../player/createPlayer.js';
import { createGrass } from '../world/grass/createGrass.js';
import { GRASS_CALIBRATION_LAYOUT } from '../world/grass/grassLayout.js';
import { preloadGrass } from '../world/grass/preloadGrass.js';

const SCENE_KEY = 'GrassCalibrationScene';

function getRequestedSpot() {
  const params = new URLSearchParams(window.location.search);
  return params.get('grassSpot') === 'dense' ? 'dense' : 'quiet';
}

export class GrassCalibrationScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEY);
  }

  preload() {
    preloadGrass(this);
    preloadPlayer(this);
  }

  create() {
    const { bounds, tambuSpots } = GRASS_CALIBRATION_LAYOUT;
    const spot = tambuSpots[getRequestedSpot()];

    this.cameras.main.setBackgroundColor('#10151f');
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.cameras.main.setZoom(1);
    this.cameras.main.setViewport(
      Math.floor((this.scale.width - bounds.width) / 2),
      Math.floor((this.scale.height - bounds.height) / 2),
      bounds.width,
      bounds.height,
    );
    createGrass(this, GRASS_CALIBRATION_LAYOUT);

    createTambuAnimations(this);
    this.add.ellipse(spot.x, spot.y + 20, 22, 7, 0x111827, 0.42).setDepth(0);
    this.add.sprite(spot.x, spot.y, TAMBU_SPRITE.key, 0)
      .setScale(TAMBU_SPRITE.scale)
      .setDepth(1)
      .play(`${TAMBU_SPRITE.key}-idle-down`);
  }
}

export const GRASS_CALIBRATION_SCENE_KEY = SCENE_KEY;
