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

The Plinko game is organised around three cooperating layers. The portable game package lives under `src/plinko/`; the demo host app lives under `src/demo/`.

- **Deterministic game core (`src/plinko/game/`)** – framework-free TypeScript for physics, deterministic trajectory search, prize contracts, and the state machine. Pure and portable to React Native without modification.
- **Orchestration hooks (`src/plinko/hooks/`)** – glue the pure core to React by coordinating prize loading, animation playback, state transitions, and reset orchestration. The hooks expose a single public API, `usePlinkoGame`, consumed by the UI on both web and native.
- **Presentation/UI (`src/plinko/components/` + `src/plinko/theme/`)** – React components, theme tokens, and animation drivers that render the experience. UI depends on the orchestration layer and platform adapters, but never calls the physics or RNG code directly.

Key design principles:

- **Deterministic outcomes** – trajectories are precomputed using deterministic physics so that the ball always lands in the selected prize slot without cheating the animation.
- **Dependency injection** – host shells customise behaviour through `AppConfigProvider`, which supplies feature flags, performance settings, and the prize provider implementation.
- **Platform abstraction** – all browser- or device-specific APIs sit behind adapters in `src/utils/platform/`, keeping the core code React Native ready.
- **Reusable documentation** – each major subsystem has a companion doc that explains how to extend or port it. See the [related documentation](#related-documentation) section.

## Layered responsibilities

| Layer | Responsibilities | Key modules | RN migration notes |
| --- | --- | --- | --- |
| Game core | Board geometry, physics constants, deterministic simulation, trajectory cache, prize contracts, state machine | `src/plinko/game/boardGeometry.ts`, `src/plinko/game/trajectory/*`, `src/plinko/game/trajectoryCache.ts`, `src/plinko/game/prizeProvider.ts`, `src/plinko/game/stateMachine.ts` | Pure TypeScript with no DOM access. Ready to drop into a Metro bundle. |
| Orchestration hooks | Prize loading, animation frame coordination, state transitions, reset lifecycle, choice mechanic | `src/plinko/hooks/usePlinkoGame.ts`, `src/plinko/hooks/usePrizeSession.ts`, `src/plinko/hooks/useGameState.ts`, `src/plinko/hooks/useGameAnimation.ts`, `src/plinko/hooks/useResetCoordinator.ts` | Hooks rely on platform adapters and the animation driver. RN port keeps logic but swaps drivers. |
| Animation system | Frame scheduling, ball trail pooling, animation driver abstraction | `src/plinko/animation/*`, `src/plinko/theme/animationDrivers/*` | Web uses Framer Motion + RAF. Native swaps in Moti/Reanimated with the same driver API. |
| Theming | Theme tokens, providers, runtime switching, persistence | `src/plinko/theme/**` | Tokens are cross-platform (no shadows / filters). Storage uses adapters for RN AsyncStorage compatibility. |
| UI | Screens, layout wrappers, error boundaries | `src/plinko/components/**` | Keep presentational logic only; all business logic comes from hooks. RN implementation can re-use hooks with native views. |
| Configuration (demo host) | Performance tuning, feature flags | `src/demo/config/appConfig.ts`, `src/demo/config/AppConfigContext.tsx` | Hosts should supply their own provider. Demo shows a reference implementation. |
| Platform adapters | Crypto, dimensions, device info, storage, navigation, animation timing | `src/plinko/utils/platform/**` | Provide `.web.ts` and `.native.ts`. RN port implements native versions without touching call sites. |

## Runtime data flow

1. **Configuration** – `AppConfigProvider` (demo host: `src/demo/config/AppConfigContext.tsx`) supplies feature flags, performance presets, and a `PrizeProvider`. Dev tools and host apps override these values.
2. **Session load** – `usePrizeSession` pulls prizes from the provider (sync or async), honours seed overrides, and stores the immutable winning prize plus a mutable array for UI swapping.
3. **Trajectory generation** – `useGameState` requests a trajectory via `generateTrajectory`. The generator either consumes a precomputed payload returned by the provider or runs deterministic search using the physics core. A trajectory cache is created for animation performance.
4. **Animation playback** – The ball animation driver (web) drives frame progression and notifies subscribers through an internal frame store. Components read cached frame data to avoid expensive recalculations.
5. **State transitions** – The state machine tracks phases (`idle → ready → countdown → dropping → landed → revealed → claimed`). Hook helpers expose imperative actions (`startGame`, `selectDropPosition`, `claimPrize`, `resetGame`).
6. **Rendering** – Components read hook outputs. Theming and animation drivers keep the render tree platform-agnostic. Dev tools and performance mode toggles feed back into the hooks via config changes.

> For a deep dive into each step—including pseudo-code and failure handling—see the dedicated subsystem docs linked below.

## Core modules

### Physics & trajectory

- **Board geometry** – `src/plinko/game/boardGeometry.ts` defines physics constants, responsive peg layout logic, drop zones, and validation helpers.
- **Trajectory search** – `src/plinko/game/trajectory/index.ts` orchestrates deterministic search, precomputed trajectory ingestion, and returns a `TrajectoryCache`. Bucket physics, collision detection, and simulation math live under `src/plinko/game/trajectory/`.
- **Trajectory cache** – `src/plinko/game/trajectoryCache.ts` precomputes per-frame speed, squash/stretch, and trail data using typed arrays. The cache dramatically reduces animation CPU cost.

### Prize and session management

- **Prize provider contract** (`src/plinko/game/prizeProvider.ts`) defines the API host shells must implement. The default provider ships with fixtures and deterministic seeding.
- **Prize session hook** (`src/plinko/hooks/usePrizeSession.ts`) handles loading, retries/timeouts, seed overrides, and separation between the immutable winning prize and the swapped prizes array.

### Game state orchestration

- **State machine** – `src/plinko/game/stateMachine.ts` codifies valid transitions and contextual data. Hooks dispatch the machine rather than toggling state manually.
- **usePlinkoGame** – single entry point for components. It composes prize session, state machine, animation driver, and reset coordinator.
- **Reset coordinator** – `src/plinko/hooks/useResetCoordinator.ts` serialises cleanup (animation frame reset, prize unlock, state machine reset) to guarantee deterministic resets.

### Rendering & experience

- **Animation drivers** – The abstraction under `src/plinko/theme/animationDrivers/` hides Framer Motion vs Moti differences. The driver is selected lazily via `useAnimationDriver`. See [`docs/animation-driver.md`](./animation-driver.md).
- **Ball animation driver** – `src/plinko/animation/ballAnimationDriver*.ts` pools DOM nodes, maintains a single `requestAnimationFrame` loop, and exposes a hook-based API. Replace with a Reanimated worklet on RN.
- **Theming** – `src/plinko/theme` exports `ThemeProvider` and tokens for cross-platform design, theme switching, and persistence (backed by the storage adapter). Documented in [`docs/theming.md`](./theming.md).
- **Dev tools** – Feature-flagged controls for QA: theme switching, viewport presets, mechanic toggles, performance mode selection. Detailed in [`docs/dev-tools.md`](./dev-tools.md).
- **Power saving mode** – Configurable animation downgrades activated through `AppConfig`. Covered in [`docs/power-saving-mode.md`](./power-saving-mode.md).

### Platform abstraction

`src/plinko/utils/platform/` exports typed adapters for crypto, dimensions, device info, navigation, storage, animation timing, and performance measurement. Each adapter ships `.web.ts` implementations today and `.native.ts` stubs with migration notes.

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
  demo/                     # Demo host app (providers, dev tools, styles)
  plinko/                   # Portable game package (public API)
    animation/              # Frame drivers, pooling utilities
    audio/                  # Audio system (SFX/music controllers)
    components/             # Presentational React components
    config/                 # Prize config helpers (package-level)
    constants/              # Layout/physics constants
    game/                   # Deterministic physics, prize domain, state machine
      trajectory/           # Simulation, bucket physics, collisions
      trajectoryCache.ts    # Typed-array cache generator
    hooks/                  # Orchestration hooks wrapping the game core
    tests/                  # Package tests
    theme/                  # Tokens, themes, animation drivers
    utils/platform/         # Platform adapters (.web.ts / .native.ts)
```

## Related documentation

Related documentation:
- [`docs/dev-tools.md`](./dev-tools.md) – developer tooling, feature flags, QA setup.
- [`docs/power-saving-mode.md`](./power-saving-mode.md) – performance configuration and expected impact.
- [`docs/board-geometry.md`](./board-geometry.md) – detailed geometry helper reference.

## Docs sources of truth

When in doubt, rely on these canonical locations for up-to-date guidance:

- Public API exports: `src/plinko/index.ts` (imports in docs should use `@plinko/...`)
- Host integration: [`docs/INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md)
- Reset lifecycle: [`docs/RESET_ORCHESTRATION.md`](./RESET_ORCHESTRATION.md)
- Platform adapters: `src/plinko/utils/platform/` and its `README.md`
- Theming and animation drivers: `src/plinko/theme/**` and [`docs/theming.md`](./theming.md)
