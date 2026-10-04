const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;
const SPACE_WIDTH = 3;

export const PIXEL_GLYPHS = Object.freeze({
  '0': ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  '1': ['00110', '01110', '00110', '00110', '00110', '00110', '01111'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ':': ['00000', '00100', '00100', '00000', '00100', '00100', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '·': ['00000', '00000', '00000', '00100', '00000', '00000', '00000'],
  Á: ['00100', '01000', '01110', '10001', '11111', '10001', '10001'],
  Ó: ['00100', '01000', '01110', '10001', '10001', '10001', '01110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  Ñ: ['00110', '10001', '11001', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
});

function getLines(text) {
  return String(text).toUpperCase().split('\n');
}

function getCharacterWidth(character) {
  if (character === ' ') return SPACE_WIDTH;
  if (!PIXEL_GLYPHS[character]) throw new Error(`Unsupported pixel glyph: ${character}`);
  return GLYPH_WIDTH;
}

function getLineWidthCells(line, glyphGap) {
  if (!line.length) return 0;
  return [...line].reduce((width, character) => width + getCharacterWidth(character), 0)
    + (line.length - 1) * glyphGap;
}

export function measurePixelText(text, { cellSize = 14, glyphGap = 1, lineGap = 2 } = {}) {
  const lines = getLines(text);
  const lineWidths = lines.map((line) => getLineWidthCells(line, glyphGap));
  const widthCells = Math.max(0, ...lineWidths);
  const heightCells = lines.length * GLYPH_HEIGHT + Math.max(0, lines.length - 1) * lineGap;

  return {
    widthCells,
    heightCells,
    width: widthCells * cellSize,
    height: heightCells * cellSize,
  };
}

export function createPixelText(scene, text, {
  x,
  y,
  cellSize = 14,
  pixelInset = 2,
  glyphGap = 1,
  lineGap = 2,
  color = 0xffffff,
  depth = 0,
} = {}) {
  const lines = getLines(text);
  const metrics = measurePixelText(text, { cellSize, glyphGap, lineGap });
  const pixelSize = Math.max(1, cellSize - pixelInset * 2);
  const graphics = scene.add.graphics();

  graphics.fillStyle(color, 1);

  lines.forEach((line, lineIndex) => {
    const lineWidth = getLineWidthCells(line, glyphGap) * cellSize;
    let cursorX = -lineWidth / 2;
    const cursorY = -metrics.height / 2 + lineIndex * (GLYPH_HEIGHT + lineGap) * cellSize;

    for (const character of line) {
      const glyph = PIXEL_GLYPHS[character];
      if (glyph) {
        for (let row = 0; row < GLYPH_HEIGHT; row += 1) {
          for (let column = 0; column < GLYPH_WIDTH; column += 1) {
            if (glyph[row][column] !== '1') continue;
            graphics.fillRect(
              Math.round(cursorX + column * cellSize + pixelInset),
              Math.round(cursorY + row * cellSize + pixelInset),
              pixelSize,
              pixelSize,
            );
          }
        }
      }
      cursorX += (getCharacterWidth(character) + glyphGap) * cellSize;
    }
  });

  return graphics
    .setPosition(x, y)
    .setScrollFactor(0)
    .setDepth(depth);
}
