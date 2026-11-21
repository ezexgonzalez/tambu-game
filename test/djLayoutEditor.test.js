import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { DJ_ENVIRONMENT_LAYOUT as baseline } from '../src/world/dj/djEnvironmentLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from '../src/world/dj/djEnvironmentAssets.js';
import { djAssetLibrary, filterDjAssetLibrary } from '../src/world/dj/djEnvironmentCatalog.js';
import { DJ_LAYOUT_BASELINE_REVISION, DJ_MAX_DEPTH_OFFSET } from '../src/world/dj/djLayoutComposition.js';
import { createDjLayoutEditor } from '../src/world/dj/djLayoutEditor.js';
import { getDjLayoutWarnings } from '../src/world/dj/djLayoutEditorGuides.js';
import {
  createDjLayoutEditorState, DJ_LAYOUT_GROUPS, isDjLayoutEditorEnabled, pickDjLayoutObject,
} from '../src/world/dj/djLayoutEditorState.js';

const keyById = (placements) => new Map(placements.map((item) => [item.id, item]));
const relative = (a, b) => [a.x - b.x, a.y - b.y];
const delta = (before, after) => relative(after, before);

test('editor is off by default and isolated from the original preview flag', () => {
  for (const query of [undefined, '', '?djLayoutEdit=0', '?djLayoutEdit=true', '?djEnvPreview=1']) {
    assert.equal(isDjLayoutEditorEnabled(query), false);
  }
  assert.equal(isDjLayoutEditorEnabled('?djLayoutEdit=1'), true);
  assert.equal(isDjLayoutEditorEnabled('?djEnvPreview=1&djLayoutEdit=1'), true);
});

test('seven independent groups cover all baseline placements including auxiliary layers', () => {
  assert.deepEqual(Object.keys(DJ_LAYOUT_GROUPS), [
    'upper-dj-edge', 'upper-lounge', 'lower-lounge', 'lower-border-west',
    'lower-border-middle', 'lower-border-east', 'pool-side',
  ]);
  assert.deepEqual(new Set(baseline.map(({ group }) => group)), new Set(Object.keys(DJ_LAYOUT_GROUPS)));
  for (const { id, parent, assembly, group } of baseline) {
    const dependency = parent ?? assembly;
    if (dependency) {
      const previous = baseline.slice(0, baseline.findIndex((entry) => entry.id === id));
      assert.equal(previous.find((entry) => entry.id === dependency)?.group, group, id);
    }
  }
  const state = createDjLayoutEditorState();
  assert.equal(state.select('group', 'nope'), null);
  state.select('group', 'lower-border-middle');
  state.move(7, -5);
  for (const [i, item] of state.getPlacements().entries()) {
    assert.deepEqual(delta(baseline[i], item), item.group === 'lower-border-middle' ? [7, -5] : [0, 0]);
  }
});

test('group movement preserves couches, rug, supports and depth relations', () => {
  const base = keyById(baseline);
  const state = createDjLayoutEditorState();
  state.select('group', 'lower-lounge');
  state.move(35, -21);
  const moved = keyById(state.getPlacements());
  for (const item of moved.values()) {
    const previous = base.get(item.id);
    const inside = item.group === 'lower-lounge';
    assert.deepEqual(delta(previous, item), inside ? [35, -21] : [0, 0]);
    assert.equal(item.depth, previous.depth + (inside && item.depthRule !== 'ground' ? -21 : 0));
    if (item.parent) assert.deepEqual(relative(item, moved.get(item.parent)), relative(previous, base.get(item.parent)));
  }
  assert.equal(moved.get('lower-rug').depth, base.get('lower-rug').depth);
  assert.ok(moved.get('lower-rug').depth < moved.get('lower-table').depth);
  assert.ok(moved.get('lower-tropical-plant').depth < moved.get('lower-tropical-lip').depth);
});

test('piece selection resolves to the whole assembly and adds a local offset on top of group movement', () => {
  const state = createDjLayoutEditorState();
  const base = keyById(baseline);
  const cases = [
    ['upper-table-cup', 'upper-table', ['upper-table-plant', 'upper-table-lamp']],
    ['upper-sofa-end-down', 'upper-sofa-corner', ['upper-sofa-end-right', 'upper-sofa-cushion-1']],
    ['lower-tropical-plant', 'lower-tropical', ['lower-tropical-lip']],
    ['border-middle-plant-2', 'border-middle-left', ['border-middle-middle', 'border-middle-right-lip']],
    ['edge-garland-bulb-right', 'edge-tree', ['edge-tree-canopy', 'edge-garland-speaker-clip']],
  ];
  state.select('group', 'upper-lounge');
  state.move(9, 0);
  for (const [child, root, others] of cases) {
    assert.deepEqual(state.select('object', child), { type: 'object', id: root });
    state.move(6, -3);
    const moved = keyById(state.getPlacements());
    const groupOffset = base.get(root).group === 'upper-lounge' ? 9 : 0;
    for (const id of [child, root, ...others]) {
      assert.deepEqual(delta(base.get(id), moved.get(id)), [6 + groupOffset, -3], id);
    }
  }
  assert.deepEqual(delta(base.get('upper-pouf'), keyById(state.getPlacements()).get('upper-pouf')), [9, 0]);
  state.select(null);
  assert.equal(state.getSelection(), null);
});

test('click picking checks visible pixels, current depth and front lip crop', () => {
  const pot = { id: 'pot', x: 10, y: 10, assetId: 'V06A', depth: 100, scale: 1, visible: true };
  const leaf = { ...pot, id: 'plant', assetId: 'V02A', depth: 100.01 };
  const lip = { ...pot, id: 'lip', depth: 100.04, crop: [0, 14, 50, 41] };
  const visible = (id) => id !== 'V02A';
  assert.equal(pickDjLayoutObject([pot, leaf, lip], 30, 20)?.id, 'plant');
  assert.equal(pickDjLayoutObject([pot, leaf, lip], 30, 20, visible)?.id, 'pot');
  assert.equal(pickDjLayoutObject([lip, pot, leaf], 30, 25)?.id, 'lip');
  assert.equal(pickDjLayoutObject([pot, { ...leaf, visible: false }], 30, 20)?.id, 'pot');
  assert.equal(pickDjLayoutObject([pot], 0, 0), null);
});

test('drag deltas clamp to the world without losing the rigid assembly, and guides only warn', () => {
  const state = createDjLayoutEditorState();
  assert.deepEqual(getDjLayoutWarnings(state.getPlacements()), []);
  state.select('group', 'upper-dj-edge');
  assert.deepEqual(state.move(-1000, 0), [0, 0], 'tree layout already touches the left edge');
  state.move(400, 200);
  assert.ok(getDjLayoutWarnings(state.getPlacements()).includes('Revisá el anclaje al parlante'));
  state.select('group', 'lower-border-east');
  state.move(0, 200);
  const images = state.getPlacements().filter(({ group }) => group === 'lower-border-east');
  assert.ok(images.every(({ y, assetId }) => y + assets[assetId].height <= 960));
  assert.ok(images.some(({ y, assetId }) => y + assets[assetId].height === 960));
});

function eventNode() {
  const emitter = new EventEmitter();
  return {
    addEventListener(name, cb) { emitter.on(name, cb); },
    removeEventListener(name, cb) { emitter.off(name, cb); },
    fire(name, event = {}) { return Promise.all(emitter.listeners(name).map((cb) => cb(event))); },
    listenerCount: (name) => emitter.listenerCount(name),
  };
}

// Small stand-ins for the actual Phaser input and the panel's DOM controls.
function editorHarness() {
  const win = { ...eventNode(), Blob, URL: {
    createObjectURL(blob) { win.download = blob; return 'blob:layout'; },
    revokeObjectURL(url) { win.revoked = url; },
  }, setTimeout: () => 1, clearTimeout() {} };
  const fields = new Map();
  let panel, tabindex = null;
  const doc = { defaultView: win, createElement(tag) {
    if (tag !== 'aside') {
      const attrs = new Map();
      return {
        click() {}, remove() {}, append(...nodes) { this.children = nodes; },
        setAttribute(key, value) { attrs.set(key, value); },
        getAttribute(key) { return attrs.get(key); },
        closest() { return tag === 'button' ? this : null; },
      };
    }
    panel = {
      setAttribute() {}, append() {}, contains(target) { return [...fields.values()].includes(target); },
      querySelector(key) {
        if (!fields.has(key)) fields.set(key, {
          ...eventNode(), value: key === '[data-mode]' ? 'group' : '',
          replaceChildren(...children) { this.children = children; }, click() {}, setAttribute() {},
        });
        return fields.get(key);
      },
      remove() { this.removed = true; },
    };
    return panel;
  } };
  const canvas = { ownerDocument: doc, parentElement: { append() {} }, focus() {},
    getAttribute() { return tabindex; },
    setAttribute(name, next) { tabindex = next; },
    removeAttribute() { tabindex = null; },
    set tabIndex(next) { tabindex = String(next); },
  };
  const camera = {
    clampX: (x) => Math.max(0, Math.min(x, 400)),
    clampY: (y) => Math.max(0, Math.min(y, 240)),
    setScroll(x, y) { this.scrollX = x; this.scrollY = y; },
    getWorldPoint(x, y) { return { x: x + this.scrollX, y: y + this.scrollY }; },
  };
  const images = [];
  const scene = {
    events: new EventEmitter(), input: new EventEmitter(), sys: { game: { canvas } },
    cameras: { main: camera }, textures: { getPixelAlpha: () => 255 },
    add: {
      graphics() { return {
        scene, lineStyle() { return this; }, strokeRect() {}, lineBetween() {},
        setDepth() { return this; }, setVisible() {}, clear() {}, destroy() { this.scene = null; },
      }; },
      image(x, y, key) {
        const sprite = { x, y, key, scene,
          setOrigin() { return this; }, setScale() { return this; }, setCrop() { return this; },
          setPosition(x, y) { this.x = x; this.y = y; return this; },
          setDepth(depth) { this.depth = depth; return this; },
          setVisible(visible) { this.visible = visible; return this; },
          destroy() { assert.ok(this.scene, 'no double destroy'); this.scene = null; },
        };
        images.push(sprite);
        return sprite;
      },
    },
  };
  const image = (id) => images.filter((entry) => entry.scene)[baseline.findIndex((item) => item.id === id)];
  const field = (id) => fields.get(`[data-${id}]`);
  const start = () => createDjLayoutEditor(scene);
  return { scene, win, camera, image, images, doc, field, start, panel: () => panel, getTabindex: () => tabindex };
}

test('controller uses camera world coordinates for dragging, supports Shift and handles outside release', async () => {
  const { scene, win, camera, image, field, start } = editorHarness();
  const editor = start();
  const initialX = image('upper-table').x, initialY = image('upper-table').y;
  const event = (x, y) => ({ id: 1, button: 0, x, y: y - camera.scrollY });
  scene.input.emit('pointerdown', event(135, 585));
  assert.equal(field('target').value, 'upper-lounge');
  scene.input.emit('pointermove', event(148, 609));
  scene.input.emit('pointerupoutside', event(148, 609));
  scene.input.emit('pointermove', event(500, 630));
  await win.fire('keydown', { key: 'ArrowUp', shiftKey: true, preventDefault() {} });
  assert.deepEqual([image('upper-table').x - initialX, image('upper-table').y - initialY], [13, 16]);
  await win.fire('keydown', { key: 'Escape' });
  assert.equal(field('target').value, '');
  await win.fire('keydown', { code: 'Space', preventDefault() {} });
  scene.input.emit('pointerdown', event(150, 620));
  scene.input.emit('pointermove', event(150, 670));
  scene.input.emit('pointerup', event(150, 670));
  assert.equal(camera.scrollY, 95);
  assert.deepEqual([image('upper-table').x - initialX, image('upper-table').y - initialY], [13, 16]);
  editor.destroy();
});

test('scene shutdown unhooks editor input, discards pending imports and clears temporary edits on restart', async () => {
  const { scene, win, image, field, start, panel, getTabindex } = editorHarness();
  const editor = start();
  const firstPanel = panel();
  const initial = image('upper-table').x;
  field('target').value = 'upper-lounge';
  await field('target').fire('change');
  await win.fire('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(image('upper-table').x, initial + 1);
  await field('export').fire('click');
  const exported = await win.download.text();
  let finishReading;
  field('file').files = [{ size: 100, text: () => new Promise((resolve) => { finishReading = resolve; }) }];
  const pending = field('file').fire('change');
  scene.events.emit('shutdown');
  editor.destroy();
  assert.equal(firstPanel.removed, true);
  assert.equal(getTabindex(), null);
  assert.equal(win.revoked, 'blob:layout');
  assert.equal(win.listenerCount('keydown'), 0);
  assert.equal(scene.input.listenerCount('pointerdown'), 0);
  assert.equal(scene.input.listenerCount('pointerupoutside'), 0);
  assert.equal(scene.events.listenerCount('shutdown'), 0);
  start();
  assert.equal(getTabindex(), '0');
  assert.equal(win.listenerCount('keydown'), 1);
  assert.equal(image('upper-table').x, initial);
  finishReading(exported);
  await pending;
  assert.equal(image('upper-table').x, initial, 'discard JSON read from the previous editor');
  field('file').files = [{ size: exported.length, text: async () => exported }];
  await field('file').fire('change');
  assert.equal(image('upper-table').x, initial + 1);
  await field('reset').fire('click');
  assert.equal(image('upper-table').x, initial);
  scene.events.emit('shutdown');
});

test('search reflects approved metadata, components and an unused asset in a supported recipe', () => {
  const library = djAssetLibrary();
  assert.equal(library.filter(({ recipe }) => !recipe).length, Object.keys(assets).length);
  assert.ok(library.every(({ path }) => path.endsWith('.png')));
  assert.ok(!library.some(({ id }) => id === 'L05'));
  assert.equal(filterDjAssetLibrary(library, 'vegetation', 'arbÚsto vertical')[0].id, 'V04B');
  assert.equal(filterDjAssetLibrary(library, 'drinks', 'vaso').length, 0);
  assert.equal(filterDjAssetLibrary(library, 'drinks', 'vaso', true)[0].placeable, false);
  assert.ok(filterDjAssetLibrary(library, 'furniture', 'C02').some(({ id }) => id === 'table-served'));
  assert.ok(!baseline.some(({ assetId }) => assetId === 'L03-A0'));
  const entry = filterDjAssetLibrary(library, 'lighting', 'L03-A0')[0];
  assert.equal(entry.source, 'recipe:tree-flat-garland');
  assert.equal(entry.path, assets['L03-A0'].path);
  const future = { NEW: { label: 'Sombrilla', family: 'shade', path: '/approved.png', placeable: true } };
  assert.equal(filterDjAssetLibrary(djAssetLibrary(future, {}), 'shade', 'sombrilla')[0].source, 'asset:NEW');
});

test('adding two copies uses the native scale and contact, selects the instance and honors group membership', () => {
  const state = createDjLayoutEditorState();
  const first = state.add('asset:F06', 'upper-lounge', 250, 620);
  const second = state.add('asset:F06', 'pool-side', 475, 530);
  assert.notEqual(first, second);
  const map = keyById(state.getPlacements());
  assert.deepEqual([map.get(first).x, map.get(first).y], [250 - assets.F06.contactPx[0], 620 - assets.F06.contactPx[1]]);
  assert.equal(map.get(first).scale, assets.F06.scale);
  assert.equal(map.get(first).depth, 620);
  assert.equal(state.getSelection().id, second);
  assert.equal(state.add('asset:V01-canopy', 'pool-side', 300, 500), null);
  assert.equal(state.add('asset:historical', 'pool-side', 300, 500), null);
  assert.equal(state.add('asset:F06', '__proto__', 300, 500), null);
  assert.equal(state.add('asset:F06', 'pool-side', Infinity, 500), null);
  state.changeGroup('upper-lounge');
  state.select('group', 'upper-lounge');
  state.move(15, -4);
  const moved = keyById(state.getPlacements());
  assert.deepEqual(delta(map.get(first), moved.get(first)), [15, -4]);
  assert.deepEqual(delta(map.get(second), moved.get(second)), [15, -4]);
  assert.deepEqual(delta(map.get('upper-table'), moved.get('upper-table')), [15, -4]);

  const tree = state.add('recipe:tree-flat-garland', 'upper-dj-edge', 180, 360);
  const members = state.getPlacements().filter(({ root }) => root === tree);
  const cable = members.find(({ assetId }) => assetId === 'L03-A0');
  assert.equal(cable.parent, tree);
  for (const member of members.filter(({ parent }) => parent === cable.id)) {
    const [cx, cy] = assets[member.assetId].contactPx;
    assert.deepEqual([member.x + cx, member.y + cy], [cable.x + member.support[0], cable.y + member.support[1]]);
  }
});

test('duplicate moves a complete planter with new IDs and delete does not affect its source', () => {
  const state = createDjLayoutEditorState();
  state.select('object', 'lower-tropical-plant');
  state.adjustDepth(1);
  const before = keyById(state.getPlacements());
  const id = state.duplicate();
  assert.ok(id);
  assert.ok(state.getEditableObjects().some(({ id: entry }) => entry === id));
  const copies = state.getPlacements().filter(({ root }) => root === id);
  const [pot, foliage, lip] = copies;
  assert.equal(foliage.parent, pot.id);
  assert.equal(lip.parent, pot.id);
  assert.deepEqual(relative(foliage, pot), relative(before.get('lower-tropical-plant'), before.get('lower-tropical')));
  assert.deepEqual(lip.crop, before.get('lower-tropical-lip').crop);
  assert.ok(pot.depth < foliage.depth && foliage.depth < lip.depth);
  assert.equal(pot.depthOffset, 4);
  state.move(13, -15);
  state.toggleVisibility();
  assert.ok(state.getPlacements().filter(({ root }) => root === id).every(({ visible }) => !visible));
  assert.ok(state.deleteSelection());
  assert.ok(state.getPlacements().every(({ root }) => root !== id));
  assert.deepEqual(keyById(state.getPlacements()), before);
  state.undo();
  assert.ok(state.getPlacements().some(({ root, visible }) => root === id && !visible));
  state.undo();
  assert.ok(state.getPlacements().some(({ root, visible }) => root === id && visible));
  state.redo();
  state.redo();
  assert.deepEqual(keyById(state.getPlacements()), before);
});

test('deleting a baseline sofa records every removed member; undo restores its seams and stable IDs', () => {
  const state = createDjLayoutEditorState();
  const before = state.exportLayout();
  state.select('object', 'upper-sofa-end-right');
  const id = state.duplicate();
  const copy = state.getPlacements().filter(({ root }) => root === id);
  assert.equal(copy.length, 5);
  assert.equal(copy[1].assembly, id);
  assert.equal(copy.find(({ assetId }) => assetId === 'F02a').parent, id);
  state.select('object', 'upper-sofa-cushion-1');
  state.deleteSelection();
  const removed = before.placements.filter(({ root }) => root === 'upper-sofa-corner').map(({ id }) => id);
  assert.deepEqual(state.exportLayout().removedBaseline, removed);
  assert.ok(state.getPlacements().every(({ id }) => !removed.includes(id)));
  state.undo();
  assert.deepEqual(state.exportLayout().removedBaseline, []);
  state.undo();
  assert.deepEqual(state.exportLayout(), before);
});

test('manual depth swaps overlapping props, is bounded, and preserves auto ground and substrate layers', () => {
  const state = createDjLayoutEditorState();
  const a = state.add('asset:L02', 'upper-lounge', 210, 620);
  const b = state.add('asset:L02', 'upper-lounge', 210, 623);
  const pick = () => pickDjLayoutObject(state.getPlacements(), 210, 600)?.id;
  assert.equal(pick(), b);
  state.select('object', a);
  state.adjustDepth(1);
  assert.equal(pick(), a);
  state.adjustDepth(-1);
  assert.equal(pick(), b);
  for (let i = 0; i < 100; i++) state.adjustDepth(1);
  assert.equal(state.getSelectedInstance().depthOffset, DJ_MAX_DEPTH_OFFSET);
  state.move(20, 7);
  let part = keyById(state.getPlacements()).get(a);
  assert.equal(part.autoDepth, 627);
  assert.equal(part.depth, 627 + DJ_MAX_DEPTH_OFFSET);
  state.adjustDepth(0);
  part = keyById(state.getPlacements()).get(a);
  assert.equal(part.depth, part.autoDepth);
  state.select('object', 'lower-rug');
  for (let i = 0; i < 100; i++) state.adjustDepth(-1);
  assert.equal(state.getSelectedInstance().depthOffset, -DJ_MAX_DEPTH_OFFSET);
  state.move(4, 10);
  part = keyById(state.getPlacements()).get('lower-rug');
  assert.equal(part.autoDepth, -16);
  assert.equal(part.depth, -16 - DJ_MAX_DEPTH_OFFSET / 100);
  assert.ok(part.depth > -30);
  assert.ok(part.depth < keyById(state.getPlacements()).get('lower-table').depth);
});

test('undo combines a drag, tracks depth, group visibility and reset, and bounds the history', () => {
  const state = createDjLayoutEditorState(), initial = state.exportLayout();
  state.select('group', 'upper-lounge');
  state.beginMove();
  state.move(9, 5);
  state.move(5, 4);
  state.endMove();
  const dragged = state.exportLayout();
  state.undo();
  assert.deepEqual(state.exportLayout(), initial);
  state.redo();
  assert.deepEqual(state.exportLayout(), dragged);
  state.toggleVisibility();
  const groupHidden = state.exportLayout();
  state.select('object', 'upper-table');
  state.adjustDepth(1);
  const adjusted = state.exportLayout();
  state.reset();
  assert.deepEqual(state.exportLayout(), initial);
  state.undo();
  assert.deepEqual(state.exportLayout(), adjusted);
  state.undo();
  assert.deepEqual(state.exportLayout(), groupHidden);
  state.select('group', 'upper-lounge');
  state.toggleVisibility();
  assert.ok(!state.canRedo());
  let count = 0;
  for (let i = 0; i < 100; i++) state.move(i % 2 ? -1 : 1, 0);
  while (state.undo()) count++;
  assert.equal(count, 50);
});

test('V2 reproduces the full edited composition and rejects inconsistent files atomically', () => {
  const state = createDjLayoutEditorState();
  state.select('object', 'lower-tropical');
  state.deleteSelection();
  const id = state.add('recipe:tree-flat-garland', 'upper-dj-edge', 210, 420);
  state.adjustDepth(-1);
  state.toggleVisibility();
  state.select('group', 'upper-dj-edge');
  state.move(16, 8);
  state.select('object', 'lower-table-cup');
  state.duplicate();
  const json = JSON.stringify(state.exportLayout());
  const other = createDjLayoutEditorState();
  other.importLayout(JSON.parse(json));
  assert.equal(JSON.stringify(other.exportLayout()), json);
  const { version, baselineRevision, manifest, placements, removedBaseline } = other.exportLayout();
  assert.equal(version, 2);
  assert.equal(baselineRevision, DJ_LAYOUT_BASELINE_REVISION);
  assert.equal(manifest['L03-A0'], assets['L03-A0'].sha256);
  assert.ok(removedBaseline.includes('lower-tropical-lip'));
  assert.ok(placements.filter(({ root }) => root === id).every(({ visible, depthOffset }) => !visible && depthOffset === -4));
  for (const mutate of [
    (d) => { d.version = 7; },
    (d) => { d.baselineRevision = 'wrong'; },
    (d) => { d.manifest.V02B = 'wrong'; },
    (d) => { d.instances[0].source = 'asset:V01-canopy'; },
    (d) => { d.instances.at(-1).source = 'asset:unknown'; },
    (d) => { d.instances[0].group = 'unknown'; },
    (d) => { d.instances[0].x = 5.5; },
    (d) => { d.instances[0].y = -5000; },
    (d) => { d.instances[0].depthOffset = DJ_MAX_DEPTH_OFFSET + 1; },
    (d) => { d.instances.push(d.instances[0]); },
    (d) => { d.placements[1].id = d.placements[0].id; },
    (d) => { d.placements[0].assetId = 'V01-canopy'; },
    (d) => { const part = d.placements.find(({ parent }) => parent); part.parent = part.id; },
    (d) => { const part = d.placements.find(({ parent }) => parent); part.parent = 'unknown'; },
    (d) => { d.placements[0].renderDepth = 7000; },
    (d) => { delete d.placements[0].visible; },
    (d) => { d.removedBaseline.length = 0; },
  ]) {
    const bad = JSON.parse(json);
    mutate(bad);
    assert.throws(() => other.importLayout(bad), /incompatible/);
    assert.equal(JSON.stringify(other.exportLayout()), json);
  }
  other.undo(); // Invalid imports didn't write to history.
  assert.equal(other.exportLayout().placements.length, baseline.length);
});

function legacyFixture() {
  const groups = Object.fromEntries(Object.keys(DJ_LAYOUT_GROUPS).map((id) => [id, { dx: 0, dy: 0 }]));
  groups['lower-border-east'] = { dx: 28, dy: -37, visible: false };
  groups['lower-lounge'] = { dx: 5, dy: -3 };
  const overrides = { 'lower-tropical': { dx: 14, dy: -9 }, 'upper-tropical': { dx: 0, dy: 0, visible: false } };
  const objects = Object.fromEntries(baseline.map(({ id, group, x, y }) => {
    const local = Object.entries(overrides).find(([root]) => id === root || id.startsWith(root + '-'))?.[1];
    return [id, { x: x + groups[group].dx + (local?.dx ?? 0), y: y + groups[group].dy + (local?.dy ?? 0),
      ...((local?.visible === false || groups[group].visible === false) && { visible: false }),
    }];
  }));
  return { version: 1, groups, overrides, objects };
}

test('imports legacy V1 positions, local and group visibility, and exports them as V2', () => {
  const legacy = legacyFixture(), state = createDjLayoutEditorState();
  state.importLayout(legacy);
  const migrated = state.exportLayout();
  assert.equal(migrated.version, 2);
  assert.equal(migrated.placements.length, baseline.length);
  for (const { id, x, y, visible, group, depthOffset } of migrated.placements) {
    assert.deepEqual([x, y, visible], [legacy.objects[id].x, legacy.objects[id].y, legacy.objects[id].visible ?? true], id);
    assert.equal(group, baseline.find((part) => part.id === id).group, id);
    assert.equal(depthOffset, 0);
  }
  state.select('group', 'lower-border-east');
  state.toggleVisibility();
  assert.equal(keyById(state.getPlacements()).get('border-east-right').visible, true);
  assert.equal(keyById(state.getPlacements()).get('upper-tropical-lip').visible, false);
  legacy.objects['lower-table'].x++;
  const before = state.exportLayout();
  assert.throws(() => state.importLayout(legacy), /incompatible/);
  assert.deepEqual(state.exportLayout(), before);
});

test('panel catalog places a sprite, depth updates live, and keyboard respects search focus', async () => {
  const { scene, win, camera, images, doc, field, start } = editorHarness();
  const editor = start();
  await field('library-tab').fire('click');
  assert.equal(field('library').hidden, false);
  field('asset-search').value = 'baliza';
  await field('asset-search').fire('input');
  const [card] = field('results').children;
  assert.equal(card.children[0].src, assets.L02.path);
  await field('results').fire('click', { target: card });
  field('add-group').value = 'pool-side';
  scene.input.emit('pointerdown', { id: 2, button: 0, x: 310, y: 605 - camera.scrollY });
  const lamp = images.at(-1);
  assert.equal(lamp.key, assets.L02.key);
  assert.deepEqual([lamp.x, lamp.y], [310, 605]);
  assert.equal(field('target').value, 'dj-1');
  const startDepth = lamp.depth;
  await field('forward').fire('click');
  assert.equal(lamp.depth, startDepth + 4);
  doc.activeElement = field('piece-search');
  await win.fire('keydown', { key: 'z', ctrlKey: true, preventDefault() { assert.fail('search input retains undo'); } });
  assert.equal(lamp.depth, startDepth + 4);
  doc.activeElement = null;
  await win.fire('keydown', { key: 'z', ctrlKey: true, preventDefault() {} });
  assert.equal(lamp.depth, startDepth);
  await field('delete').fire('click');
  assert.equal(lamp.scene, null);
  await field('undo').fire('click');
  assert.equal(images.at(-1).key, assets.L02.key);
  assert.equal(images.at(-1).scene, scene);
  editor.destroy();
  assert.ok(images.every(({ scene }) => scene === null));
});

test('every offered preset fits as an assembly at the world edge and retains its supports on export', () => {
  for (const { source } of djAssetLibrary().filter(({ recipe }) => recipe)) {
    const state = createDjLayoutEditorState();
    const id = state.add(source, 'upper-dj-edge', -10, -10);
    const { placements } = state.exportLayout();
    const byId = keyById(placements);
    const parts = placements.filter(({ root }) => root === id);
    assert.ok(parts.length > 1, source);
    for (const part of parts) {
      assert.ok(part.x >= 0 && part.y >= 0, part.id);
      if (!part.parent) continue;
      const parent = byId.get(part.parent);
      const [cx, cy] = assets[part.assetId].contactPx;
      assert.equal(parent.root, part.root);
      assert.deepEqual([part.x + cx, part.y + cy], [parent.x + part.support[0], parent.y + part.support[1]], part.id);
      assert.ok(part.renderDepth > parent.renderDepth, part.id);
    }
    const accepted = createDjLayoutEditorState();
    accepted.importLayout(JSON.parse(JSON.stringify(state.exportLayout())));
    assert.deepEqual(accepted.exportLayout(), state.exportLayout());
  }
});
