"""Measure where each cut-out figure actually sits on its card.

The cutouts are centred on a fixed 448x896 card and deliberately NOT scaled to
fill it: they are all cut at one scale, so the card carries each figure's true
height relative to the others and a short figure simply sits lower. That is
right for `Cast.paintedFigure`, which shows the whole card at a fixed world
size -- but it is exactly what breaks a projection, which needs to know the
sub-rectangle of the card the pigment occupies. Map a mesh onto the whole card
and the figure is stretched across the transparent margin, sampling black.

So: read the alpha channel, take the tight bounds of what is actually painted,
and record them as UVs. Written into `src/data/figure_cutouts.json` as
`card_uv` = [u0, v0, u1, v1], v measured from the BOTTOM (GL convention, not
image convention), and emitted as a JS table for src/systems/Cast.js.

Run from the repo root:  python scripts/cutout_uv_bounds.py
"""

import io
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "src", "data", "figure_cutouts.json")
CUTOUTS = os.path.join(ROOT, "images", "cutouts", "figures")

ALPHA_FLOOR = 8          # below this a pixel is background, not feathered edge


def bounds(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    alpha = im.getchannel("A")
    box = alpha.point(lambda a: 255 if a > ALPHA_FLOOR else 0).getbbox()
    if not box:
        raise SystemExit("no opaque pixels in " + path)
    x0, y0, x1, y1 = box
    # image y runs down from the top; GL v runs up from the bottom
    return {
        "px": [w, h],
        "uv": [round(x0 / w, 5), round(1 - y1 / h, 5),
               round(x1 / w, 5), round(1 - y0 / h, 5)],
    }


def main():
    manifest = json.load(io.open(MANIFEST, encoding="utf-8"))
    table = {}
    for entry in manifest:
        path = os.path.join(CUTOUTS, entry["id"] + ".png")
        if not os.path.exists(path):
            print("  MISSING", entry["id"])
            continue
        b = bounds(path)
        entry["card_uv"] = b["uv"]
        table[entry["id"]] = b["uv"]
        u0, v0, u1, v1 = b["uv"]
        print("  %-10s card %sx%s  u %.3f-%.3f  v %.3f-%.3f  (%.0f%% of the height)"
              % (entry["id"], b["px"][0], b["px"][1], u0, u1, v0, v1, (v1 - v0) * 100))

    json.dump(manifest, io.open(MANIFEST, "w", encoding="utf-8"),
              indent=2, ensure_ascii=False)
    print("\nwrote card_uv into", os.path.relpath(MANIFEST, ROOT))

    print("\n--- paste into src/systems/Cast.js ---")
    print("  const CUTOUT_UV = {")
    for k in sorted(table):
        print("    %-11s [%s]," % ("'" + k + "':", ", ".join("%.4f" % n for n in table[k])))
    print("  };")


if __name__ == "__main__":
    main()
