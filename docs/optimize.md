# Plinko Gameplay Optimization Blueprint

**Date**: 2025-10-09
**Owner**: Gameplay & Animation Team
**Scope**: Reduce CPU load during ball drop animation while preserving a single shared gameplay code path across Web and React Native (Reanimated + Moti).

---

## Goals

1. **Keep deterministic logic shared**: Physics (`runSimulation`), trajectory caching, state machine, and hooks remain identical across platforms.
2. **Lower runtime overhead**: Remove the 60 FPS React reconciliation loop and redundant DOM updates without sacrificing visuals.
3. **Enable React Native parity**: Provide an animation surface that maps cleanly to both Web (DOM) and Native (Reanimated/Moti) without duplicating business logic.

---

## Summary of Issues Detected

- `useSyncExternalStore` forces `PlinkoBoard` to re-render on every frame (≈60 times/sec), causing memo comparison churn across 70+ components.
- `Ball.tsx` directly mutates trail DOM nodes each frame, keeping that work on the main thread and blocking JS.
- Peg flash effects register their own timers and subscriptions, spiking CPU when collisions cluster.

These behaviors are identical on Web and would translate poorly to React Native where Reanimated expects shared values instead of per-frame React reflow.

---

## Implementation Plan (Precise Changes)

> ⚠️ Complete the steps *in order*. Platform-specific files use the `.web.ts` / `.native.ts` suffix so imports stay platform-agnostic.

### 1. Introduce a Cross-Platform Animation Driver Contract

**File**: `src/animation/ballAnimationDriver.ts` *(new)*

> **Why not re-use `animationAdapter`?** The existing adapter in `src/utils/platform/animation` abstracts only the *timing primitive* (`requestFrame`, `cancelFrame`, `now`). It keeps the physics loop cross-platform but still leaves per-frame DOM/React work in the rendering layer. The new driver sits one layer above: it consumes the timing adapter, applies ball transforms, manages the trail pool, and triggers peg flashes imperatively. That extra surface area is what lets us bypass React reconciliation while keeping the deterministic logic identical on both platforms.

```ts
export interface BallTransform {
  position: { x: number; y: number; rotation: number };
  stretch: { scaleX: number; scaleY: number };
}

export interface TrailFrame {
  x: number;
  y: number;
  opacity: number;
}

export interface BallAnimationDriver {
  /** Start listening for frame updates. Returns a cancel function. */
  schedule(update: (frame: number) => void): () => void;
  /** Apply ball transform + squash/stretch for the current frame. */
  applyBallTransform(transform: BallTransform): void;
  /** Update trail visuals using a pooled list of points. */
  updateTrail(points: TrailFrame[]): void;
  /** Clear trail instantly (called on reset/idle). */
  clearTrail(): void;
  /** Trigger a peg flash effect for the supplied peg id. */
  flashPeg(id: string): void;
}
```

### 2. Supply Platform Implementations

1. **Web driver** — `src/animation/ballAnimationDriver.web.ts`
   - Reuse existing refs (`Ball.tsx` trail elements, glow layers) to mutate `style.transform` and `style.opacity`.
   - Use `requestAnimationFrame` inside `schedule` and wire it to `animationAdapter.requestFrame` for consistency.
   - Maintain a fixed pool of `MAX_TRAIL_LENGTH` divs; recycle instead of reallocating.

2. **Native driver** — `src/animation/ballAnimationDriver.native.ts`
   - Backed by Reanimated shared values (`useSharedValue`, `useAnimatedStyle`).
   - `applyBallTransform` updates shared values consumed by a single `Animated.View` tree.
   - `updateTrail` writes to a shared array (e.g., `useSharedValue<TrailFrame[]>([])`) read by a memoized component (Moti `AnimatePresence` or Skia-based view pool).
   - `flashPeg` toggles a shared opacity/tint value for the peg; sequence with `withTiming`/`withSequence`.

### 3. Refactor `Ball.tsx` to Use the Driver

- Inject the driver via a new hook `useBallAnimationDriver()` that resolves to the platform file (`ballAnimationDriver.web/native`).
- Replace direct `getCachedValues` consumers with:
  ```ts
  const driver = useBallAnimationDriver(refs);
  const cached = getCachedValues(trajectoryCache, currentFrame);
  driver.applyBallTransform({
    position: positionRef,
    stretch: { scaleX: cached.scaleX, scaleY: cached.scaleY },
  });
  driver.updateTrail(buildTrailFrame(positionRef, cached.trailLength));
  ```
- Remove per-frame React state for trail management; rely entirely on the driver to mutate existing nodes/shared values.

### 4. Update `PlinkoBoard` / `BallRenderer`

- In `BallRenderer`, replace `useSyncExternalStore` subscription with the driver’s `schedule`.
- Ensure `schedule` is started when `ballState === 'dropping'` and cancelled on cleanup.
- Keep the existing JSX structure identical so styling/theme code remains shared.

### 5. Batch Peg Flash Effects

- In `PlinkoBoard`, collect peg hits per frame and forward them to the driver once per animation tick (`driver.flashPeg(pegId)`).
- Remove individual peg timers; the driver (Web/Naitve) owns the visual pulse timeline.

### 6. Add Performance Controls (Shared)

- Extend `AppConfig.performance` (and its defaults) with:
  - `fpsCap: 30 | 60`
  - `maxTrailLength: number`
  - `pegFlashDurationMs: number`
- Respect these settings inside the driver (`schedule` skips frames for 30 Hz, `updateTrail` trims to `maxTrailLength`).

### 7. Instrument & Test

- **Logging**: add optional `performance.logAnimationStats` flag that logs dropped frames and trail pool usage.
- **Testing**:
  - Unit test the Web driver with JSDOM to ensure transforms/opacity change as expected.
  - Snapshot/Moti tests in the Native driver verifying shared values update (use Reanimated mock environment).
  - Existing Vitest + Playwright suites continue covering shared hooks and UI flows.

---

## Rollout Checklist

- [ ] Implement driver contract + web/native adapters.
- [ ] Refactor `Ball.tsx` and `BallRenderer` to delegate to the driver.
- [ ] Remove direct `useSyncExternalStore` subscription.
- [ ] Wire peg flash batching through driver.
- [ ] Expose new performance settings and defaults.
- [ ] Add instrumentation toggles and smoke tests.
- [ ] Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run test:e2e` before release.

---

## Expected Impact

- **Web**: 40–60% CPU reduction during ball drop (no more 60 FPS React reconciliation).
- **Native**: Animations move to the UI thread, avoiding JS bridge jank and aligning with Reanimated best practices.
- **Shared Code**: Deterministic gameplay logic unchanged; only a thin animation layer differs per platform.

The above changes keep the project highly translatable to React Native while eliminating the main sources of CPU load during gameplay.
