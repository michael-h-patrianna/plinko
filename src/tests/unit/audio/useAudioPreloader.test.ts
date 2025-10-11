/**
 * Unit tests for useAudioPreloader hook
 * Tests sound file loading, error handling, and state management
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MusicController } from '../../../audio/core/MusicController';
import type { SFXController } from '../../../audio/core/SFXController';
import { useAudioPreloader } from '../../../audio/hooks/useAudioPreloader';

describe('useAudioPreloader', () => {
  let mockSFXController: Partial<SFXController>;
  let mockMusicController: Partial<MusicController>;

  beforeEach(() => {
    mockSFXController = {
      loadSound: vi.fn().mockResolvedValue(undefined),
    };

    mockMusicController = {
      loadTrack: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: true,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.errors).toEqual([]);
  });

  it('preloads sounds when enabled', async () => {
    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(mockSFXController.loadSound).toHaveBeenCalledWith('ui-button-press', expect.any(String));
  });

  it('does not preload when disabled', async () => {
    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: false,
      })
    );

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isLoaded).toBe(false);
    expect(mockSFXController.loadSound).not.toHaveBeenCalled();
  });

  it('does not preload when controllers are null', async () => {
    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: null,
        musicController: null,
        enabled: true,
      })
    );

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.isLoaded).toBe(false);
  });

  it('captures errors when loading fails', async () => {
    const loadError = new Error('Failed to load sound');
    mockSFXController.loadSound = vi.fn().mockRejectedValue(loadError);

    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]).toBe(loadError);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('continues loading other sounds when one fails', async () => {
    // Mock only the first sound to fail
    let callCount = 0;
    mockSFXController.loadSound = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('First sound failed'));
      }
      return Promise.resolve();
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // Should have attempted to load the sound
    expect(mockSFXController.loadSound).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('handles component unmount during loading', async () => {
    // Make loading take longer
    mockSFXController.loadSound = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    const { unmount } = renderHook(() =>
      useAudioPreloader({
        sfxController: mockSFXController as SFXController,
        musicController: mockMusicController as MusicController,
        enabled: true,
      })
    );

    // Unmount before loading completes
    unmount();

    // Should not throw
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
