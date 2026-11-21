import test from 'node:test';
import assert from 'node:assert/strict';
import { djAssetLibrary, filterDjAssetLibrary } from '../src/world/dj/djEnvironmentCatalog.js';
import { createDjLayoutEditorState } from '../src/world/dj/djLayoutEditorState.js';
import { getDjPerimeterAlignment } from '../src/world/dj/djPerimeterAlignment.js';
import { DJ_PERIMETER_ASSETS as assets } from '../src/world/dj/djPerimeterAssets.js';

test('all 21 original perimeter pieces are placeable in the visual category and persist in JSON V2', () => {
  const state = createDjLayoutEditorState();
  const oldLayout = state.exportLayout();
  const cards = filterDjAssetLibrary(djAssetLibrary(), 'perimeter', '');
  assert.equal(cards.length, 21);
  assert.deepEqual(oldLayout.placements.filter(({ assetId }) => assetId in assets), []);
  for (const card of cards) {
    const id = state.add(card.source, 'lower-border-west', 500, 820);
    const item = state.getPlacements().find((p) => p.id === id);
    const asset = assets[item.assetId];
    assert.equal(card.path, asset.path);
    assert.equal(item.scale, 1);
    assert.deepEqual([item.x + asset.contactPx[0], item.y + asset.contactPx[1]], [500, 820]);
  }
  const copy = state.duplicate();
  state.adjustDepth(1);
  state.toggleVisibility();
  const exported = state.exportLayout();
  assert.equal(exported.instances.find(({ id }) => id === copy).depthOffset, 4);
  assert.equal(exported.instances.find(({ id }) => id === copy).visible, false);
  state.deleteSelection();
  state.undo();
  assert.deepEqual(state.exportLayout(), exported);
  state.importLayout(JSON.parse(JSON.stringify(exported)));
  assert.deepEqual(state.exportLayout(), exported);
  state.importLayout(oldLayout);
  assert.deepEqual(state.exportLayout(), oldLayout);
});

test('opt-in alignment meets compatible ports at the refined world edge, including the corners', () => {
  const piece = (id, assetId, x, y) => ({ id, assetId, x, y, visible: true });
  const left = piece('corner', 'PA17', 0, 888);
  const wall = piece('wall', 'PA02', 37, 926);
  assert.deepEqual(getDjPerimeterAlignment(wall, [left, wall]), [-5, 8]);
  const adjoining = { ...wall, x: 32, y: 934 };
  const next = piece('pillar', 'PA04', 93, 907);
  assert.deepEqual(getDjPerimeterAlignment(next, [adjoining]), [3, 1]);
  assert.deepEqual(getDjPerimeterAlignment(piece('right', 'PA18', 1647, 870), []), [1, 18]);
  assert.equal(getDjPerimeterAlignment(piece('side', 'PA19', 0, 856), [left]), null);
  for (const asset of Object.values(assets).filter((part) => part.perimeter.lowerEdge)) {
    assert.equal(960 - asset.height + asset.contactPx[1], 959);
  }
});
