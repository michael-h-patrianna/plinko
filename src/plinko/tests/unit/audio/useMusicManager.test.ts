/**
 * Unit tests for useMusicManager hook
 * Tests centralized music management based on game state
 *
 * JUSTIFIED 'any' USAGE:
 * - Mock functions need to be cast to 'any' to use Vitest mock methods (mockReturnValue, mockImplementation)
 * - TypeScript doesn't know that vi.fn() creates a mock with additional methods
 * - This is standard practice in Vitest/Jest testing for mocking return values
 *
 * @vitest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MusicController } from '../../../audio/core/MusicController';
import { useMusicManager } from '../../../audio/hooks/useMusicManager';
import type { GameState } from '../../../game/types';

describe('useMusicManager', () => {
  let mockMusicController: MusicController;

  // Create mock functions that can be accessed without unbound-method warnings
  let isLoadedMock: ReturnType<typeof vi.fn>;
  let playLayerMock: ReturnType<typeof vi.fn>;
  let stopLayerMock: ReturnType<typeof vi.fn>;
  let loadTrackMock: ReturnType<typeof vi.fn>;
  let setLayerVolumeMock: ReturnType<typeof vi.fn>;
  let fadeLayerVolumeMock: ReturnType<typeof vi.fn>;
  let isLayerPlayingMock: ReturnType<typeof vi.fn>;
  let setMusicVolumeMock: ReturnType<typeof vi.fn>;
  let stopAllLayersMock: ReturnType<typeof vi.fn>;
  let transitionAtLoopBoundaryMock: ReturnType<typeof vi.fn>;
  let cleanupMock: ReturnType<typeof vi.fn>;
  let getMusicBPMMock: ReturnType<typeof vi.fn>;
  let getBeatsInMsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Initialize mock functions
    isLoadedMock = vi.fn().mockReturnValue(true);
    playLayerMock = vi.fn();
    stopLayerMock = vi.fn();
    loadTrackMock = vi.fn();
    setLayerVolumeMock = vi.fn();
    fadeLayerVolumeMock = vi.fn();
    isLayerPlayingMock = vi.fn().mockReturnValue(false);
    setMusicVolumeMock = vi.fn();
    stopAllLayersMock = vi.fn();
    transitionAtLoopBoundaryMock = vi.fn().mockReturnValue(() => {});
    cleanupMock = vi.fn();
    getMusicBPMMock = vi.fn().mockReturnValue(112);
    getBeatsInMsMock = vi.fn().mockReturnValue(535); // ~535ms per beat at 112 BPM

    // Create mock music controller
    mockMusicController = {
      isLoaded: isLoadedMock,
      playLayer: playLayerMock,
      stopLayer: stopLayerMock,
      loadTrack: loadTrackMock,
      setLayerVolume: setLayerVolumeMock,
      fadeLayerVolume: fadeLayerVolumeMock,
      isLayerPlaying: isLayerPlayingMock,
      setMusicVolume: setMusicVolumeMock,
      stopAllLayers: stopAllLayersMock,
      transitionAtLoopBoundary: transitionAtLoopBoundaryMock,
      cleanup: cleanupMock,
      getMusicBPM: getMusicBPMMock,
      getBeatsInMs: getBeatsInMsMock,
    } as unknown as MusicController;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Music Start Behavior', () => {
    it('should start music when transitioning to selecting-position state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      expect(setLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.36);
      expect(playLayerMock).toHaveBeenCalledWith('music-start-loop', 1000);
    });

    it('should not start music if musicEnabled is false', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: false,
        })
      );

      expect(playLayerMock).not.toHaveBeenCalled();
    });

    it('should not start music if controller is null', () => {
      renderHook(() =>
        useMusicManager({
          musicController: null,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      expect(playLayerMock).not.toHaveBeenCalled();
    });

    it('should not start music if track is already playing', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      // Should not call playLayer again if already playing
      expect(playLayerMock).not.toHaveBeenCalled();
    });
  });

  describe('Music Stop Behavior', () => {
    it('should stop all music when returning to idle state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'idle' as GameState,
          musicEnabled: true,
        })
      );

      // Immediate stop to prevent overlapping playback on reset
      expect(stopAllLayersMock).toHaveBeenCalledWith(0);
    });

    it('should stop all music when returning to ready state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'ready' as GameState,
          musicEnabled: true,
        })
      );

      // Immediate stop to prevent overlapping playback on reset
      expect(stopAllLayersMock).toHaveBeenCalledWith(0);
    });
  });

  describe('Volume Transitions', () => {
    it('should fade to 25% volume on countdown state', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'countdown' as GameState,
          musicEnabled: true,
        })
      );

      expect(fadeLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.25, 400);
    });

    it('should quickly fade to 36% volume on dropping state (200ms)', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      expect(fadeLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.36, 200);
    });

    it('should fade to 25% volume on landed state', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'landed' as GameState,
          musicEnabled: true,
        })
      );

      expect(fadeLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.25, 300);
    });

    it('should fade to 25% volume on celebrating state, then restore to 36% after ~1s', () => {
      vi.useFakeTimers();
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'celebrating' as GameState,
          musicEnabled: true,
        })
      );

      // Initial duck to 25%
      expect(fadeLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.25, 300);

      // Clear the first call
      vi.clearAllMocks();

      // Fast-forward 1 second
      vi.advanceTimersByTime(1000);

      // Should restore to 36%
      expect(fadeLayerVolumeMock).toHaveBeenCalledWith('music-start-loop', 0.36, 500);

      vi.useRealTimers();
    });

    it('should not change volume on revealed state', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'revealed' as GameState,
          musicEnabled: true,
        })
      );

      // Should not call fadeLayerVolume for revealed state
      expect(fadeLayerVolumeMock).not.toHaveBeenCalled();
    });

    it('should not apply volume changes if music is disabled', () => {
      isLayerPlayingMock.mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'countdown' as GameState,
          musicEnabled: false,
        })
      );

      expect(fadeLayerVolumeMock).not.toHaveBeenCalled();
    });
  });

  describe('Loop Alternation', () => {
    it('should set up loop alternation when start-loop is playing', () => {
      vi.useFakeTimers();
      isLayerPlayingMock.mockImplementation((id: string) => id === 'music-start-loop');

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      // Fast-forward past the 10 second setup delay
      vi.advanceTimersByTime(10000);

      expect(transitionAtLoopBoundaryMock).toHaveBeenCalledWith(
        'music-start-loop',
        'music-game-loop',
        expect.objectContaining({
          fadeOutFrom: 535,
          fadeInTo: 535,
          inheritVolume: true, // Should inherit volume at transition time
        })
      );

      vi.useRealTimers();
    });

    it('should set up loop alternation when game-loop is playing', () => {
      vi.useFakeTimers();
      isLayerPlayingMock.mockImplementation((id: string) => id === 'music-game-loop');

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      // Fast-forward past the 10 second setup delay
      vi.advanceTimersByTime(10000);

      expect(transitionAtLoopBoundaryMock).toHaveBeenCalledWith(
        'music-game-loop',
        'music-start-loop',
        expect.objectContaining({
          fadeOutFrom: 535,
          fadeInTo: 535,
          inheritVolume: true, // Should inherit volume at transition time
        })
      );

      vi.useRealTimers();
    });

    it('should clean up loop alternation on unmount', () => {
      vi.useFakeTimers();
      const mockCleanup = vi.fn();
      transitionAtLoopBoundaryMock.mockReturnValue(mockCleanup);
      isLayerPlayingMock.mockReturnValue(true);

      const { unmount } = renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      // Fast-forward past the 10 second setup delay to trigger alternation setup
      vi.advanceTimersByTime(10000);

      unmount();

      expect(mockCleanup).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle transition from music disabled to enabled', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useMusicManager({
            musicController: mockMusicController,
            gameState: 'selecting-position' as GameState,
            musicEnabled: enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(playLayerMock).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(playLayerMock).toHaveBeenCalledWith('music-start-loop', 1000);
    });

    it('should handle music controller becoming null', () => {
      const { rerender } = renderHook(
        ({ controller }: { controller: MusicController | null }) =>
          useMusicManager({
            musicController: controller,
            gameState: 'dropping' as GameState,
            musicEnabled: true,
          }),
        { initialProps: { controller: mockMusicController as MusicController | null } }
      );

      expect(() => rerender({ controller: null })).not.toThrow();
    });

    it('should handle rapid state changes without errors', () => {
      const states: GameState[] = [
        'idle',
        'ready',
        'selecting-position',
        'countdown',
        'dropping',
        'landed',
        'celebrating',
        'revealed',
      ];

      expect(() => {
        states.forEach((state) => {
          renderHook(() =>
            useMusicManager({
              musicController: mockMusicController,
              gameState: state,
              musicEnabled: true,
            })
          );
        });
      }).not.toThrow();
    });
  });
});
