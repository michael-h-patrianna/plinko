# Bug Fix: Ball Invisible After Launch

**Date**: 2025-10-07
**Severity**: CRITICAL
**Status**: FIXED ✅

## Symptoms

- Ball launcher releases the ball
- Ball becomes invisible (not rendered)
- Trajectory logic runs (game ends after expected time)
- No collision animations with pegs/walls visible
- Position data appears to be missing or not updating visuals

## Root Cause

During the recent hook refactoring (splitting `usePlinkoGame.ts` into specialized hooks), the `currentFrameRef` reference was **duplicated** instead of shared between hooks.

### Before (Broken State)

```
usePlinkoGame
  ├─ currentFrameRef (instance A) ───► passed to useGameState
  │
  └─ useGameAnimation
       └─ currentFrameRef (instance B) ◄─── animation loop updates THIS one
```

**The Problem**:
- Animation loop updates `currentFrameRef` instance B
- Ball position calculation reads `currentFrameRef` instance A
- Instance A is never updated, so it always reads frame 0
- Ball appears at trajectory[0] position (invisible/stuck)

### After (Fixed State)

```
usePlinkoGame
  └─ currentFrameRef (single instance) ───┬─► passed to useGameState
                                           │
                                           └─► passed to useGameAnimation
                                                 └─► animation loop updates it
```

**The Solution**:
- Single `currentFrameRef` created in `usePlinkoGame`
- Passed as parameter to both `useGameAnimation` and `useGameState`
- Animation loop and position calculation now share the same ref
- Ball position updates correctly during animation

## Files Changed

### 1. `/src/hooks/useGameAnimation.ts`

**Before**:
```typescript
interface UseGameAnimationOptions {
  gameState: GameState;
  trajectory: TrajectoryPoint[];
  onLandingComplete: () => void;
}

export function useGameAnimation(options: UseGameAnimationOptions) {
  const { gameState, trajectory, onLandingComplete } = options;

  // PROBLEM: Creating its own ref
  const currentFrameRef = useRef(0);
  // ...
}
```

**After**:
```typescript
interface UseGameAnimationOptions {
  gameState: GameState;
  trajectory: TrajectoryPoint[];
  onLandingComplete: () => void;
  currentFrameRef: React.MutableRefObject<number>; // ✅ Now receives ref from parent
}

export function useGameAnimation(options: UseGameAnimationOptions) {
  const { gameState, trajectory, onLandingComplete, currentFrameRef } = options;

  // ✅ No longer creates its own ref - uses the passed one
  // ...
}
```

### 2. `/src/hooks/usePlinkoGame.ts`

**Before**:
```typescript
const { frameStore, resetFrame } = useGameAnimation({
  gameState: state,
  trajectory,
  onLandingComplete: () => {
    dispatch({ type: 'LANDING_COMPLETED' });
  },
  // PROBLEM: Not passing currentFrameRef
});
```

**After**:
```typescript
const { frameStore, resetFrame } = useGameAnimation({
  gameState: state,
  trajectory,
  onLandingComplete: () => {
    dispatch({ type: 'LANDING_COMPLETED' });
  },
  currentFrameRef, // ✅ Now passes the shared ref
});
```

## Data Flow Verification

```
1. usePlinkoGame creates currentFrameRef
      ↓
2. Passes to useGameAnimation
      ↓
3. Animation loop updates currentFrameRef.current = frameIndex
      ↓
4. Passes same currentFrameRef to useGameState
      ↓
5. getBallPosition reads currentFrameRef.current
      ↓
6. Returns trajectory[currentFrame] with correct position
      ↓
7. Ball component receives position and renders correctly
```

## Testing

✅ TypeScript compilation passes
✅ Build succeeds
✅ All synchronization checks pass (verified via script)

## Prevention

**Lesson Learned**: When refactoring shared state/refs into separate hooks:
1. Identify all refs/state that must be synchronized
2. Create a single source of truth (in parent hook)
3. Pass refs down as parameters, don't recreate them
4. Document which refs are shared vs local in comments
5. Add verification scripts to catch synchronization breaks

## Related Files

- `/src/hooks/useGameAnimation.ts` - Animation loop management
- `/src/hooks/usePlinkoGame.ts` - Main game orchestration
- `/src/hooks/useGameState.ts` - State machine and ball position calculation
- `/src/components/game/Ball.tsx` - Ball rendering component
- `/scripts/tools/verify-ball-position-fix.mjs` - Verification script

## Verification

Run the verification script to confirm the fix:

```bash
node scripts/tools/verify-ball-position-fix.mjs
```

Expected output: All 6 checks should pass ✅
