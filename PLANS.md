# ExecPlan: Repo-wide Refactor (Expert Code Style)

## Goals
- Improve consistency in naming, defaults, and helpers across the repo.
- Reduce large, monolithic functions by extracting focused helpers.
- Clarify architecture boundaries (shared lib helpers, pipelines, web UI utils).
- Update README.md content to reflect the refined structure without a full rewrite.

## Progress
- [x] 2025-12-21 17:40  Audit current structure, identify duplication and inconsistent naming.
- [x] 2025-12-21 17:55  Introduce shared core helpers (config parsing, defaults, image sizing/formatting) and refactor backend usage.
- [x] 2025-12-21 18:10  Refactor web UI utilities/constants for Create page to reduce file size and improve structure.
- [x] 2025-12-21 18:15  Update README.md content to match new structure and terminology.
- [x] 2025-12-21 18:20  Validate build and summarize outcomes.

## Architecture Notes (Target State)
- `src/lib/` holds cross-cutting helpers (defaults, parsing, prompt building, image sizing/formatting).
- `src/core/` orchestrates business flow with minimal branching.
- `src/pipeline/` remains task-oriented, leaning on shared helpers.
- `web/src/lib/` (or `web/src/constants/`) holds UI constants and helper utilities.

## Acceptance (Observable)
- `npm.cmd run build` succeeds.
- CLI, server, and web build paths compile without TypeScript errors.
- README.md reflects the updated helper modules and architecture references.

## Retry / Rollback
- If a change breaks compilation, revert only the specific file(s) updated in that step.
- Re-run `npm.cmd run build` after each rollback to confirm recovery.

## Surprises & Discoveries
- Web build succeeded without additional installs; existing `web/node_modules` was sufficient.

## Decision Log
- 2025-12-21: Use targeted refactors (shared helpers + consistent naming) instead of a full rewrite to preserve behavior.

## Outcomes & Retrospective
- Shared backend helpers reduced duplication (config parsing, image sizing/formatting, pipeline cost type).
- Web UI now centralizes constants/types and uses a single cost estimator helper.
- Both backend and web builds succeeded after refactor.
