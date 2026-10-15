import { createPixelText } from './pixelText.js';

export const UI_COLORS = Object.freeze({
  overlay: 0x05080d, background: 0x060b14, panel: 0x081421,
  title: 0xf2f5f7, text: 0xd5dce4, secondary: 0x94a6b9, frame: 0x355a78,
  success: 0xa9efbd, cyan: 0x6fd6e8, danger: 0xf06b72, gold: 0xf4cd63, warning: 0xc9ae78,
});
export const cssColor = (value) => `#${value.toString(16).padStart(6, '0')}`;
export function getUiViewport(scene) {
  return { width: scene.scale?.width ?? 1280, height: scene.scale?.height ?? 720 };
}
export function createUiPanel(scene, { x, y, width, height }, depth, alpha = 0.97) {
  const object = scene.add.rectangle(Math.round(x + width / 2), Math.round(y + height / 2),
    Math.round(width), Math.round(height), UI_COLORS.panel, alpha)
    .setScrollFactor(0).setDepth(depth).setStrokeStyle(1, UI_COLORS.frame, 1);
  object.uiRect = { x, y, width, height };
  return object;
}
export function createUiLabel(scene, text, options = {}) {
  return createPixelText(scene, text, { cellSize: 3, pixelInset: 0.5,
    color: UI_COLORS.title, ...options });
}
// Conservative monospace measurement for layout preflight; never edits dialogue content.
export function getBodyMetrics(text, width, fontSize, lineSpacing = 4) {
  const columns = Math.max(1, Math.floor(width / (fontSize * 0.64)));
  let lines = 0;
  for (const paragraph of String(text).split('\n')) {
    let used = 0; lines++;
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (used && used + 1 + word.length > columns) { lines++; used = 0; }
      if (used) used++;
      const length = used + word.length;
      lines += Math.max(0, Math.ceil(length / columns) - 1);
      used = length ? ((length - 1) % columns) + 1 : 0;
    }
  }
  return { lines, height: lines * (fontSize + lineSpacing), fontSize, width };
}
export function fitBodyText(text, width, height, maxFontSize = 18) {
  let fontSize = maxFontSize;
  while (fontSize > 12 && getBodyMetrics(text, width, fontSize).height > height) fontSize--;
  return getBodyMetrics(text, width, fontSize);
}
export function createUiBody(scene, text, rect, depth, { fontSize = 18, color = UI_COLORS.text } = {}) {
  const object = scene.add.text(Math.round(rect.x), Math.round(rect.y), text, {
    fontFamily: 'monospace', fontSize: `${fontSize}px`, color: cssColor(color),
    wordWrap: { width: rect.width, useAdvancedWrap: true }, lineSpacing: 4,
  }).setScrollFactor(0).setDepth(depth);
  object.uiRect = rect;
  return object;
}
export function setUiBody(object, text, fullText = text, maxFontSize = 18) {
  object.setText(text);
  if (object.uiFullText !== fullText || object.uiMaxFontSize !== maxFontSize) {
    const metrics = fitBodyText(fullText, object.uiRect.width, object.uiRect.height, maxFontSize);
    object.setStyle({ fontSize: `${metrics.fontSize}px` });
    object.bodyMetrics = metrics;
    object.uiFullText = fullText;
    object.uiMaxFontSize = maxFontSize;
  }
  return object;
}
export function formatOutcomeReward(outcome) {
  if (outcome.id === 'bathroom') return 'RECOMPENSA PENDIENTE';
  if (outcome.reward.lives < 0) return `${outcome.reward.lives} VIDA`;
  return `+${outcome.reward.points} PUNTOS`;
}
