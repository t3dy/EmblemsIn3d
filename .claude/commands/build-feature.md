---
description: Build one feature from the coverage ledger into the world, verify it live, and deploy
argument-hint: <feature id from research/coverage.json, e.g. proserpina-relief>
---

Build the feature **$ARGUMENTS** from `research/coverage.json` into the world.

Find it in the ledger, re-read the passage it cites — the citation is a pointer, not a
substitute — and check `DECISIONS.md` for a call already made about it.

Then follow `RECIPES/model-an-asset.md` and `RECIPES/ship-a-release.md`: build it with the
passage cited in the code comment, bump the cache chain, parse-check, verify on the running
page, deploy to both hosts, then set the feature's `status` and `built_as` in the ledger,
re-render `COVERAGE.md`, and commit the ledger with the code.

Stage explicit paths — never `git add -A src/`.
