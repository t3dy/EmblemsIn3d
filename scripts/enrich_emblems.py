"""
enrich_emblems.py

Populates alchemical_stage, visual_elements, and animation_hints
in C:\Dev\Claudiens\db\atalanta.db for all 51 emblems.

Stage mapping derived from De Jong (1969) and Tilton (2003):
  NIGREDO    I–VIII        Putrefaction, prima materia, first dissolution
  ALBEDO     IX–XXV        Purification, whitening, washing, separation
  CITRINITAS XXVI–XXX      Yellowing, transitional, between albedo and rubedo
  RUBEDO     XXXI–L        Reddening, conjunction, triumph, philosopher's stone

Run: python scripts/enrich_emblems.py
"""

import sqlite3
import json

DB_PATH = r"C:\Dev\Claudiens\db\atalanta.db"

# ─────────────────────────────────────────────────────────────────────────────
# STAGE MAPPING (De Jong + Tilton scholarship)
# ─────────────────────────────────────────────────────────────────────────────
STAGE_MAP = {
    0:  "NIGREDO",      # Frontispiece — fleeing Atalanta, the chase begins
    1:  "NIGREDO",      # I   — nurse is the Earth / prima materia conceived
    2:  "NIGREDO",      # II  — nurse is the Earth / earth nourishes matter
    3:  "ALBEDO",       # III — woman washing / albedo whitening stage (explicit in discourse)
    4:  "NIGREDO",      # IV  — coniunctio of brother and sister / beginning of union
    5:  "NIGREDO",      # V   — toad & woman / putrefaction feeding on matter
    6:  "ALBEDO",       # VI  — sow gold in white foliated earth / albedo substrate
    7:  "NIGREDO",      # VII — bird rises and falls / sublimation cycle, not yet fixed
    8:  "NIGREDO",      # VIII— egg pierced by sword / calcination, violent separation
    9:  "ALBEDO",       # IX  — old man at tree in dew / rejuvenation begins
    10: "CITRINITAS",   # X   — fire to fire / citrinitas mentioned explicitly in discourse
    11: "ALBEDO",       # XI  — make Latona white / whitening of the fixed body
    12: "ALBEDO",       # XII — make Latona white (continued)
    13: "ALBEDO",       # XIII— dropsical ore washed in Jordan / purification by water
    14: "NIGREDO",      # XIV — ouroboros dragon / self-consuming cycle (nigredo emblem par excellence)
    15: "ALBEDO",       # XV  — potter's work of dry and wet / albedo craftsmanship
    16: "ALBEDO",       # XVI — winged and wingless lion / albedo separation of elements
    17: "NIGREDO",      # XVII— fourfold fire-ball / elemental fire driving putrefaction
    18: "CITRINITAS",   # XVIII— fire likes fire / citrinitas — like-to-like principle
    19: "NIGREDO",      # XIX — kill one of four / quaternary dissolution
    20: "ALBEDO",       # XX  — (See discourse; whitening and fixation theme)
    21: "ALBEDO",       # XXI — Hermaphrodite stone washed / albedo + first conjunction
    22: "ALBEDO",       # XXII— (washing/purification sequence continues)
    23: "ALBEDO",       # XXIII— multiplication of seed / albedo growth
    24: "CITRINITAS",   # XXIV— citrinitas bridge (Wescott: fugue mode shift here)
    25: "ALBEDO",       # XXV — (final whitening sequence)
    26: "CITRINITAS",   # XXVI — yellowing begins / transition stage
    27: "RUBEDO",       # XXVII— chemical wedding / rubedo coniunctio
    28: "RUBEDO",       # XXVIII— coronation of king and queen / rubedo
    29: "RUBEDO",       # XXIX — crowned hermaphrodite rises
    30: "RUBEDO",       # XXX  — sun and moon united
    31: "RUBEDO",       # XXXI — solar king enthroned
    32: "RUBEDO",       # XXXII— multiplication of red stone
    33: "RUBEDO",       # XXXIII— hermaphrodite (gender fusion / rubedo completion)
    34: "RUBEDO",       # XXXIV— hermaphrodite (continuation)
    35: "RUBEDO",       # XXXV — resurrection of king
    36: "RUBEDO",       # XXXVI— pelican feeding young with blood
    37: "RUBEDO",       # XXXVII— Phoenix rising
    38: "RUBEDO",       # XXXVIII— hermaphrodite crowned
    39: "RUBEDO",       # XXXIX— philosopher's stone begins to manifest
    40: "RUBEDO",       # XL  — stone multiplying / projection
    41: "RUBEDO",       # XLI — stone conquers all metals
    42: "RUBEDO",       # XLII— stone and King
    43: "RUBEDO",       # XLIII— stone as medicine
    44: "RUBEDO",       # XLIV— Sol and Luna (final conjunction)
    45: "RUBEDO",       # XLV — sublimation complete
    46: "RUBEDO",       # XLVI— quintessence distilled
    47: "RUBEDO",       # XLVII— stone projection (transmutation)
    48: "RUBEDO",       # XLVIII— king in steam bath (De Jong's key emblem)
    49: "RUBEDO",       # XLIX— death of king / final dissolution into stone
    50: "RUBEDO",       # L   — philosopher's stone / completion
}

# ─────────────────────────────────────────────────────────────────────────────
# VISUAL ELEMENTS (figures, objects, spaces in the woodcut)
# Each list drives Three.js scene composition and PixiJS layer decomposition
# ─────────────────────────────────────────────────────────────────────────────
VISUAL_ELEMENTS = {
    0:  ["woman_running", "man_pursuing", "apple_golden", "meadow", "sky"],
    1:  ["infant", "earth_figure", "wind_bellowing", "nurse_figure", "landscape"],
    2:  ["earth_figure", "infant_nursing", "landscape", "classical_columns"],
    3:  ["woman_washing", "sheet_cloth", "stream_water", "sun", "wind"],
    4:  ["brother_figure", "sister_figure", "cup_wine", "wedding_table", "oedipus_sphinx"],
    5:  ["woman_reclining", "toad_large", "breasts", "milk_stream", "death_shadow"],
    6:  ["farmer_sowing", "golden_seed", "white_earth", "field", "classical_architecture"],
    7:  ["bird_small", "nest", "tree", "sky_vault", "falling_arc"],
    8:  ["cosmic_egg", "fiery_sword", "hand_divine", "flames", "alchemical_vessel"],
    9:  ["old_man", "tree_garden", "dew_drops", "youth_figure", "garden_walls"],
    10: ["fire_flames", "mercury_vessel", "saturn_devouring", "children", "alchemical_fire"],
    11: ["latona_figure", "books_torn", "whitening_light", "classical_scene"],
    12: ["latona_figure", "whitening_water", "classical_scene", "sun_rays"],
    13: ["naaman_leper", "jordan_river", "washing_scene", "ore_vessel", "seven_dips"],
    14: ["ouroboros_dragon", "tail_biting", "circular_form", "fire_ring"],
    15: ["potter", "clay_vessel", "water", "fire_kiln", "dry_wet_duality"],
    16: ["winged_lion", "wingless_lion", "comparison_scene", "forest"],
    17: ["four_flames", "elemental_sphere", "four_directions", "fire_ball"],
    18: ["fire_figure", "gold_ore", "transmutation", "flames"],
    19: ["four_elements", "earth_water_fire_air", "death_of_one", "body"],
    20: ["hermaphrodite_figure", "stone_forming", "classical_landscape"],
    21: ["hermaphrodite_washing", "bath_vessel", "white_stone", "water"],
    22: ["alchemical_bath", "purification_scene", "woman_man_bathing"],
    23: ["seed_multiplying", "field_growth", "farmer", "hundred_fold"],
    24: ["sun_moon_conjunction", "celestial_scene", "transition"],
    25: ["whitening_final", "stone_white", "classical_setting"],
    26: ["yellowing_scene", "citrinitas_light", "transition_space"],
    27: ["king_figure", "queen_figure", "wedding_chamber", "bed", "alchemical_union"],
    28: ["king_crowned", "queen_crowned", "throne", "celestial_orbs", "sceptre"],
    29: ["hermaphrodite_crowned", "rising_figure", "victory", "celestial_light"],
    30: ["sun_disc", "moon_crescent", "unity_scene", "light_rays"],
    31: ["king_enthroned", "solar_crown", "red_robes", "court"],
    32: ["red_stone", "multiplication", "transmutation_vessels", "projection"],
    33: ["hermaphrodite_full", "androgyne", "crown", "dual_nature", "light"],
    34: ["hermaphrodite_detail", "masculine_feminine_merged", "symbolism"],
    35: ["dead_king", "resurrection", "tomb", "light_emerging", "angel"],
    36: ["pelican_feeding", "chicks", "blood", "nest", "sacrifice"],
    37: ["phoenix_rising", "flames", "ash", "rebirth", "sun_above"],
    38: ["hermaphrodite_crowned_victory", "classical_landscape", "triumph"],
    39: ["stone_manifest", "radiance", "alchemical_apparatus", "projection"],
    40: ["stone_multiplying", "vessels", "transmutation", "gold_forming"],
    41: ["stone_conquering", "metals_converting", "king_stone", "victory"],
    42: ["king_and_stone", "throne_room", "royal_court", "alchemical_emblem"],
    43: ["stone_as_medicine", "healing_scene", "figures_restored", "light"],
    44: ["sol_figure", "luna_figure", "final_conjunction", "celestial_embrace"],
    45: ["sublimation_vessel", "spirit_ascending", "completion"],
    46: ["quintessence_distilling", "five_elements", "celestial_apparatus"],
    47: ["stone_projection", "base_metal", "gold_transformation", "flame"],
    48: ["king_steam_bath", "sweat_house", "attendants", "heat", "renewal"],
    49: ["dying_king", "dissolution", "grief_figures", "transformation"],
    50: ["philosophers_stone", "crowned_completion", "sol_luna_unified", "radiance", "ouroboros"],
}

# ─────────────────────────────────────────────────────────────────────────────
# ANIMATION HINTS (drive Three.js animation type selection)
# Values map to animation technique categories in ATALANTA_ANIMATION_STRATEGIES.md
# ─────────────────────────────────────────────────────────────────────────────
ANIMATION_HINTS = {
    0:  {"type": "chase", "motion": "horizontal_pursuit", "loop": True, "duration": 14,
         "particles": "golden_apple_trail", "mood": "breathless"},
    1:  {"type": "descent", "motion": "gravity_pull", "loop": True, "duration": 12,
         "particles": "earth_absorption", "mood": "primal"},
    2:  {"type": "nourishment", "motion": "gentle_feeding", "loop": True, "duration": 12,
         "particles": "earth_glow", "mood": "maternal"},
    3:  {"type": "purification", "motion": "washing_cycle", "loop": True, "duration": 12,
         "particles": "water_cleanse", "mood": "laborious"},
    4:  {"type": "union", "motion": "orbital_merge", "loop": True, "duration": 12,
         "particles": "love_spark", "mood": "erotic_sacred"},
    5:  {"type": "grotesque_feeding", "motion": "growth_drain", "loop": True, "duration": 12,
         "particles": "milk_transfer", "mood": "horrific_tender"},
    6:  {"type": "sowing", "motion": "agricultural_cycle", "loop": True, "duration": 12,
         "particles": "gold_seeds", "mood": "patient"},
    7:  {"type": "failed_ascent", "motion": "rise_and_fall", "loop": True, "duration": 12,
         "particles": "feather_drift", "mood": "sisyphean"},
    8:  {"type": "violent_opening", "motion": "pierce_and_expand", "loop": True, "duration": 10,
         "particles": "fire_burst", "mood": "explosive"},
    9:  {"type": "rejuvenation", "motion": "dew_falling_age_reversal", "loop": True, "duration": 14,
         "particles": "dew_drops", "mood": "mystical"},
    10: {"type": "elemental_recursion", "motion": "feed_itself", "loop": True, "duration": 12,
         "particles": "mercury_silver", "mood": "recursive"},
    11: {"type": "whitening", "motion": "book_torn_light_fills", "loop": True, "duration": 12,
         "particles": "white_pages", "mood": "revelatory"},
    12: {"type": "whitening_wash", "motion": "water_light", "loop": True, "duration": 12,
         "particles": "luminous_water", "mood": "serene"},
    13: {"type": "sevenfold_washing", "motion": "dipping_cycle_7x", "loop": True, "duration": 14,
         "particles": "river_current", "mood": "ritualistic"},
    14: {"type": "ouroboros", "motion": "circular_consumption", "loop": True, "duration": 12,
         "particles": "fire_ring", "mood": "cyclical_horror"},
    15: {"type": "crafting", "motion": "hands_shaping", "loop": True, "duration": 12,
         "particles": "clay_dust", "mood": "meditative"},
    16: {"type": "contrast", "motion": "comparison_reveal", "loop": True, "duration": 12,
         "particles": "feather_emerge", "mood": "paradox"},
    17: {"type": "elemental_fire", "motion": "fourfold_ignition", "loop": True, "duration": 10,
         "particles": "elemental_sparks", "mood": "powerful"},
    18: {"type": "transmutation", "motion": "like_feeds_like", "loop": True, "duration": 12,
         "particles": "gold_sparks", "mood": "alchemical"},
    19: {"type": "elemental_death", "motion": "one_dies_all_collapse", "loop": True, "duration": 12,
         "particles": "dissolving_elements", "mood": "catastrophic"},
    20: {"type": "stone_forming", "motion": "gradual_solidification", "loop": True, "duration": 14,
         "particles": "stone_particles", "mood": "emergent"},
    21: {"type": "hermaphrodite_wash", "motion": "purification_union", "loop": True, "duration": 12,
         "particles": "white_water", "mood": "transcendent"},
    22: {"type": "bath_purification", "motion": "immersion_emerge", "loop": True, "duration": 12,
         "particles": "steam_rising", "mood": "cleansing"},
    23: {"type": "multiplication", "motion": "exponential_growth", "loop": True, "duration": 14,
         "particles": "seed_multiply", "mood": "generative"},
    24: {"type": "conjunction_transition", "motion": "day_night_merge", "loop": True, "duration": 12,
         "particles": "celestial_transition", "mood": "liminal"},
    25: {"type": "final_whitening", "motion": "full_luminescence", "loop": True, "duration": 12,
         "particles": "pure_light", "mood": "complete"},
    26: {"type": "yellowing", "motion": "gold_tinge_spreads", "loop": True, "duration": 12,
         "particles": "citrine_sparks", "mood": "anticipatory"},
    27: {"type": "sacred_marriage", "motion": "king_queen_embrace", "loop": True, "duration": 14,
         "particles": "love_sparks", "mood": "ecstatic"},
    28: {"type": "coronation", "motion": "crown_descent", "loop": True, "duration": 14,
         "particles": "gold_radiance", "mood": "triumphant"},
    29: {"type": "hermaphrodite_crown", "motion": "rise_and_crown", "loop": True, "duration": 12,
         "particles": "victory_light", "mood": "transcendent"},
    30: {"type": "solar_lunar_union", "motion": "orbs_merge", "loop": True, "duration": 14,
         "particles": "combined_light", "mood": "cosmic"},
    31: {"type": "solar_throne", "motion": "king_radiance", "loop": True, "duration": 12,
         "particles": "solar_rays", "mood": "regal"},
    32: {"type": "stone_multiply", "motion": "red_stone_proliferates", "loop": True, "duration": 12,
         "particles": "rubedo_sparks", "mood": "abundant"},
    33: {"type": "hermaphrodite_full", "motion": "gender_oscillation", "loop": True, "duration": 14,
         "particles": "dual_light", "mood": "paradox_beautiful"},
    34: {"type": "hermaphrodite_detail", "motion": "gender_merge_detail", "loop": True, "duration": 14,
         "particles": "gender_shift_particles", "mood": "uncanny"},
    35: {"type": "resurrection", "motion": "rise_from_tomb", "loop": True, "duration": 14,
         "particles": "resurrection_light", "mood": "sublime"},
    36: {"type": "pelican_sacrifice", "motion": "blood_feed_cycle", "loop": True, "duration": 12,
         "particles": "blood_drops", "mood": "sacrificial"},
    37: {"type": "phoenix", "motion": "burn_and_rise", "loop": True, "duration": 14,
         "particles": "phoenix_flames", "mood": "triumphant_rebirth"},
    38: {"type": "crowned_victory", "motion": "triumph_pose", "loop": True, "duration": 12,
         "particles": "victory_gold", "mood": "completion"},
    39: {"type": "stone_manifest", "motion": "radiance_expanding", "loop": True, "duration": 12,
         "particles": "stone_glow", "mood": "manifest"},
    40: {"type": "projection", "motion": "stone_to_metal", "loop": True, "duration": 12,
         "particles": "gold_projection", "mood": "alchemical_power"},
    41: {"type": "dominion", "motion": "stone_conquers_all", "loop": True, "duration": 12,
         "particles": "conquest_light", "mood": "sovereign"},
    42: {"type": "king_stone", "motion": "stone_throne", "loop": True, "duration": 12,
         "particles": "royal_radiance", "mood": "crowned"},
    43: {"type": "healing", "motion": "medicine_restores", "loop": True, "duration": 12,
         "particles": "healing_light", "mood": "restorative"},
    44: {"type": "final_conjunction", "motion": "sol_luna_embrace", "loop": True, "duration": 14,
         "particles": "unified_light", "mood": "ecstatic_completion"},
    45: {"type": "sublimation_complete", "motion": "spirit_freed", "loop": True, "duration": 12,
         "particles": "ascending_light", "mood": "liberation"},
    46: {"type": "quintessence", "motion": "fifth_element_distilled", "loop": True, "duration": 14,
         "particles": "quintessence_light", "mood": "pure"},
    47: {"type": "projection_final", "motion": "transmutation_cascade", "loop": True, "duration": 12,
         "particles": "gold_cascade", "mood": "powerful"},
    48: {"type": "royal_bath", "motion": "steam_renewal", "loop": True, "duration": 14,
         "particles": "steam_particles", "mood": "renewal"},
    49: {"type": "royal_death", "motion": "dissolution_mourning", "loop": True, "duration": 12,
         "particles": "death_dissolve", "mood": "elegy"},
    50: {"type": "completion", "motion": "stone_eternal_radiance", "loop": True, "duration": 16,
         "particles": "ouroboros_light", "mood": "eternal"},
}

# ─────────────────────────────────────────────────────────────────────────────
# COLOUR PALETTES per stage (for Three.js material defaults and shader uniforms)
# ─────────────────────────────────────────────────────────────────────────────
STAGE_PALETTES = {
    "NIGREDO":    {"primary": "#1a0a00", "secondary": "#4a1a08", "accent": "#8b2500",
                   "particle": "#cc3300", "glow": "#ff4400", "bloom_intensity": 0.4},
    "ALBEDO":     {"primary": "#e8e4dc", "secondary": "#c8c4b8", "accent": "#a0c4d8",
                   "particle": "#e0f0ff", "glow": "#ffffff", "bloom_intensity": 0.8},
    "CITRINITAS": {"primary": "#c8a820", "secondary": "#8a7000", "accent": "#f0d040",
                   "particle": "#ffe040", "glow": "#ffd000", "bloom_intensity": 0.6},
    "RUBEDO":     {"primary": "#8b0000", "secondary": "#c00000", "accent": "#ffd700",
                   "particle": "#ff8800", "glow": "#ffcc00", "bloom_intensity": 1.0},
}


def enrich_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Add columns if they don't exist
    for col, typedef in [
        ("visual_elements", "TEXT"),
        ("animation_hints", "TEXT"),
        ("stage_palette", "TEXT"),
    ]:
        try:
            c.execute(f"ALTER TABLE emblems ADD COLUMN {col} {typedef}")
            print(f"  Added column: {col}")
        except sqlite3.OperationalError:
            pass  # Column already exists

    print(f"\nEnriching {len(STAGE_MAP)} emblems...")
    updated = 0

    for num, stage in STAGE_MAP.items():
        visual_elements = json.dumps(VISUAL_ELEMENTS.get(num, []))
        animation_hints = json.dumps(ANIMATION_HINTS.get(num, {}))
        palette = json.dumps(STAGE_PALETTES.get(stage, {}))

        c.execute("""
            UPDATE emblems
            SET alchemical_stage = ?,
                visual_elements  = ?,
                animation_hints  = ?,
                stage_palette    = ?
            WHERE number = ?
        """, (stage, visual_elements, animation_hints, palette, num))

        if c.rowcount:
            updated += 1
            print(f"  [{num:02d}] {stage:12s} — {VISUAL_ELEMENTS.get(num, [])[0] if VISUAL_ELEMENTS.get(num) else '?'}")

    conn.commit()
    conn.close()

    print(f"\nDone. {updated} emblems enriched.")
    print("\nStage distribution:")
    for stage in ["NIGREDO", "ALBEDO", "CITRINITAS", "RUBEDO"]:
        count = sum(1 for v in STAGE_MAP.values() if v == stage)
        print(f"  {stage:12s}: {count} emblems")


if __name__ == "__main__":
    enrich_db()
