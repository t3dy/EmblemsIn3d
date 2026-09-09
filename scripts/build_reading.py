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
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EN = ROOT / "translation" / "en"
MANIFEST = ROOT / "translation" / "manifest.json"
TOURS = ROOT / "src" / "data" / "tours.json"
PLATES = ROOT / "images" / "woodcuts_1499"
OUT = ROOT / "src" / "data" / "reading.json"
HPDB = Path(r"C:\Dev\hypnerotomachia polyphili\db\hp.db")
PAGE_OFFSET = 8      # db page_seq + 8 = this edition's page; see fetch_1499_plates.py

DASH = re.compile(r"\s*[–—-]\s*")          # en dash, em dash, hyphen


def chapter_to_station():
    """First station of each chapter, with ranged stops split."""
    tours = json.loads(TOURS.read_text(encoding="utf-8"))
    stops = (tours.get("tours") or tours)["novel"]["stops"]
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
    ch2st = chapter_to_station()
    pages, last_station, missing = [], None, set()

    for n in sorted(int(k) for k in man["pages"]):
        rec = man["pages"][str(n)]
        if rec.get("status") == "blank":
            continue
        f = EN / f"page_{n:03d}.md"
        if not f.exists():
            continue
        ch = rec.get("chapter") or ""
        hit = ch2st.get(ch)
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
