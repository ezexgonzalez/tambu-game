import Phaser from 'phaser';
import { createCharacters, preloadCharacters } from '../characters/createCharacters.js';
import { createPlayer, preloadPlayer } from '../player/createPlayer.js';
import { updatePlayer } from '../player/updatePlayer.js';
import {
  canInteractWithCharacter,
  createGameState,
  isCharacterResolved,
  settleBathroomResult,
} from '../state/gameState.js';
import { createDialogueSystem } from '../systems/dialogueSystem.js';
import { createInteractionSystem } from '../systems/interactionSystem.js';
import { createOutcomeEventSystem } from '../systems/outcomeEventSystem.js';
import { createBathroomEvent } from '../events/bathroomEvent.js';
import { createNightIntro } from '../events/nightIntro.js';
import { createResolvedCharacterReturnSystem } from '../events/resolvedCharacterReturn.js';
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
    preloadCharacters(this);
  }

  create() {
    this.gameState = createGameState();
    this.configureWorld();

    createPatioWorld(this);
    this.interactables = createCharacters(this);
    this.player = createPlayer(this);
    this.obstacles = createPatioCollisions(this, this.player.sprite);

    const hud = createHud(this, this.gameState);
    let interactionSystem = null;
    const onGameStateChange = (gameState) => {
      hud.update(gameState);
      interactionSystem?.syncMarkers((characterId) => (
        isCharacterResolved(gameState, characterId)
      ));
    };
    this.resolvedCharacterReturnSystem = createResolvedCharacterReturnSystem(
      PATIO_LAYOUT.events.bathroom,
    );
    this.outcomeEventSystem = createOutcomeEventSystem({
      handlers: {
        bathroom: (request) => createBathroomEvent(this, {
          ...request,
          player: this.player,
          layout: PATIO_LAYOUT.events.bathroom,
          onCompanionReturn: this.resolvedCharacterReturnSystem.start,
          onBathroomResolved: ({ characterId, result }) => {
            const settled = settleBathroomResult(this.gameState, characterId, result);
            if (settled) onGameStateChange(this.gameState);
            return settled;
          },
        }),
      },
    });
    this.dialogueSystem = createDialogueSystem(this, {
      gameState: this.gameState,
      onGameStateChange,
      onOutcomeEvent: this.outcomeEventSystem.start,
    });
    interactionSystem = createInteractionSystem({
      scene: this,
      player: this.player.sprite,
      interactables: this.interactables,
      prompt: hud.interactionPrompt,
      onInteract: this.dialogueSystem.open,
      canInteract: ({ character }) => canInteractWithCharacter(this.gameState, character.id),
    });
    interactionSystem.syncMarkers((characterId) => (
      isCharacterResolved(this.gameState, characterId)
    ));
    this.interactionSystem = interactionSystem;

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.nightIntro = createNightIntro(this, { player: this.player, hud });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.nightIntro.destroy();
      this.outcomeEventSystem.stop();
      this.resolvedCharacterReturnSystem.destroy();
    });
  }

  configureWorld() {
    const { x, y, width, height } = PATIO_LAYOUT.world;
    this.physics.world.setBounds(x, y, width, height);
    this.cameras.main.setBounds(x, y, width, height);
    this.cameras.main.setBackgroundColor('#10151f');
  }

  update() {
    if (!this.player?.sprite) return;

    if (!this.nightIntro.isComplete()) {
      this.nightIntro.update(this.game.loop.delta);
      if (!this.nightIntro.isComplete()) return;
    }

    this.resolvedCharacterReturnSystem.update(this.game.loop.delta);

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
