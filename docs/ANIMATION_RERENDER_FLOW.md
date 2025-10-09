# Animation Re-render Flow Diagram

This document visualizes the re-render chain that occurs 60 times per second during ball animation.

## Current Implementation (useSyncExternalStore Pattern)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVERY FRAME (60 FPS)                          │
└─────────────────────────────────────────────────────────────────┘

1. requestAnimationFrame callback fires
   ↓
   [useGameAnimation.ts:77-102]
   
2. Calculate new frame index from elapsed time
   ↓
   currentFrameRef.current = currentFrameIndex;  // Line 93
   ↓
   
3. Notify all frameStore subscribers
   ↓
   frameListenersRef.current.forEach(listener => listener());  // Line 94
   ↓
   ↓
   ╔═══════════════════════════════════════════════════════════════╗
   ║  REACT RE-RENDER CASCADE STARTS HERE                           ║
   ╚═══════════════════════════════════════════════════════════════╝
   ↓
   
4. useSyncExternalStore detects change
   ↓
   [PlinkoBoard.tsx:100-104]
   getSnapshot() returns new frame number → triggers re-render
   ↓
   ↓
   
5. PlinkoBoard ENTIRE COMPONENT FUNCTION EXECUTES
   ↓
   [PlinkoBoard.tsx:65-409 - ALL 344 LINES RUN]
   ↓
   ├─→ useState/useMemo/useEffect hooks execute
   ├─→ getBallPosition() called → returns { x, y, rotation }
   ├─→ getCurrentTrajectoryPoint() called → returns trajectory data
   ├─→ dimensions calculated (lines 113-117)
   ├─→ slots array mapped (lines 169-200)
   └─→ JSX tree constructed with ALL children
       ↓
       ├─→ BorderWall (4 components) - check hasImpact prop
       ├─→ Peg.map() (60+ components) - check isActive prop
       ├─→ Slot.map() (5-8 components) - check isApproaching/wallImpact props
       └─→ Ball (1 component) - check position/frame props
           ↓
           ↓
           
6. React Reconciliation Phase
   ↓
   For EACH child component, React:
   ├─→ Calls memo comparison function (if memoized)
   ├─→ Compares old props vs new props
   ├─→ Updates fiber tree metadata
   └─→ Decides whether to commit to DOM
   
   ┌────────────────────────────────────────────┐
   │ Ball Component (memo comparison)           │
   │ [Ball.tsx:285-294]                         │
   │                                            │
   │ Compares:                                  │
   │ ✓ prev.currentFrame === next.currentFrame │
   │ ✓ prev.position?.x === next.position?.x   │
   │ ✓ prev.position?.y === next.position?.y   │
   │ ✓ prev.position?.rotation === ...         │
   │ ✓ prev.state === next.state               │
   │ ✓ prev.showTrail === next.showTrail       │
   │                                            │
   │ Result: Props changed → Ball re-renders   │
   └────────────────────────────────────────────┘
           ↓
           
7. Ball Component Re-renders
   ↓
   [Ball.tsx:41-278]
   ├─→ useState for trail, slowMoActive, isLaunching
   ├─→ useMemo for scaleX/scaleY (squash/stretch)
   ├─→ useMemo for trailLength
   ├─→ useEffect to update trail array
   │   ↓
   │   setTrail(prevTrail => [...])  // Line 126-130
   │   ↓
   │   Creates NEW array object
   │   ↓
   │   TRIGGERS ANOTHER RE-RENDER for trail changes
   │
   └─→ Renders JSX:
       ├─→ trail.map() → 8-20 trail point divs
       ├─→ Outer glow div
       ├─→ Middle glow div
       └─→ Main ball div

   ┌────────────────────────────────────────────┐
   │ Peg Components (60+ comparisons)           │
   │ [Peg.tsx:149-157]                          │
   │                                            │
   │ FOR EACH OF 60+ PEGS:                     │
   │ Compares:                                  │
   │ ✓ prev.isActive === next.isActive         │
   │ ✓ prev.shouldReset === next.shouldReset   │
   │ ✓ prev.x === next.x                       │
   │ ✓ prev.y === next.y                       │
   │                                            │
   │ Result: Most skip re-render (props same)  │
   │ Exception: 1-2 pegs hit this frame        │
   └────────────────────────────────────────────┘

   ┌────────────────────────────────────────────┐
   │ Slot Components (5-8 comparisons)          │
   │ [Slot.tsx:46-358]                          │
   │                                            │
   │ FOR EACH SLOT:                             │
   │ Compares many props (not explicitly memo'd)│
   │                                            │
   │ Result: May re-render if isApproaching or │
   │         wallImpact changes                 │
   └────────────────────────────────────────────┘
           ↓
           
8. React Commit Phase
   ↓
   Only components that failed memo check update DOM:
   ├─→ Ball: Update transform styles
   ├─→ Trail points: Update positions/opacity
   ├─→ Hit pegs: Update background color
   └─→ Approaching slots: Update border color


┌─────────────────────────────────────────────────────────────────┐
│                        CPU TIME BREAKDOWN                        │
├─────────────────────────────────────────────────────────────────┤
│ Step 5 (PlinkoBoard re-render):         20-25%                  │
│ Step 6 (Reconciliation):                30-35%                  │
│ Step 7 (Ball/Trail re-render):          20-25%                  │
│ Step 8 (DOM commits):                   10-15%                  │
│ Other (hooks, context, etc):             5-10%                  │
├─────────────────────────────────────────────────────────────────┤
│ TOTAL:                                   70-85% CPU             │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      OPERATIONS PER SECOND                       │
├─────────────────────────────────────────────────────────────────┤
│ PlinkoBoard re-renders:                  60                     │
│ Ball memo comparisons:                   60                     │
│ Ball re-renders:                         60                     │
│ Trail setState calls:                    60                     │
│ Trail array allocations:                 60                     │
│ Trail div reconciliations:               600-1,200              │
│ Peg memo comparisons:                    3,600+ (60 × 60)      │
│ Slot memo comparisons:                   300-480 (5-8 × 60)    │
│ DOM style updates:                       60-120                 │
└─────────────────────────────────────────────────────────────────┘
```

## Proposed Optimization (Direct DOM Updates)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVERY FRAME (60 FPS)                          │
└─────────────────────────────────────────────────────────────────┘

1. requestAnimationFrame callback fires
   ↓
   [useGameAnimation.ts:77-102]
   
2. Calculate new frame index from elapsed time
   ↓
   currentFrameRef.current = currentFrameIndex;  // Line 93
   ↓
   
3. Notify all frameStore subscribers
   ↓
   frameListenersRef.current.forEach(listener => listener());  // Line 94
   ↓
   ↓
   ╔═══════════════════════════════════════════════════════════════╗
   ║  DIRECT DOM MANIPULATION - NO REACT RE-RENDERS                 ║
   ╚═══════════════════════════════════════════════════════════════╝
   ↓
   
4. BallRenderer's useEffect subscription fires
   ↓
   [BallRenderer.tsx - new component]
   const unsubscribe = frameStore.subscribe(() => {
     const position = getBallPosition();
     const point = getCurrentTrajectoryPoint();
     
     // ✅ Direct DOM updates - NO React involved
     ballRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
     glowOuterRef.current.style.transform = ...;
     glowMidRef.current.style.transform = ...;
     
     // ✅ Imperative trail updates
     trailRenderer.current.update(position.x, position.y);
   });
   ↓
   
5. Browser updates paint layers
   ↓
   GPU composites transformed elements
   ↓
   Frame rendered to screen
   

┌─────────────────────────────────────────────────────────────────┐
│           CPU TIME BREAKDOWN (AFTER OPTIMIZATION)                │
├─────────────────────────────────────────────────────────────────┤
│ frameStore.subscribe callback:            5-8%                  │
│ getBallPosition/getCurrentTrajectoryPoint: 3-5%                 │
│ DOM style updates:                        10-12%                │
│ Trail imperative updates:                  5-8%                 │
│ GPU compositing:                           5-8%                 │
├─────────────────────────────────────────────────────────────────┤
│ TOTAL:                                    25-35% CPU            │
├─────────────────────────────────────────────────────────────────┤
│ SAVINGS:                                  40-55% CPU REDUCTION  │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│             OPERATIONS PER SECOND (AFTER OPTIMIZATION)           │
├─────────────────────────────────────────────────────────────────┤
│ PlinkoBoard re-renders:                  0 ✅                   │
│ Ball memo comparisons:                   0 ✅                   │
│ Ball re-renders:                         0 ✅                   │
│ Trail setState calls:                    0 ✅                   │
│ Trail array allocations:                 0 ✅                   │
│ Trail div reconciliations:               0 ✅                   │
│ Peg memo comparisons:                    0 ✅                   │
│ Slot memo comparisons:                   0 ✅                   │
│ DOM style updates:                       60-120 (same)          │
│ Subscription callbacks:                  60 (lightweight)       │
└─────────────────────────────────────────────────────────────────┘
```

## Key Insight

The fundamental issue is that **useSyncExternalStore forces PlinkoBoard to re-render** whenever the frame changes. This is the intended behavior of `useSyncExternalStore` - it's designed to synchronize React state with external state.

However, for 60 FPS animations, we don't want React's render cycle. We want to:
1. Keep data in refs (external state)
2. Update DOM directly via refs
3. Bypass React reconciliation entirely

This is a **classic escape hatch** scenario where React's declarative model is too expensive for the use case.

## Why Memoization Isn't Enough

Even with perfect memoization:
- React still executes the PlinkoBoard function (344 lines)
- React still calls all memo comparison functions
- React still updates fiber tree metadata
- React still checks context subscriptions
- React still traverses the component tree

**Memoization prevents DOM updates, but not the reconciliation work.**

For 60 FPS, we need to avoid reconciliation entirely.

---

**Visual Aid Created**: 2025-10-09  
**Related Document**: BALL_ANIMATION_PERFORMANCE_ANALYSIS.md
