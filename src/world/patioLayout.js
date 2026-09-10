const WORLD = {
  x: 0,
  y: 0,
  width: 1680,
  height: 960,
};

const HOUSE = {
  x: 0,
  y: 0,
  width: WORLD.width,
  height: 150,
  topBandHeight: 18,
  middleBand: { y: 122, height: 16 },
  bottomBand: { y: 138, height: 12 },
  verticalCuts: [180, 440, 700, 960],
  windows: [
    { x: 36, y: 28, width: 150, height: 54, warm: true, silhouettes: 2 },
    { x: 240, y: 28, width: 162, height: 54, warm: false, silhouettes: 0 },
    { x: 470, y: 28, width: 162, height: 54, warm: true, silhouettes: 3 },
    { x: 680, y: 28, width: 162, height: 54, warm: false, silhouettes: 1 },
  ],
  secondaryDoor: { x: 880, y: 18, width: 72, height: 102 },
  bathroom: { x: 1288, y: 10, width: 110, height: 122 },
  lamps: [
    { x: 855, y: 44 },
    { x: 1276, y: 44 },
  ],
};

const POOL = {
  x: 512,
  y: 432,
  width: 624,
  height: 304,
  internalLights: [0.12, 0.34, 0.56, 0.78],
};

const BAR = {
  x: 1226,
  y: 180,
  width: 320,
  height: 156,
  body: { offsetX: 10, offsetY: 2, width: 300, height: 152 },
  counter: { offsetX: 0, offsetY: 127, width: 320, height: 28 },
  inset: { offsetX: 30, offsetY: 26, width: 260, height: 38 },
  label: { offsetX: 160, offsetY: 16 },
  bottles: {
    offsetX: 42,
    offsetY: 82,
    columns: 8,
    count: 16,
    columnGap: 30,
    rowGap: 28,
    width: 8,
    height: 19,
  },
};

const DJ = {
  x: 116,
  y: 202,
  width: 302,
  height: 120,
  speakers: [
    { x: 110, y: 231, width: 42, height: 80 },
    { x: 382, y: 231, width: 42, height: 80 },
  ],
  colliders: [
    { x: 267, y: 290, width: 212, height: 40 },
    { x: 131, y: 270, width: 38, height: 68 },
    { x: 403, y: 270, width: 38, height: 68 },
    { x: 173, y: 234, width: 24, height: 64 },
    { x: 361, y: 234, width: 24, height: 64 },
    { x: 267, y: 258, width: 174, height: 18 },
    { x: 267, y: 311, width: 246, height: 16 },
  ],
};

const BATHROOM_EVENT = {
  speed: 460,
  actorSpacing: 14,
  path: [
    { x: POOL.x - 48, y: POOL.y + POOL.height + 60 },
    { x: POOL.x + POOL.width + 112, y: POOL.y + POOL.height + 60 },
    { x: POOL.x + POOL.width + 112, y: POOL.y - 48 },
    { x: POOL.x + POOL.width + 52, y: POOL.y - 48 },
    { x: POOL.x + POOL.width + 52, y: HOUSE.height + 20 },
    {
      x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2,
      y: HOUSE.height + 20,
    },
    {
      x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2,
      y: HOUSE.height - 8,
    },
  ],
  exit: {
    x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2,
    y: HOUSE.height + 32,
  },
};

export const PATIO_LAYOUT = {
  world: WORLD,
  house: HOUSE,
  terrain: {
    grass: { x: 0, y: 150, width: WORLD.width, height: WORLD.height - 150 },
    deck: { x: 0, y: 150, width: WORLD.width, height: 120 },
    deckEdge: { x: 0, y: 254, width: WORLD.width, height: 16 },
    deckLights: [116, 350, 584, 818, 1052, 1286, 1520],
    entry: { x: 1456, y: 800, width: 96, height: 160, playerSpawnY: 890 },
  },
  pool: POOL,
  bar: BAR,
  dj: DJ,
  events: {
    bathroom: BATHROOM_EVENT,
  },
  partyTables: [
    { x: 1178, y: 530, colliderCenterOffsetY: 28, colliderWidth: 72, colliderHeight: 80 },
    { x: 360, y: 565, colliderCenterOffsetY: 27, colliderWidth: 72, colliderHeight: 80 },
  ],
  cooler: {
    x: 1326,
    y: 502,
    width: 58,
    height: 38,
    colliderCenterOffsetX: 28,
    colliderCenterOffsetY: 19,
    colliderWidth: 68,
    colliderHeight: 50,
  },
  plants: [
    { x: 70, y: 430 },
    { x: 1600, y: 470 },
    { x: 1160, y: 825 },
  ],
  garlands: [
    { x1: 76, y1: 378, x2: 910, y2: 378, sag: 22, poleHeight: 58 },
    { x1: 1140, y1: 458, x2: 1590, y2: 446, sag: 18, poleHeight: 62 },
  ],
  wallPlanters: [
    { x: 58, y: 104, width: 112 },
    { x: 494, y: 104, width: 112 },
    { x: 1032, y: 105, width: 124 },
    { x: 1462, y: 105, width: 118 },
  ],
  edgeGardens: [
    { x: 18, y: 930, width: 340, height: 30 },
    { x: 590, y: 934, width: 350, height: 26 },
    { x: 1010, y: 932, width: 350, height: 28 },
  ],
  edgeShrubs: [
    { x: 20, y: 520 }, { x: 24, y: 790 },
    { x: 1658, y: 430 }, { x: 1656, y: 650 },
  ],
  patioLanterns: [
    { x: 64, y: 666 },
    { x: 430, y: 900 },
    { x: 1160, y: 900 },
    { x: 1604, y: 780 },
  ],
  clutter: [
    [485, 350], [1090, 385], [1190, 740], [1280, 610], [410, 805], [1040, 830],
    [720, 790], [280, 500], [1560, 580], [850, 360], [200, 720], [1240, 450],
    [470, 755], [1180, 870], [840, 805], [1500, 860], [310, 870], [60, 700],
  ],
};
