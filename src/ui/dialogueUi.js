const PANEL_COLOR = 0x090b10;
const PANEL_DEPTH = 6000;
const TEXT_DEPTH = 6001;

function createPanel(scene, x, y, width, height) {
  const panel = scene.add.rectangle(x, y, width, height, PANEL_COLOR, 0.97)
    .setScrollFactor(0)
    .setDepth(PANEL_DEPTH);
  panel.setStrokeStyle(2, 0xffffff, 0.16);
  return panel;
}

function createText(scene, x, y, text, style) {
  return scene.add.text(x, y, text, {
    fontFamily: 'monospace',
    ...style,
  }).setScrollFactor(0).setDepth(TEXT_DEPTH);
}

export function createDialogueQuestionUi(scene, {
  character,
  round,
  roundIndex,
  totalRounds,
  councilAvailable,
}) {
  const panel = createPanel(scene, 640, 575, 1160, 248);
  const name = createText(scene, 92, 474, character.name.toUpperCase(), {
    fontSize: '18px',
    color: '#ffe8a8',
    fontStyle: 'bold',
  });
  const progress = createText(scene, 1175, 478, `${roundIndex + 1} / ${totalRounds}`, {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);
  const line = createText(scene, 92, 510, round.line, {
    fontSize: '17px',
    color: '#f4f4ef',
    wordWrap: { width: 1080 },
  });
  const answers = round.answers.map((answer, index) => createText(
    scene,
    110 + (index % 2) * 555,
    568 + Math.floor(index / 2) * 46,
    `${index + 1}. ${answer.text}`,
    {
      fontSize: '14px',
      color: '#d8dce5',
      wordWrap: { width: 510 },
    },
  ));

  const council = councilAvailable
    ? createText(scene, 92, 675, 'C · EL CONSEJO', {
      fontSize: '12px',
      color: '#8fd7ff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    : null;
  const help = createText(scene, 1175, 675, '1–4 elegir · ESC abandonar', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, name, progress, line, ...answers, council, help].filter(Boolean);
}

export function createDialogueReactionUi(scene, character, reaction, canContinue) {
  const panel = createPanel(scene, 640, 610, 1160, 180);
  const name = createText(scene, 92, 547, character.name.toUpperCase(), {
    fontSize: '18px',
    color: '#ffe8a8',
    fontStyle: 'bold',
  });
  const line = createText(scene, 92, 585, reaction, {
    fontSize: '17px',
    color: '#f4f4ef',
    wordWrap: { width: 1040 },
  });
  const instruction = canContinue
    ? 'ENTER / SPACE · CONTINUAR  ·  ESC abandonar'
    : 'ESC cerrar';
  const help = createText(scene, 1175, 675, instruction, {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, name, line, help];
}

export function createCouncilSelectionUi(scene, members) {
  const panel = createPanel(scene, 640, 575, 960, 250);
  const title = createText(scene, 190, 478, 'EL CONSEJO', {
    fontSize: '21px',
    color: '#8fd7ff',
    fontStyle: 'bold',
  });
  const subtitle = createText(scene, 190, 514, '¿A quién escuchás?', {
    fontSize: '14px',
    color: '#d8dce5',
  });
  const options = members.map((member, index) => createText(
    scene,
    220,
    552 + index * 35,
    `${index + 1}. ${member.name}`,
    { fontSize: '16px', color: '#f4f4ef', fontStyle: 'bold' },
  ));
  const help = createText(scene, 1090, 675, '1–3 elegir · ESC volver', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, subtitle, ...options, help];
}

export function createCouncilAdviceUi(scene, member, advice) {
  const panel = createPanel(scene, 640, 590, 900, 200);
  const title = createText(scene, 220, 520, `EL CONSEJO · ${member.name}`, {
    fontSize: '18px',
    color: '#8fd7ff',
    fontStyle: 'bold',
  });
  const line = createText(scene, 220, 568, `“${advice}”`, {
    fontSize: '18px',
    color: '#f4f4ef',
    wordWrap: { width: 820 },
  });
  const help = createText(scene, 1060, 660, 'ENTER / SPACE · VOLVER', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, line, help];
}

export function createOutcomeUi(scene, outcome) {
  const panel = createPanel(scene, 640, 575, 920, 250);
  const title = createText(scene, 220, 478, `${outcome.icon} ${outcome.label}`, {
    fontSize: '24px',
    color: '#ffe8a8',
    fontStyle: 'bold',
  });
  const narrative = createText(scene, 220, 528, outcome.lines.join('\n\n'), {
    fontSize: '17px',
    color: '#f4f4ef',
    wordWrap: { width: 820 },
    lineSpacing: 7,
  });
  const rewardText = outcome.reward.lives < 0
    ? `${outcome.reward.lives} ♥`
    : `+${outcome.reward.points} ★`;
  const reward = createText(scene, 220, 632, rewardText, {
    fontSize: '18px',
    color: outcome.reward.lives < 0 ? '#ff6b74' : '#f4cd63',
    fontStyle: 'bold',
  });
  const help = createText(scene, 1060, 670, 'ENTER / SPACE · CONTINUAR', {
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5);

  return [panel, title, narrative, reward, help];
}

export function destroyDialogueUi(elements) {
  elements?.forEach((element) => element.destroy());
}
