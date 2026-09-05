# Deploy state — Emblems in 3D

*Read this before touching deploy config. This project publishes to **two** hosts from the
same `main` branch, so "I deployed it" is ambiguous unless you say which.*

## The two hosts

| | Vercel | GitHub Pages |
|---|---|---|
| URL | **https://emblems-in-3d.vercel.app** (canonical) | https://t3dy.github.io/EmblemsIn3d/ |
| App entry | `/src/index.html` | `/src/index.html` |
| Publish by | `vercel --prod --yes` | `git push origin main` |
| Source | the working tree at deploy time | branch `main`, path `/` |
| Config | `vercel.json` | repo Pages settings (no workflow file) |

**Both must be updated.** `vercel --prod` does *not* push to GitHub, and `git push` does
*not* deploy to Vercel. Ted opens whichever link he has to hand — in one session he was
looking at GitHub Pages while only Vercel had been redeployed. Do both, every time:

```bash
vercel --prod --yes && git push origin main
```

Check what a host is actually serving (the version marker is the app's cache-bust number):

```bash
curl -s https://emblems-in-3d.vercel.app/src/index.html | grep -o 'main.js?v=[0-9]*'
```

GitHub Pages build status: `gh api repos/t3dy/EmblemsIn3d/pages/builds`. Pages typically
lags a push by 30–90 s.

## The cache trap (this has bitten twice — understand it before "it's fixed" claims)

There is **no build step**. Cache-busting is the manual `?v=N` chain described in
`CLAUDE.md`, and it covers **only `main.js` and the ES modules**. It does **not** cover:

- `src/index.html` itself — and **all of the app's CSS is inline in that file**;
- the data JSON (versioned separately by `const V` in `main.js` `loadData()`).

So a returning visitor can receive **new JS with old CSS**. That is exactly how a fixed
full-screen-overlay bug (`#tour-flavor-chooser`, whose `display: flex` outranked the
`hidden` attribute) kept reappearing after it had been fixed and deployed.

Two mitigations are in place — **keep both**:

1. `vercel.json` sets `Cache-Control: max-age=0, must-revalidate` on `*.html` and
   `/src/data/*`, so HTML always revalidates. **GitHub Pages ignores this** — it serves
   HTML with a fixed `max-age=600` and offers no way to change it.
2. Because of that, `main.js` does not rely on the stylesheet: `setHidden()` writes the
   inline `style.display` alongside the `hidden` attribute, and a startup guard hides
   anything that ships with `hidden`. A stale cached stylesheet therefore cannot put an
   overlay back over the app.

**Rule:** never fix a UI bug only in the inline CSS of `src/index.html`. If a stale
stylesheet would reintroduce it, enforce it from `main.js` too — that file is cache-busted
and reaches users immediately.

## Verifying a deploy

Do not claim "deployed" from the diff or from the Vercel success line. Fetch the live
artifact on **both** hosts and confirm the specific change is present. For behaviour that
isn't visible in the source, drive the live page in the browser — e.g. audio was verified
by proxying `AudioContext`, `AudioScheduledSourceNode.start` and `HTMLMediaElement.play`
on production and confirming zero calls (the site is silent by design; see `DECISIONS.md`).

## Gotchas

- `.vercel/project.json` pins the project (`emblems-in-3d`, org `tedhand-2181s-projects`).
  Don't re-link; it will make a second project and a second URL.
- `vercel.json` is schema-validated and **rejects unknown keys** — including `comment`.
  Comments live here, not in that file.
- `v1/` is the archived Version 1 of the site, served at `/v1/`. Leave it alone.
- The Atalanta Fugiens side of the project is often being worked in a separate session.
  Check with Ted before touching `src/data/af_*`, `AFWorldScene.js`, `lab/` or
  `images/cutouts/`.
