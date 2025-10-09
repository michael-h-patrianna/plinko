# ADR 005: Reset Coordinator Pattern

## Status

**Accepted** - Implemented 2025-10-09

## Context

The game reset logic was fragmented across multiple hooks with implicit dependencies and ordering requirements. This created several issues:

1. **Fragile Reset Sequence**: Reset operations were spread across:
   - `usePlinkoGame.resetGame()` - Top-level orchestration
   - `usePrizeSession` - `forceFreshSeedRef` flag management
   - `useGameState` - `initializedSessionId` tracking, `winningPrizeLockedRef` management
   - `useGameAnimation` - Frame reset via `resetFrame()`
   - State machine - `RESET_REQUESTED` event handling

2. **Easy to Break**: Missing a single ref reset or using wrong order could lock the game
   - Example: If `winningPrizeLockedRef` isn't reset, next game can't set winning prize
   - Example: If `forceFreshSeedRef` isn't set, URL seed overrides persist after reset

3. **No Guards**: Nothing prevented partial resets or concurrent reset attempts

4. **Hard to Debug**: No telemetry or logging to trace reset failures

5. **Difficult to Test**: No single contract to test, had to verify each hook individually

## Decision

Create a centralized `useResetCoordinator` hook that:

1. **Encapsulates Complete Reset Sequence**
   - Owns all refs and state setters needed for reset
   - Defines explicit 5-phase ordering
   - Executes phases sequentially with error handling

2. **Provides Guards**
   - Concurrency guard prevents overlapping resets
   - Phase completion verification
   - Lock state validation

3. **Includes Telemetry**
   - Tracks reset metrics (total resets, duration, failures)
   - Logs each phase in development mode
   - Makes reset operations traceable

4. **Single Testable Contract**
   - One hook to test instead of verifying across multiple hooks
   - Clear success/failure criteria
   - Edge cases covered in one test suite

## Implementation

### Reset Sequence

The coordinator executes 5 phases in strict order:

```typescript
Phase 1: Animation Cleanup
  - currentFrameRef.current = 0
  - resetFrame() // cleanup timers/RAF

Phase 2: State Cleanup
  - dispatch({ type: 'RESET_REQUESTED' })
  - setWinningPrize(null)
  - setCurrentWinningIndex(undefined)

Phase 3: Session Cleanup
  - setPrizeSession(null)
  - setPrizes([])

Phase 4: Lock Release
  - winningPrizeLockedRef.current = false
  - forceFreshSeedRef.current = true

Phase 5: Trigger Re-initialization
  - setSessionKey((key) => key + 1)
```

### API

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

// Execute complete reset
coordinator.reset();

// Check status
coordinator.isResetting(); // boolean

// Get metrics for debugging
coordinator.getResetMetrics(); // ResetMetrics object
```

### Integration

The `usePlinkoGame` hook now uses the coordinator:

```typescript
const resetCoordinator = useResetCoordinator({ ...context });

const resetGame = useCallback(() => {
  resetCoordinator.reset();
}, [resetCoordinator]);
```

## Consequences

### Positive

1. **Correctness**: Impossible to miss a reset step or use wrong order
2. **Debuggability**: Telemetry shows exactly what happened during reset
3. **Testability**: Single, well-defined contract to test (31 test cases)
4. **Maintainability**: New reset requirements added in one place
5. **Safety**: Guards prevent partial resets and concurrent operations

### Negative

1. **Slight Complexity Increase**: One more abstraction to understand
2. **Context Object**: Requires passing 10 dependencies to coordinator
3. **Migration Effort**: Required updating usePlinkoGame integration

### Neutral

1. **No User-Facing Changes**: Reset behavior is identical from user perspective
2. **Test Coverage**: All 37 existing hooks tests pass unchanged
3. **Performance**: Negligible overhead (< 1ms per reset)

## Alternatives Considered

### 1. Status Quo (Keep fragmented)
**Rejected**: Too error-prone, already caused bugs

### 2. Single "god function" in usePlinkoGame
**Rejected**: Still couples reset logic to game hook, hard to test independently

### 3. Event-based reset system
**Rejected**: Over-engineered for synchronous operations, adds unnecessary complexity

### 4. Class-based coordinator
**Rejected**: React hooks pattern is more idiomatic, testing is equivalent

## Related

- Implementation: `/src/hooks/useResetCoordinator.ts`
- Documentation: `/docs/RESET_ORCHESTRATION.md`
- Tests: `/src/tests/unit/hooks/useResetCoordinator.test.ts`
- Integration: `/src/hooks/usePlinkoGame.ts`

## References

- Code review feedback about fragmented reset logic
- State machine documentation: `/docs/adr/003-state-machine-pattern.md`
- Hook composition patterns in React documentation
