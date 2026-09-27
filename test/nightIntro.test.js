import test from 'node:test';
import assert from 'node:assert/strict';
import { createNightIntro, NIGHT_INTRO_PHASES, NIGHT_INTRO_TIMINGS } from '../src/events/nightIntro.js';
import { createGameState } from '../src/state/gameState.js';
import { createHud } from '../src/ui/createHud.js';

function makeObject() {
  return {
    visible: true,
    alpha: 1,
    destroyed: false,
    setOrigin() { return this; },
    setScrollFactor() { return this; },
    setDepth() { return this; },
    setAlpha(value) { this.alpha = value; return this; },
    setVisible(value) { this.visible = value; return this; },
    setText(value) { this.text = value; return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setDisplaySize() { return this; },
    setStrokeStyle() { return this; },
    setShadow() { return this; },
    fillStyle() { return this; },
    fillRect() { return this; },
    lineStyle() { return this; },
    strokeRect() { return this; },
    destroy() { this.destroyed = true; },
  };
}

function makeScene() {
  const objects = [];
  const drawCalls = [];
  const removedTextures = [];
  const glyphCenters = [];
  const context = {
    globalCompositeOperation: 'source-over',
    save() {}, restore() {},
    fillRect() { drawCalls.push(['cover', this.globalCompositeOperation]); },
    translate(x, y) { this.translateX = x; this.translateY = y; },
    scale(x) { this.scaleX = x; },
    measureText(text) {
      return { width: text.length * 85, actualBoundingBoxAscent: 110, actualBoundingBoxDescent: 25 };
    },
    fillText(text) {
      drawCalls.push([text, this.globalCompositeOperation]);
      glyphCenters.push(this.translateX + this.scaleX * 85 * 4.5);
    },
  };
  const texture = { getContext: () => context, refresh() {} };
  const add = Object.fromEntries(['image', 'text', 'rectangle', 'graphics'].map((type) => [
    type, () => {
      const object = makeObject();
      objects.push(object);
      return object;
    },
  ]));
  const camera = {
    follows: true,
    stopFollow() { this.follows = false; },
    centerOn(x, y) { this.center = { x, y }; },
    startFollow() { this.follows = true; },
  };
  const scene = {
    scale: { width: 1280, height: 720 },
    add, cameras: { main: camera },
    textures: {
      createCanvas: () => texture,
      remove(key) { removedTextures.push(key); },
    },
  };
  return { scene, objects, drawCalls, glyphCenters, removedTextures, camera };
}

function makePlayer() {
  const sprite = makeObject();
  sprite.x = 1504;
  sprite.y = 890;
  sprite.body = { bottom: 920 };
  sprite.setVelocity = function (x, y) { this.velocity = { x, y }; return this; };
  sprite.play = function (key) { this.animation = key; return this; };
  return { sprite, label: makeObject(), facing: 'down' };
}

test('intro bloquea gameplay durante llegada, reloj y ventana; restaura al terminar', () => {
  const { scene, objects, drawCalls, glyphCenters, removedTextures, camera } = makeScene();
  const player = makePlayer();
  const hud = { visible: true, setVisible(value) { this.visible = value; } };
  const intro = createNightIntro(scene, { player, hud });

  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.ARRIVAL);
  assert.equal(intro.isComplete(), false);
  assert.equal(player.sprite.animation, 'tambu-walk-up');
  assert.deepEqual(player.sprite.velocity, { x: 0, y: -150 });
  assert.equal(player.label.visible, false);
  assert.equal(hud.visible, false);

  intro.update(NIGHT_INTRO_TIMINGS.arrival - 100);
  player.sprite.y = 735; // Simula el avance físico sin cambiar la posición desde la intro.
  player.sprite.body.bottom = 765;
  intro.update(100);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.BLACKOUT);
  assert.equal(camera.follows, false);
  assert.deepEqual(camera.center, { x: player.sprite.x, y: 735 });
  assert.equal(player.sprite.animation, 'tambu-idle-up');
  intro.update(NIGHT_INTRO_TIMINGS.blackout);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0000);
  assert.equal(objects[1].text, '00:00');
  assert.equal(drawCalls.some(([, composite]) => composite === 'destination-out'), false);
  intro.update(NIGHT_INTRO_TIMINGS.clock0000);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0001);
  assert.equal(objects[1].text, '00:01');
  intro.update(NIGHT_INTRO_TIMINGS.clock0001);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.REVEAL);
  assert.equal(objects[1].visible, false);
  intro.update(NIGHT_INTRO_TIMINGS.reveal * 0.9);
  assert.equal(intro.isComplete(), false);
  assert.equal(hud.visible, false);
  assert.ok(drawCalls.some(([text, composite]) => text === '00:01' && composite === 'destination-out'));
  assert.ok(Math.abs(glyphCenters.at(-1) - 640) < 100, 'the enlarged final digit stays on screen');

  intro.update(NIGHT_INTRO_TIMINGS.reveal * 0.1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.COMPLETE);
  assert.equal(intro.isComplete(), true);
  assert.equal(player.facing, 'down');
  assert.equal(player.sprite.animation, 'tambu-idle-down');
  assert.equal(player.sprite.y, 735);
  assert.deepEqual(player.sprite.velocity, { x: 0, y: 0 });
  assert.equal(player.label.visible, true);
  assert.equal(hud.visible, true);
  assert.equal(camera.follows, true);
  assert.ok(objects.every(({ destroyed }) => destroyed));
  assert.deepEqual(removedTextures, ['night-intro-clock-window']);
});

test('destroy en plena intro libera el control y limpia la máscara una sola vez', () => {
  const { scene, removedTextures } = makeScene();
  const player = makePlayer();
  const hud = { visible: true, setVisible(value) { this.visible = value; } };
  const intro = createNightIntro(scene, { player, hud });
  intro.update(300);
  intro.destroy();
  intro.destroy();
  assert.equal(intro.isComplete(), true);
  assert.equal(hud.visible, true);
  assert.equal(player.label.visible, true);
  assert.deepEqual(player.sprite.velocity, { x: 0, y: 0 });
  assert.equal(removedTextures.length, 1);
});

test('HUD oculta todas sus piezas y conserva el prompt oculto al restaurarse', () => {
  const { scene, objects } = makeScene();
  const state = createGameState();
  state.player.alcohol = 50;
  const hud = createHud(scene, state);
  assert.equal(objects.length, 8);
  hud.setVisible(false);
  assert.ok(objects.every(({ visible }) => visible === false));
  hud.update(state);
  assert.ok(objects.every(({ visible }) => visible === false));
  hud.setVisible(true);
  assert.ok(objects.slice(0, -1).every(({ visible }) => visible === true));
  assert.equal(hud.interactionPrompt.visible, false);
});
