import Phaser from 'phaser';
import './styles.css';
import { GrassCalibrationScene } from './scenes/GrassCalibrationScene.js';
import { PatioScene } from './scenes/PatioScene.js';

const isGrassCalibration = import.meta.env.DEV
  && new URLSearchParams(window.location.search).get('scene') === 'grass-calibration';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#07090f',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [isGrassCalibration ? GrassCalibrationScene : PatioScene],
};

new Phaser.Game(config);
