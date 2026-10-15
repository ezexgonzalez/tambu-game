import { createBathroomUiCameraScope } from './bathroomUiCamera.js';
import { createUiLabel, createUiPanel, createUiBody, setUiBody, getUiViewport, UI_COLORS } from './uiTheme.js';
import { createPortraitReactionUi } from './portraitReactionUi.js';
import { BATHROOM_RESULT_CONFIG } from '../data/bathroomResultConfig.js';

const PANEL_DEPTH = 6100;

export function createOutcomeEventUi(scene, outcome) {
  const viewport = getUiViewport(scene);
  const width = Math.min(760, viewport.width - 48);
  const height = Math.min(268, viewport.height - 48);
  const left = Math.round((viewport.width - width) / 2);
  const top = Math.round((viewport.height - height) / 2);
  const panel = createUiPanel(scene, { x: left, y: top, width, height }, PANEL_DEPTH);
  const title = createUiLabel(scene, outcome.event.resultLabel, { x: viewport.width / 2,
    y: top + 42, cellSize: 4, maxWidth: width - 64, color: UI_COLORS.success, depth: PANEL_DEPTH + 2 });
  const narrative = createUiBody(scene, outcome.event.resultText,
    { x: left + 32, y: top + 82, width: width - 64, height: 70 }, PANEL_DEPTH + 1);
  setUiBody(narrative, outcome.event.resultText);
  const pending = createUiLabel(scene, 'RECOMPENSA PENDIENTE', { x: viewport.width / 2,
    y: top + height - 76, cellSize: 2, maxWidth: width - 64, color: UI_COLORS.warning, depth: PANEL_DEPTH + 2 });
  const help = createUiLabel(scene, 'ENTER / SPACE · CONTINUAR', { x: viewport.width / 2,
    y: top + height - 28, cellSize: 2, maxWidth: width - 64, color: UI_COLORS.secondary, depth: PANEL_DEPTH + 2 });
  return [panel, title, narrative, pending, help];
}

export function getBathroomPanelLayout(width = 1280, height = 720) {
  const panelWidth = Math.min(760, width - 48);
  const panelHeight = 310;
  const cx = Math.round(width / 2);
  const top = Math.round((height - panelHeight) / 2);
  return { cx, top, width: panelWidth, height: panelHeight,
    left: cx - panelWidth / 2, dividerY: top + 210, dockY: top + 260 };
}

function formatRemainingTime(remainingMs) {
  return `00:${String(Math.ceil(Math.max(0, remainingMs) / 1000)).padStart(2, '0')}`;
}

export function createBathroomChallengeUi(scene, config) {
  const layout = getBathroomPanelLayout(scene.scale?.width, scene.scale?.height);
  const { cx, top, left, width, height, dividerY, dockY } = layout;
  const cameraScope = createBathroomUiCameraScope(scene);
  const elements = [];
  const own = (object) => { elements.push(object); return cameraScope.register(object); };
  const panel = own(createUiPanel(scene, { x: left, y: top, width, height }, PANEL_DEPTH));
  const divider = own(scene.add.rectangle(cx, dividerY, width - 2, 1, UI_COLORS.frame, 1)
    .setScrollFactor(0).setDepth(PANEL_DEPTH + 1));
  const barWidth = width - 80;
  const barLeft = left + 40;
  const track = own(scene.add.rectangle(barLeft, top + 100, barWidth, 24, UI_COLORS.background, 1)
    .setOrigin(0, 0.5).setScrollFactor(0).setDepth(PANEL_DEPTH + 1)
    .setStrokeStyle(1, UI_COLORS.frame, 1));
  const fill = own(scene.add.rectangle(barLeft + 4, top + 100, barWidth - 8, 16, UI_COLORS.cyan, 1)
    .setOrigin(0, 0.5).setScrollFactor(0).setDepth(PANEL_DEPTH + 2));
  const resistance = own(createUiLabel(scene, '', { x: barLeft, y: top + 140,
    align: 'left', cellSize: 2, maxWidth: barWidth, color: UI_COLORS.secondary, depth: PANEL_DEPTH + 2 }));
  const reward = own(createUiLabel(scene, '', { x: cx, y: top + 116,
    cellSize: 4, maxWidth: width - 80, color: UI_COLORS.gold, depth: PANEL_DEPTH + 2 }));
  const reactions = createPortraitReactionUi(scene, {
    x: cx, y: dockY, width: width - 48, framed: false, depth: PANEL_DEPTH + 3, registerObject: cameraScope.register,
  });
  const labels = new Map();
  let phase = 'anticipation';
  let currentReaction = null;
  let ready = false;
  let destroyed = false;
  let result = null;
  function label(id, text, x, y, cellSize, color = UI_COLORS.title, align = 'center', maxWidth = width - 80) {
    const previous = labels.get(id);
    if (previous?.text === text) return;
    previous?.object.destroy();
    labels.set(id, { text, object: cameraScope.register(createUiLabel(scene, text, {
      x, y, cellSize, align, maxWidth, pixelInset: cellSize >= 3 ? 0.5 : 0,
      color, depth: PANEL_DEPTH + 2,
    })) });
  }
  function removeLabel(id) { labels.get(id)?.object.destroy(); labels.delete(id); }
  function showReaction(reaction) {
    // Pure knocks never appear as text and never erase a spoken line.
    if (!reaction?.speaker || reaction === currentReaction) return;
    currentReaction = reaction;
    reactions.show(reaction);
  }
  function setAnticipation() {
    phase = 'anticipation';
    for (const object of elements) object.setVisible(false);
  }
  function startResistance(reaction = currentReaction) {
    if (destroyed) return;
    phase = 'resistance';
    panel.setVisible(true); divider.setVisible(true); track.setVisible(true); fill.setVisible(true);
    resistance.setVisible(true); reward.setVisible(false);
    label('title', 'RESISTENCIA DEL BAÑO', barLeft, top + 38, 3, UI_COLORS.title, 'left', width - 240);
    label('help', 'SPACE · APRETÁ REPETIDAMENTE', cx, top + 178, 2, UI_COLORS.secondary);
    showReaction(reaction);
  }
  function update({ state, presentation, feedback = 'idle' }) {
    if (destroyed) return;
    if (phase === 'anticipation') startResistance(presentation);
    const percent = state.resistance / config.maxResistance;
    fill.setScale(percent, 1).setVisible(percent > 0);
    fill.setFillStyle(feedback === 'hit' ? UI_COLORS.danger : feedback === 'recover' ? UI_COLORS.success : UI_COLORS.cyan, 1);
    resistance.setText(`RESISTENCIA ${Math.round(state.resistance)}`);
    label('timer', formatRemainingTime(config.durationMs - state.elapsedMs), left + width - 40, top + 38, 3, UI_COLORS.title, 'right', 120);
    showReaction(presentation);
  }
  function showResolution(nextResult, { rewardSettled = false, reaction = null } = {}) {
    if (destroyed) return;
    phase = 'resolution'; result = nextResult; ready = false;
    panel.setVisible(true); divider.setVisible(true);
    for (const object of [track, fill, resistance]) object.setVisible(false);
    removeLabel('timer'); removeLabel('help');
    const success = result === 'success';
    label('title', success ? 'PUERTA ASEGURADA' : 'LA PUERTA CEDIÓ', cx, top + 44, 4,
      success ? UI_COLORS.success : UI_COLORS.danger);
    reward.setText(rewardSettled ? `+${BATHROOM_RESULT_CONFIG[result].points} PUNTOS` : '').setVisible(true);
    showReaction(reaction);
  }
  function setReady() {
    if (destroyed || ready) return;
    ready = true;
    label('help', 'ENTER · VOLVER AL PATIO', cx, top + 178, 2, UI_COLORS.secondary);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    reactions.destroy();
    for (const { object } of labels.values()) object.destroy();
    labels.clear(); elements.forEach((object) => object.destroy());
    cameraScope.destroy();
    scene.events?.off?.('shutdown', destroy);
  }
  setAnticipation();
  scene.events?.once?.('shutdown', destroy);
  return { elements, update, setAnticipation, startResistance, showReaction, showResolution, setReady, destroy,
    getView: () => ({ phase, result, ready, reaction: currentReaction, layout,
      labels: Object.fromEntries([...labels].map(([id, value]) => [id, value.text])), reward: reward.text }),
  };
}

// Keep the small public entry points; BathroomEvent retains one challenge instance across phases.
export function createBathroomAnticipationUi(scene) {
  const ui = createBathroomChallengeUi(scene, { durationMs: 10000, maxResistance: 100 });
  return { ...ui, update: ui.showReaction };
}
export function createBathroomResistanceUi(scene, config) {
  const ui = createBathroomChallengeUi(scene, config);
  ui.startResistance();
  return ui;
}
export function createBathroomResolutionUi(scene, result, options) {
  const ui = createBathroomChallengeUi(scene, { durationMs: 10000, maxResistance: 100 });
  ui.showResolution(result, options);
  return ui;
}
export function destroyEventUi(elements) {
  if (typeof elements?.destroy === 'function') elements.destroy();
  else (elements?.elements ?? elements)?.forEach((element) => element.destroy());
}
