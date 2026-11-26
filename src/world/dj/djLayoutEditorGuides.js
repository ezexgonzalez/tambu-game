import { patioFriends, patioWomen } from '../../data/patioCharacters.js';
import { getPatioCollisionZones } from '../createPatioCollisions.js';
import { PATIO_LAYOUT } from '../patioLayout.js';
import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { djPlacementBounds } from './djLayoutComposition.js';

const { dj, house, terrain: { entry }, events: { bathroom } } = PATIO_LAYOUT;
const box = (x, y, width, height) => ({ x, y, width, height });
const solids = getPatioCollisionZones()
  .map(({ id, x, y, width, height }) => ({ id, ...box(x - width / 2, y - height / 2, width, height) }));
const houseFront = house.y + house.height;
const doorApproach = ({ x, width }) => box(x - 12, houseFront - 8, width + 24, 48);
const barBody = solids.find(({ id }) => id === 'bar-body');
const approaches = [
  { area: doorApproach(house.secondaryDoor), warning: 'Acceso a la casa' },
  { area: doorApproach(house.bathroom), warning: 'Acceso al baño' },
  { area: box(barBody.x, barBody.y + barBody.height, barBody.width, 48), warning: 'Frente de servicio de la barra' },
  { area: box(entry.x, entry.y, entry.width, entry.height), warning: 'Entrada al patio' },
];
const cast = [...patioFriends, ...patioWomen].map(({ x, y }) => box(x - 28, y - 66, 56, 114));
const danceCore = box(260, dj.y + 205, 175, 350);
const paths = [
  ...Object.values(bathroom.entryPaths).map((entry) => entry.concat(bathroom.commonPath)),
  ...Object.values(bathroom.returnPaths),
];
const segments = paths.flatMap((path) => path.slice(1).map((end, i) => [path[i], end]));
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y;

function crossesRoute(bounds) {
  const margin = bathroom.actorSpacing + 25;
  return segments.some(([start, end]) => {
    let first = 0, last = 1;
    for (const [pos, delta, low, high] of [
      [start.x, end.x - start.x, bounds.x - margin, bounds.x + bounds.width + margin],
      [start.y, end.y - start.y, bounds.y - margin, bounds.y + bounds.height + margin],
    ]) {
      if (!delta) {
        if (pos < low || pos > high) return false;
      } else {
        const a = (low - pos) / delta, b = (high - pos) / delta;
        first = Math.max(first, Math.min(a, b));
        last = Math.min(last, Math.max(a, b));
      }
    }
    return first <= last;
  });
}

export function drawDjLayoutGuides(graphics) {
  for (const [color, rects] of [
    [0xff968a, solids], [0x9bdeff, cast], [0xb5eb9a, [danceCore]],
    [0xe5b1ff, approaches.map(({ area }) => area)],
  ]) {
    graphics.lineStyle(1, color, 0.85);
    for (const { x, y, width, height } of rects) graphics.strokeRect(x, y, width, height);
  }
  graphics.lineStyle(1, 0xf5be85, 0.7);
  for (const [start, end] of segments) graphics.lineBetween(start.x, start.y, end.x, end.y);
}

export function getDjLayoutWarnings(placements) {
  const warnings = new Set();
  for (const item of placements) {
    if (!item.visible || item.crop) continue;
    const art = djPlacementBounds(item);
    const nearCast = cast.some((area) => overlaps(area, art));
    const nearPool = overlaps(PATIO_LAYOUT.pool, art);
    const nearRoute = crossesRoute(art);
    const blockingAccess = approaches.filter(({ area }) => overlaps(area, art));
    if (nearCast) warnings.add('Personaje o acceso');
    if (overlaps(danceCore, art)) warnings.add('Pista reservada');
    if (nearPool) warnings.add('Piscina');
    if (nearRoute) warnings.add('Ruta al baño');
    for (const { warning } of blockingAccess) warnings.add(warning);
    if (item.depthOffset && (nearCast || nearPool || nearRoute || blockingAccess.length)) {
      warnings.add('Profundidad manual en zona protegida');
    }

    const asset = assets[item.assetId], { colliderIntent } = asset;
    if (item.depthRule === 'feet' && Array.isArray(colliderIntent) && colliderIntent.length) {
      const rects = Array.isArray(colliderIntent[0]) ? colliderIntent : [colliderIntent];
      if (rects.some(([x, y, w, h]) => solids.some((area) => overlaps(area, box(
        item.x + x * item.scale, item.y + y * item.scale, w * item.scale, h * item.scale,
      ))))) warnings.add('Huella sobre estructura');
    }
    if (item.anchor === 'dj-left-speaker') {
      const [cx, cy] = asset.contactPx;
      const speaker = dj.speakers[0];
      const x = item.x + cx * item.scale, y = item.y + cy * item.scale;
      if (x < speaker.x || x > speaker.x + 10 || y < speaker.y || y >= speaker.y + speaker.height) {
        warnings.add('Revisá el anclaje al parlante');
      }
    }
  }
  return [...warnings];
}
