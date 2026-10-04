import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { createPortraitReactionUi, FRIEND_PORTRAITS, PORTRAIT_EXPRESSIONS, preloadPortraitReactions } from '../src/ui/portraitReactionUi.js';
import { createBathroomResistanceUi, createBathroomResolutionUi, destroyEventUi } from '../src/ui/eventUi.js';
import { getBathroomResistanceConfig } from '../src/events/bathroomResistance.js';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';

function makeScene(width = 1280, height = 720) {
  const objects = [];
  const filters = [];
  function add(type, x = 0, y = 0, text = '') {
    const object = {
      type, x, y, text, visible: true, destroyed: false, destroyCount: 0, rectangles: [],
      setScrollFactor(value) { this.scrollFactor = value; return this; },
      setDepth(value) { this.depth = value; return this; },
      setVisible(value) { this.visible = value; return this; },
      setPosition(x, y) { this.x = x; this.y = y; return this; },
      setText(value) { this.text = value; return this; },
      setTexture(key, frame) { this.texture = key; this.frame = frame; return this; },
      setOrigin() { return this; },
      setStrokeStyle() { return this; },
      setScale(x, y) { this.scale = [x, y]; return this; },
      setFillStyle(value) { this.color = value; return this; },
      fillStyle() { return this; },
      fillRect(...rect) { this.rectangles.push(rect); return this; },
      fillTriangle() { return this; },
      lineStyle() { return this; },
      strokeRect() { return this; },
      lineBetween() { return this; },
      destroy() { this.destroyed = true; this.destroyCount++; this.visible = false; },
    };
    objects.push(object);
    return object;
  }
  return {
    objects, filters, events: new EventEmitter(), scale: { width, height },
    textures: { get(key) { return { setFilter(mode) { filters.push([key, mode]); } }; } },
    add: {
      graphics: () => add('graphics'),
      image: (x, y, key, frame) => add('image', x, y).setTexture(key, frame),
      text: (x, y, text) => add('text', x, y, text),
      rectangle: (x, y, width, height) => Object.assign(add('rectangle', x, y), { width, height }),
    },
  };
}
const A = { speaker: 'pitity', expression: 'talk', text: '¿TAMBU?' };
const B = { speaker: 'eze', expression: 'shout', text: '¡TAMBU!' };

test('los seis portraits son PNG RGBA 192x64 y preload usa frames 64x64 y nombres canónicos', () => {
  const loaded = [];
  preloadPortraitReactions({ load: { spritesheet: (...args) => loaded.push(args) } });
  assert.equal(loaded.length, 6);
  for (const [key, path, frames] of loaded) {
    const png = readFileSync(`public${path}`);
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[24], png[25]], [192, 64, 8, 6]);
    assert.deepEqual(frames, { frameWidth: 64, frameHeight: 64 });
    assert.match(key, /^ui_portrait_(pitity|tobi|uriel|santy|thiago|eze)$/);
    assert.equal(path, `/assets/ui/portraits/friends/${key}_v1.png`);
  }
});

test('talk/angry/shout mapean 0/1/2 para todos los speakers con portrait nativo y filtro nearest', () => {
  assert.deepEqual(PORTRAIT_EXPRESSIONS, { talk: 0, angry: 1, shout: 2 });
  const scene = makeScene();
  const ui = createPortraitReactionUi(scene);
  const portrait = scene.objects.find(({ type }) => type === 'image');
  for (const speaker of Object.keys(FRIEND_PORTRAITS)) {
    for (const [expression, frame] of Object.entries(PORTRAIT_EXPRESSIONS)) {
      ui.show({ speaker, expression, text: 'test' });
      assert.equal(portrait.texture, FRIEND_PORTRAITS[speaker].asset);
      assert.equal(portrait.frame, frame);
      assert.equal(portrait.visible, true);
      assert.equal(portrait.scale, undefined, 'no upscale del frame nativo');
      assert.equal(portrait.scrollFactor, 0);
      assert.deepEqual(scene.filters.at(-1), [portrait.texture, 1]);
    }
  }
  ui.destroy();
});

test('una nueva reacción actualiza el mismo widget sin acumular portraits/globos/nombres/frases', () => {
  const scene = makeScene();
  const ui = createPortraitReactionUi(scene);
  ui.show(A);
  const firstLabel = scene.objects.at(-1);
  const live = () => scene.objects.filter(({ destroyed }) => !destroyed);
  const count = live().length;
  ui.show(B);
  assert.equal(firstLabel.destroyed, true);
  assert.equal(live().length, count);
  assert.equal(live().filter(({ type }) => type === 'image').length, 1);
  assert.equal(live().find(({ type }) => type === 'image').texture, 'ui_portrait_eze');
  assert.equal(live().find(({ type }) => type === 'text').text, '¡TAMBU!');
  assert.ok(scene.objects.at(-1).rectangles.length > 0, 'speaker label usa pixelText');
  ui.destroy();
});

test('hide limpia portrait, globito, speaker y speech; destroy es idempotente y shutdown no deja listeners', () => {
  for (const shutdown of [false, true]) {
    const scene = makeScene();
    const ui = createPortraitReactionUi(scene);
    ui.show(A);
    ui.hide();
    assert.ok(scene.objects.every(({ visible, destroyed }) => !visible || destroyed));
    assert.equal(scene.objects.find(({ type }) => type === 'text').text, '');
    ui.show(B);
    if (shutdown) scene.events.emit('shutdown');
    else ui.destroy();
    ui.destroy();
    ui.show(A);
    assert.ok(scene.objects.every(({ destroyed, destroyCount }) => destroyed && destroyCount === 1));
    assert.equal(scene.events.listenerCount('shutdown'), 0);
  }
});

test('golpe puro oculta la reacción anterior y SPACE/bar feedback no crea ni altera el portrait', () => {
  const scene = makeScene();
  const config = getBathroomResistanceConfig(1);
  const ui = createBathroomResistanceUi(scene, config);
  const state = { resistance: 55, elapsedMs: 1900 };
  ui.update({ state, presentation: A, feedback: 'hit' });
  const portrait = scene.objects.find(({ type }) => type === 'image');
  const count = scene.objects.length;
  ui.update({ state: { ...state, resistance: 59 }, presentation: A, feedback: 'recover' });
  assert.equal(scene.objects.length, count);
  assert.equal(portrait.visible, true);
  assert.equal(portrait.frame, 0);
  ui.update({ state, presentation: { speaker: null, expression: null, text: 'PUM PUM' }, feedback: 'hit' });
  assert.equal(portrait.visible, false);
  assert.ok(scene.objects.some(({ text, visible }) => visible && text === 'PUM PUM'));
  destroyEventUi(ui);
  destroyEventUi(ui);
  assert.ok(scene.objects.every(({ destroyed, destroyCount }) => destroyed && destroyCount === 1));
  assert.equal(scene.events.listenerCount('shutdown'), 0);
});

test('resolución muestra reaction y recompensa liquidada sin el párrafo genérico duplicado', () => {
  for (const result of ['success', 'failure']) {
    const scene = makeScene();
    const data = getBathroomResistanceNarrative({ attemptNumber: 3, previousResults: ['secured', 'secured'] });
    const ui = createBathroomResolutionUi(scene, result, { rewardSettled: true, reaction: data.resolution[result] });
    const texts = scene.objects.filter(({ type }) => type === 'text').map(({ text }) => text);
    assert.ok(texts.includes(data.resolution[result].text));
    assert.ok(texts.includes(result === 'success' ? '+500 ★' : '+250 ★'));
    assert.ok(texts.includes('ENTER · VOLVER AL PATIO'));
    assert.ok(texts.every((text) => !text.includes('finalmente se rinden') && !text.includes('se abre de golpe')));
    destroyEventUi(ui);
    assert.ok(scene.objects.every(({ destroyed }) => destroyed));
  }
});

test('reaction cluster se centra en el viewport arriba del panel sin tapar barra/timer/prompts', () => {
  for (const [width, height] of [[1280, 720], [960, 540], [1600, 900]]) {
    const scene = makeScene(width, height);
    const ui = createBathroomResistanceUi(scene, getBathroomResistanceConfig(1));
    ui.update({ state: { resistance: 55, elapsedMs: 0 }, presentation: A });
    const panel = scene.objects.find(({ type }) => type === 'rectangle');
    const bubble = scene.objects.find(({ type }) => type === 'graphics').rectangles[0];
    const portrait = scene.objects.find(({ type }) => type === 'image');
    assert.ok(bubble[1] >= 0 && bubble[1] + bubble[3] < panel.y - panel.height / 2);
    assert.ok(portrait.x - 32 >= 0 && bubble[0] + bubble[2] <= width);
    assert.ok(portrait.depth > panel.depth);
    destroyEventUi(ui);
  }
});
