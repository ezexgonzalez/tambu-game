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
const {
  createNormalEndUi,
  formatNormalEndSummary,
  NORMAL_END_COPY,
  NORMAL_END_TIMINGS,
} = await import('../src/ui/normalEndUi.js');
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
    scene: { restart() {} },
    add: {
      rectangle(...args) { const object = displayObject('rectangle', args); objects.push(object); return object; },
      graphics() { const object = displayObject('graphics'); objects.push(object); return object; },
    },
  };
  return { scene, objects, keys };
}

const mixedSummary = {
  points: 825,
  lives: 2,
  resolvedCount: 3,
  securedBathroomCount: 1,
  relationships: {
    cami: { outcome: 'friendzone' },
    mili: { outcome: 'bathroom', bathroomResult: 'secured' },
    sofi: { outcome: 'instagram' },
  },
};

test('el resumen usa orden fijo y etiquetas explícitas desde el snapshot', () => {
  assert.deepEqual(NORMAL_END_COPY, {
    title: 'LA NOCHE DE TAMBU',
    pointsLabel: 'PUNTOS',
    replayPrompt: 'ENTER / SPACE · VOLVER A JUGAR',
  });
  assert.deepEqual(formatNormalEndSummary(mixedSummary), {
    title: 'LA NOCHE DE TAMBU',
    rows: [
      { characterId: 'sofi', characterName: 'SOFI', outcomeLabel: 'INSTAGRAM' },
      { characterId: 'mili', characterName: 'MILI', outcomeLabel: 'BAÑO ASEGURADO' },
      { characterId: 'cami', characterName: 'CAMI', outcomeLabel: 'FRIENDZONE' },
    ],
    pointsLabel: 'PUNTOS',
    points: '825',
    replayPrompt: 'ENTER / SPACE · VOLVER A JUGAR',
  });
});

test('baño interrumpido y rechazo se muestran con su resultado real y puntos exactos', () => {
  const presentation = formatNormalEndSummary({
    points: 1075,
    relationships: {
      sofi: { outcome: 'rejection' },
      mili: { outcome: 'bathroom', bathroomResult: 'interrupted' },
      cami: { outcome: 'instagram' },
    },
  });

  assert.deepEqual(presentation.rows.map(({ characterName, outcomeLabel }) => [
    characterName,
    outcomeLabel,
  ]), [
    ['SOFI', 'RECHAZO'],
    ['MILI', 'BAÑO INTERRUMPIDO'],
    ['CAMI', 'INSTAGRAM'],
  ]);
  assert.equal(presentation.points, '1075');
});

test('el beat de patio conserva el HUD, el resumen aparece a 700 ms y el replay se desbloquea 500 ms después', () => {
  const { scene, objects, keys } = createScene();
  const hudVisibility = [];
  let replayCount = 0;
  const ui = createNormalEndUi(scene, {
    hud: { setVisible: (visible) => hudVisibility.push(visible) },
    onReplay: () => { replayCount += 1; },
  });

  assert.equal(ui.show(mixedSummary), true);
  assert.equal(ui.getPhase(), 'patio-beat');
  assert.equal(ui.isVisible(), false);
  assert.ok(objects.every(({ visible }) => !visible));

  keys.get(13).justDown = true;
  assert.equal(ui.update(NORMAL_END_TIMINGS.patioBeat - 1), false);
  assert.equal(ui.isVisible(), false);
  assert.deepEqual(hudVisibility, []);
  assert.equal(replayCount, 0);

  assert.equal(ui.update(1), false);
  assert.equal(ui.isVisible(), true);
  assert.equal(ui.getPhase(), 'summary');
  assert.deepEqual(hudVisibility, [false]);
  assert.ok(objects.every(({ type }) => type === 'rectangle' || type === 'graphics'));
  assert.ok(objects[0].visible && objects[1].visible);
  assert.equal(objects[2].visible, false);
  assert.ok(objects.slice(3).every(({ visible }) => visible));
  assert.equal(ui.isReplayReady(), false);

  keys.get(32).justDown = true;
  assert.equal(ui.update(NORMAL_END_TIMINGS.replayPrompt - 1), false);
  assert.equal(ui.isReplayReady(), false);
  assert.equal(replayCount, 0);
  assert.equal(ui.update(1), false);
  assert.equal(ui.isReplayReady(), true);
  assert.equal(ui.getPhase(), 'ready');
  assert.equal(objects[2].visible, true);
  assert.equal(replayCount, 0);

  keys.get(13).justDown = true;
  assert.equal(ui.update(16), true);
  assert.equal(replayCount, 1);
  assert.equal(ui.getPhase(), 'restarting');
  keys.get(32).justDown = true;
  assert.equal(ui.update(16), false);
  assert.equal(replayCount, 1);

  assert.equal(ui.destroy(), true);
  assert.equal(ui.destroy(), false);
  assert.ok(objects.every(({ destroyed }) => destroyed));
});
