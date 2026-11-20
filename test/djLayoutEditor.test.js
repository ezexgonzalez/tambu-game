import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { DJ_ENVIRONMENT_LAYOUT as baseline } from '../src/world/dj/djEnvironmentLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from '../src/world/dj/djEnvironmentAssets.js';
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

test('JSON round trip is deterministic, preserves hidden assemblies, and reset restores the baseline', () => {
  const state = createDjLayoutEditorState();
  const original = state.exportLayout();
  state.select('group', 'lower-border-east');
  state.move(28, -37);
  state.toggleVisibility();
  state.select('object', 'lower-tropical-plant');
  state.move(14, -9);
  state.select('object', 'upper-tropical');
  state.toggleVisibility();
  const json = JSON.stringify(state.exportLayout());
  const other = createDjLayoutEditorState();
  other.importLayout(JSON.parse(json));
  assert.equal(JSON.stringify(other.exportLayout()), json);
  assert.deepEqual(other.getPlacements(), state.getPlacements());
  const { version, groups, overrides, objects } = JSON.parse(json);
  assert.equal(version, 1);
  assert.deepEqual(groups['lower-border-east'], { dx: 28, dy: -37, visible: false });
  assert.deepEqual(overrides['lower-tropical'], { dx: 14, dy: -9 });
  assert.equal(objects['upper-tropical-lip'].visible, false);
  assert.equal(objects['border-east-right'].visible, false);
  other.reset();
  assert.deepEqual(other.exportLayout(), original);
  assert.equal(other.getSelection(), null);
  assert.deepEqual(createDjLayoutEditorState().exportLayout(), original);
});

test('import rejects unknown targets, incompatible versions, out-of-world and inconsistent positions without mutating edits', () => {
  const state = createDjLayoutEditorState();
  state.select('group', 'pool-side');
  state.move(8, -12);
  const before = state.exportLayout();
  for (const mutate of [
    (data) => { data.version = 2; },
    (data) => { data.groups['some-other-sector'] = { dx: 0, dy: 0 }; },
    (data) => { data.overrides['lower-tropical-lip'] = { dx: 0, dy: 2 }; },
    (data) => { data.objects['lower-table'].x++; },
    (data) => { data.groups['pool-side'].dy = -900; },
    (data) => { data.overrides['upper-table'] = { dx: Infinity, dy: 0 }; },
    (data) => { delete data.groups['upper-lounge']; },
  ]) {
    const data = structuredClone(before);
    mutate(data);
    assert.throws(() => state.importLayout(data), /incompatible/);
    assert.deepEqual(state.exportLayout(), before);
  }
});

test('drag deltas clamp to the world without losing the rigid assembly, and guides only warn', () => {
  const state = createDjLayoutEditorState();
  assert.deepEqual(getDjLayoutWarnings(state.getPlacements()), []);
  state.select('group', 'upper-dj-edge');
  state.move(-1000, 0);
  assert.equal(state.getSelectionOffset().dx, 0, 'tree layout already touches the left edge');
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
    if (tag !== 'aside') return { click() {}, remove() {} };
    panel = {
      setAttribute() {}, append() {}, contains(target) { return [...fields.values()].includes(target); },
      querySelector(key) {
        if (!fields.has(key)) fields.set(key, {
          ...eventNode(), value: key === '[data-mode]' ? 'group' : '',
          replaceChildren() {}, click() {},
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
  const scene = {
    events: new EventEmitter(), input: new EventEmitter(), sys: { game: { canvas } },
    cameras: { main: camera }, textures: { getPixelAlpha: () => 255 },
    add: { graphics() { return {
      scene, lineStyle() { return this; }, strokeRect() {}, lineBetween() {},
      setDepth() { return this; }, setVisible() {}, clear() {}, destroy() { this.scene = null; },
    }; } },
  };
  const images = baseline.map(() => ({
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setDepth(depth) { this.depth = depth; return this; },
    setVisible(show) { this.visible = show; return this; },
  }));
  const image = (id) => images[baseline.findIndex((item) => item.id === id)];
  const field = (id) => fields.get(`[data-${id}]`);
  const start = () => createDjLayoutEditor(scene, images);
  return { scene, win, camera, image, field, start, panel: () => panel, getTabindex: () => tabindex };
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
