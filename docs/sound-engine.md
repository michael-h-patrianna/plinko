# Plinko Sound Engine: Technical Architecture & Implementation Guide

**Document Version:** 1.0
**Date:** October 11, 2025
**Target Platform:** Web (React) & iOS (React Native)
**Related Documents:** [sound-design-concept.md](./sound-design-concept.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Audio Library Evaluation](#2-audio-library-evaluation)
3. [Architecture Design](#3-architecture-design)
4. [API Reference](#4-api-reference)
5. [Implementation Requirements](#5-implementation-requirements)
6. [Platform-Specific Considerations](#6-platform-specific-considerations)
7. [Performance & Optimization](#7-performance--optimization)
8. [Testing Strategy](#8-testing-strategy)

---

## 1. Overview

### 1.1 Purpose

This document defines the technical architecture for a cross-platform audio engine that implements all sound design requirements specified in [sound-design-concept.md](./sound-design-concept.md). The engine must be lightweight, performant, and provide a unified API that works seamlessly across web (React) and iOS (React Native) platforms.

### 1.2 Core Requirements

Based on the sound design concept, the audio engine must support:

**Music Management:**
- ✅ Adaptive layered music system (base, tension, celebration layers)
- ✅ State-based music transitions with crossfading
- ✅ Dynamic volume ducking triggered by SFX
- ✅ Seamless looping with sample-accurate loop points
- ✅ Independent music volume control

**Sound Effects:**
- ✅ One-shot SFX playback with precise timing
- ✅ Sound pooling for frequently repeated sounds (peg collisions)
- ✅ Pitch variation (±20% randomization)
- ✅ Velocity-based sound selection (low/medium/high impact)
- ✅ Simultaneous multi-sound playback (overlapping peg hits)
- ✅ Independent SFX volume control

**Performance:**
- ✅ Preloading and caching of critical assets
- ✅ Low latency (<50ms for critical sounds)
- ✅ Minimal CPU usage during peak activity
- ✅ Small bundle size impact (<100KB for library)
- ✅ Efficient memory management

**User Controls:**
- ✅ Master volume (0-100%)
- ✅ Music volume (0-100%, independent)
- ✅ SFX volume (0-100%, independent)
- ✅ Mute/unmute functionality
- ✅ Persistent volume settings across sessions

**Accessibility:**
- ✅ Complete audio disable without breaking game
- ✅ Reduced motion audio adjustments
- ✅ No audio-only critical information

### 1.3 Non-Requirements

To keep the engine lightweight, we explicitly **do not need**:
- ❌ 3D spatial audio / HRTF
- ❌ Complex audio effects (reverb, delay, EQ) - handled in audio production
- ❌ Real-time audio synthesis / oscillators
- ❌ Audio recording or input
- ❌ MIDI support
- ❌ Audio visualization / spectrum analysis
- ❌ Audio streaming from remote sources (all assets local)

---

## 2. Audio Library Evaluation

### 2.1 Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Cross-Platform** | Critical | Must work on web React + React Native iOS without separate implementations |
| **Bundle Size** | High | Prefer <50KB minified+gzipped |
| **Performance** | High | Low latency, efficient CPU/memory usage |
| **API Simplicity** | High | Clean, minimal API surface |
| **Maintenance** | Medium | Active development, good documentation |
| **Features** | Medium | Provides exactly what we need, nothing more |

### 2.2 Library Comparison

#### Option 1: Howler.js (Web) + React Native Sound (Native)

**Howler.js (Web):**
```
Bundle Size: ~25KB minified+gzipped
GitHub Stars: 23k+
Last Updated: Active
License: MIT
```

**Strengths:**
- ✅ Industry standard for web game audio
- ✅ Excellent sprite support (useful for SFX pooling)
- ✅ Built-in volume/fade/loop controls
- ✅ Automatic codec fallback (MP3/AAC/WebM)
- ✅ Web Audio API + HTML5 Audio fallback
- ✅ Very small bundle size
- ✅ Battle-tested in production games

**Weaknesses:**
- ⚠️ Web-only (requires separate React Native solution)
- ⚠️ No official React Native version
- ⚠️ Limited sprite-based pitch variation

**React Native Sound:**
```
Bundle Size: ~50KB
GitHub Stars: 3k+
Last Updated: Active
License: MIT
```

**Strengths:**
- ✅ Native audio performance on iOS
- ✅ Low latency
- ✅ Good volume control

**Weaknesses:**
- ⚠️ Separate API from Howler.js (requires wrapper abstraction)
- ⚠️ Less sophisticated features than Howler
- ⚠️ Requires manual coordination for music layers

**Combined Assessment:**
- **Bundle Impact**: ~25KB web, ~50KB native
- **Maintenance**: Two separate libraries to maintain
- **Wrapper Complexity**: Medium - requires abstraction layer to unify APIs
- **Performance**: Excellent on both platforms

---

#### Option 2: Expo Audio (Unified)

**Expo Audio:**
```
Bundle Size: Included with Expo SDK (~0KB if already using Expo)
GitHub Stars: 28k+ (Expo ecosystem)
Last Updated: Active (Expo SDK releases)
License: MIT
```

**Strengths:**
- ✅ Single API for web + React Native
- ✅ Part of Expo ecosystem (if already using Expo)
- ✅ Good documentation
- ✅ Built-in playback status callbacks
- ✅ Automatic platform handling

**Weaknesses:**
- ⚠️ Requires Expo in project (large dependency if not already using)
- ⚠️ Less game-focused features than Howler.js
- ⚠️ No audio sprite support
- ⚠️ Limited pitch variation capabilities
- ⚠️ Heavier API (more generic, less game-optimized)

**Assessment:**
- **Bundle Impact**: Large if not already using Expo; 0KB if already in stack
- **Maintenance**: Single library, active development
- **Wrapper Complexity**: Low - mostly pass-through to Expo API
- **Performance**: Good, but not optimized for game audio

---

#### Option 3: Tone.js (Web) + Custom Native Solution

**Tone.js:**
```
Bundle Size: ~400KB minified+gzipped (HEAVY)
GitHub Stars: 13k+
Last Updated: Active
License: MIT
```

**Strengths:**
- ✅ Powerful Web Audio API wrapper
- ✅ Excellent timing precision
- ✅ Built-in effects and synthesis

**Weaknesses:**
- ❌ Way too heavy for our needs (400KB!)
- ❌ Overkill features (synthesis, effects) we don't need
- ❌ Web-only
- ❌ Steeper learning curve

**Assessment:**
- **Not Recommended**: Bundle size is 10x larger than needed for our use case

---

#### Option 4: Native Web Audio API + React Native Sound

**Web Audio API (Native Browser):**
```
Bundle Size: 0KB (browser native)
Support: All modern browsers
```

**Strengths:**
- ✅ Zero bundle size
- ✅ Full control over audio graph
- ✅ Maximum performance
- ✅ Precise timing with AudioContext

**Weaknesses:**
- ⚠️ Verbose API (requires significant wrapper code)
- ⚠️ Manual handling of edge cases
- ⚠️ Browser compatibility quirks
- ⚠️ No built-in sprite support

**React Native Sound:**
- (Same as Option 1)

**Assessment:**
- **Bundle Impact**: 0KB web (native API), ~50KB native
- **Maintenance**: More code to write and maintain
- **Wrapper Complexity**: High - must build abstractions from scratch
- **Performance**: Best possible (native APIs)

---

#### Option 5: SoundJS (Web) + React Native Sound

**SoundJS (CreateJS):**
```
Bundle Size: ~50KB minified+gzipped
GitHub Stars: 4k+
Last Updated: Less active (legacy library)
License: MIT
```

**Strengths:**
- ✅ Game-focused audio library
- ✅ Sprite support
- ✅ Good fallback system

**Weaknesses:**
- ⚠️ Less actively maintained (legacy status)
- ⚠️ Larger than Howler.js
- ⚠️ Web-only

**Assessment:**
- **Not Recommended**: Howler.js is superior in every way (smaller, more active)

---

### 2.3 Recommendation

**Recommended Approach: Howler.js (Web) + React Native Sound (iOS) with Unified Wrapper**

**Rationale:**

1. **Lightest Bundle Size**: Howler.js is only ~25KB, React Native Sound ~50KB - both are minimal
2. **Best Performance**: Both libraries are optimized for their respective platforms
3. **Battle-Tested**: Howler.js powers thousands of web games; React Native Sound is proven on mobile
4. **Feature Match**: Both provide exactly what we need (playback, volume, sprites) without bloat
5. **Active Maintenance**: Both libraries actively maintained with large communities
6. **Wrapper Feasible**: Creating a unified wrapper is straightforward given similar feature sets

**Alternative if Already Using Expo:**
If the project already uses Expo, consider Expo Audio to avoid dual dependencies, but accept some feature limitations (no sprite support, less game-optimized).

**Rejected Alternatives:**
- Tone.js: Too heavy (400KB) with features we don't need
- Native APIs only: Too much implementation complexity
- SoundJS: Legacy status, Howler.js is better

---

## 3. Architecture Design

### 3.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Components                          │
│   (Countdown, Ball, PlinkoBoard, CelebrationOverlay, etc.)  │
└────────────────────┬────────────────────────────────────────┘
                     │ useSoundEngine() hook
┌────────────────────▼────────────────────────────────────────┐
│                  React Sound Hook Layer                     │
│              (useSoundEngine, SoundProvider)                │
└────────────────────┬────────────────────────────────────────┘
                     │ Platform-agnostic API
┌────────────────────▼────────────────────────────────────────┐
│                 Sound Engine Core (TypeScript)              │
│   • SoundManager (main orchestrator)                        │
│   • MusicController (adaptive music system)                 │
│   • SFXController (one-shot sounds + pooling)               │
│   • VolumeController (master/music/sfx volume)              │
│   • StateAdapter (hooks into game state machine)            │
└────────────────────┬────────────────────────────────────────┘
                     │ Adapter interface
┌────────────────────▼────────────────────────────────────────┐
│              Platform Audio Adapters                        │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  WebAudioAdapter    │  │  NativeAudioAdapter          │ │
│  │  (Howler.js)        │  │  (React Native Sound)        │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Module Responsibilities

#### SoundManager
**Responsibility**: Main orchestrator, initialization, asset loading
```typescript
class SoundManager {
  - initialize(config: SoundConfig): Promise<void>
  - preloadAssets(): Promise<void>
  - setMasterVolume(volume: number): void
  - mute(): void
  - unmute(): void
  - destroy(): void
  - getMusicController(): MusicController
  - getSFXController(): SFXController
}
```

#### MusicController
**Responsibility**: Adaptive music system, layering, ducking, crossfades
```typescript
class MusicController {
  - loadTrack(id: string, url: string, options: MusicOptions): void
  - playLayer(layerId: string, fadeInMs?: number): void
  - stopLayer(layerId: string, fadeOutMs?: number): void
  - setLayerVolume(layerId: string, volume: number): void
  - crossfade(fromId: string, toId: string, durationMs: number): void
  - duck(amount: number, durationMs: number): void
  - unduck(durationMs: number): void
  - setMusicVolume(volume: number): void
}
```

#### SFXController
**Responsibility**: One-shot SFX, pooling, pitch variation, velocity-based selection
```typescript
class SFXController {
  - loadSound(id: string, url: string, options: SFXOptions): void
  - play(id: string, options?: PlayOptions): PlayInstance
  - createPool(id: string, urls: string[], size: number): void
  - playFromPool(poolId: string, options?: PlayOptions): void
  - stop(id: string): void
  - stopAll(): void
  - setSFXVolume(volume: number): void
}
```

#### VolumeController
**Responsibility**: Volume management, persistence
```typescript
class VolumeController {
  - setMasterVolume(volume: number): void
  - setMusicVolume(volume: number): void
  - setSFXVolume(volume: number): void
  - getMasterVolume(): number
  - getMusicVolume(): number
  - getSFXVolume(): number
  - saveToStorage(): void
  - loadFromStorage(): void
}
```

#### StateAdapter
**Responsibility**: Integration with game state machine
```typescript
class StateAdapter {
  - onStateChange(state: GameState, context: GameContext): void
  - bindStateTransitions(stateMachine): void
  - unbindStateTransitions(): void
}
```

### 3.3 Platform Adapter Interface

All platform-specific implementations must conform to this interface:

```typescript
interface AudioAdapter {
  // Initialization
  initialize(): Promise<void>;

  // Music
  loadMusic(id: string, url: string, loop: boolean): Promise<void>;
  playMusic(id: string, fadeInMs?: number): void;
  stopMusic(id: string, fadeOutMs?: number): void;
  setMusicVolume(id: string, volume: number): void;

  // SFX
  loadSFX(id: string, url: string): Promise<void>;
  playSFX(id: string, options?: {
    volume?: number;
    pitch?: number;
    delay?: number;
  }): PlaybackId;
  stopSFX(playbackId: PlaybackId): void;

  // Volume
  setGlobalVolume(volume: number): void;

  // Cleanup
  destroy(): void;
}
```

---

## 4. API Reference

### 4.1 React Hook API

```typescript
/**
 * Main hook for accessing sound engine from components
 */
function useSoundEngine(): SoundEngineAPI;

interface SoundEngineAPI {
  // SFX
  playSFX: (id: SoundEffectId, options?: PlayOptions) => void;
  playPegHit: (velocity?: 'low' | 'medium' | 'high') => void;

  // Music
  transitionMusic: (toState: GameState) => void;

  // Volume
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  getMasterVolume: () => number;
  getMusicVolume: () => number;
  getSFXVolume: () => number;

  // State
  mute: () => void;
  unmute: () => void;
  isMuted: boolean;

  // Status
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}
```

### 4.2 Provider Setup

```typescript
/**
 * Provider that initializes sound engine and makes it available
 * to all child components
 */
function SoundProvider({ children }: { children: ReactNode }): JSX.Element;

// Usage in app root:
<AppConfigProvider>
  <ThemeProvider>
    <SoundProvider>
      <App />
    </SoundProvider>
  </ThemeProvider>
</AppConfigProvider>
```

### 4.3 Sound Effect IDs

```typescript
// Complete enumeration of all sound effects from sound-design-concept.md
type SoundEffectId =
  // UI Sounds
  | 'ui-launch'
  | 'ui-button-tap'
  | 'ui-button-primary'
  | 'ui-drop-position'
  | 'ui-settings-open'
  | 'ui-settings-close'
  | 'ui-slider-drag'
  | 'ui-toast'

  // Countdown
  | 'countdown-3'
  | 'countdown-2'
  | 'countdown-1'
  | 'countdown-go'
  | 'countdown-ring'
  | 'countdown-particles'

  // Ball Physics
  | 'ball-drop'
  | 'ball-trail'
  | 'ball-peg-hit'           // Primary peg collision
  | 'ball-peg-hit-low'       // Low velocity
  | 'ball-peg-hit-high'      // High velocity
  | 'ball-peg-flash'
  | 'ball-peg-ripple'
  | 'ball-wall-hit'

  // Landing
  | 'land-impact-win'
  | 'land-impact-nowin'
  | 'land-shockwave'
  | 'land-glow'

  // Anticipation
  | 'antic-heartbeat'
  | 'antic-scale-up'
  | 'antic-focus'
  | 'antic-dim'
  | 'antic-build'

  // Win Celebration
  | 'win-confetti-burst'
  | 'win-confetti-trail'
  | 'win-star-burst'
  | 'win-flash'
  | 'win-stinger'
  | 'win-tada'
  | 'win-reveal'

  // No Win
  | 'nowin-landing'
  | 'nowin-acknowledge'
  | 'nowin-dim'
  | 'nowin-affirmation'

  // Prize Reveal
  | 'prize-you-won'
  | 'prize-counter'
  | 'prize-icon-pop'
  | 'prize-badge'
  | 'prize-claim-appear'
  | 'prize-claim-press'
  | 'prize-claimed'

  // Screen Effects
  | 'fx-screen-shake'
  | 'fx-screen-shake-subtle'
  | 'fx-haptic'

  // Ambient
  | 'amb-idle'
  | 'amb-board-hum'

  // Error
  | 'err-notification'
  | 'err-loading';

// Music track IDs
type MusicTrackId =
  | 'music-base'           // Base layer loop
  | 'music-tension'        // Tension layer
  | 'music-win-stinger'    // Win celebration stinger
  | 'music-nowin-stinger'; // No-win acknowledgment stinger
```

### 4.4 Configuration

```typescript
interface SoundEngineConfig {
  // Asset paths
  assetBasePath: string;
  musicPath?: string;
  sfxPath?: string;

  // Preloading
  preloadAssets: boolean;
  preloadCriticalOnly: boolean;
  criticalSounds: SoundEffectId[];

  // Volume defaults
  defaultMasterVolume: number;  // 0-1
  defaultMusicVolume: number;   // 0-1
  defaultSFXVolume: number;     // 0-1

  // Performance
  maxSimultaneousSounds: number;  // Default: 32
  pegHitPoolSize: number;         // Default: 10

  // Features
  enableAdaptiveMusic: boolean;
  enableMusicDucking: boolean;
  enableHapticFeedback: boolean;

  // Storage
  persistVolumeSettings: boolean;
  storageKey: string;
}
```

---

## 5. Implementation Requirements

### 5.1 Adaptive Music System

**Requirement**: Music must transition seamlessly based on game state with layering and ducking.

**Implementation:**
```typescript
class MusicController {
  private layers: Map<string, MusicLayer>;
  private currentDuckLevel: number = 1.0;

  async transitionToState(state: GameState) {
    switch (state) {
      case 'idle':
      case 'ready':
        await this.playLayer('music-base', 1000); // 1s fade-in
        break;

      case 'countdown':
        await this.playLayer('music-tension', 200); // 200ms fade-in
        break;

      case 'dropping':
        // Option A: Duck music heavily
        await this.duck(0.35, 100); // Duck to 35% over 100ms
        // Option B: Pause music completely
        // await this.stopAllLayers(100);
        break;

      case 'landed':
        // Brief silence for dramatic effect
        await this.duck(0.0, 200); // 200ms fade to silence
        await this.delay(300);
        break;

      case 'celebrating':
        const prize = getCurrentPrize();
        if (prize.type !== 'no_win') {
          await this.playLayer('music-win-stinger');
        } else {
          await this.playLayer('music-nowin-stinger');
        }
        break;

      case 'revealed':
        await this.unduck(400); // Restore to full volume over 400ms
        await this.playLayer('music-base', 300);
        break;
    }
  }

  async duck(targetLevel: number, durationMs: number) {
    // Fade all active music layers to targetLevel
    this.layers.forEach(layer => {
      if (layer.isPlaying) {
        this.fadeVolume(layer, targetLevel, durationMs);
      }
    });
  }
}
```

### 5.2 Sound Pooling (Peg Collisions)

**Requirement**: Peg collisions happen rapidly (up to 20-30 per second); need pooling to avoid loading overhead.

**Implementation:**
```typescript
class SFXController {
  private pools: Map<string, SoundPool>;

  createPegHitPool() {
    // Create pool with 10 variations, pitch-shifted
    const baseSound = 'ball-peg-hit';
    const pitchVariations = [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.25];

    this.createPool('peg-hits', baseSound, pitchVariations, {
      strategy: 'random',  // Pick random variation each time
      maxSimultaneous: 8,  // Limit overlapping sounds
    });
  }

  playPegHit(velocity: number = 1.0) {
    // Select sound based on velocity
    let soundId: SoundEffectId;
    if (velocity < 0.3) {
      soundId = 'ball-peg-hit-low';
    } else if (velocity > 0.7) {
      soundId = 'ball-peg-hit-high';
    } else {
      soundId = 'ball-peg-hit';
    }

    // Play from pool with volume based on velocity
    this.playFromPool('peg-hits', {
      volume: 0.6 + (velocity * 0.4),  // Scale 0.6-1.0
      pitchVariation: 0.15,             // ±15% random pitch
    });
  }
}
```

### 5.3 Sound Throttling (Rapid-Fire Prevention)

**Requirement**: Prevent the same sound from playing in rapid succession, which creates audio clutter and poor user experience.

**Implementation:**
```typescript
class SFXController {
  private lastPlayTimestamps = new Map<string, number>();
  private throttleDelays = new Map<string, number>();

  /**
   * Set throttle delay for a specific sound
   * @param id - Sound effect ID
   * @param delayMs - Minimum delay in milliseconds between plays
   */
  setThrottleDelay(id: SoundEffectId, delayMs: number): void {
    this.throttleDelays.set(id, Math.max(0, delayMs));
  }

  /**
   * Play a sound effect with optional throttling
   * @param id - Sound effect ID
   * @param options - Playback options
   * @param options.throttle - If true, prevents rapid succession plays
   */
  play(id: SoundEffectId, options?: PlayOptions & { throttle?: boolean }): PlaybackId {
    if (!this.isLoaded(id)) {
      console.warn(`SFX "${id}" not loaded`);
      return -1;
    }

    // Check throttle if enabled
    if (options?.throttle) {
      const throttleDelay = this.throttleDelays.get(id);
      if (throttleDelay !== undefined) {
        const now = performance.now();
        const lastPlay = this.lastPlayTimestamps.get(id);

        if (lastPlay !== undefined && now - lastPlay < throttleDelay) {
          // Throttled - skip playback
          return -1;
        }

        // Update timestamp for successful play
        this.lastPlayTimestamps.set(id, now);
      }
    }

    // Play the sound...
    return this.adapter.playSFX(id, options);
  }

  /**
   * Clear throttle delay and timestamp for a sound
   */
  clearThrottleDelay(id: SoundEffectId): void {
    this.throttleDelays.delete(id);
    this.lastPlayTimestamps.delete(id);
  }
}
```

**Configuration Example:**
```typescript
// In useAudioPreloader or initialization code
sfxController.setThrottleDelay('ball-peg-hit', 50);  // Max once per 50ms
sfxController.setThrottleDelay('ui-button-tap', 100); // Max once per 100ms

// Usage in collision handler
sfxController.play('ball-peg-hit', { throttle: true });
```

**Performance Characteristics:**
- **O(1)** timestamp lookup and storage using Map
- Uses native `performance.now()` for high-precision timing
- Zero memory allocation per play attempt
- Independent throttling per sound ID
- Opt-in per call (doesn't affect non-throttled plays)
- Configurable per-sound delay thresholds
```

### 5.4 Music Ducking on SFX Trigger

**Requirement**: Important SFX should automatically duck music volume temporarily.

**Implementation:**
```typescript
class SoundManager {
  private duckingSFXIds = new Set([
    'countdown-3',
    'countdown-2',
    'countdown-1',
    'countdown-go',
    'land-impact-win',
    'land-impact-nowin',
    'win-stinger',
    'prize-claimed',
  ]);

  playSFX(id: SoundEffectId, options?: PlayOptions) {
    // Check if this SFX should trigger ducking
    if (this.duckingSFXIds.has(id)) {
      // Duck music to 40% for duration of sound + 200ms
      const soundDuration = this.getSoundDuration(id);
      this.musicController.duck(0.4, 50);  // Quick duck

      setTimeout(() => {
        this.musicController.unduck(300);   // Slower restore
      }, soundDuration + 200);
    }

    // Play the sound
    this.sfxController.play(id, options);
  }
}
```

### 5.5 State Machine Integration

**Requirement**: Audio must respond automatically to game state changes.

**Implementation:**
```typescript
class StateAdapter {
  constructor(
    private soundManager: SoundManager,
    private gameStateMachine: GameStateMachine
  ) {}

  bindToStateMachine() {
    // Subscribe to state machine transitions
    this.gameStateMachine.on('transition', (event: StateTransition) => {
      this.handleStateChange(event.toState, event.context);
    });
  }

  private handleStateChange(state: GameState, context: GameContext) {
    // Trigger appropriate music transition
    this.soundManager.getMusicController().transitionToState(state);

    // Trigger state-specific SFX
    switch (state) {
      case 'countdown':
        // Countdown sounds handled by Countdown component
        break;

      case 'dropping':
        // Ball drop sound
        this.soundManager.playSFX('ball-drop');
        break;

      case 'landed':
        // Landing impact
        const isWin = context.prize?.type !== 'no_win';
        this.soundManager.playSFX(
          isWin ? 'land-impact-win' : 'land-impact-nowin'
        );
        break;

      case 'celebrating':
        // Celebration sounds handled by CelebrationOverlay
        break;
    }
  }
}
```

### 5.6 Volume Persistence

**Requirement**: User volume settings must persist across sessions.

**Implementation:**
```typescript
class VolumeController {
  private storageKey = 'plinko-audio-settings';

  async saveToStorage() {
    const settings = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted,
    };

    // Use platform adapter (localStorage on web, AsyncStorage on RN)
    await storageAdapter.setItem(this.storageKey, JSON.stringify(settings));
  }

  async loadFromStorage() {
    const stored = await storageAdapter.getItem(this.storageKey);
    if (stored) {
      const settings = JSON.parse(stored);
      this.setMasterVolume(settings.masterVolume ?? 1.0);
      this.setMusicVolume(settings.musicVolume ?? 0.7);
      this.setSFXVolume(settings.sfxVolume ?? 1.0);
      if (settings.isMuted) {
        this.mute();
      }
    }
  }
}
```

### 5.7 Preloading Strategy

**Requirement**: Critical sounds must load before gameplay starts; non-critical can lazy-load.

**Implementation:**
```typescript
class SoundManager {
  private criticalSounds: SoundEffectId[] = [
    'countdown-3',
    'countdown-2',
    'countdown-1',
    'countdown-go',
    'ball-peg-hit',
    'land-impact-win',
    'land-impact-nowin',
    'ui-button-tap',
    'ui-button-primary',
  ];

  private criticalMusic: MusicTrackId[] = [
    'music-base',
  ];

  async preloadCritical(): Promise<void> {
    // Load critical SFX in parallel
    const sfxPromises = this.criticalSounds.map(id =>
      this.sfxController.loadSound(id, this.getAssetPath(id))
    );

    // Load critical music
    const musicPromises = this.criticalMusic.map(id =>
      this.musicController.loadTrack(id, this.getAssetPath(id), { loop: true })
    );

    await Promise.all([...sfxPromises, ...musicPromises]);
  }

  async preloadNonCritical(): Promise<void> {
    // Load remaining assets in background
    // Use requestIdleCallback on web for better performance
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.loadRemainingAssets());
    } else {
      setTimeout(() => this.loadRemainingAssets(), 1000);
    }
  }
}
```

---

## 6. Platform-Specific Considerations

### 6.1 Web (React) Implementation

**Library**: Howler.js

**Key Considerations:**

```typescript
class WebAudioAdapter implements AudioAdapter {
  private howls: Map<string, Howl> = new Map();

  async initialize() {
    // Enable Web Audio API (requires user interaction on some browsers)
    Howler.autoUnlock = true;

    // Set global volume
    Howler.volume(1.0);

    // Handle visibility change (pause audio when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Howler.mute(true);
      } else {
        Howler.mute(false);
      }
    });
  }

  async loadMusic(id: string, url: string, loop: boolean) {
    const howl = new Howl({
      src: [url],
      loop,
      preload: true,
      html5: false,  // Use Web Audio API for better performance
      format: ['mp3', 'aac'],
    });

    return new Promise((resolve, reject) => {
      howl.once('load', resolve);
      howl.once('loaderror', reject);
    });
  }

  playSFX(id: string, options?: PlayOptions) {
    const howl = this.howls.get(id);
    if (!howl) return;

    const playId = howl.play();

    if (options?.volume !== undefined) {
      howl.volume(options.volume, playId);
    }

    if (options?.pitch !== undefined) {
      // Pitch shifting in Howler uses rate
      howl.rate(1.0 + options.pitch, playId);
    }

    return playId;
  }
}
```

**Web-Specific Optimizations:**
- Use sprite sheets for SFX to reduce HTTP requests
- Leverage browser caching with proper cache headers
- Use Web Audio API (not HTML5 Audio) for game sounds
- Handle autoplay policies with user interaction requirement

### 6.2 iOS (React Native) Implementation

**Library**: React Native Sound

**Key Considerations:**

```typescript
import Sound from 'react-native-sound';

class NativeAudioAdapter implements AudioAdapter {
  private sounds: Map<string, Sound> = new Map();

  async initialize() {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Set up session
    Sound.setMode('Default');
  }

  async loadMusic(id: string, url: string, loop: boolean) {
    return new Promise((resolve, reject) => {
      const sound = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          reject(error);
          return;
        }

        sound.setNumberOfLoops(loop ? -1 : 0);
        this.sounds.set(id, sound);
        resolve();
      });
    });
  }

  playSFX(id: string, options?: PlayOptions) {
    const sound = this.sounds.get(id);
    if (!sound) return;

    if (options?.volume !== undefined) {
      sound.setVolume(options.volume);
    }

    // React Native Sound doesn't support pitch shifting natively
    // Would need to prepare multiple versions of the sound

    sound.play((success) => {
      if (!success) {
        console.warn(`Failed to play sound: ${id}`);
      }
    });
  }

  destroy() {
    // Release all sounds
    this.sounds.forEach(sound => sound.release());
    this.sounds.clear();
  }
}
```

**iOS-Specific Optimizations:**
- Bundle sounds in app (don't load from network)
- Use CAF format for optimal iOS performance
- Prepare multiple pitch-shifted versions ahead of time
- Handle audio session interruptions (phone calls, alarms)
- Test with device speaker and headphones

### 6.3 Platform Selection Logic

```typescript
// src/utils/audio/createAdapter.ts
export function createAudioAdapter(): AudioAdapter {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return new NativeAudioAdapter();
  } else {
    return new WebAudioAdapter();
  }
}
```

---

## 7. Performance & Optimization

### 7.1 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| **Initial Load Time** | <500ms for critical assets | Yes |
| **Audio Latency** | <50ms for critical SFX | Yes |
| **CPU Usage** | <5% during peak activity | High |
| **Memory Usage** | <10MB for all audio assets | Medium |
| **Bundle Size Impact** | <100KB library code | High |

### 7.2 Optimization Strategies

#### Asset Optimization
```typescript
// Asset size targets
const ASSET_SIZE_TARGETS = {
  music: {
    format: 'AAC',
    bitrate: '128kbps',
    maxSize: '500KB per track',
  },
  sfx: {
    format: 'MP3 (web) / CAF (iOS)',
    bitrate: '96kbps',
    maxSize: '50KB per sound',
  },
};
```

#### Memory Management
```typescript
class SoundManager {
  // Unload non-critical sounds when not needed
  private unloadNonCritical() {
    const nonCriticalIds = this.getAllSoundIds()
      .filter(id => !this.criticalSounds.includes(id));

    nonCriticalIds.forEach(id => {
      this.sfxController.unload(id);
    });
  }

  // Lazy load sounds on first use
  private async ensureLoaded(id: SoundEffectId) {
    if (!this.sfxController.isLoaded(id)) {
      await this.sfxController.loadSound(id, this.getAssetPath(id));
    }
  }
}
```

#### Pooling Strategy
```typescript
// Limit simultaneous sounds to prevent audio clutter and performance issues
const SIMULTANEOUS_SOUND_LIMITS = {
  'ball-peg-hit': 8,    // Max 8 overlapping peg hits
  'countdown-*': 1,      // Only one countdown sound at a time
  'ui-*': 3,             // Max 3 UI sounds simultaneously
};

class SFXController {
  private playingSounds: Map<string, PlayInstance[]> = new Map();

  play(id: SoundEffectId, options?: PlayOptions) {
    const limit = this.getSimultaneousLimit(id);
    const playing = this.playingSounds.get(id) || [];

    // Stop oldest sound if limit reached
    if (playing.length >= limit) {
      const oldest = playing.shift();
      this.adapter.stopSFX(oldest.playbackId);
    }

    // Play new sound
    const playbackId = this.adapter.playSFX(id, options);
    playing.push({ playbackId, startTime: Date.now() });
    this.playingSounds.set(id, playing);
  }
}
```

### 7.3 Profiling & Monitoring

```typescript
interface AudioMetrics {
  loadTime: number;
  latency: number;
  simultaneousSounds: number;
  memoryUsage: number;
  cpuUsage: number;
}

class AudioProfiler {
  measureLatency(soundId: SoundEffectId): number {
    const start = performance.now();
    this.soundManager.playSFX(soundId);
    return performance.now() - start;
  }

  trackMetrics(): AudioMetrics {
    return {
      loadTime: this.measureLoadTime(),
      latency: this.measureLatency('ui-button-tap'),
      simultaneousSounds: this.countActiveSounds(),
      memoryUsage: this.estimateMemoryUsage(),
      cpuUsage: this.measureCPUUsage(),
    };
  }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
describe('SoundManager', () => {
  it('should initialize with default configuration', async () => {
    const manager = new SoundManager(defaultConfig);
    await manager.initialize();
    expect(manager.isInitialized()).toBe(true);
  });

  it('should preload critical assets', async () => {
    const manager = new SoundManager(defaultConfig);
    await manager.preloadCritical();

    const criticalIds = ['countdown-3', 'ball-peg-hit', 'land-impact-win'];
    criticalIds.forEach(id => {
      expect(manager.isLoaded(id)).toBe(true);
    });
  });

  it('should apply volume settings correctly', () => {
    const manager = new SoundManager(defaultConfig);

    manager.setMasterVolume(0.5);
    expect(manager.getMasterVolume()).toBe(0.5);

    manager.setMusicVolume(0.7);
    expect(manager.getMusicVolume()).toBe(0.7);
  });
});

describe('MusicController', () => {
  it('should transition music layers based on game state', async () => {
    const controller = new MusicController(mockAdapter);

    await controller.transitionToState('countdown');
    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-tension');

    await controller.transitionToState('dropping');
    expect(controller.getDuckLevel()).toBe(0.35);
  });

  it('should crossfade between layers', async () => {
    const controller = new MusicController(mockAdapter);

    await controller.playLayer('music-base');
    await controller.crossfade('music-base', 'music-tension', 500);

    // Verify old layer faded out and new layer faded in
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 500);
    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-tension', 500);
  });
});

describe('SFXController', () => {
  it('should play sound from pool with pitch variation', () => {
    const controller = new SFXController(mockAdapter);
    controller.createPool('peg-hits', 'ball-peg-hit', 10);

    const playbackId = controller.playFromPool('peg-hits', {
      pitchVariation: 0.2,
    });

    expect(mockAdapter.playSFX).toHaveBeenCalled();
    const options = mockAdapter.playSFX.mock.calls[0][1];
    expect(Math.abs(options.pitch)).toBeLessThanOrEqual(0.2);
  });

  it('should limit simultaneous sounds from pool', () => {
    const controller = new SFXController(mockAdapter);
    controller.createPool('peg-hits', 'ball-peg-hit', 10, {
      maxSimultaneous: 5,
    });

    // Play 10 sounds rapidly
    for (let i = 0; i < 10; i++) {
      controller.playFromPool('peg-hits');
    }

    // Should have stopped older sounds to maintain limit
    expect(controller.getActiveCount('peg-hits')).toBe(5);
  });
});
```

### 8.2 Integration Tests

```typescript
describe('Sound Engine Integration', () => {
  it('should handle complete game flow with audio', async () => {
    const { result } = renderHook(() => useSoundEngine(), {
      wrapper: SoundProvider,
    });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    // Simulate countdown
    act(() => {
      result.current.playSFX('countdown-3');
      result.current.playSFX('countdown-2');
      result.current.playSFX('countdown-1');
      result.current.playSFX('countdown-go');
    });

    // Simulate ball drop with peg hits
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.playPegHit('medium');
      }
    });

    // Simulate landing
    act(() => {
      result.current.playSFX('land-impact-win');
    });

    // Verify music transitioned appropriately
    expect(mockMusicController.transitionToState).toHaveBeenCalledWith('dropping');
  });

  it('should persist volume settings', async () => {
    const { result, unmount } = renderHook(() => useSoundEngine(), {
      wrapper: SoundProvider,
    });

    act(() => {
      result.current.setMasterVolume(0.5);
      result.current.setMusicVolume(0.3);
    });

    unmount();

    // Remount and verify settings persisted
    const { result: result2 } = renderHook(() => useSoundEngine(), {
      wrapper: SoundProvider,
    });

    await waitFor(() => {
      expect(result2.current.getMasterVolume()).toBe(0.5);
      expect(result2.current.getMusicVolume()).toBe(0.3);
    });
  });
});
```

### 8.3 Platform-Specific Tests

```typescript
describe('WebAudioAdapter', () => {
  it('should handle browser autoplay policy', async () => {
    const adapter = new WebAudioAdapter();
    await adapter.initialize();

    // Simulate user interaction
    simulateUserClick();

    adapter.playMusic('music-base');
    expect(adapter.isPlaying('music-base')).toBe(true);
  });

  it('should mute audio when tab is hidden', () => {
    const adapter = new WebAudioAdapter();

    // Simulate tab visibility change
    Object.defineProperty(document, 'hidden', { value: true, writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(Howler.muted()).toBe(true);
  });
});

describe('NativeAudioAdapter', () => {
  it('should handle audio session interruption', async () => {
    const adapter = new NativeAudioAdapter();
    await adapter.initialize();

    adapter.playMusic('music-base');

    // Simulate phone call
    simulateAudioInterruption();

    expect(adapter.isPlaying('music-base')).toBe(false);

    // Simulate interruption end
    simulateAudioInterruptionEnd();

    // Should resume playback
    expect(adapter.isPlaying('music-base')).toBe(true);
  });
});
```

### 8.4 Performance Tests

```typescript
describe('Performance', () => {
  it('should load critical assets within target time', async () => {
    const manager = new SoundManager(defaultConfig);
    const start = performance.now();

    await manager.preloadCritical();

    const loadTime = performance.now() - start;
    expect(loadTime).toBeLessThan(500); // 500ms target
  });

  it('should maintain low latency for critical sounds', () => {
    const manager = new SoundManager(defaultConfig);
    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      manager.playSFX('ui-button-tap');
      latencies.push(performance.now() - start);
    }

    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
    expect(avgLatency).toBeLessThan(50); // 50ms target
  });

  it('should handle rapid peg collisions without degradation', () => {
    const manager = new SoundManager(defaultConfig);
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      manager.playSFX('ball-peg-hit');
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;
    expect(avgTime).toBeLessThan(5); // <5ms per sound
  });
});
```

---

## 9. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure (`src/audio/`)
- [ ] Install Howler.js and React Native Sound
- [ ] Implement AudioAdapter interface
- [ ] Create WebAudioAdapter (Howler.js wrapper)
- [ ] Create NativeAudioAdapter (RN Sound wrapper)
- [ ] Implement platform selection logic
- [ ] Write adapter unit tests

### Phase 2: Core Engine (Week 2)
- [ ] Implement SoundManager class
- [ ] Implement MusicController with layering
- [ ] Implement SFXController with pooling
- [ ] Implement VolumeController with persistence
- [ ] Create useSoundEngine React hook
- [ ] Create SoundProvider component
- [ ] Write core engine unit tests

### Phase 3: Game Integration (Week 3)
- [ ] Implement StateAdapter for game state machine
- [ ] Add sound triggers to game components
- [ ] Implement adaptive music transitions
- [ ] Implement music ducking on SFX
- [ ] Add peg collision pooling
- [ ] Test with actual game flow

### Phase 4: Polish & Optimization (Week 4)
- [ ] Optimize asset loading (preload strategy)
- [ ] Implement memory management
- [ ] Add performance profiling
- [ ] Cross-browser testing (web)
- [ ] iOS device testing
- [ ] User testing and feedback iteration

### Phase 5: Production Ready (Week 5)
- [ ] Final performance optimization
- [ ] Complete test coverage (>80%)
- [ ] Documentation and API examples
- [ ] Asset pipeline integration
- [ ] Production build testing
- [ ] Launch readiness review

---

## 10. File Structure

```
src/
  audio/
    index.ts                      # Public API exports

    core/
      SoundManager.ts             # Main orchestrator
      MusicController.ts          # Adaptive music system
      SFXController.ts            # Sound effects + pooling
      VolumeController.ts         # Volume management
      StateAdapter.ts             # Game state integration

    adapters/
      AudioAdapter.ts             # Interface definition
      WebAudioAdapter.ts          # Howler.js implementation
      NativeAudioAdapter.ts       # RN Sound implementation
      createAdapter.ts            # Platform selection

    react/
      SoundProvider.tsx           # React context provider
      useSoundEngine.ts           # Main React hook
      useSoundEffect.ts           # Convenience hook for SFX
      useMusic.ts                 # Convenience hook for music

    types/
      index.ts                    # TypeScript definitions
      SoundEffectId.ts            # Sound effect ID enum
      MusicTrackId.ts             # Music track ID enum
      Config.ts                   # Configuration types

    utils/
      AssetManager.ts             # Asset path resolution
      AudioProfiler.ts            # Performance monitoring
      DuckingManager.ts           # Music ducking logic
      PoolManager.ts              # Sound pooling logic

    __tests__/
      SoundManager.test.ts
      MusicController.test.ts
      SFXController.test.ts
      VolumeController.test.ts
      WebAudioAdapter.test.ts
      NativeAudioAdapter.test.ts
      integration.test.tsx
```

---

## 11. Example Usage

### Basic Setup

```typescript
// App.tsx
import { SoundProvider } from '@/audio';

function App() {
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <SoundProvider config={{
          assetBasePath: '/assets/audio',
          preloadCriticalOnly: true,
          enableAdaptiveMusic: true,
          enableMusicDucking: true,
        }}>
          <PlinkoGame />
        </SoundProvider>
      </ThemeProvider>
    </AppConfigProvider>
  );
}
```

### Component Usage

```typescript
// Countdown.tsx
import { useSoundEngine } from '@/audio';

export function Countdown({ onComplete }: CountdownProps) {
  const { playSFX } = useSoundEngine();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 3) playSFX('countdown-3');
    else if (count === 2) playSFX('countdown-2');
    else if (count === 1) playSFX('countdown-1');
    else if (count === 0) {
      playSFX('countdown-go');
      onComplete();
    }
  }, [count, playSFX, onComplete]);

  // ... render countdown UI
}
```

```typescript
// PlinkoBoard.tsx
import { useSoundEngine } from '@/audio';

export function PlinkoBoard() {
  const { playPegHit } = useSoundEngine();

  const handlePegCollision = useCallback((collision: Collision) => {
    // Velocity-based sound selection
    const velocity = collision.velocity.magnitude();
    playPegHit(velocity > 0.7 ? 'high' : velocity < 0.3 ? 'low' : 'medium');
  }, [playPegHit]);

  // ... render board and handle collisions
}
```

```typescript
// Settings.tsx
import { useSoundEngine } from '@/audio';

export function Settings() {
  const {
    getMasterVolume,
    setMasterVolume,
    getMusicVolume,
    setMusicVolume,
    getSFXVolume,
    setSFXVolume,
  } = useSoundEngine();

  return (
    <div>
      <VolumeSlider
        label="Master Volume"
        value={getMasterVolume()}
        onChange={setMasterVolume}
      />
      <VolumeSlider
        label="Music Volume"
        value={getMusicVolume()}
        onChange={setMusicVolume}
      />
      <VolumeSlider
        label="SFX Volume"
        value={getSFXVolume()}
        onChange={setSFXVolume}
      />
    </div>
  );
}
```

---

## 12. Success Criteria

The sound engine implementation will be considered successful when:

✅ **Functional Requirements:**
- All 70+ sound effects from sound-design-concept.md are playable
- Adaptive music system transitions smoothly between game states
- Music ducking works automatically on important SFX
- Volume controls persist across sessions
- Peg collision pooling handles 30+ simultaneous sounds

✅ **Performance Requirements:**
- Critical assets load in <500ms
- Audio latency <50ms for UI sounds
- CPU usage <5% during peak activity
- Bundle size increase <100KB

✅ **Platform Requirements:**
- Works identically on web React and React Native iOS
- No platform-specific bugs or edge cases
- Consistent audio quality across devices

✅ **Quality Requirements:**
- >80% test coverage
- Zero memory leaks
- Clean TypeScript types throughout
- Comprehensive documentation

✅ **User Experience Requirements:**
- Audio enhances game without being intrusive
- Volume controls are intuitive and responsive
- Mute/unmute works instantly
- No audio glitches or pops

---

## 13. References

- [Howler.js Documentation](https://howlerjs.com/)
- [React Native Sound GitHub](https://github.com/zmxv/react-native-sound)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [Sound Design Concept Document](./sound-design-concept.md)
- [Plinko Architecture Documentation](./architecture.md)

---

**Document Prepared By:** Technical Architecture Team
**Review Status:** Draft for Review
**Next Steps:** Team review → Approval → Phase 1 implementation
**Estimated Implementation Time:** 5 weeks (1 developer)
