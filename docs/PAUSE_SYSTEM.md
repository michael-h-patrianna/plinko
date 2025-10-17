# Global Pause System

A comprehensive pause system for the Plinko game that pauses all animations and transitions during ball drop or prize reveal phases.

## Overview

The pause system provides:
- **Global pause state management** via React context
- **'P' key toggle** (case-insensitive) for manual pause control
- **Automatic pause** when DevTools menu or ThemeEditor opens
- **CSS-based animation control** that pauses all transitions
- **Demo UI exclusion** - DevTools and ThemeEditor continue to animate when game is paused

## Architecture

### 1. Core Components

#### PauseContext (`src/contexts/PauseContext.tsx`)
React context that manages global pause state:
- `isPaused: boolean` - Current pause state
- `pause()` - Pause the game
- `unpause()` - Unpause the game
- `toggle()` - Toggle pause state

Features:
- Keyboard listener for 'P' key (case-insensitive)
- Updates `body[data-paused]` attribute for CSS control
- Clean up on unmount

#### useAnimationPause Hook (`src/hooks/useAnimationPause.ts`)
Controls Framer Motion animations:
- Sets global `window.__ANIMATIONS_PAUSED__` flag
- Manipulates `animation-play-state` for Framer Motion elements
- Returns current pause state

### 2. Styling

#### pause.css (`src/styles/pause.css`)
CSS rules that pause animations when `body[data-paused="true"]`:
- Pauses all CSS animations and transitions
- Excludes elements with `data-demo-ui="true"` attribute
- Shows "PAUSED" indicator (optional)

Cross-platform compatible:
- Uses only `animation-play-state` and `transition` (no blur/filters)
- Works with transforms, opacity, colors
- Safe for future React Native port

### 3. Integration Points

#### App.tsx
Wraps application with `PauseProvider`:
```tsx
<PauseProvider>
  <AppConfigProvider>
    {/* rest of app */}
  </AppConfigProvider>
</PauseProvider>
```

#### DevToolsMenu
- Calls `pause()` when menu opens
- Calls `unpause()` when menu closes
- Has `data-demo-ui="true"` attribute on root div

#### ThemeEditor
- Calls `pause()` when drawer opens
- Calls `unpause()` when drawer closes
- Has `data-demo-ui="true"` attribute on drawer div

## Usage

### Manual Pause Control

Press 'P' key anywhere in the app to toggle pause:
```typescript
// Keyboard shortcut
window.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P') {
    // Pause toggles automatically
  }
});
```

### Programmatic Control

Use the `usePause` hook in any component:
```typescript
import { usePause } from '@/contexts/PauseContext';

function MyComponent() {
  const { isPaused, pause, unpause, toggle } = usePause();

  return (
    <div>
      {isPaused ? 'Paused' : 'Running'}
      <button onClick={pause}>Pause</button>
      <button onClick={unpause}>Unpause</button>
    </div>
  );
}
```

### Exclude UI from Pause

Add `data-demo-ui="true"` to any element that should continue animating:
```tsx
<div data-demo-ui="true">
  {/* This will continue to animate when game is paused */}
</div>
```

## Testing

### Unit Tests

#### PauseContext Tests (`src/tests/contexts/PauseContext.test.tsx`)
- ✅ Provides pause state management
- ✅ Keyboard listener for 'P' key (case-insensitive)
- ✅ Body attribute updates
- ✅ Context provider/hook integration
- ✅ Multiple component state sharing

#### useAnimationPause Tests (`src/tests/hooks/useAnimationPause.test.ts`)
- ✅ Global window flag control
- ✅ Framer Motion element pause/resume
- ✅ Returns current pause state
- ✅ Handles dynamic elements

### E2E Tests

#### Playwright Tests (`scripts/playwright/pause-system.spec.ts`)
- ✅ P key toggles pause
- ✅ Pause indicator appears
- ✅ DevTools menu triggers pause
- ✅ Theme editor triggers pause
- ✅ Animations stop when paused
- ✅ Demo UI continues when paused

### Running Tests

```bash
# Unit tests only
npm test -- src/tests/contexts/PauseContext.test.tsx
npm test -- src/tests/hooks/useAnimationPause.test.ts

# All tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e -- scripts/playwright/pause-system.spec.ts
```

## Cross-Platform Compatibility

The pause system is designed to work on both web and React Native:

### ✅ Allowed (cross-platform safe)
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity animations
- Linear gradients (via react-native-linear-gradient)
- Color transitions
- Layout animations

### ❌ Forbidden (web-only)
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (::before, ::after)

## Files Created/Modified

### New Files
- `/src/contexts/PauseContext.tsx` - Pause context and provider
- `/src/hooks/useAnimationPause.ts` - Animation pause hook
- `/src/styles/pause.css` - Pause CSS rules
- `/src/tests/contexts/PauseContext.test.tsx` - Context tests
- `/src/tests/hooks/useAnimationPause.test.ts` - Hook tests
- `/scripts/playwright/pause-system.spec.ts` - E2E tests
- `/docs/PAUSE_SYSTEM.md` - This documentation

### Modified Files
- `/src/App.tsx` - Added PauseProvider wrapper
- `/src/styles/globals.css` - Imported pause.css
- `/src/hooks/index.ts` - Exported useAnimationPause
- `/src/dev-tools/components/DevToolsMenu.tsx` - Added pause integration
- `/src/dev-tools/components/ThemeEditor.tsx` - Added pause integration

## Implementation Notes

1. **Provider Order**: PauseProvider wraps AppConfigProvider to ensure pause is available throughout the app
2. **Keyboard Conflicts**: The 'P' key was chosen to avoid conflicts with existing game controls
3. **CSS Specificity**: Pause CSS uses `!important` to override all animations
4. **Demo UI Pattern**: Any element with `data-demo-ui="true"` is excluded from pause
5. **Memory Management**: All event listeners are properly cleaned up on unmount

## Future Enhancements

Potential improvements:
- Configurable pause key
- Pause/resume animations for smoother transitions
- Visual timeline scrubbing when paused
- Pause state persistence
- React Native implementation using Reanimated
