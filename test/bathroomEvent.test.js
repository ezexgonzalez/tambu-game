import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { CAMI_CONVERSATION } from '../src/data/conversations/camiConversation.js';
import { MILI_CONVERSATION } from '../src/data/conversations/miliConversation.js';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import { patioWomen } from '../src/data/patioCharacters.js';
import { PLAYER_CONFIG } from '../src/player/playerConfig.js';
import { getPatioCollisionZones } from '../src/world/createPatioCollisions.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const phaserMock = 'data:text/javascript,' + encodeURIComponent(`
export default {
  Input: { Keyboard: {
    KeyCodes: { ENTER: 'ENTER', SPACE: 'SPACE' },
    JustDown(key) { const down = key.edge; key.edge = false; return down; }
  } }
};
`);
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'phaser'
      ? { url: phaserMock, shortCircuit: true }
      : nextResolve(specifier, context);
  },
});
const { createBathroomEvent } = await import('../src/events/bathroomEvent.js');
hooks.deregister();

function actor(x, y) {
  const sprite = {
    x, y, visible: true, depth: y, velocity: { x: 0, y: 0 },
    anims: { currentAnim: null },
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
    setVisible(visible) { this.visible = visible; return this; },
    setDepth(depth) { this.depth = depth; return this; },
    setVelocity(x, y) { this.velocity = { x, y }; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };
  sprite.body = {
    enable: true,
    get bottom() { return sprite.y + 27; },
    reset(nextX, nextY) { this.x = nextX; this.y = nextY; },
  };
  return sprite;
}

function display(x, y, text = '') {
  return {
    x, y, text, visible: true, destroyed: false,
    setScrollFactor() { return this; },
    setDepth(depth) { this.depth = depth; return this; },
    setStrokeStyle() { return this; },
    setOrigin() { return this; },
    setScale() { return this; },
    setFillStyle() { return this; },
    setPosition(nextX, nextY) { this.x = nextX; this.y = nextY; return this; },
    setVisible(visible) { this.visible = visible; return this; },
    setText(text) { this.text = text; return this; },
    destroy() { this.destroyed = true; },
  };
}

function playerFootprint() {
  const { sprite } = PLAYER_CONFIG;
  const scale = sprite.scale;
  return {
    offsetX: (-sprite.frameWidth / 2 + sprite.bodyOffsetX + sprite.bodyWidth / 2) * scale,
    offsetY: (-sprite.frameHeight / 2 + sprite.bodyOffsetY + sprite.bodyHeight / 2) * scale,
    halfWidth: (sprite.bodyWidth * scale) / 2 + 4,
    halfHeight: (sprite.bodyHeight * scale) / 2 + 4,
  };
}

// Conservative lower-body footprint for the three 32x48 sprites at runtime scale 1.24.
const GIRL_FOOTPRINT = { offsetX: 0, offsetY: 25, halfWidth: 14, halfHeight: 8 };

function segmentIntersectsZone(start, end, zone, footprint) {
  const left = zone.x - zone.width / 2 - footprint.halfWidth;
  const right = zone.x + zone.width / 2 + footprint.halfWidth;
  const top = zone.y - zone.height / 2 - footprint.halfHeight;
  const bottom = zone.y + zone.height / 2 + footprint.halfHeight;
  const a = { x: start.x + footprint.offsetX, y: start.y + footprint.offsetY };
  const b = { x: end.x + footprint.offsetX, y: end.y + footprint.offsetY };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let near = 0;
  let far = 1;

  for (const [p, q] of [
    [-dx, a.x - left], [dx, right - a.x],
    [-dy, a.y - top], [dy, bottom - a.y],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) near = Math.max(near, t);
    else far = Math.min(far, t);
    if (near > far) return false;
  }
  return true;
}

function assertBathroomPathClear(characterId) {
  const bathroom = PATIO_LAYOUT.events.bathroom;
  const route = [...bathroom.entryPaths[characterId], ...bathroom.commonPath];
  const zones = getPatioCollisionZones();
  const doorway = PATIO_LAYOUT.house.bathroom;
  const spawn = patioWomen.find(({ id }) => id === characterId);
  const lanes = [
    { name: 'Tambu', x: -bathroom.actorSpacing, footprint: playerFootprint() },
    { name: characterId, x: bathroom.actorSpacing, footprint: GIRL_FOOTPRINT },
  ];
  const initialMoves = [
    { name: 'Tambu', start: { x: spawn.x - bathroom.actorSpacing, y: spawn.y },
      end: { x: route[0].x - bathroom.actorSpacing, y: route[0].y }, footprint: playerFootprint() },
    { name: characterId, start: { x: spawn.x, y: spawn.y },
      end: { x: route[0].x + bathroom.actorSpacing, y: route[0].y }, footprint: GIRL_FOOTPRINT },
  ];
  for (const move of initialMoves) {
    for (const zone of zones) {
      assert.equal(segmentIntersectsZone(move.start, move.end, zone, move.footprint), false,
        `${characterId}/${move.name} cannot safely form the initial lanes around ${zone.id}`);
    }
  }

  for (const lane of lanes) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const start = route[index];
      const end = route[index + 1];
      for (const zone of zones) {
        if (zone.id === 'house' && index === route.length - 2) {
          assert.ok(start.y >= PATIO_LAYOUT.house.height);
          assert.ok(end.y >= PATIO_LAYOUT.house.height - 12,
            'the scripted house entry only crosses the wall at the bathroom threshold');
          const minX = Math.min(start.x, end.x) + lane.x + lane.footprint.offsetX - lane.footprint.halfWidth;
          const maxX = Math.max(start.x, end.x) + lane.x + lane.footprint.offsetX + lane.footprint.halfWidth;
          assert.ok(minX >= doorway.x && maxX <= doorway.x + doorway.width,
            `${characterId}/${lane.name} enters the house outside the bathroom doorway`);
          continue;
        }
        assert.equal(segmentIntersectsZone(
          { x: start.x + lane.x, y: start.y },
          { x: end.x + lane.x, y: end.y },
          zone,
          lane.footprint,
        ), false, `${characterId}/${lane.name} crosses ${zone.id}`);
      }
    }
  }
}

function assertSafePlayerPosition(sprite, position) {
  const footprint = playerFootprint();
  for (const zone of getPatioCollisionZones()) {
    assert.equal(segmentIntersectsZone(position, position, zone, footprint), false,
      `safe return overlaps ${zone.id}`);
  }
  assert.equal(sprite.x, position.x);
  assert.equal(sprite.y, position.y);
}

test('Sofi y Tambu llegan al acceso real, resisten y Tambu vuelve controlable', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
    visual: 'sofi-sprite',
  };
  const outcome = SOFI_CONVERSATION.outcomes.bathroom;
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  assert.equal(player.sprite.body.enable, false);
  assert.equal(interactable.label.visible, false);
  assert.equal(interactable.marker.visible, false);

  let frames = 0;
  const playerDepths = new Set();
  while (event.getMode() === 'walking' && frames < 200) {
    assert.equal(event.update(), true);
    assert.equal(player.sprite.depth, player.sprite.y + 27);
    assert.equal(player.label.depth, player.sprite.depth + 1);
    assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
    playerDepths.add(player.sprite.depth);
    frames += 1;
  }

  assert.ok(frames < 200);
  assert.ok(playerDepths.size > 1, 'Tambu depth follows vertical movement');
  assert.equal(event.getMode(), 'bathroom-achieved');
  assert.equal(player.sprite.visible, false);
  assert.equal(interactable.sprite.visible, false);
  assert.match(interactable.sprite.anims.currentAnim.key, /^sofi-idle-(down|left|right|up)$/);
  assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
  assert.ok(objects.some(({ text }) => text.includes('BAÑO CONSEGUIDO')));

  keys.ENTER.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'anticipation');
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, 65);
  assert.ok(objects.some(({ text }) => text.includes('RESISTENCIA DEL BAÑO')));

  scene.game.loop.delta = 1000;
  while (event.getMode() === 'resistance') event.update();
  assert.equal(event.getMode(), 'failure');
  assert.ok(objects.some(({ text }) => text.includes('LA PUERTA CEDIÓ')));
  assert.ok(objects.some(({ text }) => text.includes('ENTER · VOLVER AL PATIO')));

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'failure');

  keys.ENTER.edge = true;
  assert.equal(event.update(), false);
  assert.equal(event.getMode(), 'complete');
  assert.equal(player.sprite.visible, true);
  assert.equal(player.label.visible, true);
  assert.equal(player.sprite.body.enable, true);
  assert.equal(player.sprite.body.x, PATIO_LAYOUT.events.bathroom.safeExit.x);
  assert.equal(player.sprite.body.y, PATIO_LAYOUT.events.bathroom.safeExit.y);
  assert.equal(player.sprite.velocity.x, 0);
  assert.equal(player.sprite.velocity.y, 0);
  assert.equal(player.sprite.anims.currentAnim.key, 'tambu-idle-down');
  assert.equal(player.facing, 'down');
  assert.equal(player.sprite.depth, player.sprite.y + 27);
  assert.equal(player.label.depth, player.sprite.depth + 1);
  assert.equal(player.label.x, player.sprite.x);
  assert.equal(player.label.y, player.sprite.y + PLAYER_CONFIG.label.offsetY);
  assertSafePlayerPosition(player.sprite, PATIO_LAYOUT.events.bathroom.safeExit);
  assert.equal(interactable.sprite.visible, false);
  assert.ok(objects.filter(({ text }) => text).every(({ destroyed }) => destroyed));
});

test('Mili usa walk real, depth por pies y vuelve a idle durante BathroomEvent', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(916, 330), label: display(916, 364), facing: 'up' };
  const interactable = {
    sprite: actor(930, 330),
    label: display(930, 366),
    marker: display(930, 275),
    visual: 'mili-sprite',
    character: { id: 'mili' },
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: MILI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  const walkingKeys = new Set();
  let frames = 0;
  while (event.getMode() === 'walking' && frames < 200) {
    assert.equal(event.update(), true);
    assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
    if (interactable.sprite.anims.currentAnim?.key?.startsWith('mili-walk-')) {
      walkingKeys.add(interactable.sprite.anims.currentAnim.key);
    }
    frames += 1;
  }

  assert.ok(frames < 200);
  assert.ok(walkingKeys.size > 0);
  assert.equal(event.getMode(), 'bathroom-achieved');
  assert.match(interactable.sprite.anims.currentAnim.key, /^mili-idle-(down|left|right|up)$/);
  assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
  assert.ok(objects.some(({ text }) => text.includes('BAÑO CONSEGUIDO')));
});

test('Cami usa walk real, depth por pies y vuelve a idle durante BathroomEvent', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(1221, 635), label: display(1221, 669), facing: 'up' };
  const interactable = {
    sprite: actor(1235, 635),
    label: display(1235, 671),
    marker: display(1235, 580),
    visual: 'cami-sprite',
    character: { id: 'cami' },
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: CAMI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  const walkingKeys = new Set();
  let frames = 0;
  while (event.getMode() === 'walking' && frames < 200) {
    assert.equal(event.update(), true);
    assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
    if (interactable.sprite.anims.currentAnim?.key?.startsWith('cami-walk-')) {
      walkingKeys.add(interactable.sprite.anims.currentAnim.key);
    }
    frames += 1;
  }

  assert.ok(frames < 200);
  assert.ok(walkingKeys.size > 0);
  assert.equal(event.getMode(), 'bathroom-achieved');
  assert.match(interactable.sprite.anims.currentAnim.key, /^cami-idle-(down|left|right|up)$/);
  assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
  assert.ok(objects.some(({ text }) => text.includes('BAÑO CONSEGUIDO')));
});

test('SPACE sostenido mediante pulsaciones físicas permite asegurar la puerta', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
    visual: 'sofi-sprite',
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  while (event.getMode() === 'walking') event.update();
  keys.SPACE.edge = true;
  event.update();
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');

  const resistanceBeforeEnter = event.getResistanceState().resistance;
  keys.ENTER.edge = true;
  scene.game.loop.delta = 0;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, resistanceBeforeEnter);
  keys.ENTER.edge = false;

  scene.game.loop.delta = 50;
  while (event.getMode() === 'resistance') {
    keys.SPACE.edge = true;
    event.update();
  }

  assert.equal(event.getMode(), 'success');
  assert.ok(objects.some(({ text }) => text.includes('PUERTA ASEGURADA')));

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'success');

  keys.ENTER.edge = true;
  assert.equal(event.update(), false);
  assert.equal(event.getMode(), 'complete');
});

test('interrumpir la pantalla de resultado nunca deja a Tambu invisible', () => {
  const keys = {};
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: { rectangle: display, text: display },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690),
    label: display(400, 726),
    marker: display(400, 635),
    visual: 'sofi-sprite',
  };
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
  });

  while (event.getMode() === 'walking') event.update();
  event.destroy();

  assert.equal(player.sprite.visible, true);
  assert.equal(player.sprite.body.enable, true);
  assertSafePlayerPosition(player.sprite, PATIO_LAYOUT.events.bathroom.safeExit);
});

test('Mili sube por la izquierda de la barra y los recorridos convergen frente al baño', () => {
  const bathroom = PATIO_LAYOUT.events.bathroom;
  const spawnById = Object.fromEntries(patioWomen.map(({ id, x, y }) => [id, { x, y }]));
  const poolRight = PATIO_LAYOUT.pool.x + PATIO_LAYOUT.pool.width;
  const barLeft = PATIO_LAYOUT.bar.x;
  const barRight = PATIO_LAYOUT.bar.x + PATIO_LAYOUT.bar.width;
  const doorCenter = PATIO_LAYOUT.house.bathroom.x + PATIO_LAYOUT.house.bathroom.width / 2;

  for (const id of ['sofi', 'mili', 'cami']) {
    const spawn = spawnById[id];
    const first = bathroom.entryPaths[id][0];
    assert.ok(Math.hypot(first.x - spawn.x, first.y - spawn.y) <= 50,
      `${id} joins from the sector where the character actually stands`);
  }
  assert.ok(bathroom.entryPaths.mili.every(({ y }) => y <= spawnById.mili.y),
    'Mili should not descend to reach a bathroom above her');
  assert.ok(bathroom.entryPaths.mili.every(({ x }) => x < barLeft),
    'Mili should approach the house along the left side of the bar');
  assert.ok(bathroom.entryPaths.sofi.some(({ x }) => x > barRight));
  assert.ok(bathroom.entryPaths.cami.some(({ x }) => x > barRight));
  assert.notDeepEqual(bathroom.entryPaths.mili.at(-1), bathroom.entryPaths.sofi.at(-1));
  assert.ok(Object.values(bathroom.entryPaths).every((path) => path.at(-1).y <= PATIO_LAYOUT.house.height + 10),
    'the routes should reach the house before sharing the final doorway segment');
  assert.equal(bathroom.commonPath[0].x, doorCenter);
  assert.ok(bathroom.commonPath[0].y <= PATIO_LAYOUT.house.height + 10);
  assert.ok(bathroom.entryPaths.mili[0].y < PATIO_LAYOUT.pool.y);
  assert.ok(bathroom.entryPaths.cami[0].x > poolRight);
  assert.notDeepEqual(bathroom.entryPaths.mili[0], bathroom.entryPaths.sofi[0]);
  assert.notDeepEqual(bathroom.entryPaths.cami[0], bathroom.entryPaths.sofi[0]);
});

test('el regreso queda inmediatamente frente a la puerta sin invadir casa ni barra', () => {
  const { safeExit } = PATIO_LAYOUT.events.bathroom;
  const { house } = PATIO_LAYOUT;
  const doorCenter = house.bathroom.x + house.bathroom.width / 2;
  assert.ok(Math.abs(safeExit.x - doorCenter) <= house.bathroom.width / 4);
  assert.ok(safeExit.y > house.height);
  assert.ok(Math.hypot(safeExit.x - doorCenter, safeExit.y - house.height) < 30);
  assertSafePlayerPosition(safeExit, safeExit);
});

test('los dos carriles evitan todos los colliders salvo la entrada por la puerta', () => {
  for (const id of ['sofi', 'mili', 'cami']) assertBathroomPathClear(id);
});
