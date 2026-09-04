import Phaser from 'phaser';
import { createCharacters } from '../characters/createCharacters.js';
import { createPlayer, preloadPlayer } from '../player/createPlayer.js';
import { updatePlayer } from '../player/updatePlayer.js';
import { createGameState } from '../state/gameState.js';
import { createDialogueSystem } from '../systems/dialogueSystem.js';
import { createInteractionSystem } from '../systems/interactionSystem.js';
import { createHud } from '../ui/createHud.js';
import { createPatioCollisions } from '../world/createPatioCollisions.js';
import { createPatioWorld, preloadPatioWorld } from '../world/createPatioWorld.js';
import { PATIO_LAYOUT } from '../world/patioLayout.js';

export class PatioScene extends Phaser.Scene {
  constructor() {
    super('PatioScene');
  }

  preload() {
    preloadPatioWorld(this);
    preloadPlayer(this);
  }

  create() {
    this.gameState = createGameState();
    this.configureWorld();

    createPatioWorld(this);
    this.interactables = createCharacters(this);
    this.player = createPlayer(this);
    this.obstacles = createPatioCollisions(this, this.player.sprite);

    const hud = createHud(this, this.gameState);
    this.dialogueSystem = createDialogueSystem(this);
    this.interactionSystem = createInteractionSystem({
      scene: this,
      player: this.player.sprite,
      interactables: this.interactables,
      prompt: hud.interactionPrompt,
      onInteract: this.dialogueSystem.open,
    });

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  configureWorld() {
    const { x, y, width, height } = PATIO_LAYOUT.world;
    this.physics.world.setBounds(x, y, width, height);
    this.cameras.main.setBounds(x, y, width, height);
    this.cameras.main.setBackgroundColor('#10151f');
  }

  update() {
    if (!this.player?.sprite) return;

    if (this.dialogueSystem.update()) {
      this.interactionSystem.hidePrompt();
      updatePlayer(this.player, { canMove: false });
      return;
    }

    this.interactionSystem.update();
    updatePlayer(this.player);
  }
}
