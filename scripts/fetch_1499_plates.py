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

THE FIVE LEAVES THE CORPUS NEVER PHOTOGRAPHED. 162 files is not 167 woodcut
leaves: the Vertumnus triumph, the four Seasons reliefs and the Cythera clipped
tree (page_seq 181-184 and 296 = our pp.191-194 and 306) are missing from the
primary photographs and are taken instead from the second, complete facsimile in
the corpus at `staging\\ia_scan\\nNNN.jpg`, calibrated at n = page_seq + 5. See
IA_FALLBACK below, which names what is printed on each of the five. Added
2026-09-20 closing the converse half of
bug-reading-raises-a-plate-frame-on-leaves-that-carry-no-woodcut.

WHAT THIS SCRIPT DOES NOT DECIDE. It copies leaves; it does not say which leaves
carry a cut. The corpus photographed plenty of pages of solid type, and until
2026-09-20 build_reading.py raised a plate frame on every file it found here.
That test now lives in build_reading.py's plate_captions(), where the opened
scans are.

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

# ── The second facsimile ────────────────────────────────────────────────────
#
# The corpus photographed 162 leaves and stopped, and five of the leaves it missed
# carry woodcuts: the Triumph of Vertumnus and Pomona and the four Seasons reliefs
# (page_seq 181-184, our pp.191-194), and the three-ordered clipped tree of the
# Cythera garden (page_seq 296, our p.306). Found 2026-09-20 by
# bug-reading-raises-a-plate-frame-on-leaves-that-carry-no-woodcut, which measured
# the converse gap at the same time as the false plates: the corrected catalogue puts
# cuts on those five leaves and images/woodcuts_1499/ held no file for any of them,
# so they could not come up in Read mode however the binding was fixed.
#
# They are not unavailable. The corpus holds a SECOND, complete facsimile at
# staging/ia_scan/nNNN.jpg — 299 leaves, n175-n473, every one 4659x7086, which is the
# same resolution as the best of the primary photographs. Its numbering is calibrated
# to ours at **+5**: n = page_seq + 5, equivalently our page = n + 5. MEASURED by
# opening n190, which is the full-page worship of Priapus = page_seq 185 = our p.195,
# and n186, which is the Vertumnus car with the tablet "INTEGERRIMAM CORPOR.
# VALITVDINEM ... CVLTORIB. M. OFFERO." and the signature "m iiii" = page_seq 181 =
# our p.191, exactly where coverage_seed's PLATE_PAGE_FIXES puts plate #66.
#
# Each entry was opened before it was listed. page_seq -> what is printed on the leaf.
IA_SRC = Path(r"C:\Dev\hypnerotomachia polyphili\staging\ia_scan")
IA_OFFSET = 5                       # ia nNNN = page_seq + 5
IA_FALLBACK = {
    181: "the Triumph of Vertumnus and Pomona, the car drawn by four horned fauns, over "
         "the tablet 'INTEGERRIMAM CORPOR. VALITVDINEM, ET STABILE ROBVR, CASTASQVE "
         "MEMSAR. DELITIAS, ET BEATAM ANIMI SECVRITATEM CVLTORIB. M. OFFERO.'; signature "
         "'m iiii'. Catalogue #66 = our p.191.",
    182: "Spring: the flower-girdled goddess casting flowers into the flaming Chytropode, "
         "captioned on the cut 'FLORIDO VERI .S.'. Catalogue #67 = our p.192.",
    183: "TWO reliefs — Summer, the corn-crowned damsel with the cornucopia of grain, "
         "'FLAVAE MESSI.S.', and Autumn, the vine-crowned youth with the goat, "
         "'MVSTVLENTO AVTVMNO .S.'. Catalogue #68 and #69 = our p.193.",
    184: "Winter: the bearded king in the beast-skin, his sceptre raised into a "
         "hail-streaked sky, captioned 'HYEMI AEOLIAE.S.'. Catalogue #70 = our p.194.",
    296: "a clipped tree of three orders rising from a vase with dragon-headed handles, "
         "beside 'Gli fructigeri arbori di forma hemispheria inconuexo'. The catalogue "
         "files #117, #118 and #119 on this leaf and it carries one cut = our p.306.",
}

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

    # The five leaves the primary photographs missed, taken from the second
    # facsimile. See IA_FALLBACK above: each was opened before it was listed.
    from_ia, missing_ia = 0, []
    for seq in sorted(IA_FALLBACK):
        ours = seq + OFFSET
        dest = OUT / f"p{ours:03d}.jpg"
        wanted.add(dest.name)
        if (SRC / f"hp1499_p{seq:03d}.jpg").exists():
            continue                      # the corpus has it after all; prefer the primary
        f = IA_SRC / f"n{seq + IA_OFFSET:03d}.jpg"
        if not f.exists():
            missing_ia.append(ours)
            continue
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
        from_ia += 1
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

    print(f"wrote {made + from_ia} plate(s), {skipped} already current")
    if from_ia:
        print(f"  of which {from_ia} from the second facsimile (staging/ia_scan, "
              f"n = page_seq + {IA_OFFSET}), for leaves the corpus never photographed: "
              f"{', '.join('p%03d' % (s + OFFSET) for s in sorted(IA_FALLBACK))}")
    if missing_ia:
        print(f"  UNAVAILABLE: {missing_ia} — a cut is known to stand on these leaves and "
              f"NEITHER facsimile on this machine holds the page")
    print(f"  into  {OUT.relative_to(ROOT)}  (page_seq + {OFFSET} = our page)")
    print(f"  pages {min(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"-{max(int(p.stem[1:]) for p in OUT.glob('p*.jpg'))}"
          f"  ({len(list(OUT.glob('p*.jpg')))} files)")
    print(f"  total {total / 1048576:.1f} MB at {WIDTH}px")


if __name__ == "__main__":
    main()
