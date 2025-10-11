/**
 * Tests for audio memory management and cleanup
 * Ensures no memory leaks when audio system is unmounted
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebAudioAdapter } from '../../../audio/adapters/WebAudioAdapter';
import { MusicController } from '../../../audio/core/MusicController';
import { SFXController } from '../../../audio/core/SFXController';
import { VolumeController } from '../../../audio/core/VolumeController';
import type { PerformanceAdapter } from '../../../utils/platform/performance';

describe('Audio Memory Management', () => {
  let adapter: WebAudioAdapter;
  let volumeController: VolumeController;
  let sfxController: SFXController;
  let musicController: MusicController;
  let mockPerformanceAdapter: PerformanceAdapter;

  beforeEach(() => {
    adapter = new WebAudioAdapter();
    volumeController = new VolumeController();

    mockPerformanceAdapter = {
      now: vi.fn().mockReturnValue(0),
      mark: vi.fn(),
      measure: vi.fn().mockReturnValue(0),
      clearMarks: vi.fn(),
      getMemoryInfo: vi.fn().mockReturnValue(null),
    };

    sfxController = new SFXController(adapter, volumeController, mockPerformanceAdapter);
    musicController = new MusicController(adapter, volumeController);
  });

  describe('SFXController cleanup', () => {
    it('clears all tracking maps when cleanup is called', () => {
      // Add some tracking data
      const soundId = 'ui-button-tap' as const;
      sfxController.setSimultaneousLimit(soundId, 5);
      sfxController.createPool('test-pool', [soundId], {
        maxSimultaneous: 3,
      });
      sfxController.setThrottleDelay(soundId, 50);

      // Call cleanup
      sfxController.cleanup();

      // Verify limits are cleared
      expect(sfxController.getSimultaneousLimit(soundId)).toBe(Infinity);
      expect(sfxController.getThrottleDelay(soundId)).toBeUndefined();
    });

    it('stops all sounds when cleanup is called', () => {
      const stopAllSpy = vi.spyOn(sfxController, 'stopAll');

      sfxController.cleanup();

      expect(stopAllSpy).toHaveBeenCalledTimes(1);
      expect(stopAllSpy).toHaveBeenCalledWith();
    });

    it('can be safely called multiple times', () => {
      expect(() => {
        sfxController.cleanup();
        sfxController.cleanup();
        sfxController.cleanup();
      }).not.toThrow();
    });
  });

  describe('MusicController cleanup', () => {
    it('stops all music layers when cleanup is called', () => {
      const stopAllLayersSpy = vi.spyOn(musicController, 'stopAllLayers');

      musicController.cleanup();

      expect(stopAllLayersSpy).toHaveBeenCalledTimes(1);
      expect(stopAllLayersSpy).toHaveBeenCalledWith(0);
    });

    it('can be safely called multiple times', () => {
      expect(() => {
        musicController.cleanup();
        musicController.cleanup();
        musicController.cleanup();
      }).not.toThrow();
    });
  });

  describe('WebAudioAdapter cleanup', () => {
    it('has a destroy method', () => {
      expect(typeof adapter.destroy).toBe('function');
    });

    it('can be destroyed safely', () => {
      expect(() => {
        adapter.destroy();
      }).not.toThrow();
    });

    it('marks adapter as uninitialized after destroy', async () => {
      await adapter.initialize();
      expect(adapter.isInitialized()).toBe(true);

      adapter.destroy();
      expect(adapter.isInitialized()).toBe(false);
    });

    it('can be safely destroyed multiple times', () => {
      expect(() => {
        adapter.destroy();
        adapter.destroy();
        adapter.destroy();
      }).not.toThrow();
    });
  });

  describe('Complete cleanup workflow', () => {
    it('cleans up in the correct order', async () => {
      // Initialize
      await adapter.initialize();

      // Create some state
      const soundId = 'ui-button-tap' as const;
      sfxController.setSimultaneousLimit(soundId, 5);

      // Cleanup in reverse order (controllers first, then adapter)
      sfxController.cleanup();
      musicController.cleanup();
      adapter.destroy();

      // Verify everything is cleaned up
      expect(adapter.isInitialized()).toBe(false);
      expect(sfxController.getSimultaneousLimit(soundId)).toBe(Infinity);
    });

    it('handles cleanup when not initialized', () => {
      // Cleanup without initialization should not throw
      expect(() => {
        sfxController.cleanup();
        musicController.cleanup();
        adapter.destroy();
      }).not.toThrow();
    });
  });
});
