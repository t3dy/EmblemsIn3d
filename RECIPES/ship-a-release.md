# Ship a release

## When to use this

Any time work should reach `emblems-in-3d.vercel.app`. Read
[`../DEPLOY_STATE.md`](../DEPLOY_STATE.md) first — it is the authority on the two hosts and
the cache behaviour; this file is the running order.

## Before you start

- [bump-cache-versions.md](bump-cache-versions.md) — the `?v=` chain, and `const V`
- [verify-live.md](verify-live.md) — you will need it twice: locally, then live

## Steps

1. **Check the diff for lane violations.** The Atalanta side is worked in another session.
   ```bash
   git status --short
   ```
   If `src/data/af_lore.js`, `src/data/af_vignettes.js`, `src/scenes/AFWorldScene.js`,
   `lab/` or `images/cutouts/emblem-*` appear and your task was not Atalanta, un-stage them:
   ```bash
   git rm --cached <path>
   ```
   **Never `git add -A src/`.** Stage explicit paths. This has swept an Atalanta file into
   an HP commit twice.
2. **Verify locally.** Load `http://localhost:3457/src/index.html`, exercise the change,
   read the console.
3. **Update the standing docs**, in the same commit:
   - `DECISIONS.md` — any directional call made this session
   - `NEXTSTEPS.md` — what is left
   - `CREDITS.md` — if anything was imported
   - the relevant subject brief, if the sourcing changed
4. **Commit** with an explicit path list.
5. **Deploy to both hosts:**
   ```bash
   vercel --prod --yes && git push origin main
   ```
6. **Verify live, on both:**
   ```bash
   curl -s https://emblems-in-3d.vercel.app/src/index.html | grep -o 'main.js?v=[0-9]*'
   curl -s https://t3dy.github.io/EmblemsIn3d/src/index.html | grep -o 'main.js?v=[0-9]*'
   ```
   Then open the canonical URL in the browser and do the thing the change was for.

## Cutting a numbered version

Past releases are kept as directories at the repo root and linked from the landing page —
`/v1/`, `/v2/`. To add one:

1. copy the current `src/`, `images/`, `research/` into `vN/` (a frozen snapshot; it will
   not be maintained)
2. add the link to the landing page's version list in `src/index.html`
3. note the release, its date and what it contains, in `README.md` and `DECISIONS.md`

## You are done when

- [ ] no Atalanta path in the commit unless the task was Atalanta
- [ ] the `?v=` chain and `const V` are bumped
- [ ] **both** hosts return the new version number
- [ ] you have opened the live canonical URL and confirmed the specific requested change
- [ ] `DECISIONS.md` / `NEXTSTEPS.md` reflect this session

## What has gone wrong here before

- **One host deployed, "shipped" claimed.** See `DEPLOY_STATE.md`.
- **`git add -A src/`** swept `src/data/af_lore.js` into an HP commit. Twice.
- **A fixed CSS bug reappearing after deploy**, because `src/index.html` is not
  cache-busted and GitHub Pages ignores the `Cache-Control` header in `vercel.json`. If your
  fix is CSS-only, make the JS enforce it too.
