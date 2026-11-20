import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { DJ_ENVIRONMENT_ASSETS as assets } from '../src/world/dj/djEnvironmentAssets.js';
import { createDjEnvironmentPreview, getDjEnvironmentPreviewPlacements, isDjEnvironmentPreviewEnabled } from '../src/world/dj/djEnvironmentPreview.js';
import { preloadPatioWorld } from '../src/world/createPatioWorld.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';
import { patioFriends, patioWomen } from '../src/data/patioCharacters.js';

test('DJ catalog verifies the 39 unchanged approved RGBA files and the single reused bottle', () => {
  const entries = Object.values(assets);
  assert.equal(entries.length, 40);
  for (const field of ['key', 'path', 'sha256']) assert.equal(new Set(entries.map((asset) => asset[field])).size, 40);
  assert.equal(Object.hasOwn(assets, 'L05'), false);
  assert.deepEqual(entries.filter(({ reuse }) => reuse), [assets.C01]);
  assert.equal(assets.C01.path, '/assets/props/deck/bottle.png');
  const root = 'public/assets/props/dj_environment';
  for (const [family, count] of Object.entries({ furniture: 12, vegetation: 18, lighting: 8, drinks: 1 })) {
    const files = entries.filter((asset) => asset.family === family && !asset.reuse);
    assert.equal(files.length, count);
    assert.deepEqual(readdirSync(`${root}/${family}`).sort(), files.map(({ path }) => path.split('/').at(-1)).sort());
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
  assert.deepEqual(newPaths.sort(), ['F07', 'F01a', 'F01c', 'F01d', 'F01e', 'C02', 'V06A', 'V02A', 'L01']
    .map((id) => assets[id].path).sort());
});

function mockScene() {
  const images = [];
  const scene = { events: new EventEmitter(), add: { image(x, y, key) {
    const image = { scene, key, x, y, calls: 0,
      setOrigin(x, y) { this.origin = [x, y]; return this; },
      setScale(scale) { this.scale = scale; return this; },
      setDepth(depth) { this.depth = depth; return this; },
      setCrop(...crop) { this.crop = crop; return this; },
      destroy() { this.scene = null; this.calls++; },
    };
    images.push(image);
    return image;
  } } };
  return { scene, images };
}

test('preview assembles native-scale pieces at the approved joints, contacts and depths', () => {
  const { scene } = mockScene();
  const images = createDjEnvironmentPreview(scene);
  assert.equal(images.length, 12);
  assert.ok(images.every(({ scale }) => scale === 1));
  const get = (id) => images.find(({ key }) => key === assets[id].key);
  const corner = get('F01a');
  const end = get('F01c');
  assert.equal(end.x - corner.x, 88);
  assert.equal(end.y, corner.y);
  assert.equal(get('F01d').y - corner.y, 96);
  assert.equal(get('F01e').y - get('F01d').y, 32);
  for (const id of ['F01a', 'F01c', 'F01d', 'F01e']) {
    assert.equal(get(id).depth, get(id).y + assets[id].contactPx[1]);
  }
  const table = get('F04'), bottle = get('C01'), cup = get('C02');
  const { center, radii } = assets.F04.usableSurface;
  for (const [id, object] of [['C01', bottle], ['C02', cup]]) {
    const [low, high] = assets[id].soleSpan;
    for (const dx of [low, high]) {
      assert.ok(((object.x - table.x + dx - center[0]) / radii[0]) ** 2
        + ((object.y - table.y - center[1]) / radii[1]) ** 2 <= 1);
    }
  }
  assert.ok(get('F07').depth < 0 && table.depth < bottle.depth && bottle.depth < cup.depth);
  const [pot, lip] = images.filter(({ key }) => key === assets.V06A.key);
  const plant = get('V02A');
  assert.deepEqual([plant.x, plant.y], [pot.x, pot.y - 53 + 13]);
  assert.deepEqual([lip.x, lip.y, lip.origin, lip.crop], [pot.x, pot.y, pot.origin, [0, 14, 50, 41]]);
  assert.ok(pot.depth < plant.depth && plant.depth < lip.depth);
  assert.equal(get('L01').depth, get('L01').y);
  assert.deepEqual(assets.L01.lightEmitter.localPx, [9, 27]);
});

test('temporary footprint leaves original DJ, pool, access and actors clear', () => {
  const placements = getDjEnvironmentPreviewPlacements();
  const envelope = {
    left: Math.min(...placements.map(({ left }) => left)),
    top: Math.min(...placements.map(({ top }) => top)),
    right: Math.max(...placements.map(({ id, left }) => left + assets[id].width)),
    bottom: Math.max(...placements.map(({ id, top }) => top + assets[id].height)),
  };
  const { world, terrain, dj, pool, events: { bathroom } } = PATIO_LAYOUT;
  assert.ok(envelope.left >= world.x && envelope.bottom <= terrain.grass.y + terrain.grass.height);
  assert.ok(envelope.top > dj.y + dj.height + 32 && envelope.top > terrain.deckEdge.y + terrain.deckEdge.height);
  assert.ok(envelope.right < Math.min(pool.x, terrain.entry.x) - 40);
  for (const { x, y } of [...patioFriends, ...patioWomen,
    ...Object.values(bathroom.entryPaths).flat(), ...Object.values(bathroom.returnPaths).flat(), ...bathroom.commonPath]) {
    // The whole preview lies west of every protected actor/waypoint, even with padding.
    assert.ok(x - 24 > envelope.right || y - 40 > envelope.bottom || y + 40 < envelope.top);
  }
  for (const paths of [bathroom.entryPaths, bathroom.returnPaths]) {
    for (const route of Object.values(paths)) assert.ok(route.every(({ x }) => x - 40 > envelope.right));
  }
});

test('shutdown and restart release preview instances whether before or after scene-owned cleanup', () => {
  const { scene, images } = mockScene();
  const first = createDjEnvironmentPreview(scene);
  scene.events.emit('shutdown');
  assert.equal(first.length, 0);
  assert.ok(images.every(({ calls }) => calls === 1));
  assert.equal(scene.events.listenerCount('shutdown'), 0);

  const restarted = createDjEnvironmentPreview(scene);
  assert.equal(restarted.length, 12);
  restarted.forEach((image) => image.destroy());
  scene.events.emit('shutdown');
  assert.equal(restarted.length, 0);
  assert.equal(images.length, 24);
  assert.ok(images.every(({ calls }) => calls === 1));
  assert.equal(scene.events.listenerCount('shutdown'), 0);
});
