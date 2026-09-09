<!-- tokens: ~1,575 · read for: the host, the version chain, and the deploy gotchas -->
# Deploy state — Emblems in 3D

*Read this before touching deploy config.*

## One host: GitHub Pages

| | |
|---|---|
| **Canonical URL** | **https://t3dy.github.io/EmblemsIn3d/** |
| App entry | `/src/index.html` |
| Publish by | `git push origin main` |
| Source | branch `main`, path `/` |
| Config | repo Pages settings — no workflow file, no build step |
| Lag | 30–90 s after a push (`gh api repos/t3dy/EmblemsIn3d/pages/builds`) |

```bash
git push origin main
```

That is the whole deploy. There is no build step: Pages serves the repository as it stands,
and every path in the app is relative, so the `/EmblemsIn3d/` subpath needs no configuration.

Check what is actually being served — the version marker is the app's cache-bust number:

```bash
curl -s "https://t3dy.github.io/EmblemsIn3d/src/index.html?x=$RANDOM" | grep -o 'main.js?v=[0-9]*'
```

## Vercel is retired (2026-09-07)

Ted: *"Stop hosting on vercel for now."* This also brings the project into line with the
workspace hosting policy in `C:\Dev\CLAUDE.md`, which makes Pages the default and reserves
Vercel for projects that genuinely need a server. This one does not: it is a static site with
no serverless route and no Blob storage.

- **Do not run `vercel`, `vercel --prod`, or any deploy to it.** Not to "keep the hosts in
  sync", not as a convenience.
- **https://emblems-in-3d.vercel.app is a stale mirror.** It is frozen at the last deploy
  before the switch (`main.js?v=247`) and will drift further with every push. If Ted opens
  that link he is looking at an old site. **Do not cite it as evidence of anything**, and do
  not use it when verifying — verification means the Pages URL above.
- `vercel.json` and `.vercel/` stay in the repo, dormant, so the switch can be reversed
  cheaply. `vercel.json`'s only real work was `Cache-Control: max-age=0, must-revalidate` on
  `*.html` — **Pages ignored that header anyway**, so nothing is lost by its going quiet.

**Open question for Ted:** the stale alias is exactly the trap this file has warned about
twice (one host deployed, the other opened). It can be closed either by deleting the Vercel
project, or by one last deploy that makes the Vercel URL redirect to Pages. Both are his call.

## The cache trap (this has bitten twice — understand it before "it's fixed" claims)

There is **no build step**. Cache-busting is the manual `?v=N` chain described in `CLAUDE.md`,
and it covers **only `main.js` and the ES modules**. It does **not** cover:

- `src/index.html` itself — and **all of the app's CSS is inline in that file**;
- the data JSON (versioned separately by `const V` in `main.js` `loadData()`).

Pages serves HTML with a fixed `max-age=600` and offers no way to change it, so a returning
visitor can receive **new JS with old CSS**. That is exactly how a fixed full-screen-overlay
bug (`#tour-flavor-chooser`, whose `display: flex` outranked the `hidden` attribute) kept
reappearing after it had been fixed and deployed.

The mitigation is in `main.js`, and it must stay: `setHidden()` writes the inline
`style.display` alongside the `hidden` attribute, and a startup guard hides anything that
ships with `hidden`. A stale cached stylesheet therefore cannot put an overlay back over the
app.

**Rule:** never fix a UI bug only in the inline CSS of `src/index.html`. If a stale stylesheet
would reintroduce it, enforce it from `main.js` too — that file is cache-busted and reaches
users immediately.

## Verifying a deploy

Do not claim "deployed" from the diff or from the push line. Fetch the live artifact and
confirm the specific change is present.

A matching `?v=` proves the file is **served**, not that it **parses** — a trailing `//`
comment once swallowed a comma and served a blank world at a perfectly correct version
number. Parse-check before deploying, and open the live page.

For behaviour that is not visible in the source, drive the live page in the browser — e.g.
audio was verified by proxying `AudioContext`, `AudioScheduledSourceNode.start` and
`HTMLMediaElement.play` on production and confirming zero calls (the site is silent by
design; see `DECISIONS.md`).

## Gotchas

- **`src/index.html` is the one file no `?v=` covers, and a browser will hold a stale copy of
  it long after the deploy has landed.** Hit on 2026-09-09: `curl` with a cache-buster
  reported `main.js?v=330` from the origin while the browser tab, reloaded twice, was still
  running `v=328` — and so a feature that *was* deployed looked like it had not been. The
  module chain cannot save you here, because the version numbers that drive it are written
  *inside* the file that is stale.

  **So verifying live means two checks, not one:**

  ```bash
  curl -s "https://t3dy.github.io/EmblemsIn3d/src/?cb=$RANDOM" | grep -o 'main\.js?v=[0-9]*'
  ```

  proves the *origin* is updated, and then in the page itself:

  ```js
  [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))
  ```

  proves the *browser* is running it. If the two disagree, reload with a query string —
  `…/src/index.html?cb=1` — which is a different URL and cannot be served from cache. The
  same applies to every CSS change, since all the CSS is inline in that file.
- `v1/` and `v2/` are archived snapshots of past releases, served at `/v1/` and `/v2/`.
  Leave them alone.
- Never `git add -A src/` — stage explicit paths.

## History

- **2026-09-07 — Vercel retired**, Pages became the only host. See above.
- **2026-09-06 — the Vercel project vanished and was recreated.** Between two deploys fifteen
  minutes apart, `vercel` reported *"Your Project was either deleted, transferred to a new
  Team, or you don't have access to it anymore"*, and the site 404'd. Nothing in this repo
  removed it. It was recreated under `tedhand-2181s-projects` with the same name; the old
  link is kept at `.vercel/project.json.lost-2026-09-06`. Project-level dashboard settings
  did not carry over. GitHub Pages was unaffected throughout and carried the site — which is
  part of why it is now the only host.
