# Recipe — audit coverage

*Ask "what is in the book that is not in the world?" before starting any large build, so the
work is chosen from the gap rather than from whatever is nearest.*

```bash
python scripts/coverage_seed.py && python scripts/coverage_report.py
```

The seeder refreshes only the derived fields — page ranges, plates, tour stops, the weak
build-evidence grep. It preserves `research` and `features` verbatim, so it can never destroy
a reading. Then read [`COVERAGE.md`](../COVERAGE.md) and act on it in this order.

1. **The research queue** (§1) — chapters nobody has enumerated. Each one is a blind spot, not
   a clean bill of health. Work one with [`research-a-chapter.md`](research-a-chapter.md) or
   `/research-chapter <numeral>`.
2. **The build queue** (§2) — features the book has and the world does not. Work one with
   [`model-an-asset.md`](model-an-asset.md) or `/build-feature <id>`.
3. **Plates not attached to a chapter** (§4) — the Book I plates, waiting on a page range.
   Attaching them is part of researching those chapters.

## What the statuses mean

| | |
|---|---|
| `enumerated` | a feature list exists for that chapter |
| `partial` | tour notes exist, but nobody has listed the chapter's features |
| `unread` | nothing |

**`partial` is not coverage.** It is exactly what chapter V looked like while the vaults under
the pyramid went unbuilt: a tour stop named *The Dragon in the Vaults*, and no vaults.

## Do not

- Do not hand-edit `COVERAGE.md`. It is generated and will be overwritten.
- Do not mark a feature `built` from a grep. `build_evidence` is labelled weak on purpose — a
  plate number in a comment proves someone looked, not that a thing exists. Open the running
  page ([`verify-live.md`](verify-live.md)).
- Do not delete a `declined` feature. The reason it was declined is the useful part.
