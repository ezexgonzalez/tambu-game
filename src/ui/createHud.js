export function createHud(scene, gameState) {
  scene.add.rectangle(1090, 44, 356, 64, 0x020409, 0.38)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(4999);

  const hudBg = scene.add.rectangle(1086, 40, 350, 58, 0x080b13, 0.96)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(5000);
  hudBg.setStrokeStyle(2, 0x65728a, 0.72);

  const hudDecor = scene.add.graphics()
    .setScrollFactor(0)
    .setDepth(5001);
  hudDecor.fillStyle(0x253044, 0.52);
  hudDecor.fillRect(918, 17, 336, 2);
  hudDecor.fillStyle(0xe0ad54, 0.72);
  hudDecor.fillRect(918, 17, 54, 2);
  hudDecor.fillStyle(0x5e687b, 0.52);
  hudDecor.fillRect(1019, 21, 2, 38);
  hudDecor.fillRect(1172, 21, 2, 38);

  hudDecor.fillStyle(0x111722, 1);
  hudDecor.fillRect(1037, 49, 112, 8);
  hudDecor.lineStyle(1, 0x8994a7, 0.68);
  hudDecor.strokeRect(1037, 49, 112, 8);

  const alcoholFill = scene.add.rectangle(1038, 50, 1, 6, 0xf0b849, 1)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(5002)
    .setVisible(false);

  const hearts = scene.add.text(935, 27, Array(gameState.player.lives).fill('♥').join(' '), {
    fontFamily: 'monospace',
    fontSize: '22px',
    color: '#ff5a65',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5002);
  hearts.setShadow(0, 0, '#ff4059', 4, true, true);

  const alcohol = scene.add.text(1035, 29, '', {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f1d18a',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5002);

  const points = scene.add.text(1188, 29, '', {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f4cd63',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5002);
  points.setShadow(0, 0, '#e7a93d', 3, true, true);

  const interactionPrompt = scene.add.text(640, 658, '', {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f4f4ef',
    fontStyle: 'bold',
    backgroundColor: '#090b10',
    padding: { x: 14, y: 9 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(5002).setVisible(false);
  interactionPrompt.setShadow(2, 2, '#000000', 3, true, true);

  function update(nextState) {
    const playerState = nextState.player;
    hearts.setText(Array(playerState.lives).fill('♥').join(' '));
    alcohol.setText(`ALCOHOL  ${playerState.alcohol}%`);
    points.setText(`★ ${String(playerState.points).padStart(4, '0')}`);

    const alcoholPercent = Math.max(0, Math.min(playerState.alcohol, 100));
    const fillWidth = Math.round(110 * alcoholPercent / 100);
    alcoholFill.setDisplaySize(Math.max(fillWidth, 1), 6).setVisible(fillWidth > 0);
  }

  update(gameState);
  return { interactionPrompt, update };
}
