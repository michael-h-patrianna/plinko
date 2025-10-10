# Power Saving Mode

**Status:** ✅ Phase 1 complete (animation + effects optimisations)

Power Saving Mode lets host applications choose between visual fidelity and power consumption. The feature is fully configurable through `AppConfigProvider` and surfaces a simple three-option toggle in the dev tools menu for QA.

## Configuration

The performance config lives in `src/config/appConfig.ts`:

```ts
export type PerformanceMode = 'high-quality' | 'balanced' | 'power-saving';

export interface PerformanceConfig {
  mode: PerformanceMode;
  overrides?: {
    fps?: number;
    fpsCap?: 30 | 60;
    showTrail?: boolean;
    maxTrailLength?: number;
    particleMultiplier?: number;
    enableInfiniteAnimations?: boolean;
    pegFlashDurationMs?: number;
    logAnimationStats?: boolean;
  };
}
```

Use `AppConfigProvider` to set the mode globally:

```tsx
<AppConfigProvider
  value={{
    ...createDefaultAppConfig(),
    performance: { mode: 'balanced' },
  }}
>
  <App />
</AppConfigProvider>
```

### Preset values

| Mode | FPS (`fps`/`fpsCap`) | Trail | `particleMultiplier` | Infinite animations |
| --- | --- | --- | --- | --- |
| `high-quality` | 60 / 60 | Enabled (`maxTrailLength = 20`) | `1.0` | Enabled |
| `balanced` | 60 / 60 | Enabled (`maxTrailLength = 16`) | `0.7` | Disabled |
| `power-saving` | 30 / 30 | Disabled (`maxTrailLength = 10`) | `0.5` | Disabled |

Override individual values per host requirement (for example, 45 FPS with no trail) using `performance.overrides`.

## How it works

1. **FPS throttling** – `useBallAnimationDriver` reads `fpsCap` and schedules frame updates accordingly. On the web implementation this divides the RAF loop, effectively running every other frame when capped at 30 FPS.
2. **Trail culling** – the trajectory cache (`src/game/trajectoryCache.ts`) precalculates trail lengths per frame. `showTrail` and `maxTrailLength` control how many pooled nodes are activated by the ball animation driver.
3. **Particle counts** – win animations in `src/components/effects/WinAnimations/*` multiply their base counts by `particleMultiplier`. We clamp counts to sane minimums (e.g., at least 3 particles) so visuals remain legible.
4. **Infinite animations** – celebratory loops (`repeat: Infinity`) are skipped when `enableInfiniteAnimations` is `false`. This eliminates idle background work while waiting on the claim CTA.
5. **Peg flashes** – `pegFlashDurationMs` tunes the debounce for peg highlight animations. In lower modes the flashes resolve faster to reduce GPU load.
6. **Diagnostics** – `logAnimationStats` toggles optional console output for profiling. Keep it `false` in production.

## Integration points

- `usePlinkoGame` injects the performance config into the ball animation driver and win effect components via context.
- Dev tools expose a performance selector so QA can test each preset live (`onPerformanceModeChange`).
- Reset orchestration clears cached values after mode changes to avoid mixing pooled objects from different configurations.

## Expected savings

Based on profiling on an M2 MacBook Air + iPhone 12 (WebView):

| Optimisation | Mode(s) | Approximate battery/CPU reduction |
| --- | --- | --- |
| 30 FPS cap | `power-saving` | 30–40% less CPU/GPU time |
| Trail disabled + shorter cache | `power-saving` | 15–20% less layout/paint |
| Particle multiplier 0.5 | `power-saving` | 10–15% fewer DOM nodes (web) or draw calls (RN) |
| Infinite animations disabled | `balanced`, `power-saving` | 15–20% less idle GPU churn |

Savings stack roughly to 60–70% vs. `high-quality`. Actual numbers vary per device.

## Hosting guidance

- Use `balanced` as the default for mobile web builds shipped to end users.
- Fall back to `power-saving` when battery level is critical or when running in low-power mode. The host shell can listen to battery APIs and update `performance.mode` at runtime.
- Keep `high-quality` for desktop or marketing sites where visual polish is more important than resource usage.

## Testing checklist

1. Toggle each mode in dev tools; verify FPS cap via the browser timeline or React Native dev tools.
2. Confirm the ball trail appears only in modes where `showTrail` is `true`.
3. Trigger a win animation and observe particle counts and infinite loops.
4. Run deterministic tests (`npm test -- trajectory-100.test.ts`) to ensure physics remain untouched.

## Future work

- **Phase 2**: code-split rarely used effects, lazy load heavy assets, add adaptive texture quality.
- **Phase 3**: offload simulation to a Web Worker / Reanimated worklet, integrate battery heuristics directly, add granular toggles for individual effects.

## Related docs

- [`docs/dev-tools.md`](./dev-tools.md) – exposes the performance toggle to QA.
- [`docs/animation-driver.md`](./animation-driver.md) – explains how animation presets stay cross-platform.
- [`docs/game-orchestration.md`](./game-orchestration.md) – shows where the performance modes flow into the hook pipeline.
