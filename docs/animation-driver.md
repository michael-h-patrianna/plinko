# Animation Driver Abstraction Layer

## Overview

The animation driver abstraction provides a cross-platform animation system for the Plinko application, enabling seamless support for both web (Framer Motion) and future React Native (Moti/Reanimated) implementations.

## Architecture

### Directory Structure

```
src/theme/animationDrivers/
├── index.ts                    # Public API exports
├── types.ts                    # TypeScript interfaces and types
├── framer.ts                   # Framer Motion implementation (web)
├── moti.tsx                    # Moti implementation (React Native placeholder)
└── useAnimationDriver.ts       # Platform-aware hook
```

### Core Components

#### 1. AnimationDriver Interface

The `AnimationDriver` interface defines the contract that all platform-specific drivers must implement:

```typescript
interface AnimationDriver {
  readonly name: 'framer' | 'moti';
  readonly platform: 'web' | 'native';

  createAnimatedComponent<T>(component: T): any;
  AnimatePresence: React.ComponentType;
  isSupported(): boolean;
  getSpringConfig(preset: 'gentle' | 'wobbly' | 'stiff' | 'slow'): SpringConfig;
  getTransitionConfig(preset: 'fast' | 'medium' | 'slow' | 'spring'): TransitionConfig;
}
```

#### 2. Cross-Platform Animation Constraints

**CRITICAL**: Only use animations that work on both web and React Native:

✅ **ALLOWED**:
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity: `opacity` (0-1)
- Colors: `backgroundColor`, `color` (hex, rgb, rgba)
- Linear gradients only
- Layout animations (position, size)

❌ **FORBIDDEN** (web-only features):
- Blur animations or CSS filters
- Radial/conic gradients (linear only!)
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (:before, :after)
- Complex CSS selectors

#### 3. Spring Physics Presets

Optimized for 60 FPS performance:

```typescript
SPRING_PRESETS = {
  gentle:  { stiffness: 120, damping: 14, mass: 0.8 },
  wobbly:  { stiffness: 180, damping: 12, mass: 1   },
  stiff:   { stiffness: 300, damping: 20, mass: 0.6 },
  slow:    { stiffness: 80,  damping: 20, mass: 1.2 },
}
```

#### 4. Transition Presets

GPU-accelerated timing configurations:

```typescript
TRANSITION_PRESETS = {
  fast:   { duration: 0.2, ease: [0.4, 0, 0.2, 1] },     // Smooth deceleration
  medium: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },   // Smooth ease-out
  slow:   { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  spring: { type: 'spring', spring: SPRING_PRESETS.gentle },
}
```

## Usage

### Basic Usage

```typescript
import { useAnimationDriver } from '../theme/animationDrivers';

function MyComponent() {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  return (
    <AnimatedDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={driver.getTransitionConfig('medium')}
    >
      Hello World
    </AnimatedDiv>
  );
}
```

### Advanced: Spring Physics

```typescript
function SpringExample() {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        ...driver.getSpringConfig('wobbly'),
      }}
    >
      Bouncy Box
    </AnimatedDiv>
  );
}
```

### Mount/Unmount Animations

```typescript
function FadeInOut() {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const { AnimatePresence } = driver;

  return (
    <AnimatePresence>
      {isVisible && (
        <AnimatedDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Content
        </AnimatedDiv>
      )}
    </AnimatePresence>
  );
}
```

## Platform-Specific Implementation

### Web (Framer Motion)

The Framer Motion driver (`framer.ts`) provides:
- GPU-accelerated transforms via Framer Motion
- SSR safety checks
- Reduced motion support
- Hardware acceleration detection

```typescript
import { framerDriver } from './theme/animationDrivers';

// Check environment
const env = framerDriver.getEnvironment();
console.log(env.hasGPUAcceleration); // true/false
console.log(env.prefersReducedMotion); // true/false
```

### React Native (Moti - Placeholder)

The Moti driver (`moti.tsx`) is currently a placeholder that will be implemented when the React Native port begins:

**Installation (future)**:
```bash
npm install moti react-native-reanimated
npx pod-install  # iOS only
```

**Configuration (future)**:
Add to `babel.config.js`:
```javascript
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

**Implementation Notes**:
- All animations run on native thread (no JS bridge overhead)
- Spring physics handled by native code for 60 FPS
- Same API as web for developer convenience
- Automatic driver selection via `useAnimationDriver()`

## Performance Optimization

### GPU Acceleration

All animations use GPU-accelerated properties:

```typescript
// ✅ GPU-accelerated
animate={{
  x: 100,      // translateX
  y: 50,       // translateY
  scale: 1.2,
  rotate: 45,
  opacity: 0.8
}}

// ❌ NOT GPU-accelerated (avoid)
animate={{
  left: '100px',
  top: '50px',
  width: '200px',
  height: '200px'
}}
```

### Frame Budget Management

Target: **60 FPS = 16.67ms per frame**

- Spring physics: ~2-4ms
- Transform animations: ~0.5-1ms
- Opacity animations: ~0.2-0.5ms
- Total animation budget: <8ms (leaves 8ms for rendering)

### Avoiding Jank

1. **Batch animations**: Use single `animate` object for multiple properties
2. **Avoid layout triggers**: Use transforms instead of position/size changes
3. **Memoize expensive calculations**: Use `useMemo` for particle positions
4. **Throttle updates**: Limit animation updates to 60 FPS max

```typescript
// ✅ GOOD: Single batched animation
animate={{ x: 100, y: 50, scale: 1.2 }}

// ❌ BAD: Multiple separate animations
animate={{ x: 100 }}
animate={{ y: 50 }}
animate={{ scale: 1.2 }}
```

## Cross-Platform Migration Fixes

### Radial Gradients → Linear Gradients

**Before (web-only)**:
```typescript
background: `radial-gradient(circle, ${color}ff 0%, transparent 100%)`
```

**After (cross-platform)**:
```typescript
background: `linear-gradient(180deg, ${color}ff 0%, transparent 100%)`
```

### Box Shadows → Remove or Simulate

**Before (web-only)**:
```typescript
boxShadow: `0 0 25px ${color}`
```

**After (cross-platform)**:
```typescript
// Option 1: Remove (preferred)
// No boxShadow property

// Option 2: Simulate with colored border
border: `2px solid ${hexToRgba(color, 0.3)}`

// Option 3: Add subtle glow with overlay div
<div style={{
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(180deg, ${color}33, transparent)`
}} />
```

### Blur Filters → Remove

**Before (web-only)**:
```typescript
filter: 'blur(20px)'
```

**After (cross-platform)**:
```typescript
// Remove blur entirely - not available in React Native
// Use opacity and gradients for visual separation instead
```

## Testing

### Unit Tests

Test file: `src/tests/animationDriver.test.ts`

Coverage:
- ✅ Driver selection logic
- ✅ Spring preset configurations
- ✅ Transition preset configurations
- ✅ Cross-platform consistency
- ✅ SSR safety
- ✅ Environment detection

### Manual QA Checklist

- [ ] All animations run at 60 FPS
- [ ] No visual jank or stuttering
- [ ] Smooth spring physics behavior
- [ ] Mount/unmount animations work correctly
- [ ] SSR renders without errors
- [ ] Reduced motion preference respected

## Common Patterns

### Pattern 1: Stagger Children

```typescript
const driver = useAnimationDriver();
const AnimatedDiv = driver.createAnimatedComponent('div');

<AnimatedDiv
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  }}
>
  {items.map(item => <ChildComponent key={item.id} />)}
</AnimatedDiv>
```

### Pattern 2: Gesture Interactions

```typescript
<AnimatedDiv
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={driver.getTransitionConfig('fast')}
>
  Button
</AnimatedDiv>
```

### Pattern 3: Keyframe Animations

```typescript
<AnimatedDiv
  animate={{
    y: [0, -20, 0],      // Bounce
    opacity: [0, 1, 1],  // Fade in
  }}
  transition={{
    duration: 0.6,
    times: [0, 0.5, 1],  // Control timing of keyframes
  }}
/>
```

## Troubleshooting

### Issue: Animations not working

**Solution**: Check that `useAnimationDriver()` is called inside component:

```typescript
// ❌ WRONG: Called outside component
const driver = useAnimationDriver();

export function MyComponent() {
  // ...
}

// ✅ CORRECT: Called inside component
export function MyComponent() {
  const driver = useAnimationDriver();
  // ...
}
```

### Issue: SSR errors

**Solution**: Driver automatically handles SSR. If errors persist, wrap in `isSupported()` check:

```typescript
const driver = useAnimationDriver();

if (!driver.isSupported()) {
  return <div>Static content</div>;
}
```

### Issue: Poor performance

**Solution**:
1. Profile with React DevTools Profiler
2. Check animations use GPU-accelerated properties only
3. Reduce particle count or complexity
4. Use `will-change: transform` CSS hint (web only)

## Future React Native Port

When porting to React Native:

1. **Install dependencies**:
   ```bash
   npm install moti react-native-reanimated react-native-linear-gradient
   ```

2. **Update `moti.tsx`**:
   - Uncomment Moti imports
   - Implement `createAnimatedComponent` with proper mappings
   - Test on iOS and Android

3. **Test all animations**:
   - Verify 60 FPS on real devices
   - Check spring physics feel natural
   - Ensure gradients render correctly

4. **No code changes needed**:
   - `useAnimationDriver()` automatically selects Moti
   - All components already use cross-platform safe animations
   - Spring configs identical between platforms

## API Reference

### `useAnimationDriver(type?: AnimationDriverType)`

Returns the appropriate animation driver for the current platform.

**Parameters**:
- `type` (optional): `'auto'` | `'framer'` | `'moti'` (default: `'auto'`)

**Returns**: `AnimationDriver` instance

**Example**:
```typescript
const driver = useAnimationDriver();
const driver2 = useAnimationDriver('framer'); // Force Framer
```

### `getAnimationDriver(type?: AnimationDriverType)`

Non-hook version for use outside React components.

### `SPRING_PRESETS`

Pre-configured spring physics for common animation types.

### `TRANSITION_PRESETS`

Pre-configured transition timings for common animation durations.

## Contributing

When adding new animations:

1. **Check cross-platform compatibility**: Use only allowed animation properties
2. **Use driver hook**: Always get animated components from `useAnimationDriver()`
3. **Choose appropriate preset**: Use spring presets for natural motion
4. **Test performance**: Verify 60 FPS with DevTools
5. **Document usage**: Add examples to this file

## Related Documentation

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Moti Docs](https://moti.fyi/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
