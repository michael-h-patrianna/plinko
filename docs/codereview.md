# Plinko Mini-Game Code Review — 2025-10-06

## Summary
- The current implementation intentionally mocks production by randomly generating both the prize table and winner each run. That behaviour is valuable for demos, but there is no seam to inject the server-authoritative table/winning index, so the build still cannot satisfy the PRD requirement when lifted into production. We should preserve the mock as a default while adding configurable data sources that keep physics aligned with predetermined outcomes.
- Web-first assumptions (DOM APIs, CSS filters/gradients, Web Workers) are woven throughout the rendering, state, and theming layers, making the codebase difficult to port to React Native without major refactoring.
- Core physics and board layout logic are duplicated across files with diverging constants, which increases maintenance risk and makes behaviour harder to reason about.
- Heavy synchronous work (trajectory search) still runs on the main thread despite having a worker abstraction, creating UI jank and violating the performance envelope documented in the PRD.
- Development tooling and debug affordances are mounted in production code paths and rely on browser-only features, further complicating reuse.

### Production Simulation Context
- The current game flow intentionally mocks production by fabricating both the prize table and winning index on the client. While useful for demos, the next iteration should introduce an injectable prize provider that defaults to the existing mock but can consume backend payloads when present.

## Business Logic & Prize Flow
| Issue | Impact | References |
| --- | --- | --- |
| Client generates a fresh prize set via `createValidatedProductionPrizeSet()` on every `usePlinkoGame` reset. No API exists to inject the backend-authored prize table while preserving the mock fallback.| Lacks a seam to consume real prize data, so production adoption is blocked even though the mock must remain available for demos.| `src/hooks/usePlinkoGame.ts`, `src/config/productionPrizeTable.ts` |
| Purchase prizes include both a `purchaseOffer` and a `freeReward`, ignoring the rule that purchase offers “can only contain one offer.” | Creates ambiguity for redemption and downstream accounting. | `special_offer` in `src/config/productionPrizeTable.ts` |
| `selectPrize()` re-rolls outcome using client RNG (Mulberry32 seeded by `crypto.getRandomValues`) rather than consuming the predetermined winning index provided by backend.| Undermines guarantee of server-authoritative result; also breaks on RN where `crypto.getRandomValues` is absent.| `src/game/rng.ts`, `src/hooks/usePlinkoGame.ts` |
| Physics search is unaware of required winning index. Instead, the code swaps prizes into the slot the physics happened to hit. | Layout shown to player no longer matches backend table; this makes “copy & paste into production” impossible. | `src/hooks/usePlinkoGame.ts`, `src/game/trajectory.ts` |
| Prize validation only checks probability sums and length; no guard rails for type-specific rules (no-win has no rewards, purchase contains exactly one offer payload). | Allows invalid prize payloads to slip into production. | `src/utils/prizeUtils.ts` |
| Mock production generator picks a random prize count between 3 and 8 while both the board renderer and physics engine assume a six-column layout. | When the mock returns more than six prizes the visual slot widths and physics collision grid drift apart, breaking alignment and making QA inconsistent. | `src/config/productionPrizeTable.ts`, `src/components/PlinkoBoard/PlinkoBoard.tsx`, `src/game/trajectory.ts` |

## Architecture & Separation
- `usePlinkoGame` owns prize sourcing, physics search, seed management, state transitions, and view-model creation in one hook. Breaking these responsibilities apart would improve testability and unlock reuse in native clients.
- Development-only tooling (`DevToolsMenu`, viewport spoofing, choice mechanic sandbox) mounts unconditionally inside `AppContent`, wiring document listeners and pointer-event overrides that bleed into production. Gate the UI behind build flags or lazy imports so the bundle can tree-shake it away.
- Worker abstraction (`useTrajectoryWorker`) and its companion worker file are dead code. Given the synchronous path already meets performance targets, drop the unused hook/worker pair to reduce bundle size and mental overhead.
- Prize configuration files (`prizeTable.ts` and `productionPrizeTable.ts`) duplicate pool data and logic. Consolidate into a single source-of-truth module that can accept backend payloads.
- `PrizeClaimed` receives the awarded `prize` but never renders any part of it, so the confirmation screen cannot show “You claimed X” without forking the component.

## Portability to React Native
| Pattern | Why it blocks RN parity | Files |
| --- | --- | --- |
| Direct DOM APIs (`window`, `document`, `navigator`, `localStorage`) | Not available in RN; require platform checks or abstraction. | `src/App.tsx`, `src/dev-tools/components/DevToolsMenu.tsx`, `src/theme/ThemeContext.tsx`, `src/utils/deviceDetection.ts` |
| CSS-only visuals (box-shadows, filters, gradients, pseudo-elements, keyframe animation files) | Need Moti/Reanimated equivalents; cannot be reused as-is. | `src/components/Ball.tsx`, `src/components/effects/ScreenShake.css`, `src/styles/globals.css`, `src/components/PlinkoBoard/Slot.tsx` |
| Web Worker usage (`new Worker(...)`) | Workers are unsupported on RN; requires alternate threading model. | `src/hooks/useTrajectoryWorker.ts`, `src/workers/trajectory.worker.ts` |
| Framer Motion-specific components | Must wrap behind animation adapters so RN can swap in Moti/Reanimated counterparts. | Most components under `src/components/` |
| Asset handling uses static imports (`slotIcon` PNGs) | RN needs `ImageSource` objects or network URIs; asset pipeline must be abstracted. | `src/config/productionPrizeTable.ts`, `src/components/PlinkoBoard/Slot.tsx` |

## Performance & Reliability
- Trajectory generation still runs synchronously for every initialization and drop-zone selection. In practice it succeeds on the first attempt in virtually every run (stuck balls happen roughly once in 10,000 drops), so the main-thread work is a non-issue. Removing the old worker hook eliminates the lingering abstraction without impacting performance.
- Global CSS applies `transition-timing-function` to every element via the universal selector. This creates unnecessary style work each frame and will not translate to RN.
- Extensive `console.log`/`console.warn` noise in worker and hooks should be replaced with structured debug channels.
- No watchdog ensures trajectory search respects the predetermined slot; this increases the probability of retries or mismatch if prize layout is locked.
- `CurrencyCounter` chains multiple `setTimeout` calls for every increment but only clears the initial delay, so navigating away mid-animation leaves timers firing against an unmounted component.
- `Slot`’s impact flashes use `Date.now()` as part of React keys on every render, forcing React to recreate the subtree each frame and neutralising Framer Motion exit animations.

## Code Quality & Maintainability
- Peg layout math is duplicated with different constants in `src/game/trajectory.ts` (`OPTIMAL_PEG_COLUMNS = 6`, padding 10) and `src/components/PlinkoBoard/PlinkoBoard.tsx` (`PEG_RADIUS` responsive logic, `extraClearance` 8/10). Divergence causes visual/physics mismatch. Extract a shared geometry util driven by board config.
- Drop zone definitions are hard-coded in both board UI (percentages) and trajectory generator (min/max ranges). Keep a single definition that both consumers read.
- Inline style objects with magic numbers (“AAA quality”, glow stacks) make it difficult to audit or theme; prefer tokenized style modules compatible with RN StyleSheet.
- Comments focus on flair instead of intent, making it harder for new engineers to understand real invariants.
- Tests rely on random generation utilities; once prize flow becomes deterministic, they will need restructuring to consume injected fixtures.
- Several modules are no longer referenced anywhere in the game flow—`ImpactParticles`, `DropPositionChamber`, `useDropPositionSelector`, and `WinAnimations/CelebrationOverlay`—yet their code, styles, and assets still ship in the bundle.
- Dev-only UI (`DevToolsMenu`, viewport spoofing, alternate drop-zone mechanic) mounts on every page load with pointer-event hacks; wrap it behind an environment flag to keep production lean.
- `App.tsx` reimplements mobile detection inline with user-agent parsing and writes to state during render, rather than reusing `utils/deviceDetection`; this will explode under SSR and duplicates logic.
- `StartScreen` hard-codes purchase offers to “200% Special Offer” instead of reading the offer payload from the prize config, so marketing copy can’t be controlled by backend data.

## Development & Testing Utilities
- Theme persistence via `localStorage` breaks SSR and RN. Provide an abstraction that can swap storage backends.
- Worker telemetry logs (`console.log` inside worker) disappear once the unused worker is removed; no further action required.

## Recommended Tasks
| Priority | Task | Outcome |
| --- | --- | --- |
| P0 | Introduce a prize provider interface that accepts host-supplied prize tables and winning indices while defaulting to the existing random generator when nothing is injected. | Preserves demo behaviour yet unlocks production parity. |
| P0 | Rework trajectory generator to accept an explicit target slot (or precomputed path) while keeping the current random-search fallback for mock runs. | Guarantees physics matches predetermined outcomes without breaking the mock mode. |
| P0 | Build environment-safe wrappers for storage, viewport, and RNG (`crypto`) so the same code path runs on React Native. | Unblocks mobile integration. |
| P1 | Consolidate peg layout & drop-zone math into shared utilities driven by board config. | Eliminates drift between visual board and physics engine. |
| P1 | Introduce animation abstraction layer (e.g., `useAnimationDriver()`) to swap Framer Motion with Moti/Reanimated. | Enables code reuse across platforms. |
| P1 | Replace CSS-dependent visual effects (glow, blur, shadows) with declarative theming tokens that have RN counterparts. | Simplifies styling portability. |
| P1 | Remove `useTrajectoryWorker` hook and `trajectory.worker.ts`, along with related wiring, since the synchronous path suffices. | Shrinks bundle and reduces maintenance surface without impacting performance. |
| P2 | Gate dev tools behind feature flag / build-time tree shaking and document how to enable in local QA. | Keeps production bundle lean. |
| P2 | Expand prize validation to enforce type-specific constraints (purchase offer contains only offer data, etc.). | Protects against misconfigured tables. |
| P2 | Refine tests so they can run against injected fixtures as well as the mock generator; add integration specs that assert predetermined slot mapping. | Ensures deterministic CI signal while safeguarding the demo fallback. |
| P2 | Remove unused modules (particle effects, drop-position hook, celebration overlay) or rewire them so they’re part of the active experience before shipping. | Reduces bundle size and eliminates zombie features. |
| P2 | Fix `CurrencyCounter` timer cleanup and replace `Date.now()` reactor keys in slot impact flashes. | Avoids runaway timers and React reconciliation churn during drops. |
| P3 | Document styling tokens, animation contracts, and physics configuration in a CONTRIBUTING guide for downstream teams. | Supports copy-paste adoption. |

## Additional Notes
- Asset imports currently assume Webpack/Vite bundling. For RN, deliver an asset manifest or allow host apps to inject icon URIs.
- Consider exposing a lightweight core package (physics + state machine) with no React dependencies so both web and mobile shells can compose the same logic.
