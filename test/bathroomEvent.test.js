import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Input: { Keyboard: {
    KeyCodes: { ENTER: 'ENTER', SPACE: 'SPACE' },
    JustDown(key) { const down = key.edge; key.edge = false; return down; }
  } }
};
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'phaser'
      ? { url: phaserMock, shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createBathroomEvent } = await import('../src/events/bathroomEvent.js');
hooks.deregister();

function actor(x, y) {
  return {
    x, y, visible: true, depth: y, velocity: { x: 0, y: 0 },
    anims: { currentAnim: null },
    body: {
      enable: true,
      reset(nextX, nextY) { this.x = nextX; this.y = nextY; },
    },
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
    setVisible(visible) { this.visible = visible; return this; },
    setDepth(depth) { this.depth = depth; return this; },
    setVelocity(x, y) { this.velocity = { x, y }; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };
}

function display(x, y, text = '') {
  return {
    x, y, text, visible: true, destroyed: false,
    setScrollFactor() { return this; },
    setDepth() { return this; },
    setStrokeStyle() { return this; },
    setOrigin() { return this; },
    setScale() { return this; },
    setFillStyle() { return this; },
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
    setVisible(visible) { this.visible = visible; return this; },
    setText(text) { this.text = text; return this; },
    destroy() { this.destroyed = true; },
  };
}

test('Sofi y Tambu llegan al acceso real, resisten y Tambu vuelve controlable', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
  };
  const outcome = SOFI_CONVERSATION.outcomes.bathroom;
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  assert.equal(player.sprite.body.enable, false);
  assert.equal(interactable.label.visible, false);
  assert.equal(interactable.marker.visible, false);

  let frames = 0;
  while (event.getMode() === 'walking' && frames < 200) {
    assert.equal(event.update(), true);
    frames += 1;
  }

  assert.ok(frames < 200);
  assert.equal(event.getMode(), 'bathroom-achieved');
  assert.equal(player.sprite.visible, false);
  assert.equal(interactable.sprite.visible, false);
  assert.ok(objects.some(({ text }) => text.includes('BAÑO CONSEGUIDO')));

  keys.ENTER.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'anticipation');
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, 65);
  assert.ok(objects.some(({ text }) => text.includes('RESISTENCIA DEL BAÑO')));

  scene.game.loop.delta = 1000;
  while (event.getMode() === 'resistance') event.update();
  assert.equal(event.getMode(), 'failure');
  assert.ok(objects.some(({ text }) => text.includes('LA PUERTA CEDIÓ')));
  assert.ok(objects.some(({ text }) => text.includes('ENTER · VOLVER AL PATIO')));

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'failure');

  keys.ENTER.edge = true;
  assert.equal(event.update(), false);
  assert.equal(event.getMode(), 'complete');
  assert.equal(player.sprite.visible, true);
  assert.equal(player.sprite.body.enable, true);
  assert.equal(player.sprite.x, PATIO_LAYOUT.events.bathroom.exit.x);
  assert.equal(player.sprite.y, PATIO_LAYOUT.events.bathroom.exit.y);
  assert.equal(interactable.sprite.visible, false);
  assert.ok(objects.filter(({ text }) => text).every(({ destroyed }) => destroyed));
});

test('SPACE sostenido mediante pulsaciones físicas permite asegurar la puerta', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  while (event.getMode() === 'walking') event.update();
  keys.SPACE.edge = true;
  event.update();
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');

  const resistanceBeforeEnter = event.getResistanceState().resistance;
  keys.ENTER.edge = true;
  scene.game.loop.delta = 0;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, resistanceBeforeEnter);
  keys.ENTER.edge = false;

  scene.game.loop.delta = 50;
  while (event.getMode() === 'resistance') {
    keys.SPACE.edge = true;
    event.update();
  }

  assert.equal(event.getMode(), 'success');
  assert.ok(objects.some(({ text }) => text.includes('PUERTA ASEGURADA')));

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'success');

  keys.ENTER.edge = true;
  assert.equal(event.update(), false);
  assert.equal(event.getMode(), 'complete');
});

test('interrumpir la pantalla de resultado nunca deja a Tambu invisible', () => {
  const keys = {};
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: { rectangle: display, text: display },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  while (event.getMode() === 'walking') event.update();
  event.destroy();

  assert.equal(player.sprite.visible, true);
  assert.equal(player.sprite.body.enable, true);
  assert.equal(player.sprite.x, PATIO_LAYOUT.events.bathroom.exit.x);
  assert.equal(player.sprite.y, PATIO_LAYOUT.events.bathroom.exit.y);
});
