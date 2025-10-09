# Copilot Instructions for Plinko

=== CRITICAL INSTRUCTION BLOCK (CIB-001)===

## MANDATORY TOOLS

### For Complex Tasks (research, analysis, debugging)

```
USE: mcp__mcp_docker__sequentialthinking
WHEN: Multi-step problems, research, complex reasoning
WHY: Prevents cognitive overload, ensures systematic approach
```

### For Task Management

```
USE: todo_write
WHEN: Any task with 3+ steps
WHY: Tracks progress, maintains focus
```

=== END CIB-001===

## Architecture map

- `src/game/` owns deterministic physics, RNG, prize providers, and the state machine—keep it framework-free and pure for testability.
- `src/hooks/usePlinkoGame` is the orchestration hub; it composes prize loading, animation, state transitions, and the reset coordinator (`docs/RESET_ORCHESTRATION.md`).
- UI layers (`src/components/**`) stay presentational: they consume the hook outputs, render screens, and gate errors via the dedicated boundaries in `src/components/layout`.
- Configuration flows through `AppConfigProvider` (`src/config/appConfig.ts`); host shells override feature flags or prize providers via the provider value, so prefer dependency injection over globals.
- Cross-platform compliance is enforced via adapters in `src/utils/platform/**`—always prefer the adapter API over direct browser calls to keep React Native parity.

## Key directories & boundaries

- Physics tests and fixtures live under `src/tests/physics` and `src/tests/fixtures`; reuse the `builders` and `harness` helpers instead of rolling new seeds.
- Dev-only UI lives in `src/dev-tools` and is lazy-loaded (`DevToolsLoader`); never import these utilities from production code without a feature flag check.
- Theme tokens and layout constants reside in `src/theme/**` and `src/constants`; mirror any inline dynamic styling with the existing token exports.
- Assets, screenshots, and automation scripts have fixed homes (`screenshots/`, `scripts/playwright/`, `scripts/tools/`); keep the repo root clean per `README.md`.

## Workflow & commands

- Run the app with `npm run dev` (dev tools enabled) or `npm run build` for production; use `VITE_ENABLE_DEV_TOOLS=true npm run build` when QA needs tooling in prod bundles.
- Always execute tests through `npm test` (wrapper sets deterministic env and kills stray workers). For targeted runs, append Vitest args: `npm test -- trajectory-100.test.ts`.
- End-to-end suites run through `npm run test:e2e` (or `...:headed`); the wrapper shares the same deterministic env variables as unit tests.
- If Vitest processes wedge, call `node scripts/cleanup-vitest.mjs` before re-running to avoid the historical memory leak.
- Lint with `npm run lint`; type-check with `npm run typecheck` when touching shared types.

## Implementation patterns

- Respect the state machine events in `src/game/stateMachine.ts`; new transitions must be mirrored in `useGameState` reducers and documented in `docs/architecture.md`.
- When adding reset behavior, route everything through `useResetCoordinator`—never manually clear refs or session state out of order.
- New platform features should expose a typed adapter (`types.ts`, `index.web.ts`, `index.native.ts`, `index.ts`) and tests in `src/tests/unit/platform`; update `src/utils/platform/index.ts` exports.
- Stick to cross-platform visual constraints (no shadows, filters, or radial gradients). Use transforms/opacity and the theme gradients defined in `themes/*.ts`.
- Prize logic must leave domain computations in `src/game/prize*` modules and surface only typed results to React; UI swaps should reference `selectedPrize` from `usePlinkoGame`, not array indices.
- For dev toggles or performance controls, extend the `AppConfig` interfaces and surface switches through `AppConfigProvider`/`ThemeProvider`, keeping defaults in `createDefaultAppConfig()`.

## Testing expectations

- Follow the three-tier physics validation: unit specs in `src/tests/physics`, integration scenarios under `src/tests/integration`, and deterministic seeds from `fixtures/seedFixtures.ts`.
- Component tests rely on the shared harness in `src/tests/testUtils.tsx`; wrap providers (`AppConfigProvider`, `ThemeProvider`, `ToastProvider`) via `renderWithProviders` instead of composing manually.
- When exposing `_internal` handles from hooks for tests, gate them behind the existing `_internal` object and document the usage in the relevant test file.
- Use Playwright specs in `e2e/` for animation-heavy changes; capture evidence into `screenshots/` to keep visual baselines consistent.
- Update docs if you alter reset orchestration, platform adapters, or animation drivers—`docs/architecture.md`, `docs/platform-adapter-implementation.md`, and `docs/RESET_ORCHESTRATION.md` are the canonical references.

## Reference docs

- Architecture overview: `docs/architecture.md`
- Reset lifecycle: `docs/RESET_ORCHESTRATION.md`
- Platform adapter guides: `docs/platform-adapter-implementation.md`, `src/utils/platform/README.md`
- Dev tooling behavior: `docs/dev-tools.md`, `README.md`
