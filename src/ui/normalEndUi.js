import Phaser from 'phaser';
import { createPixelText, measurePixelText } from './pixelText.js';

const NORMAL_END_DEPTH = 22_000;
const OVERLAY_COLOR = 0x060b14;
const OVERLAY_ALPHA = 0.97;

export const NORMAL_END_COPY = Object.freeze({
  title: 'LA NOCHE DE TAMBU',
  pointsLabel: 'PUNTOS',
  replayPrompt: 'ENTER / SPACE · VOLVER A JUGAR',
});

export const NORMAL_END_TIMINGS = Object.freeze({
  patioBeat: 700,
  replayPrompt: 500,
});

const CHARACTER_ORDER = Object.freeze([
  Object.freeze({ id: 'sofi', name: 'SOFI' }),
  Object.freeze({ id: 'mili', name: 'MILI' }),
  Object.freeze({ id: 'cami', name: 'CAMI' }),
]);

const OUTCOME_LABELS = Object.freeze({
  instagram: 'INSTAGRAM',
  friendzone: 'FRIENDZONE',
  rejection: 'RECHAZO',
});

function getOutcomeLabel(relationship, characterId) {
  if (!relationship) {
    throw new Error(`Missing resolved relationship in Normal End summary: ${characterId}`);
  }

  if (relationship.outcome === 'bathroom') {
    if (relationship.bathroomResult === 'secured') return 'BAÑO ASEGURADO';
    if (relationship.bathroomResult === 'interrupted') return 'BAÑO INTERRUMPIDO';
    throw new Error(`Missing bathroom result in Normal End summary: ${characterId}`);
  }

  const label = OUTCOME_LABELS[relationship.outcome];
  if (!label) {
    throw new Error(`Unsupported Normal End outcome for ${characterId}: ${relationship.outcome}`);
  }
  return label;
}

export function formatNormalEndSummary(summary) {
  if (!summary || !summary.relationships || !Number.isFinite(summary.points)) {
    throw new TypeError('Normal End requires a run summary with relationships and points');
  }

  return {
    title: NORMAL_END_COPY.title,
    rows: CHARACTER_ORDER.map(({ id, name }) => ({
      characterId: id,
      characterName: name,
      outcomeLabel: getOutcomeLabel(summary.relationships[id], id),
    })),
    pointsLabel: NORMAL_END_COPY.pointsLabel,
    points: String(summary.points),
    replayPrompt: NORMAL_END_COPY.replayPrompt,
  };
}

function fitCellSize(scene, text, maxCellSize, horizontalPadding = 80, maxHeightRatio = 0.14) {
  const { width, height } = scene.scale;
  const widthCells = measurePixelText(text, { cellSize: 1 }).widthCells;
  const maxByWidth = Math.floor((width - horizontalPadding) / widthCells);
  const maxByHeight = Math.floor((height * maxHeightRatio) / 7);
  return Math.max(2, Math.min(maxCellSize, maxByWidth, maxByHeight));
}

function makePixelLine(scene, text, { x, y, cellSize, depth, visible = false }) {
  const pixelInset = Math.max(1, Math.round(cellSize * 2 / 14));
  return createPixelText(scene, text, {
    x,
    y,
    cellSize,
    pixelInset,
    glyphGap: 1,
    lineGap: 2,
    color: 0xffffff,
    depth,
  }).setVisible(visible);
}

export function createNormalEndUi(scene, { hud, onReplay = () => {} }) {
  const { width, height } = scene.scale;
  const overlay = scene.add.rectangle(0, 0, width, height, OVERLAY_COLOR, OVERLAY_ALPHA)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(NORMAL_END_DEPTH)
    .setVisible(false);

  const title = makePixelLine(scene, NORMAL_END_COPY.title, {
    x: width / 2,
    y: height * 0.105,
    cellSize: fitCellSize(scene, NORMAL_END_COPY.title, 12, 64, 0.17),
    depth: NORMAL_END_DEPTH + 1,
  });

  const replayPrompt = makePixelLine(scene, NORMAL_END_COPY.replayPrompt, {
    x: width / 2,
    y: height * 0.92,
    cellSize: fitCellSize(scene, NORMAL_END_COPY.replayPrompt, 5, 72, 0.07),
    depth: NORMAL_END_DEPTH + 1,
  });

  const keyboard = scene.input.keyboard;
  const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  let rows = [];
  let pointsLabel = null;
  let points = null;
  let presentation = null;
  let active = false;
  let visible = false;
  let replayReady = false;
  let replayRequested = false;
  let destroyed = false;
  let phase = 'inactive';
  let elapsed = 0;

  function show(summary) {
    if (destroyed || active) return false;
    presentation = formatNormalEndSummary(summary);

    rows = presentation.rows.map((row, index) => {
      const y = height * (0.29 + index * 0.115);
      const name = makePixelLine(scene, row.characterName, {
        x: width * 0.2,
        y,
        cellSize: fitCellSize(scene, row.characterName, 9, 64, 0.09),
        depth: NORMAL_END_DEPTH + 1,
      });
      const outcomeCellSize = fitCellSize(scene, row.outcomeLabel, 8, 112, 0.09);
      const outcomeWidth = measurePixelText(row.outcomeLabel, {
        cellSize: outcomeCellSize,
      }).width;
      const outcome = makePixelLine(scene, row.outcomeLabel, {
        x: width - 56 - outcomeWidth / 2,
        y,
        cellSize: outcomeCellSize,
        depth: NORMAL_END_DEPTH + 1,
      });
      return { name, outcome };
    });

    pointsLabel = makePixelLine(scene, presentation.pointsLabel, {
      x: width / 2,
      y: height * 0.69,
      cellSize: fitCellSize(scene, presentation.pointsLabel, 8, 64, 0.09),
      depth: NORMAL_END_DEPTH + 1,
    });
    points = makePixelLine(scene, presentation.points, {
      x: width / 2,
      y: height * 0.785,
      cellSize: fitCellSize(scene, presentation.points, 16, 96, 0.17),
      depth: NORMAL_END_DEPTH + 1,
    });

    active = true;
    visible = false;
    replayReady = false;
    replayRequested = false;
    phase = 'patio-beat';
    elapsed = 0;
    return true;
  }

  function consumeReplayInput() {
    Phaser.Input.Keyboard.JustDown(enterKey);
    Phaser.Input.Keyboard.JustDown(spaceKey);
  }

  function revealSummary() {
    visible = true;
    phase = 'summary';
    elapsed = 0;
    hud.setVisible(false);
    overlay.setVisible(true);
    title.setVisible(true);
    rows.forEach(({ name, outcome }) => {
      name.setVisible(true);
      outcome.setVisible(true);
    });
    pointsLabel.setVisible(true);
    points.setVisible(true);
  }

  function update(deltaMs = 0) {
    if (!active || destroyed || replayRequested) return false;

    const delta = Math.max(0, Number.isFinite(deltaMs) ? deltaMs : 0);
    if (phase === 'patio-beat') {
      consumeReplayInput();
      elapsed += delta;
      if (elapsed >= NORMAL_END_TIMINGS.patioBeat) revealSummary();
      return false;
    }

    if (phase === 'summary') {
      consumeReplayInput();
      elapsed += delta;
      if (elapsed >= NORMAL_END_TIMINGS.replayPrompt) {
        replayReady = true;
        phase = 'ready';
        elapsed = 0;
        replayPrompt.setVisible(true);
      }
      return false;
    }

    if (phase !== 'ready') return false;

    const enterPressed = Phaser.Input.Keyboard.JustDown(enterKey);
    const spacePressed = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (!enterPressed && !spacePressed) return false;

    replayRequested = true;
    phase = 'restarting';
    onReplay();
    return true;
  }

  function destroy() {
    if (destroyed) return false;
    destroyed = true;
    active = false;
    const objects = [overlay, title, replayPrompt, pointsLabel, points];
    rows.forEach(({ name, outcome }) => objects.push(name, outcome));
    objects.filter(Boolean).forEach((object) => object.destroy());
    return true;
  }

  return {
    show,
    update,
    destroy,
    isActive: () => active,
    isVisible: () => visible,
    isReplayReady: () => replayReady,
    getPhase: () => phase,
  };
}
