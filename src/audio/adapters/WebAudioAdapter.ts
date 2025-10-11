import { Howl, Howler } from 'howler';
import { PlaybackId, PlayOptions } from '../types';
import { AudioAdapter } from './AudioAdapter';

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
    this.musicTracks.forEach((howl) => howl.unload());
    this.sfxSounds.forEach((howl) => howl.unload());

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
        onloaderror: (_id, error) => {
          reject(new Error(`Failed to load music "${id}": ${String(error)}`));
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
        onloaderror: (_id, error) => {
          reject(new Error(`Failed to load SFX "${id}": ${String(error)}`));
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
        howl.play(String(playId));
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
}
