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
    33:  ("Two pedestal ends: the garland with D. AMBIG. D.D., and the garland with EQVVS "
          "INFOELICITATIS",
          "TWO cuts side by side, the two ends of the horse's pedestal: a garland of "
          "marjoram and fern enclosing '·D· AMBIG ·D·D·', and a garland of orpine "
          "enclosing 'EQVVS INFOELICITATIS'. The text between them reads 'Nellaquale "
          "inscalpta teniua tale scriptura di maiuscule Latine'. Catalogue #7 and #8, "
          "both already confirmed on this leaf by coverage_seed."),
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
    159: ("PRIMA TABELLA: the car with the bull relief; below, SECVNDA SINISTRA: Europa "
          "borne over the sea",
          "TWO cuts, each with its title cut in capitals above it. Signature 'k iiii' at "
          "the foot. Catalogue #44 and #45."),
    161: (None,
          "Scan opened: unbroken text under the running head TRIVMPHVS, NO woodcut. The old "
          "column put the third triumphal car here; the car is on p.162."),
    162: ("First Triumph: the car drawn by centaurs, with nymphs and musicians",
          "Running head TRIVMPHVS — the left leaf of an opening. The text below the cut names "
          "the drawing team outright, 'sopra gli trahenti centauri'. Catalogue #47. Note the "
          "catalogue also files #49 on this leaf, which carries only ONE cut."),
    163: ("First Triumph, right half: the car drawn by centaurs, with nymphs and musicians",
          "Running head PRIMVS, so the opening reads TRIVMPHVS | PRIMVS across "
          "pp.162-163. The text below the cut begins the second triumph, 'EL SEQVENTE "
          "triumpho nõ meno mirauiglioso del primo'. Catalogue #48."),
    164: ("TABELLA DEXTRA: Leda brought to bed, the eggs borne to the temple; below, "
          "TABELLA SINISTRA: the king offering the eggs before Apollo",
          "TWO cuts, each titled above in capitals; the lower carries the oracle 'VNI "
          "GRATVM MARE ALTERVM GRATVM MARI' on a tablet between the columns. Catalogue "
          "#49 and #50, whose pages are measured in PLATE_PAGE_FIXES. THIS LEAF WAS "
          "CAPTIONED WRONG until now: it fell in the corroborated tier, where both "
          "columns agree in putting #51 here — and #51 is the cut on p.165. Two "
          "independent columns can be wrong together, because the jitter that moved one "
          "moved the other."),
    165: ("PARS ANTERIOR ET POSTERIOR: Cupid pricking figures into the starry sky; the "
          "Judgment of Paris",
          "ONE cut, titled above. Its own text stands on the leaf before: 'Nel anteriore "
          "fronte se uideua uno bellissimo Cupidine puellulo, nel æthera leuato' and 'In "
          "nel posteriore, el magno Iupiter, uno solerte pastore, in suo loco iudice "
          "collocaua'. Catalogue #51."),
    166: ("Second Triumph, left half: the car bearing Leda and the swan",
          "Running head TRIVMPHVS. The text beneath names them, 'uidi uno bianchissimo "
          "Cycno, negli amorosi amplexi duna inclyta Nympha filiola de Theseo'. Catalogue "
          "#52."),
    167: ("Second Triumph, right half: the six white elephants drawing the car",
          "Running head SECVNDVS — the opening reads TRIVMPHVS | SECVNDVS. The text below "
          "begins the third triumph, 'EL TERTIO cæleste triumpho seguiua cum quatro "
          "uertibile rote di Chrysolitho æthiopico'. Catalogue #53. One of the 38 leaves "
          "no catalogue row resolved to before this sweep, and emphatically not a page of "
          "type."),
    168: ("TABELLA DEXTRA: Acrisius before the oracle and the brazen tower building; "
          "below, SECVNDA SINISTRA: Perseus with the Gorgon head and Pegasus",
          "TWO cuts, each titled above. Catalogue #54 and #55. Like p.164 this leaf was "
          "CAPTIONED WRONG by the corroborated tier, which put #56 here; #56 is the cut "
          "on p.169."),
    169: ("PARS ANTERIOR ET POSTERIOR: Mars and Venus freed; Jupiter consoling Cupid; the "
          "golden shower on Danae",
          "ONE cut in THREE panels, titled above; the middle panel carries the Greek "
          "'ΣΥΜΟΙ ΓΛΥΚΥΣ ΑΛΛΑ ΠΙΚΡΟΣ'. The text beneath names the next team, 'sei "
          "atrocissimi monoceri'. Signature 'l'. Catalogue #56."),
    170: ("Third Triumph, left half: the car drawn by unicorns; below, TABELLA DEXTRA: "
          "Semele in the flame and the infant Bacchus",
          "TWO cuts. Running head TRIVMPHVS over the car, whose team carry the single "
          "horn the leaf before calls 'monoceri'. The text under the lower panel begins "
          "'EL QVARTO triũpho'. Catalogue #57 and #58."),
    171: ("The third triumphal car; below it, Jupiter commits the infant Bacchus to Mercury",
          "TWO cuts. Running head TERTIVS over the upper car. The lower panel is labelled "
          "SECVNDA SINISTRA and the line between them reads 'Nelaltra io mirai esso opitulatore "
          "Iupiter, qllo medesimo infantulo, ad uno caeleste homo talaricato & caducifero gli "
          "offeriua' — Jupiter handing the child to the winged, caduceus-bearing one, who "
          "commends him to the nymphs in a cave. That is catalogue #60, and the cut above "
          "it is #59, the right half of the third triumph; both pages are measured in "
          "PLATE_PAGE_FIXES."),
    172: ("PARS ANTERIOR ET POSTERIOR: Psyche with the lamp; Venus and Cupid before Jupiter",
          "ONE cut, titled above; the right panel carries the tablet 'PER FER SCINTILLAM "
          "QVI CAELVM ACCENDIS ET OMNES'. The text below moves on to the Hyrcanian tigers "
          "of the fourth triumph. Catalogue #61."),
    174: ("Vase relief: Jupiter and the Heliades",
          "The cut at the foot of the leaf: the nymphs rooting into trees before Jove, saplings "
          "springing from their heads. The text above it describes the seven turning 'in "
          "uerdigiate arbore di smaragdina'. Catalogue #62; the page is measured in "
          "PLATE_PAGE_FIXES."),
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
    180: (None,
          "Scan opened: unbroken text, NO woodcut — 'el uolto mio & gli sũmissi suspiruli "
          "me accusauão', and the first dance of the nymphs below it."),
    185: (None,
          "Scan opened: unbroken text, NO woodcut; signature 'm' at the foot."),
    190: (None,
          "Scan opened: unbroken text, NO woodcut."),
    191: ("The Triumph of Vertumnus and Pomona: the car drawn by four horned fauns",
          "The tablet printed beneath the cut reads 'INTEGERRIMAM CORPOR. VALITVDINEM, ET "
          "STABILE ROBVR, CASTASQVE MEMSAR. DELITIAS, ET BEATAM ANIMI SECVRITATEM "
          "CVLTORIB. M. OFFERO.' Signature 'm iiii'. Catalogue #66. The corpus's woodcut "
          "photographs hold NO file for this page; the plate comes from the second "
          "facsimile (fetch_1499_plates.py, IA_FALLBACK)."),
    192: ("Spring: the flower-girdled goddess casting flowers into the flaming Chytropode",
          "Captioned on the cut itself, 'FLORIDO VERI .S.', the winged boy and the two "
          "doves beside her. Catalogue #67. Plate from the second facsimile; see p.191."),
    193: ("Summer and Autumn: the corn-crowned damsel with the cornucopia of grain, and "
          "the vine-crowned youth with the goat",
          "TWO reliefs on the leaf, captioned on the cuts, 'FLAVAE MESSI.S.' and "
          "'MVSTVLENTO AVTVMNO .S.' Catalogue #68 and #69. Plate from the second "
          "facsimile; see p.191."),
    194: ("Winter: the bearded king in the beast-skin, his sceptre raised into a "
          "hail-streaked sky",
          "Captioned on the cut, 'HYEMI AEOLIAE.S.' Catalogue #70. Plate from the second "
          "facsimile; see p.191."),
    200: (None,
          "Scan opened: unbroken text, NO woodcut."),
    210: (None,
          "Scan opened: unbroken text, NO woodcut — the eight wind-figures on the cupola "
          "and the gutturnium above them, described and not drawn."),
    214: ("Two inscribed tablets: the Greek ΠΑΝ ΔΕΙ ΠΟΙΕΙΝ ΚΑΤΑ ΤΗΝ ΑΥΤΟΥ ΦΥΣΙΝ, and "
          "TRAHIT SVA QVENQVE VOLVPTAS",
          "TWO cuts, one at each side of the text: moulded tablets, each hung with a "
          "leafy spray. NO catalogue row resolves to this leaf once PLATE_PAGE_FIXES is "
          "applied — the only row the old column put here is #83, which coverage_seed has "
          "measured as a duplicate of #82. The tablets are printed here all the same, so "
          "the caption is taken from them."),
    218: ("Temple ceremony at the round font, the priestess with the open book",
          "The cut shows a great round wellhead on a stepped base, its drum carved with dancing "
          "figures. The text above it ends 'la sacrificatrice Presule cum le altre astante, da "
          "praecipua dolcecia comote, non tinerene se poteron da lachrymule & dolci suspiruli'; "
          "catchword 'Laquale'. Catalogue #78."),
    220: ("Two virgins offering swans and doves for sacrifice",
          "The front figure carries a swan by the neck, the second a basket, under an arcade, "
          "with the temple interior through the arch at right. The text below opens 'Et quiui "
          "le ualue doro reserate, inseme introrono'. Catalogue #79; the page is measured in "
          "PLATE_PAGE_FIXES."),
    222: ("The altar in the Temple of Venus",
          "A great footed vessel on a stepped pedestal, crowned with flame and hung with beaded "
          "festoons. The text beside it runs 'Dal marmoreo & gradato pedamento, fino allo initio "
          "dil stilo exclusiuo'. Catalogue #80; the page is measured in PLATE_PAGE_FIXES."),
    223: ("Temple ceremony: the priestess with the open ritual book before the altar",
          "The text above the cut reads 'Disubito la intenta sacerdotula admonita dirinpecto "
          "alla sacrificante Polia cum il rituale libro aperto uenerabonda se apraesentoe'; "
          "signature 'o iiii'. ONE cut on the leaf, confirming coverage_seed's "
          "PLATE_DUPLICATE_ROWS entry that #83 duplicates #82."),
    229: ("The priestess at the round font, Polia kneeling with the open book",
          "ONE cut: the columned temple interior, the great wellhead, the priestess with "
          "her wand raised, the nymphs about it, Poliphilo praying at the right. The "
          "prayer below the cut opens 'O sanctissima & Enthea Erothea matre pia'. NO "
          "catalogue row resolves to this leaf; the caption is taken from the leaf."),
    231: ("The priestess strewing roses and sea-shells over the altar, Polia kneeling to "
          "receive",
          "ONE cut. The text above it reads 'quelle cerimoniosamente sopra dillara, i "
          "circuito dillo ignitabulo sparse, Et posto in uno cortice di ostrea, dilaqua "
          "marina dilla Irnella asperse tota la diuina Ara'. NO catalogue row resolves "
          "here: the two the catalogue files on this leaf, #84 and #85, are on pp.232 and "
          "234 (measured in PLATE_PAGE_FIXES). The caption is taken from the leaf."),
    232: ("The miracle of the roses: the rose-tree springing from the altar, the doves in "
          "its branches",
          "ONE cut: the virgins prostrate on the pavement, the priestess reaching up with "
          "the golden dish, Poliphilo praying at the right; catchword 'Onde'. Catalogue "
          "#84."),
    234: ("Poliphilo kneeling to receive the miraculous fruit from the priestess",
          "ONE cut, under the rose-tree, the virgins ranged about the altar. The text "
          "below begins 'Hora non piu p̃sto che io degustai il miraculoso & suauissimo "
          "pomulo'. Catalogue #85."),
    238: ("The ruined temple by the shore: the broken rotunda, the fallen columns, the "
          "palm and the obelisk",
          "ONE cut, Poliphilo and Polia standing small at the left. The text immediately "
          "above ends 'al spatioso & harenulato litore di piaceuoli plémyruli irruenti "
          "relixo, oue era il destructo & deserto tempio pueníssimo'. Catalogue #86 — "
          "the row coverage_seed had recorded as answering to no woodcut at all. It "
          "answers to this one, five leaves before the first page anybody had opened."),
    243: ("The obelisk of the Polyandrion, and the round IVSTITIA medallion",
          "TWO cuts: the plain obelisk on its stepped base at the right, and the medallion of "
          "the balance, crown and sword, inscribed 'IVSTITIA RECTA AMICITIA ET ODIO EVAGINATA "
          "ET NVDA ET PONDERATA LIBERALITAS REGNVM FIRMITER SERVAT'. Catalogue #87 and #88, "
          "both confirmed; and no third cut, confirming PLATE_NO_WOODCUT for #86."),
    244: ("The hieroglyphic band DIVO IVLIO CAESARI, and the medallion of the elephants "
          "and the caduceus",
          "TWO cuts. The upper is a band of devices — eye, palm, sword, yoke, sun and "
          "moon in one disk, vase, wheel, dove, domed shrine, torches — over 'DIVO IVLIO "
          "CAESARI SEMP. AVG. TOTIVS ORB. GVBERNAT. OB ANIMI CLEMENT. ET LIBERALITATEM "
          "AEGYPTII COMMVNIA ERE.S. EREXERE.' The lower is a roundel of two elephants "
          "over two ants about a knotted caduceus, which the text beside it reads out: "
          "'PACE, AC CONCORDIA PARVAE RES CRESCVNT, DISCORDIA MAXIMAE DECRESCVNT.' NO "
          "catalogue row resolves here. #91 and #92 are the only unclaimed rows of the "
          "Polyandrion run and are by elimination probably these two, but no leaf names "
          "them, so coverage_seed files them PLATE_PAGE_UNRESOLVED rather than guess."),
    245: ("Two hieroglyphic medallions: MILITARIS PRVDENTIA, and the trophy of DIVI IVLII",
          "The upper medallion carries an eagle over an anchor with a seated soldier, inscribed "
          "'MILITARIS PRVDENTIA, SEV DISCIPLINA IMPERII EST TENACISSIMVM VINCVLVM'; the lower, "
          "a trophy with palms, cornucopiae, an eye and a comet, inscribed 'DIVI IVLII "
          "VICTORIARVM ET SPOLIORVM COPIOSISSIMVM TROPHAEVM, SEV INSIGNIA'. Catalogue #89 and "
          "#90. The old column put the Julius medallion on p.244."),
    246: ("The Polyandrion architrave: the decapitated owl and the antique lamp, over "
          "D.M.S. CADAVERIB. AMORE FVRENTIVM MISERABVNDIS POLYANDRION",
          "ONE cut. The text below reads it out: 'Vno uolucre decapitato, arbitrai fusse "
          "di Bubone, & una uetusta lucerna ... VITAE LETHIFER NVNTIVS'. Catalogue #93, "
          "whose catalogued page is right; #91 and #92, also filed here, are not on this "
          "leaf."),
    250: (None,
          "Scan opened: unbroken text, NO woodcut — the painted Hell described, 'lanime "
          "che allardente incendio, dãnate erano'; catchword 'Dunque'."),
    252: ("The four-square altar: ARAM DEVM INFER. VIATOR HIC CAESAM LAODIAM PVBLIAM INSPICE",
          "ONE cut. The text above it reads 'In questo loco uidi una quadrata ara, Nella "
          "facia ouero fronte dillaquale di maiuscule p̃fecte questo titulo trouai "
          "inscripto'. NO catalogue row resolves to this leaf; the caption is taken from "
          "the inscription."),
    254: ("The gladiator's epitaph: D.M. GLADIATORI MEO AMORE CVIVS EXTREME PERVSTA",
          "ONE cut, a tall framed tablet filling the upper half of the leaf. The text "
          "below begins 'Daposcia che io hebbi questi dui epitaphii accuratamente "
          "perlecti'. NO catalogue row resolves to this leaf; the caption is taken from "
          "the inscription."),
    255: ("Sacrifice relief at the altar lettered HAVE LERIA OMNIVM AMANTISS. VALE",
          "ONE cut: the old man pouring at the altar, the faun with the double pipes, the "
          "matron with the reversed torch, the little satyr holding a serpent. Signature "
          "'q iiii'. Catalogue #99, whose catalogued page is right."),
    256: ("Epitaph in an aedicule, the pediment with the eagle between two dolphins: D.M. "
          "VIATOR HVC PROPIVS FER TO OCVLOS",
          "ONE cut, filling the leaf above the text. Catalogue #100."),
    257: ("A broken epitaph tablet, and the sepulchral urn with the Greek inscription",
          "TWO cuts side by side: a pedimented stele fractured down its right edge, and a "
          "two-handled urn lettered in Greek. The text above ends 'nel fronte dilla fractura era "
          "questa praestante scriptura', the text below opens 'Relicti questi rupti monumenti'. "
          "The urn is catalogue #102; the page is measured in PLATE_PAGE_FIXES."),
    258: ("The full-page epitaph of Leontia and Lolius: HEV SVIATOR PAVLVLVM INTERSERE "
          "MANIB. ADIVRAT",
          "The whole leaf is one framed inscription, ending 'HANC TE SCIRE VOLEBAM "
          "INFOELICITATEM. VALE.' Whether the frame is cut in wood or ruled up in type "
          "cannot be told from the scan, but the leaf carries no body text whatever. NO "
          "catalogue row resolves here, and it is NOT #108, which is the aedicule on "
          "p.263."),
    259: ("A tetragonal altar surmounted by a vase, with the C. VIBIVS epigram",
          "ONE cut: a square moulded altar carrying a Latin epitaph beginning 'INFER D DEAB Q' "
          "for a youth dead at nineteen. The text above it reads 'nella ara uidi tale "
          "epigrama'. Catalogue #103."),
    260: ("An epitaph panel with bucrania and swags, and the D.M. LYNDIA epitaph",
          "TWO cuts: a small panel lettered in Greek between two ox-skulls with foliate swags, "
          "and the broken tablet inscribed 'D. M. LYNDIA THASIVS PVELLA'. Catalogue #104 and "
          "#105; both pages are measured in PLATE_PAGE_FIXES."),
    261: ("The sarcophagus of P. Cornelia Annia, under its imbricated lid",
          "ONE cut. Catalogue #106, whose catalogued page is right; #105, also filed "
          "here, is on p.260."),
    262: ("Sarcophagus with hieroglyphic devices",
          "A chest whose front panel carries a row of devices — mask, spindle, bird, arrows, "
          "ring, serpents, a fly, an altar — over the inscription 'DIIS MANIBVS MORS VITAE "
          "CONTRARIA ET VELOCISSIMA CVNCTA CALCAT'. Catalogue #107; the page is measured in "
          "PLATE_PAGE_FIXES."),
    263: ("The full-page monument: O LECTOR INFOELIX HOC MONVMENT. ADES DVM TE VOCAT",
          "An aedicule with acroteria, a draped panel carrying the long epitaph of "
          "Chrysanthus and the serpent. Catalogue #108."),
    267: ("The monument of Artemisia drinking the ashes of Mausolus",
          "A full-page aedicule: the crowned queen enthroned in the niche, the roundel "
          "'ΕΡΩΤΟΣ ΚΑΤΟΠΤΡΟΝ' over the pediment and the tablet 'ΑΡΤΕΜΙΣΙΔΟΣ ΒΑΣΙΛΙΔΟΣ "
          "ΣΠΟΔΟΝ' below. Signature 'r ii'. Catalogue #110."),
    268: (None,
          "Scan opened: NO woodcut. A short tapering paragraph and then bare paper — what "
          "shows on the scan is the monument printing through from the leaf before. The "
          "text ends 'cum uno miserando caso nel Epitaphio di perfecte notule suscripto "
          "tale', which leads into the epitaph on p.269."),
    269: ("Two genii drawing the curtain from the busts of the young pair: ASPICE VIATOR "
          "Q. SERTVLLII ET DVLCICVLAE SPON. MEAE",
          "A full-page cut, a winged head in the pediment. Signature 'r iii'. Catalogue "
          "#111."),
    270: (None,
          "Scan opened: NO woodcut, only text — again the leaf before printing through. "
          "This page DESCRIBES the cut that stands on p.271: 'due albicante turturule i "
          "uno uasculo cõbibeuano' and 'una arca, cum due porte, chi entra morédo, & chi "
          "ne esse nascendo'. Both columns put #112 here, so this page of solid type was "
          "being captioned 'Sepulchral portal: narrow gates of life and death' by the "
          "corroborated tier, and was NOT in the 38-leaf no-woodcut list, which was "
          "derived from the catalogue. The catalogue misses in both directions."),
    271: ("The sepulchral portal of Trebia: ·D· DITI ET PROXER·S, with the gates NATVRAE "
          "NOVERCAE and NATVRAE MATRIS",
          "A full-page aedicule: two doves at a basin in the pediment, the epitaph of "
          "Trebia in the arch, and at the foot two little niches lettered 'NATVRAE "
          "NOVERCAE INEVITABILE STATVTVM' and 'NATVRAE MATRIS BENIGNVM EDICTVM' — the two "
          "doors of the text. Signature 'r iiii'. Catalogue #112."),
    280: (None,
          "Scan opened: unbroken text, NO woodcut — the sea-gods' procession, Melantho, "
          "the tritons and the nereids."),
    301: ("The fountain in the peristyle: the three golden hydra-heads spouting into the shell",
          "ONE cut: a colonnaded tabernacle on a round stepped base under a ribbed canopy "
          "with birds at its apex. The text beside it opens 'Nello intersito mediano "
          "dilla coæquata emblematura solistima dil peristylio era uno fonte fundato "
          "intro una rotũdatione'. Signature 't iiii'. NO catalogue row resolves to this "
          "leaf."),
    305: ("A box clipped as topiary on a round stepped base",
          "ONE cut. The text beside it reads 'Fora se exaltaua uno artificiato buxo, dil "
          "sequente topiario composito', opening the third parterre. The catalogue files "
          "#115, #116 and #125 on this leaf, which carries one cut; #125 is measured onto "
          "p.319, and rather than choose between the other two the caption is taken from "
          "the leaf."),
    306: ("A clipped tree of three orders rising from a vase with dragon-headed handles",
          "ONE cut. The text beside it runs 'Gli fructigeri arbori di forma hemispheria "
          "inconuexo' in this third order. The catalogue files #117, #118 and #119 on "
          "this leaf, which carries one cut, so the caption is taken from the leaf. The "
          "corpus's woodcut photographs hold NO file for this page; the plate comes from "
          "the second facsimile (fetch_1499_plates.py, IA_FALLBACK)."),
    317: ("A circular flower-bed: rhombs within circles, circles within rhombs",
          "ONE cut, running off the fore-edge at the right. The text beside it reads 'Tra "
          "le recensuite strate intersticiamente circũsepte erano le p̃scripte figure. "
          "Dẽtro le rhõboide, circuli. Dẽtro gli circuli gli rhõbi'. Signature 'u iii'. "
          "Catalogue #123."),
    319: ("A square flower-bed ornament, and a clipped tree on an altar-vase with bucrania",
          "TWO cuts. The upper is a SQUARE interlace panel with a rosette at its centre — "
          "catalogue #124. The lower is a clipped topiary rising from an altar-vase, and the "
          "text beside it reads 'una inane ara, rotundata di petra di flauo numidico cum tre "
          "capitale ossature di boue' — the three ox-skulls of catalogue #125, whose page is "
          "measured in PLATE_PAGE_FIXES. Signature 'u iiii'."),
    321: ("Pattern of a flower-bed",
          "One large bed drawn in perspective, nine compartments of octagon-and-square "
          "interlace, and the text names the herb planted in each in order — Laurentia, "
          "Tarchon, Achilea, Senniculo, Diosmo, Terrambula, Baccara, Amaraco, Polythricho. "
          "Catalogue #126."),
    322: ("The box clipped as peacocks on the altar-vase",
          "ONE cut: a square altar with a laurel-wreath panel carrying a four-handled "
          "amphora, out of which rises the clipped box. The text above names it, 'Sopra "
          "laquale iaceua uno ãtiquario uaso amphorale, cum quatro anse æquidiuise ... "
          "sopra ciascuna uno pauone, cum le code demisse'. Catalogue #127."),
    324: ("Flower-bed of two birds on a vase, the border lettered SVPERNAE ALITIS BENIGNITAS",
          "ONE cut: an eagle and a pheasant beak to beak, footed on the lips of a vase "
          "within a square knot. Catalogue #129."),
    327: ("Two trophy standards: the helmet, cuirass and latticed banner; and the tunic "
          "under the winged laurel wreath",
          "TWO cuts, one at each side of the text. Between them: 'Vnaltra era gestante "
          "dunaltro tropheo, nel mucrõe era una strophiola di lauro'. Catalogue #130 and "
          "#131."),
    328: ("Two trophies: the helmet crested with the bull head over the lion-skin, and "
          "the winged disk with the tablet QVIS EVADET",
          "TWO cuts. The text between them quotes the tablet outright, 'Poscia una "
          "tabella cum tale scriptura maiuscula (QVIS EVADET?) subiaceua'. Catalogue #132 "
          "and #133."),
    329: ("Two trophies: the winged NEMO tablet, and the winged boss with the floating ribbons",
          "TWO cuts. The text between them reads 'subacta una assula, tale cum titulo. "
          "NEMO. Et in medio di due ale'. Signature 'x'. Catalogue #134 and #135."),
    331: ("The trophy of the laurel wreath enclosing ΔΟΡΙΚΤΗΤΟΙ, Cupid with his bow above",
          "ONE cut. Signature 'x ii'. Catalogue #136, whose catalogued page is right."),
    337: (None,
          "Scan opened: unbroken text, NO woodcut — the invective against Love's engines, "
          "'O contagioso artificio. O allectiuo ministerio, O propugnante machine'."),
    338: ("The sapphire vase with the dragon handles, borne by Ennia",
          "ONE cut: a fluted bowl on a baluster foot, its shoulder banded with foliate "
          "scroll, two dragons for handles. The text beside it reads 'Ennia una, che "
          "nelle tuberule mano gerulaua uno dedolato uasculo Amphoe di colorissimo "
          "saphyro'. Catalogue #138."),
    340: ("Precious stone vase throwing fiery sparks",
          "The text beside the cut: 'Fora dil quale latulo orificio uolante & crepitante, cum "
          "gratissimo scloppo scintille resultauano, per laire discurrendo lucente'. Catalogue "
          "#139; the page is measured in PLATE_PAGE_FIXES."),
    341: ("Earthenware amphora with odoriferous fumes",
          "A globular long-necked vessel, fume issuing from the mouth, its body band lettered "
          "in Greek — and the text counts the letters: 'tredeci litere graece mensuratissime "
          "diligentemente impresse', then 'uno nebulante & euodio fumo'. Catalogue #140."),
    344: ("The terminal figure with three heads",
          "ONE cut, the ithyphallic sign in the middle of the tapering shaft. The text "
          "beside it reads 'Ciascuno gestaua uno mõstro rudemente exciso in ligno, & "
          "inaurato, effigiato humano uestito. Dal tricapo fina alla diaphragma'. "
          "Catalogue #141; #142, also filed here, is on p.345."),
    345: ("The ensign of the three heads — lion, dog and wolf — on a shaft wound with a "
          "serpent",
          "ONE cut, the heads together in a disk. Its text stands on the leaf before: 'el "
          "simulachro dagli ægyptii di Serapi uenerato. El quale era uno capo di leone. "
          "Alla dextra prosiliua uno capo di cane blandiente. Et dalla læua, uno capo di "
          "rapace lupo'. Signature 'y'. Catalogue #142."),
    346: ("The Triumph of Cupid, left half: the car with the winged boy, the nymphs "
          "walking before it",
          "ONE cut. The text above it ends 'Quale dire si potrebbe non humana, ma piu "
          "p̃sto diuina operatione, & ostentamento maximo di structura'. Catalogue #143."),
    347: ("The Triumph of Cupid, right half: the car drawn by dragons",
          "ONE cut: nymphs with standards and the fuming pyre, trumpeters at the right. "
          "Signature 'y ii'. Catalogue #144, whose catalogued page is right."),
    349: ("The column pedestal with the rams’ heads and the roundel of the sacrifice",
          "ONE cut. The text beside it reads 'Tra una proiectura & laltra, nel ordine "
          "dilla porta nella parte mediana dil zophoro'. Signature 'y iii'. Catalogue "
          "#145; #146, also filed here, is not on this leaf."),
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
    397: ("Polia drags the prostrate Poliphilo by the feet into the corner of the temple",
          "ONE cut. The text above it reads 'per gli sui fredi pedi, illicitamente "
          "scelesta in uno angulo del tẽpio ... trahendolo i lassai'. Signature 'B'. "
          "Catalogue #153."),
    399: (None,
          "Scan opened: unbroken text, NO woodcut; signature 'B ii'."),
    400: ("Polia’s dream: the two girls chained to the burning car, Cupid scourging them",
          "ONE cut, in the wood, Polia watching from behind a tree. The text above reads "
          "'uidi disordinariamente uenire due dolẽte & siagurate fanciulle ... ad uno "
          "ignitato uehiculo angariate'. Catalogue #154."),
    401: ("Cupid with the drawn sword over the kneeling girl",
          "ONE cut, the car behind, Polia watching from behind a tree. The text above "
          "ends 'Cũ una soliferrea & tagliẽte Rõphea ... p medio dl suo pulsãte core ... "
          "subito trãfisse'. Signature 'B iii'. Catalogue #155."),
    402: (None,
          "Scan opened: unbroken text, NO woodcut; catchword 'o spectaculo'. What shows "
          "faintly at the foot is p.403 printing through. The catalogue files #155 here, "
          "and #155 is on p.401, so without this reading the leaf would have lost its "
          "plate on the catalogue's word alone — which the ticket forbids."),
    403: ("The lion, the dog and the winged dragon devouring the two girls, Cupid flying above",
          "ONE cut. The text below begins 'O spectaculo di icredibile acerbitate, & di "
          "crudelitate insigne'. Signature 'B iiii'. Catalogue #156, whose catalogued "
          "page is right."),
    425: (None,
          "Scan opened: unbroken text, NO woodcut. This leaf DESCRIBES the two cars that "
          "are drawn on p.426, 'uno Vehiculo tutto di Crystallino giazo, tracto da dui "
          "candidi & cornigeri cerui'."),
    426: ("The stag-car and the swan-car dissolving in the air; Polia kneeling in her chamber",
          "ONE cut in two halves, divided by the chamber wall. The text above ends 'ambi "
          "si risolseron & disparueno'. Catalogue #160."),
    431: ("Poliphilo and Polia kneeling together before the enthroned priestess",
          "ONE cut: both kneel on the pavement, the mitred priestess sits with four "
          "nymphs standing behind her, the chamber panelled and with no altar in it — a "
          "different scene from p.429, where Poliphilo STANDS, Polia kneels alone and the "
          "flaming altar-vase is at the right. Signature 'D ii'. Catalogue #162, the row "
          "coverage_seed had recorded as a duplicate of #161."),
    445: (None,
          "Scan opened: unbroken text, NO woodcut; signature 'E'. Poliphilo's letter, "
          "which ends immediately above the cut on p.446, is still running here."),
    446: ("Polia reading the lover's letter in the bed-chamber",
          "The canopied bed, the little dog on the floor, Polia standing with the open letter, "
          "a landscape through the window. The letter itself ends immediately above the cut, "
          "'in perpetuo affectuosamente, & uiuo, & morto tuo sum. Vale.' Catalogue #165, and "
          "this confirms the sibling ticket's correction of its page_seq 436."),
    457: ("Cupid holding the bust of Polia, Poliphilo praying in the clouds, Venus "
          "enthroned with her sceptre",
          "ONE cut. The text above it reads 'Mira diligentemente questa spectanda "
          "imagine'. Catalogue #166 — and #167, which describes the same cut and is "
          "recorded as a duplicate of it."),
    458: ("Cupid with the bow drawn on the group in the clouds",
          "ONE cut. The text above it reads 'manifestamente uedendo io cum il curuo, & "
          "cum rigore incordato arco'. Catalogue #168, whose catalogued page is right."),
    459: (None,
          "Scan opened: unbroken text, NO woodcut."),
}


def plate_captions():
    """(captions, has_cut, stats) — what to say beside each plate, and WHETHER to
    raise one at all.

    `captions` is page -> caption. `has_cut` is the set of pages a woodcut is known
    to stand on, or None when the database is unreachable and the question cannot be
    answered. See PLATE_CAPTION_CHECKED above for the three tiers.

    Until 2026-09-20 the IMAGE was bound by filename alone — if
    images/woodcuts_1499/pNNN.jpg existed, Read mode raised a plate frame on our
    p.NNN. fetch_1499_plates.py copies whatever the corpus photographed, and the
    corpus photographed leaves with no cut on them, so the reader was shown a
    photograph of a page of solid type presented as that leaf's woodcut: p.48 (the
    Vulcan's-forge passage), p.94 (the argument of chapter IX), p.161, p.270 and
    fourteen more. Ticket bug-reading-raises-a-plate-frame-on-leaves-that-carry-no-
    woodcut. A page is bound now only if a scan was opened and a cut seen, or, for
    pages nobody has opened, if a catalogue row resolves to it.

    Note which way round those two clauses run. The catalogue CANNOT be the whole
    test: it is jittery in BOTH directions, so it fails to claim leaves that do carry
    a cut (p.167 the elephants of the second triumph, p.214 the two Greek tablets,
    p.244 the DIVO IVLIO band) and it claims leaves that do not (p.270, which is
    solid type and which both columns agreed to put the sepulchral portal on). Only
    the opened scan outranks both, which is why the checked table is consulted first
    and why 66 leaves were opened to close this.
    """
    out, has_cut = {}, set()
    checked = 0
    for pg, (cap, _why) in PLATE_CAPTION_CHECKED.items():
        checked += 1
        if cap:
            out[pg] = cap
            has_cut.add(pg)
    try:
        import sqlite3
    except ImportError:
        return out, None, (checked, 0)
    if not HPDB.exists():
        return out, None, (checked, 0)
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
            # A leaf nobody has opened, that the corrected catalogue puts a cut on,
            # is bound as a plate even when the caption stays unsettled. That is the
            # weaker of the two warrants and it is deliberately separate from the
            # caption: an uncaptioned plate is a small loss, a plate frame around a
            # page of type is the defect, and a caption on the wrong cut is worse
            # than either.
            has_cut.add(pg)
            if len(rows) != 1:
                continue                      # more than one row claims the leaf: unsettled
            num, desc = rows[0]
            if second.get(num) != pg:
                continue                      # the two columns do not agree: unsettled
            out[pg] = desc
            corroborated += 1
    except Exception as e:                      # a caption is not worth failing over
        print(f"  (no captions: {e})")
        return out, None, (checked, 0)
    return out, has_cut, (checked, corroborated)


def main():
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    titles, has_cut, (cap_checked, cap_corroborated) = plate_captions()
    have_file = {int(f.stem[1:]) for f in PLATES.glob("p*.jpg")} if PLATES.is_dir() else set()
    # A plate file is necessary and not sufficient -- see plate_captions(). When the
    # database is out of reach `has_cut` is None and we fall back to the old rule
    # minus the leaves whose scan was opened and found to carry nothing.
    if has_cut is None:
        blank = {pg for pg, (cap, _w) in PLATE_CAPTION_CHECKED.items() if cap is None}
        have_plate = have_file - blank
    else:
        have_plate = have_file & has_cut
    no_file = sorted(has_cut - have_file) if has_cut else []
    suppressed = sorted(have_file - have_plate)
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
    print(f"  plates   {withplate} pages carry their own 1499 woodcut "
          f"({len(have_file)} plate files on disk)")
    if suppressed:
        print(f"  NO PLATE RAISED on {len(suppressed)} leaf/leaves that have a file but "
              f"carry no woodcut: {suppressed}")
    if no_file:
        print(f"  NO PLATE FILE for {len(no_file)} leaf/leaves a cut is known to stand on: "
              f"{no_file}")
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
