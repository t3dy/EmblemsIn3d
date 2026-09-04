#!/usr/bin/env python3
"""Download public-domain art exemplars for the Gallery tab into images/gallery/,
and write src/data/gallery.json from the files that actually resolved.

We self-host (Ted's call, 2026-09-04, DECISIONS.md) so the site never depends on
Wikimedia Commons uptime. Every candidate is tried against Commons' Special:FilePath
redirect; only real images (right magic bytes, sane size) are kept, and the manifest
is built from survivors — never from assumptions about what exists.

    python scripts/fetch_gallery.py            # fetch missing, keep existing
    python scripts/fetch_gallery.py --refetch  # re-download everything
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "images" / "gallery"
MANIFEST = ROOT / "src" / "data" / "gallery.json"
UA = "EmblemsIn3D/1.0 (+https://emblems-in-3d.vercel.app) gallery-fetch"

# Each entry may list several candidate Commons filenames; the first that
# resolves to a real image wins. category/title/artist/date/caption are the
# intended provenance and are kept regardless of which candidate succeeded.
ENTRIES = [
    # ── The book itself: 1499 Venetian woodcuts ──────────────────────────────
    dict(id="hp_frontispiece", category="The 1499 woodcuts", title="Poliphilo in the dark wood",
         artist="Hypnerotomachia Poliphili (anon. woodcut)", date="Venice, 1499",
         caption="The dream begins: Poliphilo strays into the selva oscura.",
         files=["Hypnerotomachia Poliphili pag011.jpg", "Hypnerotomachia Poliphili pag013.jpg",
                "Hypnerotomachia Poliphili pag009.jpg"]),
    dict(id="hp_elephant", category="The 1499 woodcuts", title="The elephant and obelisk",
         artist="Hypnerotomachia Poliphili", date="Venice, 1499",
         caption="The stone elephant with a spiral stair through its belly, bearing an obelisk.",
         files=["Hypnerotomachia Poliphili pag025.jpg", "Hypnerotomachia Poliphili pag021.jpg",
                "Hypnerotomachia Poliphili pag024.jpg"]),
    dict(id="hp_portal", category="The 1499 woodcuts", title="The great triumphal portal",
         artist="Hypnerotomachia Poliphili", date="Venice, 1499",
         caption="The Vitruvian gateway Poliphilo reads stone by stone.",
         files=["Hypnerotomachia Poliphili pag038.jpg", "Hypnerotomachia Poliphili pag035.jpg",
                "Hypnerotomachia Poliphili pag061.jpg"]),
    dict(id="hp_nymph_fountain", category="The 1499 woodcuts", title="The sleeping nymph fountain",
         artist="Hypnerotomachia Poliphili", date="Venice, 1499",
         caption="The famous fountain-nymph woodcut — a model for the garden's naiads.",
         files=["Hypnerotomachia Poliphili pag073.jpg", "Hypnerotomachia Poliphili pag076.jpg"]),
    dict(id="hp_triumph", category="The 1499 woodcuts", title="A triumph of Jupiter",
         artist="Hypnerotomachia Poliphili", date="Venice, 1499",
         caption="One of the four triumphal chariots of Jove's loves.",
         files=["Hypnerotomachia Poliphili MET DP102572.jpg",
                "Hypnerotomachia Poliphili MET DP102571.jpg"]),
    dict(id="hp_priapus", category="The 1499 woodcuts", title="The rite of Priapus",
         artist="Hypnerotomachia Poliphili", date="Venice, 1499",
         caption="The sacrifice woodcut near where Dallington's English breaks off.",
         files=["Hypnerotomachia Poliphili pag215.jpg", "Hypnerotomachia Poliphili pag226.jpg",
                "Hypnerotomachia Poliphili pag201.jpg"]),

    # ── Venus & High-Renaissance painting (lit-mode figures) ─────────────────
    dict(id="botticelli_venus", category="Venus & the nude", title="The Birth of Venus",
         artist="Sandro Botticelli", date="c. 1485",
         caption="Venus rising from the sea-foam off Cythera — the model for the fountain goddess.",
         files=["Sandro Botticelli - La nascita di Venere - Google Art Project - edited.jpg",
                "Sandro Botticelli - La nascita di Venere - Google Art Project.jpg",
                "Birth of Venus Botticelli.jpg"]),
    dict(id="botticelli_primavera", category="Venus & the nude", title="Primavera",
         artist="Sandro Botticelli", date="c. 1480",
         caption="Venus, the Graces and Flora in a flowering grove — a Cythera before Cythera.",
         files=["Botticelli-primavera.jpg",
                "Sandro Botticelli - La Primavera - Google Art Project.jpg"]),
    dict(id="titian_venus", category="Venus & the nude", title="Venus of Urbino",
         artist="Titian (Tiziano Vecellio)", date="1534",
         caption="The reclining Venus — the sensuous body the lit garden reaches toward.",
         files=["Tiziano - Venere di Urbino - Google Art Project.jpg",
                "Vecelli, Tiziano - Venus of Urbino - Google Art Project.jpg",
                "Tizian 102.jpg"]),
    dict(id="cranach_venus", category="Venus & the nude", title="Venus",
         artist="Lucas Cranach the Elder", date="1532",
         caption="The Northern Venus — an early-modern nude in the Cranach line.",
         files=["Lucas Cranach the Elder - Venus - Google Art Project.jpg",
                "Lucas Cranach d. Ä. 068.jpg"]),

    # ── Nymphs & female figures (the sourcebook brief) ───────────────────────
    dict(id="cranach_nymph", category="Nymphs", title="Reclining spring-nymph",
         artist="Lucas Cranach the Elder", date="c. 1518",
         caption="The sleeping fountain-nymph — proportion and repose for the garden naiads.",
         files=["Lucas Cranach d.Ä. - Ruhende Quellnymphe (Washington, D.C.).jpg"]),
    dict(id="cellini_nymph", category="Nymphs", title="Nymph of Fontainebleau",
         artist="Benvenuto Cellini", date="1542–43",
         caption="Cellini's Mannerist bronze — the elongated body that reads at low poly.",
         files=["La Nymphe de Fontainebleau - Benvenuto Cellini - Musée du Louvre Sculptures MR 1706 ; N 15050.jpg"]),
    dict(id="waterhouse_nymphs", category="Nymphs", title="Hylas and the Nymphs",
         artist="John William Waterhouse", date="1896",
         caption="A later reception of the water-nymph — drapery, gesture, and the pool.",
         files=["John William Waterhouse - Hylas and the Nymphs (1896).jpg"]),

    # ── Antiquarian architecture ─────────────────────────────────────────────
    dict(id="vitruvian_man", category="Architecture", title="Vitruvian Man",
         artist="Leonardo da Vinci", date="c. 1490",
         caption="Human proportion as cosmic ratio — the theory behind the HP's portals.",
         files=["Da Vinci Vitruve Luc Viatour.jpg"]),
    dict(id="tempietto", category="Architecture", title="Tempietto of San Pietro in Montorio",
         artist="Donato Bramante", date="1502",
         caption="The perfect centrally-planned temple the round Temple of Venus anticipates.",
         files=["Tempietto di San Pietro in Montorio.jpg",
                "San Pietro in Montorio; Tempietto del Bramante.jpg"]),
    dict(id="bernini_elephant", category="Architecture", title="Elephant and Obelisk",
         artist="Gian Lorenzo Bernini", date="1667",
         caption="Bernini's Piazza della Minerva monument — descended directly from the HP woodcut.",
         files=["Elephant and Obelisk - Bernini.jpg", "Bernini elephant and obelisk, Rome.jpg"]),
    dict(id="alberti_smn", category="Architecture", title="Santa Maria Novella façade",
         artist="Leon Battista Alberti", date="1470",
         caption="Alberti gave the Quattrocento its architectural mathematics (De re aedificatoria).",
         files=["The facade of Santa Maria Novella.jpg"]),
    dict(id="colosseum", category="Architecture", title="The Colosseum",
         artist="Flavian Amphitheatre", date="Rome, 80 AD",
         caption="The Roman amphitheatre — the form Cythera's theatre of Venus reimagines as planted tiers.",
         files=["Colosseum in Rome, Italy - April 2007.jpg",
                "Colosseum in Rome-April 2007-1- copie 2B.jpg"]),
    dict(id="pantheon", category="Architecture", title="The Pantheon, dome interior",
         artist="Roman architecture", date="Rome, c. 125 AD",
         caption="The great coffered rotunda — ancestor of every centrally-planned Temple of Venus.",
         files=["Pantheon (Rome), Dome interior.jpg", "Pantheon (Rome) - Dome interior.jpg"]),

    # ── Triumphs & processions ───────────────────────────────────────────────
    dict(id="mantegna_triumph", category="Triumphs", title="The Triumphs of Caesar",
         artist="Andrea Mantegna", date="1484–92",
         caption="The antique triumph revived — Colonna's four chariots share its DNA.",
         files=["Andrea Mantegna 037.jpg", "Mantegna, trionfi di cesare 05.jpg",
                "Los triunfos del César, por Andrea Mantegna.jpg"]),

    # ── Gardens & Cythera ────────────────────────────────────────────────────
    dict(id="watteau_cythera", category="Gardens & Cythera", title="The Embarkation for Cythera",
         artist="Antoine Watteau", date="1717",
         caption="The voyage to Venus's island, two centuries after Poliphilo made the same crossing.",
         files=["L'Embarquement pour Cythère, by Antoine Watteau, from C2RMF retouched.jpg",
                "Antoine Watteau - Pilgrimage to Cythera.jpg",
                "Jean-Antoine Watteau - Pilgrimage to Cythera.jpg"]),

    # ── Hieroglyphs, emblems & early-modern prints ───────────────────────────
    dict(id="durer_melencolia", category="Emblems & prints", title="Melencolia I",
         artist="Albrecht Dürer", date="1514",
         caption="The early-modern engraving as dense emblem — image as puzzle, like the HP's hieroglyphs.",
         files=["Albrecht Dürer - Melencolia I - Google Art Project.jpg",
                "Dürer Melancholia I.jpg", "Albrecht Dürer - Melencolia I (Alte Nationalgalerie).jpg"]),
    dict(id="durer_triumph", category="Emblems & prints", title="Knight, Death and the Devil",
         artist="Albrecht Dürer", date="1513",
         caption="Dürer's line at its most sculptural — a touchstone for the woodcut render mode.",
         files=["Knight, Death and the Devil MET DP159049.jpg",
                "Knight, Death, and the Devil MET DP815737.jpg"]),

    # ── Medieval exemplars ───────────────────────────────────────────────────
    dict(id="roman_de_la_rose", category="Medieval", title="Le Roman de la Rose",
         artist="Illuminated manuscript", date="14th c.",
         caption="The dream-vision garden of love the HP inherits and antiquarianises.",
         files=["Roman de la rose f. 12v (lover before the garden).jpg",
                "Roman de la Rose f001r.jpg", "Meister des Rosenromans 001.jpg"]),
    dict(id="della_robbia", category="Medieval", title="Madonna and Child with Cherubim",
         artist="Andrea della Robbia", date="c. 1485",
         caption="Glazed terracotta relief — the Quattrocento's sculptural sweetness.",
         files=["Andrea della Robbia, Madonna and Child with Cherubim, c. 1485, NGA 129.jpg"]),
]


def fetch(filename, dest):
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + \
          urllib.parse.quote(filename) + "?width=1100"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        ct = r.headers.get("Content-Type", "")
        data = r.read()
    if not ct.startswith("image/") or len(data) < 8000:
        return None
    if data[:3] == b"\xff\xd8\xff":
        ext = ".jpg"
    elif data[:8] == b"\x89PNG\r\n\x1a\n":
        ext = ".png"
    else:
        return None
    dest = dest.with_suffix(ext)
    dest.write_bytes(data)
    return dest.name, filename, len(data)


def main():
    refetch = "--refetch" in sys.argv
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []
    kept, missed = 0, 0
    for e in ENTRIES:
        # already have it?
        existing = next((p for p in OUT_DIR.glob(e["id"] + ".*")), None)
        if existing and not refetch:
            got = (existing.name, "(cached)", existing.stat().st_size)
        else:
            got = None
            for fn in e["files"]:
                try:
                    got = fetch(fn, OUT_DIR / e["id"])
                    if got:
                        break
                except Exception as ex:
                    print(f"  .. {e['id']}: {fn[:40]} -> {ex}")
                time.sleep(0.4)
        if not got:
            print(f"MISS {e['id']}: no candidate resolved")
            missed += 1
            continue
        name, src, size = got
        commons_page = ("https://commons.wikimedia.org/wiki/File:" +
                        urllib.parse.quote(src.replace(" ", "_"))) if src != "(cached)" else ""
        manifest.append({
            "id": e["id"], "category": e["category"], "title": e["title"],
            "artist": e["artist"], "date": e["date"], "caption": e["caption"],
            "file": "gallery/" + name, "source": commons_page,
        })
        print(f"OK   {e['id']:22s} {size//1024:4d} KB  {name}")
        kept += 1
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nwrote {MANIFEST.relative_to(ROOT)} — {kept} images kept, {missed} missed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
