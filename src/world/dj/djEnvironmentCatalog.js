import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';

const GROUND_DEPTH = -16;

export function djRootPart(assetId) {
  const asset = assets[assetId];
  const ground = asset.depthBehavior === 'ground';
  return { id: 'root', assetId, x: 0, y: 0, scale: asset.scale, depthRule: ground ? 'ground' : 'feet',
    depth: ground ? GROUND_DEPTH : asset.contactPx[1] * asset.scale };
}

function mount(parent, id, assetId, support, depthOffset, crop) {
  const { contactPx, scale } = assets[assetId];
  return {
    id, assetId, parent: parent.id, support, scale, depthRule: 'parent',
    x: parent.x + support[0] * parent.scale - contactPx[0] * scale,
    y: parent.y + support[1] * parent.scale - contactPx[1] * scale,
    depth: parent.depth + depthOffset,
    ...(crop && { crop }),
  };
}

function planted(potId, plantId, support, lipY) {
  const pot = djRootPart(potId);
  const { width, height, contactPx } = assets[potId];
  return [
    pot, mount(pot, 'plant', plantId, support, 0.01),
    mount(pot, 'lip', potId, contactPx, 0.04, [0, lipY, width, height - lipY]),
  ];
}

const tree = djRootPart('V01-trunk');
const crown = mount(tree, 'canopy', 'V01-canopy', [80, 127], 0.01);
// Both ends of the approved straight cable fasten to opaque pixels of the same trunk.
const cable = mount(tree, 'cable', 'L03-A0', [56, 83], 0.02);
function furnishedTable() {
  const table = djRootPart('F04');
  return [
    table, mount(table, 'bottle', 'C01', [53, 18], 0.01),
    mount(table, 'lamp', 'L04', [31, 29], 0.02), mount(table, 'cup', 'C02', [70, 31], 0.03),
  ];
}

// Each entry either describes its native assembly or reuses an existing full assembly.
export const DJ_ENVIRONMENT_RECIPES = Object.freeze({
  'tropical-wide-pot': { label: 'Macetero tropical ancho', assetId: 'V02A',
    parts: planted('V06A', 'V02A', [25, 13], 14) },
  'tropical-tall-pot': { label: 'Macetero tropical alto', assetId: 'V02B',
    parts: planted('V06A', 'V02B', [25, 14], 14) },
  'shrub-pot': { label: 'Macetero rectangular con arbusto', assetId: 'V04B',
    parts: planted('V06B', 'V04B', [35, 12], 12) },
  'ornamental-tree': { label: 'Árbol ornamental', assetId: 'V01-canopy', parts: [tree, crown] },
  'tree-flat-garland': { label: 'Árbol con guirnalda recta', assetId: 'L03-A0', parts: [
    tree, crown, cable, mount(cable, 'clip-start', 'L03-C', [2, 2], 0.01),
    mount(cable, 'clip-end', 'L03-C', [34, 2], 0.02), mount(cable, 'bulb', 'L03-B', [18, 2], 0.03),
  ] },
  'table-served': { label: 'Mesa baja servida', assetId: 'F04', parts: furnishedTable() },
  'sofa-short': { label: 'Sofá modular corto', assetId: 'F01a', baseline: 'upper-sofa-corner' },
  'sofa-long': { label: 'Sofá modular largo', assetId: 'F01b', baseline: 'lower-sofa-corner' },
  'garden-border': { label: 'Jardinera modular plantada', assetId: 'V07-middle', baseline: 'border-middle-left' },
});

export const DJ_CATALOG_FAMILIES = Object.freeze({
  furniture: 'Mobiliario', vegetation: 'Vegetación', lighting: 'Luces físicas', drinks: 'Bebidas',
});

export function djAssetLibrary(catalog = assets, recipes = DJ_ENVIRONMENT_RECIPES) {
  const entries = Object.entries(catalog).map(([id, asset]) => ({
    id, source: `asset:${id}`, label: asset.label ?? id, family: asset.family, path: asset.path,
    placeable: asset.placeable === true,
  }));
  for (const [id, recipe] of Object.entries(recipes)) {
    const asset = catalog[recipe.assetId];
    if (!asset) continue;
    entries.push({ id, source: `recipe:${id}`, label: recipe.label, family: recipe.family ?? asset.family,
      path: asset.path, placeable: true, recipe: true,
      supportSearch: (recipe.parts ?? []).map(({ assetId }) => `${assetId} ${catalog[assetId]?.label ?? ''}`).join(' '),
    });
  }
  return entries;
}

const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function filterDjAssetLibrary(entries, family, query, includeParts = false) {
  const terms = normalize(query).trim().split(/\s+/);
  return entries.filter((entry) => {
    if ((!includeParts && !entry.placeable) || (family && entry.family !== family)) return false;
    const searchable = normalize(`${entry.id} ${entry.label} ${entry.supportSearch ?? ''}`);
    return terms.every((term) => searchable.includes(term));
  });
}
