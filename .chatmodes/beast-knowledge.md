# Beast Mode Knowledge

## Assumptions
- A1 (medium): Recently modified files remain functionally correct after user’s manual tweaks; lint/test work must respect new behavior unless otherwise noted.
- A2 (medium): ESLint configuration remains unchanged; failures observed locally mirror CI expectations.
- A3 (low): No additional platform-specific constraints beyond repository docs.

## Decisions
- D1: Use repository reset to `origin/main` to recover clean state before verification.
- D2: Treat lint warnings as blockers—will refactor code/tests rather than suppressing rules unless rule intent can't be met without regressions.
- D3: Prioritize runtime module fixes before test-only cleanups to keep behavior aligned with manual edits.

## Context Notes
- Workspace now matches remote main after `git reset --hard origin/main` and `git clean -fd`.
- First lint run on clean baseline surfaced 243 problems (88 errors, 155 warnings), implying upstream debt.
- Major issue clusters: deprecated `MutableRefObject` usage, async functions lacking awaits (or mis-declared async), unsafe `any` usage in tests, redundant type parameters in animation drivers, platform storage APIs marked async without awaits.
- Cluster catalog:
	- Hooks/tests rely on `MutableRefObject` (React 19 types now flagged deprecated) – files: `useGameAnimation`, `useGameState`, `usePrizeSession`, `useResetCoordinator`, related unit tests.
- Remediation log:
	- Phase 2 Task 1: Migrated hooks/tests/components to new `ValueRef` utility, removing all `MutableRefObject` usage.
	- Async lint rules triggered by helper utilities (`ThemeContext`, `animationMigration` tests, telemetry) and storage adapters with noop async wrappers.
	- Extensive `any` leakage in animation/platform tests and runtime modules causing unsafe call/member warnings.
	- Type parameter misuse in animation drivers and redundant union constituents in `theme/animationDrivers/types.ts`.
	- Misc: prefer-const in integration tests, unbound-method in viewport manager tests, template literal type misuse in platform shared utils.
		- Manual user edits touched `StartScreen`, `ballAnimationDriver.web.ts`, state machine, and config files—must re-validate for regressions.
		- 2025-10-10 lint run: 206 problems (51 errors, 155 warnings). Hotspots: `prizeProvider` (deprecated Zod), animation driver generics, platform tests heavy `any` usage, `useViewportManager` unbound-method, `asyncHelpers` prefer-promise-reject-errors, `shared.ts` template literal types.
		- `npm test` currently terminates during `cleanup-vitest.mjs` (self-matching process name); needs fix before suites can run.
	- WIP: Re-typed animation driver interfaces to eliminate `any` leakage; adjustments pending in driver implementations/tests to fully satisfy lint.
	- WIP: `useViewportManager` test refactor in progress—requires typed mocks to silence remaining `no-unsafe-*` errors.
- Remediation order & ownership:
	1. Ref migration in `src/hooks/**` and dependent tests (owner: hooks/reset domain).
	2. Async hygiene across `theme`, `utils/telemetry`, `utils/platform/storage`, and relevant tests (owner: platform + theme runtime).
	3. Type safety fixes for animation/platform tests and runtime (owner: animation + platform squads).
	4. Sweep remaining lint nits (prefer-const, unbound-method, redundant unions) before final validation.
