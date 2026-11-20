import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';

export function isDjEnvironmentPreviewEnabled(search = '') {
  return new URLSearchParams(search).get('djEnvPreview') === '1';
}

const GROUND_DEPTH = -16;
const LAYER_STEP = 0.01;

// Pack A's compact upper assembly. Offsets are PNG top-lefts, inclusive of transparent margins.
const sofaPosition = [34, 372];
const sofa = [
  ['F01a', -2, -2],
  ['F01d', -2, 94],
  ['F01e', -2, 126],
  ['F01c', 86, -2],
];
const tablePosition = [144, 473];
const planterFoot = [242, 489];

function atContact(id, [x, y], options = {}) {
  const { contactPx, scale } = assets[id];
  return { id, left: x - contactPx[0] * scale, top: y - contactPx[1] * scale, ...options };
}

function footDepth({ id, top }) {
  return top + assets[id].contactPx[1] * assets[id].scale;
}

export function getDjEnvironmentPreviewPlacements() {
  const table = { id: 'F04', left: tablePosition[0], top: tablePosition[1] };
  const planter = atContact('V06A', planterFoot);
  const pot = assets.V06A;
  return [
    atContact('F07', [136, 496], { depth: GROUND_DEPTH }),
    ...sofa.map(([id, x, y]) => ({ id, left: sofaPosition[0] + x, top: sofaPosition[1] + y })),
    table,
    // Pack D's F04 supports; the bottle sits behind the cup on the same table.
    atContact('C01', [table.left + 53, table.top + 18], { depth: footDepth(table) + LAYER_STEP }),
    atContact('C02', [table.left + 70, table.top + 31], { depth: footDepth(table) + 2 * LAYER_STEP }),
    planter,
    // Pack B V02A/V06A: socket (25,12), with 1 px root insertion behind the front lip.
    atContact('V02A', [planter.left + 25, planter.top + 13], { depth: planterFoot[1] + LAYER_STEP }),
    { ...planter, depth: planterFoot[1] + 2 * LAYER_STEP, crop: [0, 14, pot.width, pot.height - 14] },
    atContact('L01', [251, 535]),
  ];
}

export function preloadDjEnvironmentPreview(scene) {
  const ids = new Set(getDjEnvironmentPreviewPlacements().map(({ id }) => id));
  for (const id of ids) {
    const { key, path, reuse } = assets[id];
    // Deck preload already owns C01. Other textures survive scene restart.
    if (!reuse && !scene.textures.exists(key)) scene.load.image(key, path);
  }
}

export function createDjEnvironmentPreview(scene) {
  const images = getDjEnvironmentPreviewPlacements().map((placement) => {
    const { id, left, top, depth = footDepth(placement), crop } = placement;
    const { key, width, height, originPx: [ox, oy], scale } = assets[id];
    const image = scene.add.image(left + ox * scale, top + oy * scale, key)
      .setOrigin(ox / width, oy / height)
      .setScale(scale)
      .setDepth(depth);
    if (crop) image.setCrop(...crop);
    return image;
  });

  // Phaser destroys its display list at shutdown. The guard also makes cleanup
  // safe if the preview's shutdown callback runs before the display list.
  scene.events.once('shutdown', () => {
    for (const image of images) if (image.scene) image.destroy();
    images.length = 0;
  });
  return images;
}
