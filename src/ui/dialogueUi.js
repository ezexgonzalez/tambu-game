import { createUiPanel, createUiLabel, createUiBody, setUiBody, getUiViewport,
  UI_COLORS, cssColor, formatOutcomeReward } from './uiTheme.js';

const PANEL_DEPTH = 6000;
const TEXT_DEPTH = 6002;
const role = (object, value) => { object.uiRole = value; return object; };
export function getDialogueLayout(scene) {
  const viewport = getUiViewport(scene);
  const width = Math.min(1120, viewport.width - 48);
  const height = Math.min(360, viewport.height - 48);
  const x = Math.round((viewport.width - width) / 2);
  const y = viewport.height - height - 24;
  return { x, y, width, height, padding: 24, contentWidth: width - 48,
    headerY: y + 28, bodyY: y + 58, choicesY: y + 154, helpY: y + height - 26 };
}
function label(scene, text, x, y, maxWidth, options = {}) {
  return createUiLabel(scene, text, { x, y, maxWidth, depth: TEXT_DEPTH, ...options });
}
function rule(scene, x, y, width, height = 1) {
  return scene.add.rectangle(Math.round(x + width / 2), Math.round(y + height / 2),
    Math.round(width), height, UI_COLORS.frame).setScrollFactor(0).setDepth(PANEL_DEPTH + 1);
}
function body(scene, text, x, y, width, height, maxFont = 18) {
  const object = createUiBody(scene, text, { x, y, width, height }, TEXT_DEPTH, { fontSize: maxFont });
  return setUiBody(object, text, text, maxFont);
}

export function createDialogueQuestionUi(scene, { character, beat, beatIndex, totalBeats, councilAvailable }) {
  const l = getDialogueLayout(scene);
  const panel = createUiPanel(scene, l, PANEL_DEPTH);
  const name = role(label(scene, character.name.toUpperCase(), l.x + 24, l.headerY,
    l.contentWidth - 130, { align: 'left', cellSize: 4 }), 'question-name');
  const progress = role(label(scene, `${beatIndex + 1} / ${totalBeats}`, l.x + l.width - 24,
    l.headerY, 100, { align: 'right', cellSize: 2, color: UI_COLORS.secondary }), 'question-progress');
  const line = role(body(scene, '', l.x + 24, l.bodyY, l.contentWidth, 82), 'question-body');
  const separator = rule(scene, l.x + 24, l.choicesY - 12, l.contentWidth);
  const columnWidth = (l.contentWidth - 32) / 2;
  const rowHeight = 68;
  const choices = beat.choices.map((choice, index) => {
    const x = l.x + 24 + (index % 2) * (columnWidth + 32);
    const y = l.choicesY + Math.floor(index / 2) * rowHeight;
    const key = role(label(scene, String(index + 1), x + 7, y + 12, 20,
      { cellSize: 3, color: UI_COLORS.cyan }), `choice-key-${index}`);
    const answer = role(body(scene, choice.text, x + 28, y, columnWidth - 28, 62, 16), `choice-${index}`);
    return [key, answer];
  });
  const council = councilAvailable ? role(label(scene, 'C · EL CONSEJO', l.x + 24, l.helpY,
    230, { align: 'left', cellSize: 2, color: UI_COLORS.cyan }), 'question-council') : null;
  const help = role(label(scene, '', l.x + l.width - 24, l.helpY, l.contentWidth - 250,
    { align: 'right', cellSize: 2, color: UI_COLORS.secondary }), 'question-help');
  function update({ entry, text, complete }) {
    setUiBody(line, text, entry?.text ?? beat.prompt);
    choices.flat().forEach((object) => object.setVisible(complete));
    separator.setVisible(complete); council?.setVisible(complete);
    help.setText(complete ? '1-4 · ELEGIR  /  ESC · ABANDONAR' : 'ENTER / SPACE · CONTINUAR');
  }
  update({ text: '', complete: false });
  return { elements: [panel, name, progress, line, separator, ...choices.flat(), council, help].filter(Boolean), update };
}

export function createDialogueReactionUi(scene, canContinue, { canAbandon = true, completionInstruction } = {}) {
  const l = getDialogueLayout(scene);
  const rect = { ...l, y: l.y + 60, height: l.height - 60 };
  const panel = createUiPanel(scene, rect, PANEL_DEPTH);
  const name = role(label(scene, '', l.x + 24, rect.y + 28, l.contentWidth,
    { align: 'left', cellSize: 4 }), 'reaction-name');
  const separator = rule(scene, l.x + 24, rect.y + 50, l.contentWidth);
  const line = role(body(scene, '', l.x + 24, rect.y + 70, l.contentWidth, rect.height - 126), 'reaction-body');
  const instruction = canContinue
    ? `ENTER / SPACE · CONTINUAR${canAbandon ? '  /  ESC · ABANDONAR' : ''}`
    : completionInstruction ?? 'ESC · CERRAR';
  const help = role(label(scene, instruction.toUpperCase(), l.x + l.width - 24, l.helpY, l.contentWidth,
    { align: 'right', cellSize: 2, color: UI_COLORS.secondary }), 'reaction-help');
  return { elements: [panel, name, separator, line, help], update({ entry, text, complete }) {
    name.setText(entry?.speaker?.toUpperCase() ?? '');
    separator.setVisible(Boolean(entry?.speaker));
    setUiBody(line, text, entry?.text ?? text);
    line.setStyle({ fontStyle: entry?.speaker ? 'normal' : 'italic',
      color: cssColor(entry?.speaker ? UI_COLORS.text : UI_COLORS.secondary) });
    help.setText(!complete ? 'ENTER / SPACE · CONTINUAR' : instruction.toUpperCase());
  } };
}

export function createCouncilSelectionUi(scene, members) {
  const l = getDialogueLayout(scene);
  const panel = createUiPanel(scene, l, PANEL_DEPTH);
  const title = label(scene, 'EL CONSEJO', l.x + 24, l.headerY, l.contentWidth,
    { align: 'left', cellSize: 4 });
  const subtitle = body(scene, '¿A quién escuchás?', l.x + 24, l.bodyY, l.contentWidth, 28, 17);
  const separator = rule(scene, l.x + 24, l.y + 100, l.contentWidth);
  const options = members.flatMap((member, index) => {
    const y = l.y + 130 + index * 54;
    return [label(scene, String(index + 1), l.x + 36, y, 24, { color: UI_COLORS.cyan }),
      label(scene, member.name.toUpperCase(), l.x + 70, y, l.contentWidth - 80,
        { align: 'left', cellSize: 3 })];
  });
  const help = label(scene, '1-3 · ELEGIR  /  ESC · VOLVER', l.x + l.width - 24, l.helpY,
    l.contentWidth, { align: 'right', cellSize: 2, color: UI_COLORS.secondary });
  return [panel, title, subtitle, separator, ...options, help];
}

export function createCouncilAdviceUi(scene, member) {
  const l = getDialogueLayout(scene);
  const panel = createUiPanel(scene, l, PANEL_DEPTH);
  const title = role(label(scene, `EL CONSEJO · ${member.name.toUpperCase()}`, l.x + 24,
    l.headerY, l.contentWidth, { align: 'left', cellSize: 3 }), 'advice-name');
  const separator = rule(scene, l.x + 24, l.y + 52, l.contentWidth);
  const line = role(body(scene, '', l.x + 24, l.y + 80, l.contentWidth, l.height - 142), 'advice-body');
  const help = label(scene, 'ENTER / SPACE · CONTINUAR', l.x + l.width - 24, l.helpY, l.contentWidth,
    { align: 'right', cellSize: 2, color: UI_COLORS.secondary });
  return { elements: [panel, title, separator, line, help], update({ entry, text, complete }) {
    const isTambu = entry?.speaker === 'TAMBU';
    title.setText(`EL CONSEJO · ${isTambu ? 'TAMBU' : member.name.toUpperCase()}`);
    setUiBody(line, `“${text}”`, `“${entry?.text ?? text}”`);
    help.setText(complete && isTambu ? 'ENTER / SPACE · VOLVER' : 'ENTER / SPACE · CONTINUAR');
  } };
}

export function createOutcomeUi(scene, outcome) {
  const l = getDialogueLayout(scene);
  const panel = createUiPanel(scene, l, PANEL_DEPTH);
  const color = outcome.id === 'rejection' ? UI_COLORS.danger
    : outcome.id === 'bathroom' ? UI_COLORS.success : UI_COLORS.title;
  const title = label(scene, outcome.label.toUpperCase(), l.x + 24, l.y + 36, l.contentWidth,
    { align: 'left', cellSize: 5, color });
  const separator = rule(scene, l.x + 24, l.y + 64, l.contentWidth);
  const narrative = body(scene, outcome.lines.join('\n\n'), l.x + 24, l.y + 88, l.contentWidth, 130);
  const reward = label(scene, formatOutcomeReward(outcome), l.x + 24, l.y + l.height - 84, l.contentWidth,
    { align: 'left', cellSize: 3, color: outcome.reward.lives < 0 ? UI_COLORS.danger : UI_COLORS.gold });
  const help = label(scene, 'ENTER / SPACE · CONTINUAR', l.x + l.width - 24, l.helpY, l.contentWidth,
    { align: 'right', cellSize: 2, color: UI_COLORS.secondary });
  return [panel, title, separator, narrative, reward, help];
}
export function destroyDialogueUi(elements) {
  (elements?.elements ?? elements)?.forEach((element) => element.destroy());
}
