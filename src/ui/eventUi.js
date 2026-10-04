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

// Owns one reaction widget plus the existing pure-knock feedback.
function createBathroomPresentation(scene, outside) {
  const reactions = createPortraitReactionUi(scene);
  let previous;
  return {
    update(presentation) {
      if (presentation === previous) return;
      previous = presentation;
      if (presentation?.speaker) {
        outside.setText('').setVisible(false);
        reactions.show(presentation);
      } else {
        reactions.hide();
        outside.setText(presentation?.text ?? '').setVisible(Boolean(presentation?.text));
      }
    },
    destroy: reactions.destroy,
  };
}

function bathroomUi(elements, presentation, update) {
  let destroyed = false;
  return {
    elements,
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      presentation.destroy();
      elements.forEach((element) => element.destroy());
    },
  };
}

export function createBathroomAnticipationUi(scene) {
  const outside = createText(scene, (scene.scale?.width ?? 1280) / 2,
    (scene.scale?.height ?? 720) * 0.23, '', {
      fontSize: '25px', color: '#ffcf72', fontStyle: 'bold',
    }).setOrigin(0.5);
  const presentation = createBathroomPresentation(scene, outside);
  return bathroomUi([outside], presentation, (beat) => presentation.update(beat));
}

function formatRemainingTime(remainingMs) {
  return `00:${String(Math.ceil(Math.max(0, remainingMs) / 1000)).padStart(2, '0')}`;
}

export function createBathroomResistanceUi(scene, config) {
  const cx = (scene.scale?.width ?? 1280) / 2;
  const sy = (scene.scale?.height ?? 720) / 720;
  const panelWidth = Math.min(760, (scene.scale?.width ?? 1280) - 48);
  const barWidth = Math.min(440, panelWidth - 80);
  const barLeft = cx - barWidth / 2;
  const panel = scene.add.rectangle(cx, 360 * sy, panelWidth, 242 * sy, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, 0xffffff, 0.16);
  const title = createText(scene, cx, 278 * sy, '🚪 RESISTENCIA DEL BAÑO', {
    fontSize: '22px', color: '#ffe8a8', fontStyle: 'bold',
  }).setOrigin(0.5);
  const barBackground = scene.add.rectangle(barLeft, 342 * sy, barWidth, 22, 0x252a33, 1)
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH + 1);
  const barFill = scene.add.rectangle(barLeft, 342 * sy, barWidth, 16, 0x6fd6e8, 1)
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH + 2);
  const resistance = createText(scene, barLeft, 377 * sy, '', {
    fontSize: '14px', color: '#d8dce5', fontStyle: 'bold',
  });
  const timer = createText(scene, cx + barWidth / 2, 377 * sy, '', {
    fontSize: '16px', color: '#f4f4ef', fontStyle: 'bold',
  }).setOrigin(1, 0);
  const outside = createText(scene, cx, 449 * sy, '', {
    fontSize: '17px', color: '#ffcf72', fontStyle: 'bold',
  }).setOrigin(0.5);
  const presentationUi = createBathroomPresentation(scene, outside);
  const help = createText(scene, cx, 516 * sy, 'SPACE · APRETÁ REPETIDAMENTE', {
    fontSize: '12px', color: '#8fd7ff', fontStyle: 'bold',
  }).setOrigin(0.5);

  return bathroomUi(
    [panel, title, barBackground, barFill, resistance, timer, outside, help],
    presentationUi,
    ({ state, presentation, feedback = 'idle' }) => {
      const percent = state.resistance / 100;
      barFill.setScale(percent, 1).setVisible(percent > 0);
      barFill.setFillStyle(
        feedback === 'hit' ? 0xf06b72 : feedback === 'recover' ? 0x82e7a4 : 0x6fd6e8,
        1,
      );
      resistance.setText(`RESISTENCIA ${Math.round(state.resistance)}`);
      timer.setText(formatRemainingTime(config.durationMs - state.elapsedMs));
      presentationUi.update(presentation);
    },
  );
}

export function createBathroomResolutionUi(scene, result, { rewardSettled = false, reaction = null } = {}) {
  const isSuccess = result === 'success';
  const resultConfig = BATHROOM_RESULT_CONFIG[result];
  const cx = (scene.scale?.width ?? 1280) / 2;
  const sy = (scene.scale?.height ?? 720) / 720;
  const panel = scene.add.rectangle(cx, 360 * sy, Math.min(720, (scene.scale?.width ?? 1280) - 48), 210 * sy, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, isSuccess ? 0x8fe6ad : 0xff7b85, 0.45);
  const title = createText(scene, cx, 306 * sy, isSuccess ? '🚪 PUERTA ASEGURADA' : '💥 LA PUERTA CEDIÓ', {
    fontSize: '24px', color: isSuccess ? '#a9efbd' : '#ff9ba2', fontStyle: 'bold',
  }).setOrigin(0.5);
  const outside = createText(scene, cx, 354 * sy, '', {
    fontSize: '16px', color: '#d5dce4', align: 'center',
  }).setOrigin(0.5);
  const presentation = createBathroomPresentation(scene, outside);
  presentation.update(reaction);
  const reward = createText(
    scene,
    cx,
    408 * sy,
    rewardSettled && resultConfig ? `+${resultConfig.points} ★` : '',
    { fontSize: '18px', color: '#f4cd63', fontStyle: 'bold' },
  ).setOrigin(0.5);
  const help = createText(scene, cx, 454 * sy, 'ENTER · VOLVER AL PATIO', {
    fontSize: '12px', color: '#8e95a2',
  }).setOrigin(0.5);

  return bathroomUi([panel, title, outside, reward, help], presentation, () => {});
}

export function destroyEventUi(elements) {
  if (typeof elements?.destroy === 'function') elements.destroy();
  else (elements?.elements ?? elements)?.forEach((element) => element.destroy());
}
