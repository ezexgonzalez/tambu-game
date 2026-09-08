import { getGrassBaseKey } from './grassLayout.js';

function addLayer(scene, items, depth) {
  return items.map(({ asset, x, y, alpha = 1 }) => scene.add.image(x, y, asset)
    .setOrigin(0)
    .setDepth(depth)
    .setAlpha(alpha));
}

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const { bounds, tileSize, seed, micro, macro, clusters, accents } = layout;
  const base = [];
  const columns = Math.ceil(bounds.width / tileSize);
  const rows = Math.ceil(bounds.height / tileSize);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      base.push(scene.add.image(
        bounds.x + column * tileSize,
        bounds.y + row * tileSize,
        getGrassBaseKey(column, row, seed),
      ).setOrigin(0).setDepth(depth));
    }
  }

  return {
    base,
    micro: addLayer(scene, micro, depth + 1),
    macro: addLayer(scene, macro, depth + 2),
    clusters: addLayer(scene, clusters, depth + 3),
    accents: addLayer(scene, accents, depth + 4),
  };
}
