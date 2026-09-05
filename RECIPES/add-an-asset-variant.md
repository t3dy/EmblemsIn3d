# Add a swappable variant of an asset

## When to use this

Whenever you build a better version of something that already exists in the world.

**The standing decision (Ted, 2026-09-05): no asset gets a single hard-coded
implementation.** Every graphical asset carries a registry of named variants the reader can
swap at runtime from the **Graphics** menu, so the work can improve without ever losing the
earlier register. Improving an asset means *adding a variant*, not replacing the old one.

## What a variant is, and is not

`AssetVariants.js` is about **fidelity** and nothing else. Keep it separate from:

- the **render style** (lit / woodcut / …) in `src/shaders/HPStyles.js` — a style may
  *prefer* a variant and says so via `styleOverride` (woodcut prefers `primitive`, because
  flat ink needs a readable silhouette, not a scan), but the reader's own choice is
  remembered;
- the **global interpretive lens** in `DESIGN.md`, which is about *meaning* — which reading
  a scene realizes.

The usual ladder is `primitive` → `massed`/`modelled` → `painted`/`card` → `scan`.

## The registry

`src/systems/AssetVariants.js`:

```js
export const ASSETS = {
  tree: {
    label: 'Trees & foliage',        // shown in the Graphics menu
    def: 'massed',                   // the DEFAULT — see the trap below
    variants: [                      // ordered worst → best fidelity
      { id: 'primitive', label: 'Primitive', note: 'A cylinder trunk and a single cone…' },
      { id: 'massed',    label: 'Massed',    note: 'Tapered leaning trunk, real boughs…' },
    ],
  },
  // …
};
```

`note` is shown to the reader, so it must say what they are choosing between — in the
project's voice, and honestly.

Current assets: `tree`, `elephant`, `figure`, `statue`, `water`, `ornament`.

## Steps

1. **Add the variant to `ASSETS[<asset>].variants`**, in fidelity order, with a real `note`.
2. **Branch on it at the build site**, using `isVariant`:
   ```js
   import { isVariant } from '../systems/AssetVariants.js?v=7';
   // …
   if (isVariant('tree', 'primitive', this.style.key)) { /* the primitive build */ return g; }
   ```
   Pass `this.style.key` so `styleOverride` can apply.
3. **Set `def` to the new variant if it is the one Ted should see by default.** Adding a
   better variant and leaving `def` on `primitive` means nobody sees your work.
4. **Bump `AssetVariants.js?v=` in *every* importer** — `main.js` and `HPWorldScene.js` at
   minimum — to the *same* number. → [bump-cache-versions.md](bump-cache-versions.md)
5. **Model it properly.** → [model-an-asset.md](model-an-asset.md); the sources still govern.
6. **Test the swap in the browser**: open Graphics, change the select, confirm
   `rebuildHPWorld()` rebuilds and the world changes without an error.

## You are done when

- [ ] the new variant appears in the Graphics menu with a readable note
- [ ] selecting it visibly changes the world, and selecting back restores the old look
- [ ] `def` is what you intend the reader to see
- [ ] it reads acceptably in woodcut mode, or `styleOverride` sends woodcut elsewhere
- [ ] one `?v=` for `AssetVariants.js` across every importer
- [ ] the choice survives a reload (it persists under `localStorage` key `hp_asset_variants`)

## What has gone wrong here before

- **The registry was silently dead.** `main.js` imported `AssetVariants.js?v=1` while
  `HPWorldScene.js` imported `?v=2`. Two module instances, two registries; the scene never
  saw the reader's choice. Same number everywhere, always.
- **Defaults left on `primitive`** for `figure`, `water` and `ornament` after all three had
  much better variants — so Ted was shown the old world and reasonably concluded the work
  had not been done.
- **Forgetting woodcut mode.** A scan-fidelity variant in flat-ink style looks like a
  smudge. Either it reads in all four styles or `styleOverride` sends woodcut to `primitive`.
