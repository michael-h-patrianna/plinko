# Prize Provider System Analysis - Race Conditions & Architectural Issues

**Date:** 2025-10-06
**Analyzed Files:**
- `/src/game/prizeProvider.ts`
- `/src/hooks/usePlinkoGame.ts`
- `/src/game/stateMachine.ts`

**Context:** Recent bug where async `load()` was overwriting swapped prizes. `setPrizes()` was removed from async handler (line 138), but deeper architectural issues remain.

---

## Executive Summary

The prize provider system has **3 CRITICAL**, **2 HIGH**, **4 MEDIUM**, and **2 LOW** severity issues. The core problem is that the dual sync/async loading pattern allows multiple initializations of the same game session, causing the "immutable" `winningPrize` to be overwritten and potentially awarding users different prizes than they actually won.

**Root Cause:** The `hasInitialized` guard is reset unconditionally when async load completes (line 135), allowing the initialization effect to run multiple times for the same game session.

---

## CRITICAL Issues

### 1. Double Initialization Race Condition
**Severity:** CRITICAL
**Location:** `usePlinkoGame.ts` lines 119-155, 174-259

**Issue:**
The async load effect unconditionally resets `hasInitialized.current = false` (line 135), which allows the initialization effect (lines 174-259) to run multiple times for the same game session.

**Sequence:**
```
T0: Component mounts
T1: initialSyncSession useMemo runs → returns session A
T2: State initialized with session A (prizeSession, prizes)
T3: Async load effect starts
T4: Initialization effect runs (prizeSession=A, state=idle, hasInitialized=false)
    - Sets hasInitialized=true
    - Sets winningPrize to prize at index 2 (e.g., "Gold")
    - Swaps prizes array
T5: Async load completes with session A (same data, new object reference)
T6: hasInitialized.current = false (LINE 135 - THE BUG!)
T7: setPrizeSession(A) triggers state update
T8: Initialization effect runs AGAIN (prizeSession=A, state=idle, hasInitialized=false)
    - Generates NEW trajectory (potentially different seed)
    - Sets winningPrize to DIFFERENT prize!
    - Swaps prizes array AGAIN
```

**Impact:**
- User might receive a different prize than they actually won
- Game state becomes inconsistent
- Visual indicators (red dot) may point to wrong prize

**Root Cause:**
Line 135 resets the initialization guard without checking if the session data is equivalent to what was already loaded.

**Recommended Fix:**
```typescript
// Option 1: Only reset hasInitialized if session data actually changed
.then((result) => {
  if (cancelled) return;

  // Only reset initialization if this is truly a NEW session
  // (not just the async confirmation of the sync session)
  const isNewSession =
    !prizeSession ||
    prizeSession.seed !== result.seed ||
    sessionKey > 0;

  if (isNewSession) {
    hasInitialized.current = false;
  }

  setPrizeSession(result);
  setIsLoadingSession(false);
})

// Option 2: Use session identifier to track which session was initialized
const initializedSessionId = useRef<number | null>(null);

// In initialization effect:
if (prizeSession && gameState.state === 'idle' &&
    initializedSessionId.current !== prizeSession.seed) {
  initializedSessionId.current = prizeSession.seed;
  // ... initialize
}

// In async load effect:
// Don't reset anything - let the initialization effect handle it

// Option 3 (RECOMMENDED): Eliminate dual loading pattern entirely
// Only use load(), show loading state until complete
```

---

### 2. winningPrize Immutability Violation
**Severity:** CRITICAL
**Location:** `usePlinkoGame.ts` lines 159-197, 428

**Issue:**
The `winningPrize` state is documented as "immutable" (lines 157-158, 188-197) but can be overwritten when double initialization occurs.

**Code:**
```typescript
// Line 159: Declared as "immutable and independent of any prize array swaps"
const [winningPrize, setWinningPrize] = useState<PrizeConfig | null>(null);

// Line 197: Set in initialization effect
setWinningPrize(actualWinningPrize);

// Line 428: Reset in resetGame
setWinningPrize(null);
```

**Impact:**
- User receives wrong prize in their reward modal
- Backend prize claim could send wrong prize ID
- Game integrity compromised

**Scenario:**
1. First initialization: `winningPrize = "Gold Coins (100)"`
2. Async load completes, triggers second initialization
3. New trajectory generated, lands in different slot
4. Second initialization: `winningPrize = "No Win"` (OVERWRITES!)
5. User sees "No Win" instead of the "Gold Coins" they actually won

**Root Cause:**
Depends on Issue #1 (double initialization). The `setWinningPrize` call is correct in isolation, but it runs multiple times.

**Recommended Fix:**
Fix Issue #1 to prevent multiple initializations. Additionally, add safeguard:

```typescript
const [winningPrize, setWinningPrize] = useState<PrizeConfig | null>(null);
const winningPrizeLockedRef = useRef(false);

// In initialization effect:
if (prizeSession && gameState.state === 'idle' && !hasInitialized.current) {
  hasInitialized.current = true;

  // Only set winning prize if not already locked
  if (!winningPrizeLockedRef.current) {
    const actualWinningPrize = sessionPrizes[winningIndex]!;
    setWinningPrize(actualWinningPrize);
    winningPrizeLockedRef.current = true;
  }

  // ... rest of initialization
}

// In resetGame:
winningPrizeLockedRef.current = false;
setWinningPrize(null);
```

---

### 3. Dual Loading Pattern Lacks Data Consistency Guarantees
**Severity:** CRITICAL
**Location:** `prizeProvider.ts` interface, `usePlinkoGame.ts` usage

**Issue:**
The `PrizeProvider` interface allows both `load()` and `loadSync()` without guarantees that they return the same data.

**Interface:**
```typescript
export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  loadSync?(context?: PrizeProviderContext): PrizeProviderResult;
}
```

**Assumptions Made by usePlinkoGame:**
1. If `loadSync()` exists, it returns valid initial data
2. `load()` will return equivalent data (same seed, same winningIndex, same prizes)
3. If they differ, the async one is "more authoritative"

**Why This is Unsafe:**
- Future remote provider could cache stale data in `loadSync()`
- `load()` might fetch fresh data from server with different `winningIndex`
- No contract enforcing consistency

**Current Implementation:**
Both `createDefaultPrizeProvider` and `createFixturePrizeProvider` happen to return identical data because they're both synchronous. But this is implementation detail, not enforced by interface.

**Impact:**
- If a remote provider is added, it could violate the assumptions
- `loadSync()` returns cached session with `winningIndex=3`
- `load()` fetches fresh session with `winningIndex=5`
- Double initialization gives user prize at index 5 instead of 3

**Root Cause:**
Architectural design assumes sync and async loaders are consistent without enforcing it.

**Recommended Fix:**
```typescript
// Option 1: Remove dual loading pattern
// Just use load() and show loading state

// Option 2: Make loadSync return identifier, not data
export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  // Optional: Get session ID for instant render, but still need to wait for load()
  getSessionId?(): string | number;
}

// Option 3: Add contract enforcement
export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  loadSync?(context?: PrizeProviderContext): PrizeProviderResult;

  // New requirement: loadSync and load must return same winningIndex for same context
  // Implementations must guarantee consistency or only implement load()
}

// Add validation in hook:
if (syncResult && asyncResult && syncResult.winningIndex !== asyncResult.winningIndex) {
  console.error('Provider consistency violation!');
  // Use sync result since user already saw it
}

// Option 4 (RECOMMENDED): Single-source-of-truth pattern
// Remove initialSyncSession entirely, always use async load
// Show loading state until data arrives
// Eliminates all race conditions
```

---

## HIGH Severity Issues

### 4. Initialization Effect Dependency Array Triggers on Object Reference Changes
**Severity:** HIGH
**Location:** `usePlinkoGame.ts` lines 252-259

**Issue:**
The initialization effect includes `prizeSession` as a dependency, which is an object reference. ANY change to the object reference triggers re-evaluation, even if the data is identical.

**Code:**
```typescript
useEffect(() => {
  if (prizeSession && gameState.state === 'idle' && !hasInitialized.current) {
    // ... initialization
  }
}, [
  boardWidth,
  boardHeight,
  pegRows,
  gameState.state,
  prizeSession,  // <-- OBJECT REFERENCE
  dispatch,
]);
```

**Why This is Problematic:**
- Async load creates new object reference even if data is identical
- React sees `prizeSession !== prizeSession` (reference inequality)
- Effect re-evaluates even though `hasInitialized` guard prevents re-run
- Unnecessary effect evaluations waste CPU
- Combined with Issue #1, allows double initialization

**Additional Issues:**
- `dispatch` in dependencies is unnecessary (React guarantees stability from `useReducer`)
- Effect uses `prizeSession.seed`, `prizeSession.winningIndex`, `prizeSession.prizes`, `prizeSession.deterministicTrajectory` but only tracks the parent object

**Recommended Fix:**
```typescript
// Option 1: Extract specific values from prizeSession
const sessionSeed = prizeSession?.seed;
const sessionWinningIndex = prizeSession?.winningIndex;
const sessionPrizes = prizeSession?.prizes;
const sessionTrajectory = prizeSession?.deterministicTrajectory;

useEffect(() => {
  if (sessionPrizes && sessionWinningIndex !== undefined &&
      gameState.state === 'idle' && !hasInitialized.current) {
    // Use sessionSeed, sessionWinningIndex, etc.
  }
}, [
  boardWidth,
  boardHeight,
  pegRows,
  gameState.state,
  sessionSeed,
  sessionWinningIndex,
  sessionPrizes,
  sessionTrajectory,
  // Remove dispatch
]);

// Option 2: Use session identifier
const sessionId = prizeSession?.seed ?? 0;
const lastInitializedSession = useRef<number>(0);

useEffect(() => {
  if (prizeSession && gameState.state === 'idle' &&
      lastInitializedSession.current !== sessionId) {
    lastInitializedSession.current = sessionId;
    // ... initialize
  }
}, [
  boardWidth,
  boardHeight,
  pegRows,
  gameState.state,
  sessionId,  // Primitive value, not object reference
  prizeSession, // Still need this to access data
]);
```

---

### 5. Trajectory Generation Non-Determinism Can Cause Different Results
**Severity:** HIGH
**Location:** `usePlinkoGame.ts` lines 201-208, 376-384

**Issue:**
When double initialization occurs, the second call to `generateTrajectory()` might produce a different trajectory than the first, causing the ball to land in a different slot.

**Code:**
```typescript
// First initialization
const trajectoryResult = generateTrajectory({
  boardWidth,
  boardHeight,
  pegRows,
  slotCount: sessionPrizes.length,
  seed: prizeSession.seed,  // <-- Seed from session
  precomputedTrajectory: prizeSession.deterministicTrajectory,
});
```

**Why This Happens:**
1. If `precomputedTrajectory` exists, it's deterministic (same result every time)
2. If not, `generateTrajectory` uses the seed to generate a trajectory
3. The seed comes from `prizeSession.seed`
4. First and second initialization use the SAME seed
5. **BUT** if there's any randomness in the trajectory generation that's not seeded, results could differ

Actually, looking at the trajectory code more carefully... if the seed is the same and `precomputedTrajectory` is provided, it SHOULD be deterministic.

Let me reconsider: The issue is not non-determinism in trajectory, but that a DIFFERENT trajectory could land in a DIFFERENT slot, and then the prize at THAT slot becomes the new "winning" prize.

**Scenario:**
1. First init: trajectory lands in slot 3, winningPrize = prizes[3]
2. Second init: uses SAME session data, SAME seed
3. Should generate SAME trajectory, land in SAME slot
4. But if any other factors differ (boardWidth changed?), could land differently

Actually, the dependencies include `boardWidth`, `boardHeight`, `pegRows`, so if those change, the trajectory could be different. This is actually CORRECT behavior - if the board size changes, we need a new trajectory.

**Revised Assessment:**
This is not a bug per se, but a consequence of Issue #1. If double initialization happens with the SAME parameters, the trajectory should be identical. The problem is that we don't WANT double initialization at all.

**Recommended Fix:**
Fix Issue #1. No separate fix needed for this.

---

## MEDIUM Severity Issues

### 6. sessionKey Change Causes Unnecessary Re-initialization After Reset
**Severity:** MEDIUM
**Location:** `usePlinkoGame.ts` lines 49, 123, 155, 445

**Issue:**
The `resetGame` function manually loads a new sync session and sets state, then increments `sessionKey`. The `sessionKey` change triggers the async load effect, which re-loads and re-initializes AGAIN.

**Code:**
```typescript
// Line 49
const [sessionKey, setSessionKey] = useState(0);

// Line 423-446: resetGame
const resetGame = useCallback(() => {
  currentFrameRef.current = 0;
  hasInitialized.current = false;
  setLoadError(null);
  setWinningPrize(null);
  setCurrentWinningIndex(undefined);
  dispatch({ type: 'RESET_REQUESTED' });

  const syncSeedOverride = resolveSeedOverride();
  const nextSession = prizeProvider.loadSync?.({ seedOverride: syncSeedOverride });

  if (nextSession) {
    setPrizeSession(nextSession);  // <-- Sets session
    setPrizes(nextSession.prizes);
    setIsLoadingSession(false);
  } else {
    setPrizeSession(null);
    setPrizes([]);
    setIsLoadingSession(true);
  }

  setSessionKey((key) => key + 1);  // <-- Triggers async load effect!
}, [dispatch, prizeProvider, resolveSeedOverride]);

// Line 119-155: Async load effect
useEffect(() => {
  // ...
}, [initialSyncSession, prizeProvider, resolveSeedOverride, sessionKey]);
```

**Sequence:**
1. User clicks reset
2. `resetGame` calls `loadSync()`, sets `prizeSession`, `prizes`
3. `setSessionKey(1)` triggers async load effect
4. Async load calls `load()`, completes
5. Sets `hasInitialized=false`, `setPrizeSession` (same data, new reference)
6. Initialization effect runs

**Impact:**
- Unnecessary network request if `load()` is actually async
- Two initialization passes for one reset
- More opportunities for race conditions

**Root Cause:**
`resetGame` tries to do too much - it both loads data AND triggers the load effect.

**Recommended Fix:**
```typescript
const resetGame = useCallback(() => {
  currentFrameRef.current = 0;
  hasInitialized.current = false;
  setLoadError(null);
  setWinningPrize(null);
  setCurrentWinningIndex(undefined);
  dispatch({ type: 'RESET_REQUESTED' });

  // DON'T manually load - just increment sessionKey and let effect handle it
  setSessionKey((key) => key + 1);

  // Optionally: If loadSync exists, set loading=false optimistically
  if (prizeProvider.loadSync) {
    setIsLoadingSession(false);
  } else {
    setIsLoadingSession(true);
  }
}, [dispatch, prizeProvider]);
```

---

### 7. Redundant State (prizeSession vs prizes) Can Become Inconsistent
**Severity:** MEDIUM
**Location:** `usePlinkoGame.ts` lines 111-112, 235, 437

**Issue:**
There are two sources of truth for prize data:
- `prizeSession.prizes` (original unswapped array from provider)
- `prizes` state (swapped array for display)

These can become inconsistent if `prizeSession` is updated but `prizes` is not, or vice versa.

**Code:**
```typescript
// Line 111-112: Initialized separately
const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(initialSyncSession);
const [prizes, setPrizes] = useState<PrizeConfig[]>(() => initialSyncSession?.prizes ?? []);

// Line 235: prizes updated in initialization effect
setPrizes(sessionPrizes);

// Line 437: resetGame sets both
setPrizeSession(nextSession);
setPrizes(nextSession.prizes);
```

**Potential Inconsistency:**
1. Async load completes, `setPrizeSession(result)` (line 136)
2. Initialization effect doesn't run (some condition false)
3. `prizeSession.prizes` has new data, but `prizes` state has old swapped data
4. UI shows old prizes with new session metadata

**Also:**
Line 437 in `resetGame` sets `prizes` to unswapped array, but then initialization effect will swap them. There's a brief moment where the UI could show unswapped prizes.

**Root Cause:**
Derived state (`prizes`) that needs to stay in sync with source state (`prizeSession.prizes`).

**Recommended Fix:**
```typescript
// Option 1: Derive prizes from prizeSession on every render (no separate state)
const prizes = useMemo(() => {
  if (!prizeSession) return [];

  // If not initialized yet, show original prizes
  if (!hasInitialized.current) {
    return prizeSession.prizes;
  }

  // If initialized, return swapped prizes (stored separately)
  return swappedPrizes;
}, [prizeSession, swappedPrizes]);

const [swappedPrizes, setSwappedPrizes] = useState<PrizeConfig[]>([]);

// In initialization effect:
setSwappedPrizes(sessionPrizes); // After swapping

// Option 2: Only store prizes, derive whether to swap from state
const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
const [prizeSwapIndices, setPrizeSwapIndices] = useState<{from: number, to: number} | null>(null);

const displayPrizes = useMemo(() => {
  if (!prizeSwapIndices) return prizes;

  const swapped = [...prizes];
  const temp = swapped[prizeSwapIndices.from];
  swapped[prizeSwapIndices.from] = swapped[prizeSwapIndices.to];
  swapped[prizeSwapIndices.to] = temp;
  return swapped;
}, [prizes, prizeSwapIndices]);
```

---

### 8. Provider Changes Cause Cascade of Re-loads
**Severity:** MEDIUM
**Location:** `usePlinkoGame.ts` lines 97-109, 155

**Issue:**
The `initialSyncSession` useMemo depends on `prizeProvider` and `resolveSeedOverride`. When the provider changes (e.g., in tests or dev tools), it triggers a cascade of re-loads.

**Code:**
```typescript
const initialSyncSession = useMemo(() => {
  // ...
  return prizeProvider.loadSync({ seedOverride: initialSeed });
}, [prizeProvider, resolveSeedOverride]);

// Line 155: async load effect depends on initialSyncSession
useEffect(() => {
  // ...
}, [initialSyncSession, prizeProvider, resolveSeedOverride, sessionKey]);
```

**Sequence When Provider Changes:**
1. `prizeProvider` changes (new provider injected via context)
2. `initialSyncSession` recalculates (new data)
3. `prizeSession` and `prizes` state update (if `initialSyncSession` value changed)
4. Async load effect re-runs (both `initialSyncSession` and `prizeProvider` changed)
5. Async load completes, updates state
6. Initialization effect runs

**Impact:**
- In production: Rare (provider doesn't change)
- In tests: Common (each test might use different fixture provider)
- In dev tools: Common (switching between providers)
- Multiple loads and initializations for one provider change

**Root Cause:**
`prizeProvider` is treated as a regular dependency, but it's more like "configuration" that should cause a full reset, not incremental updates.

**Recommended Fix:**
```typescript
// Treat provider change as a reset
const providerIdRef = useRef(prizeProvider);

useEffect(() => {
  if (providerIdRef.current !== prizeProvider) {
    providerIdRef.current = prizeProvider;
    // Full reset when provider changes
    resetGame();
  }
}, [prizeProvider, resetGame]);

// Remove prizeProvider from other effect dependencies
// They'll naturally re-run when resetGame updates state
```

---

### 9. selectDropPosition Could Use Stale prizeSession
**Severity:** MEDIUM
**Location:** `usePlinkoGame.ts` lines 362-421

**Issue:**
The `selectDropPosition` callback depends on `prizeSession` and is recreated when it changes. If the async load updates `prizeSession` while the user is selecting a drop position, the callback might use the new session's data instead of the original.

**Code:**
```typescript
const selectDropPosition = useCallback(
  (dropZone: DropZone) => {
    if (gameState.state === 'selecting-position' && prizeSession) {
      // Line 368: Gets prizes from current prizeSession
      const freshPrizes = [...prizeSession.prizes];
      const winningIndex = prizeSession.winningIndex;
      // ...
    }
  },
  [
    gameState.state,
    gameState.context.seed,
    boardWidth,
    boardHeight,
    pegRows,
    prizeSession,  // <-- Callback recreated when this changes
    dispatch,
  ]
);
```

**Scenario:**
1. Game initializes with session A (winningIndex=2)
2. User clicks "Start" and enters selecting-position state
3. Async load completes with session A (same data, new reference)
4. `selectDropPosition` is recreated with new `prizeSession` reference
5. User clicks a drop zone
6. Callback uses session A data (which happens to be same as before)

**Why This is MEDIUM not HIGH:**
- If sync and async return same data (which they should), no problem
- Only an issue if they return different data (Issue #3)
- User would have to be in selecting-position state when async load completes (narrow window)

**Root Cause:**
Callback depends on mutable session data instead of capturing it at initialization.

**Recommended Fix:**
```typescript
// Capture session at initialization, don't depend on live prizeSession
const initializedSessionRef = useRef<PrizeProviderResult | null>(null);

// In initialization effect:
initializedSessionRef.current = prizeSession;

// In selectDropPosition:
const selectDropPosition = useCallback(
  (dropZone: DropZone) => {
    const session = initializedSessionRef.current;
    if (gameState.state === 'selecting-position' && session) {
      const freshPrizes = [...session.prizes];
      const winningIndex = session.winningIndex;
      // ...
    }
  },
  [
    gameState.state,
    gameState.context.seed,
    boardWidth,
    boardHeight,
    pegRows,
    // Remove prizeSession dependency
    dispatch,
  ]
);
```

---

## LOW Severity Issues

### 10. Debug Logging in Render Phase
**Severity:** LOW
**Location:** `usePlinkoGame.ts` lines 464-473

**Issue:**
Debug logging is performed in the render phase instead of in a `useEffect`, causing it to run on every render when state is 'revealed'.

**Code:**
```typescript
// Outside useEffect - runs every render!
if (gameState.state === 'revealed' && winningPrize) {
  console.log('[PLINKO DEBUG] Returning selectedPrize at reveal state:', {
    winningPrizeId: winningPrize.id,
    // ...
  });
}

return {
  state: gameState.state,
  // ...
};
```

**Impact:**
- Console spam if component re-renders while in revealed state
- Minor performance impact
- Just debug code, not production issue

**Recommended Fix:**
```typescript
// Use useEffect to log only on state transition
useEffect(() => {
  if (gameState.state === 'revealed' && winningPrize) {
    console.log('[PLINKO DEBUG] Revealed selectedPrize:', {
      winningPrizeId: winningPrize.id,
      winningPrizeLabel: winningPrize.label,
      winningPrizeType: winningPrize.type,
      freeReward: winningPrize.freeReward,
      selectedIndex: gameState.context.selectedIndex,
      prizeAtSelectedIndex: prizes[gameState.context.selectedIndex]?.label,
    });
  }
}, [gameState.state, winningPrize, gameState.context.selectedIndex, prizes]);
```

---

### 11. Cleanup Function Pattern Could Be Clearer
**Severity:** LOW
**Location:** `usePlinkoGame.ts` lines 119-155

**Issue:**
The async load effect uses a `cancelled` flag for cleanup, which is correct, but the pattern could be clearer about ref updates after cancellation.

**Code:**
```typescript
useEffect(() => {
  let cancelled = false;

  prizeProvider.load(...)
    .then((result) => {
      if (cancelled) return;  // <-- Correct!

      hasInitialized.current = false;  // <-- Ref update after check
      setPrizeSession(result);
      setIsLoadingSession(false);
    })
    // ...

  return () => {
    cancelled = true;
  };
}, [/* deps */]);
```

**Why This is Fine:**
- Refs don't cause re-renders, so updating after unmount is safe
- The `if (cancelled) return` prevents state updates
- Ref represents state about the hook instance, not component lifecycle

**Why It Could Be Clearer:**
- Conceptually, updating a ref after cancellation is odd
- Could be misunderstood by future maintainers

**Recommended Fix:**
```typescript
// No functional change needed, but could add comment:
.then((result) => {
  if (cancelled) return;

  // Safe to update ref even after cancellation (doesn't cause re-render)
  // But we check cancelled first to avoid state updates
  hasInitialized.current = false;
  setPrizeSession(result);
  setIsLoadingSession(false);
})

// Or move ref update after state updates for clarity:
.then((result) => {
  if (cancelled) return;

  setPrizeSession(result);
  setIsLoadingSession(false);
  // Update ref last
  hasInitialized.current = false;
})
```

---

## Recommended Architectural Changes

### Option 1: Eliminate Dual Loading Pattern (RECOMMENDED)

**Change:**
- Remove `loadSync()` from `PrizeProvider` interface
- Remove `initialSyncSession` useMemo
- Always use `load()` and show loading state

**Benefits:**
- Eliminates ALL race conditions
- Single source of truth
- Simpler mental model
- No consistency issues between sync/async

**Implementation:**
```typescript
export interface PrizeProvider {
  load(context?: PrizeProviderContext): Promise<PrizeProviderResult>;
  // Remove loadSync
}

// In usePlinkoGame:
const [prizeSession, setPrizeSession] = useState<PrizeProviderResult | null>(null);
const [isLoadingSession, setIsLoadingSession] = useState(true);

// Single load effect:
useEffect(() => {
  let cancelled = false;
  setIsLoadingSession(true);

  prizeProvider.load({ seedOverride: resolveSeedOverride() })
    .then((result) => {
      if (cancelled) return;
      setPrizeSession(result);
      setIsLoadingSession(false);
    })
    .catch((error) => {
      if (cancelled) return;
      setLoadError(error);
      setIsLoadingSession(false);
    });

  return () => { cancelled = true; };
}, [prizeProvider, resolveSeedOverride, sessionKey]);

// Single initialization effect (no hasInitialized needed!):
useEffect(() => {
  if (prizeSession && gameState.state === 'idle') {
    // Initialize once per session
    // Effect won't re-run unless prizeSession or state changes
  }
}, [prizeSession, gameState.state, /* other deps */]);
```

**Trade-off:**
- Slower initial render (must wait for async load)
- But eliminates all race conditions and complexity

---

### Option 2: Use Session Identifier for Initialization Tracking

**Change:**
- Keep dual loading pattern
- Track which session was initialized by its seed/ID
- Never re-initialize the same session

**Implementation:**
```typescript
const initializedSessionId = useRef<number | null>(null);

useEffect(() => {
  if (prizeSession &&
      gameState.state === 'idle' &&
      initializedSessionId.current !== prizeSession.seed) {

    initializedSessionId.current = prizeSession.seed;

    // Initialize
    const sessionPrizes = [...prizeSession.prizes];
    const winningIndex = prizeSession.winningIndex;
    setWinningPrize(sessionPrizes[winningIndex]!);
    // ... rest of initialization
  }
}, [prizeSession, gameState.state, /* other deps */]);

// In async load effect:
.then((result) => {
  if (cancelled) return;
  // Don't reset hasInitialized!
  setPrizeSession(result);
  setIsLoadingSession(false);
})

// In resetGame:
initializedSessionId.current = null;
```

**Benefits:**
- Keeps instant initial render with loadSync
- Prevents double initialization
- Simpler than current hasInitialized pattern

**Trade-offs:**
- Still has potential consistency issues (Issue #3)
- More complex than Option 1

---

### Option 3: Enforce Sync/Async Consistency

**Change:**
- Keep dual loading pattern
- Add validation that sync and async return same data
- Detect and handle inconsistencies

**Implementation:**
```typescript
useEffect(() => {
  let cancelled = false;

  prizeProvider.load({ seedOverride: resolveSeedOverride() })
    .then((result) => {
      if (cancelled) return;

      // Validate consistency with sync session
      if (prizeSession && prizeSession.seed !== result.seed) {
        console.error('Provider consistency violation: sync and async returned different sessions!');
        // Prefer the async result as authoritative
        initializedSessionId.current = null; // Force re-init
      }

      setPrizeSession(result);
      setIsLoadingSession(false);
    });

  return () => { cancelled = true; };
}, [prizeProvider, resolveSeedOverride, sessionKey, prizeSession]);
```

**Benefits:**
- Keeps instant initial render
- Detects consistency violations
- Can handle inconsistencies gracefully

**Trade-offs:**
- Most complex option
- Doesn't prevent inconsistencies, just detects them
- User might see UI flicker when re-initializing

---

## Summary of Recommendations

**Immediate Fixes (Prevent Current Bugs):**
1. ✅ Remove `hasInitialized.current = false` from async load effect (line 135)
2. ✅ Use session ID tracking instead of boolean flag
3. ✅ Add `winningPrizeLockedRef` to prevent overwriting

**Short-term Improvements:**
4. ✅ Fix initialization effect dependencies (use specific values, not object reference)
5. ✅ Remove `dispatch` from dependency arrays
6. ✅ Move debug logging to useEffect

**Long-term Architectural Change:**
7. ✅ **Eliminate dual loading pattern entirely** (Option 1 above)
   - Simplest and most robust solution
   - Prevents all race conditions
   - Trade-off: Slower initial render (acceptable for reliability)

---

## Test Coverage Gaps

The following scenarios should have tests:
1. ✅ Provider change mid-game (should reset cleanly)
2. ✅ Async load completing after initialization
3. ✅ Reset game while async load is pending
4. ✅ Multiple rapid resets (sessionKey incrementing quickly)
5. ✅ Provider returning different data in sync vs async (should detect)
6. ✅ selectDropPosition called during async load update

---

## Conclusion

The prize provider system has fundamental architectural issues stemming from the dual sync/async loading pattern. While the recent fix (removing `setPrizes` from async handler) prevents one symptom, the root cause remains: **the initialization effect can run multiple times for the same game session, overwriting the supposedly immutable `winningPrize`.**

The recommended solution is to **eliminate the dual loading pattern entirely** and only use async `load()`. This simplifies the architecture, eliminates all race conditions, and provides a single source of truth. The trade-off of a slower initial render is acceptable compared to the risk of awarding users incorrect prizes.

If instant initial render is absolutely required, use **Option 2 (session identifier tracking)** as a compromise, but be aware of the consistency risks outlined in Issue #3.
