from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path('public/assets/tiles/grass-v1-candidate')
OUT.mkdir(parents=True, exist_ok=True)

C = {
    'deep': '#21432D',
    'base': '#2F5A38',
    'light': '#487348',
    'soft_dark': '#294F34',
    'soft_light': '#3B673F',
    'dry_dark': '#4F5638',
    'dry': '#697047',
    'dry_light': '#7B7E4B',
}


def blank():
    return Image.new('RGB', (16, 16), C['base'])


def grass_01():
    # Dominant tile intentionally flat: it must not betray a 16x16 repeat.
    return blank()


def grass_02():
    img = blank()
    d = ImageDraw.Draw(img)
    for p in [(2,7),(3,6),(3,7),(4,7),(4,8),(5,7),(5,8),(6,8)]:
        d.point(p, fill=C['soft_dark'])
    for p in [(3,5),(5,6)]:
        d.point(p, fill=C['deep'])
    for p in [(11,12),(12,11),(12,12)]:
        d.point(p, fill=C['soft_dark'])
    return img


def grass_03():
    img = blank()
    d = ImageDraw.Draw(img)
    for p in [(9,5),(10,4),(10,5),(11,5),(10,6),(11,6),(12,5)]:
        d.point(p, fill=C['soft_light'])
    for p in [(10,3),(12,4)]:
        d.point(p, fill=C['light'])
    for p in [(3,12),(4,11),(4,12)]:
        d.point(p, fill=C['soft_dark'])
    return img


def make_worn(points, darks, lights, greens=()):
    img = blank()
    d = ImageDraw.Draw(img)
    for p in points:
        d.point(p, fill=C['dry'])
    for p in darks:
        d.point(p, fill=C['dry_dark'])
    for p in lights:
        d.point(p, fill=C['dry_light'])
    for p in greens:
        d.point(p, fill=C['soft_dark'])
    return img


tiles = {
    'grass_01': grass_01(),
    'grass_02': grass_02(),
    'grass_03': grass_03(),
    'grass_worn_01': make_worn(
        [(1,8),(2,8),(3,7),(4,7),(5,7),(6,7),(7,6),(8,6),(9,6),(10,6),(11,5),(12,5),(13,5),(14,5)],
        [(2,8),(5,7),(8,6),(11,5),(14,5)],
        [(4,7),(9,6),(12,5)],
        [(6,6),(10,7)],
    ),
    'grass_worn_02': make_worn(
        [(2,5),(3,5),(4,5),(5,6),(6,6),(7,6),(8,7),(9,7),(10,7),(11,8),(12,8),(13,8)],
        [(3,5),(6,6),(10,7),(13,8)],
        [(5,6),(8,7),(12,8)],
        [(7,7),(11,7)],
    ),
    'grass_worn_03': make_worn(
        [(3,9),(4,9),(5,8),(6,8),(7,8),(8,8),(9,7),(10,7),(11,7),(12,6),(13,6)],
        [(4,9),(7,8),(10,7),(13,6)],
        [(6,8),(9,7),(12,6)],
        [(8,7),(11,8)],
    ),
}

for name, tile in tiles.items():
    tile.save(OUT / f'{name}.png')

# Directed 24x16-tile field for calibration. No random per-tile scattering.
W, H = 24, 16
layout = [['grass_01' for _ in range(W)] for _ in range(H)]

for x, y in [(3,3),(4,4),(15,2),(16,3),(8,11),(9,12),(20,7),(19,8),(5,14)]:
    layout[y][x] = 'grass_02'

for x, y in [(7,2),(17,11),(18,12),(2,12),(21,4),(13,14)]:
    layout[y][x] = 'grass_03'

for x, y, name in [
    (9,5,'grass_worn_01'),
    (10,5,'grass_worn_02'),
    (11,6,'grass_worn_03'),
    (12,6,'grass_worn_01'),
    (13,7,'grass_worn_02'),
    (14,7,'grass_worn_03'),
]:
    layout[y][x] = name

field = Image.new('RGB', (W * 16, H * 16), C['base'])
for y in range(H):
    for x in range(W):
        field.paste(tiles[layout[y][x]], (x * 16, y * 16))
field.save(OUT / 'grass_field_384x256.png')

print(f'Generated grass candidate assets in {OUT}')
