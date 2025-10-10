# Animation Driver Abstraction

## Overview

The animation driver system keeps all motion primitives cross-platform. On the web we rely on Framer Motion; for React Native the same API is designed to plug into Moti/Reanimated. A second layer, the **ball animation driver**, owns the high-frequency 60 FPS loop that bypasses React reconciliation. Together they let us share the same gameplay logic across React web and React Native without re-authoring animation code.

Key goals:

- **Single API** for both platforms (`AnimationDriver` interface)
- **GPU-safe motion** – only transforms, opacity, and color transitions
- **Deterministic hooks** – animations stay in sync with the precomputed trajectory cache
- **Lazy loading** – production bundles only pay for the driver that matches the current platform

## Directory structure

```
src/
  theme/
    animationDrivers/
      index.ts              # Barrel for driver utilities
      types.ts              # AnimationDriver contract & presets
      framer.ts             # Web implementation (Framer Motion)
      moti.tsx              # Native placeholder with implementation guide
      useAnimationDriver.ts # Hook for selecting drivers
      useAnimation.ts       # Shared helpers for declarative animations
  animation/
    ballAnimationDriver.ts      # Shared driver contract
    ballAnimationDriver.web.ts  # Web implementation (RAF + pooled DOM nodes)
    ballAnimationDriver.native.ts (planned) # RN implementation guidelines
    useBallAnimationDriver.ts   # Hook that exposes the driver to components
    trailOptimization.ts        # Helpers for trail caching & pooling
```

## AnimationDriver API

The `AnimationDriver` interface (see `src/theme/animationDrivers/types.ts`) exposes motion primitives that work on both web and RN:

- `createAnimatedComponent` – wraps intrinsic elements (`div`, `span`, etc.) with Framer Motion or Moti.
- `AnimatePresence` – mount/unmount choreography.
- `isSupported()` – runtime guard for SSR or reduced-motion environments.
- `getSpringConfig()` / `getTransitionConfig()` – opinionated presets tuned for 60 FPS performance.

All animation configs intentionally support only GPU-friendly properties: `translateX/Y`, `scale`, `rotate`, `opacity`, `backgroundColor`, `color`, and keyframe arrays.

### Selecting a driver

Use `useAnimationDriver()` inside React components:

```tsx
import { useAnimationDriver } from '@/theme/animationDrivers';

const driver = useAnimationDriver();
const AnimatedDiv = driver.createAnimatedComponent('div');
const { AnimatePresence } = driver;
```

Outside of React (tests, utility functions) call `getAnimationDriver()`.

### Web implementation (`framer.ts`)

- Wraps Framer Motion's `motion.*` components and `AnimatePresence`.
- Detects reduced motion via `window.matchMedia('(prefers-reduced-motion)')`.
- Provides spring/tween presets that map 1:1 to Reanimated values for parity.

### React Native implementation (`moti.tsx`)

The native driver currently exports a compile-time placeholder that throws descriptive errors, plus a detailed implementation plan. When porting:

1. Install `moti` and `react-native-reanimated`.
2. Replace the placeholders with `MotiView`, `MotiText`, and equivalents for `AnimatePresence`.
3. Mirror spring/tween presets so timings match the web defaults.
4. Ensure every animation uses transforms/opacity; gradients should map to `react-native-linear-gradient`.

## Ball animation driver

High-frequency ball animation is handled separately from the generic driver:

- **Contract** (`src/animation/ballAnimationDriver.ts`) defines methods to schedule frames, apply ball transforms, update pooled trail elements, flash pegs, and highlight slots.
- **Web implementation** (`ballAnimationDriver.web.ts`) runs a single `requestAnimationFrame` loop, manipulates DOM nodes directly, and reuses a fixed trail pool to avoid allocations.
- **Native implementation** – migrate to a Reanimated worklet that updates shared values every frame. The contract matches the web methods to keep the hook API identical.

Access the driver via the hook:

```tsx
import { useBallAnimationDriver } from '@/animation/useBallAnimationDriver';

const { schedule, applyBallTransform, updateTrail } = useBallAnimationDriver();
```

`useGameState` produces trajectory data and caches; the ball animation driver consumes those caches to update transforms without extra math inside the render tree.

## Usage patterns

### Declarative component motion

```tsx
function FadeInPanel({ children }: { children: React.ReactNode }) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={driver.getTransitionConfig('medium')}
    >
      {children}
    </AnimatedDiv>
  );
}
```

### Coordinated sequences

Use `AnimatePresence` plus `variants`/`staggerChildren` (Framer) or `MotiView` variants to choreograph slot reveals. Keep orchestration data (delays, stagger) inside the driver so RN can mirror it.

### Imperative ball updates

`ballAnimationDriver.schedule()` accepts an update callback and `AnimationTimingConfig`. The callback receives the current frame index (sourced from the trajectory cache). The driver then:

1. Applies transforms (`translateX`, `translateY`, `rotate`) directly.
2. Uses cache data to drive squash/stretch and trail length.
3. Notifies peg & slot highlight helpers for visual feedback.

On reset, call `clearTrail()`, `clearAllPegFlashes()`, and `clearAllSlotHighlights()` to restore the idle view before the next run.

## Cross-platform guidance

- **Keep animations deterministic** – derive all state from the trajectory cache and game context to avoid divergence between platforms.
- **No CSS-only features** – shadows, filters, pseudo-elements, and radial gradients are disallowed. Use tokens and gradients that React Native can replicate.
- **Guard for reduced motion** – `driver.isSupported()` returns `false` if users prefer reduced motion. Provide static fallbacks in that branch.
- **RN migration checklist**:
  - Implement `motiDriver` using `MotiView`, `MotiText`, `AnimatePresence`.
  - Replace `ballAnimationDriver.web.ts` with a Reanimated-based `ballAnimationDriver.native.ts` that updates shared values (position, scale, trail) on the UI thread.
  - Swap DOM-specific work (e.g., dataset attributes) with shared-value signals and animated styles.
  - Ensure `useBallAnimationDriver` re-exports the correct driver via platform-specific entry points.

## Testing & QA

- Unit tests: `src/tests/animationDriver.test.ts` verifies preset values, driver selection, and SSR guards.
- Manual QA checklist:
  - Confirm 60 FPS with DevTools timeline.
  - Toggle performance modes in dev tools and ensure driver respects FPS caps.
  - Simulate reduced motion (`prefers-reduced-motion`) – driver should fall back to static rendering.
  - Verify trail pooling resets on game reset.

## Related docs

- [`docs/game-orchestration.md`](./game-orchestration.md) – how the driver integrates with `usePlinkoGame`.
- [`docs/theming.md`](./theming.md) – token-driven styling referenced by animated components.
- [`docs/platform-adapters.md`](./platform-adapters.md) – timing adapter (`animationAdapter`) used by the ball animation driver.
