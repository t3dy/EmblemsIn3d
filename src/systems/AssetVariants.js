// AssetVariants.js — every graphical asset can be built more than one way.
//
// DECISION (Ted, 2026-09-05): no asset gets a single hard-coded implementation.
// Each one carries a registry of named variants that can be swapped at runtime,
// so the work can "gradually improve and evolve" without ever losing the earlier
// register. The usual ladder per asset is:
//
//   primitive  — the founding manifesto look; also what woodcut mode wants,
//                because the flat-ink style needs a readable silhouette, not a
//                photoreal scan.
//   massed     — refined procedural: real structure, layered masses, two-tone
//                foliage / modelled anatomy. Still built from code.
//   scan       — an imported CC0 model (glTF), the marble Venus being the first.
//
// This is about FIDELITY. It is deliberately independent of two other things:
//   * the render style (lit vs woodcut) — a style may *prefer* a variant, and
//     says so via `styleOverride`, but the reader's choice is remembered; and
//   * the global interpretive lens in DESIGN.md, which is about MEANING (which
//     reading a scene realizes). Don't conflate them.
//
// Modelling any variant still goes through the sources first — see the
// "Modelling the 3-D assets" table in SOURCES.md and the Renaissance exemplars
// in src/data/gallery.json.

const KEY = 'hp_asset_variants';

// The registry. `variants` are ordered worst→best-fidelity; `def` is the default.
// `note` is shown in the UI so a reader knows what they are choosing between.
export const ASSETS = {
  tree: {
    label: 'Trees & foliage',
    def: 'massed',
    variants: [
      { id: 'primitive', label: 'Primitive', note: 'A cylinder trunk and a single cone — the founding manifesto look.' },
      { id: 'massed',    label: 'Massed',    note: 'Tapered leaning trunk, real boughs, and a canopy of overlapping masses in two tones, the way Quattrocento foliage is painted.' },
    ],
  },
  elephant: {
    label: 'The elephant & obelisk',
    def: 'massed',
    variants: [
      { id: 'primitive', label: 'Primitive', note: 'A squashed sphere, four cylinders and a sphere head.' },
      { id: 'massed',    label: 'Modelled',  note: 'Anatomy from the 1499 woodcut and Bernini’s Elephant and Obelisk (1667), the direct descendant of this design — domed skull, tapering trunk, columnar legs, caparison.' },
    ],
  },
  figure: {
    label: 'Nymphs & figures',
    def: 'primitive',
    variants: [
      { id: 'primitive', label: 'Primitive', note: 'Capsule and cone bodies — the current look.' },
    ],
  },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch (_) {}
  return {};
}

let _chosen = load();

// The variant in force for an asset. `style` may steer the default (woodcut mode
// wants the primitive silhouette) but never overrides an explicit reader choice.
export function variantOf(asset, style = null) {
  const spec = ASSETS[asset];
  if (!spec) return null;
  if (_chosen[asset] && spec.variants.some(v => v.id === _chosen[asset])) return _chosen[asset];
  if (style === 'woodcut' && spec.variants.some(v => v.id === 'primitive')) return 'primitive';
  return spec.def;
}

// True when the asset should use the given variant — the common call site.
export function isVariant(asset, id, style = null) {
  return variantOf(asset, style) === id;
}

export function setVariant(asset, id) {
  const spec = ASSETS[asset];
  if (!spec || !spec.variants.some(v => v.id === id)) return false;
  _chosen[asset] = id;
  try { localStorage.setItem(KEY, JSON.stringify(_chosen)); } catch (_) {}
  return true;
}

// Forget an explicit choice and fall back to the default / style preference.
export function resetVariants() {
  _chosen = {};
  try { localStorage.removeItem(KEY); } catch (_) {}
}

// Whether the reader has explicitly chosen this asset's variant.
export function isChosen(asset) { return !!_chosen[asset]; }
