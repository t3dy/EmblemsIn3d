"""
export_for_3d.py

Exports data from both HP and Atalanta databases into JSON files
consumed by the Three.js app at runtime. Run before npm run dev.

Outputs to: C:\Dev\HPin3D\src\data\
  emblems.json           — All 51 AF emblems with stage, elements, animation hints
  hp_annotations.json    — BL marginal annotations keyed by folio
  hp_symbols.json        — Alchemical symbols with planetary/metal associations
  hp_woodcuts.json       — Woodcut references for scene design
  hp_folio_descriptions.json — Scholarly analyses of key folios
  world_links.json       — Cross-references: HP folio ↔ AF emblem number
"""

import sqlite3
import json
import os

AF_DB  = r"C:\Dev\Claudiens\db\atalanta.db"
HP_DB  = r"C:\Dev\hypnerotomachia polyphili\db\hp.db"
OUT    = r"C:\Dev\HPin3D\src\data"

os.makedirs(OUT, exist_ok=True)


def q(conn, sql, params=()):
    c = conn.cursor()
    c.execute(sql, params)
    cols = [d[0] for d in c.description]
    return [dict(zip(cols, row)) for row in c.fetchall()]


def parse_json_col(val):
    """Safely parse a JSON string column; return raw value if it fails."""
    if val is None:
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


# ─────────────────────────────────────────────────────────────────────────────
# 1. ATALANTA EMBLEMS
# ─────────────────────────────────────────────────────────────────────────────
def export_emblems():
    conn = sqlite3.connect(AF_DB)
    rows = q(conn, """
        SELECT
            e.number,
            e.roman_numeral,
            e.canonical_label        AS label,
            e.motto_latin,
            e.motto_english,
            e.epigram_latin,
            e.epigram_english,
            e.discourse_summary,
            e.alchemical_stage,
            e.visual_elements,
            e.animation_hints,
            e.stage_palette,
            e.fugue_mode,
            ei.image_filename,
            ei.image_url
        FROM emblems e
        LEFT JOIN emblem_identity ei ON ei.emblem_number = e.number
        ORDER BY e.number
    """)
    conn.close()

    # Parse JSON columns
    for r in rows:
        r["visual_elements"]  = parse_json_col(r["visual_elements"])  or []
        r["animation_hints"]  = parse_json_col(r["animation_hints"])  or {}
        r["stage_palette"]    = parse_json_col(r["stage_palette"])    or {}
        # Build local image path (relative to Three.js public dir)
        if r["image_filename"]:
            r["image_local"] = f"/images/emblems/{r['image_filename']}"
        else:
            r["image_local"] = None

    path = os.path.join(OUT, "emblems.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    print(f"  OK emblems.json            ({len(rows)} emblems)")
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# 2. HP ANNOTATIONS (BL manuscript, manuscript_id=1)
# ─────────────────────────────────────────────────────────────────────────────
def export_hp_annotations():
    conn = sqlite3.connect(HP_DB)

    # Check which column holds the folio number
    c = conn.cursor()
    c.execute("PRAGMA table_info(annotations)")
    cols = {row[1] for row in c.fetchall()}

    # Determine actual column names from schema
    folio_col = next((c for c in ["folio", "folio_number", "page_number"] if c in cols), None)
    text_col  = next((c for c in ["text", "annotation_text"] if c in cols), None)
    ms_col    = "manuscript_id" if "manuscript_id" in cols else None

    if not folio_col or not text_col:
        conn.close()
        print(f"  WARN: annotations columns unclear (found: {sorted(cols)}) - skipping")
        return {}

    where = f"WHERE {ms_col} = 1" if ms_col else ""
    rows = q(conn, f"""
        SELECT
            id,
            hand_id,
            {folio_col}   AS folio,
            {text_col}    AS text,
            annotation_type,
            confidence,
            source_method
        FROM annotations
        {where}
        ORDER BY {folio_col}
    """)
    conn.close()

    # Group by folio
    by_folio = {}
    for r in rows:
        k = str(r["folio"])
        by_folio.setdefault(k, []).append(r)

    path = os.path.join(OUT, "hp_annotations.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(by_folio, f, indent=2, ensure_ascii=False)
    print(f"  OK hp_annotations.json     ({len(rows)} annotations, {len(by_folio)} folios)")
    return by_folio


# ─────────────────────────────────────────────────────────────────────────────
# 3. HP ALCHEMICAL SYMBOLS
# ─────────────────────────────────────────────────────────────────────────────
def export_hp_symbols():
    conn = sqlite3.connect(HP_DB)
    rows = q(conn, """
        SELECT id, symbol_name, symbol_unicode, metal, planet, gender, framework, notes
        FROM alchemical_symbols
        ORDER BY id
    """)
    conn.close()

    path = os.path.join(OUT, "hp_symbols.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    print(f"  OK hp_symbols.json         ({len(rows)} symbols)")
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# 4. HP WOODCUTS
# ─────────────────────────────────────────────────────────────────────────────
def export_hp_woodcuts():
    conn = sqlite3.connect(HP_DB)
    c = conn.cursor()
    c.execute("PRAGMA table_info(woodcuts)")
    cols = {row[1] for row in c.fetchall()}

    # Build SELECT dynamically based on what columns exist
    wanted = ["id", "subject", "category", "signature_1499", "source_method", "confidence"]
    avail  = [col for col in wanted if col in cols]
    rows = q(conn, f"SELECT {', '.join(avail)} FROM woodcuts ORDER BY id")
    conn.close()

    path = os.path.join(OUT, "hp_woodcuts.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    print(f"  OK hp_woodcuts.json        ({len(rows)} woodcuts)")
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# 5. HP FOLIO DESCRIPTIONS (key scholarly analyses)
# ─────────────────────────────────────────────────────────────────────────────
def export_folio_descriptions():
    conn = sqlite3.connect(HP_DB)
    c = conn.cursor()
    c.execute("PRAGMA table_info(folio_descriptions)")
    if not c.fetchall():
        conn.close()
        print("  WARN folio_descriptions table empty or missing — skipping")
        return []

    rows = q(conn, "SELECT * FROM folio_descriptions ORDER BY id")
    conn.close()

    path = os.path.join(OUT, "hp_folio_descriptions.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    print(f"  OK hp_folio_descriptions.json ({len(rows)} descriptions)")
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# 6. WORLD LINKS: HP folio ↔ AF emblem (editorial cross-references)
# ─────────────────────────────────────────────────────────────────────────────
WORLD_LINKS = [
    # HP folio (page number)  ↔  AF emblem numbers  + shared symbol + HP scene
    {"hp_folio": 28,  "hp_scene": "alchemical_temple",   "af_emblems": [5, 14],
     "shared_symbol": "bellua",        "link_type": "prima_materia",
     "commentary": "At folio 28 Poliphilo passes through a bestiary portal where composite monsters stand threshold-guard. The bellua recurs in Maier's Emblem V: the toad suckling at the woman's breast is prima materia in animal form — matter at its most opaque, demanding dissolution before any refinement can begin."},
    {"hp_folio": 80,  "hp_scene": "fountain",             "af_emblems": [1, 2],
     "shared_symbol": "cornucopia",    "link_type": "earth_nourishment",
     "commentary": "The Fountain of Venus occupies the centre of Poliphilo's first garden. Water cascades from tier to tier — a visible figure of Nature's gift flowing downward into matter. Maier opens the Atalanta with the same image: Nature the nurse, offering her stone as an infant at the breast. Both works begin here, at the fountain's foot."},
    {"hp_folio": 88,  "hp_scene": "planetary_palace",     "af_emblems": [17, 18],
     "shared_symbol": "sulphur",       "link_type": "elemental_fire",
     "commentary": "Folio 88 opens the planetary palace, its seven rooms ordered by the metals — Saturn's lead at the gate, Sol's gold at the innermost shrine. Maier's Emblem XVII enters the same hierarchy mid-journey, at the moment sulphur ignites: fire given to fire, the citrinitas threshold where the work begins to turn golden."},
    {"hp_folio": 119, "hp_scene": "three_doors",          "af_emblems": [19, 20],
     "shared_symbol": "quaternary",    "link_type": "elemental_dissolution",
     "commentary": "Three doorways on folio 119 offer Poliphilo a choice: Virtue, Pleasure, or the Middle Way. Each door is also an elemental gate — the fourfold dissolution that Maier's Emblems XIX and XX enact when earth, water, air, and fire are separated and recombined in the alembic."},
    {"hp_folio": 127, "hp_scene": "three_doors",          "af_emblems": [15, 16],
     "shared_symbol": "synostra_gloria_mundi", "link_type": "albedo_purification",
     "commentary": "The Gloria Mundi inscription appears above the middle door at folio 127 — a whitened threshold, the world's glory as a pale reflection of what lies beyond. Maier's Albedo emblems (XV–XVI) inhabit the same colour: silver, dew, the moon's wash over blackened matter. Purification by whitening is the same operation in both books."},
    {"hp_folio": 162, "hp_scene": "procession",           "af_emblems": [28, 29, 30],
     "shared_symbol": "cantorum",      "link_type": "rubedo_triumph",
     "commentary": "Folio 162 stages the great triumphal procession — trumpets, garlands, the chariot of Venus approaching her temple. The cantorum resonates through Maier's fugue structure: Emblems XXVIII–XXX are the Rubedo's opening fanfare, the fire now fully kindled, the work approaching its red completion."},
    {"hp_folio": 164, "hp_scene": "quinta_essentia",      "af_emblems": [46, 50],
     "shared_symbol": "quinta_essentia", "link_type": "completion",
     "commentary": "At folio 164 Poliphilo glimpses the quinta essentia — the fifth element distilled from the four, the stone itself in potential. Maier's closing emblems converge on the same mystery: Emblem L, the dragon devouring the woman, is the final self-consuming act before the philosopher's stone is revealed. Both texts end here, at the edge of what can be said."},
    # Planetary metal cross-refs
    {"hp_folio": 14,  "hp_scene": "garden",               "af_emblems": [44],
     "shared_symbol": "sol_luna",      "link_type": "solar_lunar_conjunction",
     "commentary": "Early in Poliphilo's dream the garden path divides into solar and lunar halves — warm golden light on one side, silver shadow on the other. Maier's Emblem XLIV depicts the same opposition at its most explicit: Sol and Luna as royal siblings who must be wed before the work can complete. The conjunction is encoded in the garden's geometry long before it is named."},
    {"hp_folio": 31,  "hp_scene": "alchemical_temple",    "af_emblems": [14],
     "shared_symbol": "ouroboros",     "link_type": "self_consuming_cycle",
     "commentary": "The ouroboros carved above the alchemical temple gate at folio 31 is one of the HP's most direct alchemical declarations — the self-consuming serpent as the emblem of a process that has no beginning and no end. Maier's Emblem XIV makes the same figure explicit: the dragon eating its tail is the Work itself, cycling through Nigredo and Rubedo without cease."},
]

def export_world_links():
    path = os.path.join(OUT, "world_links.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(WORLD_LINKS, f, indent=2, ensure_ascii=False)
    print(f"  OK world_links.json        ({len(WORLD_LINKS)} cross-references)")
    return WORLD_LINKS


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\nExporting data to {OUT}\n")
    emblems   = export_emblems()
    anns      = export_hp_annotations()
    symbols   = export_hp_symbols()
    woodcuts  = export_hp_woodcuts()
    folios    = export_folio_descriptions()
    links     = export_world_links()

    # Summary stats
    print(f"\n-- Summary ------------------------------------------")
    stage_counts = {}
    for e in emblems:
        s = e.get("alchemical_stage") or "UNKNOWN"
        stage_counts[s] = stage_counts.get(s, 0) + 1
    for stage, count in sorted(stage_counts.items()):
        print(f"  AF {stage:12s}: {count:2d} emblems")

    print(f"\n  HP annotations: {sum(len(v) for v in anns.values())} total, {len(anns)} folios")
    print(f"  HP symbols:     {len(symbols)}")
    print(f"  HP woodcuts:    {len(woodcuts)}")
    print(f"  World links:    {len(links)} HP<->AF cross-references")
    print(f"\nDone. All files in {OUT}")
