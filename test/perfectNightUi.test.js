import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { createGameState } from '../src/state/gameState.js';
import { createRunState, RUN_PHASES } from '../src/state/runState.js';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Input: { Keyboard: {
    KeyCodes: { ENTER: 13, SPACE: 32 },
    JustDown(key) { const pressed = key.justDown; key.justDown = false; return pressed; },
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
const {
  createPerfectNightUi,
  PERFECT_NIGHT_COPY,
  PERFECT_NIGHT_TIMINGS,
} = await import('../src/ui/perfectNightUi.js');
hooks.deregister();

function displayObject(type, args = []) {
  return {
    type,
    args,
    visible: true,
    destroyed: false,
    rectangles: [],
    setOrigin(...value) { this.origin = value; return this; },
    setPosition(...value) { this.position = value; return this; },
    setScrollFactor(value) { this.scrollFactor = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    fillStyle(...value) { this.fill = value; return this; },
    fillRect(...value) { this.rectangles.push(value); return this; },
    destroy() { this.destroyed = true; },
  };
}

function createScene() {
  const objects = [];
  const keys = new Map();
  const scene = {
    scale: { width: 1280, height: 720 },
    input: { keyboard: {
      addKey(code) {
        const key = { code, justDown: false };
        keys.set(code, key);
        return key;
      },
    } },
    add: {
      rectangle(...args) { const object = displayObject('rectangle', args); objects.push(object); return object; },
      graphics() { const object = displayObject('graphics'); objects.push(object); return object; },
    },
  };
  return { scene, objects, keys };
}

test('Perfect Night conserva HUD 700 ms y muestra overlay pixelado antes del prompt', () => {
  const { scene, objects } = createScene();
  const hudVisibility = [];
  let continueCount = 0;
  const ui = createPerfectNightUi(scene, {
    hud: { setVisible: (visible) => hudVisibility.push(visible) },
    onContinue: () => { continueCount += 1; return true; },
  });

  assert.equal(objects[0].args[5], 0.97);
  assert.deepEqual(PERFECT_NIGHT_COPY, {
    count: '3 / 3',
    title: 'NOCHE PERFECTA',
    subtitle: '3 BAÑOS ASEGURADOS',
    continuePrompt: 'ENTER / SPACE · SEGUIR DE FIESTA',
  });
  assert.equal(objects[0].visible, false);
  assert.equal(ui.show(), true);
  assert.equal(ui.getPhase(), 'victory-beat');
  assert.equal(ui.update(PERFECT_NIGHT_TIMINGS.victoryBeat - 1), false);
  assert.deepEqual(hudVisibility, []);
  assert.ok(objects.every(({ visible }) => !visible));

  assert.equal(ui.update(1), false);
  assert.equal(ui.isVisible(), true);
  assert.deepEqual(hudVisibility, [false]);
  assert.ok(objects.slice(1, 4).every(({ visible, rectangles }) => visible && rectangles.length > 0));
  assert.equal(objects[4].visible, false);
  assert.equal(ui.isContinueReady(), false);
  assert.equal(continueCount, 0);

  ui.destroy();
});

test('continuar requiere una pulsación posterior al prompt y preserva la run en POST_WIN_FREE_ROAM', () => {
  const { scene, objects, keys } = createScene();
  const gameState = createGameState();
  gameState.player.points = 1500;
  for (const characterId of ['sofi', 'mili', 'cami']) {
    gameState.relationships[characterId] = {
      resolved: true,
      outcome: 'bathroom',
      bathroomResult: 'secured',
      rewardSettled: true,
    };
  }
  const runState = createRunState();
  runState.completeIntro();
  assert.equal(runState.evaluate(gameState), true);
  assert.equal(runState.getPhase(), RUN_PHASES.PERFECT_NIGHT);

  const hudVisibility = [];
  const ui = createPerfectNightUi(scene, {
    hud: { setVisible: (visible) => hudVisibility.push(visible) },
    onContinue: () => runState.continueParty(),
  });
  ui.show();

  keys.get(13).justDown = true;
  ui.update(PERFECT_NIGHT_TIMINGS.victoryBeat);
  keys.get(32).justDown = true;
  ui.update(300);
  keys.get(13).justDown = true;
  ui.update(PERFECT_NIGHT_TIMINGS.continuePrompt - 300);
  assert.equal(ui.isContinueReady(), true);
  assert.equal(objects[4].visible, true);
  assert.equal(runState.getPhase(), RUN_PHASES.PERFECT_NIGHT);

  keys.get(13).justDown = true;
  keys.get(32).justDown = true;
  assert.equal(ui.update(16), true);
  assert.equal(runState.getPhase(), RUN_PHASES.POST_WIN_FREE_ROAM);
  assert.equal(runState.evaluate(gameState), false);
  assert.equal(runState.getPhase(), RUN_PHASES.POST_WIN_FREE_ROAM);
  assert.equal(ui.isActive(), false);
  assert.ok(objects.every(({ visible }) => !visible));
  assert.deepEqual(hudVisibility, [false, true]);
  assert.equal(gameState.player.points, 1500);
  assert.equal(Object.keys(gameState.relationships).length, 3);
  assert.ok(Object.values(gameState.relationships).every((relationship) => (
    relationship.outcome === 'bathroom' && relationship.bathroomResult === 'secured'
  )));

  ui.destroy();
});
