# Plinko Sound Engine: Implementation Tasks

**Document Version:** 1.0
**Date:** October 11, 2025
**Audio Library:** Howler.js (Web)
**Related Documents:** [sound-engine.md](./sound-engine.md), [sound-design-concept.md](./sound-design-concept.md)

---

## Overview

This document breaks down the sound engine implementation into **sequential, testable tasks**. Each task is a small increment that can be implemented, tested, and verified before moving to the next. Tasks must be completed in order as later tasks depend on earlier foundations.

### Implementation Workflow

For each task:
1. **Implement** - Write the code for the task
2. **Test** - Run unit tests to verify functionality
3. **Verify** - Ensure all tests pass
4. **Mark Done** - Update task status to ✅
5. **Move to Next** - Proceed to next task in sequence

### Task Status Legend

- ⏳ **Pending** - Not started
- 🔨 **In Progress** - Currently being implemented
- ✅ **Done** - Implementation complete and tests passing
- ⚠️ **Blocked** - Waiting on dependency or issue

---

## Phase 1: Foundation & Types

### Task 1.1: Project Structure Setup
**Status:** ⏳ Pending
**Estimated Time:** 30 minutes
**Dependencies:** None

**Description:**
Create the base directory structure for the audio engine.

**Implementation Steps:**
1. Create `src/audio/` directory
2. Create subdirectories:
   - `src/audio/core/`
   - `src/audio/adapters/`
   - `src/audio/react/`
   - `src/audio/types/`
   - `src/audio/utils/`
   - `src/audio/__tests__/`

**Acceptance Criteria:**
- [ ] All directories exist in correct locations
- [ ] Directory structure matches file structure in sound-engine.md section 10

**Test Verification:**
```bash
# Verify directory structure
ls -R src/audio/
```

---

### Task 1.2: Install Dependencies
**Status:** ⏳ Pending
**Estimated Time:** 15 minutes
**Dependencies:** Task 1.1

**Description:**
Install Howler.js and TypeScript type definitions.

**Implementation Steps:**
1. Install Howler.js: `npm install howler`
2. Install types: `npm install --save-dev @types/howler`
3. Verify installation in package.json

**Acceptance Criteria:**
- [ ] `howler` added to dependencies
- [ ] `@types/howler` added to devDependencies
- [ ] Version is latest stable (v2.2.3 or newer)
- [ ] No installation errors

**Test Verification:**
```bash
# Verify installation
npm list howler
npm list @types/howler
```

---

### Task 1.3: Define Core TypeScript Types
**Status:** ⏳ Pending
**Estimated Time:** 45 minutes
**Dependencies:** Task 1.1

**Description:**
Create all TypeScript type definitions for the sound engine.

**Files to Create:**
- `src/audio/types/index.ts` - Main type exports
- `src/audio/types/SoundEffectId.ts` - Sound effect ID enum
- `src/audio/types/MusicTrackId.ts` - Music track ID enum
- `src/audio/types/Config.ts` - Configuration types

**Implementation Steps:**

1. Create `src/audio/types/SoundEffectId.ts`:
```typescript
// All 70+ sound effect IDs from sound-design-concept.md
export type SoundEffectId =
  // UI Sounds (8 sounds)
  | 'ui-launch'
  | 'ui-button-tap'
  | 'ui-button-primary'
  | 'ui-drop-position'
  | 'ui-settings-open'
  | 'ui-settings-close'
  | 'ui-slider-drag'
  | 'ui-toast'

  // Countdown (6 sounds)
  | 'countdown-3'
  | 'countdown-2'
  | 'countdown-1'
  | 'countdown-go'
  | 'countdown-ring'
  | 'countdown-particles'

  // Ball Physics (8 sounds)
  | 'ball-drop'
  | 'ball-trail'
  | 'ball-peg-hit'
  | 'ball-peg-hit-low'
  | 'ball-peg-hit-high'
  | 'ball-peg-flash'
  | 'ball-peg-ripple'
  | 'ball-wall-hit'

  // Landing (4 sounds)
  | 'land-impact-win'
  | 'land-impact-nowin'
  | 'land-shockwave'
  | 'land-glow'

  // Anticipation (5 sounds)
  | 'antic-heartbeat'
  | 'antic-scale-up'
  | 'antic-focus'
  | 'antic-dim'
  | 'antic-build'

  // Win Celebration (7 sounds)
  | 'win-confetti-burst'
  | 'win-confetti-trail'
  | 'win-star-burst'
  | 'win-flash'
  | 'win-stinger'
  | 'win-tada'
  | 'win-reveal'

  // No Win (4 sounds)
  | 'nowin-landing'
  | 'nowin-acknowledge'
  | 'nowin-dim'
  | 'nowin-affirmation'

  // Prize Reveal (7 sounds)
  | 'prize-you-won'
  | 'prize-counter'
  | 'prize-icon-pop'
  | 'prize-badge'
  | 'prize-claim-appear'
  | 'prize-claim-press'
  | 'prize-claimed'

  // Screen Effects (3 sounds)
  | 'fx-screen-shake'
  | 'fx-screen-shake-subtle'
  | 'fx-haptic'

  // Ambient (2 sounds)
  | 'amb-idle'
  | 'amb-board-hum'

  // Error (2 sounds)
  | 'err-notification'
  | 'err-loading';
```

2. Create `src/audio/types/MusicTrackId.ts`:
```typescript
export type MusicTrackId =
  | 'music-base'           // Base layer loop
  | 'music-tension'        // Tension layer
  | 'music-win-stinger'    // Win celebration stinger
  | 'music-nowin-stinger'; // No-win acknowledgment stinger
```

3. Create `src/audio/types/Config.ts`:
```typescript
import { SoundEffectId } from './SoundEffectId';

export interface SoundEngineConfig {
  // Asset paths
  assetBasePath: string;
  musicPath?: string;
  sfxPath?: string;

  // Preloading
  preloadAssets: boolean;
  preloadCriticalOnly: boolean;
  criticalSounds: SoundEffectId[];

  // Volume defaults (0-1 range)
  defaultMasterVolume: number;
  defaultMusicVolume: number;
  defaultSFXVolume: number;

  // Performance
  maxSimultaneousSounds: number;
  pegHitPoolSize: number;

  // Features
  enableAdaptiveMusic: boolean;
  enableMusicDucking: boolean;
  enableHapticFeedback: boolean;

  // Storage
  persistVolumeSettings: boolean;
  storageKey: string;
}

export interface PlayOptions {
  volume?: number;      // 0-1
  pitch?: number;       // -1 to 1 (variation from base rate)
  delay?: number;       // ms delay before playing
  loop?: boolean;
}

export interface MusicOptions {
  loop: boolean;
  fadeInMs?: number;
  volume?: number;
}

export interface SFXOptions {
  preload?: boolean;
  volume?: number;
}

export type PlaybackId = number | string;

export interface VolumeSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}
```

4. Create `src/audio/types/index.ts`:
```typescript
export * from './SoundEffectId';
export * from './MusicTrackId';
export * from './Config';

// Re-export game state types (assuming they exist)
export type { GameState } from '@/game/stateMachine';
```

**Acceptance Criteria:**
- [ ] All 70+ sound effect IDs defined in SoundEffectId type
- [ ] All 4 music track IDs defined in MusicTrackId type
- [ ] SoundEngineConfig interface matches spec in sound-engine.md
- [ ] All supporting interfaces defined (PlayOptions, MusicOptions, etc.)
- [ ] Types export cleanly from index.ts
- [ ] TypeScript compilation succeeds with no errors

**Test Verification:**
```bash
# Type check
npm run typecheck

# Verify exports
node -e "console.log(require('./src/audio/types/index.ts'))"
```

---

### Task 1.4: Create Default Configuration
**Status:** ⏳ Pending
**Estimated Time:** 20 minutes
**Dependencies:** Task 1.3

**Description:**
Create a default configuration factory function with sensible defaults.

**Files to Create:**
- `src/audio/utils/createDefaultConfig.ts`

**Implementation:**

```typescript
import { SoundEngineConfig, SoundEffectId } from '../types';

export function createDefaultConfig(
  overrides?: Partial<SoundEngineConfig>
): SoundEngineConfig {
  const defaults: SoundEngineConfig = {
    // Asset paths
    assetBasePath: '/assets/audio',
    musicPath: '/assets/audio/music',
    sfxPath: '/assets/audio/sfx',

    // Preloading
    preloadAssets: true,
    preloadCriticalOnly: true,
    criticalSounds: [
      'countdown-3',
      'countdown-2',
      'countdown-1',
      'countdown-go',
      'ball-peg-hit',
      'ball-peg-hit-low',
      'ball-peg-hit-high',
      'land-impact-win',
      'land-impact-nowin',
      'ui-button-tap',
      'ui-button-primary',
    ] as SoundEffectId[],

    // Volume defaults (0-1 range)
    defaultMasterVolume: 1.0,
    defaultMusicVolume: 0.7,
    defaultSFXVolume: 1.0,

    // Performance
    maxSimultaneousSounds: 32,
    pegHitPoolSize: 10,

    // Features
    enableAdaptiveMusic: true,
    enableMusicDucking: true,
    enableHapticFeedback: false,

    // Storage
    persistVolumeSettings: true,
    storageKey: 'plinko-audio-settings',
  };

  return {
    ...defaults,
    ...overrides,
  };
}
```

**Acceptance Criteria:**
- [ ] Factory function returns complete SoundEngineConfig
- [ ] All required fields have sensible defaults
- [ ] Critical sounds list includes essential gameplay sounds
- [ ] Overrides merge correctly with defaults
- [ ] TypeScript types are satisfied

**Test Verification:**
Create `src/audio/__tests__/createDefaultConfig.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { createDefaultConfig } from '../utils/createDefaultConfig';

describe('createDefaultConfig', () => {
  it('should return default configuration', () => {
    const config = createDefaultConfig();

    expect(config.assetBasePath).toBe('/assets/audio');
    expect(config.defaultMasterVolume).toBe(1.0);
    expect(config.defaultMusicVolume).toBe(0.7);
    expect(config.preloadCriticalOnly).toBe(true);
    expect(config.criticalSounds).toContain('countdown-go');
  });

  it('should merge overrides with defaults', () => {
    const config = createDefaultConfig({
      defaultMasterVolume: 0.5,
      enableAdaptiveMusic: false,
    });

    expect(config.defaultMasterVolume).toBe(0.5);
    expect(config.enableAdaptiveMusic).toBe(false);
    // Defaults should remain
    expect(config.assetBasePath).toBe('/assets/audio');
  });

  it('should include all critical sounds', () => {
    const config = createDefaultConfig();

    expect(config.criticalSounds).toHaveLength(11);
    expect(config.criticalSounds).toContain('ball-peg-hit');
    expect(config.criticalSounds).toContain('land-impact-win');
  });
});
```

Run test:
```bash
npm test -- createDefaultConfig.test.ts
```

---

## Phase 2: Audio Adapter Layer

### Task 2.1: Define AudioAdapter Interface
**Status:** ⏳ Pending
**Estimated Time:** 30 minutes
**Dependencies:** Task 1.3

**Description:**
Create the platform-agnostic AudioAdapter interface that both web and native adapters will implement.

**Files to Create:**
- `src/audio/adapters/AudioAdapter.ts`

**Implementation:**

```typescript
import { PlaybackId, PlayOptions } from '../types';

/**
 * Platform-agnostic audio adapter interface.
 * Implementations: WebAudioAdapter (Howler.js), NativeAudioAdapter (RN Sound)
 */
export interface AudioAdapter {
  /**
   * Initialize the audio system.
   * Must be called before any other methods.
   */
  initialize(): Promise<void>;

  /**
   * Check if adapter is initialized.
   */
  isInitialized(): boolean;

  /**
   * Load a music track.
   * @param id - Unique identifier for the track
   * @param url - Path to audio file
   * @param loop - Whether track should loop
   */
  loadMusic(id: string, url: string, loop: boolean): Promise<void>;

  /**
   * Play a music track with optional fade-in.
   * @param id - Track identifier
   * @param fadeInMs - Fade-in duration in milliseconds
   */
  playMusic(id: string, fadeInMs?: number): void;

  /**
   * Stop a music track with optional fade-out.
   * @param id - Track identifier
   * @param fadeOutMs - Fade-out duration in milliseconds
   */
  stopMusic(id: string, fadeOutMs?: number): void;

  /**
   * Set volume for a specific music track.
   * @param id - Track identifier
   * @param volume - Volume level (0-1)
   */
  setMusicVolume(id: string, volume: number): void;

  /**
   * Check if a music track is currently playing.
   */
  isMusicPlaying(id: string): boolean;

  /**
   * Load a sound effect.
   * @param id - Unique identifier for the sound
   * @param url - Path to audio file
   */
  loadSFX(id: string, url: string): Promise<void>;

  /**
   * Play a sound effect.
   * @param id - Sound identifier
   * @param options - Playback options (volume, pitch, delay)
   * @returns Playback ID for controlling this specific instance
   */
  playSFX(id: string, options?: PlayOptions): PlaybackId;

  /**
   * Stop a specific sound effect instance.
   * @param playbackId - ID returned from playSFX
   */
  stopSFX(playbackId: PlaybackId): void;

  /**
   * Stop all instances of a sound effect.
   * @param id - Sound identifier
   */
  stopAllSFX(id: string): void;

  /**
   * Check if a sound is loaded.
   */
  isLoaded(id: string): boolean;

  /**
   * Set global volume for all sounds.
   * @param volume - Volume level (0-1)
   */
  setGlobalVolume(volume: number): void;

  /**
   * Mute all audio.
   */
  mute(): void;

  /**
   * Unmute all audio.
   */
  unmute(): void;

  /**
   * Check if audio is muted.
   */
  isMuted(): boolean;

  /**
   * Clean up resources and destroy the adapter.
   */
  destroy(): void;
}
```

**Acceptance Criteria:**
- [ ] Interface defines all required methods
- [ ] Method signatures match sound-engine.md specification
- [ ] JSDoc comments explain each method
- [ ] TypeScript compilation succeeds
- [ ] Interface is platform-agnostic (no Howler/RN specific types)

**Test Verification:**
```bash
npm run typecheck
```

---

### Task 2.2: Implement WebAudioAdapter (Howler.js) - Part 1: Initialization
**Status:** ⏳ Pending
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.1, Task 1.2

**Description:**
Implement the initialization and setup methods of WebAudioAdapter using Howler.js.

**Files to Create:**
- `src/audio/adapters/WebAudioAdapter.ts`

**Implementation (Part 1):**

```typescript
import { Howl, Howler } from 'howler';
import { AudioAdapter } from './AudioAdapter';
import { PlaybackId, PlayOptions } from '../types';

/**
 * Web audio adapter using Howler.js.
 * Provides cross-browser audio support with Web Audio API + HTML5 Audio fallback.
 */
export class WebAudioAdapter implements AudioAdapter {
  private initialized = false;
  private musicTracks = new Map<string, Howl>();
  private sfxSounds = new Map<string, Howl>();
  private globalVolume = 1.0;
  private muted = false;

  /**
   * Initialize the Howler audio system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Enable auto-unlock for mobile browsers (requires user interaction)
    Howler.autoUnlock = true;

    // Use Web Audio API for better performance
    Howler.usingWebAudio = true;

    // Set initial global volume
    Howler.volume(this.globalVolume);

    // Handle page visibility changes (pause audio when tab hidden)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.initialized = true;
  }

  /**
   * Check if adapter is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Set global volume for all sounds.
   */
  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.globalVolume);
  }

  /**
   * Mute all audio.
   */
  mute(): void {
    this.muted = true;
    Howler.mute(true);
  }

  /**
   * Unmute all audio.
   */
  unmute(): void {
    this.muted = false;
    Howler.mute(false);
  }

  /**
   * Check if audio is muted.
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    // Stop all sounds
    this.musicTracks.forEach(howl => howl.unload());
    this.sfxSounds.forEach(howl => howl.unload());

    // Clear maps
    this.musicTracks.clear();
    this.sfxSounds.clear();

    // Remove event listeners
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.initialized = false;
  }

  /**
   * Handle page visibility changes.
   * Mute audio when tab is hidden, unmute when visible.
   */
  private handleVisibilityChange = (): void => {
    if (typeof document !== 'undefined') {
      if (document.hidden) {
        Howler.mute(true);
      } else if (!this.muted) {
        Howler.mute(false);
      }
    }
  };

  // Placeholder methods (to be implemented in subsequent tasks)
  loadMusic(id: string, url: string, loop: boolean): Promise<void> {
    throw new Error('Not implemented yet');
  }

  playMusic(id: string, fadeInMs?: number): void {
    throw new Error('Not implemented yet');
  }

  stopMusic(id: string, fadeOutMs?: number): void {
    throw new Error('Not implemented yet');
  }

  setMusicVolume(id: string, volume: number): void {
    throw new Error('Not implemented yet');
  }

  isMusicPlaying(id: string): boolean {
    throw new Error('Not implemented yet');
  }

  loadSFX(id: string, url: string): Promise<void> {
    throw new Error('Not implemented yet');
  }

  playSFX(id: string, options?: PlayOptions): PlaybackId {
    throw new Error('Not implemented yet');
  }

  stopSFX(playbackId: PlaybackId): void {
    throw new Error('Not implemented yet');
  }

  stopAllSFX(id: string): void {
    throw new Error('Not implemented yet');
  }

  isLoaded(id: string): boolean {
    throw new Error('Not implemented yet');
  }
}
```

**Acceptance Criteria:**
- [ ] Class implements AudioAdapter interface
- [ ] Initialization sets up Howler correctly
- [ ] Global volume control works
- [ ] Mute/unmute functionality works
- [ ] Visibility change handler pauses audio when tab hidden
- [ ] Destroy cleans up all resources
- [ ] TypeScript compilation succeeds

**Test Verification:**
Create `src/audio/__tests__/WebAudioAdapter.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Howler } from 'howler';
import { WebAudioAdapter } from '../adapters/WebAudioAdapter';

// Mock Howler
vi.mock('howler', () => ({
  Howler: {
    autoUnlock: false,
    usingWebAudio: false,
    volume: vi.fn(),
    mute: vi.fn(),
  },
  Howl: vi.fn(),
}));

describe('WebAudioAdapter - Initialization', () => {
  let adapter: WebAudioAdapter;

  beforeEach(() => {
    adapter = new WebAudioAdapter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    adapter.destroy();
  });

  it('should initialize successfully', async () => {
    expect(adapter.isInitialized()).toBe(false);

    await adapter.initialize();

    expect(adapter.isInitialized()).toBe(true);
    expect(Howler.autoUnlock).toBe(true);
    expect(Howler.usingWebAudio).toBe(true);
  });

  it('should not initialize twice', async () => {
    await adapter.initialize();
    const firstCall = vi.mocked(Howler.volume).mock.calls.length;

    await adapter.initialize();
    const secondCall = vi.mocked(Howler.volume).mock.calls.length;

    expect(secondCall).toBe(firstCall); // No additional calls
  });

  it('should set global volume', async () => {
    await adapter.initialize();

    adapter.setGlobalVolume(0.5);

    expect(Howler.volume).toHaveBeenCalledWith(0.5);
  });

  it('should clamp volume between 0 and 1', async () => {
    await adapter.initialize();

    adapter.setGlobalVolume(1.5);
    expect(Howler.volume).toHaveBeenCalledWith(1.0);

    adapter.setGlobalVolume(-0.5);
    expect(Howler.volume).toHaveBeenCalledWith(0.0);
  });

  it('should mute and unmute audio', async () => {
    await adapter.initialize();

    expect(adapter.isMuted()).toBe(false);

    adapter.mute();
    expect(adapter.isMuted()).toBe(true);
    expect(Howler.mute).toHaveBeenCalledWith(true);

    adapter.unmute();
    expect(adapter.isMuted()).toBe(false);
    expect(Howler.mute).toHaveBeenCalledWith(false);
  });

  it('should clean up on destroy', async () => {
    await adapter.initialize();

    adapter.destroy();

    expect(adapter.isInitialized()).toBe(false);
  });
});
```

Run test:
```bash
npm test -- WebAudioAdapter.test.ts
```

---

### Task 2.3: Implement WebAudioAdapter - Part 2: Music Methods
**Status:** ⏳ Pending
**Estimated Time:** 60 minutes
**Dependencies:** Task 2.2

**Description:**
Implement music loading, playback, and control methods in WebAudioAdapter.

**Implementation:**

Add these methods to `src/audio/adapters/WebAudioAdapter.ts`:

```typescript
/**
 * Load a music track.
 */
async loadMusic(id: string, url: string, loop: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const howl = new Howl({
      src: [url],
      loop,
      preload: true,
      html5: false, // Use Web Audio API for better performance
      format: ['mp3', 'aac', 'webm'],
      onload: () => {
        this.musicTracks.set(id, howl);
        resolve();
      },
      onloaderror: (id, error) => {
        reject(new Error(`Failed to load music "${id}": ${error}`));
      },
    });
  });
}

/**
 * Play a music track with optional fade-in.
 */
playMusic(id: string, fadeInMs?: number): void {
  const howl = this.musicTracks.get(id);
  if (!howl) {
    console.warn(`Music track "${id}" not loaded`);
    return;
  }

  if (fadeInMs && fadeInMs > 0) {
    // Start at volume 0 and fade in
    howl.volume(0);
    howl.play();
    howl.fade(0, 1.0, fadeInMs);
  } else {
    howl.play();
  }
}

/**
 * Stop a music track with optional fade-out.
 */
stopMusic(id: string, fadeOutMs?: number): void {
  const howl = this.musicTracks.get(id);
  if (!howl) {
    return;
  }

  if (fadeOutMs && fadeOutMs > 0) {
    howl.fade(howl.volume(), 0, fadeOutMs);
    // Stop after fade completes
    setTimeout(() => {
      howl.stop();
    }, fadeOutMs);
  } else {
    howl.stop();
  }
}

/**
 * Set volume for a specific music track.
 */
setMusicVolume(id: string, volume: number): void {
  const howl = this.musicTracks.get(id);
  if (!howl) {
    return;
  }

  const clampedVolume = Math.max(0, Math.min(1, volume));
  howl.volume(clampedVolume);
}

/**
 * Check if a music track is currently playing.
 */
isMusicPlaying(id: string): boolean {
  const howl = this.musicTracks.get(id);
  if (!howl) {
    return false;
  }
  return howl.playing();
}
```

**Acceptance Criteria:**
- [ ] Music loads asynchronously with Promise
- [ ] Play supports fade-in duration
- [ ] Stop supports fade-out duration
- [ ] Volume control works per-track
- [ ] Playing state correctly reported
- [ ] Handles missing tracks gracefully

**Test Verification:**

Add to `src/audio/__tests__/WebAudioAdapter.test.ts`:

```typescript
describe('WebAudioAdapter - Music', () => {
  let adapter: WebAudioAdapter;
  let mockHowl: any;

  beforeEach(async () => {
    adapter = new WebAudioAdapter();
    await adapter.initialize();

    // Mock Howl instance
    mockHowl = {
      play: vi.fn(),
      stop: vi.fn(),
      volume: vi.fn(),
      fade: vi.fn(),
      playing: vi.fn(() => false),
      unload: vi.fn(),
    };

    vi.mocked(Howl).mockImplementation(() => mockHowl as any);
  });

  afterEach(() => {
    adapter.destroy();
  });

  it('should load music track', async () => {
    await adapter.loadMusic('test-music', '/audio/test.mp3', true);

    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/audio/test.mp3'],
        loop: true,
        preload: true,
      })
    );
  });

  it('should play music without fade', () => {
    adapter.loadMusic('test', '/test.mp3', false);

    adapter.playMusic('test');

    expect(mockHowl.play).toHaveBeenCalled();
    expect(mockHowl.fade).not.toHaveBeenCalled();
  });

  it('should play music with fade-in', () => {
    adapter.loadMusic('test', '/test.mp3', false);

    adapter.playMusic('test', 1000);

    expect(mockHowl.volume).toHaveBeenCalledWith(0);
    expect(mockHowl.play).toHaveBeenCalled();
    expect(mockHowl.fade).toHaveBeenCalledWith(0, 1.0, 1000);
  });

  it('should stop music with fade-out', () => {
    vi.useFakeTimers();
    mockHowl.volume.mockReturnValue(0.8);

    adapter.loadMusic('test', '/test.mp3', false);
    adapter.stopMusic('test', 500);

    expect(mockHowl.fade).toHaveBeenCalledWith(0.8, 0, 500);

    vi.advanceTimersByTime(500);
    expect(mockHowl.stop).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should set music volume', () => {
    adapter.loadMusic('test', '/test.mp3', false);

    adapter.setMusicVolume('test', 0.5);

    expect(mockHowl.volume).toHaveBeenCalledWith(0.5);
  });

  it('should report playing state', () => {
    mockHowl.playing.mockReturnValue(true);
    adapter.loadMusic('test', '/test.mp3', false);

    expect(adapter.isMusicPlaying('test')).toBe(true);
  });
});
```

Run test:
```bash
npm test -- WebAudioAdapter.test.ts
```

---

### Task 2.4: Implement WebAudioAdapter - Part 3: SFX Methods
**Status:** ⏳ Pending
**Estimated Time:** 60 minutes
**Dependencies:** Task 2.3

**Description:**
Implement sound effects loading and playback with pitch variation support.

**Implementation:**

Add these methods to `src/audio/adapters/WebAudioAdapter.ts`:

```typescript
/**
 * Load a sound effect.
 */
async loadSFX(id: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const howl = new Howl({
      src: [url],
      preload: true,
      html5: false, // Use Web Audio API
      format: ['mp3', 'aac', 'webm'],
      onload: () => {
        this.sfxSounds.set(id, howl);
        resolve();
      },
      onloaderror: (id, error) => {
        reject(new Error(`Failed to load SFX "${id}": ${error}`));
      },
    });
  });
}

/**
 * Play a sound effect.
 */
playSFX(id: string, options?: PlayOptions): PlaybackId {
  const howl = this.sfxSounds.get(id);
  if (!howl) {
    console.warn(`SFX "${id}" not loaded`);
    return -1;
  }

  // Start playback
  const playId = howl.play();

  // Apply volume if specified
  if (options?.volume !== undefined) {
    const clampedVolume = Math.max(0, Math.min(1, options.volume));
    howl.volume(clampedVolume, playId);
  }

  // Apply pitch variation if specified
  if (options?.pitch !== undefined) {
    // Pitch in Howler is rate: 1.0 = normal, <1.0 = slower/lower, >1.0 = faster/higher
    const rate = 1.0 + options.pitch;
    const clampedRate = Math.max(0.5, Math.min(2.0, rate)); // Limit to reasonable range
    howl.rate(clampedRate, playId);
  }

  // Apply delay if specified
  if (options?.delay && options.delay > 0) {
    // Howler doesn't support delay directly, so we'll handle it by stopping
    // the sound immediately and replaying after delay
    howl.pause(playId);
    setTimeout(() => {
      howl.play(playId as string);
    }, options.delay);
  }

  return playId;
}

/**
 * Stop a specific sound effect instance.
 */
stopSFX(playbackId: PlaybackId): void {
  // In Howler, we need to stop the sound by ID
  // We need to find which Howl owns this playback ID
  for (const howl of this.sfxSounds.values()) {
    try {
      howl.stop(playbackId as number);
    } catch {
      // Ignore errors if ID doesn't belong to this howl
    }
  }
}

/**
 * Stop all instances of a sound effect.
 */
stopAllSFX(id: string): void {
  const howl = this.sfxSounds.get(id);
  if (howl) {
    howl.stop();
  }
}

/**
 * Check if a sound is loaded.
 */
isLoaded(id: string): boolean {
  return this.musicTracks.has(id) || this.sfxSounds.has(id);
}
```

**Acceptance Criteria:**
- [ ] SFX loads asynchronously with Promise
- [ ] Play returns unique playback ID
- [ ] Volume control works per-playback instance
- [ ] Pitch variation works (using rate parameter)
- [ ] Delay option works (though via setTimeout)
- [ ] Can stop specific playback instance
- [ ] Can stop all instances of a sound

**Test Verification:**

Add to `src/audio/__tests__/WebAudioAdapter.test.ts`:

```typescript
describe('WebAudioAdapter - SFX', () => {
  let adapter: WebAudioAdapter;
  let mockHowl: any;

  beforeEach(async () => {
    adapter = new WebAudioAdapter();
    await adapter.initialize();

    mockHowl = {
      play: vi.fn(() => 123), // Return mock playback ID
      stop: vi.fn(),
      pause: vi.fn(),
      volume: vi.fn(),
      rate: vi.fn(),
      unload: vi.fn(),
    };

    vi.mocked(Howl).mockImplementation(() => mockHowl as any);
  });

  afterEach(() => {
    adapter.destroy();
  });

  it('should load SFX', async () => {
    await adapter.loadSFX('test-sfx', '/audio/sfx.mp3');

    expect(Howl).toHaveBeenCalledWith(
      expect.objectContaining({
        src: ['/audio/sfx.mp3'],
        preload: true,
      })
    );

    expect(adapter.isLoaded('test-sfx')).toBe(true);
  });

  it('should play SFX without options', () => {
    adapter.loadSFX('test', '/test.mp3');

    const playbackId = adapter.playSFX('test');

    expect(mockHowl.play).toHaveBeenCalled();
    expect(playbackId).toBe(123);
  });

  it('should play SFX with volume', () => {
    adapter.loadSFX('test', '/test.mp3');

    adapter.playSFX('test', { volume: 0.5 });

    expect(mockHowl.volume).toHaveBeenCalledWith(0.5, 123);
  });

  it('should play SFX with pitch variation', () => {
    adapter.loadSFX('test', '/test.mp3');

    adapter.playSFX('test', { pitch: 0.2 });

    // pitch 0.2 = rate 1.2
    expect(mockHowl.rate).toHaveBeenCalledWith(1.2, 123);
  });

  it('should clamp pitch to reasonable range', () => {
    adapter.loadSFX('test', '/test.mp3');

    // Extreme pitch should be clamped
    adapter.playSFX('test', { pitch: 5.0 });
    expect(mockHowl.rate).toHaveBeenCalledWith(2.0, 123); // Max 2.0

    adapter.playSFX('test', { pitch: -5.0 });
    expect(mockHowl.rate).toHaveBeenCalledWith(0.5, 123); // Min 0.5
  });

  it('should play SFX with delay', () => {
    vi.useFakeTimers();
    adapter.loadSFX('test', '/test.mp3');

    adapter.playSFX('test', { delay: 500 });

    expect(mockHowl.pause).toHaveBeenCalledWith(123);

    vi.advanceTimersByTime(500);
    expect(mockHowl.play).toHaveBeenCalledWith('123');

    vi.useRealTimers();
  });

  it('should stop specific SFX instance', () => {
    adapter.loadSFX('test', '/test.mp3');
    const playbackId = adapter.playSFX('test');

    adapter.stopSFX(playbackId);

    expect(mockHowl.stop).toHaveBeenCalledWith(123);
  });

  it('should stop all SFX instances', () => {
    adapter.loadSFX('test', '/test.mp3');

    adapter.stopAllSFX('test');

    expect(mockHowl.stop).toHaveBeenCalled();
  });

  it('should handle playing non-existent SFX gracefully', () => {
    const playbackId = adapter.playSFX('non-existent');

    expect(playbackId).toBe(-1);
  });
});
```

Run test:
```bash
npm test -- WebAudioAdapter.test.ts
```

---

## Phase 3: Core Controllers

### Task 3.1: Implement VolumeController
**Status:** ⏳ Pending
**Estimated Time:** 45 minutes
**Dependencies:** Task 1.3, Task 2.4

**Description:**
Implement volume management with localStorage persistence.

**Files to Create:**
- `src/audio/core/VolumeController.ts`

**Implementation:**

```typescript
import { VolumeSettings } from '../types';

/**
 * Manages volume settings with persistence.
 */
export class VolumeController {
  private masterVolume: number;
  private musicVolume: number;
  private sfxVolume: number;
  private isMutedState: boolean;
  private storageKey: string;

  constructor(
    defaultMasterVolume = 1.0,
    defaultMusicVolume = 0.7,
    defaultSFXVolume = 1.0,
    storageKey = 'plinko-audio-settings'
  ) {
    this.masterVolume = defaultMasterVolume;
    this.musicVolume = defaultMusicVolume;
    this.sfxVolume = defaultSFXVolume;
    this.isMutedState = false;
    this.storageKey = storageKey;
  }

  /**
   * Set master volume (affects all audio).
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = this.clampVolume(volume);
  }

  /**
   * Set music volume (independent control).
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = this.clampVolume(volume);
  }

  /**
   * Set SFX volume (independent control).
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = this.clampVolume(volume);
  }

  /**
   * Get master volume.
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Get music volume.
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Get SFX volume.
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Get effective music volume (master * music).
   */
  getEffectiveMusicVolume(): number {
    return this.masterVolume * this.musicVolume;
  }

  /**
   * Get effective SFX volume (master * sfx).
   */
  getEffectiveSFXVolume(): number {
    return this.masterVolume * this.sfxVolume;
  }

  /**
   * Set muted state.
   */
  setMuted(muted: boolean): void {
    this.isMutedState = muted;
  }

  /**
   * Get muted state.
   */
  isMuted(): boolean {
    return this.isMutedState;
  }

  /**
   * Save volume settings to localStorage.
   */
  async saveToStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const settings: VolumeSettings = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMutedState,
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  /**
   * Load volume settings from localStorage.
   */
  async loadFromStorage(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const settings: VolumeSettings = JSON.parse(stored);

        this.masterVolume = settings.masterVolume ?? this.masterVolume;
        this.musicVolume = settings.musicVolume ?? this.musicVolume;
        this.sfxVolume = settings.sfxVolume ?? this.sfxVolume;
        this.isMutedState = settings.isMuted ?? this.isMutedState;
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  /**
   * Clamp volume between 0 and 1.
   */
  private clampVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
  }
}
```

**Acceptance Criteria:**
- [ ] Independent volume controls for master/music/SFX
- [ ] Effective volume calculated correctly (master * category)
- [ ] Values clamped between 0 and 1
- [ ] Settings persist to localStorage
- [ ] Settings load from localStorage
- [ ] Handles localStorage errors gracefully
- [ ] Works without localStorage (e.g., SSR)

**Test Verification:**

Create `src/audio/__tests__/VolumeController.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VolumeController } from '../core/VolumeController';

describe('VolumeController', () => {
  let controller: VolumeController;

  beforeEach(() => {
    controller = new VolumeController(1.0, 0.7, 1.0, 'test-audio-settings');
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default volumes', () => {
    expect(controller.getMasterVolume()).toBe(1.0);
    expect(controller.getMusicVolume()).toBe(0.7);
    expect(controller.getSFXVolume()).toBe(1.0);
    expect(controller.isMuted()).toBe(false);
  });

  it('should set and get volumes', () => {
    controller.setMasterVolume(0.5);
    controller.setMusicVolume(0.3);
    controller.setSFXVolume(0.8);

    expect(controller.getMasterVolume()).toBe(0.5);
    expect(controller.getMusicVolume()).toBe(0.3);
    expect(controller.getSFXVolume()).toBe(0.8);
  });

  it('should clamp volumes to 0-1 range', () => {
    controller.setMasterVolume(1.5);
    expect(controller.getMasterVolume()).toBe(1.0);

    controller.setMusicVolume(-0.5);
    expect(controller.getMusicVolume()).toBe(0.0);
  });

  it('should calculate effective volumes', () => {
    controller.setMasterVolume(0.8);
    controller.setMusicVolume(0.5);
    controller.setSFXVolume(0.75);

    expect(controller.getEffectiveMusicVolume()).toBe(0.4); // 0.8 * 0.5
    expect(controller.getEffectiveSFXVolume()).toBe(0.6);   // 0.8 * 0.75
  });

  it('should set and get muted state', () => {
    controller.setMuted(true);
    expect(controller.isMuted()).toBe(true);

    controller.setMuted(false);
    expect(controller.isMuted()).toBe(false);
  });

  it('should save settings to localStorage', async () => {
    controller.setMasterVolume(0.5);
    controller.setMusicVolume(0.3);
    controller.setSFXVolume(0.7);
    controller.setMuted(true);

    await controller.saveToStorage();

    const stored = localStorage.getItem('test-audio-settings');
    expect(stored).toBeTruthy();

    const settings = JSON.parse(stored!);
    expect(settings.masterVolume).toBe(0.5);
    expect(settings.musicVolume).toBe(0.3);
    expect(settings.sfxVolume).toBe(0.7);
    expect(settings.isMuted).toBe(true);
  });

  it('should load settings from localStorage', async () => {
    const settings = {
      masterVolume: 0.4,
      musicVolume: 0.2,
      sfxVolume: 0.6,
      isMuted: true,
    };
    localStorage.setItem('test-audio-settings', JSON.stringify(settings));

    await controller.loadFromStorage();

    expect(controller.getMasterVolume()).toBe(0.4);
    expect(controller.getMusicVolume()).toBe(0.2);
    expect(controller.getSFXVolume()).toBe(0.6);
    expect(controller.isMuted()).toBe(true);
  });

  it('should handle missing localStorage gracefully', async () => {
    const originalLocalStorage = global.localStorage;
    // @ts-ignore
    delete global.localStorage;

    await expect(controller.saveToStorage()).resolves.not.toThrow();
    await expect(controller.loadFromStorage()).resolves.not.toThrow();

    global.localStorage = originalLocalStorage;
  });

  it('should handle corrupted localStorage data', async () => {
    localStorage.setItem('test-audio-settings', 'invalid json');

    await controller.loadFromStorage();

    // Should keep default values
    expect(controller.getMasterVolume()).toBe(1.0);
    expect(controller.getMusicVolume()).toBe(0.7);
  });
});
```

Run test:
```bash
npm test -- VolumeController.test.ts
```

---

### Task 3.2: Implement SFXController - Part 1: Basic Playback
**Status:** ⏳ Pending
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.4, Task 3.1

**Description:**
Implement basic SFX controller with loading, playback, and volume control.

**Files to Create:**
- `src/audio/core/SFXController.ts`

**Implementation (Part 1):**

```typescript
import { AudioAdapter } from '../adapters/AudioAdapter';
import { VolumeController } from './VolumeController';
import { SoundEffectId, PlayOptions, PlaybackId } from '../types';

/**
 * Controls sound effects playback with pooling and pitch variation.
 */
export class SFXController {
  private adapter: AudioAdapter;
  private volumeController: VolumeController;
  private loadedSounds = new Set<string>();
  private playingSounds = new Map<string, PlaybackId[]>();

  constructor(adapter: AudioAdapter, volumeController: VolumeController) {
    this.adapter = adapter;
    this.volumeController = volumeController;
  }

  /**
   * Load a sound effect.
   */
  async loadSound(id: SoundEffectId, url: string): Promise<void> {
    try {
      await this.adapter.loadSFX(id, url);
      this.loadedSounds.add(id);
    } catch (error) {
      console.error(`Failed to load SFX "${id}":`, error);
      throw error;
    }
  }

  /**
   * Check if a sound is loaded.
   */
  isLoaded(id: SoundEffectId): boolean {
    return this.loadedSounds.has(id);
  }

  /**
   * Play a sound effect.
   */
  play(id: SoundEffectId, options?: PlayOptions): PlaybackId {
    if (!this.isLoaded(id)) {
      console.warn(`SFX "${id}" not loaded`);
      return -1;
    }

    // Apply volume controller's SFX volume
    const effectiveVolume = options?.volume !== undefined
      ? options.volume * this.volumeController.getEffectiveSFXVolume()
      : this.volumeController.getEffectiveSFXVolume();

    const playOptions: PlayOptions = {
      ...options,
      volume: effectiveVolume,
    };

    const playbackId = this.adapter.playSFX(id, playOptions);

    // Track playing sounds
    const playing = this.playingSounds.get(id) || [];
    playing.push(playbackId);
    this.playingSounds.set(id, playing);

    return playbackId;
  }

  /**
   * Stop a specific playback instance.
   */
  stop(playbackId: PlaybackId): void {
    this.adapter.stopSFX(playbackId);

    // Remove from tracking
    for (const [id, instances] of this.playingSounds.entries()) {
      const index = instances.indexOf(playbackId);
      if (index !== -1) {
        instances.splice(index, 1);
        if (instances.length === 0) {
          this.playingSounds.delete(id);
        }
        break;
      }
    }
  }

  /**
   * Stop all instances of a sound.
   */
  stopAll(id?: SoundEffectId): void {
    if (id) {
      this.adapter.stopAllSFX(id);
      this.playingSounds.delete(id);
    } else {
      // Stop all sounds
      for (const soundId of this.loadedSounds) {
        this.adapter.stopAllSFX(soundId);
      }
      this.playingSounds.clear();
    }
  }

  /**
   * Get count of currently playing instances of a sound.
   */
  getActiveCount(id: SoundEffectId): number {
    return this.playingSounds.get(id)?.length || 0;
  }

  /**
   * Update volume for all SFX (called when volume controller changes).
   */
  updateVolume(): void {
    // Note: This affects new sounds played, not currently playing ones
    // To affect currently playing sounds, we'd need to track and update them
  }
}
```

**Acceptance Criteria:**
- [ ] Sounds load asynchronously
- [ ] Play applies volume controller's SFX volume
- [ ] Playback instances are tracked
- [ ] Can stop specific instance or all instances
- [ ] Active count accurately reflects playing sounds
- [ ] Handles unloaded sounds gracefully

**Test Verification:**

Create `src/audio/__tests__/SFXController.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SFXController } from '../core/SFXController';
import { AudioAdapter } from '../adapters/AudioAdapter';
import { VolumeController } from '../core/VolumeController';

describe('SFXController', () => {
  let controller: SFXController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    mockAdapter = {
      loadSFX: vi.fn().mockResolvedValue(undefined),
      playSFX: vi.fn().mockReturnValue(123),
      stopSFX: vi.fn(),
      stopAllSFX: vi.fn(),
    } as any;

    volumeController = new VolumeController();
    controller = new SFXController(mockAdapter, volumeController);
  });

  it('should load sound effect', async () => {
    await controller.loadSound('ui-button-tap', '/audio/tap.mp3');

    expect(mockAdapter.loadSFX).toHaveBeenCalledWith('ui-button-tap', '/audio/tap.mp3');
    expect(controller.isLoaded('ui-button-tap')).toBe(true);
  });

  it('should play loaded sound', () => {
    controller.loadSound('ui-button-tap', '/audio/tap.mp3');

    const playbackId = controller.play('ui-button-tap');

    expect(mockAdapter.playSFX).toHaveBeenCalledWith(
      'ui-button-tap',
      expect.objectContaining({ volume: 1.0 }) // Default volumes
    );
    expect(playbackId).toBe(123);
  });

  it('should apply volume controller SFX volume', () => {
    volumeController.setMasterVolume(0.8);
    volumeController.setSFXVolume(0.5);
    controller.loadSound('test', '/test.mp3');

    controller.play('test');

    // Effective volume = 0.8 * 0.5 = 0.4
    expect(mockAdapter.playSFX).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ volume: 0.4 })
    );
  });

  it('should apply custom volume on top of controller volume', () => {
    volumeController.setMasterVolume(0.5);
    volumeController.setSFXVolume(0.8);
    controller.loadSound('test', '/test.mp3');

    controller.play('test', { volume: 0.5 });

    // Effective volume = 0.5 * 0.8 * 0.5 = 0.2
    expect(mockAdapter.playSFX).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({ volume: 0.2 })
    );
  });

  it('should track playing sounds', () => {
    vi.mocked(mockAdapter.playSFX)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);

    controller.loadSound('test', '/test.mp3');

    controller.play('test');
    controller.play('test');
    controller.play('test');

    expect(controller.getActiveCount('test')).toBe(3);
  });

  it('should stop specific playback instance', () => {
    controller.loadSound('test', '/test.mp3');
    const playbackId = controller.play('test');

    controller.stop(playbackId);

    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(123);
    expect(controller.getActiveCount('test')).toBe(0);
  });

  it('should stop all instances of a sound', () => {
    controller.loadSound('test', '/test.mp3');
    controller.play('test');
    controller.play('test');

    controller.stopAll('test');

    expect(mockAdapter.stopAllSFX).toHaveBeenCalledWith('test');
    expect(controller.getActiveCount('test')).toBe(0);
  });

  it('should stop all sounds when no ID provided', () => {
    controller.loadSound('test1', '/test1.mp3');
    controller.loadSound('test2', '/test2.mp3');
    controller.play('test1');
    controller.play('test2');

    controller.stopAll();

    expect(mockAdapter.stopAllSFX).toHaveBeenCalledTimes(2);
  });

  it('should handle playing unloaded sound', () => {
    const playbackId = controller.play('not-loaded' as any);

    expect(playbackId).toBe(-1);
    expect(mockAdapter.playSFX).not.toHaveBeenCalled();
  });

  it('should handle load failure', async () => {
    vi.mocked(mockAdapter.loadSFX).mockRejectedValue(new Error('Load failed'));

    await expect(
      controller.loadSound('test', '/test.mp3')
    ).rejects.toThrow('Load failed');

    expect(controller.isLoaded('test')).toBe(false);
  });
});
```

Run test:
```bash
npm test -- SFXController.test.ts
```

---

### Task 3.3: Implement SFXController - Part 2: Sound Pooling
**Status:** ⏳ Pending
**Estimated Time:** 60 minutes
**Dependencies:** Task 3.2

**Description:**
Add sound pooling for frequently repeated sounds (e.g., peg hits) with simultaneous sound limiting.

**Implementation:**

Add to `src/audio/core/SFXController.ts`:

```typescript
interface PoolConfig {
  strategy?: 'random' | 'round-robin';
  maxSimultaneous?: number;
}

interface SoundPool {
  sounds: SoundEffectId[];
  config: PoolConfig;
  currentIndex: number;
}

export class SFXController {
  // ... existing properties ...
  private pools = new Map<string, SoundPool>();
  private simultaneousLimits = new Map<string, number>();

  // ... existing constructor and methods ...

  /**
   * Create a sound pool for repeated sounds with variations.
   */
  createPool(
    poolId: string,
    soundIds: SoundEffectId[],
    config: PoolConfig = {}
  ): void {
    const poolConfig: PoolConfig = {
      strategy: config.strategy || 'random',
      maxSimultaneous: config.maxSimultaneous || 8,
    };

    this.pools.set(poolId, {
      sounds: soundIds,
      config: poolConfig,
      currentIndex: 0,
    });

    // Set simultaneous limit for each sound in pool
    soundIds.forEach(id => {
      this.simultaneousLimits.set(id, poolConfig.maxSimultaneous!);
    });
  }

  /**
   * Play a sound from a pool.
   */
  playFromPool(poolId: string, options?: PlayOptions): PlaybackId {
    const pool = this.pools.get(poolId);
    if (!pool) {
      console.warn(`Sound pool "${poolId}" not found`);
      return -1;
    }

    // Select sound based on strategy
    let soundId: SoundEffectId;
    if (pool.config.strategy === 'round-robin') {
      soundId = pool.sounds[pool.currentIndex];
      pool.currentIndex = (pool.currentIndex + 1) % pool.sounds.length;
    } else {
      // Random selection
      const randomIndex = Math.floor(Math.random() * pool.sounds.length);
      soundId = pool.sounds[randomIndex];
    }

    // Check simultaneous limit
    const limit = this.simultaneousLimits.get(soundId);
    if (limit !== undefined) {
      const activeCount = this.getActiveCount(soundId);
      if (activeCount >= limit) {
        // Stop oldest sound to make room
        const playing = this.playingSounds.get(soundId);
        if (playing && playing.length > 0) {
          const oldest = playing.shift()!;
          this.adapter.stopSFX(oldest);
        }
      }
    }

    // Apply pitch variation if requested
    const playOptions: PlayOptions = { ...options };
    if (options?.pitch === undefined && pool.config.strategy === 'random') {
      // Apply random pitch variation ±15%
      playOptions.pitch = (Math.random() - 0.5) * 0.3; // Range: -0.15 to +0.15
    }

    return this.play(soundId, playOptions);
  }

  /**
   * Set simultaneous sound limit for a specific sound.
   */
  setSimultaneousLimit(id: SoundEffectId, limit: number): void {
    this.simultaneousLimits.set(id, Math.max(1, limit));
  }

  /**
   * Get simultaneous limit for a sound.
   */
  getSimultaneousLimit(id: SoundEffectId): number {
    return this.simultaneousLimits.get(id) || Infinity;
  }
}
```

**Acceptance Criteria:**
- [ ] Pools support multiple sound variations
- [ ] Random and round-robin selection strategies work
- [ ] Simultaneous sound limiting enforced
- [ ] Oldest sounds stopped when limit reached
- [ ] Automatic pitch variation applied in random mode
- [ ] Pool playback uses standard play method (applies volume)

**Test Verification:**

Add to `src/audio/__tests__/SFXController.test.ts`:

```typescript
describe('SFXController - Pooling', () => {
  let controller: SFXController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    let playbackIdCounter = 1;
    mockAdapter = {
      loadSFX: vi.fn().mockResolvedValue(undefined),
      playSFX: vi.fn(() => playbackIdCounter++),
      stopSFX: vi.fn(),
      stopAllSFX: vi.fn(),
    } as any;

    volumeController = new VolumeController();
    controller = new SFXController(mockAdapter, volumeController);
  });

  it('should create sound pool', () => {
    controller.createPool('test-pool', [
      'ball-peg-hit' as any,
      'ball-peg-hit-low' as any,
      'ball-peg-hit-high' as any,
    ]);

    // Pool created (no error)
    expect(() => controller.playFromPool('test-pool')).not.toThrow();
  });

  it('should play from pool with random strategy', async () => {
    await controller.loadSound('sound1' as any, '/sound1.mp3');
    await controller.loadSound('sound2' as any, '/sound2.mp3');
    await controller.loadSound('sound3' as any, '/sound3.mp3');

    controller.createPool('test-pool', [
      'sound1' as any,
      'sound2' as any,
      'sound3' as any,
    ], { strategy: 'random' });

    // Play multiple times and collect which sounds were played
    const played = new Set<string>();
    for (let i = 0; i < 20; i++) {
      controller.playFromPool('test-pool');
    }

    // Should have played from adapter (not checking specific sounds due to randomness)
    expect(mockAdapter.playSFX).toHaveBeenCalled();
  });

  it('should play from pool with round-robin strategy', async () => {
    await controller.loadSound('sound1' as any, '/sound1.mp3');
    await controller.loadSound('sound2' as any, '/sound2.mp3');
    await controller.loadSound('sound3' as any, '/sound3.mp3');

    controller.createPool('test-pool', [
      'sound1' as any,
      'sound2' as any,
      'sound3' as any,
    ], { strategy: 'round-robin' });

    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool'); // Should wrap to first

    // Check that sounds were played in order
    const calls = vi.mocked(mockAdapter.playSFX).mock.calls;
    expect(calls[0][0]).toBe('sound1');
    expect(calls[1][0]).toBe('sound2');
    expect(calls[2][0]).toBe('sound3');
    expect(calls[3][0]).toBe('sound1'); // Wrapped
  });

  it('should enforce simultaneous sound limit', async () => {
    await controller.loadSound('test' as any, '/test.mp3');

    controller.createPool('test-pool', ['test' as any], {
      maxSimultaneous: 3,
    });

    // Play 5 times (exceeds limit of 3)
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool'); // Should stop oldest
    controller.playFromPool('test-pool'); // Should stop oldest

    // Should have stopped 2 sounds to maintain limit of 3
    expect(mockAdapter.stopSFX).toHaveBeenCalledTimes(2);
    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(1); // First playback ID
    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(2); // Second playback ID
  });

  it('should apply random pitch variation in random mode', async () => {
    await controller.loadSound('test' as any, '/test.mp3');

    controller.createPool('test-pool', ['test' as any], {
      strategy: 'random',
    });

    controller.playFromPool('test-pool');

    // Should have applied pitch (random value between -0.15 and +0.15)
    const call = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(call[1]?.pitch).toBeDefined();
    expect(Math.abs(call[1]!.pitch!)).toBeLessThanOrEqual(0.15);
  });

  it('should not override explicit pitch option', async () => {
    await controller.loadSound('test' as any, '/test.mp3');

    controller.createPool('test-pool', ['test' as any]);

    controller.playFromPool('test-pool', { pitch: 0.5 });

    // Should use explicit pitch, not random
    const call = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(call[1]?.pitch).toBe(0.5);
  });

  it('should set and get simultaneous limits', () => {
    controller.setSimultaneousLimit('test' as any, 5);
    expect(controller.getSimultaneousLimit('test' as any)).toBe(5);
  });

  it('should return Infinity for sounds without limit', () => {
    expect(controller.getSimultaneousLimit('no-limit' as any)).toBe(Infinity);
  });

  it('should handle playing from non-existent pool', () => {
    const playbackId = controller.playFromPool('non-existent');
    expect(playbackId).toBe(-1);
  });
});
```

Run test:
```bash
npm test -- SFXController.test.ts
```

---

### Task 3.4: Implement MusicController - Part 1: Basic Playback
**Status:** ⏳ Pending
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.3, Task 3.1

**Description:**
Implement music controller with track loading, playback, and layer management.

**Files to Create:**
- `src/audio/core/MusicController.ts`

**Implementation (Part 1):**

```typescript
import { AudioAdapter } from '../adapters/AudioAdapter';
import { VolumeController } from './VolumeController';
import { MusicTrackId, MusicOptions } from '../types';

interface MusicLayer {
  id: MusicTrackId;
  isPlaying: boolean;
  volume: number;
}

/**
 * Controls adaptive music system with layering and ducking.
 */
export class MusicController {
  private adapter: AudioAdapter;
  private volumeController: VolumeController;
  private layers = new Map<MusicTrackId, MusicLayer>();
  private currentDuckLevel = 1.0;
  private baseMusicVolume = 1.0;

  constructor(adapter: AudioAdapter, volumeController: VolumeController) {
    this.adapter = adapter;
    this.volumeController = volumeController;
  }

  /**
   * Load a music track.
   */
  async loadTrack(
    id: MusicTrackId,
    url: string,
    options: MusicOptions = { loop: true }
  ): Promise<void> {
    try {
      await this.adapter.loadMusic(id, url, options.loop);

      this.layers.set(id, {
        id,
        isPlaying: false,
        volume: options.volume ?? 1.0,
      });
    } catch (error) {
      console.error(`Failed to load music track "${id}":`, error);
      throw error;
    }
  }

  /**
   * Check if a track is loaded.
   */
  isLoaded(id: MusicTrackId): boolean {
    return this.layers.has(id);
  }

  /**
   * Play a music layer with optional fade-in.
   */
  playLayer(id: MusicTrackId, fadeInMs?: number): void {
    const layer = this.layers.get(id);
    if (!layer) {
      console.warn(`Music layer "${id}" not loaded`);
      return;
    }

    // Calculate effective volume
    const effectiveVolume = this.calculateEffectiveVolume(layer.volume);
    this.adapter.setMusicVolume(id, effectiveVolume);

    // Play with fade
    this.adapter.playMusic(id, fadeInMs);
    layer.isPlaying = true;
  }

  /**
   * Stop a music layer with optional fade-out.
   */
  stopLayer(id: MusicTrackId, fadeOutMs?: number): void {
    const layer = this.layers.get(id);
    if (!layer) {
      return;
    }

    this.adapter.stopMusic(id, fadeOutMs);
    layer.isPlaying = false;
  }

  /**
   * Set volume for a specific layer (0-1).
   */
  setLayerVolume(id: MusicTrackId, volume: number): void {
    const layer = this.layers.get(id);
    if (!layer) {
      return;
    }

    layer.volume = Math.max(0, Math.min(1, volume));

    if (layer.isPlaying) {
      const effectiveVolume = this.calculateEffectiveVolume(layer.volume);
      this.adapter.setMusicVolume(id, effectiveVolume);
    }
  }

  /**
   * Check if a layer is currently playing.
   */
  isLayerPlaying(id: MusicTrackId): boolean {
    return this.layers.get(id)?.isPlaying ?? false;
  }

  /**
   * Set base music volume (affects all layers).
   */
  setMusicVolume(volume: number): void {
    this.baseMusicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllLayerVolumes();
  }

  /**
   * Stop all music layers.
   */
  stopAllLayers(fadeOutMs?: number): void {
    for (const [id, layer] of this.layers.entries()) {
      if (layer.isPlaying) {
        this.stopLayer(id, fadeOutMs);
      }
    }
  }

  /**
   * Calculate effective volume for a layer.
   * Formula: layerVolume * baseMusicVolume * duckLevel * volumeController
   */
  private calculateEffectiveVolume(layerVolume: number): number {
    return (
      layerVolume *
      this.baseMusicVolume *
      this.currentDuckLevel *
      this.volumeController.getEffectiveMusicVolume()
    );
  }

  /**
   * Update volume for all currently playing layers.
   */
  private updateAllLayerVolumes(): void {
    for (const [id, layer] of this.layers.entries()) {
      if (layer.isPlaying) {
        const effectiveVolume = this.calculateEffectiveVolume(layer.volume);
        this.adapter.setMusicVolume(id, effectiveVolume);
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Tracks load asynchronously
- [ ] Layers can be played/stopped independently
- [ ] Fade-in/out durations work
- [ ] Layer volume is independent
- [ ] Base music volume affects all layers
- [ ] Effective volume calculation includes all multipliers
- [ ] Can stop all layers at once

**Test Verification:**

Create `src/audio/__tests__/MusicController.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MusicController } from '../core/MusicController';
import { AudioAdapter } from '../adapters/AudioAdapter';
import { VolumeController } from '../core/VolumeController';

describe('MusicController', () => {
  let controller: MusicController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    mockAdapter = {
      loadMusic: vi.fn().mockResolvedValue(undefined),
      playMusic: vi.fn(),
      stopMusic: vi.fn(),
      setMusicVolume: vi.fn(),
      isMusicPlaying: vi.fn(() => false),
    } as any;

    volumeController = new VolumeController();
    controller = new MusicController(mockAdapter, volumeController);
  });

  it('should load music track', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    expect(mockAdapter.loadMusic).toHaveBeenCalledWith(
      'music-base',
      '/music/base.mp3',
      true // loop
    );
    expect(controller.isLoaded('music-base')).toBe(true);
  });

  it('should load music with custom options', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3', {
      loop: false,
      volume: 0.5,
    });

    expect(mockAdapter.loadMusic).toHaveBeenCalledWith(
      'music-base',
      '/music/base.mp3',
      false
    );
  });

  it('should play music layer', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    controller.playLayer('music-base');

    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(controller.isLayerPlaying('music-base')).toBe(true);
  });

  it('should play music layer with fade-in', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    controller.playLayer('music-base', 1000);

    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-base', 1000);
  });

  it('should stop music layer', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.stopLayer('music-base');

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(controller.isLayerPlaying('music-base')).toBe(false);
  });

  it('should stop music layer with fade-out', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.stopLayer('music-base', 500);

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 500);
  });

  it('should set layer volume', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.setLayerVolume('music-base', 0.5);

    // Volume should be updated for playing layer
    expect(mockAdapter.setMusicVolume).toHaveBeenCalled();
  });

  it('should calculate effective volume correctly', async () => {
    volumeController.setMasterVolume(0.8);
    volumeController.setMusicVolume(0.5);

    await controller.loadTrack('music-base', '/music/base.mp3', {
      loop: true,
      volume: 0.6,
    });

    controller.setMusicVolume(0.7); // base music volume
    controller.playLayer('music-base');

    // Effective = layerVolume(0.6) * baseMusicVolume(0.7) * duckLevel(1.0) * controller(0.8*0.5)
    // = 0.6 * 0.7 * 1.0 * 0.4 = 0.168
    const call = vi.mocked(mockAdapter.setMusicVolume).mock.calls[0];
    expect(call[1]).toBeCloseTo(0.168, 3);
  });

  it('should stop all layers', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');
    controller.playLayer('music-tension');

    controller.stopAllLayers();

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-tension', undefined);
  });

  it('should stop all layers with fade-out', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');
    controller.playLayer('music-tension');

    controller.stopAllLayers(800);

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 800);
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-tension', 800);
  });

  it('should handle playing unloaded track', () => {
    controller.playLayer('not-loaded' as any);

    expect(mockAdapter.playMusic).not.toHaveBeenCalled();
  });
});
```

Run test:
```bash
npm test -- MusicController.test.ts
```

---

