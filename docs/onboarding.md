# Developer onboarding guide

Welcome to the Plinko codebase! This guide will walk you through the architecture, key concepts, and common workflows to help you become productive quickly.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Happy Path Walkthrough](#happy-path-walkthrough)
- [Directory Structure](#directory-structure)
- [Key Concepts](#key-concepts)
- [Common Patterns](#common-patterns)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Where to Find Things](#where-to-find-things)
- [Next Steps](#next-steps)

---

## Project Overview

**Plinko** is a physics-based prize game built with React and TypeScript, designed for cross-platform compatibility (web now, React Native future).

**Key Features:**
- Deterministic physics simulation
- 60 FPS ball animation with trail effects
- Prize reveal with celebration animations
- State machine-driven game flow
- Cross-platform animation system
- Comprehensive audio system (SFX + music)
- Dev tools for QA and debugging

**Tech Stack:**
- React (TypeScript)
- Motion/Framer Motion (web animations)
- Vitest (unit tests)
- Playwright (E2E tests)
- Vite (build tool)

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

### Dev tools

Press the debug panel toggle (bottom-right) to access:
- Viewport size control (mobile/desktop testing)
- Choice mechanic testing
- Performance mode selection
- Theme switching
- Music controls
- Winner reveal toggle

### Configuration

**Environment variables:**
- `VITE_ENABLE_DEV_TOOLS` - Enable dev tools panel (default: `true` in dev)
- `VITE_ENABLE_SOUND` - Enable audio system (default: `true`)

---

## Architecture at a Glance

The codebase follows a three-layer architecture. The portable game package lives under `src/plinko/`; the demo host app lives under `src/demo/`:

```
┌─────────────────────────────────────────────────┐
│          UI Layer (React Components)            │
│  src/plinko/components/  src/plinko/theme/   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Orchestration Layer (React Hooks)          │
│          src/plinko/hooks/  src/plinko/animation/             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Game Core (Framework-Free Logic)           │
│    src/plinko/game/  src/plinko/game/trajectory/  │
└─────────────────────────────────────────────────┘
```

**Layer Responsibilities:**

1. **UI Layer** - Presentational components, layout, theming, error boundaries (`src/plinko/components`, `src/plinko/theme`)
2. **Orchestration Layer** - State management, animation coordination, side effects (`src/plinko/hooks`, `src/plinko/animation`)
3. **Game Core** - Pure TypeScript: physics, trajectory, state machine, prize logic (`src/plinko/game`)

---

## Happy Path Walkthrough

Let's trace the flow from app start to prize claim:

### 1. App Initialization

**File (demo host):** `src/demo/App.tsx`

```tsx
export function App() {
  // 1. Initialize app configuration
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </ThemeProvider>
    </AppConfigProvider>
  );
}
```

**Providers in order:**
- `AppConfigProvider` - Performance settings, feature flags
- `ThemeProvider` - Theme tokens, theme switching
- `AudioProvider` - SFX and music controllers
- App-level toasts are demo-only; production hosts can wire their own notification system

### 2. Game Hook Initialization

**File:** `src/plinko/hooks/usePlinkoGame.ts`

```tsx
function AppContent() {
  // Main game orchestration hook
  const gameState = usePlinkoGame({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    choiceMechanic: 'drop-position'
  });

  const {
    state,           // 'idle' | 'ready' | 'countdown' | 'dropping' | ...
    prizes,          // Prize array for UI
    selectedPrize,   // Locked winning prize
    trajectory,      // Ball path data
    startGame,       // User actions
    resetGame
  } = gameState;
}
```

**usePlinkoGame composes:**
- `usePrizeSession` - Loads prizes, handles seed overrides
- `useGameState` - State machine, trajectory generation
- `useGameAnimation` - Frame store for animation sync
- `useResetCoordinator` - Orchestrates complete reset

### 3. Prize Loading

**File:** `src/plinko/hooks/usePrizeSession.ts`

```typescript
// Fetches prizes from provider
const { prizes, winningPrize, isLoading } = usePrizeSession({
  seedOverride,
  forceFreshSeedRef,
  sessionKey
});

// Provider defined in src/config/prizes/prizeSets.ts
// Can be customized by host app via AppConfigProvider
```

**Flow:**
1. Call `PrizeProvider.getPrizes(seed)`
2. Determine winning prize (deterministic via seed)
3. Lock winning prize in ref (immutable during session)
4. Return prizes array (can be swapped for UI effects)

### 4. User Starts Game

**File:** `src/plinko/components/screens/StartScreen.tsx`

```tsx
<StartScreen
  prizes={prizes}
  onStart={startGame}  // Dispatches START_GAME event
  disabled={isLoading}
/>
```

**State transition:**
- `idle` → `ready` (prizes loaded)
- `ready` → `countdown` (user clicks start)

### 5. Trajectory Generation

**File:** `src/plinko/game/trajectory/index.ts`

```typescript
// When state machine enters 'countdown'
const trajectory = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  targetSlot: selectedIndex,  // Winner's slot
  seed: prizeSeed
});

// Returns deterministic path that ALWAYS lands in targetSlot
```

**Process:**
1. Use precomputed trajectory from provider (if available)
2. Or run deterministic search (brute force)
3. Generate trajectory cache for animation performance
4. Cache contains per-frame: position, velocity, rotation, scale, trail

### 6. Countdown & Animation

**File:** `src/plinko/components/game/Countdown.tsx` → `src/plinko/components/game/Ball.tsx`

```tsx
// Countdown: 3... 2... 1...
<Countdown onComplete={completeCountdown} />

// State: countdown → dropping
// Ball animation starts using trajectory cache
```

**Animation flow:**
```typescript
// src/plinko/animation/useBallAnimationDriver.ts
const driver = useBallAnimationDriver();

driver.schedule((frameIndex) => {
  const frame = trajectoryCache.frames[frameIndex];
  driver.applyBallTransform(frame.x, frame.y, frame.rotation, frame.scale);
  driver.updateTrail(frame.trailPositions);
}, { duration: 2000, fps: 60 });
```

### 7. Landing & Celebration

**File:** `src/plinko/components/game/Ball.tsx`

```typescript
// Ball reaches final position
onLandingComplete();  // Dispatches LANDING_COMPLETED

// State: dropping → landed → celebrating
// Celebration overlay appears (confetti, particles)
```

**File:** `src/components/effects/celebrations/CelebrationOverlay.tsx`

```tsx
<CelebrationOverlay
  prize={selectedPrize}
  onComplete={() => {
    // Auto-advances to 'revealed' state after delay
  }}
/>
```

### 8. Prize Reveal

**File:** `src/plinko/components/screens/PrizeReveal.tsx`

```tsx
// State: celebrating → revealed
<PrizeReveal
  prize={selectedPrize}
  onClaim={claimPrize}
  onReset={resetGame}
  canClaim={true}
/>
```

### 9. Prize Claimed

**File:** `src/plinko/components/screens/PrizeClaimed.tsx`

```tsx
// State: revealed → claimed
<PrizeClaimed
  prize={selectedPrize}
  onClose={resetGame}  // Returns to idle
/>
```

### 10. Reset Flow

**File:** `src/plinko/hooks/useResetCoordinator.ts`

```typescript
resetGame();  // Executes 5-phase reset

// Phase 1: Animation cleanup
currentFrameRef.current = 0;
resetFrame();

// Phase 2: State cleanup
dispatch({ type: 'RESET_REQUESTED' });

// Phase 3: Session cleanup
setPrizeSession(null);

// Phase 4: Lock release
winningPrizeLockedRef.current = false;

// Phase 5: Re-initialization
setSessionKey(key => key + 1);
```

Result: App returns to `idle` state, ready for next game.

---

## Directory Structure

```
src/
├── demo/                  # Demo host app (providers, dev tools)
│   ├── App.tsx            # Reference application using the package
│   ├── components/DevTools/   # Dev tools (feature-flagged, lazy-loaded)
│   └── utils/devToolsPersistence.ts # Demo persistence helper
└── plinko/                # Portable game package (public API)
  ├── animation/         # Ball animation driver, trail optimization
  ├── assets/            # Images, sounds, fonts
  ├── audio/             # Audio system (SFX, music controllers)
  │   ├── context/       # AudioProvider, hooks
  │   └── hooks/         # Audio hooks
  ├── components/        # React UI components (game, effects, screens, ui)
  ├── config/            # Prize configuration utilities
  ├── constants/         # Game constants
  ├── game/              # Pure game logic (framework-free)
  │   ├── trajectory/    # Trajectory generation, search algorithms
  │   ├── boardGeometry.ts  # Peg positions, drop zones
  │   ├── prizeProvider.ts  # Prize loading contract
  │   ├── stateMachine.ts   # Game state machine
  │   └── trajectoryCache.ts # Performance cache for animations
  ├── hooks/             # React hooks (orchestration layer)
  ├── tests/             # Package tests
  ├── theme/             # Design system (tokens, themes, animation drivers)
  ├── types/             # Shared TypeScript types
  └── utils/             # Utilities (formatting, slot dimensions, platform)
```

---

## Key Concepts

### 1. State Machine

**File:** `src/plinko/game/stateMachine.ts`

The game uses a finite state machine for predictable flow:

```
idle → ready → countdown → dropping → landed → celebrating → revealed → claimed
  ↑                                                                          ↓
  └──────────────────────────────────────────────────────────────────────────┘
                            (reset)
```

**States:**
- `idle` - No prizes loaded yet
- `ready` - Prizes loaded, awaiting start
- `countdown` - 3-2-1 countdown
- `dropping` - Ball falling
- `landed` - Ball reached slot
- `celebrating` - Celebration animation
- `revealed` - Prize revealed
- `claimed` - Prize claimed

**Events:**
- `PRIZES_LOADED`
- `START_GAME`
- `COUNTDOWN_COMPLETED`
- `LANDING_COMPLETED`
- `CLAIM_PRIZE`
- `RESET_REQUESTED`

### 2. Deterministic Physics

**File:** `src/plinko/game/trajectory/index.ts`

All physics simulations are deterministic (seeded RNG):

```typescript
// Same seed = same trajectory every time
const trajectory1 = generateTrajectory({ seed: 12345, targetSlot: 3 });
const trajectory2 = generateTrajectory({ seed: 12345, targetSlot: 3 });
// trajectory1 === trajectory2 (deterministic)
```

**Why deterministic?**
- Predictable outcomes for testing
- Fair gameplay (no randomness after prize selection)
- Reproducible bugs

### 3. Trajectory Cache

**File:** `src/plinko/game/trajectoryCache.ts`

Pre-computes animation data to avoid per-frame calculations:

```typescript
interface TrajectoryCache {
  frames: Array<{
    x: number;
    y: number;
    rotation: number;
    scale: { x: number; y: number };
  }>;
  trailPositions: Array<TrailPosition[]>;
  pegFlashes: Array<{ pegIndex: number; timestamp: number }>;
}
```

**Performance benefit:** >5% frame time reduction

### 4. Token System

**File:** `src/plinko/theme/tokens.ts`

All design values centralized:

```typescript
import { spacingTokens, colorTokens, gradientTokens } from '@plinko/theme/tokens';

// Always use tokens instead of magic numbers
style={{
  padding: spacingTokens[4],        // NOT padding: '16px'
  color: colorTokens.gray[100],     // NOT color: '#f1f5f9'
  background: gradientTokens.button.primary
}}
```

See theming docs for details (`docs/theming.md`).

### 5. Animation Driver

**File:** `src/plinko/theme/animationDrivers/`

Cross-platform animation abstraction:

```tsx
const driver = useAnimationDriver();
const AnimatedDiv = driver.createAnimatedComponent('div');

<AnimatedDiv
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={driver.getTransitionConfig('medium')}
>
  Content
</AnimatedDiv>
```

**Platforms:**
- Web: Framer Motion
- React Native: Moti (future)

See [Animation pipeline](/docs/animation-pipeline.md) for details.

### 6. Reset Orchestration

**File:** `src/plinko/hooks/useResetCoordinator.ts`

Centralized reset logic prevents partial resets:

```typescript
// 5 phases executed in strict order
resetCoordinator.reset();

// Phases:
// 1. Animation cleanup
// 2. State cleanup
// 3. Session cleanup
// 4. Lock release
// 5. Re-initialization
```

See [Reset orchestration](/docs/RESET_ORCHESTRATION.md) for rationale.

---

## Common Patterns

### Pattern 1: Component with Animation

```tsx
import { useAnimationDriver } from '@plinko/theme/animationDrivers';
import { spacingTokens, colorTokens } from '@plinko/theme/tokens';

function AnimatedCard({ children }: PropsWithChildren) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <AnimatedDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={driver.getTransitionConfig('medium')}
      style={{
        padding: spacingTokens[6],
        backgroundColor: colorTokens.gray[800],
        borderRadius: borderRadiusTokens.card
      }}
    >
      {children}
    </AnimatedDiv>
  );
}
```

### Pattern 2: Hook Composition

```tsx
function useFeature() {
  // Compose smaller hooks
  const { theme } = useTheme();
  const driver = useAnimationDriver();
  const { sfxController } = useAudio();

  // Coordinate side effects
  useEffect(() => {
    if (isActive) {
      sfxController.play('activate');
    }
  }, [isActive]);

  return {
    /* public API */
  };
}
```

### Pattern 3: State Machine Integration

```tsx
function useGameFeature() {
  const [state, setState] = useState<GameState>('idle');

  // State machine dispatch
  const dispatch = useCallback((event: GameEvent) => {
    setState(current => {
      const transition = transitions[current][event.type];
      return transition ? transition.target : current;
    });
  }, []);

  return { state, dispatch };
}
```

### Pattern 4: Error Boundaries

```tsx
// Wrap risky components
<ErrorBoundary fallback={<ErrorMessage />}>
  <RiskyComponent />
</ErrorBoundary>

// Domain-specific boundaries
<GameBoardErrorBoundary onReset={resetGame}>
  <PlinkoBoard />
</GameBoardErrorBoundary>
```

### Pattern 5: Platform Adapters

```tsx
// Use adapters for platform-specific features
import { storageAdapter } from '@plinko/utils/platform/storage';

// Works on web and React Native
const theme = await storageAdapter.getItem('theme');
await storageAdapter.setItem('theme', 'dark');
```

---

## Development Workflow

### Adding a New Feature

1. **Define requirements** - What state, events, side effects?
2. **Choose layer** - UI, orchestration, or game core?
3. **Write types** - TypeScript interfaces first
4. **Implement logic** - Pure functions, then hooks, then UI
5. **Add tests** - Unit tests for logic, integration for flow
6. **Update docs** - Add to relevant documentation

### Making a State Change

```typescript
// 1. Update state machine (src/game/stateMachine.ts)
export const states = {
  // ... existing states
  myNewState: {
    on: {
      MY_EVENT: { target: 'nextState' }
    }
  }
};

// 2. Update state hook (src/hooks/useGameState.ts)
const dispatch = (event: GameEvent) => {
  if (event.type === 'MY_EVENT') {
    // Handle side effects
  }
  // ... dispatch to machine
};

// 3. Update UI to handle new state
{state === 'myNewState' && <MyNewComponent />}
```

### Adding a Design Token

```typescript
// src/theme/tokens.ts
export const myTokenCategory = {
  myToken: '#value',
  // ...
} as const;

// Usage
import { myTokenCategory } from '@plinko/theme/tokens';
style={{ color: myTokenCategory.myToken }}
```

### Running Tests

```bash
# Unit tests (fast)
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Specific test file
npm test -- ballAnimationDriver.test.ts
```

### Debugging

**Dev Tools Panel:**
- Toggle viewport sizes
- Change performance mode
- Test choice mechanics
- View winner before drop
- Control music playback

**Console Logging:**
```typescript
// Enabled in development
if (import.meta.env.DEV) {
  console.log('Debug info:', state);
}
```

**React DevTools:**
- Inspect component props/state
- Profile render performance
- Trace component updates

---

## Testing Strategy

### Unit Tests

**Location:** `src/plinko/tests/unit/`

Test pure logic, hooks, utilities:

```typescript
describe('generateTrajectory', () => {
  it('should land in target slot', () => {
    const trajectory = generateTrajectory({
      seed: 12345,
      targetSlot: 5,
      boardWidth: 375
    });

    expect(trajectory.finalSlot).toBe(5);
  });
});
```

### Integration Tests

**Location:** `src/plinko/tests/integration/`

Test hook composition, state flow:

```typescript
describe('usePlinkoGame', () => {
  it('should complete full game flow', () => {
    const { result } = renderHook(() => usePlinkoGame());

    act(() => result.current.startGame());
    expect(result.current.state).toBe('countdown');

    act(() => result.current.completeCountdown());
    expect(result.current.state).toBe('dropping');
  });
});
```

### E2E Tests

**Location:** `scripts/playwright/`

Test user journeys, visual behavior:

```typescript
test('complete game flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-button"]');
  await page.waitForSelector('[data-testid="ball"]');

  // Wait for landing
  await page.waitForSelector('[data-testid="prize-reveal"]');

  await page.click('[data-testid="claim-button"]');
  expect(await page.textContent('[data-testid="claimed-message"]'))
    .toContain('Prize claimed!');
});
```

### Test Organization

```
src/tests/
├── fixtures/          # Test data (trajectories, prizes)
├── unit/             # Fast unit tests
│   ├── hooks/       # Hook tests
│   ├── game/        # Game logic tests
│   └── animation/   # Animation tests
├── integration/      # Hook composition tests
├── physics/         # Physics validation
├── regression/      # Bug regression tests
└── safeguards/      # Invariant checks
```

---

## Where to Find Things

### "I need to..."

**...add a new screen:**
- Create component in `src/components/screens/`
- Add state to state machine (`src/game/stateMachine.ts`)
- Wire up in `App.tsx` with `AnimatePresence`

**...change physics behavior:**
- Modify modules under `src/plinko/game/trajectory/` and `src/plinko/game/boardGeometry.ts`
- Update tests in `src/plinko/tests/physics/`
- Document changes in `docs/board-geometry.md`

**...add a new animation:**
- Use `useAnimationDriver()` hook
- Follow patterns in `src/plinko/components/effects/`
- Ensure cross-platform compatibility (no blur, shadows)

**...modify the state machine:**
- Edit `src/plinko/game/stateMachine.ts`
- Update event handlers in `src/plinko/hooks/useGameState.ts`
- Add tests in `src/plinko/tests/unit/hooks/useGameState.test.ts`

**...add design tokens:**
- Add to `src/plinko/theme/tokens.ts`
- Use in components via imports
- See `docs/theming.md`

**...debug a reset issue:**
- Check `src/plinko/hooks/useResetCoordinator.ts`
- Review reset phases in order

**...add audio effects:**
- Add sound file under `src/plinko/assets/sounds/` (if used) or host-provided assets
- Use `sfxController.play('sound-id')`
- See `docs/sound-engine-guide.md`

**...optimize performance:**
- Check demo config in `src/demo/config/appConfig.ts` for performance modes
- Use React DevTools Profiler
- Consider `useMemo`, `useCallback` for expensive ops
- See `docs/power-saving-mode.md`

---

## Next Steps

Now that you understand the architecture, here are recommended learning paths:

### For UI Developers

1. Read [Token System Guide](/docs/token-system.md)
2. Review component patterns in `src/components/`
3. Learn animation driver in [Animation Pipeline](/docs/animation-pipeline.md)
4. Build a simple component using tokens + animations

### For Backend/Logic Developers

1. Read [Architecture Guide](/docs/architecture.md)
2. Study state machine in `src/game/stateMachine.ts`
3. Understand trajectory generation in `src/game/trajectory/`
4. Write a unit test for a game logic function

### For full‑stack developers

1. Trace happy path walkthrough (above)
2. Study hook composition in `src/hooks/usePlinkoGame.ts`
3. Review reset orchestration in [`docs/RESET_ORCHESTRATION.md`](./RESET_ORCHESTRATION.md)
4. Make a small feature change end-to-end

### Deep Dives

**Physics & simulation:**
- [Board geometry](/docs/board-geometry.md)

**State management:**
- [Reset orchestration](/docs/RESET_ORCHESTRATION.md)

**Cross‑platform:**
- Platform adapters: see `src/plinko/utils/platform/README.md`

**Audio:**
- [Sound engine](/docs/sound-engine.md)

---

## Getting Help

**Documentation:**
- Architecture: `/docs/architecture.md`
- Theming: `/docs/theming.md`
- Dev tools: `/docs/dev-tools.md`

**Code Comments:**
- Most modules have detailed JSDoc comments
- Look for `@example` blocks for usage patterns

**Dev Tools:**
- Use debug panel to test different scenarios
- Check console for development-only logs

**Tests:**
- Tests often show usage patterns
- Check `src/tests/` for examples

---

## Congratulations!

You now have a solid foundation for working in the Plinko codebase. Remember:

- Follow repo style (Prettier + ESLint)
- Use tokens instead of magic numbers
- Test your changes (unit + integration)
- Update documentation for new features
- Ask questions and collaborate!

Happy coding!
