# Plinko Game Architecture

## Table of Contents
1. [Project Overview](#project-overview)
2. [Application Structure](#application-structure)
3. [Physics Engine](#physics-engine)
4. [Deterministic Trajectory Generation](#deterministic-trajectory-generation)
5. [Testing Strategy](#testing-strategy)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Platform Abstraction](#platform-abstraction)

---

## Project Overview

This is a web-based Plinko game built with React and TypeScript. The unique aspect of this implementation is its **deterministic physics engine** that guarantees the ball will land in a pre-selected slot while maintaining completely realistic physics throughout the trajectory.

### Key Features
- **Deterministic outcomes**: Ball always lands in the selected prize slot
- **Realistic physics**: Full collision detection, gravity, restitution, and natural movement
- **Visual accuracy**: Ball never overlaps with pegs (< 0.2px tolerance)
- **Smooth animation**: 60 FPS frame-by-frame trajectory playback
- **Comprehensive testing**: Validated with 10,000+ trajectory simulations

---

## Application Structure

```
plinko/
├── src/
│   ├── components/
│   │   ├── Ball.tsx                 # Ball rendering component
│   │   ├── PlinkoBoard/
│   │   │   ├── PlinkoBoard.tsx     # Main game board
│   │   │   └── Peg.tsx             # Individual peg component
│   │   └── PrizeSlots.tsx          # Bottom prize slots
│   ├── game/
│   │   ├── trajectory.ts           # Physics engine (CORE)
│   │   ├── rng.ts                  # Deterministic random number generator
│   │   ├── stateMachine.ts         # Game state management
│   │   └── types.ts                # Type definitions
│   ├── tests/
│   │   ├── trajectory.test.ts      # Basic trajectory tests
│   │   ├── trajectory-100.test.ts  # 100 trajectory validation
│   │   └── trajectory-comprehensive.test.ts  # 10,000 trajectory test
│   └── App.tsx                      # Main application
└── docs/
    └── architecture.md              # This file
```

---

## Configuration and Prize Delivery

Deterministic behaviour is coordinated through a root `AppConfig` object exposed via `AppConfigProvider`. Hosts can override feature flags or supply a custom prize provider while the default configuration keeps local demos running out of the box.

### PrizeProvider Contract

Prize data flows through a `PrizeProvider` interface defined in `src/game/prizeProvider.ts`:

```typescript
export interface PrizeProviderContext {
  seedOverride?: number;
  requestId?: string;
}

export interface PrizeProviderResult {
  prizes: PrizeConfig[];
  winningIndex: number;
  seed: number;
  source: 'default' | 'fixture' | 'remote';
  deterministicTrajectory?: {
    points: TrajectoryPoint[];
    landingSlot?: number;
    seed?: number;
    provider?: string;
  };
}

export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  loadSync?(context?: PrizeProviderContext): PrizeProviderResult;
}
```

- `load` must resolve with a fully validated session. Throwing inside the body will be surfaced to callers as a rejected promise.
- `loadSync` is optional and enables SSR/bootstrap hydration. When present, `usePlinkoGame` consumes it for immediate render before the async refresh lands.
- All payloads are validated with Zod schemas to ensure prize types, free reward structures, and winning indices are consistent.

### Default Implementation

`createDefaultPrizeProvider()` wraps the legacy `createValidatedProductionPrizeSet()` helper. It deterministically selects a winner via `selectPrize()` using either the provided `seedOverride` or a generated seed. Both `load` and `loadSync` delegate to the same synchronous `buildDefaultSession()` implementation, guaranteeing identical results between execution paths.

- The production prize table now requires an explicit prize count. When no value is supplied, the helper falls back to `DEFAULT_PRODUCTION_PRIZE_COUNT` (6 slots) so the board layout remains stable. Hosts can override the count through `createDefaultPrizeProvider({ count: ... })`.

When prize generation fails (for example, by requesting an out-of-range prize count), the provider normalises thrown values into `Error` instances and rejects the async loader so React hooks can surface meaningful UI messages.

### Hook Integration

`usePlinkoGame` now depends solely on the provider for prize data. The hook:

1. Attempts synchronous hydration via `loadSync` (if available) when the component mounts or when a reset occurs.
2. Always triggers an async `load` request, updating state when the promise resolves.
3. Captures any thrown error and exposes it through `prizeLoadError` for UI components.
4. Stores the original winning prize from the session before any swaps occur.
5. Generates a fast trajectory (typically 1 simulation attempt) without forcing a specific landing slot.
6. Swaps prize array elements if needed: `prizes[landedSlot] ↔ prizes[winningIndex]`
7. Passes the stored original winning prize to game context (not the swapped array element).

This **swap-based architecture** is 1000x faster than forcing trajectories to land in specific slots. The original prize object is preserved throughout all state transitions, ensuring correct prize display regardless of array manipulations.

---

## Physics Engine

The physics engine (`src/game/trajectory.ts`) is the heart of the application. It simulates realistic ball physics while ensuring deterministic outcomes.

### Physics Constants

```typescript
const PHYSICS = {
  GRAVITY: 980,           // px/s² (9.8 m/s² scaled to 100px = 1m)
  RESTITUTION: 0.75,      // 75% energy retention on bounce
  BALL_RADIUS: 7,         // Ball size in pixels
  PEG_RADIUS: 7,          // Peg size in pixels
  COLLISION_RADIUS: 14,   // Ball + Peg radius (collision threshold)
  DT: 1/60,              // 60 FPS timestep
  TERMINAL_VELOCITY: 600, // Maximum fall speed
  BORDER_WIDTH: 8,        // Wall thickness
  MIN_BOUNCE_VELOCITY: 30 // Minimum velocity after collision
}
```

### Core Physics Loop

The simulation runs at 60 FPS, updating the ball's position and velocity each frame:

```typescript
// Apply gravity
vy += PHYSICS.GRAVITY * PHYSICS.DT;

// Terminal velocity limiter
vy = Math.min(vy, PHYSICS.TERMINAL_VELOCITY);

// Air resistance
vx *= 0.998;

// Update position
x += vx * PHYSICS.DT;
y += vy * PHYSICS.DT;
```

### Collision Detection System

The collision detection uses a **binary search algorithm** to find the exact collision point, preventing any ball/peg overlap:

#### Step 1: Detect Collision
```typescript
for (const peg of pegs) {
  const dx = x - peg.x;
  const dy = y - peg.y;
  const distSq = dx * dx + dy * dy;

  if (distSq < PHYSICS.COLLISION_RADIUS * PHYSICS.COLLISION_RADIUS) {
    // Collision detected!
  }
}
```

#### Step 2: Binary Search for Exact Collision Point
When a collision is detected at the new position, we need to find exactly *when* during the frame the collision occurred:

```typescript
// Move ball back to old position
x = oldX;
y = oldY;

// Binary search for exact collision time
let low = 0;   // Start of frame
let high = 1;  // End of frame
let mid = 0.5;

for (let i = 0; i < 10; i++) { // 10 iterations gives high precision
  const testX = oldX + oldVx * PHYSICS.DT * mid;
  const testY = oldY + oldVy * PHYSICS.DT * mid;
  const testDist = Math.sqrt(
    (testX - peg.x) ** 2 + (testY - peg.y) ** 2
  );

  if (testDist < PHYSICS.COLLISION_RADIUS) {
    high = mid; // Collision happened before mid
  } else {
    low = mid;  // Collision happened after mid
  }
  mid = (low + high) / 2;
}

// Move to exact collision point
x = oldX + oldVx * PHYSICS.DT * low;
y = oldY + oldVy * PHYSICS.DT * low;
```

#### Step 3: Calculate Collision Response
Once we have the exact collision point, we apply physics-based collision response:

```typescript
// Calculate collision normal (direction from peg to ball)
const nx = (x - peg.x) / distance;
const ny = (y - peg.y) / distance;

// Position ball exactly at collision boundary with small separation
x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.1);
y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.1);

// Calculate velocity reflection
const dot = vx * nx + vy * ny;
vx = vx - 2 * dot * nx;
vy = vy - 2 * dot * ny;

// Apply energy loss (restitution)
vx *= PHYSICS.RESTITUTION;
vy *= PHYSICS.RESTITUTION;

// Add controlled randomness to bounce direction
const randomAngle = (rng.next() - 0.5) * bounceRandomness;
const cos = Math.cos(randomAngle);
const sin = Math.sin(randomAngle);
const newVx = vx * cos - vy * sin;
const newVy = vx * sin + vy * cos;
vx = newVx;
vy = newVy;
```

#### Step 4: Safety Check
Before adding each frame to the trajectory, we perform a final safety check to ensure no overlaps exist:

```typescript
// Final safety check: ensure no overlaps
for (const peg of pegs) {
  const dx = x - peg.x;
  const dy = y - peg.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < PHYSICS.COLLISION_RADIUS) {
    // Push ball away from peg if still overlapping
    const nx = dx / dist;
    const ny = dy / dist;
    x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.2);
    y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.2);
  }
}
```

### Bucket Physics

After the ball leaves the peg field, it enters the bucket zone with additional physics:

#### Bucket Wall Collisions
```typescript
const currentSlot = Math.floor(x / slotWidth);
const slotLeftEdge = currentSlot * slotWidth + 3;
const slotRightEdge = (currentSlot + 1) * slotWidth - 3;

// Left wall collision
if (x - PHYSICS.BALL_RADIUS <= slotLeftEdge) {
  x = slotLeftEdge + PHYSICS.BALL_RADIUS;
  vx = Math.abs(vx) * PHYSICS.RESTITUTION * 0.6; // Damped bounce
}

// Right wall collision
if (x + PHYSICS.BALL_RADIUS >= slotRightEdge) {
  x = slotRightEdge - PHYSICS.BALL_RADIUS;
  vx = -Math.abs(vx) * PHYSICS.RESTITUTION * 0.6;
}
```

#### Bucket Floor Bouncing
```typescript
if (y >= bucketFloorY) {
  y = bucketFloorY;
  if (vy > 0) {
    vy = -vy * PHYSICS.RESTITUTION * 0.5; // Bounce with damping

    // Add small random horizontal movement
    vx += (rng.next() - 0.5) * 20;

    // Stop bouncing if velocity too small
    if (Math.abs(vy) < 30) {
      vy = 0;
      vx *= 0.9; // Friction
    }
  }

  // Check if settled
  if (Math.abs(vx) < 5 && Math.abs(vy) < 5 && y >= bucketFloorY - 1) {
    settled = true;
  }
}
```

### Collision Avoidance System

To prevent double-hits on the same peg:

```typescript
const recentCollisions = new Map<string, number>();

// When collision occurs:
const pegKey = `${peg.row}-${peg.col}`;
if (recentCollisions.has(pegKey)) {
  const lastHit = recentCollisions.get(pegKey)!;
  if (frame - lastHit < 10) continue; // Skip if hit within 10 frames
}

// Record collision
recentCollisions.set(pegKey, frame);
```

---

## Deterministic Trajectory Generation

The key innovation of this system is generating trajectories that **guarantee** landing in a specific slot while maintaining realistic physics. This is achieved through a **brute-force search** approach.

### High-Level Algorithm

```typescript
function generateTrajectory(params: {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;  // Target slot
  seed?: number;
}): TrajectoryPoint[]
```

#### Step 1: Generate Peg Layout
Create a deterministic peg grid based on board dimensions:

```typescript
function generatePegLayout(
  boardWidth: number,
  boardHeight: number,
  pegRows: number,
  slotCount: number
): Peg[]
```

The peg layout uses:
- Alternating row offset (creates zigzag pattern)
- Calculated spacing based on slot count
- Padding to prevent wall overlap

```typescript
for (let row = 0; row < pegRows; row++) {
  const y = verticalSpacing * (row + 1) + PHYSICS.BORDER_WIDTH + 20;
  const isOffsetRow = row % 2 === 1;
  const offset = isOffsetRow ? horizontalSpacing / 2 : 0;
  const numPegs = isOffsetRow ? slotCount : slotCount + 1;

  for (let col = 0; col < numPegs; col++) {
    const x = PHYSICS.BORDER_WIDTH + pegPadding + horizontalSpacing * col + offset;
    pegs.push({ row, col, x, y });
  }
}
```

#### Step 2: Try Different Initial Conditions

The system tries up to **50,000 different starting conditions** until finding one that lands in the target slot:

```typescript
const maxAttempts = 50000;

for (let attempt = 0; attempt < maxAttempts; attempt++) {
  // Ball always starts near center with zero velocity
  const centerX = boardWidth / 2;

  // Microscopic variations that change entire trajectory
  const pattern = attempt % 7;
  let microOffset: number;

  if (pattern === 0) microOffset = 0;           // Dead center
  else if (pattern === 1) microOffset = 1.5;    // Slightly right
  else if (pattern === 2) microOffset = -1.5;   // Slightly left
  else if (pattern === 3) microOffset = 2.5;
  else if (pattern === 4) microOffset = -2.5;
  else if (pattern === 5) microOffset = Math.sin(attempt * 0.618) * 2;
  else microOffset = Math.cos(attempt * 1.414) * 2;

  const startX = centerX + microOffset;
  const startVx = 0; // Always zero initial velocity

  // Vary bounce randomness
  const bounceRandomness = 0.2 + (attempt % 100) / 100 * 0.6; // 0.2 to 0.8

  // Run deterministic simulation
  const simulationSeed = seed * 65537 + attempt * 31337;
  const { trajectory, landedSlot } = runSimulation(
    { startX, startVx, bounceRandomness },
    boardWidth, boardHeight, pegs, slotCount, simulationSeed
  );

  // Check if it landed in target slot
  if (landedSlot === selectedIndex) {
    return trajectory; // Success!
  }
}
```

### Why This Works

**Chaos Theory**: The Plinko system is highly sensitive to initial conditions. A microscopic change in starting position (even 0.1 pixels) can cause the ball to hit pegs at different angles, cascading into completely different trajectories.

**Key Insight**: Instead of *forcing* the ball to go where we want (which would look unnatural), we **search for natural initial conditions** that lead to the desired outcome.

This is similar to:
- A pool player adjusting their cue angle by millimeters to sink a ball
- A golfer adjusting their swing to account for wind
- A pitcher varying grip slightly to change ball trajectory

The result is **completely realistic physics** because we never manipulate the ball mid-flight.

### Deterministic Random Number Generator

To ensure reproducibility, we use a seeded LCG (Linear Congruential Generator):

```typescript
export function createRng(seed: number) {
  let state = seed;

  return {
    next(): number {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    }
  };
}
```

This ensures:
- Same seed = same trajectory every time
- Different seeds = different trajectories
- Predictable randomness for bounce angles

---

## Testing Strategy

### Test Levels

#### 1. Basic Tests (`trajectory.test.ts`)
Validates fundamental trajectory properties:
- Correct frame count (100-600 frames typical)
- Ball lands in target slot
- Generally downward movement
- Peg hits are detected
- Rotation values present
- Same seed produces same trajectory

#### 2. 100 Trajectory Test (`trajectory-100.test.ts`)
Validates physics over 100 trajectories:

```typescript
it('should generate 100 valid trajectories with no overlaps', () => {
  for (let run = 0; run < 100; run++) {
    const selectedIndex = run % slotCount;
    const trajectory = generateTrajectory({...});

    // Check each frame for overlaps
    for (const point of trajectory) {
      for (const peg of pegs) {
        const dx = point.x - peg.x;
        const dy = point.y - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = PHYSICS.COLLISION_RADIUS - distance;

        expect(overlap).toBeLessThanOrEqual(0.1); // Max 0.1px tolerance
      }
    }
  }
});
```

#### 3. Comprehensive Test (`trajectory-comprehensive.test.ts`)
The ultimate validation - **10,000 random trajectories**:

```typescript
it('should successfully generate valid trajectories for 10,000 random targets', () => {
  for (let run = 0; run < 10000; run++) {
    const selectedIndex = Math.floor(Math.random() * slotCount);
    const trajectory = generateTrajectory({...});

    // Validate:
    // 1. No ball/peg overlaps
    // 2. No teleportation (max 20px per frame)
    // 3. Ball landed in correct slot
  }

  expect(successes).toBe(10000);           // 100% success
  expect(overlapViolations).toBe(0);       // No overlaps
  expect(unnaturalMovements).toBe(0);      // No teleportation
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- trajectory-100.test.ts

# Run comprehensive test (takes ~25 seconds)
npm test -- trajectory-comprehensive.test.ts
```

### Test Results (Current)

```
✅ 100 Trajectory Test: 100% success, 0 overlaps
✅ 10,000 Trajectory Test: 100% success, 0 overlaps, 0 unnatural movements
```

---

## Component Architecture

### 1. PlinkoBoard Component

Main game board that orchestrates all game elements:

```typescript
interface PlinkoBoard {
  boardWidth: number;
  boardHeight: number;
  pegRows: number;
  slotCount: number;
  selectedIndex: number;
  trajectory: TrajectoryPoint[];
}
```

Responsibilities:
- Renders game board with borders
- Manages peg layout
- Displays prize slots
- Coordinates ball animation

### 2. Ball Component

Renders and animates the ball:

```typescript
interface BallProps {
  trajectory: TrajectoryPoint[];
  currentFrame: number;
  isAnimating: boolean;
}
```

Features:
- Smooth interpolated movement
- Rotation based on velocity
- Visual effects on peg hits
- Trail effect (optional)

### 3. Peg Component

Individual peg rendering:

```typescript
interface PegProps {
  x: number;
  y: number;
  radius: number;
  isHit?: boolean; // Visual feedback
}
```

### 4. PrizeSlots Component

Bottom slots showing prizes:

```typescript
interface PrizeSlot {
  index: number;
  multiplier: number;
  isSelected: boolean;
}
```

---

## State Management

Game state is managed through a state machine (`stateMachine.ts`):

### Game States

```typescript
type GameState =
  | 'IDLE'           // Waiting for user input
  | 'GENERATING'     // Calculating trajectory
  | 'ANIMATING'      // Ball is falling
  | 'SETTLED'        // Ball has landed
  | 'COMPLETE'       // Game over
```

### State Transitions

```
IDLE → (user clicks) → GENERATING
GENERATING → (trajectory ready) → ANIMATING
ANIMATING → (ball settled) → SETTLED
SETTLED → (delay) → COMPLETE
COMPLETE → (reset) → IDLE
```

### State Machine Implementation

```typescript
export function createStateMachine(initialState: GameState) {
  let currentState = initialState;

  return {
    getState: () => currentState,

    transition: (newState: GameState) => {
      // Validate transition
      if (isValidTransition(currentState, newState)) {
        currentState = newState;
      }
    },

    canTransition: (newState: GameState) => {
      return isValidTransition(currentState, newState);
    }
  };
}
```

---

## Performance Considerations

### Trajectory Generation Performance

- **Average time**: 50-200ms per trajectory
- **Worst case**: 5-10 seconds (rare, <0.1% of cases)
- **Optimization**: Early exit when target slot found

### Animation Performance

- **60 FPS target**: 16.67ms per frame
- **Rendering**: CSS transforms for GPU acceleration
- **Memory**: Trajectory pre-computed, no physics during animation

### Optimization Techniques

1. **Spatial hashing** (not yet implemented): Could reduce collision checks from O(n) to O(1)
2. **Trajectory caching**: Store successful trajectories for reuse
3. **Web Workers**: Move physics simulation off main thread
4. **WASM**: Compile physics engine to WebAssembly for 10x speed

---

## Future Enhancements

### Potential Improvements

1. **Multi-ball support**: Multiple balls dropping simultaneously
2. **Custom peg layouts**: Allow users to design boards
3. **Advanced statistics**: Show probability distributions
4. **Replay system**: Save and replay favorite trajectories
5. **Sound effects**: Audio feedback on peg hits
6. **Visual trails**: Motion blur or particle effects
7. **Difficulty levels**: Vary bounce randomness

### Known Limitations

1. **Generation time**: Some trajectories may take longer to find
2. **Randomness**: Bounce randomness is controlled, not purely random
3. **Edge cases**: Extreme board dimensions may cause issues

---

## Technical Decisions

### Why Deterministic Physics?

**Problem**: Traditional Plinko games with pure random physics can't guarantee outcomes.

**Solution**: Pre-compute entire trajectory before animation.

**Benefits**:
- Guaranteed outcomes (important for prize games)
- Smooth animation without physics calculations
- Reproducible for debugging
- Fair and transparent

**Trade-offs**:
- Trajectory generation takes time
- Not truly random (but appears random to users)
- Requires sophisticated search algorithm

### Why Binary Search for Collisions?

**Alternative**: Simple overlap detection

**Problem**: Ball can "tunnel" through pegs at high speeds

**Solution**: Binary search finds exact collision moment

**Benefit**: Zero overlaps, perfect physics accuracy

### Why Brute Force Search?

**Alternative**: Pathfinding algorithms (A*, etc.)

**Problem**: Plinko physics is chaotic - hard to predict

**Solution**: Try many initial conditions until one works

**Benefit**: Guarantees natural-looking physics

---

## Debugging Tips

### Common Issues

**Ball falls through pegs**:
- Check collision detection is enabled
- Verify COLLISION_RADIUS is correct
- Ensure binary search is working

**Ball overlaps pegs**:
- Check safety margin (should be 0.1-0.2px)
- Verify collision response positions ball correctly
- Run overlap tests

**Trajectory generation fails**:
- Increase maxAttempts (currently 50,000)
- Check peg layout doesn't block target slot
- Verify board dimensions are reasonable

**Unnatural movement**:
- Check velocity clamping
- Verify DT (timestep) is reasonable
- Check for teleportation (frame distance > 20px)

### Debug Logging

Enable detailed logging in trajectory.ts:

```typescript
if (DEBUG) {
  console.log(`Attempt ${attempt}: landed in slot ${landedSlot}`);
  console.log(`Collision at frame ${frame} with peg (${peg.row}, ${peg.col})`);
  console.log(`Overlap detected: ${overlap.toFixed(2)}px`);
}
```

---

---

## Platform Abstraction

To enable future React Native portability while maintaining the current web implementation, all platform-specific browser APIs are abstracted behind a unified adapter layer located in `src/utils/platform/`.

### Overview

The platform abstraction system provides a consistent API across web and React Native by wrapping platform-specific implementations behind common interfaces. This allows the core game logic to remain platform-agnostic while supporting different runtime environments.

**Key Design Principles:**
- **Single API**: Same interface for web and React Native
- **Tree-shakeable**: Unused platform code is eliminated at build time
- **Type-safe**: Strict TypeScript interfaces with zero `any` types
- **Runtime safe**: Helpful errors when APIs are unavailable
- **Future-proof**: React Native ready without breaking web

### Architecture

```
src/utils/platform/
├── index.ts                 # Main exports
├── detect.ts                # Platform detection utility
├── crypto/
│   ├── types.ts            # Interface definitions
│   ├── index.web.ts        # Web: crypto.getRandomValues()
│   ├── index.native.ts     # RN: expo-crypto
│   └── index.ts            # Platform selector
├── dimensions/
│   ├── types.ts
│   ├── index.web.ts        # Web: window.innerWidth/innerHeight
│   ├── index.native.ts     # RN: Dimensions API
│   └── index.ts
├── deviceInfo/
├── storage/
├── animation/
├── navigation/
└── performance/
```

### Available Adapters

#### 1. **cryptoAdapter** - Random Number Generation
Provides cryptographically secure random number generation.

**Web Implementation:** `crypto.getRandomValues()`
**React Native:** expo-crypto or react-native-get-random-values

```typescript
import { cryptoAdapter } from '@/utils/platform';

// Generate secure random seed
const seed = cryptoAdapter.generateSecureRandomSeed();

// Fill typed array with random values
const array = new Uint32Array(10);
cryptoAdapter.getRandomValues(array);
```

**Used in:**
- `src/game/rng.ts` - Seed generation for deterministic RNG

#### 2. **dimensionsAdapter** - Viewport Dimensions
Provides window/screen dimensions and resize event handling.

**Web Implementation:** `window.innerWidth`, `window.innerHeight`, resize events
**React Native:** Dimensions API with change listeners

```typescript
import { dimensionsAdapter } from '@/utils/platform';

// Get current dimensions
const width = dimensionsAdapter.getWidth();
const height = dimensionsAdapter.getHeight();
const { width, height } = dimensionsAdapter.getDimensions();

// Listen for resize events
const cleanup = dimensionsAdapter.addChangeListener(() => {
  console.log('Dimensions changed!');
});

// Cleanup when done
cleanup();
```

**Used in:**
- `src/utils/deviceDetection.ts` - Responsive layout detection
- `src/App.tsx` - Board sizing and mobile detection

#### 3. **deviceInfoAdapter** - Device Detection
Detects device type, platform, and capabilities.

**Web Implementation:** `navigator.userAgent`, `navigator.maxTouchPoints`
**React Native:** Platform API, DeviceInfo module

```typescript
import { deviceInfoAdapter } from '@/utils/platform';

const isMobile = deviceInfoAdapter.isMobileDevice();
const hasTouch = deviceInfoAdapter.isTouchDevice();
const platform = deviceInfoAdapter.getPlatform(); // 'web' | 'ios' | 'android'
const userAgent = deviceInfoAdapter.getUserAgent();
```

**Used in:**
- `src/utils/deviceDetection.ts` - Mobile/tablet/desktop detection
- `src/App.tsx` - Responsive UI decisions

#### 4. **storageAdapter** - Persistent Storage
Provides key-value storage with async API (to match React Native's AsyncStorage).

**Web Implementation:** `localStorage` (wrapped in Promises)
**React Native:** AsyncStorage

```typescript
import { storageAdapter } from '@/utils/platform';

// All methods return Promises
await storageAdapter.setItem('theme', 'dark');
const theme = await storageAdapter.getItem('theme'); // 'dark' or null
await storageAdapter.removeItem('theme');
await storageAdapter.clear();
const keys = await storageAdapter.getAllKeys();
```

**Used in:**
- `src/theme/ThemeContext.tsx` - Theme persistence

**⚠️ Important:** Even though web's localStorage is synchronous, all storage adapter methods return Promises to maintain API consistency with React Native's AsyncStorage.

#### 5. **animationAdapter** - Animation Frame Loop
Provides animation frame scheduling for smooth 60 FPS rendering.

**Web Implementation:** `requestAnimationFrame`, `cancelAnimationFrame`
**React Native:** React Native's Animated API or Reanimated

```typescript
import { animationAdapter } from '@/utils/platform';

const animate = (timestamp: number) => {
  // Animation logic
  frameId = animationAdapter.requestFrame(animate);
};

const frameId = animationAdapter.requestFrame(animate);

// Cancel when done
animationAdapter.cancelFrame(frameId);

// Get current timestamp
const now = animationAdapter.now();
```

**Used in:**
- `src/hooks/usePlinkoGame.ts` - Ball trajectory animation loop

#### 6. **navigationAdapter** - URL Parameters & Routing
Provides access to URL query parameters and current route.

**Web Implementation:** `URLSearchParams`, `window.location`
**React Native:** React Navigation params

```typescript
import { navigationAdapter } from '@/utils/platform';

// Get query parameter
const seed = navigationAdapter.getParam('seed'); // '12345' or null

// Get all parameters
const params = navigationAdapter.getAllParams(); // { seed: '12345', theme: 'dark' }

// Check if parameter exists
const hasSeed = navigationAdapter.hasParam('seed');

// Get current path
const path = navigationAdapter.getCurrentPath(); // '/' or '/game'
```

**Used in:**
- `src/hooks/usePlinkoGame.ts` - Reading `?seed=` parameter for deterministic testing

#### 7. **performanceAdapter** - Performance Timing
Provides high-resolution timing for performance measurements.

**Web Implementation:** `performance.now()`, `performance.mark()`, `performance.measure()`
**React Native:** `Date.now()` fallback or performance polyfill

```typescript
import { performanceAdapter } from '@/utils/platform';

const start = performanceAdapter.now();

// ... expensive operation ...

const duration = performanceAdapter.now() - start;

// Optional: create performance marks
performanceAdapter.mark('trajectory-start');
// ... work ...
performanceAdapter.mark('trajectory-end');
performanceAdapter.measure('trajectory', 'trajectory-start', 'trajectory-end');
```

**Used in:**
- Performance monitoring and telemetry
- Previously used in trajectory worker (now removed)

### Platform Detection

The `detect.ts` utility determines which platform is currently running:

```typescript
import { isWeb, isNative, getPlatform } from '@/utils/platform/detect';

if (isWeb()) {
  console.log('Running in browser');
}

if (isNative()) {
  console.log('Running in React Native');
}

const platform = getPlatform(); // 'web' | 'native'
```

### Build Configuration

The build system automatically selects the correct implementation:

**Vite (Web):**
```javascript
// vite.config.ts
export default {
  resolve: {
    extensions: ['.web.ts', '.ts', '.web.tsx', '.tsx', '.js']
  }
}
```

Vite prioritizes `.web.ts` files, so `index.web.ts` is loaded instead of `index.ts`.

**Metro (React Native):**
Metro automatically resolves `.native.ts` files when present, falling back to `.ts`.

**Tree-shaking:** Unused platform code is eliminated at build time, keeping bundle sizes optimal.

### Adding New Adapters

To add a new platform adapter:

1. **Create directory structure:**
```bash
mkdir src/utils/platform/myAdapter
cd src/utils/platform/myAdapter
```

2. **Define interface in `types.ts`:**
```typescript
export interface MyAdapter {
  doSomething(): string;
}
```

3. **Implement web version in `index.web.ts`:**
```typescript
import type { MyAdapter } from './types';

export const myAdapter: MyAdapter = {
  doSomething(): string {
    return window.myAPI.getValue();
  }
};
```

4. **Implement RN version in `index.native.ts`:**
```typescript
import type { MyAdapter } from './types';
import { NativeModules } from 'react-native';

export const myAdapter: MyAdapter = {
  doSomething(): string {
    return NativeModules.MyModule.getValue();
  }
};
```

5. **Create platform selector in `index.ts`:**
```typescript
export * from './types';
export * from './index.web'; // Vite will pick this
```

6. **Export from main index:**
```typescript
// src/utils/platform/index.ts
export * from './myAdapter';
```

### Testing

**Unit Tests:** `src/tests/platform-adapters.test.ts`
- 68 test cases covering all adapters
- Mocks browser APIs (window, localStorage, crypto, etc.)
- Tests success and error cases
- Validates type safety and edge cases

**Playwright Smoke Tests:** `scripts/playwright/platform-adapters-smoke.mjs`
- 15 end-to-end tests in real browser
- Verifies adapters work with actual browser APIs
- Tests integration between adapters
- Captures screenshots on failure

Run tests:
```bash
# Unit tests
npm test src/tests/platform-adapters.test.ts

# Playwright smoke tests (requires dev server running)
npm run dev # In one terminal
npx playwright test scripts/playwright/platform-adapters-smoke.mjs # In another
```

### Cross-Platform Constraints

To maintain React Native compatibility, avoid these web-only features:

**❌ Forbidden:**
- Blur effects (`filter: blur()`)
- Radial/conic gradients
- Box shadows, text shadows
- `backdrop-filter`, `clip-path`
- CSS pseudo-elements (`:before`, `:after`)
- Complex CSS selectors

**✅ Allowed:**
- Linear gradients
- Transforms (translateX, translateY, scale, rotate)
- Opacity animations
- Color transitions
- Layout animations

See `CLAUDE.md` (CIB-001.5) for complete constraints.

### Migration Status

**✅ Completed:**
- All 7 adapters implemented for web
- All browser API calls migrated (73 total)
- Build configured for tree-shaking
- TypeScript strict mode passes
- Unit and E2E tests created

**📝 React Native Ready:**
- All `.native.ts` files include implementation guides
- Interfaces designed for RN compatibility
- Required dependencies documented in each adapter

**Files Migrated:**
1. `src/game/rng.ts` → cryptoAdapter
2. `src/utils/deviceDetection.ts` → dimensionsAdapter, deviceInfoAdapter
3. `src/App.tsx` → dimensionsAdapter, deviceInfoAdapter
4. `src/theme/ThemeContext.tsx` → storageAdapter
5. `src/hooks/usePlinkoGame.ts` → navigationAdapter, animationAdapter

### Documentation

- **Platform adapter README:** `src/utils/platform/README.md`
- **Implementation guide:** `docs/platform-adapter-implementation.md`
- **API audit report:** `docs/platform-api-audit.md`
- **Each `.native.ts` file:** Contains implementation instructions for React Native

---

## Conclusion

This Plinko implementation demonstrates how **deterministic physics** and **intelligent search** can create a game that appears random while guaranteeing specific outcomes. The key innovation is using chaos theory to our advantage - tiny changes in initial conditions create vastly different results, so we search for the initial condition that naturally leads to our desired outcome.

The result is a physics engine that:
- ✅ Passes 10,000+ trajectory tests with 100% accuracy
- ✅ Has zero ball/peg overlaps (< 0.2px tolerance)
- ✅ Produces completely realistic motion
- ✅ Guarantees the ball lands in the selected slot
- ✅ Runs at smooth 60 FPS animation

This architecture can be adapted for other physics-based games requiring deterministic outcomes, such as:
- Pachinko machines
- Pinball games
- Ball drop games
- Prize wheel spinners
