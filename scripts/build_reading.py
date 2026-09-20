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

WHICH LEAVES ARE EMITTED. Every page the manifest tracks, except one that is
genuinely blank. `status` will not tell you which those are: it is derived from
disk by translation_status.py, which calls any page with a zero-byte Italian
source "blank", and four pages have none — 55, 90, 195 and 380. Only 380 is
really empty (the turn before the Book II title page). The other three are
entirely picture: the great gate, the tiered fountain, and the full-page worship
of Priapus, the book's most explicit cut. Skipping all four lost three plates
from Read mode — invisible, not misplaced, which is worse. The manifest now
carries `"leaf": "full-page-woodcut" | "blank"` beside the status, and this
script emits a woodcut leaf with an empty body, its plate, and the manifest's
own `note` as the editorial line. Ticket bug-reading-drops-the-full-page-
woodcut-leaves, 2026-09-20.

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
from coverage_seed import (PAGE_SEQ_TO_TRANSLATION,   # the ONE measured constant
                           PLATE_PAGE_FIXES,          # per-plate pages measured on the scans
                           PLATE_NO_WOODCUT,          # catalogue rows no woodcut answers to
                           PLATE_DUPLICATE_ROWS,      # rows that duplicate another row
                           PLATE_PAGE_UNRESOLVED)     # rows whose true page is not yet known

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

# Fallback for a leaf the manifest marks `"leaf": "full-page-woodcut"` but for which
# nobody has yet written a `note`. The three that exist today all have one.
FULL_PAGE_WOODCUT_NOTE = ("This leaf of the 1499 is a full-page woodcut: the cut is printed "
                          "to the frame and there is no text on the page to translate.")


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


# ── Plate captions ───────────────────────────────────────────────────────────
#
# debt-reading-plate-captions-come-from-a-jittery-column, 2026-09-20.
#
# The caption used to be `select page_1499, title from woodcuts` + the offset.
# `woodcuts.page_1499` is a second LLM-assisted column, sibling to the
# `woodcut_catalog.page_seq` the IMAGE is bound by, and the two disagree about
# which catalogue row sits on which leaf on 63 of the 162 pages that carry a
# plate. So a caption could — and did — name a cut that is not the one printed on
# the page the reader is looking at.
#
# Opening the scans settled a thing neither ticket assumed: BOTH columns are
# jittery, in opposite directions in different parts of the book. Through the
# Temple of Venus and the Polyandrion the corrected catalogue runs about two
# pages EARLY and `woodcuts` is right (#79, #80, #107); through the garden and
# the Adonis fountain the catalogue is right and `woodcuts` is wrong (#124,
# #126, #149, #150); and in a few places neither is right (#102, #104, #139,
# #140). So "route the caption through woodcut_catalog" alone would have traded
# one set of wrong captions for another.
#
# What ships instead, in order of authority:
#
#   1. PLATE_CAPTION_CHECKED — a page whose scan was opened in this pass. The
#      caption says what is actually printed on the leaf, and the entry records
#      the identifying line of Italian or inscription that settles it. A value of
#      None means the leaf was opened and carries NO woodcut, so it gets no
#      caption at all.
#   2. Otherwise, woodcut_catalog.description — the corrected source's own words,
#      the same binding the image uses — but ONLY where exactly one catalogue row
#      resolves to the page AND `woodcuts.page_1499` independently agrees that
#      that same catalogue row is on that same page. Two columns derived
#      separately, agreeing, is real corroboration; it is the 95-page majority,
#      and the ticket's own spot checks (p.14 the dark forest, p.38 the elephant)
#      are in it.
#   3. Otherwise NO CAPTION. An uncaptioned plate is a small loss; a confident
#      caption on the wrong picture is the defect being closed.
#
# Rows coverage_seed.py has already measured as junk — no woodcut answers to them
# (PLATE_NO_WOODCUT), or they duplicate another row (PLATE_DUPLICATE_ROWS), or
# their true page is unknown (PLATE_PAGE_UNRESOLVED) — are dropped before any of
# this, so they can never supply a caption.
#
# page -> (caption or None, the evidence that settles it)
PLATE_CAPTION_CHECKED = {
    48:  (None,
          "Scan opened: unbroken text, NO woodcut on the leaf — the relief of Vulcan's forge "
          "described in prose, 'Sedeua sopra uno saxo sincto, cum una pelle hircina'. The old "
          "column captioned this leaf 'Architectural Portal'; that cut is on p.55."),
    55:  ("Ancient gate with medallion busts",
          "Full-page cut, printed to the frame, no body text. A pedimented aedicule with "
          "paired Corinthian columns on high pedestals, a medallion bust in each spandrel and "
          "a Greek inscription across the pediment. Catalogue #16. The old column called this "
          "leaf 'Ruins of the Temple'."),
    90:  ("Tiered fountain with winged sphinxes, lion masks and dragon heads",
          "Full-page cut, printed to the frame, no body text but the catchword. Catalogue #23."),
    94:  (None,
          "Scan opened: unbroken text, NO woodcut — the capitalised argument of chapter IX, "
          "'QVANTA INSIGNE MAIESTATE FVE QVELLA DELLA REGINA', with a decorated initial below "
          "it. A decorated initial is not a catalogued cut. The old column captioned this leaf "
          "'Queen Eleuterylida's Palace'."),
    97:  ("Frieze ornament with genii, bucranium and festoons",
          "The text above the cut ends 'Et in medio sopra gli uerticuli assideua una facia "
          "circunallata passamente di Puello' and the text below opens 'Et cum tali & "
          "simiglianti liniamenti decoratamente se extendeua il zophoro'. Catalogue #24, whose "
          "page a sibling ticket corrected 84->87. Note the `woodcuts` title for #24 is 'Queen "
          "Eleuterylida's Palace', which is not what is printed here."),
    161: (None,
          "Scan opened: unbroken text under the running head TRIVMPHVS, NO woodcut. The old "
          "column put the third triumphal car here; the car is on p.162."),
    162: ("First Triumph: the car drawn by centaurs, with nymphs and musicians",
          "Running head TRIVMPHVS — the left leaf of an opening. The text below the cut names "
          "the drawing team outright, 'sopra gli trahenti centauri'. Catalogue #47. Note the "
          "catalogue also files #49 on this leaf, which carries only ONE cut."),
    171: ("The third triumphal car; below it, Jupiter commits the infant Bacchus to Mercury",
          "TWO cuts. Running head TERTIVS over the upper car. The lower panel is labelled "
          "SECVNDA SINISTRA and the line between them reads 'Nelaltra io mirai esso opitulatore "
          "Iupiter, qllo medesimo infantulo, ad uno caeleste homo talaricato & caducifero gli "
          "offeriua' — Jupiter handing the child to the winged, caduceus-bearing one, who "
          "commends him to the nymphs in a cave. That is catalogue #60, which the catalogue "
          "files on p.170."),
    174: ("Vase relief: Jupiter and the Heliades",
          "The cut at the foot of the leaf: the nymphs rooting into trees before Jove, saplings "
          "springing from their heads. The text above it describes the seven turning 'in "
          "uerdigiate arbore di smaragdina'. Catalogue #62, which is still filed at page_seq "
          "161 (our p.171); bug-woodcut-catalog-page-jitter measured this page and recorded it "
          "but deliberately left it out of PLATE_PAGE_FIXES as outside that ticket's scope. "
          "Confirmed here independently."),
    175: ("Vintage scene with genii and young Bacchus",
          "Genii treading grapes into a great vat and gathering them in baskets under a "
          "trellis. The line below the cut begins 'Fora del prescripto uaso, germinaua una "
          "frondosa uite doro cum gli irriciati pampini'; signature 'l iiii'. Catalogue #63. "
          "The old column captioned this leaf 'Festive Scene at Fountain'."),
    176: ("Fourth Triumph, left half: the car drawn by the ass, with the great vase and thyrsi",
          "Running head TRIVMPHVS. The text below names the Maenads, the sacred Orgies, the "
          "thyrsi and 'el triumpho fileo seniculo lo asello eqtante' — Silenus riding the little "
          "ass — and closes on the Bacchic roll-call. The catalogue's #64 calls this half "
          "'panthers (left)'; the panthers are on the RIGHT leaf, p.177. Its left/right "
          "parentheticals are inverted for this opening."),
    177: ("Fourth Triumph, right half: the car drawn by panthers",
          "Running head QVARTVS, so the opening reads TRIVMPHVS | QVARTVS across the two "
          "leaves. Four collared spotted beasts draw the car. Below the cut stands the "
          "capitalised argument of the next chapter. Catalogue #65, which describes this half "
          "as 'Silenus on ass (right)'; the ass is on the left leaf."),
    218: ("Temple ceremony at the round font, the priestess with the open book",
          "The cut shows a great round wellhead on a stepped base, its drum carved with dancing "
          "figures. The text above it ends 'la sacrificatrice Presule cum le altre astante, da "
          "praecipua dolcecia comote, non tinerene se poteron da lachrymule & dolci suspiruli'; "
          "catchword 'Laquale'. Catalogue #78."),
    220: ("Two virgins offering swans and doves for sacrifice",
          "The front figure carries a swan by the neck, the second a basket, under an arcade, "
          "with the temple interior through the arch at right. The text below opens 'Et quiui "
          "le ualue doro reserate, inseme introrono'. Catalogue #79 — which the corrected "
          "catalogue files on p.218, two pages early. The OLD column had this page right."),
    222: ("The altar in the Temple of Venus",
          "A great footed vessel on a stepped pedestal, crowned with flame and hung with beaded "
          "festoons. The text beside it runs 'Dal marmoreo & gradato pedamento, fino allo initio "
          "dil stilo exclusiuo'. Catalogue #80 — which the corrected catalogue files on p.220. "
          "The OLD column had this page right."),
    223: ("Temple ceremony: the priestess with the open ritual book before the altar",
          "The text above the cut reads 'Disubito la intenta sacerdotula admonita dirinpecto "
          "alla sacrificante Polia cum il rituale libro aperto uenerabonda se apraesentoe'; "
          "signature 'o iiii'. ONE cut on the leaf, confirming coverage_seed's "
          "PLATE_DUPLICATE_ROWS entry that #83 duplicates #82."),
    243: ("The obelisk of the Polyandrion, and the round IVSTITIA medallion",
          "TWO cuts: the plain obelisk on its stepped base at the right, and the medallion of "
          "the balance, crown and sword, inscribed 'IVSTITIA RECTA AMICITIA ET ODIO EVAGINATA "
          "ET NVDA ET PONDERATA LIBERALITAS REGNVM FIRMITER SERVAT'. Catalogue #87 and #88, "
          "both confirmed; and no third cut, confirming PLATE_NO_WOODCUT for #86."),
    245: ("Two hieroglyphic medallions: MILITARIS PRVDENTIA, and the trophy of DIVI IVLII",
          "The upper medallion carries an eagle over an anchor with a seated soldier, inscribed "
          "'MILITARIS PRVDENTIA, SEV DISCIPLINA IMPERII EST TENACISSIMVM VINCVLVM'; the lower, "
          "a trophy with palms, cornucopiae, an eye and a comet, inscribed 'DIVI IVLII "
          "VICTORIARVM ET SPOLIORVM COPIOSISSIMVM TROPHAEVM, SEV INSIGNIA'. Catalogue #89 and "
          "#90. The old column put the Julius medallion on p.244."),
    257: ("A broken epitaph tablet, and the sepulchral urn with the Greek inscription",
          "TWO cuts side by side: a pedimented stele fractured down its right edge, and a "
          "two-handled urn lettered in Greek. The text above ends 'nel fronte dilla fractura era "
          "questa praestante scriptura', the text below opens 'Relicti questi rupti monumenti'. "
          "The urn is catalogue #102, which NEITHER column places here — the catalogue files it "
          "on p.259, the old column on p.260."),
    259: ("A tetragonal altar surmounted by a vase, with the C. VIBIVS epigram",
          "ONE cut: a square moulded altar carrying a Latin epitaph beginning 'INFER D DEAB Q' "
          "for a youth dead at nineteen. The text above it reads 'nella ara uidi tale "
          "epigrama'. Catalogue #103."),
    260: ("An epitaph panel with bucrania and swags, and the D.M. LYNDIA epitaph",
          "TWO cuts: a small panel lettered in Greek between two ox-skulls with foliate swags, "
          "and the broken tablet inscribed 'D. M. LYNDIA THASIVS PVELLA'. Catalogue #104 and "
          "#105 — which the catalogue files on pp.257 and 261, and the old column files #104 on "
          "p.268."),
    262: ("Sarcophagus with hieroglyphic devices",
          "A chest whose front panel carries a row of devices — mask, spindle, bird, arrows, "
          "ring, serpents, a fly, an altar — over the inscription 'DIIS MANIBVS MORS VITAE "
          "CONTRARIA ET VELOCISSIMA CVNCTA CALCAT'. Catalogue #107, which the catalogue files "
          "on p.260. The OLD column had this page right."),
    319: ("A square flower-bed ornament, and a clipped tree on an altar-vase with bucrania",
          "TWO cuts. The upper is a SQUARE interlace panel with a rosette at its centre — "
          "catalogue #124, 'Square ornament of a flower-bed', confirmed here against the old "
          "column's p.321. The lower is a clipped topiary rising from an altar-vase, and the "
          "text beside it reads 'una inane ara, rotundata di petra di flauo numidico cum tre "
          "capitale ossature di boue' — the three ox-skulls of catalogue #125, which the "
          "catalogue files all the way back on p.305. Signature 'u iiii'."),
    321: ("Pattern of a flower-bed",
          "One large bed drawn in perspective, nine compartments of octagon-and-square "
          "interlace, and the text names the herb planted in each in order — Laurentia, "
          "Tarchon, Achilea, Senniculo, Diosmo, Terrambula, Baccara, Amaraco, Polythricho. "
          "Catalogue #126."),
    340: ("Precious stone vase throwing fiery sparks",
          "The text beside the cut: 'Fora dil quale latulo orificio uolante & crepitante, cum "
          "gratissimo scloppo scintille resultauano, per laire discurrendo lucente'. Catalogue "
          "#139. The OLD column has #139 and #140 swapped between this leaf and p.341; the "
          "catalogue puts both of them on p.341."),
    341: ("Earthenware amphora with odoriferous fumes",
          "A globular long-necked vessel, fume issuing from the mouth, its body band lettered "
          "in Greek — and the text counts the letters: 'tredeci litere graece mensuratissime "
          "diligentemente impresse', then 'uno nebulante & euodio fumo'. Catalogue #140."),
    373: ("The Fountain of Venus: water from the sarcophagus of Adonis",
          "The roundel set in the rose trellis reads ADONIA, and the text below the cut opens "
          "'sopra il fonte. Nelquale aptamente era infixo uno serpe aureo ... euomeua largamente "
          "nel sonoro fonte la chiarissima aqua'. Catalogue #149 — whose `woodcuts` title, "
          "'Poliphilus and Polia at Fountain of Venus', is not what is printed here."),
    375: ("The statue of Venus above the tomb of Adonis, with nymphs",
          "The panel roundel reads IMPVRA SVAVITAS. The text below the cut opens 'Facto & pacta "
          "debitamente questa honoraria & diuota cerimonia, fora usciscimo della sacrata "
          "perguletta'. Catalogue #150."),
    396: ("Polia in the temple of Diana, Poliphilo prostrate",
          "Altar with two tall candlesticks, Polia kneeling with an open book, Poliphilo "
          "collapsed on the pavement before her. The text above the cut ends 'rachiusi gli "
          "somersi ochii allato me se morite'. Catalogue #152, and this confirms the sibling "
          "ticket's correction of its page_seq 386."),
    446: ("Polia reading the lover's letter in the bed-chamber",
          "The canopied bed, the little dog on the floor, Polia standing with the open letter, "
          "a landscape through the window. The letter itself ends immediately above the cut, "
          "'in perpetuo affectuosamente, & uiuo, & morto tuo sum. Vale.' Catalogue #165, and "
          "this confirms the sibling ticket's correction of its page_seq 436."),
}


def plate_captions():
    """page -> the caption for the plate frame. See PLATE_CAPTION_CHECKED above.

    The IMAGE is found by filename (images/woodcuts_1499/pNNN.jpg), so the plates
    work with or without the database; this only supplies the caption. The corpus
    is a separate repository and is read-only from here.
    """
    out = {}
    checked = 0
    for pg, (cap, _why) in PLATE_CAPTION_CHECKED.items():
        checked += 1
        if cap:
            out[pg] = cap
    try:
        import sqlite3
    except ImportError:
        return out, checked, 0
    if not HPDB.exists():
        return out, checked, 0
    corroborated = 0
    try:
        db = sqlite3.connect(f"file:{HPDB}?mode=ro", uri=True)
        junk = set(PLATE_NO_WOODCUT) | set(PLATE_DUPLICATE_ROWS) | set(PLATE_PAGE_UNRESOLVED)
        # the corrected catalogue: the SAME binding the image is found by
        cat = {}
        for num, desc, raw in db.execute(
                "select catalog_number, description, page_seq from woodcut_catalog"):
            if num in junk:
                continue
            seq = PLATE_PAGE_FIXES.get(num, raw)
            if seq is None:
                continue
            cat.setdefault(seq + PAGE_OFFSET, []).append((num, desc))
        # the independent second opinion, used only to corroborate, never to caption
        second = {}
        for num, pg in db.execute(
                "select catalog_number, page_1499 from woodcuts "
                "where catalog_number is not null and page_1499 is not null"):
            second[num] = int(pg) + PAGE_OFFSET
        db.close()
        for pg, rows in cat.items():
            if pg in PLATE_CAPTION_CHECKED:
                continue                      # the scan outranks both columns
            if len(rows) != 1:
                continue                      # more than one row claims the leaf: unsettled
            num, desc = rows[0]
            if second.get(num) != pg:
                continue                      # the two columns do not agree: unsettled
            out[pg] = desc
            corroborated += 1
    except Exception as e:                      # a caption is not worth failing over
        print(f"  (no captions: {e})")
        return out, checked, 0
    return out, checked, corroborated


def main():
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    titles, cap_checked, cap_corroborated = plate_captions()
    have_plate = {int(f.stem[1:]) for f in PLATES.glob("p*.jpg")} if PLATES.is_dir() else set()
    tours = json.loads(TOURS.read_text(encoding="utf-8"))
    stops = (tours.get("tours") or tours)["novel"]["stops"]
    ch2st = chapter_to_station(stops)
    ranges = page_to_station_ranges(stops)
    pages, last_station, missing = [], None, set()

    for n in sorted(int(k) for k in man["pages"]):
        rec = man["pages"][str(n)]
        # A LEAF THAT IS ENTIRELY PICTURE IS NOT A BLANK LEAF. `status` is derived
        # from disk by translation_status.py and turns every zero-byte Italian
        # source into "blank", so pp.55, 90 and 195 — the great gate, the tiered
        # fountain and the full-page Priapus — were dropped here along with p.380,
        # which really is a blank turn before the Book II title page. The manifest
        # now says which is which in `leaf`; see its `leaf_values`.
        # (bug-reading-drops-the-full-page-woodcut-leaves, 2026-09-20.)
        leaf = rec.get("leaf")
        if rec.get("status") == "blank" and leaf != "full-page-woodcut":
            continue
        f = EN / f"page_{n:03d}.md"
        if not f.exists() and leaf != "full-page-woodcut":
            continue
        ch = rec.get("chapter") or ""
        hit = station_for_page(n, ch, ranges, ch2st)
        if hit:
            last_station = hit["station"]
        elif ch:
            missing.add(ch)
        if f.exists():
            paras, note = body_of(f)
        else:
            # A full-page-woodcut leaf with no translation/en/ file at all. The
            # editorial line IS the page: it says what the reader is looking at and
            # why there is nothing to read. Written in the manifest, not here, so a
            # future such leaf is a data change rather than a code change.
            paras = []
            note = rec.get("note") or FULL_PAGE_WOODCUT_NOTE
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
    withcap = sum(1 for p in pages if p.get("wcap"))
    print(f"  plates   {withplate} pages carry their own 1499 woodcut")
    print(f"  captions {withcap} of those carry a caption "
          f"({cap_checked} pages had their scan opened, {cap_corroborated} more are "
          f"corroborated by both columns agreeing); {withplate - withcap} are left "
          f"uncaptioned rather than captioned on a guess")
    if textless:
        print(f"  no body text (full-page woodcuts, signature-only leaves): {textless}")
    if missing:
        print(f"  NO STATION for chapter(s): {sorted(missing)}")


if __name__ == "__main__":
    main()
