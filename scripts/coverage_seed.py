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

# ── Two numberings, ten pages apart ──────────────────────────────────────────
#
# hp.db counts the pages of the SIGNED book: `page_seq` 1 is a1r, the leaf on
# which the text begins. Our translation counts from the title page, ten pages —
# five unsigned preliminary leaves — earlier. So
#
#       our translation page = page_seq + 10
#
# and `plates()` used to match `page_seq` straight into chapter ranges built from
# translation page numbers, filing most of Book II one chapter early.
# Ticket bug-plate-page-seq-offset.
#
# MEASURED 2026-09-20 by opening the scan at
#   C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499\hp1499_pNNN.jpg
# and matching its printed Italian, word for word, against translation/en/:
#
#   scan p4   "peruenuto nella uastissima Hercynia silua"       = our p.14  (ch. I)
#   scan p195 full-page rotunda section, no body text, only the
#             gathering-signature "n iii" at the foot — which is
#             exactly what our page says it is                  = our p.205 (ch. XVII)
#   scan p205 "Et ecco cum summa ueneratione ... el rituale libro"
#                                                                = our p.215 (ch. XVII)
#   scan p291 "Nello intersito mediano dilla coaequata ..."      = our p.301 (ch. XXI)
#   scan p363 "sopra il fonte. Nelquale ... uno serpe aureo"     = our p.373 (ch. XXIV)
#   scan p387 "Per laqualcosa no dimota uno quantulo ... Qual
#             conscia malefica remeare"                          = our p.397 (ch. XXVI)
#   scan p425 "sauiando, sorbiculante ... morsiunculo"           = our p.435 (ch. XXXI)
#   scan p435 "lentia, dilectione & amore, oltra omni cogitato"  = our p.445 (ch. XXXIII)
#
# It is ONE CONSTANT, not a step function. It is already +10 at the first woodcut
# in the book (p4, ch. I) and still +10 at the last text page we can check, and it
# does NOT step at the Book I/II seam: p363 = our p.373 is the last chapter of
# Book I, p387 = our p.397 is the second chapter of Book II, both +10. The ticket
# recorded one "+11" reading at p435; opening that page shows it is our p.445, so
# that datapoint was a slip, and no chapter turned on it either way.
#
# Corroboration that needs no scan at all: the four page numbers for which
# translation/en holds no file — 55, 90, 195, 380 — are page_seq 45, 80, 185, 370,
# and 80 / 185 / 195 are precisely full-page woodcuts (catalogue #23 the third
# fountain, #71 the worship of Priapus, #72 the temple section) with no body text
# to translate.
PAGE_SEQ_TO_TRANSLATION = 10

# ── A second, smaller error rides on top of the constant ─────────────────────
#
# `woodcut_catalog.page_seq` is itself only good to about ±2 pages. Those rows
# were placed by subject-matching, not by observation: `woodcuts.source_method` is
# LLM_ASSISTED and `woodcut_catalog.link_basis` says so out loud — #153's reads
# "subject match on 1499 page 389: shared terms drags, polia, poliphilus,
# prostrate, sanctuary" — and the `woodcuts` table it was matched against carries
# signature labels (C6r, B3r, F1r …) from a quire model that drifts badly after
# quire y. The jitter only changes a plate's CHAPTER where the plate sits within a
# page or two of a chapter boundary, but #153 is exactly such a case.
#
# plate -> its true page_seq. Nothing goes in here that was not seen on the scan.
PLATE_PAGE_FIXES = {
    152: 386,  # scan p386 carries Polia reading while Poliphilo lies collapsed before
               # the altar; its text ends "rachiusi gli somersi ochii allato me se
               # morite" = our p.396. Catalogued at 387. Chapter XXVI either way.
    153: 387,  # scan p387 carries the dragging woodcut AND, above it, the whole of our
               # p.397 ("per gli sui fredi pedi ... in uno angulo del tepio"). The
               # catalogued page 389 is unbroken text, signature "B ii", no woodcut.
               # This is the one correction that moves a chapter: XXVII -> XXVI.
    154: 390,  # scan p390 carries the two women chained to Cupid's burning car in the
               # wood ("due dolete & siagurate fanciulle ... ad uno ignitato uehiculo")
               # = our p.400. Catalogued at 391. Chapter XXVII either way.
}

# Plates whose catalogued page we opened and found ALREADY RIGHT. Worth writing down:
# a confirmation is evidence too, and without it there is no way to tell a page nobody
# has checked from a page somebody checked and left alone. plate -> the line of Italian
# on the scan that identifies it.
PLATE_PAGE_CONFIRMED = {
    1:   "p4   'peruenuto nella uastissima Hercynia silua' = our p.14 (ch. I)",
    72:  "p195 full-page rotunda section, signature 'n iii' only = our p.205 (ch. XVII)",
    76:  "p205 'Et ecco cum summa ueneratione ... el rituale libro' = our p.215 (ch. XVII)",
    149: "p363 'sopra il fonte. Nelquale ... uno serpe aureo' = our p.373 (ch. XXIV)",
    163: "p425 'sauiando, sorbiculante ... morsiunculo' = our p.435 (ch. XXXI)",
}

# Known-wrong but not yet resolved: #165 ("Polia reading lover's letter in bed-chamber")
# is catalogued at page_seq 435, and scan p435 is unbroken text with no woodcut at all
# (signature "E"). Its true page is somewhere near, and its chapter (XXXIII) is right by
# the constant alone, so it is left as the catalogue has it rather than guessed at.

# The eight attributions ticket bug-plate-page-seq-offset says were wrong, plus the two
# regression points its acceptance names. Asserted on every run — see check_plates().
PLATE_CHAPTER_EXPECTED = {
    149: "XXIV",   # Fountain of Venus, water from the sarcophagus of Adonis
    150: "XXIV",   # Statue of Venus on the tomb of Adonis
    152: "XXVI",   # Polia in the temple of Diana, Poliphilo prostrate
    153: "XXVI",   # Polia drags the corpse from the sanctuary  (acceptance)
    157: "XXIX", 158: "XXIX", 159: "XXIX", 160: "XXIX",
    161: "XXX",  162: "XXX",
    163: "XXXI",   # the kiss before the priestess              (acceptance)
    164: "XXXII",
    165: "XXXIII",
    166: "XXXV", 167: "XXXV", 168: "XXXV",
}

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
    """Plates per chapter.

    `pages_by_ch` is in OUR TRANSLATION's numbering; `woodcut_catalog.page_seq` is
    in hp.db's, ten pages behind it. Resolve through PAGE_SEQ_TO_TRANSLATION, after
    applying the per-plate corrections we have actually measured against the scans.
    Both numbers are written out, because a reader who does not know there are two
    numberings is the reader who filed Book II one chapter early.
    """
    con = sqlite3.connect(HPDB)
    rows = con.execute("select catalog_number, description, page_seq, narrative_section "
                       "from woodcut_catalog order by catalog_number").fetchall()
    con.close()
    by_ch, unplaced = collections.defaultdict(list), []
    for num, desc, raw, sect in rows:
        seq = PLATE_PAGE_FIXES.get(num, raw)
        page = seq + PAGE_SEQ_TO_TRANSLATION if seq is not None else None
        rec = {"plate": num, "description": desc, "page_1499": seq, "page_translation": page}
        if num in PLATE_PAGE_FIXES:
            rec["page_corrected_from"] = raw
            rec["page_checked"] = "scan opened 2026-09-20; corrected — see PLATE_PAGE_FIXES"
        elif num in PLATE_PAGE_CONFIRMED:
            rec["page_checked"] = "scan opened 2026-09-20; catalogued page confirmed — " \
                                  + PLATE_PAGE_CONFIRMED[num]
        placed = False
        if page is not None:
            for ch, (a, b) in pages_by_ch.items():
                if a <= page <= b:
                    by_ch[ch].append(rec)
                    placed = True
                    break
        if not placed:
            unplaced.append(dict(rec, section=sect))
    return by_ch, unplaced


def check_plates(by_ch):
    """Regression check, run on every seed. Ticket bug-plate-page-seq-offset.

    These sixteen plate->chapter pairs were each established by opening the scan or
    by reading the chapter; they are the eight attributions the ticket lists as wrong
    plus the two its acceptance names. If this ever fires, someone has re-broken the
    page mapping, and the right response is to open a scan, not to edit the table.
    """
    got = {p["plate"]: ch for ch, ps in by_ch.items() for p in ps}
    bad = [(n, want, got.get(n)) for n, want in sorted(PLATE_CHAPTER_EXPECTED.items())
           if got.get(n) != want]
    if bad:
        raise SystemExit("coverage_seed: plate->chapter regression:\n" + "\n".join(
            f"  plate #{n}: expected chapter {want}, got {had}" for n, want, had in bad))
    return len(PLATE_CHAPTER_EXPECTED)


def sections():
    """Narrative sections, in BOTH numberings — they are ten pages apart, and giving
    only the hp.db one beside chapter ranges that are in the translation's numbering
    is how the two got conflated in the first place.

    These boundaries are NOT trustworthy past page_seq ~167, and neither number will
    fix that: `page_concordance.section` drifts progressively earlier than the
    material it names. Checked 2026-09-20 against the pages of the plates that belong
    to each section: DARK_FOREST through PROCESSION agree exactly, VENUS_TEMPLE is 17
    pages early, POLYANDRION 47, CYTHERA_GARDENS 74, and BOOK_II_POLIA is marked as
    beginning at page_seq 271 when Book II in fact opens at page_seq 371 (our p.381,
    "POLIPHILO BEGINS THE SECOND BOOK"). Do not use a section boundary to decide where
    a chapter is; use chapters[].pages_1499. Ticket bug-concordance-section-drift.
    """
    con = sqlite3.connect(HPDB)
    rows = con.execute("select section, min(page_seq), max(page_seq) from page_concordance "
                       "group by section order by min(page_seq)").fetchall()
    con.close()
    k = PAGE_SEQ_TO_TRANSLATION
    return [{"section": s, "pages_1499": [a, b], "pages_translation": [a + k, b + k]}
            for s, a, b in rows]


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
    checked = check_plates(by_ch)          # raises if the page mapping has re-broken
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
        "page_numbering": {
            "note": "There are TWO page numberings in this project and they are ten pages "
                    "apart. Mixing them is ticket bug-plate-page-seq-offset, which filed most "
                    "of Book II one chapter early.",
            "translation": "translation/en/page_NNN.md counts from the title page. "
                           "chapters[].pages_1499 and plates[].page_translation are in THIS "
                           "numbering, despite the older field name.",
            "hp_db": "hp.db page_seq counts from a1r, the leaf the text begins on, ten pages "
                     "later. plates[].page_1499 and sections_1499[].pages_1499 are in THIS "
                     "numbering. The scans hp1499_pNNN.jpg are named by it too.",
            "offset": PAGE_SEQ_TO_TRANSLATION,
            "shape": "one constant across the whole book — not a step function, and with no "
                     "break at the Book I/II seam. Measured 2026-09-20 at eight scan/page "
                     "pairs spanning chapters I, XVII, XXI, XXIV, XXVI, XXXI and XXXIII; the "
                     "measurements are listed in scripts/coverage_seed.py.",
            "caveat": "woodcut_catalog.page_seq is itself only good to about +/-2 pages "
                      "(LLM_ASSISTED subject-matching; see its link_basis column), so a plate "
                      "sitting within a page or two of a chapter boundary may still be on the "
                      "wrong side of it. Plates carrying page_checked have been seen on the "
                      "scan; the rest have not.",
            "regression_check": f"{checked} plate->chapter pairs asserted on every seed "
                                f"(check_plates() in scripts/coverage_seed.py)",
            "sections_caveat": "sections_1499 comes from page_concordance.section, whose "
                               "boundaries drift progressively early past page_seq ~167 — "
                               "BOOK_II_POLIA is marked at 271 when Book II opens at 371. "
                               "Shifting it by the offset does not repair it. Use "
                               "chapters[].pages_1499 to place a chapter, never a section. "
                               "Ticket bug-concordance-section-drift.",
        },
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
