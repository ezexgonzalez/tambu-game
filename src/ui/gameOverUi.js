import Phaser from 'phaser';

const GAME_OVER_DEPTH = 20_000;
const GAME_OVER_RED = 0xd71920;
const GAME_OVER_COPY = 'SOS UN HIJO DE PUTA';
const RETRY_PROMPT = 'ENTER / SPACE · REINTENTAR';

export function createGameOverUi(scene, { hud, onRetry = () => {} }) {
  const { width, height } = scene.scale;
  const titleFontSize = Math.min(80, Math.floor(width * 0.0625));
  const keyboard = scene.input.keyboard;
  const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  const background = scene.add.rectangle(0, 0, width, height, GAME_OVER_RED)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(GAME_OVER_DEPTH)
    .setVisible(false);
  const title = scene.add.text(width / 2, height * 0.46, GAME_OVER_COPY, {
    fontFamily: 'monospace',
    fontSize: `${titleFontSize}px`,
    color: '#ffffff',
    fontStyle: 'bold',
    align: 'center',
    wordWrap: { width: width - 48 },
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(GAME_OVER_DEPTH + 1)
    .setVisible(false);
  const retryPrompt = scene.add.text(width / 2, height * 0.68, RETRY_PROMPT, {
    fontFamily: 'monospace',
    fontSize: '20px',
    color: '#ffffff',
    align: 'center',
  })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(GAME_OVER_DEPTH + 1)
    .setVisible(false);

  const displayObjects = [background, title, retryPrompt];
  let visible = false;
  let retryRequested = false;
  let destroyed = false;

  function show() {
    if (destroyed || visible) return false;
    visible = true;
    hud.setVisible(false);
    displayObjects.forEach((object) => object.setVisible(true));
    return true;
  }

  function update() {
    if (!visible || destroyed || retryRequested) return false;

    const enterPressed = Phaser.Input.Keyboard.JustDown(enterKey);
    const spacePressed = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (!enterPressed && !spacePressed) return false;

    retryRequested = true;
    onRetry();
    return true;
  }

  function destroy() {
    if (destroyed) return false;
    destroyed = true;
    visible = false;
    displayObjects.forEach((object) => object.destroy());
    return true;
  }

  return { show, update, destroy, isVisible: () => visible };
}
