# Plinko Prototype Code Review

## High-Priority Findings
- **Trajectory generation runs synchronously on the main thread.** In the common case the simulation finds a viable path on the first pass, so the impact is small. The concern is the worst case: up to 50,000 attempts × 800 frames with peg collision checks (`src/game/trajectory.ts:500-570`). Because this runs during mount (`src/hooks/usePlinkoGame.ts:75-117`), a bad seed or a heavier physics configuration could still block rendering on lower-end devices. The queued worker hook (`src/hooks/useTrajectoryWorker.ts:22-143`) could be wired in if we ever observe hitching; otherwise documenting measured frame times would justify keeping it on the main thread.

## Platform Portability Gaps
- **Direct DOM and browser API usage.** Components and utilities rely on `window`, `document`, `navigator`, `localStorage`, and URL search params (`src/App.tsx:54-120`, `src/theme/ThemeContext.tsx:32-50`, `src/utils/deviceDetection.ts:9-34`, `src/dev-tools/components/DevToolsMenu.tsx:56-68`). None of these are available in React Native without shims.
- **Web-only styling primitives.** The UI leans on Tailwind classes, CSS gradients/box-shadows/filters, keyframe animations, and pseudo-elements (`src/components/effects/ScreenShake.css:1-41`, `src/styles/globals.css:28-199`, `src/components/Ball.tsx:134-234`, `src/components/PlinkoBoard/Slot.tsx:121-198`). Porting would require a full visual rewrite in `moti`/`react-native-linear-gradient`/`reanimated`.
- **Workers and CSS animation toggles have no RN equivalent.** `useTrajectoryWorker` assumes `Worker` support (`src/hooks/useTrajectoryWorker.ts:22-57`), and shake/shine effects depend entirely on CSS animation names (`src/components/effects/ScreenShake.tsx:31-54`).

## Performance & Efficiency
- **Expensive brute-force physics without yielding.** The deterministic search does not short-circuit after exceeding a reasonable budget and logs to the console on every worker attempt (`src/workers/trajectory.worker.ts:1-68`). Consider precomputing trajectories server-side or pruning `maxAttempts` dramatically.
- **Animation-heavy components recreate timers or arrays each render.** `CurrencyCounter` stacks `setTimeout` calls without clearing active ticks on unmount, and `Slot`/`BallLandingImpact` use `Date.now()` in `key` props, causing React to recreate elements every frame (`src/components/effects/CurrencyCounter.tsx:60-115`, `src/components/PlinkoBoard/Slot.tsx:166-197`).

## Demo vs Production Behaviour
- **Runtime prize table generation is intentional for the prototype.** The demo seeds a random prize set and winning index on each start (`src/hooks/usePlinkoGame.ts:42-117`, `src/config/productionPrizeTable.ts:238-257`). This is fine for showcasing the experience; if production needs to mirror backend-provided prize data, the hook could accept that configuration instead.
- **Client-side winner selection keeps the animation truthful.** `selectPrize()` picks the winner up front and the physics search finds a compatible trajectory before swapping prizes if needed (`src/hooks/usePlinkoGame.ts:84-113`, `src/game/trajectory.ts:500-570`). Behaviour is correct for the demo; only change it if a server-determined outcome must be enforced.

## Code Quality & Maintainability
- **Duplicate utility logic scattered through the UI.** `hexToRgba` is reimplemented in several components (`src/components/PlinkoBoard/Slot.tsx:55-70`, `src/components/PlinkoBoard/Peg.tsx:33-48`, `src/components/PlinkoBoard/ComboLegend.tsx:19-50`). Centralize it in `utils` to ensure consistent behavior.
- **Visual configuration is tightly coupled to game state.** Physics utilities pull UI helpers like `calculateBucketZoneY` (`src/game/trajectory.ts:114-196`), and the board component mixes rendering with state transitions and drop-position logic (`src/components/PlinkoBoard/PlinkoBoard.tsx:63-311`). This hampers re-use of the state machine in other shells.
- **Development features are bundled into production paths.** `DevToolsMenu` is always rendered with a fixed overlay (`src/App.tsx:130-150`). Without a feature flag this leaks tooling into shipping builds.

## Suggested Follow-Up Tasks
1. **Refactor prize handling** so the hook accepts a provided prize table and predetermined winning index, removes randomization, and only validates/normalizes data (`src/hooks/usePlinkoGame.ts`, `src/config/productionPrizeTable.ts`).
2. **Expose trajectory generation as an asynchronous service** (web worker or backend) with deterministic inputs per slot, and make the game consume the precomputed path instead of swapping prizes post-hoc (`src/game/trajectory.ts`, `src/hooks/usePlinkoGame.ts`).
3. **Introduce a platform abstraction layer** for environment APIs (viewport sizing, storage, device detection) so React web and React Native share the same game logic (`src/App.tsx`, `src/utils/deviceDetection.ts`, `src/theme/ThemeContext.tsx`).
4. **Rebuild animation and styling primitives in a cross-platform-friendly system** (e.g. theme tokens + motion descriptors) and isolate the current DOM/CSS implementation behind a web renderer (`src/components/Ball.tsx`, `src/components/effects/ScreenShake.tsx`, `src/styles/globals.css`).
5. **Consolidate duplicated helpers and constants** (drop zones, color conversions, badge styling) into shared modules to reduce divergence (`src/components/PlinkoBoard`).
6. **Gate dev tooling and debugging UI behind environment flags** so production bundles only ship the necessary components (`src/App.tsx`, `src/dev-tools`).
7. **Audit timers and animation keys** to remove `Date.now()` keys and ensure timers are cleaned up to avoid memory churn during long sessions (`src/components/effects/CurrencyCounter.tsx`, `src/components/PlinkoBoard/Slot.tsx`).
