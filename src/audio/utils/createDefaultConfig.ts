import { SoundEffectId, SoundEngineConfig } from '../types';

/**
 * Creates a default configuration for the sound engine.
 * Can be partially overridden with custom values.
 */
export function createDefaultConfig(overrides?: Partial<SoundEngineConfig>): SoundEngineConfig {
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
