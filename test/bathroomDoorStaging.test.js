import test from 'node:test';
import { attachWorldCameraGeometry } from '../test-support/bathroomCameras.js';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { createBathroomCameraStaging, createBathroomDoorImpact, BATHROOM_DOOR_STAGING } from '../src/events/bathroomDoorStaging.js';
import { getBathroomReactionTimeline } from '../src/events/bathroomReactionTimeline.js';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';
import { getBathroomResistanceConfig } from '../src/events/bathroomResistance.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';
import { getPatioCollisionZones, createPatioCollisions } from '../src/world/createPatioCollisions.js';

const hooks = registerHooks({ resolve(specifier, context, next) {
  return specifier === 'phaser' ? { shortCircuit: true,
    url: 'data:text/javascript,export default {Math:{Linear:(a,b,t)=>a+(b-a)*t}}' } : next(specifier, context);
} });
const { createPatioWorld, preloadPatioWorld } = await import('../src/world/createPatioWorld.js');
hooks.deregister();

function movable(x, y) {
  return { x, y, setPosition(x, y) { this.x = x; this.y = y; return this; } };
}
function camera() {
  return attachWorldCameraGeometry({
    width: 1280, height: 720, scrollX: 300, scrollY: 0, zoomX: 1, zoomY: 1,
    _follow: { x: 1343, y: 142 }, roundPixels: true, useBounds: true,
    lerp: { x: 0.1, y: 0.1 }, followOffset: { x: 7, y: 9 },
    followStarts: 0,
    stopFollow() { this._follow = null; },
    startFollow(target, roundPixels, x, y, ox, oy) {
      this.followStarts++;
      this._follow = target; this.roundPixels = roundPixels;
      this.lerp = { x, y }; this.followOffset = { x: ox, y: oy };
      this.scrollX = 999; this.scrollY = 999; // Phaser startFollow writes scroll too.
    },
    setScroll(x, y) { this.scrollX = x; this.scrollY = y; },
    setZoom(x, y) { this.zoomX = x; this.zoomY = y; },
  }, PATIO_LAYOUT.world);
}

test('impacto pixel-safe mueve puerta y BAÑO juntos, restaura neutral y no acumula drift', () => {
  const door = { sprite: movable(1343, 150), label: movable(1343, 40) };
  const impact = createBathroomDoorImpact(door);
  for (let repetition = 0; repetition < 20; repetition++) {
    impact.trigger();
    assert.deepEqual([door.sprite.x, door.label.x], [1345, 1345]);
    for (const expected of [1341, 1344, 1343, 1343]) {
      impact.update(30);
      assert.deepEqual([door.sprite.x, door.label.x], [expected, expected]);
      assert.deepEqual([door.sprite.y, door.label.y], [150, 40]);
    }
  }
  impact.trigger(); impact.trigger(); impact.update(240);
  assert.equal(door.sprite.x, 1343);
  impact.trigger(); impact.destroy(); impact.destroy(); impact.update(100); impact.trigger();
  assert.deepEqual([door.sprite.x, door.label.x], [1343, 1343]);
});

test('camera staging centra baño, mantiene hold y restaura el snapshot solo con restore', () => {
  const cam = camera();
  const saved = { ...cam, lerp: { ...cam.lerp }, followOffset: { ...cam.followOffset } };
  const staging = createBathroomCameraStaging(cam, PATIO_LAYOUT.house.bathroom);
  assert.equal(cam._follow, null); assert.equal(cam.useBounds, true);
  staging.update(200);
  assert.ok(cam.zoomX > 1 && cam.zoomX < 1.75);
  staging.update(400);
  assert.equal(cam.zoomX, 1.75);
  cam.preRenderBounds();
  assert.equal(cam.originX, 0); assert.equal(cam.originY, 0);
  assert.ok(cam.scrollX >= 0 && cam.scrollY >= 0);
  assert.ok(cam.scrollX + cam.width / cam.zoomX <= PATIO_LAYOUT.world.width + 1e-9);
  assert.ok(cam.scrollY + cam.height / cam.zoomY <= PATIO_LAYOUT.world.height + 1e-9);
  assert.equal(cam.scrollY, 0);
  const doorScreenY = (150 - 61 - cam.scrollY) * cam.zoomY;
  assert.ok(doorScreenY / cam.height >= 0.18 && doorScreenY / cam.height <= 0.28);
  const focused = [cam.scrollX, cam.scrollY, cam.zoomX, cam.zoomY];
  for (const elapsed of [4625, BATHROOM_DOOR_STAGING.durationMs, 14800]) {
    staging.update(elapsed); staging.hold();
    assert.deepEqual([cam.scrollX, cam.scrollY, cam.zoomX, cam.zoomY], focused);
    assert.equal(cam._follow, null); assert.equal(cam.useBounds, true);
    assert.equal(cam.followStarts, 0);
  }
  staging.restore();
  for (const key of ['zoomX', 'zoomY', 'scrollX', 'scrollY', '_follow', 'roundPixels', 'useBounds', 'lerp', 'followOffset', 'originX', 'originY', '_bounds', 'preRender']) {
    assert.deepEqual(cam[key], saved[key], key);
  }
  staging.restore(); staging.destroy(); staging.destroy(); staging.update(400); staging.hold();
  assert.equal(cam.zoomX, 1);
  assert.equal(cam.followStarts, 1);
});

test('abortar staging en approach, anticipation hold o resistance hold no deja cámara alterada', () => {
  for (const elapsed of [200, 3200, 14800]) {
    const cam = camera(); const follow = cam._follow;
    const staging = createBathroomCameraStaging(cam, PATIO_LAYOUT.house.bathroom);
    staging.update(elapsed); staging.destroy();
    assert.deepEqual([cam.scrollX, cam.scrollY, cam.zoomX, cam.zoomY], [300, 0, 1, 1]);
    assert.equal(cam._follow, follow); assert.equal(cam.useBounds, true);
  }
});

test('timeline deja leer cada voz, prioriza memoria y cabe dentro de los diez segundos', () => {
  for (const attemptNumber of [1, 2, 3]) {
    const narrative = getBathroomResistanceNarrative({ attemptNumber, previousResults: Array(attemptNumber - 1).fill('secured') });
    const config = getBathroomResistanceConfig(attemptNumber);
    const timeline = getBathroomReactionTimeline(narrative, config);
    assert.deepEqual(timeline.map(({ reaction }) => reaction), narrative.hits.filter(({ speaker }) => speaker));
    for (let index = 0; index < timeline.length; index++) {
      const item = timeline[index];
      const end = timeline[index + 1]?.at ?? config.durationMs;
      assert.ok(end - item.at >= item.readingMs);
      assert.ok(item.readingMs >= 1400);
      const hitIndex = narrative.hits.indexOf(item.reaction);
      assert.ok(item.at >= config.hits[hitIndex].at, 'no anticipa hechos');
    }
    if (attemptNumber > 1) {
      const memoryIndex = attemptNumber === 2 ? 4 : 2;
      assert.equal(timeline.find(({ reaction }) => reaction === narrative.hits[memoryIndex]).readingMs, 2000);
    }
  }
});

test('createPatioWorld propaga el único sprite real de puerta y su label desde HouseFacade', () => {
  const objects = [];
  function display(type, x = 0, y = 0, key = '') {
    const object = { type, x, y, key, height: 122, width: 110,
      setOrigin() { return this; }, setDepth() { return this; }, setAlpha() { return this; },
      setScale() { return this; }, setFlipX() { return this; }, setDisplaySize() { return this; },
      setCrop() { return this; }, play() { return this; },
      fillStyle() { return this; }, fillRect() { return this; }, fillCircle() { return this; },
      fillEllipse() { return this; }, lineStyle() { return this; }, strokeCircle() { return this; },
      lineBetween() { return this; },
    };
    objects.push(object); return object;
  }
  const scene = {
    add: { graphics: () => display('graphics'), image: (x, y, key) => display('image', x, y, key),
      sprite: (x, y, key) => display('sprite', x, y, key),
      tileSprite: (x, y, width, height, key) => display('tileSprite', x, y, key), rectangle: (x, y) => display('rectangle', x, y),
      text: (x, y, text) => display('text', x, y, text) },
    textures: { get: () => ({ getSourceImage: () => ({ height: 32, width: 32 }) }) },
    anims: { exists: () => true }, time: { delayedCall() {} },
    make: { tilemap: () => ({ addTilesetImage: () => ({}), createLayer: () => display('grass-layer') }) },
  };
  const { bathroomDoor } = createPatioWorld(scene);
  assert.equal(bathroomDoor.sprite, objects.find(({ key }) => key === 'house-door-bathroom'));
  assert.equal(bathroomDoor.label, objects.find(({ key }) => key === 'BAÑO'));
  assert.equal(objects.filter(({ key }) => key === 'house-door-bathroom').length, 1);
  assert.deepEqual([bathroomDoor.sprite.x, bathroomDoor.sprite.y], [1343, 150]);
  const keys = objects.map(({ key }) => key);
  for (const key of ['deck-base-01', 'deck-edge-bottom', 'terrain', 'house-wall-base',
    'house-door', 'house-door-bathroom', 'house-planter', 'pool-frame-04',
    'pool-water-surface-07', 'bar-front-center-02', 'dj-booth-front-01']) {
    assert.ok(keys.includes(key), `estructura preservada: ${key}`);
  }
  assert.equal(objects.filter(({ type }) => type === 'grass-layer').length, 2);
  assert.equal(objects.filter(({ type }) => type === 'graphics').length, 1,
    'solo queda Graphics del deck aprobado; no ambientación provisional del patio');
  assert.ok(keys.every((key) => !key.startsWith('perimeter-')));
  const source = readFileSync('src/scenes/PatioScene.js', 'utf8');
  assert.match(source, /this\.worldVisuals = createPatioWorld\(this\)/);
  assert.match(source, /bathroomDoor: this\.worldVisuals\.bathroomDoor/);
});

 test('approach clamps the complete zoomed viewport within the real world on every frame', () => {
  const cam = camera();
  const staging = createBathroomCameraStaging(cam, PATIO_LAYOUT.house.bathroom, PATIO_LAYOUT.world);
  for (let elapsed = 0; elapsed <= 400; elapsed += 10) {
    staging.update(elapsed); cam.preRender();
    assert.equal(cam.worldView.x, cam.scrollX);
    assert.equal(cam.worldView.y, cam.scrollY);
    assert.equal(cam.worldView.width, cam.width / cam.zoomX);
    assert.equal(cam.worldView.height, cam.height / cam.zoomY);
    assert.equal(cam.useBounds, true);
    assert.ok(cam.scrollX >= -1e-9 && cam.scrollY >= -1e-9);
    assert.ok(cam.scrollX + cam.width / cam.zoomX <= PATIO_LAYOUT.world.width + 1e-9);
    assert.ok(cam.scrollY + cam.height / cam.zoomY <= PATIO_LAYOUT.world.height + 1e-9);
  }
  staging.destroy();
});


test('clean canvas preload conserva estructuras y no carga assets del perímetro rechazado', () => {
  const loaded = [];
  preloadPatioWorld({ load: {
    image: (key, path) => loaded.push([key, path]),
    spritesheet: (key, path) => loaded.push([key, path]),
  } });
  assert.ok(loaded.every(([key, path]) => !key.startsWith('perimeter-') && !path.includes('/perimeter/')));
  for (const prefix of ['grass-', 'deck-', 'house-', 'pool-', 'bar-', 'dj-']) {
    assert.ok(loaded.some(([key]) => key.startsWith(prefix)), prefix);
  }
  assert.ok(loaded.some(([key]) => key === 'terrain'));
});

test('clean canvas conserva solo los ocho colliders de house/pool/bar/DJ y libera los props retirados', () => {
  const zones = getPatioCollisionZones();
  assert.deepEqual(zones.map(({ id }) => id), [
    'house', 'pool', 'bar-body', 'dj-front', 'dj-speaker-left', 'dj-speaker-right',
    'dj-support-left', 'dj-support-right',
  ]);
  for (const [x, y] of [[1178, 558], [360, 592], [1354, 521]]) {
    assert.ok(!zones.some((zone) => Math.abs(x - zone.x) <= zone.width / 2
      && Math.abs(y - zone.y) <= zone.height / 2), 'sin obstáculos invisibles en mesas/cooler retirados');
  }
  for (const field of ['partyTables', 'cooler', 'garlands', 'patioLanterns', 'clutter']) {
    assert.equal(Object.hasOwn(PATIO_LAYOUT, field), false, `data legacy removida: ${field}`);
  }
  const bodies = []; const links = []; const player = {};
  const scene = {
    add: { rectangle: (x, y, width, height) => ({ x, y, width, height }) },
    physics: { add: { existing: (zone, isStatic) => bodies.push([zone, isStatic]),
      collider: (actor, zone) => links.push([actor, zone]) } },
  };
  const actual = createPatioCollisions(scene, player);
  assert.equal(actual.length, 8); assert.equal(bodies.length, 8); assert.equal(links.length, 8);
  assert.ok(bodies.every(([, isStatic]) => isStatic));
  assert.ok(links.every(([actor]) => actor === player));
  assert.deepEqual(actual, zones.map(({ id, ...rect }) => rect));
});
