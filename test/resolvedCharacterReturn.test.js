import test from 'node:test';
import assert from 'node:assert/strict';
import { patioWomen } from '../src/data/patioCharacters.js';
import { createResolvedCharacterReturnSystem } from '../src/events/resolvedCharacterReturn.js';
import { getPatioCollisionZones } from '../src/world/createPatioCollisions.js';
import { PATIO_LAYOUT } from '../src/world/patioLayout.js';

const FOOTPRINT = { offsetX: 0, offsetY: 25, halfWidth: 14, halfHeight: 8 };

function segmentIntersectsZone(start, end, zone) {
  const left = zone.x - zone.width / 2 - FOOTPRINT.halfWidth;
  const right = zone.x + zone.width / 2 + FOOTPRINT.halfWidth;
  const top = zone.y - zone.height / 2 - FOOTPRINT.halfHeight;
  const bottom = zone.y + zone.height / 2 + FOOTPRINT.halfHeight;
  const a = { x: start.x + FOOTPRINT.offsetX, y: start.y + FOOTPRINT.offsetY };
  const b = { x: end.x + FOOTPRINT.offsetX, y: end.y + FOOTPRINT.offsetY };
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

function makeInteractable(character) {
  const sprite = {
    x: PATIO_LAYOUT.events.bathroom.companionSafeExit.x,
    y: PATIO_LAYOUT.events.bathroom.companionSafeExit.y,
    visible: true,
    depth: 0,
    anims: { currentAnim: { key: `${character.id}-idle-down` } },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setDepth(value) { this.depth = value; return this; },
    play(key) { this.anims.currentAnim = { key }; return this; },
  };
  const label = {
    x: sprite.x,
    y: sprite.y + 36,
    depth: 0,
    visible: true,
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setDepth(value) { this.depth = value; return this; },
    setVisible(value) { this.visible = value; return this; },
  };
  const marker = {
    visible: false,
    setVisible(value) { this.visible = value; return this; },
  };
  return { character, visual: `${character.id}-sprite`, sprite, label, marker };
}

test('cada retorno es propio, seguro y termina en el anchor temporal de su chica', () => {
  const layout = PATIO_LAYOUT.events.bathroom;
  const zones = getPatioCollisionZones();
  const ids = ['sofi', 'mili', 'cami'];
  const destinations = new Set();

  for (const id of ids) {
    const character = patioWomen.find(({ id: characterId }) => characterId === id);
    const path = layout.returnPaths[id];
    assert.ok(path?.length >= 2, `${id} has an explicit return route`);
    assert.deepEqual(path.at(-1), { x: character.x, y: character.y });
    destinations.add(`${path.at(-1).x},${path.at(-1).y}`);

    const fullPath = [layout.companionSafeExit, ...path];
    for (let index = 0; index < fullPath.length - 1; index += 1) {
      for (const zone of zones) {
        assert.equal(segmentIntersectsZone(fullPath[index], fullPath[index + 1], zone), false,
          `${id} return segment ${index} intersects ${zone.id}`);
      }
    }

    const interactable = makeInteractable(character);
    const system = createResolvedCharacterReturnSystem(layout);
    assert.equal(system.start(interactable), true);
    assert.equal(interactable.isRelocating, true);
    assert.equal(interactable.marker.visible, false);

    const walkKeys = new Set();
    let frames = 0;
    while (system.isReturning(id) && frames < 1000) {
      system.update(50);
      if (interactable.sprite.anims.currentAnim.key.includes('-walk-')) {
        walkKeys.add(interactable.sprite.anims.currentAnim.key);
      }
      frames += 1;
    }

    assert.ok(frames < 1000, `${id} completes its return`);
    assert.ok(walkKeys.size > 0, `${id} uses its real walk animation`);
    assert.equal(interactable.isRelocating, false);
    assert.equal(interactable.sprite.visible, true);
    assert.ok(interactable.sprite.anims.currentAnim.key.startsWith(`${id}-idle-`));
    assert.equal(interactable.sprite.x, character.x);
    assert.equal(interactable.sprite.y, character.y);
    assert.equal(interactable.sprite.depth, interactable.sprite.y + 30);
    assert.equal(interactable.label.visible, true);
    assert.equal(interactable.label.x, interactable.sprite.x);
    assert.equal(interactable.label.y, interactable.sprite.y + 36);
    assert.equal(interactable.label.depth, interactable.sprite.depth + 1);
    assert.equal(interactable.marker.visible, false);
  }

  assert.equal(destinations.size, 3, 'the girls return to three distinct social anchors');
});
