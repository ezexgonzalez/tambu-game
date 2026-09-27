import Phaser from 'phaser';
import { createPixelText, measurePixelText } from './pixelText.js';

const PERFECT_NIGHT_DEPTH = 21_000;
const OVERLAY_COLOR = 0x05080d;
const OVERLAY_ALPHA = 0.97;
export const PERFECT_NIGHT_COPY = Object.freeze({
  count: '3 / 3',
  title: 'NOCHE PERFECTA',
  subtitle: '3 BAÑOS ASEGURADOS',
  continuePrompt: 'ENTER / SPACE · SEGUIR DE FIESTA',
});

export const PERFECT_NIGHT_TIMINGS = Object.freeze({
  victoryBeat: 700,
  continuePrompt: 500,
});

function fitCellSize(scene, text, maxCellSize, horizontalPadding = 64) {
  const { width, height } = scene.scale;
  const widthCells = measurePixelText(text, { cellSize: 1 }).widthCells;
  const maxByWidth = Math.floor((width - horizontalPadding) / widthCells);
  const maxByHeight = Math.floor((height * 0.22) / 7);
  return Math.max(2, Math.min(maxCellSize, maxByWidth, maxByHeight));
}

function makePixelLine(scene, text, y, cellSize, depth) {
  const pixelInset = Math.max(1, Math.round(cellSize * 2 / 14));
  return createPixelText(scene, text, {
    x: scene.scale.width / 2,
    y,
    cellSize,
    pixelInset,
    glyphGap: 1,
    lineGap: 2,
    color: 0xffffff,
    depth,
  }).setVisible(false);
}

export function createPerfectNightUi(scene, { hud, onContinue = () => false }) {
  const { width, height } = scene.scale;
  const overlay = scene.add.rectangle(0, 0, width, height, OVERLAY_COLOR, OVERLAY_ALPHA)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(PERFECT_NIGHT_DEPTH)
    .setVisible(false);

  const perfectCount = makePixelLine(
    scene,
    PERFECT_NIGHT_COPY.count,
    height * 0.19,
    fitCellSize(scene, PERFECT_NIGHT_COPY.count, 16),
    PERFECT_NIGHT_DEPTH + 1,
  );
  const title = makePixelLine(
    scene,
    PERFECT_NIGHT_COPY.title,
    height * 0.41,
    fitCellSize(scene, PERFECT_NIGHT_COPY.title, 14),
    PERFECT_NIGHT_DEPTH + 1,
  );
  const subtitle = makePixelLine(
    scene,
    PERFECT_NIGHT_COPY.subtitle,
    height * 0.61,
    fitCellSize(scene, PERFECT_NIGHT_COPY.subtitle, 8),
    PERFECT_NIGHT_DEPTH + 1,
  );
  const continuePrompt = makePixelLine(
    scene,
    PERFECT_NIGHT_COPY.continuePrompt,
    height * 0.85,
    fitCellSize(scene, PERFECT_NIGHT_COPY.continuePrompt, 6, 80),
    PERFECT_NIGHT_DEPTH + 1,
  );

  const keyboard = scene.input.keyboard;
  const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  let active = false;
  let visible = false;
  let continueReady = false;
  let destroyed = false;
  let phase = 'inactive';
  let elapsed = 0;

  function show() {
    if (destroyed || active) return false;
    active = true;
    phase = 'victory-beat';
    elapsed = 0;
    return true;
  }

  function consumeContinueInput() {
    Phaser.Input.Keyboard.JustDown(enterKey);
    Phaser.Input.Keyboard.JustDown(spaceKey);
  }

  function reveal() {
    visible = true;
    phase = 'message';
    elapsed = 0;
    hud.setVisible(false);
    overlay.setVisible(true);
    perfectCount.setVisible(true);
    title.setVisible(true);
    subtitle.setVisible(true);
  }

  function hide() {
    if (destroyed || !active) return false;
    active = false;
    visible = false;
    continueReady = false;
    phase = 'inactive';
    [overlay, perfectCount, title, subtitle, continuePrompt]
      .forEach((object) => object.setVisible(false));
    hud.setVisible(true);
    return true;
  }

  function update(deltaMs = 0) {
    if (!active || destroyed) return false;

    const delta = Math.max(0, Number.isFinite(deltaMs) ? deltaMs : 0);
    if (phase === 'victory-beat') {
      consumeContinueInput();
      elapsed += delta;
      if (elapsed >= PERFECT_NIGHT_TIMINGS.victoryBeat) reveal();
      return false;
    }

    if (phase === 'message') {
      consumeContinueInput();
      elapsed += delta;
      if (elapsed >= PERFECT_NIGHT_TIMINGS.continuePrompt) {
        continueReady = true;
        phase = 'ready';
        elapsed = 0;
        continuePrompt.setVisible(true);
      }
      return false;
    }

    if (phase !== 'ready') return false;

    const enterPressed = Phaser.Input.Keyboard.JustDown(enterKey);
    const spacePressed = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (!enterPressed && !spacePressed) return false;
    if (!onContinue()) return false;

    hide();
    return true;
  }

  function destroy() {
    if (destroyed) return false;
    destroyed = true;
    active = false;
    [overlay, perfectCount, title, subtitle, continuePrompt]
      .forEach((object) => object.destroy());
    return true;
  }

  return {
    show,
    update,
    hide,
    destroy,
    isActive: () => active,
    isVisible: () => visible,
    isContinueReady: () => continueReady,
    getPhase: () => phase,
  };
}
