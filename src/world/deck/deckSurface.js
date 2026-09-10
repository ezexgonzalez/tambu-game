const DECK_ASSET_ROOT = '/assets/tiles/deck';
const DECK_PROP_ASSET_ROOT = '/assets/props/deck';

const DECK_ASSETS = Object.freeze({
  base: Object.freeze({
    key: 'deck-base-01',
    path: `${DECK_ASSET_ROOT}/deck_base_01.png`,
  }),
  variant: Object.freeze({
    key: 'deck-base-02',
    path: `${DECK_ASSET_ROOT}/deck_base_02.png`,
  }),
  edgeBottom: Object.freeze({
    key: 'deck-edge-bottom',
    path: `${DECK_ASSET_ROOT}/deck_edge_bottom.png`,
  }),
  transition: Object.freeze({
    key: 'deck-transition',
    path: `${DECK_ASSET_ROOT}/deck_transition.png`,
  }),
});

const DECK_PROP_ASSETS = Object.freeze({
  planterTerracotta: Object.freeze({
    key: 'deck-planter-terracotta',
    path: `${DECK_PROP_ASSET_ROOT}/planter_terracotta.png`,
  }),
  planterDark: Object.freeze({
    key: 'deck-planter-dark',
    path: `${DECK_PROP_ASSET_ROOT}/planter_dark.png`,
  }),
  doormat: Object.freeze({
    key: 'deck-doormat',
    path: `${DECK_PROP_ASSET_ROOT}/doormat.png`,
  }),
  lantern: Object.freeze({
    key: 'deck-lantern',
    path: `${DECK_PROP_ASSET_ROOT}/lantern.png`,
  }),
  bottle: Object.freeze({
    key: 'deck-bottle',
    path: `${DECK_PROP_ASSET_ROOT}/bottle.png`,
  }),
  glass: Object.freeze({
    key: 'deck-glass',
    path: `${DECK_PROP_ASSET_ROOT}/glass.png`,
  }),
  stool: Object.freeze({
    key: 'deck-stool',
    path: `${DECK_PROP_ASSET_ROOT}/stool.png`,
  }),
});

const DECK_VARIANT_PLANKS = Object.freeze([
  Object.freeze({ x: 158, y: 174, width: 182, height: 11 }),
  Object.freeze({ x: 426, y: 222, width: 126, height: 12 }),
  Object.freeze({ x: 684, y: 198, width: 206, height: 11 }),
  Object.freeze({ x: 1016, y: 162, width: 142, height: 11 }),
  Object.freeze({ x: 1282, y: 210, width: 222, height: 12 }),
  Object.freeze({ x: 1530, y: 186, width: 118, height: 11 }),
]);

const DECK_PROPS = Object.freeze([
  Object.freeze({ key: DECK_PROP_ASSETS.doormat.key, x: 916, y: 154, originX: 0.5, originY: 0 }),
  Object.freeze({ key: DECK_PROP_ASSETS.planterDark.key, x: 982, y: 195, originX: 0.5, originY: 1 }),
  Object.freeze({ key: DECK_PROP_ASSETS.lantern.key, x: 484, y: 244, originX: 0.5, originY: 1 }),
  Object.freeze({ key: DECK_PROP_ASSETS.stool.key, x: 1174, y: 242, originX: 0.5, originY: 1 }),
  Object.freeze({ key: DECK_PROP_ASSETS.bottle.key, x: 1200, y: 243, originX: 0.5, originY: 1 }),
]);

export function preloadDeckSurface(scene) {
  [...Object.values(DECK_ASSETS), ...Object.values(DECK_PROP_ASSETS)]
    .forEach(({ key, path }) => scene.load.image(key, path));
}

function createDeckLights(scene, deck, deckLights) {
  const lights = scene.add.graphics().setDepth(-18);
  const fixtureY = deck.y + deck.height - 11;

  deckLights.forEach((x) => {
    lights.fillStyle(0xffc968, 0.07);
    lights.fillCircle(x, fixtureY, 18);
    lights.fillStyle(0xffd981, 0.16);
    lights.fillCircle(x, fixtureY, 9);
    lights.fillStyle(0xffe2a0, 1);
    lights.fillRect(x - 5, fixtureY - 2, 10, 4);
    lights.fillStyle(0x9c6333, 1);
    lights.fillRect(x - 6, fixtureY + 2, 12, 2);
  });
}

function createDeckProps(scene) {
  return DECK_PROPS.map(({ key, x, y, originX, originY }) => (
    scene.add.image(x, y, key)
      .setOrigin(originX, originY)
      .setDepth(3)
  ));
}

export function createDeckSurface(scene, { deck, deckEdge, deckLights }) {
  const surfaceHeight = deckEdge.y - deck.y;

  scene.add.tileSprite(
    deck.x,
    deck.y,
    deck.width,
    surfaceHeight,
    DECK_ASSETS.base.key,
  ).setOrigin(0).setDepth(-24);

  DECK_VARIANT_PLANKS.forEach(({ x, y, width, height }) => {
    const plank = scene.add.tileSprite(x, y, width, height, DECK_ASSETS.variant.key)
      .setOrigin(0)
      .setDepth(-23);
    plank.tilePositionX = x - deck.x;
    plank.tilePositionY = y - deck.y;
  });

  scene.add.tileSprite(
    deckEdge.x,
    deckEdge.y - 4,
    deckEdge.width,
    20,
    DECK_ASSETS.edgeBottom.key,
  ).setOrigin(0).setDepth(-21);

  scene.add.tileSprite(
    deck.x,
    deck.y + deck.height - 2,
    deck.width,
    9,
    DECK_ASSETS.transition.key,
  ).setOrigin(0).setDepth(-22).setAlpha(0.32);

  createDeckLights(scene, deck, deckLights);
  createDeckProps(scene);
}
