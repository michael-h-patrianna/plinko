/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioAdapter } from '../adapters/AudioAdapter';
import { SFXController } from '../core/SFXController';
import { VolumeController } from '../core/VolumeController';
import { SoundEffectId } from '../types';

describe('SFXController', () => {
  let controller: SFXController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    mockAdapter = {
      loadSFX: vi.fn().mockResolvedValue(undefined),
      playSFX: vi.fn().mockReturnValue(123),
      stopSFX: vi.fn(),
      stopAllSFX: vi.fn(),
    } as unknown as AudioAdapter;

    volumeController = new VolumeController();
    controller = new SFXController(mockAdapter, volumeController);
  });

  it('should load sound effect', async () => {
    await controller.loadSound('ui-button-tap', '/audio/tap.mp3');

    expect(mockAdapter.loadSFX).toHaveBeenCalledWith('ui-button-tap', '/audio/tap.mp3');
    expect(controller.isLoaded('ui-button-tap')).toBe(true);
  });

  it('should play loaded sound', async () => {
    await controller.loadSound('ui-button-tap', '/audio/tap.mp3');

    const playbackId = controller.play('ui-button-tap');

    expect(mockAdapter.playSFX).toHaveBeenCalledWith(
      'ui-button-tap',
      expect.objectContaining({ volume: 1.0 }) // Default volumes
    );
    expect(playbackId).toBe(123);
  });

  it('should apply volume controller SFX volume', async () => {
    volumeController.setMasterVolume(0.8);
    volumeController.setSFXVolume(0.5);
    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3');

    controller.play('ui-button-tap' as SoundEffectId);

    // Effective volume = 0.8 * 0.5 = 0.4
    expect(mockAdapter.playSFX).toHaveBeenCalledWith('ui-button-tap', expect.any(Object));
    const callArgs = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs![1]?.volume).toBeCloseTo(0.4, 5);
  });

  it('should apply custom volume on top of controller volume', async () => {
    volumeController.setMasterVolume(0.5);
    volumeController.setSFXVolume(0.8);
    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3');

    controller.play('ui-button-tap' as SoundEffectId, { volume: 0.5 });

    // Effective volume = 0.5 * 0.8 * 0.5 = 0.2
    expect(mockAdapter.playSFX).toHaveBeenCalledWith('ui-button-tap', expect.any(Object));
    const callArgs = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs![1]?.volume).toBeCloseTo(0.2, 5);
  });

  it('should track playing sounds', async () => {
    vi.mocked(mockAdapter.playSFX)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);

    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3');

    controller.play('ui-button-tap' as SoundEffectId);
    controller.play('ui-button-tap' as SoundEffectId);
    controller.play('ui-button-tap' as SoundEffectId);

    expect(controller.getActiveCount('ui-button-tap' as SoundEffectId)).toBe(3);
  });

  it('should stop specific playback instance', async () => {
    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3');
    const playbackId = controller.play('ui-button-tap' as SoundEffectId);

    controller.stop(playbackId);

    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(123);
    expect(controller.getActiveCount('ui-button-tap' as SoundEffectId)).toBe(0);
  });

  it('should stop all instances of a sound', async () => {
    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3');
    controller.play('ui-button-tap' as SoundEffectId);
    controller.play('ui-button-tap' as SoundEffectId);

    controller.stopAll('ui-button-tap' as SoundEffectId);

    expect(mockAdapter.stopAllSFX).toHaveBeenCalledWith('ui-button-tap');
    expect(controller.getActiveCount('ui-button-tap' as SoundEffectId)).toBe(0);
  });

  it('should stop all sounds when no ID provided', async () => {
    await controller.loadSound('ui-button-tap' as SoundEffectId, '/test1.mp3');
    await controller.loadSound('ui-button-press' as SoundEffectId, '/test2.mp3');
    controller.play('ui-button-tap' as SoundEffectId);
    controller.play('ui-button-press' as SoundEffectId);

    controller.stopAll();

    expect(mockAdapter.stopAllSFX).toHaveBeenCalledTimes(2);
  });

  it('should handle playing unloaded sound', () => {
    const playbackId = controller.play('ui-button-tap' as SoundEffectId);

    expect(playbackId).toBe(-1);
    expect(mockAdapter.playSFX).not.toHaveBeenCalled();
  });

  it('should handle load failure', async () => {
    vi.mocked(mockAdapter.loadSFX).mockRejectedValue(new Error('Load failed'));

    await expect(
      controller.loadSound('ui-button-tap' as SoundEffectId, '/test.mp3')
    ).rejects.toThrow('Load failed');

    expect(controller.isLoaded('ui-button-tap' as SoundEffectId)).toBe(false);
  });
});

describe('SFXController - Pooling', () => {
  let controller: SFXController;
  let mockAdapter: AudioAdapter;
  let volumeController: VolumeController;

  beforeEach(() => {
    let playbackIdCounter = 1;
    mockAdapter = {
      loadSFX: vi.fn().mockResolvedValue(undefined),
      playSFX: vi.fn(() => playbackIdCounter++),
      stopSFX: vi.fn(),
      stopAllSFX: vi.fn(),
    } as unknown as AudioAdapter;

    volumeController = new VolumeController();
    controller = new SFXController(mockAdapter, volumeController);
  });

  it('should create sound pool', async () => {
    await controller.loadSound('ball-peg-hit' as SoundEffectId, '/hit1.mp3');
    await controller.loadSound('ball-peg-hit-low' as SoundEffectId, '/hit2.mp3');
    await controller.loadSound('ball-peg-hit-high' as SoundEffectId, '/hit3.mp3');

    controller.createPool('test-pool', [
      'ball-peg-hit' as SoundEffectId,
      'ball-peg-hit-low' as SoundEffectId,
      'ball-peg-hit-high' as SoundEffectId,
    ]);

    // Pool created (no error)
    expect(() => controller.playFromPool('test-pool')).not.toThrow();
  });

  it('should play from pool with random strategy', async () => {
    await controller.loadSound('sound1' as SoundEffectId, '/sound1.mp3');
    await controller.loadSound('sound2' as SoundEffectId, '/sound2.mp3');
    await controller.loadSound('sound3' as SoundEffectId, '/sound3.mp3');

    controller.createPool(
      'test-pool',
      ['sound1' as SoundEffectId, 'sound2' as SoundEffectId, 'sound3' as SoundEffectId],
      { strategy: 'random' }
    );

    // Play multiple times and collect which sounds were played
    for (let i = 0; i < 20; i++) {
      controller.playFromPool('test-pool');
    }

    // Should have played from adapter (not checking specific sounds due to randomness)
    expect(mockAdapter.playSFX).toHaveBeenCalled();
    expect(vi.mocked(mockAdapter.playSFX).mock.calls.length).toBe(20);
  });

  it('should play from pool with round-robin strategy', async () => {
    await controller.loadSound('sound1' as SoundEffectId, '/sound1.mp3');
    await controller.loadSound('sound2' as SoundEffectId, '/sound2.mp3');
    await controller.loadSound('sound3' as SoundEffectId, '/sound3.mp3');

    controller.createPool(
      'test-pool',
      ['sound1' as SoundEffectId, 'sound2' as SoundEffectId, 'sound3' as SoundEffectId],
      { strategy: 'round-robin' }
    );

    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool'); // Should wrap to first

    // Check that sounds were played in order
    const calls = vi.mocked(mockAdapter.playSFX).mock.calls;
    expect(calls[0]![0]).toBe('sound1');
    expect(calls[1]![0]).toBe('sound2');
    expect(calls[2]![0]).toBe('sound3');
    expect(calls[3]![0]).toBe('sound1'); // Wrapped
  });

  it('should enforce simultaneous sound limit', async () => {
    await controller.loadSound('test' as SoundEffectId, '/test.mp3');

    controller.createPool('test-pool', ['test' as SoundEffectId], {
      maxSimultaneous: 3,
    });

    // Play 5 times (exceeds limit of 3)
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool');
    controller.playFromPool('test-pool'); // Should stop oldest
    controller.playFromPool('test-pool'); // Should stop oldest

    // Should have stopped 2 sounds to maintain limit of 3
    expect(mockAdapter.stopSFX).toHaveBeenCalledTimes(2);
    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(1); // First playback ID
    expect(mockAdapter.stopSFX).toHaveBeenCalledWith(2); // Second playback ID
  });

  it('should apply random pitch variation in random mode', async () => {
    await controller.loadSound('test' as SoundEffectId, '/test.mp3');

    controller.createPool('test-pool', ['test' as SoundEffectId], {
      strategy: 'random',
    });

    controller.playFromPool('test-pool');

    // Should have applied pitch (random value between -0.15 and +0.15)
    const call = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(call).toBeDefined();
    expect(call![1]?.pitch).toBeDefined();
    expect(Math.abs(call![1]!.pitch!)).toBeLessThanOrEqual(0.15);
  });

  it('should not override explicit pitch option', async () => {
    await controller.loadSound('test' as SoundEffectId, '/test.mp3');

    controller.createPool('test-pool', ['test' as SoundEffectId]);

    controller.playFromPool('test-pool', { pitch: 0.5 });

    // Should use explicit pitch, not random
    const call = vi.mocked(mockAdapter.playSFX).mock.calls[0];
    expect(call).toBeDefined();
    expect(call![1]?.pitch).toBe(0.5);
  });

  it('should set and get simultaneous limits', () => {
    controller.setSimultaneousLimit('test' as SoundEffectId, 5);
    expect(controller.getSimultaneousLimit('test' as SoundEffectId)).toBe(5);
  });

  it('should return Infinity for sounds without limit', () => {
    expect(controller.getSimultaneousLimit('no-limit' as SoundEffectId)).toBe(Infinity);
  });

  it('should handle playing from non-existent pool', () => {
    const playbackId = controller.playFromPool('non-existent');
    expect(playbackId).toBe(-1);
  });
});
