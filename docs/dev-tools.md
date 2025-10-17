# Developer Tools

## Overview

The developer tooling lives under `src/dev-tools/` and provides guarded controls for QA, prototyping, and local debugging. The menu is feature-flagged through `AppConfigProvider` so production builds remain clean by default. This guide explains the available controls, how they integrate with the rest of the app, and how to enable them in different environments.

## Feature summary

The main entry point is `DevToolsLoader`, a lazy-loaded wrapper that renders `DevToolsMenu` only when the `devToolsEnabled` flag is `true`.

`DevToolsMenu` exposes four control groups:

1. **Theme switching** – cycles through registered themes (`src/theme/themes/*`). Changes are persisted via `storageAdapter` so the selection survives reloads.
2. **Choice mechanic toggle** – switches between the classic deterministic mode (`none`) and the drop-position mechanic (`drop-position`). When drop-position is enabled, `useGameState` pauses the countdown and waits for the user to select a drop zone before dropping the ball.
3. **Performance mode selector** – surfaces the same `PerformanceMode` values as `AppConfig` (`high-quality`, `balanced`, `power-saving`). The selection updates the config provider, which feeds into the ball animation driver and win effects. See [`docs/power-saving-mode.md`](./power-saving-mode.md).
4. **Viewport presets** – desktop-only buttons that lock the game container to common device widths (iPhone SE, Galaxy S8, iPhone 12, iPhone 14 Pro Max). During gameplay the viewport selector is disabled to prevent geometry mismatches mid-drop.

The menu itself is animated using the cross-platform animation driver (`useAnimationDriver`). All motion primitives comply with the same constraints as the production UI (transforms + opacity only).

## Settings persistence

All dev tools settings are automatically persisted to `localStorage` and restored on page load, ensuring configuration survives refreshes and rebuilds. The persistence layer lives in `src/utils/devToolsPersistence.ts`.

### Persisted settings

The following settings are saved under the `plinko-dev-settings` key:

- **`choiceMechanic`** – Game choice mechanic (`'none'` | `'drop-position'`)
- **`showWinner`** – Debug flag to display winning item
- **`musicEnabled`** – Background music toggle
- **`performanceMode`** – Performance preset (`'high-quality'` | `'balanced'` | `'power-saving'`)
- **`viewportWidth`** – Desktop viewport simulation size (pixels)
- **`themeName`** – Visual theme name

> **Note:** Theme persistence uses a separate key (`plinko-theme`) managed by the theme system.

### Implementation details

**Loading:**
- Settings are loaded once on mount using `useMemo` to avoid redundant reads
- Each setting is validated with runtime type guards to handle corrupted data
- Missing or invalid settings fall back to sensible defaults

**Saving:**
- A `useEffect` hook in `App.tsx` automatically saves settings whenever any value changes
- All localStorage operations are wrapped in try-catch blocks with console warnings
- Storage quota errors are handled gracefully

**Viewport restoration:**
- On desktop devices, viewport width is restored after UI state initializes
- Ensures the simulated device size persists across sessions

### Storage structure

Settings are stored as a JSON object:

```json
{
  "choiceMechanic": "drop-position",
  "showWinner": false,
  "musicEnabled": true,
  "performanceMode": "balanced",
  "viewportWidth": 375,
  "themeName": "brutalist"
}
```

### Error handling

The persistence layer includes robust error handling for:
- **Corrupted data:** Invalid JSON or unexpected types revert to defaults
- **Storage quota exceeded:** Save failures log warnings without breaking the app
- **Missing localStorage:** Gracefully degrades when storage is unavailable (e.g., private browsing)

## Enabling the tools

Dev tools are controlled by `featureFlags.devToolsEnabled` in `AppConfig`:

```ts
import { AppConfigProvider, createDefaultAppConfig } from '@/config/appConfig';

const config = createDefaultAppConfig();
// Toggle flag as needed
config.featureFlags.devToolsEnabled = true;

<AppConfigProvider value={config}>
  <App />
</AppConfigProvider>
```

### Default behaviour

| Build type | Flag default | Notes |
| --- | --- | --- |
| `npm run dev` | `true` | Menu is visible immediately. |
| `npm run build` | `false` | Menu is stripped from the main bundle unless re-enabled via environment variable. |
| Production with `VITE_ENABLE_DEV_TOOLS=true` | `true` | Use for QA/staging bundles. |

Set the environment variable via CLI or `.env.production.local`:

```bash
# One-off build
VITE_ENABLE_DEV_TOOLS=true npm run build

# Persist for local QA builds
printf "VITE_ENABLE_DEV_TOOLS=true\n" > .env.production.local
```

## Integration tips

- Always import `DevToolsLoader` instead of `DevToolsMenu` directly. The loader handles lazy loading and feature-flag checks.
- `DevToolsMenu` props come from `usePlinkoGame` and config providers: viewport width, choice mechanic setter, and performance setter.
- When adding new dev-only controls, keep them in `src/dev-tools/components/` and extend the menu sections. Double-check the RN compatibility of any styling (no shadows/filters).
- Expose new controls by adding optional callbacks/values to `DevToolsMenuProps` and wiring them from `DevToolsLoader` or higher-level components (`App.tsx`).

## Testing

### Manual QA checklist

- Toggle each theme and ensure the selection is persisted after a reload.
- Switch performance modes and confirm the win animations/ball trail respond accordingly.
- Enable drop-position mechanic, verify countdown pauses, and confirm the chosen drop zone influences the trajectory.
- Attempt to change viewport during a drop; the selector should be disabled with a warning.
- Change multiple settings, refresh the page, and verify all settings are restored correctly.

### Automated tests

**Unit tests** (`src/tests/utils/devToolsPersistence.test.ts`):
- Loading, saving, and clearing settings
- Type guard validation for all setting properties
- Error handling for corrupt data and storage failures
- Round-trip persistence tests

**Integration tests:**
- Component tests with `renderWithProviders` to verify the menu renders the expected sections when the flag is enabled.
- Playwright smoke tests to ensure the flag gating works (menu absent in production preview, present when env var is set).
- Browser automation test (`scripts/playwright/test-devtools-persistence.mjs`) that changes settings, refreshes the page, and verifies restoration.

## Security & deployment

- Dev tools never expose secrets or mutate production-only state.
- Keep the flag disabled for end-user builds unless QA explicitly needs it.
- When the menu is disabled, the lazy-loaded chunk is not requested, so bundle size for production remains unaffected.

## Future enhancements

Potential improvements to the dev tools:

- **Reset to defaults button** – Quick way to restore all settings to initial values
- **Export/import settings** – Save/load configurations as JSON files for sharing test scenarios
- **Settings profiles** – Pre-configured sets of settings for common testing workflows
- **Cross-tab sync** – Use storage events to sync settings across multiple browser tabs

## Related documentation

- [`docs/architecture.md`](./architecture.md) – project layout and layering, including dev tools boundaries.
- [`docs/power-saving-mode.md`](./power-saving-mode.md) – details on performance presets surfaced in the menu.
- [`docs/theming.md`](./theming.md) – explains how the theme switcher works under the hood.

## Implementation files

- `src/dev-tools/` – Dev tools components and menu
- `src/utils/devToolsPersistence.ts` – Settings persistence utility
- `src/tests/utils/devToolsPersistence.test.ts` – Unit tests for persistence
- `scripts/playwright/test-devtools-persistence.mjs` – Browser automation test
