import { PATIO_LAYOUT } from '../patioLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';

const dj = PATIO_LAYOUT.dj;
const pool = PATIO_LAYOUT.pool;
const placements = [];
const layers = { ground: -16, step: 0.01 };

// Coordinates are world pixels at native scale, measured from the PNG's top-left.
// Use atFeet for ground contacts and mount for a socket on another sprite.
function place(sector, id, assetId, x, y, options = {}) {
  const { parent, support, crop, anchor, offset = layers.step } = options;
  const asset = assets[assetId];
  const scale = asset.scale;
  const depthRule = parent ? 'parent' : asset.depthBehavior === 'ground' ? 'ground' : 'feet';
  const depth = parent ? parent.depth + offset
    : depthRule === 'ground' ? layers.ground : y + asset.contactPx[1] * scale;
  const item = { id, assetId, x, y, scale, sector, depthRule, depth,
    ...(parent && { parent: parent.id, support }),
    ...(crop && { crop }),
    ...(anchor && { anchor }),
  };
  placements.push(Object.freeze(item));
  return item;
}

function atFeet(sector, id, assetId, x, y) {
  const { contactPx: [cx, cy], scale } = assets[assetId];
  return place(sector, id, assetId, x - cx * scale, y - cy * scale);
}

function mount(parent, id, assetId, support, options) {
  const { contactPx: [cx, cy], scale } = assets[assetId];
  return place(parent.sector, id, assetId,
    parent.x + support[0] * parent.scale - cx * scale,
    parent.y + support[1] * parent.scale - cy * scale,
    { ...options, parent, support });
}

function frontLip(pot, fromY) {
  const { width, height, contactPx } = assets[pot.assetId];
  mount(pot, `${pot.id}-lip`, pot.assetId, contactPx, {
    crop: [0, fromY, width, height - fromY], offset: 4 * layers.step,
  });
}

function planter(sector, id, potId, plantId, x, y, root) {
  const pot = atFeet(sector, id, potId, x, y);
  mount(pot, `${id}-plant`, plantId, root);
  frontLip(pot, potId === 'V06A' ? 14 : 12);
}

function table(sector, id, assetId, x, y, props) {
  const top = place(sector, id, assetId, x, y);
  // The supplied sockets run back-to-front across each usable surface (Pack D).
  props.forEach(([name, prop, px, py], i) =>
    mount(top, `${id}-${name}`, prop, [px, py], { offset: (i + 1) * layers.step }));
}

function sofa(sector, id, x, y, cushions, long = false) {
  // Pack A exact joints, including the transparent margin. Do not rotate modules.
  const corner = place(sector, `${id}-corner`, 'F01a', x - 2, y - 2);
  if (long) place(sector, `${id}-straight-down`, 'F01b', x + 86, y - 2);
  place(sector, `${id}-end-down`, 'F01c', x + (long ? 156 : 86), y - 2);
  place(sector, `${id}-straight-right`, 'F01d', x - 2, y + 94);
  place(sector, `${id}-end-right`, 'F01e', x - 2, y + 126);
  cushions.forEach(([asset, px, py], i) =>
    mount(corner, `${id}-cushion-${i + 1}`, asset, [px, py], { offset: (i + 1) * layers.step }));
}

function border(id, x, y, plants) {
  const sector = 'lower-border';
  const left = place(sector, `${id}-left`, 'V07-left', x - 2, y - 2);
  const middle = place(sector, `${id}-middle`, 'V07-middle', x + 10, y - 2);
  const right = place(sector, `${id}-right`, 'V07-right', x + 146, y - 2);
  plants.forEach(([asset, px, py], i) =>
    mount(middle, `${id}-plant-${i + 1}`, asset, [px, py], { offset: (i + 1) * layers.step }));
  for (const part of [left, middle, right]) frontLip(part, 19);
}

const edge = 'upper-left';
const tree = atFeet(edge, 'edge-tree', 'V01-trunk', dj.x - 36, dj.y + 105);
mount(tree, 'edge-tree-canopy', 'V01-canopy', assets['V01-trunk'].contactPx);

// One real span joins a woody branch to the left edge of the existing speaker.
// Both segments descend in their authored orientation. No freestanding poles.
const span = mount(tree, 'edge-garland-slope', 'L03-A2', [52, 78], { offset: 5 });
const end = mount(span, 'edge-garland-end', 'L03-A1', assets['L03-A2'].joins.join_to_local_px);
mount(span, 'edge-garland-tree-clip', 'L03-C', [2, 2], { offset: 0.03, anchor: tree.id });
mount(end, 'edge-garland-speaker-clip', 'L03-C', assets['L03-A1'].joins.join_to_local_px, {
  anchor: 'dj-left-speaker',
});
mount(span, 'edge-garland-bulb-left', 'L03-B', [18, 6]);
mount(end, 'edge-garland-bulb-right', 'L03-B', [18, 4]);

atFeet(edge, 'edge-leaves', 'V03B', 24, 346);
atFeet(edge, 'edge-tree-lantern', 'L01', 100, 355);
planter(edge, 'edge-tropical', 'V06A', 'V02A', 44, 412, [25, 13]);
table(edge, 'edge-cocktail', 'F05', 113, 371, [
  ['bottle', 'C01', 47, 15], ['cup', 'C02', 20, 18], ['lamp', 'L04', 34, 22],
]);

const upper = 'upper-lounge';
atFeet(upper, 'upper-transition', 'V09B', 32, 454);
sofa(upper, 'upper-sofa', 28, 466, [['F02a', 45, 64]]);
table(upper, 'upper-table', 'F03', 116, 567, [
  ['lamp', 'L04', 41, 22], ['plant', 'V08', 65, 31], ['cup', 'C02', 28, 43],
]);
atFeet(upper, 'upper-pouf', 'F06', 117, 695);
planter(upper, 'upper-tropical', 'V06A', 'V02B', 44, 686, [25, 14]);
atFeet(upper, 'upper-lantern', 'L01', 14, 684);

const lower = 'lower-lounge';
atFeet(lower, 'lower-transition', 'V09A', 40, 725);
atFeet(lower, 'lower-rug', 'F07', 172, 874);
sofa(lower, 'lower-sofa', 16, 724, [['F02a', 40, 58], ['F02b', 65, 74]], true);
table(lower, 'lower-table', 'F04', 133, 830, [
  ['bottle', 'C01', 53, 18], ['lamp', 'L04', 31, 29], ['cup', 'C02', 70, 31],
]);
planter(lower, 'lower-shrub', 'V06B', 'V04B', 292, 821, [35, 12]);
planter(lower, 'lower-tropical', 'V06A', 'V02A', 46, 930, [25, 13]);
atFeet(lower, 'lower-lantern', 'L01', 16, 919);

// Three independent one-center assemblies leave visible gaps and avoid the
// Bathroom return corridor immediately south of the pool. Roots use soil pixels
// in each middle module, while the front lips restore the original stone edge.
border('border-west', 28, 927, [
  ['V04A', 56, 13], ['V05B', 117, 11],
]);
border('border-middle', 210, 914, [
  ['V09B', 30, 11], ['V05A', 74, 13], ['V03A', 124, 14],
]);
border('border-east', 398, 925, [
  ['V05B', 32, 10], ['V04B', 76, 13], ['V04A', 116, 14],
]);
atFeet('lower-border', 'border-west-bollard', 'L02', 198, 951);
atFeet('lower-border', 'border-east-bollard', 'L02', 384, 949);
planter('lower-border', 'border-tropical', 'V06A', 'V02B', 584, 939, [25, 14]);
atFeet('lower-border', 'border-lantern', 'L01', 568, 952);

const poolside = 'pool-side';
planter(poolside, 'pool-upper-tropical', 'V06A', 'V02B', pool.x - 52, pool.y - 62, [25, 14]);
planter(poolside, 'pool-low-planter', 'V06B', 'V03A', pool.x - 38, pool.y + 50, [35, 9]);
atFeet(poolside, 'pool-bollard', 'L02', pool.x - 20, pool.y + 147);

// No placements in the central dance core. This is a visual preview only;
// lightEmitter and colliderIntent stay attached to the catalog, not the scene.
export const DJ_ENVIRONMENT_LAYOUT = Object.freeze(placements);
