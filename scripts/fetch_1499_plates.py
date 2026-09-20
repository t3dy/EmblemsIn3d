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
scan's `hp1499_pNNN` is hp.db's `page_seq`, which starts at a1r, the leaf the
text begins on; this edition's page 1 is the title leaf and its front matter runs
to page 10, five unsigned preliminary leaves earlier. The two are related by a
constant **+10** in the body of the book. That number is not kept here — it is
imported from coverage_seed.py, so this script and build_reading.py cannot drift
apart — and it is not a guess: it was measured on 2026-09-20 by opening eight
scans and matching their printed Italian word for word against translation/en/,
across chapters I, XVII, XXI, XXIV, XXVI, XXXI and XXXIII. It is one constant,
not a step function, and it does not step at the Book I/II seam.

This script said **+8** until 2026-09-20, ticket
bug-plate-images-bound-to-page-seq-plus-eight. That figure was derived from the
signature columns of hp.db's `page_concordance`, and
bug-concordance-signature-quire-model has since established that those columns
are an invented reconstruction which omits the u gathering and are not to be used
for anything. Under +8 every one of the 162 plates was written two pages early:
hp1499_p004.jpg, the dark wood of chapter I, became p012.jpg and so came up in
Read mode on our p.12, where Poliphilo is still awake on his bed and the dream
has not begun. It belongs on our p.14, "peruenuto nella uastissima Hercynia
silua". Renaming is not enough on a re-run: the old pNNN.jpg names must be
DELETED, or Read mode shows the same cut twice, two pages apart. So this script
now sweeps images/woodcuts_1499/ of any pNNN.jpg the current mapping does not
produce, and names each one it removes (--keep-stale to leave them).

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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coverage_seed import PAGE_SEQ_TO_TRANSLATION   # the ONE measured constant

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(r"C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499")
OUT = ROOT / "images" / "woodcuts_1499"

WIDTH = 800          # what the reading panel can actually show
QUALITY = 82
OFFSET = PAGE_SEQ_TO_TRANSLATION     # scan page_seq + OFFSET = this edition's page
STAMP = "MAPPING.txt"                # the offset these files were written under


def main():
    if not SRC.is_dir():
        sys.exit(f"corpus plates not found at {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)

    # The "already current" test below compares mtimes, and an mtime cannot see a
    # change of OFFSET: pNNN.jpg written under +8 is NEWER than its corpus source
    # and would be kept, silently, holding the leaf two pages away. (Observed:
    # the first run of the +10 fix skipped 82 files on exactly this reasoning.)
    # So the offset in force is stamped beside the plates, and if it has moved
    # every plate is rewritten from the corpus rather than trusted.
    stamp = OUT / STAMP
    was = stamp.read_text(encoding="utf-8").strip() if stamp.exists() else ""
    remap = was != str(OFFSET)
    if remap and was:
        print(f"offset changed {was} -> {OFFSET}: rewriting every plate, not trusting mtimes")

    made, skipped, total, wanted = 0, 0, 0, set()
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
        wanted.add(dest.name)
        if not remap and dest.exists() and dest.stat().st_mtime >= f.stat().st_mtime:
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

    # Sweep the leftovers. A change of OFFSET RENAMES every output, and a rename
    # that only writes the new name leaves the old one behind, so Read mode would
    # raise the same cut on two pages -- the one it belongs to and the one the old
    # offset put it on. Only files the current mapping does not produce are removed.
    stale = sorted(p for p in OUT.glob("p*.jpg") if p.name not in wanted)
    if stale and "--keep-stale" not in sys.argv:
        for p in stale:
            p.unlink()
        print(f"removed {len(stale)} stale plate(s) no longer in the mapping: "
              f"{', '.join(p.name for p in stale)}")
    elif stale:
        print(f"WARNING: {len(stale)} stale plate(s) LEFT IN PLACE (--keep-stale): "
              f"{', '.join(p.name for p in stale)}")

    stamp.write_text(f"{OFFSET}\n", encoding="utf-8")

    print(f"wrote {made} plate(s), {skipped} already current")
    print(f"  into  {OUT.relative_to(ROOT)}  (page_seq + {OFFSET} = our page)")
    print(f"  pages {min(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"-{max(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"  ({len(list(OUT.glob('p*.jpg')))} files)")
    print(f"  total {total / 1048576:.1f} MB at {WIDTH}px")


if __name__ == "__main__":
    main()
