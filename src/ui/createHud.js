export function createHud(scene, gameState) {
  const hudBg = scene.add.rectangle(1086, 40, 350, 58, 0x090b10, 0.9)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(5000);
  hudBg.setStrokeStyle(1, 0xffffff, 0.13);

  scene.add.text(935, 27, Array(gameState.player.lives).fill('♥').join(' '), {
    fontFamily: 'monospace',
    fontSize: '22px',
    color: '#ff5a65',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5001);

  scene.add.text(1035, 29, `ALCOHOL  ${gameState.player.alcohol}%`, {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f1d18a',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5001);

  scene.add.text(1188, 29, `★ ${String(gameState.player.points).padStart(4, '0')}`, {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f4cd63',
    fontStyle: 'bold',
  }).setScrollFactor(0).setDepth(5001);

  const interactionPrompt = scene.add.text(640, 658, '', {
    fontFamily: 'monospace',
    fontSize: '15px',
    color: '#f4f4ef',
    fontStyle: 'bold',
    backgroundColor: '#090b10',
    padding: { x: 14, y: 9 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(5001).setVisible(false);

  return { interactionPrompt };
}
