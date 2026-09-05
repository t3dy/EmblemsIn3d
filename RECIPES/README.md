# RECIPES — procedures for the tasks this project actually repeats

Each file is a **procedure**, not a discussion: numbered steps, the exact files and queries,
and a short "you are done when" list you can check against.

Entry point for everything is [`../ROUTER.md`](../ROUTER.md); the task table there says
which recipe applies.

| Recipe | For |
|---|---|
| [add-a-tour-stop.md](add-a-tour-stop.md) | writing or editing a stop and its commentary notes |
| [model-an-asset.md](model-an-asset.md) | building or improving anything in the 3-D world |
| [add-an-asset-variant.md](add-an-asset-variant.md) | adding a swappable fidelity variant |
| [import-an-exemplar.md](import-an-exemplar.md) | bringing in a scan, glTF model or painting cut-out |
| [bump-cache-versions.md](bump-cache-versions.md) | making a change the browser will actually see |
| [ship-a-release.md](ship-a-release.md) | deploying to both hosts |
| [verify-live.md](verify-live.md) | proving a change landed, before saying "done" |
| [query-the-corpus.md](query-the-corpus.md) | finding what the book and the scholarship say |

## Writing a new recipe

Add one when a task has been done twice and got it wrong once. Keep the shape:

```
# <task>
## When to use this
## Before you start   (what to read, what to check)
## Steps              (numbered, with real commands and real paths)
## You are done when  (a checkable list, live verification included)
## What has gone wrong here before
```

That last section is the point of the file. Record the failure, not just the happy path.
