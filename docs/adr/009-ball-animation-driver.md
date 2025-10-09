# ADR 009: Ball Animation Driver with Imperative DOM Updates

## Status

Accepted

## Context

The Plinko game requires smooth 60 FPS ball drop animations as balls traverse the board following physics trajectories. However, React's declarative rendering model created a significant performance bottleneck:

### The Problem

- Ball position updates occur 60 times per second (once per frame)
- Each position update triggered React's reconciliation process
- React component tree re-rendering caused excessive CPU usage (40-60%)
- Frame drops and stuttering occurred during ball animation
- Profiling revealed React reconciliation as the primary bottleneck
- Initial optimization attempt using `useSyncExternalStore` was insufficient

### Performance Requirements

- Maintain consistent 60 FPS (16.67ms frame budget)
- Support multiple simultaneous ball animations
- Zero visible jank or stuttering
- Minimal CPU overhead to preserve battery life
- Keep React in control of component lifecycle

### Technical Constraints

- Physics engine generates position data at 60 Hz
- Ball trail effects require historical position data
- Must support both web (current) and React Native (future)
- Need to maintain React's declarative advantages for non-animation logic

## Decision

We implemented an imperative DOM manipulation system for ball animation that bypasses React's reconciliation for position updates while keeping React in control of component lifecycle.

### Core Architecture

**BallAnimationDriver**: A custom hook (`useBallAnimationDriver`) that:
- Uses refs to directly manipulate DOM transform properties
- Leverages `requestAnimationFrame` for smooth 60 FPS updates
- Maintains a fixed pool of trail elements to avoid allocations
- Provides getter pattern for ref access after first render
- Keeps React state only for visibility and mounting logic

**OptimizedBallRenderer**: A React component that:
- Renders ball and trail elements with refs attached
- Delegates position updates to the animation driver
- Uses React for mounting, unmounting, and visibility state
- Maintains declarative structure for everything except position

### Key Implementation Details

```typescript
// Imperative updates bypass React reconciliation
const updateBallPosition = (x: number, y: number) => {
  const element = getBallRef();
  if (element) {
    element.style.transform = `translate(${x}px, ${y}px)`;
  }
};

// React controls mounting and visibility
return isVisible && <div ref={ballRef} className="ball" />;
```

## Consequences

### Positive

- **40-60% CPU reduction**: Dropped from 40-60% to 15-25% during ball animation
- **Consistent 60 FPS**: Eliminated frame drops and stuttering
- **No main thread blocking**: Updates complete well within 16.67ms frame budget
- **Zero per-frame allocations**: Fixed pool recycling eliminates GC pressure
- **React lifecycle control**: React still manages mounting, unmounting, and visibility
- **Scalability**: Pattern supports multiple simultaneous ball animations
- **Deterministic behavior**: Imperative updates are synchronous and predictable

### Negative

- **Increased complexity**: Developers must understand both imperative and declarative paradigms
- **Harder to debug**: DOM updates happen outside React DevTools visibility
- **Platform coupling**: Direct DOM manipulation requires adaptation layer for React Native
- **Learning curve**: Team needs training on when to use imperative vs declarative patterns
- **Maintenance overhead**: Two mental models in the same component
- **Testing challenges**: Need to test both React lifecycle and imperative updates

### Neutral

- **Pattern established**: Sets precedent for other high-frequency animations (peg hits, slot anticipation)
- **Documentation required**: Need comprehensive docs for maintenance and onboarding
- **Abstraction boundary**: Clear separation between React-managed and driver-managed concerns
- **Future migration path**: Abstraction layer ready for React Native (Moti/Reanimated)

## Alternatives Considered

### 1. useSyncExternalStore (Attempted)

**Approach**: Use React 18's `useSyncExternalStore` to subscribe to physics state

**Why Rejected**:
- Still triggered React reconciliation on every position update
- Performance improvement was marginal (~10-15% vs 40-60% needed)
- Added complexity without solving core problem
- State updates still flowed through React's rendering pipeline

### 2. CSS Animations

**Approach**: Pre-calculate trajectory and use CSS keyframe animations

**Why Rejected**:
- Cannot dynamically follow physics-generated trajectories
- No way to handle user interactions mid-flight
- Loses deterministic physics simulation
- Inflexible for gameplay variations (different peg layouts, wind effects, etc.)

### 3. Web Workers

**Approach**: Offload animation calculations to Web Worker threads

**Why Rejected**:
- Doesn't solve React reconciliation bottleneck
- Adds message-passing overhead between threads
- Physics engine already fast enough (not the bottleneck)
- Increased complexity without addressing root cause
- Makes debugging significantly harder

### 4. Third-Party Animation Libraries

**Approach**: Use libraries like GSAP, Anime.js, or React Spring

**Why Rejected**:
- Most rely on React state updates (same bottleneck)
- GSAP/Anime.js require manual DOM management (similar to our solution)
- Poor integration with existing physics engine
- Added bundle size for functionality we can implement directly
- Licensing concerns for some commercial libraries

### 5. Canvas/WebGL Rendering

**Approach**: Render entire game on HTML5 Canvas or WebGL

**Why Rejected**:
- Loses React's declarative benefits for UI components
- Accessibility severely compromised
- DOM events and interactions become complex
- Would require rewriting entire game UI
- Overkill for current performance needs
- React Native migration becomes much harder

## Implementation Details

### Files Modified

- **src/animation/useBallAnimationDriver.ts**: Core animation driver hook
- **src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx**: Optimized ball component
- **src/components/game/PlinkoBoard/PlinkoBoard.tsx**: Integration point
- **src/config/appConfig.ts**: Configuration for trail length and animation settings

### Driver Architecture

```typescript
export const useBallAnimationDriver = (config: BallAnimationConfig) => {
  const ballRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Getter pattern ensures refs are accessed after render
  const getBallRef = () => ballRef.current;
  const getTrailRef = (index: number) => trailRefs.current[index];

  // Imperative update function
  const updatePosition = (x: number, y: number) => {
    const ball = getBallRef();
    if (ball) {
      ball.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  return { ballRef, trailRefs, updatePosition };
};
```

### Platform Abstraction

The driver is designed with a clear abstraction boundary for React Native:

```typescript
// Web implementation (current)
element.style.transform = `translate(${x}px, ${y}px)`;

// React Native implementation (future)
// Will use Moti or Reanimated's imperative API
```

### Trail Optimization

Trail elements use a fixed pool sized to `maxTrailLength` from design tokens:
- No runtime allocations during animation
- Elements recycled for each new trail segment
- Opacity and scale updated imperatively
- Positions update without React re-renders

## Performance Metrics

### Before Optimization

- **CPU Usage**: 40-60% during ball drop
- **Frame Rate**: 45-55 FPS with occasional drops to 30 FPS
- **Frame Time**: 18-25ms per frame (exceeding 16.67ms budget)
- **GC Pressure**: Frequent minor GC pauses from React fiber allocations

### After Optimization

- **CPU Usage**: 15-25% during ball drop
- **Frame Rate**: Consistent 60 FPS, no drops
- **Frame Time**: 8-12ms per frame (well within budget)
- **GC Pressure**: Minimal, fixed pool eliminates per-frame allocations

### Measurement Tools

- Chrome DevTools Performance profiler
- React DevTools Profiler
- `requestAnimationFrame` timing measurements
- Custom performance monitoring in `scripts/tools/`

## References

- **docs/optimize.md**: Comprehensive optimization guide with benchmarks
- **docs/performance-fixes-callback-memoization.md**: Related callback optimization patterns
- **src/animation/useBallAnimationDriver.ts**: Complete driver implementation
- **docs/TEST_MEMORY_MANAGEMENT.md**: Testing strategy for performance features

## Related Decisions

- **ADR 007**: Physics Engine Determinism - Ensures animation follows deterministic trajectories
- **ADR 008**: Trajectory Caching - Pre-computed paths reduce runtime calculations
- **ADR 006**: Design Tokens System - Provides configuration for trail length and animation parameters

## Future Considerations

### React Native Migration

When porting to React Native:
1. Create platform-specific driver implementations
2. Use Moti or Reanimated for imperative animations
3. Maintain same public API for OptimizedBallRenderer
4. Test performance on physical iOS/Android devices

### Additional Optimizations

- **Peg hit animations**: Apply similar driver pattern
- **Slot anticipation effects**: Use imperative updates for glow animations
- **Particle effects**: Consider imperative rendering for explosion/celebration effects

### Monitoring

- Add performance regression tests in Playwright
- Monitor frame rate and CPU usage in CI/CD
- Alert on performance degradation in production builds

## Decision Record

- **Date**: 2025-10-10
- **Decided by**: Development Team
- **Approved by**: Architecture Review
- **Implemented in**: Main branch
- **Status**: Shipped to production
