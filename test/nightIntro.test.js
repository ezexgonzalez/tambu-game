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
    setDepth(value) { this.depth = value; return this; },
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
  const clockWindows = [];
  const context = {
    globalCompositeOperation: 'source-over',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    save() {},
    restore() {},
    fillRect() { drawCalls.push(['fillRect', this.globalCompositeOperation]); },
    translate(x, y) { this.translation = { x, y }; },
    scale(x, y) { this.transformScale = { x, y }; },
    measureText(text) {
      return {
        width: text.length * 85,
        actualBoundingBoxAscent: 110,
        actualBoundingBoxDescent: 25,
      };
    },
    fillText(text, x, y) {
      drawCalls.push([text, this.globalCompositeOperation]);
      clockWindows.push({
        text,
        x,
        y,
        composite: this.globalCompositeOperation,
        align: this.textAlign,
        baseline: this.textBaseline,
        translation: this.translation,
        scale: this.transformScale,
      });
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
    calls: [],
    stopFollow() { this.calls.push('stopFollow'); },
    centerOn(x, y) { this.calls.push(['centerOn', x, y]); },
    startFollow() { this.calls.push('startFollow'); },
    setZoom(value) { this.calls.push(['setZoom', value]); },
  };
  const scene = {
    scale: { width: 1280, height: 720 },
    add,
    cameras: { main: camera },
    textures: {
      createCanvas: () => texture,
      remove(key) { removedTextures.push(key); },
    },
  };
  return { scene, objects, drawCalls, clockWindows, removedTextures, camera };
}

function makePlayer() {
  const sprite = makeObject();
  sprite.x = 1504;
  sprite.y = 890;
  sprite.body = { bottom: 920 };
  sprite.animation = 'tambu-idle-down';
  sprite.setVelocity = function (x, y) { this.velocity = { x, y }; return this; };
  sprite.play = function (key) { this.animation = key; return this; };
  return { sprite, label: makeObject(), facing: 'down' };
}

test('intro empieza en negro, mantiene el reloj centrado y bloquea gameplay hasta completar', () => {
  const { scene, objects, drawCalls, clockWindows, removedTextures, camera } = makeScene();
  const player = makePlayer();
  const initialPosition = { x: player.sprite.x, y: player.sprite.y };
  const hud = { visible: true, setVisible(value) { this.visible = value; } };
  const intro = createNightIntro(scene, { player, hud });

  assert.deepEqual(Object.keys(NIGHT_INTRO_PHASES), [
    'BLACKOUT', 'CLOCK_0000', 'CLOCK_0001', 'REVEAL', 'COMPLETE',
  ]);
  assert.deepEqual(NIGHT_INTRO_TIMINGS, {
    blackout: 200,
    clock0000: 1500,
    clock0001: 450,
    reveal: 1500,
  });
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.BLACKOUT);
  assert.equal(intro.isComplete(), false);
  assert.equal(objects[0].alpha, 1);
  assert.equal(objects[0].visible, true);
  assert.equal(objects[1].visible, false);
  assert.deepEqual(player.sprite.velocity, { x: 0, y: 0 });
  assert.equal(player.sprite.animation, 'tambu-idle-down');
  assert.equal(player.facing, 'down');
  assert.equal(player.label.visible, false);
  assert.equal(hud.visible, false);

  intro.update(NIGHT_INTRO_TIMINGS.blackout - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.BLACKOUT);
  assert.equal(objects[1].visible, false);
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0000);
  assert.equal(objects[1].text, '00:00');
  assert.equal(objects[1].visible, true);
  assert.equal(drawCalls.some(([, composite]) => composite === 'destination-out'), false);

  assert.ok(NIGHT_INTRO_TIMINGS.clock0000 > NIGHT_INTRO_TIMINGS.clock0001);
  intro.update(NIGHT_INTRO_TIMINGS.clock0000 - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0000);
  assert.equal(objects[1].text, '00:00');
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0001);
  assert.equal(objects[1].text, '00:01');
  intro.update(NIGHT_INTRO_TIMINGS.clock0001 - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0001);
  assert.equal(objects[1].text, '00:01');
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.REVEAL);
  assert.equal(objects[1].visible, false);
  assert.equal(hud.visible, false);

  intro.update(NIGHT_INTRO_TIMINGS.reveal / 2);
  assert.equal(intro.isComplete(), false);
  assert.equal(hud.visible, false);
  assert.ok(clockWindows.length >= 2);
  assert.ok(clockWindows.every(({ text, composite, align, baseline }) => (
    text === '00:01'
    && composite === 'destination-out'
    && align === 'center'
    && baseline === 'middle'
  )));
  assert.ok(clockWindows.every(({ x, y, translation }) => (
    x === 0 && y === 0 && translation.x === 640 && translation.y === 360
  )), 'el centro del string permanece en el centro del viewport');
  assert.ok(clockWindows.every(({ scale }) => scale.x === scale.y));
  const scales = clockWindows.map(({ scale }) => scale.x);
  assert.ok(scales.every((scale, index) => index === 0 || scale >= scales[index - 1]));
  const finalScale = Math.max(1280 / 425, 720 / 135) * 1.35;
  assert.ok(scales.at(-1) < 1 + (finalScale - 1) * 0.5,
    'la curva empieza más despacio que una expansión lineal');
  assert.deepEqual(camera.calls, [], 'el reveal no modifica la cámara');
  assert.deepEqual({ x: player.sprite.x, y: player.sprite.y }, initialPosition);

  intro.update(NIGHT_INTRO_TIMINGS.reveal / 2);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.COMPLETE);
  assert.equal(intro.isComplete(), true);
  assert.equal(player.facing, 'down');
  assert.equal(player.sprite.animation, 'tambu-idle-down');
  assert.deepEqual({ x: player.sprite.x, y: player.sprite.y }, initialPosition);
  assert.deepEqual(player.sprite.velocity, { x: 0, y: 0 });
  assert.equal(player.label.visible, true);
  assert.equal(hud.visible, true);
  assert.deepEqual(camera.calls, []);
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
