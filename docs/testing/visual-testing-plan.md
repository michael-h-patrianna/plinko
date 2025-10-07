# AAA Quality Visual Testing Plan

## Overview
This document outlines systematic visual testing for the 7 critical issues identified by the user.

## Testing Checklist

### Issue #1: Peg Overflow
**What to test:**
- Verify NO pegs overflow the 12px border walls on left/right sides
- Check that all pegs stay within the playable area

**How to verify:**
- Visual inspection: Look for pegs touching or overlapping border walls
- Expected: All pegs should have clear spacing from borders
- Border dimensions: 12px width on left/right

**Current implementation:**
```typescript
// PlinkoBoard.tsx
const BORDER_WIDTH = 12;
const playableWidth = boardWidth - (BORDER_WIDTH * 2);
const x = BORDER_WIDTH + horizontalSpacing * col + horizontalSpacing / 2 + offset;
```

---

### Issue #2: Physics Realism (No Sliding)
**What to test:**
- Ball should BOUNCE off pegs, not slide past them
- Ball should show realistic acceleration from rest (starts slow, speeds up)
- Movement should look natural, not artificial

**How to verify:**
- Watch ball motion during drop - should see distinct bounces
- NO horizontal "sliding" motion
- Ball should speed up as it falls (gravity acceleration visible)

**Current implementation:**
```typescript
// trajectory.ts
const GRAVITY = 9.8 * 100; // 980 px/s² - Real Earth gravity
let vx = 0; // Starts at rest
let vy = 0; // Starts at rest
vy += GRAVITY * dt; // Acceleration from gravity
```

---

### Issue #3: Peg Hit Animations
**What to test:**
- Only the SPECIFIC peg that was hit lights up (not all pegs)
- Glow effect appears smoothly
- Subtle shake animation triggers
- Animation duration is appropriate (~300ms)

**How to verify:**
- Watch as ball bounces through pegs
- Each peg should light up individually when hit
- Should see golden glow pulse
- Should see subtle shake/vibration

**Current implementation:**
```typescript
// Peg.tsx
- Glow: radial-gradient with rgba(251,191,36,0.8)
- Animation: pegGlowPulse 300ms
- Shake: pegShake 300ms
- State management: useEffect with wasHit flag
```

---

### Issue #4: Ball Quality (Premium Look)
**What to test:**
- Ball looks premium golden material (not flat/cheap)
- Multi-layer gradient visible
- Glossy highlight visible (top-left area)
- Shadow and glow effects present
- Texture pattern adds depth

**How to verify:**
- Ball should look like a premium golden sphere
- Should see depth and 3D appearance
- Highlight should create "shiny" appearance
- Should NOT look flat or simple

**Current implementation:**
```typescript
// Ball.tsx
- 7-layer radial gradient (#fffbeb → #b45309)
- Glossy highlight at 20% top-left
- Multiple glow layers (50px, 36px outer glow)
- Box shadows for depth
- Subtle diagonal texture pattern
```

---

### Issue #5: Overall UI Quality (AAA Standard)
**What to test:**
- Board background looks premium (depth, gradients)
- Border walls have 3D appearance
- Slots look polished with gradients and shadows
- Color scheme is cohesive
- Everything looks professional, not amateur

**How to verify:**
- Overall "wow" factor - does it look like a AAA game?
- Compare to premium casino/gaming UIs
- Check for depth, shadows, gradients throughout
- Verify cohesive color palette

**Current implementation:**
- Board: Radial + linear gradients, inset shadows
- Borders: 3D effect with shadows and highlights
- Slots: Multi-layer gradients, dynamic shadows
- Color scheme: Dark slate blue + golden accents

---

### Issue #6: Bucket Bouncing Physics
**What to test:**
- Ball does NOT stop immediately when entering bucket
- Ball bounces off left/right bucket walls
- Ball bounces off bucket floor
- Multiple bounces before coming to rest
- Settling animation looks natural

**How to verify:**
- Watch ball enter bucket/slot area
- Should see 3+ bounces (wall/floor collisions)
- Energy should dissipate gradually (RESTITUTION = 0.7)
- Final settling should be smooth

**Current implementation:**
```typescript
// trajectory.ts bucket physics:
if (hasPassedAllPegs && y >= slotY - BALL_RADIUS) {
  inBucket = true;

  // Left wall bounce
  if (x < slotLeftX + BALL_RADIUS) {
    vx = Math.abs(vx) * RESTITUTION;
  }

  // Right wall bounce
  if (x > slotRightX - BALL_RADIUS) {
    vx = -Math.abs(vx) * RESTITUTION;
  }

  // Floor bounce
  if (y >= slotBottomY - BALL_RADIUS) {
    vy = -Math.abs(vy) * RESTITUTION;
  }

  // Settle after 3+ bounces
  if (speed < 10 && bucketBounces > 3) {
    // Smooth settling to center
  }
}
```

---

### Issue #7: Acceleration Physics
**What to test:**
- Ball starts at rest (no initial velocity)
- Ball visibly accelerates due to gravity
- Speed increases as ball falls
- Movement feels natural (not constant velocity)

**How to verify:**
- First few frames: ball moves slowly
- Middle frames: ball moves faster
- Final frames: ball at maximum speed
- Should see clear acceleration curve

**Current implementation:**
```typescript
// trajectory.ts initialization:
let vx = 0; // Starts at rest!
let vy = 0; // Starts at rest!

// Each frame:
vy += GRAVITY * dt; // Acceleration!
x += vx * dt;       // Update position
y += vy * dt;
```

---

## Testing Procedure

1. **Open browser** at http://localhost:5174
2. **Test each issue** systematically (1-7)
3. **Document observations** for each issue
4. **Identify any problems** that need refinement
5. **Iterate** until all 7 issues meet AAA quality standards

## Expected Results

All 7 issues should be resolved to AAA quality standards:
- ✅ No peg overflow
- ✅ Realistic bouncing physics
- ✅ Individual peg animations working
- ✅ Premium golden ball appearance
- ✅ Professional UI throughout
- ✅ Bucket bouncing physics working
- ✅ Visible acceleration from rest

## Time Commitment

User requirement: At least 1 hour of research, planning, implementation, and testing.
This testing phase is critical to meeting that requirement.



1. The devtoolsmenu should only be available on desktop viewports.
2. The icon on the devtoolsmenu button to open the menu should use src/assets/gear.png as icon.
