# Make a change the browser will actually see

## When to use this

**Every time you change any file under `src/`.** There is no build step; cache-busting is a
manual `?v=N` chain, and forgetting it is indistinguishable from the change not working.

## The rule

A module's `?v=` must be bumped **in every file that imports it**, and then up the chain to
`main.js?v=N` in `src/index.html`.

```
Cast.js  ·  Walker.js  ·  AssetVariants.js  ·  Particles.js  ·  HPStyles.js
        └──────────────┬───────────────────────────────────────────┘
                       ↓  imported by
        HPWorldScene.js  ·  AFWorldScene.js  ·  DreamMode.js  ·  EmblemScene.js
                       ↓  imported by
                     main.js
                       ↓  referenced by
                 src/index.html   <script src="./main.js?v=N">
```

**Data files are separate.** `src/data/*.json` is versioned by a single constant:

```js
const V = '19';   // src/main.js, in loadData() — bump when data files change
```

## Steps

1. Find every importer of the file you changed:
   ```bash
   grep -rn "Cast.js?v=" src/
   ```
2. Bump the number **in all of them to the same value**. Different values = different
   modules to the browser = separate module state.
3. Walk up the chain and bump each importer's own `?v=` too, ending at
   `main.js?v=N` in `src/index.html`.
4. If you touched `src/data/`, bump `const V` in `main.js`.
5. Confirm nothing was missed:
   ```bash
   grep -rno "[A-Za-z]*\.js?v=[0-9]*" src/ | sort -u
   ```
   Each module name should appear with exactly one version — **except `Cast.js`, which the
   Atalanta scene deliberately pins at an older version.** Leave that alone (ROUTER rule 4).
6. Reload the page and check the network panel shows the new numbers:
   ```js
   [...document.querySelectorAll('script[src*="main.js"]')].map(s => s.src)
   ```

## The trap that is not covered by any of this

`src/index.html` itself is **not** cache-busted, and **all of the app's CSS is inline in
it.** A returning visitor can receive new JS with old CSS.

Consequences, both of which are load-bearing:

- `vercel.json` sets `Cache-Control: max-age=0, must-revalidate` on `*.html` and
  `/src/data/*`. **GitHub Pages ignores this** and serves HTML with a fixed `max-age=600`.
- Therefore **never fix a layout bug in CSS alone if JS can enforce it.** `setHidden()` in
  `main.js` writes `style.display` directly rather than relying on the stylesheet's
  `[hidden]{display:none!important}`, because that rule lives in the un-bustable HTML. A
  full-screen overlay (`#tour-flavor-chooser`, whose `display:flex` outranked the `hidden`
  attribute) froze the site, was fixed, deployed, and came back — twice — for this reason.

## You are done when

- [ ] every importer of the changed module carries the same new `?v=`
- [ ] the chain reaches `main.js?v=N` in `src/index.html`
- [ ] `const V` bumped if any data file changed
- [ ] the browser is loading the new numbers (checked, not assumed)
