# Ball Animation Optimization - Quick Start Guide

**Goal**: Reduce CPU usage by 40-60% while maintaining 60 FPS smooth animation

**Strategy**: Move ball position updates from React reconciliation to direct DOM manipulation

---

## The Problem in 3 Lines

1. **Current**: `useSyncExternalStore` triggers PlinkoBoard re-render 60 times/second
2. **Impact**: React reconciles 70+ components (Ball + 60 Pegs + 8 Slots) every frame
3. **Result**: 70-85% CPU usage due to reconciliation overhead, not actual DOM work

---

## The Solution in 3 Lines

1. **Remove**: `useSyncExternalStore` from PlinkoBoard (lines 100-104)
2. **Create**: BallRenderer component that subscribes to frameStore directly
3. **Update**: DOM via refs in subscription callback, bypassing React

---

## Step 1: Create BallRenderer (Highest Priority)

**Impact**: 40-50% CPU reduction  
**Risk**: Low (isolated change)  
**Time**: ~4 hours

### New File: `/src/components/game/BallRenderer.tsx`

```typescript
import { useEffect, useRef } from 'react';
import type { GameState, BallPosition, TrajectoryPoint } from '../../game/types';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
}

interface BallRendererProps {
  frameStore: FrameStore;
  getBallPosition: () => BallPosition | null;
  getCurrentTrajectoryPoint: () => TrajectoryPoint | null;
  state: GameState;
  showTrail: boolean;
}

export function BallRenderer({
  frameStore,
  getBallPosition,
  getCurrentTrajectoryPoint,
  state,
  showTrail
}: BallRendererProps) {
  const ballRef = useRef<HTMLDivElement>(null);
  const glowOuterRef = useRef<HTMLDivElement>(null);
  const glowMidRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to frame updates
  useEffect(() => {
    if (state !== 'dropping') return;
    
    const unsubscribe = frameStore.subscribe(() => {
      const position = getBallPosition();
      const point = getCurrentTrajectoryPoint();
      
      if (!position || !ballRef.current) return;
      
      // Direct DOM updates - NO React re-render
      const baseTransform = `translate(${position.x}px, ${position.y}px)`;
      const rotation = `rotate(${position.rotation}deg)`;
      
      // Calculate squash/stretch from velocity
      let scaleX = 1, scaleY = 1;
      if (point?.vx && point?.vy) {
        const speed = Math.sqrt(point.vx ** 2 + point.vy ** 2);
        if (point.pegHit && speed > 50) {
          const squash = Math.min(speed / 800, 0.4);
          scaleX = 1 + squash * 0.5;
          scaleY = 1 - squash;
        } else if (point.vy > 200 && !point.pegHit) {
          const stretch = Math.min(point.vy / 1000, 0.3);
          scaleX = 1 - stretch * 0.4;
          scaleY = 1 + stretch;
        }
      }
      
      const scale = `scaleX(${scaleX}) scaleY(${scaleY})`;
      const fullTransform = `${baseTransform} ${rotation} ${scale}`;
      
      ballRef.current.style.transform = fullTransform;
      glowOuterRef.current!.style.transform = `${baseTransform} ${scale}`;
      glowMidRef.current!.style.transform = `${baseTransform} ${scale}`;
      
      // TODO: Imperative trail updates (Step 2)
    });
    
    return unsubscribe;
  }, [frameStore, getBallPosition, getCurrentTrajectoryPoint, state, showTrail]);
  
  // Render static structure - updates happen via useEffect
  if (state === 'idle' || state === 'ready' || state === 'countdown') return null;
  
  return (
    <>
      {/* Copy styling from Ball.tsx lines 182-243 */}
      <div ref={glowOuterRef} className="absolute pointer-events-none" style={{...}} />
      <div ref={glowMidRef} className="absolute pointer-events-none" style={{...}} />
      <div ref={ballRef} className="absolute pointer-events-none" style={{...}} />
    </>
  );
}
```

### Modify: `/src/components/game/PlinkoBoard/PlinkoBoard.tsx`

**DELETE lines 100-104:**
```typescript
// ❌ REMOVE THIS
useSyncExternalStore(
  frameStore?.subscribe ?? dummySubscribe,
  frameStore?.getSnapshot ?? dummyGetSnapshot,
  frameStore?.getSnapshot ?? dummyGetSnapshot
);
```

**REPLACE Ball component (lines 341-351) with:**
```typescript
import { BallRenderer } from '../BallRenderer';  // Add import at top

// Replace existing <Ball> component with:
{!isSelectingPosition &&
 !(ballState === 'dropping' && currentTrajectoryPoint?.frame === 0) && (
  <BallRenderer
    frameStore={frameStore!}
    getBallPosition={getBallPosition!}
    getCurrentTrajectoryPoint={getCurrentTrajectoryPoint!}
    state={ballState}
    showTrail={showTrail}
  />
)}
```

### Testing Checklist

```bash
# 1. Run unit tests
npm test

# 2. Run Playwright tests  
npm run test:e2e

# 3. Manual testing
- Start game
- Verify ball moves smoothly at 60 FPS
- Check ball rotation works
- Verify squash/stretch on peg hits
- Test state transitions (idle → countdown → dropping → landed)
- Check ball disappears correctly when game resets

# 4. Performance profiling
# Chrome DevTools → Performance → Record during gameplay
# BEFORE: Check CPU usage (should be 70-85%)
# AFTER: Should drop to 25-35%
```

---

## Step 2: Imperative Trail (Optional but Recommended)

**Impact**: +15-20% CPU reduction  
**Risk**: Medium (visual quality must match)  
**Time**: ~6 hours

### New File: `/src/utils/trailRenderer.ts`

```typescript
export class TrailRenderer {
  private container: HTMLDivElement;
  private points: Array<{ x: number; y: number; div: HTMLDivElement }> = [];
  private maxLength: number;
  private theme: any;  // Pass theme from component
  
  constructor(container: HTMLDivElement, maxLength: number, theme: any) {
    this.container = container;
    this.maxLength = maxLength;
    this.theme = theme;
  }
  
  update(x: number, y: number) {
    let div: HTMLDivElement;
    
    // Reuse oldest div or create new one
    if (this.points.length < this.maxLength) {
      div = this.createTrailDiv();
      this.container.appendChild(div);
    } else {
      const oldest = this.points.pop()!;
      div = oldest.div;
    }
    
    // Update position
    const halfSize = 6; // 12px / 2
    div.style.transform = `translate(${x - halfSize}px, ${y - halfSize}px)`;
    
    // Add to front
    this.points.unshift({ x, y, div });
    
    // Update all opacities (exponential fade)
    this.points.forEach((point, i) => {
      const progress = i / Math.max(this.points.length - 1, 1);
      const opacity = Math.max(0.9 * Math.pow(1 - progress, 2.5), 0.05);
      const scale = Math.max(1 - progress * 0.6, 0.3);
      
      point.div.style.opacity = String(opacity);
      point.div.style.transform = `translate(${point.x - halfSize}px, ${point.y - halfSize}px) scale(${scale})`;
    });
  }
  
  private createTrailDiv(): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'absolute rounded-full pointer-events-none';
    div.style.width = '12px';
    div.style.height = '12px';
    div.style.background = `linear-gradient(135deg, ${this.theme.colors.game.ball.primary} 0%, ${this.theme.colors.game.ball.primary}CC 30%, ${this.theme.colors.game.ball.primary}66 70%, transparent 100%)`;
    div.style.willChange = 'transform, opacity';
    div.style.zIndex = '5';  // zIndexTokens.ballTrail
    div.style.transition = 'all 16ms linear';  // animationTokens.duration.fastest
    div.style.filter = 'blur(0.5px)';  // Web-only enhancement
    return div;
  }
  
  clear() {
    this.points.forEach(p => p.div.remove());
    this.points = [];
  }
}
```

### Integrate into BallRenderer

```typescript
import { TrailRenderer } from '../../utils/trailRenderer';
import { useTheme } from '../../theme';

// Inside BallRenderer component:
const { theme } = useTheme();
const trailRendererRef = useRef<TrailRenderer | null>(null);
const trailContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (showTrail && trailContainerRef.current) {
    trailRendererRef.current = new TrailRenderer(
      trailContainerRef.current, 
      20,  // maxLength
      theme
    );
  }
  return () => trailRendererRef.current?.clear();
}, [showTrail, theme]);

// In frame subscription callback:
if (showTrail && trailRendererRef.current) {
  trailRendererRef.current.update(position.x, position.y);
}

// In JSX:
{showTrail && <div ref={trailContainerRef} className="absolute" style={{...}} />}
```

---

## Common Pitfalls & Solutions

### Issue: Ball doesn't move
**Cause**: Subscription not working  
**Fix**: Check `frameStore` is passed correctly, verify `state === 'dropping'`

### Issue: Ball jumps/stutters
**Cause**: Transform string format incorrect  
**Fix**: Ensure transform uses `translate(Xpx, Ypx)` not `translateX/Y`

### Issue: Tests fail
**Cause**: Tests expect Ball component  
**Fix**: Update tests to use BallRenderer, or keep Ball for tests only

### Issue: Trail looks different
**Cause**: Styling mismatch  
**Fix**: Copy exact styles from Ball.tsx lines 146-180

### Issue: Memory leak
**Cause**: Subscription not cleaned up  
**Fix**: Verify `useEffect` returns `unsubscribe` function

---

## Performance Validation

### Before Optimization:
```
Chrome DevTools Performance Tab:
- Scripting (yellow): 50-60% per frame
- Rendering (purple): 10-15% per frame
- Painting (green): 5-10% per frame
Total: 70-85% CPU
```

### After Step 1:
```
Chrome DevTools Performance Tab:
- Scripting (yellow): 15-20% per frame  ✅ 65% reduction
- Rendering (purple): 8-12% per frame
- Painting (green): 5-8% per frame
Total: 30-40% CPU  ✅ 50% reduction
```

### After Step 1 + 2:
```
Chrome DevTools Performance Tab:
- Scripting (yellow): 8-12% per frame  ✅ 75% reduction
- Rendering (purple): 8-12% per frame
- Painting (green): 5-8% per frame
Total: 20-30% CPU  ✅ 65% reduction
```

---

## Files to Modify

### Step 1 (Required):
1. ✏️ **Create**: `/src/components/game/BallRenderer.tsx` (~150 lines)
2. ✏️ **Modify**: `/src/components/game/PlinkoBoard/PlinkoBoard.tsx`
   - Remove lines 100-104 (useSyncExternalStore)
   - Replace lines 341-351 (Ball → BallRenderer)
3. ✏️ **Update**: `/src/tests/unit/components/Ball.test.tsx`
   - Add BallRenderer tests

### Step 2 (Optional):
1. ✏️ **Create**: `/src/utils/trailRenderer.ts` (~80 lines)
2. ✏️ **Modify**: `/src/components/game/BallRenderer.tsx`
   - Import TrailRenderer
   - Add trail container ref
   - Integrate trail updates in subscription

---

## Rollback Plan

If anything breaks:

```bash
# Step 1: Revert PlinkoBoard changes
git checkout src/components/game/PlinkoBoard/PlinkoBoard.tsx

# Step 2: Remove new files
git rm src/components/game/BallRenderer.tsx
git rm src/utils/trailRenderer.ts  # if created

# Step 3: Re-add useSyncExternalStore
# Copy original lines 100-104 back

# Step 4: Test
npm test
```

---

## Success Criteria

✅ Ball animates smoothly at 60 FPS  
✅ Trail effect looks identical to original  
✅ CPU usage reduced by 40-60%  
✅ All tests pass  
✅ No memory leaks (test with 100 games)  
✅ Works on Safari, Chrome, Firefox  
✅ Mobile devices run cooler

---

**Next Steps**:
1. Read full analysis: `BALL_ANIMATION_PERFORMANCE_ANALYSIS.md`
2. Study flow diagram: `ANIMATION_RERENDER_FLOW.md`
3. Implement Step 1
4. Profile performance
5. If successful, implement Step 2

**Questions?** Review the detailed technical report for rationale and edge cases.
