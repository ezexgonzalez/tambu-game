function addLayer(scene, items, depth) {
  return items.map(({ asset, x, y, alpha = 1, scale = 1 }) => scene.add.image(x, y, asset)
    .setOrigin(0)
    .setDepth(depth)
    .setAlpha(alpha)
    .setScale(scale));
}

function getPolygonBounds(points) {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const left = Math.floor(Math.min(...xs));
  const top = Math.floor(Math.min(...ys));

  return {
    x: left,
    y: top,
    width: Math.max(1, Math.ceil(Math.max(...xs)) - left),
    height: Math.max(1, Math.ceil(Math.max(...ys)) - top),
  };
}

function createStaticPolygonMask(scene, points, region) {
  const maskShape = scene.make.graphics({ x: 0, y: 0, add: false });

  maskShape.fillStyle(0xffffff, 1);
  maskShape.beginPath();
  points.forEach(({ x, y }, index) => {
    const localX = x - region.x;
    const localY = y - region.y;

    if (index === 0) maskShape.moveTo(localX, localY);
    else maskShape.lineTo(localX, localY);
  });
  maskShape.closePath();
  maskShape.fillPath();

  return maskShape;
}

function addGroundRegion(scene, bounds, { asset, points, full = false }, depth) {
  if (full) {
    return scene.add.tileSprite(
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      asset,
    ).setOrigin(0).setDepth(depth);
  }

  const region = getPolygonBounds(points);
  const texture = scene.add.tileSprite(
    region.x,
    region.y,
    region.width,
    region.height,
    asset,
  ).setOrigin(0).setDepth(depth);

  const maskShape = createStaticPolygonMask(scene, points, region);
  texture.enableFilters();
  const mask = texture.filters.internal.addMask(maskShape, false, undefined, 'local');
  mask.autoUpdate = false;

  return { texture, maskShape, mask };
}

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const { bounds, base, macro } = layout;
  const baseLayers = base.map((region) => addGroundRegion(scene, bounds, region, depth));

  return {
    base: baseLayers,
    macro: addLayer(scene, macro, depth + 1),
  };
}
