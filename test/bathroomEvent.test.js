import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { EventEmitter } from 'node:events';
import { createOutcomeEventSystem } from '../src/systems/outcomeEventSystem.js';
import { CAMI_CONVERSATION } from '../src/data/conversations/camiConversation.js';
import { MILI_CONVERSATION } from '../src/data/conversations/miliConversation.js';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import { patioWomen } from '../src/data/patioCharacters.js';
import { PLAYER_CONFIG } from '../src/player/playerConfig.js';
import { createResolvedCharacterReturnSystem } from '../src/events/resolvedCharacterReturn.js';
import {
  commitConversationOutcome,
  createGameState,
  getBathroomResult,
  settleBathroomResult,
} from '../src/state/gameState.js';
import { getPatioCollisionZones } from '../src/world/createPatioCollisions.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';
import { createBathroomResistanceUi } from '../src/ui/eventUi.js';

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
const { createBathroomEvent, getBathroomFormationOffset } = await import('../src/events/bathroomEvent.js');
hooks.deregister();
import { getBathroomResistanceConfig } from '../src/events/bathroomResistance.js';

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
    fillStyle() { return this; },
    fillRect() { return this; },
    fillTriangle() { return this; },
    lineStyle() { return this; },
    strokeRect() { return this; },
    lineBetween() { return this; },
    setTexture(key, frame) { this.texture = key; this.frame = frame; return this; },
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
    { name: 'Tambu', sign: -1, footprint: playerFootprint() },
    { name: characterId, sign: 1, footprint: GIRL_FOOTPRINT },
  ];
  const target = (point, index, sign) => {
    const offset = getBathroomFormationOffset(route, index, bathroom.actorSpacing);
    return { x: point.x + sign * offset.x, y: point.y + sign * offset.y };
  };
  const initialMoves = [
    { name: 'Tambu', start: { x: spawn.x - bathroom.actorSpacing, y: spawn.y },
      end: target(route[0], 0, -1), footprint: playerFootprint() },
    { name: characterId, start: { x: spawn.x, y: spawn.y },
      end: target(route[0], 0, 1), footprint: GIRL_FOOTPRINT },
  ];
  for (const move of initialMoves) {
    for (const zone of zones) {
      assert.equal(segmentIntersectsZone(move.start, move.end, zone, move.footprint), false,
        `${characterId}/${move.name} cannot safely form the initial lanes around ${zone.id}`);
    }
  }

  for (const lane of lanes) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const start = target(route[index], index, lane.sign);
      const end = target(route[index + 1], index + 1, lane.sign);
      for (const zone of zones) {
        if (zone.id === 'house' && index === route.length - 2) {
          assert.ok(route[index].y >= PATIO_LAYOUT.house.height);
          assert.ok(end.y >= PATIO_LAYOUT.house.height - 12,
            'the scripted house entry only crosses the wall at the bathroom threshold');
          const minX = Math.min(start.x, end.x) + lane.footprint.offsetX - lane.footprint.halfWidth;
          const maxX = Math.max(start.x, end.x) + lane.footprint.offsetX + lane.footprint.halfWidth;
          assert.ok(minX >= doorway.x && maxX <= doorway.x + doorway.width,
            `${characterId}/${lane.name} enters the house outside the bathroom doorway`);
          continue;
        }
        assert.equal(segmentIntersectsZone(start, end, zone, lane.footprint), false,
          `${characterId}/${lane.name} crosses ${zone.id} on segment ${index}`);
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

function assertSafeCompanionPosition(sprite, position) {
  for (const zone of getPatioCollisionZones()) {
    assert.equal(segmentIntersectsZone(position, position, zone, GIRL_FOOTPRINT), false,
      `companion safe return overlaps ${zone.id}`);
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
      graphics() { const object = display(0, 0); objects.push(object); return object; },
      image(x, y) { const object = display(x, y); objects.push(object); return object; },
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
  const gameState = createGameState();
  commitConversationOutcome(gameState, {
    characterId: 'sofi',
    stats: { attraction: 10, trust: 10, intensity: 4 },
    history: [],
    signals: [],
  }, outcome);
  const bathroomResolutions = [];
  const returnSystem = createResolvedCharacterReturnSystem(PATIO_LAYOUT.events.bathroom);
  const sofiAnchor = patioWomen.find(({ id }) => id === 'sofi');
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome,
    layout: PATIO_LAYOUT.events.bathroom,
    onCompanionReturn: returnSystem.start,
    onBathroomResolved(resolution) {
      bathroomResolutions.push(resolution);
      const settled = settleBathroomResult(gameState, resolution.characterId, resolution.result);
      return settled;
    },
  });

  assert.equal(player.sprite.body.enable, false);
  assert.equal(interactable.label.visible, false);
  assert.equal(interactable.marker.visible, false);

  let frames = 0;
  const playerDepths = new Set();
  while (event.getMode() === 'walking' && frames < 400) {
    assert.equal(event.update(), true);
    assert.equal(player.sprite.depth, player.sprite.y + 27);
    assert.equal(player.label.depth, player.sprite.depth + 1);
    assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
    playerDepths.add(player.sprite.depth);
    frames += 1;
  }

  assert.ok(frames < 400);
  assert.ok(playerDepths.size > 1, 'Tambu depth follows vertical movement');
  assert.equal(event.getMode(), 'bathroom-achieved');
  assert.equal(player.sprite.visible, false);
  assert.equal(interactable.sprite.visible, false);
  assert.equal(gameState.player.points, 0);
  assert.equal(getBathroomResult(gameState, 'sofi'), null);
  assert.match(interactable.sprite.anims.currentAnim.key, /^sofi-idle-(down|left|right|up)$/);
  assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
  assert.ok(objects.some(({ text }) => text.includes('ENTRARON AL BAÑO')));
  assert.ok(objects.every(({ text }) => !String(text).includes('+500')));

  keys.ENTER.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'anticipation');
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, 55);
  assert.ok(objects.some(({ text }) => text.includes('RESISTENCIA DEL BAÑO')));

  scene.game.loop.delta = 1000;
  while (event.getMode() === 'resistance') event.update();
  assert.equal(event.getMode(), 'failure');
  assert.ok(objects.some(({ text }) => text.includes('LA PUERTA CEDIÓ')));
  assert.ok(objects.some(({ text, destroyed }) => text === '+250 ★' && !destroyed));
  assert.deepEqual(bathroomResolutions, [{ characterId: 'sofi', result: 'failure' }]);
  assert.equal(gameState.player.points, 250);
  assert.equal(gameState.player.lives, 3);
  assert.equal(getBathroomResult(gameState, 'sofi'), 'interrupted');
  assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
  assert.ok(objects.some(({ text }) => text.includes('ENTER · VOLVER AL PATIO')));

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'failure');

  keys.ENTER.edge = true;
  assert.equal(event.update(), false);
  assert.equal(event.getMode(), 'complete');
  assert.equal(event.update(), false);
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
  assert.equal(interactable.sprite.visible, true);
  assert.equal(interactable.label.visible, true);
  assert.equal(interactable.marker.visible, false);
  assert.equal(interactable.isRelocating, true);
  assert.equal(returnSystem.isReturning('sofi'), true);
  assert.equal(interactable.sprite.x, PATIO_LAYOUT.events.bathroom.companionSafeExit.x);
  assert.equal(interactable.sprite.y, PATIO_LAYOUT.events.bathroom.companionSafeExit.y);
  returnSystem.update(50);
  assert.equal(interactable.sprite.anims.currentAnim.key, 'sofi-walk-left');

  let returnFrames = 0;
  while (returnSystem.isReturning('sofi') && returnFrames < 1000) {
    returnSystem.update(50);
    returnFrames += 1;
  }
  assert.ok(returnFrames < 1000);
  assert.equal(interactable.isRelocating, false);
  assert.equal(returnSystem.isReturning('sofi'), false);
  assert.match(interactable.sprite.anims.currentAnim.key, /^sofi-idle-(down|left|right|up)$/);
  assert.equal(interactable.label.x, interactable.sprite.x);
  assert.equal(interactable.label.y, interactable.sprite.y + 36);
  assert.equal(interactable.label.depth, interactable.sprite.depth + 1);
  assertSafeCompanionPosition(
    interactable.sprite,
    sofiAnchor,
  );
  assert.ok(
    Math.hypot(
      player.sprite.x - interactable.sprite.x,
      player.sprite.y - interactable.sprite.y,
    ) > playerFootprint().halfWidth + GIRL_FOOTPRINT.halfWidth,
    'Tambu and the companion have separate footprints at the doorway',
  );
  assert.ok(objects.every(({ destroyed }) => destroyed));
});

test('BathroomEvent recibe el perfil del intento y SPACE solo recupera con JustDown', () => {
  const keys = {};
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      graphics() { const object = display(0, 0); return object; },
      image(x, y) { const object = display(x, y); return object; },
      rectangle(x, y) { return display(x, y); },
      text(x, y, text) { return display(x, y, text); },
    },
    game: { loop: { delta: 50 } },
  };
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'up' };
  const interactable = {
    sprite: actor(400, 690), label: display(400, 726), marker: display(400, 635),
    visual: 'sofi-sprite', character: { id: 'sofi' },
  };
  const resistanceConfig = getBathroomResistanceConfig(3);
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
    resistanceConfig,
  });

  let frames = 0;
  while (event.getMode() === 'walking' && frames < 400) {
    event.update();
    frames += 1;
  }
  assert.ok(frames < 400);
  keys.ENTER.edge = true;
  event.update();
  scene.game.loop.delta = 3000;
  event.update();
  assert.equal(event.getMode(), 'resistance');
  assert.equal(event.getResistanceState().resistance, 50);

  scene.game.loop.delta = 0;
  keys.SPACE.edge = true;
  event.update();
  assert.equal(event.getResistanceState().resistance, 54);
  event.update();
  assert.equal(event.getResistanceState().resistance, 54, 'mantener SPACE no repite la recuperación');
  event.destroy();
});

test('Bathroom Resistance instruye pulsaciones repetidas', () => {
  const scene = {
    add: {
      graphics() { const object = display(0, 0); return object; },
      image(x, y) { const object = display(x, y); return object; },
      rectangle(x, y, width, height) { return display(x, y); },
      text(x, y, text) { return display(x, y, text); },
    },
  };
  const ui = createBathroomResistanceUi(scene, getBathroomResistanceConfig(1));
  const help = ui.elements.find(({ text }) => text.includes('SPACE'));

  assert.equal(help.text, 'SPACE · APRETÁ REPETIDAMENTE');
  assert.doesNotMatch(help.text, /MANTENÉ|MANTENER/i);
});

test('Mili usa walk real, depth por pies y vuelve a idle durante BathroomEvent', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      graphics() { const object = display(0, 0); objects.push(object); return object; },
      image(x, y) { const object = display(x, y); objects.push(object); return object; },
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
  assert.ok(objects.some(({ text }) => text.includes('ENTRARON AL BAÑO')));
});

test('Cami usa walk real, depth por pies y vuelve a idle durante BathroomEvent', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      graphics() { const object = display(0, 0); objects.push(object); return object; },
      image(x, y) { const object = display(x, y); objects.push(object); return object; },
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
  assert.ok(objects.some(({ text }) => text.includes('ENTRARON AL BAÑO')));
});

test('SPACE sostenido mediante pulsaciones físicas permite asegurar la puerta', () => {
  const keys = {};
  const objects = [];
  const scene = {
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      graphics() { const object = display(0, 0); objects.push(object); return object; },
      image(x, y) { const object = display(x, y); objects.push(object); return object; },
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
  const bathroomResolutions = [];
  const event = createBathroomEvent(scene, {
    player,
    interactable,
    outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
    onBathroomResolved(resolution) {
      bathroomResolutions.push(resolution);
      return true;
    },
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
  assert.ok(objects.some(({ text, destroyed }) => text === '+500 ★' && !destroyed));
  assert.deepEqual(bathroomResolutions, [{ characterId: 'sofi', result: 'success' }]);

  keys.SPACE.edge = true;
  assert.equal(event.update(), true);
  assert.equal(event.getMode(), 'success');
  assert.equal(bathroomResolutions.length, 1, 'la liquidación ocurre solo al resolver Resistance');

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
  assert.equal(interactable.sprite.visible, true);
  assert.equal(interactable.label.visible, true);
  assert.equal(interactable.marker.visible, false);
  assertSafeCompanionPosition(
    interactable.sprite,
    PATIO_LAYOUT.events.bathroom.companionSafeExit,
  );
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
  assert.ok(bathroom.entryPaths.sofi.every(({ x }) => x < barRight));
  assert.ok(bathroom.entryPaths.cami.every(({ x }) => x < barRight));
  assert.notDeepEqual(bathroom.entryPaths.mili.at(-2), bathroom.entryPaths.sofi.at(-2));
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

test('la caminata es más lenta que Tambu y las rutas evitan rodeos largos', () => {
  const bathroom = PATIO_LAYOUT.events.bathroom;
  const routeLength = (id) => {
    const points = [...bathroom.entryPaths[id], ...bathroom.commonPath];
    return points.slice(1).reduce((length, point, index) =>
      length + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
  };
  assert.equal(bathroom.speed, 160);
  assert.ok(bathroom.speed < PLAYER_CONFIG.speed);
  assert.ok(routeLength('mili') < 550);
  assert.ok(routeLength('cami') < 800);
  assert.ok(routeLength('sofi') < 1750);
  assert.ok(routeLength('mili') < routeLength('cami'));
  assert.ok(routeLength('cami') < routeLength('sofi'));
});

test('la formación gira con el trayecto y ambos avanzan juntos sin pausas en waypoints', () => {
  const bathroom = PATIO_LAYOUT.events.bathroom;
  const sofiRoute = [...bathroom.entryPaths.sofi, ...bathroom.commonPath];
  const horizontal = getBathroomFormationOffset(sofiRoute, 1, bathroom.actorSpacing);
  assert.ok(Math.abs(horizontal.x) < 0.01);
  assert.ok(Math.abs(horizontal.y) >= 10);
  const finalCorridor = getBathroomFormationOffset(sofiRoute, sofiRoute.length - 2, bathroom.actorSpacing);
  assert.deepEqual(finalCorridor, { x: bathroom.actorSpacing, y: 0 });

  const outcomes = {
    sofi: SOFI_CONVERSATION.outcomes.bathroom,
    mili: MILI_CONVERSATION.outcomes.bathroom,
    cami: CAMI_CONVERSATION.outcomes.bathroom,
  };
  for (const { id, x, y } of patioWomen) {
    const scene = {
      input: { keyboard: { addKey() { return { edge: false }; } } },
      add: { rectangle: display, text: display },
      game: { loop: { delta: 50 } },
    };
    const player = { sprite: actor(x - bathroom.actorSpacing, y), label: display(x, y), facing: 'down' };
    const interactable = { sprite: actor(x, y), visual: `${id}-sprite`, character: { id } };
    const event = createBathroomEvent(scene, { player, interactable, outcome: outcomes[id], layout: bathroom });
    let frames = 0;
    while (event.getMode() === 'walking' && frames < 400) {
      const beforePlayer = { x: player.sprite.x, y: player.sprite.y };
      const beforeNpc = { x: interactable.sprite.x, y: interactable.sprite.y };
      event.update();
      for (const [name, before, after] of [
        ['Tambu', beforePlayer, player.sprite],
        [id, beforeNpc, interactable.sprite],
      ]) {
        const step = Math.hypot(after.x - before.x, after.y - before.y);
        assert.ok(step > 0.001, `${id}/${name} stopped while walking`);
        assert.ok(step <= bathroom.speed * 0.05 + 0.001, `${id}/${name} moved too fast`);
      }
      frames += 1;
    }
    assert.equal(event.getMode(), 'bathroom-achieved');
  }
});


function narrativeEventRuntime(attemptNumber, previousResults = []) {
  const objects = [];
  const keys = {};
  const scene = {
    scale: { width: 1280, height: 720 },
    events: new EventEmitter(),
    game: { loop: { delta: 50 } },
    input: { keyboard: { addKey(code) { keys[code] = { edge: false }; return keys[code]; } } },
    add: {
      graphics() { const object = display(0, 0); objects.push(object); return object; },
      image(x, y, key, frame) {
        const object = display(x, y).setTexture(key, frame); objects.push(object); return object;
      },
      rectangle(x, y) { const object = display(x, y); objects.push(object); return object; },
      text(x, y, text) { const object = display(x, y, text); objects.push(object); return object; },
    },
    cameras: { main: { shake: (...args) => shakes.push(args) } },
  };
  const shakes = [];
  const player = { sprite: actor(400, 690), label: display(400, 724), facing: 'down' };
  const interactable = {
    sprite: actor(400, 690), label: display(400, 726), marker: display(400, 635),
    visual: 'sofi-sprite', character: { id: 'sofi' },
  };
  const gameState = createGameState();
  gameState.relationships.sofi = { outcome: 'bathroom', bathroomResult: null, rewardSettled: false };
  const narrative = getBathroomResistanceNarrative({ attemptNumber, previousResults });
  const event = createBathroomEvent(scene, {
    player, interactable, outcome: SOFI_CONVERSATION.outcomes.bathroom,
    layout: PATIO_LAYOUT.events.bathroom,
    resistanceConfig: getBathroomResistanceConfig(attemptNumber), narrative,
    onBathroomResolved: ({ characterId, result }) => settleBathroomResult(gameState, characterId, result),
  });
  for (let frames = 0; event.getMode() === 'walking' && frames < 400; frames++) event.update();
  assert.equal(event.getMode(), 'bathroom-achieved');
  keys.ENTER.edge = true;
  event.update();
  const visibleText = () => objects.filter(({ visible, destroyed }) => visible && !destroyed).map(({ text }) => text);
  const portrait = () => objects.find(({ texture, destroyed }) => texture && !destroyed);
  return { scene, event, objects, keys, shakes, gameState, narrative, player, interactable, visibleText, portrait };
}

test('los beats 1700/2450 ms usan speakers exactos y el comienzo de Resistance limpia anticipation', () => {
  for (const [attempt, previous] of [[1, []], [2, ['secured']], [3, ['secured', 'interrupted']]]) {
    const runtime = narrativeEventRuntime(attempt, previous);
    const { scene, event, narrative, visibleText, portrait } = runtime;
    scene.game.loop.delta = 1699;
    event.update();
    assert.equal(portrait().visible, false);
    scene.game.loop.delta = 1;
    event.update();
    assert.ok(visibleText().includes(narrative.anticipation[0].text));
    assert.equal(portrait().visible, Boolean(narrative.anticipation[0].speaker));
    scene.game.loop.delta = 750;
    event.update();
    assert.ok(visibleText().includes(narrative.anticipation[1].text));
    assert.equal(portrait().texture, `ui_portrait_${narrative.anticipation[1].speaker}`);
    assert.equal(portrait().frame, narrative.anticipation[1].expression === 'angry' ? 1 : 0);
    scene.game.loop.delta = 550;
    event.update();
    assert.equal(event.getMode(), 'resistance');
    assert.equal(portrait().visible, false);
    event.destroy();
    assert.ok(runtime.objects.every(({ destroyed }) => destroyed));
    assert.equal(scene.events.listenerCount('shutdown'), 0);
  }
});

test('los siete hits presentan el índice correcto, knock limpia la cara y shake conserva 80/0.002', () => {
  for (const [attempt, previous] of [[1, []], [2, ['interrupted']], [3, ['secured', 'interrupted']]]) {
    const runtime = narrativeEventRuntime(attempt, previous);
    const { scene, event, narrative, keys, portrait, visibleText } = runtime;
    scene.game.loop.delta = 3000;
    event.update();
    for (let elapsed = 100; elapsed <= 9300; elapsed += 100) {
      const oldIndex = event.getResistanceState().nextHitIndex;
      scene.game.loop.delta = 100;
      keys.SPACE.edge = true;
      event.update();
      const index = event.getResistanceState().nextHitIndex;
      if (index !== oldIndex) {
        const beat = narrative.hits[index - 1];
        assert.ok(visibleText().includes(beat.text));
        assert.equal(portrait().visible, Boolean(beat.speaker));
        if (beat.speaker) {
          assert.equal(portrait().texture, `ui_portrait_${beat.speaker}`);
          assert.equal(portrait().frame, { talk: 0, angry: 1, shout: 2 }[beat.expression]);
        }
      }
    }
    assert.equal(event.getResistanceState().nextHitIndex, 7);
    assert.deepEqual(runtime.shakes, Array.from({ length: 7 }, () => [80, 0.002]));
    event.destroy();
  }
});

test('los seis cierres narrativos liquidan una vez, conservan vidas y limpian la UI al devolver el patio', () => {
  for (const attempt of [1, 2, 3]) {
    for (const result of ['success', 'failure']) {
      const runtime = narrativeEventRuntime(attempt, Array(attempt - 1).fill('secured'));
      const { scene, event, keys, gameState, narrative, visibleText, portrait } = runtime;
      scene.game.loop.delta = 3000;
      event.update();
      for (let frames = 0; event.getMode() === 'resistance' && frames < 101; frames++) {
        scene.game.loop.delta = 100;
        keys.SPACE.edge = result === 'success';
        event.update();
      }
      assert.equal(event.getMode(), result);
      assert.ok(visibleText().includes(narrative.resolution[result].text));
      assert.equal(portrait().texture, `ui_portrait_${narrative.resolution[result].speaker}`);
      assert.equal(gameState.player.points, result === 'success' ? 500 : 250);
      assert.equal(gameState.player.lives, 3);
      assert.equal(gameState.relationships.sofi.bathroomResult, result === 'success' ? 'secured' : 'interrupted');
      assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
      event.update();
      assert.equal(gameState.player.points, result === 'success' ? 500 : 250);
      keys.ENTER.edge = true;
      assert.equal(event.update(), false);
      assert.equal(runtime.player.sprite.visible, true);
      assert.equal(runtime.interactable.sprite.visible, true);
      event.destroy();
      event.destroy();
      assert.equal(event.update(), false);
      assert.ok(runtime.objects.every(({ destroyed }) => destroyed));
      assert.equal(scene.events.listenerCount('shutdown'), 0);
    }
  }
});

test('stop/shutdown en anticipation, resistance o resolution no deja UI ni reacción al iniciar otra run', () => {
  for (const phase of ['anticipation', 'resistance', 'resolution']) {
    const runtime = narrativeEventRuntime(2, ['secured']);
    const { scene, event } = runtime;
    scene.game.loop.delta = 2450;
    event.update();
    if (phase !== 'anticipation') {
      scene.game.loop.delta = 550;
      event.update();
      scene.game.loop.delta = 1900;
      event.update();
    }
    if (phase === 'resolution') {
      scene.game.loop.delta = 10000;
      event.update();
      assert.equal(event.getMode(), 'failure');
    }
    const system = createOutcomeEventSystem({ handlers: { bathroom: () => event } });
    system.start({ type: 'bathroom' });
    scene.events.once('shutdown', system.stop);
    scene.events.emit('shutdown');
    assert.equal(system.isActive(), false);
    assert.equal(event.update(), false);
    assert.ok(runtime.objects.every(({ destroyed }) => destroyed));
    assert.equal(scene.events.listenerCount('shutdown'), 0);
    assert.equal(runtime.player.sprite.visible, true);
    const next = narrativeEventRuntime(1);
    assert.equal(next.portrait().visible, false);
    assert.ok(next.visibleText().every((text) => !text.includes('LA PRIMERA TE SALIÓ')));
    next.event.destroy();
  }
});
