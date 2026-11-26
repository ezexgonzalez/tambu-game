import { PATIO_LAYOUT } from '../patioLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { DJ_ENVIRONMENT_LAYOUT as baseline } from './djEnvironmentLayout.js';
import { djRootPart, DJ_ENVIRONMENT_RECIPES } from './djEnvironmentCatalog.js';
import { PATIO_OPTIONAL_GROUPS } from './patioComposerAreas.js';

export const DJ_LAYOUT_GROUPS = Object.freeze({
  'upper-dj-edge': 'Borde superior DJ',
  'upper-lounge': 'Lounge superior',
  'lower-lounge': 'Lounge inferior',
  'lower-border-west': 'Borde inferior oeste',
  'lower-border-middle': 'Borde inferior centro',
  'lower-border-east': 'Borde inferior este',
  'pool-side': 'Lateral de piscina',
});
export const PATIO_LAYOUT_GROUPS = Object.freeze({ ...DJ_LAYOUT_GROUPS, ...PATIO_OPTIONAL_GROUPS });

export const DJ_LAYOUT_BASELINE_REVISION = 'f66fde61154d48624898fec713af7fbd0251966a';
export const DJ_MAX_DEPTH_OFFSET = 32;
export const DJ_MAX_PLACEMENTS = 512;
export const DJ_MAX_INSTANCE_ID = 999999;
const NAME = /^dj-[1-9]\d{0,5}$/;
const world = PATIO_LAYOUT.world;
const groupIds = Object.keys(DJ_LAYOUT_GROUPS);
const invalid = () => new Error('JSON incompatible con el layout del patio o sus assets.');
const isRecord = (value) => value != null && typeof value === 'object' && !Array.isArray(value);
const ordered = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

const baselineOrder = new Map(baseline.map((part, index) => [part.id, index]));
const baselineRoots = new Map();
const rootById = new Map();
for (const part of baseline) {
  const root = rootById.get(part.parent ?? part.assembly) ?? part.id;
  rootById.set(part.id, root);
  if (!baselineRoots.has(root)) baselineRoots.set(root, []);
  baselineRoots.get(root).push(part);
}

const templates = new Map();
for (const [id, parts] of baselineRoots) templates.set(`baseline:${id}`, parts);
for (const [id, entry] of Object.entries(assets)) {
  if (entry.placeable === true) templates.set(`asset:${id}`, [djRootPart(id)]);
}
for (const [id, recipe] of Object.entries(DJ_ENVIRONMENT_RECIPES)) {
  templates.set(`recipe:${id}`, recipe.parts ?? baselineRoots.get(recipe.baseline));
}

export const djSourceParts = (source) => templates.get(source);
export const isDjCatalogSource = (source) => /^(asset|recipe):/.test(source) && templates.has(source);

export function createDjBaseComposition() {
  const groups = Object.fromEntries(groupIds.map((id) => [id, { visible: true }]));
  const instances = new Map([...baselineRoots].map(([id, [part]]) => [id, {
    id, source: `baseline:${id}`, group: part.group, x: part.x, y: part.y, visible: true, depthOffset: 0,
  }]));
  return { instances, groups };
}

export function resolveDjInstance(instance, groups) {
  const { id, source, group, x, y, visible, depthOffset } = instance;
  const parts = templates.get(source);
  const root = parts[0];
  const dx = x - root.x, dy = y - root.y;
  const isOriginal = source === `baseline:${id}`;
  const names = new Map(parts.map((part) => [part.id,
    part === root ? id : isOriginal ? part.id : `${id}.${part.id}`]));
  return parts.map((part, index) => {
    const ground = part.depthRule === 'ground';
    const autoDepth = part.depth + (ground ? 0 : dy);
    const depth = autoDepth + (ground ? depthOffset / 100 : depthOffset);
    // A stable sublayer breaks equal-foot ties without changing neighbors on delete.
    const tie = isOriginal ? baselineOrder.get(part.id) * 0.000001
      : 0.0001 + (Number(id.slice(3)) * DJ_MAX_PLACEMENTS + index) * 1e-12;
    return {
      id: names.get(part.id), root: id, assetId: part.assetId, group,
      x: part.x + dx, y: part.y + dy, scale: part.scale,
      depthRule: part.depthRule, autoDepth, depthOffset,
      depth, renderDepth: depth + tie,
      visible: visible && groups[group].visible,
      ...(part.parent && { parent: names.get(part.parent), support: [...part.support] }),
      ...(part.assembly && { assembly: names.get(part.assembly) }),
      ...(part.crop && { crop: [...part.crop] }),
      ...(part.anchor && { anchor: names.get(part.anchor) ?? part.anchor }),
    };
  });
}

function compareInstances(a, b) {
  return (baselineOrder.get(a.id) ?? Infinity) - (baselineOrder.get(b.id) ?? Infinity)
    || Number(a.id.slice(3)) - Number(b.id.slice(3));
}

export function resolveDjComposition({ instances, groups }) {
  const items = [...instances.values()].sort(compareInstances).flatMap((instance) => resolveDjInstance(instance, groups));
  return items.sort((a, b) => (baselineOrder.get(a.id) ?? Infinity) - (baselineOrder.get(b.id) ?? Infinity) || 0);
}

export function djPlacementBounds({ assetId, x, y, scale, crop }, artOnly = true) {
  const [left, top, w, h] = (artOnly && crop) || [0, 0, assets[assetId].width, assets[assetId].height];
  return { x: x + left * scale, y: y + top * scale, width: w * scale, height: h * scale };
}

export function fitDjTranslation(parts, dx, dy) {
  let minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity;
  for (const item of parts) {
    const bounds = djPlacementBounds(item, false);
    minX = Math.max(minX, world.x - bounds.x);
    minY = Math.max(minY, world.y - bounds.y);
    maxX = Math.min(maxX, world.x + world.width - bounds.x - bounds.width);
    maxY = Math.min(maxY, world.y + world.height - bounds.y - bounds.height);
  }
  return [Math.min(Math.floor(maxX), Math.max(Math.ceil(minX), Math.round(dx))),
    Math.min(Math.floor(maxY), Math.max(Math.ceil(minY), Math.round(dy)))];
}

function isInsideWorld(part) {
  const { x, y, width, height } = djPlacementBounds(part, false);
  return Number.isSafeInteger(x) && Number.isSafeInteger(y) && x >= world.x && y >= world.y
    && x + width <= world.x + world.width && y + height <= world.y + world.height;
}

function sameData(expected, actual) {
  if (expected === actual) return true;
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length
      && expected.every((entry, i) => sameData(entry, actual[i]));
  }
  if (!isRecord(expected) || !isRecord(actual)) return false;
  const keys = Object.keys(expected);
  return keys.length === Object.keys(actual).length
    && keys.every((key) => Object.hasOwn(actual, key) && sameData(expected[key], actual[key]));
}

export function exportDjLayout(composition) {
  const placements = resolveDjComposition(composition);
  const used = [...new Set(placements.map(({ assetId }) => assetId))].sort();
  return {
    version: 2,
    baselineRevision: DJ_LAYOUT_BASELINE_REVISION,
    manifest: Object.fromEntries(used.map((id) => [id, assets[id].sha256])),
    // Keep the seven legacy keys and their order. New groups appear only once used.
    groups: ordered(composition.groups, Object.keys(PATIO_LAYOUT_GROUPS)
      .filter((id) => Object.hasOwn(composition.groups, id))),
    instances: [...composition.instances.values()].sort(compareInstances).map((item) => ({ ...item })),
    removedBaseline: baseline.filter(({ id }) => !composition.instances.has(rootById.get(id))).map(({ id }) => id),
    placements,
  };
}

function readV2(data) {
  if (data.baselineRevision !== DJ_LAYOUT_BASELINE_REVISION || !isRecord(data.groups)
    || !groupIds.every((id) => Object.hasOwn(data.groups, id))
    || !Object.keys(data.groups).every((id) => Object.hasOwn(PATIO_LAYOUT_GROUPS, id))
    || !Array.isArray(data.instances)
    || data.instances.length > DJ_MAX_PLACEMENTS || !Array.isArray(data.placements)
    || data.placements.length > DJ_MAX_PLACEMENTS) throw invalid();
  const groups = {};
  for (const id of Object.keys(data.groups)) {
    const value = data.groups[id];
    if (!Object.hasOwn(data.groups, id) || !isRecord(value) || typeof value.visible !== 'boolean') throw invalid();
    groups[id] = { visible: value.visible };
  }
  const instances = new Map();
  let count = 0;
  for (const item of data.instances) {
    if (!isRecord(item)) throw invalid();
    const { id, source, group, x, y, visible, depthOffset } = item;
    const isOriginal = baselineRoots.has(id);
    if (typeof id !== 'string' || typeof source !== 'string' || instances.has(id)
      || (isOriginal ? source !== `baseline:${id}` : !NAME.test(id))
      || !templates.has(source) || !Object.hasOwn(groups, group)
      || !Number.isSafeInteger(x) || !Number.isSafeInteger(y) || typeof visible !== 'boolean'
      || !Number.isInteger(depthOffset) || Math.abs(depthOffset) > DJ_MAX_DEPTH_OFFSET) throw invalid();
    count += templates.get(source).length;
    if (count > DJ_MAX_PLACEMENTS) throw invalid();
    instances.set(id, { id, source, group, x, y, visible, depthOffset });
  }
  // Never instantiate links from uploaded JSON. All members, supports, crops
  // and depths are derived from approved templates; the full handoff must agree.
  const value = { instances, groups };
  const expected = exportDjLayout(value);
  if (!expected.placements.every(isInsideWorld) || !sameData(expected, data)) throw invalid();
  return value;
}

function legacyOffset(value) {
  if (!isRecord(value) || !Number.isSafeInteger(value.dx) || !Number.isSafeInteger(value.dy)
    || Math.abs(value.dx) > world.width || Math.abs(value.dy) > world.height
    || (Object.hasOwn(value, 'visible') && typeof value.visible !== 'boolean')) throw invalid();
  return { dx: value.dx, dy: value.dy, visible: value.visible ?? true };
}

function migrateV1(data) {
  if (!isRecord(data.groups) || Object.keys(data.groups).length !== groupIds.length
    || !isRecord(data.overrides) || Object.keys(data.overrides).some((id) => !baselineRoots.has(id))
    || !isRecord(data.objects) || Object.keys(data.objects).length !== baseline.length) throw invalid();
  const { instances, groups } = createDjBaseComposition();
  const offsets = new Map(groupIds.map((id) => [id, legacyOffset(data.groups[id])]));
  for (const [id, offset] of offsets) groups[id].visible = offset.visible;
  for (const [id, instance] of instances) {
    const group = offsets.get(instance.group);
    const local = Object.hasOwn(data.overrides, id) ? legacyOffset(data.overrides[id]) : { dx: 0, dy: 0, visible: true };
    instances.set(id, { ...instance, x: instance.x + group.dx + local.dx,
      y: instance.y + group.dy + local.dy, visible: local.visible });
  }
  const value = { instances, groups };
  for (const part of resolveDjComposition(value)) {
    const actual = data.objects[part.id];
    if (!Object.hasOwn(data.objects, part.id) || !isRecord(actual) || actual.x !== part.x || actual.y !== part.y
      || (Object.hasOwn(actual, 'visible') ? actual.visible : true) !== part.visible
      || !isInsideWorld(part)) throw invalid();
  }
  return value;
}

export function readDjLayout(data) {
  if (data?.version === 2) return readV2(data);
  if (data?.version === 1) return migrateV1(data);
  throw invalid();
}

export function pickDjLayoutObject(placements, x, y, isOpaque) {
  let hit = null;
  const depth = (item) => item.renderDepth ?? item.depth;
  for (const item of placements) {
    if (!item.visible || (hit && depth(hit) > depth(item))) continue;
    const box = djPlacementBounds(item);
    if (x < box.x || x >= box.x + box.width || y < box.y || y >= box.y + box.height) continue;
    if (isOpaque && !isOpaque(item.assetId, Math.floor((x - item.x) / item.scale),
      Math.floor((y - item.y) / item.scale))) continue;
    hit = item;
  }
  return hit;
}
