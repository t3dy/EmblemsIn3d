#!/usr/bin/env python3
"""Download 1499 Hypnerotomachia woodcut plates (facsimile-page scans) for the
tour's "call up the woodcut" feature, into images/woodcuts/. Only pages that
actually resolve to a real image are kept; the surviving node->files map is
printed so it can be wired into src/data/tours.json.

    python scripts/fetch_woodcuts.py
"""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "woodcuts"
UA = "EmblemsIn3D/1.0 (+https://emblems-in-3d.vercel.app) woodcut-fetch"

# node key -> (caption, [candidate facsimile page numbers, tried in order]).
# We want ~1-2 real woodcut pages per scene; the facsimile page numbers are the
# Commons "Hypnerotomachia Poliphili pagNNN.jpg" series.
NODES = {
    "wood":        ("The dreamer in the dark wood", [13, 12, 14, 15]),
    "dragon":      ("The dragon in the vaults", [34, 35, 36, 33]),
    "elephant":    ("The elephant bearing the obelisk", [25, 24, 21]),
    "horse":       ("The runaway horse (Cavallo Infelice)", [18, 26, 15]),
    "colossus":    ("The bronze colossus", [30, 31, 33]),
    "portal":      ("The great triumphal portal", [38, 39, 35, 61]),
    "bath":        ("The five nymphs and the bath", [73, 76, 74, 72]),
    "queen":       ("Queen Eleuterylida enthroned", [62, 64, 88, 92]),
    "three_doors": ("The three doors", [115, 129, 112]),
    "triumph1":    ("The first triumph of Jove", [162, 160, 149]),
    "triumph2":    ("A further triumph", [165, 169, 173]),
    "temple_venus":("The Temple of Venus Physizoa", [208, 211, 207]),
    "priapus":     ("The rite of Priapus", [215, 217, 201]),
    "polyandrion": ("The Polyandrion and its tombs", [250, 253, 256, 242]),
    "boat":        ("Cupid's boat to Cythera", [283, 285, 289]),
    "island_plan": ("The circular island of Cythera (plan)", [298, 299, 300, 297, 307]),
    "theatre":     ("The amphitheatre of Venus", [334, 331, 340]),
    "fountain_venus":("The Fountain of Venus revealed", [359, 351, 350]),
    "adonis":      ("The tomb of Adonis", [373, 369, 377]),
    "awakening":   ("The awakening", [458, 457, 456]),
}


def fetch(page, dest):
    name = f"Hypnerotomachia Poliphili pag{page:03d}.jpg"
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + \
          urllib.parse.quote(name) + "?width=1100"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            ct = r.headers.get("Content-Type", "")
            data = r.read()
    except Exception:
        return None
    if not ct.startswith("image/") or len(data) < 6000 or data[:3] != b"\xff\xd8\xff":
        return None
    dest.write_bytes(data)
    return name, len(data)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mapping = {}
    for node, (cap, pages) in NODES.items():
        existing = next((p for p in OUT.glob(node + ".*")), None)
        if existing:
            mapping[node] = {"file": "woodcuts/" + existing.name, "caption": cap}
            print(f"OK   {node:16s} (cached) {existing.name}")
            continue
        got = None
        for pg in pages:
            got = fetch(pg, OUT / f"{node}.jpg")
            if got:
                mapping[node] = {"file": f"woodcuts/{node}.jpg", "caption": cap, "page": pg}
                print(f"OK   {node:16s} p{pg:<4d} {got[1]//1024} KB")
                break
            time.sleep(0.35)
        if not got:
            print(f"MISS {node:16s} tried {pages}")
    (ROOT / "scripts" / "_woodcut_map.json").write_text(
        json.dumps(mapping, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{len(mapping)}/{len(NODES)} woodcuts kept -> scripts/_woodcut_map.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
