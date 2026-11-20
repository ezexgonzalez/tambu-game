import { PATIO_LAYOUT } from '../patioLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { DJ_ENVIRONMENT_LAYOUT as baseline } from './djEnvironmentLayout.js';

export const DJ_LAYOUT_GROUPS = Object.freeze({
  'upper-dj-edge': 'Borde superior DJ',
  'upper-lounge': 'Lounge superior',
  'lower-lounge': 'Lounge inferior',
  'lower-border-west': 'Borde inferior oeste',
  'lower-border-middle': 'Borde inferior centro',
  'lower-border-east': 'Borde inferior este',
  'pool-side': 'Lateral de piscina',
});

const groups = Object.keys(DJ_LAYOUT_GROUPS);
const rootById = new Map();
for (const { id, parent, assembly } of baseline) {
  rootById.set(id, rootById.get(parent ?? assembly) ?? id);
}
const objects = baseline.map(({ id }) => id);
const roots = Object.freeze(objects.filter((id) => rootById.get(id) === id));
const unchanged = Object.freeze({ dx: 0, dy: 0, visible: true });
const world = PATIO_LAYOUT.world;
const VERSION = 1;
const invalid = () => new Error('JSON incompatible con el layout DJ base (versión 1).');

export function isDjLayoutEditorEnabled(search = '') {
  return new URLSearchParams(search).get('djLayoutEdit') === '1';
}

function snapshot(groupOffsets, overrides) {
  return baseline.map((item) => {
    const group = groupOffsets.get(item.group) ?? unchanged;
    const individual = overrides.get(rootById.get(item.id)) ?? unchanged;
    const dy = group.dy + individual.dy;
    return {
      ...item,
      x: item.x + group.dx + individual.dx,
      y: item.y + dy,
      depth: item.depthRule === 'ground' ? item.depth : item.depth + dy,
      visible: group.visible && individual.visible,
    };
  });
}

function position({ x, y, visible }) {
  return { x, y, ...(!visible && { visible: false }) };
}

function serializedOffset({ dx, dy, visible }) {
  return { dx, dy, ...(!visible && { visible: false }) };
}

function readOffsets(raw, ids, required) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw invalid();
  if ((required && Object.keys(raw).length !== ids.length)
    || Object.keys(raw).some((id) => !ids.includes(id))) throw invalid();
  const result = new Map();
  for (const id of ids) {
    if (!Object.hasOwn(raw, id)) continue;
    const value = raw[id];
    if (!value || !Number.isSafeInteger(value.dx) || !Number.isSafeInteger(value.dy)
      || Math.abs(value.dx) > world.width || Math.abs(value.dy) > world.height
      || (Object.hasOwn(value, 'visible') && typeof value.visible !== 'boolean')) throw invalid();
    const { dx, dy, visible = true } = value;
    if (dx || dy || !visible) result.set(id, { dx, dy, visible });
  }
  return result;
}

function extent({ assetId, x, y, scale }) {
  return [x, y, x + assets[assetId].width * scale, y + assets[assetId].height * scale];
}

export function djPlacementBounds({ assetId, x, y, scale, crop }) {
  const [left, top, w, h] = crop ?? [0, 0, assets[assetId].width, assets[assetId].height];
  return { x: x + left * scale, y: y + top * scale, width: w * scale, height: h * scale };
}

export function pickDjLayoutObject(placements, x, y, isOpaque) {
  let hit = null;
  for (const item of placements) {
    if (!item.visible || (hit && hit.depth > item.depth)) continue;
    const box = djPlacementBounds(item);
    if (x < box.x || x >= box.x + box.width || y < box.y || y >= box.y + box.height) continue;
    if (isOpaque && !isOpaque(item.assetId, Math.floor((x - item.x) / item.scale),
      Math.floor((y - item.y) / item.scale))) continue;
    hit = item; // Later item wins in a Phaser depth tie.
  }
  return hit;
}

export function createDjLayoutEditorState() {
  let groupOffsets = new Map(), overrides = new Map(), selection = null;
  const getPlacements = () => snapshot(groupOffsets, overrides);
  const isSelected = (item) => selection?.type === 'group'
    ? selection.id === item.group
    : selection?.id === rootById.get(item.id);
  const selectedMap = () => selection.type === 'group' ? groupOffsets : overrides;

  function select(type, id) {
    if (type === 'object') id = rootById.get(id);
    selection = (type === 'group' && groups.includes(id)) || (type === 'object' && id)
      ? Object.freeze({ type, id }) : null;
    return selection;
  }

  function move(dx, dy) {
    if (!selection || !Number.isFinite(dx) || !Number.isFinite(dy)) return;
    let minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity;
    for (const item of getPlacements().filter(isSelected)) {
      const [left, top, right, bottom] = extent(item);
      minX = Math.max(minX, world.x - left);
      minY = Math.max(minY, world.y - top);
      maxX = Math.min(maxX, world.x + world.width - right);
      maxY = Math.min(maxY, world.y + world.height - bottom);
    }
    dx = Math.min(maxX, Math.max(minX, Math.round(dx)));
    dy = Math.min(maxY, Math.max(minY, Math.round(dy)));
    const offset = selectedMap().get(selection.id) ?? unchanged;
    selectedMap().set(selection.id, { ...offset, dx: offset.dx + dx, dy: offset.dy + dy });
  }

  function exportLayout() {
    return {
      version: VERSION,
      groups: Object.fromEntries(groups.map((id) => [id, serializedOffset(groupOffsets.get(id) ?? unchanged)])),
      overrides: Object.fromEntries(roots.map((id) => [id, overrides.get(id)])
        .filter(([, entry]) => entry && (entry.dx || entry.dy || !entry.visible))
        .map(([id, entry]) => [id, serializedOffset(entry)])),
      objects: Object.fromEntries(getPlacements().map((item) => [item.id, position(item)])),
    };
  }

  function importLayout(data) {
    if (!data || data.version !== VERSION) throw invalid();
    const nextGroups = readOffsets(data.groups, groups, true);
    const nextOverrides = readOffsets(data.overrides, roots, false);
    const expected = snapshot(nextGroups, nextOverrides);
    if (!data.objects || typeof data.objects !== 'object' || Array.isArray(data.objects)
      || Object.keys(data.objects).length !== objects.length) throw invalid();
    for (const item of expected) {
      const actual = data.objects[item.id];
      const [left, top, right, bottom] = extent(item);
      if (!Object.hasOwn(data.objects, item.id) || actual?.x !== item.x || actual?.y !== item.y
        || (Object.hasOwn(actual, 'visible') ? actual.visible : true) !== item.visible
        || left < world.x || top < world.y || right > world.x + world.width
        || bottom > world.y + world.height) throw invalid();
    }
    groupOffsets = nextGroups;
    overrides = nextOverrides;
    selection = null;
  }

  function toggleVisibility() {
    if (!selection) return;
    const offset = selectedMap().get(selection.id) ?? unchanged;
    selectedMap().set(selection.id, { ...offset, visible: !offset.visible });
  }

  return {
    getPlacements, select, isSelected, move, exportLayout, importLayout, toggleVisibility,
    editableObjectIds: roots,
    getSelection: () => selection,
    getSelectionOffset: () => selection ? selectedMap().get(selection.id) ?? unchanged : unchanged,
    reset() { groupOffsets.clear(); overrides.clear(); selection = null; },
  };
}
