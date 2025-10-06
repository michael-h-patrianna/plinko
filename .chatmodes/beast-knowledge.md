# Knowledge Log

## Assumptions
- A1 (high confidence): Cross-cutting prep remains complete; current sprint targets closing P0.1 gaps before tackling P0.2/P0.3.
- A2 (high confidence): Manual edits introducing sync provider bootstrapping are authoritative and should be preserved while hardening behaviour/tests.
- A3 (medium confidence): Production launch requires documentation updates before P0.1 may be marked done.
- A4 (medium confidence): Provider load failures should surface to UI via `prizeLoadError`; existing hook plumbing suffices if tests are added.

## Decisions
- D1: Retain Zod-driven validation and expand tests to assert both success and error branches for provider loaders.
- D2: Leave `usePlinkoGame` trajectory shuffling in place temporarily; revisit once deterministic trajectory work (P0.2) begins.
- D3: Update roadmap/documentation within this cycle to reflect finished provider work rather than deferring to later phases.
- D4: Capture provider usage contract in README/architecture docs as part of acceptance criteria sign-off.
- D5: React act warnings in hook tests are noise but tolerated for now; address when adjusting test harness (tracked under future P2.3).
- D6: Remaining P0.1 scope is limited to normalising `createValidatedProductionPrizeSet` counts, scheduled for the next iteration.

- Provider implementation lives in `src/game/prizeProvider.ts` with `load` and `loadSync`; hook consumes sessions and reshuffles prizes to match trajectory.
- `createDefaultPrizeProvider` now normalises thrown errors to rejected promises; tests exercise both success and failure paths.
- `productionPrizeTable` still exposes optional count parameter—remaining roadmap item is to remove randomised counts at the source.
- Hook maintains `prizeLoadError` but lacks assertions; we added provider-level tests and will extend hook coverage later if needed.
- Documentation and roadmap updated this cycle to describe the provider contract and mark completed tasks.
- Deterministic harness command `node ./scripts/run-vitest.mjs run ...` remains the preferred execution path for suites.

## Sources
- S1: `docs/implementation-roadmap.md` (current focus).
- S2: `src/game/prizeProvider.ts`, `src/hooks/usePlinkoGame.ts` (manual edits reviewed this cycle).
