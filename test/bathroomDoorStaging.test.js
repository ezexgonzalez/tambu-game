import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { createBathroomCameraStaging, createBathroomDoorImpact, BATHROOM_DOOR_STAGING } from '../src/events/bathroomDoorStaging.js';
import { getBathroomReactionTimeline } from '../src/events/bathroomReactionTimeline.js';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';
import { getBathroomResistanceConfig } from '../src/events/bathroomResistance.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const hooks = registerHooks({ resolve(specifier, context, next) {
  return specifier === 'phaser' ? { shortCircuit: true,
    url: 'data:text/javascript,export default {Math:{Linear:(a,b,t)=>a+(b-a)*t}}' } : next(specifier, context);
} });
const { createPatioWorld } = await import('../src/world/createPatioWorld.js');
hooks.deregister();

function movable(x, y) {
  return { x, y, setPosition(x, y) { this.x = x; this.y = y; return this; } };
}
function camera() {
  return {
    width: 1280, height: 720, scrollX: 300, scrollY: 0, zoomX: 1, zoomY: 1,
    _follow: { x: 1343, y: 142 }, roundPixels: true, useBounds: true,
    lerp: { x: 0.1, y: 0.1 }, followOffset: { x: 7, y: 9 },
    stopFollow() { this._follow = null; },
    startFollow(target, roundPixels, x, y, ox, oy) {
      this._follow = target; this.roundPixels = roundPixels;
      this.lerp = { x, y }; this.followOffset = { x: ox, y: oy };
      this.scrollX = 999; this.scrollY = 999; // Phaser startFollow writes scroll too.
    },
    setScroll(x, y) { this.scrollX = x; this.scrollY = y; },
    setZoom(x, y) { this.zoomX = x; this.zoomY = y; },
  };
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

test('camera staging centra baño, llega a 1.75 y devuelve exactamente zoom/follow/scroll/bounds', () => {
  const cam = camera();
  const saved = { ...cam, lerp: { ...cam.lerp }, followOffset: { ...cam.followOffset } };
  const staging = createBathroomCameraStaging(cam, PATIO_LAYOUT.house.bathroom);
  assert.equal(cam._follow, null); assert.equal(cam.useBounds, false);
  staging.update(200);
  assert.ok(cam.zoomX > 1 && cam.zoomX < 1.75);
  staging.update(400);
  assert.equal(cam.zoomX, 1.75);
  assert.equal(cam.scrollX + cam.width / 2, 1343);
  assert.equal(cam.scrollY + cam.height / 2, 71);
  staging.update(4625);
  assert.ok(cam.zoomX > 1 && cam.zoomX < 1.75);
  staging.update(BATHROOM_DOOR_STAGING.durationMs);
  for (const key of ['zoomX', 'zoomY', 'scrollX', 'scrollY', '_follow', 'roundPixels', 'useBounds', 'lerp', 'followOffset']) {
    assert.deepEqual(cam[key], saved[key], key);
  }
  staging.destroy(); staging.update(400);
  assert.equal(cam.zoomX, 1);
});

test('abortar staging en approach, hold o retorno no deja cámara alterada', () => {
  for (const elapsed of [200, 3200, 4625]) {
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
      tileSprite: (x, y) => display('tileSprite', x, y), rectangle: (x, y) => display('rectangle', x, y),
      text: (x, y, text) => display('text', x, y, text) },
    textures: { get: () => ({ getSourceImage: () => ({ height: 32, width: 32 }) }) },
    anims: { exists: () => true }, time: { delayedCall() {} },
    make: { tilemap: () => ({ addTilesetImage: () => ({}), createLayer: () => ({ setDepth() {} }) }) },
  };
  const { bathroomDoor } = createPatioWorld(scene);
  assert.equal(bathroomDoor.sprite, objects.find(({ key }) => key === 'house-door-bathroom'));
  assert.equal(bathroomDoor.label, objects.find(({ key }) => key === 'BAÑO'));
  assert.equal(objects.filter(({ key }) => key === 'house-door-bathroom').length, 1);
  assert.deepEqual([bathroomDoor.sprite.x, bathroomDoor.sprite.y], [1343, 150]);
  const source = readFileSync('src/scenes/PatioScene.js', 'utf8');
  assert.match(source, /this\.worldVisuals = createPatioWorld\(this\)/);
  assert.match(source, /bathroomDoor: this\.worldVisuals\.bathroomDoor/);
});
