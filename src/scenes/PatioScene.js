import Phaser from 'phaser';
import { createCharacters } from '../characters/createCharacters.js';
import { createPlayer, preloadPlayer } from '../player/createPlayer.js';
import { updatePlayer } from '../player/updatePlayer.js';
import { canInteractWithCharacter, createGameState } from '../state/gameState.js';
import { createDialogueSystem } from '../systems/dialogueSystem.js';
import { createInteractionSystem } from '../systems/interactionSystem.js';
import { createOutcomeEventSystem } from '../systems/outcomeEventSystem.js';
import { createBathroomEvent } from '../events/bathroomEvent.js';
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
    this.outcomeEventSystem = createOutcomeEventSystem({
      handlers: {
        bathroom: (request) => createBathroomEvent(this, {
          ...request,
          player: this.player,
          layout: PATIO_LAYOUT.events.bathroom,
        }),
      },
    });
    this.dialogueSystem = createDialogueSystem(this, {
      gameState: this.gameState,
      onGameStateChange: hud.update,
      onOutcomeEvent: this.outcomeEventSystem.start,
    });
    this.interactionSystem = createInteractionSystem({
      scene: this,
      player: this.player.sprite,
      interactables: this.interactables,
      prompt: hud.interactionPrompt,
      onInteract: this.dialogueSystem.open,
      canInteract: ({ character }) => canInteractWithCharacter(this.gameState, character.id),
    });

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.outcomeEventSystem.stop);
  }

  configureWorld() {
    const { x, y, width, height } = PATIO_LAYOUT.world;
    this.physics.world.setBounds(x, y, width, height);
    this.cameras.main.setBounds(x, y, width, height);
    this.cameras.main.setBackgroundColor('#10151f');
  }

  update() {
    if (!this.player?.sprite) return;

    if (this.outcomeEventSystem.update()) {
      this.interactionSystem.hidePrompt();
      return;
    }

    if (this.dialogueSystem.update()) {
      this.interactionSystem.hidePrompt();
      updatePlayer(this.player, { canMove: false });
      return;
    }

    this.interactionSystem.update();
    if (this.dialogueSystem.isOpen()) {
      this.interactionSystem.hidePrompt();
      updatePlayer(this.player, { canMove: false });
      return;
    }
    updatePlayer(this.player);
  }
}
