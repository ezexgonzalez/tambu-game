import Phaser from 'phaser';
import {
  createCharacters,
  destroyCharacterSprites,
  preloadCharacters,
} from '../characters/createCharacters.js';
import { createPlayer, preloadPlayer } from '../player/createPlayer.js';
import { updatePlayer } from '../player/updatePlayer.js';
import {
  canInteractWithCharacter,
  createGameState,
  getBathroomAttemptNumber,
  getCompletedBathroomResults,
  isCharacterResolved,
  settleBathroomResult,
} from '../state/gameState.js';
import { createRunState, getRunSummary, RUN_PHASES } from '../state/runState.js';
import { createDialogueSystem } from '../systems/dialogueSystem.js';
import { createInteractionSystem } from '../systems/interactionSystem.js';
import { createOutcomeEventSystem } from '../systems/outcomeEventSystem.js';
import { createBathroomEvent } from '../events/bathroomEvent.js';
import { getBathroomResistanceConfig } from '../events/bathroomResistance.js';
import { getBathroomResistanceNarrative } from '../data/bathroomResistanceNarrative.js';
import { preloadPortraitReactions } from '../ui/portraitReactionUi.js';
import { createNightIntro } from '../events/nightIntro.js';
import { createResolvedCharacterReturnSystem } from '../events/resolvedCharacterReturn.js';
import { createHud } from '../ui/createHud.js';
import { createGameOverUi } from '../ui/gameOverUi.js';
import { createNormalEndUi } from '../ui/normalEndUi.js';
import { createPerfectNightUi } from '../ui/perfectNightUi.js';
import { createPatioCollisions } from '../world/createPatioCollisions.js';
import { createPatioWorld, preloadPatioWorld } from '../world/createPatioWorld.js';
import { PATIO_LAYOUT } from '../world/patioLayout.js';

export function getBathroomResistanceConfigForRun(gameState) {
  return getBathroomResistanceConfig(getBathroomAttemptNumber(gameState));
}

export function getBathroomEventConfigForRun(gameState) {
  const attemptNumber = getBathroomAttemptNumber(gameState);
  const previousResults = getCompletedBathroomResults(gameState);
  return {
    resistanceConfig: getBathroomResistanceConfig(attemptNumber),
    narrative: getBathroomResistanceNarrative({ attemptNumber, previousResults }),
  };
}

export class PatioScene extends Phaser.Scene {
  constructor() {
    super('PatioScene');
  }

  preload() {
    preloadPatioWorld(this);
    preloadPlayer(this);
    preloadCharacters(this);
    preloadPortraitReactions(this);
  }

  create() {
    this.gameState = createGameState();
    this.runState = createRunState();
    this.configureWorld();

    createPatioWorld(this);
    this.interactables = createCharacters(this);
    this.player = createPlayer(this);
    this.obstacles = createPatioCollisions(this, this.player.sprite);

    const hud = createHud(this, this.gameState);
    this.hud = hud;
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
        bathroom: (request) => {
          const eventConfig = getBathroomEventConfigForRun(this.gameState);
          return createBathroomEvent(this, {
            ...request,
            player: this.player,
            layout: PATIO_LAYOUT.events.bathroom,
            ...eventConfig,
            onCompanionReturn: this.resolvedCharacterReturnSystem.start,
            onBathroomResolved: ({ characterId, result }) => {
              const settled = settleBathroomResult(this.gameState, characterId, result);
              if (settled) onGameStateChange(this.gameState);
              return settled;
            },
          });
        },
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
    this.gameOverUi = createGameOverUi(this, {
      hud,
      onRetry: () => this.scene.restart(),
    });
    this.perfectNightUi = createPerfectNightUi(this, {
      hud,
      onContinue: () => this.runState.continueParty(),
    });
    this.normalEndUi = createNormalEndUi(this, {
      hud,
      onReplay: () => this.scene.restart(),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.nightIntro.destroy();
      this.outcomeEventSystem.stop();
      this.resolvedCharacterReturnSystem.destroy();
      destroyCharacterSprites(this.interactables);
      this.gameOverUi.destroy();
      this.perfectNightUi.destroy();
      this.normalEndUi.destroy();
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

    if (this.runState.getPhase() === RUN_PHASES.INTRO) {
      if (!this.nightIntro.isComplete()) {
        this.nightIntro.update(this.game.loop.delta);
        if (!this.nightIntro.isComplete()) return;
      }
      this.runState.completeIntro();
    }

    const phase = this.runState.getPhase();
    if (phase === RUN_PHASES.GAME_OVER) {
      this.interactionSystem.hidePrompt();
      this.gameOverUi.show();
      this.gameOverUi.update(this.game.loop.delta);
      return;
    }
    if (phase === RUN_PHASES.PERFECT_NIGHT) {
      this.resolvedCharacterReturnSystem.update(this.game.loop.delta);
      this.interactionSystem.hidePrompt();
      this.perfectNightUi.show();
      this.perfectNightUi.update(this.game.loop.delta);
      return;
    }
    if (phase === RUN_PHASES.NORMAL_END) {
      this.interactionSystem.hidePrompt();
      this.normalEndUi.update(this.game.loop.delta);
      return;
    }

    this.resolvedCharacterReturnSystem.update(this.game.loop.delta);

    this.outcomeEventSystem.update();
    if (this.outcomeEventSystem.isActive()) {
      this.interactionSystem.hidePrompt();
      return;
    }

    this.dialogueSystem.update();
    if (this.outcomeEventSystem.isActive()) {
      this.interactionSystem.hidePrompt();
      return;
    }

    if (this.dialogueSystem.isOpen()) {
      this.interactionSystem.hidePrompt();
      updatePlayer(this.player, { canMove: false });
      return;
    }

    if (
      this.runState.getPhase() === RUN_PHASES.PARTY_ACTIVE
      && !this.outcomeEventSystem.isActive()
      && !this.dialogueSystem.isOpen()
    ) {
      this.runState.evaluate(this.gameState);
      const phaseAfterEvaluation = this.runState.getPhase();
      if (phaseAfterEvaluation === RUN_PHASES.GAME_OVER) {
        this.player.sprite.setVelocity(0, 0);
        this.interactionSystem.hidePrompt();
        this.gameOverUi.show();
        return;
      }
      if (phaseAfterEvaluation === RUN_PHASES.PERFECT_NIGHT) {
        this.player.sprite.setVelocity(0, 0);
        this.interactionSystem.hidePrompt();
        this.perfectNightUi.show();
        return;
      }
      if (phaseAfterEvaluation === RUN_PHASES.NORMAL_END) {
        this.player.sprite.setVelocity(0, 0);
        this.interactionSystem.hidePrompt();
        this.normalEndUi.show(getRunSummary(this.gameState));
        return;
      }
      if (phaseAfterEvaluation !== RUN_PHASES.PARTY_ACTIVE) return;
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
