import test from 'node:test';
import { attachUiCameraManager } from '../test-support/bathroomCameras.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { createPortraitReactionUi, FRIEND_PORTRAITS, PORTRAIT_EXPRESSIONS, preloadPortraitReactions } from '../src/ui/portraitReactionUi.js';
import { createBathroomResistanceUi, createBathroomResolutionUi, createBathroomChallengeUi, destroyEventUi } from '../src/ui/eventUi.js';
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

test('golpe puro conserva la reacción anterior sin texto PUM y SPACE no altera el portrait', () => {
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
  assert.equal(portrait.visible, true);
  assert.equal(ui.getView().reaction, A);
  assert.ok(scene.objects.every(({ text, visible }) => !visible || !String(text).includes('PUM')));
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
    assert.equal(ui.getView().ready, false);
    assert.equal(ui.getView().labels.help, undefined);
    ui.setReady();
    assert.equal(ui.getView().labels.help, 'ENTER · VOLVER AL PATIO');
    assert.ok(texts.every((text) => !text.includes('finalmente se rinden') && !text.includes('se abre de golpe')));
    destroyEventUi(ui);
    assert.ok(scene.objects.every(({ destroyed }) => destroyed));
  }
});

test('panel compuesto reserva dock inferior estable y mantiene geometría en resolución', () => {
  for (const [width, height] of [[1280, 720], [960, 540], [1600, 900]]) {
    const scene = makeScene(width, height);
    const ui = createBathroomChallengeUi(scene, getBathroomResistanceConfig(1));
    ui.startResistance();
    const layout = ui.getView().layout;
    const panel = scene.objects.find(({ type }) => type === 'rectangle');
    const initialGeometry = [panel.x, panel.y, panel.width, panel.height];
    assert.equal(panel.width, Math.min(760, width - 48));
    assert.equal(panel.height, 310);
    assert.equal(layout.top + layout.height - layout.dividerY, 100);
    assert.equal(ui.getView().labels.title, 'RESISTENCIA DEL BAÑO');
    ui.update({ state: { resistance: 55, elapsedMs: 0 }, presentation: A });
    const portrait = scene.objects.find(({ type }) => type === 'image');
    assert.ok(portrait.y - 32 > layout.dividerY && portrait.y + 32 < layout.top + layout.height);
    assert.ok(portrait.x - 32 >= layout.left && portrait.x + 32 < layout.left + layout.width);
    assert.equal(scene.objects.filter(({ type, width, height }) => type === 'rectangle' && width > 700 && height > 200).length,
      1, 'un solo marco principal');
    ui.showResolution('failure', { rewardSettled: true, reaction: B });
    assert.equal(panel.destroyed, false);
    assert.deepEqual([panel.x, panel.y, panel.width, panel.height], initialGeometry);
    assert.equal(ui.getView().labels.title, 'LA PUERTA CEDIÓ');
    assert.equal(ui.getView().reward, '+250 ★');
    assert.equal(ui.getView().labels.timer, undefined);
    assert.equal(portrait.y, layout.dockY);
    destroyEventUi(ui);
    assert.ok(scene.objects.every(({ destroyed, destroyCount }) => destroyed && destroyCount === 1));
  }
});

test('el dock interno no dibuja otro marco ni cola de globo', () => {
  const scene = makeScene();
  const ui = createPortraitReactionUi(scene, { framed: false, x: 640, y: 465, width: 712 });
  ui.show(A);
  const frame = scene.objects.find(({ type }) => type === 'graphics');
  assert.equal(frame.rectangles.length, 0);
  ui.destroy();
});

 test('Bathroom UI isolates static and dynamic objects from world zoom/shake through resolution', () => {
  const scene = makeScene();
  const world = { cameraFilter: 8 };
  attachUiCameraManager(scene, [world]);
  const ui = createBathroomChallengeUi(scene, getBathroomResistanceConfig(1));
  const camera = scene.cameras.cameras[1];
  assert.deepEqual([camera.x, camera.y, camera.width, camera.height, camera.scrollX, camera.scrollY,
    camera.zoomX, camera.zoomY, camera.rotation], [0, 0, 1280, 720, 0, 0, 1, 1, 0]);
  assert.equal(world.cameraFilter, 10);
  scene.cameras.main.zoomX = 1.75; scene.cameras.main.shakeOffset = 12;
  const checkUi = () => {
    for (const object of scene.objects.filter(({ destroyed }) => !destroyed)) {
      assert.equal(object.cameraFilter & 1, 1, 'main ignores every Bathroom object');
      assert.equal(object.cameraFilter & 2, 0, 'UI camera includes every Bathroom object');
    }
    assert.equal(camera.zoomX, 1); assert.equal(camera.scrollX, 0);
    assert.equal(camera.shakeOffset, undefined);
  };
  ui.showReaction(A); checkUi();
  ui.startResistance();
  for (let elapsedMs = 0; elapsedMs <= 10000; elapsedMs += 1000) {
    ui.update({ state: { resistance: 55, elapsedMs }, presentation: elapsedMs % 2000 ? A : B }); checkUi();
  }
  const extraWorldObject = scene.add.rectangle(100, 100, 20, 20);
  assert.equal(extraWorldObject.cameraFilter & 2, 2, 'new world objects are excluded');
  extraWorldObject.destroy();
  ui.showResolution('success', { rewardSettled: true, reaction: A }); ui.setReady(); checkUi();
  assert.equal(scene.cameras.cameras.length, 2, 'resolution reuses its UI camera');
  ui.destroy(); ui.destroy();
  assert.equal(scene.cameras.cameras.length, 1); assert.equal(scene.cameras.removed, 1);
  assert.equal(world.cameraFilter, 8, 'prior filters preserved');
  assert.ok(scene.objects.every(({ cameraFilter }) => cameraFilter === 0));
  assert.equal(scene.events.listenerCount('addedtoscene'), 0);
});

 test('three consecutive Bathroom presentations and shutdown leave no camera or filter leaks', () => {
  const scene = makeScene(); const world = { cameraFilter: 0 };
  attachUiCameraManager(scene, [world]);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ui = createBathroomChallengeUi(scene, getBathroomResistanceConfig(attempt));
    ui.startResistance(); ui.showReaction(B);
    assert.equal(scene.cameras.cameras.length, 2);
    if (attempt === 3) scene.events.emit('shutdown'); else ui.destroy();
    ui.destroy();
    assert.equal(scene.cameras.cameras.length, 1);
    assert.equal(world.cameraFilter, 0);
    assert.equal(scene.events.listenerCount('addedtoscene'), 0);
    assert.equal(scene.events.listenerCount('shutdown'), 0);
  }
  assert.equal(scene.cameras.removed, 3);
});
