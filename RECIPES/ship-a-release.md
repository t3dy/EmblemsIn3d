# Ship a release

## When to use this

Any time work should reach **https://t3dy.github.io/EmblemsIn3d/**. Read
[`../DEPLOY_STATE.md`](../DEPLOY_STATE.md) first — it is the authority on the host and the
cache behaviour; this file is the running order.

**Vercel is retired (2026-09-07).** Do not run it. `emblems-in-3d.vercel.app` is a stale
mirror and is not evidence of anything.

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
4b. **Parse-check every changed module before deploying** (added 2026-09-07, after a
   trailing `//` comment ate a comma and served a blank world at v=153 for several minutes):
   ```bash
   node -e "const fs=require('fs');for(const f of ['src/scenes/HPWorldScene.js','src/main.js','src/systems/Cast.js']){const s=fs.readFileSync(f,'utf8');try{new Function(s.replace(/^import[^
]*
/mg,'').replace(/^export /mg,''));console.log('ok',f)}catch(e){console.log('PARSE FAIL',f,e.message);process.exitCode=1}}"
   ```
   The `?v=` curl in step 6 passes on a broken module; only a parse, or `window.hpExplore`
   existing on the live page, catches it.
5. **Deploy:**
   ```bash
   git push origin main
   ```
6. **Verify live** (Pages lags a push by 30–90 s):
   ```bash
   curl -s "https://t3dy.github.io/EmblemsIn3d/src/index.html?x=$RANDOM" | grep -o 'main.js?v=[0-9]*'
   ```
   Then open https://t3dy.github.io/EmblemsIn3d/ in the browser and do the thing the change
   was for. The version number proves the file shipped; it does not prove the feature works.

## Cutting a numbered version

**Since 2026-09-06 there are no `/vN/` snapshot directories on `main`** — they were removed
with the Atalanta archive (DECISIONS 2026-09-06), and `/v1/` and `/v2/` no longer resolve
on Pages. A numbered version is now:

1. the `ver-badge` and its note in the landing page's version bar (`index.html`, not `src/`)
2. a row in the Versions table of `README.md` — the new one `current`, the old one
   `superseded` with its tag
3. a `## Release Version N` entry in `DECISIONS.md` saying what it contains
4. an annotated git tag, pushed: `git tag -a vN -m "Version N" && git push origin vN`

Done that way for v4 on 2026-09-08.

## You are done when

- [ ] no Atalanta path in the commit unless the task was Atalanta
- [ ] the `?v=` chain and `const V` are bumped
- [ ] Pages returns the new version number
- [ ] you have opened https://t3dy.github.io/EmblemsIn3d/ and confirmed the specific
      requested change
- [ ] `DECISIONS.md` / `NEXTSTEPS.md` reflect this session

## What has gone wrong here before

- **One host deployed, "shipped" claimed.** The reason there is now only one. See
  `DEPLOY_STATE.md`.
- **`git add -A src/`** swept `src/data/af_lore.js` into an HP commit. Twice.
- **A fixed CSS bug reappearing after deploy**, because `src/index.html` is not
  cache-busted and GitHub Pages serves HTML with a fixed `max-age=600`. If your fix is
  CSS-only, make the JS enforce it too.
