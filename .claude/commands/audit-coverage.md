---
description: Refresh the coverage ledger and report what the book has that the world does not
---

Refresh and read the coverage ledger, then tell me where the gaps are.

1. Run:
   ```bash
   python scripts/coverage_seed.py && python scripts/coverage_report.py
   ```
2. Read `COVERAGE.md`.
3. Report briefly: how many of the 38 chapters are enumerated; which chapters are still in the
   research queue; which features are in the build queue; and what you recommend doing next,
   with a reason.

Follow `RECIPES/audit-coverage.md`. Remember that a chapter marked `partial` is a blind spot,
not coverage: it is what chapter V looked like while the vaults under the pyramid went
unbuilt.
