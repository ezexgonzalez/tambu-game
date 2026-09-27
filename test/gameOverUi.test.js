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
const { createGameOverUi, GAME_OVER_TIMINGS } = await import('../src/ui/gameOverUi.js');
hooks.deregister();

function displayObject(type, args) {
  return {
    type,
    args,
    visible: true,
    destroyed: false,
    rects: [],
    setOrigin(...value) { this.origin = value; return this; },
    setPosition(...value) { this.position = value; return this; },
    setScrollFactor(value) { this.scrollFactor = value; return this; },
    setDepth(value) { this.depth = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    fillStyle(...value) { this.fill = value; return this; },
    fillRect(...value) { this.rects.push(value); return this; },
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
      graphics() { const object = displayObject('graphics'); objects.push(object); return object; },
      text(...args) { const object = displayObject('text', args); objects.push(object); return object; },
    },
  };
  return { scene, objects, keys, getRestartCount: () => restartCount };
}

test('Game Over conserva patio y HUD durante el beat y revela el título pixelado después de 900 ms', () => {
  const { scene, objects } = createScene();
  const visibility = [];
  const ui = createGameOverUi(scene, { hud: { setVisible: (value) => visibility.push(value) } });
  const [background, title, retryPrompt] = objects;

  assert.deepEqual(background.args, [0, 0, 1280, 720, 0xd71920]);
  assert.equal(title.type, 'graphics');
  assert.ok(title.rects.length > 100);
  assert.equal(objects.filter(({ type }) => type === 'text').length, 1);
  assert.equal(retryPrompt.args[2], 'ENTER / SPACE · REINTENTAR');
  assert.equal(ui.update(1000), false);
  assert.equal(ui.show(), true);
  assert.equal(ui.isActive(), true);
  assert.equal(ui.isVisible(), false);
  assert.deepEqual(visibility, []);
  assert.ok(objects.every(({ visible }) => !visible));

  assert.equal(ui.update(GAME_OVER_TIMINGS.punchlineDelay - 1), false);
  assert.equal(ui.isVisible(), false);
  assert.deepEqual(visibility, []);
  assert.equal(ui.update(1), false);

  assert.equal(ui.isVisible(), true);
  assert.equal(ui.isRetryReady(), false);
  assert.deepEqual(visibility, [false]);
  assert.equal(background.visible, true);
  assert.equal(title.visible, true);
  assert.equal(retryPrompt.visible, false);
});

test('retry aparece 450 ms después y requiere una pulsación nueva', () => {
  const { scene, objects, keys, getRestartCount } = createScene();
  const ui = createGameOverUi(scene, {
    hud: { setVisible() {} },
    onRetry: () => scene.scene.restart(),
  });
  ui.show();

  keys.get(13).justDown = true;
  assert.equal(ui.update(450), false);
  keys.get(32).justDown = true;
  assert.equal(ui.update(450), false);
  assert.equal(objects[0].visible, true);
  assert.equal(objects[1].visible, true);
  assert.equal(objects[2].visible, false);
  assert.equal(getRestartCount(), 0);

  keys.get(13).justDown = true;
  assert.equal(ui.update(GAME_OVER_TIMINGS.retryPromptDelay), false);
  assert.equal(ui.isRetryReady(), true);
  assert.equal(objects[2].visible, true);
  assert.equal(getRestartCount(), 0);
  assert.equal(ui.update(0), false);
  assert.equal(getRestartCount(), 0);

  keys.get(32).justDown = true;
  assert.equal(ui.update(16), true);
  assert.equal(getRestartCount(), 1);
  keys.get(13).justDown = true;
  assert.equal(ui.update(16), false);
  assert.equal(getRestartCount(), 1);

  assert.equal(ui.destroy(), true);
  assert.equal(ui.destroy(), false);
  assert.ok(objects.every(({ destroyed }) => destroyed));
});
