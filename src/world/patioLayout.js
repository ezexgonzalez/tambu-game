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
  x: 106,
  y: 212,
  width: 322,
  height: 126,
  booth: { offsetX: 26, offsetY: 2, width: 270, height: 122 },
  counter: { offsetX: 42, offsetY: 98, width: 238, height: 24 },
  label: { offsetX: 161, offsetY: 16 },
  speakers: [
    { x: 92, y: 225, width: 48, height: 94 },
    { x: 414, y: 225, width: 48, height: 94 },
  ],
};

export const PATIO_LAYOUT = {
  world: WORLD,
  house: HOUSE,
  terrain: {
    grass: { x: 0, y: 150, width: WORLD.width, height: WORLD.height - 150 },
    grassDetails: { startX: 32, startY: 294, stepX: 96, stepY: 80 },
    grassPatches: [
      { x: 70, y: 330, width: 360, height: 210, color: 0x173f2b, alpha: 0.16 },
      { x: 1150, y: 350, width: 430, height: 250, color: 0x285c34, alpha: 0.12 },
      { x: 190, y: 690, width: 460, height: 220, color: 0x2b6038, alpha: 0.1 },
      { x: 1030, y: 720, width: 500, height: 220, color: 0x143924, alpha: 0.14 },
    ],
    flowerClusters: [
      { x: 116, y: 548, color: 0xf08aa9 },
      { x: 310, y: 735, color: 0xffc966 },
      { x: 438, y: 410, color: 0xb693ff },
      { x: 1185, y: 760, color: 0x78cfff },
      { x: 1450, y: 610, color: 0xf08aa9 },
      { x: 1570, y: 835, color: 0xffc966 },
    ],
    deck: { x: 0, y: 150, width: WORLD.width, height: 120 },
    deckEdge: { x: 0, y: 254, width: WORLD.width, height: 16 },
    deckDetails: { startX: 64, y: 166, width: 48, height: 72, stepX: 160 },
    deckLights: [116, 350, 584, 818, 1052, 1286, 1520],
    entry: { x: 1456, y: 800, width: 96, height: 160, playerSpawnY: 890 },
  },
  pool: POOL,
  bar: BAR,
  dj: DJ,
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
    { x1: 76, y1: 378, x2: 910, y2: 378, sag: 4 },
    { x1: 1140, y1: 458, x2: 1590, y2: 446, sag: 3 },
  ],
  clutter: [
    [485, 350], [1090, 385], [1190, 740], [1280, 610], [410, 805], [1040, 830],
    [720, 790], [280, 500], [1560, 580], [850, 360], [200, 720], [1240, 450],
    [470, 755], [1180, 870], [840, 805], [1500, 860], [310, 870], [60, 700],
  ],
};
