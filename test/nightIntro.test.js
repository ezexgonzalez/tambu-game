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

function makeCanvasTexture(key, drawCalls) {
  const snapshots = [];
  const whiteRects = [];
  const stateStack = [];
  const context = {
    globalCompositeOperation: 'source-over',
    fillStyle: '#000000',
    globalAlpha: 1,
    translation: { x: 0, y: 0 },
    transformScale: { x: 1, y: 1 },
    save() {
      stateStack.push({
        globalCompositeOperation: this.globalCompositeOperation,
        fillStyle: this.fillStyle,
        globalAlpha: this.globalAlpha,
        translation: this.translation,
        transformScale: this.transformScale,
      });
    },
    restore() { Object.assign(this, stateStack.pop()); },
    clearRect() { whiteRects.length = 0; },
    fillRect(x, y, width, height) {
      drawCalls.push({
        key,
        composite: this.globalCompositeOperation,
        fillStyle: this.fillStyle,
        globalAlpha: this.globalAlpha,
        x,
        y,
        width,
        height,
        translation: { ...this.translation },
        scale: { ...this.transformScale },
      });
      if (this.fillStyle === '#000000' && x === 0 && y === 0) whiteRects.length = 0;
      if (this.fillStyle === '#ffffff') {
        whiteRects.push({
          x,
          y,
          width,
          height,
          composite: this.globalCompositeOperation,
          translation: { ...this.translation },
          scale: { ...this.transformScale },
        });
      }
    },
    translate(x, y) { this.translation = { x, y }; },
    scale(x, y) { this.transformScale = { x, y }; },
  };
  const texture = {
    key,
    snapshots,
    getContext: () => context,
    refresh() {
      snapshots.push(whiteRects.map((rect) => structuredClone(rect)));
    },
  };
  return texture;
}

function makeScene() {
  const objects = [];
  const drawCalls = [];
  const removedTextures = [];
  const textures = new Map();
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
      createCanvas(key) {
        const texture = makeCanvasTexture(key, drawCalls);
        textures.set(key, texture);
        return texture;
      },
      remove(key) { removedTextures.push(key); },
    },
  };
  return { scene, objects, drawCalls, textures, removedTextures, camera };
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

function rectGeometry(rects) {
  return rects.map(({ x, y, width, height, translation, scale }) => ({
    x, y, width, height, translation, scale,
  }));
}

function getSnapshotScale(texture) {
  const scales = [...new Set(texture.snapshots.at(-1).map(({ scale }) => scale.x))];
  assert.equal(scales.length, 1, 'todos los píxeles del reloj comparten una escala');
  return scales[0];
}

test('intro usa reloj pixelado alineado con la máscara y hace una transición continua', () => {
  const { scene, objects, drawCalls, textures, removedTextures, camera } = makeScene();
  const player = makePlayer();
  const initialPosition = { x: player.sprite.x, y: player.sprite.y };
  const hud = { visible: true, setVisible(value) { this.visible = value; } };
  const intro = createNightIntro(scene, { player, hud });
  const cover = objects[0];
  const clock = objects[1];
  const windowTexture = textures.get('night-intro-clock-window');
  const clockTexture = textures.get('night-intro-clock-pixels');

  assert.deepEqual(Object.keys(NIGHT_INTRO_PHASES), [
    'BLACKOUT', 'CLOCK_0000', 'CLOCK_0001', 'REVEAL', 'REVEAL_TAIL', 'COLON_TUNNEL', 'COMPLETE',
  ]);
  assert.deepEqual(NIGHT_INTRO_TIMINGS, {
    blackout: 200,
    clock0000: 1500,
    clock0001: 450,
    reveal: 1500,
    revealTail: 300,
    colonTunnel: 700,
  });
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.BLACKOUT);
  assert.equal(intro.isComplete(), false);
  assert.equal(cover.alpha, 1);
  assert.equal(cover.visible, true);
  assert.equal(clock.visible, false);
  assert.deepEqual(player.sprite.velocity, { x: 0, y: 0 });
  assert.equal(player.sprite.animation, 'tambu-idle-down');
  assert.equal(player.facing, 'down');
  assert.equal(player.label.visible, false);
  assert.equal(hud.visible, false);

  intro.update(NIGHT_INTRO_TIMINGS.blackout - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.BLACKOUT);
  assert.equal(clock.visible, false);
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0000);
  assert.equal(clock.visible, true);
  assert.equal(clock.alpha, 1);
  const zeroClockRects = clockTexture.snapshots.at(-1);
  assert.ok(zeroClockRects.length > 0);
  assert.ok(zeroClockRects.every(({ composite }) => composite === 'source-over'));
  assert.equal(drawCalls.some(({ composite }) => composite === 'destination-out'), false);

  intro.update(NIGHT_INTRO_TIMINGS.clock0000 - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0000);
  assert.deepEqual(clockTexture.snapshots.at(-1), zeroClockRects);
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.CLOCK_0001);
  assert.equal(clock.alpha, 1);
  const oneClockRects = clockTexture.snapshots.at(-1);
  assert.notDeepEqual(oneClockRects, zeroClockRects, 'cambia solamente el glyph necesario del reloj');

  intro.update(NIGHT_INTRO_TIMINGS.clock0001);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.REVEAL);
  assert.equal(clock.visible, true);
  assert.equal(clock.alpha, 1);
  assert.equal(hud.visible, false);

  const initialWindowRects = windowTexture.snapshots.at(-1);
  assert.deepEqual(rectGeometry(initialWindowRects), rectGeometry(oneClockRects),
    'los píxeles del texto y la primera ventana tienen geometría idéntica');
  assert.ok(initialWindowRects.every(({ composite }) => composite === 'destination-out'));
  assert.ok(initialWindowRects.every(({ translation, scale }) => (
    translation.x === 640 && translation.y === 360 && scale.x === 1 && scale.y === 1
  )), 'la forma inicial está anclada al centro exacto del viewport');

  intro.update(90);
  assert.equal(clock.visible, true);
  assert.ok(clock.alpha > 0 && clock.alpha < 1, 'el texto se funde durante la transición');
  assert.deepEqual(rectGeometry(windowTexture.snapshots.at(-1)), rectGeometry(oneClockRects),
    'la máscara mantiene la misma escala mientras el texto se funde');
  intro.update(90);
  assert.equal(clock.alpha, 0);
  assert.deepEqual(rectGeometry(windowTexture.snapshots.at(-1)), rectGeometry(oneClockRects));

  intro.update((NIGHT_INTRO_TIMINGS.reveal - 180) / 2);
  assert.equal(intro.isComplete(), false);
  assert.equal(hud.visible, false);
  assert.equal(clock.alpha, 0);
  const expandedWindowRects = windowTexture.snapshots.at(-1);
  assert.ok(expandedWindowRects.every(({ translation }) => (
    translation.x === 640 && translation.y === 360
  )), 'el centro no deriva durante la expansión');
  const scales = [...new Set(expandedWindowRects.map(({ scale }) => scale.x))];
  assert.ok(scales.length === 1 && scales[0] > 1, 'el reloj empieza a crecer después del fundido');
  assert.deepEqual(camera.calls, [], 'la intro no modifica la cámara');
  assert.deepEqual({ x: player.sprite.x, y: player.sprite.y }, initialPosition);

  intro.update(NIGHT_INTRO_TIMINGS.reveal - 180 - (NIGHT_INTRO_TIMINGS.reveal - 180) / 2 - 1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.REVEAL);
  const scaleBeforeTail = getSnapshotScale(windowTexture);
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.REVEAL_TAIL);
  assert.equal(intro.isComplete(), false);
  assert.equal(hud.visible, false, 'el HUD sigue oculto durante el overshoot');
  assert.equal(cover.destroyed, false, 'el cover sigue vivo durante el overshoot');
  assert.deepEqual(removedTextures, [], 'las texturas no se limpian al cerrar el reveal principal');
  const revealMaxScale = Math.max(1280 / (29 * 14), 720 / (7 * 14)) * 1.35;
  const scaleAtTailStart = getSnapshotScale(windowTexture);
  assert.ok(Math.abs(scaleAtTailStart - revealMaxScale) < 1e-9,
    'el reveal principal termina exactamente en el scale aprobado');

  intro.update(1);
  const scaleAfterTailStart = getSnapshotScale(windowTexture);
  const mainScaleStep = scaleAtTailStart - scaleBeforeTail;
  const tailScaleStep = scaleAfterTailStart - scaleAtTailStart;
  assert.ok(tailScaleStep > 0, 'la expansión continúa inmediatamente en el tail');
  assert.ok(tailScaleStep > mainScaleStep * 0.8 && tailScaleStep < mainScaleStep * 1.2,
    'la velocidad de escala no cae al cruzar de reveal a tail');
  assert.ok(windowTexture.snapshots.at(-1).every(({ translation }) => (
    translation.x === 640 && translation.y === 360
  )), 'el centro permanece fijo también durante el overshoot');

  intro.update(NIGHT_INTRO_TIMINGS.revealTail - 2);
  const scaleBeforeTunnel = getSnapshotScale(windowTexture);
  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.COLON_TUNNEL);
  assert.equal(intro.isComplete(), false, 'el frame final del overshoot aún debe renderizarse');
  assert.equal(cover.destroyed, false);
  assert.equal(hud.visible, false);
  assert.deepEqual(removedTextures, []);
  const tunnelStartScale = getSnapshotScale(windowTexture);
  assert.ok(tunnelStartScale >= revealMaxScale * 1.4 - 1e-9,
    'el reloj supera holgadamente el scale máximo del reveal principal');

  intro.update(1);
  const firstTunnelScale = getSnapshotScale(windowTexture);
  const tunnelDot = windowTexture.snapshots.at(-1).find(({ x, y, width, height, translation }) => (
    x === -5 && y === -5 && width === 10 && height === 10 && translation.x === 640 && translation.y !== 360
  ));
  assert.ok(tunnelDot, 'la ventana se centra sobre el punto superior del colon');
  assert.ok(Math.abs(tunnelDot.translation.y - (360 - 14 * tunnelStartScale)) < 1,
    'la entrada al punto no salta desde su posición durante el reveal');
  const finalTailScaleStep = tunnelStartScale - scaleBeforeTunnel;
  const tunnelScaleStep = firstTunnelScale - tunnelStartScale;
  assert.ok(tunnelScaleStep > finalTailScaleStep * 0.8 && tunnelScaleStep < finalTailScaleStep * 1.2,
    'el túnel conserva la velocidad de escala al salir del tail');

  intro.update(NIGHT_INTRO_TIMINGS.colonTunnel - 2);
  const selectedDotClosures = drawCalls.filter(({ key, fillStyle, globalAlpha, x, y, width, height }) => (
    key === 'night-intro-clock-window' && fillStyle === '#000000' && globalAlpha === 1
      && x === -5 && width === 10 && height === 10
  ));
  assert.ok(selectedDotClosures.some(({ y }) => y === 9), 'el punto inferior se cierra suavemente');
  assert.equal(selectedDotClosures.some(({ y }) => y === -19), false,
    'el punto superior permanece abierto como túnel');
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.COLON_TUNNEL);
  assert.equal(intro.isComplete(), false);
  assert.equal(hud.visible, false);

  intro.update(1);
  assert.equal(intro.getPhase(), NIGHT_INTRO_PHASES.COLON_TUNNEL);
  assert.equal(intro.isComplete(), false, 'el último frame del túnel permanece visible un render');
  const finalTunnelScale = getSnapshotScale(windowTexture);
  assert.ok(finalTunnelScale > 128, 'la ventana única supera el ancho y alto del viewport');
  assert.deepEqual(removedTextures, []);

  intro.update(1);
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
  assert.deepEqual(removedTextures, ['night-intro-clock-window', 'night-intro-clock-pixels']);
});

test('destroy en plena intro libera el control y limpia ambas texturas una sola vez', () => {
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
  assert.equal(removedTextures.length, 2);
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
