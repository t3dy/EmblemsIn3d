---
description: Read one chapter of the Hypnerotomachia end to end and enumerate its features into the ledger
argument-hint: <roman numeral, e.g. V or XXII>
---

Research chapter **$ARGUMENTS** of the Hypnerotomachia and write its features into
`research/coverage.json`.

Follow `RECIPES/research-a-chapter.md` exactly, and **do not build anything during the pass**.

Read the whole chapter in the right edition — Dallington 1592 for I–XVI, our own translation
for XVII–XXXVIII, never Godwin. Look at its plates in `hp.db.woodcut_catalog` and open the
scans. Enumerate every place, building, rite, object, creature, inscription, plant, machine,
person and picture it describes, each with a page citation. Check each against the built world
and set its status honestly: `built` only if you have seen it running, otherwise `unknown`.

Finish by re-running the seeder and the report, and tell me the most interesting thing the
chapter has that the world does not.
