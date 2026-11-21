import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { DJ_ENVIRONMENT_ASSETS as assets } from '../src/world/dj/djEnvironmentAssets.js';
import { createDjEnvironmentComposition, createDjEnvironmentPreview, isDjEnvironmentPreviewEnabled } from '../src/world/dj/djEnvironmentPreview.js';
import { DJ_ENVIRONMENT_LAYOUT as layout } from '../src/world/dj/djEnvironmentLayout.js';
import { getPatioCollisionZones } from '../src/world/createPatioCollisions.js';
import { preloadPatioWorld } from '../src/world/createPatioWorld.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';
import { patioFriends, patioWomen } from '../src/data/patioCharacters.js';

test('DJ catalog verifies the 60 registered RGBA files and the single reused bottle', () => {
  const entries = Object.values(assets);
  assert.equal(entries.length, 61);
  for (const field of ['key', 'path']) assert.equal(new Set(entries.map((asset) => asset[field])).size, 61);
  assert.equal(new Set(entries.map((asset) => asset.sha256)).size, 60);
  assert.equal(assets.PA15.sha256, assets.PA16.sha256); // Same art, distinct connection ports.
  assert.equal(Object.hasOwn(assets, 'L05'), false);
  assert.deepEqual(entries.filter(({ reuse }) => reuse), [assets.C01]);
  assert.equal(assets.V02A.sha256, '99d1f76301cf4396fd34ef7b7e0fb4ee751ca4c949f71997baf68d441782c6aa');
  assert.deepEqual([assets.V02A.width, assets.V02A.height, assets.V02A.originPx, assets.V02A.contactPx],
    [80, 67, [40, 65], [40, 65]]);
  assert.equal(assets.C01.path, '/assets/props/deck/bottle.png');
  const root = 'public/assets/props/dj_environment';
  for (const [family, count] of Object.entries({ furniture: 12, vegetation: 18, lighting: 8, drinks: 1, perimeter: 21 })) {
    const files = entries.filter((asset) => asset.family === family && !asset.reuse);
    assert.equal(files.length, count);
    assert.deepEqual(readdirSync(`${root}/${family === "perimeter" ? "perimeter_concept_a" : family}`).sort(), files.map(({ path }) => path.split('/').at(-1)).sort());
  }

  for (const [id, asset] of Object.entries(assets)) {
    const file = readFileSync(`public${asset.path}`);
    assert.equal(createHash('sha256').update(file).digest('hex'), asset.sha256, id);
    assert.equal(file.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.deepEqual([file.readUInt32BE(16), file.readUInt32BE(20), file[24], file[25]], [asset.width, asset.height, 8, 6]);
    for (const [x, y] of [asset.originPx, asset.contactPx, asset.lightEmitter?.localPx].filter(Boolean)) {
      assert.ok(x >= 0 && x < asset.width && y >= 0 && y < asset.height, id);
    }
    if (asset.lightEmitter) {
      assert.deepEqual(asset.lightEmitter.offsetPx, asset.lightEmitter.localPx.map((value, i) => value - asset.originPx[i]));
    }
  }
});

test('preview is opt-in; preload requests only used new textures with the deck bottle loaded once', () => {
  for (const query of [undefined, '', '?djEnvPreview=0', '?djEnvPreview=true', '?scene=grass-calibration']) {
    assert.equal(isDjEnvironmentPreviewEnabled(query), false);
  }
  assert.equal(isDjEnvironmentPreviewEnabled('?other=2&djEnvPreview=1'), true);
  const loaded = [];
  const scene = { textures: { exists: (key) => key === assets.F04.key },
    load: { image: (...entry) => loaded.push(entry), spritesheet: (...entry) => loaded.push(entry) } };
  preloadPatioWorld(scene);
  assert.equal(loaded.filter(([key]) => key === 'deck-bottle').length, 1);
  assert.ok(!loaded.some(([, path]) => path.includes('/dj_environment/')));
  loaded.length = 0;
  preloadPatioWorld(scene, { djEnvPreview: true });
  assert.equal(loaded.filter(([key]) => key === 'deck-bottle').length, 1);
  const newPaths = loaded.filter(([, path]) => path.includes('/dj_environment/')).map(([, path]) => path);
  const expected = new Set(layout.map(({ assetId }) => assets[assetId])
    .filter(({ reuse, key }) => !reuse && key !== assets.F04.key).map(({ path }) => path));
  assert.deepEqual(new Set(newPaths), expected);
  assert.equal(newPaths.length, expected.size, 'each texture loads once, even when several parts use it');
  assert.ok(!newPaths.includes(assets['L03-A0'].path));
  for (const flags of [{ djLayoutEdit: true }, { djLayoutEdit: true, djEnvPreview: true }]) {
    loaded.length = 0;
    preloadPatioWorld(scene, flags);
    const editorPaths = loaded.filter(([, path]) => path.includes('/dj_environment/')).map(([, path]) => path);
    const catalog = new Set(Object.values(assets).filter(({ key, reuse }) => !reuse && key !== assets.F04.key).map(({ path }) => path));
    assert.deepEqual(new Set(editorPaths), catalog);
    assert.equal(editorPaths.length, catalog.size);
    assert.ok(editorPaths.includes(assets['L03-A0'].path));
    assert.equal(loaded.filter(([key]) => key === 'deck-bottle').length, 1);
  }
});

function mockScene() {
  const images = [];
  const scene = { events: new EventEmitter(), add: { image(x, y, key) {
    const image = { scene, key, x, y, calls: 0,
      setOrigin(x, y) { this.origin = [x, y]; return this; },
      setScale(scale) { this.scale = scale; return this; },
      setDepth(depth) { this.depth = depth; return this; },
      setPosition(x, y) { this.x = x; this.y = y; return this; },
      setVisible(visible) { this.visible = visible; return this; },
      setCrop(...crop) { this.crop = crop; return this; },
      destroy() { this.scene = null; this.calls++; },
    };
    images.push(image);
    return image;
  } } };
  return { scene, images };
}

test('shutdown and restart release preview instances whether before or after scene-owned cleanup', () => {
  const { scene, images } = mockScene();
  const first = createDjEnvironmentPreview(scene);
  const firstInstances = [...first];
  scene.events.emit('shutdown');
  assert.equal(first.length, 0);
  assert.ok(images.every(({ calls }) => calls === 1));
  assert.equal(scene.events.listenerCount('shutdown'), 0);

  const restarted = createDjEnvironmentPreview(scene);
  assert.equal(restarted.length, layout.length);
  assert.ok(restarted.every((image) => !firstInstances.includes(image)));
  restarted.forEach((image) => image.destroy());
  scene.events.emit('shutdown');
  assert.equal(restarted.length, 0);
  assert.equal(images.length, 2 * layout.length);
  assert.ok(images.every(({ calls }) => calls === 1));
  assert.equal(scene.events.listenerCount('shutdown'), 0);
});

const byId = new Map(layout.map((item) => [item.id, item]));
const get = (id) => byId.get(id);
const contact = ({ assetId, x, y }) => [x + assets[assetId].contactPx[0], y + assets[assetId].contactPx[1]];
const children = ({ id }) => layout.filter((item) => item.parent === id);
const box = (x, y, width, height) => ({ x, y, width, height });
const bounds = ({ x, y, assetId }) => box(x, y, assets[assetId].width, assets[assetId].height);
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y;

test('placements have unique IDs, use approved textures at 1×, and resolve ordered supports', () => {
  const { world, terrain } = PATIO_LAYOUT;
  const seen = new Set();
  assert.equal(byId.size, layout.length);
  assert.deepEqual(new Set(layout.map(({ sector }) => sector)),
    new Set(['upper-left', 'upper-lounge', 'lower-lounge', 'lower-border', 'pool-side']));
  for (const item of layout) {
    const { id, assetId, parent, support, crop, x, y, scale, depth, depthRule } = item;
    const { width, height } = assets[assetId];
    assert.ok(Number.isInteger(x) && x >= world.x && x + width <= world.x + world.width, id);
    assert.ok(Number.isInteger(y) && y >= terrain.grass.y && y + height <= world.y + world.height, id);
    assert.equal(scale, 1, id);
    if (parent) {
      assert.ok(seen.has(parent), `${id} needs an existing parent; cycles cannot render`);
      const host = get(parent), hostAsset = assets[host.assetId];
      assert.equal(host.sector, item.sector);
      assert.ok(support[0] >= 0 && support[0] < hostAsset.width && support[1] >= 0 && support[1] < hostAsset.height);
      assert.deepEqual(contact(item), [host.x + support[0], host.y + support[1]], id);
      assert.ok(depth > host.depth, id);
      assert.equal(depthRule, 'parent');
    } else if (assetId === 'F07') {
      assert.equal(depthRule, 'ground');
      assert.ok(depth > -30 && depth < 0, 'rug lies above grass and below grounded objects');
    } else {
      assert.equal(depthRule, 'feet');
      assert.equal(depth, contact(item)[1], id);
    }
    if (crop) {
      assert.equal(assetId, get(parent).assetId, id);
      assert.deepEqual([x, y], [get(parent).x, get(parent).y], id);
      const [left, top, w, h] = crop;
      assert.ok(left >= 0 && top > 0 && left + w <= width && top + h <= height, id);
    }
    seen.add(id);
  }
});

test('Phaser preview applies registered origins, scale, depths and same-texture front crops', () => {
  const { scene } = mockScene();
  const images = createDjEnvironmentPreview(scene);
  assert.equal(images.length, layout.length);
  for (const [i, item] of layout.entries()) {
    const { key, width, height, originPx: [ox, oy] } = assets[item.assetId];
    const image = images[i];
    assert.equal(image.key, key);
    assert.deepEqual([image.x, image.y, image.origin, image.scale, image.depth, image.crop],
      [item.x + ox, item.y + oy, [ox / width, oy / height], item.scale, item.depth, item.crop], item.id);
  }
});

test('the two sofa lengths use Pack A seams; cushions use the seat and the lower table sits on its rug', () => {
  const offsets = {
    'end-down': [88, 0], 'straight-right': [0, 96], 'end-right': [0, 128],
  };
  for (const name of ['upper-sofa', 'lower-sofa']) {
    const corner = get(`${name}-corner`);
    for (const [part, [dx, dy]] of Object.entries(offsets)) {
      const item = get(`${name}-${part}`);
      const extra = name === 'lower-sofa' && part === 'end-down' ? 70 : 0;
      assert.deepEqual([item.x - corner.x, item.y - corner.y], [dx + extra, dy]);
    }
    const cushions = children(corner);
    assert.equal(cushions.length, name === 'lower-sofa' ? 2 : 1);
    assert.ok(cushions.every(({ assetId, depth }) => assetId.startsWith('F02') && depth > corner.depth));
  }
  assert.equal(get('upper-sofa-straight-down'), undefined);
  const straight = get('lower-sofa-straight-down'), corner = get('lower-sofa-corner');
  assert.deepEqual([straight.x - corner.x, straight.y - corner.y], [88, 0]);
  const rug = get('lower-rug'), table = get('lower-table');
  assert.ok(rug.depth < table.depth);
  const [tableX, tableY] = contact(table);
  assert.ok(overlaps(bounds(rug), box(tableX, tableY, 1, 1)));
});

function inSurface(x, y, surface) {
  if (surface.shape === 'rect') {
    const [left, top, width, height] = surface.bounds;
    return x >= left && x <= left + width && y >= top && y <= top + height;
  }
  const { center: [cx, cy], radii: [rx, ry] } = surface;
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

test('the three tables have their Pack D props on usable surfaces in back-to-front order', () => {
  for (const [id, expected] of Object.entries({
    'edge-cocktail': ['C01', 'C02', 'L04'],
    'upper-table': ['L04', 'V08', 'C02'],
    'lower-table': ['C01', 'L04', 'C02'],
  })) {
    const table = get(id), surface = assets[table.assetId].usableSurface;
    const props = children(table).sort((a, b) => a.depth - b.depth);
    assert.deepEqual(props.map(({ assetId }) => assetId), expected);
    let lastY = -1, lastDepth = table.depth;
    for (const { id, assetId, support: [x, y], depth } of props) {
      const [low, high] = assets[assetId].soleSpan ?? [0, 0];
      assert.ok(inSurface(x + low, y, surface) && inSurface(x + high, y, surface), id);
      assert.ok(y > lastY && depth > lastDepth, id);
      lastY = y;
      lastDepth = depth;
    }
  }
});

test('pots preserve Pack B root insertions and three independent V07s preserve the stone lips', () => {
  const insertions = { V02A: [25, 13], V02B: [25, 14], V04B: [35, 12], V03A: [35, 9] };
  for (const pot of layout.filter(({ assetId, crop }) => assetId.startsWith('V06') && !crop)) {
    const [plant, lip] = children(pot);
    assert.deepEqual(plant.support, insertions[plant.assetId]);
    assert.equal(lip.crop[1], pot.assetId === 'V06A' ? 14 : 12);
    assert.ok(pot.depth < plant.depth && plant.depth < lip.depth);
  }

  const lefts = layout.filter(({ assetId, crop }) => assetId === 'V07-left' && !crop);
  assert.equal(lefts.length, 3);
  let lastEnd = -Infinity;
  const plantings = new Set();
  for (const left of lefts.sort((a, b) => a.x - b.x)) {
    const base = left.id.replace(/-left$/, '');
    const middle = get(`${base}-middle`), right = get(`${base}-right`);
    assert.deepEqual([middle.x - left.x, right.x - middle.x], [12, 136]);
    assert.equal(middle.y, left.y);
    assert.equal(right.y, left.y);
    assert.ok(left.x + 2 - lastEnd >= 20, 'separate rows of stone must leave a break');
    lastEnd = right.x + 14;
    for (const part of [left, middle, right]) assert.equal(get(`${part.id}-lip`).crop[1], 19);
    const plants = children(middle).filter(({ crop }) => !crop);
    assert.ok(plants.length >= 2);
    for (const { support: [x, y], depth } of plants) {
      assert.ok(x >= 14 && x <= 126 && y >= 9 && y <= 14);
      assert.ok(depth < get(`${middle.id}-lip`).depth);
    }
    plantings.add(plants.map(({ assetId }) => assetId).join());
  }
  assert.equal(plantings.size, 3, 'distinct silhouettes across the three groups');
});

test('the tree shares one registration and the garland is joined, clipped and hung on both cables', () => {
  const trunk = get('edge-tree'), canopy = get('edge-tree-canopy');
  assert.deepEqual(bounds(trunk), bounds(canopy));
  assert.ok(canopy.depth > trunk.depth);
  const first = get('edge-garland-slope'), last = get('edge-garland-end');
  const { joins: from } = assets[first.assetId];
  const { joins: to } = assets[last.assetId];
  assert.deepEqual(last.support, from.join_to_local_px);
  assert.deepEqual([last.x - first.x, last.y - first.y], from.delta_px);
  const clipLeft = get('edge-garland-tree-clip'), clipRight = get('edge-garland-speaker-clip');
  assert.deepEqual([clipLeft.support, clipRight.support], [from.join_from_local_px, to.join_to_local_px]);
  assert.equal(clipLeft.anchor, trunk.id);
  assert.equal(clipRight.anchor, 'dj-left-speaker');
  const speaker = PATIO_LAYOUT.dj.speakers[0];
  const [sx, sy] = contact(clipRight);
  assert.ok(overlaps(speaker, box(sx, sy, 1, 1)));
  for (const cable of [first, last]) {
    const [bulb] = children(cable).filter(({ assetId }) => assetId === 'L03-B');
    const [x, y] = bulb.support;
    const { join_from_local_px: [cx, cy], delta_px: [dx, dy] } = assets[cable.assetId].joins;
    assert.ok(x > cx && x < cx + dx && Math.abs(y - (cy + (x - cx) / dx * dy)) <= 1);
    assert.deepEqual(assets[bulb.assetId].lightEmitter.offsetPx, [0, 8]);
  }
});

// Sweep a rectangle along every route segment, rather than checking only waypoints.
function segmentHitsRect(start, end, rect) {
  let first = 0, last = 1;
  for (const [pos, delta, low, high] of [
    [start.x, end.x - start.x, rect.x, rect.x + rect.width],
    [start.y, end.y - start.y, rect.y, rect.y + rect.height],
  ]) {
    if (delta === 0) {
      if (pos < low || pos > high) return false;
    } else {
      const a = (low - pos) / delta, b = (high - pos) / delta;
      first = Math.max(first, Math.min(a, b));
      last = Math.min(last, Math.max(a, b));
    }
  }
  return first <= last;
}

test('art leaves the central dance core, pool rim, access, cast and bathroom lanes clear', () => {
  const { pool, events: { bathroom }, terrain: { entry }, dj } = PATIO_LAYOUT;
  const danceCore = box(260, dj.y + 205, 175, 350);
  const protectedAreas = [
    pool, entry, danceCore,
    // Allow for sprite, label and (for the girls) the marker above the sprite.
    ...[...patioFriends, ...patioWomen].map(({ x, y, id }) => ({ ...box(x - 28, y - 66, 56, 114), id })),
  ];
  const outbound = Object.values(bathroom.entryPaths).map((route) => route.concat(bathroom.commonPath));
  const routes = [...outbound, ...Object.values(bathroom.returnPaths)];
  for (const item of layout.filter(({ crop }) => !crop)) {
    const art = bounds(item);
    for (const area of protectedAreas) assert.ok(!overlaps(art, area), `${item.id} crosses ${area.id ?? 'a clear area'}`);
    const margin = bathroom.actorSpacing + 25; // two lanes, each with a full visual half width
    const routeEnvelope = box(art.x - margin, art.y - margin, art.width + 2 * margin, art.height + 2 * margin);
    for (const path of routes) {
      for (let i = 1; i < path.length; i++) {
        assert.ok(!segmentHitsRect(path[i - 1], path[i], routeEnvelope), `${item.id} crosses walking segment ${i}`);
      }
    }
  }
});

test('suggested ground footprints do not intersect the patio solids or other props', () => {
  const existing = getPatioCollisionZones().map(({ id, x, y, width, height }) =>
    ({ ...box(x - width / 2, y - height / 2, width, height), id }));
  const footprints = layout.filter(({ depthRule }) => depthRule === 'feet').flatMap((item) => {
    const intent = assets[item.assetId].colliderIntent;
    if (!Array.isArray(intent) || intent.length === 0) return [];
    return (Array.isArray(intent[0]) ? intent : [intent]).map(([x, y, width, height]) =>
      ({ ...box(item.x + x, item.y + y, width, height), id: item.id }));
  });
  for (const [i, footprint] of footprints.entries()) {
    for (const other of [...existing, ...footprints.slice(i + 1)]) {
      if (footprint.id !== other.id) assert.ok(!overlaps(footprint, other), `${footprint.id} hits ${other.id}`);
    }
  }
});

test('renderer reconciles stable IDs, new textures, crops and teardown by composition', () => {
  const { scene, images } = mockScene();
  const renderer = createDjEnvironmentComposition(scene);
  const root = { id: 'dj-1', assetId: 'V06A', x: 100, y: 200, scale: 1, depth: 253, visible: true };
  const lip = { ...root, id: 'dj-1.lip', crop: [0, 14, 50, 41], depth: 253.04, renderDepth: 253.0401 };
  renderer.sync([root, lip]);
  assert.equal(images.length, 2);
  assert.deepEqual(images[1].crop, lip.crop);
  assert.equal(images[1].depth, lip.renderDepth);
  renderer.sync([{ ...root, x: 115, visible: false }]);
  const [ox] = assets.V06A.originPx;
  assert.equal(images[0].x, 115 + ox);
  assert.equal(images[0].visible, false);
  assert.equal(images[1].calls, 1);
  assert.equal(images.length, 2, 'same ID does not create another image');
  renderer.sync([{ ...root, assetId: 'L02' }]);
  assert.equal(images[0].calls, 1, 'same ID with a different template changes texture');
  assert.equal(images[2].key, assets.L02.key);
  renderer.destroy();
  renderer.destroy();
  assert.ok(images.every(({ calls }) => calls === 1));
});
