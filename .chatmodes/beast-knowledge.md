# Knowledge Log

## Assumptions
- A1 (medium confidence): User wants a comprehensive implementation roadmap without modifying source code yet.
- A2 (high confidence): Priorities P0–P3 correspond to the table in `docs/codereview.md`, each needing detailed implementation sequencing.
- A3 (high confidence): Task requires transforming existing roadmap into a checkbox-based tracker without altering underlying priorities.
- A4 (medium confidence): Tasks should be executed in listed order unless dependencies dictate otherwise.

## Decisions
- D1: Proceed with planning documentation-only updates since task focuses on outlining steps.
- D2: Document roadmap in `docs/implementation-roadmap.md` to maintain a durable reference for execution.
- D3: Modify the existing roadmap file instead of creating a new document to keep single source of truth.
- D4: Use Sequential Thinking MCP for non-trivial tasks to plan implementation steps before coding.
- D5: Introduced `AppConfig` context/provider to centralize feature flags and prize provider hooks, enabling future overrides.

## Context Notes
- User supplied latest `docs/codereview.md` capturing current findings and updated recommendations.
- Request explicitly requires using Sequential Thinking MCP to structure the plan.
- Roadmap enumerating actionable steps for P0–P3 now lives in `docs/implementation-roadmap.md`.
- Roadmap converted into checkbox-based task list to support progress tracking.
- Config audit captured in `docs/audits/config-framework-audit.md` to inform upcoming framework work.
- AppConfig infrastructure lives in `src/config/appConfig.ts`, context provider in `src/config/AppConfigContext.tsx`, and is wired via `src/main.tsx`.
- README now documents how to override `AppConfig` for host applications.
- Deterministic fixtures created under `src/tests/fixtures/` (seeds, prize sets, trajectories) for the new test harness.
- Vitest lifecycle now resets mocks via `src/tests/setupTests.ts` leveraging `resetHarnessState()` from `src/tests/fixtures/harness.ts`.
- CI commands route through deterministic runners (`scripts/run-vitest.mjs`, `scripts/run-playwright.mjs`) ensuring fixture-driven env vars propagate during automated tests.

## Sources
- S1: `docs/codereview.md` (provided attachment).
