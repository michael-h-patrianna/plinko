/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioAdapter } from '../adapters/AudioAdapter';
import { MusicController } from '../core/MusicController';
import { VolumeController } from '../core/VolumeController';
import { MusicTrackId } from '../types';

describe('MusicController', () => {
  let controller: MusicController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    mockAdapter = {
      loadMusic: vi.fn().mockResolvedValue(undefined),
      playMusic: vi.fn(),
      stopMusic: vi.fn(),
      setMusicVolume: vi.fn(),
      fadeMusicVolume: vi.fn(),
      isMusicPlaying: vi.fn(() => false),
      getMusicSeek: vi.fn(() => 5.0),
      getMusicDuration: vi.fn(() => 10.0),
      onMusicLoopEnd: vi.fn((_, callback) => {
        // Immediately call the callback for testing
        setTimeout(callback, 0);
        return () => {};
      }),
    } as unknown as AudioAdapter;

    volumeController = new VolumeController();
    controller = new MusicController(mockAdapter, volumeController);
  });

  it('should load music track', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    expect(mockAdapter.loadMusic).toHaveBeenCalledWith(
      'music-base',
      '/music/base.mp3',
      true // loop
    );
    expect(controller.isLoaded('music-base')).toBe(true);
  });

  it('should load music with custom options', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3', {
      loop: false,
      volume: 0.5,
    });

    expect(mockAdapter.loadMusic).toHaveBeenCalledWith('music-base', '/music/base.mp3', false);
  });

  it('should play music layer', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    controller.playLayer('music-base');

    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(controller.isLayerPlaying('music-base')).toBe(true);
  });

  it('should play music layer with fade-in', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    controller.playLayer('music-base', 1000);

    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-base', 1000);
  });

  it('should stop music layer', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.stopLayer('music-base');

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(controller.isLayerPlaying('music-base')).toBe(false);
  });

  it('should stop music layer with fade-out', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.stopLayer('music-base', 500);

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 500);
  });

  it('should set layer volume', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.setLayerVolume('music-base', 0.5);

    // Volume should be updated for playing layer
    expect(mockAdapter.setMusicVolume).toHaveBeenCalled();
  });

  it('should calculate effective volume correctly', async () => {
    volumeController.setMasterVolume(0.8);
    volumeController.setMusicVolume(0.5);

    await controller.loadTrack('music-base', '/music/base.mp3', {
      loop: true,
      volume: 0.6,
    });

    controller.setMusicVolume(0.7); // base music volume
    controller.playLayer('music-base');

    // Effective = layerVolume(0.6) * baseMusicVolume(0.7) * duckLevel(1.0) * controller(0.8*0.5)
    // = 0.6 * 0.7 * 1.0 * 0.4 = 0.168
    const call = vi.mocked(mockAdapter.setMusicVolume).mock.calls[0];
    expect(call).toBeDefined();
    expect(call![1]).toBeCloseTo(0.168, 3);
  });

  it('should stop all layers', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');
    controller.playLayer('music-tension');

    controller.stopAllLayers();

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', undefined);
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-tension', undefined);
  });

  it('should stop all layers with fade-out', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');
    controller.playLayer('music-tension');

    controller.stopAllLayers(800);

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 800);
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-tension', 800);
  });

  it('should handle playing unloaded track', () => {
    controller.playLayer('music-base' as MusicTrackId);

    expect(mockAdapter.playMusic).not.toHaveBeenCalled();
  });

  it('should fade layer volume', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.fadeLayerVolume('music-base', 0.3, 1000);

    expect(mockAdapter.fadeMusicVolume).toHaveBeenCalled();
    const call = vi.mocked(mockAdapter.fadeMusicVolume).mock.calls[0];
    expect(call![0]).toBe('music-base');
    expect(call![2]).toBe(1000);
  });

  it('should not fade volume for non-playing layer', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');

    controller.fadeLayerVolume('music-base', 0.3, 1000);

    expect(mockAdapter.fadeMusicVolume).not.toHaveBeenCalled();
  });

  it('should not fade volume for unloaded layer', () => {
    controller.fadeLayerVolume('music-base' as MusicTrackId, 0.3, 1000);

    expect(mockAdapter.fadeMusicVolume).not.toHaveBeenCalled();
  });

  it('should transition at loop boundary', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');

    const cleanup = controller.transitionAtLoopBoundary('music-base', 'music-tension');

    // Wait for async callback
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockAdapter.onMusicLoopEnd).toHaveBeenCalledWith('music-base', expect.any(Function));
    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 0);
    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-tension', 0);
    expect(typeof cleanup).toBe('function');
  });

  it('should transition with fade options', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    controller.playLayer('music-base');

    controller.transitionAtLoopBoundary('music-base', 'music-tension', {
      fadeOutFrom: 500,
      fadeInTo: 1000,
      volumeTo: 0.7,
    });

    // Wait for async callback
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockAdapter.stopMusic).toHaveBeenCalledWith('music-base', 500);
    expect(mockAdapter.playMusic).toHaveBeenCalledWith('music-tension', 1000);
  });

  it('should not transition if source layer not playing', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    await controller.loadTrack('music-tension', '/music/tension.mp3');

    // Don't play the source layer
    controller.transitionAtLoopBoundary('music-base', 'music-tension');

    expect(mockAdapter.onMusicLoopEnd).not.toHaveBeenCalled();
  });

  it('should not transition if target layer not loaded', async () => {
    await controller.loadTrack('music-base', '/music/base.mp3');
    controller.playLayer('music-base');

    controller.transitionAtLoopBoundary('music-base', 'music-tension');

    expect(mockAdapter.onMusicLoopEnd).not.toHaveBeenCalled();
  });
});
