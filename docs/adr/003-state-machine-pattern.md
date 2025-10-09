# ADR 003: State Machine Pattern

**Status:** Accepted
**Date:** 2025-10-09
**Deciders:** Development Team
**Tags:** state-management, architecture, game-logic

## Context

The Plinko game flow involves multiple screens and states (idle, ready, countdown, dropping, landed, revealed, claimed). We need a robust way to:
1. **Prevent Invalid Transitions**: Ensure game can't skip states or enter impossible states
2. **Track Context**: Maintain game data (trajectory, prize, seed) across transitions
3. **Support Telemetry**: Track all state changes for debugging
4. **Enable Testing**: Easily verify state machine behavior
5. **Developer Clarity**: Make game flow explicit and understandable

### Initial Challenges
- Ad-hoc state management scattered across components
- Hard to reason about valid transitions
- No safeguards against invalid state changes
- Difficult to debug state-related bugs
- Context updates were error-prone

## Decision

We will implement a **Finite State Machine (FSM)** pattern with the following design:

### 1. State Definition
```typescript
export type GameState =
  | 'idle'                  // Initial state
  | 'ready'                 // Trajectory generated, ready to drop
  | 'selecting-position'    // User selecting drop position
  | 'countdown'             // 3-2-1 countdown
  | 'dropping'              // Ball is falling
  | 'landed'                // Ball landed in slot
  | 'revealed'              // Prize revealed to user
  | 'claimed';              // Prize claimed, game complete
```

### 2. Event-Driven Transitions
```typescript
export type GameEvent =
  | { type: 'INITIALIZE'; payload: { trajectory, prize, seed } }
  | { type: 'DROP_REQUESTED' }
  | { type: 'START_POSITION_SELECTION' }
  | { type: 'POSITION_SELECTED'; payload: { dropZone, trajectory } }
  | { type: 'COUNTDOWN_COMPLETED' }
  | { type: 'LANDING_COMPLETED' }
  | { type: 'REVEAL_CONFIRMED' }
  | { type: 'CLAIM_REQUESTED' }
  | { type: 'RESET_REQUESTED' };
```

### 3. Pure Transition Function
```typescript
export function transition(
  state: GameState,
  context: GameContext,
  event: GameEvent
): { state: GameState; context: GameContext } {
  // Validate and execute transition
  // Throws error on invalid transitions
  // Returns new state + updated context
}
```

### 4. Context Preservation
```typescript
export interface GameContext {
  selectedIndex: number;      // Which slot ball landed in
  trajectory: TrajectoryPoint[];  // Ball's path
  currentFrame: number;        // Animation frame
  prize: PrizeConfig | null;   // Prize configuration
  seed: number;                // RNG seed for determinism
  dropZone?: DropZone;         // User-selected drop position
}
```

### 5. Telemetry Integration
Every transition is tracked:
```typescript
trackStateTransition({
  fromState: 'ready',
  toState: 'countdown',
  event: 'DROP_REQUESTED',
  duration: 3.2  // milliseconds
});
```

## Consequences

### Positive
- **Type Safety**: TypeScript enforces valid transitions at compile time
- **Explicit Flow**: Game flow is self-documenting
- **Easy Testing**: Pure function, easy to test all paths
- **Debugging**: Telemetry tracks every transition
- **Predictable**: No hidden state changes

### Negative
- **Verbosity**: Requires explicit handling of all events in all states
- **Boilerplate**: Each transition needs explicit code
- **Learning Curve**: Team must understand FSM concepts

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Pure Function** | Easier to test, no side effects |
| **Explicit Events** | Type-safe, self-documenting |
| **Immutable Context** | Prevents accidental mutations |
| **Error on Invalid** | Fail fast, catch bugs early |
| **RESET from Any State** | Allow escape hatch for recovery |

## Implementation

### State Transition Matrix

| From State | Event | To State | Notes |
|------------|-------|----------|-------|
| idle | INITIALIZE | ready | Load trajectory and prize |
| ready | DROP_REQUESTED | countdown | User clicks drop button |
| ready | START_POSITION_SELECTION | selecting-position | Enable drop zone selection |
| ready | RESET_REQUESTED | idle | Cancel/restart |
| selecting-position | POSITION_SELECTED | countdown | User chose drop zone |
| selecting-position | RESET_REQUESTED | idle | Cancel selection |
| countdown | COUNTDOWN_COMPLETED | dropping | Countdown finished |
| countdown | RESET_REQUESTED | idle | Cancel during countdown |
| dropping | LANDING_COMPLETED | landed | Ball settled in slot |
| dropping | RESET_REQUESTED | idle | Cancel during drop |
| landed | REVEAL_CONFIRMED | revealed | Show prize |
| landed | RESET_REQUESTED | idle | Skip prize reveal |
| revealed | CLAIM_REQUESTED | claimed | User claims prize |
| revealed | RESET_REQUESTED | idle | Cancel claim |
| claimed | RESET_REQUESTED | idle | Play again |

**Note on RESET_REQUESTED**: This event is handled from any state and always returns to `idle`. The actual reset orchestration (clearing refs, resetting animations, clearing prize data) is coordinated by the Reset Coordinator (see ADR 005). The state machine only handles the state transition itself.

### Reset Flow Integration

The state machine's `RESET_REQUESTED` event integrates with the Reset Coordinator:

```
User Action (resetGame)
  ↓
resetCoordinator.reset()
  ↓
1. Reset animation frame (currentFrameRef = 0)
2. Batch state updates (flushSync):
   - dispatch({ type: 'RESET_REQUESTED' }) ← State machine handles this
   - Clear prize data
   - Clear session data
3. Release locks (winningPrizeLockedRef)
4. Trigger re-initialization (sessionKey++)
```

The state machine is ONE PART of the reset flow, handling only the state transition. See `docs/RESET_ORCHESTRATION.md` for the complete reset sequence.

### Helper Functions
```typescript
// Centralized reset logic
function resetToIdle(): { state: GameState; context: GameContext } {
  return {
    state: 'idle',
    context: initialContext,
  };
}

// Standard transition helper
function transitionTo(
  state: GameState,
  context: GameContext
): { state: GameState; context: GameContext } {
  return { state, context };
}

// Initialization helper
function initializeGame(payload: InitPayload) {
  return transitionTo('ready', {
    selectedIndex: payload.selectedIndex,
    trajectory: payload.trajectory,
    currentFrame: 0,
    prize: payload.prize,
    seed: payload.seed,
  });
}
```

### Error Handling
```typescript
// Invalid transitions throw errors
if (state === 'idle' && event.type === 'DROP_REQUESTED') {
  throw new Error('Cannot DROP_REQUESTED from idle state');
}

// Tracked in telemetry
trackStateError({
  currentState: 'idle',
  event: 'DROP_REQUESTED',
  error: 'Invalid transition',
});
```

## Alternatives Considered

### Alternative 1: Redux/MobX
- ❌ Rejected: Overkill for game state
- ✅ More ecosystem tooling
- ❌ Higher complexity

### Alternative 2: XState
- ❌ Rejected: Additional dependency
- ✅ Powerful features (guards, actions)
- ❌ Learning curve

### Alternative 3: Ad-hoc Boolean Flags
- ❌ Rejected: Hard to maintain, error-prone
- ✅ Simpler initially
- ❌ Scales poorly

### Alternative 4: React Context + useReducer
- ⚠️ Partially used: FSM implemented as reducer
- ✅ Familiar React pattern
- ❌ Less explicit than pure FSM

## Validation

### Test Coverage
```typescript
describe('State Machine', () => {
  it('should transition idle → ready on INITIALIZE', () => {
    const result = transition('idle', initialContext, {
      type: 'INITIALIZE',
      payload: { trajectory, prize, seed }
    });
    expect(result.state).toBe('ready');
  });

  it('should throw error on invalid transition', () => {
    expect(() => {
      transition('idle', initialContext, { type: 'DROP_REQUESTED' });
    }).toThrow('Invalid event');
  });
});
```

### Telemetry Validation
- ✅ Every transition logged
- ✅ Invalid transitions tracked as errors
- ✅ Transition duration measured
- ✅ Context changes recorded

## Future Enhancements

### Potential Improvements
1. **Substates**: Nested states for complex screens
2. **Guards**: Conditional transitions based on context
3. **Actions**: Side effects on transition
4. **History**: Undo/redo capability
5. **Parallel States**: Multiple concurrent states

### Extension Points
```typescript
// Guard example
function canStartGame(context: GameContext): boolean {
  return context.prize !== null && context.trajectory.length > 0;
}

// Action example
function onEnterCountdown(context: GameContext): void {
  playCountdownSound();
  trackAnalytics('countdown_started');
}
```

## Migration Guide

### Before (Ad-hoc State)
```typescript
const [isPlaying, setIsPlaying] = useState(false);
const [hasLanded, setHasLanded] = useState(false);
const [showPrize, setShowPrize] = useState(false);

// Scattered logic
if (isPlaying && hasLanded) {
  setShowPrize(true);
}
```

### After (State Machine)
```typescript
const [state, dispatch] = useReducer(
  (s, ctx, e) => transition(s, ctx, e),
  'idle',
  initialContext
);

// Explicit transitions
dispatch({ type: 'LANDING_COMPLETED' });
dispatch({ type: 'REVEAL_CONFIRMED' });
```

## References

- [Finite State Machines](https://en.wikipedia.org/wiki/Finite-state_machine)
- [XState Documentation](https://xstate.js.org/)
- [State Machines in React](https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript)

## Related ADRs
- ADR 001: Cross-Platform Architecture
- ADR 002: Physics Engine Design
- **ADR 005: Reset Coordinator** - Orchestrates complete game reset including state machine RESET_REQUESTED event. See [reset flow diagram](../RESET_ORCHESTRATION.md) for integration details.

## Lessons Learned

1. **Explicit is Better**: Verbose code beats hidden bugs
2. **Type Safety Wins**: Compile-time checks prevent runtime errors
3. **Pure Functions Rock**: Easy to test, reason about, and debug
4. **Telemetry is Critical**: Can't debug what you can't see
5. **RESET is Essential**: Always provide escape hatch
