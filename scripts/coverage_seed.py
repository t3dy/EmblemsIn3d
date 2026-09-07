#!/usr/bin/env python3
# coverage_seed.py — build or refresh research/coverage.json, the chapter ledger.
#
# The ledger is the answer to "what is in the book that is not in the world?" —
# the question nobody was asking on 2026-09-07, when the tunnels under the
# pyramid turned out never to have been built. See HPTOTOURPIPELINE.md.
#
# This script only writes the DERIVED parts of each chapter (its page range, its
# plates, the tour stops that touch it, and the weak build-evidence grep). The
# researched parts — `research` and `features` — are preserved verbatim on every
# refresh, so running it can never destroy an agent's reading.
#
#   python scripts/coverage_seed.py            # refresh, preserving research
#   python scripts/coverage_seed.py --dry-run  # show what would change
#
import argparse, collections, glob, io, json, os, re, sqlite3, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HPDB = r"C:\Dev\hypnerotomachia polyphili\db\hp.db"
LEDGER = os.path.join(ROOT, "research", "coverage.json")

ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII',
         'XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII',
         'XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII']

# Book I ends and Book II begins at chapter XXV (Polia's own account, Treviso).
BOOK_II_FROM = 25

# Where to read each chapter. Chapters I–XVI survive in English only in
# Dallington 1592 (public domain); XVII–XXXVIII are our own CC0 translation.
# Godwin 1999 is in copyright and is never used — see ROUTER.md rule 2.
def text_source(n):
    if n <= 16:
        return {"edition": "Dallington 1592",
                "file": r"C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md",
                "note": "page markers in that file are DALLINGTON's pages, not the 1499's"}
    return {"edition": "our translation (CC0)", "file": "translation/en/page_NNN.md",
            "note": "page numbers ARE the 1499's, so they line up with hp.db"}


def chapter_pages():
    """1499 page ranges for the chapters our translation covers."""
    out = {}
    for f in glob.glob(os.path.join(ROOT, "translation", "en", "page_*.md")):
        m = re.search(r"page_(\d+)", os.path.basename(f))
        if not m:
            continue
        n = int(m.group(1))
        try:
            head = io.open(f, encoding="utf-8").readline()
        except OSError:
            continue
        cm = re.search(r"Chapter\s+([IVXL]+)", head)
        if not cm:
            continue
        out.setdefault(cm.group(1), []).append(n)
    return {k: [min(v), max(v)] for k, v in out.items()}


def tour_stops():
    """Which tour stops speak for which chapter, by the tour's own labels."""
    p = os.path.join(ROOT, "src", "data", "tours.json")
    stops = json.load(io.open(p, encoding="utf-8"))["novel"]["stops"]
    by = collections.defaultdict(list)
    for s in stops:
        raw = (s.get("chapter") or "").replace("\u2013", "-").replace("\u2014", "-")
        for part in re.split(r"[-,/ ]+", raw):
            part = part.strip().upper()
            if part in ROMAN:
                by[part].append({"station": s.get("station"), "title": s.get("title"),
                                 "notes": len(s.get("notes") or [])})
    return by


def plates(pages_by_ch):
    """Plates per chapter, by 1499 page. Only possible where we know the range."""
    con = sqlite3.connect(HPDB)
    rows = con.execute("select catalog_number, description, page_seq, narrative_section "
                       "from woodcut_catalog order by catalog_number").fetchall()
    con.close()
    by_ch, unplaced = collections.defaultdict(list), []
    for num, desc, seq, sect in rows:
        placed = False
        if seq is not None:
            for ch, (a, b) in pages_by_ch.items():
                if a <= seq <= b:
                    by_ch[ch].append({"plate": num, "description": desc, "page_1499": seq})
                    placed = True
                    break
        if not placed:
            unplaced.append({"plate": num, "description": desc, "page_1499": seq, "section": sect})
    return by_ch, unplaced


def sections():
    con = sqlite3.connect(HPDB)
    rows = con.execute("select section, min(page_seq), max(page_seq) from page_concordance "
                       "group by section order by min(page_seq)").fetchall()
    con.close()
    return [{"section": s, "pages_1499": [a, b]} for s, a, b in rows]


def build_evidence():
    """A WEAK signal, and labelled as such: which plate numbers and station keys
    the scene source actually cites. A citation is not proof a thing is built —
    it is a hint that someone looked at it. Never write `status: built` from
    this alone; open the running page (RECIPES/verify-live.md)."""
    src = ""
    for f in glob.glob(os.path.join(ROOT, "src", "scenes", "*.js")) + \
             glob.glob(os.path.join(ROOT, "src", "systems", "*.js")):
        try:
            src += io.open(f, encoding="utf-8", errors="ignore").read()
        except OSError:
            pass
    cited = set(int(m) for m in re.findall(r"#(\d{1,3})\b", src))
    builders = sorted(set(re.findall(r"\b_build([A-Z][A-Za-z0-9]*)\s*\(", src)))
    stations = sorted(set(re.findall(r"\{\s*key:\s*'([a-z_]+)'", src)))
    return {"plates_cited_in_source": sorted(cited), "builders": builders, "stations": stations}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    pages = chapter_pages()
    stops = tour_stops()
    by_ch, unplaced = plates(pages)
    ev = build_evidence()

    old = {}
    if os.path.exists(LEDGER):
        prev = json.load(io.open(LEDGER, encoding="utf-8"))
        old = {c["id"]: c for c in prev.get("chapters", [])}

    chapters = []
    for i, rn in enumerate(ROMAN, start=1):
        prev = old.get(rn, {})
        pr = pages.get(rn)
        ch = {
            "id": rn,
            "n": i,
            "book": 2 if i >= BOOK_II_FROM else 1,
            "pages_1499": pr,
            "text_source": text_source(i),
            "plates": by_ch.get(rn, []),
            "plates_from": "page-range" if pr else "not-yet-attached",
            "tour_stops": stops.get(rn, []),
            # preserved across refreshes — this is the researched part
            "research": prev.get("research", {
                "status": "partial" if stops.get(rn) else "unread",
                "enumerated_by": None, "date": None,
                "note": "Tour notes exist, but nobody has enumerated this chapter's features."
                        if stops.get(rn) else "Nobody has read this chapter against the world.",
            }),
            "features": prev.get("features", []),
        }
        chapters.append(ch)

    doc = {
        "$schema_note": "See HPTOTOURPIPELINE.md for the field meanings and the workflow.",
        "generated": datetime.date.today().isoformat(),
        "generator": "scripts/coverage_seed.py",
        "hand_edited_fields": ["chapters[].research", "chapters[].features"],
        "derived_fields": ["chapters[].pages_1499", "chapters[].plates", "chapters[].tour_stops",
                           "build_evidence"],
        "modes": ["walk", "dream", "tour", "flight", "vaults"],
        "feature_kinds": ["place", "building", "rite", "object", "creature", "inscription",
                          "plant", "machine", "person", "picture"],
        "status_values": {
            "built": "in the world and verified on the running page",
            "partial": "some of it is there; the note says what is missing",
            "unbuilt": "described in the book, absent from the world",
            "declined": "deliberately not built; the note says why",
            "unknown": "nobody has checked",
        },
        "sections_1499": sections(),
        "build_evidence": ev,
        "plates_not_attached_to_a_chapter": unplaced,
        "chapters": chapters,
    }

    if args.dry_run:
        enum = sum(1 for c in chapters if c["research"]["status"] == "enumerated")
        print(f"chapters {len(chapters)}  enumerated {enum}  "
              f"plates attached {sum(len(c['plates']) for c in chapters)}  unattached {len(unplaced)}")
        return
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    io.open(LEDGER, "w", encoding="utf-8").write(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {os.path.relpath(LEDGER, ROOT)}: {len(chapters)} chapters, "
          f"{sum(len(c['plates']) for c in chapters)} plates attached, {len(unplaced)} unattached")


if __name__ == "__main__":
    main()
