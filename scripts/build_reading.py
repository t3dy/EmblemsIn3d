#!/usr/bin/env python3
"""build_reading.py — generate src/data/reading.json for the Read mode.

    python scripts/build_reading.py

Ted, 2026-09-09: "I want an option for a version where the player can read not
just summaries and commentary but the full text of the entire HP as part of the
process of taking the tour, and looking at modeled versions of everything
described in the text."

So the text has to be the spine and the world has to keep pace with it. That
needs one thing nothing in the repo had: a map from a 1499 PAGE to a STATION in
the 3-D world. Both halves exist now and this joins them.

    page -> chapter      from translation/manifest.json, whose first-half
                         chapters were refined out of the page headings on
                         2026-09-09 (they had been the placeholder "I-XVI")
    chapter -> station   from src/data/tours.json, taking the FIRST stop of
                         each chapter. Some stops cover a range ("VI-VII"),
                         which is split so both chapters resolve.

Closed 2026-09-20, debt-reading-station-is-chapter-grained: the chapter rule
alone is too coarse for a chapter that runs many pages and carries several
stops. Chapter X is 1499 pp. 117-140 with FIVE stops (labyrinth, chess,
artificial, quinta_essentia, three_doors), and the chapter rule put every one
of those 24 pages at `labyrinth`, the first stop in the array, including p.119
(the chess ballet, "thirty-two young girls... clothed in cloth of gold") which
has its own built station, `chess`, standing unused. So a stop MAY now declare
the 1499 page range it actually covers -- "pages": [lo, hi] -- and
page_to_station() resolves each page to the stop whose declared range contains
it, checked narrowest-first (so a range nested inside a wider one wins). Only
where NO stop declares a range for a page does the old chapter rule apply, and
that fallback is what still carries chapters with a single stop (e.g. VIII,
or XI-XIII, which run several pages but were never mis-split because only one
stop claims them). Ranges were read off the English text itself, page by page
-- not the tour prose -- e.g. p.118 is still recapping the banquet's splendour
("who would believe with what luxury...") and p.119 is where the queen "at
once...ordered a game to be looked at...an excellent dance" and the
thirty-two girls enter; that is the labyrinth/chess seam, and it is not where
the tour's own chapter tag would have put it.

Pages with no station of their own inherit the last one that had one, so the
world never jumps back to nowhere in the middle of a chapter.

The English is taken from translation/en/page_NNN.md with the page heading and
the whole Notes section stripped: the reading mode shows the BOOK, and the
commentary is what the other panel is for. The parenthetical editorial note is
kept SEPARATELY, in `note`, because three pages of the 1499 are full-page
woodcuts with no text at all and on those it is the only thing to show.
"""
import io
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coverage_seed import PAGE_SEQ_TO_TRANSLATION   # the ONE measured constant

ROOT = Path(__file__).resolve().parent.parent
EN = ROOT / "translation" / "en"
MANIFEST = ROOT / "translation" / "manifest.json"
TOURS = ROOT / "src" / "data" / "tours.json"
PLATES = ROOT / "images" / "woodcuts_1499"
OUT = ROOT / "src" / "data" / "reading.json"
HPDB = Path(r"C:\Dev\hypnerotomachia polyphili\db\hp.db")
# db page_seq + 10 = this edition's page. NOT a private copy of the number: it is
# imported from coverage_seed.py, which carries the measurement — eight scan/page
# pairs read word for word against translation/en/ across chapters I, XVII, XXI,
# XXIV, XXVI, XXXI and XXXIII, one constant with no step at the Book I/II seam.
# It was 8 here until 2026-09-20 (bug-plate-images-bound-to-page-seq-plus-eight),
# derived from hp.db's page_concordance signatures, which bug-concordance-
# signature-quire-model has since shown to be an invented reconstruction that
# omits the u gathering and is not to be used for anything. The consequence of
# the 8 was that every one of the 162 plates came up two pages early — the dark
# wood, scan p4, stood on our p.12 where Poliphilo is still awake on his bed,
# instead of our p.14, "peruenuto nella uastissima Hercynia silua".
PAGE_OFFSET = PAGE_SEQ_TO_TRANSLATION

DASH = re.compile(r"\s*[–—-]\s*")          # en dash, em dash, hyphen


def chapter_to_station(stops):
    """First station of each chapter, with ranged stops split."""
    out = {}
    for s in stops:
        ch = (s.get("chapter") or "").strip()
        if not ch:
            continue
        for part in DASH.split(ch):
            part = part.strip()
            if part and part not in out:
                out[part] = {"station": s["station"], "title": s.get("title", "")}
    return out


def page_to_station_ranges(stops):
    """Explicit 1499 page ranges some stops declare, narrowest first.

    A stop's "pages": [lo, hi] says which 1499 pages it actually covers, and
    wins over the chapter-level fallback for every page inside it -- see the
    module docstring, debt-reading-station-is-chapter-grained. Sorting
    narrowest-first means a stop whose range is nested inside a wider one
    (there is none of that today, but the schema allows it) resolves to the
    more specific stop rather than whichever happens to be found first.
    """
    ranges = []
    for s in stops:
        pr = s.get("pages")
        if not pr:
            continue
        lo, hi = pr
        ranges.append((lo, hi, {"station": s["station"], "title": s.get("title", "")}))
    ranges.sort(key=lambda r: r[1] - r[0])
    return ranges


def station_for_page(n, ch, ranges, ch2st):
    """The narrowest declared range containing page n, else the chapter rule."""
    for lo, hi, hit in ranges:
        if lo <= n <= hi:
            return hit
    return ch2st.get(ch)


EDITORIAL = re.compile(r"^\*\((.*?)\)\*\s*$", re.M | re.S)


def body_of(path):
    """(paragraphs, editorial note) for one page.

    The italic parenthetical some pages open with is the editor speaking, not
    Colonna, so it is kept apart from the text. It is KEPT, though, and not
    dropped: about a dozen pages of the 1499 are full-page woodcuts or blank
    versos carrying nothing but a gathering-signature, and on those the note is
    the only thing there is to show. Stripping it left the reading panel a black
    rectangle with no explanation — which is how this was found.
    """
    t = path.read_text(encoding="utf-8")
    t = t.split("\n---\n")[0]                        # drop everything from the rule on
    t = re.sub(r"^#.*$", "", t, flags=re.M)          # the page heading
    m = EDITORIAL.search(t)
    note = " ".join(m.group(1).split()) if m else ""
    t = EDITORIAL.sub("", t)
    paras = [p.strip() for p in re.split(r"\n\s*\n", t) if p.strip()]
    return paras, note


def plate_titles():
    """page -> the woodcut's title, from hp.db, for the plate frame's caption.

    The IMAGE is found by filename (images/woodcuts_1499/pNNN.jpg), so the plates
    work with or without the database; this only supplies the caption. The corpus
    is a separate repository and is read-only from here.
    """
    try:
        import sqlite3
    except ImportError:
        return {}
    if not HPDB.exists():
        return {}
    out = {}
    try:
        db = sqlite3.connect(f"file:{HPDB}?mode=ro", uri=True)
        for pg, title in db.execute(
                "select page_1499, title from woodcuts where page_1499 is not null"):
            out[int(pg) + PAGE_OFFSET] = title
        db.close()
    except Exception as e:                      # a caption is not worth failing over
        print(f"  (no captions: {e})")
    return out


def main():
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    titles = plate_titles()
    have_plate = {int(f.stem[1:]) for f in PLATES.glob("p*.jpg")} if PLATES.is_dir() else set()
    tours = json.loads(TOURS.read_text(encoding="utf-8"))
    stops = (tours.get("tours") or tours)["novel"]["stops"]
    ch2st = chapter_to_station(stops)
    ranges = page_to_station_ranges(stops)
    pages, last_station, missing = [], None, set()

    for n in sorted(int(k) for k in man["pages"]):
        rec = man["pages"][str(n)]
        if rec.get("status") == "blank":
            continue
        f = EN / f"page_{n:03d}.md"
        if not f.exists():
            continue
        ch = rec.get("chapter") or ""
        hit = station_for_page(n, ch, ranges, ch2st)
        if hit:
            last_station = hit["station"]
        elif ch:
            missing.add(ch)
        paras, note = body_of(f)
        rec_out = {
            "n": n,
            "ch": ch,
            "st": last_station,                      # inherit, so the world never jumps to nowhere
            "t": paras,
        }
        if note:
            rec_out["note"] = note
        # The plate that falls ON this leaf. Ted asked for the woodcut to come up
        # "as the text of the novel and commentary gets to the point where the
        # woodcut comes up" -- so it is bound to the PAGE, not, as the walking
        # plate frame is, to the station.
        if n in have_plate:
            rec_out["wc"] = f"woodcuts_1499/p{n:03d}.jpg"
            if titles.get(n):
                rec_out["wcap"] = titles[n]
        pages.append(rec_out)

    data = {
        "note": ("Generated by scripts/build_reading.py. The whole book, page by page, each "
                 "page carrying the station in the 3-D world where it happens. Do not hand-edit: "
                 "edit translation/en/*.md or src/data/tours.json and re-run."),
        "pages": pages,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    words = sum(len(" ".join(p["t"]).split()) for p in pages)
    placed = sum(1 for p in pages if p["st"])
    textless = [p["n"] for p in pages if not p["t"]]
    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  pages    {len(pages)}")
    print(f"  words    {words:,}")
    print(f"  placed   {placed}/{len(pages)} pages have a station")
    print(f"  bytes    {OUT.stat().st_size:,}")
    withplate = sum(1 for p in pages if p.get("wc"))
    print(f"  plates   {withplate} pages carry their own 1499 woodcut")
    if textless:
        print(f"  no body text (full-page woodcuts, signature-only leaves): {textless}")
    if missing:
        print(f"  NO STATION for chapter(s): {sorted(missing)}")


if __name__ == "__main__":
    main()
