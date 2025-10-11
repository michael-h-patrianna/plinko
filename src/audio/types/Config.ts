import { SoundEffectId } from './SoundEffectId';

/**
 * Configuration for the sound engine.
 */
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

/**
 * Options for playing a sound effect.
 */
export interface PlayOptions {
  volume?: number; // 0-1
  pitch?: number; // -1 to 1 (variation from base rate)
  delay?: number; // ms delay before playing
  loop?: boolean;
}

/**
 * Options for playing music.
 */
export interface MusicOptions {
  loop: boolean;
  fadeInMs?: number;
  volume?: number;
}

/**
 * Options for loading sound effects.
 */
export interface SFXOptions {
  preload?: boolean;
  volume?: number;
}

/**
 * Unique identifier for a specific sound playback instance.
 */
export type PlaybackId = number | string;

/**
 * User volume settings for persistence.
 */
export interface VolumeSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}
