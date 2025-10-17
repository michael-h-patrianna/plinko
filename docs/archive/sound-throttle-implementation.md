# Sound Throttle Implementation

**Date:** October 11, 2025
**Status:** ✅ Implemented & Tested
**Related Issue:** Peg-hit sound audio clutter during rapid collisions

---

## Problem Statement

When the ball collides with multiple pegs in rapid succession (20-30 collisions per second), playing the peg-hit sound for every collision creates:
- **Audio clutter**: Overlapping sounds create a muddy, unpleasant audio experience
- **Performance overhead**: Excessive sound playback can impact performance
- **User experience degradation**: Too many simultaneous sounds reduce audio clarity

## Solution Overview

Implemented a **performant throttle mechanism** in `SFXController` that prevents the same sound from playing too frequently. The system uses high-precision timestamps to track when each sound was last played and enforces a configurable minimum delay between plays.

### Key Features

- **O(1) Performance**: Uses `Map` for constant-time lookups and stores
- **Per-Sound Configuration**: Each sound can have its own throttle delay
- **Opt-In Design**: Throttling only applies when explicitly requested via `{ throttle: true }` option
- **Zero Allocations**: No memory allocation during throttle checks (performance-critical path)
- **High-Precision Timing**: Uses `PerformanceAdapter.now()` for sub-millisecond accuracy (platform-agnostic)
- **Independent Tracking**: Sounds are throttled independently of each other

---

## Implementation Details

### Core Changes to SFXController

```typescript
class SFXController {
  // Added two Maps for O(1) throttle tracking
  private lastPlayTimestamps = new Map<string, number>();
  private throttleDelays = new Map<string, number>();
  private performanceAdapter: PerformanceAdapter;

  constructor(
    adapter: AudioAdapter,
    volumeController: VolumeController,
    performanceAdapter: PerformanceAdapter  // Platform-agnostic timing
  ) {
    this.adapter = adapter;
    this.volumeController = volumeController;
    this.performanceAdapter = performanceAdapter;
  }

  /**
   * Configure throttle delay for a sound
   * @param id - Sound effect ID
   * @param delayMs - Minimum delay in milliseconds between plays (e.g., 50)
   */
  setThrottleDelay(id: SoundEffectId, delayMs: number): void {
    this.throttleDelays.set(id, Math.max(0, delayMs));
  }

  /**
   * Play sound with optional throttling
   * @param id - Sound effect ID
   * @param options.throttle - If true, enforces configured throttle delay
   */
  play(id: SoundEffectId, options?: PlayOptions & { throttle?: boolean }): PlaybackId {
    // Check throttle if enabled
    if (options?.throttle) {
      const throttleDelay = this.throttleDelays.get(id);
      if (throttleDelay !== undefined) {
        const now = this.performanceAdapter.now(); // Platform-agnostic timing
        const lastPlay = this.lastPlayTimestamps.get(id);

        if (lastPlay !== undefined && now - lastPlay < throttleDelay) {
          // Throttled - skip playback
          return -1;
        }

        // Update timestamp for successful play
        this.lastPlayTimestamps.set(id, now);
      }
    }

    // ... rest of play logic
  }

  /**
   * Clear throttle state for a sound
   */
  clearThrottleDelay(id: SoundEffectId): void {
    this.throttleDelays.delete(id);
    this.lastPlayTimestamps.delete(id);
  }
}
```

### Configuration

Throttle delays are configured during audio initialization:

```typescript
// src/audio/hooks/useAudioPreloader.ts
async function preloadAudio() {
  // ... load sounds ...

  // Configure throttle delays for rapid-fire sounds
  sfxController.setThrottleDelay('ball-peg-hit', 50); // Max once per 50ms
}
```

### Usage in Collision Handler

```typescript
// src/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx
if (newHits.length > 0) {
  // Trigger flash imperatively via driver
  driver.updatePegFlash(pegId, true);

  // Play peg hit sound with throttling
  if (sfxController) {
    sfxController.play('ball-peg-hit', { throttle: true });
  }
```markdown
# Deprecated: Sound Throttle Implementation

This historical implementation note has been removed.

For current sound system behavior and APIs, see:
- docs/sound-engine.md
- src/plinko/audio/**
```

