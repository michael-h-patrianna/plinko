# Sound Engine Guide

Clear, actionable instructions for using the Plinko sound engine.

---

## For Frontend Developers

### 1. Initialize the Audio System

Do this once at app startup:

```typescript
import { WebAudioAdapter } from '@/audio/adapters/WebAudioAdapter';
import { VolumeController } from '@/audio/core/VolumeController';
import { SFXController } from '@/audio/core/SFXController';
import { MusicController } from '@/audio/core/MusicController';

// Create audio adapter
const adapter = new WebAudioAdapter();
await adapter.initialize();

// Create volume controller and load user preferences
const volumeController = new VolumeController();
volumeController.loadFromStorage();

// Create sound controllers
const sfxController = new SFXController(adapter, volumeController);
const musicController = new MusicController(adapter, volumeController);
```

### 2. Load Audio Files

**Where to store audio files**: `src/assets/sounds/`

**Load them in your initialization**:

```typescript
// Import audio files
import buttonTapSound from '@/assets/sounds/sfx/ui/button-tap.mp3';
import pegHitSound from '@/assets/sounds/sfx/ball/peg-hit.mp3';
import baseMusic from '@/assets/sounds/music/base-layer.mp3';
import tensionMusic from '@/assets/sounds/music/tension-layer.mp3';

// Load sound effects
await sfxController.loadSound('ui-button-tap', buttonTapSound);
await sfxController.loadSound('ball-peg-hit', pegHitSound);

// Load music tracks
await musicController.loadTrack('music-base', baseMusic, { loop: true });
await musicController.loadTrack('music-tension', tensionMusic, { loop: true, volume: 0.8 });
```

### 3. Play Sound Effects

```typescript
// Basic playback
sfxController.play('ui-button-tap');

// With options
sfxController.play('ball-peg-hit', {
  volume: 0.8,  // 0-1 range
  pitch: 0.15,  // -1 to +1 (0.15 = 15% higher pitch)
  delay: 200    // milliseconds
});
```

**Stop sounds**:
```typescript
sfxController.stopAll('ball-peg-hit');  // Stop all instances of this sound
sfxController.stopAll();                 // Stop ALL sounds
```

### 4. Play Music

**Start a music layer**:
```typescript
musicController.playLayer('music-base');           // Immediate
musicController.playLayer('music-tension', 2000);  // With 2s fade-in
```

**Stop a music layer**:
```typescript
musicController.stopLayer('music-tension', 1000);  // With 1s fade-out
musicController.stopAllLayers(1500);               // Stop all with 1.5s fade-out
```

### 5. Crossfade Between Music

**Example: Increase tension**:
```typescript
// Fade out calm music
musicController.stopLayer('music-base', 2000);

// Fade in tension music
musicController.playLayer('music-tension', 2000);
```

**Example: Win celebration**:
```typescript
// Reduce base music volume
musicController.setLayerVolume('music-base', 0.3);

// Play win stinger
musicController.playLayer('music-win-stinger');
```

### 6. Control Volume

```typescript
// Master volume (affects everything)
volumeController.setMasterVolume(0.8);

// Music volume (affects all music layers)
volumeController.setMusicVolume(0.7);

// SFX volume (affects all sound effects)
volumeController.setSFXVolume(0.9);

// Mute/unmute
volumeController.setMuted(true);

// Save user preferences to localStorage
volumeController.saveToStorage();
```

### 7. Sound Pooling (for frequently repeated sounds)

```typescript
// Create a pool with multiple variations
sfxController.createPool('peg-hits', [
  'ball-peg-hit',
  'ball-peg-hit-low',
  'ball-peg-hit-high'
], {
  strategy: 'random',      // or 'round-robin'
  maxSimultaneous: 8       // Max concurrent instances
});

// Play from pool (automatically picks variation and adds pitch variation)
sfxController.playFromPool('peg-hits');
```

---

## For Sound Designers

### Audio File Requirements

**Format:**
- MP3 or OGG
- 44.1 kHz or 48 kHz sample rate
- 128-192 kbps for SFX, 192-320 kbps for music
- Mono for SFX, Stereo for music

**File Size:**
- SFX: Under 100 KB (aim for 20-50 KB)
- Music: Under 2 MB (aim for 500 KB - 1.5 MB)

**Processing:**
- Normalize to -3 to -6 dB (SFX) or -6 to -9 dB (music)
- Remove DC offset
- Trim silence but leave ~10ms attack/decay
- High-pass filter at 40-80 Hz
- Limit peaks to -0.5 dB

### Where to Put Audio Files

```
src/assets/sounds/
├── sfx/
│   ├── ui/              # button-tap.mp3, button-press.mp3, etc.
│   ├── countdown/       # countdown-3.mp3, countdown-2.mp3, etc.
│   ├── ball/            # peg-hit.mp3, peg-hit-low.mp3, etc.
│   ├── landing/         # impact-win.mp3, impact-nowin.mp3
│   ├── celebration/     # win-small.mp3, win-big.mp3, etc.
│   ├── prize/           # reveal-minor.mp3, reveal-major.mp3
│   └── ...
└── music/
    ├── base-layer.mp3
    ├── tension-layer.mp3
    ├── win-stinger.mp3
    └── nowin-stinger.mp3
```

### Adding New Sounds

**1. Add your audio file**:
```bash
src/assets/sounds/sfx/ui/button-hover.mp3
```

**2. Register the sound ID** in `src/audio/types/SoundEffectId.ts`:
```typescript
export type SoundEffectId =
  | 'ui-button-tap'
  | 'ui-button-hover'  // ← Add this
  | ...
```

**3. Tell the frontend developer** the sound ID and file path so they can import and load it.

### Naming Conventions

**Sound IDs**: `category-description-variant`
- `ui-button-tap`
- `ball-peg-hit-low`
- `land-impact-win`
- `prize-reveal-major`

**File names**: Match the description part
- Sound ID: `ui-button-tap` → File: `button-tap.mp3`
- Sound ID: `ball-peg-hit-low` → File: `peg-hit-low.mp3`

**Categories**:
- `ui-*` - User interface sounds
- `countdown-*` - Pre-drop countdown
- `ball-*` - Ball physics
- `land-*` - Landing sounds
- `win-*` - Win celebrations
- `prize-*` - Prize reveals
- `music-*` - Music tracks

### Testing Your Sounds

Open browser console:

```javascript
// Load and test a sound
import('@/assets/sounds/sfx/ui/button-hover.mp3').then(module => {
  sfxController.loadSound('ui-button-hover', module.default);
  sfxController.play('ui-button-hover');
});

// Test with different volumes
sfxController.play('ui-button-hover', { volume: 0.5 });
sfxController.play('ui-button-hover', { volume: 1.0 });

// Test pitch variation
sfxController.play('ball-peg-hit', { pitch: -0.15 });
sfxController.play('ball-peg-hit', { pitch: 0.15 });
```

---

**Last Updated**: October 11, 2025
