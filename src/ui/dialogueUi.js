export function createDialogueOptionsUi(scene, character) {
  const panel = scene.add.rectangle(640, 575, 1160, 248, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(6000);
  panel.setStrokeStyle(2, 0xffffff, 0.16);

  const name = scene.add.text(92, 474, character.name.toUpperCase(), {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#ffe8a8',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(6001);

  const line = scene.add.text(92, 510, character.intro, {
    fontFamily: 'monospace',
    fontSize: '17px',
    color: '#f4f4ef',
    wordWrap: { width: 1080 },
  }).setScrollFactor(0).setDepth(6001);

  const answers = character.answers.map((answer, index) => scene.add.text(
    110 + (index % 2) * 555,
    568 + Math.floor(index / 2) * 46,
    `${index + 1}. ${answer}`,
    {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#d8dce5',
      wordWrap: { width: 510 },
    },
  ).setScrollFactor(0).setDepth(6001));

  const help = scene.add.text(1175, 675, '1–4 elegir · ESC cerrar', {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(6001);

  return [panel, name, line, ...answers, help];
}

export function createDialogueReactionUi(scene, character, reaction) {
  const panel = scene.add.rectangle(640, 610, 1160, 160, 0x090b10, 0.97)
    .setScrollFactor(0)
    .setDepth(6000);
  panel.setStrokeStyle(2, 0xffffff, 0.16);

  const name = scene.add.text(92, 557, character.name.toUpperCase(), {
    fontFamily: 'monospace',
    fontSize: '18px',
    color: '#ffe8a8',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(6001);

  const line = scene.add.text(92, 593, reaction, {
    fontFamily: 'monospace',
    fontSize: '17px',
    color: '#f4f4ef',
    wordWrap: { width: 1040 },
  }).setScrollFactor(0).setDepth(6001);

  const help = scene.add.text(1175, 665, 'ESC cerrar', {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#8e95a2',
  }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(6001);

  return [panel, name, line, help];
}

export function destroyDialogueUi(elements) {
  elements?.forEach((element) => element.destroy());
}
