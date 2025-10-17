# Platform Adapters

Cross-platform abstraction layer for web and React Native compatibility.

## Overview

This directory contains platform adapters that abstract browser-specific APIs, making the codebase compatible with both web and React Native platforms. All adapters follow a consistent pattern:

- **types.ts** - TypeScript interfaces defining the adapter contract
- **index.web.ts** - Web implementation using browser APIs
- **index.native.ts** - React Native placeholder/implementation guide
- **index.ts** - Platform selector (build tools auto-resolve to correct version)

## Available Adapters

### 1. Crypto Adapter
**Purpose**: Cryptographically secure random number generation

```typescript
import { cryptoAdapter } from '@/utils/platform';

const seed = cryptoAdapter.generateSecureRandomSeed();
```

- **Web**: Uses `crypto.getRandomValues()`
- **React Native**: Uses `expo-crypto` or `react-native-get-random-values`

### 2. Dimensions Adapter
**Purpose**: Viewport/window dimensions and resize events

```typescript
import { dimensionsAdapter } from '@/utils/platform';

const width = dimensionsAdapter.getWidth();
const cleanup = dimensionsAdapter.addChangeListener((dims) => {
  console.log('New dimensions:', dims);
});
```

- **Web**: Uses `window.innerWidth/innerHeight` and resize events
- **React Native**: Uses `Dimensions` API

### 3. Device Info Adapter
**Purpose**: Device type detection and capabilities

```typescript
import { deviceInfoAdapter } from '@/utils/platform';

const isMobile = deviceInfoAdapter.isMobileDevice();
const deviceInfo = deviceInfoAdapter.getDeviceInfo();
```

- **Web**: Uses `navigator.userAgent` and `navigator.maxTouchPoints`
- **React Native**: Uses `Platform` API

### 4. Storage Adapter
**Purpose**: Persistent key-value storage

```typescript
import { storageAdapter } from '@/utils/platform';

await storageAdapter.setItem('key', 'value');
const value = await storageAdapter.getItem('key');
```

- **Web**: Uses `localStorage` (wrapped in async API for consistency)
- **React Native**: Uses `AsyncStorage`

**Note**: All methods are async to maintain API consistency across platforms.

### 5. Animation Adapter
**Purpose**: Request animation frame abstraction

```typescript
import { animationAdapter } from '@/utils/platform';

const frameId = animationAdapter.requestFrame((timestamp) => {
  // Animation logic
});
animationAdapter.cancelFrame(frameId);
```

- **Web**: Uses `requestAnimationFrame()`
- **React Native**: Uses global `requestAnimationFrame` (consider Moti/Reanimated for production)

### 6. Threading Adapter
**Purpose**: Background thread execution

```typescript
import { threadingAdapter } from '@/utils/platform';

const worker = threadingAdapter.createWorker(workerUrl);
worker.postMessage({ type: 'calculate', payload: data });
worker.onMessage((event) => console.log(event.data));
```

- **Web**: Uses Web Workers
- **React Native**: Requires Reanimated worklets or react-native-workers

### 7. Navigation Adapter
**Purpose**: URL/route parameter handling

```typescript
import { navigationAdapter } from '@/utils/platform';

const seed = navigationAdapter.getParam('seed');
const allParams = navigationAdapter.getAllParams();
```

- **Web**: Uses `URLSearchParams` and `window.location.search`
- **React Native**: Uses React Navigation route params

### 8. Performance Adapter
**Purpose**: High-resolution timing for performance monitoring

```typescript
import { performanceAdapter } from '@/utils/platform';

performanceAdapter.mark('start');
// ... do work ...
const duration = performanceAdapter.measure('work', 'start');
```

- **Web**: Uses Performance API (`performance.now()`, `performance.mark()`)
- **React Native**: Uses `Date.now()` with custom mark/measure implementation

## Platform Detection

```typescript
import { PLATFORM, isWeb, isNative } from '@/utils/platform';

if (isWeb) {
  // Web-specific code
}

if (isNative) {
  // React Native-specific code
}
```

## Build Configuration

### Vite (Web)
Vite automatically resolves `.web.ts` files when they exist alongside `.ts` files.

### Metro (React Native)
Configure Metro to resolve `.native.ts` files:

```js
// metro.config.js
module.exports = {
  resolver: {
    sourceExts: ['native.ts', 'ts', 'tsx', 'js', 'jsx'],
  },
};
```

## Implementation Status

### Web (Production Ready)
✅ All adapters fully implemented and tested

### React Native (Placeholder + Implementation Guide)
⚠️ All adapters include:
- TypeScript interfaces (production-ready)
- Placeholder implementations that throw helpful errors
- Detailed implementation guides in comments
- Recommended libraries and approaches

**To implement for React Native**:
1. Install required dependencies (listed in each adapter's `.native.ts` file)
2. Replace placeholder implementations following the guides
3. Test on both iOS and Android

## Cross-Platform Constraints

As per [CIB-001.5], this codebase enforces cross-platform compatibility:

**✅ ALLOWED**:
- Transforms (translate, scale, rotate)
- Opacity animations
- Linear gradients only
- Color transitions

**❌ FORBIDDEN**:
- Blur effects
- Radial/conic gradients
- Box/text shadows
- CSS filters

## Testing

Each adapter should have:
- Unit tests for web implementation
- Unit tests for React Native implementation (when implemented)
- Integration tests verifying platform-specific behavior

## Usage Examples

### Replacing Direct Browser API Calls

**Before** (web-only):
```typescript
const seed = crypto.getRandomValues(new Uint32Array(1))[0];
```

**After** (cross-platform):
```typescript
import { cryptoAdapter } from '@/utils/platform';
const seed = cryptoAdapter.generateSecureRandomSeed();
```

### Handling Async Storage

**Before** (web-only):
```typescript
const theme = localStorage.getItem('theme');
```

**After** (cross-platform):
```typescript
import { storageAdapter } from '@/utils/platform';
const theme = await storageAdapter.getItem('theme');
```

## Contributing

When adding new platform-specific features:

1. Create adapter in `src/utils/platform/[feature]/`
2. Define TypeScript interfaces in `types.ts`
3. Implement web version in `index.web.ts`
4. Create React Native guide in `index.native.ts`
5. Export from `index.ts`
6. Add to main `src/utils/platform/index.ts`
7. Document in this README
8. Add tests

## Migration Guide

See `/docs/platform-api-audit.md` for:
- Full API audit results
- Migration strategy
- Risk assessment
- Implementation timeline
