# Prove it landed — before saying "done"

## When to use this

Before writing the words **done**, **fixed**, **working**, **shipped** or **deployed**. Every
time. This is the project's dominant failure mode and the reason this file exists.

## The three questions

1. Did I load the **actual live artifact** — the URL, the running page, the output file —
   rather than re-reading my own diff?
2. Does it show the **specific thing that was asked for**, not merely "no errors thrown"?
3. If I am wrong, will Ted have to catch it himself and redo this?

If any answer fails, do not claim done. State what is verified and what is still
unconfirmed.

## Locally

```bash
# start the dev server through the preview tool, never through Bash
# .claude/launch.json → name "HPin3D", python -m http.server 3457
```
Then open `http://localhost:3457/src/index.html`.

```js
// 1. is the browser running the code you just wrote?
[...document.querySelectorAll('script[src*="main.js"]')].map(s => s.getAttribute('src'))

// 2. errors?  (the console buffer keeps STALE entries across reloads —
//     check the module version in the message before believing an error)
// use read_console_messages / read_network_requests

// 3. exercise the thing itself
window.hpTour('novel');            // then Check all → Begin the tour
for (let i = 0; i < 34; i++) { /* read .tp-badge, .tp-title, .tp-quote */ window.tourNext(); }
```

### Checks worth automating

```js
// text clipping — the bug that produced "riumph of Europ"
const p = document.getElementById('tour-panel');
[...p.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 2);

// no audio anywhere on the site (a standing requirement — Ted: no music, anywhere)
// proxy AudioContext / AudioScheduledSourceNode.start / HTMLMediaElement.play
// and confirm nothing is constructed. AlchemicalAudio.js is a no-op stub by design.
```

## On the live hosts

**Both.** `vercel --prod` does not push to GitHub; `git push` does not deploy to Vercel.

```bash
curl -s https://emblems-in-3d.vercel.app/src/index.html | grep -o 'main.js?v=[0-9]*'
curl -s https://t3dy.github.io/EmblemsIn3d/src/index.html | grep -o 'main.js?v=[0-9]*'
```

Both must show the number you just bumped to. GitHub Pages lags a push by 30–90 s
(`gh api repos/t3dy/EmblemsIn3d/pages/builds`).

Then **open the live URL in the browser and do the thing the user asked about.** A matching
version number proves the file shipped; it does not prove the feature works.

## Evidence to hand back

- a screenshot for anything visual
- the captured panel text for anything textual
- the `curl` version lines for a deploy
- the console/network read for "no errors"

## What has gone wrong here before

- **Claiming a fix from the diff.** The commentary-lens toggles were reported working three
  times while the deployed site still showed the old panel.
- **Trusting a stale console.** The buffer keeps errors from previous page loads. An
  `Init failed` from `main.js?v=130` said nothing about `?v=149`. Read the version in the
  message.
- **Deploying one host.** Ted opens whichever link is to hand. He was looking at GitHub
  Pages while only Vercel had been redeployed.
- **Verifying the wrong artifact.** Checking that a JSON file parses is not checking that
  the stop renders. Drive the UI.
