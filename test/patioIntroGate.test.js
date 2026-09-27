import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default { Scene: class Scene {} };
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

test('PatioScene no ejecuta systems de gameplay mientras la intro está activa', () => {
  let introUpdates = 0;
  const scene = Object.create(PatioScene.prototype);
  scene.player = { sprite: {} };
  scene.game = { loop: { delta: 16 } };
  scene.nightIntro = {
    isComplete: () => false,
    update() { introUpdates += 1; },
  };
  scene.resolvedCharacterReturnSystem = { update() { throw Error('return updated'); } };
  scene.outcomeEventSystem = { update() { throw Error('outcome updated'); } };
  scene.dialogueSystem = { update() { throw Error('dialogue updated'); } };
  scene.interactionSystem = { update() { throw Error('interaction updated'); } };

  scene.update();
  assert.equal(introUpdates, 1);
});
