# Collision Detection Deep-Dive Analysis

**Date**: 2025-10-11
**Status**: ✅ Implemented - Visual feedback pass removed (Solution Option B)

## Implementation Status

**Implementation Date**: 2025-10-11
**Solution Applied**: Removed visual feedback pass entirely (lines 184-214 in `collision.ts`)
**Result**: False positives eliminated, collision detection working correctly via CCD only

### Changes Made
- Commented out visual feedback pass with detailed explanation (collision.ts:184-214)
- Added direct `pegsHitThisFrame.push()` in physics collision handler (collision.ts:181)
- Created CCD coverage validation test suite (`ccd-coverage.test.ts`)
- Updated collision cooldown tests to reflect new behavior
- All tests passing ✅

### Validation
- CCD coverage test: 100% detection of significant collisions (0 missed)
- Peg coverage test: 97.4% peg coverage across 500 trajectories
- Collision cooldown test: Confirms no false positives after cooldown expiry

See `docs/collision-refactor-plan.md` for full implementation details.

---

## Executive Summary

The collision timing and sound effect issues stem from an architectural mismatch between physics simulation and rendering. The core problem is that the "visual feedback pass" in collision detection creates duplicate collision entries when the 10-frame cooldown expires while the ball is still lingering near a peg after bouncing.

---

## How the System Works - Complete Data Flow

### Question 1: How does the system "know" when a ball hits an element?

There are TWO collision detection systems running:

#### System 1: Physics Layer (Pre-computation in `collision.ts` lines 44-205)

**Timing**: Runs ONCE before animation starts, generates 400-800 frames

**Process**:
1. Uses continuous collision detection (CCD) - checks if ball's MOVEMENT PATH intersects peg (lines 57-84)
2. Uses parametric line-circle intersection math: `ax² + bx + c = 0`
3. When collision found:
   - Moves ball to exact collision point using parameter `t` (line 105)
   - Applies bounce physics with reflection and restitution (lines 108-165)
   - Repositions ball to safe distance: `COLLISION_RADIUS + 0.1` (line 125)
4. Records collision in `recentCollisions` map with 10-frame cooldown (lines 87-91, 170)

**THEN a SECOND pass happens** (lines 183-202):
```typescript
// After physics collision, detect ALL pegs the ball is near for visual feedback
for (const peg of pegs) {
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= PHYSICS.COLLISION_RADIUS + 2) {  // Within 18px
    const lastHit = recentCollisions.get(pegKey);

    // Add to pegsHit if:
    // - Never hit before (lastHit === undefined)
    // - Hit THIS frame (lastHit === frame) - actual collision
    // - Cooldown period passed (frame - lastHit >= 10)
    if (lastHit === undefined || lastHit === frame || frame - lastHit >= 10) {
      pegsHitThisFrame.push({ row: peg.row, col: peg.col });
    }
  }
}
```

**Output**: Trajectory array where each frame contains `pegsHit: Array<{row, col}>`

#### System 2: Rendering Layer (Real-time in `OptimizedBallRenderer.tsx` lines 327-364)

**Timing**: Runs during animation at display FPS (30-60 FPS)

**Process**:
1. Receives pre-built `pegHitFrames` map: `Map<"row-col", number[]>`
   - Built in `PlinkoBoard.tsx` lines 152-167
   - Maps peg IDs to arrays of frame numbers when they appear in `pegsHit`
2. During RAF loop:
   ```typescript
   const lastChecked = lastCheckedPegFrameRef.current.get(pegId) ?? -1;
   const newHits = hitFrames.filter(hitFrame =>
     hitFrame > lastChecked && hitFrame <= currentFrame + 1  // Look-ahead
   );

   if (newHits.length > 0) {
     const collisionFrame = Math.min(...newHits);
     lastCheckedPegFrameRef.current.set(pegId, collisionFrame);

     // Trigger flash
     driver.updatePegFlash(pegId, true);

     // Play sound with velocity check + throttle
     const impactSpeed = Math.sqrt(vx * vx + vy * vy);
     if (impactSpeed >= 50) {  // MIN_AUDIBLE_IMPACT_SPEED
       sfxController.play('ball-peg-hit', { throttle: true });
     }
   }
   ```

---

### Question 2: How do we ensure what user sees is in sync with what system sees?

#### The Core Problem

**Physics stores ball position AFTER bounce resolution**:
```typescript
// collision.ts line 105-125
x = oldState.x + (state.x - oldState.x) * closestT;  // Collision point
y = oldState.y + (state.y - oldState.y) * closestT;

// Apply bounce physics...

// Reposition to safe distance
x = peg.x + nx * (PHYSICS.COLLISION_RADIUS + 0.1);
y = peg.y + ny * (PHYSICS.COLLISION_RADIUS + 0.1);
```

But collision data (`pegsHit`) is attached to the SAME frame as the post-bounce position.

**Timeline of a collision**:
- **t=0.0**: Ball at (100, 90)
- **t=0.3**: Ball intersects peg at (105, 95) ← VISUAL collision point
- **t=0.4**: Bounce physics applied
- **t=1.0**: Ball at (110, 92) ← POST-BOUNCE position stored in trajectory[frame]

When rendering plays frame N:
1. Ball drawn at (110, 92) - already away from peg
2. Collision check triggers effects at frame N
3. **Result**: Ball appears past the peg when flash/sound play

#### Current "Fix" (Band-aid approach)

`OptimizedBallRenderer.tsx` lines 324-330:
```typescript
// TIMING FIX: Trigger effects 1 frame early to synchronize with visual ball position
// The trajectory stores POST-BOUNCE positions, but collisions happen earlier in the frame.
const COLLISION_LOOKAHEAD = 1;
const lookAheadFrame = currentFrame + COLLISION_LOOKAHEAD;
```

**What it does**:
- Checks `hitFrame <= currentFrame + 1` instead of `<= currentFrame`
- Triggers effects 1 frame BEFORE ball reaches post-bounce position
- Attempts to align effect timing with visual contact point

**Why it's insufficient**:
- Only compensates for 1-frame offset (~16ms at 60 FPS)
- Doesn't account for frame skipping when display FPS < trajectory FPS
- Doesn't address the root cause: post-bounce position storage
- Doesn't help with duplicate collision detection

---

### Question 3: How can system trigger animations/sounds in sync with visual collision?

#### Current Synchronization Approach

**Frame Progression** (`ballAnimationDriver.web.ts` lines 75-98):
```typescript
const tick = (timestamp: number) => {
  const elapsed = timestamp - startTimestamp;
  const currentFrameIndex = Math.min(
    Math.floor(elapsed / frameInterval),  // frameInterval = 1000 / 60
    totalFrames - 1
  );

  // Throttle rendering based on display FPS
  const timeSinceLastRender = timestamp - lastRenderTime;
  if (timeSinceLastRender >= renderInterval) {
    update(currentFrameIndex);  // Trigger collision checks
    lastRenderTime = timestamp;
  }

  if (currentFrameIndex < totalFrames - 1) {
    rafId = animationAdapter.requestFrame(tick);
  }
};
```

**Collision Detection Timing** (`OptimizedBallRenderer.tsx` lines 339-362):
```typescript
if (newHits.length > 0) {
  // Process ONLY earliest hit
  const collisionFrame = Math.min(...newHits);

  // Update last checked FIRST to prevent re-processing
  lastCheckedPegFrameRef.current.set(pegId, collisionFrame);

  // Trigger visual effect imperatively
  driver.updatePegFlash(pegId, true);

  // Check velocity for sound
  const collisionPoint = trajectory[collisionFrame];
  const vx = collisionPoint.vx ?? 0;
  const vy = collisionPoint.vy ?? 0;
  const impactSpeed = Math.sqrt(vx * vx + vy * vy);

  // Play sound if audible
  if (impactSpeed >= MIN_AUDIBLE_IMPACT_SPEED) {
    sfxController.play('ball-peg-hit', { throttle: true });
  }
}
```

#### Frame Skipping Problem

**Scenario at 30 FPS display**:
- Trajectory: 60 FPS (16.67ms per frame)
- Display: 30 FPS (33.33ms per frame)
- Each render spans ~2 trajectory frames

**What happens**:
1. Render at frame 10 → checks frames 10-11
2. Render at frame 12 → checks frames 12-13
3. If collision at frame 11, caught in first check ✓
4. If collision at frame 12, caught in second check ✓
5. But timing is off - collision frame 11 triggers when ball visually at frame 10

**Look-ahead attempts to compensate but has limits**:
- Only looks 1 frame ahead
- If display lags and jumps 3 frames, collisions can be missed or bunched

---

### Question 4: How does system distinguish true collision from false positives?

There are FIVE mechanisms attempting this:

#### Mechanism 1: Physics Cooldown (`collision.ts:87-91`)

```typescript
// Check cooldown
const pegKey = `${peg.row}-${peg.col}`;
if (recentCollisions.has(pegKey)) {
  const lastHit = recentCollisions.get(pegKey)!;
  if (frame - lastHit < 10) continue;  // Skip physics collision
}
```

**What it does**:
- Prevents physics bounce calculation within 10 frames of same peg
- Stored in `recentCollisions` Map for O(1) lookup

**Limitation**:
- Cooldown expires after 10 frames (166ms at 60 FPS)
- If ball still near peg after cooldown, next frame will detect "new" collision
- Only blocks physics response, not visual feedback

#### Mechanism 2: Visual Feedback Pass Cooldown (`collision.ts:195-200`)

```typescript
const lastHit = recentCollisions.get(pegKey);

// Add to pegsHit if:
// - Never hit before (lastHit === undefined)
// - Hit THIS frame (lastHit === frame) - this is the actual collision
// - Cooldown period has passed (frame - lastHit >= 10)
if (lastHit === undefined || lastHit === frame || frame - lastHit >= 10) {
  pegsHitThisFrame.push({ row: peg.row, col: peg.col });
}
```

**What it does**:
- Uses SAME cooldown map as physics layer
- Checks if ball within `COLLISION_RADIUS + 2` (18px) of any peg
- Adds peg to `pegsHit` array if conditions met

**❌ THIS IS THE PRIMARY PROBLEM**:
When cooldown expires at frame 110, if ball still within 18px detection radius:
- Condition `frame - lastHit >= 10` evaluates to true
- Peg gets added to `pegsHit` array AGAIN
- Not a new physical collision, just lingering near peg after bounce
- Creates duplicate entry in trajectory data

#### Mechanism 3: Renderer Frame Tracking (`OptimizedBallRenderer.tsx:334-344`)

```typescript
const lastChecked = lastCheckedPegFrameRef.current.get(pegId) ?? -1;

const newHits = hitFrames.filter(hitFrame =>
  hitFrame > lastChecked && hitFrame <= lookAheadFrame
);

if (newHits.length > 0) {
  const collisionFrame = Math.min(...newHits);
  lastCheckedPegFrameRef.current.set(pegId, collisionFrame);
  // ... trigger effects
}
```

**What it does**:
- Tracks last FRAME NUMBER checked for each peg
- Only processes collision frames not yet seen
- Uses `Math.min()` to handle multiple collision frames in window

**Limitation**:
- Tracks "last checked frame", NOT "last collision event"
- Doesn't prevent detecting frame 110 collision that's actually same event as frame 100
- Only prevents processing same frame number twice
- If `pegHitFrames.get("3-2")` contains `[100, 110]`, both will trigger effects

#### Mechanism 4: Impact Speed Filter (`OptimizedBallRenderer.tsx:331, 359`)

```typescript
const MIN_AUDIBLE_IMPACT_SPEED = 50; // px/s - micro-collisions below this are inaudible

const collisionPoint = trajectory[collisionFrame];
const vx = collisionPoint.vx ?? 0;
const vy = collisionPoint.vy ?? 0;
const impactSpeed = Math.sqrt(vx * vx + vy * vy);

if (impactSpeed >= MIN_AUDIBLE_IMPACT_SPEED) {
  sfxController.play('ball-peg-hit', { throttle: true });
}
```

**What it does**:
- Checks velocity magnitude at collision frame
- Filters micro-bounces < 50 px/s (slow movements)
- Prevents sound spam during very slow ball movements

**Limitation**:
- After 10-frame cooldown, ball may have 60-100 px/s while lingering
- Still "audible" threshold, so sound plays again
- Doesn't distinguish between "new impact" vs "lingering from previous impact"

#### Mechanism 5: Sound Throttle (`SFXController.ts:74-86`)

```typescript
if (options?.throttle) {
  const throttleDelay = this.throttleDelays.get(id);  // 50ms for ball-peg-hit
  const now = this.performanceAdapter.now();
  const lastPlay = this.lastPlayTimestamps.get(id);

  if (lastPlay !== undefined && now - lastPlay < throttleDelay) {
    return -1; // Throttled - skip playback
  }

  this.lastPlayTimestamps.set(id, now);
}
```

**What it does**:
- Global 50ms throttle for 'ball-peg-hit' sound
- Prevents sound playing < 50ms apart REGARDLESS of which peg
- High-precision timing via `performance.now()`

**Configured in** `useAudioPreloader.ts:107`:
```typescript
sfxController.setThrottleDelay('ball-peg-hit', 50); // Max once per 50ms
```

**Limitation**:
- 50ms = ~3 frames at 60 FPS
- If false collisions are 10 frames apart (166ms), throttle has expired
- Sound plays again even though it's same physical event
- Can also silence legitimate distinct peg hits if they occur < 50ms apart

---

## The ACTUAL Root Cause

After complete code tracing, here's what's really happening:

### The Visual Feedback Pass Creates False Collision Entries

**Detailed Timeline of a Collision**:

1. **Frame 100**: Ball hits peg (actual physical collision)
   - CCD detects intersection along movement path
   - Physics bounce applied, ball repositioned to safe distance
   - `recentCollisions.set("3-2", 100)` ← Cooldown starts
   - Visual feedback pass: distance check passes, `lastHit === frame` is true
   - `pegsHitThisFrame.push({row: 3, col: 2})` ← First entry

2. **Frames 101-109**: Ball moved away but still within 18px
   - Physics pass: cooldown active, collision skipped ✓
   - Visual feedback pass: distance < 18px, but `frame - lastHit < 10`
   - NOT added to `pegsHit` ✓

3. **Frame 110**: Cooldown expires, ball STILL within 18px (slow after bounce)
   - Physics pass: cooldown expired, but ball not on collision path, no physics collision ✓
   - Visual feedback pass: distance < 18px, `frame - lastHit >= 10` is TRUE
   - Line 198 condition satisfied: `frame - lastHit >= 10` (110 - 100 = 10)
   - `pegsHitThisFrame.push({row: 3, col: 2})` ← **DUPLICATE ENTRY**

4. **Result**: `pegHitFrames` map contains:
   ```typescript
   "3-2" → [100, 110]  // Two frames for same physical event
   ```

5. **Rendering**:
   - Frame 100 triggers: flash + sound ✓
   - Frame 110 triggers: flash + sound ❌ (false positive)
   - User hears/sees collision twice for single impact

### Why This Wasn't Caught

**Look-ahead doesn't help**:
- Look-ahead (line 329-330) compensates for visual position lag
- But doesn't distinguish between collision frames from same vs different physical events
- `lastCheckedPegFrameRef` only prevents re-processing same frame number
- Doesn't know that frame 110 is continuation of frame 100 collision

**Throttle doesn't fully solve it**:
- 50ms throttle ≈ 3 frames at 60 FPS
- False collisions are 10 frames apart (166ms)
- Throttle has expired, sound plays again
- Even if throttle caught it, visual flash would still trigger twice

**Impact speed filter doesn't catch it**:
- Ball at frame 110 has ~60-100 px/s (bouncing/settling)
- Above 50 px/s threshold, so "audible"
- Sound plays even though it's not a new impact

### Why the Visual Feedback Pass Exists

**From code comments** (`collision.ts:181`):
```typescript
// After physics collision, detect ALL pegs the ball is near for visual feedback
// Apply same cooldown as physics to prevent duplicate detections across frames
```

**Intended purpose**:
- Catch cases where ball is visually touching peg but CCD didn't detect intersection
- Provide visual feedback even for grazing hits
- Ensure no peg is missed when ball is repositioned by collision resolution

**Actual effect**:
- Over-triggers by detecting lingering ball after bounce
- Creates multiple collision entries for same physical event
- Cooldown logic is insufficient to distinguish new vs continued contact

---

## Why Previous Fixes Didn't Work

### Fix Attempt 1: Look-ahead (Already Implemented)

**Location**: `OptimizedBallRenderer.tsx:329-330`

**Approach**: Check `currentFrame + 1` to trigger effects early

**Why it helps timing sync**:
- Compensates for post-bounce position storage
- Triggers effects when ball visually appears at contact point
- Reduces perceived lag

**Why it doesn't fix duplicates**:
- Doesn't address root cause: multiple `pegsHit` entries for same event
- Only shifts timing, doesn't filter false positives
- Both frame 100 and frame 110 still in `pegHitFrames`, both still trigger

### Fix Attempt 2: Throttle (Already Implemented)

**Location**: `SFXController.ts:67-88`, configured in `useAudioPreloader.ts:107`

**Approach**: Global 50ms delay between same sound plays

**Why it helps some cases**:
- Prevents rapid-fire spam if collisions < 50ms apart
- Good for catching frame-drop scenarios
- Reduces audible spam

**Why it doesn't fully solve**:
- Throttle window (50ms) < cooldown window (166ms)
- False collisions 10 frames apart still play
- Doesn't prevent visual flash duplicates
- Can silence legitimate distinct hits

### Fix Attempt 3: Impact Speed Filter (Already Implemented)

**Location**: `OptimizedBallRenderer.tsx:331, 359`

**Approach**: Only play sound if `impactSpeed >= 50 px/s`

**Why it helps**:
- Filters true micro-collisions (< 50 px/s)
- Good for very slow ball movements
- Reduces noise from settling

**Why it doesn't fix issue**:
- Ball lingering at 60-100 px/s after bounce still "audible"
- Threshold too low to catch false positives
- Doesn't address duplicate detection in physics layer

---

## Performance Characteristics

### Current Collision Detection Costs

**Physics Layer** (one-time cost):
- CCD line-circle intersection: ~50-100 pegs × 400-800 frames
- O(n) distance checks per frame for visual feedback pass
- Total: ~40,000-80,000 collision checks pre-computed
- Runtime: ~50-100ms one-time before animation

**Rendering Layer** (per-frame cost at 60 FPS):
- Map lookups: O(1) for each peg in `pegHitFrames`
- Array filtering: O(k) where k = collision count per peg (usually 1-3)
- Distance calculations: None (uses pre-computed data)
- Cost per frame: < 0.1ms for typical collision count

### Memory Usage

**recentCollisions Map**:
- Max 10 entries (limited by cleanup at line 173)
- ~8 bytes per entry (string key + number)
- Total: ~80 bytes

**pegHitFrames Map**:
- ~50-100 entries (one per peg that gets hit)
- Each entry: string key + number array
- Average: ~2-5 frame numbers per peg
- Total: ~4-8 KB

**Renderer Tracking**:
- `lastCheckedPegFrameRef`: ~50-100 entries
- `lastSlotWallHitFrameRef`: ~5-8 entries
- Total: ~1-2 KB

---

## Related Code Locations

### Physics Layer
- `src/game/trajectory/collision.ts:44-205` - Main collision detection
- `src/game/trajectory/collision.ts:87-91` - Physics cooldown check
- `src/game/trajectory/collision.ts:183-202` - Visual feedback pass (problem source)
- `src/game/trajectory/simulation.ts:118-134` - Collision integration into physics loop
- `src/game/trajectory/simulation.ts:225-239` - Trajectory storage with `pegsHit`
- `src/game/trajectory/bucket.ts:29-49` - Bucket wall/floor collision

### Rendering Layer
- `src/components/game/PlinkoBoard/PlinkoBoard.tsx:152-167` - Build `pegHitFrames` map
- `src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx:323-364` - Peg collision detection
- `src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx:367-407` - Wall collision detection
- `src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx:445-528` - Slot collision detection

### Animation Driver
- `src/animation/ballAnimationDriver.web.ts:62-119` - RAF loop and frame progression
- `src/animation/ballAnimationDriver.web.ts:237-257` - Peg flash imperative update
- `src/animation/ballAnimationDriver.web.ts:433-485` - Slot collision imperative update

### Sound System
- `src/audio/core/SFXController.ts:67-88` - Throttle implementation
- `src/audio/core/SFXController.ts:249-262` - Throttle delay configuration
- `src/audio/hooks/useAudioPreloader.ts:107` - Configure 50ms throttle for peg hits

### Visual Effects
- `src/components/game/PlinkoBoard/Peg.tsx:82-96` - Peg flash CSS animation
- `src/animation/ballAnimationDriver.web.ts:535-563` - Wall flash implementation

---

## Recommended Fix Strategy (Priority Order)

### Fix 1: Refactor Visual Feedback Pass (Highest Impact)

**Problem**: Lines 183-202 in `collision.ts` create duplicate `pegsHit` entries

**Solution Option A - Add Direction Check**:
```typescript
// Only add if ball is MOVING TOWARD peg, not lingering after bounce
const dx = x - peg.x;
const dy = y - peg.y;
const oldDx = oldState.x - peg.x;
const oldDy = oldState.y - peg.y;

const oldDist = Math.sqrt(oldDx * oldDx + oldDy * oldDy);
const newDist = Math.sqrt(dx * dx + dy * dy);
const isApproaching = newDist < oldDist;

if (lastHit === undefined || lastHit === frame ||
    (frame - lastHit >= 10 && isApproaching)) {
  pegsHitThisFrame.push({ row: peg.row, col: peg.col });
}
```

**Pro**: Filters lingering after bounce
**Con**: May miss edge cases where ball bounces back to same peg

**Solution Option B - Remove Visual Feedback Pass Entirely**:
```typescript
// Delete lines 181-202
// Only add to pegsHit if actual physics collision occurred
```

**Pro**: Eliminates all false positives
**Con**: May miss visual feedback for grazing hits
**Con**: May impact visual polish (less responsive peg flashes)

**Solution Option C - Increase Cooldown Duration**:
```typescript
// Change cooldown from 10 to 20 frames
if (frame - lastHit >= 20) {
  pegsHitThisFrame.push({ row: peg.row, col: peg.col });
}
```

**Pro**: Simple change
**Con**: Band-aid that doesn't address root cause
**Con**: Ball could still linger 20 frames (333ms)

### Fix 2: Unified Cooldown in Renderer (Moderate Impact)

**Problem**: `lastCheckedPegFrameRef` tracks frame numbers, not collision events

**Solution**: Track collision timestamps with cooldown window
```typescript
const RENDERER_COOLDOWN = 10; // Match physics cooldown
const collisionHistory = new Map<string, number>(); // pegId → collision frame

pegHitFrames.forEach((hitFrames, pegId) => {
  const lastCollision = collisionHistory.get(pegId) ?? -Infinity;

  // Filter hits outside cooldown window
  const validHits = hitFrames.filter(hitFrame =>
    hitFrame > lastCollision &&
    hitFrame - lastCollision >= RENDERER_COOLDOWN &&
    hitFrame <= lookAheadFrame
  );

  if (validHits.length > 0) {
    const collisionFrame = Math.min(...validHits);
    collisionHistory.set(pegId, collisionFrame);
    // ... trigger effects
  }
});
```

**Pro**: Prevents detecting frame 110 as "new" if frame 100 < 10 frames ago
**Con**: More complex logic
**Con**: Doesn't fix root cause (duplicate entries still in data)

### Fix 3: Increase Impact Speed Threshold (Low Impact)

**Problem**: 50 px/s catches slow lingering after bounce

**Solution**: Raise threshold and add scaling
```typescript
const MIN_AUDIBLE_IMPACT_SPEED = 100; // Raised from 50
const SOFT_IMPACT_VOLUME_SCALE = 0.5; // 50% volume for 100-200 px/s

if (impactSpeed >= MIN_AUDIBLE_IMPACT_SPEED) {
  const volumeScale = impactSpeed < 200 ? SOFT_IMPACT_VOLUME_SCALE : 1.0;
  sfxController.play('ball-peg-hit', {
    throttle: true,
    volume: volumeScale
  });
}
```

**Pro**: Quick win, immediate impact
**Con**: May silence legitimate soft impacts
**Con**: Doesn't fix visual flash duplicates

### Fix 4: Increase Throttle Delay (Safety Net Only)

**Problem**: 50ms throttle < 166ms cooldown period

**Solution**: Increase to 150ms
```typescript
// useAudioPreloader.ts
sfxController.setThrottleDelay('ball-peg-hit', 150); // Raised from 50
```

**Pro**: Backstop for edge cases
**Con**: May silence distinct collisions in fast sections
**Con**: Doesn't address root problem

---

## Implementation Priority

1. **Start with Fix 1 (Solution Option A)** - Direction check in visual feedback pass
   - Highest impact, targets root cause
   - Low risk, easy to test
   - Estimated reduction: 80-90% of duplicates

2. **Add Fix 3** - Increase velocity threshold to 100 px/s
   - Quick win, complements Fix 1
   - Filters remaining edge cases
   - Low risk of silencing legitimate hits

3. **Consider Fix 2** - Unified cooldown in renderer
   - If Fixes 1+3 insufficient
   - More complex, requires careful testing
   - Estimated additional reduction: 10-15% of duplicates

4. **Reserve Fix 4** - Increased throttle
   - Only if all above insufficient
   - Last resort, has side effects
   - Use sparingly

---

## Testing Strategy

### Unit Tests Needed

1. **Visual Feedback Pass Direction Check**:
   ```typescript
   it('should not add peg to pegsHit when ball lingers after bounce', () => {
     // Frame 100: actual collision
     // Frames 110-115: ball within 18px but moving away
     // Expected: pegsHit only contains frame 100
   });
   ```

2. **Renderer Cooldown**:
   ```typescript
   it('should not trigger effects for collisions within cooldown window', () => {
     // pegHitFrames contains [100, 110] for same peg
     // Expected: only frame 100 triggers effects
   });
   ```

### Integration Tests Needed

1. **Visual timing verification**:
   - Record video at 60 FPS
   - Verify flash occurs when ball visually touches peg
   - Verify no flash when ball lingering near peg

2. **Audio timing verification**:
   - Record audio waveform
   - Verify one sound per distinct physical collision
   - Verify no sounds during lingering periods

### Manual Testing Checklist

- [ ] Drop ball from different positions
- [ ] Watch for duplicate peg flashes (same peg flashing twice within 166ms)
- [ ] Listen for duplicate sounds (same collision heard twice)
- [ ] Verify timing sync (flash/sound when ball visually touches peg)
- [ ] Test at 30 FPS and 60 FPS display modes
- [ ] Test slow-motion scenarios (ball settling in peg cluster)
- [ ] Test fast-motion scenarios (high-speed drops)

---

## Expected Outcome After Fixes

- ✅ One sound per distinct physical collision
- ✅ One visual flash per distinct physical collision
- ✅ Flash/sound timing matches visual ball contact
- ✅ No duplicate effects during slow bounces or lingering
- ✅ Consistent behavior at 30 FPS and 60 FPS
- ✅ Multi-peg collisions feel natural (staggered effects)
- ✅ No false positives from cooldown expiration

---

## Conclusion

This is an **architectural issue**, not a configuration problem. The visual feedback pass (lines 183-202 in `collision.ts`) was designed to catch edge cases but creates false collision entries when the ball lingers near a peg after bouncing. The 10-frame cooldown expires while the ball is still within detection radius, causing the system to treat continued proximity as a new collision.

The fix requires modifying the visual feedback logic to distinguish between:
- **New collision**: Ball approaching peg and intersecting
- **Lingering**: Ball near peg after bouncing away

Adding a direction check (`isApproaching`) is the most robust solution with minimal risk to existing functionality.
