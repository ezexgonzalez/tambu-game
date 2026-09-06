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
  const help = createText(scene, 960, 438, 'ENTER / SPACE · VOLVER AL PATIO', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, narrative, reward, help];
}

export function destroyEventUi(elements) {
  elements?.forEach((element) => element.destroy());
}
