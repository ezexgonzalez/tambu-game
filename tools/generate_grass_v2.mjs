import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'public/assets/tiles/grass');

const C = {
  deep: '#21432D',
  dark: '#294F34',
  base: '#2F5A38',
  mid: '#3B673F',
  light: '#487348',
  dryDark: '#4F5638',
  dry: '#697047',
  dryLight: '#7B7E4B',
  soil: '#5D5138',
  soilLight: '#75623F',
  white: '#E8E6C6',
  pink: '#C8778D',
};

function hex(value) {
  const clean = value.slice(1);
  return [0, 2, 4].map((offset) => Number.parseInt(clean.slice(offset, offset + 2), 16));
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    pixels.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

class PixelArt {
  constructor(width, height, background = null) {
    this.width = width;
    this.height = height;
    this.pixels = Buffer.alloc(width * height * 4);
    if (background) this.fill(background);
  }

  fill(color, alpha = 255) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) this.pixel(x, y, color, alpha);
    }
    return this;
  }

  pixel(x, y, color, alpha = 255) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return this;
    const index = (y * this.width + x) * 4;
    const [r, g, b] = hex(color);
    this.pixels[index] = r;
    this.pixels[index + 1] = g;
    this.pixels[index + 2] = b;
    this.pixels[index + 3] = alpha;
    return this;
  }

  pixelsAt(points, color, alpha = 255) {
    points.forEach(([x, y]) => this.pixel(x, y, color, alpha));
    return this;
  }

  block(x, y, width, height, color, alpha = 255) {
    for (let row = y; row < y + height; row += 1) {
      for (let column = x; column < x + width; column += 1) this.pixel(column, row, color, alpha);
    }
    return this;
  }

  spans(rows, color, alpha = 255) {
    rows.forEach(([y, x1, x2]) => this.block(x1, y, x2 - x1 + 1, 1, color, alpha));
    return this;
  }

  save(path) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, encodePng(this.width, this.height, this.pixels));
  }
}

function tuft(art, x, y, colors = [C.dark, C.mid, C.light], mirrored = false) {
  const shape = [
    [0, 7], [1, 6], [1, 7], [2, 5], [2, 6], [2, 7], [3, 3], [3, 4], [3, 5], [3, 6],
    [3, 7], [4, 5], [4, 6], [4, 7], [5, 6], [5, 7], [6, 5], [6, 6], [6, 7], [7, 6], [7, 7],
  ];
  shape.forEach(([px, py]) => art.pixel(x + (mirrored ? 7 - px : px), y + py, colors[0]));
  [[3, 2], [2, 4], [5, 5], [6, 4]].forEach(([px, py]) => art.pixel(x + (mirrored ? 7 - px : px), y + py, colors[1]));
  [[3, 1], [5, 4]].forEach(([px, py]) => art.pixel(x + (mirrored ? 7 - px : px), y + py, colors[2]));
  return art;
}

function base01() {
  const art = new PixelArt(16, 16, C.base);
  art.pixelsAt([[2, 11], [3, 10], [3, 11], [4, 11], [11, 4], [12, 4], [12, 5], [13, 5]], C.dark, 185);
  art.pixelsAt([[4, 10], [12, 4]], C.mid, 150);
  return art;
}

function base02() {
  const art = new PixelArt(16, 16, C.base);
  art.spans([[4, 9, 11], [5, 8, 12], [6, 9, 13], [7, 10, 12]], C.dark, 180);
  art.pixelsAt([[10, 3], [10, 4], [12, 5], [2, 12], [3, 12], [3, 13]], C.dark, 170);
  art.pixelsAt([[11, 4], [12, 6], [4, 12]], C.mid, 150);
  return art;
}

function base03() {
  const art = new PixelArt(16, 16, C.base);
  art.spans([[8, 2, 5], [9, 2, 6], [10, 3, 6], [11, 4, 5]], C.mid, 185);
  art.pixelsAt([[3, 7], [4, 6], [4, 7], [5, 7], [11, 12], [12, 11], [12, 12]], C.dark, 170);
  art.pixelsAt([[4, 6], [5, 7], [6, 9]], C.light, 155);
  return art;
}

function dense01() {
  const art = new PixelArt(32, 32);
  tuft(art, 0, 15, [C.deep, C.dark, C.mid]);
  tuft(art, 5, 10, [C.dark, C.mid, C.light], true);
  tuft(art, 11, 17, [C.deep, C.dark, C.mid]);
  tuft(art, 16, 9, [C.dark, C.mid, C.light]);
  tuft(art, 22, 15, [C.deep, C.dark, C.mid], true);
  art.spans([[25, 1, 8], [26, 0, 17], [27, 0, 26], [28, 0, 31], [29, 2, 31], [30, 7, 30]], C.deep, 185);
  art.pixelsAt([[3, 17], [10, 13], [15, 20], [21, 12], [28, 18]], C.light);
  return art;
}

function dense02() {
  const art = new PixelArt(32, 32);
  tuft(art, 0, 12, [C.deep, C.dark, C.mid], true);
  tuft(art, 6, 17, [C.dark, C.mid, C.light]);
  tuft(art, 11, 8, [C.deep, C.dark, C.mid]);
  tuft(art, 17, 15, [C.dark, C.mid, C.light], true);
  tuft(art, 24, 10, [C.deep, C.dark, C.mid]);
  art.spans([[25, 2, 9], [26, 0, 17], [27, 0, 24], [28, 0, 31], [29, 1, 31], [30, 7, 30]], C.deep, 185);
  art.pixelsAt([[2, 16], [9, 21], [15, 12], [20, 19], [29, 15]], C.light);
  return art;
}

function lively01() {
  const art = new PixelArt(32, 32);
  tuft(art, 2, 15, [C.dark, C.mid, C.light]);
  tuft(art, 8, 11, [C.dark, C.mid, C.light], true);
  tuft(art, 15, 16, [C.dark, C.mid, C.light]);
  tuft(art, 22, 12, [C.dark, C.mid, C.light], true);
  art.pixelsAt([[6, 16], [13, 12], [17, 18], [25, 14], [27, 17]], C.light);
  return art;
}

function macroDark01() {
  const art = new PixelArt(64, 64);
  art.spans([
    [19, 23, 42], [20, 17, 49], [21, 12, 53], [22, 9, 56], [23, 6, 59], [24, 4, 60],
    [25, 3, 61], [26, 1, 62], [27, 0, 63], [28, 0, 63], [29, 0, 63], [30, 0, 63],
    [31, 0, 63], [32, 0, 63], [33, 0, 63], [34, 2, 61], [35, 4, 59], [36, 7, 56],
    [37, 12, 52], [38, 19, 47], [39, 26, 41],
  ], C.dark, 58);
  art.spans([[23, 14, 22], [24, 10, 29], [25, 8, 33], [26, 7, 36], [27, 8, 40], [28, 10, 44], [29, 15, 48]], C.deep, 35);
  return art;
}

function macroDark02() {
  const art = new PixelArt(64, 64);
  art.spans([
    [8, 30, 39], [9, 24, 46], [10, 20, 52], [11, 17, 57], [12, 14, 60], [13, 11, 62],
    [14, 9, 63], [15, 8, 63], [16, 6, 63], [17, 4, 63], [18, 3, 63], [19, 3, 63],
    [20, 3, 61], [21, 5, 59], [22, 7, 56], [23, 10, 52], [24, 14, 47], [25, 20, 41],
    [26, 27, 36], [27, 30, 32],
  ], C.deep, 52);
  art.spans([[13, 24, 34], [14, 21, 39], [15, 19, 44], [16, 17, 48], [17, 18, 51]], C.dark, 40);
  return art;
}

function macroSoft01() {
  const art = new PixelArt(64, 64);
  art.spans([
    [24, 16, 32], [25, 11, 39], [26, 7, 45], [27, 4, 51], [28, 2, 55], [29, 1, 58],
    [30, 0, 60], [31, 0, 62], [32, 0, 63], [33, 0, 63], [34, 2, 61], [35, 5, 57],
    [36, 10, 51], [37, 16, 45], [38, 23, 38],
  ], C.mid, 42);
  art.spans([[30, 9, 21], [31, 6, 27], [32, 5, 32], [33, 7, 36]], C.light, 28);
  return art;
}

function worn01() {
  const art = new PixelArt(32, 32);
  art.spans([[9, 12, 18], [10, 8, 22], [11, 5, 25], [12, 4, 27], [13, 5, 28], [14, 7, 27], [15, 6, 24], [16, 8, 22], [17, 11, 19]], C.dryDark, 210);
  art.spans([[11, 10, 19], [12, 7, 23], [13, 8, 25], [14, 10, 24], [15, 10, 21]], C.soil, 210);
  art.pixelsAt([[8, 11], [13, 12], [19, 11], [24, 13], [16, 16]], C.dryLight, 225);
  art.pixelsAt([[3, 13], [5, 14], [27, 10], [29, 11]], C.mid, 190);
  return art;
}

function worn02() {
  const art = new PixelArt(48, 32);
  art.spans([[8, 20, 27], [9, 14, 34], [10, 10, 38], [11, 8, 41], [12, 9, 43], [13, 7, 44], [14, 9, 42], [15, 12, 39], [16, 13, 35], [17, 17, 32], [18, 21, 29]], C.dryDark, 205);
  art.spans([[10, 16, 33], [11, 12, 38], [12, 12, 40], [13, 11, 40], [14, 13, 38], [15, 16, 35], [16, 20, 31]], C.soil, 205);
  art.pixelsAt([[13, 14], [18, 11], [25, 12], [33, 13], [38, 14], [27, 17]], C.dryLight, 225);
  art.pixelsAt([[7, 12], [9, 11], [42, 12], [45, 13]], C.mid, 190);
  return art;
}

function worn03() {
  const art = new PixelArt(48, 48);
  art.spans([[13, 18, 27], [14, 13, 32], [15, 10, 36], [16, 8, 39], [17, 7, 42], [18, 8, 44], [19, 6, 45], [20, 8, 46], [21, 10, 45], [22, 13, 43], [23, 17, 41], [24, 20, 37], [25, 25, 33], [26, 29, 30]], C.dryDark, 205);
  art.spans([[16, 15, 30], [17, 12, 36], [18, 12, 40], [19, 11, 42], [20, 13, 43], [21, 16, 40], [22, 20, 36], [23, 25, 31]], C.soil, 205);
  art.pixelsAt([[15, 17], [20, 15], [26, 17], [33, 18], [40, 20], [29, 23]], C.dryLight, 225);
  art.pixelsAt([[7, 18], [8, 17], [43, 20], [46, 21], [18, 25]], C.mid, 185);
  return art;
}

function flowerWhite() {
  const art = new PixelArt(16, 16);
  art.pixelsAt([[7, 5], [6, 6], [8, 6], [7, 7]], C.white);
  art.pixel(7, 6, C.dryLight);
  art.pixelsAt([[7, 8], [7, 9]], C.mid);
  return art;
}

function flowerPink() {
  const art = new PixelArt(16, 16);
  art.pixelsAt([[7, 5], [6, 6], [8, 6], [7, 7]], C.pink);
  art.pixel(7, 6, C.dryLight);
  art.pixelsAt([[7, 8], [6, 9]], C.mid);
  return art;
}

function leaf() {
  const art = new PixelArt(16, 16);
  art.spans([[6, 5, 8], [7, 4, 10], [8, 5, 10], [9, 6, 8]], C.mid);
  art.pixelsAt([[5, 7], [6, 6], [9, 7]], C.light);
  art.pixelsAt([[4, 10], [5, 9]], C.dry);
  return art;
}

const assets = {
  'base/grass_base_01.png': base01,
  'base/grass_base_02.png': base02,
  'base/grass_base_03.png': base03,
  'clusters/grass_dense_01.png': dense01,
  'clusters/grass_dense_02.png': dense02,
  'clusters/grass_lively_01.png': lively01,
  'macro/grass_macro_dark_01.png': macroDark01,
  'macro/grass_macro_dark_02.png': macroDark02,
  'macro/grass_macro_soft_01.png': macroSoft01,
  'worn/grass_worn_01.png': worn01,
  'worn/grass_worn_02.png': worn02,
  'worn/grass_worn_03.png': worn03,
  'accents/flower_white_01.png': flowerWhite,
  'accents/flower_pink_01.png': flowerPink,
  'accents/leaf_01.png': leaf,
};

Object.entries(assets).forEach(([path, create]) => create().save(resolve(OUT, path)));
console.log(`Generated ${Object.keys(assets).length} Grass System V2 assets in ${OUT}`);
