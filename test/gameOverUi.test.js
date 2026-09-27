import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

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
const { createGameOverUi } = await import('../src/ui/gameOverUi.js');
hooks.deregister();

function displayObject(type, args) {
  return {
    type,
    args,
    visible: true,
    destroyed: false,
    setOrigin(...value) { this.origin = value; return this; },
    setScrollFactor(value) { this.scrollFactor = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    destroy() { this.destroyed = true; },
  };
}

function createScene() {
  const objects = [];
  const keys = new Map();
  let restartCount = 0;
  const scene = {
    scale: { width: 1280, height: 720 },
    input: { keyboard: {
      addKey(code) {
        const key = { code, justDown: false };
        keys.set(code, key);
        return key;
      },
    } },
    scene: { restart() { restartCount += 1; } },
    add: {
      rectangle(...args) { const object = displayObject('rectangle', args); objects.push(object); return object; },
      text(...args) { const object = displayObject('text', args); objects.push(object); return object; },
    },
  };
  return { scene, objects, keys, getRestartCount: () => restartCount };
}

test('Game Over cubre la pantalla, oculta HUD y muestra únicamente copy y retry', () => {
  const { scene, objects } = createScene();
  const visibility = [];
  const ui = createGameOverUi(scene, { hud: { setVisible: (value) => visibility.push(value) } });

  assert.deepEqual(objects[0].args, [0, 0, 1280, 720, 0xd71920]);
  assert.equal(objects[1].args[2], 'SOS UN HIJO DE PUTA');
  assert.equal(objects[2].args[2], 'ENTER / SPACE · REINTENTAR');
  assert.equal(ui.update(), false);
  assert.equal(ui.show(), true);
  assert.equal(ui.isVisible(), true);
  assert.deepEqual(visibility, [false]);
  assert.ok(objects.every(({ visible }) => visible));
});

test('ENTER o SPACE solicita una sola vez el restart y destroy limpia la UI', () => {
  const { scene, objects, keys, getRestartCount } = createScene();
  const ui = createGameOverUi(scene, { hud: { setVisible() {} }, onRetry: () => scene.scene.restart() });
  ui.show();

  keys.get(13).justDown = true;
  keys.get(32).justDown = true;
  assert.equal(ui.update(), true);
  assert.equal(getRestartCount(), 1);

  keys.get(32).justDown = true;
  assert.equal(ui.update(), false);
  assert.equal(getRestartCount(), 1);

  assert.equal(ui.destroy(), true);
  assert.equal(ui.destroy(), false);
  assert.ok(objects.every(({ destroyed }) => destroyed));
});
