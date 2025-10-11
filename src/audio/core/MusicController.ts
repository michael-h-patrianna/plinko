import { AudioAdapter } from '../adapters/AudioAdapter';
import { MusicOptions, MusicTrackId } from '../types';
import { VolumeController } from './VolumeController';

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
  private musicBPM = 112; // Default BPM for music tracks

  constructor(adapter: AudioAdapter, volumeController: VolumeController) {
    this.adapter = adapter;
    this.volumeController = volumeController;
  }

  /**
   * Set the BPM (beats per minute) for music timing calculations.
   * Used to calculate musically-aligned crossfade durations.
   */
  setMusicBPM(bpm: number): void {
    this.musicBPM = bpm;
  }

  /**
   * Get the current music BPM.
   */
  getMusicBPM(): number {
    return this.musicBPM;
  }

  /**
   * Calculate the duration of a number of beats in milliseconds.
   * @param beats - Number of beats (can be fractional, e.g., 0.5 for half beat)
   * @returns Duration in milliseconds
   */
  getBeatsInMs(beats: number): number {
    const msPerBeat = (60 / this.musicBPM) * 1000;
    return beats * msPerBeat;
  }

  /**
   * Get common musical durations in milliseconds based on current BPM.
   * Useful for creating musically-aligned transitions.
   */
  getMusicalDurations(): {
    quarterNote: number;
    halfNote: number;
    wholeNote: number;
    bar: number; // 4 beats (one bar in 4/4 time)
    twoBars: number;
  } {
    const quarterNote = this.getBeatsInMs(1);
    return {
      quarterNote,
      halfNote: quarterNote * 2,
      wholeNote: quarterNote * 4,
      bar: quarterNote * 4,
      twoBars: quarterNote * 8,
    };
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
   * Fade a layer's volume from current to target over specified duration.
   */
  fadeLayerVolume(id: MusicTrackId, targetVolume: number, durationMs: number): void {
    const layer = this.layers.get(id);
    if (!layer || !layer.isPlaying) {
      return;
    }

    // Update stored volume
    layer.volume = Math.max(0, Math.min(1, targetVolume));

    // Calculate effective target volume
    const effectiveVolume = this.calculateEffectiveVolume(layer.volume);

    // Fade at adapter level
    this.adapter.fadeMusicVolume(id, effectiveVolume, durationMs);
  }

  /**
   * Check if a layer is currently playing.
   */
  isLayerPlaying(id: MusicTrackId): boolean {
    return this.layers.get(id)?.isPlaying ?? false;
  }

  /**
   * Get the current volume of a layer (0-1).
   */
  getLayerVolume(id: MusicTrackId): number {
    return this.layers.get(id)?.volume ?? 1.0;
  }

  /**
   * Transition from one layer to another at the end of the current loop.
   * This ensures rhythmic continuity by switching at loop boundaries.
   * Returns a cleanup function to cancel the transition if needed.
   */
  transitionAtLoopBoundary(
    fromId: MusicTrackId,
    toId: MusicTrackId,
    options?: {
      fadeOutFrom?: number;
      fadeInTo?: number;
      volumeTo?: number;
      inheritVolume?: boolean; // If true, copy volume from fromLayer to toLayer at transition time
    }
  ): () => void {
    const fromLayer = this.layers.get(fromId);
    const toLayer = this.layers.get(toId);

    if (!fromLayer || !fromLayer.isPlaying) {
      console.warn(`Source layer "${fromId}" is not playing`);
      return () => {};
    }

    if (!toLayer) {
      console.warn(`Target layer "${toId}" not loaded`);
      return () => {};
    }

    // Schedule transition at loop end with 20 second max wait (longer than our 17s loops)
    const cleanup = this.adapter.onMusicLoopEnd(
      fromId,
      () => {
        console.log(`Loop boundary reached - transitioning from ${fromId} to ${toId}`);

        // Capture the current volume of the from layer at transition time
        const currentFromVolume = fromLayer.volume;

        // Set target volume for new track
        if (options?.inheritVolume) {
          // Inherit the volume from the layer we're transitioning away from
          toLayer.volume = currentFromVolume;
          console.log(`Inherited volume ${currentFromVolume} from ${fromId} to ${toId}`);
        } else if (options?.volumeTo !== undefined) {
          // Use explicit volume
          toLayer.volume = options.volumeTo;
        }
        // Otherwise, toLayer keeps its current stored volume

        // Start the new track first (with fade-in if specified)
        if (options?.fadeInTo) {
          this.playLayer(toId, options.fadeInTo);
        } else {
          this.playLayer(toId, 0); // Instant start
        }

        // Then stop the old track (with fade-out if specified)
        // This creates a crossfade where both tracks overlap briefly
        if (options?.fadeOutFrom) {
          this.stopLayer(fromId, options.fadeOutFrom);
        } else {
          this.stopLayer(fromId, 0); // Instant stop at loop boundary
        }
      },
      20000 // Max wait 20 seconds - longer than our 17-18s music loops
    );

    return cleanup;
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

  /**
   * Clean up all resources and stop all music layers.
   * Call this when the controller is no longer needed to prevent memory leaks.
   */
  cleanup(): void {
    // Stop all music layers
    this.stopAllLayers(0); // No fade for cleanup

    // Clear tracking
    this.layers.clear();
  }
}
