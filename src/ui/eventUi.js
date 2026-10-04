import { createBathroomUiCameraScope } from './bathroomUiCamera.js';
import { createPixelText } from './pixelText.js';
import { createPortraitReactionUi } from './portraitReactionUi.js';
import { BATHROOM_RESULT_CONFIG } from '../data/bathroomResultConfig.js';

const PANEL_DEPTH = 6100;

function createText(scene, x, y, text, style) {
  return scene.add.text(x, y, text, {
    fontFamily: 'monospace',
    ...style,
  }).setScrollFactor(0).setDepth(PANEL_DEPTH + 1);
}

export function createOutcomeEventUi(scene, outcome) {
  const panel = scene.add.rectangle(640, 360, 720, 210, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, 0xffffff, 0.16);

  const title = createText(
    scene,
    640,
    305,
    `${outcome.icon} ${outcome.event.resultLabel}`,
    { fontSize: '25px', color: '#ffe8a8', fontStyle: 'bold' },
  ).setOrigin(0.5);
  const narrative = createText(scene, 640, 352, outcome.event.resultText, {
    fontSize: '16px',
    color: '#f4f4ef',
  }).setOrigin(0.5);
  const help = createText(scene, 960, 438, 'ENTER / SPACE · CONTINUAR', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, narrative, help];
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
  const panel = own(scene.add.rectangle(cx, top + height / 2, width, height, 0x081421, 0.97)
    .setScrollFactor(0).setDepth(PANEL_DEPTH).setStrokeStyle(1, 0x355a78, 1));
  const divider = own(scene.add.rectangle(cx, dividerY, width - 2, 1, 0x355a78, 1)
    .setScrollFactor(0).setDepth(PANEL_DEPTH + 1));
  const barWidth = width - 80;
  const barLeft = left + 40;
  const track = own(scene.add.rectangle(barLeft, top + 100, barWidth, 28, 0x172633, 1)
    .setOrigin(0, 0.5).setScrollFactor(0).setDepth(PANEL_DEPTH + 1)
    .setStrokeStyle(1, 0x355a78, 1));
  const fill = own(scene.add.rectangle(barLeft + 4, top + 100, barWidth - 8, 20, 0x6fd6e8, 1)
    .setOrigin(0, 0.5).setScrollFactor(0).setDepth(PANEL_DEPTH + 2));
  const resistance = own(createText(scene, barLeft, top + 137, '', {
    fontSize: '14px', color: '#94a6b9',
  }));
  const reward = own(createText(scene, cx, top + 116, '', {
    fontSize: '26px', color: '#f4cd63', fontStyle: 'bold',
  }).setOrigin(0.5));
  const reactions = createPortraitReactionUi(scene, {
    x: cx, y: dockY, width: width - 48, framed: false, depth: PANEL_DEPTH + 3, registerObject: cameraScope.register,
  });
  const labels = new Map();
  let phase = 'anticipation';
  let currentReaction = null;
  let ready = false;
  let destroyed = false;
  let result = null;
  function label(id, text, x, y, cellSize, color = 0xf2f5f7) {
    const previous = labels.get(id);
    if (previous?.text === text) return;
    previous?.object.destroy();
    labels.set(id, { text, object: cameraScope.register(createPixelText(scene, text, {
      x, y, cellSize, pixelInset: cellSize >= 3 ? 0.5 : 0,
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
    label('title', 'RESISTENCIA DEL BAÑO', cx - 50, top + 38, 3);
    label('help', 'SPACE · APRETÁ REPETIDAMENTE', cx, top + 178, 2, 0x94a6b9);
    showReaction(reaction);
  }
  function update({ state, presentation, feedback = 'idle' }) {
    if (destroyed) return;
    if (phase === 'anticipation') startResistance(presentation);
    const percent = state.resistance / config.maxResistance;
    fill.setScale(percent, 1).setVisible(percent > 0);
    fill.setFillStyle(feedback === 'hit' ? 0xf06b72 : feedback === 'recover' ? 0x82e7a4 : 0x6fd6e8, 1);
    resistance.setText(`RESISTENCIA ${Math.round(state.resistance)}`);
    label('timer', formatRemainingTime(config.durationMs - state.elapsedMs), left + width - 85, top + 38, 3);
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
      success ? 0xa9efbd : 0xff9ba2);
    reward.setText(rewardSettled ? `+${BATHROOM_RESULT_CONFIG[result].points} ★` : '').setVisible(true);
    showReaction(reaction);
  }
  function setReady() {
    if (destroyed || ready) return;
    ready = true;
    label('help', 'ENTER · VOLVER AL PATIO', cx, top + 178, 2, 0x94a6b9);
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
