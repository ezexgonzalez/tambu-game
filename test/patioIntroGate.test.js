import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Scene: class Scene {},
  Math: { Vector2: class Vector2 {
    constructor(x, y) { this.x = x; this.y = y; }
    lengthSq() { return this.x * this.x + this.y * this.y; }
    normalize() { const length = Math.sqrt(this.lengthSq()) || 1; this.x /= length; this.y /= length; return this; }
    scale(amount) { this.x *= amount; this.y *= amount; return this; }
  } },
};
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'phaser'
      ? { url: phaserMock, shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { PatioScene } = await import('../src/scenes/PatioScene.js');
hooks.deregister();
import { createGameState } from '../src/state/gameState.js';
import { createRunState, RUN_PHASES } from '../src/state/runState.js';

function createScene({ completeOnUpdate = false, outcomeActive = false, dialogueActive = false } = {}) {
  const scene = Object.create(PatioScene.prototype);
  let introComplete = false;
  let introUpdates = 0;
  let returnUpdates = 0;
  let interactionUpdates = 0;
  let gameOverShows = 0;
  let gameOverUpdates = 0;
  let perfectNightShows = 0;
  let perfectNightUpdates = 0;
  let interactionHides = 0;
  let outcomeActiveNow = outcomeActive;
  let dialogueActiveNow = dialogueActive;
  let closeDialogueOnNextUpdate = false;
  scene.gameState = createGameState();
  scene.runState = createRunState();
  scene.player = {
    facing: 'down',
    input: {
      cursors: Object.fromEntries(['left', 'right', 'up', 'down'].map((key) => [key, { isDown: false }])),
      wasd: Object.fromEntries(['left', 'right', 'up', 'down'].map((key) => [key, { isDown: false }])),
    },
    label: { setPosition() {}, setDepth() {} },
    sprite: {
      x: 10, y: 20,
      body: { bottom: 48, velocity: { x: 0, y: 0 } },
      anims: { currentAnim: null },
      setDepth() {},
      setVelocity(x, y) {
        this.body.velocity = { x, y };
        this.velocityUpdates = (this.velocityUpdates ?? 0) + 1;
      },
      play(key) { this.anims.currentAnim = { key }; },
    },
  };
  scene.game = { loop: { delta: 16 } };
  scene.nightIntro = {
    isComplete: () => introComplete,
    update() {
      introUpdates += 1;
      if (completeOnUpdate) introComplete = true;
    },
  };
  scene.resolvedCharacterReturnSystem = {
    update() { returnUpdates += 1; },
    isReturning: () => true,
  };
  scene.outcomeEventSystem = {
    update: () => outcomeActiveNow,
    isActive: () => outcomeActiveNow,
    setActive(value) { outcomeActiveNow = value; },
  };
  scene.dialogueSystem = {
    update() {
      if (closeDialogueOnNextUpdate) {
        closeDialogueOnNextUpdate = false;
        dialogueActiveNow = false;
        return true;
      }
      return dialogueActiveNow;
    },
    isOpen: () => dialogueActiveNow,
    setOpen(value) { dialogueActiveNow = value; },
    closeOnNextUpdate() { closeDialogueOnNextUpdate = true; },
  };
  scene.interactionSystem = {
    update() { interactionUpdates += 1; },
    hidePrompt() { interactionHides += 1; },
  };
  scene.gameOverUi = {
    show() { gameOverShows += 1; },
    update() { gameOverUpdates += 1; },
  };
  scene.perfectNightUi = {
    show() { perfectNightShows += 1; },
    update() { perfectNightUpdates += 1; },
    continue() { return scene.runState.continueParty(); },
    destroy() {},
  };
  return {
    scene,
    getIntroUpdates: () => introUpdates,
    getReturnUpdates: () => returnUpdates,
    getInteractionUpdates: () => interactionUpdates,
    getGameOverShows: () => gameOverShows,
    getGameOverUpdates: () => gameOverUpdates,
    getPerfectNightShows: () => perfectNightShows,
    getPerfectNightUpdates: () => perfectNightUpdates,
    getInteractionHides: () => interactionHides,
  };
}

test('PatioScene no ejecuta systems de gameplay mientras la intro está activa', () => {
  const { scene, getIntroUpdates, getReturnUpdates } = createScene();

  scene.update();
  assert.equal(getIntroUpdates(), 1);
  assert.equal(getReturnUpdates(), 0);
  assert.equal(scene.runState.getPhase(), RUN_PHASES.INTRO);
});

test('PatioScene pasa a PARTY_ACTIVE al terminar la intro y actualiza el patio', () => {
  const { scene, getReturnUpdates } = createScene({ completeOnUpdate: true });

  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);
  assert.equal(getReturnUpdates(), 1);
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);
});

test('PatioScene evalúa finales cuando acaban evento y diálogo, sin esperar el retorno de la chica', () => {
  const {
    scene,
    getReturnUpdates,
    getInteractionUpdates,
    getGameOverShows,
    getGameOverUpdates,
  } = createScene({ outcomeActive: true });
  scene.runState.completeIntro();
  scene.gameState.player.lives = 1;
  scene.gameState.relationships.sofi = { resolved: true, outcome: 'rejection' };

  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);

  scene.outcomeEventSystem.setActive(false);
  scene.dialogueSystem.setOpen(true);
  scene.gameState.player.lives = 0;
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);

  scene.dialogueSystem.setOpen(false);
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.GAME_OVER);
  assert.equal(getGameOverShows(), 1);
  assert.equal(getInteractionUpdates(), 0);
  const stoppedVelocityUpdates = scene.player.sprite.velocityUpdates;

  scene.update();
  assert.equal(getReturnUpdates(), 3);
  assert.equal(getInteractionUpdates(), 0);
  assert.equal(scene.player.sprite.velocityUpdates, stoppedVelocityUpdates);
  assert.equal(getGameOverUpdates(), 1);
});

test('PatioScene no abre otra interacción en el frame que alcanza NORMAL_END', () => {
  const { scene, getInteractionUpdates } = createScene();
  scene.runState.completeIntro();
  for (const id of ['sofi', 'mili', 'cami']) {
    scene.gameState.relationships[id] = { resolved: true, outcome: 'instagram' };
  }

  scene.update();

  assert.equal(scene.runState.getPhase(), RUN_PHASES.NORMAL_END);
  assert.equal(getInteractionUpdates(), 0);
});

test('GAME_OVER se muestra en el mismo frame en que la última conversación se cierra', () => {
  const { scene, getGameOverShows, getInteractionUpdates } = createScene({ dialogueActive: true });
  scene.runState.completeIntro();
  scene.player.input.cursors.right.isDown = true;
  scene.gameState.player.lives = 0;
  scene.gameState.relationships.cami = { resolved: true, outcome: 'rejection' };
  scene.dialogueSystem.closeOnNextUpdate();

  scene.update();

  assert.equal(scene.dialogueSystem.isOpen(), false);
  assert.equal(scene.runState.getPhase(), RUN_PHASES.GAME_OVER);
  assert.equal(getGameOverShows(), 1);
  assert.equal(getInteractionUpdates(), 0);
  assert.deepEqual(scene.player.sprite.body.velocity, { x: 0, y: 0 });
});

test('PERFECT_NIGHT bloquea gameplay mientras la UI espera y POST_WIN_FREE_ROAM devuelve control sin reset', () => {
  const {
    scene,
    getInteractionUpdates,
    getInteractionHides,
    getPerfectNightShows,
    getPerfectNightUpdates,
  } = createScene();
  scene.runState.completeIntro();
  scene.gameState.player.points = 1500;
  for (const characterId of ['sofi', 'mili', 'cami']) {
    scene.gameState.relationships[characterId] = {
      resolved: true,
      outcome: 'bathroom',
      bathroomResult: 'secured',
      rewardSettled: true,
    };
  }
  scene.player.input.cursors.right.isDown = true;
  scene.player.sprite.body.velocity = { x: 160, y: 0 };
  const savedRelationships = structuredClone(scene.gameState.relationships);

  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PERFECT_NIGHT);
  assert.equal(getPerfectNightShows(), 1);
  assert.equal(getPerfectNightUpdates(), 0);
  assert.equal(getInteractionUpdates(), 0);
  assert.equal(scene.player.sprite.body.velocity.x, 0);

  const savedPosition = { x: scene.player.sprite.x, y: scene.player.sprite.y };
  scene.update();
  assert.equal(getPerfectNightUpdates(), 1);
  assert.equal(getInteractionUpdates(), 0);
  assert.ok(getInteractionHides() > 0);
  assert.deepEqual(scene.player.sprite.body.velocity, { x: 0, y: 0 });

  assert.equal(scene.perfectNightUi.continue(), true);
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.POST_WIN_FREE_ROAM);
  assert.equal(getInteractionUpdates(), 1);
  assert.deepEqual({ x: scene.player.sprite.x, y: scene.player.sprite.y }, savedPosition);
  assert.deepEqual(scene.gameState.relationships, savedRelationships);
  assert.equal(scene.gameState.player.points, 1500);
  assert.equal(scene.runState.evaluate(scene.gameState), false);
  assert.equal(scene.runState.getPhase(), RUN_PHASES.POST_WIN_FREE_ROAM);
});
