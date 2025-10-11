import { AudioAdapter } from '../adapters/AudioAdapter';
import { PlayOptions, PlaybackId, SoundEffectId } from '../types';
import { VolumeController } from './VolumeController';

interface PoolConfig {
  strategy?: 'random' | 'round-robin';
  maxSimultaneous?: number;
}

interface SoundPool {
  sounds: SoundEffectId[];
  config: PoolConfig;
  currentIndex: number;
}

/**
 * Controls sound effects playback with pooling and pitch variation.
 */
export class SFXController {
  private adapter: AudioAdapter;
  private volumeController: VolumeController;
  private loadedSounds = new Set<string>();
  private playingSounds = new Map<string, PlaybackId[]>();
  private pools = new Map<string, SoundPool>();
  private simultaneousLimits = new Map<string, number>();

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
    const effectiveVolume =
      options?.volume !== undefined
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

  /**
   * Create a sound pool for repeated sounds with variations.
   */
  createPool(poolId: string, soundIds: SoundEffectId[], config: PoolConfig = {}): void {
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
    soundIds.forEach((id) => {
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

    if (pool.sounds.length === 0) {
      console.warn(`Sound pool "${poolId}" has no sounds`);
      return -1;
    }

    // Select sound based on strategy
    let soundId: SoundEffectId;
    if (pool.config.strategy === 'round-robin') {
      soundId = pool.sounds[pool.currentIndex]!;
      pool.currentIndex = (pool.currentIndex + 1) % pool.sounds.length;
    } else {
      // Random selection
      const randomIndex = Math.floor(Math.random() * pool.sounds.length);
      soundId = pool.sounds[randomIndex]!;
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
