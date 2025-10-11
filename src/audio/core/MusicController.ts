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
