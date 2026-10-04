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
  internalLights: [0.16, 0.47, 0.76],
};

const BAR = {
  // Visual assembly anchor. The sign is aerial; the whole furniture body is a solid footprint.
  x: 1254,
  y: 194,
  width: 264,
  height: 246,
  scale: 0.85,
  collisionRects: [
    // The modular front ends at y=220 relative to the bar anchor; retain a small grounded margin.
    { id: 'body', x: 0, y: 6, width: 264, height: 220 },
  ],
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
  // Top-left rectangles local to the DJ area. They model only grounded solid footprints.
  collisionRects: [
    { id: 'front', x: 26, y: 58, width: 250, height: 56 },
    { id: 'speaker-left', x: -4, y: 88, width: 38, height: 20 },
    { id: 'speaker-right', x: 266, y: 88, width: 38, height: 20 },
    { id: 'support-left', x: 37, y: 59, width: 32, height: 14 },
    { id: 'support-right', x: 225, y: 59, width: 32, height: 14 },
  ],
};

const BATHROOM_EVENT = {
  speed: 160,
  actorSpacing: 14,
  entryPaths: {
    sofi: [
      { x: 400, y: 690 },
      { x: 470, y: 775 },
      { x: 1160, y: 775 },
      { x: 1250, y: 660 },
      { x: 1250, y: 470 },
      { x: 1216, y: 440 },
      { x: 1216, y: 155, formation: 'lateral' },
    ],
    mili: [
      { x: 930, y: 330 },
      { x: 1216, y: 155, formation: 'lateral' },
    ],
    cami: [
      { x: 1270, y: 635 },
      { x: 1265, y: 460 },
      { x: 1216, y: 440 },
      { x: 1216, y: 155, formation: 'lateral' },
    ],
  },
  // The gap between house and bar needs horizontal spacing even on the final eastbound segment.
  commonPath: [
    { x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2, y: 155, formation: 'lateral' },
    { x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2, y: HOUSE.height - 8, formation: 'lateral' },
  ],
  // Temporary return anchors are the current social spawns, not a roaming design.
  returnPaths: {
    sofi: [
      { x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2, y: 155 },
      { x: 1216, y: 155 },
      { x: 1216, y: 440 },
      { x: 1250, y: 470 },
      { x: 1250, y: 660 },
      { x: 1160, y: 775 },
      { x: 470, y: 775 },
      { x: 400, y: 690 },
    ],
    mili: [
      { x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2, y: 155 },
      { x: 1216, y: 155 },
      { x: 930, y: 330 },
    ],
    cami: [
      { x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2, y: 155 },
      { x: 1216, y: 155 },
      { x: 1216, y: 440 },
      { x: 1265, y: 460 },
      { x: 1270, y: 635 },
      { x: 1235, y: 635 },
    ],
  },
  safeExit: {
    x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2 - 18,
    y: HOUSE.height + 12,
  },
  companionSafeExit: {
    x: HOUSE.bathroom.x + HOUSE.bathroom.width / 2 + 18,
    y: HOUSE.height + 8,
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
  wallPlanters: [
    { x: 58, y: 104, width: 112 },
    { x: 494, y: 104, width: 112 },
    { x: 1032, y: 105, width: 124 },
    { x: 1462, y: 105, width: 118 },
  ],
};
