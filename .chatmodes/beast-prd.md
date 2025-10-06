# Plinko P0 Production Readiness PRD

## Problem & Users
- **Problem**: The Plinko game lacks production-grade prize delivery, deterministic physics alignment, and environment-safe platform abstractions, causing inconsistent outcomes and blocking deployment across web and React Native targets.
- **Users**: Web and mobile Plinko players expecting fair, deterministic outcomes; partner teams integrating prize APIs; internal developers maintaining multi-platform builds.

## Goals & Success Metrics
- Guarantee deterministic prize outcomes selectable by the server and reproducible in tests.
- Align trajectory generation with a specified target slot while preserving existing gameplay visuals.
- Isolate platform-specific APIs behind adapters for portability and SSR safety.
- **Success Metrics**: 100% deterministic P0 test suite pass rate; ability to run in Node/SSR without crashes; documented prize provider contract adopted by integrators.

## Scope
### In Scope
- Implement prize provider abstraction with validation and deterministic selection.
- Update trajectory generator to follow injected deterministic paths.
- Introduce platform adapter layer and migrate existing usages.
- Update documentation and tests covering new behaviours.

### Out of Scope
- Non-deterministic bonus features beyond configured prizes.
- Full React Native implementation (shims only).
- P1+ roadmap items (animations, theming, etc.).

## Functional Requirements
1. `PrizeProvider` interface supports async loading, fallback fixtures, and server-selected winner index.
2. `usePlinkoGame` consumes injected provider, removes direct RNG usage, and accepts predetermined slot/path data.
3. Trajectory system can generate or accept deterministic peg paths aligning with target slot indices.
4. Platform adapter module wraps access to `window`, `document`, `localStorage`, `crypto`, timers, and RNG with SSR-safe defaults.
5. Documentation updates in `README.md`, `docs/architecture.md`, and related guides explaining new systems.

## Non-Functional Requirements
- Maintain or improve existing performance (frame rate, animation smoothness).
- Deterministic operations must run identically across Node, browsers, and test environments.
- Adapters must be tree-shakeable and typed.
- Ensure tooling/lint/typecheck/tests remain green.

## Acceptance Criteria
- Unit, integration, and e2e tests cover deterministic prize selection and trajectory alignment.
- Prize payload validation (e.g., via Zod) rejects malformed data with descriptive errors.
- `usePlinkoGame` no longer calls random APIs directly; relies on provider + deterministic inputs.
- Platform adapter usage replaces direct global references project-wide.
- Updated docs reviewed against implementation; roadmap checklist P0 items marked complete.
- Typecheck, lint, Vitest, and Playwright suites pass on deterministic harness.
- `createDefaultPrizeProvider` exposes both sync and async loading paths with tests covering success/error scenarios.
