const PATIO_ASSET_ROOT = '/assets/props/patio';

const PATIO_AMBIENT_ASSETS = Object.freeze({
  tableRound: Object.freeze({ key: 'patio-table-round-01', path: `${PATIO_ASSET_ROOT}/patio_table_round_01.png` }),
  tableServed: Object.freeze({ key: 'patio-table-served-01', path: `${PATIO_ASSET_ROOT}/patio_table_served_01.png` }),
  cooler: Object.freeze({ key: 'patio-cooler-party-01', path: `${PATIO_ASSET_ROOT}/patio_cooler_party_01.png` }),
  planterSpike: Object.freeze({ key: 'patio-planter-spike-01', path: `${PATIO_ASSET_ROOT}/patio_planter_spike_01.png` }),
  planterBroad: Object.freeze({ key: 'patio-planter-broad-01', path: `${PATIO_ASSET_ROOT}/patio_planter_broad_01.png` }),
  shrubFlower: Object.freeze({ key: 'patio-shrub-flower-01', path: `${PATIO_ASSET_ROOT}/patio_shrub_flower_01.png` }),
  shrubLow: Object.freeze({ key: 'patio-shrub-low-01', path: `${PATIO_ASSET_ROOT}/patio_shrub_low_01.png` }),
  cratePlant: Object.freeze({ key: 'patio-crate-plant-01', path: `${PATIO_ASSET_ROOT}/patio_crate_plant_01.png` }),
  pouf: Object.freeze({ key: 'patio-pouf-01', path: `${PATIO_ASSET_ROOT}/patio_pouf_01.png` }),
  bench: Object.freeze({ key: 'patio-bench-01', path: `${PATIO_ASSET_ROOT}/patio_bench_01.png` }),
});

// These are deliberately perimeter-biased: the social tables retain their existing
// collision footprints, while the new secondary dressing leaves circulation untouched.
const SECONDARY_DRESSING = Object.freeze([
  Object.freeze({ asset: 'planterBroad', x: 82, y: 482, scale: 0.22 }),
  Object.freeze({ asset: 'planterSpike', x: 1602, y: 520, scale: 0.22 }),
  Object.freeze({ asset: 'cratePlant', x: 1170, y: 895, scale: 0.25 }),
  Object.freeze({ asset: 'shrubFlower', x: 82, y: 908, scale: 0.23 }),
  Object.freeze({ asset: 'shrubLow', x: 145, y: 913, scale: 0.24 }),
]);

const LOUNGE = Object.freeze([
  Object.freeze({ asset: 'bench', x: 265, y: 896, scale: 0.22 }),
  Object.freeze({ asset: 'pouf', x: 350, y: 900, scale: 0.22 }),
]);

export function preloadPatioAmbient(scene) {
  Object.values(PATIO_AMBIENT_ASSETS)
    .forEach(({ key, path }) => scene.load.image(key, path));
}

function addAmbientProp(scene, { asset, x, y, scale }) {
  return scene.add.image(x, y, PATIO_AMBIENT_ASSETS[asset].key)
    .setOrigin(0.5, 1)
    .setScale(scale)
    // The bottom anchor is the prop's grounded contact line, matching player foot depth.
    .setDepth(y);
}

export function createPatioAmbient(scene, { partyTables, cooler }) {
  // Existing collision anchors become the two intentional social micro-zones.
  const social = [
    { asset: 'tableServed', x: partyTables[0].x, y: partyTables[0].y + 60, scale: 0.19 },
    { asset: 'tableRound', x: partyTables[1].x, y: partyTables[1].y + 60, scale: 0.19 },
    { asset: 'cooler', x: cooler.x + cooler.width / 2, y: cooler.y + cooler.height + 4, scale: 0.16 },
  ];

  return [...social, ...SECONDARY_DRESSING, ...LOUNGE]
    .map((placement) => addAmbientProp(scene, placement));
}
