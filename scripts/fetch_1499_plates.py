#!/usr/bin/env python3
"""fetch_1499_plates.py — bring the genuine 1499 woodcuts into the site, one per page.

    python scripts/fetch_1499_plates.py

The corpus holds 162 plates photographed from the 1499 Aldine, at
`C:\\Dev\\hypnerotomachia polyphili\\site\\images\\woodcuts_1499\\`, named
`hp1499_pNNN.jpg` where NNN is the page in the DATABASE's numbering. This copies
them in at a uniform 800 px wide so the reading mode can open the actual cut at
the actual page.

Two things make this worth doing rather than curating by hand:

  * the filename IS the mapping. No lookup table, no drift.
  * 233 MB of source becomes about 25 MB at 800 px, and 89 of the 162 are
    full-resolution scans (4659 x 7086) that nothing on a web page can use.

THE PAGE OFFSET. The corpus and this project number the 1499 differently: the
database's `page_concordance` begins at signature a1r and counts three
preliminary pages, while this edition's page 1 is the title leaf and its front
matter runs to page 10. The two are related by a constant **+8** in the body of
the book, and that is not a guess -- it was measured from thirty-eight printed
signatures that appear in the transcribed pages themselves ("f ii" on our page
91 is f2r, which the database puts at 83, and so on through quire m). The first
quire drifts by a page or two, where signatures are sparse; everything from f
onward is exact.

The corpus is a separate git repository and is treated read-only from here: this
script only ever reads from it.
"""
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(r"C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499")
OUT = ROOT / "images" / "woodcuts_1499"

WIDTH = 800          # what the reading panel can actually show
QUALITY = 82
OFFSET = 8           # db page_seq + OFFSET = this edition's page


def main():
    if not SRC.is_dir():
        sys.exit(f"corpus plates not found at {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)

    made, skipped, total = 0, 0, 0
    for f in sorted(SRC.glob("hp1499_p*.jpg")):
        # `_p` and not `p`: the stem is "hp1499_p004" and a bare `p(\d+)` matches
        # the p of "hp" followed by "1499", so every one of the 162 plates mapped
        # to the same output file. The count in the report is what showed it.
        m = re.search(r"_p(\d+)", f.stem)
        if not m:
            continue
        db_page = int(m.group(1))
        ours = db_page + OFFSET
        dest = OUT / f"p{ours:03d}.jpg"
        if dest.exists() and dest.stat().st_mtime >= f.stat().st_mtime:
            skipped += 1
            total += dest.stat().st_size
            continue
        im = Image.open(f)
        if im.mode != "RGB":
            im = im.convert("RGB")
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        made += 1
        total += dest.stat().st_size

    print(f"wrote {made} plate(s), {skipped} already current")
    print(f"  into  {OUT.relative_to(ROOT)}")
    print(f"  pages {min(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"-{max(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"  ({len(list(OUT.glob('p*.jpg')))} files)")
    print(f"  total {total / 1048576:.1f} MB at {WIDTH}px")


if __name__ == "__main__":
    main()
