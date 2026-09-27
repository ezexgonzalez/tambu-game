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
  let outcomeActiveNow = outcomeActive;
  let dialogueActiveNow = dialogueActive;
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
      setVelocity(x, y) { this.body.velocity = { x, y }; },
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
    update: () => dialogueActiveNow,
    isOpen: () => dialogueActiveNow,
    setOpen(value) { dialogueActiveNow = value; },
  };
  scene.interactionSystem = { update() {}, hidePrompt() {} };
  return {
    scene,
    getIntroUpdates: () => introUpdates,
    getReturnUpdates: () => returnUpdates,
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
  const { scene, getReturnUpdates } = createScene({ outcomeActive: true });
  scene.runState.completeIntro();
  scene.gameState.player.lives = 0;
  for (const id of ['sofi', 'mili', 'cami']) {
    scene.gameState.relationships[id] = { resolved: true, outcome: 'rejection' };
  }

  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);

  scene.outcomeEventSystem.setActive(false);
  scene.dialogueSystem.setOpen(true);
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.PARTY_ACTIVE);

  scene.dialogueSystem.setOpen(false);
  scene.update();
  assert.equal(scene.runState.getPhase(), RUN_PHASES.GAME_OVER);
  assert.equal(getReturnUpdates(), 3);
});
