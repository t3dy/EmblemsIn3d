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
    16:  45,   # scan p38 is unbroken text (the relief of Vulcan's forge on the altar:
               # "Sedeua sopra uno saxo sincto, cum una pelle hircina") and carries NO
               # woodcut. The gate with the two medallion busts in the spandrels, and
               # the Greek pediment inscription, is the FULL-PAGE plate on scan p45 —
               # our p.55, one of the four pages our translation holds no file for
               # because they are full-page woodcuts. Catalogued at 38. Chapter V
               # either way.  MEASURED 2026-09-20.
    24:  87,   # scan p84 is unbroken text and carries the capitalised argument of
               # chapter IX ("QVANTA INSIGNE MAIESTATE FVE QVELLA DELLA REGINA") — no
               # woodcut at all. The zophorus/frieze of two genii among foliage, vases
               # and a skull is on scan p87, under the text "Et in medio sopra gli
               # uerticuli assideua una facia circunallata passamente di Puello" and
               # above "Et cum tali & simiglianti liniamenti decoratamente se extendeua
               # il zophoro". Catalogued at 84.  MEASURED 2026-09-20.
    47:  152,  # the First Triumph is a DOUBLE-PAGE plate across the opening: scan p152
               # carries the left half (the car drawn by centaurs, musicians and nymphs)
               # under the running head "TRIVMPHVS", and p153 the right half under
               # "PRIMVS" — the head reads across the opening. Both catalogued at 151,
               # which is unbroken text ("Hora sopra la plana antedicta iaceua uno fatale
               # candidissimo & benigno Tauro"). Chapter XIV either way.
    48:  153,  # the right half of the same opening; the text under it begins the second
               # triumph, "EL SEQVENTE triumpho nõ meno mirauiglioso del primo".
    63:  165,  # scan p165 carries the vintage: putti treading grapes at a vat and
               # harvesting under a pergola, under the line "Ma omni parte distinctamente
               # p̃fecta cerneuase" and above "Fora del p̃scripto uaso, germinaua una
               # frõdosa uite doro". Signature "l iiii" at the foot. Catalogued at 164,
               # which in fact carries the Heliades relief (see #62 in the notes below).
    64:  166,  # the Fourth Triumph is a DOUBLE-PAGE plate: scan p166 ("TRIVMPHVS") is
               # the left half — the car with the great urn, drawn by the ass, Silenus
               # among the Maenads — and p167 ("QVARTVS") the right half, the car drawn
               # by the spotted tigers of Hyrcania with the crowd of lovers. Both
               # catalogued at 165, which carries the vintage instead.
    65:  167,  # the right half of that opening. Beneath it on p167 stands the
               # capitalised argument of chapter XV ("LA MVLTITVDINE DEGLI AMANTI
               # GIOVENI"), which is why the catalogue's Four Seasons rows were put here.
    66:  181,  # RESOLVED 2026-09-20, ticket bug-woodcut-catalog-ten-unresolved-plates.
               # The Triumph of Vertumnus and Pomona is on scan page_seq 181, signed
               # "m iiii" at the foot — which is m4r on the measured collation below, an
               # independent check on the page. The cut shows the car with Vertumnus and
               # Pomona seated, drawn by four horned fauns, a lyre-player and standard-
               # bearers beside; the text above it reads "Sedendo ouante sopra una
               # ueterrima Veha, da quatro cornigeri Fauni tirata", and printed beneath
               # the cut is the tablet the ledger already quotes: "INTEGERRIMAM CORPOR.
               # VALITVDINEM, ET STABILE ROBVR, CASTASQVE MEMSAR. DELITIAS, ET BEATAM
               # ANIMI SECVRITATEM CVLTORIB. M. OFFERO." = our p.191, chapter XVII.
               # Catalogued at 166, which carries the left half of the Bacchic triumph.
    67:  182,  # Spring. Scan page_seq 182 carries ONE Seasons relief, the flower-girdled
               # goddess casting flowers into a flaming Chytropode with the winged boy and
               # two doves, captioned "FLORIDO VERI .S."; the text set round it reads "La
               # prima era una pulcherrima Dea cum uolante trece cincte de rose & daltri
               # fiori" = our p.192, chapter XVII. Catalogued at 167.  MEASURED 2026-09-20.
    68:  183,  # Summer. Scan page_seq 183 carries TWO reliefs; the upper is the corn-
               # crowned damsel with the cornucopia of grain, three bearded ears and the
               # gleaning boy at her feet, captioned "FLAVAE MESSI.S.", under the text "Nel
               # proximo latere, uidi de miranda celatura, una Damigella nel aspecto
               # uirgineo" = our p.193, chapter XVII. Catalogued at 167.  MEASURED 2026-09-20.
    69:  183,  # Autumn, the lower relief on that same page: the nude vine-crowned youth
               # with grape-clusters and the shaggy goat at his feet, captioned
               # "MVSTVLENTO AVTVMNO .S.", under "Nel tertio fronte era uno Diuo simulachro
               # nudo ... de uno infante coronato de Botryi de uua".  MEASURED 2026-09-20.
    70:  184,  # Winter. Page_seq 183 gives Winter's DESCRIPTION and its tag in the tapering
               # colophon at its foot, but not the cut; the relief is at the head of scan
               # page_seq 184 — the bearded king in a beast-skin, sceptre raised into a
               # hail-streaked sky, captioned "HYEMI AEOLIAE.S." — beside the text "Ad questo
               # nobile figmento el praestante artifice, electo solertemente el marmoro
               # hauea, che oltra la candidecia sua era uenato (al requisito loco) de nigro"
               # = our p.194, chapter XVII, the same page that carries the Priapus altar.
               # Catalogued at 167.  MEASURED 2026-09-20.
    127: 312,  # RESOLVED 2026-09-20. The box clipped as peacocks stands on scan page_seq
               # 312, not 313: a tall cut at the right of the page showing the altar with
               # its laurel-wreath panel, the four-handled amphora on it, and the clipped
               # box carrying birds with their tails let down among the spheres — beside
               # the text "Sopra laquale iaceua uno antiquario uaso amphorale ... Fora
               # dilquale usciua uno perpollito buxo ... sopra ciascuna uno pauone, cum le
               # code demisse" = our p.322, chapter XXI. Page_seq 313, where it was
               # catalogued, carries one cut and that cut is #128, the eagle flower-bed.
    129: 314,  # RESOLVED 2026-09-20. The bed with two birds on a vase is on scan page_seq
               # 314, not 317: the square knot-bed at the head of the page with an eagle and
               # a pheasant beak to beak, footed on the lips of a vase, the border lettered
               # round with SVPERNAE ALITIS BENIGNITAS — the device our p.324 spells out.
               # Its text runs from our p.323 ("In the circling were two birds: on the one
               # part an Eagle, and on the other, facing, a Pheasant ... Upon the lips of a
               # vase they footed") onto p.324, beside which the cut is printed. Chapter XXI
               # either way. Page_seq 317, where it was catalogued, carries the two trophies
               # #130 and #131 and nothing else.
    132: 318,  # scan p319 carries only two trophies — the NEMO tablet and the winged
               # one with ribbons (#134, #135) — and is signed "x". The tiger/lion-skin
               # trophy with the bull's-head crest is the LEFT trophy on scan p318,
               # beside the text "Subsequẽte & una attolleua uno tropheo cũ p̃cipua
               # politura". Catalogued at 319. Chapter XXII either way.
    133: 318,  # the right trophy on that same page: the winged disk with the tablet
               # "QVIS EVA / DET", matching its own text "Poscia una tabella cum tale
               # scriptura maiuscula (QVIS EVADET?) subiaceua". Catalogued at 319.
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
    160: 416,  # scan p415 is unbroken text — it DESCRIBES the two cars ("uno Vehiculo
               # tutto di Crystallino giazo, tracto da dui candidi & cornigeri cerui ...
               # da dui candidi Cygni") but carries no woodcut. The plate, in two halves
               # (the stag-car and the swan-car in the sky; Polia kneeling in her
               # chamber), is on scan p416, under "ambi si risolseron & disparueno".
               # Catalogued at 415. Chapter XXIX either way.
    165: 436,  # RESOLVED 2026-09-20. bug-woodcut-catalog-page-jitter recorded that the
               # catalogued page 435 is unbroken text signed "E" with no woodcut, and
               # that the true page was unknown. It is scan p436: the canopied bed, the
               # little dog, and Polia standing with the open letter, under the end of
               # Poliphilo's letter ("& uiuo, & morto tuo sum. Vale.") and above
               # "Credando Sacra Matrona che la Damicella, alle mie amorose parole".
               # Chapter XXXIII either way.
    167: 447,  # scan p448 carries ONE woodcut, Cupid with the bow drawn (= #168), and
               # scan p449 none at all. The plate showing Cupid holding the bust of
               # Polia, Poliphilo praying in the clouds and the sceptred Venus is on
               # p447 — the same plate the catalogue also lists as #166. Catalogued at
               # 448. Chapter XXXV either way.
}

# Plates whose catalogued page we opened and found ALREADY RIGHT. Worth writing down:
# a confirmation is evidence too, and without it there is no way to tell a page nobody
# has checked from a page somebody checked and left alone. plate -> the line of Italian
# on the scan that identifies it.
PLATE_PAGE_CONFIRMED = {
    1:   "p4   'peruenuto nella uastissima Hercynia silua' = our p.14 (ch. I)",
    2:   "p8   Poliphilo kneeling to drink at the rivulet among the trees; "
         "'Hora quale animale che per la dolce esca, lo occulto dolo non perpende' = our p.18 (ch. II)",
    3:   "p10  Poliphilo asleep under the tree, above the capitalised argument "
         "'POLIPHILO QVIVI NARRA, CHE GLI PARVE ANCORA DI DORMIRE' = our p.20 (ch. III)",
    4:   "p11  the palm grove with the wolf at the right, the fallen colossal head and "
         "the overturned vessel; 'Ecco che uno affermato & carniuoro lupo alla parte "
         "dextra, cum la bucca piena mi apparue' = our p.21 (ch. III)",
    5:   "p16  the full-page stepped pyramid with the obelisk and the winged Fortuna; "
         "no body text, catchword 'Ritorniamo' = our p.26 (ch. III)",
    6:   "p22  the winged horse with the boys clambering on it; 'Sopra di q̃sta piacia ... "
         "uidi uno p̃digioso caballo & aligero Desultore' = our p.32 (ch. IV)",
    7:   "p23  left pedestal end, the garland with 'D· AMBIG ·D·D'; 'Nella superficie dil "
         "basamento era infixo plumbiculatamete una plastra' = our p.33 (ch. IV)",
    8:   "p23  right pedestal end on the same page, 'EQVVS INFOELICITATIS' in its garland",
    18:  "p59  the hieroglyph band under 'PATIENTIA EST ORNAMENTVM CVSTODIA ET PROTECTIO "
         "VITAE', and below it the circle, anchor and dolphin with "
         "'ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ · Semp festina tarde' = our p.69 (ch. VII)",
    20:  "p66  Poliphilo meeting the five nymphs with their vessels; 'Elle dunque di me "
         "animaduertendo alhora, il Nympheo grado affermando steteron' = our p.76 (ch. VII)",
    21:  "p71  the winged putto on the ball blowing the trumpet; 'cosa enea tenuissima "
         "cõflata perfectamẽte ... Laquale Ala, & la Pila, & el Puello' = our p.81 (ch. VIII)",
    23:  "p80  the full-page third fountain (the three nude figures, the griffin-heads, "
         "the winged sphinxes); no body text, catchword 'no sci' = our p.90, one of the "
         "four pages our translation holds no file for (ch. VIII)",
    32:  "p105 the wheeled vessel crowned with the golden fruit-tree, drawn by a nymph; "
         "'Ilquale stylo fermamente infixo uno conspicuo uaso di Topacio susteniua' = "
         "our p.115 (ch. IX)",
    39:  "p127 the matron Euclelia with the raised sword bearing the golden crown and "
         "palm; 'Ecco sencia præstolatiõe fue patefacta, & ĩtromessi, Se fece ad nui una "
         "Matrona chrysaora cum gli ochii atroci' = our p.137. Signature 'i' (ch. X)",
    40:  "p129 Logistica fleeing through the arch having broken her lyre, Poliphilo among "
         "the nymphs; 'proiecta la lyra ad terra la rumpete' = our p.139. "
         "Signature 'i ii' (ch. X)",
    41:  "p130 Poliphilo embraced by the nymphs among the trees; 'Et recluse le metalline "
         "ualue, rimansi claustrato immediate tra quelle egregie Nymphe' = our p.140 (ch. X)",
    42:  "p132 the flowering pergola with Poliphilo, the nymph approaching with her torch; "
         "'Et ecco una come insigne & festiua Nympha dindi cum la sua ardente facola in "
         "mano' = our p.142 (ch. XI)",
    43:  "p139 Poliphilo and the torch-bearing nymph together before the arbour; 'Et "
         "postala nella sua, strengerla sentiua tra calda neue' = our p.149 (ch. XII)",
    44:  "p149 upper block, 'PRIMA TABELLA' — the triumphal car with the bull relief; "
         "signature 'k iiii' at the foot = our p.159 (ch. XIV)",
    45:  "p149 lower block on the same page, 'SECVNDA SINISTRA' — Europa borne over the "
         "sea on the bull",
    46:  "p150 'PARS ANTERIOR ET POSTERIOR TRIVMPHI' — Cupid shooting stars, and Mars "
         "before Jove's throne with the NEMO scroll = our p.160 (ch. XIV)",
    71:  "p185 the full-page worship of Priapus under the flowered bower, the ass led to "
         "sacrifice; no body text = our p.195, a page our translation holds no file for "
         "(ch. XVII)",
    72:  "p195 full-page rotunda section, signature 'n iii' only = our p.205 (ch. XVII)",
    76:  "p205 'Et ecco cum summa ueneratione ... el rituale libro' = our p.215 (ch. XVII)",
    81:  "p212 a woodcut IS present — the great jasper vase on its stepped base hung "
         "beneath the inverted plate; 'Questo marauiglioso sculptile era tuto di uno "
         "solido de finissimo diaspro' = our p.222 (ch. XVII). The catalogue's "
         "description ('Temple ceremony continuation') is a placeholder, not a reading",
    82:  "p213 the priestess with the open ritual book before the altar, Polia and the "
         "virgins kneeling, Poliphilo praying at the right; 'Disubito la intenta "
         "sacerdotula admonita dirinpecto alla sacrificante Polia cum il rituale libro "
         "aperto' = our p.223. Signature 'o iiii' (ch. XVII)",
    87:  "p233 the obelisk on its inscribed base, beside the medallion; 'In questo loco "
         "ananti tute cose ... mirai uno obelisco magno & excelso di rubente petra' = "
         "our p.243 (ch. XIX)",
    88:  "p233 the first medallion on that page: the balance with the crown, dog and "
         "serpent, read 'IVSTITIA RECTA AMICITIA ET ODIO EVAGINATA ET NVDA'",
    89:  "p235 'MILITARIS PRVDENTIA, SEV DISCIPLINA IMPERII EST TENACISSIMVM VINCVLVM' — "
         "the eagle, anchor and seated soldier with the serpent = our p.245 (ch. XIX)",
    90:  "p235 the second medallion on that page, 'DIVI IVLII VICTORIARVM ET SPOLIORVM "
         "COPIOSISSIMVM TROPHAEVM, SEV INSIGNIA' — the trophy between the eye and the comet",
    113: "p275 the standard with the flaming vase and the crescent, captioned 'AMOR "
         "VINCIT OMNIA'. Signature 's iii' = our p.285 (ch. XX)",
    114: "p281 the bark on the waves with its mast and yard; 'cum tute le altre "
         "circũstantie disopra opportunamente descripte. cusi era' = our p.291 (ch. XXI)",
    128: "p313 the square flower-bed with the eagle in a knot of bands lettered round "
         "the border; 'La Aquila di serpilo, Lo excluso dagli circuntermini di polio "
         "montano' = our p.323 (ch. XXI)",
    130: "p317 the left trophy — helmet, cuirass and the latticed banner with the winged "
         "genius head; 'Vnaltra era gestante dunaltro tropheo' = our p.327 (ch. XXII)",
    131: "p317 the right trophy on that page — the tunic with the winged genius head "
         "under a laurel wreath",
    134: "p319 the left trophy, the tablet lettered 'NEMO' over winged volutes; "
         "'Consequente era uno altro nobilissimo trophæo baiulato'. Signature 'x' = "
         "our p.329 (ch. XXII)",
    135: "p319 the right trophy on that page, the winged boss with the floating ribbons",
    148: "p349 the heptagonal ground-plan with its inscribed circle and radii; 'Dũque il "
         "circulo obducto del suo diametro semisse, iui uno triangulo æq̃latero "
         "cõstituito' = our p.359 (ch. XXIII)",
    149: "p363 'sopra il fonte. Nelquale ... uno serpe aureo' = our p.373 (ch. XXIV)",
    157: "p411 Polia kneeling over the prostrate Poliphilo in the colonnaded temple; "
         "'O il mio amoroso Poliphilo morto, ouero io in tanta inconsolabile uita "
         "superstite?' = our p.421 (ch. XXIX)",
    161: "p419 the priestess enthroned, Polia kneeling, Poliphilo standing, the flaming "
         "altar at the right; 'Dinanti alla quale ello era apresentato'. Signature 'D' = "
         "our p.429 (ch. XXX)",
    163: "p425 'sauiando, sorbiculante ... morsiunculo' = our p.435 (ch. XXXI)",
    164: "p433 Poliphilo writing at the carved desk, the framed double portrait on the "
         "wall; 'Per tale argumẽto cogitai di scriuerli' = our p.443 (ch. XXXII)",
    166: "p447 Cupid holding the bust of Polia, Poliphilo praying in the clouds, the "
         "sceptred Venus seated; 'Mira diligentemente questa spectanda imagine' = "
         "our p.457 (ch. XXXV)",
    168: "p448 Cupid with the bow drawn at the group in the clouds; 'manifestamente "
         "uedendo io cum il curuo, & cum rigore incordato arco' = our p.458 (ch. XXXV)",
}

# ── Opened, and still not resolved ─────────────────────────────────
#
# For these the catalogued page WAS opened on the scan and shown to carry something
# else, and the plate's true page has not been seen, so its catalogued page is left
# alone rather than guessed at (the ticket's own rule: do not infer a page from
# surrounding text). Each entry says what the catalogued page actually carries. These
# still count as CHECKED — a reader can tell them from a page nobody has looked at.
#
# EMPTY since 2026-09-20, when ticket bug-woodcut-catalog-ten-unresolved-plates closed
# the ten rows that stood here. Seven of them got a true page (now in PLATE_PAGE_FIXES:
# #66-70, #127, #129) and three turned out not to be lost plates at all (#83, #162 are
# duplicate rows, #86 answers to no woodcut — see the two tables below). The table is
# kept, and the branch in plates() that reads it with it, because the next plate that
# cannot be placed belongs here and not in a guess.
PLATE_PAGE_UNRESOLVED = {}

# ── Catalogue rows that duplicate another row ──────────────────────────
#
# RESOLVED 2026-09-20, ticket bug-woodcut-catalog-ten-unresolved-plates. The catalogued
# page was opened and found to carry FEWER cuts than the rows claiming it, and the
# surplus row describes a cut another row already answers to. A duplicate row is a
# finding, not a gap: it means the catalogue's 168 rows are not 168 woodcuts.
# plate -> (the row it duplicates, the evidence)
PLATE_DUPLICATE_ROWS = {
    83:  (82, "scan page_seq 213 carries exactly ONE woodcut, the priestess with the open "
              "ritual book before the altar, which is #82 (confirmed on the scan for ticket "
              "bug-woodcut-catalog-page-jitter). #81, #82 and #83 all carry the SAME "
              "placeholder description, the string 'Temple ceremony continuation', and #81 "
              "is on page_seq 212 and #82 on 213; #83 is a third row for a page that has "
              "one cut. It duplicates #82."),
    162: (161, "scan page_seq 419 opened 2026-09-20: it carries exactly ONE woodcut — the "
               "mitred priestess enthroned at the left, Poliphilo standing, Polia kneeling "
               "with her hands raised, the flaming altar-vase on its stepped base at the "
               "right — under the text 'Dinanti alla quale ello era apresentato', and signed "
               "'D' at the foot. That one cut answers both #161 ('Polia kneels before Venus "
               "priestess; Poliphilus beside') and #162 ('Enamoured couple kneeling before "
               "priestess'): they describe the same scene. #162 duplicates #161."),
}

# ── A catalogue row with no woodcut behind it ─────────────────────────
#
# The inverse of the rule this whole ledger exists for. "The plates are an index, not an
# inventory" says the book describes more than it draws; this says the catalogue can also
# list more than the book draws, because its rows were made by subject-matching the TEXT
# (woodcut_catalog.link_basis, source_method LLM_ASSISTED) and a vivid passage with no cut
# can win a row of its own.
PLATE_NO_WOODCUT = {
    86: "scan page_seq 233 opened 2026-09-20: it carries exactly TWO woodcuts — the plain "
        "obelisk on its stepped base at the right, and the round IVSTITIA medallion (the "
        "balance with the crown, the dog and the serpent) at the left. Those are #87 and "
        "#88, and neither is a view of ruins among trees. The ruined temple overgrown with "
        "ground-ivy and thorns that #86 describes is the TEXT of page_seq 232 ('quelle deuii "
        "aggeri, di fastigiato & uasto cumulo & ruina, i la magiore parte occupate di "
        "chamaeciso, & di terrambula & di spini implicita'), and scan page_seq 232 was opened "
        "the same day and is unbroken text under a knotwork initial, with no cut on it at "
        "all. No woodcut in the book answers to this row.",
}

# Also measured, but not near a chapter boundary and so not in the tables above:
#   #62 "Vase relief: Jupiter and the Heliades" is catalogued at page_seq 161 and is in
#   fact the woodcut at the foot of scan p164 — the nymphs rooting into trees before
#   Jove, our p.174, which is exactly where our translation puts the urn-relief of "Jove
#   and the nymphs changed into trees". It is recorded here rather than in
#   PLATE_PAGE_FIXES because moving it is outside this ticket's scope and nothing in the
#   ledger turns on it: page_seq 161 and 164 are both chapter XIV.

# The eight attributions ticket bug-plate-page-seq-offset says were wrong, plus the two
# regression points its acceptance names. Asserted on every run — see check_plates().
PLATE_CHAPTER_EXPECTED = {
    # Added 2026-09-20, ticket bug-woodcut-catalog-ten-unresolved-plates: the five plates
    # of the Vertumnus triumph and the Seasons altar, measured off the scans at page_seq
    # 181-184 and so moved out of XIV/XV into XVII, where their own text and the ledger's
    # xvii-vertumnus-pomona-triumph and xvii-seasons-altar entries already sat.
    66: "XVII", 67: "XVII", 68: "XVII", 69: "XVII", 70: "XVII",
    127: "XXI", 129: "XXI",   # the peacock box and the eagle-and-pheasant flower-bed
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
#
# CORRECTED 2026-09-20, ticket bug-dallington-page-drift. Two things had to change.
#
# (1) Our own CC0 translation now covers the WHOLE book, pages 1-467 (451 of 467 pages
#     `verified` in translation/manifest.json), not only XVII onward. So Dallington is no
#     longer the only English for chapters I-XVI; he is a second witness, and every
#     chapter's pages_1499 is in the translation's numbering, which IS the 1499 folio.
#
# (2) A "Dallington p. N" citation in this ledger means the `<!-- Page N -->` marker in
#     the corpus markdown, and those markers run 1-279 against the 1499's 1-467. The two
#     numberings agree to within a page or two at the start of the book and then diverge
#     steadily as he abridges. MEASURED 2026-09-20 by rare-proper-noun alignment of every
#     Dallington page against every translation page, then read by eye at the anchors:
#
#       Dallington p.  80 = 1499 p.  60      Dallington p. 238 = 1499 p. 179
#       Dallington p. 100 = 1499 p.  74      Dallington p. 240 = 1499 p. 180
#       Dallington p. 194 = 1499 p. 136      Dallington p. 244 = 1499 p. 183
#       Dallington p. 206 = 1499 p. 147      Dallington p. 250 = 1499 p. 188
#       Dallington p. 210 = 1499 p. 150      Dallington p. 254 = 1499 p. 191
#       Dallington p. 216 = 1499 p. 154      Dallington p. 256 = 1499 p. 193
#       Dallington p. 226 = 1499 p. 165      Dallington p. 258 = 1499 p. 239
#       Dallington p. 234 = 1499 p. 175      Dallington p. 260 = 1499 p. 241
#
#     The gap is ~20 pages by his p.80, ~58 by his p.194, ~62 by his p.250 — and then it
#     jumps, because he skips 1499 pp.194-237 outright. So NO constant repairs it, and a
#     Dallington page may never be read as a 1499 page. Confirm any Dallington citation
#     against the header line of translation/en/page_NNN.md before you use it.
def text_source(n):
    if n <= 16:
        return {"edition": "our translation (CC0), with Dallington 1592 as a second witness",
                "file": "translation/en/page_NNN.md",
                "dallington": r"C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md",
                "note": "pages_1499 and every bare page number in this chapter are in the "
                        "1499 numbering (= translation/en/page_NNN.md). A source written "
                        "'Dallington p. N' is in HIS numbering, which is a DIFFERENT scale: "
                        "his 279 pages abridge the 1499's 467, so his count falls behind by "
                        "about 20 pages by his p.80 and about 60 by his p.250, and the two "
                        "may never be used interchangeably. Ticket bug-dallington-page-drift."}
    return {"edition": "our translation (CC0)", "file": "translation/en/page_NNN.md",
            "note": "page numbers ARE the 1499's, so they line up with hp.db. Dallington "
                    "1592 reaches chapter XVIII, but only by skipping 1499 pp.194-237 "
                    "entirely; where he is present his page numbers are his own."}


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
        if page is not None:
            d = min((abs(page - x) for r in pages_by_ch.values() for x in r), default=99)
            if d <= 3:
                rec["near_chapter_boundary"] = d
        if num in PLATE_PAGE_FIXES:
            rec["page_corrected_from"] = raw
            rec["page_checked"] = "scan opened 2026-09-20; corrected — see PLATE_PAGE_FIXES"
        elif num in PLATE_PAGE_CONFIRMED:
            rec["page_checked"] = "scan opened 2026-09-20; catalogued page confirmed — " \
                                  + PLATE_PAGE_CONFIRMED[num]
        elif num in PLATE_DUPLICATE_ROWS:
            dup, why = PLATE_DUPLICATE_ROWS[num]
            rec["page_checked"] = (f"scan opened 2026-09-20; DUPLICATE catalogue row — this "
                                   f"row and #{dup} answer to one and the same woodcut. {why}")
            rec["duplicates_plate"] = dup
        elif num in PLATE_NO_WOODCUT:
            rec["page_checked"] = ("scan opened 2026-09-20; NO WOODCUT answers to this "
                                   "catalogue row — " + PLATE_NO_WOODCUT[num])
            rec["no_woodcut"] = True
        elif num in PLATE_PAGE_UNRESOLVED:
            rec["page_checked"] = "scan opened 2026-09-20; catalogued page is WRONG and the " \
                                  "true page is NOT YET KNOWN — " + PLATE_PAGE_UNRESOLVED[num]
            rec["page_unresolved"] = True
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


def check_page_checked(by_ch, unplaced):
    """Regression check, run on every seed. Ticket bug-woodcut-catalog-page-jitter.

    Its acceptance criterion, asserted: no plate resolving within 3 pages of a chapter
    boundary lacks `page_checked`. A plate that near a boundary can be filed in the
    wrong chapter by the catalogue's own +/-2 jitter, so every one of them has to have
    been SEEN on the scan — confirmed, corrected, or opened and found wrong. If this
    fires, someone has added or moved a plate; open the scan at
    C:\\Dev\\hypnerotomachia polyphili\\site\\images\\woodcuts_1499\\hp1499_pNNN.jpg
    and record what is on it. Do not silence it by widening a chapter range."""
    recs = [p for ps in by_ch.values() for p in ps] + unplaced
    near = [p for p in recs if p.get("near_chapter_boundary") is not None]
    bad = [p for p in near if not p.get("page_checked")]
    if bad:
        raise SystemExit("coverage_seed: unchecked plates near a chapter boundary:\n" +
                         "\n".join(f"  plate #{p['plate']} on page_1499 {p['page_1499']} "
                                   f"({p['description']})" for p in sorted(
                                       bad, key=lambda p: p["plate"])))
    return len(near), sum(1 for p in near if p.get("page_unresolved"))


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


# ── The collation, measured off the signatures printed on the scans ──────────
#
# Ticket bug-concordance-signature-quire-model. `hp.db.page_concordance.signature /
# quire / leaf_in_quire` is a uniform RECONSTRUCTION — 29 gatherings, every one of eight
# leaves except z and G at four, 448 pages — and it is wrong in three ways at once: it
# omits the `u` gathering entirely, it stops nine pages short of the book, and its
# page-to-signature mapping is consequently out on both sides of the gap. THOSE THREE
# COLUMNS ARE NOT TO BE USED FOR ANYTHING. This table replaces them, and unlike them it
# was read off the page.
#
# MEASURED 2026-09-20 by opening scans and reading the signature printed at the foot:
#
#   p31  'c'      p127 'i'        p195 'n iii'    p319 'x'        p419 'D'
#   p63  'e'      p129 'i ii'     p213 'o iiii'   p337 'y ii'     p435 'E'
#   p95  'g'      p149 'k iiii'   p275 's iii'    p387 'B'
#                 p165 'l iiii'   p307 'u iii'    p389 'B ii'
#
# and confirmed negatively at p23, p59, p87 and p105, none of which carries a signature
# and none of which this model puts on a signed leaf.
#
# Every one of those fits a single model: FOUR unsigned preliminary leaves, then
# a-y in eights (with u), z in ten, A-E in eights, F in four — 4 + 176 + 10 + 40 + 4 =
# 234 leaves = 468 pages, which is exactly the length of the book (our pp.1-467 plus a
# final blank verso).
#
# THE TWO-PAGE RESIDUAL IN THE TICKET IS EXPLAINED, and this is the finding: hp.db's
# page_seq 1 is NOT a1r. Quire a opens two pages earlier, on our p.9 — the last
# preliminary leaf, the one carrying Poliphilo's dedication to Polia — so page_seq 1 is
# a2r. Everything the ticket measured as "quire n two pages late" was that one leaf.
#
# 'u iii' on scan p307 is the direct proof that the u gathering exists, which is what
# the ticket asked for and what hp.db denies.
#
# NOT DIRECTLY SEEN: z's ten leaves. No scan between page_seq 351 and 361 is in the
# corpus folder, so z is fixed by arithmetic — y opens at 335 (scan, 'y ii' at 337) and
# A at 371 (our p.381, "POLIPHILO BEGINS THE SECOND BOOK") — not by a signature.
#
# (letter, first page_seq, leaves)
MEASURED_QUIRES = [
    (None, -9, 4),   # the unsigned preliminary leaves, our pp.1-8
    ("a",  -1, 8), ("b",  15, 8), ("c",  31, 8), ("d",  47, 8), ("e",  63, 8),
    ("f",  79, 8), ("g",  95, 8), ("h", 111, 8), ("i", 127, 8), ("k", 143, 8),
    ("l", 159, 8), ("m", 175, 8), ("n", 191, 8), ("o", 207, 8), ("p", 223, 8),
    ("q", 239, 8), ("r", 255, 8), ("s", 271, 8), ("t", 287, 8), ("u", 303, 8),
    ("x", 319, 8), ("y", 335, 8), ("z", 351, 10),
    ("A", 371, 8), ("B", 387, 8), ("C", 403, 8), ("D", 419, 8), ("E", 435, 8),
    ("F", 451, 4),
]

# signature actually read at the foot of a scan -> its page_seq. check_quires() asserts
# the table reproduces every one of them. Do not add a line here you have not seen.
SIGNATURES_READ = {
    31: "c", 63: "e", 95: "g", 127: "i", 129: "i ii", 149: "k iiii", 165: "l iiii",
    195: "n iii", 213: "o iiii", 275: "s iii", 307: "u iii", 319: "x", 337: "y ii",
    387: "B", 389: "B ii", 419: "D", 435: "E",
}
UNSIGNED_READ = [23, 59, 87, 105]   # scans opened whose foot carries no signature


def _signature_at(seq):
    """The signature a leaf would carry under MEASURED_QUIRES, or None if unsigned.

    The Aldine signs only the first half of a gathering (and, in this book, only rectos):
    leaf 1 is the bare letter, leaves 2..n/2 the letter plus ii, iii, iiii."""
    for letter, first, leaves in MEASURED_QUIRES:
        if first <= seq < first + leaves * 2:
            if letter is None or (seq - first) % 2:       # unsigned quire, or a verso
                return None
            leaf = (seq - first) // 2 + 1
            if leaf > leaves // 2:
                return None
            return letter if leaf == 1 else f"{letter} {'i' * leaf}"
    return None


def check_quires():
    """Regression check, run on every seed. Ticket bug-concordance-signature-quire-model.

    The acceptance criterion, asserted: for every scan whose printed signature has been
    read, MEASURED_QUIRES agrees with it; and the gatherings tile the book without gap
    or overlap. If this fires, open a scan and read the foot of the page — do not edit
    the table to make the assertion pass."""
    bad = []
    for seq, sig in sorted(SIGNATURES_READ.items()):
        got = _signature_at(seq)
        if got != sig:
            bad.append(f"  page_seq {seq}: scan is signed {sig!r}, table says {got!r}")
    for seq in UNSIGNED_READ:
        got = _signature_at(seq)
        if got is not None:
            bad.append(f"  page_seq {seq}: scan carries no signature, table says {got!r}")
    for (l1, a1, n1), (l2, a2, _) in zip(MEASURED_QUIRES, MEASURED_QUIRES[1:]):
        if a1 + n1 * 2 != a2:
            bad.append(f"  quires do not tile: {l1} opens at {a1} with {n1} leaves, "
                       f"then {l2} at {a2}")
    leaves = sum(n for _, _, n in MEASURED_QUIRES)
    if leaves != 234:
        bad.append(f"  collation is {leaves} leaves; the 1499 Hypnerotomachia has 234")
    if bad:
        raise SystemExit("coverage_seed: quire regression:\n" + "\n".join(bad))
    return len(SIGNATURES_READ), leaves


def quires():
    """The collation, in both numberings, for the ledger."""
    k, out = PAGE_SEQ_TO_TRANSLATION, []
    for letter, first, leaves in MEASURED_QUIRES:
        last = first + leaves * 2 - 1
        out.append({
            "signature": letter or "(unsigned preliminaries)",
            "leaves": leaves,
            "pages_1499": [first, last],
            "pages_translation": [first + k, last + k],
            "signature_read_on_scan": sorted(
                f"page_seq {s} = {v!r}" for s, v in SIGNATURES_READ.items()
                if first <= s <= last) or None,
        })
    return out


# ── The narrative sections, measured ─────────────────────────────────────────
#
# `hp.db.page_concordance.section` used to be the source of this table and is NOT
# used any more. Its boundaries agree with the plates through PROCESSION and then
# run progressively early — VENUS_TEMPLE by 17 pages, POLYANDRION by 47,
# CYTHERA_GARDENS by 74, BOOK_II_POLIA by 116 — and no constant repairs it.
# Ticket bug-concordance-section-drift.
#
# THE WORKING HYPOTHESIS IN THAT TICKET IS FALSE, and this is the useful finding:
# the drift is NOT an artefact of the quire model. Dumped, the quire model is a
# uniform reconstruction — 27 gatherings of eight leaves plus z(4) and G(4), 448
# pages in all — but the section boundaries do not fall on its quire boundaries
# anywhere (sections start at 80, 168, 186, 216, 256, 271; quires at 81, 177, 193,
# 209, 257, 273). The sections were never derived from the collation at all. Their
# lengths are simply invented: the middle of Book I is compressed about 2:1 and
# BOOK_II_POLIA is given 178 pages — everything left over — to make the total come
# out at the model's 448. No number of scans repairs a guess; the boundaries had to
# be measured from the text, which is what the table below is.
#
# MEASURED 2026-09-20, in our own translation (whose page numbers are page_seq + 10,
# established at ten scan/page pairs — see PAGE_SEQ_TO_TRANSLATION) and, at the one
# boundary the text alone could not settle, by opening the scan.
#
# TWO CAVEATS THE TABLE CANNOT REMOVE, both measured:
#
#  1. The episodes INTERLEAVE. Poliphilo first sights the great gate on our p.31
#     (page_seq 21) — "above all I beheld a most beautiful gate" — then turns aside
#     to the elephant, the sarcophagi and the hieroglyphs, whose woodcuts run to
#     page_seq 31, and only then returns to the gate. Any [start, end] partition of
#     this book is therefore an index, not a description of its structure.
#  2. Where the text's transition and the plates disagree by a page or two, the
#     boundary is set to keep each section's own plates inside it (that is the
#     ticket's acceptance check), and `note` records where the text actually turns.
#
# section, first page_seq, basis for that boundary.
MEASURED_SECTIONS = [
    ("PRELIMINARIES", None,
     "The five unsigned preliminary leaves, our pp.1-10: title page, Aldus's and "
     "Crasso's matter, the half-title, Poliphilo's dedication to Polia. They are "
     "BEFORE page_seq 1 and have no page_seq at all — page_concordance calls "
     "page_seq 1-3 'PRELIMINARIES', but our p.11 = page_seq 1 is already Chapter I.",
     None),
    ("DARK_FOREST", 1,
     "Chapter I opens on page_seq 1 (our p.11), the first page of the signed book.",
     "The wood itself is entered four pages in, page_seq 4 (our p.14), "
     "'peruenuto nella uastissima Hercynia silua' — the scan opened for "
     "bug-plate-page-seq-offset. The first woodcut is on that page."),
    ("PYRAMID_RUINS", 12,
     "our p.22 (page_seq 12): 'lifting my eyes towards that quarter where the wooded "
     "hills appeared to join, saw far off, in a deep recess, an incredible height in "
     "the figure of a tower' — the pyramid comes into view.",
     None),
    ("DRAGON_PORTAL", 37,
     "Chapter V opens on page_seq 37 (our p.47): 'POLIPHILO, HAVING MADE SUFFICIENT "
     "DEMONSTRATION OF THE SYMMETRY OF THE GREAT GATE, GOES ON TO DESCRIBE ITS "
     "ORNAMENT' — the gate has the book to itself from here to the dark tunnel.",
     "Approximate, and early: the gate is first sighted at page_seq 21 (our p.31) "
     "and its symmetry argued from page_seq ~32. The boundary is put at the chapter "
     "opening because the ruins woodcuts run to page_seq 31."),
    ("FIVE_SENSES", 60,
     "Chapter VII opens on page_seq 58 (our p.68): 'HAVING COME OUT OF THAT "
     "HORRENDOUS pit, and from those inner darknesses' — out of the dragon's tunnel, "
     "into the country of the fountain and the five damsels.",
     "Boundary set at 60, two pages after that opening, because plate #18 (the "
     "anchor and dolphin, 'Always make haste slowly') is on page_seq 59 — our p.69, "
     "the bridge parapet — and is tagged DRAGON_PORTAL in woodcut_catalog. The tag "
     "is loose: the bridge is already past the tunnel."),
    ("QUEEN_PALACE", 84,
     "SCAN OPENED. hp1499_p084.jpg — page_seq 84 = our p.94 — carries the capitalised "
     "argument of chapter IX ('QVANTA INSIGNE MAIESTATE FVE QVELLA DELLA REGINA, ET LA "
     "CONDITIONE DELLA SVA RESIDENTIA') with its decorated initial beneath, and the line "
     "above it ends '...la Regina Eleuteryllida.' Chapter IX therefore opens on page_seq "
     "84 (our p.94) — Queen Eleuterylida's palace.",
     "Was 82 until 2026-09-20, taken from translation/en/page_092.md's header, which read "
     "'Chapter IX' in error — our pp.92 and 93 both carry on chapter VIII's third fountain "
     "and its colonnade, and chapter IX's own argument ('How great and notable was the "
     "majesty of the Queen...') stands on p.94. The header is corrected, and the derived "
     "ranges VIII [79,93] and IX [94,116] no longer overlap. Ticket "
     "bug-translation-page-092-chapter-header."),
    ("JOURNEY_DOORS", 107,
     "Chapter X opens on page_seq 107 (our p.117) — the nymphs lead him out to the "
     "three doors.", None),
    ("PROCESSION", 148,
     "Chapter XIV opens on page_seq 148 (our p.158) — the triumphal cars.", None),
    ("VENUS_TEMPLE", 179,
     "Chapter XVII opens on page_seq 179 (our p.189); its own argument names the "
     "temple: 'in the said temple, at the warning of the priestess, the Nymph with "
     "much ceremony put out her torch, showing herself to Poliphilo to be his "
     "Polia... having entered with the sacrificing priestess into the holy shrine'.",
     None),
    ("POLYANDRION", 232,
     "Chapter XIX opens on page_seq 232 (our p.242): 'go licitly to see these "
     "deserted temples, collapsed by devouring and obsolete old age'.",
     "All twenty-seven Polyandrion plates fall inside this one chapter."),
    ("CYTHERA_VOYAGE", 274,
     "Chapter XX opens on page_seq 274 (our p.284) with AMOR VINCIT OMNIA and "
     "Cupid's bark.", None),
    ("CYTHERA_GARDENS", 282,
     "our p.292 (page_seq 282): 'as, gliding to the most pleasant place, we put in' "
     "— the landing on Cythera.", None),
    ("VENUS_FOUNTAIN", 338,
     "SCAN OPENED. hp1499_p336.jpg is our p.346 — 'paulatinamente puenissimo ad uno "
     "proscenio, oue era una conspicua... porta hiante... di uno mirabilissimo "
     "amphitheatro' — the procession reaches the gate of the theatre of Venus.",
     "Boundary set at 338, two pages later, because the same scan shows the Triumph "
     "of Cupid woodcut filling the foot of page_seq 336, and hp1499_p337.jpg (our "
     "p.347) its right-hand continuation. Both halves are catalogued at page_seq 337 "
     "and tagged CYTHERA_GARDENS; #143 is in fact on 336. The catalogue's +/-2 "
     "jitter, measured for once."),
    ("BOOK_II_POLIA", 371,
     "Chapter XXV opens on page_seq 371 (our p.381): 'POLIPHILO BEGINS THE SECOND "
     "BOOK OF HIS HYPNEROTOMACHIA'. page_concordance puts this at 271.",
     "Ends at page_seq 457, our p.467, the errata leaf and the Aldine colophon. "
     "page_concordance stops at 448 — it is nine pages short of the book."),
]
LAST_PAGE_SEQ = 457   # our p.467, the errata leaf. The last page our translation holds.


def sections():
    """Narrative sections, in BOTH numberings — they are ten pages apart, and giving
    only the hp.db one beside chapter ranges that are in the translation's numbering
    is how the two got conflated in the first place.

    Measured; `page_concordance.section` is no longer read. See MEASURED_SECTIONS
    above for every boundary and the line of text that fixes it, and for the two
    caveats no table of this shape can remove. Ticket bug-concordance-section-drift.
    """
    k, out = PAGE_SEQ_TO_TRANSLATION, []
    starts = [s for _, s, _, _ in MEASURED_SECTIONS]
    for i, (name, a, basis, note) in enumerate(MEASURED_SECTIONS):
        nxt = next((s for s in starts[i + 1:] if s is not None), None)
        if a is None:                      # the unsigned preliminary leaves
            rec = {"section": name, "pages_1499": None, "pages_translation": [1, k]}
        else:
            b = (nxt - 1) if nxt else LAST_PAGE_SEQ
            rec = {"section": name, "pages_1499": [a, b], "pages_translation": [a + k, b + k]}
        rec["boundary_measured_at"] = basis
        if note:
            rec["note"] = note
        out.append(rec)
    return out


# —— Plates whose catalogued narrative_section is wrong ——
#
# A plate's narrative_section in woodcut_catalog was assigned from the page the catalogue
# THOUGHT it was on. Correct the page and the section tag can come with it, or fail to.
# These five were measured onto page_seq 181-184 for ticket
# bug-woodcut-catalog-ten-unresolved-plates; the catalogue had them at 166-167 and so
# tagged PROCESSION, but 181-184 is inside VENUS_TEMPLE, which opens with chapter XVII at
# page_seq 179. check_sections() reads this table in place of the catalogue's tag.
#
# This is NOT a boundary widened to make an assertion pass, which that check forbids. The
# boundary is untouched; the five rows carry a tag derived from a page now known to be
# wrong, and the correction is recorded here with the scan that settled it. Note that the
# catalogue's instinct was not silly — the Vertumnus and Pomona car IS the last of the
# processional triumphs, and the section table's own caveat says the episodes interleave
# and that any [start, end] partition of this book is an index rather than a description
# of its structure. What the scans settle is only the PAGE.
PLATE_SECTION_CORRECTED = {
    66: "VENUS_TEMPLE", 67: "VENUS_TEMPLE", 68: "VENUS_TEMPLE",
    69: "VENUS_TEMPLE", 70: "VENUS_TEMPLE",
}


def check_sections():
    """Regression check, run on every seed. Ticket bug-concordance-section-drift.

    The acceptance criterion, asserted: for every narrative_section in
    woodcut_catalog, the measured section's page range contains the pages of all its
    plates. It is not a tautology — the ranges come from the text of our translation
    and the plate pages from the catalogue (plus PLATE_PAGE_FIXES), so moving either
    can break it. If it fires, open the scan for the offending plate; do not widen a
    boundary to make the assertion pass.
    """
    ranges = {r["section"]: r["pages_1499"] for r in sections() if r["pages_1499"]}
    con = sqlite3.connect(HPDB)
    rows = con.execute("select catalog_number, page_seq, narrative_section, description "
                       "from woodcut_catalog").fetchall()
    con.close()
    bad, n = [], 0
    for num, raw, sect, desc in rows:
        seq = PLATE_PAGE_FIXES.get(num, raw)
        if seq is None:
            continue
        n += 1
        sect = PLATE_SECTION_CORRECTED.get(num, sect)
        rng = ranges.get(sect)
        if rng is None:
            bad.append(f"  plate #{num}: section {sect!r} is not in MEASURED_SECTIONS")
        elif not (rng[0] <= seq <= rng[1]):
            bad.append(f"  plate #{num} ({desc}) is on page_seq {seq}, outside its section "
                       f"{sect} {rng}")
    # the ranges themselves must tile the book, in order, with no gap or overlap
    seq_ranges = [r["pages_1499"] for r in sections() if r["pages_1499"]]
    for (a1, b1), (a2, b2) in zip(seq_ranges, seq_ranges[1:]):
        if a2 != b1 + 1:
            bad.append(f"  sections do not tile: [{a1},{b1}] then [{a2},{b2}]")
    if bad:
        raise SystemExit("coverage_seed: section regression:\n" + "\n".join(bad))
    return n, len(seq_ranges)


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
    plates_in_sections, n_sections = check_sections()   # raises if a plate left its section
    n_near, n_unresolved = check_page_checked(by_ch, unplaced)  # raises if one is unlooked-at
    sigs_read, n_leaves = check_quires()   # raises if the collation stops matching a scan
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
            "sections_caveat": "sections_1499 is MEASURED — read from the text of our "
                               "translation, boundary by boundary, on 2026-09-20, and no "
                               "longer taken from hp.db.page_concordance.section, whose "
                               "boundaries ran progressively early (BOOK_II_POLIA marked at "
                               "271 when Book II opens at 371) and were never derived from "
                               "the collation at all. Every boundary carries the line that "
                               "fixes it in boundary_measured_at. Two things it still cannot "
                               "tell you: the episodes interleave (the great gate is sighted "
                               "at page_seq 21, then the ruins woodcuts run to 31, then the "
                               "gate resumes), and at two seams the boundary is set a page or "
                               "two off the narrative turn to keep each section's own plates "
                               "inside it. To place a CHAPTER still use chapters[].pages_1499. "
                               "Ticket bug-concordance-section-drift.",
            "sections_check": f"{plates_in_sections} plates asserted inside their own "
                              f"narrative_section, and the {n_sections} sections asserted to "
                              f"tile page_seq 1-{LAST_PAGE_SEQ} without gap or overlap, on "
                              f"every seed (check_sections() in scripts/coverage_seed.py)",
            "page_checked_check": f"{n_near} plates resolve within 3 pages of a chapter "
                                  f"boundary; every one of them has had its scan opened, and "
                                  f"check_page_checked() asserts that on every seed. "
                                  f"{n_unresolved} of them carry page_unresolved: the "
                                  f"catalogued page was opened and found to carry something "
                                  f"else, and the plate's true page has not been seen, so it "
                                  f"is left where the catalogue put it rather than guessed at. "
                                  f"Ticket bug-woodcut-catalog-page-jitter.",
            "dallington": "Chapters I-XVI also survive in Robert Dallington's 1592 English "
                          "(public domain), and some sources in this ledger cite him. HIS "
                          "PAGE NUMBERS ARE NOT THE 1499's: his 279 e-text pages abridge the "
                          "1499's 467, so he falls behind by about 20 pages at his p.80 and "
                          "about 60 at his p.250, with no constant that repairs it. He also "
                          "runs FURTHER than this project long believed — past the Four "
                          "Seasons altar to a formal FINIS at the end of chapter XVIII (1499 "
                          "p.241) — but only by skipping 1499 pp.194-237 outright. Confirm "
                          "any 'Dallington p. N' against the header of "
                          "translation/en/page_NNN.md before citing it. Ticket "
                          "bug-dallington-page-drift.",
            "quires_caveat": "quires_1499 is MEASURED — read off the signatures printed at "
                             "the foot of seventeen scans. hp.db.page_concordance's "
                             "signature / quire / leaf_in_quire columns are a uniform "
                             "reconstruction that omits the u gathering, stops nine pages "
                             "short of the book, and mis-places quires on both sides of that "
                             "gap; THEY ARE NOT TO BE USED FOR ANYTHING. Note that page_seq 1 "
                             "is a2r, not a1r: quire a opens on our p.9, the last preliminary "
                             "leaf. Never derive a page from a signature or 'correct' a plate "
                             "page by a leaf — open the scan. Ticket "
                             "bug-concordance-signature-quire-model.",
            "quires_check": f"{sigs_read} signatures read off scans asserted against the "
                            f"table, four scans asserted to be unsigned, and the gatherings "
                            f"asserted to tile the book at {n_leaves} leaves, on every seed "
                            f"(check_quires() in scripts/coverage_seed.py)",
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
        "quires_1499": quires(),
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
