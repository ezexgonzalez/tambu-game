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


def make_tile(kind):
    img = Image.new('RGB', (16, 16), C['base'])
    d = ImageDraw.Draw(img)

    if kind == 'grass_01':
        for p, color in [
            ((3, 5), 'soft_dark'), ((4, 4), 'soft_dark'), ((4, 5), 'deep'),
            ((11, 11), 'soft_light'), ((12, 10), 'soft_light'), ((12, 11), 'light'),
            ((7, 14), 'soft_dark'), ((8, 13), 'soft_dark'),
        ]:
            d.point(p, fill=C[color])

    elif kind == 'grass_02':
        for p in [(2,3),(3,3),(4,4),(3,5),(4,5),(5,5),(4,6),(11,9),(12,9),(11,10),(12,11),(13,10)]:
            d.point(p, fill=C['soft_dark'])
        for p in [(3,2),(5,4),(10,8),(13,9)]:
            d.point(p, fill=C['deep'])
        for p in [(7,11),(8,10),(8,11),(9,10)]:
            d.point(p, fill=C['soft_light'])

    elif kind == 'grass_03':
        for p in [(4,10),(5,9),(5,10),(6,8),(6,9),(6,10),(7,9),(10,4),(11,3),(11,4),(12,4),(11,5)]:
            d.point(p, fill=C['soft_light'])
        for p in [(5,8),(7,8),(10,5),(12,3)]:
            d.point(p, fill=C['light'])
        for p in [(2,2),(3,3),(13,12),(12,13)]:
            d.point(p, fill=C['soft_dark'])

    elif kind == 'grass_worn_01':
        worn = [
            (5,3),(6,3),(7,3),(8,3),(9,3),
            (4,4),(5,4),(6,4),(7,4),(8,4),(9,4),(10,4),
            (3,5),(4,5),(5,5),(6,5),(7,5),(8,5),(9,5),(10,5),(11,5),
            (3,6),(4,6),(5,6),(6,6),(7,6),(8,6),(9,6),(10,6),(11,6),
            (4,7),(5,7),(6,7),(7,7),(8,7),(9,7),(10,7),(11,7),
            (4,8),(5,8),(6,8),(7,8),(8,8),(9,8),(10,8),
            (5,9),(6,9),(7,9),(8,9),(9,9),
            (6,10),(7,10),(8,10),
        ]
        for p in worn:
            d.point(p, fill=C['dry'])
        for p in [(5,4),(8,3),(4,6),(10,5),(6,8),(9,7),(7,10)]:
            d.point(p, fill=C['dry_dark'])
        for p in [(7,4),(9,5),(5,7),(8,8)]:
            d.point(p, fill=C['dry_light'])
        for p in [(2,7),(3,8),(11,4),(12,5),(10,10),(11,9)]:
            d.point(p, fill=C['soft_dark'])
        for p in [(3,7),(12,4),(11,10)]:
            d.point(p, fill=C['soft_light'])

    return img


names = ['grass_01', 'grass_02', 'grass_03', 'grass_worn_01']
tiles = {name: make_tile(name) for name in names}
for name, tile in tiles.items():
    tile.save(OUT / f'{name}.png')

# Directed 24x16-tile field for calibration. No random per-tile scattering.
W, H = 24, 16
layout = [['grass_01' for _ in range(W)] for _ in range(H)]

for cluster in [
    [(3,4),(4,4),(4,5)],
    [(14,2),(15,2),(15,3),(16,3)],
    [(8,11),(9,11),(9,12)],
    [(19,7),(20,7),(20,8)],
]:
    for x, y in cluster:
        layout[y][x] = 'grass_02'

for cluster in [
    [(6,2),(7,2)],
    [(17,11),(18,11),(18,12)],
    [(2,12),(3,12)],
]:
    for x, y in cluster:
        layout[y][x] = 'grass_03'

for x, y in [(10,5),(11,5),(10,6),(11,6),(12,6),(11,7),(12,7)]:
    layout[y][x] = 'grass_worn_01'

field = Image.new('RGB', (W * 16, H * 16), C['base'])
for y in range(H):
    for x in range(W):
        field.paste(tiles[layout[y][x]], (x * 16, y * 16))
field.save(OUT / 'grass_field_384x256.png')

print(f'Generated grass candidate assets in {OUT}')
