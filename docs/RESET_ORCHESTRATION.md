# Reset Orchestration Pattern

## Overview

This document describes the unified reset orchestration pattern for the Plinko game. Reset behavior was previously fragmented across multiple hooks with implicit dependencies, leading to potential bugs from partial resets or incorrect ordering.

## Problem Statement

**Before**: Reset logic was spread across:
1. `usePlinkoGame.resetGame()` - Orchestrated reset but coupled to specific implementation
2. `usePrizeSession` - `forceFreshSeedRef` flag management
3. `useGameState` - `initializedSessionId` tracking, `winningPrizeLockedRef` management
4. `useGameAnimation` - Frame reset via `resetFrame()`
5. State machine - `RESET_REQUESTED` event handling

**Issues**:
- One missed ref reset could lock the game
- No explicit ordering guarantees
- Implicit coupling between hooks
- Difficult to test edge cases
- No visibility into partial reset failures

## Solution: Reset Coordinator

A centralized `GameResetCoordinator` class that:
1. Encapsulates all reset state and refs
2. Defines explicit reset sequence with ordering
3. Provides guards against partial resets
4. Includes telemetry/logging for reset operations
5. Makes reset testable and traceable

## Reset Sequence

The reset must happen in this exact order:

### Phase 1: Animation Cleanup
```
1. currentFrameRef.current = 0
2. Call resetFrame() to cleanup animation timers
```
**Why first**: Prevents animation from accessing stale state during reset

### Phase 2: State Cleanup
```
3. Dispatch RESET_REQUESTED to state machine (transitions to 'idle')
4. Clear winningPrize state (setWinningPrize(null))
5. Clear currentWinningIndex state (setCurrentWinningIndex(undefined))
```
**Why second**: Clears derived state before clearing source data

**State Machine Integration**: The `RESET_REQUESTED` event is handled by the state machine (see `src/game/stateMachine.ts` and ADR 003). The state machine validates the transition and updates game state to `idle`. This is ONE PART of the complete reset flow - the coordinator ensures all other cleanup happens in the correct order.

### Phase 3: Session Cleanup
```
6. Clear prizeSession (setPrizeSession(null))
7. Clear prizes array (setPrizes([]))
```
**Why third**: Prevents re-initialization with stale session data

### Phase 4: Lock Release
```
8. winningPrizeLockedRef.current = false
9. forceFreshSeedRef.current = true
```
**Why fourth**: Allows new session to initialize fresh

### Phase 5: Trigger Re-initialization
```
10. Increment sessionKey to trigger new prize load
```
**Why last**: Only after all cleanup is complete

## Reset Coordinator API

```typescript
interface GameResetCoordinator {
  // Primary reset method - executes full reset sequence
  reset(): void;

  // Check if reset is in progress (guards against concurrent resets)
  isResetting(): boolean;

  // Get reset statistics for debugging
  getResetMetrics(): ResetMetrics;
}

interface ResetMetrics {
  totalResets: number;
  lastResetTimestamp: number;
  lastResetDuration: number;
  failedResets: number;
}
```

## Implementation Details

### Reset Coordinator Class

The coordinator uses a fluent interface pattern internally to ensure all steps execute:

```typescript
class ResetCoordinator {
  private resetInProgress = false;

  reset(context: ResetContext): void {
    if (this.resetInProgress) {
      console.warn('Reset already in progress, skipping duplicate');
      return;
    }

    this.resetInProgress = true;
    const startTime = now();

    try {
      this.executeResetSequence(context);
      this.trackSuccess(startTime);
    } catch (error) {
      this.trackFailure(error);
      throw error;
    } finally {
      this.resetInProgress = false;
    }
  }
}
```

### Guard Mechanisms

1. **Concurrency Guard**: Prevents multiple simultaneous resets
2. **Phase Completion Guard**: Each phase must complete before next begins
3. **Lock State Validation**: Verifies lock release succeeded

### Telemetry

Every reset operation logs:
- Reset trigger source (user action, error recovery, etc.)
- Phase timings
- Success/failure status
- Any warnings or anomalies

## Usage Examples

### Standard Reset (User Closes Prize Modal)

```typescript
const coordinator = useResetCoordinator({
  currentFrameRef,
  resetFrame,
  dispatch,
  setWinningPrize,
  setCurrentWinningIndex,
  setPrizeSession,
  setPrizes,
  winningPrizeLockedRef,
  forceFreshSeedRef,
  setSessionKey,
});

// User closes prize reveal
coordinator.reset();
```

### Reset During Error Recovery

```typescript
try {
  generateTrajectory(...);
} catch (error) {
  console.error('Trajectory generation failed:', error);
  coordinator.reset(); // Safe, idempotent reset
}
```

### Reset During State Transition

```typescript
// From App.tsx viewport change handler
if (state === 'ready' || state === 'revealed') {
  coordinator.reset(); // Atomic reset before re-initialization
}
```

## Testing Strategy

### Unit Tests

1. **Sequence Verification**: Mock all callbacks, verify they're called in exact order
2. **Concurrency**: Attempt concurrent resets, verify only one executes
3. **Partial Failure**: Simulate failure in each phase, verify cleanup still occurs
4. **Metrics**: Verify reset metrics are tracked correctly

### Integration Tests

1. **Full Game Flow Reset**: Run game → reset → verify all state cleared → run again
2. **Rapid Reset**: Reset multiple times quickly, verify no corruption
3. **Reset During Animation**: Reset while ball is dropping, verify clean stop
4. **Reset During Error**: Trigger error → reset → verify recovery

## Migration Path

### Step 1: Create Reset Coordinator (Non-Breaking)
Create the coordinator utility without changing existing code.

### Step 2: Integrate into usePlinkoGame
Replace current `resetGame` implementation with coordinator.

### Step 3: Add Logging (Non-Breaking)
Enable telemetry to verify reset behavior in production.

### Step 4: Deprecate Direct Access
Mark individual reset setters as internal-only.

## Benefits

1. **Correctness**: Impossible to miss a reset step or use wrong order
2. **Debuggability**: Telemetry shows exactly what happened during reset
3. **Testability**: Single, well-defined contract to test
4. **Maintainability**: New reset requirements added in one place
5. **Performance**: Can add optimizations (batching, memoization) centrally

## Anti-Patterns to Avoid

❌ **Don't**: Call individual reset setters directly
```typescript
// BAD - Partial reset, wrong order
setWinningPrize(null);
resetFrame();
```

✅ **Do**: Use coordinator
```typescript
// GOOD - Complete, ordered reset
coordinator.reset();
```

❌ **Don't**: Reset during critical operations
```typescript
// BAD - Reset while animation is computing
if (state === 'dropping') coordinator.reset();
```

✅ **Do**: Wait for safe state or cancel animation first
```typescript
// GOOD - Safe reset point
if (state === 'revealed' || state === 'claimed') {
  coordinator.reset();
}
```

## Future Enhancements

1. **Reset Modes**: Support partial resets (e.g., "reset UI only", "reset session only")
2. **Rollback**: If reset fails midway, rollback to previous stable state
3. **Reset Queue**: Queue resets if one is in progress rather than dropping
4. **Analytics Integration**: Send reset metrics to analytics service
5. **Performance Budget**: Track reset time, warn if exceeds threshold

## References

### Code
- Reset Coordinator: `/src/hooks/useResetCoordinator.ts`
- State Machine: `/src/game/stateMachine.ts` (handles RESET_REQUESTED event)
- Main Game Hook: `/src/hooks/usePlinkoGame.ts`
- Prize Session Hook: `/src/hooks/usePrizeSession.ts`
- Game State Hook: `/src/hooks/useGameState.ts`
- Animation Hook: `/src/hooks/useGameAnimation.ts`

### Documentation
- **ADR 003: State Machine Pattern** - Defines RESET_REQUESTED event and state transitions
- **ADR 005: Reset Coordinator** - Architectural decision for centralized reset
- **ADR 001: Cross-Platform Architecture** - Context for platform-agnostic reset design
