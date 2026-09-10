import { getGrassGroundKey } from './grassLayout.js';

function addLayer(scene, items, depth) {
  return items.map(({
    asset,
    x,
    y,
    alpha = 1,
    scale = 1,
    flipX = false,
    flipY = false,
  }) => scene.add.image(x, y, asset)
    .setOrigin(0)
    .setDepth(depth)
    .setAlpha(alpha)
    .setScale(scale)
    .setFlipX(flipX)
    .setFlipY(flipY));
}

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const {
    bounds,
    tileSize,
    patches = [],
    clusters = [],
    decals = [],
  } = layout;
  const base = [];
  const columns = Math.ceil(bounds.width / tileSize);
  const rows = Math.ceil(bounds.height / tileSize);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      base.push(scene.add.image(
        bounds.x + column * tileSize,
        bounds.y + row * tileSize,
        getGrassGroundKey(column, row, layout),
      ).setOrigin(0).setDepth(depth));
    }
  }

  return {
    base,
    patches: addLayer(scene, patches, depth + 1),
    clusters: addLayer(scene, clusters, depth + 2),
    decals: addLayer(scene, decals, depth + 3),
  };
}
