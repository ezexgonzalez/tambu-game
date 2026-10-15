import { createUiLabel, createUiPanel, getUiViewport, UI_COLORS } from './uiTheme.js';

export function createHud(scene, gameState) {
  const { width, height } = getUiViewport(scene);
  const panelWidth = Math.min(310, width - 32);
  const left = width - panelWidth - 20;
  const background = createUiPanel(scene, { x: left, y: 20, width: panelWidth, height: 54 }, 5000);
  const lives = createUiLabel(scene, '', { x: left + 18, y: 47, align: 'left', maxWidth: 110, depth: 5002 });
  const points = createUiLabel(scene, '', { x: width - 38, y: 47, align: 'right',
    maxWidth: panelWidth - 158, color: UI_COLORS.gold, depth: 5002 });
  const divider = scene.add.rectangle(left + 139, 47, 1, 26, UI_COLORS.frame)
    .setScrollFactor(0).setDepth(5001);
  const promptWidth = Math.min(590, width - 48);
  const promptBackground = createUiPanel(scene, { x: (width - promptWidth) / 2,
    y: height - 72, width: promptWidth, height: 44 }, 5000).setVisible(false);
  const interactionPrompt = createUiLabel(scene, '', { x: width / 2, y: height - 50,
    maxWidth: promptWidth - 32, cellSize: 3, depth: 5002 }).setVisible(false);
  const showPrompt = interactionPrompt.setVisible.bind(interactionPrompt);
  let visible = true;
  interactionPrompt.setVisible = (value) => {
    promptBackground.setVisible(visible && value);
    return showPrompt(visible && value);
  };
  function setVisible(value) {
    visible = value;
    [background, divider, lives, points].forEach((object) => object.setVisible(value));
    if (!value) interactionPrompt.setVisible(false);
  }
  function update(state) {
    lives.setText(`VIDAS ${state.player.lives}`);
    points.setText(`PUNTOS ${String(state.player.points).padStart(4, '0')}`);
  }
  let destroyed = false;
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    [background, divider, lives, points, promptBackground, interactionPrompt].forEach((object) => object.destroy());
    scene.events?.off?.('shutdown', destroy);
  }
  scene.events?.once?.('shutdown', destroy);
  update(gameState);
  return { interactionPrompt, update, setVisible, destroy };
}
