# Collision Timing Fix

## Problem Description

During ball drop animation, peg flash animations and audio effects were progressively drifting/delaying relative to when the ball visually appeared to hit pegs. This became more noticeable as the ball moved faster later in the drop.

## Root Cause

The trajectory generation stores ball positions AFTER collision resolution (post-bounce), but collision data (`pegsHit`) is attached to the same frame. When rendering:

1. **Trajectory Generation** (`simulation.ts`):
   - Collision detection finds collision point along movement path
   - Ball is repositioned to collision point + bounce physics applied
   - Trajectory stores **POST-BOUNCE** position with collision data

2. **Rendering** (`OptimizedBallRenderer.tsx`):
   - Ball is drawn at cached position (post-bounce, already away from peg)
   - Collision effects (peg flash + audio) trigger at this same moment
   - **Result**: Ball appears to have already passed the peg when effects trigger

### Why It Gets Progressively Worse

It's not actually accumulating drift - it's **more noticeable at higher speeds**. When the ball moves faster (later in drop), the distance between pre-collision and post-bounce positions is larger, making the visual desynchronization more obvious.

## Solution

Implemented **1-frame look-ahead** in collision detection during rendering:

### Implementation Details

**File**: `src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

**Lines 319-347**: Peg collision detection
```typescript
// COLLISION DETECTION: Peg flashes (frame-drop-safe with look-ahead)
// TIMING FIX: Trigger effects 1 frame early to synchronize with visual ball position
// The trajectory stores POST-BOUNCE positions, but collisions happen earlier in the frame.
// By looking ahead, we trigger effects when the ball VISUALLY appears to hit the peg.
if (pegHitFrames) {
  // Look-ahead: Check for collisions 1 frame in the future
  const COLLISION_LOOKAHEAD = 1;
  const lookAheadFrame = currentFrame + COLLISION_LOOKAHEAD;

  pegHitFrames.forEach((hitFrames, pegId) => {
    const lastChecked = lastCheckedPegFrameRef.current.get(pegId) ?? -1;

    // Find hits that will occur in the next frame window
    const newHits = hitFrames.filter(hitFrame => hitFrame > lastChecked && hitFrame <= lookAheadFrame);

    if (newHits.length > 0) {
      // Peg will be hit! Trigger flash imperatively via driver
      driver.updatePegFlash(pegId, true);

      // Play peg hit sound with throttling
      if (sfxController) {
        sfxController.play('ball-peg-hit', { throttle: true });
      }

      // Update last checked frame to the earliest hit in this window
      lastCheckedPegFrameRef.current.set(pegId, Math.min(...newHits));
    }
  });
}
```

**Lines 349-382**: Board wall collision detection (same fix applied for consistency)

**Lines 419-440**: Slot collision detection (walls and floor)
```typescript
// Update collision effects ONLY when in bucket zone (with look-ahead)
// TIMING FIX: Use look-ahead to synchronize slot collision effects with visual ball position
// Similar to peg/wall collisions, check upcoming frame for more accurate timing
if (newActiveSlot !== null && bucketZoneY !== undefined && position.y >= bucketZoneY && trajectory) {
  const COLLISION_LOOKAHEAD = 1;
  const lookAheadFrame = Math.min(currentFrame + COLLISION_LOOKAHEAD, (trajectoryLength ?? trajectory.length) - 1);

  // Get trajectory point for look-ahead frame to predict upcoming collisions
  const lookAheadPoint = trajectory[lookAheadFrame];
  if (lookAheadPoint) {
    // Check upcoming frame for collisions - this triggers effects when ball visually appears to hit
    const wallImpact = lookAheadPoint.bucketWallHit || null;
    const floorImpact = lookAheadPoint.bucketFloorHit || false;

    // Calculate impact speed for realistic animation intensity
    const vx = lookAheadPoint.vx ?? 0;
    const vy = lookAheadPoint.vy ?? 0;
    const impactSpeed = Math.sqrt(vx * vx + vy * vy);

    driver.updateSlotCollision(newActiveSlot, wallImpact, floorImpact, impactSpeed);
  }
}
```

### How It Works

1. Instead of checking `hitFrame <= currentFrame`, we check `hitFrame <= currentFrame + 1`
2. This triggers effects 1 frame BEFORE the ball reaches its post-bounce position
3. Effects now coincide with when the ball VISUALLY appears to touch the peg
4. Last checked frame is set to the earliest hit in the window to prevent duplicates

### Benefits

- **Visual Synchronization**: Peg flash animations trigger when ball visually hits peg
- **Audio Synchronization**: Sound effects play at the correct moment
- **Frame-Drop Safe**: Still handles skipped frames correctly
- **No Duplicate Effects**: Cooldown mechanism prevents duplicate triggers
- **Consistent**: Applied to all collision types (pegs, board walls, slot walls, slot floor)

## Testing

The collision cooldown tests in `src/tests/unit/game/collision-cooldown.test.ts` verify the physics layer cooldown mechanism (trajectory generation). The look-ahead is a rendering-layer optimization and doesn't affect the physics tests.

Manual testing should verify:
1. Peg flash animations appear synchronized with visual ball-peg contact
2. Board wall impact effects trigger when ball visually hits left/right boundaries
3. Slot wall impact effects trigger when ball visually hits bucket walls
4. Slot floor impact effects trigger when ball visually lands on bucket floor
5. Audio plays when ball appears to hit surfaces, not after
6. No duplicate flashes or sounds during slow motion
7. Consistent behavior at different ball speeds across all collision types

## Related Files

- `src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx` - Main fix implementation (all collision look-ahead logic)
- `src/components/game/PlinkoBoard/PlinkoBoard.tsx` - Passes trajectory prop to renderer
- `src/game/trajectory/simulation.ts` - Trajectory generation (stores post-bounce positions)
- `src/game/trajectory/collision.ts` - Collision detection (physics layer - pegs)
- `src/game/trajectory/bucket.ts` - Bucket collision physics (slot walls and floor)
- `vitest.config.ts` - Added path aliases for test compatibility
- `docs/SOUND_INTEGRATION_SUMMARY.md` - Related audio integration docs

## Performance Impact

Negligible - only changes the frame comparison from `<= currentFrame` to `<= currentFrame + 1`. No additional computations or memory allocations.
