import Phaser from 'phaser';
import { createPixelText, measurePixelText } from './pixelText.js';

const GAME_OVER_DEPTH = 20_000;
const GAME_OVER_RED = 0xd71920;
const GAME_OVER_COPY = 'SOS UN HIJO\nDE PUTA';
const RETRY_PROMPT = 'ENTER / SPACE · REINTENTAR';
const TITLE_MAX_CELL_SIZE = 14;
const TITLE_LINES = 2;

export const GAME_OVER_TIMINGS = Object.freeze({
  punchlineDelay: 900,
  retryPromptDelay: 450,
});

export function createGameOverUi(scene, { hud, onRetry = () => {} }) {
  const { width, height } = scene.scale;
  const titleWidthCells = measurePixelText('SOS UN HIJO', { cellSize: 1 }).widthCells;
  const titleHeightCells = TITLE_LINES * 7 + (TITLE_LINES - 1) * 2;
  const cellSize = Math.max(3, Math.min(
    TITLE_MAX_CELL_SIZE,
    Math.floor((width - 64) / titleWidthCells),
    Math.floor((height * 0.42) / titleHeightCells),
  ));
  const pixelInset = Math.max(1, Math.round(cellSize * 2 / TITLE_MAX_CELL_SIZE));
  const keyboard = scene.input.keyboard;
  const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  const background = scene.add.rectangle(0, 0, width, height, GAME_OVER_RED)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(GAME_OVER_DEPTH)
    .setVisible(false);
  const title = createPixelText(scene, GAME_OVER_COPY, {
    x: width / 2,
    y: height * 0.45,
    cellSize,
    pixelInset,
    glyphGap: 1,
    lineGap: 2,
    color: 0xffffff,
    depth: GAME_OVER_DEPTH + 1,
  }).setVisible(false);
  const retryPrompt = scene.add.text(width / 2, height * 0.68, RETRY_PROMPT, {
    fontFamily: 'monospace',
    fontSize: '20px',
    color: '#ffffff',
    align: 'center',
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(GAME_OVER_DEPTH + 1)
    .setVisible(false);

  let active = false;
  let overlayVisible = false;
  let retryReady = false;
  let retryRequested = false;
  let destroyed = false;
  let phaseElapsed = 0;

  function show() {
    if (destroyed || active) return false;
    active = true;
    return true;
  }

  function consumeRetryInput() {
    Phaser.Input.Keyboard.JustDown(enterKey);
    Phaser.Input.Keyboard.JustDown(spaceKey);
  }

  function update(deltaMs = 0) {
    if (!active || destroyed || retryRequested) return false;

    const delta = Math.max(0, Number.isFinite(deltaMs) ? deltaMs : 0);
    if (!overlayVisible) {
      consumeRetryInput();
      phaseElapsed += delta;
      if (phaseElapsed >= GAME_OVER_TIMINGS.punchlineDelay) {
        overlayVisible = true;
        phaseElapsed = 0;
        hud.setVisible(false);
        background.setVisible(true);
        title.setVisible(true);
      }
      return false;
    }

    if (!retryReady) {
      consumeRetryInput();
      phaseElapsed += delta;
      if (phaseElapsed >= GAME_OVER_TIMINGS.retryPromptDelay) {
        retryReady = true;
        phaseElapsed = 0;
        retryPrompt.setVisible(true);
      }
      return false;
    }

    const enterPressed = Phaser.Input.Keyboard.JustDown(enterKey);
    const spacePressed = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (!enterPressed && !spacePressed) return false;

    retryRequested = true;
    onRetry();
    return true;
  }

  function destroy() {
    if (destroyed) return false;
    destroyed = true;
    active = false;
    background.destroy();
    title.destroy();
    retryPrompt.destroy();
    return true;
  }

  return {
    show,
    update,
    destroy,
    isActive: () => active,
    isVisible: () => overlayVisible,
    isRetryReady: () => retryReady,
  };
}
