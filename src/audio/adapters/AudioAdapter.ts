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
