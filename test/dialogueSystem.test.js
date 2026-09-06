import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { createGameState } from '../src/state/gameState.js';
import { patioWomen } from '../src/data/patioCharacters.js';
import { normalizeDialogueSequence } from '../src/ui/dialoguePresentation.js';

// Exercise the real controller and UI without a browser or Phaser renderer.
// JustDown consumes a key edge, as Phaser does; a held key creates no new edge.
const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Input: { Keyboard: {
    KeyCodes: Object.fromEntries(['ESC','ENTER','SPACE','C','ONE','TWO','THREE','FOUR'].map(k => [k,k])),
    JustDown(key) { const down = key.edge; key.edge = false; return down; }
  } },
  Scenes: { Events: { SHUTDOWN: 'shutdown' } }
};
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'phaser'
      ? { url: phaserMock, shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createDialogueSystem } = await import('../src/systems/dialogueSystem.js');
hooks.deregister();

function harness(character = patioWomen[0], options = {}) {
  const keys = {};
  const objects = [];
  const eventRequests = [];
  const interactable = options.interactable ?? { character };
  let onShutdown;
  let hudUpdates = 0;
  function display(x, y, text = '') {
    const object = {
      x, y, text, visible: true, destroyed: false,
      setScrollFactor() { return this; },
      setDepth() { return this; },
      setStrokeStyle() { return this; },
      setOrigin() { return this; },
      setStyle() { return this; },
      setText(value) { this.text = value; return this; },
      setVisible(value) { this.visible = value; return this; },
      destroy() { this.destroyed = true; },
    };
    objects.push(object);
    return object;
  }
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false, held: false }; return keys[code]; } } },
    add: { text: display, rectangle: (x, y) => display(x, y) },
    events: { once(event, callback) { onShutdown = callback; } },
    game: { loop: { delta: 0 } },
  };
  const state = createGameState();
  const system = createDialogueSystem(scene, {
    gameState: state, onGameStateChange() { hudUpdates += 1; },
    onOutcomeEvent(request) {
      eventRequests.push(request);
      return options.startOutcomeEvent ?? false;
    },
  });
  function frame(delta = 0) {
    scene.game.loop.delta = delta;
    return system.update();
  }
  function press(...codes) {
    codes.forEach((code) => { if (!keys[code].held) keys[code].edge = true; });
    const locked = frame();
    codes.forEach((code) => { keys[code].held = false; });
    return locked;
  }
  function textAt(y) {
    return objects.findLast((object) => !object.destroyed && object.visible && object.y === y)?.text;
  }
  return {
    system, state, objects, keys, frame, press, textAt, eventRequests, interactable,
    open() { system.open(interactable); },
    shutdown() { onShutdown(); },
    hudUpdates: () => hudUpdates,
  };
}

function completeSequence(h, sequence) {
  for (const entry of sequence) {
    assert.equal(h.press('ENTER'), true);
    assert.equal(h.textAt(433), entry.text);
    assert.equal(h.press('SPACE'), true);
  }
}

function playDialogueRoute(h, route) {
  const choiceKeys = ['ONE', 'TWO', 'THREE', 'FOUR'];
  h.open();
  route.forEach((choiceIndex, beatIndex) => {
    h.press('ENTER');
    h.press(choiceKeys[choiceIndex]);
    completeSequence(
      h,
      normalizeDialogueSequence(
        patioWomen[0].conversation.beats[beatIndex].choices[choiceIndex],
        'Sofi',
      ),
    );
  });
}

test('prompt bloquea opciones/C y descarta teclas anticipadas, incluso al completarse', () => {
  const h = harness();
  h.open();
  assert.equal(h.textAt(510), '');
  assert.equal(h.textAt(568), undefined);
  h.press('ONE', 'C');
  assert.equal(h.system.getMode(), 'question');
  h.press('ENTER', 'FOUR', 'C');
  assert.equal(h.system.getMode(), 'question');
  assert.equal(h.textAt(510), patioWomen[0].conversation.beats[0].prompt);
  assert.ok(h.textAt(568));
  h.frame();
  assert.equal(h.system.getMode(), 'question');
  assert.deepEqual(h.state.relationships, {});
});

test('papi avanza intervención por intervención; ENTER+SPACE no deja un salto pendiente', () => {
  const h = harness();
  h.open();
  h.press('ENTER');
  h.press('FOUR');
  const sequence = normalizeDialogueSequence(patioWomen[0].conversation.beats[0].choices[3], 'Sofi');
  for (const entry of sequence) {
    assert.equal(h.system.getMode(), 'reaction');
    assert.equal(h.textAt(395), entry.speaker?.toUpperCase() ?? '');
    assert.equal(h.textAt(433), '');
    assert.equal(h.press('ENTER', 'SPACE'), true);
    assert.equal(h.textAt(433), entry.text);
    h.frame();
    assert.equal(h.textAt(433), entry.text);
    h.press('SPACE');
  }
  assert.equal(h.system.getMode(), 'question');
  assert.equal(h.textAt(478), '2 / 4');
  assert.equal(h.textAt(510), '');
});

test('mantener ENTER no repite el avance; soltar y pulsar vuelve a avanzar', () => {
  const h = harness();
  h.open();
  h.press('ENTER');
  h.press('ONE');
  h.keys.ENTER.edge = true;
  h.keys.ENTER.held = true;
  h.frame();
  const first = h.textAt(433);
  for (let frame = 0; frame < 20; frame += 1) h.frame(28);
  assert.equal(h.textAt(433), first);
  h.keys.ENTER.held = false;
  h.press('ENTER');
  assert.equal(h.textAt(395), 'TAMBU');
  assert.equal(h.textAt(433), '');
});

test('reaction + bridge completo, Consejo, outcome/HUD y bloqueo siguen funcionando', () => {
  const h = harness();
  h.open();
  const choiceKeys = ['ONE', 'TWO', 'THREE', 'FOUR'];
  const route = [0, 3, 0, 0];
  for (let beatIndex = 0; beatIndex < 4; beatIndex += 1) {
    h.press('ENTER');
    if (beatIndex === 1) {
      h.press('C');
      assert.equal(h.system.getMode(), 'council');
      h.press('ONE');
      assert.deepEqual(h.state.relationships, {});
      h.press('ENTER');
      assert.equal(h.system.getMode(), 'question');
      assert.ok(h.textAt(568));
      h.press('C');
      assert.equal(h.system.getMode(), 'question');
    }
    h.press(choiceKeys[route[beatIndex]]);
    const choice = patioWomen[0].conversation.beats[beatIndex].choices[route[beatIndex]];
    const sequence = normalizeDialogueSequence(choice, 'Sofi');
    for (const entry of sequence) {
      assert.equal(h.press('ENTER'), true);
      assert.equal(h.textAt(433), entry.text);
      assert.equal(h.press('SPACE'), true);
    }
  }
  assert.equal(h.system.getMode(), 'outcome');
  assert.equal(h.state.relationships.sofi.resolved, true);
  assert.equal(h.hudUpdates(), 1);
  const result = structuredClone(h.state);
  h.press('ENTER');
  assert.equal(h.frame(), false);
  h.open();
  assert.equal(h.system.isOpen(), false);
  assert.deepEqual(h.state, result);
});

test('bathroom agrega cierre secuencial y recién después dispara el evento', () => {
  const h = harness(patioWomen[0], {
    startOutcomeEvent: true,
    interactable: { character: patioWomen[0], sprite: { id: 'sofi-sprite' } },
  });

  playDialogueRoute(h, [0, 0, 1, 0]);

  assert.equal(h.system.getMode(), 'outcome-closing');
  assert.equal(h.state.relationships.sofi.outcome, 'bathroom');
  assert.equal(h.state.player.points, 500);
  assert.equal(h.eventRequests.length, 0);
  h.press('ESC');
  assert.equal(h.system.getMode(), 'outcome-closing');

  completeSequence(h, patioWomen[0].conversation.outcomes.bathroom.closingSequence);

  assert.equal(h.eventRequests.length, 1);
  assert.equal(h.eventRequests[0].type, 'bathroom');
  assert.equal(h.eventRequests[0].characterId, 'sofi');
  assert.strictEqual(h.eventRequests[0].interactable, h.interactable);
  assert.equal(h.system.isOpen(), false);
  assert.ok(h.objects.every(({ text }) => !String(text).includes('CITA')));
});

test('ESC y shutdown descartan presentación; reabrir comienza vacío sin recompensa', () => {
  const h = harness();
  h.open();
  h.frame(28);
  h.press('ESC');
  assert.equal(h.system.isOpen(), false);
  h.open();
  assert.equal(h.textAt(510), '');
  h.press('ENTER');
  h.press('FOUR');
  h.press('ESC');
  assert.deepEqual(h.state.relationships, {});
  assert.equal(h.state.player.points, 0);
  h.open();
  h.shutdown();
  assert.equal(h.frame(5000), false);
  assert.ok(h.objects.every(({ destroyed }) => destroyed));
});

test('Mili conserva su reacción y ESC para cerrar', () => {
  const h = harness(patioWomen[1]);
  h.open();
  h.frame(10000);
  h.press('ONE');
  h.press('ENTER');
  assert.equal(h.textAt(433), patioWomen[1].conversation.beats[0].choices[0].reaction);
  h.press('ENTER');
  assert.equal(h.system.getMode(), 'reaction');
  h.press('ESC');
  assert.equal(h.frame(), false);
  assert.deepEqual(h.state.relationships, {});
});
