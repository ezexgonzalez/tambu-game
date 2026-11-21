import { PATIO_LAYOUT } from '../patioLayout.js';
import { DJ_PERIMETER_ASSETS as assets } from './djPerimeterAssets.js';

export function getDjPerimeterAlignment(part, placements) {
  const asset = assets[part.assetId];
  if (!asset?.perimeter.lowerEdge) return null;
  const world = PATIO_LAYOUT.world;
  const bottom = world.y + world.height;
  const y = bottom - asset.height;
  const minX = world.x, maxX = world.x + world.width - asset.width;
  const candidates = [];
  for (const other of placements) {
    const neighbor = assets[other.assetId];
    if (other.id === part.id || !other.visible || !neighbor?.perimeter.lowerEdge
      || other.y + neighbor.height !== bottom) continue;
    for (const [side, opposite] of [['W', 'E'], ['E', 'W']]) {
      const port = asset.perimeter.ports[side], joint = neighbor.perimeter.ports[opposite];
      if (!port || !joint || port.class !== joint.class
        || !port.yRangePx.every((row, i) => y + row === other.y + joint.yRangePx[i])) continue;
      const x = other.x + joint.x - port.x;
      if (x >= minX && x <= maxX && Math.abs(x - part.x) <= 8) candidates.push(x);
    }
  }
  candidates.sort((a, b) => Math.abs(a - part.x) - Math.abs(b - part.x) || a - b);
  const x = candidates[0] ?? Math.min(maxX, Math.max(minX, minX + 8 * Math.round((part.x - minX) / 8)));
  return [x - part.x, y - part.y];
}
