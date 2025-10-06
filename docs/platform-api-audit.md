# Cross-Platform API Audit Report

**Date**: 2025-10-06
**Scope**: All source files in `/src` directory
**Purpose**: Identify web-specific APIs that need abstraction for React Native compatibility

## Executive Summary

This audit identifies all browser-specific API usage in the codebase that will require platform adapters for React Native compatibility. A total of **7 critical API categories** were found across **12 production files** (excluding tests).

### Priority Distribution
- **CRITICAL** (Core functionality): 4 APIs
- **HIGH** (Required for feature parity): 2 APIs
- **MEDIUM** (Development/debugging features): 1 API

---

## 1. CRYPTO API (Web Crypto)

### Usage: Cryptographically Secure Random Number Generation

**Priority**: CRITICAL
**React Native Alternative**: `expo-crypto` or `react-native-get-random-values`

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/game/rng.ts` | 36 | `crypto.getRandomValues(array)` | Generates seed for game RNG |

#### Details
```typescript
// Current implementation
export function generateSeed(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0]!;
}
```

**Purpose**: Generates cryptographically secure random seeds for the game's deterministic RNG system.

**Migration Strategy**:
- Create platform adapter: `src/platform/crypto.ts`
- Web: Use `window.crypto.getRandomValues()`
- React Native: Use `expo-crypto` or polyfill with `react-native-get-random-values`
- This is the ONLY place in the codebase that needs crypto API

**Impact**: This function is called every time a new game round starts (unless using test seed override).

---

## 2. WINDOW API

### 2.1 Window Size Detection

**Priority**: CRITICAL
**React Native Alternative**: `Dimensions` API from React Native

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/utils/deviceDetection.ts` | 16, 33, 35 | `window.innerWidth` | Viewport width detection |
| `/src/App.tsx` | 66, 74 | `window.innerWidth` | Mobile width calculations |

#### Details
```typescript
// deviceDetection.ts
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
return isMobileUA || (isTouchDevice && window.innerWidth <= 768);

// getResponsiveViewportWidth()
if (isMobileDevice()) {
  return Math.min(window.innerWidth, getMaxMobileWidth());
}
return window.innerWidth;
```

**Purpose**:
- Detect mobile vs desktop device
- Calculate responsive viewport dimensions
- Cap mobile width at 414px

**Migration Strategy**:
- Create platform adapter: `src/platform/dimensions.ts`
- Web: Use `window.innerWidth`
- React Native: Use `Dimensions.get('window').width`
- Add event listener abstraction for resize events

---

### 2.2 Window Event Listeners (Resize)

**Priority**: HIGH
**React Native Alternative**: `Dimensions.addEventListener('change', ...)`

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/App.tsx` | 79-80 | `window.addEventListener('resize', ...)` | Mobile width updates |

#### Details
```typescript
window.addEventListener('resize', updateMobileWidth);
return () => window.removeEventListener('resize', updateMobileWidth);
```

**Purpose**: React to viewport size changes on mobile devices.

**Migration Strategy**:
- Include in `src/platform/dimensions.ts` adapter
- Web: Use `window.addEventListener('resize')`
- React Native: Use `Dimensions.addEventListener('change')`
- Same cleanup pattern works for both

---

### 2.3 Window.setTimeout / Window Object References

**Priority**: MEDIUM (These work in React Native, but use window prefix)
**React Native Alternative**: Global `setTimeout` (no window prefix needed)

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/components/PlinkoBoard/Peg.tsx` | 79 | `window.setTimeout()` | Peg flash animation |

#### Details
```typescript
activeTimeoutRef.current = window.setTimeout(() => {
  setIsFlashing(false);
  activeTimeoutRef.current = null;
}, 300);
```

**Purpose**: Timing for peg flash animations when ball hits.

**Migration Strategy**:
- Remove `window.` prefix, use global `setTimeout` (works on both platforms)
- No adapter needed - this is a simple code cleanup
- Same applies to `clearTimeout`, `setInterval`, `clearInterval`

**Note**: 13 files use `setTimeout`/`setInterval`, but most don't use `window.` prefix. Only this one instance needs cleanup.

---

### 2.4 Window.location (URL Query Parameters)

**Priority**: HIGH
**React Native Alternative**: Deep linking or app state management

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/hooks/usePlinkoGame.ts` | 94 | `window.location.search` | Read `?seed=` parameter |

#### Details
```typescript
const urlParams = new URLSearchParams(window.location.search);
const urlSeed = urlParams.get('seed');
const parsedUrlSeed = urlSeed ? parseInt(urlSeed, 10) : null;
```

**Purpose**: Development/testing feature - allows setting deterministic seed via URL query parameter.

**Migration Strategy**:
- Create platform adapter: `src/platform/navigation.ts`
- Web: Use `window.location.search`
- React Native: Use React Navigation's route params or deep linking
- Consider making this a dev-only feature for web platform

**Impact**: Low - only used for development/testing, not required for production gameplay.

---

### 2.5 Window.ontouchstart (Touch Detection)

**Priority**: HIGH
**React Native Alternative**: React Native gesture detection is built-in

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/utils/deviceDetection.ts` | 15 | `'ontouchstart' in window` | Touch capability detection |
| `/src/App.tsx` | 65 | `'ontouchstart' in window` | Mobile device check |

#### Details
```typescript
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

**Purpose**: Detect if device supports touch input (part of mobile detection logic).

**Migration Strategy**:
- Include in `src/platform/deviceInfo.ts` adapter
- Web: Use `'ontouchstart' in window` check
- React Native: Always return `true` (all RN devices support touch)
- Combine with userAgent checking from navigator API

---

### 2.6 Window Type Check (SSR Safety)

**Priority**: MEDIUM
**React Native Alternative**: Not needed (RN doesn't have SSR concerns)

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/hooks/usePlinkoGame.ts` | 90 | `typeof window === 'undefined'` | SSR safety check |

#### Details
```typescript
if (typeof window === 'undefined') {
  return null;
}
```

**Purpose**: Prevents errors during server-side rendering (SSR) on web.

**Migration Strategy**:
- Can be removed for React Native builds
- Keep for web builds if SSR is needed
- Consider build-time flag or environment check

---

## 3. NAVIGATOR API

### Usage: User Agent Detection & Device Capabilities

**Priority**: HIGH
**React Native Alternative**: `Platform` API and device info libraries

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/utils/deviceDetection.ts` | 11, 15 | `navigator.userAgent`, `navigator.maxTouchPoints` | Mobile detection |
| `/src/App.tsx` | 61, 65 | `navigator.userAgent`, `navigator.maxTouchPoints` | Device type checking |

#### Details
```typescript
// User agent checking
const userAgent = navigator.userAgent.toLowerCase();
const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

// Touch points checking
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

**Purpose**:
- Detect mobile vs desktop device
- Check touch capability
- Mobile device type identification

**Migration Strategy**:
- Create platform adapter: `src/platform/deviceInfo.ts`
- Web: Use `navigator.userAgent` and `navigator.maxTouchPoints`
- React Native: Use `Platform.OS` and `Platform.isPad`
- No need for user agent regex in React Native (use Platform.OS directly)

---

## 4. DOCUMENT API

### 4.1 Document Query Selector (App Mount Point)

**Priority**: CRITICAL (Web only)
**React Native Alternative**: Not applicable (RN uses AppRegistry)

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/main.tsx` | 12 | `document.getElementById('root')` | React root mounting |

#### Details
```typescript
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
createRoot(rootElement).render(...)
```

**Purpose**: Web application entry point - mounts React to DOM.

**Migration Strategy**:
- This file is web-only, no migration needed
- React Native will have separate entry point using `AppRegistry.registerComponent()`
- Keep as-is for web, create parallel `index.native.tsx` for React Native

---

### 4.2 Document Event Listeners

**Priority**: MEDIUM (Dev tools only)
**React Native Alternative**: React Native gesture/touch handling

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/dev-tools/components/DevToolsMenu.tsx` | 65-66 | `document.addEventListener('mousedown', ...)` | Click-outside detection |

#### Details
```typescript
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
```

**Purpose**: Close dev tools menu when clicking outside (dev-only feature).

**Migration Strategy**:
- This is in dev-tools folder (development only)
- For web: Keep as-is
- For React Native: Use `TouchableWithoutFeedback` or `Modal` with dismiss handlers
- Low priority - dev tools may be web-only feature

---

## 5. PERFORMANCE API

### Usage: Performance Timing in Web Worker

**Priority**: MEDIUM (Telemetry/debugging)
**React Native Alternative**: `Date.now()` or `performance.now()` polyfill

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/workers/trajectory.worker.ts` | 38, 47, 66, 86 | `performance.now()` | Trajectory calculation timing |

#### Details
```typescript
const startTime = performance.now();
// ... trajectory calculation ...
const duration = performance.now() - startTime;
```

**Purpose**: Measure trajectory generation performance for telemetry.

**Migration Strategy**:
- Create platform adapter: `src/platform/performance.ts`
- Web: Use `performance.now()`
- React Native: Use `Date.now()` or install `react-native-performance` polyfill
- Note: Web Workers don't exist in React Native (will need alternative threading strategy)

**Important**: Web Workers themselves are not available in React Native. Trajectory calculations may need to:
- Run on JS thread (simpler, may cause frame drops)
- Use `react-native-reanimated` worklets
- Use native modules for heavy computation

---

## 6. REQUEST ANIMATION FRAME

### Usage: Ball Animation Loop

**Priority**: CRITICAL
**React Native Alternative**: React Native Animated API or Reanimated

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/hooks/usePlinkoGame.ts` | 282, 286 | `requestAnimationFrame(animate)` | Ball position updates |

#### Details
```typescript
const animate = () => {
  const currentPosition = gameState.context.trajectory[currentFrameIndex];
  setBallPosition(currentPosition!);
  setCurrentTrajectoryIndex(currentFrameIndex);

  if (currentFrameIndex < gameState.context.trajectory.length - 1) {
    animationFrameRef.current = requestAnimationFrame(animate);
  }
};
animationFrameRef.current = requestAnimationFrame(animate);
```

**Purpose**: Smooth 60 FPS ball animation along calculated trajectory.

**Migration Strategy**:
- Create platform adapter: `src/platform/animation.ts`
- Web: Use `requestAnimationFrame()`
- React Native: Use `Animated` API with timing or spring animations
- **Better approach**: Refactor to use `framer-motion` (web) / `moti` (React Native) as planned
  - Both libraries handle RAF abstraction internally
  - More declarative animation API
  - Better performance

**Impact**: HIGH - This is the core ball animation system. Will require significant refactoring for React Native.

---

## 7. LOCAL STORAGE

### Usage: Theme Persistence

**Priority**: HIGH
**React Native Alternative**: `AsyncStorage` or `expo-secure-store`

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/theme/ThemeContext.tsx` | 38, 46 | `localStorage.setItem()`, `localStorage.getItem()` | Theme preference storage |

#### Details
```typescript
// Save theme
localStorage.setItem('plinko-theme', themeName);

// Load theme
const savedThemeName = localStorage.getItem('plinko-theme');
```

**Purpose**: Persist user's theme preference across sessions.

**Migration Strategy**:
- Create platform adapter: `src/platform/storage.ts`
- Web: Use `localStorage` (synchronous)
- React Native: Use `AsyncStorage` (asynchronous)
- Need to handle async/await in React Native version
- Consider using `react-native-mmkv` for better performance

**Note**: API change from synchronous to asynchronous will require updating ThemeContext logic.

---

## 8. OTHER WEB APIS

### 8.1 URLSearchParams

**Priority**: HIGH (coupled with window.location)
**React Native Alternative**: Manual query string parsing or URL polyfill

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/hooks/usePlinkoGame.ts` | 94 | `new URLSearchParams(window.location.search)` | Parse URL query params |

#### Details
```typescript
const urlParams = new URLSearchParams(window.location.search);
const urlSeed = urlParams.get('seed');
```

**Purpose**: Parse `?seed=` query parameter for development/testing.

**Migration Strategy**:
- Include in `src/platform/navigation.ts` adapter
- Web: Use native `URLSearchParams`
- React Native: Use `url-parse` library or manual parsing
- Consider making this web-only feature (dev/test only)

---

### 8.2 Web Workers (Worker API)

**Priority**: CRITICAL (Performance-sensitive)
**React Native Alternative**: Reanimated worklets or native modules

#### Occurrences

| File | Line | Usage | Context |
|------|------|-------|---------|
| `/src/hooks/useTrajectoryWorker.ts` | 39 | `new Worker(new URL(...), { type: 'module' })` | Create trajectory worker |

#### Details
```typescript
const worker = new Worker(
  new URL('../workers/trajectory.worker.ts', import.meta.url),
  { type: 'module' }
);
```

**Purpose**: Offload trajectory calculation to background thread to prevent UI blocking.

**Migration Strategy**:
- Create platform adapter: `src/platform/threading.ts`
- Web: Use Web Workers
- React Native: Options include:
  1. `react-native-reanimated` worklets (GPU-accelerated)
  2. `react-native-workers` (JS threads)
  3. Native modules (Turbo Modules)
  4. Run on main thread with `InteractionManager` scheduling
- **Recommendation**: Use Reanimated worklets for physics calculations

**Impact**: HIGH - Critical for performance. Trajectory calculations are computationally expensive.

---

## Summary of Required Platform Adapters

### Critical Priority (Core Functionality)

1. **`src/platform/crypto.ts`**
   - Web: `crypto.getRandomValues()`
   - React Native: `expo-crypto` or `react-native-get-random-values`
   - Used by: `src/game/rng.ts`

2. **`src/platform/dimensions.ts`**
   - Web: `window.innerWidth`, `window.addEventListener('resize')`
   - React Native: `Dimensions.get('window')`, `Dimensions.addEventListener('change')`
   - Used by: `src/utils/deviceDetection.ts`, `src/App.tsx`

3. **`src/platform/animation.ts`**
   - Web: `requestAnimationFrame()`
   - React Native: `Animated` API or Reanimated
   - Used by: `src/hooks/usePlinkoGame.ts`

4. **`src/platform/threading.ts`**
   - Web: Web Workers
   - React Native: Reanimated worklets or native modules
   - Used by: `src/hooks/useTrajectoryWorker.ts`

### High Priority (Feature Parity)

5. **`src/platform/deviceInfo.ts`**
   - Web: `navigator.userAgent`, `navigator.maxTouchPoints`, `'ontouchstart' in window`
   - React Native: `Platform.OS`, `Platform.isPad`, built-in touch support
   - Used by: `src/utils/deviceDetection.ts`, `src/App.tsx`

6. **`src/platform/storage.ts`**
   - Web: `localStorage` (synchronous)
   - React Native: `AsyncStorage` or `@react-native-async-storage/async-storage` (asynchronous)
   - Used by: `src/theme/ThemeContext.tsx`

7. **`src/platform/navigation.ts`**
   - Web: `window.location.search`, `URLSearchParams`
   - React Native: React Navigation params or deep linking
   - Used by: `src/hooks/usePlinkoGame.ts`

### Medium Priority (Dev Tools / Telemetry)

8. **`src/platform/performance.ts`**
   - Web: `performance.now()`
   - React Native: `Date.now()` or polyfill
   - Used by: `src/workers/trajectory.worker.ts`

---

## Files Requiring Updates

### Production Code (12 files)

1. `/src/game/rng.ts` - Crypto API
2. `/src/utils/deviceDetection.ts` - Window, navigator APIs
3. `/src/App.tsx` - Window, navigator APIs
4. `/src/hooks/usePlinkoGame.ts` - Window, RAF, URL APIs
5. `/src/hooks/useTrajectoryWorker.ts` - Worker API
6. `/src/workers/trajectory.worker.ts` - Performance API, Worker context
7. `/src/theme/ThemeContext.tsx` - localStorage
8. `/src/components/PlinkoBoard/Peg.tsx` - window.setTimeout (cleanup)
9. `/src/dev-tools/components/DevToolsMenu.tsx` - Document API (dev only)
10. `/src/main.tsx` - Document API (web entry point, keep as-is)

### Test Files (Excluded from migration, web-only)

All files in `/src/tests/` use web APIs extensively for mocking and testing. These will remain web-only.

---

## Recommended Migration Order

### Phase 1: Foundation (Week 1)
1. Create platform adapter structure (`src/platform/`)
2. Implement `crypto.ts` adapter (simplest, single usage point)
3. Implement `dimensions.ts` adapter
4. Implement `deviceInfo.ts` adapter

### Phase 2: Core Features (Week 2)
5. Implement `storage.ts` adapter (handle async conversion)
6. Implement `navigation.ts` adapter (consider making web-only)
7. Update `src/utils/deviceDetection.ts` to use adapters
8. Update `src/App.tsx` to use adapters
9. Update `src/theme/ThemeContext.tsx` to use adapters

### Phase 3: Animation System (Week 3-4)
10. Implement `animation.ts` adapter or refactor to Moti/Reanimated
11. Update `src/hooks/usePlinkoGame.ts` animation loop
12. Implement `threading.ts` adapter (Web Workers → Worklets)
13. Update `src/hooks/useTrajectoryWorker.ts`
14. Performance testing and optimization

### Phase 4: Polish (Week 5)
15. Implement `performance.ts` adapter (telemetry)
16. Clean up `window.setTimeout` usage
17. Handle dev tools (web-only or React Native alternative)
18. Cross-platform testing and bug fixes

---

## Testing Strategy

### Adapter Testing
- Each platform adapter needs unit tests for both platforms
- Mock platform-specific APIs in tests
- Test error handling and fallbacks

### Integration Testing
- Test adapted features on both web and React Native
- Verify feature parity between platforms
- Performance benchmarks for critical paths (trajectory calculation, animation)

### E2E Testing
- Playwright for web (existing)
- Detox or Maestro for React Native
- Ensure gameplay feels identical on both platforms

---

## Risk Assessment

### High Risk Areas

1. **Animation System (requestAnimationFrame)**
   - Complex refactor required
   - Performance-critical
   - May require architecture changes
   - **Mitigation**: Use battle-tested animation libraries (Moti/Reanimated)

2. **Web Workers (Threading)**
   - No direct React Native equivalent
   - Critical for performance
   - May require native code
   - **Mitigation**: Use Reanimated worklets for physics calculations

3. **localStorage → AsyncStorage**
   - API change from sync to async
   - Affects app initialization flow
   - **Mitigation**: Use async/await patterns, handle loading states

### Medium Risk Areas

4. **Device Detection Logic**
   - Different capabilities between platforms
   - May need platform-specific UI adjustments
   - **Mitigation**: Comprehensive testing on various devices

5. **URL Parameter Handling**
   - Web-centric feature
   - May not translate to mobile UX
   - **Mitigation**: Consider making web-only or redesigning for mobile

### Low Risk Areas

6. **Crypto API**
   - Well-established React Native solutions
   - Single usage point
   - **Mitigation**: Use expo-crypto for easy implementation

7. **Performance Timing**
   - Non-critical telemetry feature
   - Multiple fallback options
   - **Mitigation**: Use Date.now() fallback if needed

---

## Additional Considerations

### Build System
- Need conditional imports based on platform
- Consider `.web.ts` and `.native.ts` file extensions
- Update Vite/Metro bundler configs

### Type Safety
- Platform adapters should have identical TypeScript interfaces
- Use conditional types if platform-specific features needed
- Maintain type safety across both platforms

### Development Experience
- Hot reload must work on both platforms
- Dev tools may need platform-specific implementations
- Consider React Native Debugger for React Native development

### Performance Monitoring
- Replace `performance.now()` telemetry with platform-appropriate solution
- Consider adding React Native-specific performance monitoring (e.g., Flipper)

---

## Conclusion

The audit identified **73 total API usage occurrences** across the codebase, with **12 production files** requiring updates. The most critical areas are:

1. Animation system (requestAnimationFrame)
2. Web Workers for physics calculations
3. Crypto API for random number generation
4. Window/Navigator APIs for device detection

Estimated effort: **4-5 weeks** for complete platform abstraction, with animation system and threading being the most time-intensive tasks.

Next steps:
1. Review and approve migration strategy
2. Set up platform adapter structure
3. Begin Phase 1 implementation
4. Establish cross-platform testing pipeline
