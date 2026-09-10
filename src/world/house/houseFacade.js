const HOUSE_ASSETS = Object.freeze({
  wallBase: Object.freeze({
    key: 'house-wall-base',
    path: '/assets/tiles/house/wall_base.png',
  }),
  wallBand: Object.freeze({
    key: 'house-wall-band',
    path: '/assets/tiles/house/wall_band.png',
  }),
  windowWarm: Object.freeze({
    key: 'house-window-warm',
    path: '/assets/tiles/house/window_warm.png',
  }),
  windowDim: Object.freeze({
    key: 'house-window-dim',
    path: '/assets/tiles/house/window_dim.png',
  }),
  doorHouse: Object.freeze({
    key: 'house-door',
    path: '/assets/tiles/house/door_house.png',
  }),
  doorBathroom: Object.freeze({
    key: 'house-door-bathroom',
    path: '/assets/tiles/house/door_bathroom.png',
  }),
  wallLamp: Object.freeze({
    key: 'house-wall-lamp',
    path: '/assets/tiles/house/wall_lamp.png',
  }),
  planter: Object.freeze({
    key: 'house-planter',
    path: '/assets/tiles/house/planter.png',
  }),
});

export function preloadHouseFacade(scene) {
  Object.values(HOUSE_ASSETS).forEach(({ key, path }) => scene.load.image(key, path));
}

function createWindow(scene, window) {
  const key = window.warm ? HOUSE_ASSETS.windowWarm.key : HOUSE_ASSETS.windowDim.key;

  scene.add.image(
    window.x + window.width / 2,
    window.y + window.height / 2,
    key,
  ).setDepth(1);
}

function createHouseDoor(scene, door, floorY) {
  scene.add.image(
    door.x + door.width / 2,
    floorY,
    HOUSE_ASSETS.doorHouse.key,
  ).setOrigin(0.5, 1).setDepth(1);
}

function createBathroomDoor(scene, bathroom, floorY) {
  const centerX = bathroom.x + bathroom.width / 2;

  const door = scene.add.image(centerX, floorY, HOUSE_ASSETS.doorBathroom.key)
    .setOrigin(0.5, 1)
    .setDepth(1);

  scene.add.text(centerX, floorY - door.height + 12, 'BAÑO', {
    fontFamily: 'monospace',
    fontSize: '8px',
    color: '#171a20',
    fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(2);
}

function createWallPlanters(scene, wallPlanters) {
  wallPlanters.forEach(({ x, y, width }) => {
    scene.add.image(x + width / 2, y - 35, HOUSE_ASSETS.planter.key)
      .setOrigin(0.5, 0)
      .setDepth(2);
  });
}

export function createHouseFacade(scene, { house, wallPlanters }) {
  const floorY = house.y + house.height;

  scene.add.tileSprite(
    house.x,
    house.y,
    house.width,
    house.height,
    HOUSE_ASSETS.wallBase.key,
  ).setOrigin(0).setDepth(0);

  scene.add.tileSprite(
    house.x,
    house.bottomBand.y,
    house.width,
    house.bottomBand.height,
    HOUSE_ASSETS.wallBand.key,
  ).setOrigin(0).setDepth(1);

  house.windows.forEach((window) => createWindow(scene, window));
  createHouseDoor(scene, house.secondaryDoor, floorY);
  createBathroomDoor(scene, house.bathroom, floorY);

  house.lamps.forEach(({ x, y }) => {
    scene.add.image(x + 7, y - 8, HOUSE_ASSETS.wallLamp.key)
      .setOrigin(0.5, 0)
      .setDepth(2);
  });

  createWallPlanters(scene, wallPlanters);
}
