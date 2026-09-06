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
  const reward = createText(scene, 640, 394, `+${outcome.reward.points} ★`, {
    fontSize: '18px',
    color: '#f4cd63',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  const help = createText(scene, 960, 438, 'ENTER / SPACE · CONTINUAR', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, narrative, reward, help];
}

export function createBathroomAnticipationUi(scene) {
  const outside = createText(scene, 640, 166, '', {
    fontSize: '25px',
    color: '#ffcf72',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  return {
    elements: [outside],
    update(text) {
      outside.setText(text);
    },
  };
}

function formatRemainingTime(remainingMs) {
  return `00:${String(Math.ceil(Math.max(0, remainingMs) / 1000)).padStart(2, '0')}`;
}

export function createBathroomResistanceUi(scene, config) {
  const panel = scene.add.rectangle(640, 360, 760, 242, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, 0xffffff, 0.16);
  const title = createText(scene, 640, 278, '🚪 RESISTENCIA DEL BAÑO', {
    fontSize: '22px', color: '#ffe8a8', fontStyle: 'bold',
  }).setOrigin(0.5);
  const barBackground = scene.add.rectangle(420, 342, 440, 22, 0x252a33, 1)
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH + 1);
  const barFill = scene.add.rectangle(420, 342, 440, 16, 0x6fd6e8, 1)
    .setOrigin(0, 0.5)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH + 2);
  const resistance = createText(scene, 420, 377, '', {
    fontSize: '14px', color: '#d8dce5', fontStyle: 'bold',
  });
  const timer = createText(scene, 860, 377, '', {
    fontSize: '16px', color: '#f4f4ef', fontStyle: 'bold',
  }).setOrigin(1, 0);
  const outsideLabel = createText(scene, 640, 423, 'AFUERA', {
    fontSize: '11px', color: '#8e95a2', fontStyle: 'bold',
  }).setOrigin(0.5);
  const outside = createText(scene, 640, 449, '', {
    fontSize: '17px', color: '#ffcf72', fontStyle: 'bold',
  }).setOrigin(0.5);
  const help = createText(scene, 640, 516, 'SPACE · MANTENÉ LA PUERTA CERRADA', {
    fontSize: '12px', color: '#8fd7ff', fontStyle: 'bold',
  }).setOrigin(0.5);

  return {
    elements: [panel, title, barBackground, barFill, resistance, timer, outsideLabel, outside, help],
    update({ state, outsideText, feedback = 'idle' }) {
      const percent = state.resistance / 100;
      barFill.setScale(percent, 1).setVisible(percent > 0);
      barFill.setFillStyle(
        feedback === 'hit' ? 0xf06b72 : feedback === 'recover' ? 0x82e7a4 : 0x6fd6e8,
        1,
      );
      resistance.setText(`RESISTENCIA ${Math.round(state.resistance)}`);
      timer.setText(formatRemainingTime(config.durationMs - state.elapsedMs));
      outside.setText(outsideText);
    },
  };
}

export function createBathroomResolutionUi(scene, result) {
  const isSuccess = result === 'success';
  const panel = scene.add.rectangle(640, 360, 720, 210, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, isSuccess ? 0x8fe6ad : 0xff7b85, 0.45);
  const title = createText(scene, 640, 306, isSuccess ? '🚪 PUERTA ASEGURADA' : '💥 LA PUERTA CEDIÓ', {
    fontSize: '24px', color: isSuccess ? '#a9efbd' : '#ff9ba2', fontStyle: 'bold',
  }).setOrigin(0.5);
  const narrative = createText(
    scene,
    640,
    354,
    isSuccess ? 'Afuera finalmente se rinden.' : 'La puerta se abre de golpe.\n\nTAMBU: ¿Qué?',
    { fontSize: '16px', color: '#f4f4ef', align: 'center', lineSpacing: 5 },
  ).setOrigin(0.5);
  const help = createText(scene, 640, 438, 'ENTER · VOLVER AL PATIO', {
    fontSize: '12px', color: '#8e95a2',
  }).setOrigin(0.5);

  return [panel, title, narrative, help];
}

export function destroyEventUi(elements) {
  (elements?.elements ?? elements)?.forEach((element) => element.destroy());
}
