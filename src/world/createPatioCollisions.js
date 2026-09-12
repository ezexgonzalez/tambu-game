import { PATIO_LAYOUT } from './patioLayout.js';

function centeredZone({ x, y, width, height }) {
  return {
    x: x + width / 2,
    y: y + height / 2,
    width,
    height,
  };
}

function localRectZone(parent, rect) {
  return {
    id: `dj-${rect.id}`,
    x: parent.x + rect.x + rect.width / 2,
    y: parent.y + rect.y + rect.height / 2,
    width: rect.width,
    height: rect.height,
  };
}

export function getPatioCollisionZones() {
  const { house, pool, bar, dj, partyTables, cooler } = PATIO_LAYOUT;

  return [
    centeredZone(house),
    centeredZone(pool),
    ...bar.collisionRects.map((rect) => localRectZone(bar, rect)),
    ...dj.collisionRects.map((rect) => localRectZone(dj, rect)),
    ...partyTables.map((table) => ({
      x: table.x,
      y: table.y + table.colliderCenterOffsetY,
      width: table.colliderWidth,
      height: table.colliderHeight,
    })),
    {
      x: cooler.x + cooler.colliderCenterOffsetX,
      y: cooler.y + cooler.colliderCenterOffsetY,
      width: cooler.colliderWidth,
      height: cooler.colliderHeight,
    },
  ];
}

export function createPatioCollisions(scene, player) {
  return getPatioCollisionZones().map(({ x, y, width, height }) => {
    const zone = scene.add.rectangle(x, y, width, height, 0xff0000, 0);
    scene.physics.add.existing(zone, true);
    scene.physics.add.collider(player, zone);
    return zone;
  });
}
