import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import {
  createDjBaseComposition, DJ_LAYOUT_GROUPS, DJ_MAX_DEPTH_OFFSET, DJ_MAX_INSTANCE_ID, DJ_MAX_PLACEMENTS,
  djSourceParts, exportDjLayout, fitDjTranslation, isDjCatalogSource, readDjLayout,
  resolveDjComposition, resolveDjInstance,
} from './djLayoutComposition.js';

export { DJ_LAYOUT_GROUPS, djPlacementBounds, pickDjLayoutObject } from './djLayoutComposition.js';

const HISTORY_LIMIT = 50;
const DEPTH_STEP = 4;

export function isDjLayoutEditorEnabled(search = '') {
  return new URLSearchParams(search).get('djLayoutEdit') === '1';
}

export function createDjLayoutEditorState() {
  let value = createDjBaseComposition(), selection = null, cache, nextId = 1, dragStart = null;
  const undoStack = [], redoStack = [];
  const getPlacements = () => cache ??= resolveDjComposition(value);
  const getInstance = () => selection?.type === 'object' ? value.instances.get(selection.id) : null;
  const isSelected = (item) => Boolean(selection && (selection.type === 'group'
    ? selection.id === item.group : selection.id === item.root));
  const selectedParts = () => getPlacements().filter(isSelected);
  const current = () => ({ value, selection });

  function restore(snapshot) {
    ({ value, selection } = snapshot);
    cache = undefined;
  }

  function record(before) {
    undoStack.push(before);
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    redoStack.length = 0;
  }

  function change(next, nextSelection = selection) {
    if (!dragStart) record(current());
    restore({ value: next, selection: nextSelection });
  }

  function endMove() {
    if (!dragStart) return;
    // One history entry per gesture, even when Phaser emits many pointer moves.
    if ([...value.instances].some(([id, item]) => {
      const start = dragStart.value.instances.get(id);
      return start?.x !== item.x || start?.y !== item.y;
    })) record(dragStart);
    dragStart = null;
  }

  function select(type, id) {
    endMove();
    if (type === 'object' && !value.instances.has(id)) id = getPlacements().find((part) => part.id === id)?.root;
    selection = (type === 'group' && Object.hasOwn(DJ_LAYOUT_GROUPS, id)) || (type === 'object' && value.instances.has(id))
      ? Object.freeze({ type, id }) : null;
    return selection;
  }

  function move(dx, dy) {
    if (!selection || !Number.isFinite(dx) || !Number.isFinite(dy)) return [0, 0];
    const parts = selectedParts();
    if (!parts.length) return [0, 0];
    const applied = fitDjTranslation(parts, dx, dy);
    if (!applied[0] && !applied[1]) return applied;
    const instances = new Map(value.instances);
    for (const id of new Set(parts.map((part) => part.root))) {
      const item = instances.get(id);
      instances.set(id, { ...item, x: item.x + applied[0], y: item.y + applied[1] });
    }
    change({ ...value, instances });
    return applied;
  }

  function insert({ source, group, x, y, visible = true, depthOffset = 0 }) {
    const size = djSourceParts(source)?.length;
    if (!size || nextId > DJ_MAX_INSTANCE_ID || getPlacements().length + size > DJ_MAX_PLACEMENTS) return null;
    const id = `dj-${nextId++}`;
    const item = { id, source, group, x, y, visible, depthOffset };
    const [dx, dy] = fitDjTranslation(resolveDjInstance(item, value.groups), 0, 0);
    const instances = new Map(value.instances).set(id, { ...item, x: x + dx, y: y + dy });
    change({ ...value, instances }, Object.freeze({ type: 'object', id }));
    return id;
  }

  function add(source, group, x, y) {
    endMove();
    if (!isDjCatalogSource(source) || !Object.hasOwn(DJ_LAYOUT_GROUPS, group)
      || !Number.isSafeInteger(Math.round(x)) || !Number.isSafeInteger(Math.round(y))) return null;
    const root = djSourceParts(source)[0];
    const [cx, cy] = assets[root.assetId].contactPx;
    return insert({ source, group, x: Math.round(x - cx * root.scale), y: Math.round(y - cy * root.scale) });
  }

  function duplicate() {
    endMove();
    const item = getInstance();
    if (!item) return null;
    const parts = selectedParts();
    let [dx, dy] = fitDjTranslation(parts, 12, 12);
    if (!dx && !dy) [dx, dy] = fitDjTranslation(parts, -12, -12);
    return insert({ ...item, x: item.x + dx, y: item.y + dy });
  }

  function editSelected(changes) {
    endMove();
    const item = getInstance();
    if (!item || Object.entries(changes).every(([key, val]) => item[key] === val)) return false;
    change({ ...value, instances: new Map(value.instances).set(item.id, { ...item, ...changes }) });
    return true;
  }

  function toggleVisibility() {
    endMove();
    if (!selection) return;
    if (selection.type === 'object') {
      editSelected({ visible: !getInstance().visible });
      return;
    }
    const id = selection.id;
    change({ ...value, groups: { ...value.groups, [id]: { visible: !value.groups[id].visible } } });
  }

  function deleteSelection() {
    endMove();
    const item = getInstance();
    if (!item) return false;
    const instances = new Map(value.instances);
    instances.delete(item.id);
    change({ ...value, instances }, null);
    return true;
  }

  function adjustDepth(direction) {
    if (![-1, 0, 1].includes(direction)) return false;
    const before = getInstance()?.depthOffset ?? 0;
    const depthOffset = direction === 0 ? 0
      : Math.max(-DJ_MAX_DEPTH_OFFSET, Math.min(DJ_MAX_DEPTH_OFFSET, before + direction * DEPTH_STEP));
    return editSelected({ depthOffset });
  }

  function importLayout(data) {
    const next = readDjLayout(data); // Validate before touching edits, selection or history.
    endMove();
    for (const id of next.instances.keys()) {
      if (/^dj-\d+$/.test(id)) nextId = Math.max(nextId, Number(id.slice(3)) + 1);
    }
    change(next, null);
  }

  return {
    getPlacements, select, isSelected, move, add, duplicate, deleteSelection, toggleVisibility, adjustDepth, importLayout,
    changeGroup: (group) => Object.hasOwn(DJ_LAYOUT_GROUPS, group) && editSelected({ group }),
    exportLayout: () => exportDjLayout(value),
    getSelection: () => selection,
    getSelectedInstance: () => getInstance(),
    getEditableObjects: () => [...value.instances.values()].map(({ id, group, source }) => ({
      id, group, source, assetId: djSourceParts(source)[0].assetId,
    })),
    isSelectionVisible: () => selection?.type === 'group' ? value.groups[selection.id].visible : getInstance()?.visible ?? true,
    reset() { endMove(); change(createDjBaseComposition(), null); },
    beginMove() { if (!dragStart) dragStart = current(); },
    endMove,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    undo() {
      endMove();
      if (!undoStack.length) return false;
      redoStack.push(current());
      restore(undoStack.pop());
      return true;
    },
    redo() {
      endMove();
      if (!redoStack.length) return false;
      undoStack.push(current());
      restore(redoStack.pop());
      return true;
    },
  };
}
