# Beast Mode PRD

## Problem
- Repository lint pipeline fails with widespread rule violations, blocking green status.

## Users & JTBD
- Engineers need assurance that the main branch remains healthy before further work.

## Goals / Success
- `npm run lint` exits zero with no warnings.
- `npm test` exits zero with all suites passing.
- `npm run build` completes without warnings.
- No lint disables added unless justified in acceptance notes.

## Scope
- **In**: Refactors and code/test adjustments required to remediate lint failures and keep runtime behavior stable; deleting dead code that causes violations; modernizing modules when needed (no legacy compatibility required).
- **Out**: Feature additions unrelated to lint/test/build health.

## Requirements
- Functional: Preserve existing gameplay behavior while refactoring for lint compliance; update tests to reflect any API changes.
- Non-Functional: Maintain deterministic tests, zero-tooling warnings, and avoid reintroducing deprecated patterns.

## Acceptance Criteria
- AC1: Lint passes cleanly (no warnings/errors).
- AC2: Tests pass cleanly.
- AC3: Build emits no warnings.
- AC4: Document significant refactor decisions in knowledge log.
