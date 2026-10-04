import { createPixelText, measurePixelText } from './pixelText.js';

export const PORTRAIT_EXPRESSIONS = Object.freeze({ talk: 0, angry: 1, shout: 2 });
export const FRIEND_PORTRAITS = Object.freeze(Object.fromEntries(
  ['pitity', 'tobi', 'uriel', 'santy', 'thiago', 'eze'].map((speaker) => [speaker, Object.freeze({
    asset: `ui_portrait_${speaker}`,
    path: `/assets/ui/portraits/friends/ui_portrait_${speaker}_v1.png`,
    name: speaker.toUpperCase(),
  })]),
));

export function preloadPortraitReactions(scene) {
  for (const { asset, path } of Object.values(FRIEND_PORTRAITS)) {
    scene.load.spritesheet(asset, path, { frameWidth: 64, frameHeight: 64 });
  }
}

export function createPortraitReactionUi(scene, { x, y, width, depth = 6200 } = {}) {
  const viewportWidth = scene.scale?.width ?? 1280;
  const viewportHeight = scene.scale?.height ?? 720;
  x ??= viewportWidth / 2;
  y ??= Math.round(viewportHeight * 0.23);
  width ??= Math.min(680, viewportWidth - 48);
  const left = Math.round(x - width / 2);
  const bubbleLeft = left + 80;
  const bubbleWidth = width - 80;
  const bubble = scene.add.graphics().setScrollFactor(0).setDepth(depth);
  bubble.fillStyle(0x081421, 1);
  bubble.fillRect(bubbleLeft, y - 44, bubbleWidth, 88);
  bubble.fillTriangle(bubbleLeft, y - 8, bubbleLeft - 10, y, bubbleLeft, y + 8);
  bubble.lineStyle(1, 0x355a78, 1);
  bubble.strokeRect(bubbleLeft, y - 44, bubbleWidth, 88);
  bubble.lineBetween(bubbleLeft, y - 8, bubbleLeft - 10, y);
  bubble.lineBetween(bubbleLeft - 10, y, bubbleLeft, y + 8);
  const portrait = scene.add.image(left + 32, y, FRIEND_PORTRAITS.pitity.asset, 0)
    .setScrollFactor(0).setDepth(depth + 1);
  const speech = scene.add.text(bubbleLeft + 16, y - 6, '', {
    fontFamily: 'monospace', fontSize: '18px', color: '#f2f5f7',
    wordWrap: { width: bubbleWidth - 32 },
  }).setScrollFactor(0).setDepth(depth + 1);
  let speakerLabel = null;
  let destroyed = false;

  function hide() {
    if (destroyed) return;
    portrait.setVisible(false);
    bubble.setVisible(false);
    speech.setText('').setVisible(false);
    speakerLabel?.destroy();
    speakerLabel = null;
  }

  function show(data) {
    if (destroyed) return;
    if (!data?.speaker) { hide(); return; }
    const config = FRIEND_PORTRAITS[data.speaker];
    const frame = PORTRAIT_EXPRESSIONS[data.expression];
    if (!config || frame === undefined) throw new Error('Unknown portrait reaction speaker/expression');
    // Phaser 4 texture FilterMode.NEAREST = 1. Display remains native 64x64.
    scene.textures?.get(config.asset)?.setFilter(1);
    portrait.setTexture(config.asset, frame).setVisible(true);
    bubble.setVisible(true);
    speech.setText(data.text).setVisible(true);
    speakerLabel?.destroy();
    speakerLabel = createPixelText(scene, config.name, {
      x: bubbleLeft + 16 + measurePixelText(config.name, { cellSize: 3 }).width / 2,
      y: y - 26, cellSize: 3, pixelInset: 0.5, color: 0x94a6b9, depth: depth + 1,
    });
  }

  function destroy() {
    if (destroyed) return;
    hide();
    destroyed = true;
    for (const object of [portrait, bubble, speech]) object.destroy();
    scene.events?.off?.('shutdown', destroy);
  }

  hide();
  scene.events?.once?.('shutdown', destroy);
  return { show, hide, destroy };
}
