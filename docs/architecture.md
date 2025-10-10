# Plinko Architecture Guide

## Table of contents
- [Plinko Architecture Guide](#plinko-architecture-guide)
  - [Table of contents](#table-of-contents)
  - [System overview](#system-overview)
  - [Layered responsibilities](#layered-responsibilities)
  - [Runtime data flow](#runtime-data-flow)
  - [Core modules](#core-modules)
    - [Physics \& trajectory](#physics--trajectory)
    - [Prize and session management](#prize-and-session-management)
    - [Game state orchestration](#game-state-orchestration)
    - [Rendering \& experience](#rendering--experience)
    - [Platform abstraction](#platform-abstraction)
  - [Cross-platform strategy](#cross-platform-strategy)
  - [File map](#file-map)
  - [Related documentation](#related-documentation)

---

## System overview

The Plinko game is organised around three cooperating layers:

- **Deterministic game core (`src/game/`)** – written as framework-free TypeScript. It handles physics, deterministic trajectory search, prize management contracts, and the state machine. Everything in this layer is portable to React Native without modification.
- **Orchestration hooks (`src/hooks/`)** – glue the pure core to React by coordinating prize loading, animation playback, state transitions, and reset orchestration. The hooks expose a single public API, `usePlinkoGame`, that the UI consumes on both web and native.
- **Presentation/UI (`src/components/` + `src/theme/`)** – React components, theme tokens, and animation drivers that render the experience. UI depends on the orchestration layer and platform adapters, but never calls the physics or RNG code directly.

Key design principles:

- **Deterministic outcomes** – trajectories are precomputed using deterministic physics so that the ball always lands in the selected prize slot without cheating the animation.
- **Dependency injection** – host shells customise behaviour through `AppConfigProvider`, which supplies feature flags, performance settings, and the prize provider implementation.
- **Platform abstraction** – all browser- or device-specific APIs sit behind adapters in `src/utils/platform/`, keeping the core code React Native ready.
- **Reusable documentation** – each major subsystem has a companion doc that explains how to extend or port it. See the [related documentation](#related-documentation) section.

## Layered responsibilities

| Layer | Responsibilities | Key modules | RN migration notes |
| --- | --- | --- | --- |
| Game core | Board geometry, physics constants, deterministic simulation, trajectory cache, prize contracts, state machine | `src/game/boardGeometry.ts`, `src/game/trajectory/*`, `src/game/trajectoryCache.ts`, `src/game/prizeProvider.ts`, `src/game/stateMachine.ts` | Pure TypeScript with no DOM access. Ready to drop into a Metro bundle. |
| Orchestration hooks | Prize loading, animation frame coordination, state transitions, reset lifecycle, choice mechanic | `src/hooks/usePlinkoGame.ts`, `src/hooks/usePrizeSession.ts`, `src/hooks/useGameState.ts`, `src/hooks/useGameAnimation.ts`, `src/hooks/useResetCoordinator.ts` | Hooks rely on platform adapters (`navigationAdapter`, `storageAdapter`) and the animation driver. RN port keeps logic but swaps drivers. |
| Animation system | Frame scheduling, ball trail pooling, animation driver abstraction | `src/animation/*`, `src/theme/animationDrivers/*` | Web uses Framer Motion + RAF. Native swaps in Moti/Reanimated with the same driver API. |
| Theming | Theme tokens, providers, runtime switching, persistence | `src/theme/**` | Tokens are cross-platform (no shadows / filters). Storage uses adapters for RN AsyncStorage compatibility. |
| UI | Screens, layout wrappers, error boundaries, dev tools menu | `src/components/**`, `src/dev-tools/**` | Keep presentational logic only; all business logic comes from hooks. RN implementation can re-use hooks with native views. |
| Configuration | Default app config, performance tuning, feature flags | `src/config/appConfig.ts`, `src/config/AppConfigContext.tsx` | Works in RN; ensure environment variables flow through Metro (e.g., react-native-config). |
| Platform adapters | Crypto, dimensions, device info, storage, navigation, animation timing | `src/utils/platform/**` | Provide `.web.ts` and `.native.ts` files. RN port implements native versions without touching call sites. |

## Runtime data flow

1. **Configuration** – `AppConfigProvider` supplies feature flags, performance presets, and a `PrizeProvider`. Dev tools and host apps override these values.
2. **Session load** – `usePrizeSession` pulls prizes from the provider (sync or async), honours URL/prop seed overrides, and stores the immutable winning prize plus a mutable array for UI swapping.
3. **Trajectory generation** – `useGameState` requests a trajectory via `generateTrajectory`. The generator either consumes a precomputed payload returned by the provider or runs deterministic search using the physics core. A trajectory cache is created for animation performance.
4. **Animation playback** – `ballAnimationDriver` (web) drives frame progression and notifies subscribers through the `frameStore`. Components read cached frame data to avoid expensive recalculations.
5. **State transitions** – The state machine tracks phases (`idle → ready → countdown → dropping → landed → revealed → claimed`). Hook helpers expose imperative actions (`startGame`, `selectDropPosition`, `claimPrize`, `resetGame`).
6. **Rendering** – Components read hook outputs. Theming and animation drivers keep the render tree platform-agnostic. Dev tools and performance mode toggles feed back into the hooks via config changes.

> For a deep dive into each step—including pseudo-code and failure handling—see the dedicated subsystem docs linked below.

## Core modules

### Physics & trajectory

- **Board geometry** – `src/game/boardGeometry.ts` defines physics constants, responsive peg layout logic, drop zones, and validation helpers. Reference: [`docs/physics-and-trajectory.md`](./physics-and-trajectory.md).
- **Trajectory search** – `src/game/trajectory/index.ts` orchestrates deterministic brute-force search, precomputed trajectory ingestion, and returns a `TrajectoryCache`. Bucket physics, collision detection, and simulation math live under `src/game/trajectory/`.
- **Trajectory cache** – `src/game/trajectoryCache.ts` precomputes per-frame speed, squash/stretch, and trail data using typed arrays. The cache dramatically reduces animation CPU cost (>5%). Covered in the physics doc.

### Prize and session management

- **Prize provider contract** (`src/game/prizeProvider.ts`) defines the API host shells must implement. The default provider ships with fixtures and deterministic seeding.
- **Prize session hook** (`src/hooks/usePrizeSession.ts`) handles loading, retries/timeouts, seed overrides, and separation between the immutable winning prize and the swapped prizes array.

### Game state orchestration

- **State machine** – `src/game/stateMachine.ts` codifies valid transitions and contextual data. Hooks dispatch the machine rather than toggling state manually.
- **usePlinkoGame** – single entry point for components. It composes prize session, state machine, animation driver, and reset coordinator. Reference: [`docs/game-orchestration.md`](./game-orchestration.md).
- **Reset coordinator** – `useResetCoordinator` serialises cleanup (animation frame reset, prize unlock, state machine reset) to guarantee deterministic resets.

### Rendering & experience

- **Animation drivers** – The abstraction under `src/theme/animationDrivers/` hides Framer Motion vs Moti differences. The driver is selected lazily via `useAnimationDriver`. See [`docs/animation-driver.md`](./animation-driver.md).
- **Ball animation driver** – `src/animation/ballAnimationDriver*.ts` pools DOM nodes, maintains a single `requestAnimationFrame` loop, and exposes a hook-based API. Replace with a Reanimated worklet on RN.
- **Theming** – `ThemeProvider` and `tokens.ts` deliver cross-platform design tokens, theme switching, and persistence (backed by the storage adapter). Documented in [`docs/theming.md`](./theming.md).
- **Dev tools** – Feature-flagged controls for QA: theme switching, viewport presets, mechanic toggles, performance mode selection. Detailed in [`docs/dev-tools.md`](./dev-tools.md).
- **Power saving mode** – Configurable animation downgrades activated through `AppConfig`. Covered in [`docs/power-saving-mode.md`](./power-saving-mode.md).

### Platform abstraction

`src/utils/platform/` exports typed adapters for crypto, dimensions, device info, navigation, storage, animation timing, and performance measurement. Each adapter ships `.web.ts` implementations today and `.native.ts` stubs with migration notes. See [`docs/platform-adapters.md`](./platform-adapters.md).

## Cross-platform strategy

- **Keep core pure** – Any new gameplay logic belongs in `src/game/` and must not import React or browser APIs.
- **Use adapters** – When you need platform features (storage, dimensions, crypto, RAF), call the adapter exported from `src/utils/platform`. Implement the native equivalent as `.native.ts` when porting.
- **Animation parity** – All animations flow through `useAnimationDriver` or the ball animation driver. Adding a new animation? Expose presets via the driver so RN can supply an equivalent.
- **Styling constraints** – Use tokens from `src/theme/tokens.ts`. Avoid CSS-only features (shadows, filters, pseudo-elements) unless you gate them behind a platform check.
- **Configuration** – Extend `AppConfig` to add toggles or dependency injections. Document new flags and their defaults.
- **Testing** – Maintain deterministic seeds and update the harnesses under `src/tests/` when adding physics features. Measure trajectory accuracy with the provided fixtures before shipping.

## File map

```
src/
  animation/                # Frame drivers, pooling utilities
  components/               # Presentational React components
  config/                   # AppConfig provider and helpers
  dev-tools/                # Lazy-loaded QA tooling
  game/                     # Deterministic physics, prize domain, state machine
    trajectory/             # Simulation, bucket physics, collisions
    trajectoryCache.ts      # Typed-array cache generator
  hooks/                    # Orchestration hooks wrapping the game core
  theme/                    # Tokens, themes, animation drivers
  utils/platform/           # Platform adapters (.web.ts / .native.ts)
```

## Related documentation

- [`docs/physics-and-trajectory.md`](./physics-and-trajectory.md) – physics constants, simulation loop, deterministic search, trajectory cache.
- [`docs/game-orchestration.md`](./game-orchestration.md) – orchestration hooks, state machine wiring, reset lifecycle.
- [`docs/theming.md`](./theming.md) – theme provider architecture, token usage, adding themes.
- [`docs/animation-driver.md`](./animation-driver.md) – abstraction API and platform-specific guidance.
- [`docs/platform-adapters.md`](./platform-adapters.md) – adapter catalogue and RN implementation notes.
- [`docs/dev-tools.md`](./dev-tools.md) – developer tooling, feature flags, QA setup.
- [`docs/power-saving-mode.md`](./power-saving-mode.md) – performance configuration and expected impact.
- [`docs/board-geometry.md`](./board-geometry.md) – detailed geometry helper reference.
