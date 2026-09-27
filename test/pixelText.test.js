import test from 'node:test';
import assert from 'node:assert/strict';
import { createPixelText, measurePixelText, PIXEL_GLYPHS } from '../src/ui/pixelText.js';

test('pixel alphabet uses complete 5×7 binary glyphs', () => {
  assert.equal(Object.keys(PIXEL_GLYPHS).length, 26);
  for (const [letter, rows] of Object.entries(PIXEL_GLYPHS)) {
    assert.equal(rows.length, 7, `${letter} row count`);
    for (const row of rows) assert.match(row, /^[01]{5}$/, `${letter} glyph row`);
  }
});

test('pixel text uses centered square blocks on the same 14 px clock grid', () => {
  const graphics = {
    rectangles: [],
    fillStyle(...args) { this.color = args; return this; },
    fillRect(...args) { this.rectangles.push(args); return this; },
    setPosition(...args) { this.position = args; return this; },
    setScrollFactor(value) { this.scrollFactor = value; return this; },
    setDepth(value) { this.depth = value; return this; },
  };
  const scene = { add: { graphics: () => graphics } };

  const title = createPixelText(scene, 'A', {
    x: 640,
    y: 360,
    cellSize: 14,
    pixelInset: 2,
    color: 0xffffff,
    depth: 20001,
  });

  assert.equal(title, graphics);
  assert.deepEqual(graphics.position, [640, 360]);
  assert.equal(graphics.depth, 20001);
  assert.equal(graphics.scrollFactor, 0);
  assert.deepEqual(graphics.rectangles[0], [-19, -47, 10, 10]);
  assert.ok(graphics.rectangles.every(([, , width, height]) => width === 10 && height === 10));
  assert.deepEqual(measurePixelText('SOS UN HIJO\nDE PUTA'), {
    widthCells: 61,
    heightCells: 16,
    width: 854,
    height: 224,
  });
});
