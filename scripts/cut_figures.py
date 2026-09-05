"""Cut standing figures out of the gallery's public-domain paintings.

The project already self-hosts these artworks with provenance in
src/data/gallery.json; this takes figures from them so the garden is peopled by
actual Renaissance painting rather than by my approximation of one.

Masking: these figures stand against a dark ground (Botticelli's orange grove,
Cranach's night wood), so alpha comes from luminance — bright is figure, dark is
background — smoothed so the edge is a soft painted edge rather than a cut one,
then the largest connected region is kept so stray highlights in the foliage do
not come along.
"""
import io, json, os
from PIL import Image, ImageFilter, ImageOps, ImageChops
from collections import deque

SRC = 'images/gallery'
OUT = 'images/cutouts/figures'
os.makedirs(OUT, exist_ok=True)

# (id, source file, crop box, luminance cut, label)
# Crops tightened inward from the first pass, which brought slivers of the pale
# grove trunks along at the edges. `sex` matters: the world has male characters,
# and Poliphilo must not be handed one of Botticelli's Graces.
FIGURES = [
    ('grace_1',   'botticelli_primavera.jpg', (204, 252, 330, 798), 60, 'The first Grace',  'f'),
    ('grace_2',   'botticelli_primavera.jpg', (308, 270, 432, 798), 60, 'The second Grace', 'f'),
    ('grace_3',   'botticelli_primavera.jpg', (428, 252, 570, 798), 60, 'The third Grace',  'f'),
    ('flora',     'botticelli_primavera.jpg', (778, 242, 952, 828), 54, 'Flora',            'f'),
    ('chloris',   'botticelli_primavera.jpg', (908, 270, 1072, 810), 62, 'Chloris',         'f'),
    ('venus_bot', 'botticelli_primavera.jpg', (604, 162, 776, 698), 48, 'Venus',            'f'),
    # Mercury, far left, in his red cloak with the raised arm — the one standing
    # male figure in the painting, and the reason Poliphilo now has a body of his
    # own instead of borrowing a Grace's.
    ('mercury',   'botticelli_primavera.jpg', (28, 246, 214, 800), 52, 'Mercury',           'm'),
]

def largest_region(mask, thresh=128):
    """Keep only the biggest connected blob of the mask (4-connected BFS)."""
    w, h = mask.size
    px = mask.load()
    seen = bytearray(w * h)
    best, best_n = None, 0
    for sy in range(0, h, 3):                      # seed on a coarse grid
        for sx in range(0, w, 3):
            i0 = sy * w + sx
            if seen[i0] or px[sx, sy] < thresh:
                continue
            q, cells = deque([(sx, sy)]), []
            seen[i0] = 1
            while q:
                x, y = q.popleft()
                cells.append((x, y))
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < w and 0 <= ny < h:
                        i = ny*w+nx
                        if not seen[i] and px[nx, ny] >= thresh:
                            seen[i] = 1; q.append((nx, ny))
            if len(cells) > best_n:
                best_n, best = len(cells), cells
    out = Image.new('L', (w, h), 0)
    if best:
        o = out.load()
        for x, y in best:
            o[x, y] = 255
    return out

# Two passes. Each figure used to be resized to FILL its card, which threw their
# relative heights away: a tightly-cropped figure came out as tall as a loosely
# cropped one. Pass 1 trims every figure and records its real height; pass 2
# scales them all by ONE factor, so a shorter figure stays shorter in the world.
_trimmed = []
manifest = []
for fid, src, box, cut, label, sex in FIGURES:
    im = Image.open(os.path.join(SRC, src)).convert('RGB').crop(box)
    # luminance -> mask
    # Luminance alone also keeps the grove's pale trunks, which are neutral grey.
    # Botticelli's flesh and drapery are warm, so require warmth as well as light:
    # a pixel is figure if it is bright AND not distinctly cool (R not below B).
    lum = ImageOps.grayscale(im)
    r, g, b = im.split()
    # (r - b) + 12, clamped at 0 by subtract; anything left is warm-ish
    warm = ImageChops.subtract(r, b, 1.0, 12).point(lambda v: 255 if v > 12 else 0)
    bright = lum.point(lambda v: 255 if v >= cut else 0)
    mask = ImageChops.multiply(bright, warm)
    mask = mask.filter(ImageFilter.MedianFilter(5))          # drop speckle
    mask = largest_region(mask)
    mask = mask.filter(ImageFilter.MaxFilter(5))             # close small holes
    mask = mask.filter(ImageFilter.GaussianBlur(2.2))        # a soft painted edge
    rgba = im.convert('RGBA')
    rgba.putalpha(mask)
    # trim to the figure's own bounds
    bb = mask.point(lambda v: 255 if v > 12 else 0).getbbox()
    if bb:
        rgba = rgba.crop(bb)
    # normalise to a 2:1 tall card, figure centred and standing on the bottom
    _trimmed.append((fid, src, box, cut, label, sex, rgba))

TW, TH = 448, 896
_maxH = max(r[6].size[1] for r in _trimmed)
_maxW = max(r[6].size[0] for r in _trimmed)
GLOBAL = min(TW / _maxW, TH / _maxH) * 0.98      # one factor for every figure

for fid, src, box, cut, label, sex, rgba in _trimmed:
    W, H = rgba.size
    src_h = H
    rgba = rgba.resize((max(1, int(W*GLOBAL)), max(1, int(H*GLOBAL))), Image.LANCZOS)
    card = Image.new('RGBA', (TW, TH), (0, 0, 0, 0))
    card.paste(rgba, ((TW - rgba.size[0]) // 2, TH - rgba.size[1]), rgba)
    path = os.path.join(OUT, fid + '.png')
    card.save(path, optimize=True)
    manifest.append({
        'id': fid, 'label': label, 'file': 'cutouts/figures/' + fid + '.png',
        'source_file': 'gallery/' + src,
        'artwork': 'Primavera' if 'primavera' in src else src,
        'artist': 'Sandro Botticelli', 'date': 'c. 1480',
        'holding': 'Galleria degli Uffizi, Florence',
        'licence': 'Public domain (artist died 1510); faithful photographic reproduction of a 2-D PD work.',
        'crop': list(box), 'luminance_cut': cut, 'sex': sex, 'source_px_h': src_h,
        'method': 'Luminance mask, median-despeckled, largest connected region, dilated and gaussian-feathered; trimmed to bounds and centred on a 512x1024 card.',
        'px': list(card.size), 'relative_height': round(src_h / _maxH, 3),
    })
    print(f'{fid:10s} {os.path.getsize(path)/1024:7.1f} kB  rel-h {src_h/_maxH:.2f}  {sex}')

io.open('src/data/figure_cutouts.json', 'w', encoding='utf-8').write(
    json.dumps(manifest, ensure_ascii=False, indent=1))
print('\nwrote src/data/figure_cutouts.json with', len(manifest), 'figures')
