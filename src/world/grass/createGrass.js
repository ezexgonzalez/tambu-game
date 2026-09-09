function addLayer(scene, items, depth) {
  return items.map(({ asset, x, y, alpha = 1, scale = 1 }) => scene.add.image(x, y, asset)
    .setOrigin(0)
    .setDepth(depth)
    .setAlpha(alpha)
    .setScale(scale));
}

function addGroundRegion(scene, bounds, { asset, points }, depth) {
  const texture = scene.add.tileSprite(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    asset,
  ).setOrigin(0).setDepth(depth);

  const maskShape = scene.make.graphics({ add: false });
  maskShape.fillStyle(0xffffff, 1);
  maskShape.beginPath();
  points.forEach(({ x, y }, index) => {
    if (index === 0) maskShape.moveTo(x, y);
    else maskShape.lineTo(x, y);
  });
  maskShape.closePath();
  maskShape.fillPath();
  texture.setMask(maskShape.createGeometryMask());

  return { texture, maskShape };
}

export function createGrass(scene, layout, { depth = -40 } = {}) {
  const { bounds, base, macro } = layout;
  const baseLayers = base.map((region) => addGroundRegion(scene, bounds, region, depth));

  return {
    base: baseLayers,
    macro: addLayer(scene, macro, depth + 1),
  };
}
