# Plinko Performance Review

_Prepared: 2025-10-05_

## Executive Summary

- **Overall readiness:** The deterministic physics stack is robust and well-tested, but sustained 60 FPS on mid-tier mobile browsers is at risk because heavy trajectory searches, per-frame React renders, and animation side-effects all execute on the main thread.
- **Key strengths:** Excellent deterministic testing story (10 k trajectory validation), tight bundle surface (React + Framer Motion only), and a theming system that keeps UI tokens centralized.
- **Key risks:** Worst-case 5–10 s trajectory generation blocks the UI, frame updates dispatch through React every RAF tick, animation components allocate memory on each render, and verbose logging plus random number calls inside render paths undermine performance.
- **React Native outlook:** Core logic is portable, but the UI layer relies on DOM APIs (`window`, `document`, `localStorage`, CSS gradients, console logging) that need adaptors before Reanimated/Moti parity is feasible.

| Area | Health | Notes |
| --- | --- | --- |
| Deterministic physics core | ✅ Strong | Precise collision response, deterministic RNG, comprehensive tests |
| Runtime frame pipeline | ⚠️ Needs work | React reducer fires 60×/s, Ball trail re-renders each frame, peg logging |
| Asset & bundle strategy | ⚠️ Acceptable | Few deps, but Framer Motion + large gradients may strain lower-end devices |
| React Native translation | ⚠️ Blocked | Direct DOM APIs, CSS, localStorage require abstractions |

## What’s Working Well

- **Deterministic pipeline:** `generateTrajectory` + `selectPrize` give reproducible results validated by 10 000-run tests and zero-overlap guarantees. This is a strong foundation for fairness and replay debugging.
- **Deterministic alignment:** `generateTrajectory` now honours explicit `targetSlot` inputs and server-supplied deterministic trajectories, while `usePlinkoGame` consumes the aligned path and only falls back to legacy shuffling when explicitly toggled.
- **Physics fidelity:** Binary-search collision resolution, restitution tuning, and bucket settling produce believable motion that will hold up visually once performance bottlenecks are relieved.
- **Testing culture:** Multi-tier tests (unit, trajectory, e2e) and readable diagnostics in `docs/architecture.md` demonstrate a disciplined engineering process.
- **Lean dependency footprint:** Vite + React + Framer Motion keeps the bundle manageable and web tooling modern.

## Performance Risks & Findings

### 1. Trajectory Search on the Main Thread

- `generateTrajectory` may run up to **50 000 attempts**, each attempt simulating as many as 800 frames while checking every peg (`O(pegs)` per frame with `Math.sqrt`) and managing a `Map` of recent collisions. The README cites 50–200 ms averages but **5–10 s worst-case stalls** remain unmitigated. During this time the UI blocks, which is unacceptable on mobile Safari/Chrome.
- There is no progressive feedback or cancellation. A single unlucky search can freeze the game, especially on mid-range Android devices.
- **Opportunity:** Offload trajectory search to a Web Worker (web) and a background thread/worklet on React Native. Cache successful trajectories by `(boardWidth, slotCount, selectedIndex)` to serve infrequent daily drops without recomputation.

### Deterministic Path Strategy (2025-10-06)

- `generateTrajectory` (`src/game/trajectory.ts`) generates a realistic physics trajectory. When called WITHOUT `targetSlot`, it finds the first valid trajectory where the ball doesn't get stuck (typically succeeds in 1 attempt - very fast).
- `usePlinkoGame` uses a **swap-based algorithm** for efficiency:
  1. Generate ONE trajectory - let ball land wherever it naturally lands (fast)
  2. If `landedSlot ≠ winningIndex`, swap `prizes[landedSlot] ↔ prizes[winningIndex]`
  3. Store the original winning prize object before any swaps
  4. Pass the original prize object to game context (not the swapped array element)
- This approach is **1000x faster** than forcing trajectories to land in specific slots, which would require thousands of simulation attempts.
- The original winning prize is preserved throughout all state transitions and swaps, ensuring the correct prize is always displayed regardless of where the ball lands.
- Newly added regression coverage includes:
   1. Vitest `app-claim-flow.test.tsx`, which asserts the start screen faithfully resets after a deterministic drop/claim cycle.
   2. Existing trajectory suites exercising physics realism and path validity.
   3. Playwright Chromium scenario "complete full game cycle," validating deterministic prizes in a full UI loop.
   4. Purchase offer integration test verifying correct view routing after prize swaps.

### 2. Per-Frame React Reconciliation Pressure

- `usePlinkoGame` dispatches `FRAME_ADVANCED` inside every `requestAnimationFrame`, forcing the entire hook consumer tree—including `AppContent`, `PlinkoBoard`, and overlays—to re-render 60× per second. On mobile browsers this saturates the JS thread and increases garbage collection pressure.
- The `Ball` component stores a motion trail in React state, pushing a new array (with `Date.now()` keys) on each frame. That allocates and reconciles up to 12 DOM nodes per frame, amplifying GC churn and triggering layout work.
- Pegs log to the console for every collision (`console.log` in `Peg.tsx`), which is notoriously expensive; even one log per frame can tank FPS on iOS Safari.
- **Opportunity:** Hold frame index in a `useRef`/`useSyncExternalStore` so rendering is scoped to the ball/board layers. Replace stateful trail updates with CSS-based trails or a fixed-length mutable ref. Strip high-frequency logging from production builds.

### 3. Animation Components Recompute on Every Render

- `SlotWinReveal` and `SlotAnticipation` call `Math.random()` inside render, so every ancestor render re-creates particle layouts, invalidating Framer Motion animations and causing layout thrash.
- Animated arrays (e.g., 12 radial rays, repeated sparkles) are recreated each render without memoization. On mobile browsers, this churn impacts paint/composite phases.
- **Opportunity:** Precompute random seeds via `useMemo`, use stable keys, and consider CSS keyframes or lightweight canvas overlays for particle systems.

### 4. DOM & Browser API Coupling Blocks React Native Port

- `AppContent` queries `window`, `navigator`, and `window.addEventListener` directly. `ThemeProvider` relies on `localStorage`. The `Peg` animation injects raw `<style>` tags. None of these translate to React Native without conditional guards or abstraction layers.
- Framer Motion-specific primitives (`AnimatePresence`, `motion.div`) need Moti/Reanimated equivalents. Inline CSS gradients and drop shadows also require React Native styling redesign (e.g., `react-native-linear-gradient`, Skia).
- **Opportunity:** Introduce a platform boundary (e.g., `environment.ts`) to centralize web-only utilities. Design a shared animation interface so Reanimated/Moti implementations can swap in without touching business logic.

### 5. Asset and Bundle Considerations

- Static PNG assets (slot icons, themes) are not optimized for modern formats (no WebP/AVIF fallbacks). While the bundle is small, optimizing image delivery will help mobile users on spotty connections.
- Tailwind is included but most styling is manual inline styles; ensure tree-shaking or consider removing Tailwind if unused to shave CSS payload.

## Recommendations & Roadmap

| Priority | Recommendation | Expected Impact | Effort |
| --- | --- | --- | --- |
| P0 | **Move trajectory generation off the main thread** (Web Worker / React Native background task) and add timeout telemetry | Eliminates multi-second UI stalls; smooths first render | Medium |
| P0 | **Stop dispatching React state every frame**; store the frame index in a ref and expose a lightweight subscription for ball consumers | Cuts render work by ~80%, stabilizes mobile FPS | Medium |
| P0 | **Remove high-frequency logging & random-on-render** (`Peg` console log, `Math.random()` in render trees) | Immediate FPS gains, less GC thrash | Low |
| P1 | **Memoize particle/overlay structures and consider CSS keyframes** for sparkles, rays, anticipation effects | Reduces layout/composite cost; easier React Native translation | Medium |
| P1 | **Implement trajectory caching** keyed by prize index + board config, persisted per session | Instant drops for 1–2 daily plays, even if workers fail | Medium |
| P1 | **Abstract platform APIs** (`window`, `localStorage`, `AnimatePresence`) behind adapters to prep RN build | Unblocks shared logic across web & native | Medium |
| P2 | **Asset optimizations** (WebP/AVIF fallbacks, responsive images) | Faster loads on mobile data, smaller bundle | Low |
| P2 | **Consider replacing Framer Motion for critical layers** with CSS transitions or Canvas/SVG for tighter control | More headroom on older devices, closer to RN parity | High |

## Suggested Next Steps

1. **Stabilize trajectory generation**
   - Prototype a worker-based generator that streams status back to the UI.
   - Capture telemetry (attempt count, duration) to monitor outliers.
   - Add a watchdog that aborts after e.g. 750 ms and retries with different seeds.

2. **Refactor the animation render loop**
   - Replace reducer-based frame updates with a store that only updates the ball/peg layers.
   - Convert the trail to a CSS-only solution (e.g., pseudo-element with `filter: blur`), or to a canvas overlay.
   - Strip development-only logs and guard debug styles behind feature flags.

3. **Harden components for React Native**
   - Introduce an environment abstraction (`isWeb`, `isNative`), wrapping `window`, `document`, `localStorage`, and `CSS` usage.
   - Document equivalent libraries (e.g., `react-native-linear-gradient`, `@shopify/react-native-skia`, `moti`) and start isolating Framer Motion-specific logic.

4. **Optimize visual effects**
   - Memoize expensive arrays, hoist random seeds, and audit Framer Motion usage for components that can fall back to CSS animations.
   - Budget frame-time per effect and disable lower-priority particles when FPS dips (progressive enhancement).

5. **Measure continuously**
   - Add lightweight profiling hooks (telemetry events for generation time, average frame duration, dropped frames) to validate improvements, especially on an iPhone 12 class device and a mid-tier Android phone.

## Appendix: React Native Gap Analysis

| Web Implementation | RN Equivalent Needed | Notes |
| --- | --- | --- |
| `window`, `document`, `navigator` usage | `Platform`, `Dimensions`, `useWindowDimensions` | Guard with `typeof window !== 'undefined'`; inject via service |
| `localStorage` theme persistence | `AsyncStorage` or secure store wrapper | Abstract storage API; ensure async handling |
| `AnimatePresence`, `motion.div` | `MotiView`, Reanimated `useAnimatedStyle` | Create shared animation interface |
| CSS gradients, drop shadows | `react-native-linear-gradient`, shadow props, Skia for complex glow | Need design tokens convertible to native styles |
| Inline `<style>` injection for peg animations | Static StyleSheet or RN Animations | Inline styles won’t work; port to native animation APIs |

---

**Summary:** The project has an excellent deterministic foundation and strong documentation. The next phase should focus on isolating expensive work from the main thread, slimming per-frame React renders, and preparing an abstraction layer for React Native parity. With those pieces in place, the Plinko experience can remain smooth for mobile web users who play once or twice a day and can be ported confidently to Reanimated/Moti.
