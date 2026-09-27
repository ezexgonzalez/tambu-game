import Phaser from 'phaser';
import { createPixelText, measurePixelText } from './pixelText.js';

const NORMAL_END_DEPTH = 22_000;
const OVERLAY_COLOR = 0x060b14;
const OVERLAY_ALPHA = 0.94;
const COLORS = Object.freeze({
  title: 0xf2f5f7,
  text: 0xd5dce4,
  secondary: 0x94a6b9,
  frame: 0x355a78,
  panel: 0x081421,
});

export const NORMAL_END_COPY = Object.freeze({
  title: 'LA NOCHE DE TAMBU',
  charactersHeader: 'CHICAS',
  resultsHeader: 'RESULTADOS',
  pointsLabel: 'PUNTAJE',
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

function fitCellSize(text, {
  maxCellSize,
  maxWidth,
  maxHeight,
  glyphGap = 1,
}) {
  const { widthCells } = measurePixelText(text, { cellSize: 1, glyphGap });
  const maxByWidth = Math.floor(maxWidth / widthCells);
  const maxByHeight = Math.floor(maxHeight / 7);
  return Math.max(2, Math.min(maxCellSize, maxByWidth, maxByHeight));
}

function makePixelLine(scene, text, {
  x,
  y,
  cellSize,
  color,
  depth,
  visible = false,
}) {
  const pixelInset = Math.max(1, Math.round(cellSize * 2 / 14));
  return createPixelText(scene, text, {
    x,
    y,
    cellSize,
    pixelInset,
    glyphGap: 1,
    lineGap: 2,
    color,
    depth,
  }).setVisible(visible);
}

function createPanel(scene, {
  x,
  y,
  width,
  height,
  depth,
  fillColor = COLORS.panel,
  fillAlpha = 0,
  lineColor = COLORS.frame,
  lineAlpha = 1,
  lineWidth = 2,
}) {
  const graphic = scene.add.graphics()
    .setScrollFactor(0)
    .setDepth(depth)
    .setVisible(false);

  if (fillAlpha > 0) {
    graphic.fillStyle(fillColor, fillAlpha);
    graphic.fillRect(x, y, width, height);
  }

  graphic.fillStyle(lineColor, lineAlpha);
  graphic.fillRect(x, y, width, lineWidth);
  graphic.fillRect(x, y + height - lineWidth, width, lineWidth);
  graphic.fillRect(x, y, lineWidth, height);
  graphic.fillRect(x + width - lineWidth, y, lineWidth, height);
  return graphic;
}

function createRule(scene, x, y, width, depth, color = COLORS.frame, alpha = 0.78) {
  const graphic = scene.add.graphics()
    .setScrollFactor(0)
    .setDepth(depth)
    .setVisible(false);
  graphic.fillStyle(color, alpha);
  graphic.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(width)), 2);
  return graphic;
}

export function createNormalEndUi(scene, { hud, onReplay = () => {} }) {
  const { width, height } = scene.scale;
  const lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.003));
  const frameX = width * 0.045;
  const frameY = height * 0.055;
  const frameWidth = width * 0.91;
  const frameHeight = height * 0.89;

  const overlay = scene.add.rectangle(0, 0, width, height, OVERLAY_COLOR, OVERLAY_ALPHA)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(NORMAL_END_DEPTH)
    .setVisible(false);

  const outerFrame = createPanel(scene, {
    x: frameX,
    y: frameY,
    width: frameWidth,
    height: frameHeight,
    depth: NORMAL_END_DEPTH + 1,
    lineAlpha: 0.82,
    lineWidth,
  });

  const title = makePixelLine(scene, NORMAL_END_COPY.title, {
    x: width / 2,
    y: height * 0.145,
    cellSize: fitCellSize(NORMAL_END_COPY.title, {
      maxCellSize: 9,
      maxWidth: width * 0.69,
      maxHeight: height * 0.105,
    }),
    color: COLORS.title,
    depth: NORMAL_END_DEPTH + 2,
  });

  const board = {
    x: width * 0.12,
    y: height * 0.25,
    width: width * 0.76,
    height: height * 0.40,
  };
  const boardLineWidth = lineWidth;
  const headerHeight = board.height * 0.19;
  const dividerX = board.x + board.width * 0.405;
  const rowHeight = (board.height - headerHeight) / CHARACTER_ORDER.length;
  const boardFrame = createPanel(scene, {
    ...board,
    depth: NORMAL_END_DEPTH + 1,
    fillAlpha: 0.48,
    lineAlpha: 0.9,
    lineWidth: boardLineWidth,
  });

  const boardRules = scene.add.graphics()
    .setScrollFactor(0)
    .setDepth(NORMAL_END_DEPTH + 2)
    .setVisible(false);
  boardRules.fillStyle(COLORS.frame, 0.78);
  boardRules.fillRect(Math.round(dividerX), Math.round(board.y), boardLineWidth, Math.round(board.height));
  for (let row = 0; row < CHARACTER_ORDER.length; row += 1) {
    const ruleY = board.y + headerHeight + row * rowHeight;
    if (row < CHARACTER_ORDER.length - 1) {
      boardRules.fillRect(
        Math.round(board.x),
        Math.round(ruleY),
        Math.round(board.width),
        boardLineWidth,
      );
    }
  }

  const headerCenterY = board.y + headerHeight / 2;
  const leftColumnCenter = board.x + (dividerX - board.x) / 2;
  const rightColumnCenter = dividerX + (board.x + board.width - dividerX) / 2;
  const headerCellSize = (text, columnWidth) => fitCellSize(text, {
    maxCellSize: 5,
    maxWidth: columnWidth * 0.82,
    maxHeight: headerHeight * 0.56,
  });
  const charactersHeader = makePixelLine(scene, NORMAL_END_COPY.charactersHeader, {
    x: leftColumnCenter,
    y: headerCenterY,
    cellSize: headerCellSize(NORMAL_END_COPY.charactersHeader, dividerX - board.x),
    color: COLORS.secondary,
    depth: NORMAL_END_DEPTH + 3,
  });
  const resultsHeader = makePixelLine(scene, NORMAL_END_COPY.resultsHeader, {
    x: rightColumnCenter,
    y: headerCenterY,
    cellSize: headerCellSize(NORMAL_END_COPY.resultsHeader, board.x + board.width - dividerX),
    color: COLORS.secondary,
    depth: NORMAL_END_DEPTH + 3,
  });

  const scorePanel = createPanel(scene, {
    x: width * 0.29,
    y: height * 0.685,
    width: width * 0.42,
    height: height * 0.155,
    depth: NORMAL_END_DEPTH + 1,
    fillAlpha: 0.38,
    lineAlpha: 0.76,
    lineWidth,
  });

  const bottomRule = createRule(
    scene,
    width * 0.22,
    height * 0.878,
    width * 0.56,
    NORMAL_END_DEPTH + 1,
    COLORS.frame,
    0.7,
  );

  const replayPrompt = makePixelLine(scene, NORMAL_END_COPY.replayPrompt, {
    x: width / 2,
    y: height * 0.92,
    cellSize: fitCellSize(NORMAL_END_COPY.replayPrompt, {
      maxCellSize: 3,
      maxWidth: width * 0.82,
      maxHeight: height * 0.055,
    }),
    color: COLORS.secondary,
    depth: NORMAL_END_DEPTH + 3,
  });

  const keyboard = scene.input.keyboard;
  const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  let rows = [];
  let pointsLabel = null;
  let points = null;
  let active = false;
  let visible = false;
  let replayReady = false;
  let replayRequested = false;
  let destroyed = false;
  let phase = 'inactive';
  let elapsed = 0;

  function show(summary) {
    if (destroyed || active) return false;
    const presentation = formatNormalEndSummary(summary);
    const rowTextStartX = board.x + (dividerX - board.x) * 0.13;
    const resultColumnWidth = board.x + board.width - dividerX;
    const resultCellMaxWidth = resultColumnWidth * 0.91;
    const innerPadding = Math.max(8, lineWidth * 4);

    rows = presentation.rows.map((row, index) => {
      const rowY = board.y + headerHeight + rowHeight * (index + 0.5);
      const nameCellSize = fitCellSize(row.characterName, {
        maxCellSize: 8,
        maxWidth: dividerX - rowTextStartX - innerPadding,
        maxHeight: rowHeight * 0.48,
      });
      const nameWidth = measurePixelText(row.characterName, { cellSize: nameCellSize }).width;
      const name = makePixelLine(scene, row.characterName, {
        x: rowTextStartX + nameWidth / 2,
        y: rowY,
        cellSize: nameCellSize,
        color: COLORS.text,
        depth: NORMAL_END_DEPTH + 3,
      });

      const outcomeCellSize = fitCellSize(row.outcomeLabel, {
        maxCellSize: 5,
        maxWidth: resultCellMaxWidth,
        maxHeight: rowHeight * 0.48,
      });
      const outcome = makePixelLine(scene, row.outcomeLabel, {
        x: rightColumnCenter,
        y: rowY,
        cellSize: outcomeCellSize,
        color: COLORS.text,
        depth: NORMAL_END_DEPTH + 3,
      });
      return { characterName: name, outcomeLabel: outcome };
    });

    const scorePanelHeight = height * 0.155;
    pointsLabel = makePixelLine(scene, presentation.pointsLabel, {
      x: width / 2,
      y: height * 0.685 + scorePanelHeight * 0.29,
      cellSize: fitCellSize(presentation.pointsLabel, {
        maxCellSize: 4,
        maxWidth: width * 0.34,
        maxHeight: scorePanelHeight * 0.27,
      }),
      color: COLORS.secondary,
      depth: NORMAL_END_DEPTH + 3,
    });
    points = makePixelLine(scene, presentation.points, {
      x: width / 2,
      y: height * 0.685 + scorePanelHeight * 0.69,
      cellSize: fitCellSize(presentation.points, {
        maxCellSize: 8,
        maxWidth: width * 0.36,
        maxHeight: scorePanelHeight * 0.46,
      }),
      color: COLORS.title,
      depth: NORMAL_END_DEPTH + 3,
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
    [outerFrame, title, boardFrame, boardRules, charactersHeader, resultsHeader,
      scorePanel, bottomRule].forEach((object) => object.setVisible(true));
    rows.forEach(({ characterName, outcomeLabel }) => {
      characterName.setVisible(true);
      outcomeLabel.setVisible(true);
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
    const objects = [
      overlay,
      outerFrame,
      title,
      boardFrame,
      boardRules,
      charactersHeader,
      resultsHeader,
      scorePanel,
      bottomRule,
      replayPrompt,
      pointsLabel,
      points,
    ];
    rows.forEach(({ characterName, outcomeLabel }) => objects.push(characterName, outcomeLabel));
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
