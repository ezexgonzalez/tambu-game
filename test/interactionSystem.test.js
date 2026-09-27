import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { canInteractWithCharacter, createGameState, isCharacterResolved } from '../src/state/gameState.js';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Input: { Keyboard: {
    KeyCodes: { E: 'E' },
    JustDown(key) { const down = key.edge; key.edge = false; return down; }
  } },
  Math: { Distance: { Between(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); } } }
};
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'phaser'
      ? { url: phaserMock, shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createInteractionSystem } = await import('../src/systems/interactionSystem.js');
hooks.deregister();

test('personaje resuelto conserva prompt e interacción E, pero pierde el marker principal', () => {
  const key = { edge: false };
  const marker = {
    visible: true,
    setVisible(value) { this.visible = value; return this; },
  };
  const prompt = {
    visible: false,
    text: '',
    setText(value) { this.text = value; return this; },
    setVisible(value) { this.visible = value; return this; },
  };
  const interactable = {
    character: { id: 'sofi', name: 'Sofi' },
    sprite: { x: 20, y: 20 },
    marker,
    isRelocating: true,
  };
  const state = createGameState();
  state.relationships.sofi = { resolved: true, outcome: 'instagram' };
  let opened = null;
  const system = createInteractionSystem({
    scene: { input: { keyboard: { addKey: () => key } } },
    player: { x: 0, y: 0 },
    interactables: [interactable],
    prompt,
    canInteract: ({ character }) => canInteractWithCharacter(state, character.id),
    onInteract(value) { opened = value; },
  });

  system.syncMarkers((id) => isCharacterResolved(state, id));
  assert.equal(marker.visible, false);
  system.update();
  assert.equal(prompt.visible, false);
  assert.equal(opened, null);

  interactable.isRelocating = false;
  system.update();
  assert.equal(prompt.visible, true);
  assert.equal(prompt.text, 'E · HABLAR CON SOFI');
  key.edge = true;
  system.update();
  assert.strictEqual(opened, interactable);

  system.syncMarkers(() => false);
  assert.equal(marker.visible, true);
});
